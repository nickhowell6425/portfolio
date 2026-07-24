// explore-ui.js — Explore page logic.
// A practical, reactive discovery surface: left filters (browse / category /
// sort / status), a center feed (featured + trending timelines / fastest
// growing branches / recently active variants, or a focused filtered list),
// a live right-hand preview panel, prominent search, modals + toast.

(function () {
  const D = window.EXPLORE_DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---- state --------------------------------------------------------------
  const state = { browse: "all", category: "", sort: "Trending", status: "", ownership: "", query: "" };
  let inDetail = false;    // an item is expanded inline
  let lastScroll = 0;      // center scroll position to restore on "back"
  let liveTimer = null;
  let charManifest = [];   // current character detail's generated variant manifestations

  // ---- helpers ------------------------------------------------------------
  function fmt(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "K";
    return String(n);
  }
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const toneVars = (t) => `--h1:${t.tone[0]};--h2:${t.tone[1]}`;
  const catOf = (id) => { const t = D.byId(id); return t ? t.category : ""; };
  const statusOf = (id) => { const t = D.byId(id); return t ? t.status : ""; };

  // ownership badge for a timeline (Official IP vs creator-owned Original)
  const ownBadge = (t) =>
    t && t.ownership === "official"
      ? `<span class="own official">Official IP</span>`
      : `<span class="own original">Original</span>`;

  // deterministic hue for a character's sigil avatar
  function charHue(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) % 360; }

  // procedurally derive a character's Variant manifestations (stable per name)
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const MANIFEST_TAGS = ["PRIME", "BAD", "LOST", "ECHO", "ASCENDANT", "HOLLOW", "GILDED", "SEVERED", "PALE", "FERAL", "EXILED", "CANON", "MIRROR", "DROWNED", "UNWRITTEN"];
  const MANIFEST_NOTE = ["the canon self", "corrupted by Darkness", "never fell", "born into another reality", "the version that won", "what was left behind", "remembers everything", "a quieter life", "turned on its makers", "the one who stayed", "crossed over from another branch", "the reader's favourite"];
  function manifestationsOf(c) {
    const rng = mulberry32(charHue(c.name) * 2654435761 >>> 0);
    const n = 12;
    const out = [];
    const used = new Set();
    for (let i = 0; i < n; i++) {
      let num = String(1 + Math.floor(rng() * 240)).padStart(3, "0");
      while (used.has(num)) num = String(1 + Math.floor(rng() * 240)).padStart(3, "0");
      used.add(num);
      const tag = MANIFEST_TAGS[Math.floor(rng() * MANIFEST_TAGS.length)];
      out.push({
        title: c.name,
        tag: `v_${num}_${tag}`,
        timeline: c.timeline,
        note: MANIFEST_NOTE[Math.floor(rng() * MANIFEST_NOTE.length)],
        activeMin: Math.floor(rng() * rng() * 4000),
      });
    }
    return out;
  }

  // ownership / licensing panel, shared by timeline + character detail
  function licensePanel(t) {
    if (!t) return "";
    if (t.ownership === "official") {
      return `<div class="pv-sec" id="sec-licensing" data-sec="Licensing">
        <h5 class="fill">Ownership <span class="of">Official IP${t.steward ? " · " + esc(t.steward) : ""}</span></h5>
        <div class="lic off">
          <div class="lic-row can"><span>✓</span>Read, branch &amp; create variants</div>
          <div class="lic-row can"><span>✓</span>Collaborate with other Keepers</div>
          <div class="lic-row cant"><span>—</span>Claim, sell or license content</div>
          <p class="lic-note">A stewarded universe — branch freely; ownership stays with the rights-holder.</p>
        </div></div>`;
    }
    return `<div class="pv-sec" id="sec-licensing" data-sec="Licensing">
      <h5 class="fill">Ownership <span class="of">Original IP · Creator-owned</span></h5>
      <div class="lic orig">
        <div class="lic-row can"><span>✓</span>Owned by its creators</div>
        <div class="lic-row can"><span>✓</span>Lineage &amp; contributions tracked</div>
        <div class="lic-row can"><span>✓</span>Revenue can flow back by contribution</div>
        <p class="lic-note">Future licensing &amp; revenue sharing distribute automatically along the narrative graph.</p>
      </div></div>`;
  }

  // ---- sidebar counts -----------------------------------------------------
  $("#cntTimeline").textContent = D.timelines.length;
  $("#cntBranch").textContent = D.branches.length;
  $("#cntVariant").textContent = D.variants.length;
  $("#cntEvent").textContent = D.events.length;
  $("#cntCharacter").textContent = D.characters.length;
  (function () {
    const off = D.timelines.filter((t) => t.ownership === "official").length;
    $("#cntOfficial").textContent = off;
    $("#cntOriginal").textContent = D.timelines.length - off;
  })();

  // ---- filtering + sorting ------------------------------------------------
  function passTimeline(t) {
    if (state.category && t.category !== state.category) return false;
    if (state.status && t.status !== state.status) return false;
    if (state.ownership && t.ownership !== state.ownership) return false;
    return true;
  }
  function passByParent(timelineId) {
    if (state.category && catOf(timelineId) !== state.category) return false;
    if (state.status && statusOf(timelineId) !== state.status) return false;
    if (state.ownership && D.ownerOf(timelineId) !== state.ownership) return false;
    return true;
  }
  function sortTimelines(list) {
    const s = state.sort, a = [...list];
    if (s === "Most Read") a.sort((x, y) => y.stats.readers - x.stats.readers);
    else if (s === "Most Branched") a.sort((x, y) => y.stats.branches - x.stats.branches);
    else if (s === "Newest") a.sort((x, y) => y.fresh - x.fresh);
    else if (s === "Recently Active") a.sort((x, y) => x.activeMin - y.activeMin);
    else a.sort((x, y) => y.trend - x.trend); // Trending
    return a;
  }

  // ---- row builders -------------------------------------------------------
  function timelineRow(t, rank) {
    const hot = t.featured || t.trend >= 85;
    const live = t.activeMin < 30;
    return `
      <button class="row tl ${hot ? "hot" : ""}" data-type="timeline" data-id="${t.id}">
        <span class="rank">${rank}</span>
        <div class="rmain" style="display:flex;align-items:center;gap:14px">
          <div class="thumb"><div class="art" style="${toneVars(t)}"></div></div>
          <div style="min-width:0">
            <div class="rtitle">${esc(t.title)}</div>
            <div class="rsub"><span class="cat">${t.category}</span><span class="sep"></span><span>${t.status}</span><span class="sep"></span>${ownBadge(t)}</div>
          </div>
        </div>
        <div class="rmeta">
          <div class="m"><div class="v">${fmt(t.stats.readers)}</div><div class="k">Readers</div></div>
          <div class="m"><div class="v">${fmt(t.stats.branches)}</div><div class="k">Branches</div></div>
        </div>
        <div class="ractivity"><span class="${live ? "live" : ""}">${D.ago(t.activeMin)}</span><span class="lbl">Last active</span></div>
      </button>`;
  }
  function branchRow(b, idx) {
    const parent = D.byId(b.timeline);
    return `
      <button class="row br ${b.hot ? "hot" : ""}" data-type="branch" data-idx="${idx}">
        <span class="glyphdot em"></span>
        <div class="rmain" style="min-width:0">
          <div class="rtitle">${esc(b.title)}</div>
          <div class="origin">Branch of <b>${esc(parent.title)}</b></div>
        </div>
        <div class="growth"><svg viewBox="0 0 24 24"><path d="M4 18 L10 11 L14 14 L20 6"/><path d="M20 6h-5M20 6v5"/></svg>+${b.growth}%</div>
        <div class="ractivity"><span>${fmt(b.variants)}</span><span class="lbl">Variants</span></div>
      </button>`;
  }
  function variantRow(v, idx) {
    const parent = D.byId(v.timeline);
    return `
      <button class="row va" data-type="variant" data-idx="${idx}">
        <span class="glyphdot va"></span>
        <div class="rmain" style="min-width:0">
          <div class="rtitle">${esc(v.title)} <span class="vtag">· ${v.tag}</span></div>
          <div class="origin">From <b>${esc(parent.title)}</b></div>
        </div>
        <div class="ractivity"><span class="${v.activeMin < 30 ? "live" : ""}">${D.ago(v.activeMin)}</span><span class="lbl">Active</span></div>
      </button>`;
  }
  function characterRow(c, idx) {
    const parent = D.byId(c.timeline);
    const live = c.activeMin < 30;
    const official = parent && parent.ownership === "official";
    return `
      <button class="row ch" data-type="character" data-idx="${idx}">
        <span class="charav" style="--ah:${charHue(c.name)}"></span>
        <div class="rmain" style="min-width:0">
          <div class="rtitle">${esc(c.name)}</div>
          <div class="rsub"><span class="cat">${esc(c.role)}</span><span class="sep"></span><span>${esc(parent.title)}</span>${official ? `<span class="sep"></span>${ownBadge(parent)}` : ""}</div>
        </div>
        <div class="vcount">${fmt(c.variants)}<span class="k">Variants</span></div>
        <div class="ractivity"><span class="${live ? "live" : ""}">${D.ago(c.activeMin)}</span><span class="lbl">Active</span></div>
      </button>`;
  }
  function eventRow(e, idx) {
    const parent = D.byId(e.timeline);
    return `
      <button class="row va" data-type="event" data-idx="${idx}">
        <span class="glyphdot va" style="background:var(--jade);box-shadow:0 0 8px var(--jade)"></span>
        <div class="rmain" style="min-width:0">
          <div class="rtitle">${esc(e.title)}</div>
          <div class="origin">Event in <b>${esc(parent.title)}</b></div>
        </div>
        <div class="ractivity"><span class="${e.activeMin < 30 ? "live" : ""}">${D.ago(e.activeMin)}</span><span class="lbl">Occurred</span></div>
      </button>`;
  }

  // ---- featured -----------------------------------------------------------
  function featuredBlock() {
    const t = D.timelines.find((x) => x.featured);
    if (!passTimeline(t)) return "";
    const s = t.stats;
    return `
      <div class="featured" data-type="timeline" data-id="${t.id}" id="featuredBlock">
        <div class="cover"><div class="art" style="${toneVars(t)}"></div><div class="seal"></div><div class="badge">Featured</div></div>
        <div class="fbody">
          <div class="fk">Featured Reality <span class="cat">· ${t.category}</span></div>
          <div class="ftitle">${esc(t.title)}</div>
          <div class="flog">${esc(t.logline)}</div>
          <div class="fstats">
            <div class="s"><div class="v">${fmt(s.readers)}</div><div class="k">Readers</div></div>
            <div class="s"><div class="v">${fmt(s.branches)}</div><div class="k">Branches</div></div>
            <div class="s"><div class="v">${fmt(s.variants)}</div><div class="k">Variants</div></div>
          </div>
          <div class="frow">
            <button class="btn gold" data-act="enter" data-id="${t.id}">Explore Timeline →</button>
            <button class="btn" data-act="preview" data-id="${t.id}">Quick Look</button>
          </div>
        </div>
      </div>`;
  }

  // ---- result bar (active filter chips) -----------------------------------
  function chips() {
    const c = [];
    if (state.ownership) c.push(["ownership", state.ownership === "official" ? "Official IP" : "Original IP"]);
    if (state.category) c.push(["category", state.category]);
    if (state.status) c.push(["status", state.status]);
    if (!c.length) return "";
    return `<div class="chips">${c.map(([f, v]) =>
      `<span class="chip">${v}<button data-clear="${f}">✕</button></span>`).join("")}</div>`;
  }

  // ---- center render ------------------------------------------------------
  function render() {
    const feed = $("#feed");
    const b = state.browse;

    if (b === "all") {
      const tls = sortTimelines(D.timelines.filter(passTimeline));
      const trending = tls.slice(0, 6);
      const branches = D.branches.filter((x) => passByParent(x.timeline)).sort((x, y) => y.growth - x.growth).slice(0, 5);
      const variants = D.variants.filter((x) => passByParent(x.timeline)).sort((x, y) => x.activeMin - y.activeMin).slice(0, 5);
      const characters = D.characters.filter((c) => passByParent(c.timeline)).sort((a, b) => b.variants - a.variants).slice(0, 5);
      const filtering = state.category || state.status || state.ownership;

      let html = "";

      html += `<div class="sec">
        <div class="sec-head"><h2>Trending Timelines</h2><span class="sub">${state.sort}${filtering ? " · filtered" : ""}</span><button class="seeall" data-browse="timeline">See all →</button></div>
        ${trending.length ? `<div class="rows">${trending.map((t, i) => timelineRow(t, i + 1)).join("")}</div>` : emptyState()}
      </div>`;

      if (branches.length) html += `<div class="sec">
        <div class="sec-head"><span class="pulse"></span><h2>Fastest Growing Branches</h2><span class="sub">by weekly growth</span><button class="seeall" data-browse="branch">See all →</button></div>
        <div class="rows">${branches.map((bb) => branchRow(bb, D.branches.indexOf(bb))).join("")}</div>
      </div>`;

      if (characters.length) html += `<div class="sec">
        <div class="sec-head"><h2>Notable Characters</h2><span class="sub">traced across realities</span><button class="seeall" data-browse="character">See all →</button></div>
        <div class="rows">${characters.map((c) => characterRow(c, D.characters.indexOf(c))).join("")}</div>
      </div>`;

      if (variants.length) html += `<div class="sec">
        <div class="sec-head"><span class="pulse"></span><h2>Recently Active Variants</h2><span class="sub">across the multiverse</span><button class="seeall" data-browse="variant">See all →</button></div>
        <div class="rows">${variants.map((vv) => variantRow(vv, D.variants.indexOf(vv))).join("")}</div>
      </div>`;

      feed.innerHTML = html;
    } else {
      // focused single-type list
      let items, html = "", title, sub;
      if (b === "timeline") {
        items = sortTimelines(D.timelines.filter(passTimeline));
        title = "All Timelines"; sub = state.sort;
        html = items.length ? `<div class="rows">${items.map((t, i) => timelineRow(t, i + 1)).join("")}</div>` : emptyState();
      } else if (b === "branch") {
        items = D.branches.map((x, i) => [x, i]).filter(([x]) => passByParent(x.timeline));
        items.sort((a, z) => sortBranchVal(z[0]) - sortBranchVal(a[0]));
        title = "All Branches"; sub = state.sort === "Recently Active" || state.sort === "Newest" ? "most recent" : "by growth & variants";
        html = items.length ? `<div class="rows">${items.map(([x, i]) => branchRow(x, i)).join("")}</div>` : emptyState();
      } else if (b === "variant") {
        items = D.variants.map((x, i) => [x, i]).filter(([x]) => passByParent(x.timeline));
        items.sort((a, z) => a[0].activeMin - z[0].activeMin);
        title = "All Variants"; sub = "recently active";
        html = items.length ? `<div class="rows">${items.map(([x, i]) => variantRow(x, i)).join("")}</div>` : emptyState();
      } else if (b === "event") {
        items = D.events.map((x, i) => [x, i]).filter(([x]) => passByParent(x.timeline));
        items.sort((a, z) => a[0].activeMin - z[0].activeMin);
        title = "All Events"; sub = "most recent";
        html = items.length ? `<div class="rows">${items.map(([x, i]) => eventRow(x, i)).join("")}</div>` : emptyState();
      } else if (b === "character") {
        items = D.characters.map((x, i) => [x, i]).filter(([x]) => passByParent(x.timeline));
        items.sort((a, z) => z[0].variants - a[0].variants);
        title = "All Characters"; sub = "by reach across realities";
        html = items.length ? `<div class="rows">${items.map(([x, i]) => characterRow(x, i)).join("")}</div>` : emptyState();
      }
      const count = Array.isArray(items) ? items.length : 0;
      feed.innerHTML = `<div class="sec">
        <div class="sec-head"><h2>${title}</h2><span class="sub">${sub}</span></div>
        <div class="resultbar"><b>${count}</b> result${count === 1 ? "" : "s"}${chips()}</div>
        ${html}
      </div>`;
    }

    wireRows();
    $("#center").scrollTop = 0;
  }
  function sortBranchVal(b) {
    if (state.sort === "Most Read" || state.sort === "Most Branched") return b.variants;
    if (state.sort === "Recently Active" || state.sort === "Newest") return 10000 - b.activeMin;
    return b.growth * 1000 + b.variants / 100; // Trending
  }
  function emptyState() { return `<div class="empty-state">No realities match these filters.</div>`; }

  // ---- row interactions ---------------------------------------------------
  function itemFromEl(el) {
    const type = el.getAttribute("data-type");
    if (type === "timeline") return { type, data: D.byId(el.getAttribute("data-id")) };
    if (type === "branch") return { type, data: D.branches[+el.getAttribute("data-idx")] };
    if (type === "variant") return { type, data: D.variants[+el.getAttribute("data-idx")] };
    if (type === "character") return { type, data: D.characters[+el.getAttribute("data-idx")] };
    if (type === "event") return { type, data: D.events[+el.getAttribute("data-idx")] };
    return null;
  }
  function wireRows() {
    $$("#feed .row, #feed .featured").forEach((el) => {
      if (el.classList.contains("featured")) return; // featured buttons handled below
      const item = itemFromEl(el);
      el.addEventListener("click", () => showDetail(item, el));
    });
    // featured action buttons
    $$("#feed .featured [data-act]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const t = D.byId(btn.getAttribute("data-id"));
        if (btn.getAttribute("data-act") === "enter") goToTimeline(t.id);
        else goToTimeline(t.id);
      });
    });
    $$("#feed [data-browse]").forEach((btn) => btn.addEventListener("click", () => setFilter("browse", btn.getAttribute("data-browse"))));
    $$("#feed [data-clear]").forEach((btn) => btn.addEventListener("click", (e) => { e.stopPropagation(); setFilter(btn.getAttribute("data-clear"), ""); }));
  }

  // ---- right preview ------------------------------------------------------
  function activityFor(id) {
    const own = D.activity.filter((a) => a.timeline === id);
    if (own.length) return own.slice(0, 4);
    const t = D.byId(id), kids = D.childrenOf(id);
    const synth = [];
    if (kids.branches[0]) synth.push({ kind: "Branch Active", label: kids.branches[0].title, timeline: id });
    if (kids.variants[0]) synth.push({ kind: "Variant Discovered", label: kids.variants[0].title + " · " + kids.variants[0].tag, timeline: id });
    synth.push({ kind: "Timeline Growth", label: t.title + " · +" + fmt(Math.round(t.stats.readers * 0.006)) + " Readers", timeline: id });
    if (kids.events[0]) synth.push({ kind: "Event", label: kids.events[0].title, timeline: id });
    return synth.slice(0, 4);
  }
  function feedRows(id) {
    return activityFor(id).map((a, i) =>
      `<div class="frow${i === 0 ? " is-new" : ""}"><div class="fk">${a.kind}</div><div class="fl">${esc(a.label)}</div><div class="ft">${D.ago(2 + i * 7)}</div></div>`).join("");
  }

  // ---- dense data helpers -------------------------------------------------
  const DZ = window.PARADOX_DENSITY;
  // per-open progressive reveal state
  let dense = { id: null, pool: null, bShown: 0, vShown: 0 };
  const B_INIT = 34, B_STEP = 30, V_INIT = 64, V_STEP = 60;

  function branchCell(b) {
    const cls = b.hot ? "gold" : (b.growth <= 0 ? "cold" : "");
    const g = b.growth > 0 ? `+${b.growth}%` : `${b.growth}%`;
    return `<button class="bx" data-did="${b._did}" data-dtype="branch">
        <span class="bdot ${cls}"></span>
        <span class="bt"><span class="n">${esc(b.title)}</span><span class="meta">${fmt(b.variants)} variants · ${DZ.ago(b.activeMin)}</span></span>
        <span class="bg ${b.growth <= 0 ? "flat" : ""}">${g}</span>
      </button>`;
  }
  function variantChip(v) {
    const live = v.activeMin < 60;
    return `<button class="vchip" data-did="${v._did}" data-dtype="variant">
        <span class="vd ${live ? "live" : ""}"></span>
        <span class="vmeta"><span class="vn">${esc(v.title)}</span><span class="vt">${v.tag} · ${DZ.ago(v.activeMin)}</span></span>
      </button>`;
  }
  function chronEvent(e) {
    return `<button class="cev" data-did="${e._did}" data-dtype="event">
        <span class="ct">${esc(e.title)}</span>
        <span class="cm"><span class="cch">${e.chapter}</span><span>${DZ.ago(e.activeMin)}</span></span>
      </button>`;
  }
  function contribRow(c) {
    return `<div class="cu"><span class="av" style="--ah:${c.hue}"></span><span class="cn">${esc(c.name)}</span><span class="cc">${fmt(c.count)} contributions</span></div>`;
  }
  function denseFeed(feed, n) {
    return feed.slice(0, n).map((a, i) =>
      `<div class="frow${i === 0 ? " is-new" : ""}"><div class="fk">${a.kind}</div><div class="fl">${esc(a.label)}</div><div class="ft">${DZ.ago(a.min)}</div></div>`).join("");
  }

  // ---- inline detail markup (full-width, replaces the feed) ---------------
  function detailTimeline(t) {
    const s = t.stats, gold = !!t.featured;
    const ownOfficial = t.ownership === "official";
    const pool = DZ.forTimeline(t.id);
    dense = { id: t.id, pool, bShown: B_INIT, vShown: V_INIT };
    const liveNow = pool.variants.filter((v) => v.activeMin < 60).length + Math.round(s.contributors * 0.004);

    return `
      <div class="detail-hero" id="detailHero" data-sec="Overview">
        <div class="dcover"><div class="art" style="${toneVars(t)}"></div><div class="seal"></div><div class="badge ${gold || ownOfficial ? "gold" : "tl"}">${ownOfficial ? "Official IP" : (gold ? "Featured" : "Timeline")}</div></div>
        <div class="dmeta">
          <div class="dk ${gold || ownOfficial ? "gold" : ""}">${gold ? "Featured · " : ""}${ownOfficial ? "Official IP" : "Original IP"} · ${esc(t.category)}</div>
          <div class="dtitle">${esc(t.title)}</div>
          <div class="dsub">${t.status} · last active ${D.ago(t.activeMin)} · ${fmt(s.contributors)} contributors</div>
          <div class="dlog">${esc(t.logline)}</div>
          <div class="dstats">
            <div class="s"><div class="v">${fmt(s.readers)}</div><div class="k">Readers</div></div>
            <div class="s"><div class="v">${fmt(s.branches)}</div><div class="k">Branches</div></div>
            <div class="s"><div class="v">${fmt(s.variants)}</div><div class="k">Variants</div></div>
          </div>
          <div class="dactions">
            <button class="btn primary ${gold ? "gold" : ""}" data-act="enter">Enter Timeline</button>
            <button class="btn" data-act="branches">View All Branches</button>
          </div>
        </div>
      </div>
      <div class="detail-body" id="detailBody">
        <div class="dribbon">
          <div class="cell"><div class="v">${fmt(s.readers)}</div><div class="k">Readers</div></div>
          <div class="cell"><div class="v">${fmt(s.branches)}</div><div class="k">Branches</div></div>
          <div class="cell"><div class="v">${fmt(s.variants)}</div><div class="k">Variants</div></div>
          <div class="cell"><div class="v">${fmt(s.events)}</div><div class="k">Events</div></div>
          <div class="cell"><div class="v live">${fmt(liveNow)}</div><div class="k">Active Now</div></div>
        </div>
        <div class="dbody-grid">
          <div class="dcol-main">
            <div class="pv-sec" id="sec-branches" data-sec="Branches">
              <h5 class="fill">Branches <span class="of">showing <b id="bShown">${B_INIT}</b> of <b>${fmt(s.branches)}</b></span></h5>
              <div class="bgrid" id="bGrid">${pool.branches.slice(0, B_INIT).map(branchCell).join("")}</div>
              <button class="showmore" data-more="branch">Load more branches</button>
            </div>
            <div class="pv-sec" id="sec-variants" data-sec="Variants">
              <h5 class="fill">Variants <span class="of">showing <b id="vShown">${V_INIT}</b> of <b>${fmt(s.variants)}</b></span></h5>
              <div class="vgrid" id="vGrid">${pool.variants.slice(0, V_INIT).map(variantChip).join("")}</div>
              <button class="showmore" data-more="variant">Load more variants</button>
            </div>
            <div class="pv-sec" id="sec-chronology" data-sec="Chronology">
              <h5 class="fill">Chronology <span class="of"><b>${fmt(s.events)}</b> recorded events</span></h5>
              <div class="chron" id="chron">${pool.events.map(chronEvent).join("")}</div>
            </div>
          </div>
          <aside class="dcol-side">
            <div class="pv-sec" id="sec-activity">
              <h5><span class="pdot"></span>Live Activity</h5>
              <div class="pv-feed dense" data-tl="${t.id}" data-cap="18">${denseFeed(pool.feed, 16)}</div>
            </div>
            ${licensePanel(t)}
            <div class="pv-sec" id="sec-contributors">
              <h5 class="fill">Top Contributors <span class="of"><b>${fmt(s.contributors)}</b> keepers</span></h5>
              <div class="contrib">${pool.contributors.slice(0, 8).map(contribRow).join("")}</div>
            </div>
          </aside>
        </div>
      </div>`;
  }

  function detailBranch(b) {
    const parent = D.byId(b.timeline);
    const pool = DZ.forBranch(b);
    dense = { id: "br:" + (b._did || b.title), pool, bShown: 0, vShown: V_INIT };
    const vCount = b.variants || (pool.variants.length);
    return `
      <div class="detail-hero" id="detailHero" data-sec="Overview">
        <div class="dcover"><div class="art" style="${toneVars(parent)}"></div><div class="seal"></div><div class="badge br">Branch</div></div>
        <div class="dmeta">
          <div class="dk gold">Branch · Alternate Reality</div>
          <div class="dtitle">${esc(b.title)}</div>
          <div class="dsub">Branched from <b>${esc(parent.title)}</b> · ${parent.category}</div>
          <div class="dlog">A divergence of ${esc(parent.title)} — “${esc(parent.logline)}”</div>
          <div class="dstats">
            <div class="s"><div class="v">${fmt(vCount)}</div><div class="k">Variants</div></div>
            <div class="s"><div class="v">${b.growth > 0 ? "+" + b.growth + "%" : (b.growth || 0) + "%"}</div><div class="k">Growth</div></div>
            <div class="s"><div class="v">${b.hot ? "High" : "Steady"}</div><div class="k">Activity</div></div>
          </div>
          <div class="dactions">
            <button class="btn primary gold" data-act="enter">Open Branch</button>
            <button class="btn" data-act="origin" data-id="${parent.id}">View Origin Timeline</button>
          </div>
        </div>
      </div>
      <div class="detail-body" id="detailBody">
        <div class="dbody-grid">
          <div class="dcol-main">
            <div class="pv-sec" id="sec-origin" data-sec="Origin">
              <h5 class="fill">Origin Timeline</h5>
              <div class="pv-li" data-go="timeline" data-id="${parent.id}"><span class="pv-li-t">${esc(parent.title)}</span><span class="pv-li-m">${fmt(parent.stats.readers)} readers</span></div>
            </div>
            <div class="pv-sec" id="sec-variants" data-sec="Variants">
              <h5 class="fill">Variants <span class="of">showing <b id="vShown">${V_INIT}</b> of <b>${fmt(vCount)}</b></span></h5>
              <div class="vgrid" id="vGrid">${pool.variants.slice(0, V_INIT).map(variantChip).join("")}</div>
              <button class="showmore" data-more="variant">Load more variants</button>
            </div>
          </div>
          <aside class="dcol-side">
            <div class="pv-sec" id="sec-activity">
              <h5><span class="pdot"></span>Live Activity</h5>
              <div class="pv-feed dense" data-tl="${parent.id}" data-cap="18">${denseFeed(pool.feed, 14)}</div>
            </div>
          </aside>
        </div>
      </div>`;
  }

  function detailVariant(v, isVar) {
    const parent = D.byId(v.timeline);
    dense = { id: v.timeline, pool: DZ.forTimeline(v.timeline), bShown: 0, vShown: 0 };
    return `
      <div class="detail-hero" id="detailHero" data-sec="Overview">
        <div class="dcover"><div class="art" style="${toneVars(parent)}"></div><div class="seal"></div><div class="badge va">${isVar ? "Variant" : "Event"}</div></div>
        <div class="dmeta">
          <div class="dk">${isVar ? "Variant · Character" : "Event · Story Moment"}</div>
          <div class="dtitle">${esc(v.title)}</div>
          <div class="dsub">${isVar ? esc(v.tag) + " · exists within " : "Occurs within "}<b>${esc(parent.title)}</b></div>
          <div class="dlog">${isVar ? "One reality of this character, traced across the multiverse from " : "A pivotal moment in "}${esc(parent.title)}.</div>
          <div class="dstats">
            <div class="s"><div class="v">${parent.category.split(" ")[0]}</div><div class="k">Genre</div></div>
            <div class="s"><div class="v">${D.ago(v.activeMin)}</div><div class="k">${isVar ? "Active" : "Occurred"}</div></div>
            <div class="s"><div class="v">${parent.status}</div><div class="k">Status</div></div>
          </div>
          <div class="dactions">
            <button class="btn primary" data-act="enter">${isVar ? "Trace Variant" : "Read Event"}</button>
            <button class="btn" data-act="origin" data-id="${parent.id}">View Origin Timeline</button>
          </div>
        </div>
      </div>
      <div class="detail-body" id="detailBody">
        <div class="dbody-grid">
          <div class="dcol-main"><div class="pv-sec" id="sec-origin" data-sec="Reality of Origin"><h5>Reality of Origin</h5>
            <div class="pv-li" data-go="timeline" data-id="${parent.id}"><span class="pv-li-t">${esc(parent.title)}</span><span class="pv-li-m">${fmt(parent.stats.readers)} readers</span></div>
          </div></div>
          <aside class="dcol-side"><div class="pv-sec" id="sec-activity" data-sec="Activity"><h5><span class="pdot"></span>Latest Activity</h5><div class="pv-feed" data-tl="${parent.id}">${feedRows(parent.id)}</div></div></aside>
        </div>
      </div>`;
  }

  function detailCharacter(c) {
    const parent = D.byId(c.timeline);
    charManifest = manifestationsOf(c);
    dense = { id: c.timeline, pool: DZ.forTimeline(c.timeline), bShown: 0, vShown: 0 };
    const ownOfficial = parent.ownership === "official";
    const h = charHue(c.name);
    return `
      <div class="detail-hero" id="detailHero" data-sec="Overview">
        <div class="dcover"><div class="art" style="--h1:${h};--h2:${(h + 60) % 360}"></div><div class="seal"></div><div class="badge va">Character</div></div>
        <div class="dmeta">
          <div class="dk">Character · ${ownOfficial ? "Official IP" : "Original IP"} · ${esc(parent.title)}</div>
          <div class="dtitle">${esc(c.name)}</div>
          <div class="dsub">${esc(c.role)} · a narrative entity of <b>${esc(parent.title)}</b></div>
          <div class="dlog">One character, ${fmt(c.variants)} ways to be — every variant carries its own personality, history, and fate.</div>
          <div class="dstats">
            <div class="s"><div class="v">${fmt(c.variants)}</div><div class="k">Variants</div></div>
            <div class="s"><div class="v">${c.realities}</div><div class="k">Realities</div></div>
            <div class="s"><div class="v">${D.ago(c.activeMin)}</div><div class="k">Last Active</div></div>
          </div>
          <div class="dactions">
            <button class="btn primary" data-act="enter">Create a Variant</button>
            <button class="btn" data-act="origin" data-id="${parent.id}">View Origin Timeline</button>
          </div>
        </div>
      </div>
      <div class="detail-body" id="detailBody">
        <div class="dbody-grid">
          <div class="dcol-main">
            <div class="pv-sec" id="sec-variants" data-sec="Variants">
              <h5 class="fill">Variants of this Character <span class="of">showing <b>${charManifest.length}</b> of <b>${fmt(c.variants)}</b></span></h5>
              <div class="vgrid">${charManifest.map((m, i) => `
                <button class="vchip" data-vman="${i}">
                  <span class="vd ${m.activeMin < 60 ? "live" : ""}"></span>
                  <span class="vmeta"><span class="vn">${esc(m.tag)}</span><span class="vt">${esc(m.note)}</span></span>
                </button>`).join("")}</div>
            </div>
            <div class="pv-sec" id="sec-origin" data-sec="Reality of Origin">
              <h5 class="fill">Reality of Origin</h5>
              <div class="pv-li" data-go="timeline" data-id="${parent.id}"><span class="pv-li-t">${esc(parent.title)}</span><span class="pv-li-m">${fmt(parent.stats.readers)} readers</span></div>
            </div>
          </div>
          <aside class="dcol-side">
            ${licensePanel(parent)}
            <div class="pv-sec" id="sec-activity" data-sec="Activity"><h5><span class="pdot"></span>Latest Activity</h5><div class="pv-feed" data-tl="${parent.id}">${feedRows(parent.id)}</div></div>
          </aside>
        </div>
      </div>`;
  }

  function detailHTML(item) {
    let body = "";
    if (item.type === "timeline") body = detailTimeline(item.data);
    else if (item.type === "branch") body = detailBranch(item.data);
    else if (item.type === "character") body = detailCharacter(item.data);
    else body = detailVariant(item.data, item.type === "variant");
    return `<div class="detail">${body}</div>`;
  }

  // ---- open / animate / close --------------------------------------------
  // Clicking a row lifts that row to the top of the screen while the rest of the
  // feed fades away; the full detail then fades in beneath it. The left rail
  // crossfades from filters into a Google-Docs-style outline of the open item.
  const EASE = "cubic-bezier(0.22,1,0.36,1)";
  let scrollSpy = null;

  // attach behaviour to a freshly-rendered detail (events, outline, live feed)
  function mountDetail(item) {
    wireDetail(item);
    fillOutline();
    startLive();
  }
  function renderDetail(item) {
    const feed = $("#feed"), center = $("#center");
    feed.innerHTML = detailHTML(item);
    center.scrollTop = 0;
    mountDetail(item);
  }

  // measure the detail card's resting geometry (and where its title + cover sit
  // inside it) without disturbing the live feed
  function measureHero(item, feed, center) {
    const cs = getComputedStyle(center);
    const padL = parseFloat(cs.paddingLeft), padT = parseFloat(cs.paddingTop);
    const feedW = feed.clientWidth;
    const probe = document.createElement("div");
    probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;left:0;top:0;width:${feedW}px;`;
    probe.innerHTML = detailHTML(item);
    center.appendChild(probe);
    const hero = probe.querySelector("#detailHero");
    const hr = hero.getBoundingClientRect();
    const titleEl = probe.querySelector(".dtitle"), coverEl = probe.querySelector(".dcover");
    const tr = titleEl.getBoundingClientRect(), cr = coverEl.getBoundingClientRect();
    const tFS = parseFloat(getComputedStyle(titleEl).fontSize);
    const centerRect = center.getBoundingClientRect();
    const out = {
      box: {
        left: centerRect.left + padL + Math.max(0, (feedW - hr.width) / 2),
        top: centerRect.top + padT, width: hr.width, height: hr.height,
      },
      title: { x: tr.left - hr.left, y: tr.top - hr.top, w: tr.width, fontSize: tFS },
      cover: { x: cr.left - hr.left, y: cr.top - hr.top, w: cr.width, h: cr.height },
    };
    probe.remove();
    return out;
  }

  function showDetail(item, sourceEl) {
    if (!item || !item.data) return;
    // Timelines now open the dedicated Timeline View page — the old inline
    // timeline detail is retired. (Branches / variants / events / characters
    // still expand inline, since they have no standalone page.)
    if (item.type === "timeline") { goToTimeline(item.data.id); return; }
    const feed = $("#feed"), center = $("#center");
    const lifting = !inDetail && !!sourceEl;   // arriving fresh from the list
    if (!inDetail) lastScroll = center.scrollTop;
    inDetail = true;

    // the left rail morphs into the document outline right away
    setLeftMode(true, item);

    if (lifting) {
      const rect = sourceEl.getBoundingClientRect();
      const m = measureHero(item, feed, center), fin = m.box;
      const srcTitle = sourceEl.querySelector(".rtitle, .ftitle");
      const srcThumb = sourceEl.querySelector(".thumb, .cover");
      const tRect = srcTitle.getBoundingClientRect();
      const tFS = parseFloat(getComputedStyle(srcTitle).fontSize);

      // the rest of the feed fades away
      const listFade = feed.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: "ease", fill: "forwards" });

      const overlays = [];
      const MOVE = { duration: 560, delay: 160, easing: EASE, fill: "both" };
      const fadeIn = (el) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "ease" });

      // 1) the container: a bordered card that lifts and opens its border down
      const card = document.createElement("div");
      card.className = "morph-card";
      card.style.zIndex = "44";
      Object.assign(card.style, { left: rect.left + "px", top: rect.top + "px", width: rect.width + "px", height: rect.height + "px" });
      document.body.appendChild(card);
      const grow = card.animate(
        [
          { left: rect.left + "px", top: rect.top + "px", width: rect.width + "px", height: rect.height + "px" },
          { left: fin.left + "px", top: fin.top + "px", width: fin.width + "px", height: fin.height + "px" },
        ], MOVE);
      fadeIn(card);
      overlays.push(card);

      // 2) the SAME title travels and grows from the row into the hero
      const titleL = fin.left + m.title.x, titleT = fin.top + m.title.y;
      const titleEl = document.createElement("div");
      titleEl.textContent = item.data.title;
      titleEl.style.cssText = `position:fixed;z-index:46;pointer-events:none;margin:0;color:var(--soft);` +
        `font-family:var(--serif);font-weight:500;line-height:1.02;transform-origin:top left;` +
        `left:${titleL}px;top:${titleT}px;width:${m.title.w}px;font-size:${m.title.fontSize}px;`;
      document.body.appendChild(titleEl);
      titleEl.animate(
        [{ transform: `translate(${tRect.left - titleL}px, ${tRect.top - titleT}px) scale(${tFS / m.title.fontSize})` }, { transform: "none" }], MOVE);
      fadeIn(titleEl);
      overlays.push(titleEl);

      // 3) timeline rows have a thumbnail that grows into the hero's cover art
      if (srcThumb) {
        const thRect = srcThumb.getBoundingClientRect();
        const coverL = fin.left + m.cover.x, coverT = fin.top + m.cover.y;
        const coverEl = document.createElement("div");
        coverEl.className = "dcover";
        coverEl.style.cssText = `position:fixed;z-index:45;pointer-events:none;transform-origin:top left;` +
          `left:${coverL}px;top:${coverT}px;width:${m.cover.w}px;height:${m.cover.h}px;`;
        coverEl.innerHTML = `<div class="art" style="${toneVars(item.data)}"></div><div class="seal"></div>`;
        document.body.appendChild(coverEl);
        coverEl.animate(
          [{ transform: `translate(${thRect.left - coverL}px, ${thRect.top - coverT}px) scale(${thRect.width / m.cover.w}, ${thRect.height / m.cover.h})` }, { transform: "none" }], MOVE);
        fadeIn(coverEl);
        overlays.push(coverEl);
      }

      const land = () => {
        listFade.cancel();
        renderDetail(item);
        feed.style.opacity = "1";
        const hero = $("#detailHero"), body = $("#detailBody");
        // the real card surfaces exactly beneath the travelling title/cover, so the
        // hand-off is invisible; only the secondary content actually fades in
        hero.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, easing: "ease", fill: "backwards" });
        body.animate([{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "none" }], { duration: 520, delay: 110, easing: EASE, fill: "backwards" });
        overlays.forEach((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, delay: 70, easing: "ease", fill: "forwards" })
          .finished.then(() => el.remove(), () => el.remove()));
      };
      grow.finished.then(land, land);
    } else {
      // navigating between items while already in detail — a clean crossfade
      const fade = feed.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: "ease", fill: "forwards" });
      const go = () => {
        fade.cancel();
        renderDetail(item);
        feed.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: "ease" });
        const body = $("#detailBody");
        if (body) body.animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], { duration: 500, delay: 60, easing: EASE, fill: "backwards" });
      };
      fade.finished.then(go, go);
    }
  }

  // navigate to a related item while staying in detail (no source row to lift from)
  function navDetail(item) {
    showDetail(item, null);
    toast(`Now viewing <em>${esc(item.data.title)}</em>`);
  }

  function leaveDetailState() {
    inDetail = false;
    clearInterval(liveTimer);
    teardownScrollSpy();
    setLeftMode(false);
  }

  function closeDetail() {
    const feed = $("#feed"), center = $("#center");
    const fade = feed.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: "ease", fill: "forwards" });
    leaveDetailState();   // left rail crossfades back to filters in parallel
    const go = () => {
      fade.cancel();
      render();
      center.scrollTop = lastScroll;
      feed.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 340, easing: "ease" });
    };
    fade.finished.then(go, go);
  }

  function wireDetail(item) {
    const root = $("#feed");
    $$("[data-act]", root).forEach((btn) => btn.addEventListener("click", () => {
      const a = btn.getAttribute("data-act");
      if (a === "enter") openEnter(item);
      else if (a === "branches") { setFilter("browse", "branch"); toast(`Showing branches of <em>${esc(item.data.title)}</em>`); }
      else if (a === "origin") navDetail({ type: "timeline", data: D.byId(btn.getAttribute("data-id")) });
    }));
    $$(".pv-li[data-go]", root).forEach((li) => li.addEventListener("click", () => {
      const go = li.getAttribute("data-go");
      if (go === "timeline") navDetail({ type: "timeline", data: D.byId(li.getAttribute("data-id")) });
      else if (go === "branch") navDetail({ type: "branch", data: D.branches[+li.getAttribute("data-bidx")] });
      else if (go === "variant") navDetail({ type: "variant", data: D.variants[+li.getAttribute("data-vidx")] });
      else if (go === "event") navDetail({ type: "event", data: D.events[+li.getAttribute("data-eidx")] });
    }));
    // character → its generated variant manifestations
    $$(".vchip[data-vman]", root).forEach((ch) => ch.addEventListener("click", (e) => {
      e.stopPropagation();
      const m = charManifest[+ch.getAttribute("data-vman")];
      if (m) navDetail({ type: "variant", data: m });
    }));
    // dense rows (branches / variants / chronology) — delegated so appended items work too
    root.addEventListener("click", (e) => {
      const cell = e.target.closest(".bx, .vchip, .cev");
      if (!cell || !root.contains(cell)) return;
      const data = DZ.get(cell.getAttribute("data-did"));
      if (data) navDetail({ type: cell.getAttribute("data-dtype"), data });
    });
    // progressive reveal
    $$(".showmore[data-more]", root).forEach((btn) => btn.addEventListener("click", () => {
      const kind = btn.getAttribute("data-more");
      if (kind === "branch") {
        const grid = $("#bGrid"), more = dense.pool.branches.slice(dense.bShown, dense.bShown + B_STEP);
        grid.insertAdjacentHTML("beforeend", more.map(branchCell).join(""));
        dense.bShown += more.length;
        const lbl = $("#bShown"); if (lbl) lbl.textContent = dense.bShown;
        if (dense.bShown >= dense.pool.branches.length) { btn.disabled = true; btn.textContent = "All loaded branches shown"; }
      } else {
        const grid = $("#vGrid"), more = dense.pool.variants.slice(dense.vShown, dense.vShown + V_STEP);
        grid.insertAdjacentHTML("beforeend", more.map(variantChip).join(""));
        dense.vShown += more.length;
        const lbl = $("#vShown"); if (lbl) lbl.textContent = dense.vShown;
        if (dense.vShown >= dense.pool.variants.length) { btn.disabled = true; btn.textContent = "All loaded variants shown"; }
      }
    }));
  }

  // ---- left rail: filters <-> document outline ----------------------------
  const TYPE_LABEL = { timeline: "Timeline", branch: "Branch", variant: "Variant", character: "Character", event: "Event" };
  function setLeftMode(detail, item) {
    const filtersNav = $("#filtersNav"), docNav = $("#docNav");
    if (detail) {
      docNav.innerHTML = `
        <button class="dn-back" id="dnBack"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>All Realities</button>
        <div class="dn-doc"><div class="dn-kicker">${TYPE_LABEL[item.type]}</div><div class="dn-title">${esc(item.data.title)}</div></div>
        <div class="dn-label">On this page</div>
        <div class="dn-outline" id="dnOutline"></div>`;
      $("#dnBack").addEventListener("click", closeDetail);
      filtersNav.style.display = "none";
      docNav.style.display = "block";
      docNav.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: EASE, fill: "backwards" });
    } else {
      docNav.style.display = "none";
      filtersNav.style.display = "block";
      filtersNav.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: "ease" });
    }
  }

  // build the outline list from the sections actually rendered, then watch scroll
  function fillOutline() {
    const outline = $("#dnOutline");
    if (!outline) return;
    const secs = $$("#feed [data-sec]");
    outline.innerHTML = secs.map((s) =>
      `<button class="dn-item" data-target="${s.id}"><span class="dn-rail"></span>${esc(s.getAttribute("data-sec"))}</button>`).join("");
    const center = $("#center");
    $$(".dn-item", outline).forEach((btn) => btn.addEventListener("click", () => {
      const sec = document.getElementById(btn.getAttribute("data-target"));
      if (sec) center.scrollTo({ top: Math.max(0, sec.offsetTop - 20), behavior: "smooth" });
    }));
    setupScrollSpy();
  }

  function setupScrollSpy() {
    teardownScrollSpy();
    const center = $("#center");
    const secs = $$("#feed [data-sec]");
    const items = $$("#dnOutline .dn-item");
    if (!secs.length || !items.length) return;
    const onScroll = () => {
      const y = center.scrollTop + 110;
      let curId = secs[0].id;
      for (const s of secs) { if (s.offsetTop - 24 <= y) curId = s.id; }
      items.forEach((b) => b.classList.toggle("on", b.getAttribute("data-target") === curId));
    };
    scrollSpy = { el: center, fn: onScroll };
    center.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  function teardownScrollSpy() {
    if (scrollSpy) { scrollSpy.el.removeEventListener("scroll", scrollSpy.fn); scrollSpy = null; }
  }

  // ---- live activity (dense) ----------------------------------------------
  function startLive() {
    clearInterval(liveTimer);
    liveTimer = setInterval(() => {
      const feedEl = $("#feed .pv-feed");
      if (!feedEl) return;
      const id = feedEl.getAttribute("data-tl");
      const cap = +(feedEl.getAttribute("data-cap") || 5);
      const t = D.byId(id);
      const pool = (dense && dense.pool) ? dense.pool : null;
      const rk = () => ["Variant Discovered", "Branch Created", "Reader Joined", "Convergence Requested", "Branch Emerging", "Annotation Added", "Variant Traced", "Reality Forked", "Canon Disputed"][Math.floor(Math.random() * 9)];
      let kind = rk(), label;
      if (pool) {
        const r = Math.random();
        if (r < 0.4 && pool.branches.length) label = pool.branches[Math.floor(Math.random() * pool.branches.length)].title;
        else if (r < 0.78 && pool.variants.length) { const v = pool.variants[Math.floor(Math.random() * pool.variants.length)]; label = v.title + " · " + v.tag; }
        else if (pool.events.length) label = pool.events[Math.floor(Math.random() * pool.events.length)].title;
        else label = (t ? t.title : "A reality") + " stirred";
      } else {
        label = (t ? t.title : "A reality") + " stirred";
      }
      if (kind === "Reader Joined") label = "A new reader entered " + (t ? t.title : "the reality");
      const row = document.createElement("div");
      row.className = "frow is-new";
      row.innerHTML = `<div class="fk">${kind}</div><div class="fl">${esc(label)}</div><div class="ft">just now</div>`;
      feedEl.prepend(row);
      while (feedEl.children.length > cap) feedEl.removeChild(feedEl.lastChild);
    }, 2600);
  }

  // ---- filter wiring ------------------------------------------------------
  function setFilter(filter, value) {
    state[filter] = value;
    // sync sidebar active states
    $$(`.fitem[data-filter="${filter}"]`).forEach((el) => el.classList.toggle("on", el.getAttribute("data-value") === value));
    if (inDetail) leaveDetailState();
    render();
  }
  $$(".fitem").forEach((el) => el.addEventListener("click", () => {
    setFilter(el.getAttribute("data-filter"), el.getAttribute("data-value"));
  }));
  $("#resetFilters").addEventListener("click", () => {
    state.browse = "all"; state.category = ""; state.sort = "Trending"; state.status = ""; state.ownership = "";
    $$(".fitem").forEach((el) => {
      const f = el.getAttribute("data-filter"), v = el.getAttribute("data-value");
      const def = (f === "browse" && v === "all") || (f === "category" && v === "") || (f === "sort" && v === "Trending") || (f === "status" && v === "") || (f === "ownership" && v === "");
      el.classList.toggle("on", def);
    });
    if (inDetail) leaveDetailState();
    render();
    toast("Filters reset");
  });

  // ---- search -------------------------------------------------------------
  const searchInput = $("#searchInput"), searchResults = $("#searchResults");
  const IDX = (() => {
    const idx = [];
    D.timelines.forEach((t) => idx.push({ label: t.title, type: "Timeline", item: { type: "timeline", data: t }, m: t.category }));
    D.branches.forEach((b) => idx.push({ label: b.title, type: "Branch", item: { type: "branch", data: b }, m: "of " + D.byId(b.timeline).title }));
    D.variants.forEach((v) => idx.push({ label: v.title + " " + v.tag, type: "Variant", item: { type: "variant", data: v }, m: D.byId(v.timeline).title }));
    D.characters.forEach((c) => idx.push({ label: c.name, type: "Character", item: { type: "character", data: c }, m: D.byId(c.timeline).title }));
    D.events.forEach((e) => idx.push({ label: e.title, type: "Event", item: { type: "event", data: e }, m: D.byId(e.timeline).title }));
    return idx;
  })();
  let srSel = -1, srHits = [];
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { searchResults.classList.remove("show"); return; }
    srHits = IDX.filter((i) => i.label.toLowerCase().includes(q)).slice(0, 8);
    srSel = -1;
    if (!srHits.length) searchResults.innerHTML = `<div class="sr-empty">No realities found for “${esc(searchInput.value)}”</div>`;
    else searchResults.innerHTML = srHits.map((h, i) =>
      `<div class="sr-item" data-i="${i}"><span class="sr-type">${h.type}</span><span class="sr-t">${esc(h.label)}</span><span class="sr-m">${esc(h.m)}</span></div>`).join("");
    searchResults.classList.add("show");
    $$(".sr-item", searchResults).forEach((el) => {
      const i = +el.getAttribute("data-i");
      if (Number.isNaN(i)) return;
      el.addEventListener("click", () => goToHit(srHits[i]));
    });
  });
  searchInput.addEventListener("keydown", (e) => {
    if (!srHits.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); srSel = Math.min(srHits.length - 1, srSel + 1); paintSel(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); srSel = Math.max(0, srSel - 1); paintSel(); }
    else if (e.key === "Enter") { goToHit(srHits[srSel >= 0 ? srSel : 0]); }
    else if (e.key === "Escape") { searchResults.classList.remove("show"); searchInput.blur(); }
  });
  function paintSel() { $$(".sr-item", searchResults).forEach((el, i) => el.classList.toggle("sel", i === srSel)); }
  function goToHit(h) {
    if (!h) return;
    showDetail(h.item, null);
    searchResults.classList.remove("show"); searchInput.value = "";
    toast(`Now viewing <em>${esc(h.label)}</em>`);
  }
  document.addEventListener("click", (e) => { if (!e.target.closest(".search")) searchResults.classList.remove("show"); });

  // ---- modals + toast -----------------------------------------------------
  const scrim = $("#scrim"), modal = $("#modal");
  function openModal(html) { modal.innerHTML = html; scrim.classList.add("show"); }
  function closeModal() { scrim.classList.remove("show"); }
  scrim.addEventListener("click", (e) => { if (e.target === scrim) closeModal(); });
  function openEnter(item) {
    if (item.type === "timeline") { goToTimeline(item.data.id); return; }
    const label = { branch: "Opening Branch", variant: "Tracing Variant", character: "New Variant of", event: "Reading Event" }[item.type];
    openModal(`
      <button class="mclose">✕</button>
      <div class="mk">${label}</div>
      <h3>${esc(item.data.title)}</h3>
      <p>This would open the full ${item.type} page — every event, branch, and variant in its own reading view. This is the Explore preview.</p>
      <div class="row2">
        <button class="btn gold" id="mGo">Continue</button>
        <button class="btn" id="mCancel">Stay in Explore</button>
      </div>`);
    $(".mclose", modal).onclick = closeModal;
    $("#mCancel").onclick = closeModal;
    $("#mGo").onclick = () => { closeModal(); toast(`Opening <em>${esc(item.data.title)}</em>…`); };
  }
  function openSignIn() {
    openModal(`
      <button class="mclose">✕</button>
      <div class="mk">Join the Multiverse</div>
      <h3>Become a Keeper</h3>
      <p>Save realities, branch your own timelines, and trace variants across the multiverse.</p>
      <input type="email" placeholder="you@reality.now" />
      <div class="row2">
        <button class="btn gold" id="mIn">Enter Paradox</button>
        <button class="btn" id="mGuest">Browse as guest</button>
      </div>`);
    $(".mclose", modal).onclick = closeModal;
    $("#mGuest").onclick = closeModal;
    $("#mIn").onclick = () => { closeModal(); toast("Welcome, Keeper."); };
  }

  const toastEl = $("#toast"); let toastT;
  function toast(html) { toastEl.innerHTML = html; toastEl.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("show"), 3200); }

  // ---- nav ----------------------------------------------------------------
  $("#brand").addEventListener("click", warpToHome);
  // sign-in is showcased as a component, not a demo destination — keep it in-app
  $("#signinBtn").addEventListener("click", () => toast("Sign-in is showcased in the component library."));
  $("#createBtn").addEventListener("click", () => toast("Pick a reality, then branch a new timeline from it."));
  $("#exploreBtn").addEventListener("click", () => { $("#resetFilters").click(); $("#center").scrollTop = 0; });

  // ---- seamless warp transitions -----------------------------------------
  let leaving = false;
  // arrival: emerge from the nexus, content decelerating into place as the bloom dissolves
  if (new URLSearchParams(location.search).get("warp")) {
    document.documentElement.classList.add("warp-in");
    // let the bloomed first frame paint, then release into the resting layout
    const release = () => document.documentElement.classList.remove("warp-in");
    requestAnimationFrame(() => requestAnimationFrame(release));
    // fallback: never leave the page stuck hidden if rAF is throttled
    setTimeout(release, 120);
    // tidy the URL so a manual refresh doesn't replay the dive
    setTimeout(() => { history.replaceState(null, "", location.pathname); }, 1300);
  }
  // departure: the inner world recedes and collapses into the nexus' light,
  // then home emerges from that same bloom and zooms back out to the wide view.
  // diving into a single reality — the same bloom handoff, landing on its Timeline View
  function goToTimeline(id) {
    if (leaving) return;
    leaving = true;
    const warp = $("#warp");
    const bloom = warp.querySelector(".warp-bloom");
    const app = $(".app");
    app.style.transition = "opacity 0.6s ease-in, transform 0.85s cubic-bezier(0.5,0,0.85,0.35), filter 0.6s ease-in";
    app.style.opacity = "0";
    app.style.transform = "scale(0.9)";
    app.style.filter = "blur(6px)";
    warp.style.transition = "opacity 0.7s ease-in";
    bloom.style.transition = "transform 0.85s cubic-bezier(0.5,0,0.85,0.35), opacity 0.7s ease-in";
    requestAnimationFrame(() => { warp.style.opacity = "1"; bloom.style.transform = "translate(-50%, -50%) scale(11)"; });
    setTimeout(() => { window.location.href = "../05-Timelines/Timeline-View.html?t=" + id; }, 820);
  }
  function warpToHome() {
    if (leaving) return;
    leaving = true;
    const warp = $("#warp");
    const bloom = warp.querySelector(".warp-bloom");
    const app = $(".app");
    app.style.transition = "opacity 0.7s ease-in, transform 0.95s cubic-bezier(0.5,0,0.85,0.35), filter 0.7s ease-in";
    app.style.opacity = "0";
    app.style.transform = "scale(0.86)";
    app.style.filter = "blur(7px)";
    $("#exploreBtn").classList.remove("active"); // fade the active underline out as we leave
    // bloom blooms out white — the SAME handoff as the dive in, so the return reads as continuous
    warp.style.transition = "opacity 0.8s ease-in";
    bloom.style.transition = "transform 0.95s cubic-bezier(0.5,0,0.85,0.35), opacity 0.8s ease-in";
    requestAnimationFrame(() => {
      warp.style.opacity = "1";
      bloom.style.transform = "translate(-50%, -50%) scale(11)";
    });
    setTimeout(() => { window.location.href = "../02-Marketing/Homepage.html?warp=1"; }, 900);
  }

  // ---- boot ---------------------------------------------------------------
  render();
  // fade the active-tab underline in once we've settled (so it eases in, never flashes)
  setTimeout(() => $("#exploreBtn").classList.add("active"), 500);

  window.PARADOX_EXPLORE_UI = { state, render, toast };
})();

