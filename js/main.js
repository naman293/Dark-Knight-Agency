/* main.js – mobile nav, misc */

(function() {

  /* ── Mobile nav ────────────────────────────────── */
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks  = document.querySelector('.nav-links');
  let open = false;

  function isMobile() { return window.innerWidth <= 768; }

  function closeNav() {
    open = false;
    /* Only apply display:none on mobile — on desktop CSS handles visibility */
    if (isMobile()) {
      navLinks.style.cssText = 'display: none;';
    } else {
      navLinks.style.cssText = '';   /* let CSS take over */
    }
    hamburger.children[0].style.transform = '';
    hamburger.children[1].style.opacity   = '';
    hamburger.children[2].style.transform = '';
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      open = !open;
      if (open) {
        navLinks.style.cssText = `
          display: flex; flex-direction: column; position: fixed;
          top: 0; left: 0; right: 0; bottom: 0; background: var(--bg);
          justify-content: center; align-items: center; gap: 32px;
          z-index: 999; animation: fadeIn 0.3s ease forwards;
        `;
        hamburger.children[0].style.transform = 'translateY(6.5px) rotate(45deg)';
        hamburger.children[1].style.opacity   = '0';
        hamburger.children[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
      } else {
        closeNav();
      }
    });

    /* Close on link click — only collapses on mobile */
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (isMobile()) closeNav();
      });
    });
  }

  /* ── Tilt effect on service cards ──────────────── */
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 8;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 8;
      card.style.transform = `perspective(600px) rotateX(${-y}deg) rotateY(${x}deg) translateZ(4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ── Active nav link — scroll + click highlight ─────────
     Uses a CSS class instead of inline style so it never
     gets wiped. Excludes bat-section and hero from the
     set so scrolling back up doesn't blank the nav.
  ────────────────────────────────────────────────────── */
  const NAV_SECTIONS = ['about','services','pricing','process','testimonials','contact'];
  const sections     = NAV_SECTIONS.map(id => document.getElementById(id)).filter(Boolean);
  const navLinkEls   = document.querySelectorAll('.nav-link[href^="#"]');

  /* Inject active style once */
  const activeStyle = document.createElement('style');
  activeStyle.textContent =
    '.nav-link.nav-active{color:var(--text)!important;' +
    'text-shadow:0 0 12px rgba(255,255,255,0.25);}';
  document.head.appendChild(activeStyle);

  function setActive(id) {
    navLinkEls.forEach(a => {
      const matches = a.getAttribute('href') === '#' + id;
      a.classList.toggle('nav-active', matches);
    });
  }

  /* Scroll: find which section is in view */
  window.addEventListener('scroll', () => {
    const threshold = window.innerHeight * 0.4;
    let current = '';
    sections.forEach(s => {
      if (s.getBoundingClientRect().top <= threshold) current = s.id;
    });
    setActive(current);
  }, { passive: true });

  /* Click: immediately highlight before scroll settles */
  navLinkEls.forEach(a => {
    a.addEventListener('click', () => {
      const id = a.getAttribute('href').slice(1);
      setActive(id);
    });
  });

  /* ── Magnetic Button Effect ──────────────────────── */
  document.querySelectorAll('.btn-primary, .btn-secondary, .btn-wa').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  /* ── Glass Card Cursor Glow ─────────────────────── */
  document.querySelectorAll('.glass-card').forEach(card => {
    const glow = card.querySelector('.about-card-glow');
    if (!glow) return;

    // Set glow color from data attribute
    const glowColor = card.getAttribute('data-glow-color');
    if (glowColor) {
      glow.style.background = `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`;
      glow.style.opacity = '0';
    }

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.left = x + 'px';
      glow.style.top = y + 'px';
      glow.style.opacity = '0.5';
    });

    card.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
    });
  });

  /* ── Live Terminal Feed ──────────────────────────── */
  const termFeed = document.getElementById('terminal-feed');
  if (termFeed) {
    const logs = [
      { time: '2:00 AM', action: 'Visitor detected on landing page.', hl: false },
      { time: '2:00 AM', action: 'AI Chatbot engaged: ', hl: '"Looking for SaaS development?"' },
      { time: '2:01 AM', action: 'Lead qualified — ', hl: 'Budget match ✓' },
      { time: '2:01 AM', action: 'Workflow: Updated Notion & triggered ', hl: 'WhatsApp alert.' },
      { time: '2:02 AM', action: 'Auto-reply sent to Instagram DM.', hl: false },
      { time: '2:03 AM', action: 'New contact added to CRM.', hl: false },
      { time: '2:05 AM', action: 'Follow-up email scheduled — ', hl: '48h drip.' },
      { time: '2:10 AM', action: 'Session analytics logged.', hl: false },
    ];

    let logIdx = 0;
    const MAX_LINES = 6;

    function addTermLine() {
      const log = logs[logIdx % logs.length];
      const line = document.createElement('div');
      line.className = 'terminal-line';
      let html = `<span class="t-time">[${log.time}]</span> <span class="t-action">${log.action}</span>`;
      if (log.hl) {
        html += `<span class="t-highlight">${log.hl}</span>`;
      }
      line.innerHTML = html;
      termFeed.appendChild(line);

      // Remove oldest if too many
      while (termFeed.children.length > MAX_LINES) {
        termFeed.removeChild(termFeed.firstChild);
      }

      logIdx++;
      setTimeout(addTermLine, 1800 + Math.random() * 1200);
    }

    // Start after a small delay
    setTimeout(addTermLine, 2000);
  }

  /* ── Dynamic Hero Text Rotation ──────────────────── */
  const dynamicWords = document.querySelectorAll('.dynamic-word');
  if (dynamicWords.length > 0) {
    let wordIdx = 0;
    setInterval(() => {
      const currentWord = dynamicWords[wordIdx];
      currentWord.classList.remove('current');
      currentWord.classList.add('exit');
      
      wordIdx = (wordIdx + 1) % dynamicWords.length;
      const nextWord = dynamicWords[wordIdx];
      nextWord.classList.remove('exit');
      nextWord.classList.add('current');
    }, 2500);
  }

})();