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

const PMP_SYSTEM_PROMPT = `你是 Pace，一位 PMP-style mentor，帮助职场人在使用 Claude Code 时把控项目节奏。

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

简短、可执行。不要超过 300 字，除非用户明确要详细展开。`;

function buildUserBlock(userInput, ctx, team) {
  const parts = [];
  parts.push('## 用户原话');
  parts.push(userInput);

  parts.push('\n## cc 上下文（按需读取，可能为空）');
  if (ctx.git && ctx.git.available) {
    parts.push(`- 当前工作目录的 git root: \`${ctx.git.git_root}\``);
    if (ctx.git.git_remote) parts.push(`- origin: ${ctx.git.git_remote}`);
    if (ctx.git.git_branch) parts.push(`- branch: ${ctx.git.git_branch}`);
    if (ctx.git.dirty_count) parts.push(`- 未提交改动: ${ctx.git.dirty_count} 个文件`);
    if (ctx.git.recent_log && ctx.git.recent_log.length) {
      parts.push(`- 最近 5 个 commit:`);
      ctx.git.recent_log.forEach((c) => parts.push(`  - ${c}`));
    }
  } else {
    parts.push('- git 不可用 / 当前目录不是 git 仓库');
  }

  if (ctx.cc_session) {
    parts.push(`- cc session 最近活跃: ${new Date(ctx.cc_session.last_mtime_ms).toISOString()}`);
  } else {
    parts.push('- 没找到关联的 cc session 文件');
  }

  if (ctx.transcript && ctx.transcript.length) {
    parts.push(`\n## 最近 ${ctx.transcript.length} 轮 cc 对话摘要`);
    ctx.transcript.forEach((m) => {
      const tag = m.role === 'user' ? '👤 用户' : '🤖 cc';
      parts.push(`${tag}：${m.text.slice(0, 300)}${m.text.length > 300 ? '…' : ''}`);
    });
  }

  // Team / 干系人
  if (team && team.length) {
    parts.push('\n## 当前项目团队（RACI 标注是用户填的：R=负责 A=批准 C=咨询 I=告知）');
    team.forEach((m) => {
      const raci = (m.raci || []).join('');
      const role = m.role ? ` · ${m.role}` : '';
      const notes = m.notes ? ` · ${m.notes}` : '';
      parts.push(`- ${m.name}${role}${raci ? ' · RACI: ' + raci : ''}${notes}`);
    });
    parts.push('\n**建议在回答里点名相关同事**（不要泛泛说"找产品"）。');
  } else {
    parts.push('\n## 团队：用户还没在 Pace 里登记同事');
  }
  return parts.join('\n');
}

function errorMarkdown(code, model) {
  const map = {
    no_key: ['⚠️ **还没设置 MiniMax API key**',
             '',
             '点右上角 ⚙ 设置图标，粘贴 Base URL（默认 `https://api.minimaxi.com/v1`）、API key、model（默认 `MiniMax-M2.7`）。',
             '',
             '也可以设环境变量 `MINIMAX_API_KEY` / `MINIMAX_BASE_URL` / `MINIMAX_MODEL`。'],
    incomplete_config: ['⚠️ **MiniMax 配置不完整**',
                        '',
                        '需要同时配 base URL + API key + model 三项。点设置确认。'],
    timeout: ['⚠️ **LLM 调用超时**（20s）', '', '可能是网络不通或上游过载。稍后再试。'],
    network: ['⚠️ **网络出错**', '', '检查能否访问 MiniMax endpoint。'],
    no_content: ['⚠️ **LLM 没返回正文**', '', '可能是模型名错或 quota 用完。看设置里的 model 是否拼对。'],
    no_fetch:   ['⚠️ **运行环境不支持 fetch**', '', 'Pace 需要 Electron 28+ / Node 18+。升级一下。'],
  };
  const lines = map[code] || [`⚠️ **LLM 调用失败**`, '', `error_code: \`${code}\`${model ? ' · model=' + model : ''}`];
  return lines.join('\n');
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

  const userBlock = buildUserBlock(userInput, ctx, team);

  const t0 = Date.now();
  const resp = await llmClient.chatJson(
    {
      messages: [
        { role: 'system', content: PMP_SYSTEM_PROMPT },
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

module.exports = {
  runMentorTurn,
  PMP_SYSTEM_PROMPT,
};
