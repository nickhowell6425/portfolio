// timeline-view-data.js — content layer for the Timeline View ("repository page").
// Exposes TIMELINE_VIEW.build(id): returns a fully-populated view-model for ANY
// timeline. The flagship original universe (The Ninth Signal) is hand-authored;
// every other universe is synthesised deterministically from PARADOX_DENSITY +
// EXPLORE_DATA so the same page can serve the whole multiverse.

window.TIMELINE_VIEW = (function () {
  const E = window.EXPLORE_DATA;
  const DENS = window.PARADOX_DENSITY;

  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  const TRAITS = ["Resolute","Haunted","Brilliant","Reckless","Devout","Sceptical","Patient","Fierce","Quiet","Ruthless","Gentle","Loyal","Cunning","Weary","Defiant","Wandering"];
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // ======================= THE NINTH SIGNAL (curated) =======================
  function ninth() {
    const tl = E.byId("ninth");
    return {
      tl,
      ownership: {
        kind: "original", label: "Original IP",
        creator: "Vesper Holloway", creatorHandle: "vesper_drift", creatorHue: 168, created: "March 2024",
        lines: [
          { can: true, text: "Community contributions enabled" },
          { can: true, text: "Licensing enabled" },
          { can: true, text: "Revenue sharing supported" },
          { can: true, text: "Creator-owned · lineage tracked" },
        ],
        note: "Every branch, variant and event below traces back to a single creator. Read freely, branch freely — authorship stays with the origin.",
      },
      description: "A complete narrative universe charting humanity's first answered contact — and every reality that splinters from the moment the void speaks first. Read the canon, trace its variants, or branch a reality of your own.",
      synopsis: [
        "For three hundred years the listening stations heard nothing — only the long, patient static of a universe that did not answer. Then the stations began to fall silent one by one, and humanity realised the quiet had never been empty. It had been listening back.",
        "The Ninth Signal follows the First Listeners: the crews who caught nine transmissions from the dark and chose to reply. Eight times we spoke into the void. The ninth time, the void spoke first — and every reality after that moment is a different answer to the same question.",
      ],
      chronology: [
        { id: "ev_silence",  title: "The First Silence",   chapter: "Chapter I",    date: "Mar 2024", contributors: 412,  branchesMade: 240,  variants: 8900,  log: "Station Kepler-9 goes dark mid-transmission. No wreckage, no signal, no reply.", forks: [] },
        { id: "ev_arrives",  title: "The Signal Arrives",  chapter: "Chapter II",   date: "Apr 2024", contributors: 1180, branchesMade: 1820, variants: 31400, log: "The first of nine transmissions resolves out of the background noise. It is not random.", forks: ["The Signal Was Never Heard"] },
        { id: "ev_translate",title: "The Translation",     chapter: "Chapter III",  date: "Jul 2024", contributors: 2240, branchesMade: 3110, variants: 52600, log: "Linguists break the code. Buried inside the welcome is a warning no one wants to read aloud.", forks: ["The Code Was a Warning"] },
        { id: "ev_eight",    title: "Eight Answered",       chapter: "Chapter IV",   date: "Oct 2024", contributors: 1860, branchesMade: 2040, variants: 39800, log: "Humanity replies eight times across eight years. Eight times, the dark stays silent.", forks: ["The Ninth Was Never Sent"] },
        { id: "ev_ninth",    title: "The Ninth Signal",     chapter: "Chapter V",    date: "Feb 2025", contributors: 4920, branchesMade: 6240, variants: 84100, pivotal: true, log: "For the first time, the void speaks before we do. The ninth transmission is a reply.", forks: ["The Signal Was Answered", "Nothing Replied At All"] },
        { id: "ev_listener", title: "The First Listener",   chapter: "Chapter VI",   date: "Jun 2025", contributors: 3380, branchesMade: 2890, variants: 61200, log: "Commander Elias holds the channel open against every order. Someone has to listen first.", forks: ["Elias Never Replied"] },
        { id: "ev_quiet",    title: "The Long Quiet",       chapter: "Chapter VII",  date: "Nov 2025", contributors: 1540, branchesMade: 1110, variants: 22700, log: "The transmissions stop. The stations stay lit. Everyone waits for a tenth that may never come.", forks: [] },
        { id: "ev_answers",  title: "What Answers Back",    chapter: "Chapter VIII", date: "Mar 2026", contributors: 2760, branchesMade: 980,  variants: 18400, live: true, log: "The newest chapter. The thing on the other end of the signal is no longer content to wait.", forks: [] },
      ],
      branches: [
        { title: "The Signal Was Answered", origin: "The Ninth Signal", hot: true, readers: 412000, events: 240, variants: 9140, contributors: 3120, log: "What if we had replied to the ninth — and it understood us perfectly." },
        { title: "The Code Was a Warning", origin: "The Translation", hot: true, readers: 286000, events: 188, variants: 6420, contributors: 2240, log: "The transmission was never an invitation. It was a quarantine notice, arriving late." },
        { title: "Elias Never Replied", origin: "The First Listener", readers: 198000, events: 142, variants: 4870, contributors: 1810, log: "The Commander closes the channel. The dark, for once, is allowed to stay dark." },
        { title: "The Ninth Was Never Sent", origin: "Eight Answered", hot: true, readers: 174000, events: 121, variants: 4310, contributors: 1560, log: "Humanity stops at eight. The reply still comes — addressed to no one." },
        { title: "Nothing Replied At All", origin: "The Ninth Signal", readers: 142000, events: 98, variants: 3680, contributors: 1290, log: "There was no ninth signal. Only a fault in the array, and a species that wanted to be heard." },
        { title: "The Signal Was Never Heard", origin: "The Signal Arrives", readers: 119000, events: 86, variants: 3040, contributors: 1040, log: "The transmission arrives during the blackout. It passes through an empty sky, unanswered." },
      ],
      variants: [
        { name: "Commander Elias", tag: "v_032_FIRST", origin: "The Ninth Signal", hue: 158, traits: ["Resolute", "Haunted", "Listener"], appearances: 86, influenced: 44, live: true, note: "The First Listener. In most realities he opens the channel. In a few, he is the one who answers." },
        { name: "Dr. Mira Vane", tag: "v_119_LINGUA", origin: "The Translation", hue: 196, traits: ["Brilliant", "Obsessive", "Translator"], appearances: 71, influenced: 38, note: "Broke the code in nine days. Every variant of her reads a different meaning in the same nine words." },
        { name: "The Caller", tag: "v_001_DARK", origin: "The Ninth Signal", hue: 86, traits: ["Unknowable", "Patient", "Vast"], appearances: 64, influenced: 52, gold: true, note: "Whatever sent the ninth signal. No two realities agree on its shape — only that it is still listening." },
        { name: "Captain Sela Renn", tag: "v_077_KEPLER", origin: "The First Silence", hue: 220, traits: ["Loyal", "Reckless", "Survivor"], appearances: 58, influenced: 29, note: "Last commander of Station Kepler-9. The only one who heard the silence arrive — and lived." },
        { name: "Orrin Thorne", tag: "v_204_RELAY", origin: "Eight Answered", hue: 300, traits: ["Sceptical", "Principled", "Engineer"], appearances: 47, influenced: 23, note: "Built the relay that sent all eight replies. Spends most realities trying to unsend them." },
        { name: "Sister Aria", tag: "v_088_CHOIR", origin: "The Long Quiet", hue: 40, traits: ["Devout", "Fierce", "Prophet"], appearances: 39, influenced: 31, note: "Founded the Choir that believes the signal is sacred. In some branches, she is proven right." },
      ],
      contributors: [
        { name: "Vesper Holloway", handle: "vesper_drift", hue: 168, role: "Creator", events: 312, branches: 88, variants: 1240 },
        { name: "RealityBuilder", handle: "realitybuilder", hue: 158, role: "Architect", events: 184, branches: 142, variants: 980 },
        { name: "BranchWalker", handle: "branchwalker", hue: 200, role: "Cartographer", events: 96, branches: 211, variants: 760 },
        { name: "Cass Merrow", handle: "cass_echo", hue: 86, role: "Lorekeeper", events: 240, branches: 64, variants: 1410 },
        { name: "nine_listeners", handle: "nine_listeners", hue: 300, role: "Annotator", events: 71, branches: 38, variants: 540 },
        { name: "Dax Sorrel", handle: "dax_void", hue: 220, role: "Variant Tracer", events: 52, branches: 47, variants: 1880 },
      ],
      similar: [
        { id: "machine", reason: "Machine minds & first contact" },
        { id: "neon", reason: "If you like cities at the edge" },
        { id: "destiny2", reason: "Official · Light & the Dark" },
        { id: "halo", reason: "Official · humanity at the rim" },
      ],
      relatedBranches: ["The Signal Was Answered", "The Code Was a Warning", "The Ninth Was Never Sent"],
    };
  }

  // ======================= ANY OTHER UNIVERSE (synthesised) =======================
  function synth(id) {
    const tl = E.byId(id);
    const d = DENS.forTimeline(id);
    const s = tl.stats;
    const official = tl.ownership === "official";
    const h = hash(id);

    // ----- ownership -----
    const ownership = official ? {
      kind: "official", label: "Official IP",
      creator: tl.steward || "Studio", creatorHandle: (tl.steward || "studio").toLowerCase().replace(/[^a-z0-9]+/g, "_"), creatorHue: 86, created: "Licensed universe",
      lines: [
        { can: true, text: "Read, branch & create variants" },
        { can: true, text: "Collaborate with other Keepers" },
        { can: false, text: "Claim, sell or license content" },
        { can: false, text: "Owned by the community" },
      ],
      note: `Stewarded by ${tl.steward || "its studio"}. The community can read, branch and create variants here — but this universe can never be claimed, sold, or licensed.`,
    } : {
      kind: "original", label: "Original IP",
      creator: d.contributors[0].name, creatorHandle: d.contributors[0].name.toLowerCase().replace(/[^a-z0-9]+/g, "_"), creatorHue: d.contributors[0].hue, created: `${MONTHS[h % 12]} 202${3 + (h % 3)}`,
      lines: [
        { can: true, text: "Community contributions enabled" },
        { can: true, text: "Licensing enabled" },
        { can: true, text: "Revenue sharing supported" },
        { can: true, text: "Creator-owned · lineage tracked" },
      ],
      note: "Every branch, variant and event below traces back to a single creator. Read freely, branch freely — authorship stays with the origin.",
    };

    // ----- chronology: 8 events spread across the generated set -----
    const n = 8;
    const src = d.events.slice(0, 40);
    const picks = [];
    for (let i = 0; i < n; i++) picks.push(src[Math.floor(i * (src.length - 1) / (n - 1))]);
    const pivotalIdx = 4;
    const yearBase = 2024;
    const chronology = picks.map((e, i) => {
      const eh = hash(e.title + i);
      const month = (i * 3 + (eh % 3)) % 12;
      const year = yearBase + Math.floor((i * 3) / 12);
      return {
        id: "syn_" + i, title: e.title, chapter: "Chapter " + ["I","II","III","IV","V","VI","VII","VIII"][i],
        date: `${MONTHS[month]} ${year}`,
        contributors: 300 + (eh % 4200), branchesMade: 200 + (eh % 5000), variants: 6000 + (eh % 78000),
        pivotal: i === pivotalIdx, live: i === n - 1,
        log: `A defining moment in the canon of ${tl.title}.`,
        forks: [],
      };
    });

    // ----- branches: top 6, anchored to chronology events -----
    const branches = d.branches.slice(0, 6).map((b, i) => {
      const bh = hash(b.title);
      const origin = chronology[(bh % (chronology.length - 1)) + 0].title;
      return { title: b.title, origin, hot: !!b.hot, readers: 40 + b.variants * 14 + (bh % 90000), events: 60 + (bh % 220), variants: b.variants, contributors: 200 + (bh % 3000) };
    });
    // wire a couple of fork chips on the chronology from the real branches
    branches.slice(0, 4).forEach((b) => { const ev = chronology.find((c) => c.title === b.origin); if (ev) ev.forks.push(b.title); });

    // ----- variants: 6 -----
    const variants = d.variants.slice(0, 6).map((v, i) => {
      const vh = hash(v.tag + i);
      return { name: v.title, tag: v.tag, origin: chronology[vh % chronology.length].title, hue: vh % 360,
        traits: [...new Set([TRAITS[vh % TRAITS.length], TRAITS[(vh >> 4) % TRAITS.length], TRAITS[(vh >> 8) % TRAITS.length]])].slice(0, 3),
        appearances: 20 + (vh % 70), influenced: 8 + (vh % 50), gold: i === 2,
        note: `An alternate manifestation traced across ${30 + (vh % 60)} realities of ${tl.title}.` };
    });

    // ----- contributors: 6 -----
    const ROLES = ["Creator", "Architect", "Cartographer", "Lorekeeper", "Annotator", "Variant Tracer"];
    const contributors = d.contributors.slice(0, 6).map((c, i) => {
      const ch = hash(c.name + i);
      return { name: c.name, handle: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "_"), hue: c.hue, role: ROLES[i % ROLES.length],
        events: 40 + (ch % 280), branches: 30 + (ch % 200), variants: 200 + (ch % 1700) };
    });

    // ----- recommendations -----
    const others = E.timelines.filter((t) => t.id !== id);
    const similar = [];
    others.filter((t) => t.category === tl.category).slice(0, 2).forEach((t) => similar.push({ id: t.id, reason: "Same genre · " + t.category }));
    others.filter((t) => t.ownership === "official").slice(0, 2).forEach((t) => { if (!similar.find((x) => x.id === t.id)) similar.push({ id: t.id, reason: "Official · " + (t.steward || "licensed") }); });
    while (similar.length < 4 && others[similar.length]) { const t = others[similar.length]; if (!similar.find((x) => x.id === t.id)) similar.push({ id: t.id, reason: "A multiverse favourite" }); }

    return {
      tl, ownership,
      description: `A complete ${tl.category} universe. ${tl.logline} Read the canon, trace its variants, or branch a reality of your own.`,
      synopsis: [
        `${tl.title} is a complete narrative universe — a canon that began as a single thread and now spans ${fmtN(s.events)} events across ${fmtN(s.branches)} branches. ${tl.logline}`,
        "Every reality below diverges from a moment in that canon. Read the story as it stands, trace a character through its variants, or branch a new reality of your own — its lineage will always trace back here.",
      ],
      chronology, branches, variants, contributors, similar,
      relatedBranches: branches.filter((b) => b.hot).slice(0, 3).map((b) => b.title),
    };
  }

  function fmtN(x) { if (x >= 1e6) return (x / 1e6).toFixed(1).replace(/\.0$/, "") + "M"; if (x >= 1e3) return (x / 1e3).toFixed(1).replace(/\.0$/, "") + "K"; return String(x); }

  function build(id) {
    if (!id || !E.byId(id)) id = "ninth";
    return id === "ninth" ? ninth() : synth(id);
  }

  return { build };
})();
