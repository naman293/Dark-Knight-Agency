/**
 * services.js — GSAP-powered motion graphics for the "What We Build" accordion.
 * Each pillar fires a rich, choreographed entrance timeline on expand.
 * HyperFrames principles applied: layout-before-animation, gsap.from() for
 * entrances, varied eases, staggered timing, no repeat:-1.
 */

(function () {
  'use strict';

  // ── Timing constants ──────────────────────────────────────────────────────
  const EXPAND_FLEX   = 4;
  const COLLAPSE_FLEX = 1;
  const PILLAR_DUR    = 0.65; // flex transition duration (matches CSS)

  // ── Pillar animation timelines map ────────────────────────────────────────
  // We store live GSAP timelines so they can be killed cleanly on collapse.
  const timelines = {};

  // ── Helpers ───────────────────────────────────────────────────────────────
  function killTimeline(pillarId) {
    if (timelines[pillarId]) {
      timelines[pillarId].kill();
      delete timelines[pillarId];
    }
  }

  function resetVisual(pillar) {
    // Reset all animatable SVG elements inside this pillar by stripping GSAP inline styles
    const svg = pillar.querySelector('svg');
    if (!svg) return;
    gsap.set(svg.querySelectorAll('*'), { clearProps: 'all' });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PILLAR 1 — Portfolio (card stack float + sparkle dots + sparkline draw)
  // ─────────────────────────────────────────────────────────────────────────
  function animatePortfolio(pillar) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const svg = pillar.querySelector('.portfolio-svg');
    if (!svg) return tl;

    // Cards fan in with stagger
    tl.from(svg.querySelectorAll('.p-card'), {
      y: 40, opacity: 0, duration: 0.55, stagger: 0.1, ease: 'expo.out'
    }, 0.1);

    // Content lines reveal left-to-right
    tl.from(svg.querySelectorAll('.p-line'), {
      scaleX: 0, opacity: 0, transformOrigin: 'left center',
      duration: 0.4, stagger: 0.08, ease: 'power2.out'
    }, 0.4);

    // Avatar pulses in
    tl.from(svg.querySelector('.p-avatar'), {
      scale: 0, opacity: 0, transformOrigin: 'center', duration: 0.5, ease: 'back.out(1.7)'
    }, 0.5);
    tl.from(svg.querySelector('.p-avatar-inner'), {
      scale: 0, opacity: 0, transformOrigin: 'center', duration: 0.4, ease: 'back.out(2)'
    }, 0.65);

    // Sparkle dots scatter in
    tl.from(svg.querySelectorAll('.p-dot'), {
      scale: 0, opacity: 0, transformOrigin: 'center',
      duration: 0.35, stagger: 0.07, ease: 'back.out(2.5)'
    }, 0.6);

    // Sparkline draws itself
    tl.from(svg.querySelector('.p-sparkline'), {
      strokeDashoffset: 300, strokeDasharray: 300,
      duration: 0.8, ease: 'power2.inOut'
    }, 0.7);

    // Idle float after entrance
    tl.to(svg.querySelectorAll('.p-card'), {
      y: -6, duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: 20, stagger: 0.15
    }, 1.5);

    return tl;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PILLAR 2 — Growth (bars build up from floor + trend line draws + dots pop)
  // ─────────────────────────────────────────────────────────────────────────
  function animateGrowth(pillar) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const svg = pillar.querySelector('.growth-svg');
    if (!svg) return tl;

    // Bars rise from bottom
    tl.from(svg.querySelectorAll('.g-bar'), {
      scaleY: 0, transformOrigin: 'bottom',
      duration: 0.6, stagger: 0.08, ease: 'expo.out'
    }, 0.1);

    // Trend line draws across
    const trend = svg.querySelector('.g-trend');
    if (trend) {
      gsap.set(trend, { attr: { 'stroke-dashoffset': 300, 'stroke-dasharray': 300 } });
      tl.to(trend, {
        attr: { 'stroke-dashoffset': 0 },
        duration: 1.0, ease: 'power2.inOut'
      }, 0.4);
    }

    // Dot nodes pop on the line
    tl.to(svg.querySelectorAll('.g-dot'), {
      opacity: 1, scale: 1.2, duration: 0.3,
      stagger: 0.15, ease: 'back.out(2)', transformOrigin: 'center'
    }, 0.9);

    // SEO chip fades in
    tl.to([svg.querySelector('.g-chip'), svg.querySelector('.g-chip-text')], {
      opacity: 1, y: -8, duration: 0.4, ease: 'power2.out', stagger: 0.05
    }, 1.2);

    // Bars idle breathe
    tl.to(svg.querySelectorAll('.g-bar'), {
      scaleY: 0.92, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: 20,
      stagger: { each: 0.1, from: 'random' }
    }, 1.8);

    return tl;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PILLAR 3 — AI Neural (wires draw, nodes pop, core pulses, data pulses travel)
  // ─────────────────────────────────────────────────────────────────────────
  function animateAI(pillar) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const svg = pillar.querySelector('.ai-svg');
    if (!svg) return tl;

    // Nodes pop in
    tl.fromTo(svg.querySelectorAll('.ai-bot, .ai-user, .ai-chat, .ai-kb, .ai-crm'), 
      { scale: 0.8, opacity: 0, transformOrigin: 'center' },
      { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)' },
      0.1
    );

    // Paths reveal
    tl.to(svg.querySelectorAll('.ai-path'), {
      opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out'
    }, 0.5);

    // Labels reveal
    tl.fromTo(svg.querySelectorAll('.ai-label'), 
      { y: 6, opacity: 0 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
      0.7
    );

    // Sequential Story Loop: User -> Bot -> KB -> Bot -> Whatsapp & CRM
    const cycleTime = 2.4; // The repeat delay necessary to sync a 3.2s total loop

    // Pkt1: User to Bot (dx: 45, dy: 45)
    tl.fromTo(svg.querySelector('.pkt1'), {x: 80, y: 120, opacity: 0}, {opacity: 1, x: 125, y: 165, duration: 0.8, ease: 'power1.inOut', repeat: 20, repeatDelay: cycleTime}, 1.0);
    
    // Pkt2: Bot to KB (dx: -45, dy: 45)
    tl.fromTo(svg.querySelector('.pkt2'), {x: 125, y: 215, opacity: 0}, {opacity: 1, x: 80, y: 260, duration: 0.8, ease: 'power1.inOut', repeat: 20, delay: 0.8, repeatDelay: cycleTime}, 1.0);
    
    // Pkt3: KB to Bot (dx: 45, dy: -45)
    tl.fromTo(svg.querySelector('.pkt3'), {x: 80, y: 260, opacity: 0}, {opacity: 1, x: 125, y: 215, duration: 0.8, ease: 'power1.inOut', repeat: 20, delay: 1.6, repeatDelay: cycleTime}, 1.0);
    
    // Pkt4: Bot to Whatsapp (dx: 45, dy: -45)
    tl.fromTo(svg.querySelector('.pkt4'), {x: 175, y: 165, opacity: 0}, {opacity: 1, x: 220, y: 120, duration: 0.8, ease: 'power1.inOut', repeat: 20, delay: 2.4, repeatDelay: cycleTime}, 1.0);
    
    // Pkt5: Bot to CRM (dx: 45, dy: 45)
    tl.fromTo(svg.querySelector('.pkt5'), {x: 175, y: 215, opacity: 0}, {opacity: 1, x: 220, y: 260, duration: 0.8, ease: 'power1.inOut', repeat: 20, delay: 2.4, repeatDelay: cycleTime}, 1.0);

    return tl;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PILLAR 4 — Social (rings spin, lines radiate, satellites materialize, bubbles)
  // ─────────────────────────────────────────────────────────────────────────
  function animateSocial(pillar) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const svg = pillar.querySelector('.social-svg');
    if (!svg) return tl;

    // Nodes pop in
    tl.fromTo(svg.querySelectorAll('.soc-agent, .soc-make, .soc-insta, .soc-engage'), 
      { scale: 0.8, opacity: 0, transformOrigin: 'center' },
      { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)' },
      0.1
    );

    // Paths reveal
    tl.to(svg.querySelectorAll('.soc-path'), {
      opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out'
    }, 0.5);

    // Labels reveal
    tl.fromTo(svg.querySelectorAll('.soc-label'), 
      { y: 6, opacity: 0 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
      0.7
    );

    // Data Packets move along the paths
    // Pkt1: Agent (150,240) to Make (65,155) -> x: -85, y: -85
    tl.fromTo(svg.querySelector('.pkt1'), {x: 0, y: 0, opacity: 0}, {opacity: 1, x: -85, y: -85, duration: 1.2, ease: 'power1.inOut', repeat: 20}, 1.0);
    
    // Pkt2: Make (65,155) to Insta (216,146) -> x: 151, y: -9
    tl.fromTo(svg.querySelector('.pkt2'), {x: 0, y: 0, opacity: 0}, {opacity: 1, x: 151, y: -9, duration: 1.2, ease: 'power1.inOut', repeat: 20, delay: 0.3}, 1.0);
    
    // Pkt3: Insta (216,146) to Engage (142,82) -> x: -74, y: -64
    tl.fromTo(svg.querySelector('.pkt3'), {x: 0, y: 0, opacity: 0}, {opacity: 1, x: -74, y: -64, duration: 1.2, ease: 'power1.inOut', repeat: 20, delay: 0.6}, 1.0);
    
    // Pkt4: Engage (142,82) to Agent (150,240) -> x: 8, y: 158
    tl.fromTo(svg.querySelector('.pkt4'), {x: 0, y: 0, opacity: 0}, {opacity: 1, x: 8, y: 158, duration: 1.2, ease: 'power1.inOut', repeat: 20, delay: 0.9}, 1.0);

    return tl;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PILLAR 5 — Web App (browser frame scans, content blocks reveal, badges pop)
  // ─────────────────────────────────────────────────────────────────────────
  function animateWebApp(pillar) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const svg = pillar.querySelector('.webapp-svg');
    if (!svg) return tl;

    // Frame slides in
    tl.from(svg.querySelector('.wa-frame'), {
      y: 30, opacity: 0, duration: 0.5, ease: 'expo.out'
    }, 0.1);
    tl.from(svg.querySelector('.wa-bar'), {
      scaleX: 0, opacity: 0, transformOrigin: 'left', duration: 0.4, ease: 'power2.out'
    }, 0.3);

    // Scanner line sweeps down
    const scanner = svg.querySelector('.wa-scanner');
    if (scanner) {
      tl.to(scanner, { opacity: 1, duration: 0.1 }, 0.5);
      tl.fromTo(scanner, { attr: { y1: 112, y2: 112 } },
        { attr: { y1: 300, y2: 300 }, duration: 0.8, ease: 'power1.inOut', repeat: 4, repeatDelay: 0.5 }, 0.55);
    }

    // Content blocks reveal in sequence
    tl.to(svg.querySelectorAll('.wa-block'), {
      opacity: 1, y: -5, duration: 0.35, stagger: 0.07, ease: 'power2.out'
    }, 0.8);

    // Tech badges pop up
    tl.to([...svg.querySelectorAll('.wa-badge'), ...svg.querySelectorAll('.wa-badge-t')], {
      opacity: 1, y: -8, duration: 0.35, stagger: 0.06, ease: 'back.out(2)'
    }, 1.3);

    return tl;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PILLAR 6 — Enterprise (hex nodes light up, glow spreads, flow lines dash, terminals appear)
  // ─────────────────────────────────────────────────────────────────────────
  function animateEnterprise(pillar) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const svg = pillar.querySelector('.enterprise-svg');
    if (!svg) return tl;

    // Hex grid brightens
    tl.to(svg.querySelector('.ent-hex-grid'), {
      opacity: 0.6, duration: 0.6, ease: 'power2.out'
    }, 0.1);

    // Active hexes light up one by one
    tl.to(svg.querySelectorAll('.ent-hex'), {
      opacity: 1, duration: 0.4, stagger: 0.12, ease: 'expo.out'
    }, 0.3);

    // Central glow expands
    tl.to(svg.querySelector('.ent-glow'), {
      opacity: 1, scale: 1.3, transformOrigin: 'center',
      duration: 0.8, ease: 'power2.out'
    }, 0.5);

    // Data flow lines appear with dash animation
    tl.to(svg.querySelectorAll('.ent-flow'), {
      opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out'
    }, 0.9);

    // Terminals slide in from below
    tl.to(svg.querySelectorAll('.ent-terminal'), {
      opacity: 1, y: -8, duration: 0.4, stagger: 0.1, ease: 'back.out(1.7)'
    }, 1.2);

    // Labels appear perfectly centered (matching the terminal's y: -8 shift)
    tl.fromTo(svg.querySelectorAll('.ent-label'),
      { y: -8, opacity: 0 },
      { opacity: 1, duration: 0.3, stagger: 0.08, ease: 'power2.out' },
      1.5
    );

    // Idle: hex pulse breathe
    tl.to(svg.querySelectorAll('.ent-hex'), {
      opacity: 0.5, duration: 1.5, ease: 'sine.inOut',
      yoyo: true, repeat: 20, stagger: { each: 0.3, from: 'random' }
    }, 1.8);

    return tl;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ANIMATION DISPATCH MAP
  // ─────────────────────────────────────────────────────────────────────────
  const animatorMap = {
    '1': animatePortfolio,
    '2': animateGrowth,
    '3': animateAI,
    '4': animateSocial,
    '5': animateWebApp,
    '6': animateEnterprise
  };

  // ─────────────────────────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const pillars = document.querySelectorAll('.service-pillar[data-pillar]');
    const accordion = document.querySelector('.services-accordion');
    if (!pillars.length) return;

    let autoPlayTimer;
    let isPaused = false;
    let currentIndex = 0;

    function nextPillar() {
      if (isPaused) return;
      currentIndex = (currentIndex + 1) % pillars.length;
      activatePillar(pillars[currentIndex], true);
    }

    function resetAutoPlay() {
      clearTimeout(autoPlayTimer);
      if (!isPaused) {
        autoPlayTimer = setTimeout(nextPillar, 5000);
      }
    }

    // Activate a pillar: expand it, kill sibling timelines, fire GSAP sequence
    function activatePillar(pillar, isAuto = false) {
      const id = pillar.dataset.pillar;
      
      if (!isAuto) {
        // Update currentIndex if manually activated
        pillars.forEach((p, index) => {
          if (p === pillar) currentIndex = index;
        });
      }

      if (pillar.classList.contains('active')) return; // already active

      // Collapse all others
      pillars.forEach(p => {
        if (p !== pillar) {
          const pid = p.dataset.pillar;
          killTimeline(pid);
          p.classList.remove('active');
          // Reset SVG visuals so they re-animate on next expand
          resetVisual(p);
        }
      });

      pillar.classList.add('active');
      resetAutoPlay();

      // Wait for the CSS flex transition to open before firing GSAP
      setTimeout(() => {
        killTimeline(id); // safety
        const animator = animatorMap[id];
        if (animator) {
          timelines[id] = animator(pillar);
        }
      }, Math.round(PILLAR_DUR * 1000 * 0.4)); // fire at 40% of expand
    }

    // Wire events
    pillars.forEach(pillar => {
      pillar.addEventListener('mouseenter', () => {
        isPaused = true;
        clearTimeout(autoPlayTimer);
        activatePillar(pillar);
      });
      pillar.addEventListener('mouseleave', () => {
        isPaused = false;
        resetAutoPlay();
      });
      pillar.addEventListener('click', () => {
        activatePillar(pillar);
      });
    });

    if (accordion) {
      accordion.addEventListener('mouseenter', () => { 
        isPaused = true; 
        clearTimeout(autoPlayTimer); 
      });
      accordion.addEventListener('mouseleave', () => { 
        isPaused = false; 
        resetAutoPlay(); 
      });
    }

    // Activate first pillar on load (after a short delay for page settle)
    setTimeout(() => {
      activatePillar(pillars[0]);
      resetAutoPlay();
    }, 800);
  });

})();
