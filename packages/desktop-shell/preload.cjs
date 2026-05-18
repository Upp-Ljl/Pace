'use strict';

/**
 * Pace renderer ↔ main bridge.
 *
 * v0.1 surface: chat with mentor + log.
 * Read-only IPC contract (no mutations exposed to renderer).
 */

const { contextBridge, ipcRenderer } = require('electron');

const api = {
  askMentor: (input) => ipcRenderer.invoke('pace:mentor-ask', input || {}),
  log: (component, event, details, level) => {
    try { ipcRenderer.send('pace:log', component, event, details, level); } catch (_e) {}
  },
};

contextBridge.exposeInMainWorld('pace', api);
