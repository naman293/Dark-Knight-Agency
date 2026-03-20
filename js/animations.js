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

  /* ── Process line fill ─────────────────────────── */
  const processLine = document.querySelector('.process-line-fill');
  const processDots = document.querySelectorAll('.process-dot');
  if (processLine) {
    const processObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        processLine.style.width = '100%';
        processDots.forEach((dot, i) => {
          setTimeout(() => dot.classList.add('active'), i * 300);
        });
        processObs.disconnect();
      }
    }, { threshold: 0.4 });
    processObs.observe(processLine.parentElement);
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
