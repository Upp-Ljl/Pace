'use strict';

/**
 * LLM client (Goal Mode v1 advisory layer).
 *
 * Reads provider/key/model from `<repo>/.cairn-poc3-keys/keys.env`
 * (already gitignored). The file is env-style:
 *
 *   MINIMAX_BASE_URL=...        # OpenAI-compatible base ending in /v1
 *   MINIMAX_API_KEY=...
 *   MINIMAX_MODEL=...
 *
 * If the file is missing OR any of the three vars is empty, the
 * client returns `{ enabled: false, ok: false, error_code: ... }`
 * and callers fall back to deterministic logic. The key NEVER
 * appears in any return value, log line, or panel surface.
 *
 * This module does not write files. It uses Node's built-in `fetch`
 * (Node 18+ / Electron 28+) — no new npm dep.
 *
 * Caller contract (chatJson):
 *
 *   const r = await chatJson({
 *     messages: [{ role:'system', content:'...'}, { role:'user', content:'...'}],
 *     temperature: 0.2,
 *     response_format: { type: 'json_object' },
 *   });
 *
 * Returns one of:
 *
 *   { enabled:false, ok:false, error_code:'keys_file_missing' }
 *   { enabled:false, ok:false, error_code:'incomplete_config' }
 *   { enabled:true,  ok:false, model, error_code:'timeout' }
 *   { enabled:true,  ok:false, model, error_code:'http_<status>' }
 *   { enabled:true,  ok:false, model, error_code:'network' }
 *   { enabled:true,  ok:false, model, error_code:'no_content' }
 *   { enabled:true,  ok:true,  model, text }
 *
 * Note `text` is the assistant message content. Callers parse JSON
 * themselves — chatJson does NOT auto-parse, so a malformed body
 * surfaces as a parse error in the caller (where the fallback
 * decision lives) instead of a generic ok:false.
 */

const fs = require('fs');
const path = require('path');

// Repo-root relative; this module lives at
// packages/desktop-shell/llm-client.cjs so the keys dir is two levels up.
const DEFAULT_KEYS_FILE = path.resolve(__dirname, '..', '..', '.cairn-poc3-keys', 'keys.env');
const DEFAULT_TIMEOUT_MS = 20_000;

/**
 * Parse an env-style file (KEY=VALUE per line). Comments (`#`) and
 * blank lines are ignored. Quoted values have one layer of quotes
 * stripped. Returns an object, or null when the file can't be read.
 *
 * Defensive: never throws; never logs. Never returns the raw file
 * contents — only the parsed key/value map (and even that should not
 * be logged by callers).
 */
function parseEnvFile(filePath) {
  let raw;
  try { raw = fs.readFileSync(filePath, 'utf8'); } catch (_e) { return null; }
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

/**
 * Resolve the active provider config.
 *
 * Returns one of:
 *   { enabled: false, reason: 'keys_file_missing' | 'incomplete_config' }
 *   { enabled: true, provider: 'minimax', baseUrl, model, _apiKey }
 *
 * The `_apiKey` field is intentionally underscore-prefixed and is
 * stripped from any "describe yourself" surface (see describeProvider
 * below). Callers should pass the whole object back into chatJson and
 * never log it directly.
 */
function loadProvider(opts) {
  const o = opts || {};
  const keysFile = o.keysFile || DEFAULT_KEYS_FILE;
  const env = parseEnvFile(keysFile);
  if (!env) return { enabled: false, reason: 'keys_file_missing' };
  const baseUrl = (env.MINIMAX_BASE_URL || '').trim();
  const apiKey  = (env.MINIMAX_API_KEY  || '').trim();
  const model   = (env.MINIMAX_MODEL    || '').trim();
  if (!baseUrl || !apiKey || !model) {
    return { enabled: false, reason: 'incomplete_config' };
  }
  return {
    enabled: true,
    provider: 'minimax',
    baseUrl,
    model,
    _apiKey: apiKey,
  };
}

/**
 * Public describe-self that NEVER includes the api key. Safe for the
 * panel footer / dogfood reports.
 */
function describeProvider(provider) {
  if (!provider || !provider.enabled) {
    return { enabled: false, reason: (provider && provider.reason) || 'disabled' };
  }
  return {
    enabled: true,
    provider: provider.provider,
    model: provider.model,
    base_url_host: safeHost(provider.baseUrl),
  };
}

function safeHost(url) {
  try { return new URL(url).host; } catch (_e) { return null; }
}

/**
 * POST one chat-completion request to the OpenAI-compatible endpoint.
 * Uses AbortController for the timeout. Returns the structured shape
 * documented at the top of this file.
 *
 * @param {Object} payload
 * @param {Array}  payload.messages       OpenAI chat messages.
 * @param {Object} [payload.response_format]
 * @param {number} [payload.temperature]
 * @param {Object} [opts]
 * @param {Object} [opts.provider]        Inject pre-loaded provider.
 * @param {Function} [opts.fetchImpl]     Inject for tests; defaults to global fetch.
 * @param {number} [opts.timeoutMs]
 * @param {string} [opts.keysFile]        Override keys file location.
 */
async function chatJson(payload, opts) {
  const o = opts || {};
  const provider = o.provider || loadProvider({ keysFile: o.keysFile });
  if (!provider.enabled) {
    return { enabled: false, ok: false, error_code: provider.reason || 'disabled' };
  }
  const fetchImpl = o.fetchImpl || (typeof fetch === 'function' ? fetch : null);
  if (!fetchImpl) {
    return { enabled: true, ok: false, model: provider.model, error_code: 'no_fetch' };
  }
  const timeoutMs = Number.isFinite(o.timeoutMs) ? o.timeoutMs : DEFAULT_TIMEOUT_MS;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);

  // Resolve URL: append /chat/completions if not already present.
  let url = provider.baseUrl;
  if (!/\/chat\/completions(\?|$)/.test(url)) {
    url = url.replace(/\/+$/, '') + '/chat/completions';
  }

  // Body: only the documented OpenAI-compatible fields. We never echo
  // unknown payload keys — keeps the wire format stable across
  // provider quirks. Temperature defaults to 0.2 (advisory work; we
  // want determinism, not creativity).
  const body = {
    model: provider.model,
    messages: payload.messages,
    temperature: payload.temperature != null ? payload.temperature : 0.2,
  };
  if (payload.response_format) body.response_format = payload.response_format;
  if (Number.isFinite(payload.max_tokens)) body.max_tokens = payload.max_tokens;

  try {
    const resp = await fetchImpl(url, {
      method: 'POST',
      signal: ac.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + provider._apiKey,
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      // Deliberately do NOT return the response body. Provider error
      // responses sometimes echo prompt text or sensitive metadata; we
      // expose only the status code so the caller can decide whether
      // to retry.
      return {
        enabled: true, ok: false, model: provider.model,
        error_code: 'http_' + resp.status,
      };
    }
    const json = await resp.json();
    const content = json && json.choices && json.choices[0]
      && json.choices[0].message && json.choices[0].message.content;
    if (typeof content !== 'string') {
      return {
        enabled: true, ok: false, model: provider.model,
        error_code: 'no_content',
      };
    }
    return { enabled: true, ok: true, model: provider.model, text: content };
  } catch (e) {
    if (e && e.name === 'AbortError') {
      return {
        enabled: true, ok: false, model: provider.model,
        error_code: 'timeout',
      };
    }
    // Don't include e.message — it sometimes contains URL/auth info.
    return {
      enabled: true, ok: false, model: provider.model,
      error_code: 'network',
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Streaming variant — same wire format (OpenAI-compatible) with
 * stream: true. Caller supplies opts.onChunk({type:'delta', text})
 * per token chunk. Returns final aggregated result like chatJson.
 *
 *   { enabled, ok, model, text, usage }
 *
 * Stream cancellation: pass opts.signal (AbortSignal). Used together
 * with timeoutMs.
 */
async function chatStream(payload, opts) {
  const o = opts || {};
  const provider = o.provider || loadProvider({ keysFile: o.keysFile });
  if (!provider.enabled) {
    return { enabled: false, ok: false, error_code: provider.reason || 'disabled' };
  }
  const fetchImpl = o.fetchImpl || (typeof fetch === 'function' ? fetch : null);
  if (!fetchImpl) {
    return { enabled: true, ok: false, model: provider.model, error_code: 'no_fetch' };
  }
  const timeoutMs = Number.isFinite(o.timeoutMs) ? o.timeoutMs : 90_000;
  const ac = new AbortController();
  if (o.signal) {
    if (o.signal.aborted) ac.abort();
    o.signal.addEventListener('abort', () => ac.abort());
  }
  const timer = setTimeout(() => ac.abort(), timeoutMs);

  let url = provider.baseUrl;
  if (!/\/chat\/completions(\?|$)/.test(url)) {
    url = url.replace(/\/+$/, '') + '/chat/completions';
  }
  const body = {
    model: provider.model,
    messages: payload.messages,
    temperature: payload.temperature != null ? payload.temperature : 0.2,
    stream: true,
  };
  if (Number.isFinite(payload.max_tokens)) body.max_tokens = payload.max_tokens;
  if (payload.response_format) body.response_format = payload.response_format;

  try {
    const resp = await fetchImpl(url, {
      method: 'POST',
      signal: ac.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + provider._apiKey,
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      return {
        enabled: true, ok: false, model: provider.model,
        error_code: 'http_' + resp.status,
      };
    }
    if (!resp.body || typeof resp.body.getReader !== 'function') {
      return { enabled: true, ok: false, model: provider.model, error_code: 'no_stream' };
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let lineBuffer = '';
    let accumulated = '';
    let usage = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      lineBuffer += decoder.decode(value, { stream: true });
      // Split by newline (SSE event terminator is \n\n but events are line-based)
      const lines = lineBuffer.split('\n');
      lineBuffer = lines.pop() || '';

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') continue;
        try {
          const j = JSON.parse(data);
          const delta = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content;
          if (typeof delta === 'string' && delta.length) {
            accumulated += delta;
            if (o.onChunk) {
              try { o.onChunk({ type: 'delta', text: delta }); } catch (_e) {}
            }
          }
          if (j.usage) usage = j.usage;
        } catch (_e) { /* skip malformed line */ }
      }
    }

    return {
      enabled: true, ok: true, model: provider.model,
      text: accumulated, usage,
    };
  } catch (e) {
    if (e && e.name === 'AbortError') {
      return { enabled: true, ok: false, model: provider.model, error_code: 'timeout' };
    }
    return { enabled: true, ok: false, model: provider.model, error_code: 'network' };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = {
  parseEnvFile,
  loadProvider,
  describeProvider,
  chatJson,
  chatStream,
  DEFAULT_TIMEOUT_MS,
};
