// Direction 3 · MANIFESTO
// No product screenshot above the fold. 5 锁死决策 IS the hero.
// Accent moves off purple → olive. Type-driven, editorial.
// Pitch: "5 件 Pace 永远不做的事" — sells stance, not features.

const mfStyles = {
  root: {
    width: '100%',
    background: '#f4f1e8',
    color: '#0c0c0a',
    fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
    fontSize: 15,
    lineHeight: 1.5,
    overflow: 'hidden',
  },
  // Sticky-style nav
  nav: {
    padding: '20px 64px',
    display: 'flex',
    alignItems: 'center',
    gap: 22,
    borderBottom: '1px solid #0c0c0a',
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  navMark: { fontWeight: 700, letterSpacing: '0.18em', display: 'flex', alignItems: 'center', gap: 8 },
  navMarkDot: { width: 9, height: 9, background: '#6c7a2c', borderRadius: 99 },
  navList: { display: 'flex', gap: 22, marginLeft: 'auto', alignItems: 'center' },
  navLink: { color: '#0c0c0a', textDecoration: 'none', opacity: 0.6 },
  navCta: { color: '#f4f1e8', background: '#0c0c0a', padding: '6px 12px', textDecoration: 'none' },

  page: { padding: '0 64px', maxWidth: 1280, margin: '0 auto' },

  // Hero epigraph
  epigraph: {
    padding: '64px 0 28px',
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 12.5,
    color: '#5c5a4e',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    gap: 18,
  },
  epigraphLine: { flex: 1, height: 1, background: '#cbc6b3' },

  // The 5 huge negations
  manifesto: { padding: '0 0 32px' },
  row: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr 360px',
    columnGap: 36,
    alignItems: 'baseline',
    padding: '36px 0',
    borderTop: '1px solid #0c0c0a',
  },
  rowLast: {
    borderBottom: '2px solid #0c0c0a',
  },
  rowNum: {
    fontFamily: '"Inter Tight", "Inter", sans-serif',
    fontSize: 22,
    fontWeight: 700,
    color: '#6c7a2c',
    letterSpacing: '-0.01em',
  },
  rowH: {
    fontFamily: '"Inter Tight", "Inter", sans-serif',
    fontSize: 84,
    lineHeight: 0.96,
    fontWeight: 800,
    letterSpacing: '-0.035em',
    color: '#0c0c0a',
    margin: 0,
    textWrap: 'pretty',
  },
  rowHEm: { color: '#6c7a2c', fontStyle: 'normal' },
  rowKill: { textDecoration: 'line-through', textDecorationThickness: '4px', textDecorationColor: '#6c7a2c' },
  rowBody: {
    fontFamily: '"Inter", sans-serif',
    fontSize: 14.5,
    color: '#2a2a22',
    lineHeight: 1.55,
    paddingTop: 24,
  },
  rowMeta: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 10.5,
    color: '#7a7866',
    letterSpacing: '0.1em',
    marginTop: 14,
    textTransform: 'uppercase',
  },

  // After-the-no's section
  pivot: {
    padding: '96px 0 56px',
    textAlign: 'center',
  },
  pivotEyebrow: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11.5,
    color: '#6c7a2c',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  pivotH: {
    fontFamily: '"Inter Tight", "Inter", sans-serif',
    fontSize: 92,
    lineHeight: 0.98,
    fontWeight: 800,
    letterSpacing: '-0.035em',
    margin: '0 auto',
    maxWidth: 1000,
    color: '#0c0c0a',
    textWrap: 'pretty',
  },
  pivotSub: {
    fontFamily: '"Inter", sans-serif',
    fontSize: 19,
    color: '#3a3a30',
    maxWidth: 640,
    margin: '24px auto 0',
    lineHeight: 1.5,
  },

  // Tiny product reveal
  reveal: {
    margin: '64px auto 0',
    maxWidth: 920,
    background: '#0c0c0a',
    padding: '14px',
    borderRadius: 4,
  },
  revealInner: {
    background: '#15151a',
    border: '1px solid #1f1f24',
    borderRadius: 2,
    padding: '20px 24px',
    color: '#e7e1d3',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 13,
    lineHeight: 1.7,
  },

  // Wow moments
  moments: {
    padding: '120px 0 64px',
    borderTop: '1px solid #0c0c0a',
    marginTop: 96,
  },
  momentsH: {
    fontFamily: '"Inter Tight", "Inter", sans-serif',
    fontSize: 52,
    fontWeight: 700,
    letterSpacing: '-0.025em',
    margin: '0 0 12px',
    lineHeight: 1.05,
  },
  momentsSub: {
    fontFamily: '"Inter", sans-serif',
    fontSize: 16,
    color: '#5c5a4e',
    margin: '0 0 48px',
    maxWidth: 600,
  },
  momentGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 28 },
  moment: {
    padding: '28px 0 0',
    borderTop: '2px solid #0c0c0a',
  },
  momentNum: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11,
    color: '#6c7a2c',
    letterSpacing: '0.2em',
    marginBottom: 14,
  },
  momentTitle: {
    fontFamily: '"Inter Tight", sans-serif',
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: '-0.018em',
    lineHeight: 1.12,
    marginBottom: 14,
  },
  momentBody: { fontSize: 14, color: '#2a2a22', lineHeight: 1.55, marginBottom: 18 },
  momentMock: {
    background: '#15151a',
    color: '#e7e1d3',
    borderRadius: 4,
    padding: '14px 16px',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11.5,
    lineHeight: 1.65,
    minHeight: 140,
  },

  // Install / footer
  install: {
    margin: '96px 0 0',
    padding: '64px 0',
    borderTop: '2px solid #0c0c0a',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 56,
    alignItems: 'flex-end',
  },
  installH: {
    fontFamily: '"Inter Tight", sans-serif',
    fontSize: 60,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 1,
    margin: 0,
  },
  installSub: {
    fontFamily: '"Inter", sans-serif',
    fontSize: 15.5,
    color: '#2a2a22',
    marginTop: 16,
    maxWidth: 380,
    lineHeight: 1.5,
  },
  bigBtn: {
    background: '#0c0c0a',
    color: '#f4f1e8',
    padding: '22px 32px',
    fontFamily: '"Inter Tight", sans-serif',
    fontWeight: 700,
    fontSize: 22,
    letterSpacing: '-0.005em',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  bigBtnAccent: { color: '#6c7a2c' },

  footer: {
    borderTop: '1px solid #0c0c0a',
    padding: '24px 0 32px',
    display: 'flex',
    gap: 24,
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11,
    color: '#5c5a4e',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
};

function MfRow({ n, kill, won, body, meta, last }) {
  return (
    <div style={{ ...mfStyles.row, ...(last ? mfStyles.rowLast : {}) }}>
      <div style={mfStyles.rowNum}>0{n}.</div>
      <h2 style={mfStyles.rowH}>
        <span style={mfStyles.rowKill}>{kill}</span><br/>
        <span style={mfStyles.rowHEm}>{won}</span>
      </h2>
      <div>
        <div style={mfStyles.rowBody}>{body}</div>
        <div style={mfStyles.rowMeta}>{meta}</div>
      </div>
    </div>
  );
}

function Manifesto() {
  const D = mfStyles;
  return (
    <div style={D.root}>
      <div style={D.nav}>
        <span style={D.navMark}><span style={D.navMarkDot}></span>PACE</span>
        <span style={{ opacity: 0.4, letterSpacing: '0.08em' }}>· field mentor · v0.1</span>
        <div style={D.navList}>
          <a style={D.navLink} href="#">read</a>
          <a style={D.navLink} href="#">github</a>
          <a style={D.navCta} href="#">↓ get pace</a>
        </div>
      </div>

      <div style={D.page}>

        {/* Epigraph */}
        <div style={D.epigraph}>
          <span>manifesto · 2026 · v0.1</span>
          <span style={D.epigraphLine}></span>
          <span style={{ color: '#6c7a2c' }}>5 件 Pace 永远不做的事</span>
        </div>

        {/* 5 manifesto rows */}
        <div style={D.manifesto}>
          <MfRow
            n={1}
            kill="上传你的 cc 历史"
            won="读完，留在本地。"
            body="Pace 不会把你的 transcript、git diff、commit message 发到任何服务器。所有 grep + 推断都在你的机器上做完。"
            meta="0 BYTES OUT · 0 TELEMETRY"
          />
          <MfRow
            n={2}
            kill="替你保管 LLM key"
            won="你来插，它来调。"
            body="自带 Anthropic / OpenAI / 本地 key。我们不在中间转一道。删 app = 删全部 — 我们手里没有你任何东西。"
            meta="BYOK · ANTHROPIC · OPENAI · OLLAMA"
          />
          <MfRow
            n={3}
            kill="周一早上提醒你"
            won="它永远等你看它一眼。"
            body={'没有推送、没有弹窗、没有 "good morning"。Pace 是被动的。你按"看我"它才动。它知道自己是个 mentor，不是闹钟。'}
            meta="PASSIVE · ON-DEMAND · NO DAEMON LOOP"
          />
          <MfRow
            n={4}
            kill="活在你的编辑器里"
            won="桌面 dock，不抢焦点。"
            body="不是 VSCode 插件、不是 cc sidebar、不是浏览器 tab。Pace 是一只独立的 Electron 小窗，dock 在屏幕边。和 cc 是同事，不是寄生。"
            meta="ELECTRON · FRAMELESS · SIDE-DOCK"
          />
          <MfRow
            n={5}
            kill="卖你订阅"
            won="MIT。下完是你的。"
            body={'开源 MIT。零后端。我们没有 SaaS 转身位，没有 "pro plan" 在 v2 等你。如果哪天我们偷偷加了，把这段截图发到 issues 里。'}
            meta="MIT · OSS · 0 SERVER · 0 PLAN"
            last
          />
        </div>

        {/* Pivot */}
        <div style={D.pivot}>
          <div style={D.pivotEyebrow}>// 去掉这五样，剩下的是什么</div>
          <h1 style={D.pivotH}>
            main 上裸改 3 小时后，<br/>
            <span style={{ color: '#6c7a2c' }}>它问你一句话</span>。
          </h1>
          <p style={D.pivotSub}>
            Pace 不让你列任务，看你已经在做的。它看你的 cc、查你的提交、看你的团队，推断你这周在哪个阶段、谁等着你的下游、要不要先同步。然后开一次口。
          </p>

          {/* Tiny terminal showing what it does — the only "screenshot" */}
          <div style={D.reveal}>
            <div style={D.revealInner}>
              <div style={{ color: '#7a7468', textAlign: 'left' }}>// pace 刚从你机器上看到的，14:32</div>
              <div style={{ textAlign: 'left', marginTop: 10 }}>
                <span style={{ color: '#c8a86a' }}>你的 cc</span>     ─ 8 轮对话，最后停在 <span style={{ color: '#b8d39a' }}>「export 的 error code」</span><br/>
                <span style={{ color: '#c8a86a' }}>你的提交</span>   ─ 在 <span style={{ color: '#d68a7a' }}>main</span> 上改了 12 个文件，0 push，47 分钟没动<br/>
                <span style={{ color: '#c8a86a' }}>你的团队</span>   ─ <span style={{ color: '#b8d39a' }}>Tom</span> 这块点头，下午 14:00 和 16:00 都空<br/>
                <br/>
                <span style={{ color: '#a896ff' }}>pace ▸</span> <span style={{ color: '#f4f1e8' }}>「Tom，我这周一直在写 export，error code</span><br/>
                <span style={{ color: '#a896ff' }}>       </span> <span style={{ color: '#f4f1e8' }}>你那边可能比我清楚——抽 15 分钟，对一下」</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 wow moments */}
        <div style={D.moments}>
          <h2 style={D.momentsH}>三个让人「噢，原来 mentor 该长这样」的瞬间。</h2>
          <p style={D.momentsSub}>不是 demo video。是 Pace 在真用户机器上跑出来的样子。</p>

          <div style={D.momentGrid}>
            <div style={D.moment}>
              <div style={D.momentNum}>01 · 现在</div>
              <div style={D.momentTitle}>不用问，feed 先开口。</div>
              <div style={D.momentBody}>你推的每个 commit，Pace 自动看出你在做什么。「在 main 上裸改 29 个 commit 没 push」——观察卡先于你的自觉。</div>
              <div style={D.momentMock}>
                <span style={{ color: '#7a7468' }}>// 你现在在做什么</span><br/>
                ⊙ <span style={{ color: '#c8a86a' }}>main · 12 个改动</span><br/>
                <br/>
                「你最近 8 轮都在聊 export」<br/>
                「0 push，还没人看过」<br/>
                <span style={{ color: '#a896ff' }}>→ 要不要听我说一句？</span>
              </div>
            </div>

            <div style={D.moment}>
              <div style={D.momentNum}>02 · 问问</div>
              <div style={D.momentTitle}>卡住时，7 条建议先递。</div>
              <div style={D.momentBody}>输入框上面带「main · 12 个改动 · 3 个同事」——Pace 看到的状态先你想到，不用想怎么开口。</div>
              <div style={D.momentMock}>
                <span style={{ color: '#7a7468' }}>// 问之前它已经知道你在哪</span><br/>
                <span style={{ color: '#c8a86a' }}>main · 12 个改动 · 3 个同事</span><br/>
                <br/>
                · 我这周到底在哪个阶段？<br/>
                · 在 main 上裸改到底危不危险？<br/>
                · 这个 commit 被人 review 了吗？<br/>
                · 怎么跟 Tom 开口不尴尬...
              </div>
            </div>

            <div style={D.moment}>
              <div style={D.momentNum}>03 · 团队</div>
              <div style={D.momentTitle}>切到 ta 的视角，把话先说一遍。</div>
              <div style={D.momentBody}>团队里每个人负责什么 Pace 都知道。点「跟 ta 说话」，Pace 用 ta 的口气先回一遍，出错都在见面前。</div>
              <div style={D.momentMock}>
                <span style={{ color: '#7a7468' }}>// 你的团队</span><br/>
                Tom   <span style={{ color: '#7a7468' }}>· 后端 · 这事得他点头</span><br/>
                麦子  <span style={{ color: '#7a7468' }}>· streaming · 他在推进</span><br/>
                林姐  <span style={{ color: '#7a7468' }}>· PM · 要听 ta 拍板</span><br/>
                <br/>
                <span style={{ color: '#a896ff' }}>→ 跟 Tom 说</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 affirmation lines — locked by rule 5 */}
        <div style={{ padding: '128px 0 32px', textAlign: 'center', borderTop: '1px solid #0c0c0a', marginTop: 96 }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11.5, color: '#6c7a2c', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 28 }}>
            // 5 个 NO 之后，4 个 YES
          </div>
          <div style={{ fontFamily: '"Inter Tight", "Inter", sans-serif', fontSize: 72, lineHeight: 1.08, fontWeight: 800, letterSpacing: '-0.03em', color: '#0c0c0a', textWrap: 'pretty' }}>
            它是 mentor。<br/>
            它读你的 cc。<br/>
            它在你电脑里。<br/>
            它告诉你下一步<span style={{ color: '#6c7a2c' }}>找谁</span>、<span style={{ color: '#6c7a2c' }}>话怎么开</span>。
          </div>
        </div>

        {/* Install */}
        <div style={D.install}>
          <div>
            <h2 style={D.installH}>下完是<br/>你的。</h2>
            <p style={D.installSub}>
              5 MB · macOS · Windows · Linux 来日方长。删 app = 全删。Pace 手里没有你任何东西。
            </p>
          </div>
          <div>
            <button style={D.bigBtn}>
              <span style={D.bigBtnAccent}>↓</span>
              <span>get pace</span>
              <span style={{ marginLeft: 'auto', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 400, color: '#a8a89a', letterSpacing: '0.08em' }}>v0.1 · 5 MB</span>
            </button>
            <div style={{ marginTop: 14, fontFamily: '"JetBrains Mono", monospace', fontSize: 11.5, color: '#5c5a4e', letterSpacing: '0.06em' }}>
              brew install pace &nbsp;·&nbsp; cargo install pace &nbsp;·&nbsp; github.com/lll/pace
            </div>
          </div>
        </div>

        <div style={D.footer}>
          <span>pace · 2026</span>
          <span>·</span>
          <span>MIT</span>
          <span>·</span>
          <span>0 telemetry</span>
          <span>·</span>
          <span>0 server</span>
          <span style={{ marginLeft: 'auto' }}>made by people who got tired of their task tracker</span>
        </div>
      </div>
    </div>
  );
}

window.Manifesto = Manifesto;
