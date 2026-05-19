'use strict';

/**
 * mentor-tools — read-only tools the mentor agent can call.
 *
 * All tool implementations are read-only by design. No fs.writeFile,
 * no spawn beyond `git` reads, no network. Path safety: every path
 * arg is checked to be inside the resolved project_root (git_root).
 *
 * OpenAI-compatible tool specs are exposed via toolSpecs() so they
 * can be sent verbatim in the `tools` field of a /chat/completions
 * request.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ccBridge = require('./cc-bridge.cjs');

const MAX_FILE_BYTES   = 20_000;   // ~20KB per read_file call
const MAX_LIST_ENTRIES = 200;
const MAX_DIFF_BYTES   = 30_000;
const GIT_TIMEOUT_MS   = 5_000;

function runGit(args, cwd) {
  try {
    return execFileSync('git', args, {
      cwd, timeout: GIT_TIMEOUT_MS,
      stdio: ['ignore', 'pipe', 'ignore'],
      windowsHide: true, encoding: 'utf8',
      maxBuffer: 5_000_000,
    });
  } catch (e) {
    return { __error: e.message || String(e) };
  }
}

function resolveProjectRoot(ctx) {
  if (ctx && ctx.git && ctx.git.git_root) return ctx.git.git_root;
  return process.cwd();
}

function assertInsideRoot(rootDir, p) {
  const abs = path.resolve(rootDir, p);
  const rel = path.relative(rootDir, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`path "${p}" is outside project root`);
  }
  return abs;
}

// ------- TOOL IMPLEMENTATIONS -------

function tool_git_log(args, ctx) {
  const root = resolveProjectRoot(ctx);
  const n = Math.max(1, Math.min(50, Number(args.n) || 10));
  const out = runGit(['log', `-${n}`, '--pretty=format:%h|%ct|%s|%an'], root);
  if (out && out.__error) return { ok: false, error: out.__error };
  const commits = (out || '').split('\n').filter(Boolean).map((line) => {
    const [hash, ts, subject, author] = line.split('|');
    return {
      hash: hash || '',
      time: ts ? new Date(Number(ts) * 1000).toISOString() : null,
      subject: subject || '',
      author: author || '',
    };
  });
  return { ok: true, count: commits.length, commits };
}

function tool_git_diff(args, ctx) {
  const root = resolveProjectRoot(ctx);
  const ref = args.ref ? String(args.ref) : 'HEAD';
  const files = Array.isArray(args.files) ? args.files.slice(0, 10).map(String) : [];
  // Whole working-tree diff vs ref, or specific files
  let gitArgs = ['diff', '--stat', '--patch', ref];
  if (files.length) gitArgs.push('--', ...files);
  // Cap output bytes
  const out = runGit(gitArgs, root);
  if (out && out.__error) return { ok: false, error: out.__error };
  let text = String(out || '');
  let truncated = false;
  if (text.length > MAX_DIFF_BYTES) {
    text = text.slice(0, MAX_DIFF_BYTES);
    truncated = true;
  }
  return { ok: true, ref, files, diff: text, truncated };
}

function tool_read_file(args, ctx) {
  const root = resolveProjectRoot(ctx);
  if (!args || !args.path) return { ok: false, error: 'path required' };
  let abs;
  try { abs = assertInsideRoot(root, args.path); }
  catch (e) { return { ok: false, error: e.message }; }
  let stat;
  try { stat = fs.statSync(abs); } catch (e) { return { ok: false, error: 'not found' }; }
  if (!stat.isFile()) return { ok: false, error: 'not a regular file' };
  const maxLines = Math.max(1, Math.min(2000, Number(args.max_lines) || 400));
  try {
    const fd = fs.openSync(abs, 'r');
    try {
      const buf = Buffer.alloc(MAX_FILE_BYTES);
      const bytes = fs.readSync(fd, buf, 0, MAX_FILE_BYTES, 0);
      const head = buf.slice(0, bytes).toString('utf8');
      const lines = head.split('\n');
      const truncatedByLines = lines.length > maxLines;
      const truncatedByBytes = stat.size > MAX_FILE_BYTES;
      return {
        ok: true,
        path: path.relative(root, abs),
        size_bytes: stat.size,
        lines_returned: Math.min(maxLines, lines.length),
        truncated: truncatedByLines || truncatedByBytes,
        content: lines.slice(0, maxLines).join('\n'),
      };
    } finally { fs.closeSync(fd); }
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function tool_list_files(args, ctx) {
  const root = resolveProjectRoot(ctx);
  const dir = args && args.dir ? String(args.dir) : '.';
  let abs;
  try { abs = assertInsideRoot(root, dir); }
  catch (e) { return { ok: false, error: e.message }; }
  let entries;
  try { entries = fs.readdirSync(abs, { withFileTypes: true }); }
  catch (e) { return { ok: false, error: e.message }; }
  // Filter out node_modules / .git / .pace by default
  const skip = new Set(['node_modules', '.git', '.pace', 'dist', 'build']);
  const filtered = entries
    .filter((d) => !skip.has(d.name))
    .slice(0, MAX_LIST_ENTRIES)
    .map((d) => ({ name: d.name, type: d.isDirectory() ? 'dir' : (d.isFile() ? 'file' : 'other') }));
  return { ok: true, dir: path.relative(root, abs) || '.', count: filtered.length, entries: filtered };
}

function tool_cc_recent_transcript(args, ctx) {
  const n = Math.max(1, Math.min(30, Number(args.last_n) || 10));
  // Re-run cc-bridge with deeper transcript
  const fresh = ccBridge.collect({
    cwd: resolveProjectRoot(ctx),
    includeTranscript: true,
    transcriptN: n,
  });
  return {
    ok: true,
    cc_session: fresh.cc_session ? {
      file: path.basename(fresh.cc_session.session_file || ''),
      last_mtime: fresh.cc_session.last_mtime_ms ? new Date(fresh.cc_session.last_mtime_ms).toISOString() : null,
    } : null,
    turns: fresh.transcript || [],
  };
}

// ------- DISPATCH + SPECS -------

const TOOL_TABLE = {
  git_log:                tool_git_log,
  git_diff:               tool_git_diff,
  read_file:              tool_read_file,
  list_files:             tool_list_files,
  cc_recent_transcript:   tool_cc_recent_transcript,
};

function executeTool(name, args, ctx) {
  const fn = TOOL_TABLE[name];
  if (!fn) return { ok: false, error: 'unknown_tool: ' + name };
  try {
    return fn(args || {}, ctx);
  } catch (e) {
    return { ok: false, error: e.message || String(e) };
  }
}

/**
 * OpenAI-compatible tool specs. Returned shape goes directly into the
 * `tools` field of a /chat/completions request.
 */
function toolSpecs() {
  return [
    {
      type: 'function',
      function: {
        name: 'git_log',
        description: '查看当前项目的 git commit 历史。返回 hash / time / subject / author。',
        parameters: {
          type: 'object',
          properties: {
            n: { type: 'integer', description: '返回最近 N 条 commit（默认 10，最多 50）', minimum: 1, maximum: 50 },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'git_diff',
        description: '看 git diff（默认 HEAD 与工作区，或指定 ref / 文件）。用于查看具体改了什么代码。',
        parameters: {
          type: 'object',
          properties: {
            ref: { type: 'string', description: 'commit hash 或 ref，默认 HEAD' },
            files: { type: 'array', items: { type: 'string' }, description: '只看这些文件（相对项目根）' },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'read_file',
        description: '读项目内一个文件的前 N 行。只读，不写。仅限项目根目录内。',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string', description: '相对项目根的路径' },
            max_lines: { type: 'integer', description: '最多读多少行（默认 400，最多 2000）' },
          },
          required: ['path'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'list_files',
        description: '列出项目内某个目录的文件 / 子目录。',
        parameters: {
          type: 'object',
          properties: {
            dir: { type: 'string', description: '相对项目根的目录（默认 "."）' },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'cc_recent_transcript',
        description: '读最近 N 轮的 cc (Claude Code) session 对话（user / assistant 的文本）。',
        parameters: {
          type: 'object',
          properties: {
            last_n: { type: 'integer', description: '最近多少轮（默认 10，最多 30）', minimum: 1, maximum: 30 },
          },
        },
      },
    },
  ];
}

module.exports = {
  executeTool,
  toolSpecs,
};
