'use strict';
/**
 * Seed Pace demo team for video / landing screenshots.
 *
 * Inserts 3 virtual colleagues into team_members for project_id =
 * D:\lll\pace. Idempotent: clears any existing demo seed (by exact
 * name match) before re-inserting, so repeated runs converge to the
 * same state.
 *
 * Names + roles + RACI + notes + agent_id are wired to align with
 * `docs/demo-script.md` (Wow 3 — 同事视角对话) and
 * `docs/landing-wireframe.md` (屏 4 — 3 wow moment carousel #3).
 *
 * Run:
 *   node packages/desktop-shell/seed-demo-data.cjs
 *
 * Pass --clear to remove the seed without re-inserting.
 */

const path = require('path');
const db = require('./db.cjs');

const PROJECT_ID = path.normalize('D:\\lll\\pace');

const SEED = [
  {
    name:     '晓婷',
    role:     'PM',
    raci:     ['A'],
    notes:    '沟通偏好：先文字后会议。决策类用 飞书 doc 同步，对齐类拉会。每周二上午对 backlog。',
    agent_id: 'xiaoting-agent',
  },
  {
    name:     'Tom',
    role:     'Eng',
    raci:     ['R'],
    notes:    'IPC / cc 集成主负责。偏好直接看 diff 而非 PR 描述。code review 一般 4h 内回。',
    agent_id: 'tom-cc-session-3a2f',
  },
  {
    name:     '阿珍',
    role:     'Designer',
    raci:     ['C'],
    notes:    '周二有设计评审，避开当天临时插活。UI 改动同步给 ta 看一眼免 spec drift。',
    agent_id: 'azhen-agent',
  },
];

function clearExisting() {
  const existing = db.listTeamMembers(PROJECT_ID);
  const seedNames = new Set(SEED.map((m) => m.name));
  let removed = 0;
  for (const m of existing) {
    if (seedNames.has(m.name)) {
      db.deleteTeamMember(m.id);
      removed++;
    }
  }
  return removed;
}

function main() {
  const args = new Set(process.argv.slice(2));
  const clearOnly = args.has('--clear');

  const removed = clearExisting();
  console.log(`cleared ${removed} existing seed row(s) for project_id=${PROJECT_ID}`);

  if (clearOnly) {
    console.log('--clear flag set; not inserting. Done.');
    return;
  }

  const inserted = [];
  for (const m of SEED) {
    const id = db.addTeamMember({
      project_id: PROJECT_ID,
      name:       m.name,
      role:       m.role,
      raci:       m.raci,
      notes:      m.notes,
      agent_id:   m.agent_id,
    });
    inserted.push({ id, name: m.name, role: m.role, raci: m.raci.join(''), agent_id: m.agent_id });
  }
  console.log(`inserted ${inserted.length} member(s):`);
  for (const r of inserted) {
    console.log(`  #${r.id}  ${r.name.padEnd(6)} · ${r.role.padEnd(10)} · ${r.raci} · ${r.agent_id}`);
  }

  // Sanity read-back
  const after = db.listTeamMembers(PROJECT_ID);
  const demoRows = after.filter((m) => SEED.some((s) => s.name === m.name));
  console.log(`\nread-back: ${demoRows.length}/${SEED.length} demo rows present in DB`);
  if (demoRows.length !== SEED.length) {
    console.error('SEED FAILED: read-back count mismatch');
    process.exit(1);
  }
  console.log('OK');
}

main();
