'use strict';

/**
 * Pace cc-bridge — lazy reader for Claude Code (cc) local context.
 *
 * Strict constraints (PRODUCT.md decision #3 + #4):
 *   - never spawns cc as a subprocess
 *   - never starts a background watcher / fs subscriber
 *   - reads only when collect() is called from mentor pipeline
 *   - token cost minimized — tiered access
 *
 * Tiered surface:
 *   Tier 1: git info (remote / branch / toplevel / recent log) — <100 tokens
 *   Tier 2: cc session index (latest active session for this cwd)  — <300 tokens
 *   Tier 3: transcript excerpt (last N user/assistant text messages)— ~2000 tokens
 *
 * Caller decides which tier to pull. The mentor pipeline starts with
 * Tier 1+2 and only escalates to Tier 3 if classification is uncertain.
 */

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const CC_PROJECTS_DIR = path.join(os.homedir(), '.claude', 'projects');

// --- Tier 1: git ---

function runGit(args, cwd, timeoutMs) {
  try {
    return execFileSync('git', args, {
      cwd,
      timeout: timeoutMs || 1500,
      stdio: ['ignore', 'pipe', 'ignore'],
      windowsHide: true,
      encoding: 'utf8',
    }).trim();
  } catch (_e) {
    return null;
  }
}

function readGitContext(cwd) {
  if (!cwd) return { available: false };
  const topLevel = runGit(['rev-parse', '--show-toplevel'], cwd);
  if (!topLevel) {
    return { available: false, reason: 'not_a_git_repo' };
  }
  const remoteUrl = runGit(['remote', 'get-url', 'origin'], cwd) || null;
  const branch    = runGit(['rev-parse', '--abbrev-ref', 'HEAD'], cwd) || null;
  const recentLog = runGit(['log', '-5', '--oneline'], cwd) || '';
  const status    = runGit(['status', '--short'], cwd) || '';

  // Detailed commits (last 10): hash | unix ts | subject | author
  const detailRaw = runGit(['log', '-10', '--pretty=format:%h|%ct|%s|%an'], cwd) || '';
  const commits = detailRaw.split('\n').filter(Boolean).map((line) => {
    const [hash, ts, subject, author] = line.split('|');
    return {
      hash: hash || '',
      ts: ts ? Number(ts) * 1000 : null,
      subject: subject || '',
      author: author || '',
    };
  });

  // Changed file paths (with status flag)
  const changedFiles = status.split('\n').filter(Boolean).map((line) => {
    const flags = line.slice(0, 2);
    const filePath = line.slice(3).trim();
    return { flags: flags.trim(), path: filePath };
  });

  // Upstream comparison (ahead / behind) — only works if upstream is set
  let ahead = null, behind = null;
  const abRaw = runGit(['rev-list', '--left-right', '--count', `HEAD...@{upstream}`], cwd);
  if (abRaw && /^\d+\s+\d+$/.test(abRaw.trim())) {
    const [a, b] = abRaw.trim().split(/\s+/).map(Number);
    ahead = a;
    behind = b;
  }

  return {
    available:   true,
    git_root:    path.normalize(topLevel),
    git_remote:  remoteUrl,
    git_branch:  branch,
    recent_log:  recentLog.split('\n').filter(Boolean).slice(0, 5),
    dirty_count: changedFiles.length,
    commits,        // [{hash, ts (ms), subject, author}]
    changed_files: changedFiles, // [{flags, path}]
    ahead,          // null = no upstream; number = commits ahead
    behind,         // null = no upstream; number = commits behind
  };
}

// --- Tier 2: cc session index ---

/**
 * cc encodes project cwd as a directory name under ~/.claude/projects/.
 * Encoding (observed): path separator → "-", colon → "-", etc.
 * We don't try to reverse the encoding — we list all dirs, look inside
 * each for a transcript whose cwd metadata matches our target.
 */
function listCcProjectsDirs() {
  try {
    return fs.readdirSync(CC_PROJECTS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => path.join(CC_PROJECTS_DIR, d.name));
  } catch (_e) {
    return [];
  }
}

function listSessionFiles(projDir) {
  try {
    return fs.readdirSync(projDir)
      .filter((f) => f.endsWith('.jsonl'))
      .map((f) => path.join(projDir, f));
  } catch (_e) {
    return [];
  }
}

function readFirstJsonl(filePath, maxBytes) {
  // Read the head of a session file just enough to find the first
  // record (which carries cwd metadata in CC's session format).
  const max = maxBytes || 4096;
  try {
    const fd = fs.openSync(filePath, 'r');
    try {
      const buf = Buffer.alloc(max);
      const bytes = fs.readSync(fd, buf, 0, max, 0);
      const head = buf.slice(0, bytes).toString('utf8');
      const firstLine = head.split('\n').find((l) => l.trim().length > 0);
      if (!firstLine) return null;
      return JSON.parse(firstLine);
    } finally {
      fs.closeSync(fd);
    }
  } catch (_e) {
    return null;
  }
}

/**
 * Find the most-recently-modified session in any cc project dir whose
 * recorded cwd equals (or is a child of) the target gitRoot. Returns:
 *   { session_file, project_dir, last_mtime_ms, first_record }
 * or null if no session matches.
 *
 * Cost-bounded: caps scanning at SESSION_FILES_MAX entries.
 */
const SESSION_FILES_MAX = 40;

function findActiveCcSession(targetRoot) {
  if (!targetRoot) return null;
  const targetNorm = path.normalize(targetRoot).toLowerCase();

  const candidates = [];
  for (const projDir of listCcProjectsDirs()) {
    const sessions = listSessionFiles(projDir);
    for (const sf of sessions) {
      let stat;
      try { stat = fs.statSync(sf); } catch (_e) { continue; }
      candidates.push({ sf, projDir, mtime: stat.mtimeMs });
    }
  }
  candidates.sort((a, b) => b.mtime - a.mtime);

  let scanned = 0;
  for (const c of candidates) {
    if (scanned++ >= SESSION_FILES_MAX) break;
    const first = readFirstJsonl(c.sf, 8192);
    if (!first) continue;
    const recordedCwd = first.cwd || (first.session && first.session.cwd);
    if (typeof recordedCwd !== 'string') continue;
    const norm = path.normalize(recordedCwd).toLowerCase();
    if (norm === targetNorm || norm.startsWith(targetNorm + path.sep.toLowerCase())) {
      return {
        session_file:   c.sf,
        project_dir:    c.projDir,
        last_mtime_ms:  c.mtime,
        cwd_recorded:   recordedCwd,
        session_id:     first.sessionId || first.session_id || null,
        first_record_keys: Object.keys(first),
      };
    }
  }
  return null;
}

// --- Tier 3: transcript excerpt ---

/**
 * Read the last N user/assistant text messages from a transcript.jsonl.
 * Skips tool_use / tool_result entries (they are token-heavy and rarely
 * carry mentor signal).
 *
 * Output: array of { role, text, ts } in chronological order.
 */
function readTranscriptExcerpt(sessionFile, lastN) {
  const want = Math.max(1, Math.min(50, Number(lastN) || 10));
  let lines;
  try {
    lines = fs.readFileSync(sessionFile, 'utf8').split('\n');
  } catch (_e) {
    return [];
  }
  const messages = [];
  for (const line of lines) {
    if (!line || !line.trim()) continue;
    let entry;
    try { entry = JSON.parse(line); } catch (_e) { continue; }
    const role = entry.type || entry.role || (entry.message && entry.message.role);
    if (role !== 'user' && role !== 'assistant') continue;
    const content = entry.message ? entry.message.content : entry.content;
    let text = null;
    if (typeof content === 'string') {
      text = content;
    } else if (Array.isArray(content)) {
      // Concat text blocks; skip tool_use / tool_result / image.
      const parts = content
        .filter((b) => b && (b.type === 'text' || typeof b === 'string'))
        .map((b) => typeof b === 'string' ? b : (b.text || ''))
        .filter(Boolean);
      if (parts.length > 0) text = parts.join('\n');
    }
    if (!text) continue;
    messages.push({
      role,
      text: text.length > 1500 ? text.slice(0, 1500) + '…' : text,
      ts: entry.timestamp || entry.ts || null,
    });
  }
  return messages.slice(-want);
}

// --- Public collect() ---

/**
 * Collect cc context for the mentor pipeline.
 *
 * @param {object} opts
 * @param {string} opts.cwd            — working directory to probe
 * @param {boolean} opts.includeTranscript — pull Tier 3 (default false)
 * @param {number}  opts.transcriptN   — how many recent messages (default 8)
 *
 * @returns {object} {git, ccSession, transcript, _meta}
 */
function collect(opts) {
  const t0 = Date.now();
  const o = opts || {};
  const cwd = o.cwd || process.cwd();

  const git = readGitContext(cwd);
  let ccSession = null;
  let transcript = [];

  if (git.available && git.git_root) {
    ccSession = findActiveCcSession(git.git_root);
    if (ccSession && o.includeTranscript) {
      transcript = readTranscriptExcerpt(ccSession.session_file, o.transcriptN || 8);
    }
  }

  return {
    git,
    cc_session: ccSession,
    transcript,
    _meta: {
      cwd,
      elapsed_ms: Date.now() - t0,
      tier1: true,
      tier2: !!ccSession,
      tier3: transcript.length > 0,
    },
  };
}

module.exports = {
  collect,
  // Surface internals for testing / advanced callers
  readGitContext,
  findActiveCcSession,
  readTranscriptExcerpt,
};
