# Pace Landing Redesign — Brief for Claude Design

> 复制本文 + 附上 `附件清单` 里的 PNG 给 Claude（claude.ai / Claude Design / Artifacts 模式）。
> 你想要的：让 Claude **可以推翻现有方案**，重新设计 Pace 官网 landing。
>
> 已有的方案我会附在附件，不是让你照搬——是让你知道**我们试过什么** + **哪些反馈需要绕开**。

---

## 一、Pace 是什么

Pace 是一个**桌面 mentor app**（Electron，本地优先，用户自带 LLM key）。

**核心能力**：按需读用户的 `cc transcript`（Claude Code 的 session jsonl）+ `git 信号`（commit 历史 / dirty 文件 / 分支状态）+ `团队 RACI` → 推断出用户「现在在干啥」→ 给出 PMP 阶段判断 + 下一步建议 + 沟通话术。

**核心反差**：

- ❌ 不是 task tracker / todo list — 它不让你列，它**看**你已经在做什么
- ❌ 不是 chat 替代品 — 入口是 feed 卡片，ask 是次要
- ❌ 不是 IDE 插件 / cc 子产品 — 独立 daemon-class 桌面 app
- ❌ 不是 multi-agent kernel — 不 spawn cc 子进程，只调直连 LLM API
- ❌ 不是写代码工具 — Pace 本身不写代码，是 mentor

## 二、目标用户

**所有重度使用 cc 和 git 的人**，含：

- 程序员（用 cc 写代码、个人开发者、独立开发者）
- PM（用 cc 写 PRD、对齐需求）
- 设计（用 cc 改 prototype、写 spec）
- 运营 / 市场 / HR / 内容（用 cc 产文档、做调研）
- 团队 lead（git 深绑定的小团队）

**共同痛点**：让 cc 跑了一通后，**不知道下一步该干啥、找谁对齐、怎么开口**。Pace 在中间补这一层。

**显式不锁定**：不指定职业（"PM"、"developer" 等不能出现在 hero）；用**场景 / 痛点**钩人（"main 上裸改 3 小时"、"5 个文件未提交" 这类）。

## 三、5 大锁死决策（产品定位不可偏移）

1. **PMP 为默认知识源**（可切 OKR / Agile / 自定义，但首版只交付 PMP）
2. **独立桌面 app**（Electron，frameless side-dock 形态）
3. **按需读 cc，不后台常驻**（token 成本最小化）
4. **被动应答**（不主动推送 / 不弹窗 / 不周一早上提醒）
5. **全本地开源**（MIT/Apache，用户自带 LLM key，零后端，不预留 SaaS）

## 四、Tagline 候选 + 用户反馈

我们试过 4 个，又调研出 4 个 v2。用户**反馈**：

> "不应该只局限在写代码的职场小白，也可以适配到所有使用 cc 以及 git 的用户，或者团队是深绑定 git 的"

目前选用：**「main 上裸改 3 小时后，*它问你一句话*。」**（hero default）

| 备选方案 | tagline | 适合用户 |
|---|---|---|
| 反 task tracker | 它不让你列任务，它告诉你你**已经在做什么**。 | 被 Jira / Linear 折磨过的所有人 |
| 视角排练 | 见面前，先和 ta 的视角**排练一遍**。 | 团队协作场景 |
| 主推 main 裸改 | main 上裸改 3 小时后，**它问你一句话**。 | cc + git 共同段子 |
| mentor 翻活 | mentor 不是在猜，**是在翻你的工作**。 | 强调信号源 |

**你可以保留 / 改 / 完全推翻这些 tagline**。我们的硬约束：
- ≤ 12 个汉字 或 ≤ 10 个英文词
- 不出现 "PM"、"engineer"、"程序员" 等专属群体词
- 不要 marketing 套话（"AI-powered"、"赋能"、"卓越"、"10x" 全禁）
- 有具体钩子（不要 "Know what's next" 这种废话）

## 五、5 屏现有结构 + Copy（参考用，可推翻）

### 屏 1 Hero
- Tagline 大字 + sub（≤ 22 词）+ Download CTA + Pace 真截图右侧
- 顶部有 4 个 tagline 切换 button（用户测试用，可去掉）

### 屏 2「它读什么，才敢开口」
- 三个信号源（cc transcript / git diff / 团队 RACI）→ Pace mentor → blockquote 输出
- 强调 Pace 独有的"看得见的判断依据"

### 屏 3「Task tracker 救不了你」
- 反潮流大标题（参考 Linear "Issue tracking is dead"）
- 6 条反定义并排，每条带 ❌ / 红色划线
- 暖色 alt 背景（视觉节奏 pause beat）

### 屏 4「3 wow moment carousel」
- 横向 3 张卡，每卡 = Pace 真截图 + 50 字配文
- 01: feed 自动开口（Now tab 截图）
- 02: 卡住时 7 条建议先递（Ask tab 截图）
- 03: 切到同事视角对话（Team tab 截图）

### 屏 5「5 锁死决策 + install + footer」
- 5 promise grid（本地优先 / 你的 key / 被动应答 / 桌面 dock / 开源）
- install command 区
- footer 链接

## 六、视觉风格（参考用，可推翻）

**当前方案**：
- light + 紫色 accent + 圆角衬线
- 远离 Cursor / Raycast 的 dev dark mono
- 靠近 PM Path 紫 ✦ + Granola 白底圆角
- Pace 产品截图区**保留 dark theme**（截图是 dark，背景是 light，反差出层次）

**色板（hex）**：
```
base       #FAF8F5  (奶油暖白)
alt        #F2EEE7  (section 分隔)
primary    #1B1A22  (近黑偏紫)
secondary  #5C5867
muted      #8B8595
accent     #6B4FE0  (主紫)
accent-deep #4B33B8 (hover)
accent-soft #EAE3FF (tag 底)
border     #E5DFD3
success    #3A8A5C
warn       #C7892F
```

**字体**：
- 显示标题 / hero：Source Serif 4（衬线）
- UI / 按钮：Inter
- 代码 / 命令：JetBrains Mono

**圆角 / 间距**：
- 卡片 16px、按钮 12px、截图框 20px
- 8px 间距基准
- section padding 桌面 128px、移动 64px
- 内容最大宽 1120px

## 七、附件清单（一起喂给 Claude）

1. **`assets/pace-now.png`** — Pace Now tab 真截图（PMP card + commit pane + 4 观察卡）
2. **`assets/pace-ask.png`** — Pace Ask tab 真截图（context strip + 7 建议）
3. **`assets/pace-team.png`** — Pace Team tab 真截图（3 同事 + RACI badge + agent_id）
4. **`.shots/full-page-final.png`** — 当前 landing 5 屏全貌
5. **`.shots/hero-a/b/c-v3/d.png`** — 4 个 tagline 方案 hero 对比
6. **`index.html` + `styles.css` + `app.js`**（可选）— 现有静态站源码

## 八、要 Claude Design 做什么

**任务**：重新设计 Pace 官网 landing。

**自由度**：
- ✅ 可以完全推翻现有 5 屏结构
- ✅ 可以推翻配色方案（但解释为什么）
- ✅ 可以推翻 tagline（但要给新候选 + 理由）
- ❌ 不能改产品定位（反 task tracker / 不是 chat / 不是 IDE 插件 这些反差锁死）
- ❌ 不能改 5 大锁死决策（本地 / 自带 key / 被动 / dock / 开源）
- ❌ 不能 marketing 套话

**输出期望**：
- 整页 wireframe（ASCII 或 figma 风格 mockup）
- 关键屏的 HTML/CSS 实现样片（可选）
- 配色 + 字体 + spacing 系统
- 至少 3 个**和现有方案显著不同**的方向（不要微调）
- 每个方向说明：打动谁 / 反差点 / 落到产品的哪个能力

**风格参考**（你可以借鉴或反着来）：
- Granola.ai —— before/after morph hero
- Linear.app —— 反潮流 section + 极简 carousel
- Raycast.com —— dock 形态产品的 hero 处理
- Reflect.app —— 衬线 + 暖色 mentor 气质
- Notion AI / Figma —— 跨用户群产品的 sub copy 收口

---

## 九、给 Claude 的开场白（建议你这样开口）

> 我在做一个叫 Pace 的桌面 mentor app（详见 brief md）。
> 现有的 landing 5 屏方案我附在图里（full-page-final.png + 4 个 hero 候选），
> 我**不满意**，希望你**完全推翻**重新设计——给我至少 3 个显著不同的方向，
> 每个方向出整页 wireframe + 配色 + 关键屏的 HTML 样片。
>
> 硬约束 + 反 marketing 红线 在 brief §6 + §8。Pace 真 UI 截图我也附了
> （pace-now / pace-ask / pace-team），这是产品本身长啥样，你的 hero 截图位
> 用这 3 张里其中之一就好。
>
> 开始吧。
