'use strict';

/**
 * Pace desktop-shell — Electron main process (v0.1).
 *
 * Responsibilities:
 *   - app lifecycle (whenReady / window-all-closed / activate)
 *   - single BrowserWindow loading panel.html
 *   - IPC routing: mentor pipeline, settings, history, log
 *
 * Per PRODUCT.md decision #4 (passive responses only): no tray nudges,
 * no global shortcut popup, no notifications. Single foreground window.
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const config = require('./config.cjs');
const db = require('./db.cjs');
const mentorPipeline = require('./mentor-pipeline.cjs');
const ccBridge = require('./cc-bridge.cjs');

let mainWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 820,
    height: 720,
    minWidth: 480,
    minHeight: 480,
    title: 'Pace',
    backgroundColor: '#FAF7F2',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.removeMenu();
  mainWindow.loadFile(path.join(__dirname, 'panel.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// --- IPC: mentor ---

ipcMain.handle('pace:mentor-ask', async (_event, input) => {
  const text = (input && typeof input.text === 'string') ? input.text.trim() : '';
  if (!text) {
    return {
      markdown: '请先输入一句你想问的话。',
      debug: { stage: 'reject', reason: 'empty_input' },
    };
  }
  const cwd = (input && typeof input.cwd === 'string' && input.cwd) || process.cwd();
  try {
    return await mentorPipeline.runMentorTurn(text, { cwd });
  } catch (err) {
    return {
      markdown: `⚠️ **mentor pipeline 异常**\n\n\`${err.message}\``,
      debug: { stage: 'pipeline_error', error: err.message, stack: err.stack },
    };
  }
});

// --- IPC: settings ---

ipcMain.handle('pace:settings-get', async () => {
  return config.getSettings();
});

ipcMain.handle('pace:settings-save', async (_event, patch) => {
  return config.saveSettings(patch || {});
});

// --- IPC: history ---

ipcMain.handle('pace:history-list', async (_event, limit) => {
  try {
    return db.listMentorTurns(limit || 30);
  } catch (err) {
    return { error: err.message };
  }
});

// --- IPC: context snapshot (for sidebar dashboard) ---

ipcMain.handle('pace:context-snapshot', async (_event, opts) => {
  const cwd = (opts && typeof opts.cwd === 'string' && opts.cwd) || process.cwd();
  const includeTranscript = !!(opts && opts.includeTranscript);
  const t0 = Date.now();
  const ctx = ccBridge.collect({ cwd, includeTranscript, transcriptN: 8 });
  const settings = config.getSettings();
  let recent = [];
  try {
    recent = db.listMentorTurns(8);
  } catch (_e) { /* db unavailable */ }
  return {
    elapsed_ms: Date.now() - t0,
    ctx,
    settings,
    recent_history: recent,
  };
});

// --- IPC: log ---

ipcMain.on('pace:log', (_event, component, event, details, level) => {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level: level || 'info',
    component: component || 'renderer',
    event: event || 'log',
    details: details || null,
  });
  // stdout (caught by parent if launched via npm). Future: ~/.pace/logs/.
  process.stdout.write(line + '\n');
  // Best-effort file log for the user to grep, never block.
  try {
    const logDir = path.join(os.homedir(), '.pace', 'logs');
    fs.mkdirSync(logDir, { recursive: true });
    const stamp = new Date().toISOString().slice(0, 10);
    fs.appendFileSync(path.join(logDir, `pace-${stamp}.jsonl`), line + '\n');
  } catch (_e) { /* swallow */ }
});

// --- Lifecycle ---

app.whenReady().then(() => {
  // Eagerly open DB so renderer can call settings/history without
  // first-call latency surprises. Failure here is logged but not fatal —
  // the mentor pipeline best-effort-persists.
  try {
    db.openDatabase();
  } catch (err) {
    process.stderr.write(`[pace] db open failed: ${err.message}\n`);
  }
  createMainWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
