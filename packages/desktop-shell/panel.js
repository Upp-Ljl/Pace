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
    if (dirty > 0) parts.push(dirty + ' 改动');
    else parts.push('clean');
  }
  parts.push(settings.has_minimax_config ? settings.minimax_model.replace(/^MiniMax-/, '') : 'no key');
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
    const agent = m.agent_id ? ` 〈agent: ${m.agent_id}〉` : '';
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
      title: 'LLM 还没配好',
      sub: '点右上角设置粘贴 MiniMax key，Pace 就能开口了',
      seed: null,
      priority: 0,
    });
  }

  // Card: empty team prompt (only if git active + no team yet + has some commits)
  if (ctx.git && ctx.git.available && (!team || team.length === 0)) {
    cards.push({
      id: 'no-team',
      icon: '👥',
      title: 'Pace 还不认识你的同事',
      sub: '去"团队" tab 加几个，建议会从泛泛"找产品"具体到"找 Tom (A)"',
      seed: null,
      priority: 6,
    });
  }

  // Card: git dirty state
  if (ctx.git && ctx.git.available) {
    const dirty = ctx.git.dirty_count || 0;
    if (dirty > 0) {
      cards.push({
        id: 'git-dirty',
        icon: '📂',
        title: `工作区有 ${dirty} 个文件改动`,
        sub: '还没 commit',
        seed: `用户当前在 ${ctx.git.git_root} 项目的 ${ctx.git.git_branch} 分支上，有 ${dirty} 个文件未提交。最近的 commit 主题是：${(ctx.git.recent_log || []).slice(0, 3).join(' / ')}。${teamLine ? '团队：' + teamLine + '。' : ''}从 PMP 角度淡淡观察一下这个状态，并给一两个轻量下一步提示。${teamLine ? '如果合适，可以具体说找哪位同事对齐。' : ''}请用观察语气，不要说教，80 字内。`,
        priority: 1,
      });
    }

    // Card: on main branch
    if (ctx.git.git_branch === 'main' || ctx.git.git_branch === 'master') {
      cards.push({
        id: 'on-main',
        icon: '🌿',
        title: `直接在 ${ctx.git.git_branch} 分支工作`,
        sub: '没有切到 feature / 任务分支',
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
        title: `最近 ${(ctx.git.recent_log || []).length} 个 commit 都在做 ${theme}`,
        sub: '从模式看，你处在一个具体的迭代阶段',
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
      title: `本地比 origin/${ctx.git.git_branch} 领先 ${ctx.git.ahead} 个 commit`,
      sub: '还没 push',
      seed: `用户本地有 ${ctx.git.ahead} 个 commit 没 push 到 origin。${teamLine ? '团队：' + teamLine + '。' : ''}从协作风险角度，淡淡观察一下这个状态。80 字内。`,
      priority: 1,
    });
  }
  // Card: upstream gap — behind
  if (ctx.git && ctx.git.available && typeof ctx.git.behind === 'number' && ctx.git.behind > 0) {
    cards.push({
      id: 'behind-origin',
      icon: '↘',
      title: `本地落后 origin/${ctx.git.git_branch} ${ctx.git.behind} 个 commit`,
      sub: '还没拉下来——可能即将冲突',
      seed: `用户本地落后远端 ${ctx.git.behind} 个 commit 没 pull。${teamLine ? '团队：' + teamLine + '。' : ''}观察一下风险，80 字内。`,
      priority: 0,
    });
  }

  // Card: time-since-last-commit
  if (ctx.git && ctx.git.available && ctx.git.commits && ctx.git.commits.length) {
    const lastTs = ctx.git.commits[0].ts;
    if (lastTs) {
      const ageMs = Date.now() - lastTs;
      if (ageMs > 2 * 3600_000 && ctx.git.dirty_count > 0) {
        cards.push({
          id: 'long-since-commit',
          icon: '⏳',
          title: `距上次 commit ${timeAgo(lastTs)}`,
          sub: `工作区还有 ${ctx.git.dirty_count} 个改动 — 长时间没 commit 风险有`,
          seed: `用户上次 commit 是 ${timeAgo(lastTs)}，工作区还堆着 ${ctx.git.dirty_count} 个未提交改动。${teamLine ? '团队：' + teamLine + '。' : ''}从工作节奏角度，淡淡说几句风险和下一步。80 字内。`,
          priority: 2,
        });
      }
    }
  }

  // Card: package.json touched (semantic file watch)
  if (ctx.git && ctx.git.available && ctx.git.changed_files) {
    const pkgTouched = ctx.git.changed_files.some((f) => /(^|[\\/])package\.json$/.test(f.path));
    if (pkgTouched) {
      cards.push({
        id: 'pkg-json-touched',
        icon: '📦',
        title: '`package.json` 有改动',
        sub: '记得 npm install 才能让依赖落地',
        seed: null,
        priority: 4,
      });
    }
    // Card: docs / README untouched when code changed substantively
    const codeChanged = ctx.git.changed_files.some((f) => /\.(c?js|mjs|ts|tsx|jsx|cjs|py|go|rs|java|html|css|cjs)$/i.test(f.path));
    const docsChanged = ctx.git.changed_files.some((f) => /(README|CHANGELOG|docs[\\/])/i.test(f.path));
    if (codeChanged && !docsChanged && ctx.git.dirty_count >= 3) {
      cards.push({
        id: 'docs-untouched',
        icon: '📖',
        title: '代码改了，文档没动',
        sub: 'README / CHANGELOG / docs/ 都没在 diff 里',
        seed: `用户改了 ${ctx.git.dirty_count} 个代码文件，但 README / CHANGELOG / docs 都没碰。${teamLine ? '团队：' + teamLine + '。' : ''}从 PMP "质量管理" 或 "沟通管理" 视角，淡淡观察这个状态——什么时候该同步文档？80 字内。`,
        priority: 5,
      });
    }
    // Card: tests untouched
    const testsChanged = ctx.git.changed_files.some((f) => /(\.test\.|\.spec\.|__tests__[\\/]|scripts[\\/]smoke-|tests?[\\/])/i.test(f.path));
    if (codeChanged && !testsChanged && ctx.git.dirty_count >= 4) {
      cards.push({
        id: 'tests-untouched',
        icon: '🧪',
        title: '代码改了，测试没跟',
        sub: '改了 ' + ctx.git.dirty_count + ' 个文件但 test/smoke 没动',
        seed: `用户改了 ${ctx.git.dirty_count} 个代码文件但测试 / smoke 都没动。${teamLine ? '团队：' + teamLine + '。' : ''}从质量管理角度，淡淡观察。80 字内。`,
        priority: 5,
      });
    }
  }

  // Card: scope drift — recent commit themes mixed across categories
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
        title: `最近 commit 主题分散`,
        sub: themeKeys.slice(0, 5).join(' · ') + ' 都有',
        seed: `用户最近 8 个 commit 主题分散：${themeKeys.join(', ')}。${teamLine ? '团队：' + teamLine + '。' : ''}从 PMP 范围管理角度看，这是 scope creep 还是合理的多线并进？淡淡观察，80 字内。`,
        priority: 6,
      });
    }
  }

  // Card: cc activity
  if (ctx.cc_session) {
    cards.push({
      id: 'cc-activity',
      icon: '💬',
      title: `Claude Code 上次活动 ${timeAgo(ctx.cc_session.last_mtime_ms)}`,
      sub: '你刚才在和 cc 一起干活',
      seed: `用户刚和 Claude Code 协作，上次 cc session 活动 ${timeAgo(ctx.cc_session.last_mtime_ms)}。${teamLine ? '团队：' + teamLine + '。' : ''}从 PMP 视角，刚结束一段密集协作后，建议的"复盘 / 校准"动作是什么？请用淡淡观察的语气，80 字内。`,
      priority: 4,
    });
  } else if (ctx.git && ctx.git.available) {
    cards.push({
      id: 'cc-quiet',
      icon: '🤫',
      title: '当前目录没找到 cc session',
      sub: '你在手敲，或者 cc 工作在别的目录',
      seed: null,
      priority: 9,
    });
  }

  // Card: mentor sleep
  if (!recent_history || recent_history.length === 0) {
    cards.push({
      id: 'mentor-quiet',
      icon: '💭',
      title: '我还没和你聊过',
      sub: '想问什么直接到"问问"那里，或点卡片里的"想看建议"',
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
          title: `上次和我对话是 ${timeAgo(new Date(lastTs).getTime())}`,
          sub: '工作有进展了吗',
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

// --- Render commit pane (pinned at top of Now tab) ---

let lastSeenCommitHash = null;

function renderCommitPane(ctx) {
  const commits = (ctx.git && ctx.git.commits) || [];
  commitListEl.innerHTML = '';

  // Meta line: total + ahead/behind
  const metaParts = [];
  if (ctx.git && ctx.git.available) {
    if (typeof ctx.git.ahead === 'number') {
      if (ctx.git.ahead > 0) metaParts.push(`领先 ${ctx.git.ahead}`);
      if (ctx.git.behind > 0) metaParts.push(`落后 ${ctx.git.behind}`);
      if (ctx.git.ahead === 0 && ctx.git.behind === 0) metaParts.push('与 origin 同步');
    }
    if (typeof ctx.git.dirty_count === 'number' && ctx.git.dirty_count > 0) {
      metaParts.push(`${ctx.git.dirty_count} 改动未提交`);
    }
  }
  commitPaneMetaEl.textContent = metaParts.length ? metaParts.join(' · ') : '';

  if (!commits.length) {
    const empty = document.createElement('li');
    empty.className = 'commit-empty';
    empty.textContent = ctx.git && ctx.git.available ? '没有 commit 历史' : '当前目录不是 git 仓库';
    commitListEl.appendChild(empty);
    return;
  }

  // Detect new commits (top hash changed) — flash animation
  const newest = commits[0] && commits[0].hash;
  const isFresh = (lastSeenCommitHash && newest && lastSeenCommitHash !== newest);
  if (newest) lastSeenCommitHash = newest;

  // Show up to 6 most-recent
  commits.slice(0, 6).forEach((c, i) => {
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

    // Click commit → mentor weighs in on what this commit means
    li.addEventListener('click', () => askCommitMentor(c));

    commitListEl.appendChild(li);
  });
}

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
    empty.innerHTML = '<div class="ico">∙</div>这会儿没什么特别的<br><span style="opacity:0.7">git 干净 · cc 没动静 · 也没要紧的事卡着</span>';
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
  dismiss.title = '收起这条';
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
    askLink.textContent = '想看建议 →';
    askLink.addEventListener('click', () => expandCard(root, card, askLink));
    actions.appendChild(askLink);
    root.appendChild(actions);
  }

  return root;
}

async function expandCard(cardEl, card, linkEl) {
  linkEl.disabled = true;
  linkEl.classList.add('loading');
  linkEl.textContent = '在想…';
  try {
    const reply = await window.pace.askMentor({ text: card.seed });
    const replyEl = document.createElement('div');
    replyEl.className = 'card-reply';
    renderMarkdown(replyEl, (reply && reply.markdown) || '(没回复)');
    cardEl.appendChild(replyEl);
    cardEl.classList.add('expanded');
    linkEl.classList.remove('loading');
    linkEl.textContent = '已展开';
    linkEl.disabled = true;
    window.pace.log('panel', 'card_expanded', { card_id: card.id, stage: reply && reply.debug && reply.debug.stage });
  } catch (err) {
    linkEl.classList.remove('loading');
    linkEl.textContent = '出错了，再试 →';
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
  node.className = 'msg user';
  node.textContent = text;
  const tsEl = document.createElement('span'); tsEl.className = 'ts'; tsEl.textContent = tsLabel();
  node.appendChild(tsEl);
  askHistoryEl.appendChild(node);
  askView.scrollTop = askView.scrollHeight;
}
function makePendingMentor() {
  const node = document.createElement('div');
  node.className = 'msg mentor';
  node.textContent = '思考中…（30–60 秒）';
  askHistoryEl.appendChild(node);
  askView.scrollTop = askView.scrollHeight;
  return node;
}
function finalizeMentor(node, text, isError) {
  node.className = 'msg ' + (isError ? 'error' : 'mentor');
  if (isError) node.textContent = text;
  else renderMarkdown(node, text);
  const tsEl = document.createElement('span'); tsEl.className = 'ts'; tsEl.textContent = tsLabel();
  node.appendChild(tsEl);
  askView.scrollTop = askView.scrollHeight;
}

async function send() {
  const text = inputEl.value.trim();
  if (!text) return;
  sendBtn.disabled = true;
  inputEl.value = '';
  appendUserMsg(text);
  const pending = makePendingMentor();
  try {
    const reply = await window.pace.askMentor({ text });
    finalizeMentor(pending, (reply && reply.markdown) || '(no reply)', false);
  } catch (err) {
    finalizeMentor(pending, '出错：' + (err && err.message ? err.message : String(err)), true);
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
    refreshAll();
  }
}

sendBtn.addEventListener('click', send);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
});

// Wire ask-suggestion buttons
document.querySelectorAll('.sg-item').forEach((sg) => {
  sg.addEventListener('click', () => {
    const p = sg.dataset.prompt;
    if (!p) return;
    inputEl.value = p;
    send();
  });
});

// --- Settings modal ---
async function loadSettings() {
  try {
    const s = await window.pace.getSettings();
    minimaxBaseUrlInput.value = s.minimax_base_url || '';
    minimaxModelInput.value   = s.minimax_model   || '';
    minimaxApiKeyInput.value  = '';
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
    };
    const newKey = minimaxApiKeyInput.value.trim();
    if (newKey) patch.minimax_api_key = newKey;
    const s = await window.pace.saveSettings(patch);
    if (s && s.has_minimax_config) {
      settingsStatusEl.className = 'status-row ok';
      settingsStatusEl.textContent = '✓ 已保存到 ' + s.config_path;
    } else {
      settingsStatusEl.className = 'status-row warn';
      settingsStatusEl.textContent = '⚠ 保存了但仍缺 API key';
    }
    minimaxApiKeyInput.value = '';
    refreshAll();
  } catch (err) {
    settingsStatusEl.className = 'status-row warn';
    settingsStatusEl.textContent = '保存出错：' + err.message;
  } finally {
    saveSettingsBtn.disabled = false;
  }
});

// --- Top-level refresh ---
async function refreshAll() {
  let snap;
  try { snap = await window.pace.contextSnapshot({ includeTranscript: false }); }
  catch (err) {
    headerMetaEl.textContent = '读取上下文出错';
    return;
  }
  headerMetaEl.textContent = buildMetaLine(snap.ctx, snap.settings);
  renderNowFeed(snap);
  renderTeam(snap.team || []);
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
  teamCountEl.textContent = `${members.length} 名成员`;
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
    const editBtn = document.createElement('button');
    editBtn.className = 'tm-action-btn';
    editBtn.textContent = '✎';
    editBtn.title = '编辑';
    editBtn.addEventListener('click', () => openMemberModal(m));
    actions.appendChild(editBtn);
    row.appendChild(actions);

    teamListEl.appendChild(row);
  }
}

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
    memberModalTitle.textContent = '编辑成员';
    memberIdInput.value = String(member.id);
    memberNameInput.value = member.name || '';
    memberRoleSelect.value = member.role || '';
    memberNotesInput.value = member.notes || '';
    memberAgentInput.value = member.agent_id || '';
    setRaci(member.raci || []);
    memberDeleteBtn.style.display = 'inline-block';
  } else {
    memberModalTitle.textContent = '添加成员';
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
  if (!confirm('确定删除 "' + memberNameInput.value + '"？')) return;
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
