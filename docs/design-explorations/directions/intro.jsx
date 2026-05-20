// Intro / designer's note artboard — v2
// Hero tagline locked. Language rules visible at the top so I (and future me)
// don't drift back into PMP / RACI / stakeholder vocab.

const introStyles = {
  root: {
    width: '100%', height: '100%',
    background: '#fbf9f4',
    color: '#1f1a14',
    fontFamily: '"Source Serif 4", Georgia, serif',
    padding: '52px 56px 44px',
    fontSize: 14.5,
    lineHeight: 1.55,
  },
  eyebrow: {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 11,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#8a7f6a',
    marginBottom: 16,
  },
  h1: {
    fontFamily: '"Source Serif 4", Georgia, serif',
    fontWeight: 500,
    fontSize: 30,
    lineHeight: 1.16,
    letterSpacing: '-0.01em',
    margin: '0 0 6px',
    textWrap: 'pretty',
  },
  lede: {
    color: '#5c5444',
    fontSize: 15.5,
    fontStyle: 'italic',
    margin: '0 0 24px',
    maxWidth: 580,
  },
  rule: { border: 0, borderTop: '1px solid #e5dfd3', margin: '20px 0' },
  h2: {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#1f1a14',
    margin: '0 0 10px',
  },
  body: { color: '#3a3328', margin: '0 0 12px' },
  mono: { fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 12.5, color: '#5c5444' },

  // Locked tagline card
  taglineCard: {
    border: '1px solid #d9c97a',
    background: '#fbf3d6',
    padding: '14px 18px',
    margin: '0 0 18px',
    display: 'flex',
    alignItems: 'baseline',
    gap: 14,
  },
  taglineCardTag: {
    fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5,
    color: '#8a6e1c', letterSpacing: '0.16em', fontWeight: 700,
  },
  taglineText: {
    fontFamily: '"Source Serif 4", serif', fontSize: 17, color: '#1f1a14',
    fontStyle: 'italic',
  },

  // Rules table
  rulesTable: { display: 'grid', gridTemplateColumns: '180px 1fr', rowGap: 8, columnGap: 18, fontSize: 13.2 },
  ruleK: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#8a7f6a', letterSpacing: '0.06em' },
  ruleV: { color: '#1f1a14' },
  strike: { textDecoration: 'line-through', textDecorationColor: '#c2392f', textDecorationThickness: 1.5, color: '#8a7f6a' },
};

function IntroCard() {
  const D = introStyles;
  return (
    <div style={D.root}>
      <div style={D.eyebrow}>brief §八 · 3 directions · v2 — landing copy 同步用户化语言</div>
      <h1 style={D.h1}>三个方向不变，措辞全部清扫。</h1>
      <p style={D.lede}>
        Hero tagline 锁定，PMP / RACI / stakeholder 等术语在 landing 全幕后化。
        下面每个方向用同一个 tagline，但用各自的视觉骨架支撑它。
      </p>

      <div style={D.taglineCard}>
        <span style={D.taglineCardTag}>HERO · LOCKED</span>
        <span style={D.taglineText}>main 上裸改 3 小时后，它问你一句话。</span>
      </div>

      <h2 style={D.h2}>landing 语言规则（强制执行）</h2>
      <div style={D.rulesTable}>
        <span style={D.ruleK}>幕后化</span>
        <span style={D.ruleV}><span style={D.strike}>PMP · PMBOK · RACI · Stakeholder</span> &nbsp; 0 次出现</span>
        <span style={D.ruleK}>找谁</span>
        <span style={D.ruleV}>找谁 / 谁拍板 / 谁咨询 / 让谁知道</span>
        <span style={D.ruleK}>阶段</span>
        <span style={D.ruleV}>启动 / 规划 / 推进 / 监控 / 收尾</span>
        <span style={D.ruleK}>阶段判断写法</span>
        <span style={D.ruleV}>「你这周在做收尾活，还有 2 个 commit 没 review」</span>
        <span style={D.ruleK}>角色写法</span>
        <span style={D.ruleV}>「这事得 Tom 点头」（不是 "Tom 是 R"）</span>
        <span style={D.ruleK}>话术写法</span>
        <span style={D.ruleV}>「话怎么开」+ 一段具体的开场白</span>
        <span style={D.ruleK}>反定义</span>
        <span style={D.ruleV}>压到 3 条 — 不是 task tracker / 不是 chat 替代品 / 不是 IDE 插件</span>
        <span style={D.ruleK}>凭据小字</span>
        <span style={D.ruleV}>"查 5 个 commit · 47 行改动 · 8 轮对话"（不写文件路径 / agent 代号）</span>
        <span style={D.ruleK}>收尾 4 行</span>
        <span style={D.ruleV}>它是 mentor · 它读你的 cc · 它在你电脑里 · 它告诉你下一步找谁、话怎么开</span>
      </div>

      <hr style={D.rule} />

      <h2 style={D.h2}>方向 1 · LOGBOOK</h2>
      <p style={D.body}>
        全 dark + JetBrains Mono。landing 是一段 Pace session 的回放，tagline 作为 mentor 输出嵌在第三屏。
      </p>
      <p style={D.mono}>打动 / cc 重度用户 · 反差 / 不演示产品，让你读它输出 · 落到 / 读 cc + 公开推断</p>

      <hr style={D.rule} />

      <h2 style={D.h2}>方向 2 · EVIDENCE（我的推荐）</h2>
      <p style={D.body}>
        Manilla 纸 + 索引卡。三份 case file，每份附原始痕迹 + 推断 + 一句话。跨职业（PM / 设计 / 程序员看到的都是 cc + 提交 + 团队）。
      </p>
      <p style={D.mono}>打动 / 跨职业、tech lead · 反差 / 不卖建议，卖证据链 · 落到 / 看得见的判断依据</p>

      <hr style={D.rule} />

      <h2 style={D.h2}>方向 3 · MANIFESTO</h2>
      <p style={D.body}>
        Hero 无产品截图。5 件 Pace 永远不做的事占满整版。Tagline 在 manifesto 之后的转折屏出现。Accent 苔绿 #6c7a2c。
      </p>
      <p style={D.mono}>打动 / OSS 信徒 / 被 SaaS 透支的人 · 反差 / 不卖功能，卖立场 · 落到 / 5 锁死决策升格成 thesis</p>

      <hr style={D.rule} />

      <p style={{...D.mono, color: '#8a7f6a'}}>
        点 ⤢ 全屏看任一方向完整 5 屏。底部 4 行肯定句已经按规则 5 嵌入每个方向收尾。
      </p>
    </div>
  );
}

window.IntroCard = IntroCard;
