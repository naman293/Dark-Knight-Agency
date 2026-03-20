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
    const scrollMid = window.scrollY + window.innerHeight * 0.4;
    let current = '';
    sections.forEach(s => {
      if (s.offsetTop <= scrollMid) current = s.id;
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

})();