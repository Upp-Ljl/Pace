/* ============================================================
 * Pace landing — v2 behaviors
 * 1. 4 tagline variant switcher (URL hash preserves selection)
 * 2. Beat 2 typewriter — prompt 落入 input 后字符级出字
 * ============================================================ */

(function () {
  "use strict";

  /* ---------- tagline variants ---------- */
  var VARIANTS = {
    a: {
      text: '它不让你列任务，<em>它告诉你你已经在做什么。</em>',
      sub: 'cc 帮你做事，Pace 让 ta 帮你看清自己——你在哪个回合、卡点、下一步要找谁。'
    },
    b: {
      text: '见面前，先和 ta 的视角<em>排练一遍。</em>',
      sub: '切到同事身份，让 mentor 用 ta 的角度审视你这一周——少一次返工，少一场尴尬。'
    },
    c: {
      text: 'main 上裸改 3 小时后，<em>它问你一句话。</em>',
      sub: '不是提醒你建分支——是让你停一下：你在哪个回合、谁等着你的下游、要不要先同步。'
    },
    d: {
      text: 'mentor 不是在猜，<em>是在翻你的工作。</em>',
      sub: 'cc 对话 + git 改动 + 团队信息——你说一句"我在干啥"，它先翻完证据再开口。'
    }
  };

  var DEFAULT_VARIANT = 'c';
  var VALID = Object.keys(VARIANTS);

  function readHashVariant() {
    var raw = (window.location.hash || '').toLowerCase();
    var match = raw.match(/^#tagline-([a-d])$/);
    if (match && VALID.indexOf(match[1]) !== -1) return match[1];
    return null;
  }

  function applyVariant(key) {
    var v = VARIANTS[key];
    if (!v) return;

    var text = document.getElementById('hero-text');
    var sub = document.getElementById('hero-sub');
    if (text) text.innerHTML = v.text;
    if (sub) sub.textContent = v.sub;

    var buttons = document.querySelectorAll('.tagline-btn');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var isActive = btn.getAttribute('data-variant') === key;
      btn.classList.toggle('is-active', isActive);
      if (isActive) {
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.removeAttribute('aria-selected');
      }
    }
  }

  function setHash(key) {
    var target = '#tagline-' + key;
    if (window.location.hash !== target) {
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', target);
      } else {
        window.location.hash = target;
      }
    }
  }

  /* ---------- Beat 2 typewriter ---------- */
  var PROMPT_TEXT = '我刚改了 IPC race bug，下一步该干啥？';
  var TYPEWRITER_SPEED_MS = 55;
  var TYPEWRITER_HOLD_MS = 2400; // 输入完后停留多久再重启

  function runTypewriter(targetEl) {
    if (!targetEl) return;
    var i = 0;
    targetEl.textContent = '';
    var tick = setInterval(function () {
      if (i >= PROMPT_TEXT.length) {
        clearInterval(tick);
        setTimeout(function () {
          runTypewriter(targetEl);
        }, TYPEWRITER_HOLD_MS);
        return;
      }
      targetEl.textContent += PROMPT_TEXT.charAt(i);
      i++;
    }, TYPEWRITER_SPEED_MS);
  }

  function setupTypewriterOnScroll() {
    var target = document.getElementById('prompt-typed');
    if (!target) return;

    // 进入视口才开始打字
    if ('IntersectionObserver' in window) {
      var started = false;
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !started) {
              started = true;
              runTypewriter(target);
              io.disconnect();
            }
          });
        },
        { threshold: 0.4 }
      );
      io.observe(target);
    } else {
      runTypewriter(target);
    }
  }

  /* ---------- affirm armed-on-scroll ---------- */
  function setupAffirmOnScroll() {
    var beat5 = document.querySelector('.beat-5');
    if (!beat5) return;
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              beat5.classList.add('armed');
              io.disconnect();
            }
          });
        },
        { threshold: 0.25 }
      );
      io.observe(beat5);
    } else {
      beat5.classList.add('armed');
    }
  }

  /* ---------- init ---------- */
  function init() {
    var initial = readHashVariant() || DEFAULT_VARIANT;
    applyVariant(initial);

    var buttons = document.querySelectorAll('.tagline-btn');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (e) {
        var key = e.currentTarget.getAttribute('data-variant');
        if (!key || VALID.indexOf(key) === -1) return;
        applyVariant(key);
        setHash(key);
      });
    }

    window.addEventListener('hashchange', function () {
      var key = readHashVariant();
      if (key) applyVariant(key);
    });

    setupTypewriterOnScroll();
    setupAffirmOnScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
