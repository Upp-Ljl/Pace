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

  // ─── v3.3 · Live UI tour (Now / Team mock) ──────────────────────────
  // 1) Apply per-card --rot from data-rotate (attr() in CSS isn't reliable)
  // 2) Tab switcher (Now ↔ Team) with cross-fade + re-stagger
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
    // probe support: ?_probe=team activates the team tab on load (used by screenshot QA)
    var probeMatch = (location.search || '').match(/[?&]_probe=([^&]+)/);
    var probeTab = probeMatch ? probeMatch[1] : null;
    function activateTab(name) {
      tabs.forEach(function (t) {
        var isActive = t.getAttribute('data-tab') === name;
        t.classList.toggle('is-active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      panels.forEach(function (p) {
        var match = p.getAttribute('data-tab-panel') === name;
        if (match) {
          p.hidden = false;
          // restart enter animation by replaying class
          p.classList.remove('is-active');
          // force reflow so animation restarts
          // eslint-disable-next-line no-unused-expressions
          void p.offsetWidth;
          p.classList.add('is-active');
        } else {
          p.classList.remove('is-active');
          // delay hide a beat so cross-fade looks smooth
          setTimeout(function () {
            if (!p.classList.contains('is-active')) p.hidden = true;
          }, 280);
        }
      });
    }
    // honor probe query param
    if (probeTab) {
      var probeMatchEl = tabs.find(function (t) { return t.getAttribute('data-tab') === probeTab; });
      if (probeMatchEl) activateTab(probeTab);
    }

    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        activateTab(t.getAttribute('data-tab'));
      });
      t.addEventListener('keydown', function (ev) {
        if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
        ev.preventDefault();
        var idx = tabs.indexOf(t);
        var next = ev.key === 'ArrowRight' ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
        tabs[next].focus();
        activateTab(tabs[next].getAttribute('data-tab'));
      });
    });

    // 3 · section-enter stagger
    if (!prefersReduced && 'IntersectionObserver' in window) {
      var tourIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          tourSection.classList.add('is-in');
          // also mark direct stagger groups (commit-rows / now-cards / team-cards)
          tourSection.querySelectorAll('.commit-rows, .now-cards, .team-cards').forEach(function (g) {
            g.classList.add('is-in');
          });
          tourIO.unobserve(tourSection);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
      tourIO.observe(tourSection);
    } else {
      tourSection.classList.add('is-in');
      tourSection.querySelectorAll('.commit-rows, .now-cards, .team-cards').forEach(function (g) {
        g.classList.add('is-in');
      });
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
