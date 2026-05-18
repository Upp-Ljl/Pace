'use strict';

/**
 * Pace panel — v0.1 dashboard + chat.
 *
 *   Sidebar (left): live context snapshot (project / cc / LLM / history)
 *   Chat (right):   markdown-rendered mentor replies
 *   Footer:         status pill + last latency + model + config path
 *
 * Markdown rendering is XSS-safe — DOM API only, never innerHTML for
 * LLM-derived text. Supports **bold**, `code`, > blockquote, - bullets,
 * # / ## / ### headers, --- hr, paragraphs.
 */

// --- DOM handles ---

const chatEl  = document.getElementById('chat');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send');

const cwdLabelEl = document.getElementById('cwd-label');

const projDotEl    = document.getElementById('proj-dot');
const projRootEl   = document.getElementById('proj-root');
const projBranchEl = document.getElementById('proj-branch');
const projRemoteEl = document.getElementById('proj-remote');
const projDirtyEl  = document.getElementById('proj-dirty');
const projLogEl    = document.getElementById('proj-log');

const ccDotEl   = document.getElementById('cc-dot');
const ccFoundEl = document.getElementById('cc-found');
const ccFileEl  = document.getElementById('cc-file');
const ccMtimeEl = document.getElementById('cc-mtime');
const ccTurnsEl = document.getElementById('cc-turns');

const llmDotEl    = document.getElementById('llm-dot');
const llmModelEl  = document.getElementById('llm-model');
const llmHostEl   = document.getElementById('llm-host');
const llmKeySrcEl = document.getElementById('llm-keysrc');

const historyListEl = document.getElementById('history-list');

const footerLlmDotEl     = document.getElementById('footer-llm-dot');
const footerLlmStatusEl  = document.getElementById('footer-llm-status');
const footerLatencyEl    = document.getElementById('footer-last-latency');
const footerModelEl      = document.getElementById('footer-model');
const footerConfigPathEl = document.getElementById('footer-config-path');

const refreshSidebarBtn = document.getElementById('refresh-sidebar');
const openSettingsBtn   = document.getElementById('open-settings');
const closeSettingsBtn  = document.getElementById('close-settings');
const saveSettingsBtn   = document.getElementById('save-settings');
const modalEl           = document.getElementById('modal');
const settingsStatusEl  = document.getElementById('settings-status');

const minimaxBaseUrlInput   = document.getElementById('minimax-base-url');
const minimaxApiKeyInput    = document.getElementById('minimax-api-key');
const minimaxModelInput     = document.getElementById('minimax-model');
const knowledgeSourceSelect = document.getElementById('knowledge-source');

// --- helpers ---

function ts() {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function truncate(s, n) {
  if (!s) return '—';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function timeAgo(ms) {
  if (!ms) return '—';
  const dt = Date.now() - ms;
  if (dt < 60_000) return `${Math.floor(dt / 1000)}s ago`;
  if (dt < 3600_000) return `${Math.floor(dt / 60_000)}m ago`;
  if (dt < 86400_000) return `${Math.floor(dt / 3600_000)}h ago`;
  return `${Math.floor(dt / 86400_000)}d ago`;
}

function setDot(el, level) {
  el.classList.remove('ok', 'warn', 'alert');
  if (level) el.classList.add(level);
}

// --- Sidebar populator ---

async function refreshSidebar() {
  let snap;
  try {
    snap = await window.pace.contextSnapshot({ includeTranscript: false });
  } catch (err) {
    cwdLabelEl.textContent = `snapshot error: ${err.message}`;
    return;
  }
  const { ctx, settings, recent_history } = snap;

  cwdLabelEl.textContent = `cwd: ${ctx._meta.cwd}`;

  // Project
  if (ctx.git && ctx.git.available) {
    setDot(projDotEl, 'ok');
    projRootEl.textContent   = ctx.git.git_root || '—';
    projBranchEl.textContent = ctx.git.git_branch || '—';
    projRemoteEl.textContent = ctx.git.git_remote ? truncate(ctx.git.git_remote.replace(/^https:\/\//, ''), 32) : '—';
    const dirty = ctx.git.dirty_count || 0;
    projDirtyEl.textContent = dirty ? `${dirty} files` : 'clean';
    projDirtyEl.className = 'v' + (dirty ? ' warn' : ' muted');

    projLogEl.innerHTML = '';
    (ctx.git.recent_log || []).slice(0, 5).forEach((line) => {
      const li = document.createElement('li');
      li.textContent = line;
      projLogEl.appendChild(li);
    });
  } else {
    setDot(projDotEl, 'alert');
    projRootEl.textContent = '(not a git repo)';
    projBranchEl.textContent = '—';
    projRemoteEl.textContent = '—';
    projDirtyEl.textContent = '—';
    projLogEl.innerHTML = '';
  }

  // cc session
  if (ctx.cc_session) {
    setDot(ccDotEl, 'ok');
    ccFoundEl.textContent = 'yes';
    ccFoundEl.className = 'v accent';
    ccFileEl.textContent = truncate(ctx.cc_session.session_file.split(/[\\/]/).pop(), 28);
    ccMtimeEl.textContent = timeAgo(ctx.cc_session.last_mtime_ms);
    ccTurnsEl.textContent = ctx.cc_session.first_record_keys ? `${ctx.cc_session.first_record_keys.length} keys in first record` : '—';
  } else {
    setDot(ccDotEl, 'warn');
    ccFoundEl.textContent = 'no';
    ccFoundEl.className = 'v warn';
    ccFileEl.textContent = '—';
    ccMtimeEl.textContent = '—';
    ccTurnsEl.textContent = '—';
  }

  // LLM
  const hasKey = !!settings.has_minimax_config;
  setDot(llmDotEl, hasKey ? 'ok' : 'warn');
  llmModelEl.textContent  = settings.minimax_model || '—';
  try {
    const u = new URL(settings.minimax_base_url || '');
    llmHostEl.textContent = u.host;
  } catch (_e) {
    llmHostEl.textContent = settings.minimax_base_url || '—';
  }
  llmKeySrcEl.textContent = settings.minimax_api_key_source === 'env'
    ? 'env'
    : (settings.minimax_api_key_source === 'config' ? 'config.json' : '(missing)');
  llmKeySrcEl.className = 'v' + (hasKey ? ' accent' : ' alert');

  // Recent history
  historyListEl.innerHTML = '';
  if (!recent_history || recent_history.length === 0) {
    const li = document.createElement('li');
    li.style.color = 'var(--text-muted)';
    li.textContent = '(no recent turns)';
    historyListEl.appendChild(li);
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
      historyListEl.appendChild(li);
    });
  }

  // Footer
  footerModelEl.textContent = settings.minimax_model || '—';
  footerConfigPathEl.textContent = settings.config_path || '';
  if (hasKey) {
    setDot(footerLlmDotEl, 'ok');
    footerLlmStatusEl.textContent = `MiniMax · ${settings.minimax_api_key_source}`;
    footerLlmStatusEl.style.color = 'var(--ok)';
  } else {
    setDot(footerLlmDotEl, 'warn');
    footerLlmStatusEl.textContent = '未配 key';
    footerLlmStatusEl.style.color = 'var(--warn)';
  }
}

// --- Markdown-lite renderer (XSS-safe DOM API) ---

function renderInline(parent, text) {
  const re = /(\*\*[^*\n]+?\*\*|`[^`\n]+?`)/g;
  let last = 0; let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parent.appendChild(document.createTextNode(text.slice(last, m.index)));
    const tok = m[0];
    if (tok.startsWith('**')) {
      const b = document.createElement('strong');
      b.textContent = tok.slice(2, -2);
      parent.appendChild(b);
    } else {
      const c = document.createElement('code');
      c.textContent = tok.slice(1, -1);
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
    if (/^---+$/.test(trimmed)) {
      parent.appendChild(document.createElement('hr'));
      continue;
    }
    // Headers
    const hMatch = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (hMatch && !trimmed.includes('\n')) {
      const h = document.createElement('h' + hMatch[1].length);
      renderInline(h, hMatch[2]);
      parent.appendChild(h);
      continue;
    }
    const lines = block.split('\n');
    // Bullet list
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
    // Blockquote
    if (lines.every((l) => /^\s*>\s?/.test(l) || !l.trim())) {
      const bq = document.createElement('blockquote');
      const inner = lines.map((l) => l.replace(/^\s*>\s?/, '')).join('\n');
      renderInline(bq, inner);
      parent.appendChild(bq);
      continue;
    }
    // Paragraph
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

function appendUserMsg(text) {
  const node = document.createElement('div');
  node.className = 'msg user';
  node.textContent = text;
  const tsEl = document.createElement('span');
  tsEl.className = 'ts';
  tsEl.textContent = ts();
  node.appendChild(tsEl);
  chatEl.appendChild(node);
  chatEl.scrollTop = chatEl.scrollHeight;
}

function makePendingMentor() {
  const node = document.createElement('div');
  node.className = 'msg mentor';
  const spinner = document.createElement('span');
  spinner.className = 'spinner';
  node.appendChild(spinner);
  node.appendChild(document.createTextNode('思考中…(MiniMax-M2.7 reasoning，30-60s 常见)'));
  chatEl.appendChild(node);
  chatEl.scrollTop = chatEl.scrollHeight;
  return node;
}

function finalizeMentor(node, text, isError) {
  node.className = 'msg ' + (isError ? 'error' : 'mentor');
  if (isError) {
    node.textContent = text;
  } else {
    renderMarkdown(node, text);
  }
  const tsEl = document.createElement('span');
  tsEl.className = 'ts';
  tsEl.textContent = ts();
  node.appendChild(tsEl);
  chatEl.scrollTop = chatEl.scrollHeight;
}

async function send() {
  const text = inputEl.value.trim();
  if (!text) return;
  sendBtn.disabled = true;
  inputEl.value = '';
  appendUserMsg(text);
  const pending = makePendingMentor();
  const t0 = Date.now();
  try {
    const reply = await window.pace.askMentor({ text });
    const md = (reply && reply.markdown) || '(no reply)';
    finalizeMentor(pending, md, false);
    if (reply && reply.debug && reply.debug.elapsed_ms) {
      footerLatencyEl.textContent = `${(reply.debug.elapsed_ms / 1000).toFixed(1)}s`;
    } else {
      footerLatencyEl.textContent = `${((Date.now() - t0) / 1000).toFixed(1)}s`;
    }
    window.pace.log('panel', 'mentor_reply', {
      input_length: text.length,
      stage: reply && reply.debug && reply.debug.stage,
      elapsed_ms: reply && reply.debug && reply.debug.elapsed_ms,
    });
  } catch (err) {
    finalizeMentor(pending, `出错：${err && err.message ? err.message : String(err)}`, true);
    window.pace.log('panel', 'mentor_reply_error', { error: String(err) }, 'error');
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
    // Refresh sidebar (history list now has +1 entry, dirty count may have changed)
    refreshSidebar();
  }
}

sendBtn.addEventListener('click', send);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

refreshSidebarBtn.addEventListener('click', refreshSidebar);

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
        `✓ MiniMax 已配置 · key 来源 ${s.minimax_api_key_source === 'env' ? '环境变量' : 'config.json'} · model ${s.minimax_model}. ` +
        `粘贴新 key 会覆盖；留空保存保留现状。`;
    } else {
      settingsStatusEl.className = 'status-row warn';
      settingsStatusEl.textContent = '⚠ 还没设置 MiniMax API key — 配上后 mentor 才能回答。';
    }
  } catch (err) {
    settingsStatusEl.className = 'status-row warn';
    settingsStatusEl.textContent = `加载设置出错：${err.message}`;
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

openSettingsBtn.addEventListener('click', openModal);
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
      settingsStatusEl.textContent = `✓ 已保存到 ${s.config_path}`;
    } else {
      settingsStatusEl.className = 'status-row warn';
      settingsStatusEl.textContent = '⚠ 保存了但仍缺 API key — mentor 无法回答。';
    }
    minimaxApiKeyInput.value = '';
    refreshSidebar();
  } catch (err) {
    settingsStatusEl.className = 'status-row warn';
    settingsStatusEl.textContent = `保存出错：${err.message}`;
  } finally {
    saveSettingsBtn.disabled = false;
  }
});

// --- Boot ---

window.addEventListener('DOMContentLoaded', async () => {
  window.pace.log('panel', 'boot', { version: '0.1.0', theme: 'dark-cairn-style' });
  await refreshSidebar();
});
