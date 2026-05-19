'use strict';

/**
 * Pace mentor pipeline — v0.1 end-to-end orchestrator.
 *
 *   user input
 *      ↓
 *   cc-bridge.collect()                — gather git + cc session + transcript
 *      ↓
 *   build PMP system prompt            — embedded for v0.1 (skills-loader next)
 *      ↓
 *   single MiniMax /chat/completions   — via llm-client.cjs (OpenAI-compat)
 *      ↓
 *   persist via db.logMentorTurn()
 *      ↓
 *   { markdown, debug }                — returned to renderer
 *
 * Provider: MiniMax (OpenAI-compatible). Endpoint and model come from
 * config.cjs which reads ~/.pace/config.json + env vars.
 */

const crypto = require('crypto');
const ccBridge = require('./cc-bridge.cjs');
const config = require('./config.cjs');
const llmClient = require('./llm-client.cjs');
const db = require('./db.cjs');
const mentorTools = require('./mentor-tools.cjs');
const i18n = require('./i18n.cjs');

const PMP_SYSTEM_PROMPT_EN = `You are Pace — a PMP-style mentor helping a knowledge worker who uses Claude Code heavily keep project rhythm.

# How you work

1. Look at the user's current workspace context (git / cc / transcript).
2. Map their current activity to the PMBOK 6th edition matrix of 5 Process Groups × 10 Knowledge Areas.
3. Provide at least one of three useful kinds of help:
   - Stage diagnosis: which process group and knowledge area they're in, which PMBOK activity it maps to.
   - Next step: best-practice next action (who to align with, RACI hint).
   - Communication script: if they ask "how do I bring this up", apply the Before-Middle-After framework (前-中-后 of: topic+channel / equal info + control + empathy / conclusion + owner + time + email-archive).

# PMBOK Process Groups
- Initiating
- Planning
- Executing
- Monitoring & Controlling
- Closing

# PMBOK Knowledge Areas
- Integration / Scope / Schedule / Cost / Quality / Resource / Communications / Risk / Procurement / Stakeholder

# Data honesty (hard constraint)

Every claim must clearly mark its source:
- ✅ **cc log confirmed**: facts pulled from real transcript / git status data.
- 🤔 **mentor inference**: judgment based on the PMP frame + assumptions.

If the data is insufficient (no git, no transcript), say so plainly — "context is thin, I can only give you a generic take based on your wording" — and do **not** invent what the user is doing.

# Output (markdown)

Para 1: stage diagnosis (one line stating process group + KA + activity).
Para 2: next-step recommendations (2-3 bullets, each "who / how").
(Optional) Para 3: if the user asked about communication, provide a Before-Middle-After scripted reply.

Keep it tight and actionable. Under 300 words unless the user asks for depth.

# Actionable TODO block (when applicable)

If your reply contains concrete commands the user could paste into Claude Code, a shell, or another agent, finish your markdown with:

\`\`\`
## 📋 TODO
- \`<one-line command or instruction>\` — short why
- \`<another command>\` — short why
\`\`\`

Wrap each command in backticks (so the panel can detect it). Append an em-dash + one-line rationale. Cap at 5 items. Skip the TODO block entirely if there's nothing concretely actionable.`;

const PMP_SYSTEM_PROMPT_ZH = `你是 Pace，一位 PMP-style mentor，帮助职场人在使用 Claude Code 时把控项目节奏。

# 你的工作方式

1. 看用户的当前工作上下文（git / cc session / transcript）。
2. 把用户当前的活动映射到 PMBOK 第 6 版的 5 大过程组 × 10 大知识领域矩阵之一。
3. 给出三类有用的建议中至少一类：
   - 阶段判断：你现在处于哪个过程组和知识域，对应哪个 PMBOK 活动
   - 下一步：这个阶段的 best-practice next step（含找谁对齐 / RACI 角色提示）
   - 沟通话术：如果用户问"怎么开口"，套用「前(主题+方式) - 中(对等+控场+同理) - 后(结论+落人+时间点)」三段框架

# PMBOK 5 大过程组
- Initiating（启动）
- Planning（规划）
- Executing（执行）
- Monitoring & Controlling（监控）
- Closing（收尾）

# PMBOK 10 大知识领域
- Integration / Scope / Schedule / Cost / Quality / Resource / Communications / Risk / Procurement / Stakeholder

# 数据诚实原则（硬约束）

你给的每条结论必须显式区分两种来源：
- ✅ **cc 日志确证**：从 transcript / git status 等真实数据看出来的事实
- 🤔 **mentor 推断**：基于 PMP 框架的判断 + 假设

如果数据不够（git 不可用 / 没有 transcript），明确说"上下文不够，我只能基于你字面的描述给一个泛泛的判断"，不要瞎编用户在干什么。

# 输出格式（markdown）

第一段：阶段判断（一句话点出过程组 + 知识域 + 活动编号）。
第二段：下一步建议（2-3 条 bullet，每条带"找谁 / 怎么做"）。
（可选）第三段：如果用户问到沟通，给一段套前-中-后框架的话术稿。

简短、可执行。不要超过 300 字，除非用户明确要详细展开。

# 可执行 TODO 块（如果回答里有具体可执行动作）

如果你的回答里有用户可以直接粘到 cc / shell / 其它 agent 跑的具体指令，请在 markdown 答案最末加一段：

\`\`\`
## 📋 TODO
- \`<一行命令或指令>\` — 简短说明
- \`<另一行命令>\` — 简短说明
\`\`\`

每行用 backtick 包住指令本身（让 panel 能识别），后面用 em dash 加一句话解释。不要超过 5 条。如果没有具体可执行动作，**不要加这段**。`;

function currentLang() {
  try { return config.getSettings().language || 'zh-CN'; }
  catch (_e) { return 'zh-CN'; }
}

function pmpSystemPrompt(lang) {
  return lang === 'en' ? PMP_SYSTEM_PROMPT_EN : PMP_SYSTEM_PROMPT_ZH;
}
// Backwards-compat export name (used externally for testing)
const PMP_SYSTEM_PROMPT = PMP_SYSTEM_PROMPT_ZH;

function buildMemberPersonaPrompt(m, lang) {
  if (lang === 'en') return buildMemberPersonaPromptEN(m);
  return buildMemberPersonaPromptZH(m);
}

function buildMemberPersonaPromptEN(m) {
  const raci = (m.raci || []).join('') || '(none)';
  return `You are roleplaying as a colleague on the user's team: **${m.name}** (role: ${m.role || 'unspecified'}).

# Identity
- RACI relation: ${raci}
- Notes / comm preferences: ${m.notes || '(none on file)'}
- Agent / external handle: ${m.agent_id || '(none)'}

# How you speak
- You are not Pace the PMP mentor; you are this colleague's agent persona.
- You still understand PMP and reply from your role's lens (${m.role || 'team member'}).
- First person ("As ${m.name}, I think...").
- Stay in role:
  - PM / PO: scope, stakeholders, business value
  - Eng: implementation, risk, interfaces
  - Designer: UX consistency, design specs
  - QA: quality, test coverage
  - Others: their own lens
- Concise, quiet, no preaching. 80-150 words.
- RACI A (Accountable) → you can ask clarifying questions or set conditions.
- RACI C (Consulted) → give direct opinions.
- RACI I (Informed) → mainly respond with "got it / anything else I should know?"

# Data honesty
You can see the user's git / cc / team list. Don't fabricate.
If unsure, say "I don't have much on X, can you say more?"
`;
}

function buildMemberPersonaPromptZH(m) {
  const raci = (m.raci || []).join('') || '(无)';
  return `你正在扮演用户团队里的一位同事：**${m.name}**（角色：${m.role || '未填'}）。

# 身份设定
- 你的 RACI 关系：${raci}
- 你的备注 / 沟通偏好：${m.notes || '（用户没填）'}
- 你的 agent / 外部身份代号：${m.agent_id || '（无）'}

# 你怎么说话
- 你不是 Pace 这个 PMP mentor 本人；你是这位同事的"agent 化身"。
- 但你仍然懂 PMP 框架，能从你的角色视角（${m.role || '团队成员'}）给用户反馈。
- 用第一人称（"我作为 ${m.name}..."）。
- 保持你这个角色的视角约束：
  - PM/PO 关注 scope / 干系人 / 业务价值
  - Eng 关注实现 / 风险 / 接口
  - Designer 关注体验一致性 / 设计规范
  - QA 关注质量 / 测试覆盖
  - 其他角色照自己的 lens 来
- 简短、淡淡的、不说教。80-150 字。
- 如果你的 RACI 标了 A（批准），用户的事需要你 OK，你可以问澄清问题或给条件。
- 如果你的 RACI 标了 C（咨询），你可以直接给意见。
- 如果你的 RACI 标了 I（告知），你主要回应"知道了 / 还有什么需要我知道的"。

# 数据诚实
你看得到用户 git 状态 / cc 上下文 / 团队列表，但不要瞎编。
基于真实数据说话；不知道就说"我这边不太清楚 X，能不能多讲两句"。
`;
}

function buildUserBlock(userInput, ctx, team, asMember, lang) {
  const isEn = lang === 'en';
  const L = isEn ? {
    user_says: '## What the user said',
    cc_ctx:    '\n## cc context (lazy-read, may be empty)',
    root:      '- working tree git root',
    origin:    '- origin',
    branch:    '- branch',
    dirty:     '- uncommitted changes',
    files:     'file(s)',
    recent:    '- recent 5 commits:',
    no_git:    '- git unavailable / not a git repo',
    cc_active: '- last cc session activity',
    cc_none:   '- no associated cc session found',
    transcript:'\n## Recent {n} cc-turn excerpt',
    user_tag:  '👤 user',
    cc_tag:    '🤖 cc',
    team_hdr:  '\n## Project team (RACI: R=Responsible A=Accountable C=Consulted I=Informed)',
    notes_lbl: 'notes',
    agent_lbl: 'agent/handle',
    name_nudge:'\n**Refer to specific colleagues by name** (don\'t say "loop in product" generically). If they have an agent/handle, reference it in scripts (e.g. "ping slack:@tom").',
    team_none: '\n## Team: user has not registered colleagues yet',
  } : {
    user_says: '## 用户原话',
    cc_ctx:    '\n## cc 上下文（按需读取，可能为空）',
    root:      '- 当前工作目录的 git root',
    origin:    '- origin',
    branch:    '- branch',
    dirty:     '- 未提交改动',
    files:     '个文件',
    recent:    '- 最近 5 个 commit:',
    no_git:    '- git 不可用 / 当前目录不是 git 仓库',
    cc_active: '- cc session 最近活跃',
    cc_none:   '- 没找到关联的 cc session 文件',
    transcript:'\n## 最近 {n} 轮 cc 对话摘要',
    user_tag:  '👤 用户',
    cc_tag:    '🤖 cc',
    team_hdr:  '\n## 当前项目团队（RACI 标注：R=负责 A=批准 C=咨询 I=告知）',
    notes_lbl: '备注',
    agent_lbl: 'agent/外部身份',
    name_nudge:'\n**建议在回答里点名相关同事**（不要泛泛说"找产品"）。如有 agent/外部身份字段，可以在话术里 reference（比如 "在 slack:@tom 上同步"）。',
    team_none: '\n## 团队：用户还没在 Pace 里登记同事',
  };

  const parts = [];
  parts.push(L.user_says);
  parts.push(userInput);

  parts.push(L.cc_ctx);
  if (ctx.git && ctx.git.available) {
    parts.push(`${L.root}: \`${ctx.git.git_root}\``);
    if (ctx.git.git_remote) parts.push(`${L.origin}: ${ctx.git.git_remote}`);
    if (ctx.git.git_branch) parts.push(`${L.branch}: ${ctx.git.git_branch}`);
    if (ctx.git.dirty_count) parts.push(`${L.dirty}: ${ctx.git.dirty_count} ${L.files}`);
    if (ctx.git.recent_log && ctx.git.recent_log.length) {
      parts.push(L.recent);
      ctx.git.recent_log.forEach((c) => parts.push(`  - ${c}`));
    }
  } else {
    parts.push(L.no_git);
  }

  if (ctx.cc_session) {
    parts.push(`${L.cc_active}: ${new Date(ctx.cc_session.last_mtime_ms).toISOString()}`);
  } else {
    parts.push(L.cc_none);
  }

  if (ctx.transcript && ctx.transcript.length) {
    parts.push(L.transcript.replace('{n}', String(ctx.transcript.length)));
    ctx.transcript.forEach((m) => {
      const tag = m.role === 'user' ? L.user_tag : L.cc_tag;
      parts.push(`${tag}: ${m.text.slice(0, 300)}${m.text.length > 300 ? '…' : ''}`);
    });
  }

  if (team && team.length) {
    parts.push(L.team_hdr);
    team.forEach((m) => {
      const raci = (m.raci || []).join('');
      const role = m.role ? ` · ${m.role}` : '';
      const notes = m.notes ? ` · ${L.notes_lbl}: ${m.notes}` : '';
      const agent = m.agent_id ? ` · ${L.agent_lbl}: ${m.agent_id}` : '';
      parts.push(`- ${m.name}${role}${raci ? ' · RACI: ' + raci : ''}${notes}${agent}`);
    });
    parts.push(L.name_nudge);
  } else {
    parts.push(L.team_none);
  }
  return parts.join('\n');
}

function errorMarkdown(code, model) {
  const lang = currentLang();
  const keyMap = {
    no_key: 'err.no_key.md',
    incomplete_config: 'err.no_key.md',
    timeout: 'err.timeout.md',
    stream_idle: 'err.stream_idle.md',
    network: 'err.network.md',
    no_content: 'err.no_content.md',
    no_fetch:   'err.network.md',
  };
  const k = keyMap[code];
  if (k) return i18n.t(k, lang);
  return i18n.t('err.generic.md', lang, { code, model: model ? ' · model=' + model : '' });
}

async function runMentorTurn(userInput, opts) {
  const o = opts || {};
  const cwd = o.cwd || process.cwd();
  const turnId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const provider = config.getMinimaxProvider();
  if (!provider.enabled) {
    return {
      turn_id: turnId,
      markdown: errorMarkdown(provider.reason),
      debug: { stage: 'no_provider', reason: provider.reason },
    };
  }

  const ctx = ccBridge.collect({
    cwd,
    includeTranscript: true,
    transcriptN: 8,
  });

  // Pull team for the project (best-effort, never block)
  let team = [];
  try {
    const projectId = (ctx.git && ctx.git.git_root) || cwd;
    team = db.listTeamMembers(projectId);
  } catch (_e) { /* db may be unavailable in pure-Node smoke */ }

  const langA = currentLang();
  const userBlock = buildUserBlock(userInput, ctx, team, null, langA);

  const t0 = Date.now();
  const resp = await llmClient.chatJson(
    {
      messages: [
        { role: 'system', content: pmpSystemPrompt(langA) },
        { role: 'user', content: userBlock },
      ],
      temperature: 0.3,
      max_tokens: 4096,  // MiniMax-M2.7 needs headroom for <think> + final answer
    },
    { provider, timeoutMs: 90_000 }  // thinking models can spend 30-60s on PMP prompts
  );
  const elapsed = Date.now() - t0;

  if (!resp.ok) {
    return {
      turn_id: turnId,
      markdown: errorMarkdown(resp.error_code, resp.model),
      debug: {
        stage: 'llm_error',
        error_code: resp.error_code,
        model: resp.model,
        elapsed_ms: elapsed,
        ctx_meta: ctx._meta,
      },
    };
  }

  // Thinking models (MiniMax-M2.7) emit <think>...</think> reasoning
  // blocks inline. Strip before showing to user — they're internal
  // reasoning, not the mentor answer.
  const stripped = stripThinkBlocks(resp.text);

  const debug = {
    stage: 'ok',
    model: resp.model,
    elapsed_ms: elapsed,
    ctx_meta: ctx._meta,
    git_available: !!(ctx.git && ctx.git.available),
    cc_session_found: !!ctx.cc_session,
    transcript_count: (ctx.transcript || []).length,
    team_size: team.length,
    api_key_source:    provider._source.api_key,
    base_url_source:   provider._source.base_url,
    model_source:      provider._source.model,
    think_chars_stripped: resp.text.length - stripped.length,
  };

  try {
    db.logMentorTurn({
      turn_id: turnId,
      created_at: createdAt,
      project_id: (ctx.git && ctx.git.git_root) || null,
      cwd,
      user_input: userInput,
      mentor_reply: stripped,
      debug,
      llm_model: resp.model,
      latency_ms: elapsed,
    });
  } catch (dbErr) {
    debug.db_persist_error = dbErr.message;
  }

  return {
    turn_id: turnId,
    markdown: stripped,
    debug,
  };
}

function stripThinkBlocks(text) {
  if (!text || typeof text !== 'string') return '';
  // Greedy strip of <think>...</think> blocks (case-insensitive).
  // Also strip lone <think> at end (unterminated reasoning if model
  // ran out of tokens) so user sees something coherent rather than
  // mid-thought.
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<think>[\s\S]*$/i, '')
    .replace(/^\s*\n+/, '')
    .trim();
}

/**
 * Streaming variant of runMentorTurn.
 *
 * onChunk fires with one of:
 *   { type: 'thinking', text }    — chars inside <think>...</think>
 *   { type: 'answer',   text }    — chars after </think>
 *   { type: 'done',     final, debug }
 *   { type: 'error',    code, markdown, debug }
 *
 * Returns the same final shape as runMentorTurn.
 */
async function runMentorTurnStream(userInput, opts, onChunk) {
  const safeEmit = (chunk) => { try { onChunk && onChunk(chunk); } catch (_e) {} };
  const o = opts || {};
  const cwd = o.cwd || process.cwd();
  const turnId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const provider = config.getMinimaxProvider();
  if (!provider.enabled) {
    const md = errorMarkdown(provider.reason);
    safeEmit({ type: 'error', code: provider.reason, markdown: md });
    return {
      turn_id: turnId,
      markdown: md,
      debug: { stage: 'no_provider', reason: provider.reason },
    };
  }

  const ctx = ccBridge.collect({
    cwd,
    includeTranscript: true,
    transcriptN: 8,
  });

  let team = [];
  let asMember = null;
  try {
    const projectId = (ctx.git && ctx.git.git_root) || cwd;
    team = db.listTeamMembers(projectId);
    if (o.as_member_id) {
      asMember = team.find((m) => m.id === o.as_member_id) || null;
    }
  } catch (_e) { /* ignore */ }

  // Choose system prompt — default PMP mentor, or member persona
  const lang = currentLang();
  const systemPrompt = asMember ? buildMemberPersonaPrompt(asMember, lang) : pmpSystemPrompt(lang);
  const userBlock = buildUserBlock(userInput, ctx, team, asMember, lang);

  // <think> parser state machine
  let state = 'pre_think'; // 'pre_think' | 'in_think' | 'answer'
  let pending = '';
  let thinkingAccum = '';
  let answerAccum = '';
  const TAG_OPEN  = '<think>';
  const TAG_CLOSE = '</think>';
  const MAX_PARTIAL_TAG = Math.max(TAG_OPEN.length, TAG_CLOSE.length);

  function consumePending() {
    // Advance state machine through pending buffer, emit cleaned chunks.
    while (pending.length) {
      if (state === 'pre_think') {
        const idx = pending.indexOf(TAG_OPEN);
        if (idx >= 0) {
          // discard anything before <think> (usually empty)
          pending = pending.slice(idx + TAG_OPEN.length);
          state = 'in_think';
          continue;
        }
        // No opening tag yet. If buffer is large and no tag found,
        // assume the model didn't emit a thinking block — treat as answer.
        if (pending.length > 256) {
          state = 'answer';
          continue;
        }
        // Wait for more bytes
        return;
      }
      if (state === 'in_think') {
        const idx = pending.indexOf(TAG_CLOSE);
        if (idx >= 0) {
          const piece = pending.slice(0, idx);
          if (piece) {
            thinkingAccum += piece;
            safeEmit({ type: 'thinking', text: piece });
          }
          pending = pending.slice(idx + TAG_CLOSE.length);
          state = 'answer';
          continue;
        }
        // Emit all but last MAX_PARTIAL_TAG-1 bytes (might contain partial </think>)
        if (pending.length > MAX_PARTIAL_TAG) {
          const safe = pending.slice(0, pending.length - (MAX_PARTIAL_TAG - 1));
          thinkingAccum += safe;
          safeEmit({ type: 'thinking', text: safe });
          pending = pending.slice(safe.length);
        }
        return;
      }
      if (state === 'answer') {
        // Emit everything immediately
        answerAccum += pending;
        safeEmit({ type: 'answer', text: pending });
        pending = '';
        return;
      }
    }
  }

  const t0 = Date.now();
  const resp = await llmClient.chatStream(
    {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userBlock },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    },
    {
      provider,
      timeoutMs: 120_000,
      signal: o.signal,
      onChunk: ({ type, text }) => {
        if (type !== 'delta') return;
        pending += text;
        consumePending();
      },
    }
  );
  const elapsed = Date.now() - t0;

  // Flush any remaining pending content
  if (pending.length) {
    if (state === 'in_think') {
      thinkingAccum += pending;
      safeEmit({ type: 'thinking', text: pending });
    } else {
      answerAccum += pending;
      safeEmit({ type: 'answer', text: pending });
    }
    pending = '';
  }

  if (!resp.ok) {
    const md = errorMarkdown(resp.error_code, resp.model);
    const debug = {
      stage: 'llm_error',
      error_code: resp.error_code,
      model: resp.model,
      elapsed_ms: elapsed,
      ctx_meta: ctx._meta,
    };
    safeEmit({ type: 'error', code: resp.error_code, markdown: md, debug });
    return { turn_id: turnId, markdown: md, debug };
  }

  // Strip any stray <think> blocks just in case (shouldn't happen post-parser)
  const finalAnswer = answerAccum.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  const debug = {
    stage: 'ok',
    model: resp.model,
    elapsed_ms: elapsed,
    ctx_meta: ctx._meta,
    git_available: !!(ctx.git && ctx.git.available),
    cc_session_found: !!ctx.cc_session,
    transcript_count: (ctx.transcript || []).length,
    team_size: team.length,
    api_key_source:  provider._source.api_key,
    base_url_source: provider._source.base_url,
    model_source:    provider._source.model,
    thinking_chars: thinkingAccum.length,
    answer_chars:   finalAnswer.length,
    streamed: true,
  };

  try {
    db.logMentorTurn({
      turn_id: turnId,
      created_at: createdAt,
      project_id: (ctx.git && ctx.git.git_root) || null,
      cwd,
      user_input: userInput,
      mentor_reply: finalAnswer,
      debug,
      llm_model: resp.model,
      latency_ms: elapsed,
    });
  } catch (dbErr) {
    debug.db_persist_error = dbErr.message;
  }

  safeEmit({ type: 'done', final: finalAnswer, debug });
  return { turn_id: turnId, markdown: finalAnswer, debug };
}

/**
 * Agent-mode streaming: multi-turn history + read-only tool calls.
 *
 * onChunk events (extends runMentorTurnStream):
 *   {type:'thinking', text}
 *   {type:'answer',   text}
 *   {type:'tool_call', name, args}
 *   {type:'tool_result', name, ok, preview}
 *   {type:'done', final, debug}
 *   {type:'error', code, markdown, debug}
 */
async function runMentorAgentStream(userText, opts, onChunk) {
  const safeEmit = (chunk) => { try { onChunk && onChunk(chunk); } catch (_e) {} };
  const o = opts || {};
  const cwd = o.cwd || process.cwd();
  const turnId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const provider = config.getMinimaxProvider();
  if (!provider.enabled) {
    const md = errorMarkdown(provider.reason);
    safeEmit({ type: 'error', code: provider.reason, markdown: md });
    return { turn_id: turnId, markdown: md, debug: { stage: 'no_provider', reason: provider.reason } };
  }

  const ctx = ccBridge.collect({ cwd, includeTranscript: true, transcriptN: 8 });
  let team = [];
  let asMember = null;
  try {
    const projectId = (ctx.git && ctx.git.git_root) || cwd;
    team = db.listTeamMembers(projectId);
    if (o.as_member_id) asMember = team.find((m) => m.id === o.as_member_id) || null;
  } catch (_e) { /* ignore */ }

  const langB = currentLang();
  const systemPrompt = asMember ? buildMemberPersonaPrompt(asMember, langB) : pmpSystemPrompt(langB);
  const userBlock = buildUserBlock(userText, ctx, team, asMember, langB);

  // Conversation history from caller (previous user/assistant pairs)
  const history = Array.isArray(o.history)
    ? o.history.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string').slice(-12)
    : [];

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userBlock },
  ];

  const tools = mentorTools.toolSpecs();
  const t0 = Date.now();
  const usedTools = [];
  let usedAnyTool = false;

  // ---- Tool-call loop (non-streaming) ----
  const MAX_TOOL_ROUNDS = 4;
  let lastNonToolMsg = null;
  for (let iter = 0; iter < MAX_TOOL_ROUNDS; iter++) {
    const resp = await llmClient.chatJsonTools(
      { messages, tools, temperature: 0.2, max_tokens: 2048 },
      { provider, timeoutMs: 60_000 }
    );
    if (!resp.ok) {
      const md = errorMarkdown(resp.error_code, resp.model);
      const debug = { stage: 'llm_error', error_code: resp.error_code, model: resp.model, elapsed_ms: Date.now() - t0 };
      safeEmit({ type: 'error', code: resp.error_code, markdown: md, debug });
      return { turn_id: turnId, markdown: md, debug };
    }
    const msg = resp.message || {};
    if (Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0) {
      usedAnyTool = true;
      messages.push({
        role: 'assistant',
        content: msg.content || '',
        tool_calls: msg.tool_calls,
      });
      for (const tc of msg.tool_calls) {
        let args = {};
        try { args = JSON.parse(tc.function.arguments || '{}'); } catch (_e) {}
        safeEmit({ type: 'tool_call', name: tc.function.name, args });
        const result = mentorTools.executeTool(tc.function.name, args, ctx);
        usedTools.push({ name: tc.function.name, ok: result && result.ok !== false });
        safeEmit({
          type: 'tool_result',
          name: tc.function.name,
          ok: result && result.ok !== false,
          preview: previewToolResult(result),
        });
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: JSON.stringify(result).slice(0, 12_000),
        });
      }
      continue;  // next round
    }
    // No more tool calls
    lastNonToolMsg = msg;
    break;
  }

  // ---- Final answer ----
  // If we used tools, do a streaming call so user gets per-token UX after the tools settle.
  // If we never used tools, pseudo-stream the content for consistent UX
  // (cheaper than a 2nd LLM call, smoother than a single dump).
  if (!usedAnyTool && lastNonToolMsg) {
    const stripped = stripThinkBlocks(lastNonToolMsg.content || '');
    const elapsed = Date.now() - t0;
    const debug = {
      stage: 'ok',
      model: provider.model,
      elapsed_ms: elapsed,
      ctx_meta: ctx._meta,
      git_available: !!(ctx.git && ctx.git.available),
      cc_session_found: !!ctx.cc_session,
      transcript_count: (ctx.transcript || []).length,
      team_size: team.length,
      api_key_source:  provider._source.api_key,
      base_url_source: provider._source.base_url,
      model_source:    provider._source.model,
      used_tools:      [],
      streamed:        'pseudo',
      agent_mode:      true,
      as_member_id:    asMember ? asMember.id : null,
    };
    // Pseudo-stream in 12-char chunks with 14ms gap → smooth typing feel.
    const CHUNK = 12;
    const GAP   = 14;
    for (let i = 0; i < stripped.length; i += CHUNK) {
      safeEmit({ type: 'answer', text: stripped.slice(i, i + CHUNK) });
      if (i + CHUNK < stripped.length) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, GAP));
      }
    }
    persistTurn({ turnId, createdAt, cwd, ctx, userText, mentor_reply: stripped, debug, elapsed });
    safeEmit({ type: 'done', final: stripped, debug });
    return { turn_id: turnId, markdown: stripped, debug };
  }

  // Final streaming call with all accumulated messages (post tool rounds)
  let state = 'pre_think';
  let pending = '';
  let thinkingAccum = '';
  let answerAccum = '';
  const TAG_OPEN  = '<think>';
  const TAG_CLOSE = '</think>';
  const MAX_PARTIAL_TAG = Math.max(TAG_OPEN.length, TAG_CLOSE.length);
  function consumePending() {
    while (pending.length) {
      if (state === 'pre_think') {
        const idx = pending.indexOf(TAG_OPEN);
        if (idx >= 0) { pending = pending.slice(idx + TAG_OPEN.length); state = 'in_think'; continue; }
        // If the buffer doesn't start with '<' at all, it's plain answer
        // text — switch to streaming immediately so short replies stream.
        if (pending.length > 0 && pending[0] !== '<') { state = 'answer'; continue; }
        // Starts with '<' — give it enough chars to either complete the
        // `<think>` opening tag OR prove it's something else (a small budget).
        if (pending.length > TAG_OPEN.length + 4) { state = 'answer'; continue; }
        return;
      }
      if (state === 'in_think') {
        const idx = pending.indexOf(TAG_CLOSE);
        if (idx >= 0) {
          const piece = pending.slice(0, idx);
          if (piece) { thinkingAccum += piece; safeEmit({ type:'thinking', text: piece }); }
          pending = pending.slice(idx + TAG_CLOSE.length);
          state = 'answer';
          continue;
        }
        if (pending.length > MAX_PARTIAL_TAG) {
          const safe = pending.slice(0, pending.length - (MAX_PARTIAL_TAG - 1));
          thinkingAccum += safe; safeEmit({ type:'thinking', text: safe });
          pending = pending.slice(safe.length);
        }
        return;
      }
      if (state === 'answer') {
        answerAccum += pending;
        safeEmit({ type:'answer', text: pending });
        pending = '';
        return;
      }
    }
  }

  const resp2 = await llmClient.chatStream(
    { messages, temperature: 0.3, max_tokens: 4096 },
    {
      provider,
      timeoutMs: 120_000,
      onChunk: ({ type, text }) => {
        if (type !== 'delta') return;
        pending += text;
        consumePending();
      },
    }
  );

  if (pending.length) {
    if (state === 'in_think') { thinkingAccum += pending; safeEmit({ type:'thinking', text: pending }); }
    else { answerAccum += pending; safeEmit({ type:'answer', text: pending }); }
    pending = '';
  }

  const elapsed = Date.now() - t0;
  if (!resp2.ok) {
    const md = errorMarkdown(resp2.error_code, resp2.model);
    const debug = { stage: 'llm_error_after_tools', error_code: resp2.error_code, model: resp2.model, elapsed_ms: elapsed, used_tools: usedTools };
    safeEmit({ type:'error', code: resp2.error_code, markdown: md, debug });
    return { turn_id: turnId, markdown: md, debug };
  }

  const finalAnswer = answerAccum.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  const debug = {
    stage: 'ok',
    model: resp2.model,
    elapsed_ms: elapsed,
    ctx_meta: ctx._meta,
    git_available: !!(ctx.git && ctx.git.available),
    cc_session_found: !!ctx.cc_session,
    transcript_count: (ctx.transcript || []).length,
    team_size: team.length,
    api_key_source:  provider._source.api_key,
    base_url_source: provider._source.base_url,
    model_source:    provider._source.model,
    used_tools:      usedTools,
    streamed:        true,
    agent_mode:      true,
    as_member_id:    asMember ? asMember.id : null,
    thinking_chars:  thinkingAccum.length,
    answer_chars:    finalAnswer.length,
  };

  persistTurn({ turnId, createdAt, cwd, ctx, userText, mentor_reply: finalAnswer, debug, elapsed });
  safeEmit({ type: 'done', final: finalAnswer, debug });
  return { turn_id: turnId, markdown: finalAnswer, debug };
}

function previewToolResult(result) {
  const isEn = currentLang() === 'en';
  if (!result) return isEn ? '(empty)' : '(空)';
  if (result.error) return '✗ ' + String(result.error).slice(0, 80);
  if (result.commits) return result.commits.length + (isEn ? ' commits' : ' 个 commit');
  if (result.entries) return result.entries.length + (isEn ? ' items' : ' 项');
  if (result.diff)    return (isEn ? 'diff ' : 'diff ') + result.diff.length + (isEn ? ' chars' : ' 字');
  if (result.content) return (result.lines_returned || '?') + (isEn ? ' lines' : ' 行内容');
  if (result.turns)   return result.turns.length + (isEn ? ' cc turn(s)' : ' 轮 cc 对话');
  return 'ok';
}

function persistTurn({ turnId, createdAt, cwd, ctx, userText, mentor_reply, debug, elapsed }) {
  try {
    db.logMentorTurn({
      turn_id: turnId,
      created_at: createdAt,
      project_id: (ctx.git && ctx.git.git_root) || null,
      cwd,
      user_input: userText,
      mentor_reply,
      debug,
      llm_model: debug.model,
      latency_ms: elapsed,
    });
  } catch (_e) { /* swallow */ }
}

module.exports = {
  runMentorTurn,
  runMentorTurnStream,
  runMentorAgentStream,
  PMP_SYSTEM_PROMPT,
};
