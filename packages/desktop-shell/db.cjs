'use strict';

/**
 * Pace local persistence (better-sqlite3, ~/.pace/pace.db).
 *
 * Schema kept Pace-local — does NOT touch cairn's DB. Future versions
 * may add a cairn-kernel MCP bridge for cross-app state sharing (see
 * ARCHITECTURE.md §4); v0.1 stays self-contained.
 *
 * Tables:
 *   - schema_version           — migration tracking
 *   - user_prefs               — KV store (LLM key, model choice, knowledge source)
 *   - mentor_sessions          — every user-mentor turn (Q + A + debug)
 *   - cached_project_ids       — project identity cache (cwd → project_id, score)
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

let Database;
try {
  Database = require('better-sqlite3');
} catch (err) {
  // Loader-time failure: Electron NODE_MODULE_VERSION mismatch usually.
  // Defer the hard fail to first openDatabase() call so the panel can
  // still boot and surface a usable error.
  Database = null;
  module.exports._loaderError = err;
}

const DEFAULT_DB_PATH = path.join(os.homedir(), '.pace', 'pace.db');

let db = null;
let dbPath = null;

function ensureDir(p) {
  try { fs.mkdirSync(path.dirname(p), { recursive: true }); } catch (_e) { /* ignore */ }
}

function openDatabase(customPath) {
  if (!Database) {
    const err = module.exports._loaderError || new Error('better-sqlite3 unavailable');
    throw new Error(`Pace DB unavailable — ${err.message}. Run: npx electron-builder install-app-deps`);
  }
  if (db) return db;
  dbPath = customPath || DEFAULT_DB_PATH;
  ensureDir(dbPath);
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  applyMigrations();
  return db;
}

function applyMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      version INTEGER NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);
  const cur = db.prepare('SELECT version FROM schema_version WHERE id = 1').get();
  const current = cur ? cur.version : 0;
  const target = 1;
  if (current >= target) return;

  const tx = db.transaction(() => {
    if (current < 1) migrate_001_init();
    db.prepare(`
      INSERT OR REPLACE INTO schema_version (id, version, applied_at)
      VALUES (1, ?, ?)
    `).run(target, new Date().toISOString());
  });
  tx();
}

function migrate_001_init() {
  db.exec(`
    CREATE TABLE user_prefs (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE mentor_sessions (
      turn_id     TEXT PRIMARY KEY,
      created_at  TEXT NOT NULL,
      project_id  TEXT,
      cwd         TEXT,
      user_input  TEXT NOT NULL,
      mentor_reply TEXT NOT NULL,
      debug_json  TEXT,
      llm_model   TEXT,
      tokens_in   INTEGER,
      tokens_out  INTEGER,
      latency_ms  INTEGER
    );
    CREATE INDEX mentor_sessions_created_at_idx
      ON mentor_sessions (created_at DESC);
    CREATE INDEX mentor_sessions_project_idx
      ON mentor_sessions (project_id, created_at DESC);

    CREATE TABLE cached_project_ids (
      cwd          TEXT PRIMARY KEY,
      project_id   TEXT NOT NULL,
      git_remote   TEXT,
      git_branch   TEXT,
      score        REAL NOT NULL,
      resolved_at  TEXT NOT NULL
    );
  `);
}

// --- user_prefs helpers ---
function getPref(key, fallback) {
  const row = openDatabase().prepare('SELECT value FROM user_prefs WHERE key = ?').get(key);
  return row ? row.value : (fallback === undefined ? null : fallback);
}

function setPref(key, value) {
  const now = new Date().toISOString();
  openDatabase().prepare(`
    INSERT INTO user_prefs (key, value, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(key, String(value), now);
}

// --- mentor_sessions ---
function logMentorTurn(row) {
  openDatabase().prepare(`
    INSERT INTO mentor_sessions
      (turn_id, created_at, project_id, cwd, user_input, mentor_reply, debug_json, llm_model, tokens_in, tokens_out, latency_ms)
    VALUES (@turn_id, @created_at, @project_id, @cwd, @user_input, @mentor_reply, @debug_json, @llm_model, @tokens_in, @tokens_out, @latency_ms)
  `).run({
    turn_id:      row.turn_id,
    created_at:   row.created_at || new Date().toISOString(),
    project_id:   row.project_id || null,
    cwd:          row.cwd || null,
    user_input:   row.user_input,
    mentor_reply: row.mentor_reply,
    debug_json:   row.debug ? JSON.stringify(row.debug) : null,
    llm_model:    row.llm_model || null,
    tokens_in:    row.tokens_in || null,
    tokens_out:   row.tokens_out || null,
    latency_ms:   row.latency_ms || null,
  });
}

function listMentorTurns(limit) {
  return openDatabase().prepare(`
    SELECT turn_id, created_at, project_id, cwd, user_input, mentor_reply, llm_model, latency_ms
    FROM mentor_sessions ORDER BY created_at DESC LIMIT ?
  `).all(Math.max(1, Math.min(500, Number(limit) || 50)));
}

// --- cached_project_ids ---
function cacheProjectId(row) {
  openDatabase().prepare(`
    INSERT INTO cached_project_ids (cwd, project_id, git_remote, git_branch, score, resolved_at)
    VALUES (@cwd, @project_id, @git_remote, @git_branch, @score, @resolved_at)
    ON CONFLICT(cwd) DO UPDATE SET
      project_id = excluded.project_id,
      git_remote = excluded.git_remote,
      git_branch = excluded.git_branch,
      score      = excluded.score,
      resolved_at= excluded.resolved_at
  `).run({
    cwd: row.cwd,
    project_id: row.project_id,
    git_remote: row.git_remote || null,
    git_branch: row.git_branch || null,
    score: row.score,
    resolved_at: new Date().toISOString(),
  });
}

function getCachedProjectId(cwd) {
  return openDatabase().prepare('SELECT * FROM cached_project_ids WHERE cwd = ?').get(cwd) || null;
}

module.exports = {
  openDatabase,
  getDbPath: () => dbPath || DEFAULT_DB_PATH,
  // prefs
  getPref,
  setPref,
  // sessions
  logMentorTurn,
  listMentorTurns,
  // project cache
  cacheProjectId,
  getCachedProjectId,
};
