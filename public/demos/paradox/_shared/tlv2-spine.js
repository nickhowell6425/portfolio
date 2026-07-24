// tlv2-spine.js — the centerpiece of the reimagined Timeline View.
// A full-bleed, cinematic "Sacred Timeline" for a SINGLE universe: a luminous
// horizontal river of canon Events flowing left (origin) → right (now), with
// alternate-reality Branches forking DRAMATICALLY off the divergence points.
// Pan, zoom, hover, select, scrub, guided tour, and mode-driven highlighting.
// Pure canvas (glow + particles + crisp serif labels) behind floating glass UI.

window.TLV2_SPINE = (function () {
  "use strict";

  function mulberry32(a){return function(){a|=0;a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}

  // palette helpers — tone "em" = emerald (canon), "gd" = gold (divergence/hot)
  const EM = (l, a) => `oklch(${l} 0.15 158 / ${a})`;
  const GD = (l, a) => `oklch(${l} 0.12 86 / ${a})`;
  const WH = (a) => `oklch(0.98 0.012 158 / ${a})`;
  const tone = (t, l, a) => (t === "gd" ? GD(l, a) : EM(l, a));

  let canvas, ctx, W = 0, H = 0, DPR = 1, _vw = 0, _vh = 0;
  let nodes = [], strands = [], t0 = performance.now();
  let CONTENT = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  const cb = { hover(){}, select(){}, frame(){}, tourState(){} };
  const cam = { x: 0, y: 0, scale: 1, tx: 0, ty: 0, tscale: 1 };
  let mouse = { x: -1e4, y: -1e4, in: false }, hoverNode = null;
  let highlightSet = null;            // Set of node ids to spotlight (variant/contributor modes)
  let touring = false, tourIdx = 0, tourTimer = null;
  const GAP = 460;                    // horizontal spacing between canon events

  // ---- geometry ----------------------------------------------------------
  function bezier(p0, c0, c1, p1, n) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      pts.push({
        x: u*u*u*p0.x + 3*u*u*t*c0.x + 3*u*t*t*c1.x + t*t*t*p1.x,
        y: u*u*u*p0.y + 3*u*u*t*c0.y + 3*u*t*t*c1.y + t*t*t*p1.y,
      });
    }
    return pts;
  }
  function mkStrand(pts, opts) {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum[i] = cum[i-1] + Math.hypot(pts[i].x-pts[i-1].x, pts[i].y-pts[i-1].y);
    const len = cum[cum.length-1] || 1;
    const pc = Math.max(2, Math.round(len / 130));
    const rng = mulberry32(Math.round(pts[0].x*13 + pts[0].y*7 + len) | 0);
    const particles = [];
    for (let i = 0; i < pc; i++) particles.push({ s: rng(), v: 0.05 + rng()*0.07 });
    const s = { pts, cum, len, particles, owner: null, ...opts };
    strands.push(s);
    return s;
  }
  function sampleAt(s, f) {
    const target = f * s.len;
    let lo = 0, hi = s.cum.length-1;
    while (lo < hi) { const m = (lo+hi)>>1; if (s.cum[m] < target) lo = m+1; else hi = m; }
    const i = Math.max(1, lo), seg = s.cum[i]-s.cum[i-1] || 1, k = (target - s.cum[i-1])/seg;
    const a = s.pts[i-1], b = s.pts[i];
    return { x: a.x+(b.x-a.x)*k, y: a.y+(b.y-a.y)*k };
  }

  // ---- build the world ---------------------------------------------------
  function build(chronology, branches) {
    nodes = []; strands = [];
    const wave = (x) => Math.sin(x * 0.0021) * 52 + Math.sin(x * 0.0008) * 22;

    const x0 = -360, x1 = (chronology.length - 1) * GAP + 420;

    // the canon spine (luminous trunk)
    const spinePts = [];
    for (let x = x0; x <= x1; x += 22) spinePts.push({ x, y: wave(x) });
    mkStrand(spinePts, { tone: "em", w: 6.5, bright: 1, trunk: true });

    // origin seal (the beginning of the universe) at far left
    nodes.push({ type: "origin", x: x0 + 40, y: wave(x0 + 40), r: 13, label: "ORIGIN", id: "__origin" });

    // event nodes spaced along the spine
    const evPos = {};
    chronology.forEach((ev, i) => {
      const x = i * GAP, y = wave(x);
      evPos[ev.title] = { x, y };
      nodes.push({
        type: "event", data: ev, x, y, r: ev.pivotal ? 22 : 14,
        gold: !!ev.pivotal, live: !!ev.live, label: ev.title, idx: i, id: ev.id,
      });
    });

    // frontier (the story keeps unfolding) at far right
    nodes.push({ type: "frontier", x: x1 - 40, y: wave(x1 - 40), r: 10, label: "UNFOLDING", id: "__frontier" });

    // branches fork DRAMATICALLY off their divergence event
    let dir = -1;
    const byOrigin = {};
    branches.forEach((b) => {
      const anchor = evPos[b.origin] || evPos[chronology[Math.floor(chronology.length/2)].title];
      const slot = (byOrigin[b.origin] = (byOrigin[b.origin] || 0) + 1);
      dir = -dir;
      const d = dir;
      const reach = (b.hot ? 360 : 270) + slot * 22;
      const run = 360 + slot * 40;
      const end = { x: anchor.x + run, y: anchor.y + d * reach };
      const c0 = { x: anchor.x + 24, y: anchor.y + d * 36 };
      const c1 = { x: anchor.x + run * 0.55, y: anchor.y + d * reach * 0.92 };
      const pts = bezier(anchor, c0, c1, end, 30);
      const st = mkStrand(pts, { tone: b.hot ? "gd" : "em", w: b.hot ? 3.0 : 2.2, bright: b.hot ? 0.85 : 0.6, branch: true });
      const bn = { type: "branch", data: b, x: end.x, y: end.y, r: b.hot ? 15 : 11,
        gold: !!b.hot, label: b.title, dir: d, id: "br_" + b.title.replace(/\W+/g, "_") };
      st.owner = bn.id;
      nodes.push(bn);
      // faint continuation — the reality keeps going off into its own future
      const tail = bezier(end, { x: end.x + 80, y: end.y + d*18 },
        { x: end.x + 190, y: end.y + d*8 }, { x: end.x + 300, y: end.y + d*40 }, 18);
      const tn = mkStrand(tail, { tone: b.hot ? "gd" : "em", w: 1.3, bright: 0.34, branch: true });
      tn.owner = bn.id;
      // a couple of whisper-tendrils near hot branches (thousands of sub-realities)
      if (b.hot) {
        for (let k = 0; k < 2; k++) {
          const off = (k - 0.5) * 60;
          const tp = bezier(end, { x: end.x + 40, y: end.y + d*30 + off },
            { x: end.x + 110, y: end.y + d*60 + off }, { x: end.x + 170, y: end.y + d*92 + off }, 14);
          const wn = mkStrand(tp, { tone: "gd", w: 0.9, bright: 0.22, branch: true });
          wn.owner = bn.id;
        }
      }
    });

    // content bounds — X spans the canon events (+ margin) so the minimap reads
    // cleanly; far branch tails are allowed to trail off the edges.
    let minY=1e9, maxY=-1e9;
    strands.forEach((s) => s.pts.forEach((p) => { if (p.y<minY) minY=p.y; if (p.y>maxY) maxY=p.y; }));
    CONTENT = { minX: x0, maxX: (chronology.length - 1) * GAP + 360, minY, maxY };
  }

  // ---- camera ------------------------------------------------------------
  function w2s(wx, wy) { return { x: (wx-cam.x)*cam.scale + W/2, y: (wy-cam.y)*cam.scale + H/2 }; }
  function s2w(sx, sy) { return { x: (sx-W/2)/cam.scale + cam.x, y: (sy-H/2)/cam.scale + cam.y }; }
  const clampScale = (s) => Math.min(2.6, Math.max(0.34, s));

  // hero framing: punchy scale centered on the great divergence, so the spine
  // dominates the screen. Whole-canon orientation lives in the minimap.
  function heroScale() { return clampScale(Math.min(0.95, W / (2.6 * GAP))); }
  function heroNode() { return nodes.find((n) => n.type === "event" && n.gold) || nodes.find((n) => n.type === "event") || { x: 0 }; }
  function fit(animate) {
    const n = heroNode(), s = heroScale();
    if (animate) { cam.tx = n.x; cam.ty = 0; cam.tscale = s; }
    else { cam.x = cam.tx = n.x; cam.y = cam.ty = 0; cam.scale = cam.tscale = s; }
  }
  function zoomBy(f) { cam.tscale = clampScale(cam.tscale * f); }
  function focusXY(x, y, s) { cam.tx = x; cam.ty = y; if (s) cam.tscale = clampScale(s); }

  // ---- rendering ---------------------------------------------------------
  function nodeAlpha(n) {
    if (!highlightSet) return 1;
    if (n.type === "origin" || n.type === "frontier") return 0.5;
    return highlightSet.has(n.id) ? 1 : 0.18;
  }
  function strandAlpha(s) {
    if (!highlightSet) return 1;
    if (s.trunk) return 0.6;
    return (s.owner && highlightSet.has(s.owner)) ? 1 : 0.14;
  }

  function drawStrand(s, time) {
    const a = strandAlpha(s);
    const pulse = 0.5 + 0.5*Math.sin(time*0.001 + s.pts[0].x*0.01);
    const b = (s.bright || 0.5) * (0.78 + 0.22*pulse) * a;
    ctx.beginPath();
    const f = w2s(s.pts[0].x, s.pts[0].y); ctx.moveTo(f.x, f.y);
    for (let i = 1; i < s.pts.length; i++) { const p = w2s(s.pts[i].x, s.pts[i].y); ctx.lineTo(p.x, p.y); }
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = tone(s.tone, 0.55, b*0.22);
    ctx.lineWidth = Math.max(1.4, s.w * cam.scale * 4.0);
    ctx.stroke();
    ctx.strokeStyle = tone(s.tone, 0.8, b*0.72);
    ctx.lineWidth = Math.max(0.8, s.w * cam.scale * 1.15);
    ctx.stroke();
  }
  function drawParticles(s, time) {
    const a = strandAlpha(s);
    if (a < 0.2) return;
    const dirSign = s.branch ? 1 : 1; // flow toward the future / outward along branches
    for (const pt of s.particles) {
      pt.s += pt.v * 0.0011 * dirSign;
      if (pt.s > 1) pt.s -= 1; if (pt.s < 0) pt.s += 1;
      const w = sampleAt(s, pt.s), p = w2s(w.x, w.y);
      if (p.x < -30 || p.x > W+30 || p.y < -30 || p.y > H+30) continue;
      const r = Math.max(0.7, (s.w*0.5 + 0.8) * cam.scale) * 3;
      const col = s.tone === "gd" ? "0.9 0.12 86" : "0.86 0.15 158";
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, `oklch(${col} / ${0.85*a})`); g.addColorStop(1, `oklch(${col} / 0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI*2); ctx.fill();
    }
  }
  function drawNode(n, time) {
    const p = w2s(n.x, n.y); n._sx = p.x; n._sy = p.y;
    if (p.x < -160 || p.x > W+160 || p.y < -160 || p.y > H+160) return;
    const a = nodeAlpha(n);
    const pulse = 0.5 + 0.5*Math.sin(time*0.002 + n.x*0.01);
    const isHover = hoverNode === n;
    const k = isHover ? 1.5 : 1;
    const gold = n.gold, T = gold ? "gd" : "em";

    if (n.type === "origin" || n.type === "frontier") {
      const sr = Math.max(3, n.r*cam.scale);
      const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sr*5*k);
      halo.addColorStop(0, WH(0.4*a + pulse*0.1*a)); halo.addColorStop(1, WH(0));
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(p.x, p.y, sr*5*k, 0, Math.PI*2); ctx.fill();
      // sacred ring
      ctx.beginPath(); ctx.arc(p.x, p.y, sr*1.7, 0, Math.PI*2);
      ctx.strokeStyle = WH(0.5*a); ctx.lineWidth = 1.2; ctx.stroke();
      const dot = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sr);
      dot.addColorStop(0, WH(0.95*a)); dot.addColorStop(1, EM(0.8, 0.2*a));
      ctx.fillStyle = dot; ctx.beginPath(); ctx.arc(p.x, p.y, sr, 0, Math.PI*2); ctx.fill();
      drawLabel(n, p, sr, isHover, a);
      return;
    }

    const sr = Math.max(3, n.r*cam.scale);
    // halo
    const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sr*4.4*k);
    halo.addColorStop(0, tone(T, 0.8, ((gold?0.6:0.46) + pulse*0.14)*a));
    halo.addColorStop(1, tone(T, 0.6, 0));
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(p.x, p.y, sr*4.4*k, 0, Math.PI*2); ctx.fill();
    // divergence ring on events (pivotal gets a rotating dashed ring)
    if (n.type === "event") {
      ctx.beginPath(); ctx.arc(p.x, p.y, sr*1.85*k, 0, Math.PI*2);
      ctx.strokeStyle = tone(T, 0.82, 0.55*a); ctx.lineWidth = 1.3; ctx.stroke();
      if (gold) {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(time*0.0004);
        ctx.beginPath(); ctx.arc(0, 0, sr*2.6*k, 0, Math.PI*2);
        ctx.setLineDash([4, 7]); ctx.strokeStyle = GD(0.86, 0.5*a); ctx.lineWidth = 1.1; ctx.stroke();
        ctx.restore();
      }
    } else if (n.type === "branch") {
      // branch nodes get a soft diamond accent to read as "alternate"
      ctx.beginPath(); ctx.arc(p.x, p.y, sr*1.7*k, 0, Math.PI*2);
      ctx.strokeStyle = tone(T, 0.8, 0.4*a); ctx.lineWidth = 1; ctx.stroke();
    }
    // core
    const dot = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sr*k);
    dot.addColorStop(0, WH(0.96*a));
    dot.addColorStop(0.5, tone(T, 0.85, 0.95*a));
    dot.addColorStop(1, tone(T, 0.7, 0.2*a));
    ctx.fillStyle = dot; ctx.beginPath(); ctx.arc(p.x, p.y, sr*k, 0, Math.PI*2); ctx.fill();
    // live ping
    if (n.live) {
      const lp = (time*0.0011) % 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, sr*(1.8 + lp*3), 0, Math.PI*2);
      ctx.strokeStyle = EM(0.82, (1-lp)*0.5*a); ctx.lineWidth = 1.4; ctx.stroke();
    }
    drawLabel(n, p, sr, isHover, a);
  }
  function drawLabel(n, p, sr, isHover, a) {
    if (a < 0.3 && !isHover) return;
    const gold = n.gold, T = gold ? "gd" : "em";
    if (n.type === "origin" || n.type === "frontier") {
      ctx.font = `600 ${Math.max(9, 10)}px "Space Grotesk", sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = WH(0.6*a);
      ctx.save(); ctx.letterSpacing = "3px";
      ctx.fillText(n.label, p.x, p.y + sr*2 + 12); ctx.restore();
      return;
    }
    const showLabel = n.type === "event" || cam.scale > 0.62 || isHover || gold;
    if (!showLabel || !n.label) return;
    const isEvent = n.type === "event";
    const fs = isEvent ? Math.min(26, Math.max(15, (gold ? 22 : 18) * Math.min(1.15, cam.scale + 0.5)))
                       : Math.min(19, Math.max(13, 15 * Math.min(1.1, cam.scale + 0.4)));
    const below = isEvent ? (n.idx % 2 === 1) : (n.dir > 0);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const ly = p.y + (below ? sr*2 + fs*0.78 : -(sr*2 + fs*0.5));
    // chapter kicker for events
    if (isEvent) {
      ctx.font = `500 ${Math.max(8, fs*0.42)}px "Space Grotesk", sans-serif`;
      ctx.fillStyle = tone(T, 0.74, 0.85*a);
      ctx.save(); ctx.letterSpacing = "2px";
      const ky = below ? ly - fs*0.72 : ly + fs*0.72;
      ctx.fillText((n.data.chapter || "").toUpperCase(), p.x, ky); ctx.restore();
    } else {
      // "from" origin kicker for branches
      ctx.font = `500 ${Math.max(8, fs*0.5)}px "Space Grotesk", sans-serif`;
      ctx.fillStyle = tone(T, 0.7, 0.7*a);
      ctx.save(); ctx.letterSpacing = "1px";
      const ky = below ? ly - fs*0.66 : ly + fs*0.66;
      ctx.fillText((n.data.hot ? "TRENDING BRANCH" : "BRANCH"), p.x, ky); ctx.restore();
    }
    ctx.font = `${gold?600:500} ${fs}px "Cormorant Garamond", Georgia, serif`;
    ctx.fillStyle = isHover ? tone(T, 0.9, 0.99) : WH((gold?0.95:0.86)*a);
    ctx.fillText(n.label, p.x, ly);
  }

  function frame() {
    if (window.innerWidth !== _vw || window.innerHeight !== _vh || canvas.clientWidth !== W) resize();
    const time = performance.now() - t0;
    cam.x += (cam.tx - cam.x) * 0.10;
    cam.y += (cam.ty - cam.y) * 0.10;
    cam.scale += (cam.tscale - cam.scale) * 0.10;

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    for (const s of strands) drawStrand(s, time);
    for (const s of strands) drawParticles(s, time);
    for (const n of nodes) drawNode(n, time);
    ctx.globalCompositeOperation = "source-over";

    updateHover();
    cb.frame(viewState());
    requestAnimationFrame(frame);
  }

  function viewState() {
    const cw = CONTENT.maxX - CONTENT.minX || 1;
    const visW = W / cam.scale;
    return {
      cam: { x: cam.x, y: cam.y, scale: cam.scale },
      content: CONTENT,
      window: { center: (cam.x - CONTENT.minX) / cw, half: (visW / 2) / cw },
      touring,
    };
  }

  function updateHover() {
    if (!mouse.in) { setHover(null); return; }
    let best = null, bestD = 1e9;
    for (const n of nodes) {
      if (n._sx == null || n.type === "origin" || n.type === "frontier") continue;
      if (highlightSet && !highlightSet.has(n.id)) continue;
      const dx = n._sx - mouse.x, dy = n._sy - mouse.y, d = dx*dx + dy*dy;
      const th = Math.max(18, n.r * cam.scale * 2.4);
      if (d < th*th && d < bestD) { best = n; bestD = d; }
    }
    setHover(best);
  }
  function setHover(n) {
    if (hoverNode === n) { if (n) cb.hover(n, n._sx, n._sy); return; }
    hoverNode = n;
    canvas.style.cursor = n ? "pointer" : "grab";
    cb.hover(n, n ? n._sx : 0, n ? n._sy : 0);
  }

  // ---- guided tour -------------------------------------------------------
  const eventNodes = () => nodes.filter((n) => n.type === "event");
  function tourStep() {
    const evs = eventNodes(); if (!evs.length) return;
    const n = evs[tourIdx % evs.length];
    focusXY(n.x, n.y, Math.max(1.05, cam.tscale));
    cb.select(n, true);
    tourIdx++;
  }
  function setTour(on) {
    touring = on;
    clearTimeout(tourTimer); if (tourTimer) clearInterval(tourTimer);
    cb.tourState(on);
    if (on) {
      tourIdx = 0; tourStep();
      tourTimer = setInterval(tourStep, 3600);
    }
  }

  // ---- interaction -------------------------------------------------------
  let dragging = false, moved = false, last = null;
  function stopTourOnInteract() { if (touring) setTour(false); }
  function bind() {
    canvas.addEventListener("mousedown", (e) => { dragging = true; moved = false; last = { x: e.clientX, y: e.clientY }; canvas.style.cursor = "grabbing"; });
    window.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      mouse.in = mouse.x >= 0 && mouse.x <= r.width && mouse.y >= 0 && mouse.y <= r.height;
      if (dragging) {
        const dx = e.clientX - last.x, dy = e.clientY - last.y;
        if (Math.abs(dx)+Math.abs(dy) > 3) { moved = true; stopTourOnInteract(); }
        cam.x -= dx / cam.scale; cam.y -= dy / cam.scale;
        cam.tx = cam.x; cam.ty = cam.y; last = { x: e.clientX, y: e.clientY };
      }
    });
    window.addEventListener("mouseup", () => { dragging = false; canvas.style.cursor = hoverNode ? "pointer" : "grab"; });
    canvas.addEventListener("mouseleave", () => { mouse.in = false; });
    canvas.addEventListener("click", () => { if (moved) return; if (hoverNode) { stopTourOnInteract(); cb.select(hoverNode); } });
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault(); stopTourOnInteract();
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const before = s2w(mx, my);
      const factor = Math.exp(-e.deltaY * 0.0013);
      cam.scale = cam.tscale = clampScale(cam.scale * factor);
      const after = s2w(mx, my);
      cam.x += before.x - after.x; cam.y += before.y - after.y;
      cam.tx = cam.x; cam.ty = cam.y;
    }, { passive: false });
  }

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.clientWidth; H = canvas.clientHeight;
    _vw = window.innerWidth; _vh = window.innerHeight;
    canvas.width = Math.max(1, Math.round(W*DPR));
    canvas.height = Math.max(1, Math.round(H*DPR));
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  // ---- public API --------------------------------------------------------
  function init(cv, data, callbacks) {
    canvas = cv; ctx = canvas.getContext("2d");
    Object.assign(cb, callbacks || {});
    build(data.chronology, data.branches);
    resize();
    // cinematic open: land on the hero frame, then ease out of a gentle push-in
    fit(false);
    cam.scale = clampScale(cam.tscale * 1.45);
    bind();
    window.addEventListener("resize", resize);
    requestAnimationFrame(frame);
    return api;
  }

  const api = {
    init,
    fit: () => { stopTourOnInteract(); fit(true); },
    zoomIn: () => { stopTourOnInteract(); zoomBy(1.32); },
    zoomOut: () => { stopTourOnInteract(); zoomBy(1/1.32); },
    focusEvent: (id) => { const n = nodes.find((x) => x.type === "event" && x.data.id === id); if (n) focusXY(n.x, n.y, Math.max(cam.tscale, 1.1)); },
    focusBranch: (title) => { const n = nodes.find((x) => x.type === "branch" && x.data.title === title); if (n) focusXY(n.x, n.y, Math.max(cam.tscale, 1.0)); },
    scrubTo: (f) => { stopTourOnInteract(); const cw = CONTENT.maxX - CONTENT.minX; cam.tx = CONTENT.minX + f*cw; cam.x = cam.tx; },
    tour: (on) => setTour(on === undefined ? !touring : on),
    isTouring: () => touring,
    highlight: (ids) => { highlightSet = ids && ids.length ? new Set(ids) : null; },
    nodesOf: (type) => nodes.filter((n) => n.type === type),
    eventIdForTitle: (title) => { const n = nodes.find((x) => x.type === "event" && x.label === title); return n ? n.id : null; },
    layout: () => {
      const cw = CONTENT.maxX - CONTENT.minX || 1;
      const f = (x) => (x - CONTENT.minX) / cw;
      return {
        events: nodes.filter((n) => n.type === "event").map((n) => ({ id: n.data.id, title: n.label, frac: f(n.x), gold: n.gold, live: n.live })),
        branches: nodes.filter((n) => n.type === "branch").map((n) => ({ title: n.label, frac: f(n.x), hot: n.gold, dir: n.dir })),
      };
    },
  };
  return api;
})();
