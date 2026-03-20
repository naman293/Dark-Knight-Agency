/**
 * word-glow.js
 * Smooth character brightness glow on small grey text only.
 * - Uses requestAnimationFrame so motion is silky, never jerky
 * - Glow strictly confined to hovered element's own characters
 * - No bloom, no shape — only colour brightness lifts
 * - Big text (big-quote, section-title, hero-headline etc.) excluded
 */

window.addEventListener('load', function () {

  /* ── Precise selectors — small grey text ONLY ─────────
     Each selector is explicit. .about-left p is REMOVED
     because .big-quote sits inside it and is large text.
     Instead we target only the small paragraphs directly. ── */
  var SELECTORS = [
    '.section-eyebrow',
    '.section-sub',
    '.hero-sub',
    '.hero-stat-label',
    '.about-card p',           /* small text inside cards only */
    '.service-desc',
    '.service-num',
    '.pricing-tagline',
    '.pricing-sidebar-text',
    '.pricing-sidebar-label',
    '.pricing-flow-num',
    '.pricing-flow-step-text span',
    '.pricing-price-range',
    '.pricing-retainer',
    '.pricing-outcome span',
    '.process-step-num',
    '.process-step-desc',
    '.result-label',
    '.testimonial-text',
    '.cta-sub',
    '.footer-copy',
    '.footer-tagline',
    '.marquee-item',
  ];

  /* ── Inject char styles ───────────────────────────────── */
  var st = document.createElement('style');
  st.textContent =
    '.gc{display:inline;cursor:none;white-space:pre;' +
    'transition:color .28s ease,text-shadow .28s ease;}';
  document.head.appendChild(st);

  /* ── Split element into per-character spans ───────────── */
  function splitChars(el) {
    /* Extra guard — skip if element has large font-size (>18px) */
    var fs = parseFloat(window.getComputedStyle(el).fontSize);
    if (fs > 18) return;

    if (el.dataset.gcDone) return;
    el.dataset.gcDone = '1';

    Array.from(el.childNodes).forEach(function (node) {
      if (node.nodeType !== Node.TEXT_NODE) return;
      var text = node.textContent;
      if (!text.trim()) return;

      var frag = document.createDocumentFragment();
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (ch === ' ' || ch === '\n') {
          frag.appendChild(document.createTextNode(ch));
        } else {
          var sp = document.createElement('span');
          sp.className   = 'gc';
          sp.textContent = ch;
          frag.appendChild(sp);
        }
      }
      node.parentNode.replaceChild(frag, node);
    });
  }

  function splitAll() {
    SELECTORS.forEach(function (sel) {
      try { document.querySelectorAll(sel).forEach(splitChars); }
      catch (e) {}
    });
  }
  splitAll();

  /* ── State ────────────────────────────────────────────── */
  var RADIUS      = 55;
  var litSpans    = [];
  var mouseX      = 0;
  var mouseY      = 0;
  var hoveredEl   = null;   /* the parent grey-text element */
  var rafPending  = false;

  function clearAll() {
    litSpans.forEach(function (sp) {
      sp.style.color      = '';
      sp.style.textShadow = '';
    });
    litSpans  = [];
    hoveredEl = null;
  }

  /* ── Core glow — runs inside rAF, smooth 60fps ────────── */
  function updateGlow() {
    rafPending = false;
    if (!hoveredEl) return;

    var next = [];

    hoveredEl.querySelectorAll('.gc').forEach(function (sp) {
      var r  = sp.getBoundingClientRect();
      var cx = r.left + r.width  / 2;
      var cy = r.top  + r.height / 2;
      var d  = Math.sqrt((cx - mouseX) * (cx - mouseX) +
                         (cy - mouseY) * (cy - mouseY));

      if (d < RADIUS) {
        var t    = 1 - d / RADIUS;
        var ease = t * t * t;          /* cubic — even smoother falloff */

        /* pure brightness only — no shadow, no blob */
        var v = Math.round(90 + ease * 150);
        sp.style.color      = 'rgb(' + v + ',' + v + ',' + v + ')';
        sp.style.textShadow = 'none';

        next.push(sp);
      } else {
        sp.style.color      = '';
        sp.style.textShadow = '';
      }
    });

    litSpans = next;
  }

  /* ── Mouse handler — batched via rAF ─────────────────── */
  document.addEventListener('mousemove', function (e) {
    var t = e.target;

    if (t && t.classList && t.classList.contains('gc')) {
      mouseX    = e.clientX;
      mouseY    = e.clientY;
      hoveredEl = t.parentElement;

      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(updateGlow);
      }
    } else {
      clearAll();
    }
  }, { passive: true });

  document.addEventListener('mouseleave', clearAll);

  /* ── Re-split on pricing tab switch ──────────────────── */
  document.addEventListener('click', function (e) {
    if (e.target && e.target.classList &&
        e.target.classList.contains('pricing-tab')) {
      setTimeout(splitAll, 80);
    }
  });

});