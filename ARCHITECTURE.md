# Pace — ARCHITECTURE.md (v0.1 草稿)

> 状态：v0.1 草稿。产品定位与 5 大锁死决策见 `PRODUCT.md`，工作流规则见 `CLAUDE.md`。
> **关键基底决策（2026-05-18 锁）**：UI 脚手架从 `D:\lll\cairn\packages\desktop-shell` 一次性复制起手，Pace 内自由演化。Electron 32 stack 沿用 cairn 既定选型。

---

## 0. 系统全景图

```
┌────────────────────────────────────────────────────────────────────┐
│                    Pace Desktop App (本机, Electron 32)              │
│                                                                     │
│  ┌─────────────────────┐   ┌─────────────────────────────────────┐  │
│  │   Panel UI          │   │  Mentor 推断引擎 (mentor-core)       │  │
│  │  (原生 HTML/CSS/JS)  │←→ │  ─────────────────────────────────  │  │
│  │                     │   │  1. cc 上下文采集 (on-demand, lazy)  │  │
│  │  - 对话流           │   │  2. 项目身份识别 + 阶段分类           │  │
│  │  - 设置             │   │  3. PMP prompt 流水线               │  │
│  │  - 历史 session     │   │  4. LLM 直连 (用户自带 key)          │  │
│  └─────────────────────┘   └─────────────────────────────────────┘  │
│         ↑                              ↓                            │
│  ┌──────┴──────────────────────────────┴─────────────────────────┐ │
│  │             Pace 本地存储 (better-sqlite3)                     │ │
│  │  ~/.pace/pace.db                                              │ │
│  │  - mentor_sessions / user_prefs / cached_project_ids          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│         ↓                                                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │      cairn-kernel MCP client (stdio, spawn cairn-mcp-server) │  │
│  │  Pace 调 cairn 的 29 工具 (tasks / scratchpad / outcomes ...) │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
       │                                       │
       ↓                                       ↓
┌────────────────────────────────┐   ┌────────────────────────┐
│ 本机文件系统 (read-only lazy)   │   │ Anthropic API (远端)   │
│ - ~/.claude/projects/.../*.jsonl │   │ 用户自带 LLM key       │
│ - <cwd>/.git (remote/branch)   │   └────────────────────────┘
│ - <cwd>/CAIRN.md (若存在)       │
└────────────────────────────────┘
```

---

## 1. 基底：复制 cairn desktop-shell

### 1.1 复制策略

**操作**：把 `D:\lll\cairn\packages\desktop-shell` 一次性复制到 `D:\lll\pace\packages\desktop-shell`。复制后两份**独立演化**——cairn 源码不动（CLAUDE.md 三仓边界仍生效），Pace 内的副本自由改。

**复制范围**：源码 + 静态资源 + 配置，**不复制** `node_modules` / `dist` 编译产物 / `package-lock.json`（Pace 复制后自己 `npm install`）。

**复制后第一件事**：跑一遍看能不能起来（`npm install` → `npm run build` → 启动 panel），验证依赖链。预期会踩 better-sqlite3 NODE_MODULE_VERSION 坑（cairn CLAUDE.md §better-sqlite3 已记录）。

### 1.2 Pace 仓库结构（复制后）

```
D:\lll\pace\
├── PRODUCT.md
├── CLAUDE.md
├── ARCHITECTURE.md
├── package.json                     # workspace root
└── packages\
    └── desktop-shell\               # 从 cairn 复制 + Pace 演化
        ├── package.json
        ├── main.cjs                 # Electron main (改：去掉 cairn-pet)
        ├── panel.html               # UI 主页（改：去掉 cairn 视觉元素）
        ├── panel.js                 # UI 逻辑（改：mentor-first，不是 task/conflict-first）
        ├── queries.cjs              # DB 查询 (保留, 改 schema)
        ├── project-queries.cjs      # 项目识别 (**直接复用**)
        ├── mentor-*.cjs             # cairn mentor mode (改造成 Pace PMP mentor)
        ├── skills-loader.cjs        # **直接复用** (Pace 的 skills 沿用此 loader)
        ├── skills-defaults\         # 内容替换 (Pace 的 PMP skills, 不是 cairn 的 plan-shape)
        └── ... (见 §1.3 删 / 改 / 加清单)
```

### 1.3 删 / 改 / 加清单（复制后第一轮 cleanup）

| 文件 / 模块 | 处理 | 原因 |
|---|---|---|
| `panel.html` / `panel.js` | **改**：去掉 cairn 视觉（accent 蓝换成 Pace 的色），删 Tasks / Conflicts / Dispatch / Inspector tab，只留对话流主视图 | 反定义 #8 "不是 Cairn 的新 UI"，UI 必须明显不同 |
| `main.cjs` | **改**：去掉 cairn-pet 浮窗启动、tray 简化为最小（只显示 / 退出） | 决策 #4 被动应答，不要主动 nudge UI 元素 |
| `cairn-pet*` / `spritesheet*.webp` / `cairn-pet*.cjs` | **删** | 浮窗宠物违反"被动应答"语义 |
| `mode-a-*.cjs` / `worker-launcher.cjs` / `worker-runner.cjs` | **删** | Mode A 是 cairn 自动 spawn 模式，Pace 反定义 #1 "不 spawn cc" |
| `managed-loop-*.cjs` / `cockpit-state.cjs` | **删** | cairn-specific 自动循环 |
| `claude-stream-launcher.cjs` / `claude-mcp-config.cjs` / `claude-settings-config.cjs` | **删主代码**（cairn 用来 spawn cc 的），**保留作 reference**：拷其 transcript 解析逻辑到 Pace 的 `cc-bridge.cjs` lazy reader（只读，不 spawn） | Pace 不 spawn cc 但要读 transcript 文件格式 |
| `mentor-tick.cjs` / `mentor-policy.cjs` / `mentor-handler.cjs` | **改**：cairn mentor 是给 Mode A 主动 plan 的，Pace mentor 是被动应答 PMP 视角的——逻辑大改但 module 边界保留 | mentor 推断引擎本质同源不同向 |
| `mentor-collect.cjs` / `mentor-project-profile.cjs` | **改**：cairn 的 signal categories 适配成 Pace 需要的（PMP 视角的 git 状态 / transcript / 干系人信息） | 信号采集骨架可复用 |
| `mentor-prompt.cjs` | **改**：prompt 模板换成 PMP 知识源（§3.2） | Pace 的 mentor 是 PMP-style |
| `goal-loop-prompt-pack.cjs` / `cairn-md-drafter.cjs` | **删** | cairn 的 goal/plan 主动起草，Pace 不主动 |
| `queries.cjs` | **改 schema**：cairn 的 schema 大部分不用（tasks / conflicts / outcomes 通过 cairn-kernel MCP 走，不在 Pace 本地 DB）。Pace 本地 DB 只存：`mentor_sessions`（用户对话历史）、`user_prefs`（设置）、`cached_project_ids`（项目识别加速） | Pace 持久层职责小 |
| `project-queries.cjs` | **直接复用** | 项目识别逻辑（git remote + cwd 等 8 信号 soft-clustering）正是 Pace 需要的 |
| `skills-loader.cjs` | **直接复用** | mtime-gate cache + fs loader 模式正好 |
| `skills-defaults/` | **内容换**：从 cairn 的 plan-shape / mentor-recommendation / handoff-protocol 换成 Pace 的 PMP skills（§3.2） | 同 loader 不同内容 |
| `agent-adapters/` | **删** | cairn 给 dispatch agents 用的 adapter，Pace 不 dispatch |
| `inspector-legacy.js` | **删** | cairn dev tool |
| `scripts/` | **审计**：保留 smoke 框架，删 cairn-specific smoke（mode-a / worker spawn 等） | Pace smoke 重新写 |
| `dev/` | **简化**：cairn 的 design-preview.html 模式可继承，但内容换 | UI 预览页 |
| `docs/` | **审计** | cairn 内部文档大部分不适用，留必要的 SCHEMA_NOTES.md 模板 |

### 1.4 stack frozen（沿用 cairn）

- **Electron 32** + 原生 HTML/CSS/JS + better-sqlite3
- **不引** React / Vue / Svelte / Tailwind / Vite / TypeScript（cairn subagent verdict 2026-05-08，Pace 沿用）
- **不引** 新的 UI 框架 / 新的 build 系统——除非有强 reason 且 grill 用户后改 stack frozen 条款

### 1.5 复制后的视觉差异化（防止"Cairn 新 UI"观感）

复制起手是技术选择，**Pace 第一个 milestone 内必须让 UI 在视觉上明显不同于 cairn**：

- 主色：cairn 是 accent 蓝；Pace 换一个色系（mentor 色：暖灰 / 茶色 / 莫兰迪绿之类——设计 token 待 DESIGN.md 决定）
- 主屏布局：cairn panel 是多 tab + 状态密集；Pace 是对话流 + 极简边栏
- 文案：cairn 是 agent / task / conflict 词汇；Pace 是 mentor / 阶段 / 干系人 / 沟通话术
- 图标 / logo：Pace 自己的（暂定无 logo，等 DESIGN 阶段）

---

## 2. cc 耦合层 (cc-bridge.cjs)

**严格约束**：决策 #3 锁死——**不后台常驻 transcript watcher，不订阅 fs events**。仅在用户开口（决策 #4 被动应答）触发时读。

### 2.1 采集字段清单（按 token 成本排序）

| Tier | 来源 | 字段 | Token 成本 |
|---|---|---|---|
| 1 | `<cwd>/.git` 命令 | `git remote get-url origin` / `rev-parse --show-toplevel` / `rev-parse --abbrev-ref HEAD` / `log -5 --oneline` | <100 |
| 1 | 文件系统 stat | `<cwd>/CAIRN.md` 存在与否 + ## Signals override 块 | <200 |
| 2 | `~/.claude/projects/` 索引 | 最近活跃 1-3 个 session 元数据（startTime / endTime / cwd / model） | <300 |
| 3 | `~/.claude/projects/<project>/transcript.jsonl` | 最近 N=5~10 条 user/assistant 消息（**仅 text，不读 tool_use / tool_result 大块**） | ~2000 |
| 4 | （opt-in）cc Stop hook 事件 | 若用户在设置勾选；hook 写 `~/.pace/cc-events.jsonl` | <500 |

**Tier 4 默认关**——遵守决策 #4 不主动监听。

### 2.2 transcript 解析来源

参考 cairn `claude-stream-launcher.cjs` 的 NDJSON / stream-json 解析，但 Pace 是**事后读 jsonl 文件**而非 stdout pipe。逻辑差异：cairn 是 streaming consumer，Pace 是 batch reader。新模块 `packages/desktop-shell/cc-bridge.cjs` 重写一个轻量 reader（拷 cairn 的 schema 知识，不拷代码结构）。

### 2.3 项目身份识别（复用 cairn project-queries.cjs）

直接拷 `D:\lll\cairn\packages\desktop-shell\project-queries.cjs::resolveProjectAgentIds` 的 git_root + cwd matching 思路（cairn CLAUDE.md §SESSION_AGENT_ID 已记录）。Pace 不需要 agent_id 概念，但 git_root / cwd 信号源完全适用。

### 2.4 cc hook 安装（opt-in）

参考 cairn `claude-settings-config.cjs`：写一份临时 `~/.claude/settings.json` 注入 Pace 自己的 Stop hook。Pace **不** 装 SessionStart / UserPromptSubmit hooks（这两个会增加每次 cc turn 的 overhead，违反"轻量"原则）。

---

## 3. Mentor 推断引擎 (mentor-core)

cairn 的 `mentor-*.cjs` 是给 Mode A 主动起草 plan 用的；Pace 改造为**被动应答 PMP 视角**。模块边界保留，逻辑大改。

### 3.1 输入 → 输出 流水线

```
用户输入 (一句话或一段话)
    ↓
[Stage 1] 项目身份识别 (cc-bridge → Tier 1+2)
    ↓
[Stage 2] 活动分类
    用 haiku 把用户活动分到 PMP 5×10 矩阵的某个格子
    输入：用户输入 + Tier 1+2 + 必要时升级 Tier 3 (transcript)
    输出：{process_group, knowledge_area, activity_id}
    ↓
[Stage 3] 问题类型路由
    - "我在干啥" → 阶段判断 prompt
    - "下一步" → 活动建议 prompt
    - "怎么开口" → 沟通话术 pipeline (§3.3)
    - "谁该负责" → 干系人 RACI pipeline (§3.4)
    ↓
[Stage 4] LLM 调用 (sonnet) + markdown 渲染 → UI
```

### 3.2 PMP 知识源 (skills 系统沿用 cairn loader)

```
~/.pace/skills/
├── pmp/                          # 默认骨架
│   ├── meta.yaml                 # 5 过程组 + 10 知识领域 + 47 活动定义
│   ├── prompts/
│   │   ├── stage-detection.md
│   │   ├── next-step.md
│   │   ├── communication.md     # 套贝壳 PPT p93 + p61 + p97 (§3.3)
│   │   └── stakeholder.md       # 套 p25 + p41 (§3.4)
│   └── examples/
│       └── good-vs-bad-questions.md   # 来自贝壳 PPT p61
├── okr/                          # v0.2+ 占位
└── custom/                       # v0.2+ 用户自定义
```

**首次启动 bootstrap**：复制 `skills-defaults/` 到 `~/.pace/skills/`，用户改自己的副本，升级不覆盖（沿用 cairn 模式）。

### 3.3 沟通话术 sub-pipeline（首版 stub，v0.2 完整）

引用知识源：贝壳 PPT p93（channel 决策表）+ p61（Good vs Bad 问法）+ p97（前-中-后三段框架）。详 PMP 知识源 memory `pmp-source-beike-ppt.md`。

### 3.4 干系人识别 sub-pipeline（首版 stub，v0.2 完整）

引用知识源：贝壳 PPT p25（干系人分析矩阵 6 列）+ p41（RACI）。

### 3.5 风险管理 sub-pipeline（v0.2，缺失策略由 PMBOK 原文补）

贝壳 PPT 只讲了 4 应对策略中的 2 个（回避 / 转移），缺减轻 / 接受 / 风险登记册标准字段。v0.2 从 PMBOK 第 6 版 Chapter 11 摘。**skill 文件首版要 mark "需 PMP 顾问 review"**。

---

## 4. cairn-kernel 依赖层

### 4.1 集成方式

**MCP stdio client**——Pace 进程内嵌 MCP client，spawn `cairn-mcp-server` 子进程通过 stdio 通信。

**理由**：
- Pace 仓库 **不复制** cairn 的 daemon / mcp-server 子包（只复制 desktop-shell）
- 解耦：cairn 版本升级不影响 Pace 自己的 build
- 进程边界：cairn 出问题不挂 Pace 主进程
- 复用 cairn 已有 29 工具 surface

**v0.1 复制方案**：Pace `package.json` 写 `"cairn-kernel": "file:../cairn/packages/mcp-server"`（file-link，等 cairn 发 npm 包后切常规依赖）。

**verdict 反悔条件**：MCP stdio 每次启动 cairn 进程开销 >100ms / IPC 延迟超标 → 切换到 in-process require。MVP-0 验证。

### 4.2 用 cairn-kernel 的哪些能力

| cairn 能力 | Pace 怎么用 |
|---|---|
| `tasks` 表 | 每次"用户开口 → mentor 回答"作为一个 task 落库，用户回看历史 |
| `scratchpad` | mentor 推断中间过程（项目识别 score / 活动分类结果）写 scratchpad，debug 用 |
| `outcomes` | 用户对回答的 thumbs up/down 写 outcomes 表，驱动 mentor 改进 |
| `checkpoints` | 用户改设置 / 切知识源前打 checkpoint，能回滚 |

**不用的**：`processes` / `dispatch_requests` / `conflicts` / `blockers`——multi-agent 协调，Pace 单用户用不上。

### 4.3 cairn-kernel 包依赖契约（CLAUDE.md 三仓边界精化）

- Pace **绝不** import cairn `daemon` / `desktop-shell` 子包**源码**
- Pace **绝不** 修改 `D:\lll\cairn` 仓库内任何文件
- Pace **可以** 通过 `npm install` 或 `file:` link 拉 cairn 发布的 `cairn-kernel` 包（即 cairn 的 `mcp-server` 子包）
- Pace **可以** 一次性**复制** cairn 资产（如 desktop-shell 起手脚手架），复制后 Pace 内副本自由演化，与 cairn 源仓库无 sync 关系

---

## 5. 数据流：典型 turn 走一遍

**场景**：用户在 Pace panel 输入"我现在 cc 里在干啥？"

```
1. panel UI 通过 Electron IPC 把输入发给 main 进程的 mentor-handler.cjs
2. cc-bridge.cjs 触发 (Tier 1+2 lazy 读):
   - `git -C <cwd> remote get-url origin` → "github.com/me/proj-x"
   - `git -C <cwd> rev-parse --abbrev-ref HEAD` → "feature/auth-refactor"
   - 读 `~/.claude/projects/<encoded-cwd>/` 列 sessions
   - 拿最近 session 的 transcript.jsonl 路径
3. project-queries.cjs 算项目身份 score:
   - remote URL match 1.0 → 当前项目 = "proj-x"
4. mentor-collect.cjs 跑 Stage 2 (haiku 调用):
   - {process_group: "Executing", knowledge_area: "Scope", activity: "5.5 验证范围"}
5. mentor-prompt.cjs 装配 Stage 3 prompt 模板 (路由 = 阶段判断)
6. sonnet 调用 → markdown 输出
7. cairn-kernel MCP client 调 task.create 落库
8. panel UI 渲染答案
```

**总 LLM 调用**：1× haiku（~1k tok）+ 1× sonnet（~2k tok）。

---

## 6. v0.1 不做的事

- 多 cc session 同时跟踪
- 跨设备 sync（决策 #5 全本地）
- 知识源切换 UI（首版只 PMP 默认，切换占位不实现）
- 风险管理 4 策略完整版 / 质量管理 / 收尾细化（v0.2）
- 沟通 / 干系人 sub-pipeline 完整版（v0.1 stub）
- 主动 nudge / 周期 standup / 任何打扰机制（决策 #4 锁死）
- cc subprocess spawn / 写代码 / 拆任务（反定义 #1 锁死）
- 任何 cairn-pet / Mode A 自动循环遗留（§1.3 删清单已列）

---

## 7. MVP-0 验证什么

参考 PRODUCT.md §7：

**Demo 链路**：
1. Pace panel 启动（复制后第一次能起来 + 删完 cairn-specific 模块）
2. 用户在对话窗输入"我现在在干啥"
3. cc-bridge lazy 读 transcript + git 信息
4. mentor-core 跑完 4 Stage
5. panel 渲染答案

**验证清单**：
- [ ] 复制 + cleanup 后 panel 能 `npm run start` 启动（better-sqlite3 NODE_MODULE_VERSION 坑要踩过）
- [ ] UI 视觉**明显**不同于 cairn（主色 / 主屏布局 / 文案 3 项必须改）
- [ ] cc-bridge lazy 读 transcript 端到端 ≤500ms
- [ ] mentor turn 端到端延迟 ≤5s（含 haiku + sonnet）
- [ ] PMP 阶段分类 5 个手工场景肉眼通过
- [ ] cairn-kernel MCP stdio 调用 ≤100ms（决定是否锁定 §4.1）
- [ ] mentor 输出明确区分"cc 日志确证"和"LLM 推断"（数据诚实原则）

不验证：多 session / 知识源切换 / 跨设备 / 沟通 sub-pipeline / 风险管理。

---

## 8. 待决事项

| 项 | v0.1 推荐 | 待决条件 |
|---|---|---|
| Desktop 框架 | Electron 32（沿用 cairn）| （已决，复制 cairn desktop-shell 起手） |
| LLM 调用 | 直连 Anthropic API（用户自带 key） | （已决） |
| cairn-kernel 集成 | MCP stdio client | MVP-0 验证延迟 |
| Prompt 模板格式 | markdown + YAML frontmatter（沿用 cairn skills loader）| （已决） |
| cc hook 安装 | 默认不装，opt-in | （已决） |
| Pace 主色 / DESIGN.md | 待 DESIGN.md 决定 | MVP-0 之后 |
| 第二知识源（OKR / Agile） | v0.2+ | PMP dogfood ≥10 用户场景后 |
| 复制 cairn desktop-shell 的具体清单 | 见 §1.3 | 执行时 review |
