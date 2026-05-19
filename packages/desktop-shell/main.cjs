'use strict';

/**
 * Pace desktop-shell — Electron main process (v0.1, side-panel form).
 *
 * Form factor:
 *   - Frameless BrowserWindow docked to right edge of primary display,
 *     full screen height, ~460px wide.
 *   - Tray icon (mentor-teal rounded square, generated at boot) is the
 *     primary entry point. Click → toggle show/hide. Right-click → menu.
 *   - Window close button hides to tray; only "Quit Pace" from tray
 *     actually quits.
 *
 * IPC routing: mentor pipeline, settings, history, context-snapshot,
 * window controls, log.
 *
 * Per PRODUCT.md decision #4 (passive responses only): tray icon stays
 * idle. No notifications, no nudges, no global hotkey by default.
 */

const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const config = require('./config.cjs');
const db = require('./db.cjs');
const mentorPipeline = require('./mentor-pipeline.cjs');
const ccBridge = require('./cc-bridge.cjs');
const { buildTrayPng } = require('./tray-icon.cjs');
const { GitWatcher } = require('./git-watcher.cjs');
const i18n = require('./i18n.cjs');

const PANEL_WIDTHS = { slim: 420, regular: 460, wide: 520 };
function resolveWinWidth() {
  const w = PANEL_WIDTHS[config.getSettings().panel_width];
  return Number.isFinite(w) ? w : 460;
}

let mainWindow = null;
let tray = null;
let isQuitting = false;

function createMainWindow() {
  const display = screen.getPrimaryDisplay();
  const { workArea } = display;
  const winWidth = resolveWinWidth();
  const x = workArea.x + workArea.width - winWidth;
  const y = workArea.y;
  const height = workArea.height;

  mainWindow = new BrowserWindow({
    x, y,
    width: winWidth,
    height,
    minWidth: 380,
    minHeight: 400,
    frame: false,
    transparent: false,
    backgroundColor: '#0d0f10',
    title: 'Pace',
    show: false,
    skipTaskbar: true,
    resizable: true,
    movable: true,
    alwaysOnTop: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Windows 11 mica backdrop — looks much better than flat #0d0f10
  if (process.platform === 'win32') {
    try { mainWindow.setBackgroundMaterial('mica'); } catch (_e) { /* OS too old */ }
  }

  mainWindow.removeMenu();
  mainWindow.loadFile(path.join(__dirname, 'panel.html'));

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // Close button (frameless custom header) → hide to tray; only the
  // tray "Quit Pace" sets isQuitting=true.
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  const icon = nativeImage.createFromBuffer(buildTrayPng());
  tray = new Tray(icon);
  tray.setToolTip('Pace — PMP mentor for cc users');

  const buildMenu = () => Menu.buildFromTemplate([
    {
      label: mainWindow && mainWindow.isVisible() ? 'Hide Pace' : 'Show Pace',
      click: () => toggleWindow(),
    },
    { type: 'separator' },
    {
      label: 'Always on top',
      type: 'checkbox',
      checked: !!(mainWindow && mainWindow.isAlwaysOnTop()),
      click: (item) => {
        if (mainWindow) mainWindow.setAlwaysOnTop(item.checked);
      },
    },
    { type: 'separator' },
    {
      label: 'Quit Pace',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(buildMenu());
  tray.on('click', () => toggleWindow());
  tray.on('right-click', () => tray.setContextMenu(buildMenu()));
}

function toggleWindow() {
  if (!mainWindow) {
    createMainWindow();
    return;
  }
  if (mainWindow.isVisible() && mainWindow.isFocused()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
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

// Streaming variant — emits 'pace:stream-chunk' events to the sender
// keyed by stream_id, and returns final result on completion.
ipcMain.handle('pace:mentor-ask-stream', async (event, input) => {
  const text = (input && typeof input.text === 'string') ? input.text.trim() : '';
  const streamId = (input && input.stream_id) || `stream-${Date.now()}`;
  if (!text) {
    const md = '请先输入一句你想问的话。';
    event.sender.send('pace:stream-chunk', { stream_id: streamId, chunk: { type: 'error', code: 'empty_input', markdown: md } });
    return { markdown: md, debug: { stage: 'reject', reason: 'empty_input' } };
  }
  const cwd = (input && typeof input.cwd === 'string' && input.cwd) || process.cwd();
  const asMemberId = (input && Number.isInteger(input.as_member_id)) ? input.as_member_id : null;
  const history = (input && Array.isArray(input.history)) ? input.history : [];
  try {
    return await mentorPipeline.runMentorAgentStream(text, { cwd, as_member_id: asMemberId, history }, (chunk) => {
      if (!event.sender.isDestroyed()) {
        event.sender.send('pace:stream-chunk', { stream_id: streamId, chunk });
      }
    });
  } catch (err) {
    const md = `⚠️ **mentor pipeline 异常**\n\n\`${err.message}\``;
    event.sender.send('pace:stream-chunk', { stream_id: streamId, chunk: { type: 'error', code: 'pipeline_error', markdown: md } });
    return { markdown: md, debug: { stage: 'pipeline_error', error: err.message } };
  }
});

// --- IPC: settings ---

ipcMain.handle('pace:strings-get', async (_e, lang) => {
  const l = (lang === 'en' || lang === 'zh-CN') ? lang : (config.getSettings().language || 'zh-CN');
  return { lang: l, strings: i18n.flatStrings(l) };
});

ipcMain.handle('pace:settings-get', async () => config.getSettings());
ipcMain.handle('pace:settings-save', async (_event, patch) => {
  const newSettings = config.saveSettings(patch || {});
  // Apply panel_width live by resizing window
  if (mainWindow && !mainWindow.isDestroyed()) {
    const display = screen.getPrimaryDisplay();
    const { workArea } = display;
    const w = PANEL_WIDTHS[newSettings.panel_width] || 460;
    const bounds = mainWindow.getBounds();
    if (bounds.width !== w) {
      mainWindow.setBounds({
        x: workArea.x + workArea.width - w,
        y: workArea.y,
        width: w,
        height: workArea.height,
      });
    }
  }
  return newSettings;
});

// --- IPC: team ---

function resolveProjectId(opts) {
  if (opts && typeof opts.project_id === 'string' && opts.project_id) return opts.project_id;
  // Fallback: resolve from cwd's git root
  const cwd = (opts && typeof opts.cwd === 'string' && opts.cwd) || process.cwd();
  const ctx = ccBridge.collect({ cwd, includeTranscript: false });
  return (ctx.git && ctx.git.git_root) || cwd;
}

ipcMain.handle('pace:team-list', async (_event, opts) => {
  const projectId = resolveProjectId(opts);
  return {
    project_id: projectId,
    members: db.listTeamMembers(projectId),
  };
});

ipcMain.handle('pace:team-add', async (_event, input) => {
  const projectId = resolveProjectId(input);
  const id = db.addTeamMember({
    project_id: projectId,
    name: input.name,
    role: input.role,
    raci: input.raci,
    notes: input.notes,
  });
  return { id, project_id: projectId };
});

ipcMain.handle('pace:team-update', async (_event, input) => {
  return db.updateTeamMember(input.id, input.patch || {});
});

ipcMain.handle('pace:team-delete', async (_event, input) => {
  return db.deleteTeamMember(input.id);
});

// --- IPC: history ---

ipcMain.handle('pace:history-list', async (_event, limit) => {
  try {
    return db.listMentorTurns(limit || 30);
  } catch (err) {
    return { error: err.message };
  }
});

// --- IPC: context snapshot (sidebar / collapsed-bar dashboard) ---

ipcMain.handle('pace:context-snapshot', async (_event, opts) => {
  const cwd = (opts && typeof opts.cwd === 'string' && opts.cwd) || process.cwd();
  const includeTranscript = !!(opts && opts.includeTranscript);
  const t0 = Date.now();
  const ctx = ccBridge.collect({ cwd, includeTranscript, transcriptN: 8 });
  const settings = config.getSettings();
  let recent = [];
  try { recent = db.listMentorTurns(8); } catch (_e) { /* db unavailable */ }
  // Include team for the resolved project
  const projectId = (ctx.git && ctx.git.git_root) || cwd;
  let team = [];
  try { team = db.listTeamMembers(projectId); } catch (_e) { /* ignore */ }
  return {
    elapsed_ms: Date.now() - t0,
    ctx,
    settings,
    recent_history: recent,
    team,
  };
});

// --- IPC: window controls (from custom frameless header) ---

ipcMain.handle('pace:window-hide', () => {
  if (mainWindow) mainWindow.hide();
});
ipcMain.handle('pace:window-pin-toggle', () => {
  if (!mainWindow) return false;
  const next = !mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(next);
  return next;
});
ipcMain.handle('pace:window-state', () => {
  if (!mainWindow) return { visible: false, pinned: false };
  return {
    visible: mainWindow.isVisible(),
    pinned: mainWindow.isAlwaysOnTop(),
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
  process.stdout.write(line + '\n');
  try {
    const logDir = path.join(os.homedir(), '.pace', 'logs');
    fs.mkdirSync(logDir, { recursive: true });
    const stamp = new Date().toISOString().slice(0, 10);
    fs.appendFileSync(path.join(logDir, `pace-${stamp}.jsonl`), line + '\n');
  } catch (_e) { /* swallow */ }
});

// --- git watcher (commit events → ping renderer) ---

const activeWatchers = new Map();   // git_root → GitWatcher
function ensureGitWatcher(gitRoot) {
  if (!gitRoot || activeWatchers.has(gitRoot)) return;
  const w = new GitWatcher(gitRoot);
  if (w.start()) {
    w.on('change', (e) => {
      // notify renderer; renderer decides whether to refresh
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('pace:git-change', { git_root: gitRoot, ...e });
      }
    });
    activeWatchers.set(gitRoot, w);
  }
}

ipcMain.handle('pace:git-watch', async (_event, opts) => {
  const projectId = resolveProjectId(opts);
  ensureGitWatcher(projectId);
  return { project_id: projectId, watching: activeWatchers.has(projectId) };
});

// --- Lifecycle ---

app.whenReady().then(() => {
  try { db.openDatabase(); }
  catch (err) { process.stderr.write(`[pace] db open failed: ${err.message}\n`); }
  createTray();
  createMainWindow();
});

// Don't quit on close-all-windows — Pace lives in tray.
app.on('window-all-closed', () => { /* stay alive */ });

app.on('before-quit', () => { isQuitting = true; });

app.on('activate', () => {
  if (!mainWindow) createMainWindow();
  else { mainWindow.show(); mainWindow.focus(); }
});
