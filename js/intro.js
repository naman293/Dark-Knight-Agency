/**
 * intro.js — Bat particle system, scroll-driven, infinite loop
 * ─────────────────────────────────────────────────────────────
 * Architecture:
 *
 * #bat-section  = 200vh tall container at the TOP of the page
 *   └ #bat-sticky = sticky 100vh inner, holds canvas
 *
 * Scroll 0→100vh  : bat assembles from screen edges, mouse deforms
 * Scroll 100→200vh: site content fades in below, bat fades out
 *
 * INFINITE LOOP:
 *   A duplicate #bat-section is appended at the BOTTOM of the page.
 *   When user scrolls to the bottom duplicate and it finishes,
 *   we silently teleport scroll position back to the top original
 *   (both are identical height, so pixel offset stays the same —
 *   no visible jump, perfectly seamless).
 *
 * Mouse: moves over bat → repulsion field deforms particles.
 *        Move away → spring back.
 */
(function () {
  'use strict';

  window.addEventListener('load', function () {

    var section = document.getElementById('bat-section');
    var hint = document.getElementById('bat-hint');
    if (!section) return;

    /* ── Build sticky inner structure ─────────────────────── */
    var sticky = document.createElement('div');
    sticky.id = 'bat-sticky';

    var progress = document.createElement('div');
    progress.id = 'bat-progress';
    sticky.appendChild(progress);

    var canvas = document.createElement('canvas');
    canvas.id = 'bat-canvas';
    sticky.appendChild(canvas);

    section.insertBefore(sticky, section.firstChild);
    if (hint) section.appendChild(hint);   /* keep hint inside section */

    /* ── Canvas / WebGL setup ─────────────────────────────── */
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;

    var batScale = 1.0;   /* set per breakpoint on resize */

    function resizeCanvas() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      if (gl) gl.viewport(0, 0, canvas.width, canvas.height);

      /* Fixed scale per breakpoint — simple and predictable.
         1.0 = original desktop size that looked correct.
         Smaller screens get proportionally smaller values.     */
      if (W >= 1200) batScale = 1.00;   /* desktop / laptop — original size */
      else if (W >= 900) batScale = 0.85;   /* small laptop / large tablet */
      else if (W >= 768) batScale = 0.72;   /* tablet portrait */
      else if (W >= 600) batScale = 0.60;   /* large phone landscape */
      else if (W >= 480) batScale = 0.50;   /* medium phone */
      else if (W >= 375) batScale = 0.42;   /* small phone */
      else batScale = 0.36;   /* tiny phone */
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    var gl = canvas.getContext('webgl', {
      alpha: true, premultipliedAlpha: false,
      antialias: false, depth: false
    });
    if (!gl) return;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.disable(gl.DEPTH_TEST);

    /* ── Shaders ──────────────────────────────────────────── */
    var VS = [
      'attribute vec2 aPos;',
      'attribute float aSz;',
      'attribute float aA;',
      'uniform vec2  uRes;',
      'uniform float uDPR;',
      'uniform float uScale;',   /* responsive scale — JS computes per screen */
      'varying float vA;',
      'void main(){',
      '  float asp = uRes.x / uRes.y;',
      /* Scale X by aspect, then apply uScale so logo fills screen on any device */
      '  vec2 c = vec2((aPos.x * uScale) / (2.0 * asp), (aPos.y * uScale) / 1.15);',
      '  gl_Position  = vec4(c, 0.0, 1.0);',
      '  gl_PointSize = aSz * uDPR;',
      '  vA = aA;',
      '}'
    ].join('\n');

    var FS = [
      'precision mediump float;',
      'varying float vA;',
      'void main(){',
      '  float d = length(gl_PointCoord - vec2(0.5));',
      '  if(d > 0.5) discard;',
      '  float s = 1.0 - smoothstep(0.08, 0.5, d);',
      '  vec3 col = mix(vec3(0.14,0.78,0.44), vec3(0.35,0.95,0.62), s * 0.5);',
      '  gl_FragColor = vec4(col, s * vA);',
      '}'
    ].join('\n');

    function mkShader(t, src) {
      var s = gl.createShader(t);
      gl.shaderSource(s, src); gl.compileShader(s); return s;
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    var locPos = gl.getAttribLocation(prog, 'aPos');
    var locSz = gl.getAttribLocation(prog, 'aSz');
    var locA = gl.getAttribLocation(prog, 'aA');
    var locRes = gl.getUniformLocation(prog, 'uRes');
    var locDPR = gl.getUniformLocation(prog, 'uDPR');
    var locScale = gl.getUniformLocation(prog, 'uScale');

    /* ── Particles ────────────────────────────────────────── */
    if (!window.BAT_PTS || !window.BAT_PTS.length) {
      console.warn('BAT_PTS not loaded'); return;
    }

    var PTS = window.BAT_PTS;
    /* Oversample 5x — each source point spawns 5 particles with
       enough jitter to fill gaps and create a truly solid mass     */
    var OVERSAMPLE = 8;
    var srcLen = Math.min(PTS.length, 6452);
    var N = srcLen * OVERSAMPLE;
    var JITTER = 0.042;   /* wider jitter to fill the denser mass */

    var posArr = new Float32Array(N * 2);
    var szArr = new Float32Array(N);
    var aArr = new Float32Array(N);

    var homX = new Float32Array(N);
    var homY = new Float32Array(N);
    var curX = new Float32Array(N);
    var curY = new Float32Array(N);
    var velX = new Float32Array(N);
    var velY = new Float32Array(N);
    var phi = new Float32Array(N);

    function scatterFromEdges(i) {
      /* Scatter across full screen — use same world-space as shader.
         BAT_PTS home coords are in ~[-2.1,2.1] x [-0.78,0.78].
         Spread 2x wider so particles truly come from all directions. */
      var asp = W / H;
      var rx = 2.0 * asp * 2.0;
      var ry = 1.15 * 2.0;
      curX[i] = (Math.random() * 2 - 1) * rx;
      curY[i] = (Math.random() * 2 - 1) * ry;
    }

    for (var i = 0; i < N; i++) {
      var pt = PTS[i % srcLen];
      homX[i] = pt[0] + (Math.random() - 0.5) * JITTER;
      homY[i] = pt[1] + (Math.random() - 0.5) * JITTER;
      scatterFromEdges(i);
      velX[i] = 0; velY[i] = 0;
      phi[i] = Math.random() * Math.PI * 2;
      szArr[i] = Math.random() * 1.5 + 0.7;
      aArr[i] = Math.random() * 0.30 + 0.62;  /* visible base */
    }

    var bufPos = gl.createBuffer();
    var bufSz = gl.createBuffer();
    var bufA = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, bufSz);
    gl.bufferData(gl.ARRAY_BUFFER, szArr, gl.STATIC_DRAW);

    function bindAll() {
      gl.bindBuffer(gl.ARRAY_BUFFER, bufPos);
      gl.enableVertexAttribArray(locPos);
      gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufSz);
      gl.enableVertexAttribArray(locSz);
      gl.vertexAttribPointer(locSz, 1, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufA);
      gl.enableVertexAttribArray(locA);
      gl.vertexAttribPointer(locA, 1, gl.FLOAT, false, 0, 0);
    }

    /* ── Scroll state ─────────────────────────────────────── */
    var scrollP = 0;   /* 0→1 within this bat section */
    var SPRING_BASE = 0.052;
    var DAMP = 0.74;
    var REP_R = 0.6;
    var REP_F = 0.06;
    var TURB = 0.0022;   /* 4x more turbulence — alive at rest */
    var TURB_SPD = 0.028;   /* faster phase = more organic motion */

    /* ── Mouse ────────────────────────────────────────────── */
    var mx = 9999, my = 9999, mActive = false;

    canvas.addEventListener('mousemove', function (e) {
      mActive = true;
      var r = canvas.getBoundingClientRect();
      var nx = ((e.clientX - r.left) / r.width - 0.5);
      var ny = -((e.clientY - r.top) / r.height - 0.5);
      var asp = W / H;
      /* Divide by batScale so mouse coords match scaled particle positions */
      mx = (nx * 2.0 * asp * 2) / batScale;
      my = (ny * 1.15 * 2) / batScale;
    });
    canvas.addEventListener('mouseleave', function () {
      mActive = false; mx = 9999; my = 9999;
    });

    /* ── Reset particles to edges (for loop restart) ───────── */
    function resetToEdges() {
      for (var i = 0; i < N; i++) {
        scatterFromEdges(i);
        velX[i] = 0; velY[i] = 0;
      }
    }

    /* ── Render loop ──────────────────────────────────────── */
    var globalAlpha = 1.0;  /* fades out as bat exits */

    function loop() {
      requestAnimationFrame(loop);

      /* Spring: ramps in on scroll-down, keeps minimum on scroll-up
         so logo stays formed and stable at any scroll position       */
      var targetSp = SPRING_BASE * Math.min(scrollP * 2.5, 1.0);
      var minSp = 0.005;   /* low baseline — turbulence has room to breathe */
      var sp = Math.max(targetSp, minSp);

      for (var i = 0; i < N; i++) {
        var px = curX[i], py = curY[i];
        var hx = homX[i], hy = homY[i];

        /* Spring toward home */
        velX[i] += (hx - px) * sp;
        velY[i] += (hy - py) * sp;

        /* Turbulence */
        phi[i] += TURB_SPD;
        velX[i] += Math.sin(phi[i] * 1.4) * TURB;
        velY[i] += Math.cos(phi[i] * 0.8) * TURB;
        /* second harmonic — makes motion feel more random, less uniform */
        velX[i] += Math.cos(phi[i] * 2.3 + 1.1) * TURB * 0.45;
        velY[i] += Math.sin(phi[i] * 1.7 + 0.7) * TURB * 0.45;

        /* Mouse repulsion */
        if (mActive && scrollP > 0.25) {
          var dx = px - mx, dy = py - my;
          var d2 = dx * dx + dy * dy;
          if (d2 < REP_R * REP_R && d2 > 0.0001) {
            var d = Math.sqrt(d2);
            var f = 1.0 - d / REP_R;
            velX[i] += (dx / d) * f * f * REP_F;
            velY[i] += (dy / d) * f * f * REP_F;
            /* no alpha boost — just physics, no color pop */
          } else {
            aArr[i] += (0.68 - aArr[i]) * 0.03;
          }
        }

        velX[i] *= DAMP;
        velY[i] *= DAMP;
        curX[i] = px + velX[i];
        curY[i] = py + velY[i];

        posArr[i * 2] = curX[i];
        posArr[i * 2 + 1] = curY[i];
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, bufPos);
      gl.bufferData(gl.ARRAY_BUFFER, posArr, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufA);
      gl.bufferData(gl.ARRAY_BUFFER, aArr, gl.DYNAMIC_DRAW);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.uniform2f(locRes, canvas.width, canvas.height);
      gl.uniform1f(locDPR, DPR);
      gl.uniform1f(locScale, batScale);
      bindAll();
      gl.drawArrays(gl.POINTS, 0, N);

      /* Smooth opacity both ways — fades out scrolling down, fades in scrolling up */
      var op;
      if (scrollP < 0.55) {
        op = 1.0;                                    /* fully visible */
      } else {
        op = Math.max(0, 1 - (scrollP - 0.55) * 3.0);  /* smooth fade out */
      }
      canvas.style.opacity = op.toFixed(3);
    }
    loop();

    /* ── Hint ─────────────────────────────────────────────── */
    setTimeout(function () {
      if (hint) hint.classList.add('visible');
    }, 2000);

    /* ── Scroll handler ─────────────────────────────────────
       Simple: track progress within the bat section only.
       Normal website end — no loop, no clone, no teleport.
    ──────────────────────────────────────────────────────── */
    var SH = section.offsetHeight;

    function onScroll() {
      SH = section.offsetHeight;
      var sy = window.scrollY;
      var top = section.offsetTop;
      var raw = (sy - top) / (SH - window.innerHeight);
      scrollP = Math.max(0, Math.min(1, raw));
      if (progress) progress.style.width = (scrollP * 100) + '%';
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

  }); /* end window.load */

})();