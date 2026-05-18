#!/usr/bin/env node
/**
 * cdp-wait-reply — wait for the in-flight mentor reply to finish
 * (no .spinner in last .msg.mentor, text length > 50), then snapshot
 * sidebar dashboard + footer. Used after cdp-drive-chat misfires on
 * the pending spinner, or to inspect the current panel state.
 */

import { waitForTarget, connectToTarget } from './cdp-client.mjs';

const PORT = 9222;
const target = await waitForTarget(PORT, 'panel.html', 10_000);
const session = await connectToTarget(target);

console.log('==> waiting for current mentor reply (no spinner) …');
const reply = await session.waitFor(
  `(function(){
    const nodes = Array.from(document.querySelectorAll('.msg.mentor'));
    if (!nodes.length) return null;
    const last = nodes[nodes.length - 1];
    if (last.querySelector('.spinner')) return null;
    const txt = (last.textContent || '').trim();
    if (txt.length < 50) return null;
    return { text: txt.slice(0, 4000), len: txt.length };
  })()`,
  150_000
);
console.log('---- reply ----');
console.log(reply.text);
console.log(`(total chars: ${reply.len})`);

console.log('---- sidebar + footer snapshot ----');
const snap = await session.evaluate(`({
  cwd: document.getElementById('cwd-label').textContent,
  proj: {
    root:   document.getElementById('proj-root').textContent,
    branch: document.getElementById('proj-branch').textContent,
    remote: document.getElementById('proj-remote').textContent,
    dirty:  document.getElementById('proj-dirty').textContent,
    log_count: document.querySelectorAll('#proj-log li').length,
  },
  cc: {
    found: document.getElementById('cc-found').textContent,
    file:  document.getElementById('cc-file').textContent,
    mtime: document.getElementById('cc-mtime').textContent,
    turns: document.getElementById('cc-turns').textContent,
  },
  llm: {
    model:  document.getElementById('llm-model').textContent,
    host:   document.getElementById('llm-host').textContent,
    keysrc: document.getElementById('llm-keysrc').textContent,
  },
  footer: {
    status:  document.getElementById('footer-llm-status').textContent,
    latency: document.getElementById('footer-last-latency').textContent,
    model:   document.getElementById('footer-model').textContent,
    cfg:     document.getElementById('footer-config-path').textContent,
  },
  history_count: document.querySelectorAll('#history-list li').length,
})`, { awaitPromise: false });
console.log(JSON.stringify(snap, null, 2));

session.disconnect();
