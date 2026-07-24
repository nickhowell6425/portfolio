// explore-bg.js — a very subtle Sacred Timeline drifting through the
// background. Supporting atmosphere only: slow, dim, non-interactive. Keeps the
// Explore page connected to the homepage's multiverse without competing with
// the content.

(function () {
  const canvas = document.getElementById("bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, DPR = 1;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  // a handful of faint horizontal strands that drift and breathe
  const strands = [];
  function buildStrands() {
    strands.length = 0;
    const count = 7;
    for (let i = 0; i < count; i++) {
      const baseY = (i + 0.5) / count;
      const pts = [];
      const segs = 6;
      for (let s = 0; s <= segs; s++) {
        pts.push({
          xr: s / segs,
          yr: baseY + rnd(-0.06, 0.06),
          amp: rnd(0.012, 0.045),
          spd: rnd(0.00006, 0.00018),
          ph: rnd(0, Math.PI * 2),
        });
      }
      strands.push({
        pts,
        gold: i % 3 === 1,
        bright: rnd(0.5, 1),
        drift: rnd(0.00002, 0.00006) * (i % 2 ? 1 : -1),
        particles: Array.from({ length: 3 }, () => ({ t: Math.random(), v: rnd(0.02, 0.05) })),
      });
    }
  }

  const stars = [];
  function buildStars() {
    stars.length = 0;
    for (let i = 0; i < 90; i++) {
      stars.push({ xr: Math.random(), yr: Math.random(), r: rnd(0.4, 1.3), tw: rnd(0, Math.PI * 2), gold: Math.random() < 0.12 });
    }
  }

  function strandPoint(strand, frac, time) {
    // interpolate along control points with vertical wobble
    const pts = strand.pts;
    const fx = frac * (pts.length - 1);
    const i = Math.min(pts.length - 2, Math.floor(fx));
    const f = fx - i;
    const a = pts[i], b = pts[i + 1];
    const drift = Math.sin(time * strand.drift) * 0.02;
    const yA = a.yr + Math.sin(time * a.spd + a.ph) * a.amp + drift;
    const yB = b.yr + Math.sin(time * b.spd + b.ph) * b.amp + drift;
    const xr = a.xr + (b.xr - a.xr) * f;
    const yr = yA + (yB - yA) * f;
    return { x: xr * W, y: yr * H };
  }

  function draw(time) {
    ctx.clearRect(0, 0, W, H);

    // base radial vignette toward emerald-black
    const bg = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.85);
    bg.addColorStop(0, "oklch(0.115 0.022 158)");
    bg.addColorStop(0.55, "oklch(0.075 0.016 158)");
    bg.addColorStop(1, "oklch(0.045 0.01 158)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = "lighter";

    // faint stars
    for (const st of stars) {
      const tw = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(time * 0.0014 + st.tw));
      ctx.fillStyle = st.gold ? `oklch(0.9 0.12 86 / ${tw * 0.28})` : `oklch(0.92 0.02 158 / ${tw * 0.22})`;
      ctx.beginPath();
      ctx.arc(st.xr * W, st.yr * H, st.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // drifting strands
    const N = 48;
    for (const s of strands) {
      const tone = s.gold ? "0.82 0.1 86" : "0.74 0.13 158";
      const pulse = 0.6 + 0.4 * Math.sin(time * 0.0005 + s.pts[0].ph);
      const a = s.bright * pulse * 0.5;

      ctx.beginPath();
      for (let k = 0; k <= N; k++) {
        const p = strandPoint(s, k / N, time);
        k === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = `oklch(${tone} / ${a * 0.06})`;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.strokeStyle = `oklch(${tone} / ${a * 0.16})`;
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // a few slow particles
      for (const pt of s.particles) {
        pt.t += pt.v * 0.001;
        if (pt.t > 1) pt.t -= 1;
        const p = strandPoint(s, pt.t, time);
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 9);
        glow.addColorStop(0, `oklch(${tone} / ${a * 0.5})`);
        glow.addColorStop(1, `oklch(${tone} / 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(draw);
  }

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  buildStrands();
  buildStars();
  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(draw);
})();
