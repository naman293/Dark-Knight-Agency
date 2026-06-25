/* animations.js – scroll reveal, counters, process line */

(function() {

  /* ── Scroll Reveal ─────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObs.observe(el));

  /* ── Nav scroll state ──────────────────────────── */
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
  }, { passive: true });

  /* ── Hero word animation ───────────────────────── */
  document.querySelectorAll('.hero-headline .word').forEach((word, i) => {
    setTimeout(() => {
      word.classList.add('animate');
    }, 100 + i * 80);
  });

  /* ── Hero orbs ─────────────────────────────────── */
  document.querySelectorAll('.hero-bg-orb').forEach(orb => {
    orb.classList.add('loaded');
  });

  /* ── Counter animation ─────────────────────────── */
  function animateCounter(el, target, suffix, duration) {
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const counters = document.querySelectorAll('[data-count]');
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix, 1800);
        counterObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObs.observe(c));

  /* ── Process SVG Curved Line ──────────────────── */
  const curveSvg = document.getElementById('process-curve-svg');
  const curveBg = document.getElementById('process-curve-bg');
  const curveFill = document.getElementById('process-curve-fill');
  const processDots = document.querySelectorAll('.process-dot');
  const processTrack = document.querySelector('.process-track');

  let curveLen = 0;
  let curveReady = false;

  function buildCurve() {
    if (!curveSvg || !curveBg || !curveFill || processDots.length < 2) return;

    // Make sure GSAP and Plugins are registered
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && typeof MotionPathPlugin !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
    } else {
      return;
    }

    const trackRect = processTrack.getBoundingClientRect();
    const svgW = trackRect.width;
    const svgH = trackRect.height;
    curveSvg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
    curveSvg.style.width = svgW + 'px';
    curveSvg.style.height = svgH + 'px';

    // Get dot center positions relative to track
    const pts = [];
    processDots.forEach(dot => {
      const dr = dot.getBoundingClientRect();
      pts.push({
        x: dr.left + dr.width / 2 - trackRect.left,
        y: dr.top + dr.height / 2 - trackRect.top
      });
    });

    if (pts.length < 2) return;

    // Build a smooth S-curve path through the dot centers
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const mx = (p0.x + p1.x) / 2;
      const wave = (i % 2 === 0) ? -35 : 35;
      d += ` C ${mx} ${p0.y + wave}, ${mx} ${p1.y - wave}, ${p1.x} ${p1.y}`;
    }

    curveBg.setAttribute('d', d);
    curveFill.setAttribute('d', d);

    curveLen = curveFill.getTotalLength();
    curveFill.style.strokeDasharray = curveLen;
    curveFill.style.strokeDashoffset = curveLen;
    curveBg.style.strokeDasharray = 'none';

    const processSection = document.getElementById('process');
    const spark = document.getElementById('process-spark');

    // Clear existing ScrollTriggers for this section
    ScrollTrigger.getAll().forEach(st => {
      if (st.vars && st.vars.trigger === processSection) st.kill();
    });

    gsap.set(spark, { opacity: 1 });

    // Track which checkpoints have already fired
    const firedCheckpoints = new Set();
    const GLYPHS = '⬡◇▲◈{}+<>01>_//■□△▽';

    // ── Text Scramble Decode ──
    function scrambleText(titleEl) {
      const finalText = titleEl.getAttribute('data-text') || titleEl.textContent;
      const chars = finalText.split('');
      titleEl.textContent = '';
      chars.forEach((ch, ci) => {
        const span = document.createElement('span');
        span.className = 'scramble-char';
        span.textContent = ch;
        titleEl.appendChild(span);

        // Rapid symbol cycling then resolve
        let cycles = 0;
        const maxCycles = 6 + ci * 2;
        const interval = setInterval(() => {
          span.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          span.style.opacity = '1';
          span.style.transform = 'translateY(0)';
          cycles++;
          if (cycles >= maxCycles) {
            clearInterval(interval);
            span.textContent = ch;
          }
        }, 40);
      });
    }

    // ── Fire Checkpoint Animations ──
    function fireCheckpoint(i) {
      if (firedCheckpoints.has(i)) return;
      firedCheckpoints.add(i);

      const dot = processDots[i];
      const stepParent = dot.closest('.process-step');
      const card = stepParent.querySelector('.process-card');
      const ripples = dot.querySelectorAll('.node-ripple');
      const cyberPs = dot.querySelectorAll('.cyber-p');
      const titleEl = card.querySelector('.process-step-title');
      const traceRect = card.querySelector('.trace-rect');

      // 1) Dot ignites with massive glow
      dot.classList.add('active');
      gsap.fromTo(dot, { scale: 1 }, { 
        scale: 1.4, duration: 0.2, ease: 'back.out(4)',
        onComplete: () => gsap.to(dot, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.5)' })
      });

      // 2) Double shockwave ripples (staggered)
      ripples.forEach((ripple, ri) => {
        gsap.fromTo(ripple,
          { scale: 0, opacity: 1 },
          { scale: 3.5, opacity: 0, duration: 0.8, delay: ri * 0.15, ease: 'power2.out' }
        );
      });

      // 3) Cyber particle eruption
      cyberPs.forEach((p, pi) => {
        const cs = getComputedStyle(p);
        const px = parseFloat(cs.getPropertyValue('--px')) || (-30 + pi * 15);
        const py = parseFloat(cs.getPropertyValue('--py')) || (-40 - pi * 5);
        const pr = parseFloat(cs.getPropertyValue('--pr')) || (pi * 10);
        gsap.fromTo(p,
          { x: 0, y: 0, opacity: 0, scale: 0, rotation: 0 },
          {
            x: px, y: py,
            opacity: 1, scale: 1.2, rotation: pr,
            duration: 0.5,
            delay: pi * 0.06,
            ease: 'power3.out',
            onComplete: () => {
              gsap.to(p, { opacity: 0, y: py - 20, duration: 0.6, ease: 'power1.in' });
            }
          }
        );
      });

      // 4) Card reveal — strict 3D flip
      card.classList.add('card-revealed');
      gsap.to(card, {
        opacity: 1,
        rotateX: 0,
        translateY: 0,
        scale: 1,
        duration: 0.7,
        ease: 'back.out(1.7)',
        delay: 0.1
      });

      // 5) Holographic text scramble
      if (titleEl) {
        setTimeout(() => scrambleText(titleEl), 200);
      }
    }

    // ── GSAP ScrollTrigger Timeline ──
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: processSection,
        start: 'center center',
        end: '+=1000',
        scrub: 0.5,
        pin: true,
        onUpdate: (self) => {
          const progress = self.progress;
          // Fire checkpoints at precise thresholds
          processDots.forEach((dot, i) => {
            const threshold = i / (processDots.length - 1);
            // Trigger slightly before the spark reaches the node
            if (progress >= threshold * 0.95 + 0.02) {
              fireCheckpoint(i);
            }
          });
        }
      }
    });

    // Scrubbed: Draw the gradient laser line
    tl.to(curveFill, {
      strokeDashoffset: 0,
      ease: 'none',
      duration: 1
    }, 0);

    // Scrubbed: Move the spark particle along the path
    tl.to(spark, {
      motionPath: {
        path: curveFill,
        align: curveFill,
        alignOrigin: [0.5, 0.5]
      },
      ease: 'none',
      duration: 1
    }, 0);

    curveReady = true;
  }

  // Build on load and resize
  if (curveSvg) {
    setTimeout(buildCurve, 500);
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        curveReady = false;
        ScrollTrigger.refresh();
        buildCurve();
      }, 300);
    });
  }

  /* ── Smooth anchor links ───────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Parallax on hero orbs ─────────────────────── */
  const orbs = document.querySelectorAll('.hero-bg-orb');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    orbs.forEach((orb, i) => {
      const speed = 0.15 + i * 0.1;
      orb.style.transform = `translateY(${y * speed}px)`;
    });
  }, { passive: true });

  /* ── Typing effect for hero subtext ───────────── */
  const typingEl = document.querySelector('.hero-typing');
  if (typingEl) {
    const phrases = ['more customers.', 'more revenue.', 'more growth.', 'your competitors worried.'];
    let pIdx = 0, cIdx = 0, deleting = false;
    function type() {
      const phrase = phrases[pIdx];
      if (!deleting) {
        typingEl.textContent = phrase.slice(0, ++cIdx);
        if (cIdx === phrase.length) { deleting = true; setTimeout(type, 2000); return; }
      } else {
        typingEl.textContent = phrase.slice(0, --cIdx);
        if (cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; }
      }
      setTimeout(type, deleting ? 40 : 80);
    }
    setTimeout(type, 1500);
  }

})();
