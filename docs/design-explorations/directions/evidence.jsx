// Direction 2 · EVIDENCE / DOSSIER
// Cream manilla, index-card metaphor, red stamps, sworn statements.
// Every section is a numbered case: cc + 提交 + 团队 → Pace's inference.
// Pitch: "证据先于建议" — sells the reasoning trail, not the bot.

const evStyles = {
  root: {
    width: '100%',
    background: '#ece4d2',
    color: '#1a1410',
    fontFamily: '"Source Serif 4", Georgia, serif',
    fontSize: 16,
    lineHeight: 1.55,
    padding: 0,
    backgroundImage:
      'radial-gradient(circle at 12% 8%, rgba(120,90,40,0.06), transparent 35%),' +
      'radial-gradient(circle at 88% 90%, rgba(120,90,40,0.05), transparent 35%)',
    position: 'relative',
  },
  // Top docket strip
  docket: {
    background: '#1a1410',
    color: '#ece4d2',
    padding: '14px 56px',
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 11,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
  },
  docketNum: { color: '#c8a86a' },
  docketNav: { display: 'flex', gap: 18, marginLeft: 'auto', alignItems: 'center' },
  docketLink: { color: '#ece4d2', textDecoration: 'none', opacity: 0.7 },
  docketCta: {
    color: '#1a1410', background: '#c8a86a', padding: '6px 12px', borderRadius: 2, letterSpacing: '0.12em',
  },

  // Page padding + ruled margin
  page: { padding: '56px 80px 80px', position: 'relative', maxWidth: 1180, margin: '0 auto' },

  // Header section
  headEyebrow: {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 11.5,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#7a6f5e',
    marginBottom: 22,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  stamp: {
    display: 'inline-flex',
    alignItems: 'center',
    border: '2px solid #b2382b',
    color: '#b2382b',
    padding: '4px 10px',
    transform: 'rotate(-2deg)',
    fontWeight: 700,
    letterSpacing: '0.2em',
    fontSize: 11,
  },
  h1: {
    fontFamily: '"Source Serif 4", Georgia, serif',
    fontWeight: 500,
    fontSize: 76,
    lineHeight: 1.04,
    letterSpacing: '-0.018em',
    margin: '0 0 6px',
    color: '#1a1410',
    textWrap: 'pretty',
    maxWidth: 920,
  },
  h1Em: {
    fontStyle: 'italic',
    fontFamily: '"Instrument Serif", "Source Serif 4", serif',
    color: '#b2382b',
    fontWeight: 400,
  },
  lede: {
    fontFamily: '"Source Serif 4", Georgia, serif',
    fontSize: 19,
    color: '#4a4030',
    lineHeight: 1.45,
    maxWidth: 640,
    marginTop: 18,
    fontStyle: 'italic',
  },
  ledeMono: {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 13,
    color: '#7a6f5e',
    marginTop: 12,
    maxWidth: 640,
    lineHeight: 1.6,
    fontStyle: 'normal',
  },

  // CTA inline with header
  ctaRow: { display: 'flex', gap: 14, marginTop: 30, alignItems: 'center' },
  ctaPrimary: {
    background: '#1a1410',
    color: '#ece4d2',
    padding: '14px 22px',
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 12.5,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    border: 'none',
    cursor: 'pointer',
  },
  ctaSecondary: {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 11.5,
    color: '#7a6f5e',
    letterSpacing: '0.08em',
  },

  // Rule between sections
  rule: { border: 0, borderTop: '1px solid #c9bda4', margin: '64px 0' },

  // Case file label
  caseLabel: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 18,
    marginBottom: 18,
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  },
  caseNum: {
    color: '#b2382b', fontSize: 13, letterSpacing: '0.2em', fontWeight: 700,
  },
  caseSlug: { color: '#7a6f5e', fontSize: 11.5, letterSpacing: '0.16em', textTransform: 'uppercase' },
  caseTitle: {
    fontFamily: '"Source Serif 4", Georgia, serif',
    fontSize: 38,
    fontWeight: 500,
    margin: '4px 0 8px',
    color: '#1a1410',
    letterSpacing: '-0.008em',
    lineHeight: 1.12,
  },
  caseSummary: {
    fontFamily: '"Source Serif 4", Georgia, serif',
    fontStyle: 'italic',
    fontSize: 16,
    color: '#4a4030',
    maxWidth: 640,
    marginBottom: 30,
  },

  // Exhibit index card
  exhibit: {
    background: '#fbf5e4',
    border: '1px solid #d3c6a8',
    boxShadow: '0 1px 0 #d3c6a8, 2px 4px 0 rgba(120,90,40,0.08)',
    padding: '18px 20px 20px',
    position: 'relative',
  },
  exhibitTag: {
    position: 'absolute',
    top: -10,
    left: 16,
    background: '#b2382b',
    color: '#fbf5e4',
    padding: '3px 8px',
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 10.5,
    letterSpacing: '0.2em',
    fontWeight: 700,
  },
  exhibitHead: {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 11.5,
    color: '#7a6f5e',
    letterSpacing: '0.08em',
    margin: '4px 0 12px',
  },
  exhibitBody: {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 12.5,
    lineHeight: 1.6,
    color: '#1a1410',
    background: '#fffaeb',
    padding: '12px 14px',
    border: '1px solid #e3d6b3',
    marginTop: 6,
    minHeight: 156,
  },
  exhibitFoot: {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 10.5,
    color: '#9a8f76',
    marginTop: 10,
    letterSpacing: '0.05em',
  },

  // Pace inference card — the verdict
  verdict: {
    marginTop: 26,
    background: '#1a1410',
    color: '#ece4d2',
    padding: '28px 34px',
    position: 'relative',
  },
  verdictTag: {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 10.5,
    letterSpacing: '0.2em',
    color: '#c8a86a',
    marginBottom: 14,
  },
  verdictBody: {
    fontFamily: '"Source Serif 4", Georgia, serif',
    fontSize: 22,
    lineHeight: 1.45,
    color: '#f7eed8',
    maxWidth: 820,
  },
  verdictSign: {
    fontFamily: '"Source Serif 4", serif',
    fontStyle: 'italic',
    fontSize: 14,
    color: '#a89b78',
    marginTop: 18,
    paddingTop: 14,
    borderTop: '1px solid #2c2418',
    display: 'flex',
    gap: 22,
  },
};

function Exhibit({ tag, head, body, foot }) {
  return (
    <div style={evStyles.exhibit}>
      <div style={evStyles.exhibitTag}>{tag}</div>
      <div style={evStyles.exhibitHead}>{head}</div>
      <pre style={{...evStyles.exhibitBody, margin: 0, whiteSpace: 'pre-wrap', fontFamily: '"JetBrains Mono", ui-monospace, monospace'}}>{body}</pre>
      <div style={evStyles.exhibitFoot}>{foot}</div>
    </div>
  );
}

function Evidence() {
  const D = evStyles;
  return (
    <div style={D.root}>
      <div style={D.docket}>
        <span>Pace</span>
        <span style={D.docketNum}>· dossier vol. 01</span>
        <span style={{ opacity: 0.5 }}>· field mentor for cc + git workflows</span>
        <div style={D.docketNav}>
          <a style={D.docketLink} href="#">docs</a>
          <a style={D.docketLink} href="#">github</a>
          <a style={D.docketCta} href="#">↓ download</a>
        </div>
      </div>

      <div style={D.page}>

        {/* HERO */}
        <div style={D.headEyebrow}>
          <span style={D.stamp}>EXHIBIT</span>
          <span>case files · vol. 01 · admitted as evidence · 2026-05-19</span>
        </div>
        <h1 style={D.h1}>
          main 上裸改<br/>
          3 小时后，<span style={D.h1Em}>它问你一句话</span><span style={{ color: '#b2382b' }}>。</span>
        </h1>
        <p style={D.lede}>
          Pace 不替你猜「下一步该干啥」。它先看你这一周的 cc、查你的提交、看你的团队——再开口。
        </p>
        <p style={D.ledeMono}>
          下面三份 case file 是真用户的 session。每份附原始痕迹 + Pace 的推断 + 它对人说的那句话。术语都幕后化了。
        </p>

        <div style={D.ctaRow}>
          <button style={D.ctaPrimary}>↓ DOWNLOAD · 5 MB</button>
          <span style={D.ctaSecondary}>macOS · Windows · 自带 LLM key · 不传 cc 历史</span>
        </div>

        <hr style={D.rule} />

        {/* CASE 01 — main 上裸改 */}
        <div style={D.caseLabel}>
          <span style={D.caseNum}>CASE · 01</span>
          <span style={D.caseSlug}>main · 12 个改动 · 47 行 · 0 提交</span>
        </div>
        <div style={D.caseTitle}>你这周在做收尾活，<em style={{ fontFamily: '"Instrument Serif", serif', color: '#b2382b' }}>只是还没跟 Tom 对过</em>。</div>
        <p style={D.caseSummary}>
          subject 在 cc 里独自跑了 47 分钟没动 git。Pace 看完那 47 分钟，在第 48 分钟开口。下面是它手里的三样东西。
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginTop: 8 }}>
          <Exhibit
            tag="一 · 你的 CC"
            head="查 8 轮对话"
            body={`「再试一下 streaming」
「现在 export 卡在
   error code」
「我先把 schema 改了」
「等等这个 contract 我
   说了算吗」
「算了我先写」`}
            foot="未上传 · 在你的电脑里"
          />
          <Exhibit
            tag="二 · 你的提交"
            head="main · 12 个未提交改动"
            body={`还没提交的改动：
  src/export.ts
  src/export.test.ts
  schema/v2.json
  api/contract.md
  ...还有 8 个文件
上次提交 47 分钟前`}
            foot="你的项目 · main 分支"
          />
          <Exhibit
            tag="三 · 你的团队"
            head="这事得 Tom 点头"
            body={`Tom   ·  /export  负责人
麦子  ·  /streaming 推进人
你   ·  /contract 拍板人

今天空档：
  Tom · 14:00 – 14:30
  Tom · 16:00 – 17:00`}
            foot="你的团队 · 2 小时前同步"
          />
        </div>

        <div style={D.verdict}>
          <div style={D.verdictTag}>PACE · 告诉你怎么开口</div>
          <div style={D.verdictBody}>
            「Tom，我这一周一直在写 export 这块的接口，发现 error code 的语义你那边可能比我清楚——抽你 15 分钟，对一下，我再继续写。」
          </div>
          <div style={D.verdictSign}>
            <span>你在做的 · 规划阶段，把范围圈出来</span>
            <span>·</span>
            <span>下一步 · 进代码前先跟 Tom 对齐</span>
            <span style={{ marginLeft: 'auto', color: '#7a6f5e' }}>Pace · mentor</span>
          </div>
        </div>

        <hr style={D.rule} />

        {/* CASE 02 — 视角排练 */}
        <div style={D.caseLabel}>
          <span style={D.caseNum}>CASE · 02</span>
          <span style={D.caseSlug}>明天早会 · 3 个同事 · 还没人知道</span>
        </div>
        <div style={D.caseTitle}>见面前，<em style={{ fontFamily: '"Instrument Serif", serif', color: '#b2382b' }}>先和 ta 的视角排练一遍</em>。</div>
        <p style={D.caseSummary}>
          subject 明天早会要 demo 这一周的 export 改动。Pace 把同一句话用三个同事的口气演一遍——出错都在见面前出。
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28, alignItems: 'flex-start', marginTop: 8 }}>
          <div>
            <div style={{ ...D.exhibitTag, position: 'static', display: 'inline-block', marginBottom: 14 }}>你准备说的那句</div>
            <pre style={{ ...D.exhibitBody, margin: 0, fontSize: 13, minHeight: 'auto' }}>{`「我这周把 export
的 contract 全部
重写了一遍，
顺便加了 streaming。」`}</pre>
            <div style={D.exhibitFoot}>早会草稿 · 未说出口</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              { name: 'Tom', role: '后端 · 这事得他点头', voice: '「contract 你和谁对过了？我的 v2 还在 dev 上跑，下游全是 401。」', risk: '接口对不上', color: '#b2382b' },
              { name: '麦子', role: 'streaming · 这块 ta 在推进', voice: '「streaming 这块我上周才合的 main，你直接覆盖了 backpressure 逻辑没？」', risk: '默默改掉了别人的活', color: '#b2382b' },
              { name: '林姐', role: 'PM · 这事要听 ta 拍板', voice: '「这个改动我没在 RFC 里见过。是你自己决定要做的还是漏了对齐？」', risk: '没人知道你在做', color: '#b2382b' },
            ].map(p => (
              <div key={p.name} style={{ background: '#fbf5e4', border: '1px solid #d3c6a8', padding: '16px 16px 18px', position: 'relative' }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11.5, color: '#7a6f5e', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5, color: '#9a8f76', marginBottom: 14, letterSpacing: '0.04em' }}>{p.role}</div>
                <div style={{ fontFamily: '"Source Serif 4", serif', fontStyle: 'italic', fontSize: 15.5, lineHeight: 1.4, color: '#1a1410', marginBottom: 16, textWrap: 'pretty' }}>
                  {p.voice}
                </div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5, color: p.color, letterSpacing: '0.14em', borderTop: '1px solid #d3c6a8', paddingTop: 10 }}>{p.risk}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...D.verdict, marginTop: 32 }}>
          <div style={D.verdictTag}>PACE · 告诉你怎么开口</div>
          <div style={D.verdictBody}>
            「你这周做的事和 Tom 的 v2 是同一块地。先在早会之前给他一行：‘export 的接口我动了，14:00 看你 5 分钟？’——别等他从 demo 里听到。」
          </div>
          <div style={D.verdictSign}>
            <span>你在做的 · 推进阶段，该走出去对齐了</span>
            <span>·</span>
            <span>下一步 · 早会前先 ping Tom</span>
            <span style={{ marginLeft: 'auto', color: '#7a6f5e' }}>Pace · mentor</span>
          </div>
        </div>

        <hr style={D.rule} />

        {/* CASE 03 — Pace 不替你决策 */}
        <div style={D.caseLabel}>
          <span style={D.caseNum}>CASE · 03</span>
          <span style={D.caseSlug}>boundary · what pace will not do</span>
        </div>
        <div style={D.caseTitle}>它不替你决策，<em style={{ fontFamily: '"Instrument Serif", serif', color: '#b2382b' }}>它把决策摆给你看</em>。</div>
        <p style={D.caseSummary}>
          mentor 和 boss 不是同一份工作。Pace 给你阶段判断 + 选项 + 措辞，不下命令。下面是同一个场景的两种回答。
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          <div style={{ background: '#fbf5e4', border: '1px solid #d3c6a8', padding: '28px 28px 32px', position: 'relative' }}>
            <div style={{ ...D.exhibitTag, position: 'static', display: 'inline-block', marginBottom: 16, background: '#7a6f5e' }}>NOT THIS</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11.5, color: '#7a6f5e', marginBottom: 14, letterSpacing: '0.08em' }}>BOSS · 替你拍板</div>
            <div style={{ fontFamily: '"Source Serif 4", serif', fontSize: 19, lineHeight: 1.45, color: '#7a6f5e', textDecoration: 'line-through' }}>
              「你应该现在去 ping Tom。已经卡 3 小时了，再不开口就是浪费时间。」
            </div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#9a8f76', marginTop: 22, lineHeight: 1.6 }}>
              ↑ 替你判断「应该」 / 替你估算时间 / 替你定义浪费<br/>
              这是 task tracker 加 boss 干的事。
            </div>
          </div>

          <div style={{ background: '#1a1410', color: '#ece4d2', padding: '28px 28px 32px', position: 'relative' }}>
            <div style={{ ...D.exhibitTag, position: 'static', display: 'inline-block', marginBottom: 16, color: '#1a1410', background: '#c8a86a' }}>THIS</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11.5, color: '#c8a86a', marginBottom: 14, letterSpacing: '0.08em' }}>PACE · 告诉你该找谁</div>
            <div style={{ fontFamily: '"Source Serif 4", serif', fontSize: 19, lineHeight: 1.45, color: '#f7eed8' }}>
              「你在 main 上写了 3 小时没提交。这块得 Tom 点头，他下午有两个空档。<em style={{ color: '#c8a86a' }}>去开口 / 再写一会 / 让我先帮你列下要问的</em>——你来挑。」
            </div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#a89b78', marginTop: 22, lineHeight: 1.6 }}>
              ↑ 你在做的 + 证据 + 选项 + 话怎么开<br/>
              哪个是你的事，是你的事。
            </div>
          </div>
        </div>

        <hr style={D.rule} />

        {/* SWORN STATEMENT — 5 promises as numbered declarations */}
        <div style={D.caseLabel}>
          <span style={D.caseNum}>SWORN · 05</span>
          <span style={D.caseSlug}>declarations · binding for v1</span>
        </div>
        <div style={D.caseTitle}>5 件不可撤销的事。</div>
        <p style={D.caseSummary}>
          以下五条 v1 不会让步。改任意一条意味着 Pace 不再是 Pace。
        </p>

        <div style={{ marginTop: 8 }}>
          {[
            ['01', '看问题的角度可以换，但首版只交一套', '项目管理的常识是默认。OKR / Agile / 你自己定一套都能接。但一次只做透一个。'],
            ['02', '独立桌面小窗', '不进 IDE、不进浏览器 tab、不抢 cc 焦点。dock 在屏幕边，看一眼就走。'],
            ['03', '你按「看我」它手 grep', '没有 polling，没有 watcher。不看的时候它不费你 token。你决定开不开。'],
            ['04', '等你看它一眼，不主动跳出来', '不推送、不弹窗、不周一早上“Good morning”。它是 mentor，不是闹钟。'],
            ['05', '全本地开源，你的 LLM key', 'MIT · 零后端 · 你自己插 key。我们手里不会留你任何东西，也不预留 SaaS 转身位。'],
          ].map(([n, t, b], i) => (
            <div key={n} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 360px', gap: 32, padding: '20px 0', borderTop: i === 0 ? '1px solid #1a1410' : '1px solid #c9bda4' }}>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: '#b2382b', fontWeight: 700, letterSpacing: '0.16em' }}>{n}.</div>
              <div style={{ fontFamily: '"Source Serif 4", serif', fontSize: 28, fontWeight: 500, letterSpacing: '-0.005em', lineHeight: 1.15 }}>{t}</div>
              <div style={{ fontFamily: '"Source Serif 4", serif', fontSize: 14.5, lineHeight: 1.55, color: '#4a4030', fontStyle: 'italic' }}>{b}</div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #1a1410', height: 0 }}></div>
        </div>

        {/* 4 affirmation lines — locked by rule 5 */}
        <div style={{ marginTop: 64, padding: '48px 0 8px', textAlign: 'center' }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5, color: '#7a6f5e', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24 }}>
            一句话讲完
          </div>
          <div style={{ fontFamily: '"Source Serif 4", serif', fontSize: 40, lineHeight: 1.35, color: '#1a1410', textWrap: 'pretty' }}>
            它是 mentor。<br/>
            它读你的 cc。<br/>
            它在你电脑里。<br/>
            它告诉你下一步<em style={{ fontFamily: '"Instrument Serif", serif', color: '#b2382b' }}>找谁</em>、<em style={{ fontFamily: '"Instrument Serif", serif', color: '#b2382b' }}>话怎么开</em>。
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: 64, display: 'flex', alignItems: 'flex-end', gap: 28, borderTop: '2px solid #1a1410', paddingTop: 28 }}>
          <div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5, color: '#7a6f5e', letterSpacing: '0.16em', marginBottom: 10 }}>本地优先 · 你的 LLM key</div>
            <button style={{ ...D.ctaPrimary, fontSize: 14, padding: '16px 26px' }}>↓ DOWNLOAD PACE</button>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#7a6f5e', marginTop: 10 }}>5 MB · macOS / Windows · cc 历史不上传 · 仓库不读</div>
          </div>
          <div style={{ marginLeft: 'auto', fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5, color: '#7a6f5e', textAlign: 'right', letterSpacing: '0.08em', lineHeight: 2 }}>
            本地优先 · 你的电脑<br/>
            docs · github · changelog<br/>
            MIT · 零后端 · 零上传
          </div>
          <div style={{ ...D.stamp, transform: 'rotate(4deg)', fontSize: 13, padding: '8px 14px' }}>SIGNED</div>
        </div>
      </div>
    </div>
  );
}

window.Evidence = Evidence;
