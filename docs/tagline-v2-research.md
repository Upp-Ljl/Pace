# Pace Tagline v2 调研 + 候选

> 目标：覆盖所有「用 cc + git 的人」——程序员、PM、设计、运营、HR、独立开发者、团队 lead。不锁单一职业。

## 跨用户群产品的 tagline 共同点

- **Linear**: "The product development system for teams and agents" — 用 `teams` + `agents`（角色不可知）+ 落到 `product`（产物）
- **Notion**: "Meet the night shift." — 用**工种暗喻**（夜班）而非具体职业；任何被工作追的人都能代入
- **Figma**: "Make anything possible, all in Figma" — 极端泛化 (`anything`)，靠 sub-headline `Brainstorm, design, and build with your team` 收口
- **Granola**: "The AI Notepad for back-to-back meetings" — 用**场景**（背靠背会议）而非身份（销售/PM）；谁开会谁是用户

### 5 条 takeaway

1. **指场景，不指身份**：`back-to-back meetings`、`night shift`、`product development`——动词或处境替代职业名词
2. **抽象的 collective 词替代具体角色**：`teams`、`work`、`your project`、`anyone shipping X`——读者自己往里代
3. **首屏给钩子，sub 收口**：Figma 那种"Make anything possible"靠 sub 解释；钩子词允许稍微 vague
4. **避免使用产品类目自我描述**（"task tracker"、"AI assistant"）；用**动作或反差**勾人（Notion 的 `night shift`、Granola 的 `back-to-back`）
5. **中英混排 OK 但要看着像中文人写的**——不要 "AI-powered" / "leverage" / "empower" 这种 SEO 味

---

## 新候选 (4 个)

### 候选 E：「让 cc 干活，让 Pace 替你*盯住进度*。」

- **tagline**: 让 cc 干活，<br>让 Pace 替你<em>盯住进度</em>。
- **sub**: 它读你的 cc transcript 和 git 提交，告诉你这一阶段卡哪、下一步该找谁、话怎么开口。
- **CTA**: ↓ Download · 自带 LLM key · 全本地
- **ctaFoot**: cc 是手，Pace 是脑
- **叙事点**：
  - 打动谁：所有 "已经在用 cc 但工作进度全靠记忆/拍脑袋" 的人——程序员让 cc 写代码，PM 让 cc 写 PRD，运营让 cc 写文案。「cc 干活 / Pace 盯进度」是**角色不可知的二段分工**
  - 覆盖 dev+non-dev：`干活` 不指代码，`盯进度` 不指任务列表（强调"看清"不是"列出"）
  - 不掉 PM 专属：不用 PMP / 干系人 / 阶段 等术语；sub 才落到具体能力

```js
e: {
  tagline: '让 cc 干活，<br>让 Pace 替你<em>盯住进度</em>。',
  sub:     '它读你的 cc transcript 和 git 提交，告诉你这一阶段卡哪、下一步该找谁、话怎么开口。',
  cta:     '↓ Download · 自带 LLM key · 全本地',
  ctaFoot: 'cc 是手，Pace 是脑'
}
```

---

### 候选 F：「main 上裸改 3 小时后，*它问你一句话*。」

- **tagline**: main 上裸改 3 小时后，<br><em>它问你一句话。</em>
- **sub**: 不是提醒你建分支——是让你停一下：你现在在哪个回合、谁等着你的下游、要不要先同步。
- **CTA**: ↓ Try Pace · 5 MB · 本地优先
- **ctaFoot**: 不传 cc 历史，不学你的 repo
- **叙事点**：
  - 打动谁：所有 cc + git 重度用户都有的**羞耻段子**——一个 prompt 跑爽了改了一坨没人 review。程序员秒懂，PM/运营 也熟悉「写嗨了发 doc 没人对齐」的同款翻车
  - 覆盖 dev+non-dev：`main 上裸改` 是 git 圈黑话但已经出圈成"无视流程冲" 的代名词；不懂 git 的人在 sub 里被「哪个回合 / 谁等着你」接住
  - 反 task tracker：不是提醒你"建分支" / "建任务"，是问你**节奏问题**

```js
f: {
  tagline: 'main 上裸改 3 小时后，<br><em>它问你一句话。</em>',
  sub:     '不是提醒你建分支——是让你停一下：你现在在哪个回合、谁等着你的下游、要不要先同步。',
  cta:     '↓ Try Pace · 5 MB · 本地优先',
  ctaFoot: '不传 cc 历史，不学你的 repo'
}
```

---

### 候选 G：「cc 在你手里跑得太快，<em>Pace 帮你回头看一眼</em>。」

- **tagline**: cc 在你手里跑得太快，<br>Pace 帮你<em>回头看一眼</em>。
- **sub**: 你这 2 小时让 ta 干了什么？哪步该收尾、哪步该叫人、哪句话该今天说——Pace 念给你听。
- **CTA**: ↓ Get Pace · MIT 开源
- **ctaFoot**: 自带 key · 你的数据不出本机
- **叙事点**：
  - 打动谁：所有"按 enter 一时爽 / 收尾火葬场" 的 cc 用户——dev 写完一坨代码不会写 commit msg，PM 让 cc 生 10 页 PRD 不知道发给谁，独立开发者一周做完不知道下一步推广还是 polish
  - 覆盖 dev+non-dev：`回头看一眼` 是普世动作；钩子是 **速度焦虑** 不是身份
  - 不掉 PM 专属：完全不出现"项目"、"阶段"、"PMP" 字眼，但 sub 里"收尾 / 叫人 / 说话" 三件套精准是 Pace 的 PMP 能力

```js
g: {
  tagline: 'cc 在你手里跑得太快，<br>Pace 帮你<em>回头看一眼</em>。',
  sub:     '你这 2 小时让 ta 干了什么？哪步该收尾、哪步该叫人、哪句话该今天说——Pace 念给你听。',
  cta:     '↓ Get Pace · MIT 开源',
  ctaFoot: '自带 key · 你的数据不出本机'
}
```

---

### 候选 H：「不是 task list，<em>是 work mentor</em>。」

- **tagline**: 不是 task list，<br><em>是 work mentor。</em>
- **sub**: 它不让你列待办——它读你 cc 跑了啥、git 提了啥，告诉你下一步该跟谁怎么说。
- **CTA**: ↓ Download for macOS & Windows
- **ctaFoot**: 自带 LLM key · 全本地 · MIT
- **叙事点**：
  - 打动谁：被 Linear / Jira / Notion task tracker 折磨过的所有人——「我有一堆 task 但不知道接下来该干啥」是跨职业普世痛
  - 覆盖 dev+non-dev：`work` 是最角色不可知的词；`mentor` 是关系不是工具
  - 反差最锐：直接对位 Linear "product development system"——告诉用户 Pace **不是同类品**
  - 风险：稍 marketing 味 ("X，不是 Y" 句式常见)；靠 sub 的具体动作（cc / git / 跟谁说）救回来

```js
h: {
  tagline: '不是 task list，<br><em>是 work mentor。</em>',
  sub:     '它不让你列待办——它读你 cc 跑了啥、git 提了啥，告诉你下一步该跟谁怎么说。',
  cta:     '↓ Download for macOS & Windows',
  ctaFoot: '自带 LLM key · 全本地 · MIT'
}
```

---

## 主推哪个？为什么？

**主推 F**（`main 上裸改 3 小时后，它问你一句话`）——它有最强的**自嘲共情钩**和场景感，dev 秒懂 git 段子、non-dev 也能在 sub 里被「哪个回合 / 谁等着你」接住，反 task tracker 立场最锐。

备选 E（最稳，cc/Pace 分工说得清，适合 hero default）。G 偏温柔适合 sub-page。H 偏 marketing 适合做对比锚。

## 排除哪些方向？为什么？

- ❌ "Code less, ship more" / "Ship faster" — 把 user 锁死在 code 群体，且 `ship` 这词已经被 SaaS 滥用到失味
- ❌ "Your AI project manager" — 用 PM 这个角色名直接违反硬约束 1，且 "AI X" 句式是 marketing 套话
- ❌ "From prompt to production" — 仍是程序员 mental model；PM/运营不 think in "production"
- ❌ "Know what's next" / "Always know your next move" — 太抽象、没钩子；和原 A "它不让你列任务" 比毫无差异化优势
- ❌ "The mentor for AI-native workers" — `AI-native` 是 buzzword，且 `workers` 给人廉价感
- ❌ 任何含 "10x" / "leverage" / "empower" / "high-leverage" / "AI-powered" 的方向 — 用户口味红线
