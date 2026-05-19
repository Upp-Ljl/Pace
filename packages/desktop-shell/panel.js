'use strict';

/**
 * Pace panel — feed-first ambient panel.
 *
 * Tabs: 现在 (Now feed) / 团队 (Team stub) / 身份 (Identities stub) / 问问 (Ask)
 *
 * 现在 = a list of observation cards generated deterministically from the
 * context snapshot. Each card optionally has a "想看建议 →" affordance that
 * feeds a seed prompt into the mentor pipeline; the resulting markdown is
 * rendered inline below the card title.
 *
 * Tone: observational, factual. Cards never start with "建议你..." or
 * "你应该..." — that pressure is reserved for the mentor reply, and even
 * there we ask the model to keep it 淡淡的.
 */

// --- DOM ---
const headerMetaEl = document.getElementById('meta');
const tabsEl       = document.getElementById('tabs');
const nowView      = document.getElementById('view-now');
const cardsSection = document.getElementById('cards-section');
const commitListEl = document.getElementById('commit-list');
const commitPaneMetaEl = document.getElementById('commit-pane-meta');
const commitDigestEl = document.getElementById('commit-digest');
const commitToggleBtn = document.getElementById('commit-toggle');

const footerStatus = document.getElementById('footer-status');
const footerLastLatency = document.getElementById('footer-last-latency');
const footerLlmDot = document.getElementById('footer-llm-dot');
const teamView     = document.getElementById('view-team');
const askView      = document.getElementById('view-ask');
const askHistoryEl = document.getElementById('ask-history');
const inputBarEl   = document.getElementById('input-bar');
const inputEl      = document.getElementById('input');
const sendBtn      = document.getElementById('send');
const nowCountEl   = document.getElementById('now-count');

const settingsBtn  = document.getElementById('open-settings');
const pinBtn       = document.getElementById('toggle-pin');
const closeBtn     = document.getElementById('close-window');

const modalEl              = document.getElementById('modal');
const closeSettingsBtn     = document.getElementById('close-settings');
const saveSettingsBtn      = document.getElementById('save-settings');
const settingsStatusEl     = document.getElementById('settings-status');
const minimaxBaseUrlInput  = document.getElementById('minimax-base-url');
const minimaxApiKeyInput   = document.getElementById('minimax-api-key');
const minimaxModelInput    = document.getElementById('minimax-model');

const segTheme       = document.getElementById('seg-theme');
const segFontSize    = document.getElementById('seg-font-size');
const segPanelWidth  = document.getElementById('seg-panel-width');

const asMemberBanner = document.getElementById('as-member-banner');
const asMemberName   = document.getElementById('as-member-name');
const clearAsMemberBtn = document.getElementById('clear-as-member');

// active member persona for Ask tab (null = normal mentor)
let activeAsMember = null;
// multi-turn conversation history for the Ask tab (current session)
let askConversation = [];

// --- i18n ---
let STRINGS = {};
let LANG = 'zh-CN';
function t(key, params) {
  let raw = STRINGS[key];
  if (raw == null) raw = key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (m, k) => (params[k] != null ? String(params[k]) : m));
}
function applyI18nToDom(root) {
  (root || document).querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  (root || document).querySelectorAll('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  (root || document).querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  (root || document).querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}

// Team
const teamListEl       = document.getElementById('team-list');
const teamEmptyEl      = document.getElementById('team-empty');
const teamCountEl      = document.getElementById('team-count');
const teamAddBtn       = document.getElementById('team-add-btn');

// Member modal
const memberModalEl    = document.getElementById('member-modal');
const memberModalTitle = document.getElementById('member-modal-title');
const memberIdInput    = document.getElementById('member-id');
const memberNameInput  = document.getElementById('member-name');
const memberRoleSelect = document.getElementById('member-role');
const memberNotesInput = document.getElementById('member-notes');
const memberAgentInput = document.getElementById('member-agent');
const memberSaveBtn    = document.getElementById('member-save-btn');
const memberCancelBtn  = document.getElementById('member-cancel-btn');
const memberDeleteBtn  = document.getElementById('member-delete-btn');
const raciChecks       = document.querySelectorAll('.raci-check');

const VIEWS = {
  now: nowView,
  team: teamView,
  ask: askView,
};

// Dismissed cards persist for this session only (id-based)
const dismissed = new Set();

// --- helpers ---
function tsLabel() { return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }); }
function truncate(s, n) { return s && s.length > n ? s.slice(0, n) + '…' : (s || '—'); }
function timeAgo(ms) {
  if (!ms) return '—';
  const dt = Date.now() - ms;
  if (dt < 60_000) return Math.floor(dt / 1000) + ' 秒前';
  if (dt < 3600_000) return Math.floor(dt / 60_000) + ' 分钟前';
  if (dt < 86400_000) return Math.floor(dt / 3600_000) + ' 小时前';
  return Math.floor(dt / 86400_000) + ' 天前';
}

// --- Tab switching ---
function switchTab(name) {
  document.querySelectorAll('.tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.tab === name);
  });
  for (const k of Object.keys(VIEWS)) VIEWS[k].hidden = (k !== name);
  // Input bar visible only in Ask tab
  inputBarEl.hidden = (name !== 'ask');
  if (name === 'ask') setTimeout(() => inputEl.focus(), 0);
}
tabsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.tab');
  if (btn && btn.dataset.tab) switchTab(btn.dataset.tab);
});

// --- Window controls ---
closeBtn.addEventListener('click', () => window.pace.hideWindow());
pinBtn.addEventListener('click', async () => {
  const pinned = await window.pace.togglePin();
  pinBtn.classList.toggle('active', pinned);
});
settingsBtn.addEventListener('click', () => openModal());

// --- Build header meta line (thin gray) ---
function buildMetaLine(ctx, settings) {
  const parts = [];
  if (ctx.git && ctx.git.available) {
    const root = (ctx.git.git_root || '').split(/[\\/]/).pop() || ctx.git.git_root;
    parts.push(root);
    if (ctx.git.git_branch) parts.push(ctx.git.git_branch);
    const dirty = ctx.git.dirty_count || 0;
    if (dirty > 0) parts.push(dirty + ' ' + t('meta.dirty'));
    else parts.push(t('meta.clean'));
  }
  parts.push(settings.has_minimax_config ? settings.minimax_model.replace(/^MiniMax-/, '') : t('meta.no_key'));
  return parts.join(' · ');
}

// --- Card generators ---

function detectCommitTheme(commits) {
  if (!commits || !commits.length) return null;
  const text = commits.map((c) => (c || '').toLowerCase()).join(' ');
  const themes = [
    { re: /\b(ui|panel|chat|card|html|css|style|theme|render)\b/, label: 'UI / 前端' },
    { re: /\b(refactor|cleanup|simplif|rewrite|reorg)\b/,         label: '重构 / 整理' },
    { re: /\b(test|spec|smoke|fix|bug|hotfix)\b/,                  label: '测试 / 修 bug' },
    { re: /\b(doc|readme|comment|architecture|product)\b/,         label: '文档 / 设计' },
    { re: /\b(feat|add|new)\b/,                                    label: '加新功能' },
    { re: /\b(api|endpoint|backend|server)\b/,                     label: '后端 / API' },
    { re: /\b(deploy|release|version|ship|build)\b/,               label: '发布相关' },
  ];
  for (const t of themes) if (t.re.test(text)) return t.label;
  return null;
}

function teamSummary(team) {
  if (!team || !team.length) return null;
  return team.map((m) => {
    const raci = (m.raci || []).join('');
    const agent = m.agent_id ? (LANG === 'en' ? ` 〈agent: ${m.agent_id}〉` : ` 〈agent: ${m.agent_id}〉`) : '';
    return `${m.name}${m.role ? '/' + m.role : ''}${raci ? '(' + raci + ')' : ''}${agent}`;
  }).join(', ');
}

function generateCards(snapshot) {
  const { ctx, settings, recent_history, team } = snapshot;
  const cards = [];
  const teamLine = teamSummary(team);

  // Card 0: API key missing — high priority
  if (!settings.has_minimax_config) {
    cards.push({
      id: 'no-key',
      icon: '⚙',
      title: t('card.no_key.title'),
      sub: t('card.no_key.sub'),
      seed: null,
      priority: 0,
    });
  }

  // Card: empty team prompt
  if (ctx.git && ctx.git.available && (!team || team.length === 0)) {
    cards.push({
      id: 'no-team',
      icon: '👥',
      title: t('card.no_team.title'),
      sub: t('card.no_team.sub'),
      seed: null,
      priority: 6,
    });
  }

  if (ctx.git && ctx.git.available) {
    const dirty = ctx.git.dirty_count || 0;
    if (dirty > 0) {
      cards.push({
        id: 'git-dirty',
        icon: '📂',
        title: t('card.git_dirty.title', { n: dirty }),
        sub: t('card.git_dirty.sub'),
        seed: `用户当前在 ${ctx.git.git_root} 项目的 ${ctx.git.git_branch} 分支上，有 ${dirty} 个文件未提交。最近的 commit 主题是：${(ctx.git.recent_log || []).slice(0, 3).join(' / ')}。${teamLine ? '团队：' + teamLine + '。' : ''}从 PMP 角度淡淡观察一下这个状态，并给一两个轻量下一步提示。${teamLine ? '如果合适，可以具体说找哪位同事对齐。' : ''}请用观察语气，不要说教，80 字内。`,
        priority: 1,
      });
    }

    // Card: on main branch
    if (ctx.git.git_branch === 'main' || ctx.git.git_branch === 'master') {
      cards.push({
        id: 'on-main',
        icon: '🌿',
        title: t('card.on_main.title', { branch: ctx.git.git_branch }),
        sub: t('card.on_main.sub'),
        seed: `用户没有切 feature 分支，直接在 ${ctx.git.git_branch} 上做改动。${teamLine ? '团队：' + teamLine + '。' : ''}这个工作流的潜在风险是什么？请用淡淡观察的语气，80 字内，给一两条提示。`,
        priority: 2,
      });
    }

    // Card: commit theme pattern
    const theme = detectCommitTheme(ctx.git.recent_log);
    if (theme) {
      cards.push({
        id: 'commit-theme',
        icon: '📝',
        title: t('card.commit_theme.title', { n: (ctx.git.recent_log || []).length, theme }),
        sub: t('card.commit_theme.sub'),
        seed: `用户最近 5 个 commit 都是"${theme}"主题。${teamLine ? '团队：' + teamLine + '。' : ''}从 PMBOK 5 大过程组看，这通常处在哪个阶段？阶段过渡前还需要做什么？${teamLine ? '哪位同事最该被 loop 进来？' : ''}请用淡淡观察的语气，80 字内。`,
        priority: 3,
      });
    }
  }

  // Card: upstream gap — ahead
  if (ctx.git && ctx.git.available && typeof ctx.git.ahead === 'number' && ctx.git.ahead > 0) {
    cards.push({
      id: 'ahead-of-origin',
      icon: '↗',
      title: t('card.ahead.title', { branch: ctx.git.git_branch, n: ctx.git.ahead }),
      sub: t('card.ahead.sub'),
      seed: `用户本地有 ${ctx.git.ahead} 个 commit 没 push 到 origin。${teamLine ? '团队：' + teamLine + '。' : ''}从协作风险角度，淡淡观察一下这个状态。80 字内。`,
      priority: 1,
    });
  }
  if (ctx.git && ctx.git.available && typeof ctx.git.behind === 'number' && ctx.git.behind > 0) {
    cards.push({
      id: 'behind-origin',
      icon: '↘',
      title: t('card.behind.title', { branch: ctx.git.git_branch, n: ctx.git.behind }),
      sub: t('card.behind.sub'),
      seed: `用户本地落后远端 ${ctx.git.behind} 个 commit 没 pull。${teamLine ? '团队：' + teamLine + '。' : ''}观察一下风险，80 字内。`,
      priority: 0,
    });
  }

  if (ctx.git && ctx.git.available && ctx.git.commits && ctx.git.commits.length) {
    const lastTs = ctx.git.commits[0].ts;
    if (lastTs) {
      const ageMs = Date.now() - lastTs;
      if (ageMs > 2 * 3600_000 && ctx.git.dirty_count > 0) {
        cards.push({
          id: 'long-since-commit',
          icon: '⏳',
          title: t('card.long_since.title', { ago: timeAgo(lastTs) }),
          sub: t('card.long_since.sub', { n: ctx.git.dirty_count }),
          seed: `用户上次 commit 是 ${timeAgo(lastTs)}，工作区还堆着 ${ctx.git.dirty_count} 个未提交改动。${teamLine ? '团队：' + teamLine + '。' : ''}从工作节奏角度，淡淡说几句风险和下一步。80 字内。`,
          priority: 2,
        });
      }
    }
  }

  if (ctx.git && ctx.git.available && ctx.git.changed_files) {
    const pkgTouched = ctx.git.changed_files.some((f) => /(^|[\\/])package\.json$/.test(f.path));
    if (pkgTouched) {
      cards.push({
        id: 'pkg-json-touched',
        icon: '📦',
        title: t('card.pkg_json.title'),
        sub: t('card.pkg_json.sub'),
        seed: null,
        priority: 4,
      });
    }
    const codeChanged = ctx.git.changed_files.some((f) => /\.(c?js|mjs|ts|tsx|jsx|cjs|py|go|rs|java|html|css|cjs)$/i.test(f.path));
    const docsChanged = ctx.git.changed_files.some((f) => /(README|CHANGELOG|docs[\\/])/i.test(f.path));
    if (codeChanged && !docsChanged && ctx.git.dirty_count >= 3) {
      cards.push({
        id: 'docs-untouched',
        icon: '📖',
        title: t('card.docs.title'),
        sub: t('card.docs.sub'),
        seed: `用户改了 ${ctx.git.dirty_count} 个代码文件，但 README / CHANGELOG / docs 都没碰。${teamLine ? '团队：' + teamLine + '。' : ''}从 PMP "质量管理" 或 "沟通管理" 视角，淡淡观察这个状态——什么时候该同步文档？80 字内。`,
        priority: 5,
      });
    }
    const testsChanged = ctx.git.changed_files.some((f) => /(\.test\.|\.spec\.|__tests__[\\/]|scripts[\\/]smoke-|tests?[\\/])/i.test(f.path));
    if (codeChanged && !testsChanged && ctx.git.dirty_count >= 4) {
      cards.push({
        id: 'tests-untouched',
        icon: '🧪',
        title: t('card.tests.title'),
        sub: t('card.tests.sub', { n: ctx.git.dirty_count }),
        seed: `用户改了 ${ctx.git.dirty_count} 个代码文件但测试 / smoke 都没动。${teamLine ? '团队：' + teamLine + '。' : ''}从质量管理角度，淡淡观察。80 字内。`,
        priority: 5,
      });
    }
  }

  if (ctx.git && ctx.git.available && ctx.git.commits && ctx.git.commits.length >= 5) {
    const themeCounts = {};
    for (const c of ctx.git.commits.slice(0, 8)) {
      const m = /^(feat|fix|docs|test|refactor|chore|style|ui|config|perf|wire|pivot|import)/i.exec(c.subject || '');
      if (m) {
        const k = m[1].toLowerCase();
        themeCounts[k] = (themeCounts[k] || 0) + 1;
      }
    }
    const themeKeys = Object.keys(themeCounts);
    if (themeKeys.length >= 4) {
      cards.push({
        id: 'scope-drift',
        icon: '🌀',
        title: t('card.scope_drift.title'),
        sub: themeKeys.slice(0, 5).join(' · '),
        seed: `用户最近 8 个 commit 主题分散：${themeKeys.join(', ')}。${teamLine ? '团队：' + teamLine + '。' : ''}从 PMP 范围管理角度看，这是 scope creep 还是合理的多线并进？淡淡观察，80 字内。`,
        priority: 6,
      });
    }
  }

  if (ctx.cc_session) {
    cards.push({
      id: 'cc-activity',
      icon: '💬',
      title: t('card.cc_activity.title', { ago: timeAgo(ctx.cc_session.last_mtime_ms) }),
      sub: t('card.cc_activity.sub'),
      seed: `用户刚和 Claude Code 协作，上次 cc session 活动 ${timeAgo(ctx.cc_session.last_mtime_ms)}。${teamLine ? '团队：' + teamLine + '。' : ''}从 PMP 视角，刚结束一段密集协作后，建议的"复盘 / 校准"动作是什么？请用淡淡观察的语气，80 字内。`,
      priority: 4,
    });
  } else if (ctx.git && ctx.git.available) {
    cards.push({
      id: 'cc-quiet',
      icon: '🤫',
      title: t('card.cc_quiet.title'),
      sub: t('card.cc_quiet.sub'),
      seed: null,
      priority: 9,
    });
  }

  if (!recent_history || recent_history.length === 0) {
    cards.push({
      id: 'mentor-quiet',
      icon: '💭',
      title: t('card.mentor_quiet.title'),
      sub: t('card.mentor_quiet.sub'),
      seed: null,
      priority: 8,
    });
  } else {
    const lastTs = recent_history[0] && recent_history[0].created_at;
    if (lastTs) {
      const ageMs = Date.now() - new Date(lastTs).getTime();
      if (ageMs > 30 * 60_000) {
        cards.push({
          id: 'mentor-stale',
          icon: '⏱',
          title: t('card.mentor_stale.title', { ago: timeAgo(new Date(lastTs).getTime()) }),
          sub: t('card.mentor_stale.sub'),
          seed: null,
          priority: 7,
        });
      }
    }
  }

  return cards
    .filter((c) => !dismissed.has(c.id))
    .sort((a, b) => (a.priority || 99) - (b.priority || 99));
}

// --- Commit pane (collapsible, PMP-flavored digest + tags) ---

const PMP_TAGS = {
  feat:     { pg: 'Exec',    pgZh: '执行', ka: 'Scope',       kaZh: '范围',   label: '加新功能' },
  add:      { pg: 'Exec',    pgZh: '执行', ka: 'Scope',       kaZh: '范围',   label: '增量' },
  fix:      { pg: 'Exec',    pgZh: '执行', ka: 'Quality',     kaZh: '质量',   label: '修缺陷' },
  bugfix:   { pg: 'Exec',    pgZh: '执行', ka: 'Quality',     kaZh: '质量',   label: '修缺陷' },
  hotfix:   { pg: 'Exec',    pgZh: '执行', ka: 'Risk',        kaZh: '风险',   label: '紧急修复' },
  refactor: { pg: 'Exec',    pgZh: '执行', ka: 'Integration', kaZh: '整合',   label: '重构' },
  cleanup:  { pg: 'Exec',    pgZh: '执行', ka: 'Integration', kaZh: '整合',   label: '清理' },
  chore:    { pg: 'Exec',    pgZh: '执行', ka: 'Integration', kaZh: '整合',   label: '日常' },
  docs:     { pg: 'Exec',    pgZh: '执行', ka: 'Comms',       kaZh: '沟通',   label: '文档' },
  test:     { pg: 'Monitor', pgZh: '监控', ka: 'Quality',     kaZh: '质量',   label: '测试' },
  ui:       { pg: 'Exec',    pgZh: '执行', ka: 'Scope',       kaZh: '范围',   label: 'UI 迭代' },
  config:   { pg: 'Plan',    pgZh: '规划', ka: 'Integration', kaZh: '整合',   label: '配置' },
  pivot:    { pg: 'Plan',    pgZh: '规划', ka: 'Integration', kaZh: '整合',   label: '转向' },
  wire:     { pg: 'Exec',    pgZh: '执行', ka: 'Integration', kaZh: '整合',   label: '集成' },
  import:   { pg: 'Plan',    pgZh: '规划', ka: 'Integration', kaZh: '整合',   label: '引入' },
  perf:     { pg: 'Monitor', pgZh: '监控', ka: 'Quality',     kaZh: '质量',   label: '性能' },
  style:    { pg: 'Exec',    pgZh: '执行', ka: 'Quality',     kaZh: '质量',   label: '风格' },
  release:  { pg: 'Closing', pgZh: '收尾', ka: 'Integration', kaZh: '整合',   label: '发布' },
  init:     { pg: 'Init',    pgZh: '启动', ka: 'Integration', kaZh: '整合',   label: '初始化' },
  build:    { pg: 'Exec',    pgZh: '执行', ka: 'Integration', kaZh: '整合',   label: '构建' },
  deploy:   { pg: 'Closing', pgZh: '收尾', ka: 'Integration', kaZh: '整合',   label: '部署' },
};

function tagCommit(subject) {
  if (!subject) return null;
  const m = /^([a-z]+)[:\s(]/i.exec(subject);
  if (m) {
    const tag = PMP_TAGS[m[1].toLowerCase()];
    if (tag) return tag;
  }
  return null;
}

function buildCommitDigest(commits) {
  if (!commits || commits.length === 0) return null;
  const visible = commits.slice(0, 8);
  const pgCount = {};
  const kaCount = {};
  const pgZhMap = {};
  const kaZhMap = {};
  let totalTagged = 0;
  for (const c of visible) {
    const t = tagCommit(c.subject);
    if (!t) continue;
    totalTagged++;
    pgCount[t.pg] = (pgCount[t.pg] || 0) + 1;
    kaCount[t.ka] = (kaCount[t.ka] || 0) + 1;
    pgZhMap[t.pg] = t.pgZh;
    kaZhMap[t.ka] = t.kaZh;
  }
  if (totalTagged === 0) return null;
  const dominantPg = Object.keys(pgCount).sort((a, b) => pgCount[b] - pgCount[a])[0];
  const dominantKa = Object.keys(kaCount).sort((a, b) => kaCount[b] - kaCount[a])[0];

  // Compute span (oldest tracked vs newest)
  const tsOldest = visible[visible.length - 1].ts;
  const tsNewest = visible[0].ts;
  const spanMs = tsOldest && tsNewest ? (tsNewest - tsOldest) : 0;
  const spanLabel = spanMs > 0 ? humanizeSpan(spanMs) : '';

  const moodLines = [];
  // PMP mood
  const distinct = Object.keys(pgCount).length;
  if (distinct === 1) {
    moodLines.push(`节奏专注：${pgCount[dominantPg]}/${visible.length} 都在 ${pgZhMap[dominantPg]} 阶段。`);
  } else if (distinct >= 3) {
    moodLines.push(`多线并进：${Object.entries(pgCount).map(([k,v]) => `${pgZhMap[k]}×${v}`).join(' / ')}——注意 scope 是否在收口。`);
  }

  return {
    primary: `最近 ${visible.length} 个 commit 多落在 <strong>${pgZhMap[dominantPg]}</strong> × <strong>${kaZhMap[dominantKa] || '-'}</strong>${spanLabel ? ' <em>· 跨度 ' + spanLabel + '</em>' : ''}`,
    mood: moodLines.join(' '),
  };
}

function humanizeSpan(ms) {
  if (ms < 3600_000) return Math.round(ms / 60_000) + ' 分钟';
  if (ms < 86400_000) return (ms / 3600_000).toFixed(1) + ' 小时';
  return Math.round(ms / 86400_000) + ' 天';
}

let lastSeenCommitHash = null;
let commitPaneExpanded = false;
const COLLAPSED_COUNT = 3;
const EXPANDED_COUNT = 10;

function renderCommitPane(ctx) {
  const commits = (ctx.git && ctx.git.commits) || [];
  commitListEl.innerHTML = '';
  commitDigestEl.innerHTML = '';

  // Meta line: ahead/behind + dirty
  const metaParts = [];
  if (ctx.git && ctx.git.available) {
    if (typeof ctx.git.ahead === 'number') {
      if (ctx.git.ahead > 0)  metaParts.push(t('commit.meta.ahead',  { n: ctx.git.ahead }));
      if (ctx.git.behind > 0) metaParts.push(t('commit.meta.behind', { n: ctx.git.behind }));
      if (ctx.git.ahead === 0 && ctx.git.behind === 0) metaParts.push(t('commit.meta.sync'));
    }
    if (typeof ctx.git.dirty_count === 'number' && ctx.git.dirty_count > 0) {
      metaParts.push(t('commit.meta.uncommitted', { n: ctx.git.dirty_count }));
    }
  }
  commitPaneMetaEl.textContent = metaParts.length ? metaParts.join(' · ') : '';

  if (!commits.length) {
    const empty = document.createElement('li');
    empty.className = 'commit-empty';
    empty.textContent = ctx.git && ctx.git.available ? t('commit.empty') : t('commit.not_git');
    commitListEl.appendChild(empty);
    commitToggleBtn.hidden = true;
    return;
  }

  // Digest
  const digest = buildCommitDigest(commits);
  if (digest) {
    const p = document.createElement('span');
    p.innerHTML = digest.primary;
    commitDigestEl.appendChild(p);
    if (digest.mood) {
      const m = document.createElement('span');
      m.className = 'pmp-mood';
      m.textContent = digest.mood;
      commitDigestEl.appendChild(m);
    }
  }

  // Detect new commit → flash
  const newest = commits[0].hash;
  const isFresh = (lastSeenCommitHash && newest !== lastSeenCommitHash);
  lastSeenCommitHash = newest;

  // Show N based on collapse state
  const maxShow = commitPaneExpanded ? EXPANDED_COUNT : COLLAPSED_COUNT;
  const toShow = commits.slice(0, maxShow);

  for (let i = 0; i < toShow.length; i++) {
    const c = toShow[i];
    const li = document.createElement('li');
    li.className = 'commit-row' + (isFresh && i === 0 ? ' fresh' : '');
    li.title = `${c.hash} · ${c.subject}${c.author ? ' · ' + c.author : ''}`;

    const hashEl = document.createElement('span');
    hashEl.className = 'commit-hash';
    hashEl.textContent = c.hash;
    li.appendChild(hashEl);

    const timeEl = document.createElement('span');
    timeEl.className = 'commit-time';
    timeEl.textContent = c.ts ? timeAgo(c.ts) : '';
    li.appendChild(timeEl);

    const subjectEl = document.createElement('span');
    subjectEl.className = 'commit-subject';
    subjectEl.textContent = c.subject;
    li.appendChild(subjectEl);

    const tag = tagCommit(c.subject);
    if (tag) {
      const tagEl = document.createElement('span');
      tagEl.className = 'commit-tag pg-' + tag.pg;
      tagEl.textContent = tag.pgZh + '·' + tag.kaZh;
      tagEl.title = `${tag.pg} × ${tag.ka} — ${tag.label}`;
      li.appendChild(tagEl);
    }

    li.addEventListener('click', () => askCommitMentor(c));
    commitListEl.appendChild(li);
  }

  // Toggle button
  if (commits.length > COLLAPSED_COUNT) {
    commitToggleBtn.hidden = false;
    if (commitPaneExpanded) {
      commitToggleBtn.textContent = t('commit.collapse');
    } else {
      commitToggleBtn.textContent = t('commit.expand_n', { n: Math.min(commits.length, EXPANDED_COUNT) - COLLAPSED_COUNT });
    }
  } else {
    commitToggleBtn.hidden = true;
  }
}

commitToggleBtn.addEventListener('click', () => {
  commitPaneExpanded = !commitPaneExpanded;
  // Re-render only the commit pane using last snapshot (or trigger refresh)
  refreshAll();
});

async function askCommitMentor(commit) {
  // Switch to Ask tab, prefill, send
  switchTab('ask');
  const prompt = `刚看 commit \`${commit.hash} ${commit.subject}\`（${commit.author}, ${commit.ts ? new Date(commit.ts).toISOString() : ''})。这个 commit 在 PMP 视角下是什么阶段的动作？是否要做什么后续？请简短观察，120 字内。`;
  inputEl.value = prompt;
  send();
}

// --- Render Now feed ---
function renderNowFeed(snapshot) {
  renderCommitPane(snapshot.ctx);
  const cards = generateCards(snapshot);
  nowCountEl.textContent = cards.length ? `· ${cards.length}` : '';
  cardsSection.innerHTML = '';
  if (!cards.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `<div class="ico">∙</div>${t('card.empty')}<br><span style="opacity:0.7">${t('card.empty.sub')}</span>`;
    cardsSection.appendChild(empty);
    return;
  }
  for (const card of cards) {
    cardsSection.appendChild(renderCard(card));
  }
}

function renderCard(card) {
  const root = document.createElement('div');
  root.className = 'card';
  root.dataset.cardId = card.id;

  const head = document.createElement('div');
  head.className = 'card-head';

  const icon = document.createElement('span');
  icon.className = 'card-icon';
  icon.textContent = card.icon;
  head.appendChild(icon);

  const body = document.createElement('div');
  body.style.flex = '1 1 auto';
  const title = document.createElement('div');
  title.className = 'card-title';
  title.textContent = card.title;
  body.appendChild(title);
  if (card.sub) {
    const sub = document.createElement('div');
    sub.className = 'card-sub';
    sub.textContent = card.sub;
    body.appendChild(sub);
  }
  head.appendChild(body);

  const dismiss = document.createElement('button');
  dismiss.className = 'card-dismiss';
  dismiss.textContent = '✕';
  dismiss.title = t('card.dismiss');
  dismiss.addEventListener('click', () => {
    dismissed.add(card.id);
    root.classList.add('dismissed');
    setTimeout(() => { if (root.parentElement) root.remove(); }, 200);
  });
  head.appendChild(dismiss);

  root.appendChild(head);

  if (card.seed) {
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    const askLink = document.createElement('button');
    askLink.className = 'card-link';
    askLink.textContent = t('card.action.suggest');
    askLink.addEventListener('click', () => expandCard(root, card, askLink));
    actions.appendChild(askLink);
    root.appendChild(actions);
  }

  return root;
}

async function expandCard(cardEl, card, linkEl) {
  linkEl.disabled = true;
  linkEl.classList.add('loading');
  linkEl.textContent = t('card.action.expanding');
  // Create inline streaming target inside the card
  const replyWrap = document.createElement('div');
  replyWrap.className = 'card-reply';
  cardEl.appendChild(replyWrap);
  cardEl.classList.add('expanded');
  try {
    const reply = await streamMentorInto(replyWrap, card.seed, {});
    linkEl.classList.remove('loading');
    linkEl.textContent = t('card.action.expanded');
    linkEl.disabled = true;
    window.pace.log('panel', 'card_expanded', { card_id: card.id, stage: reply && reply.debug && reply.debug.stage });
  } catch (err) {
    linkEl.classList.remove('loading');
    linkEl.textContent = t('card.action.retry');
    linkEl.disabled = false;
    window.pace.log('panel', 'card_expand_error', { card_id: card.id, error: String(err) }, 'error');
  }
}

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

// --- Ask flow (used in #view-ask) ---
function appendUserMsg(text) {
  const node = document.createElement('div');
  node.className = 'msg user fade-in-up';
  node.textContent = text;
  const tsEl = document.createElement('span'); tsEl.className = 'ts'; tsEl.textContent = tsLabel();
  node.appendChild(tsEl);
  askHistoryEl.appendChild(node);
  askView.scrollTop = askView.scrollHeight;
}

/**
 * Build an empty mentor bubble pre-wired for streaming. Returns
 * the elements that need to be filled in as chunks arrive.
 */
function makeStreamingMentor(parent) {
  const root = document.createElement('div');
  root.className = 'msg mentor streaming fade-in-up';

  const thinking = document.createElement('div');
  thinking.className = 'msg-thinking';
  thinking.hidden = true; // shown when first 'thinking' chunk arrives
  const thinkHead = document.createElement('div');
  thinkHead.className = 'thinking-head';
  const brainEl = document.createElement('span');
  brainEl.className = 'thinking-brain';
  brainEl.textContent = '🧠';
  thinkHead.appendChild(brainEl);
  const thinkLabel = document.createElement('span');
  thinkLabel.className = 'thinking-label';
  thinkLabel.textContent = t('stream.thinking');
  thinkHead.appendChild(thinkLabel);
  const thinkMeta = document.createElement('span');
  thinkMeta.className = 'thinking-meta';
  thinkHead.appendChild(thinkMeta);
  thinking.appendChild(thinkHead);
  const thinkBody = document.createElement('div');
  thinkBody.className = 'thinking-body';
  thinking.appendChild(thinkBody);
  root.appendChild(thinking);

  const answer = document.createElement('div');
  answer.className = 'msg-answer-stream';
  // Empty until first 'answer' chunk; show a typing-cursor placeholder
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  answer.appendChild(cursor);
  root.appendChild(answer);

  parent.appendChild(root);
  return { root, thinking, thinkHead, thinkLabel, thinkMeta, thinkBody, answer, cursor };
}

/**
 * Stream a mentor turn into the given `target` parent element.
 * `useMarkdown` controls whether final answer is rendered as markdown
 * (true for chat history; cards may also use markdown).
 */
async function streamMentorInto(parent, text, opts) {
  const t0 = Date.now();
  const ui = makeStreamingMentor(parent);
  const ctx = parent === askHistoryEl ? askView : null;
  if (ctx) ctx.scrollTop = ctx.scrollHeight;

  let thinkingChars = 0;
  let answerText = '';
  let firstAnswerSeen = false;

  const onChunk = (chunk) => {
    if (chunk.type === 'thinking') {
      if (ui.thinking.hidden) ui.thinking.hidden = false;
      thinkingChars += chunk.text.length;
      ui.thinkBody.appendChild(document.createTextNode(chunk.text));
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      ui.thinkMeta.textContent = ` · ${thinkingChars} 字 · ${elapsed}s`;
      // Auto-scroll thinking body
      ui.thinkBody.scrollTop = ui.thinkBody.scrollHeight;
      if (ctx) ctx.scrollTop = ctx.scrollHeight;
    } else if (chunk.type === 'tool_call') {
      if (ui.thinking.hidden) ui.thinking.hidden = false;
      const line = document.createElement('div');
      line.className = 'tool-event tool-event-call';
      const icon = document.createElement('span'); icon.textContent = '🔧 '; line.appendChild(icon);
      const name = document.createElement('strong'); name.textContent = chunk.name; line.appendChild(name);
      const args = document.createElement('span');
      try {
        const argsStr = JSON.stringify(chunk.args || {});
        args.textContent = argsStr.length > 80 ? ' ' + argsStr.slice(0, 80) + '…' : ' ' + argsStr;
      } catch (_e) { args.textContent = ''; }
      args.style.color = 'var(--text-muted)';
      line.appendChild(args);
      ui.thinkBody.appendChild(line);
      ui.thinkBody.scrollTop = ui.thinkBody.scrollHeight;
    } else if (chunk.type === 'tool_result') {
      const line = document.createElement('div');
      line.className = 'tool-event tool-event-result' + (chunk.ok === false ? ' err' : '');
      line.textContent = (chunk.ok === false ? '  ✗ ' : '  → ') + (chunk.preview || '');
      ui.thinkBody.appendChild(line);
      ui.thinkBody.scrollTop = ui.thinkBody.scrollHeight;
      if (ctx) ctx.scrollTop = ctx.scrollHeight;
    } else if (chunk.type === 'answer') {
      if (!firstAnswerSeen) {
        firstAnswerSeen = true;
        // Lock thinking summary
        ui.thinkLabel.textContent = t('stream.thinking_done');
        ui.thinking.classList.add('done');
        // Remove typing placeholder cursor and start text node
        ui.cursor.classList.add('blinking');
      }
      answerText += chunk.text;
      // Insert text before the cursor element
      ui.answer.insertBefore(document.createTextNode(chunk.text), ui.cursor);
      if (ctx) ctx.scrollTop = ctx.scrollHeight;
    } else if (chunk.type === 'done') {
      // Replace the stream-rendered text with proper markdown
      const finalText = chunk.final || answerText;
      const totalElapsed = ((Date.now() - t0) / 1000).toFixed(1);
      // Defensive: remove any typing cursor anywhere inside this bubble
      ui.root.querySelectorAll('.typing-cursor').forEach((c) => c.remove());
      if (ui.cursor.parentNode) ui.cursor.parentNode.removeChild(ui.cursor);
      const md = document.createElement('div');
      md.className = 'msg-answer';
      renderMarkdown(md, finalText);
      // Replace the answer container's content
      ui.answer.innerHTML = '';
      // Move rendered nodes into ui.answer
      while (md.firstChild) ui.answer.appendChild(md.firstChild);
      ui.answer.classList.add('done');
      // Final thinking meta
      if (thinkingChars > 0) {
        const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
        ui.thinkMeta.textContent = ` · ${thinkingChars} 字 · ${elapsed}s`;
        ui.thinking.classList.add('collapsed');
        ui.thinkHead.style.cursor = 'pointer';
        ui.thinkHead.addEventListener('click', () => {
          ui.thinking.classList.toggle('collapsed');
        });
      } else {
        ui.thinking.hidden = true;
      }
      ui.root.classList.remove('streaming');
      ui.root.classList.add('finished');
      // Extract any TODO list from the final markdown and render as action chips
      maybeExtractAndRenderTodos(ui.root, finalText);
      // Timestamp + per-bubble latency (replaces the old footer pill)
      const tsEl = document.createElement('span');
      tsEl.className = 'ts';
      tsEl.textContent = `${tsLabel()} · ${totalElapsed}s`;
      ui.root.appendChild(tsEl);
      if (ctx) ctx.scrollTop = ctx.scrollHeight;
    } else if (chunk.type === 'error') {
      ui.root.className = 'msg error fade-in-up';
      ui.root.innerHTML = '';
      ui.root.textContent = chunk.markdown || '出错了';
    }
  };

  try {
    const callOpts = Object.assign({ text }, opts || {});
    return await window.pace.streamMentorAsk(callOpts, onChunk);
  } catch (err) {
    ui.root.className = 'msg error fade-in-up';
    ui.root.innerHTML = '';
    ui.root.textContent = '出错：' + (err && err.message ? err.message : String(err));
    return null;
  }
}

async function send() {
  const text = inputEl.value.trim();
  if (!text) return;
  sendBtn.disabled = true;
  inputEl.value = '';
  appendUserMsg(text);
  // Build history payload from accumulated askConversation
  const historyForApi = askConversation.slice(-12);
  const opts = { history: historyForApi };
  if (activeAsMember) opts.as_member_id = activeAsMember.id;
  try {
    const r = await streamMentorInto(askHistoryEl, text, opts);
    if (r && r.markdown) {
      // Append both turns to history for future turns
      askConversation.push({ role: 'user', content: text });
      askConversation.push({ role: 'assistant', content: r.markdown });
      // Cap at last 24 entries (12 turns)
      if (askConversation.length > 24) askConversation = askConversation.slice(-24);
    }
    window.pace.log('panel', 'mentor_reply', { input_length: text.length, stage: r && r.debug && r.debug.stage, history_turns: askConversation.length / 2 });
  } catch (err) {
    window.pace.log('panel', 'mentor_reply_error', { error: String(err) }, 'error');
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
    refreshAll();
  }
}

// --- TODO extraction from mentor markdown ---
function maybeExtractAndRenderTodos(rootEl, finalText) {
  if (!finalText) return;
  if (!/##+\s*(📋\s*)?TODO\b/i.test(finalText)) return;
  // Find the heading element whose text contains TODO
  const headings = rootEl.querySelectorAll('h1, h2, h3');
  let target = null;
  for (const h of headings) {
    if (/TODO/i.test(h.textContent)) { target = h; break; }
  }
  if (!target) return;
  const next = target.nextElementSibling;
  if (!next || next.tagName !== 'UL') return;
  const items = Array.from(next.querySelectorAll('li'));
  if (items.length === 0) return;

  const wrap = document.createElement('div');
  wrap.className = 'mentor-todos';
  const wrapHead = document.createElement('div');
  wrapHead.className = 'mentor-todos-head';
  wrapHead.textContent = t('todo.heading');
  wrap.appendChild(wrapHead);

  items.forEach((li) => {
    const codeEl = li.querySelector('code');
    const cmd = codeEl ? codeEl.textContent : li.textContent.trim();
    // Pull description as text after the code element
    let description = '';
    if (codeEl) {
      const after = li.innerHTML.split(codeEl.outerHTML)[1] || '';
      description = after.replace(/<[^>]+>/g, '').replace(/^[\s—–—–\-:·]+/, '').trim();
    } else {
      description = '';
    }

    const chip = document.createElement('div');
    chip.className = 'todo-chip';

    const main = document.createElement('div');
    main.className = 'todo-main';

    const cmdEl = document.createElement('code');
    cmdEl.className = 'todo-cmd';
    cmdEl.textContent = cmd;
    main.appendChild(cmdEl);

    if (description) {
      const desc = document.createElement('div');
      desc.className = 'todo-desc';
      desc.textContent = description;
      main.appendChild(desc);
    }
    chip.appendChild(main);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'todo-copy';
    copyBtn.textContent = t('todo.copy');
    copyBtn.title = t('todo.copy.title');
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(cmd);
        copyBtn.textContent = t('todo.copied');
        setTimeout(() => { copyBtn.textContent = t('todo.copy'); }, 1500);
      } catch (_e) { copyBtn.textContent = '✗'; }
    });
    chip.appendChild(copyBtn);

    wrap.appendChild(chip);
  });

  next.parentNode.replaceChild(wrap, next);
  target.classList.add('todo-heading');
}

sendBtn.addEventListener('click', send);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
});

// --- Ask tab: dynamic context strip + suggestions ---

function renderAskContext(snap) {
  const el = document.getElementById('ask-context-text');
  if (!el) return;
  const ctx = snap.ctx;
  const parts = [];
  if (ctx.git && ctx.git.available) {
    const root = (ctx.git.git_root || '').split(/[\\/]/).pop();
    parts.push(`<strong>${root}</strong>`);
    parts.push(ctx.git.git_branch || '—');
    if (ctx.git.dirty_count) parts.push(t('ask.context.changes', { n: ctx.git.dirty_count }));
    if (typeof ctx.git.ahead === 'number' && ctx.git.ahead > 0) parts.push(t('ask.context.ahead', { n: ctx.git.ahead }));
  } else {
    parts.push(t('ask.context.no_git'));
  }
  if (snap.team && snap.team.length) parts.push(t('ask.context.team_n', { n: snap.team.length }));
  if (snap.recent_history && snap.recent_history.length) parts.push(t('ask.context.history', { n: snap.recent_history.length }));
  el.innerHTML = t('ask.context.prefix') + parts.join(' · ');
}

function generateAskSuggestions(snap) {
  const ctx = snap.ctx;
  const team = snap.team || [];
  const sugs = [];

  sugs.push({ label: t('sug.stage'), tag: t('sug.stage.tag'), prompt: t('sug.stage.prompt') });

  if (ctx.git && ctx.git.available) {
    const dirty = ctx.git.dirty_count || 0;
    if (dirty >= 3) {
      sugs.push({ label: t('sug.dirty.label', {n: dirty}), tag: t('sug.dirty.tag'), prompt: t('sug.dirty.prompt', {n: dirty}) });
    }
    if (ctx.git.git_branch === 'main' || ctx.git.git_branch === 'master') {
      sugs.push({ label: t('sug.main.label', {branch: ctx.git.git_branch}), tag: t('sug.main.tag'), prompt: t('sug.main.prompt', {branch: ctx.git.git_branch}) });
    }
    if (typeof ctx.git.ahead === 'number' && ctx.git.ahead >= 3) {
      sugs.push({ label: t('sug.ahead.label', {n: ctx.git.ahead}), tag: t('sug.ahead.tag'), prompt: t('sug.ahead.prompt', {n: ctx.git.ahead}) });
    }
    const recent = (ctx.git.commits || []).slice(0, 5);
    if (recent.length >= 3) {
      const lastSubject = recent[0].subject || '';
      sugs.push({ label: t('sug.review.label'), tag: t('sug.review.tag'), prompt: t('sug.review.prompt', {hash: recent[0].hash, subject: lastSubject}) });
    }
  }

  if (team.length > 0) {
    const top = team.slice(0, 2);
    for (const m of top) {
      const roleStr = m.role ? (LANG === 'en' ? ` (${m.role})` : `（${m.role}）`) : '';
      const raci = (m.raci && m.raci.length) ? ' · RACI ' + m.raci.join('') : '';
      sugs.push({
        label: t('sug.team.label', {name: m.name, role: roleStr}),
        tag: t('sug.team.tag'),
        prompt: t('sug.team.prompt', {name: m.name, role: roleStr, raci}),
      });
    }
  } else if (ctx.git && ctx.git.available) {
    sugs.push({ label: t('sug.team_loop.label'), tag: t('sug.team_loop.tag'), prompt: t('sug.team_loop.prompt') });
  }

  sugs.push({ label: t('sug.risk.label'), tag: t('sug.risk.tag'), prompt: t('sug.risk.prompt') });
  sugs.push({ label: t('sug.tempo.label'), tag: t('sug.tempo.tag'), prompt: t('sug.tempo.prompt') });

  // De-dupe by label + cap
  const seen = new Set();
  const out = [];
  for (const s of sugs) {
    if (seen.has(s.label)) continue;
    seen.add(s.label);
    out.push(s);
    if (out.length >= 7) break;
  }
  return out;
}

function renderAskSuggestions(snap) {
  const listEl = document.getElementById('ask-suggestions-list');
  if (!listEl) return;
  listEl.innerHTML = '';
  const sugs = generateAskSuggestions(snap);
  for (const s of sugs) {
    const btn = document.createElement('button');
    btn.className = 'sg-item';
    btn.dataset.prompt = s.prompt;

    const labelEl = document.createElement('span');
    labelEl.textContent = s.label;
    btn.appendChild(labelEl);

    if (s.tag) {
      const tagEl = document.createElement('span');
      tagEl.className = 'sg-tag';
      tagEl.textContent = s.tag;
      btn.appendChild(tagEl);
    }

    btn.addEventListener('click', () => {
      switchTab('ask');
      inputEl.value = s.prompt;
      send();
    });
    listEl.appendChild(btn);
  }
}

// --- Settings modal ---
function applyAppearance(s) {
  // Theme
  let effective = s.theme;
  if (s.theme === 'auto') {
    const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    effective = sysDark ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-pace-theme', effective);
  document.documentElement.setAttribute('data-pace-font', s.font_size || 'medium');
}

function setSegActive(container, value) {
  if (!container) return;
  container.querySelectorAll('.seg').forEach((b) => {
    b.classList.toggle('active', b.dataset.value === value);
  });
}

async function loadSettings() {
  try {
    const s = await window.pace.getSettings();
    minimaxBaseUrlInput.value = s.minimax_base_url || '';
    minimaxModelInput.value   = s.minimax_model   || '';
    minimaxApiKeyInput.value  = '';
    setSegActive(segTheme,      s.theme || 'dark');
    setSegActive(segFontSize,   s.font_size || 'medium');
    setSegActive(segPanelWidth, s.panel_width || 'regular');
    const langSel = document.getElementById('lang-select');
    if (langSel) langSel.value = s.language || 'zh-CN';
    applyAppearance(s);
    if (s.has_minimax_config) {
      settingsStatusEl.className = 'status-row ok';
      settingsStatusEl.textContent = t('settings.status.ok', {
        src: t(s.minimax_api_key_source === 'env' ? 'settings.key_src.env' : 'settings.key_src.config'),
        model: s.minimax_model,
      });
    } else {
      settingsStatusEl.className = 'status-row warn';
      settingsStatusEl.textContent = t('settings.status.no_key');
    }
  } catch (err) {
    settingsStatusEl.className = 'status-row warn';
    settingsStatusEl.textContent = err.message;
  }
}

// Wire segmented controls: clicking marks active and live-applies appearance
[segTheme, segFontSize, segPanelWidth].forEach((seg) => {
  if (!seg) return;
  seg.addEventListener('click', (e) => {
    const btn = e.target.closest('.seg');
    if (!btn) return;
    seg.querySelectorAll('.seg').forEach((b) => b.classList.toggle('active', b === btn));
    // Live preview before save:
    const previewSettings = {
      theme:       segTheme.querySelector('.seg.active')?.dataset.value || 'dark',
      font_size:   segFontSize.querySelector('.seg.active')?.dataset.value || 'medium',
      panel_width: segPanelWidth.querySelector('.seg.active')?.dataset.value || 'regular',
    };
    applyAppearance(previewSettings);
  });
});
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
    const langSel = document.getElementById('lang-select');
    const newLang = (langSel && langSel.value) || 'zh-CN';
    const patch = {
      minimax_base_url: minimaxBaseUrlInput.value,
      minimax_model:    minimaxModelInput.value,
      theme:       segTheme.querySelector('.seg.active')?.dataset.value || 'dark',
      font_size:   segFontSize.querySelector('.seg.active')?.dataset.value || 'medium',
      panel_width: segPanelWidth.querySelector('.seg.active')?.dataset.value || 'regular',
      language:    newLang,
    };
    const newKey = minimaxApiKeyInput.value.trim();
    if (newKey) patch.minimax_api_key = newKey;
    const s = await window.pace.saveSettings(patch);
    applyAppearance(s);
    if (s && s.has_minimax_config) {
      settingsStatusEl.className = 'status-row ok';
      settingsStatusEl.textContent = t('settings.status.saved', { path: s.config_path });
    } else {
      settingsStatusEl.className = 'status-row warn';
      settingsStatusEl.textContent = t('settings.status.no_key_after_save');
    }
    minimaxApiKeyInput.value = '';
    refreshAll();
    if (newLang !== LANG) {
      setTimeout(() => location.reload(), 250);
    }
  } catch (err) {
    settingsStatusEl.className = 'status-row warn';
    settingsStatusEl.textContent = t('settings.status.save_err', { msg: err.message });
  } finally {
    saveSettingsBtn.disabled = false;
  }
});

// --- Top-level refresh ---
async function refreshAll() {
  let snap;
  try { snap = await window.pace.contextSnapshot({ includeTranscript: false }); }
  catch (err) {
    headerMetaEl.textContent = err && err.message || 'snapshot error';
    return;
  }
  headerMetaEl.textContent = buildMetaLine(snap.ctx, snap.settings);
  renderNowFeed(snap);
  renderTeam(snap.team || []);
  renderAskContext(snap);
  renderAskSuggestions(snap);
}

// --- Team rendering ---

function initials(name) {
  if (!name) return '?';
  const s = String(name).trim();
  // For Chinese names: take last 2 chars; for Latin: take first letter of each token
  if (/[一-龥]/.test(s)) {
    return s.slice(-2);
  }
  const tokens = s.split(/\s+/).filter(Boolean);
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return (tokens[0][0] + tokens[tokens.length - 1][0]).toUpperCase();
}

function renderTeam(members) {
  teamListEl.innerHTML = '';
  teamCountEl.textContent = t('team.count', { n: members.length });
  if (members.length === 0) {
    teamEmptyEl.hidden = false;
    return;
  }
  teamEmptyEl.hidden = true;
  for (const m of members) {
    const row = document.createElement('div');
    row.className = 'team-member';
    row.dataset.memberId = m.id;

    const avatar = document.createElement('div');
    avatar.className = 'tm-avatar';
    avatar.textContent = initials(m.name);
    row.appendChild(avatar);

    const body = document.createElement('div');
    body.className = 'tm-body';

    const line1 = document.createElement('div');
    line1.className = 'tm-line1';
    const nameEl = document.createElement('span');
    nameEl.className = 'tm-name';
    nameEl.textContent = m.name;
    line1.appendChild(nameEl);
    if (m.role) {
      const roleEl = document.createElement('span');
      roleEl.className = 'tm-role';
      roleEl.textContent = m.role;
      line1.appendChild(roleEl);
    }
    if (Array.isArray(m.raci) && m.raci.length) {
      const raciWrap = document.createElement('span');
      raciWrap.className = 'tm-raci';
      for (const letter of ['R', 'A', 'C', 'I']) {
        if (m.raci.includes(letter)) {
          const b = document.createElement('span');
          b.className = 'tm-raci-badge ' + letter;
          b.textContent = letter;
          b.title = { R: '负责 (Responsible)', A: '批准 (Accountable)', C: '咨询 (Consulted)', I: '告知 (Informed)' }[letter];
          raciWrap.appendChild(b);
        }
      }
      line1.appendChild(raciWrap);
    }
    body.appendChild(line1);

    if (m.agent_id) {
      const agentLine = document.createElement('div');
      agentLine.className = 'tm-agent';
      const chip = document.createElement('span');
      chip.className = 'tm-agent-chip';
      chip.textContent = '🤖 ' + m.agent_id;
      agentLine.appendChild(chip);
      body.appendChild(agentLine);
    }

    if (m.notes) {
      const notes = document.createElement('div');
      notes.className = 'tm-notes';
      notes.textContent = m.notes;
      body.appendChild(notes);
    }
    row.appendChild(body);

    const actions = document.createElement('div');
    actions.className = 'tm-actions';

    const talkBtn = document.createElement('button');
    talkBtn.className = 'tm-talk-btn';
    talkBtn.textContent = t('team.talk');
    talkBtn.title = t('team.talk.title', { name: m.name });
    talkBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startMemberPersona(m);
    });
    actions.appendChild(talkBtn);

    const editBtn = document.createElement('button');
    editBtn.className = 'tm-action-btn';
    editBtn.textContent = '✎';
    editBtn.title = t('team.edit');
    editBtn.addEventListener('click', () => openMemberModal(m));
    actions.appendChild(editBtn);
    row.appendChild(actions);

    teamListEl.appendChild(row);
  }
}

// --- Member persona (Ask tab as member) ---
function startMemberPersona(member) {
  activeAsMember = member;
  const nameStr = `${member.name}${member.role ? (LANG === 'en' ? ' (' + member.role + ')' : '（' + member.role + '）') : ''}`;
  const bannerText = document.getElementById('as-member-banner-text');
  if (bannerText) bannerText.innerHTML = t('ask.banner.persona', { name: nameStr });
  asMemberBanner.hidden = false;
  askConversation = [];
  switchTab('ask');
  inputEl.focus();
  inputEl.placeholder = t('ask.persona.placeholder', { name: member.name });
}

function clearMemberPersona() {
  activeAsMember = null;
  asMemberBanner.hidden = true;
  inputEl.placeholder = t('ask.input.placeholder');
  askConversation = [];
}

clearAsMemberBtn.addEventListener('click', clearMemberPersona);

// --- Member modal ---

function getSelectedRaci() {
  const result = [];
  raciChecks.forEach((label) => {
    const input = label.querySelector('input');
    if (input && input.checked) result.push(label.dataset.raci);
  });
  return result;
}

function setRaci(values) {
  raciChecks.forEach((label) => {
    const input = label.querySelector('input');
    const wanted = (values || []).includes(label.dataset.raci);
    input.checked = wanted;
    label.classList.toggle('checked', wanted);
  });
}

raciChecks.forEach((label) => {
  const input = label.querySelector('input');
  input.addEventListener('change', () => {
    label.classList.toggle('checked', input.checked);
  });
  // Also clicking label toggles input (default browser behavior, but ensure checked class updates)
  label.addEventListener('click', () => setTimeout(() => label.classList.toggle('checked', input.checked), 0));
});

function openMemberModal(member) {
  memberModalEl.classList.add('open');
  memberModalEl.setAttribute('aria-hidden', 'false');
  if (member && member.id) {
    memberModalTitle.textContent = t('member.modal.edit');
    memberIdInput.value = String(member.id);
    memberNameInput.value = member.name || '';
    memberRoleSelect.value = member.role || '';
    memberNotesInput.value = member.notes || '';
    memberAgentInput.value = member.agent_id || '';
    setRaci(member.raci || []);
    memberDeleteBtn.style.display = 'inline-block';
  } else {
    memberModalTitle.textContent = t('member.modal.add');
    memberIdInput.value = '';
    memberNameInput.value = '';
    memberRoleSelect.value = '';
    memberNotesInput.value = '';
    memberAgentInput.value = '';
    setRaci([]);
    memberDeleteBtn.style.display = 'none';
  }
  setTimeout(() => memberNameInput.focus(), 50);
}
function closeMemberModal() {
  memberModalEl.classList.remove('open');
  memberModalEl.setAttribute('aria-hidden', 'true');
}

teamAddBtn.addEventListener('click', () => openMemberModal(null));
memberCancelBtn.addEventListener('click', closeMemberModal);
memberModalEl.addEventListener('click', (e) => { if (e.target === memberModalEl) closeMemberModal(); });

memberSaveBtn.addEventListener('click', async () => {
  const name = memberNameInput.value.trim();
  if (!name) {
    memberNameInput.focus();
    return;
  }
  const payload = {
    name,
    role: memberRoleSelect.value || null,
    raci: getSelectedRaci(),
    notes: memberNotesInput.value.trim() || null,
    agent_id: memberAgentInput.value.trim() || null,
  };
  memberSaveBtn.disabled = true;
  try {
    if (memberIdInput.value) {
      await window.pace.teamUpdate(Number(memberIdInput.value), payload);
    } else {
      await window.pace.teamAdd(payload);
    }
    closeMemberModal();
    refreshAll();
  } catch (err) {
    alert('保存失败：' + err.message);
  } finally {
    memberSaveBtn.disabled = false;
  }
});

memberDeleteBtn.addEventListener('click', async () => {
  if (!memberIdInput.value) return;
  if (!confirm(t('member.delete.confirm', { name: memberNameInput.value }))) return;
  await window.pace.teamDelete(Number(memberIdInput.value));
  closeMemberModal();
  refreshAll();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && memberModalEl.classList.contains('open')) closeMemberModal();
});

// --- Boot ---
window.addEventListener('DOMContentLoaded', async () => {
  window.pace.log('panel', 'boot', { version: '0.1.0', form: 'feed-first-tabs' });
  // Apply theme/font + load i18n strings BEFORE first paint of content
  try {
    const s0 = await window.pace.getSettings();
    applyAppearance(s0);
    LANG = s0.language || 'zh-CN';
    const r = await window.pace.getStrings(LANG);
    if (r && r.strings) STRINGS = r.strings;
    applyI18nToDom(document);
  } catch (_e) {}
  await refreshAll();
  // Start git fs watcher; receive events here for live refresh.
  try {
    await window.pace.startGitWatch();
    window.pace.onGitChange((payload) => {
      window.pace.log('panel', 'git_change', payload);
      // Slight extra debounce — git index settles after the watcher fires
      setTimeout(() => { if (!sendBtn.disabled) refreshAll(); }, 600);
    });
  } catch (_e) {}
  try {
    const s = await window.pace.windowState();
    if (s && s.pinned) pinBtn.classList.add('active');
  } catch (_e) {}
});

// Backup periodic refresh every 60s for clock-based cards (mentor-stale,
// cc-activity timeAgo). Skip while a mentor turn is mid-flight.
setInterval(() => {
  if (!sendBtn.disabled) refreshAll();
}, 60_000);
