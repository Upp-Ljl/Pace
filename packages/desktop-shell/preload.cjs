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
  askMentor:        (input)  => ipcRenderer.invoke('pace:mentor-ask', input || {}),
  getSettings:      ()       => ipcRenderer.invoke('pace:settings-get'),
  saveSettings:     (patch)  => ipcRenderer.invoke('pace:settings-save', patch || {}),
  listHistory:      (limit)  => ipcRenderer.invoke('pace:history-list', limit || 30),
  contextSnapshot:  (opts)   => ipcRenderer.invoke('pace:context-snapshot', opts || {}),
  hideWindow:       ()       => ipcRenderer.invoke('pace:window-hide'),
  togglePin:        ()       => ipcRenderer.invoke('pace:window-pin-toggle'),
  windowState:      ()       => ipcRenderer.invoke('pace:window-state'),
  log: (component, event, details, level) => {
    try { ipcRenderer.send('pace:log', component, event, details, level); } catch (_e) {}
  },
};

contextBridge.exposeInMainWorld('pace', api);
