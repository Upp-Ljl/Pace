// Pace · landing — interaction
// On-theme motion: scroll progress, reveal stagger, verdict stamp,
// thinking counters, live readout typewriter, copy CLI.
// Respects prefers-reduced-motion and avoids layout thrash.

(function () {
  'use strict';

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    { sel: '.cases',     label: '已读' },
    { sel: '.theatre',   label: '复核' },
    { sel: '.promises',  label: '归档' },
    { sel: '.download',  label: '存档' },
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

  if (!prefersReduced && 'IntersectionObserver' in window) {
    var stampIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-stamped');
          stampIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -4% 0px' });
    document.querySelectorAll('.section-stamp').forEach(function (s) { stampIO.observe(s); });
  } else {
    document.querySelectorAll('.section-stamp').forEach(function (s) { s.classList.add('is-stamped'); });
  }
})();
