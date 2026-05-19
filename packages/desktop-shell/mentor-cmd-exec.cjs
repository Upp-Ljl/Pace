'use strict';

/**
 * mentor-cmd-exec — classify + execute commands suggested by mentor.
 *
 * Classification:
 *   safe       — known read or low-risk write (git push / pull / status,
 *                npm install, npm run/test, etc). Approved with one
 *                explicit click; runs immediately.
 *   caution    — possibly mutating but legitimate (git commit / checkout
 *                / stash / merge / rebase). Approved with a TYPE-confirm
 *                step (user clicks once more after seeing the warning).
 *   deny       — explicitly dangerous (rm -rf, --force, --no-verify,
 *                sudo, pipe-to-shell, network exfil). Pace refuses to
 *                run; user can still copy.
 *   unknown    — anything not matched. Default: copy-only.
 *
 * Execution: spawn (NOT exec / shell-string interpolation) with the
 * tokenised argv. Always cwd-scoped to the resolved project root.
 */

const { spawn } = require('child_process');
const path = require('path');

const SAFE_PATTERNS = [
  /^git\s+push(\s+origin(\s+\S+)?)?$/,
  /^git\s+pull(\s+origin(\s+\S+)?)?(\s+--rebase)?$/,
  /^git\s+fetch(\s+origin)?(\s+--all)?$/,
  /^git\s+status(\s+--short|\s+-s)?$/,
  /^git\s+log(\s+-\d+)?(\s+--oneline)?(\s+--stat)?$/,
  /^git\s+diff(\s+--stat)?(\s+--cached)?(\s+HEAD)?$/,
  /^git\s+branch(\s+-a|\s+--list)?$/,
  /^git\s+show\s+\S+$/,
  /^npm\s+install$/,
  /^npm\s+ci$/,
  /^npm\s+run\s+[\w\-:.]+$/,
  /^npm\s+test$/,
  /^npm\s+ls$/,
  /^npm\s+outdated$/,
  /^pnpm\s+(install|run|test|ls)(\s+\S+)?$/,
  /^yarn(\s+(install|run|test|ls))?(\s+\S+)?$/,
  /^ls(\s+-\w+)?(\s+\S+)?$/,
  /^pwd$/,
  /^node\s+--version$/,
];

const CAUTION_PATTERNS = [
  /^git\s+commit(\s+-m\s+["'].*["'])?(\s+-a)?$/,
  /^git\s+add(\s+\S+)+$/,
  /^git\s+checkout(\s+-b)?\s+\S+$/,
  /^git\s+stash(\s+(push|pop|list))?$/,
  /^git\s+merge\s+\S+$/,
  /^git\s+rebase\s+\S+$/,
  /^git\s+tag\s+\S+$/,
  /^git\s+restore(\s+--staged)?\s+\S+$/,
];

const DENY_PATTERNS = [
  /\brm\s+-rf?\b/i,
  /\b--force\b/i,
  /\b--no-verify\b/i,
  /\bsudo\b/i,
  /\|\s*(sh|bash|zsh|node|python)\b/i,
  />\s*\/dev\//i,
  /\bcurl\s+.*\|\s*(sh|bash)\b/i,
  /\bdrop\s+table\b/i,
  /\bgit\s+reset\s+--hard\b/i,
  /\bgit\s+push\s+.+\s+--force/i,
  /\bgit\s+push\s+--force/i,
  /\bgit\s+clean\s+-/i,
];

function classifyCommand(rawCmd) {
  const cmd = (rawCmd || '').trim();
  if (!cmd) return { class: 'invalid', reason: 'empty' };
  if (cmd.length > 500) return { class: 'deny', reason: 'too_long' };
  // Multi-line ban
  if (/[\n\r]/.test(cmd)) return { class: 'deny', reason: 'multiline' };
  // Deny first
  for (const p of DENY_PATTERNS) {
    if (p.test(cmd)) return { class: 'deny', reason: p.source };
  }
  for (const p of SAFE_PATTERNS) {
    if (p.test(cmd)) return { class: 'safe' };
  }
  for (const p of CAUTION_PATTERNS) {
    if (p.test(cmd)) return { class: 'caution' };
  }
  return { class: 'unknown' };
}

// Naive argv tokenizer with single-quoted-string support (git commit -m 'msg')
function tokenizeArgv(cmd) {
  const tokens = [];
  let cur = '';
  let inSingle = false, inDouble = false;
  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i];
    if (inSingle) {
      if (c === "'") inSingle = false; else cur += c;
    } else if (inDouble) {
      if (c === '"') inDouble = false; else cur += c;
    } else if (c === "'") {
      inSingle = true;
    } else if (c === '"') {
      inDouble = true;
    } else if (/\s/.test(c)) {
      if (cur) { tokens.push(cur); cur = ''; }
    } else {
      cur += c;
    }
  }
  if (cur) tokens.push(cur);
  return tokens;
}

/**
 * Execute a command, streaming stdout / stderr chunks via onChunk.
 * Returns a promise that resolves with { ok, code, signal, elapsed_ms }.
 *
 * onChunk fires:
 *   { type: 'start', cmd, cwd }
 *   { type: 'stdout', text }
 *   { type: 'stderr', text }
 *   { type: 'exit',   code, signal, elapsed_ms }
 *   { type: 'error',  message }
 */
function execCommandStream(cmd, opts, onChunk) {
  return new Promise((resolve) => {
    const safeEmit = (chunk) => { try { onChunk(chunk); } catch (_e) {} };
    const o = opts || {};
    const cwd = o.cwd || process.cwd();
    const argv = tokenizeArgv(cmd);
    if (argv.length === 0) {
      safeEmit({ type: 'error', message: 'empty command' });
      return resolve({ ok: false, code: -1 });
    }
    const t0 = Date.now();
    safeEmit({ type: 'start', cmd, cwd });

    let child;
    try {
      child = spawn(argv[0], argv.slice(1), {
        cwd,
        windowsHide: true,
        shell: false,
        env: process.env,
      });
    } catch (e) {
      safeEmit({ type: 'error', message: e.message || String(e) });
      return resolve({ ok: false, code: -1, error: e.message });
    }

    const TIMEOUT_MS = Number.isFinite(o.timeoutMs) ? o.timeoutMs : 60_000;
    const timer = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch (_e) {}
      safeEmit({ type: 'error', message: 'timeout' });
    }, TIMEOUT_MS);

    child.stdout.on('data', (buf) => safeEmit({ type: 'stdout', text: buf.toString() }));
    child.stderr.on('data', (buf) => safeEmit({ type: 'stderr', text: buf.toString() }));

    child.on('error', (err) => {
      clearTimeout(timer);
      safeEmit({ type: 'error', message: err.message || String(err) });
      resolve({ ok: false, code: -1, error: err.message });
    });

    child.on('exit', (code, signal) => {
      clearTimeout(timer);
      const elapsed = Date.now() - t0;
      safeEmit({ type: 'exit', code, signal, elapsed_ms: elapsed });
      resolve({ ok: code === 0, code, signal, elapsed_ms: elapsed });
    });
  });
}

module.exports = {
  classifyCommand,
  tokenizeArgv,
  execCommandStream,
};
