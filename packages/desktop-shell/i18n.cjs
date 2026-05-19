'use strict';

/**
 * Pace i18n — flat dictionary, falls back to zh-CN if a key is missing.
 *
 * Shared by mentor-pipeline (Node) and panel.js (renderer) via a JSON-able
 * export. Renderer imports the same strings by requiring this file from
 * preload context — see preload.cjs::getI18nStrings.
 */

const dict = {
  // ===== Header / brand =====
  'brand.subtitle':            { 'zh-CN': 'PMP 项目导师',                              en: 'PMP project mentor' },
  'header.refresh':            { 'zh-CN': '刷新侧栏 dashboard',                        en: 'Refresh dashboard' },
  'header.settings':           { 'zh-CN': '设置',                                      en: 'Settings' },
  'header.pin':                { 'zh-CN': '置顶',                                      en: 'Pin on top' },
  'header.unpin':              { 'zh-CN': '取消置顶',                                  en: 'Unpin' },
  'header.close':              { 'zh-CN': '收回托盘',                                  en: 'Hide to tray' },

  // ===== Meta line =====
  'meta.loading':              { 'zh-CN': '读着你的工作中…',                           en: 'Reading your workspace…' },
  'meta.clean':                { 'zh-CN': 'clean',                                     en: 'clean' },
  'meta.dirty':                { 'zh-CN': '改动',                                      en: 'dirty' },
  'meta.no_key':               { 'zh-CN': 'no key',                                    en: 'no key' },

  // ===== Tabs =====
  'tab.now':                   { 'zh-CN': '现在',                                      en: 'Now' },
  'tab.team':                  { 'zh-CN': '团队',                                      en: 'Team' },
  'tab.ask':                   { 'zh-CN': '问问',                                      en: 'Ask' },

  // ===== Hero =====
  'hero.eyebrow':              { 'zh-CN': 'PACE · PMP 项目导师',                       en: 'PACE · PMP MENTOR' },
  'hero.title':                { 'zh-CN': '把当前 cc 工作放进 PMP 项目视角',           en: 'Map your Claude Code work into a PMP project lens' },
  'hero.subtitle':             { 'zh-CN': '观察你的 git / cc / 团队，给你 PMP 阶段判断 + 下一步 + 沟通话术。淡淡的，不打扰。', en: 'Watches your git / cc / team and surfaces PMP-stage signals, next steps, and communication phrasing. Quiet, never naggy.' },

  // ===== Commit pane =====
  'commit.title':              { 'zh-CN': '最近提交',                                  en: 'Recent commits' },
  'commit.loading':            { 'zh-CN': '读取中…',                                   en: 'Loading…' },
  'commit.empty':              { 'zh-CN': '没有 commit 历史',                          en: 'No commit history' },
  'commit.not_git':            { 'zh-CN': '当前目录不是 git 仓库',                     en: 'Current directory is not a git repo' },
  'commit.expand_n':           { 'zh-CN': '+{n} 条 ▾',                                 en: '+{n} more ▾' },
  'commit.collapse':           { 'zh-CN': '收起 ▴',                                    en: 'Collapse ▴' },
  'commit.meta.ahead':         { 'zh-CN': '领先 {n}',                                  en: 'ahead {n}' },
  'commit.meta.behind':        { 'zh-CN': '落后 {n}',                                  en: 'behind {n}' },
  'commit.meta.sync':          { 'zh-CN': '已同步',                                    en: 'in sync' },
  'commit.meta.uncommitted':   { 'zh-CN': '{n} 未提交',                                en: '{n} uncommitted' },
  'commit.digest.dominant':    { 'zh-CN': '最近 {n} 个 commit 多落在 <strong>{pg}</strong> × <strong>{ka}</strong>{span}', en: 'Last {n} commits mostly fall in <strong>{pg}</strong> × <strong>{ka}</strong>{span}' },
  'commit.digest.span':        { 'zh-CN': ' <em>· 跨度 {span}</em>',                   en: ' <em>· over {span}</em>' },
  'commit.digest.focused':     { 'zh-CN': '节奏专注：{n}/{total} 都在 {pg} 阶段。',    en: 'Focused tempo: {n}/{total} stay in {pg}.' },
  'commit.digest.scattered':   { 'zh-CN': '多线并进：{dist}——注意 scope 是否在收口。', en: 'Multi-thread: {dist} — watch scope creep.' },

  // ===== Cards (Now feed) =====
  'card.no_key.title':         { 'zh-CN': 'LLM 还没配好',                              en: 'LLM not configured' },
  'card.no_key.sub':           { 'zh-CN': '点右上角设置粘贴 MiniMax key，Pace 就能开口了', en: 'Open settings and paste your MiniMax key so Pace can speak.' },
  'card.no_team.title':        { 'zh-CN': 'Pace 还不认识你的同事',                     en: "Pace doesn't know your team yet" },
  'card.no_team.sub':          { 'zh-CN': '去"团队" tab 加几个，建议会从泛泛"找产品"具体到"找 Tom (A)"', en: 'Add a few people in the Team tab — Pace will name specific colleagues instead of saying "loop in product."' },
  'card.git_dirty.title':      { 'zh-CN': '工作区有 {n} 个文件改动',                   en: '{n} files changed in working tree' },
  'card.git_dirty.sub':        { 'zh-CN': '还没 commit',                               en: 'Not committed yet' },
  'card.on_main.title':        { 'zh-CN': '直接在 {branch} 分支工作',                  en: 'Working directly on {branch}' },
  'card.on_main.sub':          { 'zh-CN': '没有切到 feature / 任务分支',               en: 'No feature / task branch' },
  'card.ahead.title':          { 'zh-CN': '本地比 origin/{branch} 领先 {n} 个 commit', en: 'Local is {n} commit(s) ahead of origin/{branch}' },
  'card.ahead.sub':            { 'zh-CN': '还没 push',                                 en: 'Not pushed' },
  'card.behind.title':         { 'zh-CN': '本地落后 origin/{branch} {n} 个 commit',    en: 'Local is {n} commit(s) behind origin/{branch}' },
  'card.behind.sub':           { 'zh-CN': '还没拉下来——可能即将冲突',                  en: 'Not pulled — conflicts likely' },
  'card.long_since.title':     { 'zh-CN': '距上次 commit {ago}',                       en: 'Last commit was {ago}' },
  'card.long_since.sub':       { 'zh-CN': '工作区还有 {n} 个改动 — 长时间没 commit 风险有', en: '{n} changes piling up — long gap, watch the risk.' },
  'card.pkg_json.title':       { 'zh-CN': '`package.json` 有改动',                     en: '`package.json` has changes' },
  'card.pkg_json.sub':         { 'zh-CN': '记得 npm install 才能让依赖落地',           en: 'Run npm install to actually pick up deps.' },
  'card.docs.title':           { 'zh-CN': '代码改了，文档没动',                        en: 'Code changed, docs untouched' },
  'card.docs.sub':             { 'zh-CN': 'README / CHANGELOG / docs/ 都没在 diff 里', en: 'README / CHANGELOG / docs/ not in the diff' },
  'card.tests.title':          { 'zh-CN': '代码改了，测试没跟',                        en: 'Code changed, tests not updated' },
  'card.tests.sub':            { 'zh-CN': '改了 {n} 个文件但 test/smoke 没动',         en: '{n} files changed but no test/smoke touched' },
  'card.scope_drift.title':    { 'zh-CN': '最近 commit 主题分散',                      en: 'Recent commits span many themes' },
  'card.commit_theme.title':   { 'zh-CN': '最近 {n} 个 commit 都在做 {theme}',         en: 'Last {n} commits all about {theme}' },
  'card.commit_theme.sub':     { 'zh-CN': '从模式看，你处在一个具体的迭代阶段',         en: 'A focused iteration is in progress.' },
  'card.cc_activity.title':    { 'zh-CN': 'Claude Code 上次活动 {ago}',                en: 'Last Claude Code activity {ago}' },
  'card.cc_activity.sub':      { 'zh-CN': '你刚才在和 cc 一起干活',                    en: 'You were just pairing with cc' },
  'card.cc_quiet.title':       { 'zh-CN': '当前目录没找到 cc session',                 en: "No cc session for this folder" },
  'card.cc_quiet.sub':         { 'zh-CN': '你在手敲，或者 cc 工作在别的目录',          en: 'You\'re working by hand, or cc is in another folder' },
  'card.mentor_quiet.title':   { 'zh-CN': '我还没和你聊过',                            en: "We haven't talked yet" },
  'card.mentor_quiet.sub':     { 'zh-CN': '想问什么直接到"问问"那里，或点卡片里的"想看建议"', en: 'Go to Ask, or tap any card\'s "Want a suggestion" link' },
  'card.mentor_stale.title':   { 'zh-CN': '上次和我对话是 {ago}',                      en: 'Last chat with me was {ago}' },
  'card.mentor_stale.sub':     { 'zh-CN': '工作有进展了吗',                            en: 'Anything moved since then?' },
  'card.action.suggest':       { 'zh-CN': '想看建议 →',                                en: 'Want a suggestion →' },
  'card.action.expanding':     { 'zh-CN': '在想…',                                     en: 'Thinking…' },
  'card.action.expanded':      { 'zh-CN': '已展开',                                    en: 'Expanded' },
  'card.action.retry':         { 'zh-CN': '出错了，再试 →',                            en: 'Error, retry →' },
  'card.dismiss':              { 'zh-CN': '收起这条',                                  en: 'Dismiss' },
  'card.empty':                { 'zh-CN': '这会儿没什么特别的',                        en: 'Nothing special right now' },
  'card.empty.sub':            { 'zh-CN': 'git 干净 · cc 没动静 · 也没要紧的事卡着',   en: 'git clean · cc quiet · nothing pressing' },

  // ===== Team =====
  'team.count':                { 'zh-CN': '{n} 名成员',                                en: '{n} member(s)' },
  'team.add':                  { 'zh-CN': '+ 加成员',                                  en: '+ Add member' },
  'team.empty.title':          { 'zh-CN': '还没添加过团队成员',                        en: 'No team members yet' },
  'team.empty.sub':            { 'zh-CN': '登记下你的同事和他们的 RACI 关系（R 负责 / A 批准 / C 咨询 / I 告知），<br>Pace 在卡片和建议里就能具体说"找 谁 对齐"。', en: 'Register colleagues with their RACI (R Responsible / A Accountable / C Consulted / I Informed) so Pace can name them in cards and suggestions.' },
  'team.empty.hint':           { 'zh-CN': '点上面"+ 加成员"开始',                      en: 'Tap "+ Add member" above to begin' },
  'team.talk':                 { 'zh-CN': '💬 和 ta 谈',                              en: '💬 Talk to them' },
  'team.talk.title':           { 'zh-CN': '以 {name} 的视角和你对话',                  en: 'Chat from {name}\'s perspective' },
  'team.edit':                 { 'zh-CN': '编辑',                                      en: 'Edit' },
  'identities.empty.title':    { 'zh-CN': '身份 / agent 目录',                         en: 'Identity / agent directory' },
  'identities.empty.sub':      { 'zh-CN': '类似飞书的人员目录，但每个身份可关联一个 agent。<br>v0.2 实装——每个团队成员可以接一个 agent 化身，你看到 agent 在干啥。', en: 'A Feishu-style directory where each identity may have an associated agent. Coming in v0.2.' },
  'identities.empty.label':    { 'zh-CN': 'v0.2 · 即将上线',                           en: 'v0.2 · coming soon' },

  // ===== Member modal =====
  'member.modal.add':          { 'zh-CN': '添加成员',                                  en: 'Add member' },
  'member.modal.edit':         { 'zh-CN': '编辑成员',                                  en: 'Edit member' },
  'member.field.name':         { 'zh-CN': '名字',                                      en: 'Name' },
  'member.field.role':         { 'zh-CN': '角色',                                      en: 'Role' },
  'member.field.raci':         { 'zh-CN': 'RACI（在当前项目里的关系）',                 en: 'RACI (in this project)' },
  'member.field.notes':        { 'zh-CN': '备注（可选）',                              en: 'Notes (optional)' },
  'member.field.agent':        { 'zh-CN': 'Agent / 身份代号（可选）',                  en: 'Agent / identity tag (optional)' },
  'member.placeholder.name':   { 'zh-CN': '比如：晓婷 / Tom / 张三',                   en: 'e.g.: Tom / Maria / Alex' },
  'member.placeholder.notes':  { 'zh-CN': '比如：负责后端接口 / 沟通用钉钉 / 倾向直说', en: 'e.g.: backend API owner / DMs on Slack / prefers direct' },
  'member.placeholder.agent':  { 'zh-CN': '比如：github:@xiaoting · slack:@tom · minimax-pm-bot', en: 'e.g.: github:@tom · slack:@maria · openai-pm-bot' },
  'member.raci.r':             { 'zh-CN': '负责',                                      en: 'Responsible' },
  'member.raci.a':             { 'zh-CN': '批准',                                      en: 'Accountable' },
  'member.raci.c':             { 'zh-CN': '咨询',                                      en: 'Consulted' },
  'member.raci.i':             { 'zh-CN': '告知',                                      en: 'Informed' },
  'member.hint.raci':          { 'zh-CN': '勾你打算和这位同事的相处方式。RACI 是项目管理标准，详见 PMBOK 干系人管理。', en: 'Check the dynamics you expect with this colleague. RACI is PMBOK stakeholder mgmt.' },
  'member.hint.agent':         { 'zh-CN': '如果这位同事有 agent 化身、外部身份或专属代号，记下来。Pace 在卡片和建议里能 reference 它。', en: 'If this colleague has an agent persona / external identity / unique handle, list it. Pace can reference it in cards and replies.' },
  'member.save':               { 'zh-CN': '保存',                                      en: 'Save' },
  'member.cancel':             { 'zh-CN': '取消',                                      en: 'Cancel' },
  'member.delete':             { 'zh-CN': '删除',                                      en: 'Delete' },
  'member.delete.confirm':     { 'zh-CN': '确定删除 "{name}"？',                       en: 'Delete "{name}"?' },
  'member.save.failed':        { 'zh-CN': '保存失败：{msg}',                           en: 'Save failed: {msg}' },

  // ===== Ask tab =====
  'ask.banner.persona':        { 'zh-CN': '正在以 <strong>{name}</strong> 的视角对话', en: 'Talking from <strong>{name}</strong>\'s perspective' },
  'ask.banner.clear':          { 'zh-CN': '退出 ta 的视角',                            en: 'Exit perspective' },
  'ask.context.loading':       { 'zh-CN': '读着你的工作上下文…',                       en: 'Reading your context…' },
  'ask.context.prefix':        { 'zh-CN': '我这边看到的：',                            en: 'What I see: ' },
  'ask.context.team_n':        { 'zh-CN': '团队 <span class="name">{n}</span> 人',    en: '<span class="name">{n}</span> teammates' },
  'ask.context.history':       { 'zh-CN': '已聊 <span class="name">{n}</span> 次',    en: 'chatted <span class="name">{n}</span> times' },
  'ask.context.no_git':        { 'zh-CN': '当前目录不是 git 仓库',                     en: 'Current folder is not a git repo' },
  'ask.context.changes':       { 'zh-CN': '<span class="name">{n}</span> 改动',       en: '<span class="name">{n}</span> changes' },
  'ask.context.ahead':         { 'zh-CN': '领先 <span class="name">{n}</span>',       en: 'ahead <span class="name">{n}</span>' },
  'ask.suggestions.label':     { 'zh-CN': '不知道问啥可以从这些开始',                  en: 'Stuck? Try one of these' },
  'ask.persona.placeholder':   { 'zh-CN': '用问 {name} 的语气提问…',                  en: 'Ask as if speaking to {name}…' },
  'ask.input.placeholder':     { 'zh-CN': '问点什么…',                                en: 'Ask anything…' },
  'ask.send':                  { 'zh-CN': 'SEND',                                      en: 'SEND' },
  // Ask suggestion items
  'sug.stage':                 { 'zh-CN': '我现在做的事处于哪个阶段？',                en: 'What PMP stage is my current work in?' },
  'sug.stage.tag':             { 'zh-CN': 'PMP 阶段',                                  en: 'PMP stage' },
  'sug.stage.prompt':          { 'zh-CN': '我现在做的事处于项目的哪个阶段（5 大过程组的哪个）？下一步合理应该做什么？', en: 'Which PMBOK process group am I in right now? What\'s the reasonable next step?' },
  'sug.dirty.label':           { 'zh-CN': '{n} 个文件没 commit · 一起提还是分开？',    en: '{n} files uncommitted · one commit or split?' },
  'sug.dirty.tag':             { 'zh-CN': '范围',                                      en: 'Scope' },
  'sug.dirty.prompt':          { 'zh-CN': '我有 {n} 个文件改动还没 commit. 这些改动该一起提交，还是按主题分开几个 commit？从范围管理角度怎么看？', en: 'I have {n} uncommitted file changes. Should I land one commit or split by theme? View from PMBOK scope mgmt.' },
  'sug.main.label':            { 'zh-CN': '在 {branch} 直接改 · 风险大吗？',           en: 'Editing {branch} directly · how risky?' },
  'sug.main.tag':              { 'zh-CN': '风险',                                      en: 'Risk' },
  'sug.main.prompt':           { 'zh-CN': '我直接在 {branch} 分支上做改动，没切 feature 分支。这个工作流的潜在风险是什么？什么场景下值得切？', en: 'I\'m editing on {branch} directly, no feature branch. What are the risks? When is branching worth it?' },
  'sug.ahead.label':           { 'zh-CN': '{n} 个 commit 没 push · 要紧吗？',          en: '{n} commits unpushed · does it matter?' },
  'sug.ahead.tag':             { 'zh-CN': '协作',                                      en: 'Collab' },
  'sug.ahead.prompt':          { 'zh-CN': '我本地有 {n} 个 commit 没 push 到 origin。从协作 / 风险角度，这个状态有什么风险？', en: 'I have {n} commits locally not pushed. What collab / risk implications?' },
  'sug.review.label':          { 'zh-CN': '刚才那个 commit · 是个合理动作吗？',        en: 'That last commit · was it a reasonable move?' },
  'sug.review.tag':            { 'zh-CN': '复盘',                                      en: 'Retro' },
  'sug.review.prompt':         { 'zh-CN': '最新的 commit 是 `{hash} {subject}`。从 PMP 视角看，这个动作处在哪个阶段？是否合理？有没有下一步该做的？', en: 'Latest commit is `{hash} {subject}`. From a PMP lens, which stage is this? Is it reasonable? Next?' },
  'sug.team.label':            { 'zh-CN': '怎么跟 {name}{role} 对齐这事？',            en: 'How to align with {name}{role} on this?' },
  'sug.team.tag':              { 'zh-CN': '沟通',                                      en: 'Comms' },
  'sug.team.prompt':           { 'zh-CN': '我想跟 {name}{role}{raci} 对齐我当前在做的改动。帮我用前-中-后框架写一段话术。', en: 'I want to align with {name}{role}{raci} on my current change. Write me a before-mid-after-style script.' },
  'sug.team_loop.label':       { 'zh-CN': '我团队里有哪些角色该 loop 进来？',          en: 'Which roles should I loop in?' },
  'sug.team_loop.tag':         { 'zh-CN': '干系人',                                    en: 'Stakeholder' },
  'sug.team_loop.prompt':      { 'zh-CN': '基于我当前的工作内容，从 PMP 干系人管理角度，可能需要 loop 进来的典型角色有哪些？我还没在 Pace 里登记同事，先帮我列下典型的。', en: 'From PMBOK stakeholder mgmt, which typical roles should I loop in for my current work? I haven\'t registered teammates yet — list common archetypes.' },
  'sug.risk.label':            { 'zh-CN': '这事有什么风险我没想到？',                  en: 'Any risks I haven\'t considered?' },
  'sug.risk.tag':              { 'zh-CN': '风险',                                      en: 'Risk' },
  'sug.risk.prompt':           { 'zh-CN': '我现在做的这事，有哪些潜在风险或我可能漏掉的事？从 PMP 风险管理角度淡淡说一下。', en: 'What risks or blind spots might I be missing? From PMBOK risk mgmt, kept light.' },
  'sug.tempo.label':           { 'zh-CN': '到现在为止节奏合不合理？',                  en: 'Is my pace reasonable so far?' },
  'sug.tempo.tag':             { 'zh-CN': '复盘',                                      en: 'Retro' },
  'sug.tempo.prompt':          { 'zh-CN': '基于我的 git 历史 + 团队 + cc 活动，到目前为止我的工作节奏合不合理？有什么值得调整的？', en: 'Based on my git history + team + cc activity, is my working pace reasonable? Anything to adjust?' },

  // ===== Streaming =====
  'todo.heading':              { 'zh-CN': '📋 可执行的下一步',                          en: '📋 Actionable next steps' },
  'todo.copy':                 { 'zh-CN': '复制',                                      en: 'Copy' },
  'todo.copied':               { 'zh-CN': '✓ 已复制',                                  en: '✓ Copied' },
  'todo.copy.title':           { 'zh-CN': '复制到剪贴板，可粘到 cc / 其它 agent 里',     en: 'Copy to clipboard — paste into your cc / other agent' },
  'todo.run.safe':             { 'zh-CN': '▶ 直接跑',                                  en: '▶ Run' },
  'todo.run.caution':          { 'zh-CN': '▶ 跑（需确认）',                            en: '▶ Run (confirm)' },
  'todo.run.deny':             { 'zh-CN': '🚫 拒绝执行',                               en: '🚫 Blocked' },
  'todo.run.unknown':          { 'zh-CN': '? 仅可复制',                                en: '? Copy only' },
  'todo.confirm':              { 'zh-CN': '确定要执行？',                              en: 'Confirm execution?' },
  'todo.confirm.yes':          { 'zh-CN': '✓ 执行',                                    en: '✓ Run' },
  'todo.confirm.no':           { 'zh-CN': '✗ 取消',                                    en: '✗ Cancel' },
  'todo.running':              { 'zh-CN': '⏳ 运行中…',                                en: '⏳ Running…' },
  'todo.exit.ok':              { 'zh-CN': '✓ 退出 {code} · {sec}s',                    en: '✓ exit {code} · {sec}s' },
  'todo.exit.err':             { 'zh-CN': '✗ 退出 {code} · {sec}s',                    en: '✗ exit {code} · {sec}s' },
  'todo.deny.reason':          { 'zh-CN': '该指令命中危险模式，拒绝自动执行',           en: 'Command matched a dangerous pattern; Pace refuses to run it' },
  'todo.unknown.reason':       { 'zh-CN': '不在白名单内，请人工复核',                   en: 'Not whitelisted; please review manually' },

  'stream.thinking':           { 'zh-CN': '推理中',                                    en: 'Reasoning' },
  'stream.thinking_done':      { 'zh-CN': '推理完成',                                  en: 'Reasoning done' },
  'stream.pending':            { 'zh-CN': '思考中…（30–60 秒，大模型在推理）',         en: 'Thinking… (30–60 s, model reasoning)' },
  'stream.chars_seconds':      { 'zh-CN': ' · {chars} 字 · {sec}s',                    en: ' · {chars} chars · {sec}s' },

  // ===== Settings modal =====
  'settings.title':            { 'zh-CN': '设置',                                      en: 'Settings' },
  'settings.appearance':       { 'zh-CN': '外观',                                      en: 'Appearance' },
  'settings.behavior':         { 'zh-CN': '行为',                                      en: 'Behavior' },
  'settings.llm':              { 'zh-CN': 'LLM Provider',                              en: 'LLM Provider' },
  'settings.theme':            { 'zh-CN': '主题',                                      en: 'Theme' },
  'settings.theme.dark':       { 'zh-CN': '暗',                                        en: 'Dark' },
  'settings.theme.light':      { 'zh-CN': '亮',                                        en: 'Light' },
  'settings.theme.auto':       { 'zh-CN': '跟随系统',                                  en: 'Auto' },
  'settings.font_size':        { 'zh-CN': '字号',                                      en: 'Font size' },
  'settings.font.small':       { 'zh-CN': '小',                                        en: 'Small' },
  'settings.font.medium':      { 'zh-CN': '标准',                                      en: 'Medium' },
  'settings.font.large':       { 'zh-CN': '大',                                        en: 'Large' },
  'settings.panel_width':      { 'zh-CN': '面板宽度',                                  en: 'Panel width' },
  'settings.width.slim':       { 'zh-CN': '窄 (420)',                                  en: 'Slim (420)' },
  'settings.width.regular':    { 'zh-CN': '标准 (460)',                                en: 'Regular (460)' },
  'settings.width.wide':       { 'zh-CN': '宽 (520)',                                  en: 'Wide (520)' },
  'settings.lang':             { 'zh-CN': '语言',                                      en: 'Language' },
  'settings.lang.zh':          { 'zh-CN': '简体中文',                                  en: '简体中文' },
  'settings.lang.en':          { 'zh-CN': 'English',                                   en: 'English' },
  'settings.lang.hint':        { 'zh-CN': '切换语言后会刷新 panel。',                  en: 'Panel will reload after switching language.' },
  'settings.autostart':        { 'zh-CN': '开机自动启动 <em>（v0.2 占位）</em>',       en: 'Launch on system startup <em>(v0.2 placeholder)</em>' },
  'settings.start_min':        { 'zh-CN': '启动时直接缩到托盘 <em>（v0.2 占位）</em>', en: 'Start minimized to tray <em>(v0.2 placeholder)</em>' },
  'settings.minimax.url':      { 'zh-CN': 'MiniMax Base URL',                          en: 'MiniMax Base URL' },
  'settings.minimax.key':      { 'zh-CN': 'MiniMax API Key',                           en: 'MiniMax API Key' },
  'settings.minimax.model':    { 'zh-CN': 'MiniMax Model',                             en: 'MiniMax Model' },
  'settings.minimax.url.hint': { 'zh-CN': '默认 <code>https://api.minimaxi.com/v1</code>。', en: 'Default <code>https://api.minimaxi.com/v1</code>.' },
  'settings.minimax.key.hint': { 'zh-CN': '本地存到 <code>~/.pace/config.json</code>。或环境变量 <code>MINIMAX_API_KEY</code>。', en: 'Stored locally at <code>~/.pace/config.json</code>. Or set env <code>MINIMAX_API_KEY</code>.' },
  'settings.minimax.model.hint': { 'zh-CN': '默认 <code>MiniMax-M2.7-highspeed</code>。基础版 <code>MiniMax-M2.7</code>，旧版 <code>MiniMax-M2.5</code> / <code>MiniMax-M2.1</code> / <code>MiniMax-M2</code> 均可。', en: 'Default <code>MiniMax-M2.7-highspeed</code>. Base: <code>MiniMax-M2.7</code>. Older: <code>MiniMax-M2.5</code> / <code>MiniMax-M2.1</code> / <code>MiniMax-M2</code>.' },
  'settings.status.loading':   { 'zh-CN': '加载中…',                                   en: 'Loading…' },
  'settings.status.ok':        { 'zh-CN': '✓ MiniMax 已配置 · key 来自 {src} · 模型 {model}', en: '✓ MiniMax configured · key from {src} · model {model}' },
  'settings.status.no_key':    { 'zh-CN': '⚠ 还没设 API key — 配上后 mentor 才能回答。', en: '⚠ No API key yet — set it so the mentor can reply.' },
  'settings.status.saved':     { 'zh-CN': '✓ 已保存到 {path}',                         en: '✓ Saved to {path}' },
  'settings.status.no_key_after_save': { 'zh-CN': '⚠ 保存了但仍缺 API key — mentor 无法回答。', en: '⚠ Saved, but still no API key — mentor cannot reply.' },
  'settings.status.save_err':  { 'zh-CN': '保存出错：{msg}',                           en: 'Save error: {msg}' },
  'settings.key_src.env':      { 'zh-CN': '环境变量',                                  en: 'env var' },
  'settings.key_src.config':   { 'zh-CN': 'config.json',                               en: 'config.json' },
  'settings.cancel':           { 'zh-CN': 'CANCEL',                                    en: 'CANCEL' },
  'settings.save':             { 'zh-CN': 'SAVE',                                      en: 'SAVE' },

  // ===== System / errors =====
  'err.no_key.md':             { 'zh-CN': '⚠️ **还没设置 MiniMax API key**\n\n点右上角 ⚙ 设置图标，粘贴 Base URL、API key、model。\n\n也可以设环境变量 `MINIMAX_API_KEY` / `MINIMAX_BASE_URL` / `MINIMAX_MODEL`。', en: '⚠️ **No MiniMax API key set**\n\nClick ⚙ at top-right, paste Base URL / API key / model.\n\nOr set env vars `MINIMAX_API_KEY` / `MINIMAX_BASE_URL` / `MINIMAX_MODEL`.' },
  'err.timeout.md':            { 'zh-CN': '⚠️ **LLM 调用超时**\n\n可能是网络不通或上游过载。稍后再试。', en: '⚠️ **LLM call timed out**\n\nNetwork issue or upstream busy. Try again shortly.' },
  'err.network.md':            { 'zh-CN': '⚠️ **网络出错**\n\n检查能否访问 MiniMax endpoint。', en: '⚠️ **Network error**\n\nCheck access to the MiniMax endpoint.' },
  'err.no_content.md':         { 'zh-CN': '⚠️ **LLM 没返回正文**\n\n可能是模型名错或 quota 用完。', en: '⚠️ **Empty LLM response**\n\nBad model name or quota exhausted.' },
  'err.generic.md':            { 'zh-CN': '⚠️ **LLM 调用失败**\n\nerror_code: `{code}`{model}', en: '⚠️ **LLM call failed**\n\nerror_code: `{code}`{model}' },
};

function t(key, lang, params) {
  if (typeof key !== 'string') return '';
  const entry = dict[key];
  const fb = 'zh-CN';
  const raw = (entry && (entry[lang] || entry[fb])) || key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (m, k) => (params[k] != null ? String(params[k]) : m));
}

function flatStrings(lang) {
  const out = {};
  for (const k of Object.keys(dict)) out[k] = (dict[k] && (dict[k][lang] || dict[k]['zh-CN'])) || k;
  return out;
}

module.exports = { t, flatStrings, supportedLangs: ['zh-CN', 'en'] };
