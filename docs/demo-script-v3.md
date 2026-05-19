# Pace Demo Video Script v3 — 60s no-VO 创新升级版

> v3 来自反馈：v2 (`demo-script-v2.md`) 骨架对、节奏对，但**视觉手法**仍是 `no-vo-ui-workflow` archetype 教科书套路（dock 滑入 / 字符级打字 / 工具行砸入 / 反定义快闪 / logo 定格）。看完不会被任何一帧"钉"住。v3 的目标：保持 60s + no-VO + 5 beat + 一个用户 session 贯穿这 4 个硬约束，但把每个 beat 的视觉语言抬到能让人**单帧截图就转发**的水平。
>
> 路径：先深挖 7 支被广泛认可的产品视频，提取它们的"绝活"，再把这些手法映射到 Pace 5 beat。本文最后给出可执行的分镜表 + scene atom 映射 + 与 v2 的精确 diff。

---

## 一、调研：7 支参考视频的关键手法

> 每条标注「来源」：URL = 公开可访问页面；训练记忆 = 我从训练语料里对该视频的细节印象（用户可拿真实视频校验）。

| # | 视频 | 时长 | VO 策略 | 转场 | 镜头语言 | 字幕 | 声音 | 绝活（被记住的那一刻） | 来源 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Linear "Issue tracking is dead."** (linear.app/next, 2026-03) | ~70s | no-VO，全字幕 | hard cut + 1 处 fade-to-black | 黑底大字 hero（"Issue tracking is dead." 占满中央） → UI 录屏切片 → 黑底大字 → 收尾 | **大字本身即设计**：白衬线在黑底反复出现，每次只换一句标语 | 极简钢琴 + 低频底噪，第 1s 就建立 mood | 第 1 帧的**黑底白衬线大字宣言**：句号后 1.5s 静帧，让观众读完才切下一镜。一句宣言抵 30s 配音稿。 | [linear.app/next](https://linear.app/next) |
| 2 | **Anthropic "Turn ideas into interactive artifacts"** (claude.ai/artifacts launch, 2024-06) | ~55s | no-VO，prompt 即字幕 | 全 cut，零 fade | 1 个 prompt 输入 → 屏幕一分为二（左 chat / 右 artifact 长出来） → 单镜跟拍 artifact 实时渲染 | 用户的 prompt 占满下 1/3 屏幕，**用户字越打越快，artifact 越长越快** | 极轻 ambient pad，不抢戏 | **split-view 同时跑**：左侧 prompt 还没打完，右侧已经开始出代码——证明"输入 → 产出"不是预制 | [claude.com/blog/build-artifacts](https://claude.com/blog/build-artifacts)（页面 embed video）+ 训练记忆 |
| 3 | **Apple Vision Pro 首发 "Hello"** (WWDC 2023 keynote opening) | ~90s | 有 VO（Tim 旁白）但**视觉手法可直接借**| spatial bloom + slow-mo + dolly-in | 设备从黑底**缓慢**呈现，单色光晕从一点 bloom 充满画面；2x slow-mo 让金属转动有"显微"质感 | 衬线小字"Apple Vision Pro"延迟出现到第 30s | 单音钢琴 + 一次极低频 sub-bass swell 对齐 logo 揭晓 | **第一次按下电源的特写**：8 帧黑屏 → bloom 充满 → 显示 visionOS 主屏。一帧黑→一帧白是它的招牌 | 训练记忆 + [Apple Vision Pro 介绍页](https://www.apple.com/apple-vision-pro/) |
| 4 | **Figma Config 2024 opening sizzle** | ~60s | 有 VO（SRI 1968 历史录音）但视觉是主角 | morph（光标→历史画面→光标）| **闪光光标作为贯穿主角**——光标在屏幕中央 blink，每次 blink 切到一个计算机时代场景（终端 / GUI / 触屏 / AI） | 极少；时代名 mono 小字角落 | 历史录音质感 → 现代电子节拍渐入 | **光标 morph**：blinking 光标 morph 进 / morph 出每一个 era，是这片的唯一镜头主角 | [figma.com/blog/config-2024-branding](https://www.figma.com/blog/config-2024-branding/) |
| 5 | **Arc Browser "Act II — A browser that browses for you"** (The Browser Company, 2024-01) | ~3min（关键段 30-50s） | 创始人对镜独白（半 VO）+ UI 录屏 | hard cut；UI 段 0 转场 | **物理位移转场**：UI 元素从屏幕外**飞入**到位（tab 从左飞、command bar 从下飞），不是 fade | 字幕极少，UI 自己讲 | 弦乐持续 + tab 滑入时机械感 click | **多 tab 同时摆出来的"墙"**：屏幕里 6 个 tab 同时浮动成网格再合并成 1 个，证明 AI 在并行 | 训练记忆 + [Arc Act II YouTube](https://www.youtube.com/watch?v=QsCNcqdHVrc) |
| 5 续 | （Linear 续看：Project scoping with Linear Agent） | ~40s | no-VO | cut | **agent 视角**：镜头跟随 agent 自己在 UI 里点选；用户消失 | mono 小字 "Linear Agent · scoping" | 同上 lo-fi 钢琴 | "**没有人**在驱动 UI"——光标自己动 | linear.app/next 同站次屏 |
| 6 | **Granola.ai hero loop**（granola.ai 首屏自动播放，2024-后）| ~20s loop | no-VO | crossfade | 笔记从**糊的**手写体逐渐清晰为**整洁的** Notion 风格条目（前后对比）| 无 | 完全静音（首屏 loop 默认静音） | **before/after morph**：脏稿子在 6s 内变干净稿子，左 → 右，单镜一镜到底 | [granola.ai](https://www.granola.ai/) |
| 7 | **Raycast launch "v1.0"**（raycast.com, 2021-08）| ~45s | no-VO | hard cut | **command palette 是唯一主角**：palette 反复弹出 / 收起 / 弹出，每次填不同 query，每次出不同 UI | mono 小字角落 "Quick Switcher / Window Mgmt / Snippets" | 钢琴单音 + 每次 ⌘ space 一个"咔哒" sfx | **键盘 sfx 同步动效**：每次 cmd+space 一个真实键盘按键音对齐 palette 弹起，触觉化非视觉化 | [raycast.com](https://www.raycast.com/) |

**额外观察**（不单列条目，但写 v3 时会用到）：

- **Anthropic "Pick up where you left off"**（claude.ai promo, 2024-09）：场景跨设备切换用 morph，不用 cut；首尾呼应是"同一个对话框在两台设备上"。
- **Stripe Sessions keynote 2025/2026 切片**：黑底大字标题卡贯穿全场（"The future of commerce" 字号 ~200pt 衬线占满屏 1.5s），keynote 切换章节就是一张黑底大字 → 然后才进 UI/数据。

---

## 二、7 个创新点 → Pace 5 beat 升级映射

每个创新点标明：**灵感来源 / 应用 beat / 落地的具体实现（HyperFrames 时间轴层级）**。

### 创新点 1 — **黑底白衬线 hero 宣言开场**（Linear 招牌）

- 灵感：Linear "Issue tracking is dead." 第 1 帧
- 应用：**Beat 1（0-5s）**——把 v2 的 dock 滑入降级为 beat 2 的辅助动作，beat 1 改成**纯黑底 + 白衬线一句话**：

  > **「项目管理不是问 cc 写代码。」**
  > （Source Serif 4 Italic 600, 88pt, 字间距 -1）

  停 1.8s（让观众读完 + 1 拍 silence），然后**一个句号末端的紫色光点 ✦**亮起 0.2s，光点炸开变成 Pace dock 滑入画面（衔接 beat 2）
- 落地：HyperFrames 一个 `hook-slate` scene，背景纯 `#0E0F12`，单 `<h1>` + 衬线 italic，光点用 `box-shadow` 脉冲 1 帧 `#6B4FE0` blast 240px

### 创新点 2 — **prompt 不"打字"，而是从屏幕外"飞进" input 框**（Arc 物理位移）

- 灵感：Arc Act II 的 tab 飞入
- 应用：**Beat 2（5-14s）**——v2 是字符级打字 80ms/字，太教科书。v3 改成：用户的整句 prompt **作为字幕已经显示在 Pace input 框正上方**（不打字，整句呈现）→ 句子**整体往下平移**进 input 框（300ms ease-in-out）→ 框光晕脉冲一次 → 回车 → 句子飞起来变成 chat bubble
- 落地：HyperFrames `recording-with-callouts`，prompt 起始位置在 input 框上方 80px、opacity 1、字号 24pt → 末态 opacity 0（被 input 吸进去），input 内 placeholder 同步换成实际句子。**省掉字符级打字这个老派动效**——给观众"语言降临"而非"用户笨手笨脚打字"的感觉。

### 创新点 3 — **思考框折叠用 spatial bloom + 1 帧黑屏**（Apple Vision Pro 招牌）

- 灵感：Vision Pro 通电黑屏 → bloom → 主屏
- 应用：**Beat 3（28-30s）**——v2 折叠瞬间是 white bloom + 0.5x 慢动作 250ms。v3 升级：折叠的最后 1 帧**全画面黑屏**（包含整个 Pace UI，1 帧 = 16ms），然后 spatial bloom 从原折叠位置（不是中心）按 ease-out 充满 350ms，bloom 退散后正文流字立刻开始。**这一帧黑会被剪辑师看出来——但观众感受为"重启"，仿佛 mentor 整理完思绪重新开口**
- 落地：HyperFrames keyframe at 29.984s = full black overlay opacity 1 for 1 frame, 30.000s = bloom radius 0 → 1200px in 350ms, color `#EAE3FF` → transparent

### 创新点 4 — **双轨平行：左用户视角 / 右 Tom 视角 同时存在 0.6s**（Stripe Sessions 双轨）

- 灵感：Stripe Sessions 切到副演讲者时短暂双 PiP + 同一品牌色块衔接
- 应用：**Beat 4（38-42s）**——v2 切同事视角是"点 Talk to them → banner 滑入"线性流程。v3 升级：点击 Tom 卡的瞬间，**画面 split 成左右两半** 0.6s——左半保持原 Pace 视角（你说话的输入框），右半立刻出现 Tom persona banner + Tom 的字号略小、字色偏 cool 的输入框。两个输入框**同时 placeholder 字符级出现**「对 Tom 说点什么...」。0.6s 后右半"吃掉"左半（wipe 从右往左），完成视角切换
- 落地：HyperFrames split-view 用 `comparison-split` scene 复用，但只持续 600ms 而非整 beat；切回时用一次 wipe-left（在 v2 的 "1 处 wipe" 配额内）

### 创新点 5 — **mono 小字"凭据角注"贯穿全片**（Raycast + Figma 共享手法）

- 灵感：Raycast palette 角落 mono 小字；Figma Config 时代切换右下小字
- 应用：**全片**——v2 几乎不用 mono 小字。v3 在右下角**固定一行 JetBrains Mono 12pt 凭据角注**，随 beat 变化：

  | 秒数 | 角注内容 |
  |---|---|
  | 0-5s | `~/pace/CLAUDE.md · v0.2` |
  | 5-14s | `~/.claude/projects/D--lll-pace · 8 turns` |
  | 14-30s | `git_log → 5 · git_diff → 47 lines · cc_recent → 8 turns` |
  | 30-38s | `5 tools · 582 chars thinking · 29.3s` |
  | 38-52s | `team/tom.md · agent: codex-cli-2 · RACI: R` |
  | 52-60s | `electron · MIT · BYOK · github.com/Upp-Ljl/Pace` |

  - 信号意义：Pace 是**本地 / 透明 / 看得见数据来源**的工具——这些细节就是"诚实标签"的视觉化
  - 落地：HyperFrames 全片浮层 `<div.credits>`，position fixed bottom: 24px right: 32px, color `#FAF8F5` 0.55 opacity, font-family JetBrains Mono 12px，内容每 beat fade 切换 200ms

### 创新点 6 — **Granola 风 before/after morph：cc transcript "脏稿" → mentor "干净答案"**

- 灵感：Granola 笔记从糊到清的 6s morph
- 应用：**Beat 3 中段（22-28s）**——v2 工具调用 3 行砸入完直接进正文流字。v3 中间插入一个 **6s morph 镜头**：
  - 起：屏幕左半显示一段真实 cc transcript 摘录（mono 字，凌乱、长、夹杂 `<tool_use>` 标签碎片）
  - 中：transcript 字符**逐区域**变模糊（gaussian blur 8px）然后重组
  - 终：屏幕右半凝结成 mentor 的清晰中文段落（衬线 16pt，3 行干净话）
- 这个 morph **直接对应 Pace 的"lazy 读 cc → 推断 → 输出"产品定义**（5 锁死决策 #3）。Granola 的招牌动作给我们用，但意义变成"Pace 不是把 transcript 喂给 LLM 重述，是真在读 + 推断"
- 落地：HyperFrames split-view，左侧文本 opacity 1 → 0 + blur 0 → 8px in 2s，右侧文本 typewriter-fast（不是字符级，是 word-level chunk）2s 内出完，配重音 bell sfx 一次

### 创新点 7 — **Beat 5 反定义不是"快闪 3 条"，是"逐条划线 + 留白 + 红 → 紫色"色彩跃迁**（Linear 黑底大字 + Stripe 章节卡）

- 灵感：Linear 一句话宣言留白 + Stripe 章节卡切换
- 应用：**Beat 5（50-60s）**——v2 是 3 条红 ╳ 字幕快闪每条 0.7s。v3 改成：
  - 50-52s：黑底白衬线一句**反潮流声明**：「**它不是 task tracker。**」（同 Linear 句式：陈述句 + 句号 + 留白；不快闪，停 1.8s）
  - 52-54s：句号上**红线划过**（240ms 从左到右），整句**保持在画面**渐变到深红色，定 1s
  - 54-56s：红色整句**收缩**成一个红点（位于句号位置），红点**颜色翻转**变紫色 `#6B4FE0` 200ms
  - 56-58s：紫点炸开变 Pace wordmark `✦ pace`，下方 3 行衬线小字**逐行 fade in**：
    > 它是 mentor。
    > 它读你的 cc。
    > 它在你电脑里。
  - 58-60s：CTA mono 一行 `github.com/Upp-Ljl/Pace`，钢琴长尾消音 1.2s
- **关键反差**：v2 的反定义是"否定 × 3"快速骂街；v3 的反定义是"否定 1 句 → 红 → 收缩 → 紫 → 肯定 3 句"——**通过色彩从红到紫完成"它不是 X，它是 Pace"的语义闭环**

---

## 三、v3 整体节奏与硬约束

| 项 | v3 取值 | 与 v2 对比 |
|---|---|---|
| 总时长 | **60s** | 不变（硬约束） |
| 配音 | **零 VO** | 不变（硬约束） |
| 字幕语言 | 中文为主 + 英文 toggle | 不变 |
| BGM | `cinematicCalm` mood，0.55-0.85 音量（音量曲线更动态） | v2 是 0.6-0.8 平稳 |
| 主转场 | **fade 主 + 1 次 wipe（38-42s split close）+ 1 次 morph（22-28s transcript morph）** | v2 是 fade + 1 wipe |
| 画面比例 | 16:9 (1920×1080) | 不变 |
| BGM 能量曲线 | 起拍极轻 (0-5s) → 静默小拍 (5-7s) → 期待 (7-18s) → 一次重音对齐 morph 收尾 (28s) → 黑屏 1 帧后 bass swell (30s) → 持续 (30-50s) → 划线红 → 紫色翻转重音 (54s) → 收束钢琴长尾 (58-60s) | v2 是单调递增 → 重音 → 收尾；v3 多 2 个重音锚点 |
| 字体 | hero 大字 **Source Serif 4 Italic 600**；UI **Inter 500**；mono 凭据角注 **JetBrains Mono 12pt** | 同 v2 但 mono 用法升级为贯穿元素 |
| 主色 | Pace 紫 `#6B4FE0` / accent deep `#4B33B8` / accent soft `#EAE3FF` / 底色 `#0E0F12` / 反定义红 `#C44A4A`（仅 50-54s）/ 字幕白 `#FAF8F5` | 同 v2 |

**v3 仍 align `no-vo-ui-workflow` archetype 的 narrative arc**（个性化冷开场 → 一句话提需求 → 看着产物长出来 → 追加迭代 → 品牌定格）。但每个 beat 的视觉手法被换成上述 7 个创新点的实现。

---

## 四、5 beat 升级版分镜表

| beat | 时长 | scene atom | 画面 | 字幕 / 文字 | 字体动画 | 转场（进 / 出） | 音乐 | 凭据角注 |
|---|---|---|---|---|---|---|---|---|
| **1 — 宣言开场** | 0-5s | `hook-slate` | 纯黑底 `#0E0F12`，画面中央 88pt 白衬线 italic 句子 | **「项目管理不是问 cc 写代码。」** | 第 0-0.4s 句子从下方 +20px 浮入到位 fade 0→1；句末紫色光点 ✦ 在 4.6s 亮起 0.2s 后炸开（衔接 beat 2） | 出：光点 bloom → 紫色全屏覆盖 → beat 2 | 钢琴单音 1 拍，1.2s 后第二音；BGM 0.55 | `~/pace/CLAUDE.md · v0.2` |
| **2 — 语言降临** | 5-14s | `recording-with-callouts` + `html-frame` | 黑底紫色覆盖 fade out 揭出 Pace panel（dock 不滑入，是**已经在那**——黑屏覆盖期间 dock 已 mount，省一个滑入动效）。Ask tab 全屏。**用户的整句 prompt 已经悬浮在 input 框上方 80px**（24pt 衬线）：「我刚改了 IPC race bug，下一步该干啥？」→ 句子整段往下平移进 input 框 → input 框光晕一脉 → 回车 → 句子飞起来变 user bubble | 句子本身即字幕；input 框 placeholder 在 prompt 落入瞬间变实际文本 | prompt 整体位移 300ms ease-in-out；光晕脉冲 200ms `#6B4FE0` 50% → 0% | 出：fade 0.4s 到 beat 3 | 5-7s 仅持续低频底噪（**短促静默**让观众读完 prompt），7s 起 pad swell | `~/.claude/projects/D--lll-pace · 8 turns` |
| **3 — 边读边想（含 morph 重磅镜头）** | 14-38s | `agent-framework` + `feature-spotlight` + `comparison-split`（morph 段） | **14-22s：工具调用 3 行依次砸入** mentor bubble 内（fade-in-up 300ms + 500ms gap），thinking 框上沿同步出现「🧠 思考中 · 0 字 · 0.2s」流字。<br>**22-28s：transcript morph 重磅镜头**——画面 split 成左右两半：左侧"脏" cc transcript jsonl（mono 12pt，多行夹杂 tool_use 标签碎片，opacity 1），右侧空白。左侧文本**逐字段 fade 0 + gaussian blur 0→8px**，2s 内消散；同步右侧从顶部 typewriter-fast（word-level chunk）出 3 行干净 mentor 中文段落（衬线 16pt）。**28s 重音 bell sfx**。<br>**28-30s：折叠+黑屏 1 帧+bloom**——thinking 框瞬间 collapse 到 28px header（"思考完成 · 582 字 · 29s ⌄"），**29.984s 全画面 1 帧黑屏**，30.000s spatial bloom 从折叠位置（thinking header 中点）radius 0→1200px ease-out 350ms 充满 `#EAE3FF`，350ms 后 bloom 退散。<br>**30-38s：正文流字** mentor 正文区开始流真实中文答案（markdown 渲染），3 行干净结论 | 工具调用行同步字幕「翻 git · 翻 cc · 翻 transcript」（14-22s）。morph 段无字幕（让画面讲话）。28s bell 时无字幕。30s 黑屏后正文流字即字幕 | 工具行 fade-in-up + scale 0.95→1.0；morph 段 blur 0→8px；折叠 250ms cubic-bezier(0.6,0,0.4,1)；bloom 350ms ease-out | 进：fade；中段（22s）crossfade-via-blur；末段（30s）**1 帧黑屏 + spatial bloom**（不算独立转场，算"再生"）；出：fade 0.4s 到 beat 4 | 14-22s 能量爬升 percussive layer；22s morph 起一次 swell；28s bell 单击重音；30s 黑屏后 sub-bass 单击 + 钢琴主旋律入；30-38s 持续 0.75 | 14-22s `git_log → 5 · git_diff → 47 lines · cc_recent → 8 turns`，30s 后切 `5 tools · 582 chars thinking · 29.3s` |
| **4 — 双轨切同事视角** | 38-52s | `recording-with-callouts` + `comparison-split` | **38s：fade in 到 Team tab**——3 张同事卡（晓婷 PM·A / Tom Eng·R / 阿珍 Designer·C）从左侧 staggered 100ms 滑入。鼠标 hover Tom 卡停 0.2s → 点 `💬 Talk to them`。<br>**40-40.6s：split 双轨 0.6s**——画面 split 50/50：<br>　左半：保持 Pace 主面板（用户视角输入框，placeholder 灰字「Ask anything...」）<br>　右半：黑色 wash 0.2s 后 reveal Tom persona banner（紫底白字「你正在以 Tom（Eng）的视角对话」） + Tom 视角输入框（placeholder 字号略小 14pt，cooler 紫调，「对 Tom 说点什么...」字符级出现）<br>　两侧 placeholder 同时 typing 给"双声道"印象<br>**40.6s：wipe-left** 右半"吃掉"左半 200ms，全屏切到 Tom 视角<br>**41-52s：发问 + Tom 第一人称答**——输入框直接打字「这一波 IPC 重构稳吗？」→ 回车 → mentor 以 Tom 第一人称答："我作为 Tom 看，setTimeout 50ms 兜底有点脆..."末尾签名 "— Tom (Eng · R)" | split 段无字幕（双 placeholder 自己讲）；wipe 完成时 banner 滑入既是字幕也是 UI | persona banner top -32px → 0px + opacity 0→1 350ms；input placeholder 字符级出现 60ms/字 | 进：fade；split-and-wipe（v3 配额内唯一一次 wipe）；出：fade 0.4s 到 beat 5 | 持续爬升 0.80，进入 percussive layer 鼓点，41s 加密 hi-hat | `team/tom.md · agent: codex-cli-2 · RACI: R` |
| **5 — 反定义 → 色彩翻转 → 品牌定格** | 50-60s ⚠️ | `comparison-split` + `kineticTypography` + `cta-outro` | ⚠️ **注**：beat 5 起点提前到 50s（与 beat 4 重叠 2s），是有意的——50-52s 画面已经 fade-to-black 但 beat 4 余音的 BGM 仍 ride。<br>**50-52s：黑底大字反潮流声明**「**它不是 task tracker。**」（88pt 衬线 italic，居中）<br>**52-54s：红线划过句号** 240ms 从左到右穿过整句下沿，整句颜色 fade 到 `#C44A4A` 深红，定 1s（**留白 1s 让观众读两遍**）<br>**54-56s：红 → 紫 色彩翻转**——红字整体收缩到句号位置变红点（scale 1→0.05, 400ms ease-in），红点颜色 `#C44A4A` → `#6B4FE0` 200ms<br>**56-58s：紫点炸开 → wordmark + 3 行肯定句**——紫点 box-shadow blast 240px scale，触发 wordmark `✦ pace` fade-in（88pt 衬线），下方 3 行衬线 16pt 逐行 fade-in（每行 stagger 250ms）：<br>　它是 mentor。<br>　它读你的 cc。<br>　它在你电脑里。<br>**58-60s：CTA + 长尾**——最下方 mono 16pt `github.com/Upp-Ljl/Pace` fade in；钢琴长尾消音 1.2s | 字幕本身即内容；反定义 1 句、肯定 3 句、CTA 1 行 | 整句 fade-color 800ms 红；收缩 400ms ease-in；颜色翻转 200ms；wordmark + 肯定句 stagger 250ms | 进：fade-to-black 0.4s；内部 hard-color-fade（无 cut）；出：消音淡入 | 50-52s 鼓点持续；52-54s 一次"划线"重音对齐红线；54s 颜色翻转一次低频 sub-bass 重音；58s 起钢琴单音长尾，60s 消音 | 56s 后切到 `electron · MIT · BYOK · github.com/Upp-Ljl/Pace` |

---

## 五、scene atom + 转场 + 镜头映射

| beat | 主 scene atom | 副 scene atom | 复合手法 | 转场进入 | 转场退出 |
|---|---|---|---|---|---|
| 1 | `hook-slate` | — | 黑底衬线大字 | （cold open） | bloom |
| 2 | `recording-with-callouts` | `html-frame` | 黑覆盖期间 dock mount + 整句位移 | bloom 接力 | fade 0.4s |
| 3 | `agent-framework` + `feature-spotlight` | `comparison-split` (22-28s morph 段) | 工具行砸入 + transcript morph + 1 帧黑屏 + spatial bloom | fade 0.4s | fade 0.4s |
| 4 | `recording-with-callouts` | `comparison-split` (40-40.6s split 段) | split-and-wipe（双轨 0.6s + wipe-left 200ms） | fade 0.4s | fade 0.4s |
| 5 | `kineticTypography` | `cta-outro` | 反定义 → 红线 → 收缩 → 紫翻转 → wordmark + 3 行 | fade-to-black 0.4s | 消音淡出 |

**全片转场预算审计**（pitchkit skill §二硬规则 6 = fade 主 + 至多 1 处非 fade）：
- fade（标准）：beat 1↔2 / beat 2↔3 / beat 3↔4 / beat 4↔5
- spatial bloom（beat 3 内 30s）：**算"内部再生"而非 beat 间转场**，不占配额（因为 beat 3 本身没结束）
- wipe-left（beat 4 内 40.6s）：**占用全片 1 处 wipe 配额**
- morph（beat 3 内 22-28s）：通过 blur+fade 合成的视觉 morph，**不算硬转场**（仍在 split-view 单 scene 内）

合规：1 处 wipe + 全 fade，符合 archetype 规则。

---

## 六、关键反差点（v3 = **4** 个，v2 = 2 个）

| # | 秒数 | 反差内容 | 视觉手法 | 音乐重音 |
|---|---|---|---|---|
| 1 | 4.6s | 黑底大字一句话 → 紫光点炸开成 UI 工作空间 | bloom 释放 | 钢琴第二音 |
| 2 | 28s | "脏" cc transcript → "干净" mentor 答案（morph 完成瞬间） | blur 收束 + bell sfx | bell 重音单击 |
| 3 | 30s | 思考框折叠 + **1 帧全黑** + spatial bloom 释放 → 正文长出来 | 1 帧黑屏 + bloom 350ms | sub-bass + 钢琴主旋律入 |
| 4 | 54s | 红色否定句 收缩→紫点→Pace logo（**色彩从红到紫的语义翻转**） | scale + 颜色 cross-fade | sub-bass swell + 钢琴长尾起 |

**v3 比 v2 多 2 个反差点**：22-28s morph 和 54s 色彩翻转。两个都是观众**单帧截图就转发**的候选。

**反差密度审计**：60s 内 4 个反差点 = 平均 15s 一次，未到疲劳阈值（pitchkit skill 经验值 ≤ 12s 间隔会让观众累；≥ 18s 间隔太稀松）。

---

## 七、与 v2 的精确 diff changelog

| 维度 | v2 | v3 | 升级理由 |
|---|---|---|---|
| **Beat 1 开场** | Pace logo 淡入 + dock 滑入 + 4 张观察卡 + 字幕「它先看一眼，再开口」 | 黑底白衬线大字宣言「项目管理不是问 cc 写代码。」+ 句号紫色光点炸开衔接 beat 2 | Linear 黑底大字招牌；一句宣言抵 30s 配音稿；省掉 dock 滑入老套路 |
| **Beat 2 提问** | 字符级打字 80ms/字 + 字幕 = prompt | prompt 整句已在 input 框上方悬浮（"语言降临"）→ 整体位移进 input 框 | 字符级打字是 2020 年套路；整句位移更高级，且暗示"用户已经想清楚"而非"现场打字" |
| **Beat 3 工具调用** | 3 行砸入 + 思考框折叠 white bloom + 0.5x 慢动作 | 3 行砸入 **+ transcript morph 重磅镜头**（22-28s）**+ 1 帧全黑** + spatial bloom（Vision Pro 招牌） | morph 直接对应"lazy 读 cc + 推断"产品定义；1 帧黑+bloom 比 white flash 更具仪式感 |
| **Beat 4 切同事** | 卡片滑入 → 点 Talk to them → persona banner 滑入（线性） | **split 双轨 0.6s**（左用户视角 / 右 Tom 视角同时 placeholder typing）→ wipe-left 完成切换 | Stripe Sessions 双演讲者 PiP 招牌；视觉化"同时存在两个对话面"的产品意图 |
| **Beat 5 反定义** | 3 条红 ╳ 划线字幕快闪每条 0.7s | 1 句反定义陈述 → 红线划过 → 留白 1s → 红字收缩成红点 → **红→紫色彩翻转** → 紫点炸开 wordmark + 3 行肯定句 | "否定 × 3 骂街" → "否定 1 句然后通过色彩翻转完成它不是 X 它是 Pace 语义闭环"；更克制更高级 |
| **凭据角注** | 无 | 全片右下 JetBrains Mono 12pt 角注随 beat 切换内容 | Raycast/Figma 共享手法；信号"本地+透明+诚实标签" |
| **反差点数量** | 2 个（30s 折叠 / 52s 反定义快闪） | **4 个**（5s bloom / 28s morph 完成 / 30s 折叠+黑屏+bloom / 54s 红→紫翻转） | 60s 视频反差密度 ~15s 一次最舒适 |
| **BGM 重音锚点** | 30s 一次 + 52-55s 三次 | 5s 钢琴第二音 + 28s bell + 30s sub-bass + 54s sub-bass swell + 58s 长尾入 | 4 个明确锚点对齐 4 个反差点；BGM 不再只在尾段集中 |
| **mono 字用法** | 仅 beat 3 工具行内部 | 全片右下凭据角注（贯穿）+ beat 3 内部工具行 + beat 5 CTA | mono 字成为"诚实数据"的视觉化语义符号 |
| **转场预算** | fade + 1 wipe | fade + 1 wipe（位置变了：从 4↔5 → 4 内部 40.6s）+ 1 frame black + bloom（beat 3 内部）+ blur-morph（beat 3 内部） | 内部非转场动效大量增加，但 beat 间仍 fade 主，合规 |

### v2 哪里我认为是错的（v3 修正）

1. **v2 的 dock 滑入开场太套路**——任何 dev tool 视频都这么开。Pace 卖的不是"我是个 desktop app"，是"它先看一眼再开口"。开场应该立场先行，UI 让位。v3 把 UI 推到 beat 2。
2. **v2 字符级打字是 8 年前的把戏**——观众已经看腻了 placeholder 灰字消失 + 逐字浮现。v3 用"整句已经成型，往下落入框"暗示 mentor 接的是**已经想清楚的需求**而非现场敲键盘。
3. **v2 反定义快闪是"骂街式"**——3 条 ╳ 红字闪过太密，看完只记得"它否定了 3 件事"但记不住"它是什么"。v3 把节奏拉慢到 1 句反定义 + 1 次色彩翻转 + 3 句肯定，画面停留时间够观众读完。

### v3 保留 v2 不变的部分

- 60s + no-VO + 5 beat + 单 session 贯穿 + `no-vo-ui-workflow` archetype 4 个硬约束
- 配色（紫 / 反定义红 / 字幕白 / 底色 darkpanel）
- 字体（Source Serif 4 / Inter / JetBrains Mono）
- BGM mood `cinematicCalm` + 钢琴 + sub-bass pad 风格（参考 Linear 官方 demo 的 lo-fi）
- 禁用项（synth 大滑音 / trap 鼓点 / 科技感 epic / AI 生成感强混响）

---

## 八、渲染前 checklist（更新自 v2）

```
脚本
[x] 挑了一个 archetype 继承（no-vo-ui-workflow），不是从零编
[x] 有叙事弧线、单一任务贯穿（用户 Pace session）、首尾呼应（黑底宣言开场 → 黑底反定义+wordmark）
[x] beat 5 个，每个一个明确目的
[x] 每个 beat 至少 1 个"被记住的瞬间"（5s bloom / 14s 语言降临 / 28s morph / 30s 黑屏+bloom / 40s 双轨 / 54s 红→紫翻转）

画面
[x] 每个 scene 按 when_to_use 选的（hook-slate / recording-with-callouts / agent-framework / feature-spotlight / comparison-split / kineticTypography / cta-outro）
[x] 转场 fade 主 + 1 处 wipe（位置：beat 4 内部 40.6s）
[x] 单 scene 一个信息点（反定义只 1 句、肯定 3 行分 3 个 stagger）
[x] 凭据角注（mono 右下）贯穿全片，6 段内容随 beat 切换
[x] 1 帧黑屏 + spatial bloom（beat 3 内 29.984-30.000s）作为"再生"动效
[x] transcript morph（22-28s）作为产品定义视觉化镜头

音乐
[x] mood cinematicCalm 匹配 mentor 气质
[x] bgm_volume 动态曲线 0.55-0.85（no-VO 模式下 BGM 是主音轨）
[x] 4 个重音锚点对齐 4 个反差点（5s / 28s / 30s / 54s）
[x] 5-7s 短促静默作为 prompt 进框前的呼吸

配音
[x] no-VO
[x] 字幕承载信息：beat 1 一句宣言 / beat 2 prompt 即字幕 / beat 3 工具行同步 / beat 5 反定义 + 肯定 + CTA
[x] 不需要 voice 语言

凭据真实性（Pace 反 fabricate 红线）
[x] beat 1 句子「项目管理不是问 cc 写代码」与 PRODUCT.md §1 + 反定义清单一致
[x] beat 2 prompt「我刚改了 IPC race bug，下一步该干啥？」对应 519 归档 §IPC race 真实修复
[x] beat 3 工具调用 git_log/git_diff/cc_recent_transcript 对应 mentor-pipeline 真实 tool surface
[x] beat 3 morph 左侧"脏 transcript"对应 cc 真实 jsonl 结构（type=user / type=assistant / tool_use 标签）
[x] beat 4 Tom (Eng·R) 第一人称答 对应 PRODUCT.md §RACI + 团队同事视角 persona
[x] beat 5 反定义 1 句 + 肯定 3 句 对应 PRODUCT.md §反定义 + §1 一句话定位
[x] 凭据角注 6 段内容全部来自真实文件路径 / 真实工具命名（无 fabricate）
```

---

## 九、给主 agent 的 next action（如用户 OK 此剧本）

```bash
# 1. scaffold storyboard JSON（pitchkit）
bun cli/index.ts scaffold-storyboard --duration 60 --output D:/lll/pace/docs/pace-storyboard-v3.json

# 2. 按本文 §四 5 beat 分镜表 + §五 scene atom 映射 手工填充
#    重点配置：
#    - beat 3 添加 22-28s 内部 comparison-split sub-scene (transcript morph)
#    - beat 3 添加 29.984-30.350s 内部黑屏 + bloom 覆盖层
#    - beat 4 添加 40.0-40.6s 内部 split 双轨 + 40.6-40.8s wipe-left
#    - beat 5 添加 50-60s kineticTypography + cta-outro 复合，含红→紫色彩翻转 keyframe
#    - 全片浮层 .credits（JetBrains Mono 12pt）随秒数切换 6 段文本

# 3. lint 校验（转场配额：1 wipe，其他 fade）
bun cli/index.ts lint D:/lll/pace/docs/pace-storyboard-v3.json

# 4. 浏览器预览
bun cli/index.ts preview D:/lll/pace/docs/pace-storyboard-v3.json

# 5. estimate
bun cli/index.ts estimate D:/lll/pace/docs/pace-storyboard-v3.json

# 6. 渲染
bun cli/index.ts render-storyboard D:/lll/pace/docs/pace-storyboard-v3.json D:/lll/pace/docs/pace-demo-v3.mp4

# 7. 抽帧自审（重点 7 个时刻：0s 黑底大字 / 4.8s bloom / 14s 语言降临 / 28s morph 完成 / 30.000s bloom 释放 / 40.3s 双轨 / 54s 红→紫翻转）
bun cli/index.ts inspect D:/lll/pace/docs/pace-storyboard-v3.json
ffmpeg -y -ss 0 -i pace-demo-v3.mp4 -frames:v 1 frame-00s.png
ffmpeg -y -ss 4.8 -i pace-demo-v3.mp4 -frames:v 1 frame-04s.png
ffmpeg -y -ss 14 -i pace-demo-v3.mp4 -frames:v 1 frame-14s.png
ffmpeg -y -ss 28 -i pace-demo-v3.mp4 -frames:v 1 frame-28s.png
ffmpeg -y -ss 30 -i pace-demo-v3.mp4 -frames:v 1 frame-30s.png
ffmpeg -y -ss 40.3 -i pace-demo-v3.mp4 -frames:v 1 frame-40s.png
ffmpeg -y -ss 54 -i pace-demo-v3.mp4 -frames:v 1 frame-54s.png

# 8. 美学打分（pitchkit-aesthetic-review skill）≥ 8.0 且每维 ≥ 7 才交付
```

---

## 最后一行总结

**v3 = 60s + no-VO + 5 beat + 一个真实 Pace session 贯穿** + **黑底衬线宣言开场（Linear）** + **prompt 整句位移（Arc）** + **transcript morph 重磅镜头（Granola）** + **1 帧黑屏 + spatial bloom（Vision Pro）** + **双轨同事视角（Stripe）** + **红→紫色彩翻转闭环（v3 原创）** + **mono 凭据角注贯穿（Raycast/Figma）**

7 个手法都从被广泛认可的视频里偷来，但每一个都被绑定到 Pace 真实功能 + 真实 product position，不是"为炫技而炫技"。

