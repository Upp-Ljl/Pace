'use strict';

/**
 * Pace panel — v0.1 chat UI + settings.
 *
 * Markdown rendering is XSS-safe: uses createTextNode / createElement
 * (never innerHTML for LLM-derived content). Supported subset:
 *   **bold**   `code`   > blockquote   - bullets   blank-line → paragraph
 */

const chatEl = document.getElementById('chat');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send');
const modalEl = document.getElementById('modal');
const openSettingsBtn = document.getElementById('open-settings');
const closeSettingsBtn = document.getElementById('close-settings');
const saveSettingsBtn = document.getElementById('save-settings');
const apiKeyInput = document.getElementById('api-key');
const llmModelSelect = document.getElementById('llm-model');
const knowledgeSourceSelect = document.getElementById('knowledge-source');
const settingsStatusEl = document.getElementById('settings-status');
const statusPillEl = document.getElementById('status-pill');

function ts() {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

// --- Markdown-lite renderer (XSS-safe DOM API) ---

function renderInline(parent, text) {
  // Tokenize **bold** + `code` + leave rest as text.
  const re = /(\*\*[^*\n]+?\*\*|`[^`\n]+?`)/g;
  let last = 0;
  let m;
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
    const lines = block.split('\n');
    // Bullet list?
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
    // Blockquote?
    if (lines.every((l) => /^\s*>\s?/.test(l) || !l.trim())) {
      const bq = document.createElement('blockquote');
      const inner = lines.map((l) => l.replace(/^\s*>\s?/, '')).join('\n');
      renderInline(bq, inner);
      parent.appendChild(bq);
      continue;
    }
    // Paragraph (with intra-paragraph newlines as <br>)
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

function appendMessage(kind, text) {
  const node = document.createElement('div');
  node.className = `msg ${kind}`;
  if (kind === 'mentor') {
    renderMarkdown(node, text);
  } else {
    node.textContent = text;
  }
  if (kind !== 'system') {
    const tsEl = document.createElement('span');
    tsEl.className = 'ts';
    tsEl.textContent = ts();
    node.appendChild(tsEl);
  }
  chatEl.appendChild(node);
  chatEl.scrollTop = chatEl.scrollHeight;
  return node;
}

function setPendingReply() {
  const node = document.createElement('div');
  node.className = 'msg mentor';
  node.textContent = '…思考中';
  chatEl.appendChild(node);
  chatEl.scrollTop = chatEl.scrollHeight;
  return node;
}

async function send() {
  const text = inputEl.value.trim();
  if (!text) return;

  sendBtn.disabled = true;
  inputEl.value = '';
  appendMessage('user', text);

  const pendingNode = setPendingReply();

  try {
    const reply = await window.pace.askMentor({ text });
    pendingNode.className = 'msg mentor';
    renderMarkdown(pendingNode, (reply && reply.markdown) || '(no reply)');
    const tsEl = document.createElement('span');
    tsEl.className = 'ts';
    tsEl.textContent = ts();
    pendingNode.appendChild(tsEl);
    window.pace.log('panel', 'mentor_reply_rendered', {
      input_length: text.length,
      stage: reply && reply.debug && reply.debug.stage,
      latency_ms: reply && reply.debug && reply.debug.elapsed_ms,
    });
  } catch (err) {
    pendingNode.className = 'msg error';
    pendingNode.textContent = `出错：${err && err.message ? err.message : String(err)}`;
    window.pace.log('panel', 'mentor_reply_error', { error: String(err) }, 'error');
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

sendBtn.addEventListener('click', send);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

// --- Settings modal ---

async function loadSettings() {
  try {
    const s = await window.pace.getSettings();
    llmModelSelect.value = s.llm_model || 'claude-sonnet-4-6';
    knowledgeSourceSelect.value = s.knowledge_source || 'pmp';
    apiKeyInput.value = ''; // never reveal stored key
    if (s.has_api_key) {
      settingsStatusEl.className = 'status-row ok';
      settingsStatusEl.textContent = `✓ API key 已配置（来源：${s.api_key_source === 'env' ? '环境变量' : 'config.json'}）。粘贴新 key 可覆盖；留空保存则保留现状。`;
    } else {
      settingsStatusEl.className = 'status-row warn';
      settingsStatusEl.textContent = '⚠ 还没设置 API key — 配上后 mentor 才能回答。';
    }
    statusPillEl.textContent = s.has_api_key ? 'v0.1 · key OK' : 'v0.1 · 未配 key';
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
      llm_model: llmModelSelect.value,
      knowledge_source: knowledgeSourceSelect.value,
    };
    const newKey = apiKeyInput.value.trim();
    if (newKey) patch.anthropic_api_key = newKey;
    const s = await window.pace.saveSettings(patch);
    if (s && s.has_api_key) {
      settingsStatusEl.className = 'status-row ok';
      settingsStatusEl.textContent = `✓ 已保存到 ${s.config_path}`;
      statusPillEl.textContent = 'v0.1 · key OK';
    } else {
      settingsStatusEl.className = 'status-row warn';
      settingsStatusEl.textContent = '⚠ 保存了但仍无 API key — mentor 无法回答。';
    }
    apiKeyInput.value = '';
  } catch (err) {
    settingsStatusEl.className = 'status-row warn';
    settingsStatusEl.textContent = `保存出错：${err.message}`;
  } finally {
    saveSettingsBtn.disabled = false;
  }
});

// --- Boot ---

window.addEventListener('DOMContentLoaded', async () => {
  window.pace.log('panel', 'boot', { version: '0.1.0' });
  // First-launch hint: if no API key, suggest opening settings.
  try {
    const s = await window.pace.getSettings();
    statusPillEl.textContent = s.has_api_key ? 'v0.1 · key OK' : 'v0.1 · 未配 key';
    if (!s.has_api_key) {
      const hint = document.createElement('div');
      hint.className = 'msg system';
      hint.textContent = '提示：还没配 LLM key。点右上角 ⚙ 设置一下，然后就能开始问。';
      chatEl.appendChild(hint);
    }
  } catch (_e) {}
});
