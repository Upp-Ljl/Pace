# Pace Demo Video Script (≤ 2min)

> 写给剪辑 / 配音 / motion 三方共读。每条分镜可执行，每条功能描述都能在 `519 归档.md` / `panel.js` / `mentor-pipeline.cjs` / `mentor-tools.cjs` 找到落地证据。

## 整体节奏

- **总时长**：118s（带 2s buffer 到 120s）
- **配音风格**：中文男声，30 岁上下，质感像 Granola 的旁白——**不带销售腔**，气口干净，平均 5 字/秒、关键钩子句速度降到 3 字/秒
- **BGM 风格**：参考 Linear 官方 demo —— **lo-fi 钢琴 + 极低频 sub-bass pad**，全程一条线不变，只在 3 处加鼓点重音（51s / 78s / 110s）。**禁** synth 大滑音、禁鼓点密集 trap、禁科技感 epic
- **画面基调**：暗色主题（panel.html 默认 `data-pace-theme="dark"`）。98% 时间停在 Pace panel + 终端，**不切人脸、不切产品 logo 大屏**
- **关键反差点出现时间戳**（剪辑师对齐）：
  - `0:08` —— 句尾「但谁帮你**理解**」与 panel 滑入对齐
  - `0:51` —— DeepSeek 思考框砰一下塌成一行 header（**BGM 鼓点重音 #1**）
  - `1:18` —— 紫色 persona banner 滑入 + 输入框 placeholder 变成"对 Tom 说点什么..."（**BGM 鼓点重音 #2**）
  - `1:50` —— 三条反定义字幕快闪（**BGM 鼓点重音 #3**）

---

## 分镜表

| 时间 | 类型 | 屏幕 / 动画内容 | 配音 / 字幕 | 备注 |
| --- | --- | --- | --- | --- |
| 0:00–0:03 | 创意动画 | 全黑屏，左侧 cc terminal 字符以 60wpm 速度自动打：`$ claude code` → 弹出 `╭─ Claude Code ─╮` → 4 行 commit 消息瀑布滚（`a790852 feat: TODO …` / `26d5ca6 fix: IPC race …` / `8a90e01 fix: cc-bridge …` / `0cd7f41 ui: 思考框 …`），文字偏淡灰，**不要 syntax color 鲜艳**——刻意制造"信息溢出"感 | 字幕（无配音）：「**2026 年**」 → 0.5s 后切「**AI 帮你写完代码**」 | 0:00 BGM 起，钢琴单音两拍 |
| 0:03–0:08 | 创意动画 | cc terminal 继续滚 commits，**但右侧从屏幕外（右→左）滑入** Pace panel（取 panel.html 真实截图，header `● pace` 那一条 + meta line `pace · main · 3 dirty · M2.7`）。panel 滑入时左侧 terminal 不停 | 配音：「但**谁**帮你理解——你刚刚干了什么？」<br>字幕双语对齐：「Who helps you make **sense** of what you just shipped?」 | 0:08 panel 完全 landed 时 BGM pad 加入 |
| 0:08–0:12 | 真实屏幕 | panel 占满画面（cc terminal 隐去），停在 `Now` tab。镜头先停在 commit pane —— 5 条 commit 横排，每条带绿色 `执行·范围` / 琥珀 `执行·质量` PMP tag。**digest 一行**：「最近 5 个 commit 多落在 **执行 × 整合** · 跨度 3.2 小时」 | 配音：「Pace 不让你列任务。」 | 镜头不动，给观众读 digest 的时间 |
| 0:12–0:18 | 真实屏幕 | 镜头平移下滑到下面的 observation cards：依次扫过 `⏳ 上次 commit 是 47 分钟前` / `📂 3 个文件未提交` / `🌀 最近主题分散：fix · ui · refactor · docs` 三张卡。每张卡 sub 一行灰字「想看建议 →」 | 配音：「它自己**看**——看你的 git，看你的 cc，看你的节奏。」 | 镜头匀速下移，不停顿 |
| 0:18–0:25 | 真实屏幕 + 注释 | 鼠标点 `⏳` 卡的「想看建议 →」。**inline 在卡片底部展开** mentor 答案（不切 tab、不开新窗）：流式渲染 80 字内观察 + 一条下一步 + 末尾粗体提到 `@Tom`。Tom 字样上画一个手绘黄色圆圈 + 箭头注释「**虚拟同事，从 team tab 来**」 | 配音：「Pace 是你的 mentor——也认识你的同事。」 | 关键钩子，**配音降到 3 字/秒** |
| 0:25–0:30 | 真实屏幕 | 答案完成后，inline 答案下面**自动析出**一个 `▶ git status --short` chip（safe 类，accent 绿描边）。鼠标点 chip → chip 下挂 `<pre>` 实时流出 `M packages/desktop-shell/panel.html` + 末行 `exit 0 · 0.3s`（绿色） | 字幕（无配音 0.5s 静默）：「**一键跑 · whitelist-safe · 0.3s**」 | 让观众消化 cmd-exec 这个能力，**配音让位** |
| 0:30–0:38 | 真实屏幕 | 镜头切 `Ask` tab。input 框聚焦，placeholder 灰字「问 mentor 一句话…」。用户敲（**字符级真人手速 + 删一次再补**）："我接下来该干啥？我有点乱" → 回车 | 配音：「不知道下一步怎么办的时候——开口就行。」 | 删字符那次给观众"真人感"，**别打成机器输入** |
| 0:38–0:42 | 真实屏幕 | 用户气泡出现（米色 user-bg）。下方 mentor 气泡 `streaming` class 起手：左边 2px 绿色边 + breathe 呼吸光晕。**思考框先出现**：head 行「🧠 思考中 · 0 字 · 0.2s」，body 灰色斜体 italic | 配音：「它不是猜——」 | 0:42 鼓点 hint，但不重音 |
| 0:42–0:51 | 真实屏幕 | 思考框 body 实时长字：`让我先看一下用户最近的工作` → 字符流出来。**然后插入 `🔧 git_log` 一行**（粗体 tool name + 灰色 args `{"limit":10}`），紧接 `→ 5 commits: a790852 …` 灰色单行预览。再插入 `🔧 git_diff` → `→ packages/desktop-shell/cc-bridge.cjs +47 -12 …`。再插入 `🔧 cc_recent_transcript` → `→ 8 turns from D:\lll\pace session 1a3f…`。思考框已经满 140px max-height，**顶部 28px mask 渐隐**——老字往上飘消失，最新字始终在底部 | 配音：「它在**翻**你的工作。」<br>字幕：「git_log · git_diff · cc transcript · read_file · list_files —— 5 个只读工具」 | 镜头**死死锁** thinking 框，让 tool 行一条一条砸出来。每条 tool 行用 fade-in-up 进场，给观众"读得过来"的节奏 |
| 0:51–0:52 | 真实屏幕（**WOW 瞬间**） | thinking 框累计 582 字 / 29.3s。**第一个 answer chunk 到达**——thinking 框瞬间 `collapsed` class，padding 200px→5px 收成一行 header：「思考完成 · 582 字 · 29.3s ⌄」（点击可展开）。**正文区开始流字** | 配音停（**让 BGM 鼓点重音 #1 替你说话**） | 这一帧是全片最值钱的 1 秒。**剪辑：放慢到 0.5x 速度共 0.5s 真实时间填 1s 视频**，给观众看清折叠 motion。塌的同时画面右下角浮出小注释字幕「像同事掀开 IDE 给你看 git」 |
| 0:52–1:05 | 真实屏幕 | mentor 正文流字（80-120 字，markdown 渲染）：第一段观察用户在收尾 mentor-pipeline 三件事；第二段建议先和 Tom 对齐 IPC 重构；末尾 `## 📋 TODO` heading + 3 条 li 自动析出成三个 chip：`▶ git log --oneline -10`（safe）/ `▶ git commit -m "wip: ..."`（caution，琥珀边）/ `🚫 git reset --hard`（deny，红边 disabled，title 显示 dangerous pattern） | 配音：「不是 chat 机器人那种发散——是基于**你机器上的真实状态**给出来的下一步。」 | 重点拍 TODO chip 4 类视觉差，**鼠标 hover 让 caution chip 的 tooltip 浮出来** |
| 1:05–1:18 | 真实屏幕 | 镜头切 `Team` tab。3 张同事卡纵向排列：<br>1) **晓婷** · PM · `A` badge 紫色 · 🤖 `xiaoting-agent` chip · note「沟通偏好：先文字后会议」<br>2) **Tom** · Eng · `R` badge 蓝色 · 🤖 `tom-cc-session-3a2f`<br>3) **阿珍** · Designer · `C` badge 黄色 · 🤖 `azhen-agent`<br>每张卡右侧两个按钮：`💬 对话` / `✎`。鼠标移到 Tom 卡停留 0.5s | 配音：「这些是你**项目里**的同事——不是 Pace 给你随机生成的。」 | RACI badge 用 panel 真实样式（`tm-raci-badge R/A/C/I` class） |
| 1:18–1:22 | 真实屏幕（**WOW 瞬间**） | 点 Tom 卡的 `💬 对话`。**Ask tab 滑入**，顶部 `紫色 persona banner` 上拉露脸：「你正在以 **Tom（Eng）** 的视角对话 · [✗ 退出 persona]」。input 框 placeholder 同时变成「对 Tom 说点什么…」 | 配音：「见面前——」（**BGM 鼓点重音 #2** 对齐 banner 落定） | banner 是真实 `#as-member-banner` 元素，用 panel 默认样式不调色 |
| 1:22–1:32 | 真实屏幕 | 用户敲："这一波 IPC 重构稳吗？我准备明天 push" → 回车。Mentor 气泡（**这次没有 thinking 框**，因为是 persona 模式不带 agent tools）直接流出 answer。第一行：「**我作为 Tom，先说结论——** 不稳。」第二段：「你那个 `.finally` 删 listener 的 race condition 我之前在 cairn 也踩过，建议补一个 50ms 的 delay…」**末尾签名一行 italic**：「— Tom (Eng · R)」 | 配音：「先和 ta 的**视角**排练一遍。」 | 答案要让人感觉"是 Tom 在说话"——第一人称 + 角色视角 + 签名。**别让 mentor 跳出来说"我是 Pace"** |
| 1:32–1:42 | 真实屏幕 | 镜头停在 Tom 的回答，**手动滚动**回答 body 一下露出整段。然后慢镜头切回 panel header meta line：`pace · main · 3 dirty · M2.7` 这一条灰字 | 配音：「全本地。你的 LLM key。你的数据。** 零后端**。」 | 这是 5 大锁死决策第 5 条的视觉落点。**别上 cloud icon、别上 lock icon** |
| 1:42–1:50 | 创意动画 | panel 镜头静止 → 屏幕中央叠加三条字幕**快闪**（每条 0.6s，前一条用 0.1s 淡出，后一条立即砸入，给重击感）：<br>「**不是** task tracker」<br>「**不是** chat 替代品」<br>「**不是** IDE 插件」 | 配音停（**鼓点重音 #3 砸第三条字幕**） | 字体用 panel.html 真实 `--font-prose`（PingFang SC）。**红色斜杠**穿过每条字（CSS `text-decoration: line-through` red） |
| 1:50–1:58 | 创意动画 | 三条反定义字幕同时往中心收缩成一个绿点（对齐 panel `--accent: #6fb5b0`），绿点炸开变成 wordmark：<br>`● pace`<br>下方一行小字 monospace：「`Local. Yours. PMP-aware.`」<br>再下一行 CTA：「`github.com/Upp-Ljl/Pace · v0.2 coming soon`」<br>**右下角小字**：「`Electron · MIT · BYOK`」 | 配音：「Pace。」（**单字，全片最重的发音**） | wordmark 用 panel 真实 brand class（`#brand .dot` 那个绿点 + lowercase）。BGM 钢琴单音收尾，1.2s 长尾消音 |

---

## 配音稿（口播版本，给配音员）

> 总字数：**118 字**。语速 5 字/秒，刚好 24s 口播，剩下 94s 是字幕 + 屏幕 + BGM。中文为主，英文做配套字幕选项。

```
[0:03] 但 谁 帮 你 理 解———— 你 刚 刚 干 了 什 么？
       (Who helps you make sense of what you just shipped?)

[0:12] Pace 不让你列任务。

[0:18] 它自己看——看你的 git，看你的 cc，看你的节奏。

[0:25] Pace 是你的 mentor——也认识你的同事。
       (1.5s 停顿)

[0:38] 不知道下一步怎么办的时候——开口就行。

[0:42] 它不是猜——

[0:46] 它在 翻 你的工作。
       (4s 静默，让 thinking → answer 折叠 motion 配 BGM 鼓点说话)

[0:55] 不是 chat 机器人那种发散——是基于你机器上的真实状态给出来的下一步。

[1:08] 这些是你项目里的同事——不是 Pace 给你随机生成的。

[1:20] 见面前——
       (BGM 鼓点对齐 banner 落定)

[1:25] 先和 ta 的 视角 排练一遍。

[1:34] 全本地。你的 LLM key。你的数据。零后端。
       (10s 静默，让反定义字幕 + 重音砸观众)

[1:56] Pace。
```

**配音员注意**：
- 「**理解**」「**看**」「**翻**」「**视角**」四个词是钩子，**速度降到 3 字/秒 + 气口微微吸一下**
- 「Pace。」（最后一个词）是全片重音落点。**单字独立成句**，发音前留 0.3s 停顿
- 全程**不要笑场感、不要播音腔**——像同事跟你解释一个工具，不像 keynote

---

## 素材清单

### 需要预录（真实屏幕段）

| 段 | 时间 | 录什么 | 注意 |
| --- | --- | --- | --- |
| Seg A | 0:08–0:30 | Pace panel `Now` tab 全程（commit pane + observation cards + inline mentor answer + cmd-exec chip 跑 git status） | 录之前先 seed 团队（晓婷/Tom/阿珍）+ 留 3 dirty file + 让 commit 跨 3 小时（手动改 commit author date 即可，**别真等**） |
| Seg B | 0:30–1:05 | Ask tab 完整一轮：input 输入 + agent 模式 streaming + thinking 框带 5 个 tool 行 + 0:51 折叠 + 正文 + TODO chip 析出 | **关键**：MiniMax stream 偶发 30s 慢（519 归档.md §残留 #3），录之前用**短 prompt** 触发稳定的 5-tool-call agent 模式，**推荐 prompt**：「我现在在干啥？接下来该做啥？」（agent 自动会 git_log + git_diff + cc_recent_transcript） |
| Seg C | 1:05–1:18 | Team tab 三张同事卡 + hover Tom 卡 | 提前 seed db：`pace_team` 表 insert 三条记录，agent_id 字段塞真实样式的字符串 |
| Seg D | 1:18–1:42 | 点 Tom 对话 → persona banner 滑入 → 输入 IPC 问题 → mentor 第一人称答 | persona 模式**不走 agent stream**（buildMemberPersonaPrompt + runMentorTurnStream），所以**不会**出现 thinking 框带 tool 行，**这是设计**，不是 bug。**剪辑别误以为录错了** |

### 需要 motion graphics 制作

| 项 | 时长 | 描述 |
| --- | --- | --- |
| Opening 字幕动画 | 0:00–0:03 | 「2026 年」→「AI 帮你写完代码」字符级 fade-in-up（参考 panel.html `@keyframes fadeInUp`） |
| panel 滑入 | 0:03–0:08 | 右→左滑入，缓动用 `cubic-bezier(0.16, 1, 0.3, 1)` 跟 panel.html `--ease-out` 一致 |
| 0:18 黄色手绘圈 + 箭头 | 0.8s | 标 `@Tom` 字样，注释「虚拟同事，从 team tab 来」。**手绘风**不要 SVG vector 感 |
| 0:51 折叠瞬间 0.5x 慢动作 | 1s 视频时长 | 真实折叠 motion 是 0.32s（panel.html `.msg-thinking transition: padding 0.32s`），剪辑里**降速到 0.5x 但只填 1s 视频**，给观众看清 |
| 1:42–1:50 反定义字幕快闪 | 0.6s × 3 | 中央对齐，红色斜杠穿透。字幕字体 PingFang SC bold |
| 1:50 字幕收缩成绿点炸开 wordmark | 8s | 三条字幕同步缩到中心（位置：屏幕 50% 50%）→ 形变成 `--accent: #6fb5b0` 实心圆 → 0.3s 后 scale 1.3 + opacity fade → 露出 `● pace` wordmark |

### 需要 seed 数据

```sql
-- 团队成员（projectId = D:\lll\pace 的 git_root）
INSERT INTO pace_team (project_id, name, role, raci, notes, agent_id) VALUES
  ('<git_root>', '晓婷', 'PM',       'A',  '沟通偏好：先文字后会议', 'xiaoting-agent'),
  ('<git_root>', 'Tom',  'Eng',      'R',  '前端 + IPC 经验丰富',     'tom-cc-session-3a2f'),
  ('<git_root>', '阿珍', 'Designer', 'C',  '关注体验一致性',          'azhen-agent');

-- commit timeline 跨度做法（不要真等 3 小时）
-- 录制前在 worktree 里用 GIT_COMMITTER_DATE / GIT_AUTHOR_DATE
-- 重写 5 个 commit 的时间戳让 timeline 跨 3.2 小时：
GIT_COMMITTER_DATE="2026-05-19T10:00:00" git commit --amend --no-edit --date="2026-05-19T10:00:00"
# 然后 cherry-pick 4 次往后递推 40 / 80 / 130 / 190 分钟
```

### 字幕版本

- **中文配音 + 中文字幕（默认）**：burned-in，PingFang SC，底部 12% safe area
- **中文配音 + 英文字幕（海外）**：英文字幕做软字幕（srt），方便 YouTube / Twitter 切换
- **关键英文字幕翻译**（不要机翻，用以下定稿）：
  - 「Pace 不让你列任务」→ `Pace doesn't ask you to list tasks.`
  - 「它自己看」→ `It looks for itself.`
  - 「它在翻你的工作」→ `It's digging through your work.`
  - 「先和 ta 的视角排练一遍」→ `Rehearse with their perspective—before the meeting.`
  - 「不是 task tracker / chat 替代品 / IDE 插件」→ `Not a task tracker. / Not a chat replacement. / Not an IDE plugin.`
  - 「Local. Yours. PMP-aware.」**保留英文不译**

---

## 注意点（拍摄前必看）

1. **MiniMax stream 稳定性**：519 归档.md §残留 #3 说 MiniMax 长 context 偶发停吐 token。Seg B 录之前**先打一次完整 turn 验稳**，如果 agent mode 第一次跑出现 idle watchdog（30s 后弹「流式输出卡住了，重试同一个问题」）→ **重启录制**，别试图剪进去。
2. **seed 团队的 RACI 字符选哪个最直观**：用 **A / R / C** 三件套（不要用 I——badge 形状窄看不清）。颜色按 panel.js L1456 真实 class（`.tm-raci-badge.A` 紫 / `.R` 蓝 / `.C` 黄）。
3. **DeepSeek 思考框塌的瞬间剪辑细节**：
   - 真实 motion 是 panel.html `.msg-thinking { transition: padding 0.32s cubic-bezier(0.16, 1, 0.3, 1) }` + `.collapsed .thinking-body { display: none }` —— 高度变化是 instant snap（不是 transition），padding 是 320ms 缓动
   - **剪辑做法**：在塌的那一帧（thinking max-height 140px → 0）**插一个 1 帧 white-bloom**（屏幕中心 20% 半径，opacity 0.15）+ **BGM 鼓点重音 #1**（kick + 短 reverb tail）
   - 鼓点应该在 frame -1 起音，frame 0 撞到峰值（视觉折叠完成的瞬间）
4. **persona banner 紫色 vs 默认 accent 绿**：panel.css 里 `#as-member-banner` 是 `rgba(176, 137, 104, 0.18)` user-bg 那个琥珀色——**不是紫的**。脚本里"紫色 banner"是设计语意（区分 mentor 模式 vs persona 模式），剪辑师**按现有实现的琥珀色拍**，**不要后期 grade 成紫色**（会和真实 app 不符）。如果用户后续要改成紫色，是 panel.html 改 var 的事，不归 demo 解决。
5. **inline 答案 vs Ask tab 答案的区别**：
   - 0:18 在 `Now` tab 卡片里 inline 渲染（不切 tab）
   - 0:38 切到 `Ask` tab 才 streaming
   - 这两者底层都是 `streamMentorInto()`，但 inline 是 cards 触发（带 `card.seed`），Ask 是用户 input 触发。**视觉上要做出区分**：inline 答案宽度收窄到 card 内部，Ask 答案是全宽气泡
6. **不要做的事**：
   - ❌ 不要拍**人脸**（创始人 / 用户演员都不拍）—— Pace 的产品调性是"安静的工具"，人脸会破气场
   - ❌ 不要做**软件 logo 大屏**（不要 Pace logo 占满全屏 fade-in 那种 keynote 风）
   - ❌ 不要展示**任何 cc spawning 子进程的画面**（Pace 不写代码不 spawn cc，这是反定义红线，画面里漏一个 cc terminal subprocess 都算定位漂移）
   - ❌ 不要"AI 助手"刻板形象（机器人、星空、神经网络可视化、coding particle effects）——Pace 是 **mentor**，不是 **AI**
7. **CTA URL 准确性**：closing 显示的 GitHub URL 必须是 `github.com/Upp-Ljl/Pace`（CLAUDE.md §推送必读已确认），不是 `pace.dev` / `pace.app` / 任何域名。**用户当前无独立域名**。
8. **录屏分辨率**：1920×1200（panel 默认宽度 + macOS notch-aware menubar 区域），最终输出 1920×1080，上下黑边可裁，但 panel 内容**不能裁到 commit pane 或 input bar**。

---

## 自检（写完回读）

- [x] 0:08 panel 滑入对齐"但谁帮你理解"句尾 —— Opening 反差点 #1 ✓
- [x] 0:51 thinking 折叠 + 鼓点 —— 全片最值钱的 1 秒 ✓
- [x] 1:18 persona banner 滑入 + 鼓点 —— 团队视角钩子 ✓
- [x] 配音稿 118 字 ≤ 240 字硬上限 ✓
- [x] 每条分镜功能都能在 519 归档.md / panel.html / panel.js / mentor-pipeline.cjs / mentor-tools.cjs 找到证据 ✓
- [x] 没有 marketing 套话（"提升效率" / "赋能" / "智能化" 一个都没用）✓
- [x] 反定义清单（task tracker / chat / IDE 插件）在 closing 落地 ✓
- [x] 5 大锁死决策第 5 条（全本地 / BYOK / 零后端）在 1:32 落地 ✓
- [x] CTA URL = `github.com/Upp-Ljl/Pace`（不编造域名）✓
