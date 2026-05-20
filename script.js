// Pace · landing — interaction
// On-theme motion: scroll progress, reveal stagger, verdict stamp,
// thinking counters, live readout typewriter, copy CLI.
// Respects prefers-reduced-motion and avoids layout thrash.

(function () {
  'use strict';

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── v3.5 P1 · Lenis 整页惯性滚动 ─────────────────────────────────────
  // CDN script loaded with defer in <head>. Lenis is透明代理 window.scroll —
  // 现有 IntersectionObserver / scroll handlers 不需要改动。
  // reduced-motion: 不初始化, 走原生滚动 (没有 lenis 全局).
  if (!prefersReduced && typeof window.Lenis === 'function') {
    try {
      var lenis = new window.Lenis({
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      });
      window.lenis = lenis; // expose for review verification
      function lenisRaf(t) { lenis.raf(t); requestAnimationFrame(lenisRaf); }
      requestAnimationFrame(lenisRaf);
    } catch (e) { /* Lenis 初始化失败不致命, 退化到原生滚动 */ }
  }

  // ─── Mark targets for reveal & assign stagger indices ───────────────
  // Each "group" gets its own per-child --reveal-d so siblings stagger
  // independently (exhibits within a case, voices within a row, etc).
  function tagReveal(selector, baseDelayMs, stepMs) {
    var nodes = document.querySelectorAll(selector);
    nodes.forEach(function (n, i) {
      n.setAttribute('data-reveal', '');
      n.style.setProperty('--reveal-d', (baseDelayMs + i * stepMs) / 1000 + 's');
    });
  }

  // Hero is animated by CSS keyframes on load (frags); don't re-reveal it.
  tagReveal('.case-head', 0, 0);
  tagReveal('.case .exhibits .exhibit', 80, 90);
  tagReveal('.rehearsal-subject', 0, 0);
  tagReveal('.rehearsal-voices .voice', 80, 90);
  tagReveal('.comparison .compare', 0, 100);
  tagReveal('.verdict', 220, 0);
  tagReveal('.promise', 0, 60);
  tagReveal('.affirmation-body', 0, 0);
  tagReveal('.download-text', 0, 0);
  tagReveal('.download-actions', 100, 0);

  // ─── IntersectionObserver-driven reveal + side effects ───────────────
  if (!prefersReduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-in');

        // Verdict: trigger thinking counters when it lands in view
        if (el.classList.contains('verdict')) {
          el.querySelectorAll('[data-count-to]').forEach(function (counter) {
            animateCounter(counter, parseInt(counter.getAttribute('data-count-to'), 10) || 0, 1400);
          });
        }
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

    document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
  } else {
    // Reduced motion or no IO: flip everything on immediately.
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
    document.querySelectorAll('[data-count-to]').forEach(function (el) {
      el.textContent = el.getAttribute('data-count-to');
    });
  }

  // ─── Counter (number ticker) ────────────────────────────────────────
  function animateCounter(el, to, durMs) {
    if (prefersReduced) { el.textContent = String(to); return; }
    var from = parseInt(el.textContent, 10) || 0;
    var start = performance.now();
    function tick(t) {
      var p = Math.min(1, (t - start) / durMs);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = String(Math.round(from + (to - from) * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ─── Docket scroll progress + shadow state + dossier strap ─────────
  var docket = document.querySelector('.docket');
  var docketProg = document.querySelector('.docket-progress');
  var dossierStrap = document.querySelector('.dossier-strap');
  var docRoot = document.documentElement;
  var lastScrollUpdate = 0;
  function onScroll() {
    var now = performance.now();
    // Throttle to ~60fps without queueing a backlog
    if (now - lastScrollUpdate < 14) return;
    lastScrollUpdate = now;

    var sy = window.scrollY || window.pageYOffset || 0;
    var max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
    var pct = Math.max(0, Math.min(1, sy / max));

    if (docket) {
      if (sy > 8) docket.classList.add('is-scrolled');
      else docket.classList.remove('is-scrolled');
    }
    if (docketProg) {
      docketProg.style.transform = 'scaleX(' + pct.toFixed(4) + ')';
    }
    // Dossier binding strap — set a CSS var on :root so the strap (and any
    // future scroll-driven element) can read it without a queryselector.
    if (dossierStrap) {
      docRoot.style.setProperty('--scroll-pct', pct.toFixed(4));
    }
  }
  if (docket || docketProg || dossierStrap) {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  // ─── Case watermark · slide-in trigger ──────────────────────────────
  // Inject a real .case-watermark span (pseudo-elements can render inconsistently)
  // and slide it in when each case enters the viewport.
  document.querySelectorAll('.case[data-case-num]').forEach(function (c) {
    if (c.querySelector('.case-watermark')) return;
    var w = document.createElement('span');
    w.className = 'case-watermark';
    w.setAttribute('aria-hidden', 'true');
    w.textContent = 'CASE ' + c.getAttribute('data-case-num');
    c.insertBefore(w, c.firstChild);
  });

  if (!prefersReduced && 'IntersectionObserver' in window) {
    var caseIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('case-in');
          caseIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -4% 0px' });
    document.querySelectorAll('.case[data-case-num]').forEach(function (el) {
      caseIO.observe(el);
    });
  } else {
    document.querySelectorAll('.case[data-case-num]').forEach(function (el) {
      el.classList.add('case-in');
    });
  }

  // ─── Live readout · multi-line streaming console ───────────────────
  var streamEl = document.querySelector('[data-stream]');
  if (streamEl && !prefersReduced) {
    // Each event = { ts, tag, msg } — tag is one of read / infer / suggest.
    var events = [
      { tag: 'cc.read',     msg: '8 轮对话，最后停在 export 的 error code' },
      { tag: 'git.read',    msg: 'main · 12 个改动 · 47 行 · 0 push' },
      { tag: 'team.read',   msg: 'Tom 是 /export 负责人，今天 14:00 有空' },
      { tag: 'pace.infer',  msg: '你在做规划阶段，还没和 Tom 对过' },
      { tag: 'pace.suggest',msg: '抽 15 分钟对一下，再继续写' },
      { tag: 'pace.idle',   msg: '等你看一眼' },
    ];

    var MAX_LINES = 3;
    var eIdx = 0;
    var lineSeq = 0;

    function ts(offsetSec) {
      var d = new Date(Date.now() - offsetSec * 1000);
      var h = String(d.getHours()).padStart(2, '0');
      var m = String(d.getMinutes()).padStart(2, '0');
      var s = String(d.getSeconds()).padStart(2, '0');
      return h + ':' + m + ':' + s;
    }

    function pushLine(ev) {
      // Add a new line at bottom; fade out the oldest if past max.
      var line = document.createElement('div');
      line.className = 'readout-line';
      line.dataset.seq = String(++lineSeq);

      var tsEl = document.createElement('span');
      tsEl.className = 'readout-ts';
      tsEl.textContent = ts(0);

      var tagEl = document.createElement('span');
      tagEl.className = 'readout-tag';
      tagEl.textContent = ev.tag;

      var msgEl = document.createElement('span');
      msgEl.className = 'readout-msg';
      msgEl.textContent = '';

      var caretEl = document.createElement('span');
      caretEl.className = 'readout-msg-caret';
      caretEl.textContent = '▮';

      line.appendChild(tsEl);
      line.appendChild(tagEl);
      line.appendChild(msgEl);
      line.appendChild(caretEl);
      streamEl.appendChild(line);

      // Type the message char by char
      var full = ev.msg;
      var i = 0;
      function type() {
        if (i >= full.length) {
          // Once done, drop the caret on this line; keep it on the newest only.
          line.querySelectorAll('.readout-msg-caret').forEach(function (c, idx, all) {
            if (idx < all.length) c.remove();
          });
          return;
        }
        msgEl.textContent = full.slice(0, ++i);
        var jitter = 22 + Math.random() * 24;
        setTimeout(type, jitter);
      }
      // Remove caret from older lines (only newest carries the cursor)
      streamEl.querySelectorAll('.readout-line:not(:last-child) .readout-msg-caret')
        .forEach(function (c) { c.remove(); });
      type();

      // Fade out + remove the oldest line if we've exceeded MAX_LINES
      var lines = streamEl.querySelectorAll('.readout-line');
      if (lines.length > MAX_LINES) {
        var stale = lines[0];
        stale.setAttribute('data-fading', '');
        setTimeout(function () {
          if (stale.parentNode) stale.parentNode.removeChild(stale);
        }, 560);
      }
    }

    function loop() {
      pushLine(events[eIdx]);
      eIdx = (eIdx + 1) % events.length;
      // Vary cadence: shorter for reads, longer for inferences
      var delay = events[(eIdx) % events.length].tag.indexOf('pace.') === 0 ? 2400 : 1700;
      setTimeout(loop, delay);
    }
    // Kick off after the hero entry settles
    setTimeout(loop, 1900);
  } else if (streamEl) {
    // Reduced motion: show a single static summary line (skip animation)
    streamEl.innerHTML =
      '<div class="readout-line" style="opacity:1; transform: none; animation: none;">' +
        '<span class="readout-ts">' + (new Date().toTimeString().slice(0,8)) + '</span>' +
        '<span class="readout-tag">pace.suggest</span>' +
        '<span class="readout-msg">抽 Tom 15 分钟对一下 contract，再继续写</span>' +
      '</div>';
  }

  // ─── Copy CLI command ───────────────────────────────────────────────
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      var label = btn.textContent;
      var done = function () {
        btn.setAttribute('data-copied', 'true');
        btn.textContent = '已复制';
        setTimeout(function () {
          btn.removeAttribute('data-copied');
          btn.textContent = label;
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else { fallback(); }
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* noop */ }
        document.body.removeChild(ta);
      }
    });
  });

  // ─── Platform-aware download label (cosmetic only) ──────────────────
  try {
    var ua = (navigator.userAgent || '').toLowerCase();
    var isMac = /mac|iphone|ipad/.test(ua);
    var isWin = /windows|win64|win32/.test(ua);
    if (isWin && !isMac) {
      var macBtn = document.querySelector('[data-platform="mac"]');
      if (macBtn) {
        var label = macBtn.querySelector('span:nth-child(2)');
        if (label) label.textContent = 'Pace · Windows';
      }
      var winBtn = document.querySelector('[data-platform="win"]');
      if (winBtn) winBtn.textContent = '↓ macOS';
    }
  } catch (e) { /* fail silently */ }

  // ─── Footer year (if any) ───────────────────────────────────────────
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ─── v3.2 · F · section stamps ("已读" / "归档" / "复核" / "存档") ────
  // Inject a small round stamp into the top-left of each major section.
  // Stamp pops in when section crosses ~14% into viewport.
  var sectionStampMap = [
    { sel: '.cases',         label: '已读' },
    { sel: '.theatre',       label: '复核' },
    { sel: '.exhibits-live', label: '活样' },
    { sel: '.promises',      label: '归档' },
    { sel: '.download',      label: '存档' },
  ];
  sectionStampMap.forEach(function (def) {
    var sec = document.querySelector(def.sel);
    if (!sec) return;
    if (sec.querySelector(':scope > .section-stamp')) return;
    var s = document.createElement('div');
    s.className = 'section-stamp';
    s.setAttribute('aria-hidden', 'true');
    s.textContent = def.label;
    sec.insertBefore(s, sec.firstChild);
  });

  // v3.5 P3 · scroll-timeline takes over when supported — skip IO 旁路.
  // CSS @supports (animation-timeline: view()) 块 drive scroll-tied reveal.
  // Else 走 IO 旧路 (Chrome <115 / Safari <17 / Firefox flag-off).
  var supportsScrollTimeline = (typeof CSS !== 'undefined') &&
    CSS.supports && CSS.supports('animation-timeline', 'view()');
  if (!prefersReduced && !supportsScrollTimeline && 'IntersectionObserver' in window) {
    var stampIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-stamped');
          stampIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -4% 0px' });
    document.querySelectorAll('.section-stamp').forEach(function (s) { stampIO.observe(s); });
  } else if (prefersReduced || !supportsScrollTimeline) {
    document.querySelectorAll('.section-stamp').forEach(function (s) { s.classList.add('is-stamped'); });
  }
  // When supportsScrollTimeline === true and motion is OK, CSS handles it; no JS needed.

  // ─── v3.5 P4 · SVG stroke-dashoffset red-line draw-in (案 v3.4 B3 升级) ──
  // 替换原 CSS scaleX 红线为 SVG path stroke-dashoffset draw-in (更编辑感 / Substack 风).
  // 红→金渐变路径, dasharray=220 → dashoffset 220→0 真"画"出来.
  // 仍然 IO 触发 .is-underlined → CSS 跑 keyframes.
  var underlineHeadings = document.querySelectorAll(
    '.case-title, .download-h, .affirmation-body'
  );
  var SVG_NS = 'http://www.w3.org/2000/svg';
  underlineHeadings.forEach(function (h) {
    // Don't double-inject
    if (h.classList.contains('has-underline-fx')) return;
    h.classList.add('has-underline-fx');
    // Inject SVG underline (replaces v3.4 .title-underline-fx span).
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'title-underline-fx');
    svg.setAttribute('viewBox', '0 0 200 6');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    // Gradient defs (red → gold)
    var defs = document.createElementNS(SVG_NS, 'defs');
    var grad = document.createElementNS(SVG_NS, 'linearGradient');
    var gradId = 'titleRedGold-' + Math.random().toString(36).slice(2, 8);
    grad.setAttribute('id', gradId);
    grad.setAttribute('x1', '0'); grad.setAttribute('x2', '1');
    grad.setAttribute('y1', '0'); grad.setAttribute('y2', '0');
    var s1 = document.createElementNS(SVG_NS, 'stop');
    s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', '#b2382b');
    var s2 = document.createElementNS(SVG_NS, 'stop');
    s2.setAttribute('offset', '78%'); s2.setAttribute('stop-color', '#b2382b');
    var s3 = document.createElementNS(SVG_NS, 'stop');
    s3.setAttribute('offset', '100%'); s3.setAttribute('stop-color', '#c8a86a');
    grad.appendChild(s1); grad.appendChild(s2); grad.appendChild(s3);
    defs.appendChild(grad);
    svg.appendChild(defs);
    // Path · subtle curve so it reads hand-drawn, not ruler-straight.
    var path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', 'M0 3 Q100 0 200 3');
    path.setAttribute('stroke', 'url(#' + gradId + ')');
    path.setAttribute('stroke-width', '2.5');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('fill', 'none');
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    // dasharray = path length approx (Q-curve over 200 ≈ 200-ish; over-allocate to 220)
    path.setAttribute('stroke-dasharray', '220');
    path.setAttribute('stroke-dashoffset', '220');
    svg.appendChild(path);
    h.appendChild(svg);
  });

  if (!prefersReduced && 'IntersectionObserver' in window) {
    var ulIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-underlined');
          ulIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.34, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.has-underline-fx').forEach(function (h) { ulIO.observe(h); });
  } else {
    document.querySelectorAll('.has-underline-fx').forEach(function (h) { h.classList.add('is-underlined'); });
  }

  // ─── v3.3 · Live UI tour (Now / Team mock) ──────────────────────────
  // 1) Apply per-card --rot from data-rotate (attr() in CSS isn't reliable)
  // 2) Tab switcher (Now ↔ Team) — v3.4 dossier transitions:
  //      · A1 case-file fold (perspective 1200 rotateY 0 → ±90deg)
  //      · A2 red seal indicator slides between tabs + scale pulse
  //      · A4 "案卷夹合上" closing-folder bar over the stage
  // 3) Section-enter stagger (commit rows / obs cards / member cards)
  // 4) Mentor inline answer expand on click (data-mentor-toggle)
  // 5) Typewriter reveal once per panel for mentor answers (first open)
  (function liveTour() {
    var tourSection = document.getElementById('ui-tour');
    if (!tourSection) return;

    // 1 · per-card rotation
    tourSection.querySelectorAll('[data-rotate]').forEach(function (el) {
      var v = parseFloat(el.getAttribute('data-rotate'));
      if (!isNaN(v)) el.style.setProperty('--rot', v);
    });

    // 2 · tab switcher
    var tabs = Array.prototype.slice.call(tourSection.querySelectorAll('.exhibit-tab'));
    var panels = Array.prototype.slice.call(tourSection.querySelectorAll('.exhibit-panel'));
    var tabsBar = tourSection.querySelector('.exhibit-tabs');
    var stage = tourSection.querySelector('.exhibit-stage');

    // A2 · inject the sliding red seal indicator (snaps under active tab)
    var sealEl = null;
    if (tabsBar) {
      sealEl = tabsBar.querySelector('.exhibit-tab-seal');
      if (!sealEl) {
        sealEl = document.createElement('span');
        sealEl.className = 'exhibit-tab-seal';
        sealEl.setAttribute('aria-hidden', 'true');
        // SVG-ish 章戳: round, faintly textured, gold core
        sealEl.innerHTML =
          '<span class="seal-ring"></span>' +
          '<span class="seal-text">PACE</span>' +
          '<span class="seal-sub">已切换</span>';
        tabsBar.appendChild(sealEl);
      }
    }

    // A4 · inject the closing-folder bar (sits on top of stage during transition)
    var folderEl = null;
    if (stage) {
      folderEl = stage.querySelector('.exhibit-folder-flap');
      if (!folderEl) {
        folderEl = document.createElement('div');
        folderEl.className = 'exhibit-folder-flap';
        folderEl.setAttribute('aria-hidden', 'true');
        folderEl.innerHTML =
          '<span class="flap-top"></span>' +
          '<span class="flap-bot"></span>' +
          '<span class="flap-rule"></span>';
        stage.appendChild(folderEl);
      }
    }

    // Position the seal indicator under the active tab (uses transform only)
    function positionSeal(activeTab, withPulse) {
      if (!sealEl || !tabsBar || !activeTab) return;
      var barRect = tabsBar.getBoundingClientRect();
      var rect = activeTab.getBoundingClientRect();
      // Center the 56×56 seal horizontally under the active tab.
      var x = (rect.left - barRect.left) + (rect.width / 2);
      sealEl.style.setProperty('--seal-x', x + 'px');
      if (withPulse) {
        sealEl.classList.remove('is-pulsing');
        // force reflow so the animation restarts
        // eslint-disable-next-line no-unused-expressions
        void sealEl.offsetWidth;
        sealEl.classList.add('is-pulsing');
      }
    }

    // probe support: ?_probe=team activates the team tab on load (used by screenshot QA)
    var probeMatch = (location.search || '').match(/[?&]_probe=([^&]+)/);
    var probeTab = probeMatch ? probeMatch[1] : null;

    var foldTimer = null;
    var hideTimer = null;
    // v3.4.1 · drawer slide (replaces v3.4 案卷翻页 fold — user 没感知 fold, 抽屉更直观)
    // outgoing panel slides left -60% in 450ms; incoming starts at +200ms from right +60%
    var FOLD_OUT_MS = 450;
    var FOLD_IN_MS  = 450;
    var INCOMING_DELAY_MS = 200;
    var FLAP_MS     = 280; // v3.4.1 · 缩短 (0.42s → 0.28s) 不抢戏

    function activateTab(name, opts) {
      opts = opts || {};
      var instant = !!opts.instant || prefersReduced;

      var activeTabEl = null;
      tabs.forEach(function (t) {
        var isActive = t.getAttribute('data-tab') === name;
        t.classList.toggle('is-active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        if (isActive) activeTabEl = t;
      });

      // A2 · slide red seal to new active tab + pulse
      positionSeal(activeTabEl, !instant);

      // A4 · "案卷夹合上打开" — only when actually switching, not on initial mount
      if (!instant && folderEl && stage && !opts.initial) {
        folderEl.classList.remove('is-flapping');
        // eslint-disable-next-line no-unused-expressions
        void folderEl.offsetWidth;
        folderEl.classList.add('is-flapping');
        setTimeout(function () {
          folderEl.classList.remove('is-flapping');
        }, FLAP_MS + 40);
      }

      // Clear any pending fold timers from a previous tab change
      if (foldTimer) { clearTimeout(foldTimer); foldTimer = null; }
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }

      var outgoing = panels.filter(function (p) {
        return !p.hidden && p.getAttribute('data-tab-panel') !== name;
      });
      var incoming = panels.filter(function (p) {
        return p.getAttribute('data-tab-panel') === name;
      })[0];

      if (instant || opts.initial) {
        // Initial load / reduced-motion: no fold animation
        outgoing.forEach(function (p) {
          p.classList.remove('is-active', 'is-folding-out', 'is-folding-in');
          p.hidden = true;
        });
        if (incoming) {
          incoming.hidden = false;
          incoming.classList.remove('is-folding-out', 'is-folding-in');
          // restart enter animation by replaying class
          incoming.classList.remove('is-active');
          // eslint-disable-next-line no-unused-expressions
          void incoming.offsetWidth;
          incoming.classList.add('is-active');
        }
        return;
      }

      // v3.4.1 · drawer slide (replaces A1 fold)
      // outgoing 0 → -60% (translateX) + opacity 1 → 0  (FOLD_OUT_MS)
      // incoming starts at +INCOMING_DELAY_MS, +60% → 0 + opacity 0 → 1 (FOLD_IN_MS)
      // 1) start drawer-out on current panel (drawer-pull label flashes via CSS)
      outgoing.forEach(function (p) {
        p.classList.remove('is-active', 'is-folding-in');
        p.classList.add('is-folding-out');
      });

      // Drawer pull label · which tab we're pulling INTO (briefly flashes bottom-left)
      if (stage) {
        var labelEl = stage.querySelector('.exhibit-drawer-pull');
        if (!labelEl) {
          labelEl = document.createElement('span');
          labelEl.className = 'exhibit-drawer-pull';
          labelEl.setAttribute('aria-hidden', 'true');
          stage.appendChild(labelEl);
        }
        var tabLabel = activeTabEl ? (activeTabEl.querySelector('.tab-label') && activeTabEl.querySelector('.tab-label').textContent.replace(/\s+·.*$/, '').trim()) : name;
        labelEl.textContent = '[ 拉档 · ' + (tabLabel || name) + ' ]';
        labelEl.classList.remove('is-pulling');
        // eslint-disable-next-line no-unused-expressions
        void labelEl.offsetWidth;
        labelEl.classList.add('is-pulling');
      }

      // 2) incoming starts to slide in after INCOMING_DELAY_MS (overlap stops, gives visual break)
      foldTimer = setTimeout(function () {
        if (incoming) {
          incoming.hidden = false;
          // restart enter animation
          incoming.classList.remove('is-active');
          incoming.classList.add('is-folding-in');
          // eslint-disable-next-line no-unused-expressions
          void incoming.offsetWidth;
          incoming.classList.add('is-active');
        }
        // clean up the fold-in class + hide outgoing after the incoming animation ends
        hideTimer = setTimeout(function () {
          outgoing.forEach(function (p) {
            p.classList.remove('is-folding-out');
            p.hidden = true;
          });
          if (incoming) incoming.classList.remove('is-folding-in');
        }, FOLD_IN_MS + 40);
      }, INCOMING_DELAY_MS);
    }

    // Initial mount: position seal under default active tab WITHOUT fold animation
    function getInitialActiveTabName() {
      var def = tabs.filter(function (t) { return t.classList.contains('is-active'); })[0];
      return def ? def.getAttribute('data-tab') : (tabs[0] && tabs[0].getAttribute('data-tab'));
    }
    var initialName = probeTab && tabs.some(function (t) { return t.getAttribute('data-tab') === probeTab; })
      ? probeTab
      : getInitialActiveTabName();
    if (initialName) activateTab(initialName, { initial: true, instant: true });

    // Re-position seal on resize (font load / orientation change)
    window.addEventListener('resize', function () {
      var current = tabs.filter(function (t) { return t.classList.contains('is-active'); })[0];
      positionSeal(current, false);
    }, { passive: true });
    // Also reposition once fonts settle (web font reflow can shift tab widths)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        var current = tabs.filter(function (t) { return t.classList.contains('is-active'); })[0];
        positionSeal(current, false);
      }).catch(function () { /* noop */ });
    }

    // v3.5 P2 · View Transitions API wrap — 浏览器自动 FLIP morph
    // 红章戳 (.exhibit-tab-seal) 已经标 view-transition-name: seal (in CSS).
    // 浏览器原生测算起止位置 + morph, 比手写更稳.
    // 不支持的浏览器 fallback 现有 v3.4.1 drawer slide (legacy path).
    function tabSwitch(name) {
      var supportsVT = typeof document.startViewTransition === 'function' && !prefersReduced;
      if (!supportsVT) {
        // fallback: v3.4.1 drawer slide (legacy)
        activateTab(name);
        return;
      }
      try {
        var t = document.startViewTransition(function () {
          activateTab(name);
        });
        // expose promise for review CDP verification
        if (t && t.finished && typeof t.finished.then === 'function') {
          t.finished.catch(function () { /* user cancel / skip — ignore */ });
        }
      } catch (e) {
        activateTab(name); // any failure → fallback
      }
    }

    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        if (t.classList.contains('is-active')) return; // skip click on already-active
        tabSwitch(t.getAttribute('data-tab'));
      });
      t.addEventListener('keydown', function (ev) {
        if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
        ev.preventDefault();
        var idx = tabs.indexOf(t);
        var next = ev.key === 'ArrowRight' ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
        tabs[next].focus();
        tabSwitch(tabs[next].getAttribute('data-tab'));
      });
    });

    // 3 · section-enter stagger + v3.4.1 drawer slide-in on stage
    if (!prefersReduced && 'IntersectionObserver' in window) {
      // 3a · stagger groups (commit-rows / now-cards / team-cards) at low threshold
      var tourIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          tourSection.classList.add('is-in');
          tourSection.querySelectorAll('.commit-rows, .now-cards, .team-cards').forEach(function (g) {
            g.classList.add('is-in');
          });
          tourIO.unobserve(tourSection);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
      tourIO.observe(tourSection);

      // 3b · v3.4.1 drawer slide-in — stage opens from RIGHT like a Pace dock
      // v3.5.1 修复"用户没看到抽屉滑入":
      //   - threshold 0.3 → 0.01: stage 顶端**刚露出视口**就触发 (而不是 30% 才触发)
      //   - rootMargin 0px 0px 0px 0px: 不偏移触发区域
      //   - 配合 CSS 把 keyframes 时长从 0.82s 改 1.2s + signature easing,
      //     用户继续往下滚的同时, 1.2s 抽屉从右边 60% 慢滑到位 — 真正"看见"
      if (stage) {
        var drawerIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            stage.classList.add('is-drawer-in');
            drawerIO.unobserve(stage);
          });
        }, { threshold: 0.01, rootMargin: '0px' });
        drawerIO.observe(stage);
      }
    } else {
      tourSection.classList.add('is-in');
      tourSection.querySelectorAll('.commit-rows, .now-cards, .team-cards').forEach(function (g) {
        g.classList.add('is-in');
      });
      if (stage) stage.classList.add('is-drawer-in');
    }

    // 4 + 5 · mentor toggle with typewriter
    tourSection.querySelectorAll('[data-mentor-toggle]').forEach(function (btn) {
      var container = btn.closest('.obs-card, .member-card');
      if (!container) return;
      var mentor = container.querySelector('.obs-mentor');
      if (!mentor) return;
      var body = mentor.querySelector('[data-typewriter]');
      btn.setAttribute('aria-expanded', 'false');

      btn.addEventListener('click', function () {
        var isOpen = mentor.hasAttribute('data-open');
        if (isOpen) {
          mentor.removeAttribute('data-open');
          btn.setAttribute('aria-expanded', 'false');
          return;
        }
        // ensure hidden attribute removed (we use display:grid via CSS)
        mentor.removeAttribute('hidden');
        mentor.setAttribute('data-open', '');
        btn.setAttribute('aria-expanded', 'true');

        // typewriter once
        if (body && !body.dataset.typed) {
          body.dataset.typed = '1';
          if (prefersReduced) return;
          var full = body.textContent;
          body.textContent = '';
          var i = 0;
          function type() {
            if (i >= full.length) return;
            body.textContent = full.slice(0, ++i);
            var jitter = 16 + Math.random() * 18;
            setTimeout(type, jitter);
          }
          // small lead-in so the panel reveal finishes first
          setTimeout(type, 260);
        }
      });
    });
  })();
})();
