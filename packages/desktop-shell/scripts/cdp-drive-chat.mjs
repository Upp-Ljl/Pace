#!/usr/bin/env node
/**
 * cdp-drive-chat — verify Pace via CDP after it's already launched
 * (npm run start ... --remote-debugging-port=9222).
 *
 * 1. Connect to the panel page
 * 2. Read settings via window.pace.getSettings() — verify env-vars picked up
 * 3. Read status pill + initial chat DOM
 * 4. (optional) drive a real chat: type a question, click send,
 *    wait for mentor reply to render, print result
 *
 * Usage:
 *   node scripts/cdp-drive-chat.mjs                 # probe only
 *   node scripts/cdp-drive-chat.mjs "我现在在干啥"   # probe + chat
 */

import { waitForTarget, connectToTarget } from './cdp-client.mjs';

const PORT = 9222;
const question = process.argv[2] || null;

console.log(`==> connecting to CDP on :${PORT}…`);
const target = await waitForTarget(PORT, 'panel.html', 10_000);
console.log(`==> target: ${target.title} (${target.id.slice(0, 12)}…)`);

const session = await connectToTarget(target);
console.log('==> CDP session ready');

// 1. window.pace bridge present?
const apiKeys = await session.evaluate(
  'window.pace ? Object.keys(window.pace).sort() : null',
  { awaitPromise: false }
);
console.log(`---- window.pace api keys ----\n${JSON.stringify(apiKeys)}`);

// 2. settings (verify env vars made it through)
const settings = await session.evaluate('window.pace.getSettings()');
console.log('---- settings ----');
console.log(JSON.stringify(settings, null, 2));

// 3. status pill text
const pill = await session.querySelectorText('#status-pill');
console.log(`---- status pill: "${pill}" ----`);

if (!question) {
  console.log('\n(no question arg, probe complete — exit)');
  session.disconnect();
  process.exit(0);
}

// 4. Drive chat
console.log(`---- driving chat: ${JSON.stringify(question)} ----`);
await session.fillTextarea('#input', question);
await session.clickSelector('#send');
console.log('==> waiting for mentor reply (max 120s)…');

// Wait until a .msg.mentor element appears that is NOT the "…思考中" placeholder.
const reply = await session.waitFor(
  `(function(){
    const nodes = Array.from(document.querySelectorAll('.msg.mentor'));
    if (!nodes.length) return null;
    const last = nodes[nodes.length - 1];
    // Spinner present → still pending
    if (last.querySelector('.spinner')) return null;
    const txt = (last.textContent || '').trim();
    if (txt.length < 50) return null;
    return { text: txt.slice(0, 4000), len: txt.length };
  })()`,
  150_000
);

console.log('---- mentor reply text ----');
console.log(reply.text);
console.log(`---- total chars: ${reply.len} ----`);

// console errors collected during the run
if (session.consoleErrors.length) {
  console.log('---- console errors ----');
  console.log(JSON.stringify(session.consoleErrors, null, 2));
}

session.disconnect();
console.log('==> done');
