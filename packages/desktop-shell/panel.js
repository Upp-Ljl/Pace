'use strict';

/**
 * Pace panel — v0.1 minimal chat UI.
 * Sends user input to main via window.pace.askMentor(), renders reply.
 * Markdown rendering deferred to v0.2 (v0.1 = plain text with line breaks).
 */

const chatEl = document.getElementById('chat');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send');

function ts() {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function appendMessage(kind, text) {
  const node = document.createElement('div');
  node.className = `msg ${kind}`;
  node.textContent = text;
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

async function send() {
  const text = inputEl.value.trim();
  if (!text) return;

  sendBtn.disabled = true;
  inputEl.value = '';
  appendMessage('user', text);

  const pendingNode = appendMessage('mentor', '…思考中');

  try {
    const reply = await window.pace.askMentor({ text });
    pendingNode.textContent = (reply && reply.markdown) || '(no reply)';
    const tsEl = document.createElement('span');
    tsEl.className = 'ts';
    tsEl.textContent = ts();
    pendingNode.appendChild(tsEl);
    window.pace.log('panel', 'mentor_reply_rendered', { input_length: text.length });
  } catch (err) {
    pendingNode.textContent = `(出错了：${err && err.message ? err.message : String(err)})`;
    window.pace.log('panel', 'mentor_reply_error', { error: String(err) }, 'error');
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

sendBtn.addEventListener('click', send);
inputEl.addEventListener('keydown', (e) => {
  // Enter to send; Shift+Enter for newline
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  window.pace.log('panel', 'boot', { version: '0.1.0' });
});
