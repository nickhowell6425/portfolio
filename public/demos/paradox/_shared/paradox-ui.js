// paradox-ui.js — chrome wiring: hover readouts, detail panel, search,
// explore tour, branch creation, sign-in. Bridges DOM ⇄ PARADOX engine.

(function () {
  const D = window.PARADOX_DATA;
  const E = window.PARADOX;
  const $ = (s) => document.querySelector(s);

  const canvas = $("#stage");
  const engine = E.init(canvas);

  // ---- number formatting --------------------------------------------------
  function fmt(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "K";
    return String(n);
  }
  function full(n) { return n.toLocaleString("en-US"); }

  // ---- arrival sequence ---------------------------------------------------
  const WARP_BACK = new URLSearchParams(location.search).get("warp");
  if (WARP_BACK) {
    // returning from Explore — emerge from the nexus' light and zoom back out.
    // no onboarding intro; dissolve the bloom in sync with the camera pull-back.
    $("#intro").classList.add("hide");
    const warpEl = $("#warp"), bloomEl = warpEl.querySelector(".warp-bloom");
    const releaseWarp = () => {
      document.documentElement.classList.remove("warp-in");
      warpEl.style.transition = "opacity 0.95s ease-out";
      bloomEl.style.transition = "transform 1.05s cubic-bezier(0.16,0.84,0.44,1), opacity 0.95s ease-out";
      warpEl.style.opacity = "0";
      bloomEl.style.transform = "translate(-50%, -50%) scale(0.12)";
    };
    requestAnimationFrame(() => requestAnimationFrame(releaseWarp));
    setTimeout(releaseWarp, 120); // fallback if rAF is throttled
    setTimeout(() => {
      $("#ident").classList.add("show");
      $("#activity").classList.add("show");
      $("#hintTraverse").classList.add("show");
    }, 520);
    setTimeout(() => $("#hintTraverse").classList.remove("show"), 9000);
    setTimeout(() => history.replaceState(null, "", location.pathname), 1300);
  } else {
    setTimeout(() => $("#intro").classList.add("hide"), 3000);
    setTimeout(() => {
      $("#ident").classList.add("show");
      $("#activity").classList.add("show");
      $("#hintTraverse").classList.add("show");
    }, 3200);
    // hide traverse hint after a while
    setTimeout(() => $("#hintTraverse").classList.remove("show"), 12000);
  }

  // ---- activity feed ------------------------------------------------------
  const feed = $("#feed");
  let actIndex = 0;

  function relTime(born) {
    const s = Math.max(0, Math.round((Date.now() - born) / 1000));
    if (s < 4) return "now";
    if (s < 60) return s + "s ago";
    const m = Math.floor(s / 60);
    return m + "m ago";
  }
  function tickTimes() {
    feed.querySelectorAll(".row").forEach((r) => {
      const t = r.querySelector(".t");
      if (t) t.textContent = relTime(+r.dataset.born);
    });
  }
  function pushActivity(a, fresh = true, ageMs = 0) {
    const row = document.createElement("div");
    row.className = "row" + (fresh ? " is-new" : "");
    row.dataset.born = Date.now() - ageMs;
    row.innerHTML = `<div class="meta"><span class="kind">${a.kind}</span><span class="t">${relTime(+row.dataset.born)}</span></div><span class="lbl">${a.label}</span>`;
    row.addEventListener("click", () => { const n = engine.getNodeById(a.timeline); if (n) engine.selectNode(n); });
    feed.prepend(row);
    if (fresh) setTimeout(() => row.classList.remove("is-new"), 2700);
    // keep 5 present rows; animate the 6th out (in sync with the new one growing in)
    const live = [...feed.children].filter((c) => !c.classList.contains("is-out"));
    if (live.length > 5) {
      const old = live[live.length - 1];
      old.classList.add("is-out");
      old.addEventListener("animationend", () => old.remove(), { once: true });
    }
  }
  // seed with a few already-aged rows so the feed has history, freshest on top
  const seedAges = [3000, 11000, 26000, 52000, 80000];
  for (let i = 4; i >= 0; i--) pushActivity(D.activity[i], false, seedAges[i]);
  actIndex = 5;

  setInterval(tickTimes, 1000);

  // irregular cadence reads as live, not metronomic
  (function scheduleNext() {
    setTimeout(() => {
      pushActivity(D.activity[actIndex % D.activity.length]);
      actIndex++;
      scheduleNext();
    }, 2400 + Math.random() * 3600);
  })();

  // ---- hover readout ------------------------------------------------------
  const readout = $("#readout");
  engine.on("hover", (n) => {
    if (!n) { readout.classList.remove("show"); return; }
    const featured = n.type === "timeline" && n.data.featured;
    const hot = n.data && n.data.hot;
    readout.className = "readout show " + (featured || hot ? "gold" : "tl");
    let html = "";
    if (n.type === "timeline") {
      const s = n.data.stats;
      html = `<div class="rtype">${featured ? "Featured · Sacred Timeline" : "Sacred Timeline"}</div>
        <div class="rtitle">${n.data.title}</div>
        <div class="rlog">${n.data.logline}</div>
        <div class="rstats">
          <div class="s"><span class="v">${fmt(s.readers)}</span><span class="k">Readers</span></div>
          <div class="s"><span class="v">${fmt(s.branches)}</span><span class="k">Branches</span></div>
          <div class="s"><span class="v">${fmt(s.contributors)}</span><span class="k">Contributors</span></div>
        </div>
        <div class="hint">Click to enter timeline →</div>`;
    } else if (n.type === "branch") {
      html = `<div class="rtype">${n.data.hot ? "Trending Branch" : "Branch"}</div>
        <div class="rtitle">${n.data.title}</div>
        <div class="rlog">An alternate reality of ${D.byId(n.data.timeline).title}.</div>
        <div class="rstats"><div class="s"><span class="v">${fmt(n.data.variants || 0)}</span><span class="k">Variants</span></div></div>
        <div class="hint">Click to open reality →</div>`;
    } else if (n.type === "event") {
      html = `<div class="rtype">Event</div>
        <div class="rtitle">${n.data.title}</div>
        <div class="rlog">A story moment on ${D.byId(n.data.timeline).title}.</div>
        <div class="hint">Click to read →</div>`;
    } else if (n.type === "variant") {
      html = `<div class="rtype">Variant</div>
        <div class="rtitle">${n.data.title}</div>
        <div class="rlog">${n.data.tag} · exists within ${D.byId(n.data.timeline).title}.</div>
        <div class="hint">Click to trace variant →</div>`;
    }
    readout.innerHTML = html;
    positionReadout();
  });

  window.addEventListener("mousemove", (e) => {
    if (!readout.classList.contains("show")) return;
    readout._mx = e.clientX; readout._my = e.clientY; positionReadout();
  });
  function positionReadout() {
    const mx = readout._mx || window.innerWidth / 2, my = readout._my || window.innerHeight / 2;
    const r = readout.getBoundingClientRect();
    let x = mx + 20, y = my + 20;
    if (x + r.width > window.innerWidth - 16) x = mx - r.width - 20;
    if (y + r.height > window.innerHeight - 16) y = my - r.height - 20;
    readout.style.left = x + "px"; readout.style.top = Math.max(80, y) + "px";
  }

  // ---- detail panel -------------------------------------------------------
  const panel = $("#panel"), panelBody = $("#panelBody");
  let currentTimeline = null;

  engine.on("select", (n) => {
    if (n.type === "timeline") openTimelinePanel(n);
    else openMinorPanel(n);
  });
  engine.on("blank", () => closePanel());
  $("#panelClose").addEventListener("click", closePanel);

  function closePanel() { panel.classList.remove("show"); currentTimeline = null; }

  function openTimelinePanel(n) {
    currentTimeline = n;
    const t = n.data, s = t.stats;
    const kids = D.childrenOf(t.id);
    panel.className = "panel show " + (t.featured ? "gold" : "");
    const events = kids.events.map((e) => `<div class="pitem" data-tl="${e.timeline}"><span class="pi-t">${e.title}</span><span class="pi-m">Event</span></div>`).join("");
    const branches = kids.branches.map((b) =>
      `<div class="pitem" data-tl="${b.timeline}"><span class="pi-row"><span class="pi-t">${b.title}</span></span><span class="pi-m">${fmt(b.variants)} variants${b.hot ? " · trending" : ""}</span></div>`).join("");
    const variants = kids.variants.map((v) => `<div class="pitem" data-tl="${v.timeline}"><span class="pi-t">${v.title}</span><span class="pi-m">${v.tag}</span></div>`).join("");
    panelBody.innerHTML = `
      <div class="ptype">${t.featured ? "Featured · Sacred Timeline" : "Sacred Timeline"}</div>
      <div class="ptitle">${t.title}</div>
      <div class="plog">${t.logline}</div>
      <div class="pstats">
        <div class="cell"><div class="v">${fmt(s.readers)}</div><div class="k">Readers</div></div>
        <div class="cell"><div class="v">${fmt(s.branches)}</div><div class="k">Branches</div></div>
        <div class="cell"><div class="v">${fmt(s.variants)}</div><div class="k">Variants</div></div>
        <div class="cell"><div class="v">${fmt(s.events)}</div><div class="k">Events</div></div>
        <div class="cell"><div class="v">${fmt(s.contributors)}</div><div class="k">Contributors</div></div>
        <div class="cell"><div class="v">${full(s.readers).split(",")[0]}.${String(s.variants).slice(0,1)}×</div><div class="k">Growth</div></div>
      </div>
      ${branches ? `<div class="psec"><h4>Trending Branches</h4>${branches}</div>` : ""}
      ${events ? `<div class="psec"><h4>Recent Events</h4>${events}</div>` : ""}
      ${variants ? `<div class="psec"><h4>Known Variants</h4>${variants}</div>` : ""}
      <div class="pactions">
        <button class="pbtn primary" id="enterBtn">Enter this Timeline</button>
        <button class="pbtn ghost" id="branchBtn">Create a Branch</button>
      </div>`;
    panel.scrollTop = 0;
    $("#enterBtn").addEventListener("click", () => openEnterModal(t));
    $("#branchBtn").addEventListener("click", () => openBranchModal(n));
    panelBody.querySelectorAll(".pitem").forEach((el) =>
      el.addEventListener("click", () => { const id = el.getAttribute("data-tl"); const nn = engine.getNodeById(id); if (nn) engine.selectNode(nn); }));
  }

  function openMinorPanel(n) {
    const parent = D.byId(n.data.timeline);
    const labelMap = { branch: "Branch · Alternate Reality", event: "Event", variant: "Variant" };
    panel.className = "panel show " + (n.data.hot ? "gold" : "");
    let extra = "";
    if (n.type === "branch") extra = `<div class="pstats"><div class="cell"><div class="v">${fmt(n.data.variants||0)}</div><div class="k">Variants</div></div><div class="cell"><div class="v">${parent.title.length}</div><div class="k">Convergences</div></div><div class="cell"><div class="v">${n.data.hot ? "High" : "Calm"}</div><div class="k">Activity</div></div></div>`;
    panelBody.innerHTML = `
      <div class="ptype">${labelMap[n.type]}</div>
      <div class="ptitle">${n.data.title}${n.type === "variant" ? `<br/><span style="font-size:18px;color:var(--dim)">${n.data.tag}</span>` : ""}</div>
      <div class="plog">Within the reality of ${parent.title}.</div>
      ${extra}
      <div class="psec"><h4>Origin Timeline</h4>
        <div class="pitem" data-tl="${parent.id}"><span class="pi-t">${parent.title}</span><span class="pi-m">${fmt(parent.stats.readers)} readers</span></div>
      </div>
      <div class="pactions">
        <button class="pbtn primary" id="enterBtn">${n.type === "event" ? "Read this Event" : n.type === "variant" ? "Trace this Variant" : "Open this Reality"}</button>
        <button class="pbtn ghost" id="originBtn">Return to ${parent.title}</button>
      </div>`;
    panel.scrollTop = 0;
    $("#enterBtn").addEventListener("click", () => openEnterModal(n.data, n.type));
    $("#originBtn").addEventListener("click", () => { const nn = engine.getNodeById(parent.id); if (nn) engine.selectNode(nn); });
    panelBody.querySelectorAll(".pitem").forEach((el) =>
      el.addEventListener("click", () => { const id = el.getAttribute("data-tl"); const nn = engine.getNodeById(id); if (nn) engine.selectNode(nn); }));
  }

  // ---- modals -------------------------------------------------------------
  const scrim = $("#scrim"), modal = $("#modal");
  function openModal(html) { modal.innerHTML = html; scrim.classList.add("show"); }
  function closeModal() { scrim.classList.remove("show"); }
  scrim.addEventListener("click", (e) => { if (e.target === scrim) closeModal(); });

  function openEnterModal(t, kind) {
    const real = !kind; // any timeline node opens its Timeline View page
    openModal(`
      <button class="mclose">✕</button>
      <div class="mk">${kind ? kind : "Entering Reality"}</div>
      <h3>${t.title}</h3>
      <p>${real
        ? "Opening the timeline view — the universe overview where every event, branch, variant and contributor lives in one place."
        : "Travelling deeper into this reality would load its full structure — every event, branch, and variant rendered as its own living timeline. This is the homepage preview."}</p>
      <div class="row2">
        <button class="pbtn primary" id="mConfirm">${real ? "Open timeline" : "Descend"}</button>
        <button class="pbtn ghost" id="mCancel">Not yet</button>
      </div>`);
    modal.querySelector(".mclose").onclick = closeModal;
    $("#mCancel").onclick = closeModal;
    $("#mConfirm").onclick = () => {
      closeModal();
      if (real) { toast(`Opening <em>${t.title}</em>…`); setTimeout(() => { window.location.href = "../05-Timelines/Timeline-View.html?t=" + t.id; }, 420); }
      else toast(`Descending into <em>${t.title}</em>…`);
    };
  }

  function openBranchModal(node) {
    openModal(`
      <button class="mclose">✕</button>
      <div class="mk">Create a Branch</div>
      <h3>Branch from ${node.data.title}</h3>
      <p>Name the moment where this reality diverges. A new strand will grow from the Sacred Timeline.</p>
      <label>Branch name</label>
      <input id="branchName" type="text" placeholder="What If…" />
      <div class="row2">
        <button class="pbtn primary" id="mCreate">Branch reality</button>
        <button class="pbtn ghost" id="mCancel">Cancel</button>
      </div>`);
    const input = $("#branchName");
    setTimeout(() => input.focus(), 100);
    modal.querySelector(".mclose").onclick = closeModal;
    $("#mCancel").onclick = closeModal;
    const submit = () => {
      const name = input.value.trim() || "An Untold Divergence";
      closeModal(); closePanel();
      engine.createBranch(node, name);
      pushActivity({ kind: "Branch Created", label: name, timeline: node.data.id });
      toast(`New branch <em>${name}</em> is emerging…`);
    };
    $("#mCreate").onclick = submit;
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
  }

  function openSignIn() {
    openModal(`
      <button class="mclose">✕</button>
      <div class="mk">Join the Multiverse</div>
      <h3>Become a Keeper</h3>
      <p>Read across realities, branch your own timelines, and trace variants through the Sacred Timeline.</p>
      <label>Email</label>
      <input type="email" placeholder="you@reality.now" />
      <div class="row2">
        <button class="pbtn primary" id="mIn">Enter Paradox</button>
        <button class="pbtn ghost" id="mCancel">Browse as guest</button>
      </div>`);
    modal.querySelector(".mclose").onclick = closeModal;
    $("#mCancel").onclick = closeModal;
    $("#mIn").onclick = () => { closeModal(); toast(`Welcome, Keeper. The timeline is yours to explore.`); };
  }

  // ---- toast --------------------------------------------------------------
  const toastEl = $("#toast");
  let toastT;
  function toast(html) {
    toastEl.innerHTML = html; toastEl.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("show"), 3400);
  }

  // ---- command palette (⌘K) ----------------------------------------------
  // Searches the ENTIRE database — timelines (+ loglines), branches, events,
  // variants (+ tags) — and runs commands. Full keyboard navigation.
  const cmdk = $("#cmdk"), cmdkInput = $("#cmdkInput"),
        cmdkResults = $("#cmdkResults"), cmdkCount = $("#cmdkCount"),
        searchLauncher = $("#searchLauncher"), searchInput = $("#searchInput");

  const tlName = (id) => (D.byId(id) || {}).title || "";
  function flyToData(type, data, tlId) {
    let n = type === "timeline"
      ? engine.getNodeById(tlId)
      : (engine.findNode((nd) => nd.type === type && nd.data === data) || engine.getNodeById(tlId));
    if (n) engine.selectNode(n);
  }
  const runAcct = (act) => { const b = document.querySelector(`.acct-item[data-act="${act}"]`); if (b) b.click(); };

  // icons
  const ICON = {
    timeline: `<span class="dotc"></span>`,
    branch: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="6" cy="5" r="2.2"/><circle cx="18" cy="5" r="2.2"/><circle cx="6" cy="19" r="2.2"/><path d="M6 7.2v9.6M6 12h7a5 5 0 0 0 5-5"/></svg>`,
    event: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>`,
    variant: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="9" r="3.2"/><path d="M5 20c0-3.4 3-5.6 7-5.6s7 2.2 7 5.6"/></svg>`,
    explore: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="m15 9-4 1.5L9.5 14.5 14 13z"/></svg>`,
    create: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 5v14M5 12h14"/></svg>`,
    tour: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
    reset: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>`,
    saved: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 4h12v16l-6-4-6 4z"/></svg>`,
    signout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M10 12H3m0 0 3-3m-3 3 3 3"/></svg>`,
  };

  // ---- build the full index ----
  const ACTIONS = [
    { title: "Explore the multiverse", sub: "Dive into the nexus", icon: "explore", kw: "nexus dive open enter map", run: () => $("#exploreBtn").click() },
    { title: "Create a branch", sub: "Branch a new reality from a node", icon: "create", kw: "new fork split reality make", run: () => $("#createBtn").click() },
    { title: "Tour recent realities", sub: "Cycle the most active timelines", icon: "tour", kw: "play cycle auto active", run: () => $("#tourBtn").click() },
    { title: "Reset the view", sub: "Recenter on the Sacred Timeline", icon: "reset", kw: "recenter home center", run: () => $("#resetBtn").click() },
    { title: "Your branches", sub: "7 live branches", icon: "branch", kw: "my mine account", run: () => runAcct("branches") },
    { title: "Saved realities", sub: "23 saved", icon: "saved", kw: "bookmarks account", run: () => runAcct("saved") },
    { title: "Sign out", sub: "Leave the timeline", icon: "signout", kw: "logout exit leave account", run: () => runAcct("signout") },
  ];
  function buildIndex() {
    const idx = [];
    ACTIONS.forEach((a) => idx.push({ group: "Commands", kind: "act", title: a.title, sub: a.sub,
      tag: "Command", icon: a.icon, hay: (a.title + " " + a.sub + " " + a.kw).toLowerCase(), run: a.run }));
    D.timelines.forEach((t) => idx.push({ group: "Sacred Timelines", kind: "timeline",
      tone: t.featured ? "gold" : "", icon: "timeline", title: t.title, sub: t.logline,
      tag: t.featured ? "Featured" : "Timeline",
      hay: (t.title + " " + t.logline).toLowerCase(),
      run: () => flyToData("timeline", t, t.id) }));
    D.branches.forEach((b) => idx.push({ group: "Branches", kind: "branch", tone: b.hot ? "gold" : "",
      icon: "branch", title: b.title, sub: tlName(b.timeline) + (b.hot ? " · Hot" : ""), tag: "Branch",
      hay: (b.title + " " + tlName(b.timeline)).toLowerCase(),
      run: () => flyToData("branch", b, b.timeline) }));
    D.events.forEach((e) => idx.push({ group: "Events", kind: "event", icon: "event",
      title: e.title, sub: tlName(e.timeline), tag: "Event",
      hay: (e.title + " " + tlName(e.timeline)).toLowerCase(),
      run: () => flyToData("event", e, e.timeline) }));
    D.variants.forEach((v) => idx.push({ group: "Variants", kind: "variant", icon: "variant",
      title: v.title, sub: v.tag + " · " + tlName(v.timeline), tag: "Variant",
      hay: (v.title + " " + v.tag + " " + tlName(v.timeline)).toLowerCase(),
      run: () => flyToData("variant", v, v.timeline) }));
    return idx;
  }
  const FULL_INDEX = buildIndex();
  const GROUP_ORDER = ["Commands", "Sacred Timelines", "Branches", "Events", "Variants"];

  // scoring: title prefix > word-start > title substring > haystack substring
  function score(item, q) {
    const t = item.title.toLowerCase();
    if (t === q) return 100;
    if (t.startsWith(q)) return 80;
    if (new RegExp("\\b" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(t)) return 60;
    const ti = t.indexOf(q); if (ti >= 0) return 40 - Math.min(ti, 20);
    if (item.hay.includes(q)) return 18;
    return 0;
  }
  function hl(text, q) {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q);
    if (i < 0) return text;
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
  }

  let rows = [], active = -1;
  function render(q) {
    let list;
    if (!q) {
      // resting state — commands + the timelines, in canonical order
      list = FULL_INDEX.filter((i) => i.group === "Commands" || i.group === "Sacred Timelines");
    } else {
      list = FULL_INDEX.map((i) => ({ i, s: score(i, q) })).filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s).map((x) => x.i);
    }
    cmdkCount.textContent = list.length ? list.length + (list.length === 1 ? " result" : " results") : "";
    if (!list.length) {
      cmdkResults.innerHTML = `<div class="cmdk-empty"><div class="ee">No realities found</div><div class="es">Nothing across the multiverse matches “${q.replace(/</g, "&lt;")}”.</div></div>`;
      rows = []; active = -1; return;
    }
    // group, preserving GROUP_ORDER
    let html = "";
    GROUP_ORDER.forEach((g) => {
      const inG = list.filter((i) => i.group === g);
      if (!inG.length) return;
      html += `<div class="cmdk-group">${g}</div>`;
      inG.forEach((i) => {
        const gi = list.indexOf(i);
        html += `<div class="cmdk-row ${i.kind === "act" ? "act" : ""} ${i.tone || ""}" data-i="${gi}">
          <span class="cmdk-ic">${ICON[i.icon] || ""}</span>
          <span class="cmdk-txt"><span class="cmdk-t">${hl(i.title, q)}</span><span class="cmdk-sub">${i.sub}</span></span>
          <span class="cmdk-tag">${i.tag}</span>
          <span class="cmdk-go">↵</span>
        </div>`;
      });
    });
    cmdkResults.innerHTML = html;
    rows = [...cmdkResults.querySelectorAll(".cmdk-row")];
    // remap data-i (which is index into list) onto actual run fns
    rows.forEach((r) => {
      const item = list[+r.dataset.i];
      r._run = item.run;
      r.addEventListener("mousemove", () => setActive(rows.indexOf(r)));
      r.addEventListener("click", () => { activateRow(r); });
    });
    setActive(0);
  }
  function setActive(i) {
    if (!rows.length) return;
    active = (i + rows.length) % rows.length;
    rows.forEach((r, k) => r.classList.toggle("active", k === active));
    const el = rows[active];
    const box = cmdkResults;
    if (el) {
      const top = el.offsetTop, bot = top + el.offsetHeight;
      if (top < box.scrollTop) box.scrollTop = top - 8;
      else if (bot > box.scrollTop + box.clientHeight) box.scrollTop = bot - box.clientHeight + 8;
    }
  }
  function activateRow(r) { closeCmdk(); if (r && r._run) r._run(); }

  function openCmdk() {
    cmdk.classList.add("show"); cmdk.setAttribute("aria-hidden", "false");
    cmdkInput.value = ""; render("");
    requestAnimationFrame(() => cmdkInput.focus());
  }
  function closeCmdk() {
    cmdk.classList.remove("show"); cmdk.setAttribute("aria-hidden", "true");
    cmdkInput.blur();
  }
  const cmdkOpen = () => cmdk.classList.contains("show");

  // Command palette only exists on signed-in chrome (#cmdk / #searchLauncher).
  // On the home page those nodes are absent — guard so the rest of init (incl.
  // the Explore → nexus warp wiring below) still runs.
  if (cmdk && searchLauncher) {
    searchLauncher.addEventListener("click", openCmdk);
    searchInput.addEventListener("focus", openCmdk);
    cmdkInput.addEventListener("input", () => render(cmdkInput.value.trim().toLowerCase()));
    cmdk.addEventListener("mousedown", (e) => { if (e.target === cmdk) closeCmdk(); });
    cmdkInput.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
      else if (e.key === "Enter") { e.preventDefault(); activateRow(rows[active]); }
      else if (e.key === "Escape") { e.preventDefault(); closeCmdk(); }
    });
    document.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") { e.preventDefault(); cmdkOpen() ? closeCmdk() : openCmdk(); return; }
      if (k === "escape" && cmdkOpen()) { closeCmdk(); return; }
      // "/" opens search when not already typing somewhere
      if (k === "/" && !cmdkOpen()) {
        const a = document.activeElement, typing = a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA");
        if (!typing) { e.preventDefault(); openCmdk(); }
      }
    });
  }

  // ---- view rail: tour + reset --------------------------------------------
  // tour cycles the camera through the most active realities
  const tourOrder = ["ninth", "machine", "hollow", "neon", "olympus", "glass"];
  const tourBtn = $("#tourBtn");
  const tourSub = tourBtn.querySelector(".vs");
  let touring = false, tourI = 0, tourTimer = null;
  tourBtn.addEventListener("click", () => {
    if (touring) { stopTour(); return; }
    touring = true; tourBtn.classList.add("touring"); tourSub.textContent = "stop touring";
    toast("Touring the most active realities…");
    tourStep();
    tourTimer = setInterval(tourStep, 4200);
  });
  function tourStep() {
    const id = tourOrder[tourI % tourOrder.length]; tourI++;
    const n = engine.getNodeById(id);
    if (n) { engine.selectNode(n); }
  }
  function stopTour() {
    touring = false; clearInterval(tourTimer);
    tourBtn.classList.remove("touring"); tourSub.textContent = "recent realities";
  }

  // reset surfaces only when the camera has wandered from its resting frame
  const resetBtn = $("#resetBtn");
  resetBtn.addEventListener("click", () => { stopTour(); closePanel(); engine.resetView(); });
  (function watchView() {
    const v = engine.getView && engine.getView();
    if (v) {
      const moved = Math.hypot(v.x, v.y) > 60;
      const zoomed = Math.abs(v.scale - v.restScale) > 0.02;
      resetBtn.classList.toggle("avail", moved || zoomed);
    }
    requestAnimationFrame(watchView);
  })();

  // ---- seamless dive into the nexus → Explore -----------------------------
  const coreHint = $("#coreHint");
  let warping = false;

  // surface the entry affordance whenever the core is hovered
  engine.on("coreHover", (over) => {
    if (warping) return;
    coreHint.classList.toggle("show", !!over);
  });

  function warpToExplore() {
    if (warping) return;
    warping = true;
    stopTour();
    closePanel();
    readout.classList.remove("show");
    coreHint.classList.remove("show");
    // dive the camera straight into the heart of the nexus
    engine.enterCore(1050);
    // bloom blooms out from the core to fill the frame
    const warp = $("#warp");
    const bloom = warp.querySelector(".warp-bloom");
    warp.style.transition = "opacity 0.85s ease-in";
    bloom.style.transition = "transform 1.05s cubic-bezier(0.5,0,0.85,0.35), opacity 1.05s ease-in";
    requestAnimationFrame(() => {
      warp.style.opacity = "1";
      bloom.style.transform = "translate(-50%, -50%) scale(11)";
    });
    // hand off to Explore once the bloom owns the screen
    setTimeout(() => { window.location.href = "../04-Discovery/Explore.html?warp=1"; }, 940);
  }

  // click the central nexus → enter Explore
  engine.on("core", warpToExplore);
  // the Explore nav button does the same dive
  $("#exploreBtn").addEventListener("click", warpToExplore);
  // hovering the Explore tab previews the dive: light up the nexus + show the prompt
  const exploreTab = $("#exploreBtn");
  exploreTab.addEventListener("mouseenter", () => {
    if (warping) return;
    engine.setCoreHover(true);
    coreHint.classList.add("show");
  });
  exploreTab.addEventListener("mouseleave", () => {
    engine.setCoreHover(false);
    if (!warping) coreHint.classList.remove("show");
  });

  // ---- create (branch mode) -----------------------------------------------
  let branchMode = false;
  const branchBanner = $("#branchBanner");
  $("#createBtn").addEventListener("click", () => {
    if (currentTimeline) { openBranchModal(currentTimeline); return; }
    branchMode = !branchMode;
    document.body.classList.toggle("creating", branchMode);
    branchBanner.classList.toggle("show", branchMode);
    if (branchMode) toast("Branch mode — choose a timeline to diverge from");
  });
  // when in branch mode, selecting a timeline opens the branch modal directly
  engine.on("select", (n) => {
    if (branchMode && n.type === "timeline") {
      branchMode = false; document.body.classList.remove("creating"); branchBanner.classList.remove("show");
      openBranchModal(n);
    }
  });

  // sign-in is showcased as a component, not a demo destination — keep it in-app
  $("#signinBtn")?.addEventListener("click", () => toast("Sign-in is showcased in the component library."));
  $("#brand").addEventListener("click", () => { stopTour(); closePanel(); engine.resetView(); });

  // expose for tweaks island
  window.PARADOX_UI = { engine, toast };
})();
