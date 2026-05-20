// Direction 1 · LOGBOOK
// The landing IS a Pace session printed to a terminal. Dark, mono-only.
// No screenshot frames — the product appears as its own log output.
// Tagline lands mid-stream as a Pace mentor card (the only typeface break).

const logbookStyles = {
  root: {
    width: '100%',
    background: '#0c0c0f',
    color: '#d8d2c4',
    fontFamily: '"JetBrains Mono", ui-monospace, "SF Mono", monospace',
    fontSize: 13,
    lineHeight: 1.7,
    padding: 0,
    overflow: 'hidden',
  },
  // Faux terminal title bar
  bar: {
    height: 36,
    background: '#15151a',
    borderBottom: '1px solid #1e1e25',
    padding: '0 18px',
    display: 'flex',
    alignItems: 'center',
    fontSize: 11.5,
    color: '#7a7468',
    letterSpacing: '0.04em',
  },
  dots: { display: 'flex', gap: 6, marginRight: 14 },
  dot: (c) => ({ width: 11, height: 11, borderRadius: 99, background: c }),
  barTitle: { flex: 1, textAlign: 'center', fontFamily: 'inherit' },
  barNav: { display: 'flex', gap: 18, color: '#9a9385' },
  navLink: { color: '#9a9385', textDecoration: 'none' },
  navActive: { color: '#e7e1d3', textDecoration: 'none', borderBottom: '1px solid #c8a86a', paddingBottom: 2 },

  // Stream container
  stream: { padding: '36px 64px 60px', maxWidth: 1180, margin: '0 auto' },

  // One log row: timestamp · level · payload
  row: { display: 'grid', gridTemplateColumns: '76px 60px 1fr', columnGap: 18, alignItems: 'baseline', padding: '1px 0' },
  ts: { color: '#4d4a45', fontSize: 11.5, letterSpacing: '0.02em' },
  lvl: (c) => ({ color: c, fontSize: 11.5, letterSpacing: '0.08em' }),
  payload: { color: '#d8d2c4' },
  dim: { color: '#7a7468' },
  brightDim: { color: '#9a9385' },
  gold: { color: '#c8a86a' },
  green: { color: '#a4c08a' },
  red: { color: '#d68a7a' },
  purple: { color: '#a896ff' },

  // Spacer line for visual rhythm
  divider: { padding: '10px 0', color: '#2a2a32', display: 'grid', gridTemplateColumns: '76px 60px 1fr', columnGap: 18 },

  // The big inline Pace mentor card (where the tagline lives)
  mentorCard: {
    margin: '34px 0 34px 154px',
    border: '1px solid #2e2a3f',
    borderLeft: '2px solid #a896ff',
    background: 'linear-gradient(180deg,#171425 0%,#13111e 100%)',
    borderRadius: 6,
    padding: '24px 28px 26px',
    maxWidth: 820,
    boxShadow: '0 0 0 1px rgba(168,150,255,0.04), 0 24px 60px rgba(0,0,0,0.5)',
  },
  mentorHead: {
    fontSize: 11,
    color: '#a896ff',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    marginBottom: 14,
    display: 'flex',
    gap: 16,
    alignItems: 'center',
  },
  mentorDot: { width: 7, height: 7, borderRadius: 99, background: '#a896ff', boxShadow: '0 0 12px #a896ff' },
  // Tagline breaks the mono rhythm — only place we use serif
  taglineMain: {
    fontFamily: '"Source Serif 4", Georgia, serif',
    fontStyle: 'italic',
    fontSize: 38,
    lineHeight: 1.18,
    color: '#f4eedd',
    letterSpacing: '-0.005em',
    margin: '4px 0 12px',
    fontWeight: 400,
    textWrap: 'pretty',
  },
  taglineSub: {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    color: '#9a9385',
    fontSize: 13,
    lineHeight: 1.6,
    margin: '14px 0 0',
    maxWidth: 620,
  },
  taglineMeta: {
    marginTop: 22,
    paddingTop: 16,
    borderTop: '1px solid #26223a',
    color: '#7a7468',
    fontSize: 11,
    display: 'flex',
    gap: 22,
  },

  // Inline asks / answers
  ask: { color: '#c8a86a' },
  answer: { color: '#d8d2c4' },

  // CTA chunk near the end
  ctaWrap: { margin: '32px 0 0 154px', maxWidth: 820 },
  ctaInput: {
    background: '#0a0a0c',
    border: '1px solid #2e2a3f',
    borderRadius: 6,
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    color: '#d8d2c4',
    fontSize: 14,
  },
  ctaBtn: {
    marginLeft: 'auto',
    background: '#c8a86a',
    color: '#1a1610',
    padding: '8px 14px',
    borderRadius: 4,
    fontWeight: 600,
    fontSize: 12.5,
    letterSpacing: '0.04em',
    cursor: 'pointer',
  },
};

function LogRow({ ts, lvl, lvlColor, children }) {
  return (
    <div style={logbookStyles.row}>
      <span style={logbookStyles.ts}>{ts}</span>
      <span style={logbookStyles.lvl(lvlColor)}>{lvl}</span>
      <span style={logbookStyles.payload}>{children}</span>
    </div>
  );
}

function Divider({ note }) {
  return (
    <div style={logbookStyles.divider}>
      <span></span><span></span>
      <span style={{ color: '#3a3a44', letterSpacing: '0.08em' }}>{note}</span>
    </div>
  );
}

function Logbook() {
  const D = logbookStyles;
  return (
    <div style={D.root}>
      {/* terminal-style top bar doubling as nav */}
      <div style={D.bar}>
        <div style={D.dots}>
          <span style={D.dot('#5a5450')}></span>
          <span style={D.dot('#5a5450')}></span>
          <span style={D.dot('#5a5450')}></span>
        </div>
        <span style={D.barTitle}>~/pace/landing/session.jsonl &nbsp; · &nbsp; tail -f</span>
        <div style={D.barNav}>
          <a style={D.navLink} href="#">docs</a>
          <a style={D.navLink} href="#">github</a>
          <a style={D.navActive} href="#">download ↓</a>
        </div>
      </div>

      <div style={D.stream}>
        <Divider note="// 现在 · 你的电脑 · 在 ~/lll/pace 这个项目" />

        <LogRow ts="00:00:04" lvl="你" lvlColor="#8a8478">
          <span>「我现在干啥来着」</span>
        </LogRow>
        <LogRow ts="00:00:04" lvl="pace" lvlColor="#a896ff">
          <span style={D.brightDim}>看一眼你的 cc</span> <span style={D.dim}>→ 8 轮对话，最后停在 export 的 error code</span>
        </LogRow>
        <LogRow ts="00:00:05" lvl="pace" lvlColor="#a896ff">
          <span style={D.brightDim}>看一眼你的提交</span> <span style={D.dim}>→ 在 </span><span style={D.red}>main</span><span style={D.dim}> 上改了 12 个文件，47 分钟没提交了</span>
        </LogRow>
        <LogRow ts="00:00:05" lvl="pace" lvlColor="#a896ff">
          <span style={D.brightDim}>看一眼你的团队</span> <span style={D.dim}>→ 有 2 个人在等这块的下游</span>
        </LogRow>

        <Divider note="// — 47 分钟前你在 cc 里开了一个新方向，没动 git，自己一路写到现在 —" />

        <LogRow ts="00:00:08" lvl="推断" lvlColor="#c8a86a">
          <span style={D.dim}>你在做的 =</span> <span style={D.gold}>规划阶段，把 export 的范围圈出来</span>
        </LogRow>
        <LogRow ts="00:00:08" lvl="推断" lvlColor="#c8a86a">
          <span style={D.dim}>风险 =</span> <span style={D.red}>没和 Tom 对齐就把接口写死了</span>
        </LogRow>
        <LogRow ts="00:00:08" lvl="推断" lvlColor="#c8a86a">
          <span style={D.dim}>下一步 =</span> <span style={D.green}>先抽 Tom 15 分钟对 contract，再继续</span>
        </LogRow>

        {/* THE TAGLINE — embedded as Pace's mentor output card */}
        <div style={D.mentorCard}>
          <div style={D.mentorHead}>
            <span style={D.mentorDot}></span>
            <span>pace · mentor</span>
            <span style={{ color: '#5a5470', marginLeft: 'auto' }}>思考 29 秒 · 140 字</span>
          </div>
          <div style={D.taglineMain}>
            main 上裸改 3 小时后，<br/>
            <span style={{ color: '#a896ff' }}>它问你一句话</span>。
          </div>
          <div style={D.taglineSub}>
            Pace 不让你列任务 — 它看你的 cc、查你的提交、看你的团队，<br/>
            告诉你下一步找谁、话怎么开。<br/>
            <span style={{ color: '#c8a86a' }}>下面这一段，是它今天给某个在 main 上裸改 3 小时的人开的口。</span>
          </div>
          <div style={D.taglineMeta}>
            <span>查 8 轮对话</span>
            <span>12 个未提交改动</span>
            <span>2 个人在等下游</span>
          </div>
        </div>

        <Divider note="// — Pace 今天实际说出口的那句话，原样 —" />

        <LogRow ts="00:00:11" lvl="pace" lvlColor="#a896ff">
          <span style={D.purple}>「</span>Tom，我这一周一直在写 export 这块的接口，<br/>
        </LogRow>
        <LogRow ts="" lvl="" lvlColor="#a896ff">
          <span></span>发现 error code 的语义你那边可能比我清楚——
        </LogRow>
        <LogRow ts="" lvl="" lvlColor="#a896ff">
          <span></span>抽你 15 分钟，对一下接口形状，我再继续写。<span style={D.purple}>」</span>
        </LogRow>
        <LogRow ts="00:00:11" lvl="meta" lvlColor="#8a8478">
          <span style={D.dim}>↑ 这就是 Pace 的全部表面。没仪表盘，没每日提醒。</span>
        </LogRow>

        <Divider note="" />
        <Divider note="// :: 第二段 — 凭啥这么说？抓三件东西给你看" />

        <LogRow ts="00:42:18" lvl="你" lvlColor="#8a8478">
          <span>「凭啥你这么说」</span>
        </LogRow>
        <LogRow ts="00:42:19" lvl="pace" lvlColor="#a896ff">
          <span style={D.brightDim}>把证据摆出来</span>
        </LogRow>

        <div style={{ marginLeft: 154, margin: '14px 0 24px 154px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, maxWidth: 820 }}>
          {[
            { tag: '一 · 你的 cc', title: '查 8 轮对话', body: '你和 cc 聊了 APL、聊了 streaming，最后停在 error code 怎么编。', file: '8 轮 · 未上传' },
            { tag: '二 · 你的提交', title: '12 个未提交改动', body: '没 push、没新分支。上次提交之后你都在 main 上自己跑。', file: 'main · 12 个文件 · 47 行改动' },
            { tag: '三 · 你的团队', title: 'Tom · 这事得他点头', body: 'Tom 负责 /export 这块，本周日历还有两个空档可以约。', file: '你的团队 · 3 个人' },
          ].map((c, i) => (
            <div key={i} style={{ background: '#101015', border: '1px solid #1e1e26', borderRadius: 4, padding: '14px 16px' }}>
              <div style={{ color: '#c8a86a', fontSize: 10.5, letterSpacing: '0.16em', marginBottom: 8 }}>{c.tag}</div>
              <div style={{ color: '#e7e1d3', fontSize: 13, marginBottom: 6 }}>{c.title}</div>
              <div style={{ color: '#9a9385', fontSize: 12, lineHeight: 1.55, marginBottom: 12 }}>{c.body}</div>
              <div style={{ color: '#5a5450', fontSize: 11 }}>{c.file}</div>
            </div>
          ))}
        </div>

        <LogRow ts="00:42:22" lvl="pace" lvlColor="#a896ff">
          <span style={D.dim}>↑ 没有评分，没有推理过程 — 只把凭据里重要的那几项摮出来。</span>
        </LogRow>

        <Divider note="" />
        <Divider note="// :: 第三段 — Pace 不是什么" />

        <div style={{ margin: '8px 0 24px 154px', maxWidth: 820, fontSize: 12.8 }}>
          {[
            ['不是', 'task tracker / 看板', '不让你列待办。看你已经在做的，告诉你下一步。'],
            ['不是', 'chat 替代品', '不闲聊。每次开口都先翻你的 cc、提交、团队。'],
            ['不是', 'IDE 插件 / cc sidebar', '独立桌面小窗。不进编辑器，不抢 cc 焦点。'],
          ].map(([lvl, expr, why], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 240px 1fr', gap: 18, padding: '12px 0', borderBottom: '1px dashed #1e1e26' }}>
              <span style={{ color: '#d68a7a', letterSpacing: '0.1em' }}>× {lvl}</span>
              <span style={{ color: '#e7e1d3' }}>{expr}</span>
              <span style={{ color: '#9a9385' }}>{why}</span>
            </div>
          ))}
        </div>

        <Divider note="" />
        <Divider note="// :: 第四段 — 三个「噢，mentor 该长这样」的瞬间" />

        <div style={{ margin: '8px 0 28px 154px', maxWidth: 820, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[
            { n: '01', title: '不用问，feed 先开口', body: '你 push 的每个 commit，Pace 自动看出你在做什么。「在 main 上裸改，29 个 commit 没 push」——观察卡先你而出。' },
            { n: '02', title: '卡住时，7 条建议先递', body: '输入框上面带「main · 12 个改动 · 3 个人在等」——Pace 看到的状态先你想到，不用想怎么开口。' },
            { n: '03', title: '切到 ta 的视角，把话先说一遍', body: '团队里每个人 Pace 都知道他负责什么。点「跟 ta 说话」，Pace 用 ta 的口气先回一遍。' },
          ].map(c => (
            <div key={c.n} style={{ background: '#101015', border: '1px solid #1e1e26', borderRadius: 4, padding: '18px 18px 22px' }}>
              <div style={{ fontFamily: '"Source Serif 4", serif', fontStyle: 'italic', fontSize: 28, color: '#c8a86a', marginBottom: 16 }}>{c.n}</div>
              <div style={{ color: '#e7e1d3', fontSize: 14, marginBottom: 8 }}>{c.title}</div>
              <div style={{ color: '#9a9385', fontSize: 12.5, lineHeight: 1.6 }}>{c.body}</div>
            </div>
          ))}
        </div>

        <Divider note="" />
        <Divider note="// :: 第五段 — 它是什么" />

        <div style={{ margin: '20px 0 28px 154px', maxWidth: 820 }}>
          <div style={{ fontFamily: '"Source Serif 4", serif', fontSize: 30, lineHeight: 1.5, color: '#f4eedd', textWrap: 'pretty' }}>
            它是 mentor。<br/>
            它读你的 cc。<br/>
            它在你电脑里。<br/>
            它告诉你下一步<span style={{ color: '#a896ff' }}>找谁</span>、<span style={{ color: '#a896ff' }}>话怎么开</span>。
          </div>
        </div>

        <Divider note="// :: 第六段 — 5 件不变的事" />

        <div style={{ margin: '8px 0 24px 154px', maxWidth: 820, color: '#d8d2c4', fontSize: 13, lineHeight: 1.85 }}>
          {[
            ['看问题的角度', '做项目的常识 — 你也可以换 OKR / 自己定一套'],
            ['在哪', '桌面小窗 · 不进 IDE · 不抢 cc 焦点'],
            ['什么时候读', '你按下「看我」它才动 · 不后台常驻'],
            ['怎么说', '等你看它一眼 · 不弹窗 · 不周一早上提醒'],
            ['怎么发', 'MIT 开源 · 零后端 · 你的 LLM key · 5 MB'],
          ].map(([k, v], i) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 24, padding: '8px 0', borderBottom: i === 4 ? 'none' : '1px dashed #1e1e26' }}>
              <span style={{ color: '#c8a86a' }}>{k}</span>
              <span style={{ color: '#9a9385' }}>{v}</span>
            </div>
          ))}
        </div>

        <Divider note="" />
        <Divider note="// :: install" />

        <div style={D.ctaWrap}>
          <div style={D.ctaInput}>
            <span style={{ color: '#c8a86a' }}>$</span>
            <span style={{ color: '#d8d2c4' }}>brew install pace</span>
            <span style={{ color: '#5a5450', marginLeft: 10 }}># 5 MB · 本地优先 · 0 处上传</span>
            <span style={D.ctaBtn}>↓ download .dmg / .exe</span>
          </div>
          <div style={{ display: 'flex', gap: 26, color: '#5a5450', fontSize: 11.5, marginTop: 14, paddingLeft: 4 }}>
            <span>本地优先</span>
            <span>·</span>
            <span>你的 LLM key</span>
            <span>·</span>
            <span>被动应答</span>
            <span>·</span>
            <span>桌面 dock</span>
            <span>·</span>
            <span>MIT</span>
            <span style={{ marginLeft: 'auto' }}>~/pace/landing/session.jsonl · EOF</span>
          </div>
        </div>
      </div>
    </div>
  );
}

window.Logbook = Logbook;
