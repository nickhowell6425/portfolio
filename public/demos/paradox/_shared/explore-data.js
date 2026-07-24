// explore-data.js — Explore-page data layer.
// Augments the canonical PARADOX_DATA with everything the discovery view needs:
// genres (categories), status, last-activity, growth, and a per-timeline cover
// "tone" used to render abstract cover art. Adds two timelines for density.
// Homepage data (PARADOX_DATA) is untouched.

window.EXPLORE_DATA = (function () {
  const base = window.PARADOX_DATA;

  const CATEGORIES = ["Science Fiction", "Fantasy", "Mystery", "Horror", "Original Worlds"];
  const SORTS = ["Trending", "Most Read", "Most Branched", "Newest", "Recently Active"];
  const STATUSES = ["Active", "Emerging", "Completed"];
  const OWNERSHIP = [
    { value: "official", label: "Official IP", note: "Read, branch & create variants — never owned" },
    { value: "original", label: "Original IP", note: "Creator-owned — lineage tracked" },
  ];

  // per-timeline metadata keyed by id: category, status, freshness (newness 0..1),
  // growth % (week-over-week branch growth), last activity (minutes ago),
  // trend score, and a cover tone [hueShift, secondHueShift] for abstract art.
  const meta = {
    ember:   { cat: "Original Worlds", status: "Active",    fresh: 0.42, growth: 11, active: 14, trend: 62, tone: [40, 86] },
    neon:    { cat: "Science Fiction", status: "Active",    fresh: 0.55, growth: 23, active: 3,  trend: 81, tone: [220, 158] },
    hollow:  { cat: "Fantasy",         status: "Active",    fresh: 0.30, growth: 14, active: 7,  trend: 88, tone: [300, 86] },
    sol:     { cat: "Science Fiction", status: "Active",    fresh: 0.61, growth: 18, active: 22, trend: 58, tone: [200, 158] },
    olympus: { cat: "Fantasy",         status: "Active",    fresh: 0.38, growth: 9,  active: 41, trend: 70, tone: [86, 300] },
    ninth:   { cat: "Science Fiction", status: "Active",    fresh: 0.88, growth: 41, active: 2,  trend: 99, tone: [158, 86] },
    ocean:   { cat: "Horror",          status: "Active",    fresh: 0.47, growth: 16, active: 11, trend: 66, tone: [240, 200] },
    glass:   { cat: "Mystery",         status: "Active",    fresh: 0.52, growth: 27, active: 9,  trend: 74, tone: [180, 86] },
    machine: { cat: "Science Fiction", status: "Active",    fresh: 0.71, growth: 33, active: 4,  trend: 92, tone: [158, 220] },
    gods:    { cat: "Fantasy",         status: "Completed", fresh: 0.34, growth: 4,  active: 180, trend: 49, tone: [300, 40] },
  };

  const timelines = base.timelines.map((t) => ({
    ...t,
    category: meta[t.id].cat,
    status: meta[t.id].status,
    fresh: meta[t.id].fresh,
    growth: meta[t.id].growth,
    activeMin: meta[t.id].active,
    trend: meta[t.id].trend,
    tone: meta[t.id].tone,
    ownership: "original",   // every Sacred Timeline above is a creator-owned original world
  }));

  // two extra timelines for discovery density
  timelines.push({
    id: "library", title: "The Drowned Library",
    logline: "Every book ever lost, shelved beneath a rising sea.",
    category: "Mystery", status: "Emerging", fresh: 0.94, growth: 52, activeMin: 1, trend: 84, tone: [200, 240], ownership: "original",
    stats: { readers: 612000, branches: 4380, variants: 49600, events: 1010, contributors: 3870 },
  });
  timelines.push({
    id: "comet", title: "Where the Comet Sleeps",
    logline: "A town that has worshipped a fallen star for a thousand winters.",
    category: "Original Worlds", status: "Emerging", fresh: 0.97, growth: 60, activeMin: 5, trend: 79, tone: [86, 200], ownership: "original",
    stats: { readers: 538000, branches: 3920, variants: 42100, events: 940, contributors: 3410 },
  });

  // ---- Official IP -------------------------------------------------------
  // Licensed universes the community can read, branch and create variants in —
  // but can never claim, sell, or license. Stewarded, not owned.
  const OFFICIAL = [
    { id: "destiny2", title: "Destiny 2", steward: "Bungie",
      logline: "Guardians, the Light, and the Darkness — retold across ten thousand branches.",
      category: "Science Fiction", status: "Active", fresh: 0.60, growth: 38, activeMin: 2, trend: 96, tone: [86, 200],
      stats: { readers: 3120000, branches: 22480, variants: 318400, events: 4120, contributors: 24800 } },
    { id: "starwars", title: "Star Wars", steward: "Lucasfilm",
      logline: "A galaxy of Force and empire, forked into endless what-ifs.",
      category: "Science Fiction", status: "Active", fresh: 0.45, growth: 21, activeMin: 4, trend: 92, tone: [60, 18],
      stats: { readers: 4010000, branches: 31200, variants: 402900, events: 5210, contributors: 33100 } },
    { id: "marvel", title: "Marvel", steward: "Marvel",
      logline: "Heroes without number — and every universe where they fall differently.",
      category: "Fantasy", status: "Active", fresh: 0.55, growth: 33, activeMin: 1, trend: 94, tone: [18, 300],
      stats: { readers: 3870000, branches: 29840, variants: 388700, events: 4980, contributors: 30500 } },
    { id: "halo", title: "Halo", steward: "343 Industries",
      logline: "Humanity, the Covenant, and the rings that could end everything.",
      category: "Science Fiction", status: "Active", fresh: 0.50, growth: 26, activeMin: 6, trend: 88, tone: [220, 158] ,
      stats: { readers: 2480000, branches: 17620, variants: 251300, events: 3380, contributors: 19200 } },
  ].map((t) => ({ ...t, ownership: "official" }));
  OFFICIAL.forEach((t) => timelines.push(t));

  // branches: base + new + a few more, each with variants, growth %, freshness
  const branches = base.branches.concat([
    { title: "The Library Was Never Sealed", timeline: "library", variants: 2180, hot: true },
    { title: "The Star Answered Back", timeline: "comet", variants: 2640, hot: true },
    { title: "Every Reader Vanished", timeline: "library", variants: 1490 },
    { title: "The Ember Was Never Lit", timeline: "ember", variants: 2050, hot: true },
    { title: "The Ocean Held Its Breath", timeline: "ocean", variants: 1870 },
    { title: "The Comet Never Fell", timeline: "comet", variants: 1320 },
  ]).map((b, i) => ({
    ...b,
    growth: b.hot ? 30 + ((i * 17) % 60) : 4 + ((i * 11) % 18),
    activeMin: 1 + ((i * 7) % 90),
  }));

  const events = base.events.concat([
    { title: "The Shelves Drown", timeline: "library" },
    { title: "The Comet Wakes", timeline: "comet" },
    { title: "The Last Catalogue", timeline: "library" },
  ]).map((e, i) => ({ ...e, activeMin: 2 + ((i * 13) % 120) }));

  const variants = base.variants.concat([
    { title: "The Cartographer", tag: "Variant-44", timeline: "library" },
    { title: "Warden Sable", tag: "Variant-09", timeline: "comet" },
    { title: "The Drowned Scribe", tag: "Variant-77", timeline: "library" },
  ]).map((v, i) => ({ ...v, activeMin: 1 + ((i * 5) % 60) }));

  // ---- Characters --------------------------------------------------------
  // A Character is a narrative entity. Its Variants are alternate manifestations
  // of it across realities — each with their own personality, history, motives.
  // (Distinct from a Variant, which is a single one of those manifestations.)
  const characters = [
    { name: "Cayde-6",         timeline: "destiny2", role: "The Exo Hunter",          variants: 2140, realities: 86, activeMin: 3 },
    { name: "The Guardian",    timeline: "destiny2", role: "Risen Lightbearer",       variants: 1680, realities: 71, activeMin: 9 },
    { name: "Master Chief",    timeline: "halo",     role: "Spartan-117",            variants: 1890, realities: 64, activeMin: 12 },
    { name: "Cortana",         timeline: "halo",     role: "Smart AI",               variants: 1310, realities: 52, activeMin: 21 },
    { name: "Commander Elias", timeline: "ninth",    role: "First Listener",          variants: 980,  realities: 44, activeMin: 5 },
    { name: "Queen Lyra",      timeline: "hollow",   role: "The Hollow Heir",         variants: 1240, realities: 58, activeMin: 7 },
    { name: "The Architect",   timeline: "machine",  role: "The Dreaming Engine",     variants: 1520, realities: 63, activeMin: 2 },
    { name: "Oracle",          timeline: "glass",    role: "Seer of Glass",          variants: 870,  realities: 39, activeMin: 16 },
    { name: "Captain Nova",    timeline: "neon",     role: "Exodus Pilot",           variants: 1090, realities: 47, activeMin: 11 },
    { name: "Atlas",           timeline: "sol",      role: "The First Sol-Born",      variants: 760,  realities: 33, activeMin: 28 },
    { name: "The Cartographer",timeline: "library",  role: "Keeper of Drowned Maps",  variants: 540,  realities: 22, activeMin: 4 },
    { name: "Warden Sable",    timeline: "comet",    role: "The Star-Watcher",        variants: 610,  realities: 26, activeMin: 8 },
  ].map((c, i) => ({ ...c, id: "char_" + i, title: c.name }));

  const activity = base.activity.concat([
    { kind: "Timeline Created", label: "The Drowned Library", timeline: "library" },
    { kind: "Branch Emerging", label: "The Star Answered Back", timeline: "comet" },
    { kind: "Variant Discovered", label: "The Cartographer · Variant-44", timeline: "library" },
  ]);

  // recommended realities — curated guest-friendly mix
  const recommended = [
    { timeline: "ninth", reason: "Most explored this cycle" },
    { timeline: "library", reason: "New · rising fast" },
    { timeline: "ocean", reason: "If you like the unknown" },
    { timeline: "hollow", reason: "A multiverse favourite" },
  ];

  // ---- relative time helper -----------------------------------------------
  function ago(min) {
    if (min < 1) return "just now";
    if (min < 60) return min + "m ago";
    const h = Math.floor(min / 60);
    if (h < 24) return h + "h ago";
    const d = Math.floor(h / 24);
    return d + "d ago";
  }

  function byId(id) { return timelines.find((t) => t.id === id); }
  function ownerOf(id) { const t = byId(id); return t ? t.ownership : "original"; }
  function charactersOf(id) { return characters.filter((c) => c.timeline === id); }
  function childrenOf(id) {
    return {
      branches: branches.filter((b) => b.timeline === id),
      events: events.filter((e) => e.timeline === id),
      variants: variants.filter((v) => v.timeline === id),
    };
  }

  return {
    CATEGORIES, SORTS, STATUSES, OWNERSHIP,
    timelines, branches, events, variants, characters, activity, recommended,
    ago, byId, ownerOf, charactersOf, childrenOf,
  };
})();
