'use strict';

/**
 * Pace panel — onboarding-first side-dock UI.
 *
 * Empty state: big welcome card with concrete example chips.
 * After first message: chats accumulate, welcome card hides.
 * Top "ambient line" speaks plain Chinese, not emoji pills.
 * Detail dashboard hidden by default, accessible via ⓘ button.
 */

const chatEl       = document.getElementById('chat');
const chatAreaEl   = document.getElementById('chat-area');
const welcomeEl    = document.getElementById('welcome');
const inputEl      = document.getElementById('input');
const sendBtn      = document.getElementById('send');

const settingsBtn  = document.getElementById('open-settings');
const pinBtn       = document.getElementById('toggle-pin');
const closeBtn     = document.getElementById('close-window');

const ambientEl    = document.getElementById('ambient');
const ambientTextEl= document.getElementById('ambient-text');
const ambientInfoBtn = document.getElementById('ambient-info-btn');
const detailPanelEl= document.getElementById('detail-panel');

// Detail panel inputs
const dProjDot    = document.getElementById('d-proj-dot');
const dProjRoot   = document.getElementById('d-proj-root');
const dProjBranch = document.getElementById('d-proj-branch');
const dProjRemote = document.getElementById('d-proj-remote');
const dProjDirty  = document.getElementById('d-proj-dirty');
const dProjCwd    = document.getElementById('d-proj-cwd');
const dProjLog    = document.getElementById('d-proj-log');

const dCcDot      = document.getElementById('d-cc-dot');
const dCcFound    = document.getElementById('d-cc-found');
const dCcFile     = document.getElementById('d-cc-file');
const dCcMtime    = document.getElementById('d-cc-mtime');

const dLlmDot     = document.getElementById('d-llm-dot');
const dLlmModel   = document.getElementById('d-llm-model');
const dLlmHost    = document.getElementById('d-llm-host');
const dLlmKeysrc  = document.getElementById('d-llm-keysrc');

const dHistoryList= document.getElementById('d-history-list');

// Footer
const footerLlmDot      = document.getElementById('footer-llm-dot');
const footerStatus      = document.getElementById('footer-status');
const footerLastLatency = document.getElementById('footer-last-latency');

// Settings modal
const modalEl              = document.getElementById('modal');
const closeSettingsBtn     = document.getElementById('close-settings');
const saveSettingsBtn      = document.getElementById('save-settings');
const settingsStatusEl     = document.getElementById('settings-status');
const minimaxBaseUrlInput  = document.getElementById('minimax-base-url');
const minimaxApiKeyInput   = document.getElementById('minimax-api-key');
const minimaxModelInput    = document.getElementById('minimax-model');
const knowledgeSourceSelect= document.getElementById('knowledge-source');

// --- helpers ---
function tsLabel() { return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }); }
function truncate(s, n) { return s && s.length > n ? s.slice(0, n) + '…' : (s || '—'); }
function timeAgo(ms) {
  if (!ms) return '—';
  const dt = Date.now() - ms;
  if (dt < 60_000) return Math.floor(dt / 1000) + '秒前';
  if (dt < 3600_000) return Math.floor(dt / 60_000) + '分钟前';
  if (dt < 86400_000) return Math.floor(dt / 3600_000) + '小时前';
  return Math.floor(dt / 86400_000) + '天前';
}
function setDot(el, level) {
  el.classList.remove('ok', 'warn', 'alert');
  if (level) el.classList.add(level);
}

// --- Build friendly ambient line (plain Chinese, no pills) ---

function buildAmbientText(ctx, settings) {
  const parts = [];
  if (ctx.git && ctx.git.available) {
    const root = (ctx.git.git_root || '').split(/[\\/]/).pop() || ctx.git.git_root;
    parts.push(`我看到你在 <strong>${root}</strong> 项目`);
    if (ctx.git.git_branch) parts.push(`<strong>${ctx.git.git_branch}</strong> 分支`);
    const dirty = ctx.git.dirty_count || 0;
    if (dirty > 0) parts.push(`有 <strong>${dirty}</strong> 个文件没提交`);
    else parts.push('工作区干净');
  } else {
    parts.push('当前目录不是 git 仓库——你可以直接告诉我你在做啥');
  }
  if (ctx.cc_session) {
    parts.push(`Claude Code 上次活动 <strong>${timeAgo(ctx.cc_session.last_mtime_ms)}</strong>`);
  }
  if (!settings.has_minimax_config) {
    parts.unshift('<strong style="color: var(--warn)">还没配 LLM key</strong>——点右上角 ⚙ 设一下');
  }
  return parts.join(' · ');
}

// --- Snapshot + populate ---

async function refreshSidebar() {
  let snap;
  try {
    snap = await window.pace.contextSnapshot({ includeTranscript: false });
  } catch (err) {
    ambientTextEl.textContent = `读取上下文出错：${err.message}`;
    return;
  }
  const { ctx, settings, recent_history } = snap;

  // Friendly ambient line
  ambientEl.classList.remove('empty');
  ambientTextEl.innerHTML = buildAmbientText(ctx, settings);

  // Detail panel (only visible when user opens it)
  const gitOk = !!(ctx.git && ctx.git.available);
  setDot(dProjDot, gitOk ? 'ok' : 'alert');
  if (gitOk) {
    const dirty = ctx.git.dirty_count || 0;
    dProjRoot.textContent   = ctx.git.git_root || '—';
    dProjBranch.textContent = ctx.git.git_branch || '—';
    dProjRemote.textContent = ctx.git.git_remote ? truncate(ctx.git.git_remote.replace(/^https?:\/\//, ''), 40) : '—';
    dProjDirty.textContent  = dirty ? dirty + ' 个文件' : '干净';
    dProjDirty.className    = 'v' + (dirty ? ' warn' : ' muted');
    dProjCwd.textContent    = ctx._meta.cwd;
    dProjLog.innerHTML = '';
    (ctx.git.recent_log || []).slice(0, 5).forEach((line) => {
      const li = document.createElement('li');
      li.textContent = line;
      dProjLog.appendChild(li);
    });
  } else {
    dProjRoot.textContent = '—'; dProjBranch.textContent = '—';
    dProjRemote.textContent = '—'; dProjDirty.textContent = '—';
    dProjCwd.textContent = ctx._meta.cwd;
    dProjLog.innerHTML = '';
  }

  if (ctx.cc_session) {
    setDot(dCcDot, 'ok');
    dCcFound.textContent = '是'; dCcFound.className = 'v accent';
    dCcFile.textContent  = truncate((ctx.cc_session.session_file || '').split(/[\\/]/).pop(), 30);
    dCcMtime.textContent = new Date(ctx.cc_session.last_mtime_ms).toLocaleString('zh-CN');
  } else {
    setDot(dCcDot, 'warn');
    dCcFound.textContent = '否'; dCcFound.className = 'v warn';
    dCcFile.textContent  = '—'; dCcMtime.textContent = '—';
  }

  const hasKey = !!settings.has_minimax_config;
  setDot(dLlmDot, hasKey ? 'ok' : 'alert');
  setDot(footerLlmDot, hasKey ? 'ok' : 'alert');
  dLlmModel.textContent = settings.minimax_model || '—';
  try {
    const u = new URL(settings.minimax_base_url || '');
    dLlmHost.textContent = u.host;
  } catch (_e) { dLlmHost.textContent = settings.minimax_base_url || '—'; }
  dLlmKeysrc.textContent = settings.minimax_api_key_source === 'env' ? 'env'
    : (settings.minimax_api_key_source === 'config' ? 'config.json' : '(未配)');
  dLlmKeysrc.className = 'v' + (hasKey ? ' accent' : ' alert');

  footerStatus.textContent = hasKey ? `${settings.minimax_model} · ready` : '未配 key';

  // Recent history (in detail panel only)
  dHistoryList.innerHTML = '';
  if (!recent_history || recent_history.length === 0) {
    const li = document.createElement('li');
    li.style.color = 'var(--text-muted)';
    li.textContent = '(暂无历史)';
    dHistoryList.appendChild(li);
  } else {
    recent_history.slice(0, 6).forEach((row) => {
      const li = document.createElement('li');
      const t = (row.created_at || '').slice(11, 16);
      const q = truncate(row.user_input.replace(/\n+/g, ' '), 32);
      const tsEl = document.createElement('span');
      tsEl.className = 'ts';
      tsEl.textContent = t;
      li.appendChild(tsEl);
      li.appendChild(document.createTextNode(q));
      dHistoryList.appendChild(li);
    });
  }
}

// --- Detail panel toggle ---
ambientInfoBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const open = detailPanelEl.classList.toggle('open');
  detailPanelEl.setAttribute('aria-hidden', open ? 'false' : 'true');
  ambientInfoBtn.textContent = open ? '× 收起' : 'ⓘ 详情';
});

// --- Window controls ---
closeBtn.addEventListener('click', () => window.pace.hideWindow());
pinBtn.addEventListener('click', async () => {
  const pinned = await window.pace.togglePin();
  pinBtn.classList.toggle('active', pinned);
  pinBtn.title = pinned ? '取消置顶' : '置顶';
});
settingsBtn.addEventListener('click', () => openModal());

// --- Welcome chips → fill input + send ---
document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    const prompt = chip.dataset.prompt;
    if (!prompt) return;
    inputEl.value = prompt;
    send();
  });
});

// --- Markdown-lite renderer (XSS-safe) ---
function renderInline(parent, text) {
  const re = /(\*\*[^*\n]+?\*\*|`[^`\n]+?`)/g;
  let last = 0; let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parent.appendChild(document.createTextNode(text.slice(last, m.index)));
    const tok = m[0];
    if (tok.startsWith('**')) {
      const b = document.createElement('strong'); b.textContent = tok.slice(2, -2);
      parent.appendChild(b);
    } else {
      const c = document.createElement('code'); c.textContent = tok.slice(1, -1);
      parent.appendChild(c);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
}
function renderMarkdown(parent, text) {
  parent.innerHTML = '';
  if (!text) return;
  const blocks = text.split(/\n{2,}/);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    if (/^---+$/.test(trimmed)) { parent.appendChild(document.createElement('hr')); continue; }
    const hMatch = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (hMatch && !trimmed.includes('\n')) {
      const h = document.createElement('h' + hMatch[1].length);
      renderInline(h, hMatch[2]);
      parent.appendChild(h);
      continue;
    }
    const lines = block.split('\n');
    if (lines.every((l) => /^\s*[-*]\s/.test(l) || !l.trim())) {
      const ul = document.createElement('ul');
      for (const l of lines) {
        if (!l.trim()) continue;
        const li = document.createElement('li');
        renderInline(li, l.replace(/^\s*[-*]\s+/, ''));
        ul.appendChild(li);
      }
      parent.appendChild(ul);
      continue;
    }
    if (lines.every((l) => /^\s*>\s?/.test(l) || !l.trim())) {
      const bq = document.createElement('blockquote');
      const inner = lines.map((l) => l.replace(/^\s*>\s?/, '')).join('\n');
      renderInline(bq, inner);
      parent.appendChild(bq);
      continue;
    }
    const div = document.createElement('div');
    div.className = 'block';
    lines.forEach((line, i) => {
      if (i > 0) div.appendChild(document.createElement('br'));
      renderInline(div, line);
    });
    parent.appendChild(div);
  }
}

// --- Chat ---
function hideWelcome() { if (welcomeEl) welcomeEl.hidden = true; }

function appendUserMsg(text) {
  hideWelcome();
  const node = document.createElement('div');
  node.className = 'msg user';
  node.textContent = text;
  const tsEl = document.createElement('span'); tsEl.className = 'ts'; tsEl.textContent = tsLabel();
  node.appendChild(tsEl);
  chatEl.appendChild(node);
  chatAreaEl.scrollTop = chatAreaEl.scrollHeight;
}
function makePendingMentor() {
  const node = document.createElement('div');
  node.className = 'msg mentor';
  const spinner = document.createElement('span'); spinner.className = 'spinner';
  node.appendChild(spinner);
  node.appendChild(document.createTextNode('思考中…（30–60 秒，大模型在推理）'));
  chatEl.appendChild(node);
  chatAreaEl.scrollTop = chatAreaEl.scrollHeight;
  return node;
}
function finalizeMentor(node, text, isError) {
  node.className = 'msg ' + (isError ? 'error' : 'mentor');
  if (isError) node.textContent = text;
  else renderMarkdown(node, text);
  const tsEl = document.createElement('span'); tsEl.className = 'ts'; tsEl.textContent = tsLabel();
  node.appendChild(tsEl);
  chatAreaEl.scrollTop = chatAreaEl.scrollHeight;
}

async function send() {
  const text = inputEl.value.trim();
  if (!text) return;
  sendBtn.disabled = true;
  inputEl.value = '';
  appendUserMsg(text);
  const pending = makePendingMentor();
  const t0 = Date.now();
  footerStatus.textContent = '思考中…';
  try {
    const reply = await window.pace.askMentor({ text });
    const md = (reply && reply.markdown) || '(no reply)';
    finalizeMentor(pending, md, false);
    const elapsed = (reply && reply.debug && reply.debug.elapsed_ms) || (Date.now() - t0);
    footerLastLatency.textContent = `${(elapsed / 1000).toFixed(1)}s`;
    footerStatus.textContent = '就绪';
    window.pace.log('panel', 'mentor_reply', {
      input_length: text.length,
      stage: reply && reply.debug && reply.debug.stage,
      elapsed_ms: elapsed,
    });
  } catch (err) {
    finalizeMentor(pending, '出错：' + (err && err.message ? err.message : String(err)), true);
    footerStatus.textContent = '出错';
    window.pace.log('panel', 'mentor_reply_error', { error: String(err) }, 'error');
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
    refreshSidebar();
  }
}

sendBtn.addEventListener('click', send);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
});

// --- Settings modal ---
async function loadSettings() {
  try {
    const s = await window.pace.getSettings();
    minimaxBaseUrlInput.value = s.minimax_base_url || '';
    minimaxModelInput.value   = s.minimax_model   || '';
    minimaxApiKeyInput.value  = '';
    knowledgeSourceSelect.value = s.knowledge_source || 'pmp';
    if (s.has_minimax_config) {
      settingsStatusEl.className = 'status-row ok';
      settingsStatusEl.textContent =
        '✓ MiniMax 已配置 · key 来自 ' + (s.minimax_api_key_source === 'env' ? '环境变量' : 'config.json') +
        ' · 模型 ' + s.minimax_model;
    } else {
      settingsStatusEl.className = 'status-row warn';
      settingsStatusEl.textContent = '⚠ 还没设 API key — 配上后 mentor 才能回答。';
    }
  } catch (err) {
    settingsStatusEl.className = 'status-row warn';
    settingsStatusEl.textContent = '加载设置出错：' + err.message;
  }
}

function openModal() {
  modalEl.classList.add('open');
  modalEl.setAttribute('aria-hidden', 'false');
  loadSettings();
}
function closeModal() {
  modalEl.classList.remove('open');
  modalEl.setAttribute('aria-hidden', 'true');
}

closeSettingsBtn.addEventListener('click', closeModal);
modalEl.addEventListener('click', (e) => { if (e.target === modalEl) closeModal(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalEl.classList.contains('open')) closeModal();
});

saveSettingsBtn.addEventListener('click', async () => {
  saveSettingsBtn.disabled = true;
  try {
    const patch = {
      minimax_base_url: minimaxBaseUrlInput.value,
      minimax_model:    minimaxModelInput.value,
      knowledge_source: knowledgeSourceSelect.value,
    };
    const newKey = minimaxApiKeyInput.value.trim();
    if (newKey) patch.minimax_api_key = newKey;
    const s = await window.pace.saveSettings(patch);
    if (s && s.has_minimax_config) {
      settingsStatusEl.className = 'status-row ok';
      settingsStatusEl.textContent = '✓ 已保存到 ' + s.config_path;
    } else {
      settingsStatusEl.className = 'status-row warn';
      settingsStatusEl.textContent = '⚠ 保存了但仍缺 API key — mentor 无法回答。';
    }
    minimaxApiKeyInput.value = '';
    refreshSidebar();
  } catch (err) {
    settingsStatusEl.className = 'status-row warn';
    settingsStatusEl.textContent = '保存出错：' + err.message;
  } finally {
    saveSettingsBtn.disabled = false;
  }
});

// --- Boot ---
window.addEventListener('DOMContentLoaded', async () => {
  window.pace.log('panel', 'boot', { version: '0.1.0', form: 'side-dock-onboarding' });
  await refreshSidebar();
  try {
    const s = await window.pace.windowState();
    if (s && s.pinned) pinBtn.classList.add('active');
  } catch (_e) {}
});
