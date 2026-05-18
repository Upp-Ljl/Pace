'use strict';

/**
 * Pace config — single source of truth for user settings.
 *
 * Reads in priority order:
 *   1. process.env (e.g. ANTHROPIC_API_KEY for dev override)
 *   2. ~/.pace/config.json
 *   3. defaults (defined below)
 *
 * Settings UI writes ~/.pace/config.json (never env).
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

const CONFIG_PATH = path.join(os.homedir(), '.pace', 'config.json');

const DEFAULTS = Object.freeze({
  llm_model: 'claude-sonnet-4-6',
  knowledge_source: 'pmp',
  install_cc_hook: false,
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
  // Never persist obviously-bad shapes.
  if (safe.anthropic_api_key && typeof safe.anthropic_api_key !== 'string') {
    delete safe.anthropic_api_key;
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(safe, null, 2) + '\n', 'utf8');
}

function getApiKey() {
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim()) {
    return process.env.ANTHROPIC_API_KEY.trim();
  }
  const cfg = readConfigFile();
  if (cfg.anthropic_api_key && typeof cfg.anthropic_api_key === 'string' && cfg.anthropic_api_key.trim()) {
    return cfg.anthropic_api_key.trim();
  }
  return null;
}

function getSettings() {
  // Returns shallow merge of DEFAULTS + file (NEVER includes the api_key
  // — that goes through getApiKey() to avoid leaking it through panel
  // round-trips).
  const cfg = readConfigFile();
  return {
    llm_model:        cfg.llm_model        || DEFAULTS.llm_model,
    knowledge_source: cfg.knowledge_source || DEFAULTS.knowledge_source,
    install_cc_hook:  Boolean(cfg.install_cc_hook ?? DEFAULTS.install_cc_hook),
    has_api_key:      Boolean(getApiKey()),
    api_key_source:   process.env.ANTHROPIC_API_KEY ? 'env' :
                      (readConfigFile().anthropic_api_key ? 'config' : 'missing'),
    config_path:      CONFIG_PATH,
  };
}

function saveSettings(patch) {
  const cur = readConfigFile();
  const next = Object.assign({}, cur);
  if (patch && typeof patch === 'object') {
    if (typeof patch.llm_model === 'string') next.llm_model = patch.llm_model;
    if (typeof patch.knowledge_source === 'string') next.knowledge_source = patch.knowledge_source;
    if (patch.install_cc_hook !== undefined) next.install_cc_hook = Boolean(patch.install_cc_hook);
    if (typeof patch.anthropic_api_key === 'string') {
      const trimmed = patch.anthropic_api_key.trim();
      if (trimmed.length > 0) next.anthropic_api_key = trimmed;
      else delete next.anthropic_api_key;
    }
  }
  writeConfigFile(next);
  return getSettings();
}

module.exports = {
  CONFIG_PATH,
  DEFAULTS,
  getApiKey,
  getSettings,
  saveSettings,
};
