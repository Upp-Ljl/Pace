# Pace — PRODUCT.md (v0.1 草稿)

> 状态：等待用户审阅。审阅通过前不要据此动手实现。

---

## 1. 一句话定位

**Pace 是给重度使用 Claude Code (cc) 的职场人的 PMP-style mentor。**

把"会用 cc 但不会工作"的职场人，变成"会工作的人"——知道这个项目这个阶段该做什么、找谁对齐、用什么话术沟通。

---

## 2. 目标用户

**核心画像**：日常工作高度依赖 cc 的非项管科班职场人。

- 角色不限：PM / 设计 / 运营 / 市场 / HR / 内容创作 / 创业者 / 程序员都可能
- 共同特征：
  - cc 是日常生产力工具（不是偶尔玩）
  - 没受过系统项目管理训练，靠直觉推进工作
  - 经常卡在"不知道下一步该做什么 / 该找谁"
- 程序员是**边缘用户**，不是核心。Pace 不为程序员设计，只是不排斥。

**反画像**（不为这些人设计）：
- 项管科班 PMP 持证人（他们不需要 mentor）
- 不用 cc 的人
- 想要 task tracker / 甘特图工具的人

---

## 3. 价值轴

Pace 在用户每次开口时回答这三类问题之一：

1. **阶段判断**：我现在干的活，在项目生命周期的哪个阶段？
2. **下一步**：这个阶段按 best practice 该做什么 / 找谁对齐？
3. **沟通话术**：和这个干系人沟通这件事，怎么开口？

不提供：进度跟踪、deadline 提醒、任务分配、燃尽图、看板。

---

## 4. 反定义（命中即漂移，先改再做）

- ❌ 不写代码，不 spawn cc 子进程跑任务（那是 0 号程序员/d2p 的事）
- ❌ 不是 task tracker / Jira / Linear / 看板 / 甘特图
- ❌ 不是 ChatGPT 聊天替代品
- ❌ 不替用户做决策（mentor 引导，不下命令）
- ❌ 不是 multi-agent coordination kernel
- ❌ 不是 IDE / cc plugin（独立 daemon-class 产品）
- ❌ 不是给程序员的工具
- ❌ 不是"Cairn 的新 UI"——Pace 是新产品，Cairn 是 kernel 依赖

---

## 5. 五大产品决策（grill 结果，锁死）

| # | 维度 | 决策 |
|---|---|---|
| 1 | mentor 知识源 | **PMP 为默认骨架** + 用户可在 onboarding/设置中切换/叠加其他框架（OKR / Agile / 自定义）。首版只交付 PMP 默认 + 切换占位 |
| 2 | 用户面形态 | **独立 desktop app**（Electron 或 Tauri，技术细节待 ARCHITECTURE.md 决定） |
| 3 | cc 耦合深度 | **按需 lazy 读取**——不在后台常驻全量 transcript watcher。用户开口时，结合当前问题，按需读取最近 N 轮 transcript / 当前 session 元数据 / 工作目录。Token 成本最小化 |
| 4 | 触发模式 | **被动应答**——用户开口才回应。不做主动 nudge、不做周期性 standup。首版不引入打扰机制 |
| 5 | 商业化 / 发行 | **全本地开源**——MIT/Apache 许可，用户自带 LLM key，零后端。不预留 SaaS 路径 |

**这五条不可在没和用户重新对齐的情况下偏移。**

---

## 6. 知识源框架选型（PMP 默认骨架）

首版 mentor 推断引擎使用的 PMP 概念集：

**五大过程组**（用于"我在哪个阶段"判断）：
1. Initiating（启动）
2. Planning（规划）
3. Executing（执行）
4. Monitoring & Controlling（监控）
5. Closing（收尾）

**关键知识领域**（用于"下一步该做什么"建议）：
- Scope Management（范围管理）
- Stakeholder Management（干系人管理）—— 含 RACI
- Communications Management（沟通管理）
- Risk Management（风险管理）

**首版不引入**：成本管理、采购管理、质量管理、资源管理、整合管理。等用户场景验证后再加。

**框架切换**（v1+）：
- 用户可在设置里把"骨架"换成 OKR / Agile / 自定义 YAML
- 切换不影响 cc 耦合层，只换 mentor 推断的 prompt template

---

## 7. 第一里程碑（MVP-0）

**Demo 场景**：用户打开 Pace desktop app，按一个键 / 输入一句"我现在在干啥"，Pace 返回：

> "你在 cc 的 `~/projects/xxx` session 里，最近 10 轮主要在讨论 API 设计 + 改了 3 个 schema 文件。
> 按 PMP 看，这属于 **Planning 阶段**的 Scope Definition 活动。
> 建议下一步：和后端 owner 对齐 API contract（Stakeholder + Communications），避免 Executing 阶段返工。"

**验证什么**：
- cc 耦合层能拿到 session 元数据 + transcript 切片
- mentor 推断引擎能把 cc 活动映射到 PMP 阶段
- 输出格式不像 ChatGPT，像 mentor

**不验证**：UI 美观度、多 session 同时跟踪、知识源切换、跨设备同步。

---

## 8. 与隔壁两仓的关系

| 仓 | 角色 | Pace 怎么用 |
|---|---|---|
| `D:\lll\cairn` | kernel 中间件（8 state objects + 29 MCP + scratchpad + checkpoints + hooks） | **只 depend 不动源码**。通过 `cairn-kernel` 包复用 tasks / outcomes / scratchpad 存储与 MCP 工具 |
| `D:\lll\d2p` | 0 号程序员——给程序员自动 spawn cc 跑任务的产品 | **完全隔离**。不抢用户、不抢框架、不共享代码 |

---

## 9. 待定（PRODUCT.md 不回答，留给 ARCHITECTURE.md）

- desktop 框架选 Electron 还是 Tauri
- LLM 调用是直连 Anthropic API 还是走 cc 自身
- mentor prompt template 用 markdown 还是 YAML
- 与 `cairn-kernel` 的具体集成方式（IPC / 库调用 / MCP 桥接）

---

**审阅请求**：

请逐节确认。重点看：
- 第 2 节用户画像措辞是否准确
- 第 5 节五大决策是否如实复现你的回答
- 第 7 节 MVP-0 demo 场景是否能验证你心里的"最小切片"
- 有没有该写没写的反定义
