// timeline-engine.js — the Sacred Timeline.
// A canvas-rendered living network of luminous strands, flowing particles,
// and a beating Temporal Core. Pan / zoom / hover / click. No DOM per strand.

window.PARADOX = (function () {
  "use strict";
  const D = window.PARADOX_DATA;

  // ---- deterministic RNG --------------------------------------------------
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rnd = mulberry32(20260529);
  const rr = (a, b) => a + (b - a) * rnd();

  // ---- tunables (driven by tweaks) ---------------------------------------
  const cfg = {
    coreStyle: "heart",         // committed: the Cosmic Heart
    motion: 1.0,                // motion intensity
    hue: 158,                   // temporal emerald
    density: 1.0,
  };
  // energy color derived from hue
  function energy(l, a, hShift = 0) {
    return `oklch(${l} 0.16 ${cfg.hue + hShift} / ${a})`;
  }
  const GOLD = (a) => `oklch(0.86 0.12 86 / ${a})`;
  const WHITE = (a) => `oklch(0.97 0.01 ${cfg.hue} / ${a})`;

  // ---- geometry helpers ---------------------------------------------------
  // cubic bezier sampled to a polyline
  function bezier(p0, c0, c1, p1, n) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      const x = u*u*u*p0.x + 3*u*u*t*c0.x + 3*u*t*t*c1.x + t*t*t*p1.x;
      const y = u*u*u*p0.y + 3*u*u*t*c0.y + 3*u*t*t*c1.y + t*t*t*p1.y;
      pts.push({ x, y });
    }
    return pts;
  }
  function lengthOf(pts) {
    let L = 0;
    for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y);
    return L;
  }
  // position at parameter s in [0,1] along polyline (with cached cumulative lengths)
  function sampleAt(strand, s) {
    const pts = strand.pts, cum = strand.cum, total = strand.len;
    const target = s * total;
    let lo = 0, hi = cum.length - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < target) lo = m + 1; else hi = m; }
    const i = Math.max(1, lo);
    const seg = cum[i] - cum[i-1] || 1;
    const f = (target - cum[i-1]) / seg;
    const a = pts[i-1], b = pts[i];
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }

  // ---- world model --------------------------------------------------------
  const strands = [];   // {pts, cum, len, w, bright, phase, tone, flow, depth, particles:[]}
  const nodes = [];     // {x,y,type,data,r,strandRef}
  let trunk = null;

  function addStrand(pts, opts) {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum[i] = cum[i-1] + Math.hypot(pts[i].x-pts[i-1].x, pts[i].y-pts[i-1].y);
    const len = cum[cum.length - 1];
    const pc = Math.max(2, Math.round(len / 260 * (opts.pdens ?? 1)));
    const particles = [];
    for (let i = 0; i < pc; i++) particles.push({ s: rnd(), v: rr(0.04, 0.12) * (opts.flow || 1) });
    const s = { pts, cum, len, w: opts.w, bright: opts.bright, phase: rr(0, Math.PI*2),
      tone: opts.tone || "emerald", flow: opts.flow || 1, depth: opts.depth || 0, particles, hot: !!opts.hot };
    strands.push(s);
    return s;
  }

  // recursive organic branch growth
  function grow(origin, dir, lenScale, depth, hostTimeline, tone) {
    if (depth > 4 || lenScale < 60) return;
    const L = lenScale;
    const ang = dir;
    const end = { x: origin.x + Math.cos(ang) * L, y: origin.y + Math.sin(ang) * L };
    // control points bowed perpendicular for organic curve
    const perp = ang + Math.PI / 2;
    const bow = rr(-0.4, 0.4) * L;
    const c0 = { x: origin.x + Math.cos(ang)*L*0.35 + Math.cos(perp)*bow*0.5,
                 y: origin.y + Math.sin(ang)*L*0.35 + Math.sin(perp)*bow*0.5 };
    const c1 = { x: origin.x + Math.cos(ang)*L*0.7 + Math.cos(perp)*bow,
                 y: origin.y + Math.sin(ang)*L*0.7 + Math.sin(perp)*bow };
    const pts = bezier(origin, c0, c1, end, 26);
    const strand = addStrand(pts, {
      w: Math.max(0.6, 3.4 - depth * 0.7),
      bright: Math.max(0.18, 0.62 - depth * 0.1),
      tone, flow: 1, depth, hot: hostTimeline && hostTimeline.featured,
    });
    // children
    const kids = depth < 2 ? 2 + (rnd() < 0.6 ? 1 : 0) : (rnd() < 0.7 ? 2 : 1);
    for (let k = 0; k < kids; k++) {
      const spread = rr(0.35, 0.95) * (k % 2 === 0 ? 1 : -1);
      grow(end, ang + spread, L * rr(0.5, 0.72), depth + 1, hostTimeline, tone);
    }
    return { end, strand };
  }

  function build() {
    strands.length = 0; nodes.length = 0;
    // ---- the Sacred Timeline trunk: a vast horizontal spine through the core
    const span = 5200;
    const tp = [];
    for (let x = -span; x <= span; x += 80) {
      tp.push({ x, y: Math.sin(x * 0.0011) * 120 + Math.sin(x * 0.0004) * 280 });
    }
    trunk = addStrand(tp, { w: 5.5, bright: 0.85, tone: "emerald", flow: 1, depth: 0, pdens: 2.2 });
    trunk.isTrunk = true;

    // ---- ten timelines branch from the trunk -------------------------------
    const tl = D.timelines;
    tl.forEach((t, i) => {
      // cluster anchors in a tight band around the core so the timelines
      // visibly fan out from (and converge into) the central nexus
      const f01 = tl.length > 1 ? i / (tl.length - 1) : 0.5;
      const frac = 0.36 + f01 * 0.28;            // 0.36..0.64 of the trunk
      const anchor = sampleAt(trunk, frac);
      const up = i % 2 === 0 ? -1 : 1;
      // fan: vertical base with a horizontal lean growing toward the edges
      const lean = (f01 - 0.5) * 1.7;            // -0.85..0.85
      const baseAng = (-Math.PI / 2) * up + lean + rr(-0.14, 0.14);
      const tone = t.featured ? "gold" : "emerald";
      // primary limb
      const limbLen = t.featured ? 1180 : rr(720, 1040);
      const res = grow(anchor, baseAng, limbLen, 1, t, tone);
      const node = {
        x: res.end.x, y: res.end.y, type: "timeline", data: t,
        r: t.featured ? 26 : 17, strandRef: res.strand, anchor, frac,
      };
      nodes.push(node);
      t._node = node;

      // hang this timeline's branches / events / variants off its limb
      const kids = D.childrenOf(t.id);
      const limb = res.strand;
      const placeOn = (s) => {
        const p = sampleAt(limb, s);
        const ang2 = baseAng + rr(-0.7, 0.7);
        return { p, ang2 };
      };
      kids.branches.forEach((b, bi) => {
        const { p, ang2 } = placeOn(0.55 + (bi / Math.max(1, kids.branches.length)) * 0.4);
        const r2 = grow(p, ang2, rr(360, 560), 2, t, tone);
        nodes.push({ x: r2.end.x, y: r2.end.y, type: "branch", data: b, r: b.hot ? 12 : 9, strandRef: r2.strand });
      });
      kids.events.forEach((e, ei) => {
        const p = sampleAt(limb, 0.3 + ei * 0.18 % 0.6);
        nodes.push({ x: p.x, y: p.y, type: "event", data: e, r: 6, strandRef: limb });
      });
      kids.variants.forEach((v, vi) => {
        const { p, ang2 } = placeOn(0.7 + vi * 0.12);
        const r3 = grow(p, ang2 + rr(-0.4, 0.4), rr(180, 300), 3, t, tone);
        nodes.push({ x: r3.end.x, y: r3.end.y, type: "variant", data: v, r: 5, strandRef: r3.strand });
      });
    });

    // ---- faint deep field for infinite depth -------------------------------
    for (let i = 0; i < 90; i++) {
      const ox = rr(-span, span), oy = rr(-2600, 2600);
      const a = rr(0, Math.PI * 2), L = rr(140, 520);
      const e = { x: ox + Math.cos(a) * L, y: oy + Math.sin(a) * L };
      const pts = bezier({x:ox,y:oy}, {x:ox+Math.cos(a)*L*0.4,y:oy+Math.sin(a+0.5)*L*0.4},
                         {x:ox+Math.cos(a)*L*0.7,y:oy+Math.sin(a-0.5)*L*0.7}, e, 10);
      addStrand(pts, { w: 0.5, bright: rr(0.05, 0.13), tone: "emerald", depth: 5, pdens: 0.4 });
    }
  }

  // ---- camera -------------------------------------------------------------
  const REST_SCALE = 0.27; // resting zoom — frames the core + converging timelines
  const cam = { x: 0, y: 0, scale: 0.32, tx: 0, ty: 0, tscale: 0.32 };
  let W = 0, H = 0, DPR = 1;
  function worldToScreen(wx, wy) {
    return { x: (wx - cam.x) * cam.scale + W / 2, y: (wy - cam.y) * cam.scale + H / 2 };
  }
  function screenToWorld(sx, sy) {
    return { x: (sx - W / 2) / cam.scale + cam.x, y: (sy - H / 2) / cam.scale + cam.y };
  }
  function flyTo(wx, wy, scale, dur, ease) {
    cam.tx = wx; cam.ty = wy; if (scale) cam.tscale = scale;
    cam._flyStart = performance.now(); cam._flyDur = dur || 1200;
    cam._flyEase = ease || "out";
    cam._fx0 = cam.x; cam._fy0 = cam.y; cam._fs0 = cam.scale;
  }

  // ---- rendering ----------------------------------------------------------
  let canvas, ctx, t0 = performance.now(), running = true;
  let mouse = { x: -1, y: -1, over: null, overCore: false };
  let forceCoreHover = false; // external hover (e.g. hovering the Explore tab)
  const listeners = {};
  function emit(ev, payload) { (listeners[ev] || []).forEach((f) => f(payload)); }

  function toneColor(tone, l, a) {
    if (tone === "gold") return GOLD(a);
    return energy(l, a);
  }

  function drawStrand(s, time) {
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.0009 * (1 + s.depth*0.2) + s.phase);
    const b = s.bright * (0.7 + 0.3 * pulse);
    // skip strands fully offscreen (quick bbox via endpoints)
    const a0 = worldToScreen(s.pts[0].x, s.pts[0].y);
    const a1 = worldToScreen(s.pts[s.pts.length-1].x, s.pts[s.pts.length-1].y);
    const pad = 200;
    if ((a0.x < -pad && a1.x < -pad) || (a0.x > W+pad && a1.x > W+pad) ||
        (a0.y < -pad && a1.y < -pad) || (a0.y > H+pad && a1.y > H+pad)) return;

    ctx.beginPath();
    const first = worldToScreen(s.pts[0].x, s.pts[0].y);
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < s.pts.length; i++) { const p = worldToScreen(s.pts[i].x, s.pts[i].y); ctx.lineTo(p.x, p.y); }
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    // glow halo
    ctx.strokeStyle = toneColor(s.tone, 0.55, b * 0.16);
    ctx.lineWidth = Math.max(1, s.w * cam.scale * 4);
    ctx.stroke();
    // bright core
    ctx.strokeStyle = toneColor(s.tone, 0.72, b * 0.55);
    ctx.lineWidth = Math.max(0.5, s.w * cam.scale);
    ctx.stroke();
  }

  function drawParticles(s, time) {
    const dt = 0.0006 * cfg.motion;
    for (const pt of s.particles) {
      pt.s += pt.v * dt;
      if (pt.s > 1) pt.s -= 1;
      const w = sampleAt(s, pt.s);
      const p = worldToScreen(w.x, w.y);
      if (p.x < -20 || p.x > W+20 || p.y < -20 || p.y > H+20) continue;
      const r = Math.max(0.6, (s.w * 0.5 + 0.8) * cam.scale) * (s.depth < 2 ? 1.3 : 1);
      const tw = 0.6 + 0.4 * Math.sin(time*0.004 + pt.s*30);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.2);
      const col = s.tone === "gold" ? "0.9 0.12 86" : `0.85 0.15 ${cfg.hue}`;
      g.addColorStop(0, `oklch(${col} / ${0.9*tw})`);
      g.addColorStop(1, `oklch(${col} / 0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, r * 3.2, 0, Math.PI*2); ctx.fill();
    }
  }

  // ---- the Temporal Core --------------------------------------------------
  // screen-space radius of the core's clickable nucleus
  function coreHitRadius() { return Math.max(34, 120 * cam.scale * 1.5); }

  function drawCore(time) {
    const c = worldToScreen(0, 0);
    const R = 120 * cam.scale; // base radius in screen px scaled by zoom
    const hover = (mouse.overCore || forceCoreHover) ? 1 : 0;
    const beat = (0.5 + 0.5 * Math.sin(time * 0.0016 * cfg.motion)) * (1 + hover * 0.22) + hover * 0.12;
    ctx.save();
    ctx.translate(c.x, c.y);

    // ambient bloom shared by all cores
    const bloom = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 4.2);
    bloom.addColorStop(0, energy(0.7, 0.22 + beat*0.08));
    bloom.addColorStop(0.5, energy(0.5, 0.06));
    bloom.addColorStop(1, energy(0.5, 0));
    ctx.fillStyle = bloom;
    ctx.beginPath(); ctx.arc(0, 0, R * 4.2, 0, Math.PI*2); ctx.fill();

    // hover: a luminous halo + drawn-in ring inviting entry into the nexus
    if (hover) {
      const hb = ctx.createRadialGradient(0, 0, R*0.6, 0, 0, R*3.4);
      hb.addColorStop(0, energy(0.85, 0.18));
      hb.addColorStop(1, energy(0.7, 0));
      ctx.fillStyle = hb;
      ctx.beginPath(); ctx.arc(0, 0, R*3.4, 0, Math.PI*2); ctx.fill();
      const rr2 = R * (2.2 + 0.12*Math.sin(time*0.006));
      ctx.beginPath(); ctx.arc(0, 0, rr2, 0, Math.PI*2);
      ctx.strokeStyle = WHITE(0.5); ctx.lineWidth = 1.4; ctx.stroke();
    }

    coreHeart(time, R, beat);

    ctx.restore();
  }

  function coreHeart(time, R, beat) {
    // organic plexus: many fibers woven around a pulsing nucleus
    const fibers = 26;
    for (let i = 0; i < fibers; i++) {
      const base = (i/fibers)*Math.PI*2;
      ctx.beginPath();
      for (let s = 0; s <= 1.001; s += 0.08) {
        const ang = base + Math.sin(time*0.0009 + i)*0.5 + s*Math.PI*1.4;
        const rad = R*(0.5 + s*1.2) * (1 + 0.12*Math.sin(s*8 + time*0.0015 + i));
        const x = Math.cos(ang)*rad, y = Math.sin(ang)*rad*0.8;
        s === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.strokeStyle = energy(0.68, 0.12 + 0.05*Math.sin(time*0.002+i));
      ctx.lineWidth = 1.2; ctx.stroke();
    }
    const pump = 0.8 + beat*0.35;
    const core = ctx.createRadialGradient(0,0,0,0,0,R*1.1*pump);
    core.addColorStop(0, WHITE(0.92));
    core.addColorStop(0.25, energy(0.82, 0.8));
    core.addColorStop(0.7, energy(0.62, 0.22));
    core.addColorStop(1, energy(0.55, 0));
    ctx.fillStyle = core;
    ctx.beginPath(); ctx.arc(0,0,R*1.1*pump,0,Math.PI*2); ctx.fill();
  }

  // ---- node rendering -----------------------------------------------------
  function drawNode(n, time) {
    const p = worldToScreen(n.x, n.y);
    if (p.x < -60 || p.x > W+60 || p.y < -60 || p.y > H+60) return;
    const featured = n.type === "timeline" && n.data.featured;
    const hot = n.data && n.data.hot;
    const tone = featured ? "gold" : (hot ? "gold" : "emerald");
    const pulse = 0.5 + 0.5 * Math.sin(time*0.002 + n.x*0.01);
    let r = n.r * (n.type === "timeline" ? 1 : 0.9);
    const sr = Math.max(2.2, r * cam.scale);
    const isHover = mouse.over === n;
    const k = isHover ? 1.5 : 1;

    // halo
    const halo = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,sr*4*k);
    halo.addColorStop(0, toneColor(tone, 0.8, (featured?0.5:0.32) + pulse*0.12));
    halo.addColorStop(1, toneColor(tone, 0.6, 0));
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(p.x,p.y,sr*4*k,0,Math.PI*2); ctx.fill();
    // ring for timelines
    if (n.type === "timeline") {
      ctx.beginPath(); ctx.arc(p.x,p.y,sr*1.9*k,0,Math.PI*2);
      ctx.strokeStyle = toneColor(tone, 0.8, 0.5); ctx.lineWidth = 1.4; ctx.stroke();
    }
    // dot
    const dot = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,sr*k);
    dot.addColorStop(0, WHITE(0.95));
    dot.addColorStop(0.5, toneColor(tone, 0.85, 0.95));
    dot.addColorStop(1, toneColor(tone, 0.7, 0.2));
    ctx.fillStyle = dot;
    ctx.beginPath(); ctx.arc(p.x,p.y,sr*k,0,Math.PI*2); ctx.fill();

    n._screen = p; n._sr = sr;

    // persistent label for timeline nodes when zoomed in enough or featured
    if (n.type === "timeline" && (cam.scale > 0.5 || featured || isHover)) {
      const fs = Math.min(22, Math.max(12, 13 * (featured?1.25:1)));
      ctx.font = `${featured?600:500} ${fs}px "Cormorant Garamond", Georgia, serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = featured ? GOLD(0.95) : WHITE(0.86);
      ctx.fillText(n.data.title, p.x + sr*2.2 + 6, p.y);
      if (featured) {
        ctx.font = `500 10px "Space Grotesk", system-ui, sans-serif`;
        ctx.fillStyle = energy(0.7, 0.6);
        ctx.fillText("FEATURED TIMELINE", p.x + sr*2.2 + 6, p.y + fs*0.95);
      }
    }
  }

  // ---- main loop ----------------------------------------------------------
  function frame() {
    if (!running) { requestAnimationFrame(frame); return; }
    // size from the window (never from the canvas element itself — a canvas
    // takes layout size from its width/height attrs, which would feed back)
    if (window.innerWidth !== _cw || window.innerHeight !== _ch) resize();
    const time = performance.now() - t0;

    // camera easing
    if (cam._flyStart != null) {
      const k = Math.min(1, (performance.now() - cam._flyStart) / cam._flyDur);
      const e = cam._flyEase === "in" ? k * k * k : 1 - Math.pow(1 - k, 3);
      cam.x = cam._fx0 + (cam.tx - cam._fx0) * e;
      cam.y = cam._fy0 + (cam.ty - cam._fy0) * e;
      cam.scale = cam._fs0 + (cam.tscale - cam._fs0) * e;
      if (k >= 1) cam._flyStart = null;
    } else {
      cam.x += (cam.tx - cam.x) * 0.08;
      cam.y += (cam.ty - cam.y) * 0.08;
      cam.scale += (cam.tscale - cam.scale) * 0.08;
    }

    // clear with deep green-black void + subtle vignette
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createRadialGradient(W*0.5, H*0.52, 0, W*0.5, H*0.52, Math.max(W,H)*0.75);
    bg.addColorStop(0, "oklch(0.16 0.03 158)");
    bg.addColorStop(0.5, "oklch(0.10 0.02 158)");
    bg.addColorStop(1, "oklch(0.045 0.012 158)");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = "lighter";
    for (const s of strands) drawStrand(s, time);
    for (const s of strands) drawParticles(s, time);
    drawCore(time);
    for (const n of nodes) drawNode(n, time);
    ctx.globalCompositeOperation = "source-over";

    // hover detection
    updateHover();

    requestAnimationFrame(frame);
  }

  function updateHover() {
    if (mouse.x < 0) { setOver(null); setOverCore(false); return; }
    let best = null, bestD = 26 * 26;
    for (const n of nodes) {
      if (!n._screen) continue;
      const dx = n._screen.x - mouse.x, dy = n._screen.y - mouse.y;
      const thresh = Math.max(16, n._sr * 2.4);
      const d = dx*dx + dy*dy;
      if (d < thresh*thresh && d < bestD) { best = n; bestD = d; }
    }
    setOver(best);
    // the central nexus is clickable only when no node is under the cursor
    let coreHit = false;
    if (!best) {
      const c = worldToScreen(0, 0);
      coreHit = Math.hypot(c.x - mouse.x, c.y - mouse.y) < coreHitRadius();
    }
    setOverCore(coreHit);
  }
  let _overEmit = null;
  function setOver(n) {
    if (mouse.over === n) return;
    mouse.over = n;
    canvas.style.cursor = n ? "pointer" : (mouse.overCore ? "pointer" : "grab");
    emit("hover", n);
  }
  function setOverCore(v) {
    if (mouse.overCore === v) return;
    mouse.overCore = v;
    if (!mouse.over) canvas.style.cursor = v ? "pointer" : "grab";
    emit("coreHover", v);
  }

  // ---- interaction --------------------------------------------------------
  let dragging = false, dragMoved = false, last = null;
  function bindEvents() {
    canvas.addEventListener("mousedown", (e) => {
      dragging = true; dragMoved = false; last = { x: e.clientX, y: e.clientY };
      cam._flyStart = null; canvas.style.cursor = "grabbing";
    });
    window.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      if (dragging) {
        const dx = e.clientX - last.x, dy = e.clientY - last.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
        cam.x -= dx / cam.scale; cam.y -= dy / cam.scale;
        cam.tx = cam.x; cam.ty = cam.y;
        last = { x: e.clientX, y: e.clientY };
      }
    });
    window.addEventListener("mouseup", () => {
      dragging = false; canvas.style.cursor = mouse.over ? "pointer" : "grab";
    });
    canvas.addEventListener("mouseleave", () => { mouse.x = -1; mouse.y = -1; });
    canvas.addEventListener("click", () => {
      if (dragMoved) return;
      if (mouse.over) selectNode(mouse.over);
      else if (mouse.overCore) emit("core");
      else emit("blank");
    });
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const before = screenToWorld(mx, my);
      const factor = Math.exp(-e.deltaY * 0.0012);
      cam.tscale = Math.min(2.6, Math.max(0.12, cam.tscale * factor));
      cam.scale = Math.min(2.6, Math.max(0.12, cam.scale * factor));
      const after = screenToWorld(mx, my);
      cam.x += before.x - after.x; cam.y += before.y - after.y;
      cam.tx = cam.x; cam.ty = cam.y; cam._flyStart = null;
    }, { passive: false });
  }

  function selectNode(n) {
    const scale = n.type === "timeline" ? 0.95 : 1.4;
    flyTo(n.x, n.y - (60/scale), Math.min(2.2, scale), 1300);
    emit("select", n);
  }

  // ---- branch creation ----------------------------------------------------
  function createBranch(timelineNode, name) {
    const limb = timelineNode.strandRef;
    const p = sampleAt(limb, rr(0.45, 0.85));
    const ang = Math.atan2(p.y - timelineNode.anchor.y, p.x - timelineNode.anchor.x) + rr(-0.8, 0.8);
    const r = grow(p, ang, rr(360, 520), 2, timelineNode.data, timelineNode.data.featured ? "gold" : "emerald");
    const node = { x: r.end.x, y: r.end.y, type: "branch",
      data: { title: name, timeline: timelineNode.data.id, variants: 0, hot: true, fresh: true },
      r: 12, strandRef: r.strand, _born: performance.now() };
    nodes.push(node);
    flyTo(node.x, node.y, 1.4, 1100);
    emit("branchCreated", node);
    return node;
  }

  // ---- resize / init ------------------------------------------------------
  let _cw = 0, _ch = 0;
  const MAX_BUFFER = 6144; // guard against oversized buffers under host zoom
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    // drive from the window viewport — immune to host zoom transforms AND to
    // the canvas element's own intrinsic size (which follows its width attr)
    W = window.innerWidth; H = window.innerHeight;
    _cw = W; _ch = H;
    const bw = Math.min(MAX_BUFFER, Math.max(1, Math.round(W * DPR)));
    const bh = Math.min(MAX_BUFFER, Math.max(1, Math.round(H * DPR)));
    canvas.width = bw; canvas.height = bh;
    ctx.setTransform(bw / W, 0, 0, bh / H, 0, 0);
  }

  function init(cv) {
    canvas = cv; ctx = canvas.getContext("2d");
    build(); resize(); bindEvents();
    window.addEventListener("resize", resize);
    // ensure correct size once layout + fonts settle
    requestAnimationFrame(resize);
    window.addEventListener("load", resize);
    const warpBack = (typeof location !== "undefined") && new URLSearchParams(location.search).get("warp");
    if (warpBack) {
      // returning from Explore: emerge from inside the nexus and zoom back OUT
      // to the wide resting view — quick, decelerating, no onboarding pause.
      cam.x = 0; cam.y = 0; cam.scale = 3.6;
      cam.tx = 0; cam.ty = 0; cam.tscale = REST_SCALE;
      flyTo(0, 0, REST_SCALE, 1350, "out");
    } else {
      // cinematic first arrival: start inside the core, pull back to reveal the network
      cam.x = 0; cam.y = 0; cam.scale = 1.9;
      cam.tx = 0; cam.ty = 0; cam.tscale = REST_SCALE;
      flyTo(0, 0, REST_SCALE, 3200);
    }
    requestAnimationFrame(frame);
    return api;
  }

  const api = {
    init,
    on: (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); return api; },
    setTweak: (k, v) => {
      if (k === "coreStyle") cfg.coreStyle = v;
      else if (k === "motion") cfg.motion = v;
      else if (k === "hue") cfg.hue = v;
      else if (k === "density") cfg.density = v;
    },
    flyToTimeline: (id) => { const t = D.byId(id); if (t && t._node) selectNode(t._node); },
    selectNode,
    createBranch,
    resetView: () => flyTo(0, 0, REST_SCALE, 1400),
    // cinematic dive INTO the nexus — used by the seamless Explore transition
    enterCore: (dur) => flyTo(0, 0, 4.2, dur || 1050, "in"),
    // light up the nexus from outside (used when hovering the Explore tab)
    setCoreHover: (v) => { forceCoreHover = !!v; },
    getView: () => ({ x: cam.x, y: cam.y, scale: cam.scale, restScale: REST_SCALE }),
    getNodeById: (id) => { const t = D.byId(id); return t && t._node; },
    // find the actual scene node whose .data matches a predicate (branch/event/variant/timeline)
    findNode: (pred) => nodes.find((n) => { try { return pred(n); } catch (e) { return false; } }),
    pause: () => { running = false; },
    resume: () => { running = true; },
  };
  return api;
})();
