'use strict';

/**
 * Pace desktop-shell — Electron main process (v0.1 minimal).
 *
 * Responsibilities:
 *   - app lifecycle (whenReady / window-all-closed / activate)
 *   - single BrowserWindow loading panel.html
 *   - IPC: pace:mentor-ask (stubbed → mentor-handler in later phase)
 *
 * v0.1 scope: chat round-trip only. No DB, no cc-bridge, no LLM call —
 * mentor-handler returns a stubbed markdown reply. Wiring real cc-bridge
 * + LLM + PMP skills is the next phase.
 *
 * Per PRODUCT.md decision #4 (passive responses only): no tray nudges,
 * no global shortcut popup, no notifications. Single foreground window.
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
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

// --- IPC ---

ipcMain.handle('pace:mentor-ask', async (_event, input) => {
  const text = (input && typeof input.text === 'string') ? input.text.trim() : '';
  if (!text) {
    return {
      markdown: '请先输入一句你想问的话。',
      debug: { stage: 'reject', reason: 'empty_input' },
    };
  }
  // v0.1 stub. Real implementation will:
  //   1. cc-bridge.cjs → lazy read transcript + git context
  //   2. project-queries.cjs → project ID resolution
  //   3. mentor-collect → activity classification (haiku)
  //   4. mentor-prompt + llm-client → PMP-routed sonnet call
  //   5. cairn-kernel MCP → persist as task
  return {
    markdown: [
      '> _v0.1 stub reply — 真实的 PMP mentor 推断引擎尚未接入。_',
      '',
      `你刚才说：**${text.slice(0, 200)}${text.length > 200 ? '…' : ''}**`,
      '',
      '下一步：接入 cc-bridge 读 transcript + git 上下文 → mentor 推断引擎跑 PMP 阶段分类。',
    ].join('\n'),
    debug: {
      stage: 'stub',
      received_at: new Date().toISOString(),
      input_length: text.length,
    },
  };
});

ipcMain.on('pace:log', (_event, component, event, details, level) => {
  // v0.1: stdout only. Later: ~/.pace/logs/pace-<date>.jsonl
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level: level || 'info',
    component: component || 'renderer',
    event: event || 'log',
    details: details || null,
  });
  process.stdout.write(line + '\n');
});

// --- Lifecycle ---

app.whenReady().then(() => {
  createMainWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
