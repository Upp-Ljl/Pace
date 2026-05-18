#!/usr/bin/env node
/**
 * smoke-mentor-pipeline — exercise mentor-pipeline.runMentorTurn().
 *
 * Pure-Node invocation (not via Electron). db.cjs's better-sqlite3 is
 * Electron-rebuilt (NODE_MODULE_VERSION 128), so loading from Node 24
 * (NODE_MODULE_VERSION 137) will trigger the loader's graceful-fallback
 * branch (Database = null). mentor-pipeline tolerates this — DB persist
 * lives inside a best-effort try/catch — so the reply path still runs.
 *
 * Two scenarios:
 *   1. No ANTHROPIC_API_KEY: pipeline returns the "set key" markdown.
 *      Verifies config.cjs + the no-key branch.
 *   2. Real key in env: actually calls Anthropic. Out-of-scope here
 *      unless user explicitly sets ANTHROPIC_API_KEY before invoking.
 *
 * Verifies:
 *   - mentor-pipeline.cjs requires resolve cleanly
 *   - cc-bridge runs from inside the pipeline (NOT called on no-key
 *     branch — that returns early; so this smoke does NOT verify
 *     cc-bridge wiring inside pipeline. Use smoke-cc-bridge for that)
 *   - reply shape is { turn_id, markdown, debug }
 *   - debug.stage matches expected branch
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const pipeline = require(path.join(__dirname, '..', 'mentor-pipeline.cjs'));

const projectRoot = path.resolve(__dirname, '..', '..', '..');
const hasKey = !!(process.env.MINIMAX_API_KEY && process.env.MINIMAX_API_KEY.trim());

console.log(`==> smoke-mentor-pipeline: cwd=${projectRoot}, MINIMAX_API_KEY_in_env=${hasKey}`);

const t0 = Date.now();
const reply = await pipeline.runMentorTurn('我现在在干啥？', { cwd: projectRoot });
const elapsed = Date.now() - t0;

console.log('---- reply shape ----');
console.log(`turn_id: ${reply.turn_id || '(none)'}`);
console.log(`debug:   ${JSON.stringify(reply.debug)}`);
console.log('---- markdown ----');
console.log(reply.markdown);
console.log(`---- elapsed ${elapsed}ms ----`);

let pass = true;
const failures = [];
if (!reply || typeof reply.markdown !== 'string') {
  failures.push('reply.markdown is not a string');
  pass = false;
}
if (!reply.debug || typeof reply.debug.stage !== 'string') {
  failures.push('reply.debug.stage missing');
  pass = false;
}
const expected = hasKey ? ['ok', 'llm_error'] : ['no_provider'];
if (!expected.includes(reply.debug && reply.debug.stage)) {
  failures.push(`debug.stage="${reply.debug.stage}" not in expected ${JSON.stringify(expected)}`);
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
