#!/usr/bin/env node
/**
 * smoke-cc-bridge — exercise cc-bridge.collect() in current cwd.
 *
 * Verifies:
 *   Tier 1 (git):       remote URL / branch / git_root / recent log
 *   Tier 2 (cc session): finds most-recent cc session matching cwd
 *   Tier 3 (transcript): reads last N user/assistant text messages
 *
 * Pass criteria:
 *   - Tier 1 git.available === true when run inside a git repo
 *   - elapsed_ms < 2000 (lazy reader must stay snappy)
 *   - No crash. Tier 2/3 may legitimately be empty if cc never ran here.
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const ccBridge = require(path.join(__dirname, '..', 'cc-bridge.cjs'));

const targetCwd = process.argv[2] || path.resolve(__dirname, '..', '..', '..');

console.log(`==> smoke-cc-bridge: cwd=${targetCwd}`);

const t0 = Date.now();
const ctx = ccBridge.collect({
  cwd: targetCwd,
  includeTranscript: true,
  transcriptN: 5,
});
const elapsed = Date.now() - t0;

console.log('---- git (Tier 1) ----');
console.log(JSON.stringify(ctx.git, null, 2));
console.log('---- cc_session (Tier 2) ----');
console.log(JSON.stringify(ctx.cc_session, null, 2));
console.log('---- transcript count (Tier 3) ----');
console.log(`transcript messages: ${ctx.transcript.length}`);
if (ctx.transcript.length > 0) {
  console.log('first message role+preview:');
  const m = ctx.transcript[0];
  console.log(`  [${m.role}] ${m.text.slice(0, 120).replace(/\n/g, ' ')}…`);
  console.log('last message role+preview:');
  const last = ctx.transcript[ctx.transcript.length - 1];
  console.log(`  [${last.role}] ${last.text.slice(0, 120).replace(/\n/g, ' ')}…`);
}
console.log('---- _meta ----');
console.log(JSON.stringify(ctx._meta, null, 2));
console.log(`wall-clock: ${elapsed}ms`);

let pass = true;
const failures = [];
if (!ctx.git.available) {
  failures.push('git not available — cwd may not be a git repo');
  pass = false;
}
if (elapsed > 2000) {
  failures.push(`elapsed_ms ${elapsed} > 2000ms (Tier 1+2+3 too slow)`);
  pass = false;
}
if (ctx._meta.tier1 !== true) {
  failures.push('Tier 1 (git) did not run');
  pass = false;
}

console.log('---- verdict ----');
if (pass) {
  console.log('PASS');
  process.exit(0);
} else {
  console.error('FAIL:');
  failures.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
