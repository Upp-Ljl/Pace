'use strict';

/**
 * Pace renderer ↔ main bridge.
 *
 * v0.1 surface: chat, settings, history, log.
 * Read-only-ish: the only "write" is settings save — no mutations to
 * external systems, no spawn (per PRODUCT.md reverse-definition #1).
 */

const { contextBridge, ipcRenderer } = require('electron');

const api = {
  getStrings:       (lang)   => ipcRenderer.invoke('pace:strings-get', lang || null),
  classifyCommand:  (cmd)    => ipcRenderer.invoke('pace:cmd-classify', cmd || ''),
  execCommand:      (input, onChunk) => {
    const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const handler = (_event, payload) => {
      if (payload && payload.run_id === runId) {
        try { onChunk && onChunk(payload.chunk); } catch (_e) {}
        if (payload.chunk && (payload.chunk.type === 'exit' || payload.chunk.type === 'error')) {
          // Defer the actual removeListener so we don't kill the listener
          // before chunks queued just before this 'exit' have been processed.
          setTimeout(() => ipcRenderer.removeListener('pace:cmd-chunk', handler), 50);
        }
      }
    };
    ipcRenderer.on('pace:cmd-chunk', handler);
    // Don't unsubscribe via .finally — main's IPC return might race with the
    // exit chunk delivery. The handler self-removes 50ms after exit/error.
    return ipcRenderer.invoke('pace:cmd-exec', { ...(input || {}), run_id: runId });
  },
  askMentor:        (input)  => ipcRenderer.invoke('pace:mentor-ask', input || {}),
  /**
   * Stream a mentor turn. onChunk receives:
   *   { type: 'thinking', text }
   *   { type: 'answer',   text }
   *   { type: 'done',     final, debug }
   *   { type: 'error',    code, markdown, debug }
   * Returns the same final shape as askMentor.
   */
  streamMentorAsk: (input, onChunk) => {
    const streamId = `stream-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const handler = (_event, payload) => {
      if (payload && payload.stream_id === streamId) {
        try { onChunk && onChunk(payload.chunk); } catch (_e) {}
        if (payload.chunk && (payload.chunk.type === 'done' || payload.chunk.type === 'error')) {
          setTimeout(() => ipcRenderer.removeListener('pace:stream-chunk', handler), 50);
        }
      }
    };
    ipcRenderer.on('pace:stream-chunk', handler);
    return ipcRenderer.invoke('pace:mentor-ask-stream', { ...(input || {}), stream_id: streamId });
  },
  getSettings:      ()       => ipcRenderer.invoke('pace:settings-get'),
  saveSettings:     (patch)  => ipcRenderer.invoke('pace:settings-save', patch || {}),
  listHistory:      (limit)  => ipcRenderer.invoke('pace:history-list', limit || 30),
  contextSnapshot:  (opts)   => ipcRenderer.invoke('pace:context-snapshot', opts || {}),
  hideWindow:       ()       => ipcRenderer.invoke('pace:window-hide'),
  togglePin:        ()       => ipcRenderer.invoke('pace:window-pin-toggle'),
  windowState:      ()       => ipcRenderer.invoke('pace:window-state'),
  captureWindow:    ()       => ipcRenderer.invoke('pace:capture-window'),
  // Team
  teamList:    ()             => ipcRenderer.invoke('pace:team-list', {}),
  teamAdd:     (member)       => ipcRenderer.invoke('pace:team-add', member || {}),
  teamUpdate:  (id, patch)    => ipcRenderer.invoke('pace:team-update', { id, patch }),
  teamDelete:  (id)           => ipcRenderer.invoke('pace:team-delete', { id }),
  // Git watcher
  startGitWatch: () => ipcRenderer.invoke('pace:git-watch', {}),
  onGitChange:   (cb) => {
    const handler = (_event, payload) => { try { cb(payload); } catch (_e) {} };
    ipcRenderer.on('pace:git-change', handler);
    return () => ipcRenderer.removeListener('pace:git-change', handler);
  },
  log: (component, event, details, level) => {
    try { ipcRenderer.send('pace:log', component, event, details, level); } catch (_e) {}
  },
};

contextBridge.exposeInMainWorld('pace', api);
