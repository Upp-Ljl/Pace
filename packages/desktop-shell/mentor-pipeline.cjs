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
 *   single Anthropic API call          — sonnet, markdown out
 *      ↓
 *   persist via db.logMentorTurn()
 *      ↓
 *   { markdown, debug }                — returned to renderer
 *
 * Future versions split Stage 2 (haiku activity classification) from
 * Stage 4 (sonnet generation), load PMP skills from ~/.pace/skills/,
 * and route to per-question-type prompt templates (communication /
 * stakeholder / risk).
 */

const crypto = require('crypto');
const ccBridge = require('./cc-bridge.cjs');
const config = require('./config.cjs');
const db = require('./db.cjs');

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MAX_TOKENS = 2048;

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

如果数据不够（git 不可用 / 没有 transcript），明确说"上下文不够，我只能基于你字面的描述给一个泛泛的判断"，**不要瞎编**用户在干什么。

# 输出格式（markdown）

第一段：阶段判断（一句话点出过程组 + 知识域 + 活动编号）。
第二段：下一步建议（2-3 条 bullet，每条带"找谁 / 怎么做"）。
（可选）第三段：如果用户问到沟通，给一段套前-中-后框架的话术稿。

简短、可执行。不要超过 300 字，除非用户明确要详细展开。`;

function buildUserPromptBlock(userInput, ctx) {
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
  return parts.join('\n');
}

async function callAnthropic(apiKey, model, system, userBlock) {
  const t0 = Date.now();
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: DEFAULT_MAX_TOKENS,
      system,
      messages: [{ role: 'user', content: userBlock }],
    }),
  });
  const elapsed = Date.now() - t0;
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errMsg = (json && (json.error?.message || json.message)) || `HTTP ${res.status}`;
    const e = new Error(`Anthropic API error: ${errMsg}`);
    e.status = res.status;
    e.body = json;
    throw e;
  }
  const text = (json.content && json.content[0] && json.content[0].text) || '';
  return {
    text,
    usage: json.usage || null,
    model: json.model || model,
    elapsed_ms: elapsed,
  };
}

async function runMentorTurn(userInput, opts) {
  const o = opts || {};
  const cwd = o.cwd || process.cwd();
  const turnId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const apiKey = config.getApiKey();
  if (!apiKey) {
    return {
      turn_id: turnId,
      markdown: [
        '⚠️ **还没设置 LLM key**',
        '',
        '点右上角设置图标，粘贴你的 Anthropic API key（`sk-ant-...`），或设环境变量 `ANTHROPIC_API_KEY`。',
        '',
        '设置后再来问一次。',
      ].join('\n'),
      debug: { stage: 'no_api_key', source: config.getSettings().api_key_source },
    };
  }

  const ctx = ccBridge.collect({
    cwd,
    includeTranscript: true,
    transcriptN: 8,
  });

  const settings = config.getSettings();
  const model = settings.llm_model || 'claude-sonnet-4-6';
  const userBlock = buildUserPromptBlock(userInput, ctx);

  let resp;
  try {
    resp = await callAnthropic(apiKey, model, PMP_SYSTEM_PROMPT, userBlock);
  } catch (err) {
    return {
      turn_id: turnId,
      markdown: [
        '⚠️ **LLM 调用失败**',
        '',
        `\`${err.message}\``,
        '',
        '常见原因：API key 错 / 网络不通 / model 名不存在 / 配额超限。可在设置页换 model 或 key。',
      ].join('\n'),
      debug: { stage: 'llm_error', error: err.message, status: err.status, ctx_meta: ctx._meta },
    };
  }

  const debug = {
    stage: 'ok',
    model: resp.model,
    elapsed_ms: resp.elapsed_ms,
    ctx_meta: ctx._meta,
    git_available: !!(ctx.git && ctx.git.available),
    cc_session_found: !!ctx.cc_session,
    transcript_count: (ctx.transcript || []).length,
  };

  // Persist (best-effort; never block reply on DB)
  try {
    db.logMentorTurn({
      turn_id: turnId,
      created_at: createdAt,
      project_id: (ctx.git && ctx.git.git_root) || null,
      cwd,
      user_input: userInput,
      mentor_reply: resp.text,
      debug,
      llm_model: resp.model,
      tokens_in:  resp.usage ? resp.usage.input_tokens : null,
      tokens_out: resp.usage ? resp.usage.output_tokens : null,
      latency_ms: resp.elapsed_ms,
    });
  } catch (dbErr) {
    debug.db_persist_error = dbErr.message;
  }

  return {
    turn_id: turnId,
    markdown: resp.text,
    debug,
  };
}

module.exports = {
  runMentorTurn,
  PMP_SYSTEM_PROMPT,
};
