// tlv2-app.js — wiring for the reimagined Timeline View.
// Binds the existing Paradox data layer (TIMELINE_VIEW + PARADOX_DENSITY) to the
// new full-bleed living timeline: identity, a contextual inspector with tabs
// (Overview / Canon / Branches / Variants; Keepers live inside Overview),
// that flips between LIST and DETAIL,
// the bottom scrubber + minimap, guided tour, hover readout, ⌘K palette, account.

(function () {
  "use strict";
  const E = window.EXPLORE_DATA;
  const DENS = window.PARADOX_DENSITY;
  const VIEW_ID = (function () { const p = new URLSearchParams(location.search).get("t"); return (p && E.byId(p)) ? p : "ninth"; })();
  const TV = window.TIMELINE_VIEW.build(VIEW_ID);
  const tl = TV.tl, s = tl.stats, own = TV.ownership;
  const dens = DENS.forTimeline(VIEW_ID);
  const $ = (q) => document.querySelector(q);
  const $$ = (q) => [...document.querySelectorAll(q)];

  // ---- formatting ----
  function fmt(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "K";
    return String(n);
  }
  const esc = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // ---- temporal sigil avatars (match the rest of Paradox) ----
  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  function makeSigil(seed, color){
    const rnd = mulberry32(typeof seed==="number"?seed:hashStr(String(seed)));
    const c = color, C = 50; let body = "";
    const rings = 1 + Math.floor(rnd()*3);
    for(let i=0;i<rings;i++){ const r=40-i*(5+rnd()*7), dash=rnd()>0.45;
      body+=`<circle cx="${C}" cy="${C}" r="${r.toFixed(1)}" fill="none" stroke="${c}" stroke-width="${(1+rnd()*1.4).toFixed(2)}" opacity="${(0.32+rnd()*0.4).toFixed(2)}"${dash?` stroke-dasharray="${(2+rnd()*5).toFixed(1)} ${(3+rnd()*7).toFixed(1)}"`:""}/>`; }
    const sats=2+Math.floor(rnd()*5), orbit=26+rnd()*12, phase=rnd()*Math.PI*2;
    for(let i=0;i<sats;i++){ const a=phase+(i/sats)*Math.PI*2, x=C+Math.cos(a)*orbit, y=C+Math.sin(a)*orbit, rr=1.6+rnd()*3;
      if(rnd()>0.7){const d=rr+1;body+=`<path d="M${x} ${(y-d).toFixed(1)} L${(x+d).toFixed(1)} ${y} L${x} ${(y+d).toFixed(1)} L${(x-d).toFixed(1)} ${y} Z" fill="${c}" opacity="${(0.6+rnd()*0.4).toFixed(2)}"/>`;}
      else{body+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(1)}" fill="${c}" opacity="${(0.55+rnd()*0.45).toFixed(2)}"/>`;} }
    const coreR=4+rnd()*5;
    body+=`<circle cx="${C}" cy="${C}" r="${(coreR+4).toFixed(1)}" fill="${c}" opacity="0.16"/>`;
    body+=`<circle cx="${C}" cy="${C}" r="${coreR.toFixed(1)}" fill="${c}"/>`;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  }
  const av = (handle, hue) => makeSigil(handle, `oklch(0.8 0.16 ${hue || 158})`);

  // ===================== TOAST / MODAL =====================
  const toastEl = $("#toast"); let toastT;
  function toast(html) { toastEl.innerHTML = html; toastEl.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("show"), 3000); }
  const scrim = $("#scrim"), modal = $("#modal");
  function openModal(html) { modal.innerHTML = html; scrim.classList.add("show"); }
  function closeModal() { scrim.classList.remove("show"); }
  scrim.addEventListener("click", (e) => { if (e.target === scrim) closeModal(); });
  function modalConfirm({ kind, title, body, confirm, cancel, onConfirm, input }) {
    openModal(`<button class="mclose">✕</button><div class="mk">${kind}</div><h3>${esc(title)}</h3><p>${body}</p>
      ${input ? `<label>${input.label}</label><input id="mInput" type="text" placeholder="${input.placeholder}" />` : ""}
      <div class="row2"><button class="btn primary" id="mOk">${confirm}</button><button class="btn" id="mNo">${cancel || "Not now"}</button></div>`);
    modal.querySelector(".mclose").onclick = closeModal;
    $("#mNo").onclick = closeModal;
    const inp = input ? $("#mInput") : null;
    if (inp) setTimeout(() => inp.focus(), 120);
    const go = () => { closeModal(); onConfirm && onConfirm(inp ? inp.value.trim() : null); };
    $("#mOk").onclick = go;
    if (inp) inp.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
  }
  function openBranchModal(fromTitle) {
    modalConfirm({ kind: "Create a Branch", title: `Branch from ${fromTitle || tl.title}`,
      body: "Name the moment where this reality diverges. A new strand grows from the Sacred Timeline, and its lineage traces back here.",
      input: { label: "Branch name", placeholder: "What If…" }, confirm: "Branch reality", cancel: "Cancel",
      onConfirm: (name) => toast(`New branch <em>${esc(name || "An Untold Divergence")}</em> is emerging…`) });
  }

  // ===================== OVERVIEW (universe identity, now a tab) =====================
  function doRead() { setMode("events"); selectEvent(TV.chronology[0].id); toast(`Opening <em>${esc(tl.title)}</em> · Chapter I…`); }
  function doShare() {
    modalConfirm({ kind: "Share Timeline", title: `Share ${tl.title}`,
      body: "Anyone with this strand-link can read the canon, trace its variants, and branch their own reality from it.",
      input: { label: "Strand link", placeholder: `paradox.now/t/${VIEW_ID}` }, confirm: "Copy link", cancel: "Close",
      onConfirm: () => toast("Strand link copied to your clipboard.") });
  }
  const SVG_READ = `<svg viewBox="0 0 24 24"><path d="M4 5h16M4 12h16M4 19h10"/></svg>`;
  const SVG_BRANCH = `<svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="6" cy="18" r="2.2"/><path d="M6 8.2v7.6M6 12h7a5 5 0 0 0 5-5"/></svg>`;
  const SVG_SHARE = `<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="2.4"/><circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="19" r="2.4"/><path d="m8.1 10.9 7.8-4.6M8.1 13.1l7.8 4.6"/></svg>`;

  function renderOverview() {
    inspector.classList.remove("detail", "gold");
    inspector.classList.add("overview");
    $$("#inspTabs .itab").forEach((b) => b.classList.toggle("on", b.dataset.mode === "overview"));
    const officialIP = own.kind === "official";
    const stats = [
      { v: fmt(s.readers), k: "Readers" },
      { v: fmt(s.events), k: "Events" },
      { v: fmt(s.branches), k: "Branches", live: true },
      { v: fmt(s.variants), k: "Variants" },
    ];
    const topK = contributorList().slice(0, 9);
    const moreK = Math.max(0, s.contributors - topK.length);
    const keepersHtml = topK.map((c) => `<button class="kav" title="${esc(c.name)} · ${esc(c.role)}" data-keeper="${esc(c.name)}">${av(c.handle, c.hue)}</button>`).join("")
      + (moreK > 0 ? `<button class="kmore" title="All Keepers">+${fmt(moreK)}</button>` : "");
    inspBody.innerHTML = `<div class="ov">
      <div class="id-kicker">
        <span class="own-badge ${own.kind}"><span class="od"></span>${esc(own.label)}</span>
        <span class="id-cat">${esc(tl.category || "Science Fiction")}</span>
        <span class="id-status"><span class="sd"></span>${esc(tl.status || "Active")}</span>
      </div>
      <h1 class="id-title">${esc(tl.title)}</h1>
      <p class="id-log">${esc(tl.logline)}</p>
      <div class="id-stats">${stats.map((x) => `<div class="st"><div class="v${x.live ? " live" : ""} tnum">${x.v}</div><div class="k">${x.k}</div></div>`).join("")}</div>
      <div class="id-actions">
        <button class="btn primary" id="ovRead">${SVG_READ}Read the Canon</button>
        <button class="btn gold" id="ovBranch">${SVG_BRANCH}Branch</button>
        <button class="btn ghost-ic" id="ovShare" title="Share">${SVG_SHARE}</button>
      </div>
      <div class="id-creator">
        <span class="av">${av(own.creatorHandle, own.creatorHue)}</span>
        <span><span class="cn">${esc(own.creator)}</span><span class="cr">${officialIP ? `Steward · ${esc(own.created)}` : `Creator · since ${esc(own.created)}`}</span></span>
      </div>
      <div class="detail-sec"><h4>Keepers · ${fmt(s.contributors)}</h4>
        <p class="ov-note">The architects shaping this universe — every event, branch and variant traces back to them.</p>
        <div class="ov-keepers" id="ovKeepers">${keepersHtml}</div>
      </div>
      <div class="detail-sec"><h4>Rights &amp; Licensing</h4>
        ${own.note ? `<p class="lic-note">${esc(own.note)}</p>` : ""}
        ${own.lines.map((l) => `<div class="lic-row${l.can ? "" : " no"}"><span class="lic-ic">${l.can ? "✓" : "—"}</span>${esc(l.text)}</div>`).join("")}
      </div>
    </div>`;
    inspBody.scrollTop = 0;
    $("#ovRead").onclick = doRead;
    $("#ovBranch").onclick = () => openBranchModal(tl.title);
    $("#ovShare").onclick = doShare;
    $$("#ovKeepers .kav").forEach((b) => b.addEventListener("click", () => toast(`Opening <em>${esc(b.dataset.keeper)}</em>'s profile…`)));
    const allK = $("#ovKeepers .kmore"); if (allK) allK.onclick = () => toast(`<em>${fmt(s.contributors)}</em> Keepers shape this universe.`);
  }

  function renderMeta() {
    document.title = `${tl.title} — Paradox`;
  }

  // ===================== HOVER READOUT =====================
  const readout = $("#readout");
  function readoutHtml(n) {
    if (n.type === "event") {
      const d = n.data;
      return `<div class="rt">${d.pivotal ? "Divergence Point" : "Canon Event"} · ${d.chapter}</div>
        <div class="rn">${esc(d.title)}</div><div class="rl">${esc(d.log)}</div>
        <div class="rs"><div class="m"><div class="v">${fmt(d.branchesMade)}</div><div class="k">Branches</div></div>
          <div class="m"><div class="v">${fmt(d.variants)}</div><div class="k">Variants</div></div></div>
        <div class="rhint">Click to inspect →</div>`;
    }
    const d = n.data;
    return `<div class="rt">${d.hot ? "Trending Branch" : "Branch"}</div>
      <div class="rn">${esc(d.title)}</div>
      <div class="rl">Diverges at <b style="color:var(--jade)">${esc(d.origin)}</b>. ${esc(d.log || "")}</div>
      <div class="rs"><div class="m"><div class="v">${fmt(d.readers)}</div><div class="k">Readers</div></div>
        <div class="m"><div class="v">${fmt(d.variants)}</div><div class="k">Variants</div></div></div>
      <div class="rhint">Click to open this reality →</div>`;
  }
  function positionReadout(sx, sy) {
    const r = readout.getBoundingClientRect();
    let x = sx + 20, y = sy + 20 + 64; // +topbar offset (canvas spans full viewport, sx/sy are canvas-space)
    if (x + r.width > window.innerWidth - 12) x = sx - r.width - 20;
    if (y + r.height > window.innerHeight - 12) y = sy - r.height + 44;
    readout.style.left = Math.max(10, x) + "px";
    readout.style.top = Math.max(74, y) + "px";
  }

  // ===================== INSPECTOR (list ⇄ detail) =====================
  const inspector = $("#inspector"), inspKicker = $("#inspKicker"), inspCount = $("#inspCount");
  const inspSub = $("#inspSub"), inspBody = $("#inspBody"), inspSearchWrap = $("#inspSearchWrap"), inspSearch = $("#inspSearch");
  let mode = "branches", filterQ = "";

  const MODE_META = {
    branches: { kicker: "Branches", sub: "Every place this universe splits into another reality. Pick one to trace it on the timeline, or open it as its own living canon.", total: s.branches, unit: "branches" },
    events:   { kicker: "The Canon", sub: "The official spine, chapter by chapter. Select an event to see what forks from it and who's inside.", total: s.events, unit: "events" },
    variants: { kicker: "Variants", sub: "The same souls, rewritten across realities. Select one to light up where it touches the timeline.", total: s.variants, unit: "variants" },
    contributors: { kicker: "Keepers", sub: "The architects shaping this universe — every event, branch and variant traces back to them.", total: s.contributors, unit: "keepers" },
  };

  // ---- branch list ----
  function branchList() {
    const densRows = dens.branches.slice(0, 10).map((b) => ({
      title: b.title, hot: !!b.hot,
      origin: TV.chronology[Math.abs(hashStr(b.title)) % TV.chronology.length].title,
      readers: 40 + b.variants * 18, events: 20 + (Math.abs(hashStr(b.title)) % 180),
      variants: b.variants, contributors: 60 + (Math.abs(hashStr(b.title)) % 1400),
      log: "",
    }));
    return TV.branches.concat(densRows);
  }
  function branchCardHtml(b) {
    return `<button class="row-card${b.hot ? " gold" : ""}" data-kind="branch" data-title="${esc(b.title)}">
      <div class="rc-top${b.hot ? " gd" : ""}"><span class="bd"></span><span class="origin">from <b>${esc(b.origin)}</b></span>${b.hot ? `<span class="tag">Trending</span>` : ""}</div>
      <div class="rc-title">${esc(b.title)}</div>
      ${b.log ? `<div class="rc-log">${esc(b.log)}</div>` : ""}
      <div class="rc-stats">
        <span class="m"><div class="v tnum">${fmt(b.readers)}</div><div class="k">Readers</div></span>
        <span class="m"><div class="v tnum">${fmt(b.variants)}</div><div class="k">Variants</div></span>
        <span class="m"><div class="v tnum">${fmt(b.contributors)}</div><div class="k">Keepers</div></span>
      </div>
      <span class="rc-cta">Trace & open <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
    </button>`;
  }
  // ---- event list ----
  function eventCardHtml(ev) {
    return `<button class="row-card${ev.pivotal ? " gold" : ""}" data-kind="event" data-id="${ev.id}">
      <div class="rc-top${ev.pivotal ? " gd" : ""}"><span class="chap">${esc(ev.chapter)}</span>${ev.pivotal ? `<span class="tag">Divergence</span>` : ev.live ? `<span class="tag" style="color:var(--emerald)">Latest</span>` : ""}<span class="date">${esc(ev.date)}</span></div>
      <div class="rc-title">${esc(ev.title)}</div>
      <div class="rc-log">${esc(ev.log)}</div>
      <div class="rc-stats">
        <span class="m"><div class="v tnum">${fmt(ev.branchesMade)}</div><div class="k">Branches</div></span>
        <span class="m"><div class="v tnum">${fmt(ev.variants)}</div><div class="k">Variants</div></span>
        <span class="m"><div class="v tnum">${fmt(ev.contributors)}</div><div class="k">Keepers</div></span>
      </div>
    </button>`;
  }
  // ---- variant list ----
  function variantList() {
    const TR = ["Loyal","Haunted","Brilliant","Reckless","Devout","Sceptical","Patient","Fierce","Quiet","Resolute"];
    const densRows = dens.variants.slice(0, 8).map((v) => {
      const h = Math.abs(hashStr(v.tag));
      return { name: v.title, tag: v.tag, hue: h % 360,
        origin: TV.chronology[Math.abs(hashStr(v.title)) % TV.chronology.length].title,
        traits: [...new Set([TR[h % TR.length], TR[(h>>3) % TR.length]])],
        appearances: 8 + (h % 70), influenced: 4 + (h % 40), gold: false,
        note: `An alternate manifestation traced across ${20 + (h % 60)} realities.` };
    });
    return TV.variants.concat(densRows);
  }
  function variantCardHtml(v) {
    return `<button class="row-card${v.gold ? " gold" : ""}" data-kind="variant" data-name="${esc(v.name)}" data-origin="${esc(v.origin)}">
      <div class="var-row">
        <span class="av" style="--vh:${v.hue}"></span>
        <span class="vmeta">
          <div class="rc-title">${esc(v.name)}</div>
          <div class="vtag tnum">${esc(v.tag)} · in <b>${esc(v.origin)}</b></div>
          <div class="var-traits">${v.traits.map((t) => `<span class="tr">${esc(t)}</span>`).join("")}</div>
        </span>
      </div>
      <span class="rc-cta">Light up on timeline <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
    </button>`;
  }
  // ---- contributor list ----
  function contributorList() {
    const densRows = dens.contributors.slice(0, 8).map((c) => ({ name: c.name, handle: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "_"), hue: c.hue, role: "Keeper", total: c.count }));
    const curated = TV.contributors.map((c, i) => ({ name: c.name, handle: c.handle, hue: c.hue, role: c.role, total: c.events + c.branches + c.variants, crown: i === 0 }));
    return curated.concat(densRows);
  }
  function contributorCardHtml(c) {
    return `<button class="row-card" data-kind="contributor" data-name="${esc(c.name)}">
      <div class="cu">
        <span class="av">${av(c.handle, c.hue)}</span>
        <span class="who"><div class="cn">${esc(c.name)}${c.crown ? ` <span class="crown" title="Creator">♦</span>` : ""}</div><div class="cr"><span class="role">${esc(c.role)}</span> · @${esc(c.handle)}</div></span>
        <span class="cc"><div class="v tnum">${fmt(c.total)}</div><div class="k">echoes</div></span>
      </div>
    </button>`;
  }

  function currentList() {
    if (mode === "branches") return { items: branchList(), html: branchCardHtml, key: (b) => b.title };
    if (mode === "events") return { items: TV.chronology, html: eventCardHtml, key: (e) => e.title };
    if (mode === "variants") return { items: variantList(), html: variantCardHtml, key: (v) => v.name };
    return { items: contributorList(), html: contributorCardHtml, key: (c) => c.name };
  }

  function renderList() {
    if (mode === "overview") { renderOverview(); return; }
    const meta = MODE_META[mode];
    inspector.classList.remove("detail", "gold", "overview");
    $$("#inspTabs .itab").forEach((b) => b.classList.toggle("on", b.dataset.mode === mode));
    inspSub.textContent = meta.sub;
    const { items, html, key } = currentList();
    const q = filterQ.trim().toLowerCase();
    const filtered = q ? items.filter((it) => key(it).toLowerCase().includes(q)) : items;
    inspCount.textContent = q ? fmt(filtered.length) + " found" : fmt(meta.total) + " " + meta.unit;
    inspBody.innerHTML = filtered.length ? filtered.map(html).join("")
      : `<div class="empty">Nothing here matches “${esc(filterQ)}”.</div>`;
    inspBody.scrollTop = 0;
    bindListRows();
  }
  function bindListRows() {
    $$("#inspBody .row-card").forEach((el) => {
      el.addEventListener("click", () => {
        const k = el.dataset.kind;
        if (k === "branch") selectBranch(el.dataset.title);
        else if (k === "event") selectEvent(el.dataset.id);
        else if (k === "variant") selectVariant(el.dataset.name, el.dataset.origin);
        else if (k === "contributor") toast(`Opening <em>${esc(el.dataset.name)}</em>'s profile…`);
      });
      el.addEventListener("mouseenter", () => {
        if (el.dataset.kind === "variant") SPINE.highlight([SPINE.eventIdForTitle(el.dataset.origin)].filter(Boolean));
      });
    });
  }

  // ---- DETAIL views ----
  function showDetail({ kicker, gold, html }) {
    inspector.classList.add("detail");
    inspector.classList.toggle("gold", !!gold);
    inspKicker.textContent = kicker;
    inspBody.innerHTML = `<div style="padding:4px 2px 2px">${html}</div>`;
    inspBody.scrollTop = 0;
  }

  function eventById(id) { return TV.chronology.find((e) => e.id === id); }
  function selectEvent(id, fromTour) {
    const ev = eventById(id); if (!ev) return;
    if (!fromTour) SPINE.focusEvent(id);
    SPINE.highlight(null);
    const forks = (ev.forks || []).map((t) => { const b = TV.branches.find((x) => x.title === t); return `<span class="chip${b && b.hot ? " gd" : ""}" data-branch="${esc(t)}"><span class="bd"></span>${esc(t)}</span>`; }).join("");
    const vars = TV.variants.filter((v) => v.origin === ev.title).slice(0, 4).map((v) => `<span class="chip" data-variant="${esc(v.name)}"><span class="bd"></span>${esc(v.name)}</span>`).join("");
    showDetail({ kicker: ev.pivotal ? "Divergence Point" : "Canon Event", gold: ev.pivotal, html: `
      <div class="rc-top${ev.pivotal ? " gd" : ""}" style="margin-bottom:8px"><span class="chap">${esc(ev.chapter)}</span><span class="date">${esc(ev.date)}</span></div>
      <div class="id-title" style="font-size:30px">${esc(ev.title)}</div>
      <div class="rc-log" style="font-size:15px;margin-top:9px">${esc(ev.log)}</div>
      <div class="detail-stats">
        <div class="cell"><div class="v tnum">${fmt(ev.branchesMade)}</div><div class="k">Branches made</div></div>
        <div class="cell"><div class="v tnum">${fmt(ev.variants)}</div><div class="k">Variants</div></div>
        <div class="cell"><div class="v tnum">${fmt(ev.contributors)}</div><div class="k">Keepers</div></div>
      </div>
      ${forks ? `<div class="detail-sec"><h4>Forks into</h4>${forks}</div>` : ""}
      ${vars ? `<div class="detail-sec"><h4>Variants present</h4>${vars}</div>` : ""}
      <div class="detail-actions">
        <button class="btn primary" data-read style="flex:1"><svg viewBox="0 0 24 24"><path d="M4 5h16M4 12h16M4 19h10"/></svg>Read this event</button>
        <button class="btn gold" data-branchfrom><svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="6" cy="18" r="2.2"/><path d="M6 8.2v7.6M6 12h7a5 5 0 0 0 5-5"/></svg>Branch</button>
      </div>` });
    $$("#inspBody [data-branch]").forEach((c) => c.addEventListener("click", () => selectBranch(c.dataset.branch)));
    $$("#inspBody [data-variant]").forEach((c) => c.addEventListener("click", () => { mode = "variants"; selectVariant(c.dataset.variant, ev.title); }));
    const rb = $("#inspBody [data-read]"); if (rb) rb.onclick = () => toast(`Reading <em>${esc(ev.title)}</em>…`);
    const bf = $("#inspBody [data-branchfrom]"); if (bf) bf.onclick = () => openBranchModal(ev.title);
  }

  function branchByTitle(t) { return branchList().find((b) => b.title === t); }
  function selectBranch(title) {
    const b = branchByTitle(title); if (!b) return;
    SPINE.focusBranch(title); SPINE.highlight(null);
    showDetail({ kicker: b.hot ? "Trending Branch" : "Branch", gold: b.hot, html: `
      <div class="rc-top${b.hot ? " gd" : ""}" style="margin-bottom:8px"><span class="bd"></span><span class="origin">diverges from <b>${esc(b.origin)}</b></span></div>
      <div class="id-title" style="font-size:30px">${esc(b.title)}</div>
      ${b.log ? `<div class="rc-log" style="font-size:15px;margin-top:9px">${esc(b.log)}</div>` : ""}
      <div class="detail-stats">
        <div class="cell"><div class="v tnum">${fmt(b.readers)}</div><div class="k">Readers</div></div>
        <div class="cell"><div class="v tnum">${fmt(b.events)}</div><div class="k">Events</div></div>
        <div class="cell"><div class="v tnum">${fmt(b.variants)}</div><div class="k">Variants</div></div>
      </div>
      <div class="detail-sec"><h4>Diverges at</h4><span class="chip" data-origin="${esc(b.origin)}"><span class="bd"></span>${esc(b.origin)}</span></div>
      <div class="detail-actions">
        <button class="btn primary" data-open style="flex:1"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Open this reality</button>
        <button class="btn" data-follow>Follow</button>
      </div>` });
    const og = $("#inspBody [data-origin]"); if (og) og.onclick = () => { const id = SPINE.eventIdForTitle(b.origin); if (id) selectEvent(id); };
    const op = $("#inspBody [data-open]"); if (op) op.onclick = () => toast(`Descending into <em>${esc(b.title)}</em>…`);
    const fo = $("#inspBody [data-follow]"); if (fo) fo.onclick = () => toast(`Following <em>${esc(b.title)}</em>.`);
  }

  function selectVariant(name, origin) {
    const v = variantList().find((x) => x.name === name); if (!v) return;
    const oid = SPINE.eventIdForTitle(origin || v.origin);
    if (oid) { SPINE.highlight([oid]); SPINE.focusEvent(oid); }
    showDetail({ kicker: "Variant", gold: !!v.gold, html: `
      <div class="var-row" style="margin-bottom:10px"><span class="av" style="--vh:${v.hue};width:48px;height:48px"></span>
        <span class="vmeta"><div class="id-title" style="font-size:26px">${esc(v.name)}</div><div class="vtag tnum">${esc(v.tag)} · origin <b>${esc(v.origin)}</b></div></span></div>
      <div class="rc-log" style="font-size:14.5px">${esc(v.note)}</div>
      <div class="detail-sec"><h4>Traits</h4><div class="var-traits">${v.traits.map((t) => `<span class="tr">${esc(t)}</span>`).join("")}</div></div>
      <div class="detail-stats" style="grid-template-columns:1fr 1fr">
        <div class="cell"><div class="v tnum">${fmt(v.appearances)}</div><div class="k">Appearances</div></div>
        <div class="cell"><div class="v tnum">${fmt(v.influenced)}</div><div class="k">Events influenced</div></div>
      </div>
      <div class="detail-sec"><h4>Anchored at</h4><span class="chip" data-origin="${esc(v.origin)}"><span class="bd"></span>${esc(v.origin)}</span></div>
      <div class="detail-actions"><button class="btn primary" data-trace style="flex:1"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Trace across realities</button></div>` });
    const og = $("#inspBody [data-origin]"); if (og) og.onclick = () => { SPINE.highlight(null); if (oid) selectEvent(oid); };
    const tr = $("#inspBody [data-trace]"); if (tr) tr.onclick = () => toast(`Tracing <em>${esc(v.name)}</em> across realities…`);
  }

  // ---- mode switch ----
  function setMode(m) {
    mode = m; filterQ = ""; inspSearch.value = "";
    if (m !== "variants") SPINE.highlight(null);
    renderList();
  }
  function bindModes() {
    $$("#inspTabs .itab").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
    $("#inspBackBtn").addEventListener("click", () => { SPINE.highlight(null); renderList(); });
    inspSearch.addEventListener("input", () => { filterQ = inspSearch.value; renderList(); });
  }

  // ===================== SPINE + callbacks =====================
  let SPINE;
  function initSpine() {
    SPINE = window.TLV2_SPINE.init($("#spine"), { chronology: TV.chronology, branches: TV.branches }, {
      hover: (n, sx, sy) => {
        if (!n) { readout.classList.remove("show"); return; }
        readout.className = "readout show" + (n.gold ? " gold" : "");
        readout.innerHTML = readoutHtml(n);
        positionReadout(sx, sy);
      },
      select: (n, fromTour) => {
        if (n.type === "event") { mode = "events"; selectEvent(n.data.id, fromTour); }
        else if (n.type === "branch") { mode = "branches"; selectBranch(n.data.title); }
      },
      frame: (st) => updateMinimap(st),
      tourState: (on) => { const b = $("#tourBtn"); b.classList.toggle("on", on); $("#tourLabel").textContent = on ? "Stop" : "Tour"; },
    });
    $("#vzIn").onclick = () => SPINE.zoomIn();
    $("#vzOut").onclick = () => SPINE.zoomOut();
    $("#vzFit").onclick = () => SPINE.fit();
    $("#tourBtn").onclick = () => SPINE.tour();
    buildMinimapBase();
  }

  // ===================== MINIMAP =====================
  const mapCanvas = $("#mapCanvas"), scrMap = $("#scrMap"), scrWindow = $("#scrWindow"), scrLabels = $("#scrLabels");
  let mapCtx, mapW = 0, mapH = 0, layout = null;
  function buildMinimapBase() {
    mapCtx = mapCanvas.getContext("2d");
    layout = SPINE.layout();
    drawMinimap();
    // labels: pivotal + live get a tag; the rest are silent ticks
    scrLabels.innerHTML = layout.events.filter((e) => e.gold || e.live).map((e) =>
      `<div class="sl${e.gold ? " gd" : ""}" style="left:${(e.frac*100).toFixed(2)}%">${e.gold ? "Divergence" : "Now"}</div>`).join("");
    window.addEventListener("resize", drawMinimap);
  }
  function drawMinimap() {
    if (!layout) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    mapW = scrMap.clientWidth; mapH = scrMap.clientHeight;
    mapCanvas.width = Math.max(1, mapW * dpr); mapCanvas.height = Math.max(1, mapH * dpr);
    mapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mapCtx.clearRect(0, 0, mapW, mapH);
    const midY = mapH * 0.5;
    // spine baseline
    const grad = mapCtx.createLinearGradient(0, 0, mapW, 0);
    grad.addColorStop(0, "oklch(0.78 0.15 158 / 0.15)");
    grad.addColorStop(0.5, "oklch(0.82 0.15 158 / 0.6)");
    grad.addColorStop(1, "oklch(0.78 0.15 158 / 0.2)");
    mapCtx.strokeStyle = grad; mapCtx.lineWidth = 2; mapCtx.lineCap = "round";
    mapCtx.beginPath(); mapCtx.moveTo(6, midY); mapCtx.lineTo(mapW - 6, midY); mapCtx.stroke();
    // branch ticks (above/below)
    layout.branches.forEach((b) => {
      const x = 6 + b.frac * (mapW - 12);
      const y2 = midY + (b.dir > 0 ? 1 : -1) * (mapH * 0.3);
      mapCtx.strokeStyle = b.hot ? "oklch(0.86 0.12 86 / 0.7)" : "oklch(0.7 0.1 165 / 0.5)";
      mapCtx.lineWidth = b.hot ? 1.6 : 1.1;
      mapCtx.beginPath(); mapCtx.moveTo(x, midY); mapCtx.lineTo(x + (b.dir > 0 ? 5 : -5), y2); mapCtx.stroke();
      mapCtx.fillStyle = b.hot ? "oklch(0.86 0.12 86 / 0.95)" : "oklch(0.7 0.1 165 / 0.75)";
      mapCtx.beginPath(); mapCtx.arc(x + (b.dir > 0 ? 5 : -5), y2, b.hot ? 2.2 : 1.6, 0, Math.PI*2); mapCtx.fill();
    });
    // event dots
    layout.events.forEach((e) => {
      const x = 6 + e.frac * (mapW - 12);
      mapCtx.fillStyle = e.gold ? "oklch(0.9 0.12 86 / 1)" : "oklch(0.9 0.15 158 / 0.95)";
      mapCtx.beginPath(); mapCtx.arc(x, midY, e.gold ? 4 : 2.6, 0, Math.PI*2); mapCtx.fill();
      if (e.gold) { mapCtx.strokeStyle = "oklch(0.86 0.12 86 / 0.6)"; mapCtx.lineWidth = 1; mapCtx.beginPath(); mapCtx.arc(x, midY, 6.5, 0, Math.PI*2); mapCtx.stroke(); }
    });
  }
  function updateMinimap(st) {
    if (!mapW) return;
    const left = Math.max(0, st.window.center - st.window.half);
    const right = Math.min(1, st.window.center + st.window.half);
    scrWindow.style.left = (left * 100) + "%";
    scrWindow.style.width = (Math.max(0.02, right - left) * 100) + "%";
  }
  // click / drag the minimap to travel
  let mapDragging = false;
  function mapJump(clientX) {
    const r = scrMap.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    SPINE.scrubTo(f);
  }
  scrMap.addEventListener("mousedown", (e) => { mapDragging = true; mapJump(e.clientX); });
  window.addEventListener("mousemove", (e) => { if (mapDragging) mapJump(e.clientX); });
  window.addEventListener("mouseup", () => { mapDragging = false; });

  // ===================== ⌘K COMMAND PALETTE =====================
  const cmdk = $("#cmdk"), cmdkInput = $("#cmdkInput"), cmdkResults = $("#cmdkResults"), cmdkCount = $("#cmdkCount");
  const ICON = {
    timeline: `<span class="dotc"></span>`,
    branch: `<svg viewBox="0 0 24 24"><circle cx="6" cy="5" r="2.2"/><circle cx="18" cy="5" r="2.2"/><circle cx="6" cy="19" r="2.2"/><path d="M6 7.2v9.6M6 12h7a5 5 0 0 0 5-5"/></svg>`,
    event: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>`,
    variant: `<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="3.2"/><path d="M5 20c0-3.4 3-5.6 7-5.6s7 2.2 7 5.6"/></svg>`,
    explore: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m15 9-4 1.5L9.5 14.5 14 13z"/></svg>`,
    create: `<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`,
  };
  const tlName = (id) => (E.byId(id) || {}).title || "";
  function buildIndex() {
    const idx = [];
    idx.push({ group: "Commands", kind: "act", icon: "create", title: "Create a branch", sub: `Branch a reality from ${tl.title}`, hay: "create branch fork new", run: () => openBranchModal(tl.title) });
    idx.push({ group: "Commands", kind: "act", icon: "explore", title: "Explore the multiverse", sub: "Return to the nexus", hay: "explore nexus map", run: () => { window.location.href = "../04-Discovery/Explore.html?warp=1"; } });
    TV.chronology.forEach((e) => idx.push({ group: "This Timeline", kind: "event", icon: "event", title: e.title, sub: e.chapter + " · " + tl.title, tag: "Event", hay: e.title.toLowerCase(), run: () => { setMode("events"); selectEvent(e.id); } }));
    TV.branches.forEach((b) => idx.push({ group: "This Timeline", kind: "branch", tone: b.hot ? "gold" : "", icon: "branch", title: b.title, sub: "Branch · " + tl.title, tag: "Branch", hay: b.title.toLowerCase(), run: () => { setMode("branches"); selectBranch(b.title); } }));
    TV.variants.forEach((v) => idx.push({ group: "This Timeline", kind: "variant", icon: "variant", title: v.name, sub: "Variant · " + v.tag, tag: "Variant", hay: v.name.toLowerCase(), run: () => { setMode("variants"); selectVariant(v.name, v.origin); } }));
    E.timelines.forEach((t) => idx.push({ group: "Sacred Timelines", kind: "timeline", tone: (t.ownership === "official" ? "gold" : ""), icon: "timeline", title: t.title, sub: t.logline, tag: t.ownership === "official" ? "Official" : "Timeline", hay: (t.title + " " + t.logline).toLowerCase(), run: () => { if (t.id === VIEW_ID) { toast(`You're viewing <em>${esc(t.title)}</em>.`); return; } toast(`Opening <em>${esc(t.title)}</em>…`); setTimeout(() => { window.location.href = "Timeline-View.html?t=" + t.id; }, 460); } }));
    return idx;
  }
  const FULL_INDEX = buildIndex();
  const GROUP_ORDER = ["Commands", "This Timeline", "Sacred Timelines"];
  function score(item, q) { const t = item.title.toLowerCase(); if (t === q) return 100; if (t.startsWith(q)) return 80; if (new RegExp("\\b" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(t)) return 60; const ti = t.indexOf(q); if (ti >= 0) return 40 - Math.min(ti, 20); if (item.hay.includes(q)) return 18; return 0; }
  function hl(text, q) { if (!q) return esc(text); const i = text.toLowerCase().indexOf(q); if (i < 0) return esc(text); return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length)); }
  let rows = [], active = -1;
  function renderCmdk(q) {
    let list;
    if (!q) list = FULL_INDEX.filter((i) => i.group === "Commands" || i.group === "This Timeline").slice(0, 12);
    else list = FULL_INDEX.map((i) => ({ i, s: score(i, q) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.i);
    cmdkCount.textContent = list.length ? list.length + (list.length === 1 ? " result" : " results") : "";
    if (!list.length) { cmdkResults.innerHTML = `<div class="cmdk-empty"><div class="ee">No realities found</div><div class="es">Nothing matches “${esc(q)}”.</div></div>`; rows = []; active = -1; return; }
    let html = "";
    GROUP_ORDER.forEach((g) => { const inG = list.filter((i) => i.group === g); if (!inG.length) return; html += `<div class="cmdk-group">${g}</div>`; inG.forEach((i) => { const gi = list.indexOf(i); html += `<div class="cmdk-row ${i.kind === "act" ? "act" : ""} ${i.tone || ""}" data-i="${gi}"><span class="cmdk-ic">${ICON[i.icon] || ""}</span><span class="cmdk-txt"><span class="cmdk-t">${hl(i.title, q)}</span><span class="cmdk-sub">${esc(i.sub)}</span></span><span class="cmdk-tag">${i.tag || "Command"}</span><span class="cmdk-go">↵</span></div>`; }); });
    cmdkResults.innerHTML = html;
    rows = [...cmdkResults.querySelectorAll(".cmdk-row")];
    rows.forEach((r) => { const item = list[+r.dataset.i]; r._run = item.run; r.addEventListener("mousemove", () => setActive(rows.indexOf(r))); r.addEventListener("click", () => { closeCmdk(); item.run(); }); });
    setActive(0);
  }
  function setActive(i) { if (!rows.length) return; active = (i + rows.length) % rows.length; rows.forEach((r, k) => r.classList.toggle("active", k === active)); const el = rows[active]; if (el) { const top = el.offsetTop, bot = top + el.offsetHeight; if (top < cmdkResults.scrollTop) cmdkResults.scrollTop = top - 8; else if (bot > cmdkResults.scrollTop + cmdkResults.clientHeight) cmdkResults.scrollTop = bot - cmdkResults.clientHeight + 8; } }
  function openCmdk() { cmdk.classList.add("show"); cmdk.setAttribute("aria-hidden", "false"); cmdkInput.value = ""; renderCmdk(""); requestAnimationFrame(() => cmdkInput.focus()); }
  function closeCmdk() { cmdk.classList.remove("show"); cmdk.setAttribute("aria-hidden", "true"); cmdkInput.blur(); }
  const cmdkOpen = () => cmdk.classList.contains("show");
  function bindCmdk() {
    $("#searchLauncher").addEventListener("click", openCmdk);
    cmdkInput.addEventListener("input", () => renderCmdk(cmdkInput.value.trim().toLowerCase()));
    cmdk.addEventListener("mousedown", (e) => { if (e.target === cmdk) closeCmdk(); });
    cmdkInput.addEventListener("keydown", (e) => { if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); } else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); } else if (e.key === "Enter") { e.preventDefault(); const r = rows[active]; if (r && r._run) { closeCmdk(); r._run(); } } else if (e.key === "Escape") { e.preventDefault(); closeCmdk(); } });
    document.addEventListener("keydown", (e) => { const k = e.key.toLowerCase(); if ((e.metaKey || e.ctrlKey) && k === "k") { e.preventDefault(); cmdkOpen() ? closeCmdk() : openCmdk(); return; } if (k === "escape") { if (cmdkOpen()) closeCmdk(); else if (scrim.classList.contains("show")) closeModal(); } if (k === "/" && !cmdkOpen()) { const a = document.activeElement, typing = a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA"); if (!typing) { e.preventDefault(); openCmdk(); } } });
  }

  // ===================== ACCOUNT + NAV =====================
  function bindAccount() {
    const sig = av("strandkeeper_4F2A", 158);
    $("#acctAv").innerHTML = sig; $("#acctMenuAv").innerHTML = sig;
    const account = $("#account"), trigger = $("#acctTrigger");
    const setOpen = (o) => { account.classList.toggle("open", o); trigger.setAttribute("aria-expanded", o ? "true" : "false"); };
    trigger.addEventListener("click", (e) => { e.stopPropagation(); setOpen(!account.classList.contains("open")); });
    document.addEventListener("click", (e) => { if (!account.contains(e.target)) setOpen(false); });
    const COPY = { profile: "Opening <em>strandkeeper</em>'s profile…", branches: "Loading your <em>7 live branches</em>…", saved: "Your <em>23 saved realities</em>…", signout: "Signed out — the timeline keeps drifting without you." };
    // sign-in lives in the component library, not this demo — signout stays in-app
    account.querySelectorAll(".acct-item").forEach((btn) => btn.addEventListener("click", () => { const act = btn.dataset.act; setOpen(false); toast(COPY[act] || ""); }));
  }
  function bindNav() {
    $("#brand").addEventListener("click", () => { window.location.href = "../02-Marketing/Homepage.html"; });
    $("#exploreBtn").addEventListener("click", () => { window.location.href = "../04-Discovery/Explore.html?warp=1"; });
    $("#createBtn").addEventListener("click", () => openBranchModal(tl.title));
  }

  // ---- first-run hint fades after interaction ----
  function bindHint() {
    const hint = $("#hint");
    let done = false;
    const dismiss = () => { if (done) return; done = true; hint.classList.add("hide"); };
    setTimeout(dismiss, 6000);
    $("#spine").addEventListener("mousedown", dismiss);
    $("#spine").addEventListener("wheel", dismiss, { passive: true });
  }

  // ===================== INIT =====================
  renderMeta();
  bindModes();
  initSpine();
  mode = "overview";
  renderOverview();      // default: the universe Overview (details), then explore via tabs
  bindCmdk();
  bindAccount();
  bindNav();
  bindHint();
})();
