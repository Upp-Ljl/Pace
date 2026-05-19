import { waitForTarget, connectToTarget } from './cdp-client.mjs';
const t = await waitForTarget(9222, 'panel.html', 10000);
const s = await connectToTarget(t);
// Reload to pick up new CSS
await s.evaluate('location.reload()', { awaitPromise: false });
await new Promise(r => setTimeout(r, 2500));
const t2 = await waitForTarget(9222, 'panel.html', 10000);
const s2 = await connectToTarget(t2);
// Open settings + click light
await s2.clickSelector('#open-settings');
await new Promise(r => setTimeout(r, 300));
await s2.evaluate("document.querySelector('#seg-theme .seg[data-value=\"light\"]').click()", { awaitPromise: false });
await new Promise(r => setTimeout(r, 200));
await s2.clickSelector('#close-settings');
await new Promise(r => setTimeout(r, 300));
// Probe computed colors of key text elements
const r = await s2.evaluate(`(function(){
  function cs(el) { if(!el)return null; const c = window.getComputedStyle(el); return { color: c.color, bg: c.backgroundColor }; }
  return {
    theme_attr: document.documentElement.getAttribute('data-pace-theme'),
    body: cs(document.body),
    brand: cs(document.getElementById('brand')),
    hero_title: cs(document.querySelector('#now-hero .hero-title')),
    hero_subtitle: cs(document.querySelector('#now-hero .hero-subtitle')),
    commit_digest: cs(document.getElementById('commit-digest')),
    footer: cs(document.getElementById('footer')),
    input: cs(document.getElementById('input')),
    msg_user_sample: (function(){ const m = document.querySelector('.msg.user'); return m ? cs(m) : null; })(),
    msg_mentor_sample: (function(){ const m = document.querySelector('.msg.mentor'); return m ? cs(m) : null; })(),
  };
})()`, { awaitPromise: false });
console.log(JSON.stringify(r, null, 2));
s2.disconnect();
