'use strict';

/**
 * git-watcher — fs.watch on .git/HEAD + .git/refs/heads/<branch> to
 * detect new commits in real time (no polling).
 *
 * Why these two files:
 *   - .git/refs/heads/<branch>  → changes on every commit landing on that branch
 *   - .git/HEAD                 → changes on branch switch
 *
 * Both fire fs.watch 'change' events that we debounce (commits often
 * write multiple files in a brief window).
 *
 * No external deps (no chokidar). Pure node:fs.watch.
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class GitWatcher extends EventEmitter {
  constructor(gitRoot) {
    super();
    this.gitRoot = gitRoot;
    this.watchers = [];
    this.debounceTimer = null;
    this.lastHeadRef = null;
  }

  start() {
    const dotGit = path.join(this.gitRoot, '.git');
    if (!fs.existsSync(dotGit)) return false;

    // Watch HEAD (catches branch switches)
    try {
      const headPath = path.join(dotGit, 'HEAD');
      if (fs.existsSync(headPath)) {
        const w = fs.watch(headPath, (eventType) => this._fire('head', eventType));
        this.watchers.push(w);
      }
    } catch (_e) { /* ignore */ }

    // Watch refs/heads/ (any branch commit)
    try {
      const refsDir = path.join(dotGit, 'refs', 'heads');
      if (fs.existsSync(refsDir)) {
        const w = fs.watch(refsDir, { recursive: true }, (eventType, filename) => {
          this._fire('refs', eventType, filename);
        });
        this.watchers.push(w);
      }
    } catch (_e) { /* ignore */ }

    // Also watch logs/HEAD which appends on every commit (more reliable
    // than refs sometimes on packed repos)
    try {
      const logsHead = path.join(dotGit, 'logs', 'HEAD');
      if (fs.existsSync(logsHead)) {
        const w = fs.watch(logsHead, (eventType) => this._fire('logs-head', eventType));
        this.watchers.push(w);
      }
    } catch (_e) { /* ignore */ }

    return this.watchers.length > 0;
  }

  _fire(source, eventType, filename) {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.emit('change', { source, eventType, filename });
    }, 400);  // debounce 400ms — commits write multiple files within ~100ms
  }

  stop() {
    for (const w of this.watchers) {
      try { w.close(); } catch (_e) { /* ignore */ }
    }
    this.watchers = [];
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}

module.exports = { GitWatcher };
