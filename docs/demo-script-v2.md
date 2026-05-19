# Pace Demo Video Script v2 — 60s no-VO 高级感版

> v2 来自反馈：v1 (`demo-script.md`) 太长 (120s)、配音密度高、像念稿。v2 走 pitchkit `no-vo-ui-workflow` archetype——蒸馏自 25+ 支 Anthropic 官方无旁白 promo 视频的成熟骨架。**没有真人配音**，靠打字动效 + UI 状态变化 + 字幕 + 音乐节奏讲完一个连贯任务。
>
> 参考权威：Anthropic `Turn ideas into interactive artifacts` / `Claude can create and edit files` / `Pick up where you left off`。Linear / Granola / Anthropic 主流 promo 都已退潮 VO 视频，no-VO 是 2025-2026 现代产品视频默认。

---

## 一、整体节奏

| 项 | 取值 | 备注 |
|---|---|---|
| 总时长 | **60s** (no-vo-ui-workflow archetype 标准时长) | v1 是 120s，砍半 |
| 配音 | **零旁白零真人** | 全程字幕 + UI 文字承载信息 |
| 字幕语言 | 中文为主 + 英文 toggle (i18n 两套) | global_captions 字段 |
| BGM | `cinematicCalm` mood，**0.6-0.8 音量**（no-VO 高音量做主音轨）| pitchkit 默认 procedural / MusicGen |
| 主转场 | **`fade`** 全片一种 + 1 处 `wipe`（屏 4 → 屏 5 反定义对比） | skill 硬规则 6 |
| 画面比例 | 16:9 (1920×1080) | 标准 promo 比例 |
| BGM 能量曲线 | 起拍 (0-6s) 低 → 期待 (6-16s) → 爬升 (16-38s) → 接近高点 (38-52s) → 收束 (52-60s) | 对齐 5 beat |

## 二、archetype 骨架对位

**Selected archetype**: `no-vo-ui-workflow` (60s)

**叙事弧线**：个性化冷开场 → 一句话提需求 → 看着产物长出来 → 追加迭代 → 品牌定格

**贯穿任务**：一个真实用户的 Pace 使用 session（开 Pace → 问 mentor → 看判断长出 → 切同事视角再问 → 结束）

**首尾呼应**：
- 开场 `hook-slate` Pace 品牌色画框托起 panel 滑入
- 结尾 `cta-outro` 同色 panel 缩成 Pace logo + 反定义字幕快闪

## 三、5 beat 分镜表

| beat | 时长 | scene atom | 内容 | 字幕 | BGM 状态 |
|---|---|---|---|---|---|
| **1 个性化冷开场** | 0-6s | `hook-slate` + `html-frame`（Pace dock 滑入） | 全黑底 → Pace logo（✦ + brand 紫）淡入 → 右侧 Pace 桌面 dock 从屏幕外滑入 landed 到右侧 1/3。Now tab 显 4 张观察卡：`Working directly on main` / `29 commits ahead` / `Last 5 commits all about UI` / `⏳ 47 min since last commit` | 字幕（白衬线小字）「**它先看一眼，再开口。**」 | 轻盈起拍，钢琴单音 |
| **2 一句话提需求** | 6-16s | `recording-with-callouts` simulated cursor + `html-frame` | Ask tab 滑入填满画面。input 框获得焦点，placeholder 灰字 `Ask anything...` 消失。**字符级打字动效**逐字打："我刚改了 IPC race bug，下一步该干啥？" 末尾停顿 0.5s → 回车 → input 内容上飞成 user bubble | 字幕同步 input 内容（即"prompt 即字幕"——skill §一硬规则 2 风格） | 期待感铺垫，pad 加入 |
| **3 mentor 边想边查（产物实时长出来）** | 16-38s | `recording-with-callouts` + `agent-framework`（工具调用动画）+ `feature-spotlight`（思考折叠瞬间） | mentor bubble 出现，左 2px 紫色边 + breathe 光晕。**思考框先出现**：head 行「🧠 思考中 · 0 字 · 0.2s」流字。然后 **3 行工具调用** 依次砸入（fade-in-up，500ms gap）：`🔧 git_log → 5 commits returned` / `🔧 git_diff → 47 lines changed` / `🔧 cc_recent_transcript → 8 turns`。思考框累计 582 字、29s。**第 30 秒：思考框瞬间折叠成 "思考完成 · 582 字 · 29s ⌄"**（0.5x 慢动作 + 1 帧 white-bloom）。正文区开始流字（markdown 渲染） | 字幕：「翻 git · 翻 cc · 翻 transcript」（工具调用时同步出现）。第 30 秒思考折叠时**全画面字幕**：「**5 个工具 · 一次回答**」 | 能量爬升，sub-bass pad 进入；30s 折叠瞬间一个鼓点重音 |
| **4 切同事视角追加迭代** | 38-52s | `recording-with-callouts` + `comparison-split`（你的视角 vs 同事视角） | 切到 Team tab —— 3 张同事卡（晓婷 PM·A / Tom Eng·R / 阿珍 Designer·C）从左侧滑入。鼠标 hover Tom 卡停 0.3s → 点 `💬 Talk to them` → **紫色 persona banner 滑入**「你正在以 **Tom（Eng）** 的视角对话」。input placeholder 同步变 `对 Tom 说点什么...`。直接打字："这一波 IPC 重构稳吗？"→ 回车 → **mentor 用 Tom 第一人称答**："我作为 Tom 看，setTimeout 50ms 兜底有点脆..." 末尾签名 "— Tom (Eng · R)" | 字幕：「**见面前，先和 ta 的视角对话。**」（banner 落定瞬间） | 持续爬升，加进 percussive layer |
| **5 反定义快闪 + 品牌定格** | 52-60s | `comparison-split`（反定义 ╳ 划线）+ `cta-outro` | 画面 wipe 转场。三条反定义字幕**快闪**（每条 0.7s，红色 ╳ 划线，前一条 0.1s 淡出后一条立即砸入）：<br>「**不是** task tracker ╳」<br>「**不是** chat 替代品 ╳」<br>「**不是** IDE 插件 ╳」<br>→ 三字幕收缩成中心一个紫色光点 → 光点炸开变成 Pace wordmark `✦ pace`<br>下方 mono 字 `Local · Yours · PMP-aware`<br>再下行 CTA `github.com/Upp-Ljl/Pace · v0.2 coming`<br>右下角小字 `Electron · MIT · BYOK` | 字幕本身即内容（快闪 3 字幕） | 重音砸第三条字幕，钢琴长尾消音 1.2s |

## 四、scene atom 映射

| beat | 主 scene | 副 scene | 用途 |
|---|---|---|---|
| 1 | `hook-slate` | `html-frame`（dock 滑入动效） | 标题 + 品牌色画框 |
| 2 | `recording-with-callouts` | `html-frame`（input 打字动效）| 全屏 Ask tab + 打字 |
| 3 | `agent-framework`（工具调用流）| `feature-spotlight`（折叠瞬间高亮）| 过程透明三件套 |
| 4 | `recording-with-callouts` | `comparison-split` | 同事视角切换 |
| 5 | `comparison-split` | `cta-outro` | 反定义 + 品牌 |

**全片转场默认 `fade`**，仅 beat 4 → 5 一次 `wipe`（强调反定义的对比性）—— skill §二硬规则 6。

## 五、视觉规格

### 配色（与 landing 一致）

| 用途 | hex |
|---|---|
| Pace 品牌主紫 | `#6B4FE0` |
| accent deep | `#4B33B8` |
| accent soft（持光晕） | `#EAE3FF` |
| 视频底色 | `#0E0F12` （Pace panel dark）|
| 字幕白 | `#FAF8F5` |
| 反定义 ╳ 红 | `#C44A4A` |
| 成功绿 | `#3A8A5C` |

### 字体

| 角色 | 字体 |
|---|---|
| hero-slate 大标 / 反定义字幕 | **Source Serif 4** Italic 600 |
| UI mock 字 | **Inter** 500 |
| 工具调用 / commit hash / path | **JetBrains Mono** 400 |

### 关键动效（HyperFrames 实现）

| 动效 | 时机 | spec |
|---|---|---|
| Pace dock 滑入 | beat 1 (3s) | 从右侧 100% 屏幕外滑入到 right: 60px，ease-out 800ms |
| 字符级打字 | beat 2 (8s) | 每字 80ms, blink cursor 600ms 周期 |
| 工具调用行砸入 | beat 3 | 每行 fade-in-up 300ms + 500ms gap，scale 0.95→1.0 |
| 思考折叠 | beat 3 (30s) | max-height 200px → 28px, padding 同步, 250ms cubic-bezier(0.6, 0, 0.4, 1)，**0.5x 慢动作填 1s** + 1 帧 #FFF bloom |
| persona banner 滑入 | beat 4 (42s) | top -32px → 0px, 紫色背景从 0→1 opacity，350ms |
| 反定义字幕快闪 | beat 5 (52-55s) | 每条 0.7s 停留，红 ╳ 划线从左到右 200ms，前一条 fade out 100ms 与后一条 砸入并行 |
| logo 炸开 | beat 5 (55s) | 紫色光点 from radius 4px → blast 240px scale + opacity，触发 wordmark fade-in |

## 六、音乐曲线

```
能量
1.0 |                                  ╭─── (52-58s 高点)
0.8 |                           ╭──╯         (28-52s 爬升)
0.6 |              ╭─╮         ╯
0.4 |     ╭─╯       ╰╯
0.2 | ╭───╯
0.0 ╰─────────────────────────────────────╮  (58-60s 收束)
    0   6   16   30          52      60s
```

- **0-6s 起拍**：钢琴单音两拍，pad 还没进
- **6-16s 期待**：sub-bass pad 进入，pad swell 准备
- **16-30s 爬升**：sub-bass + 高频闪烁（hi-hat），鼓点不进
- **30s 折叠重音**：第一个鼓点重音（kick 单击）对齐 thinking collapse
- **30-52s 接近高点**：percussive layer 进入，节奏密度递增
- **52-58s 高点**：钢琴主旋律 + 全乐器在线，3 个鼓点重音砸反定义字幕（53s / 54s / 55s）
- **58-60s 收束**：突然剩钢琴单音，长尾消音 1.2s

**禁用**：synth 大滑音、trap 鼓点密集、科技感 epic、AI 生成感强的混响。参考 **Linear 官方 demo** 的 lo-fi 钢琴 + 极低频 sub-bass pad 风格。

## 七、参考权威视频

写剧本前必看（pitchkit `scripts --refs` 里都有逐 beat 拆解）：

1. **Anthropic - "Turn ideas into interactive artifacts"** — no-VO + 单一任务贯穿 + UI 自解释样板
2. **Anthropic - "Claude can create and edit files"** — 思考过程外化 + 工具调用透明
3. **Anthropic - "Pick up where you left off"** — 个性化冷开场 + 首尾呼应
4. **Linear product launch** — 转场极简 + 衬线标题卡 + 单一品牌色块
5. **Granola hero loop** — before/after morph 节奏感

不参考：
- ❌ 任何带配音的 SaaS demo（如 Notion 早期视频）—— 已过时
- ❌ 任何带真人对镜头说话的（不是 b-roll）—— pitchkit 蒸馏发现品牌片人物只做 b-roll 或"书挡"
- ❌ AI 生成感强的科技感视频 / 大滑音 BGM —— 减分

## 八、与 v1 (demo-script.md) 的差异 changelog

| 维度 | v1 | v2 | 升级理由 |
|---|---|---|---|
| 时长 | 120s | 60s | no-vo-ui-workflow 标准 + 短视频留存率更高 |
| 配音 | 中文男声 + 118 字稿 | **零 VO** | 蒸馏 Anthropic 60% 视频是 no-VO；更高级 + 静音可看 |
| 字幕 | 配音同步 | **prompt 即字幕** | 用户输入和反定义直接当字幕，UI 自解释 |
| 转场 | 全 fade | **fade 主 + 1 处 wipe** | skill 硬规则；wipe 用在反定义对比强调 |
| beats | 13 镜头 | **5 beat** | archetype 标准；少于 8 个 |
| 关键反差点 | 3 个 (0:08 / 0:51 / 1:18) | **2 个 (30s 折叠 / 52s 反定义快闪)** | 节奏密度同步降低，避免观众疲劳 |
| BGM 音量 | 0.15-0.25（VO 下） | **0.6-0.8（no-VO 下）** | BGM 是主音轨，承担节奏叙事 |
| 同事视角 | beat 7 (1:05-1:32) | **beat 4 整合（38-52s）** | 14s 内讲完，节奏紧凑 |
| 反定义快闪 | 1:42-1:50 末尾 | **beat 5 主角（52-60s）** | 反 task tracker 立场是 Pace 核心定位，给到 8s 主舞台 |

## 九、渲染步骤（执行篇）

待 mock UI subagent 完成 + 用户审 v2 剧本后：

1. **Scaffold Storyboard JSON**：
   ```bash
   bun cli/index.ts scaffold-storyboard --duration 60 --output D:/lll/pace/docs/pace-storyboard.json
   ```
2. **手工填充 5 beat 内容**（按本剧本 §三 + §四）
3. **lint 校验**：
   ```bash
   bun cli/index.ts lint D:/lll/pace/docs/pace-storyboard.json
   ```
4. **预览 (browser scrub)**：
   ```bash
   bun cli/index.ts preview D:/lll/pace/docs/pace-storyboard.json
   ```
5. **estimate 预测时长+成本**：
   ```bash
   bun cli/index.ts estimate D:/lll/pace/docs/pace-storyboard.json
   ```
6. **render-storyboard 出片**：
   ```bash
   bun cli/index.ts render-storyboard D:/lll/pace/docs/pace-storyboard.json D:/lll/pace/docs/pace-demo-v2.mp4
   ```
7. **inspect + 抽帧自审**：
   ```bash
   bun cli/index.ts inspect D:/lll/pace/docs/pace-storyboard.json
   # 然后 ffmpeg -y -ss <秒> -i pace-demo-v2.mp4 -frames:v 1 frame.png 抽关键帧逐张审
   ```
8. **`pitchkit-aesthetic-review` skill 打分**：成片美学打分 ≥ 8.0 且每维 ≥ 7 才交付

## 十、渲染前 checklist（skill §渲染前 checklist 对位）

```
脚本
[x] 挑了一个 archetype 继承（no-vo-ui-workflow），不是从零编
[x] 有叙事弧线、单一任务贯穿（用户 Pace session）、首尾呼应（dock 滑入 → logo）
[x] beat 5 个，每个一个明确目的

画面
[x] 每个 scene 按 when_to_use 选的（hook-slate / recording-with-callouts / agent-framework / feature-spotlight / comparison-split / cta-outro）
[x] 转场 fade 主 + 1 处 wipe，没每段换花样
[x] 单 scene 一个信息点（反定义 3 条分 3 个 sub-beat）
[x] 用录屏的 beat 设计了呈现方式（hero panel 在 hook-slate 里 split-view 嵌入）

音乐
[x] mood cinematicCalm 匹配 mentor 气质
[x] bgm_volume 0.6-0.8（no-VO 模式下 BGM 是主音轨）

配音
[x] no-VO（短视频 / 发布片首选）
[x] 字幕承载信息，对齐每个 beat
[x] 不需要 voice 语言
```

---

## 最后一行总结

**v2 = 60s + no-VO + 字幕 + 5 beat + 一个真实 Pace session 贯穿 + 反定义快闪结尾 + Pace logo 定格**

要做的事情可控、转场不花哨、信息密度对、首尾呼应——按 Anthropic 25+ 支 no-VO promo 的成熟手法走，避免 v1 那种"念稿"质感。
