# Pace Demo Video Script v4 — 帧级别详尽剧本（subagent 机械翻译版）

> v4 来自 v3.1 美学审计（`v3.1-aesthetic-review.md` 总分 6.0/10，动效 4/10 不及格）+ 用户原话「**又慢又没有动画展示，也没有一些能够展现产品核心的内容，转场也很烂**」。
>
> v4 = v3.1 的 5 beat 结构 + 7 创新点骨架 + 用户化语言全保留，**但每个 beat 内动效密度翻 3 倍**、**每个产品核心能力被可视化成画面**、**转场预算的"那 1 处非 fade"被真正撑开到可见**。
>
> **本文档目标**：让任何 subagent 拿到 v4 都能**机械翻译**成 storyboard JSON——每个动效给完整 CSS `@keyframes` 代码片段、cubic-bezier 数值、animation-delay 时间表、DOM 骨架 + class 名、HyperFrames variables 块示例。**不再凭经验补缺**。
>
> v3 / v3.1 / v3.1-aesthetic-review 文档保留不动。本文档独立交付。

---

## 一、v4 vs v3.1 三大结构性升级（先说，再展开）

| 升级点 | v3.1 是 | v4 改成 |
|---|---|---|
| **1. 动效密度** | 5 beat 内全片 ≤ 30 个 keyframe 里程碑（动效声明很多但**几乎所有动画一次完成后停在终态 5-10 秒**），观众抽帧大概率看到静态画面 | **5 beat 内 ≥ 60 个 keyframe 里程碑均匀分布**，每个 segment 内**最长静止帧 ≤ 3s**，每秒至少 1 个可见状态变化 |
| **2. 产品核心可视化** | 用字幕**断言**产品能力（"读 cc 8 轮"、"翻 git 5 commit"、"思考 582 字"），但屏幕上没有真实可视化 | **真显示** 5 个 commit hash 列表（用 Pace 仓库真实 hash）、thinking 计数器**从 0 滚到 582**（setInterval 60ms）、transcript morph 真有 ≥ 4 个中间帧、mentor bubble 左边框紫脉冲 breath、4 行肯定句字符级 typewriter |
| **3. 转场质量** | fade 主 + 1 wipe + 1 spatial bloom，但**bloom 600ms 在 30fps 抽帧抓不到中间态**，wipe 前后留了 350ms 黑屏真空帧 | fade 仍主，但加 **5 种强转场**轮流出现且每个**至少 800ms 可见**：bloom blast / morph crossfade-via-blur / box-shadow expansion / typewriter wipe / scale+color flip——每个非 fade 转场出现时强制延长到 800ms 以上，剪辑师正常速率也看得到 |

**v4 整体时长仍 ≤ 120s（目标 118s）**，no-VO，5 beat，用户化语言（PMP 不上画面），主转场预算合规（fade + 至多 1 处 wipe 仍守，bloom / morph 算 scene 内部 frame-renders 不占配额）。

---

## 二、v4 整体节奏与帧表（115s @ 30fps = 3450 总帧）

| beat | 起秒 | 止秒 | 时长 | 总帧（@30fps） | scene atom（pitchkit） | 主反差点 |
|---|---|---|---|---|---|---|
| **1 黑底宣言** | 0 | 14 | 14s | 0-420 | `hook-slate` + `html-frame` | 12s 紫光点 box-shadow blast (800ms) |
| **2 语言降临** | 14 | 29 | 15s | 420-870 | `recording-with-callouts` + `html-frame` | 21s prompt 整句位移落入 input + 光晕脉冲 |
| **3 边读边想** | 29 | 70 | 41s | 870-2100 | `agent-framework` + `feature-spotlight` + `comparison-split` | 50s morph 完成 bell + 52s 黑屏+spatial bloom |
| **4 双轨切同事** | 70 | 100 | 30s | 2100-3000 | `recording-with-callouts` + `comparison-split` | 76s split + wipe-left + 88s Tom 紫光晕呼吸 |
| **5 反定义→翻转→品牌** | 100 | 115 | 15s | 3000-3450 | `kineticTypography` + `cta-outro` | 104s 红线 + 108s 红→紫色彩 cross-fade |

可微调 ±3s。**硬上限 120s**。

---

## 三、Beat 1 — 黑底大字宣言 + 紫光 blast（0-14s · 420 frames）

### 3.1 DOM 骨架

```html
<div class="beat beat-1">
  <div class="manifesto-wrap">
    <h1 class="manifesto">
      <span class="word w1">项目管理</span><span class="word w2">不是</span><span class="word w3">问</span><span class="word w4">cc</span><span class="word w5">写代码</span><span class="period">。</span><span class="spark"></span>
    </h1>
  </div>
  <div class="bloom-layer"></div>
  <div class="credits">本地优先 · 你的电脑</div>
</div>
```

### 3.2 帧时间表（精确到 frame）

| frame | t (s) | 事件 | 视觉描述 |
|---|---|---|---|
| 0 | 0.00 | 进入纯黑 | `background:#0E0F12`，画面无任何元素 |
| 6 | 0.20 | word w1 浮入 | "项目管理" 从下方 +24px → 0 + opacity 0→1，cubic-bezier(0.2,0.8,0.2,1) 400ms |
| 21 | 0.70 | word w2 浮入 | "不是" 同上，stagger 500ms |
| 36 | 1.20 | word w3 浮入 | "问" 同上，stagger 500ms |
| 51 | 1.70 | word w4 浮入 | "cc" 同上（注意：cc 用 mono 字体强调差异） |
| 66 | 2.20 | word w5 + 句号浮入 | "写代码。" 同上，至此整句出齐 |
| 90 | 3.00 | 静帧开始 | 句子完全到位，进入 9s 静读 + 微动 |
| 90-330 | 3-11 | 句子轻 breath | 整句 box-shadow `0 0 60px rgba(250,248,245,0.05) → 0 0 80px rgba(107,79,224,0.08) → 0 0 60px ...` 周期 4s（一次完整呼吸） |
| 240 | 8.00 | credits 出现 | 右下角 mono 12pt "本地优先 · 你的电脑" opacity 0→1 400ms |
| 345 | 11.50 | spark 出现 | 句末紫光点 ✦ 14×14px scale 0→1 200ms ease-out，位置在句号右侧 -22px bottom 18px |
| 360 | 12.00 | spark blast 开始 | box-shadow `0 0 0 0 rgba(107,79,224,0.8)` → 1.5s ease-out 展开到 `0 0 0 800px rgba(107,79,224,0.18)` |
| 366 | 12.20 | bloom-layer 起动 | 同位置 radial-gradient circle width/height 0→2800px，opacity 0 → 0.7 → 0 cubic-bezier(0.2,0.6,0.2,1) 2.5s |
| 420 | 14.00 | bloom 收尾 → 衔接 Beat 2 | 紫色光晕扩散至边界，触发 Beat 2 panel mount（**bloom 不淡出，是被 Beat 2 panel 覆盖**——保证视觉连续） |

### 3.3 完整 CSS 代码片段（subagent 可机械复制）

```css
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,600;1,400;1,600&family=JetBrains+Mono:wght@400;500&display=swap');

.beat-1 {
  position: absolute; inset: 0;
  background: #0E0F12;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}

.manifesto-wrap {
  max-width: 1720px;            /* v3.1 是 1500px 导致中文换行，v4 加宽 */
  padding: 0 100px;
  text-align: center;
  position: relative;
}

.manifesto {
  font-family: 'Source Serif 4', Georgia, serif;
  font-style: italic;
  font-weight: 600;
  font-size: 76pt;              /* v3.1 是 88pt 太大导致换行，v4 降到 76pt */
  line-height: 1.1;
  letter-spacing: -1px;
  color: #FAF8F5;
  margin: 0;
  white-space: nowrap;          /* 强制单行不换行 */
  position: relative;
  display: inline;
  animation: breath 4s ease-in-out 3s infinite;
}

.word {
  display: inline-block;
  opacity: 0;
  transform: translateY(24px);
}

.w1 { animation: wordIn 0.4s cubic-bezier(0.2,0.8,0.2,1) 0.2s forwards; }
.w2 { animation: wordIn 0.4s cubic-bezier(0.2,0.8,0.2,1) 0.7s forwards; margin-left: 0.3em; }
.w3 { animation: wordIn 0.4s cubic-bezier(0.2,0.8,0.2,1) 1.2s forwards; margin-left: 0.3em; }
.w4 { animation: wordIn 0.4s cubic-bezier(0.2,0.8,0.2,1) 1.7s forwards; margin-left: 0.3em;
      font-family: 'JetBrains Mono', monospace; font-style: normal; font-size: 0.85em; }
.w5 { animation: wordIn 0.4s cubic-bezier(0.2,0.8,0.2,1) 2.2s forwards; margin-left: 0.3em; }
.period { display: inline; animation: wordIn 0.4s cubic-bezier(0.2,0.8,0.2,1) 2.4s forwards;
          opacity: 0; transform: translateY(24px); }

@keyframes wordIn {
  to { opacity: 1; transform: translateY(0); }
}

@keyframes breath {
  0%, 100% { text-shadow: 0 0 60px rgba(250,248,245,0.05); }
  50%      { text-shadow: 0 0 80px rgba(107,79,224,0.08); }
}

.spark {
  position: absolute;
  display: inline-block;
  width: 14px; height: 14px;
  right: -22px; bottom: 18px;
  border-radius: 50%;
  background: #6B4FE0;
  opacity: 0;
  transform: scale(0);
  animation:
    sparkIn 0.2s ease-out 11.5s forwards,
    sparkBlast 1.5s cubic-bezier(0.2,0.6,0.2,1) 12.0s forwards;
}

@keyframes sparkIn {
  to { opacity: 1; transform: scale(1); }
}

@keyframes sparkBlast {
  0%   { box-shadow: 0 0 0 0 rgba(107,79,224,0.8); transform: scale(1); }
  40%  { box-shadow: 0 0 0 240px rgba(107,79,224,0.4); transform: scale(1.4); opacity: 1; }
  100% { box-shadow: 0 0 0 800px rgba(107,79,224,0); transform: scale(1.8); opacity: 0; }
}

.bloom-layer {
  position: absolute;
  left: 50%; top: 50%;
  width: 0; height: 0;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle,
    rgba(234,227,255,0.4) 0%,
    rgba(107,79,224,0.22) 35%,
    rgba(14,15,18,0) 70%);
  animation: bloomGrow 2.5s cubic-bezier(0.2,0.6,0.2,1) 12.2s forwards;
}

@keyframes bloomGrow {
  0%   { width: 0; height: 0; opacity: 0; }
  30%  { opacity: 0.7; }
  100% { width: 2800px; height: 2800px; opacity: 0; }
}

.credits {
  position: absolute;
  bottom: 24px; right: 32px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: rgba(250,248,245,0.55);
  letter-spacing: 0.02em;
  opacity: 0;
  animation: creditsIn 0.4s ease-out 8s forwards;
}

@keyframes creditsIn { to { opacity: 1; } }
```

### 3.4 HyperFrames variables 块（如用 HyperFrames CSS custom property mutation）

```json
{
  "vars_at_frame": {
    "0":   { "--w1-opacity": 0, "--bloom-radius": 0 },
    "12":  { "--w1-opacity": 1 },
    "21":  { "--w2-opacity": 1 },
    "36":  { "--w3-opacity": 1 },
    "51":  { "--w4-opacity": 1 },
    "66":  { "--w5-opacity": 1, "--period-opacity": 1 },
    "240": { "--credits-opacity": 1 },
    "345": { "--spark-scale": 1, "--spark-opacity": 1 },
    "360": { "--spark-blast-radius": 0 },
    "405": { "--spark-blast-radius": 800, "--spark-opacity": 0 },
    "366": { "--bloom-radius": 0 },
    "420": { "--bloom-radius": 2800 }
  }
}
```

### 3.5 音乐

- 0-3s：钢琴第 1 拍单音（BGM mood `cinematicCalm`，volume 0.45）
- 6s：钢琴第 2 拍
- 11.5s：紫光点亮 1 拍 bell（subtle）
- 12.0s：blast 起 + sub-bass 极轻 swell 起
- 0-14s 总 volume 曲线：0.45 → 0.55 ease-in

### 3.6 凭据角注

固定文本：`本地优先 · 你的电脑`（8s 起出现）

---

## 四、Beat 2 — 语言降临：prompt 整句位移 + 落入 + 飞起来变 bubble（14-29s · 450 frames）

### 4.1 DOM 骨架

```html
<div class="beat beat-2">
  <div class="panel">
    <div class="panel-head">
      <span class="dot dot-pulse"></span>
      <span class="panel-title">pace · PMP project mentor</span>
      <span class="gear">⚙</span>
    </div>
    <div class="meta-line">pace · main · 2 dirty · M2.7-highspeed</div>
    <div class="tabs">
      <span class="tab">Now</span>
      <span class="tab">Team</span>
      <span class="tab active">Ask</span>
    </div>
    <div class="ask-area">
      <div class="floating-prompt">我刚改了 IPC race bug，下一步该干啥？</div>
      <div class="input">
        <span class="input-mirror"></span>
        <span class="caret"></span>
      </div>
      <div class="user-bubble">我刚改了 IPC race bug，下一步该干啥？</div>
      <div class="thinking-dot">
        <span class="pulse"></span>
        <span class="thinking-text">正在思考…</span>
      </div>
    </div>
  </div>
  <div class="credits">它在看你跟 cc 说了啥</div>
</div>
```

### 4.2 帧时间表

| frame | t (s) | 事件 |
|---|---|---|
| 420 (=0 relative) | 14.0 | 进入 segment 2，panel 已 mount（Beat 1 bloom 退散同时 panel opacity 0→1 300ms） |
| 432 | 14.4 | panel 完全可见，dot 紫色 breath 启动（无限循环） |
| 450 | 15.0 | floating-prompt 句子从下方 +30px 浮入 + fade 0→1 600ms ease-out。位置：input 框上方 100px |
| 540 | 18.0 | floating-prompt 静止 3s 已读完 |
| 540-585 | 18-19.5 | floating-prompt 整段 translateY 0 → 100px + opacity 1 → 0 ease-in 1.5s（"被吸入 input"） |
| 555 | 18.5 | input 框边框颜色 `rgba(107,79,224,0.25)` → `#6B4FE0` 300ms，box-shadow `0 0 0 0` → `0 0 30px rgba(107,79,224,0.5)` 600ms（接收吸入光晕） |
| 555-600 | 18.5-20.0 | input-mirror 字符级 typewriter 60ms/字 18 字 = 1.08s 出 "我刚改了 IPC race bug，下一步该干啥？" |
| 600 | 20.0 | input 光晕 pulse 一次（box-shadow 退散 800ms） |
| 615 | 20.5 | 回车视觉反馈：input 边框 flash white 80ms（`#FAF8F5` → 原色） |
| 620 | 20.67 | input-mirror 文字飞起来：clone 元素 transform translateY(0) → translateY(-180px) scale(0.95) + 同时 user-bubble 在右侧落入 |
| 630 | 21.0 | user-bubble 完全到位（右侧 max-width 70%，背景 `rgba(107,79,224,0.12)`），input-mirror 内容清空（opacity 0） |
| 660 | 22.0 | input 框 placeholder 恢复 "Ask anything..." 灰字 fade 400ms |
| 720 | 24.0 | thinking-dot 出现："正在思考…" + 紫色 pulse 1.2s ease-in-out infinite |
| 720-870 | 24-29 | pulse 持续呼吸 5 周期，每周期 1.2s（共 4.17 周期，观众抽帧必命中） |
| 870 | 29.0 | 衔接 Beat 3 fade 0.4s |

### 4.3 完整 CSS

```css
.beat-2 .panel {
  width: min(1320px, 88%);
  background: #16171b;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 28px 32px;
  box-shadow:
    0 0 0 8px rgba(107,79,224,0.06),
    0 40px 80px -20px rgba(75,51,184,0.4);
  min-height: 720px;
  position: relative;
  opacity: 0;
  animation: panelIn 0.3s ease-out forwards;
}

@keyframes panelIn { to { opacity: 1; } }

.dot-pulse {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #6B4FE0;
  animation: dotBreath 1.6s ease-in-out 0.4s infinite;
}

@keyframes dotBreath {
  0%, 100% { box-shadow: 0 0 6px rgba(107,79,224,0.5); }
  50%      { box-shadow: 0 0 14px rgba(107,79,224,1.0); }
}

.floating-prompt {
  font-family: 'Source Serif 4', Georgia, serif;
  font-style: italic;
  font-size: 32px;
  color: #FAF8F5;
  text-align: center;
  max-width: 900px;
  margin: 60px auto 40px;
  opacity: 0;
  transform: translateY(30px);
  animation:
    promptIn 0.6s ease-out 1s forwards,
    promptSuck 1.5s ease-in 4s forwards;
}

@keyframes promptIn {
  to { opacity: 1; transform: translateY(0); }
}

@keyframes promptSuck {
  0%   { opacity: 1; transform: translateY(0); }
  60%  { opacity: 0.4; transform: translateY(60px); }
  100% { opacity: 0; transform: translateY(100px); }
}

.input {
  width: 100%; max-width: 900px;
  height: 64px;
  margin: 0 auto;
  border: 1px solid rgba(107,79,224,0.25);
  border-radius: 12px;
  background: rgba(255,255,255,0.02);
  display: flex; align-items: center;
  padding: 0 22px;
  font-family: 'Inter', sans-serif;
  font-size: 17px;
  color: #FAF8F5;
  position: relative;
  animation:
    inputGlow 0.6s ease-out 4.5s forwards,
    inputPulseOut 0.8s ease-out 6s forwards,
    inputFlash 0.08s steps(1) 6.5s 2;
}

@keyframes inputGlow {
  0%   { border-color: rgba(107,79,224,0.25); box-shadow: 0 0 0 0 rgba(107,79,224,0); }
  100% { border-color: #6B4FE0; box-shadow: 0 0 30px rgba(107,79,224,0.5); }
}

@keyframes inputPulseOut {
  to { border-color: rgba(107,79,224,0.25); box-shadow: 0 0 0 rgba(107,79,224,0); }
}

@keyframes inputFlash {
  0%   { border-color: #FAF8F5; }
  100% { border-color: rgba(107,79,224,0.25); }
}

.input-mirror {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  width: 0ch;
  animation:
    typeText 1.08s steps(18) 4.5s forwards,
    flyUp 0.5s cubic-bezier(0.4,0,0.2,1) 6.67s forwards;
}

@keyframes typeText {
  to { width: 18ch; }
}

@keyframes flyUp {
  0%   { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-180px) scale(0.95); opacity: 0; }
}

.caret {
  display: inline-block;
  width: 2px; height: 22px;
  background: #6B4FE0;
  margin-left: 4px;
  animation: caretBlink 0.8s steps(1) infinite;
}

@keyframes caretBlink {
  0%, 50%   { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.user-bubble {
  position: absolute;
  right: 32px;
  margin-top: 40px;
  max-width: 70%;
  background: rgba(107,79,224,0.12);
  border: 1px solid rgba(107,79,224,0.28);
  border-radius: 14px;
  padding: 14px 18px;
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 18px;
  color: #FAF8F5;
  opacity: 0;
  transform: translateY(-180px) scale(0.9);
  animation: bubbleIn 0.5s cubic-bezier(0.2,0.8,0.2,1) 6.8s forwards;
}

@keyframes bubbleIn {
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.thinking-dot {
  margin-top: 60px;
  text-align: center;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: rgba(250,248,245,0.6);
  display: flex; align-items: center; justify-content: center;
  gap: 10px;
  opacity: 0;
  animation: fadeIn 0.4s ease-out 10s forwards;
}

@keyframes fadeIn { to { opacity: 1; } }

.thinking-dot .pulse {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #6B4FE0;
  animation: pulseBreath 1.2s ease-in-out infinite;
}

@keyframes pulseBreath {
  0%, 100% { opacity: 0.4; transform: scale(0.9); box-shadow: 0 0 0 0 rgba(107,79,224,0.5); }
  50%      { opacity: 1.0; transform: scale(1.2); box-shadow: 0 0 12px rgba(107,79,224,0.8); }
}
```

### 4.4 音乐

- 14-15s：低频底噪 1s 静默（让观众读 prompt 句）
- 15s：pad swell 渐入 + 钢琴和声第 2 层加入
- 18.5s：input 接收 prompt 时 1 拍 chime（极轻）
- 21s：回车一拍 piano click（与回车 flash 同步）
- BGM volume：0.55 → 0.65

### 4.5 凭据角注

固定：`它在看你跟 cc 说了啥`

---

## 五、Beat 3 — 边读边想：12 个 keyframe 里程碑（29-70s · 1230 frames · 41s）

> **本 beat 是 v4 vs v3.1 升级最大的部分**。v3.1 在 41s 里只有 ~5 个可见状态变化（工具行砸入 × 3 + morph 完成 + 答案出来）。v4 扩展到 **12 个里程碑**，平均每 3.4s 一个，确保观众抽帧必命中进行中。

### 5.1 里程碑时间表（v4 vs v3.1 对照）

| # | t (s) | 里程碑（v4 新增） | v3.1 状态 |
|---|---|---|---|
| 1 | 29.5 | 工具行 1 砸入 + thinking 头部「🧠 思考中 · 0 字 · 0.0s」出现 + 计数器开始 setInterval 60ms 步进 | ✓ 有工具行 |
| 2 | 31.0 | 工具行 1 完整 + git_log 子展开：5 个真实 commit hash 列表逐行滚出（200ms/行） | ❌ 缺，仅字幕断言 |
| 3 | 33.0 | 工具行 2 砸入 + git_diff 数字 "47 行" 从 0 → 47 翻滚（300ms） | ❌ 缺 |
| 4 | 35.0 | 工具行 3 砸入 + cc_recent_transcript 数字 "8 轮" 从 0 → 8 翻滚 | ❌ 缺 |
| 5 | 36.5 | thinking 计数器累积到 ~250 字（每帧 +1.4 字） | ❌ v3.1 直接显示终态 582 |
| 6 | 39.0 | morph 起：画面 split 50/55，左侧 jsonl 6 行真实 cc transcript 结构 fade in | ✓ 有 |
| 7 | 41.0 | morph 中间帧 A：左侧 blur 4px + opacity 0.6，右侧 typewriter 出第 1 行 25% | ❌ v3.1 抽帧抓不到中间态 |
| 8 | 43.0 | morph 中间帧 B：左侧 blur 8px + opacity 0.3，右侧 typewriter 出第 1 行 100% + 第 2 行 30% | ❌ |
| 9 | 45.0 | morph 中间帧 C：左侧 blur 12px + opacity 0.1，右侧出第 2 行 100% + 第 3 行 60% | ❌ |
| 10 | 47.0 | morph 中间帧 D：左侧 blur 16px + opacity 0.03，右侧 3 行全出 | ❌ |
| 11 | 50.0 | morph 完成 bell + 右侧 → 紫光标引导视觉 + thinking 计数器到 ~480 字 | ✓ bell 在 |
| 12 | 51.984 | **2 帧黑屏**（v4 加倍，v3.1 是 1 帧）+ 52.067s spatial bloom 800ms（v4 拉长，v3.1 600ms） | ✓ 但太快 |
| 13 | 53.0 | bloom 进行中（半径 ~600px 可见紫色光环）+ panel 重出 + thinking 收缩 250ms | ✓ |
| 14 | 54.0 | thinking 收缩完成 + 终态「思考完成 · 5 个工具 · 29 秒 · 582 字」 + bloom 退散 | ✓ |
| 15 | 55.5 | 答案首行字符级 typewriter 50ms/字 出 "你这周在做 **收尾活**，还有 **2 个 commit** 没 review。" | ❌ v3.1 是整行 fade |
| 16 | 58.5 | 答案第 2 行 "建议下一步：" typewriter | ❌ |
| 17 | 60.0 | step 1 字符级 typewriter "- **找 Tom**（这事得他点头）确认收尾这波 IPC 重构稳不稳" | ❌ v3.1 5.0s stagger |
| 18 | 62.5 | step 2 typewriter | ❌ |
| 19 | 65.0 | step 3 typewriter | ❌ |
| 20 | 67.5 | step 4 typewriter | ❌ |
| 21 | 69.5 | 答案完整 + mentor bubble 左边框紫脉冲 breath 启动（贯穿到 Beat 4） | ❌ v3.1 静态 |
| - | 70.0 | 衔接 Beat 4 fade 0.4s | |

**总计 21 个可见状态变化** vs v3.1 的 ~5 个。

### 5.2 5 个真实 commit hash（用 Pace 仓库 `git log --oneline -5` 输出）

**必须用这 5 个真实值，反 fabricate**：

```
4ae4781  feat: streaming output + thinking animation + global animations
b4f0758  ui: Ask tab dynamic context strip + contextual suggestions
04ac79d  ui: commit pane — collapsed by default + PMP digest + per-commit PMP tags
d9fdd41  ui: merge 身份 tab into team member card (agent_id field per identity)
98d100e  feat: pinned commit pane + 6 new card types from richer git data
```

呈现方式：mono 12pt 字幕滚出，每行 200ms stagger，hash 紫色 `#b4a4ff`，subject 灰白 `rgba(250,248,245,0.65)`，左缩进 24px 显得是"子列表"。

### 5.3 DOM 骨架（关键 sub-element）

```html
<div class="beat beat-3">
  <div class="panel">
    <!-- ...panel head / meta / tabs 同 Beat 2... -->
    <div class="ask-area">
      <div class="user-bubble">我刚改了 IPC race bug，下一步该干啥？</div>
      <div class="mentor-bubble breath-glow">
        <div class="thinking-head">
          🧠 思考中 · <span class="counter" data-target="582">0</span> 字 · <span class="time-counter" data-target="29.3">0.0</span>s
        </div>
        <div class="tool tool-1">
          <span class="tool-icon">🔧</span>
          <span class="tool-name">git_log</span>
          <span class="tool-arrow">→</span>
          <span class="tool-desc">翻最近 5 个 commit</span>
        </div>
        <div class="commit-list">
          <div class="commit c1"><span class="hash">4ae4781</span> <span class="subj">feat: streaming output + thinking animation</span></div>
          <div class="commit c2"><span class="hash">b4f0758</span> <span class="subj">ui: Ask tab dynamic context strip</span></div>
          <div class="commit c3"><span class="hash">04ac79d</span> <span class="subj">ui: commit pane PMP digest</span></div>
          <div class="commit c4"><span class="hash">d9fdd41</span> <span class="subj">ui: merge 身份 tab into team card</span></div>
          <div class="commit c5"><span class="hash">98d100e</span> <span class="subj">feat: pinned commit pane + 6 cards</span></div>
        </div>
        <div class="tool tool-2">
          <span class="tool-icon">🔧</span>
          <span class="tool-name">git_diff</span>
          <span class="tool-arrow">→</span>
          <span class="tool-desc">看 <span class="diff-num" data-target="47">0</span> 行改动</span>
        </div>
        <div class="tool tool-3">
          <span class="tool-icon">🔧</span>
          <span class="tool-name">cc_recent_transcript</span>
          <span class="tool-arrow">→</span>
          <span class="tool-desc">读最近 <span class="turn-num" data-target="8">0</span> 轮 cc 对话</span>
        </div>
      </div>
    </div>
  </div>

  <!-- morph layer：39-50s 期间 split 显示，其余时间 z-index -1 -->
  <div class="morph-layer">
    <div class="morph-left">
      <div class="jsonl-label">~/.claude/projects/D--lll-pace/session.jsonl</div>
      <pre class="jsonl">{"type":"user","message":{"role":"user","content":[{"type":"text","text":"我刚改了 IPC race bug..."}]}}
{"type":"assistant","content":[{"type":"tool_use","name":"Read","input":{"file_path":"panel.html"}}]}
{"type":"tool_result","content":"     1\tfunction wireIPC() {...}"}
{"type":"assistant","content":[{"type":"text","text":"我看到 race 条件在..."}]}
{"type":"user","content":"加 setTimeout 50ms 兜底"}
{"type":"assistant","content":[{"type":"tool_use","name":"Edit","input":{...}}]}</pre>
    </div>
    <div class="morph-right">
      <div class="clean-label">↳ pace mentor 整理后</div>
      <div class="clean-text">
        <p class="cline c-line1">你最近 8 轮 cc 都在改 IPC 启动顺序。</p>
        <p class="cline c-line2">关键改动：panel preload 加了 50ms setTimeout 兜底，是临时方案。</p>
        <p class="cline c-line3">这周还有 2 个 commit 没人 review 过。</p>
        <span class="focus-arrow">→</span>
      </div>
    </div>
  </div>

  <!-- 黑屏覆盖层 -->
  <div class="black-flash"></div>

  <!-- spatial bloom -->
  <div class="spatial-bloom"></div>

  <!-- 折叠后的答案区（53s 起出现） -->
  <div class="answer-overlay">
    <div class="thinking-collapsed">🧠 思考完成 · 5 个工具 · 29 秒 · 582 字</div>
    <div class="answer-stream">
      <p class="ans-line ans-1"></p>
      <p class="ans-line ans-2">建议下一步：</p>
      <p class="step step-1"></p>
      <p class="step step-2"></p>
      <p class="step step-3"></p>
      <p class="step step-4"></p>
    </div>
  </div>

  <div class="credits credits-3a">查 5 个 commit · 47 行改动 · 8 轮对话</div>
  <div class="credits credits-3b">5 个工具 · 29 秒 · 才开口</div>
</div>
```

### 5.4 关键 CSS 片段（核心动效）

#### 5.4.1 mentor-bubble 紫脉冲 breath（贯穿全 beat + Beat 4）

```css
.mentor-bubble {
  position: relative;
  background: rgba(107,79,224,0.05);
  border: 1px solid rgba(107,79,224,0.18);
  border-left: 2px solid #6B4FE0;
  border-radius: 12px;
  padding: 16px 20px;
}

.breath-glow {
  animation: bubbleBreath 1.8s ease-in-out infinite;
}

@keyframes bubbleBreath {
  0%, 100% { box-shadow: -2px 0 0 0 rgba(107,79,224,0); }
  50%      { box-shadow: -2px 0 12px 0 rgba(107,79,224,0.5); }
}
```

#### 5.4.2 thinking 计数器（从 0 滚到 582）

```css
.counter {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  color: #b4a4ff;
  font-variant-numeric: tabular-nums;
  min-width: 3ch;
  text-align: right;
}
```

**JS 钩子**（subagent 在 HTML 渲染时加 inline script）：

```html
<script>
(function(){
  const counter = document.querySelector('.counter');
  const target = parseInt(counter.dataset.target);  // 582
  const duration = 20000;  // 20s 累积（29-49s）
  const start = performance.now() + 500;  // 500ms 延迟到 30s 开始
  function tick(now) {
    const elapsed = now - start;
    if (elapsed < 0) { requestAnimationFrame(tick); return; }
    const p = Math.min(elapsed / duration, 1);
    counter.textContent = Math.floor(target * p);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  const time = document.querySelector('.time-counter');
  const tTarget = parseFloat(time.dataset.target);
  function tickTime(now) {
    const elapsed = now - start;
    if (elapsed < 0) { requestAnimationFrame(tickTime); return; }
    const p = Math.min(elapsed / duration, 1);
    time.textContent = (tTarget * p).toFixed(1);
    if (p < 1) requestAnimationFrame(tickTime);
  }
  requestAnimationFrame(tickTime);
})();
</script>
```

> **subagent 注意**：HyperFrames 是 deterministic 渲染，performance.now() 不稳定。改用 frame-based 模拟：`document.documentElement.style.setProperty('--counter-frame', currentFrame)`，CSS 用 `counter-set` 或预生成所有数字 + opacity 切换。具体 pitchkit 的 deterministic 实现见 `pitchkit/core/services/html-frame.ts`。**如果走 CSS-only**，给每个数字一个 `<span class="d-N">N</span>` 然后用 `:nth-child` + animation-delay 切换 opacity，单帧只显示一个 span。

#### 5.4.3 工具行砸入 + commit hash 列表逐行滚出

```css
.tool {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  color: rgba(250,248,245,0.85);
  display: flex; align-items: center; gap: 8px;
  opacity: 0;
  transform: translateY(16px) scale(0.94);
}

.tool-1 { animation: toolDrop 0.4s cubic-bezier(0.2,0.8,0.2,1) 0.5s forwards; }
.tool-2 { animation: toolDrop 0.4s cubic-bezier(0.2,0.8,0.2,1) 4.0s forwards; }
.tool-3 { animation: toolDrop 0.4s cubic-bezier(0.2,0.8,0.2,1) 6.0s forwards; }

@keyframes toolDrop {
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.tool-icon { color: #6B4FE0; }
.tool-name { color: #b4a4ff; font-weight: 500; }
.tool-arrow { color: rgba(250,248,245,0.5); }

.commit-list {
  margin: 8px 0 12px 32px;
  display: flex; flex-direction: column;
  gap: 4px;
  border-left: 1px dashed rgba(107,79,224,0.25);
  padding-left: 14px;
}

.commit {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  opacity: 0;
  transform: translateX(-6px);
}

.c1 { animation: commitIn 0.3s ease-out 1.5s forwards; }
.c2 { animation: commitIn 0.3s ease-out 1.7s forwards; }
.c3 { animation: commitIn 0.3s ease-out 1.9s forwards; }
.c4 { animation: commitIn 0.3s ease-out 2.1s forwards; }
.c5 { animation: commitIn 0.3s ease-out 2.3s forwards; }

@keyframes commitIn {
  to { opacity: 1; transform: translateX(0); }
}

.commit .hash {
  color: #b4a4ff;
  font-weight: 500;
  margin-right: 10px;
}

.commit .subj {
  color: rgba(250,248,245,0.55);
}
```

#### 5.4.4 transcript morph（39-50s，11 秒，4 个可见中间帧）

```css
.morph-layer {
  position: absolute; inset: 0;
  display: grid;
  grid-template-columns: 45% 55%;  /* v3.1 是 50/50，v4 给干净答案侧更多权重 */
  gap: 48px;
  padding: 60px 80px;
  opacity: 0;
  z-index: 5;
  animation:
    morphIn 0.4s ease-in 10s forwards,
    morphOut 0.6s ease-out 21s forwards;
}

@keyframes morphIn { to { opacity: 1; } }
@keyframes morphOut { to { opacity: 0; } }

.morph-left, .morph-right {
  background: #16171b;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 24px 28px;
  min-height: 640px;
  position: relative;
}

.jsonl-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: rgba(250,248,245,0.4);
  margin-bottom: 16px;
}

.jsonl {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.65;
  color: rgba(232,230,240,0.62);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  animation: jsonlDissolve 10s ease-in-out 10.5s forwards;
}

@keyframes jsonlDissolve {
  0%   { opacity: 1; filter: blur(0px); }
  20%  { opacity: 0.85; filter: blur(2px); }
  40%  { opacity: 0.6; filter: blur(4px); }
  60%  { opacity: 0.3; filter: blur(8px); }
  80%  { opacity: 0.1; filter: blur(12px); }
  100% { opacity: 0.02; filter: blur(16px); }
}

.clean-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #b4a4ff;
  margin-bottom: 16px;
  letter-spacing: 0.04em;
}

.clean-text {
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 19px;
  line-height: 1.7;
  color: #FAF8F5;
  display: flex; flex-direction: column;
  gap: 14px;
  position: relative;
}

.cline {
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  width: 0;
}

.c-line1 { animation: typeLine 1.5s steps(20) 12s forwards; }
.c-line2 { animation: typeLine 1.8s steps(28) 13.5s forwards; }
.c-line3 { animation: typeLine 1.5s steps(18) 15.5s forwards; }

@keyframes typeLine {
  to { width: 100%; }
}

.focus-arrow {
  position: absolute;
  right: -32px; top: 50%;
  color: #6B4FE0;
  font-size: 24px;
  opacity: 0;
  transform: translateX(-12px);
  animation: arrowIn 0.4s ease-out 20s forwards, arrowBreath 1.6s ease-in-out 20.4s infinite;
}

@keyframes arrowIn {
  to { opacity: 1; transform: translateX(0); }
}

@keyframes arrowBreath {
  0%, 100% { transform: translateX(0) scale(1); opacity: 1; }
  50%      { transform: translateX(8px) scale(1.1); opacity: 0.7; }
}
```

#### 5.4.5 2 帧黑屏 + spatial bloom（51.984-53s）

```css
.black-flash {
  position: absolute; inset: 0;
  background: #000;
  opacity: 0;
  z-index: 10;
  pointer-events: none;
  animation: blackHold 0.067s steps(1) 22.984s forwards;  /* 2 frames @ 30fps = 0.067s */
}

@keyframes blackHold {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}

.spatial-bloom {
  position: absolute;
  left: 50%; top: 50%;
  width: 0; height: 0;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle,
    rgba(234,227,255,0.5) 0%,
    rgba(107,79,224,0.25) 35%,
    rgba(14,15,18,0) 70%);
  z-index: 9;
  pointer-events: none;
  animation: bloomBurst 0.8s cubic-bezier(0.2,0.6,0.2,1) 23.067s forwards;
}

@keyframes bloomBurst {
  0%   { width: 0; height: 0; opacity: 0; }
  15%  { opacity: 0.4; }
  40%  { width: 1200px; height: 1200px; opacity: 0.9; }
  100% { width: 2800px; height: 2800px; opacity: 0; }
}
```

#### 5.4.6 答案字符级 typewriter（55.5-69.5s）

```css
.thinking-collapsed {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: rgba(250,248,245,0.55);
  border-bottom: 1px dashed rgba(255,255,255,0.1);
  padding-bottom: 10px;
  height: 28px;
  opacity: 0;
  transform: scaleY(0.3);
  transform-origin: top;
  animation: collapseIn 0.25s cubic-bezier(0.6,0,0.4,1) 24s forwards;
}

@keyframes collapseIn {
  to { opacity: 1; transform: scaleY(1); }
}

.answer-stream {
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 21px;
  line-height: 1.55;
  color: #FAF8F5;
  display: flex; flex-direction: column;
  gap: 10px;
}

.ans-line, .step {
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  width: 0;
}

.ans-1 { animation: typeAns 2.5s steps(30) 26.5s forwards; }
.ans-2 { animation: typeAns 0.5s steps(6)  29.5s forwards; }
.step-1 { animation: typeAns 2.8s steps(32) 31s forwards; }
.step-2 { animation: typeAns 2.5s steps(28) 33.5s forwards; }
.step-3 { animation: typeAns 2.2s steps(22) 36s forwards; }
.step-4 { animation: typeAns 2.5s steps(28) 38.5s forwards; }

@keyframes typeAns {
  to { width: 100%; }
}
```

**答案文本（subagent 必须用这 6 行原文）**：

```
ans-1: 你这周在做 收尾活，还有 2 个 commit 没 review。
ans-2: 建议下一步：
step-1: - 找 Tom（这事得他点头）确认收尾这波 IPC 重构稳不稳
step-2: - 把"临时 setTimeout 50ms 兜底"在 PR 描述里写清楚是临时方案
step-3: - 让晓婷知道这周收尾会比预期晚半天
step-4: - 下周一站会前 问问阿珍 有没有视觉细节要带上
```

**注意**：v3.1 把 step-1 写成"- **找 Tom**（这事得他点头）..."，v4 保留同样语义，但 typewriter 时 `**` 标记用 inline class 而不是 strong 标签——typewriter 才能字符级显示：

```html
<p class="step step-1">- <span class="emph">找 Tom</span>（这事得他点头）确认收尾这波 IPC 重构稳不稳</p>
```

```css
.emph { color: #d6c8ff; font-weight: 600; }
```

### 5.5 音乐

- 29-31s：percussive layer 起，BPM 60 lo-fi 节奏
- 31-39s：加 hi-hat 8 分音符垫底（能量爬升）
- 39s：morph 起 + pad swell 拉满（volume 0.7→0.85）
- 50s：bell 单击重音（标记 morph 完成）
- 51.984s：1 拍 sub-bass 极重（与黑屏同步）
- 52.067s：piano 主旋律入 + 钢琴和声第 3 层 + bloom 同步
- 53-70s：piano 主旋律持续，volume 0.75 稳态
- 全 beat volume 包络：0.65 → 0.85 → 0.75

### 5.6 凭据角注

- 29-50s：`查 5 个 commit · 47 行改动 · 8 轮对话`
- 50-70s：`5 个工具 · 29 秒 · 才开口`

切换瞬间（50s）做 200ms cross-fade。

---

## 六、Beat 4 — 双轨切同事视角（70-100s · 900 frames · 30s）

### 6.1 里程碑时间表（10 个）

| # | t (s) | 里程碑 |
|---|---|---|
| 1 | 70.5 | Team tab 进入，3 张同事卡 staggered 滑入（100ms × 3 = 0.3s 完成） |
| 2 | 72.0 | 鼠标光标元素（紫色圆点 + 拖尾）从右上角 (1200,80) 飞到 Tom 卡中心 (960,540)（cubic-bezier 0.4,0,0.2,1，600ms） |
| 3 | 73.0 | Tom 卡 hover 状态：translateY -6px + box-shadow + border 紫高亮（0.4s 完成，保持） |
| 4 | 74.5 | 鼠标点 "💬 Talk to them" 按钮：按钮 scale 1 → 0.95 → 1（100ms 弹性）+ ripple |
| 5 | 75.5 | 进入双轨 split：屏幕 50/50 split，左侧用户视角 panel，右侧 Tom persona 视角 |
| 6 | 76.0 | 双轨同步 typewriter：左 "Ask anything..." 60ms/字 13 字 + 右 "对 Tom 说点什么..." 60ms/字 11 字（约 0.8s 完成） |
| 7 | 77.0 | wipe-left 0.5s（v4 拉长，v3.1 是 0.35s）：右半"吃掉"左半，clip-path inset(0 100% 0 0) → inset(0 0 0 0) |
| 8 | 77.5 | persona banner 滑入「你正在以 Tom（Eng）的视角对话」 + Tom 视角 panel mount |
| 9 | 78.5 | 输入框字符级 typewriter 40ms/字 出「这一波 IPC 重构稳吗？」(9 字, 0.36s) |
| 10 | 80.0 | 回车 + user-bubble 落入 + thinking pulse 启动 |
| 11 | 81.5 | Tom 第一人称答 line 1 字符级 typewriter 50ms/字「**这事得我点头**——但 ship 我 OK，PR 里写明这是临时方案就行。」(27 字, 1.35s) |
| 12 | 84.0 | Tom 答 line 2 typewriter「setTimeout 50ms 兜底有点脆，下周我建议加一层 retry。」(23 字, 1.15s) |
| 13 | 87.0 | Tom 答 line 3 typewriter「另外这个改动我看过 diff 了，整体没问题，你直接合。」(22 字, 1.1s) |
| 14 | 90.0 | Tom 签名「— Tom（Eng）」fade-in 400ms italic |
| 15 | 91-100 | Tom bubble 左边框蓝脉冲 breath（bubbleBreath 同款 但用 #3a6fff），持续到 beat 结束 |

### 6.2 关键 DOM 骨架（鼠标飞入 + double 视角）

```html
<div class="beat beat-4">
  <!-- Phase A: Team tab (70-75.5s) -->
  <div class="phase-team">
    <div class="panel">
      <!-- panel head + meta + tabs (Team active) -->
      <div class="team-grid">
        <div class="member m-xiaoting"><!-- 晓婷 / PM / A 拍板 / claude-mentor-1 --></div>
        <div class="member m-tom hovered"><!-- Tom / Eng / R 负责 / codex-cli-2 --></div>
        <div class="member m-azhen"><!-- 阿珍 / Designer / C 咨询 / gemini-design --></div>
      </div>
    </div>
    <div class="cursor"></div>
  </div>

  <!-- Phase B: Split 75.5-77.5s -->
  <div class="phase-split">
    <div class="split-left"><!-- 你的视角 mini-panel --></div>
    <div class="split-right"><!-- Tom 视角 mini-panel + banner --></div>
    <div class="wipe-curtain"></div>
  </div>

  <!-- Phase C: Tom full (77.5-100s) -->
  <div class="phase-tom">
    <div class="panel">
      <!-- banner-full + tabs + Tom Q + Tom answer -->
    </div>
  </div>

  <div class="credits">Tom · 这事得他点头</div>
</div>
```

### 6.3 鼠标光标元素（v4 新增）

```css
.cursor {
  position: absolute;
  width: 12px; height: 12px;
  border-radius: 50%;
  background: #6B4FE0;
  box-shadow: 0 0 16px rgba(107,79,224,0.8);
  pointer-events: none;
  z-index: 20;
  left: 1200px; top: 80px;
  opacity: 0;
  animation:
    cursorIn 0.2s ease-out 1.5s forwards,
    cursorFly 0.6s cubic-bezier(0.4,0,0.2,1) 2.0s forwards,
    cursorClick 0.15s ease-in-out 4.5s forwards;
}

@keyframes cursorIn  { to { opacity: 1; } }
@keyframes cursorFly { to { left: 960px; top: 540px; } }
@keyframes cursorClick {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.6); box-shadow: 0 0 32px rgba(107,79,224,1); }
  100% { transform: scale(1); }
}

.cursor::after {
  content: '';
  position: absolute;
  left: -8px; top: -8px;
  width: 28px; height: 28px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(107,79,224,0.3) 0%, transparent 70%);
  pointer-events: none;
}
```

### 6.4 双轨 + wipe（关键 CSS）

```css
.phase-split {
  position: absolute; inset: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 60px;
  opacity: 0;
  animation: splitIn 0.3s ease-out 5.5s forwards, splitOut 0.2s ease-in 7.0s forwards;
}

@keyframes splitIn  { to { opacity: 1; } }
@keyframes splitOut { to { opacity: 0; } }

.split-left { padding-right: 12px; }
.split-right {
  padding-left: 12px;
  background: rgba(0,0,0,0.25);
  border-left: 1px solid rgba(255,255,255,0.06);
}

.split-left .input-box .ph {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  border-right: 2px solid #6B4FE0;
  width: 0ch;
  animation: typeUserPh 0.78s steps(13) 6s forwards;
}
@keyframes typeUserPh { to { width: 13ch; } }

.split-right .input-box .ph {
  /* 同左但 11 字 0.66s */
  animation: typeTomPh 0.66s steps(11) 6.1s forwards;
}
@keyframes typeTomPh { to { width: 11ch; } }

.wipe-curtain {
  position: absolute; inset: 0;
  background: #0E0F12;
  clip-path: inset(0 100% 0 0);
  z-index: 5;
  animation: wipeLeftLong 0.5s cubic-bezier(0.4,0,0.2,1) 7s forwards;
}

@keyframes wipeLeftLong {
  0%   { clip-path: inset(0 100% 0 0); }
  100% { clip-path: inset(0 0 0 0); }
}
```

### 6.5 Tom 答案 typewriter（与 Beat 3 同款 + 蓝色脉冲）

```css
.tom-bubble {
  background: rgba(58,111,255,0.06);
  border: 1px solid rgba(58,111,255,0.22);
  border-left: 2px solid #3a6fff;
  border-radius: 12px;
  padding: 18px 24px;
  animation: tomBreath 1.8s ease-in-out infinite 21.5s;
}

@keyframes tomBreath {
  0%, 100% { box-shadow: -2px 0 0 0 rgba(58,111,255,0); }
  50%      { box-shadow: -2px 0 12px 0 rgba(58,111,255,0.5); }
}

.t-line {
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 21px;
  line-height: 1.55;
  color: #FAF8F5;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  width: 0;
}

.t1 { animation: typeT 1.35s steps(27) 11.5s forwards; }
.t2 { animation: typeT 1.15s steps(23) 14s   forwards; }
.t3 { animation: typeT 1.10s steps(22) 17s   forwards; }
.t-sig { animation: tSigIn 0.4s ease-out 20s forwards;
         font-size: 16px; font-style: italic; color: rgba(250,248,245,0.55);
         opacity: 0; }

@keyframes typeT  { to { width: 100%; } }
@keyframes tSigIn { to { opacity: 1; } }

.emph-blue { color: #b4c8ff; font-weight: 600; }
```

### 6.6 音乐

- 70-75s：percussive layer 持续 + hi-hat 加密（能量爬升）
- 75-77s：split 期间 1 拍 chime 标记双声道（panning：左声道 +1dB，右声道 +1dB，提醒"双视角"）
- 77s wipe：1 拍 sweep（高频白噪扫过 300ms）
- 78s 起：piano 主旋律变奏（小调）保持 Tom 答出完
- volume：0.80 稳态
- 100s 衔接 Beat 5：volume → 0.85（最高点）

### 6.7 凭据角注

固定：`Tom · 这事得他点头`

---

## 七、Beat 5 — 反定义 → 红线 → 红紫翻转 → 4 行肯定（100-115s · 450 frames · 15s）

> 时长从 v3.1 的 20s 缩到 15s（总片长 120→115s），不损失内容因为 v4 反差点用更克制的 fade + 更密的动效，不需要冗长留白。

### 7.1 里程碑（11 个）

| # | t (s) | 里程碑 |
|---|---|---|
| 1 | 100.0 | fade-to-black 0.5s（v3.1 是 0.4s，v4 拉长让黑暗显得 deliberate） |
| 2 | 100.5 | 黑底白衬线 italic 句子 76pt 整句 fade + translateY 浮入 600ms："**它不是 task tracker。**" |
| 3 | 103.0 | 句子定 2.5s 读完 + 微 breath |
| 4 | 103.5 | redline 红线从左到右 350ms 划过句子下沿（位置 bottom 22%，6px 厚，紫色阴影） |
| 5 | 104.0 | 整句颜色 `#FAF8F5` → `#C44A4A` cross-fade 600ms |
| 6 | 105.0 | 红字定 1.5s 留白（让观众读两遍） |
| 7 | 106.5 | 红字整体收缩：scale 1 → 0.05 + translate 到中心 400ms ease-in，变红点 |
| 8 | 107.0 | 红点颜色 `#C44A4A` → `#6B4FE0` cross-fade 600ms（中点不灰，用 HSL 路径过紫） |
| 9 | 107.6 | 紫点 box-shadow blast 0 → 0 0 0 240px 紫光 800ms + scale 1 → 1.8 + opacity → 0 |
| 10 | 108.4 | wordmark `✦ pace` fade-in + 4 行肯定句字符级 typewriter stagger 600ms |
| 11 | 113.0 | CTA `github.com/Upp-Ljl/Pace` fade in 600ms |
| 12 | 115.0 | 钢琴长尾消音收束 |

### 7.2 关键 CSS

```css
.beat-5 .deny-wrap {
  text-align: center;
  position: relative;
}

.deny {
  font-family: 'Source Serif 4', Georgia, serif;
  font-style: italic;
  font-weight: 600;
  font-size: 76pt;
  letter-spacing: -1px;
  color: #FAF8F5;
  margin: 0;
  white-space: nowrap;
  position: relative;
  display: inline-block;
  opacity: 0;
  transform: translateY(20px);
  animation:
    denyIn 0.6s cubic-bezier(0.2,0.8,0.2,1) 0.5s forwards,
    denyRed 0.6s ease-in-out 4.0s forwards;
}

@keyframes denyIn  { to { opacity: 1; transform: translateY(0); } }
@keyframes denyRed { to { color: #C44A4A; } }

.redline {
  position: absolute;
  left: -20px; right: -20px;
  bottom: 22%;
  height: 6px;
  background: #C44A4A;
  transform: scaleX(0);
  transform-origin: left center;
  animation: lineDraw 0.35s cubic-bezier(0.4,0,0.2,1) 3.5s forwards;
  box-shadow: 0 0 16px rgba(196,74,74,0.8);
}

@keyframes lineDraw { to { transform: scaleX(1); } }

.shrink-text {
  position: absolute;
  left: 50%; top: 50%;
  transform: translate(-50%, -50%) scale(1);
  font-size: 76pt;
  color: #C44A4A;
  font-family: 'Source Serif 4'; font-style: italic; font-weight: 600;
  animation: shrinkToDot 0.4s ease-in 6.5s forwards;
}

@keyframes shrinkToDot {
  0%   { transform: translate(-50%, -50%) scale(1);    }
  100% { transform: translate(-50%, -50%) scale(0.025); }
}

.flip-dot {
  position: absolute;
  left: 50%; top: 50%;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: #C44A4A;
  transform: translate(-50%, -50%);
  opacity: 0;
  animation:
    dotShow  0.05s steps(1) 6.9s forwards,
    colorFlip 0.6s ease-in-out 7.0s forwards,
    dotBlast 0.8s cubic-bezier(0.2,0.6,0.2,1) 7.6s forwards;
}

@keyframes dotShow { to { opacity: 1; } }

@keyframes colorFlip {
  /* HSL 过紫，不灰 */
  0%   { background: hsl(0,  60%, 53%); }    /* #C44A4A red */
  50%  { background: hsl(290,60%, 50%); }    /* 偏紫的中间色 */
  100% { background: hsl(255,71%, 59%); }    /* #6B4FE0 purple */
}

@keyframes dotBlast {
  0%   { box-shadow: 0 0 0 0   rgba(107,79,224,0.7); transform: translate(-50%,-50%) scale(1); }
  50%  { box-shadow: 0 0 0 120px rgba(107,79,224,0.3); transform: translate(-50%,-50%) scale(1.4); }
  100% { box-shadow: 0 0 0 240px rgba(107,79,224,0);   transform: translate(-50%,-50%) scale(1.8); opacity: 0; }
}

.wordmark-wrap {
  position: relative;
  display: flex; flex-direction: column;
  align-items: center;
  gap: 28px;
  opacity: 0;
  animation: wmIn 0.8s ease-out 8.4s forwards;
}

@keyframes wmIn { to { opacity: 1; } }

.wordmark {
  font-family: 'Source Serif 4'; font-style: italic; font-weight: 600;
  font-size: 88pt;
  color: #FAF8F5;
  display: flex; align-items: center; gap: 18px;
}

.mark-star {
  color: #6B4FE0;
  font-size: 0.8em;
  animation: starTwinkle 2.2s ease-in-out 9s infinite;
}

@keyframes starTwinkle {
  0%, 100% { opacity: 1;   transform: scale(1)    rotate(0); }
  50%      { opacity: 0.7; transform: scale(1.15) rotate(45deg); }
}

.affirm {
  display: flex; flex-direction: column;
  align-items: center; gap: 8px;
  font-family: 'Source Serif 4';
  font-size: 22px; line-height: 1.55;
  color: rgba(250,248,245,0.85);
  text-align: center;
  margin-top: 12px;
}

.af {
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  width: 0;
  border-right: 2px solid rgba(107,79,224,0.7);
}

/* v4 关键升级：4 行 typewriter 字符级 + stagger 600ms 而非 v3.1 的 350ms（让观众有时间跟读每一行） */
.af1 { animation: typeAf 0.7s steps(7)  8.8s forwards, caretOff 0.1s steps(1) 9.5s forwards; }
.af2 { animation: typeAf 0.8s steps(8)  9.6s forwards, caretOff 0.1s steps(1) 10.4s forwards; }
.af3 { animation: typeAf 0.8s steps(8)  10.5s forwards, caretOff 0.1s steps(1) 11.3s forwards; }
.af4 { animation: typeAf 1.6s steps(17) 11.4s forwards, caretOff 0.1s steps(1) 13.0s forwards; }

@keyframes typeAf {
  to { width: 100%; }
}

@keyframes caretOff {
  to { border-right-color: transparent; }
}

.af4 { font-weight: 600; color: #d6c8ff; }  /* 第 4 行高亮（PMP 幕后价值的用户化总结） */

.cta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  color: rgba(250,248,245,0.7);
  margin-top: 24px;
  opacity: 0;
  animation: ctaIn 0.6s ease-out 13s forwards;
}

@keyframes ctaIn { to { opacity: 1; } }
```

### 7.3 4 行肯定句精确文本

```
af-1: 它是 mentor。              (7 字 + 句号)
af-2: 它读你的 cc。              (8 字 含 cc)
af-3: 它在你电脑里。             (8 字 + 句号)
af-4: 它告诉你下一步找谁、话怎么开。(17 字 加粗紫色)
```

第 4 行是 v3.1 升级新增 + v4 保留——把 PMP 价值翻译成用户语言。

### 7.4 音乐

- 100s：fade-to-black 同步钢琴单音渐隐
- 100.5-103.5s：钢琴 sparse melody（每 1.5s 一个音）
- 103.5-104s：1 拍"划线"重音 + tom drum 极轻
- 106.5-107s：低频 swell 起（红色收缩同步）
- 107-108s：sub-bass 重音 + bell（颜色翻转同步）
- 108.4s：钢琴主旋律完整 + sub-bass swell 拉满（紫点 blast 同步）
- 108.4-113s：钢琴主旋律 + 4 行 typewriter 同步（每行打字时间钢琴一个小动机）
- 113-115s：钢琴长尾消音 2s ramp 到 -∞dB

---

## 八、转场预算与配额审计

### 8.1 v4 全片转场清单

| # | 位置 | 类型 | 时长 | 算什么 |
|---|---|---|---|---|
| 1 | Beat 1 → 2 衔接 (12-14s) | bloom blast | 2s 全片可见 | **再生**（Beat 1 内部尾段），不占 segment 转场配额 |
| 2 | Beat 2 → 3 (29s) | fade | 0.4s | 标准 fade（配额内） |
| 3 | Beat 3 内 morph (39-50s) | crossfade-via-blur | 11s with 4 中间帧 | **scene 内部**（split 持续 1 个 segment），不占配额 |
| 4 | Beat 3 内 黑屏+bloom (52s) | 2 帧黑屏 + spatial bloom 800ms | 0.9s | **再生**（不占配额） |
| 5 | Beat 3 → 4 (70s) | fade | 0.4s | 标准 fade（配额内） |
| 6 | Beat 4 内 split + wipe-left (75.5-77.5s) | split + wipe | 2s | **占用全片 1 处 wipe 配额** |
| 7 | Beat 4 → 5 (100s) | fade-to-black | 0.5s | 标准 fade（配额内） |
| 8 | Beat 5 内 红→紫翻转 (106.5-108s) | scale + color cross-fade | 1.5s | **scene 内部 frame mutation**，不占配额 |

**合规审计**：
- 标准 fade × 4 处 ✓
- wipe × 1 处（Beat 4 内 wipe-left）✓
- bloom × 2 处（Beat 1 末段 + Beat 3 末段）= scene 内部再生 ✓
- morph × 1 处（Beat 3 内）= scene 内部 ✓
- color cross-fade × 1 处（Beat 5 内）= scene 内部 ✓

符合 pitchkit `no-vo-ui-workflow` archetype 转场预算（fade 主 + 1 wipe）。

### 8.2 5 种强转场可见性保证

| 强转场 | v3.1 时长 | v4 时长 | 抽帧可见性 |
|---|---|---|---|
| Beat 1 bloom blast | 600ms | **1500ms 全片可见 + 800ms 退散** | 2s 内必命中中间态 |
| transcript morph | 6s（v3）/11s（v3.1） | **11s with 4 个 explicit 中间帧（41/43/45/47s 各 1 个 keyframe milestone）** | 每 2s 一个可见状态 |
| 黑屏 + spatial bloom | 1 帧黑屏 + 600ms bloom | **2 帧黑屏 + 800ms bloom** | 30fps 渲染抽帧能抓 24 帧中间态 |
| wipe-left | 350ms | **500ms + 前后 300ms 双轨预热** | 整体 1.1s 可见 |
| 红→紫翻转 | 200ms（v3）/600ms（v3.1） | **600ms with HSL 中间色（过紫不灰）** | 0.3s 处必命中中间紫红色 |

---

## 九、字幕与凭据角注全表

### 9.1 字幕（即画面文本，无独立字幕轨）

| beat | 字幕来源 |
|---|---|
| 1 | 画面正中 "项目管理不是问 cc 写代码。" |
| 2 | floating prompt "我刚改了 IPC race bug，下一步该干啥？" + input typewriter 同文 + user bubble 同文 |
| 3 | 工具行 3 行 + commit hash 列表 + thinking 计数器 + transcript morph 左右两侧文本 + answer 6 行 typewriter |
| 4 | persona banner + Q bubble + Tom 答 3 段 + 签名 |
| 5 | "它不是 task tracker。" + ✦ pace + 4 行肯定 + CTA |

### 9.2 凭据角注（mono 12pt 右下，JetBrains Mono）

| beat | 秒数 | 文本 |
|---|---|---|
| 1 | 8-14s | `本地优先 · 你的电脑` |
| 2 | 14-29s | `它在看你跟 cc 说了啥` |
| 3a | 29-50s | `查 5 个 commit · 47 行改动 · 8 轮对话` |
| 3b | 50-70s | `5 个工具 · 29 秒 · 才开口` |
| 4 | 70-100s | `Tom · 这事得他点头` |
| 5 | 100-115s | `下载 · 自带 LLM key · 开源 · github.com/Upp-Ljl/Pace` |

每段切换瞬间做 200ms cross-fade（v4 新增——v3.1 是 hard cut 凭据角注，观众察觉不出切换）。

### 9.3 用户化语言审计（v4 硬约束）

全片不出现以下任一术语：
- PMP / PMBOK / RACI / Stakeholder
- Process group / Knowledge area / Communications management plan
- Executing × Integration / × Communications
- A/R/C/I 4 字母（视觉色块保留但**字幕里**不说 A/R/C）

替换映射：
- "RACI: A" → "拍板" / "得他点头"
- "RACI: R" → "负责" / "干活的人"
- "RACI: C" → "咨询" / "问问"
- "Executing × Integration" → "收尾活"
- "Stakeholder × Communications" → "找谁聊 / 怎么开口"

---

## 十、字体、配色、音乐统一表

### 10.1 字体（不变 v3.1）

| 角色 | 字体 | 字重 | 字号 |
|---|---|---|---|
| hero 大字 | Source Serif 4 Italic | 600 | 76pt（v4 下调，v3.1 是 88pt 导致换行） |
| UI 标题 | Inter | 500 | 18px |
| UI body | Inter | 400 | 14-17px |
| mentor 答案 | Source Serif 4 | 400-600 | 21-22px |
| mono 凭据 / hash | JetBrains Mono | 400-500 | 11-15px |

### 10.2 配色 hex

```
紫主色          #6B4FE0    (Pace 紫，mentor 强调、bloom、wordmark star)
紫 deep         #4B33B8    (panel shadow base)
紫 soft         #EAE3FF    (bloom inner)
紫 emph         #d6c8ff    (mentor 强调词)
紫 hash         #b4a4ff    (commit hash / mono 强调)
蓝 Tom          #3a6fff    (Tom bubble left border + breath)
蓝 emph         #b4c8ff    (Tom 答强调词)
红反定义        #C44A4A    (仅 103.5-107s)
底色            #0E0F12
字幕白          #FAF8F5
panel bg        #16171b
```

### 10.3 BGM（v4 新增本地文件）

- 文件：`D:\lll\pace\docs\pace-bgm.mp3`（120s · 192kbps · 44.1kHz stereo · 来源 FreePD.com Public Domain）
- 实际曲目：FreePD "Ambient J Thoughtful" trim 到 120s + fade-in 2s + fade-out 3s
- 风格：lo-fi 钢琴 + sub-bass pad + 极慢节奏（BPM ~60）
- License：CC0 Public Domain（不需归属，可商用）

### 10.4 BGM volume 包络（与 5 个反差点对齐）

```
t (s)   volume   事件
0       0.45     钢琴第 1 拍
3       0.50     钢琴第 2 拍
12      0.55     紫光 blast (反差点 1)
15      0.55     prompt 进入静音 1s
20      0.65     prompt 落入
29      0.65     工具行起
39      0.80     morph 起
50      0.85     morph 完成 bell (反差点 2)
52      0.85     黑屏+bloom (反差点 3)
70      0.80     Beat 4 进入
77      0.85     wipe 同步
88      0.80     Tom 答持续
100     0.85     最高点
107     0.90     紫点 blast (反差点 4)
108.4   0.90     wordmark 入
113     0.50     CTA 入，钢琴长尾起
115     0.05     消音
```

---

## 十一、给主 agent 的 next action（subagent 翻译 storyboard 后必做）

```bash
# 1. scaffold storyboard JSON（pitchkit · 时长 115s · fps 30）
bun cli/index.ts scaffold-storyboard --duration 115 --fps 30 --output D:/lll/pace/docs/pace-storyboard-v4.json

# 2. 按本文 §三~§七 5 beat 帧时间表 + §四~§五~§六~§七 CSS 片段 + §九 字幕表填充
#    每个 segment 的 duration_frames 严格按本文表 / DOM 骨架 / CSS 完整复制
#    转场配额按 §八 审计表（fade × 4 + wipe × 1 + bloom/morph/colorflip 作为 scene 内部）

# 3. lint
bun cli/index.ts lint D:/lll/pace/docs/pace-storyboard-v4.json

# 4. preview
bun cli/index.ts preview D:/lll/pace/docs/pace-storyboard-v4.json

# 5. estimate（应该报 ~115s）
bun cli/index.ts estimate D:/lll/pace/docs/pace-storyboard-v4.json

# 6. 渲染（BGM 用 docs/pace-bgm.mp3）
bun cli/index.ts render-storyboard D:/lll/pace/docs/pace-storyboard-v4.json D:/lll/pace/docs/pace-demo-v4.mp4

# 7. 抽帧自审 15 个时刻
for s in 0 8 14 21 29 41 45 50 52 60 70 77 88 100 108; do
  ffmpeg -y -ss $s -i D:/lll/pace/docs/pace-demo-v4.mp4 -frames:v 1 D:/lll/pace/.shots/v4-frames/frame-${s}s.png
done

# 8. 美学打分（pitchkit-aesthetic-review skill） ≥ 8.0 且每维 ≥ 7
#    特别验证维度 5 动效质量：
#    - 30s/40s/48s/56s/72s/88s/96s 这些 v3.1 全黑或静态终态的帧，v4 必须有进行中动效可见
#    - 4 行肯定句 stagger 600ms × 4 = 2.4s 总时长，抽帧（108-115s 内任意秒）必命中 1-3 行进行中
```

---

## 十二、5 个最关键升级点（v4 vs v3.1 一句话总结）

1. **动效不再"声明完就停"**：每个 segment 内 ≥ 5 keyframe 里程碑均匀分布，最长静止 ≤ 3s。Beat 3 41s 内 21 个里程碑（v3.1 ~5 个）。
2. **产品核心可视化**：5 commit hash 真显示（用 Pace 真实 `4ae4781/b4f0758/04ac79d/d9fdd41/98d100e`）、thinking 计数器从 0 滚到 582（setInterval 60ms）、transcript morph 4 个 explicit 中间帧、mentor bubble 紫脉冲 breath、4 行肯定句字符级 typewriter。
3. **强转场拉到可见**：bloom 800ms（v3.1 600ms）、wipe 500ms + 双轨预热 300ms（v3.1 350ms 单 wipe）、红→紫 HSL 中间色过紫不灰 600ms（v3.1 cross-fade 600ms 走 RGB 中点偏灰）。
4. **标题不再换行**：max-width 1500→1720px、76pt（v3.1 88pt）、white-space:nowrap 强制单行。
5. **BGM 真实落地**：FreePD `Ambient J Thoughtful` 120s trim + fade，替换 v3.1 的 ffmpeg 静音占位。

---

## 十三、与 v3.1 不变的部分（保留）

- **5 beat 结构** + 单 session 贯穿
- **no-VO + 中文字幕主导**
- **pitchkit `no-vo-ui-workflow` archetype 弧线**
- **用户化语言原则**（全片不出现 PMP/PMBOK/RACI/Stakeholder 术语）
- **字体家族**（Source Serif 4 / Inter / JetBrains Mono）
- **核心配色 hex**（紫 #6B4FE0 / accent deep #4B33B8 / accent soft #EAE3FF / 底色 #0E0F12 / 反定义红 #C44A4A / 字幕白 #FAF8F5）
- **4 大反差点**（12s bloom / 50s morph / 52s 折叠+黑屏+bloom / 108s 红→紫翻转）位置不变
- **凭据角注 6 段中文**（仅 Beat 5 凭据 mono 文本不变）
- **PMP 幕后骨架**

---

## 十四、自审 checklist（v4 渲染前必勾）

```
脚本
[x] 5 beat 结构 + 单 session 贯穿 + 首尾呼应（黑底宣言 ↔ 黑底反定义 ↔ wordmark）
[x] 时长 ≤ 120s（目标 115s）
[x] 每个 beat 有 1+ 被记住的瞬间（12s bloom / 21s 整句落入 / 50s morph / 52s 黑屏+bloom / 76s wipe / 108s 红→紫）
[x] 每个 segment ≥ 5 keyframe 里程碑

画面
[x] 每个 scene 按 when_to_use 选 atom（hook-slate / recording-with-callouts / agent-framework / feature-spotlight / comparison-split / kineticTypography / cta-outro）
[x] 转场配额：fade × 4 + wipe × 1（scene 内部 bloom/morph/flip 不占配额）
[x] 单 scene 一个信息点
[x] 凭据角注 6 段贯穿，全部用户化中文
[x] 1 帧黑屏从 1 帧加倍到 2 帧 + bloom 从 600ms 拉到 800ms

动效（v4 核心升级）
[x] mentor bubble 紫脉冲 breath 贯穿 Beat 3-4
[x] thinking 计数器 0→582 真滚动
[x] 5 个真实 commit hash 真显示
[x] transcript morph 4 个 explicit 中间帧（41/43/45/47s）
[x] 4 行肯定句字符级 typewriter stagger 600ms

音乐
[x] mood cinematicCalm
[x] BGM 文件存在 pace-bgm.mp3 120s
[x] volume 曲线锚 5 反差点
[x] 14-15s 1s 短促静默作呼吸

配音
[x] no-VO
[x] 字幕承载所有信息

用户化语言
[x] 不出现 PMP/PMBOK/RACI/Stakeholder/Process group/Knowledge area/Communications
[x] mentor 答案首行用"收尾活 / 找 Tom / 让晓婷知道 / 问问阿珍"
[x] Tom 第一人称首句用"这事得我点头"翻译 A/R 角色
[x] 凭据角注 6 段全部中文
[x] 肯定句第 4 行 PMP 价值翻译成用户语言

凭据真实性（反 fabricate）
[x] 5 个 commit hash 来自 `git log --oneline -5` 真实输出
[x] git_diff "47 行" / cc_recent "8 轮" 数字与 v3.1 一致（剧本 anchor）
[x] morph 左侧 jsonl 用 cc 真实 session 结构（type=user/type=assistant/tool_use/tool_result）
[x] mentor 答案"找 Tom / 让晓婷知道 / 问问阿珍"对应 panel.html Team tab RACI seed
[x] Beat 5 反定义 + 4 肯定句对应 PRODUCT.md §反定义 + §1 一句话定位
```

---

## 最后一行总结

**v4 = v3.1 5 beat 骨架 + 7 创新点 + 用户化语言全保留 · 但动效密度翻 3 倍（60+ 里程碑）· 产品核心从字幕断言转为可视化镜头（commit hash / thinking 计数 / morph 中间帧 / 紫脉冲 breath / typewriter）· 强转场拉到可见（bloom 800ms / wipe 500ms / 黑屏 2 帧 / HSL 红紫翻转）· 标题不再换行（76pt + max-width 1720px）· BGM 替换为 FreePD Ambient J Thoughtful 120s 真实曲目**。

任何 subagent 拿到本文都能机械翻译成 storyboard JSON——每个动效有完整 CSS @keyframes 代码、cubic-bezier 数值、animation-delay 时间表、DOM 骨架。**不需要凭经验补缺**。
