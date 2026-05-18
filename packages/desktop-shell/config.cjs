'use strict';

/**
 * Pace config — single source of truth for user settings.
 *
 * Reads in priority order:
 *   1. process.env (MINIMAX_BASE_URL / MINIMAX_API_KEY / MINIMAX_MODEL)
 *   2. ~/.pace/config.json (managed by settings UI)
 *   3. defaults (defined below)
 *
 * Settings UI writes ~/.pace/config.json (never env).
 *
 * LLM provider: MiniMax via OpenAI-compatible /chat/completions endpoint.
 * See packages/desktop-shell/llm-client.cjs for the request shape.
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

const CONFIG_PATH = path.join(os.homedir(), '.pace', 'config.json');

const DEFAULTS = Object.freeze({
  minimax_base_url: 'https://api.minimaxi.com/v1',
  minimax_model:    'MiniMax-M2.7',
  knowledge_source: 'pmp',
  install_cc_hook:  false,
});

function ensureDir(p) {
  try { fs.mkdirSync(path.dirname(p), { recursive: true }); } catch (_e) { /* ignore */ }
}

function readConfigFile() {
  try {
    const text = fs.readFileSync(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(text);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch (_e) {
    return {};
  }
}

function writeConfigFile(next) {
  ensureDir(CONFIG_PATH);
  const safe = Object.assign({}, next || {});
  if (safe.minimax_api_key && typeof safe.minimax_api_key !== 'string') {
    delete safe.minimax_api_key;
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(safe, null, 2) + '\n', 'utf8');
}

function envOrFile(envKey, cfgKey) {
  const env = process.env[envKey];
  if (env && String(env).trim()) return { value: String(env).trim(), source: 'env' };
  const cfg = readConfigFile();
  const v = cfg[cfgKey];
  if (v && String(v).trim()) return { value: String(v).trim(), source: 'config' };
  return { value: null, source: 'missing' };
}

/**
 * Resolve MiniMax provider config in the shape llm-client.chatJson
 * expects when injected via `{ provider }`.
 *
 * Returns one of:
 *   { enabled: false, reason: 'incomplete_config' | 'no_url' | 'no_key' | 'no_model' }
 *   { enabled: true, provider: 'minimax', baseUrl, model, _apiKey, _source: {...} }
 */
function getMinimaxProvider() {
  const url   = envOrFile('MINIMAX_BASE_URL', 'minimax_base_url');
  const key   = envOrFile('MINIMAX_API_KEY',  'minimax_api_key');
  const model = envOrFile('MINIMAX_MODEL',    'minimax_model');

  // Apply DEFAULTS for url + model (not for key — must be explicit)
  const finalUrl   = url.value   || DEFAULTS.minimax_base_url;
  const finalModel = model.value || DEFAULTS.minimax_model;

  if (!key.value) {
    return { enabled: false, reason: 'no_key', has_url: !!finalUrl, has_model: !!finalModel };
  }

  return {
    enabled: true,
    provider: 'minimax',
    baseUrl: finalUrl,
    model: finalModel,
    _apiKey: key.value,
    _source: {
      base_url: url.source,
      api_key:  key.source,
      model:    model.source,
    },
  };
}

/**
 * Panel-facing settings snapshot. NEVER includes the api key value
 * (only whether one is configured + where it came from).
 */
function getSettings() {
  const cfg = readConfigFile();
  const url   = envOrFile('MINIMAX_BASE_URL', 'minimax_base_url');
  const key   = envOrFile('MINIMAX_API_KEY',  'minimax_api_key');
  const model = envOrFile('MINIMAX_MODEL',    'minimax_model');
  return {
    minimax_base_url: url.value   || DEFAULTS.minimax_base_url,
    minimax_model:    model.value || DEFAULTS.minimax_model,
    minimax_base_url_source: url.source,
    minimax_model_source:    model.source,
    minimax_api_key_source:  key.source,        // 'env' | 'config' | 'missing'
    has_minimax_config:      !!key.value,        // url+model fall back to DEFAULTS; key is the gate
    knowledge_source:        cfg.knowledge_source || DEFAULTS.knowledge_source,
    install_cc_hook:         Boolean(cfg.install_cc_hook ?? DEFAULTS.install_cc_hook),
    config_path:             CONFIG_PATH,
  };
}

function saveSettings(patch) {
  const cur = readConfigFile();
  const next = Object.assign({}, cur);
  if (patch && typeof patch === 'object') {
    if (typeof patch.minimax_base_url === 'string') {
      const v = patch.minimax_base_url.trim();
      if (v) next.minimax_base_url = v; else delete next.minimax_base_url;
    }
    if (typeof patch.minimax_model === 'string') {
      const v = patch.minimax_model.trim();
      if (v) next.minimax_model = v; else delete next.minimax_model;
    }
    if (typeof patch.minimax_api_key === 'string') {
      const v = patch.minimax_api_key.trim();
      if (v) next.minimax_api_key = v; else delete next.minimax_api_key;
    }
    if (typeof patch.knowledge_source === 'string') next.knowledge_source = patch.knowledge_source;
    if (patch.install_cc_hook !== undefined) next.install_cc_hook = Boolean(patch.install_cc_hook);
  }
  writeConfigFile(next);
  return getSettings();
}

module.exports = {
  CONFIG_PATH,
  DEFAULTS,
  getMinimaxProvider,
  getSettings,
  saveSettings,
};
