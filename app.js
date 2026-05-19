/* =====================================================
 * Pace landing — hero tagline switcher
 * Only behavior on this page. No framework, no deps.
 * Default variant: B (subagent recommendation)
 * URL hash preserves selection (#tagline-a..d)
 * ===================================================== */

(function () {
  "use strict";

  /** 4 tagline variants — copy verbatim from docs/landing-wireframe.md §屏 1 */
  var VARIANTS = {
    a: {
      tagline:
        '它不让你列任务，<br>它告诉你你<em>已经在做什么</em>。',
      sub:
        'cc 帮你做事，Pace 让 ta 帮你看清自己——阶段、卡点、下一步要找谁。',
      cta: '↓ Download for macOS & Windows',
      ctaFoot: '自带 LLM key · 全本地'
    },
    b: {
      tagline:
        '见面前，<br>先和 ta 的视角<br><em>排练一遍。</em>',
      sub:
        '切到同事身份，让 mentor 用 ta 的角度审视你这一周——少一次返工，少一场尴尬。',
      cta: '↓ Download · 5 MB · 自带 key',
      ctaFoot: '不传你的 cc 历史去任何地方'
    },
    c: {
      tagline:
        'Ship like a PM,<br><em>not like a code monkey.</em>',
      sub:
        '你已经会让 cc 写代码了。下一步是知道自己卡在 PMBOK 的哪个回合、该找谁解。',
      cta: '↓ Get Pace · free & open source',
      ctaFoot: '本地优先 · MIT 开源'
    },
    d: {
      tagline:
        'mentor 不是在猜，<br><em>是在翻你的工作。</em>',
      sub:
        'cc transcript + git diff + 团队 RACI——你说一句「我在干啥」，它先翻完证据再开口。',
      cta: '↓ Try it · 你的 key 你的数据',
      ctaFoot: '不传 / 不学 / 不留服务端'
    }
  };

  var DEFAULT_VARIANT = 'b';
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

    var tagline = document.getElementById('hero-tagline');
    var sub = document.getElementById('hero-sub');
    var cta = document.getElementById('hero-cta');
    var ctaFoot = document.getElementById('hero-cta-foot');

    if (tagline) tagline.innerHTML = v.tagline;
    if (sub) sub.textContent = v.sub;
    if (cta) cta.textContent = v.cta;
    if (ctaFoot) ctaFoot.textContent = v.ctaFoot;

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
      // history.replaceState avoids polluting browser back stack
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', target);
      } else {
        window.location.hash = target;
      }
    }
  }

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

    // respond to back/forward / shared link hash change
    window.addEventListener('hashchange', function () {
      var key = readHashVariant();
      if (key) applyVariant(key);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
