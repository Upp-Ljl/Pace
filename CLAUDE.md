# Pace — Claude 项目说明

> 这个文件给未来的 Claude 会话用。仓库特定的"踩过的坑"和"非显然的本地约定"放这里，避免每次重新诊断。新会话上来先读这一节，再做任何动作。

## Pace 是什么（定位先看，再看下面）

**Pace 是给重度使用 Claude Code (cc) 的职场人的 PMP-style mentor。**

把"会用 cc 但不会工作"的职场人变成"会工作的人"——告诉用户这个项目这个阶段该做什么、找谁对齐、用什么话术沟通。**核心用户是职场人（PM/设计/运营/市场/HR/内容/创业者），程序员是边缘用户，不是核心。**

它**不是**：
- ❌ 不写代码，不 spawn cc 子进程跑任务（那是 `D:\lll\d2p` 的事）
- ❌ 不是 task tracker / Jira / Linear / 看板 / 甘特图
- ❌ 不是 ChatGPT 聊天替代品
- ❌ 不替用户做决策（mentor 引导，不下命令）
- ❌ 不是 multi-agent coordination kernel
- ❌ 不是 IDE / cc plugin（独立 daemon-class 产品）
- ❌ 不是给程序员的工具
- ❌ 不是"Cairn 的新 UI"——Pace 是新产品，Cairn 是 kernel 依赖

完整定位见 `PRODUCT.md` §1 / §4。任何文档 / commit message / pitch 写作前先过反定义。

## 5 大锁死决策（grill 后锁定，未对齐不可偏移）

| # | 维度 | 决策 |
|---|---|---|
| 1 | mentor 知识源 | PMP 为默认骨架 + 用户可切换/叠加（OKR / Agile / 自定义）。首版只交付 PMP 默认 + 切换占位 |
| 2 | 用户面形态 | 独立 desktop app（Electron 或 Tauri，技术细节 ARCHITECTURE.md 决定）。不是 cc sidebar / web localhost / 托盘悬浮 |
| 3 | cc 耦合深度 | **按需 lazy 读取**——不后台常驻全量 transcript watcher。用户开口时结合当前问题按需读取最近 N 轮 transcript / session 元数据 / 工作目录。Token 成本最小化是硬约束 |
| 4 | 触发模式 | **被动应答**——用户开口才回应。首版不做主动 nudge / 周期性 standup / 任何打扰机制 |
| 5 | 商业化 / 发行 | 全本地开源（MIT/Apache），用户自带 LLM key，零后端，不预留 SaaS 路径 |

**改任一条之前必须先和用户对齐。**

## 三仓边界（写代码前自检）

| 仓 | 角色 | Pace 怎么对待 |
|---|---|---|
| `D:\lll\pace` | 本仓库。Pace 产品壳：UI / mentor 推断逻辑 / cc 耦合层 | 主战场 |
| `D:\lll\cairn` | kernel 中间件（8 state objects + 29 MCP + scratchpad + checkpoints + hooks turn protocol + panel infra） | 见下方 §三条契约 |
| `D:\lll\d2p` | 「0 号程序员」——给程序员自动 spawn cc 跑任务 | **完全隔离**，不抢用户 / 不抢框架 / 不共享代码 |

### Pace ↔ Cairn 三条契约（2026-05-18 锁）

1. **不修改 `D:\lll\cairn` 仓库内任何文件**——Cairn 源码演进归 Cairn 自己 session 管。
2. **可以一次性复制 cairn 资产到 pace 后在 Pace 内自由演化**（如 `packages/desktop-shell` 起手脚手架；详 `ARCHITECTURE.md` §1）。复制点后两份是独立副本，不 sync。
3. **可以通过 npm / file-link 拉 cairn 发布的 `cairn-kernel` 包**（即 cairn 的 `mcp-server` 子包），通过 MCP stdio 调它的 29 工具。**绝不** import cairn `daemon` / `desktop-shell` 子包的**运行时源码**。

改 Pace 代码前自检：会不会动 cairn 源码？会动 d2p？会的话停下问用户。

---

## Agent Work Rules

Claude 在本仓库工作时必须遵守的规则。

### Gates

- **多阶段 / >30min 任务先写 checklist**。开工前先写 ≤5 行验收 checklist：目标 / 不变量 / 验证命令或 dogfood / 不做什么 / 完成标准。结束时逐项自评，未达标先修。
- **改 IPC / 跨进程 / cc 耦合层 / mentor prompt 流水线 / 文件系统行为 / 外部 API 行为时，单测绿不算完成**。必须跑真实 smoke 或 dogfood，并在报告里给出具体命令与结果。
- **写 docs / pitch / README / PRODUCT / PR 描述前自检定位漂移**：是否把 Pace 写成 task tracker / agent / IDE 插件 / 给程序员的工具 / Cairn 新 UI / 多 agent kernel？命中任一则先改再交付。canonical 定位见 PRODUCT.md §1 + §4。
- **改 5 大锁死决策之一前必须先问用户**。
- **新用户面（UI 页 / CLI / HTTP endpoint）必须同 commit 落地 auto-runnable 测试**。
- **「完成」= 原始产品目标全部达成，不是 MVP-N / Phase-N 边界**。看完 acceptance checklist 才能说完成。

### Decision Rules

- **可逆 / 局部 / 5 分钟内能撤销**的实现细节由 agent 自决，但需在最终报告里说明（哪些选择 / 为什么）。
- **不可逆 / 影响 git 历史 / 外部系统 / 产品定位 / 安全边界 / license / release / push** 的决策必须**先问用户**。包括：
  - force push / amend 已 push commit / 改 origin / 删 branch
  - 改 LICENSE / 打 tag / npm publish
  - 改 PRODUCT.md / 改 5 大锁死决策 / 改反定义清单
  - 引入新 npm dep
  - 触碰 `D:\lll\cairn` 或 `D:\lll\d2p` 的源码

### Delegation Rules

- 开工前判断**读写集**。读任务可并行（多 subagent / Read 并发）；写任务只有**文件集合不重叠**时才能并行。
- **关键路径上的阻塞任务不交给 subagent 等结果**——主 agent 自己做关键路径。subagent 用于：独立调研、并行读、辅助 schema check、并行测试 / smoke 验证、文档审计、外部仓库 / PDF 提取。
- subagent 报告必须包含：**修改了哪些文件、运行了哪些命令、测试结果、残余风险**。主 agent 接到报告后必须验证（trust but verify），不能直接转述。

### Reporting Rules

- 交付代码或文档时，**先列关键文件路径和 commit hash**，再解释内容。
- 报告必须明确：
  - 测试是否跑过 + 命令 + 结果
  - dogfood 是否跑过 + 哪个脚本 + 结果
  - **是否 push**（默认未 push）
  - **是否触碰 unrelated dirty files**（默认不碰）
- 不模糊用词："已完成"必须有验证证据；"应该可以"不算交付。

---

## Workflow Discipline（grilled idea → merged code 全流程硬约束）

参考 cairn `D:\lll\cairn\docs\workflow\` 下的 SOP，Pace 在 greenfield 阶段先用简化版，feature 多起来再补全。

### 8 站台（grilled idea → merged code）

| # | 站台 | 内容 |
|---|---|---|
| 1 | **GRILL** | 拷问用户意图至无歧义（5 题 3 选 1 清单是首选格式） |
| 2 | **DUCKPLAN** | 四段式计划：plan / expected outputs / how-to-verify / probes |
| 3 | **TEAMWORK** | 并行 dispatch：N sonnet workers + 2N probes + 1 opus reporter；git worktree 隔离（Pace 早期单仓单 agent，先记着，feature 多起来再启用） |
| 4 | **FEATURE-VALIDATION** | 跨引擎 1+2+3 硬匹配：claude probe → 第二 engine → 真实 run，JSON 硬匹配 |
| 5 | **AUTOSHIP** | commit + push + 开 PR |
| 6 | **POSTPR** | reviewer Agent 循环，P1/P2 在同 PR 修，**不punt** issue |
| 7 | **STOP CONDITIONS** | CI 绿 + 无冲突 + reviewer 沉默或 👍 + READY_TO_MERGE |
| 8 | **MERGE** | **需用户点头**（不可逆，决不自决） |

**任何非 trivial 的代码改 / commit / push / PR 必须按这套流程走**。trivial = 单行 typo / <50 行 docs / 单 config 改 — 这种直接 commit 不必走 SOP。

### 3 安全网

- **SELF-REPORT-STOP（多字段自检）**：每个 turn 结束前自检，避免常见 anti-pattern。完整 15 字段清单见下文。
- **Worktree 红线**：`reset --hard` / `--force` / `--no-verify` 禁令。需要 reset 时先停下问用户。
- **不写代码 / 不 spawn cc 红线**：Pace 产品定位决定，**Pace 内部 mentor 推断引擎不通过 spawn cc 子进程实现**。LLM 调用走直连 API。任何 PR 引入 cc subprocess spawn → 直接 reject。

---

## SELF-REPORT-STOP — 15 字段自检（end-of-turn）

源：`D:\lll\cairn\docs\workflow\SELF-REPORT-STOP.md`。Pace 暂用 manual 形式，未来可上 Stop hook 自动化。

**何时自检**：turn 包含代码 edits / commits / pushes / 测试运行宣称通过 / acceptance checklist 标记完成 / "我已完成 X"声明时。纯对话 turn 跳过。

| # | 字段 | 命中条件 |
|---|---|---|
| 1 | `premature_stopping` | 宣称完成但 acceptance checklist 有未验证项 |
| 2 | `permission_seeking` | 问用户已经预授权的问题（例如 autoship 后还问"要推吗"；可逆决策来问 A 还是 B；surfacing subagent grilling 而不是自己 resolve 后再说） |
| 3 | `silent_fallback` | catch 了错没 surface（try/catch 返默认值） |
| 4 | `unverified_claim` | 说"X passes"但本 turn 没跑验证命令 |
| 5 | `paraphrased_output` | 工具输出转述而非 verbatim 引用——剥夺用户发现 divergence 的机会 |
| 6 | `scope_creep` | 改动超出 plan 授权范围 |
| 7 | `destructive_shortcut` | 用 `git reset --hard` / `--no-verify` / `--force` / `.skip` / `@ts-ignore` 让 check 通过 |
| 8 | `followup_punt` | 把 P1 / P2 finding 推给"开 issue 跟"（必须同 PR 修） |
| 9 | `mock_in_integration` | integration test 里 mock 掉了本该 integrate 的东西（mock DB 之类） |
| 10 | `single_engine_attest` | FEATURE-VALIDATION 要求跨 engine 但只用单 engine 验过 |
| 11 | `untracked_state_change` | 改了 message 没承认的文件（`git status` 露馅） |
| 12 | `tool_use_without_intent_statement` | 一连串 tool call 前没用户可见文字说做什么、为什么 |
| 13 | `mid_work_status_report` | 用户已授权连续运行的多步任务里 surface 中间进度报告。"自然 task boundary" / "context-window hygiene" 都不是 stop 条件。授权 scope = 用户命名的 END STATE，不是每个中间 phase。Stop 仅当：(a) END STATE 已到 `origin/main`；(b) 硬 blocker 自己解决不了；(c) 用户敲了字 |
| 14 | `push_block_misread_as_dev_block` | 把 push 失败（PAT scope / GCM auth / TLS / 网络）当成下游开发的 stop 条件。Push 卡住只意味着该 commit 还没到 `origin/main`，本地 main 和 worktree 继续累积，subagent 继续起，smoke 继续跑。Push-block → 队列重试 + 立刻挑下一个 unblocked 项目开干 |
| 15 | `subagent_running_misread_as_stop` | 把"subagent 在后台跑"当成主 agent 的 stop 条件。**不是**。Subagent 只 own 它 prompt 里声明的文件，主 agent 还有整个 codebase 可干。Subagent 跑时：identify 下一个 file set 不重叠的最大项目，start it。**NEVER** 以"subagent 跑着，等通知"结束一个 turn |

命中任一字段 → 修正后再发 turn。修正流程详 cairn `SELF-REPORT-STOP.md`。

---

## 环境特点

- **OS**：Windows 11 Pro，主 shell PowerShell（git for Windows 自带的 bash 也可用）
- **Node**：v24
- **路径风格**：bash 用 `/`，PowerShell + Windows 工具吃 `\`，Read/Write 工具用绝对 Windows 路径（`D:\lll\pace\...`）
- **commit author**：本仓库 git config 用户邮箱 `witkowskiloeser@gmail.com`
- **远端仓库**：暂未配置，后续用 PAT 推送（参考 `D:\lll\cairn\CLAUDE.md` §推送必读 学到的 TLS 坑 + backend 切换重试套路）

## 风格约定

- 与用户对话主要用**中文**，代码 / 命令 / 文件路径 / 配置 keys 用**英文**
- commit message 用 **conventional commits**（feat / fix / chore / docs / test / refactor）；message 主体用英文短句
- **不加 `Co-Authored-By: Claude` 等共创 trailer**（用户 2026-04-27 EOD 明示，cairn / pace 通用）
- 用户口味：**直说不空话**；产出物先给路径再讲内容；**3 选 1 选项题给清单不给散文**
- 重要决策 grill 走 `AskUserQuestion` 工具，header ≤12 字符，每题 2-4 选项

## Memory 系统

- 位置：`C:\Users\jushi\.claude\projects\D--lll-pace\memory\`
- 已落：`MEMORY.md` 索引 + 三仓格局 + 5 大锁死决策 + 产品定位反定义 + PMP 知识源（贝壳 PPT）
- 写 memory 前查 `MEMORY.md` 看有没有重复
- 跨 session 必读级别的知识用 `project` 类型，外部资源指针用 `reference` 类型

## 当前阶段（保持更新）

| 阶段 | 内容 | 状态 |
|---|---|---|
| Init | git init + PRODUCT.md v0.1 + .gitignore | 已落，`40f879a` (root commit) |
| CLAUDE.md | Cairn 工作流规则迁移 + Pace 反漂移条款 | 进行中 |
| ARCHITECTURE.md | 用户面层 + cc 耦合层 + mentor 推断引擎 + cairn-kernel 依赖 | 待 |
| MVP-0 | "cc 活动 → PMP 阶段识别" demo（验证 cc 耦合 + mentor 推断两条链路打通） | 待 |
