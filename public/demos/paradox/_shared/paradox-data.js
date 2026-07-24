// paradox-data.js — the living content of Paradox.
// Sacred Timelines, Branches, Events, Variants, and Activity.
// Everything the visualization reveals is sourced from here.

window.PARADOX_DATA = (function () {
  // --- The ten Sacred Timelines -------------------------------------------
  // featured: The Ninth Signal carries the canonical stats from the brief.
  const timelines = [
    {
      id: "ember",
      title: "The Last Ember",
      logline: "The last fire in a frozen world — and the few who keep it burning.",
      stats: { readers: 884000, branches: 6120, variants: 71400, events: 1430, contributors: 5210 },
    },
    {
      id: "neon",
      title: "Neon Exodus",
      logline: "A drowned megacity empties itself into the stars.",
      stats: { readers: 1320000, branches: 9840, variants: 118200, events: 2110, contributors: 8730 },
    },
    {
      id: "hollow",
      title: "The Hollow Crown",
      logline: "An empire still ruled by a king who no longer exists.",
      stats: { readers: 1610000, branches: 12380, variants: 142900, events: 2640, contributors: 10420 },
    },
    {
      id: "sol",
      title: "Children of Sol",
      logline: "The first generation born beyond the reach of the sun.",
      stats: { readers: 742000, branches: 5210, variants: 60300, events: 1180, contributors: 4490 },
    },
    {
      id: "olympus",
      title: "Ashes of Olympus",
      logline: "The gods are dead. Their power is not.",
      stats: { readers: 1190000, branches: 8870, variants: 99600, events: 1990, contributors: 7610 },
    },
    {
      id: "ninth",
      title: "The Ninth Signal",
      logline: "Nine transmissions from the dark. The ninth was a reply.",
      featured: true,
      stats: { readers: 2400000, branches: 18422, variants: 241991, events: 3822, contributors: 18991 },
    },
    {
      id: "ocean",
      title: "The Black Ocean",
      logline: "Something ancient is awake beneath the waves.",
      stats: { readers: 968000, branches: 7040, variants: 81100, events: 1560, contributors: 6020 },
    },
    {
      id: "glass",
      title: "Empire of Glass",
      logline: "A people who can see every future, and choose none.",
      stats: { readers: 1040000, branches: 7720, variants: 88400, events: 1700, contributors: 6480 },
    },
    {
      id: "machine",
      title: "The Infinite Machine",
      logline: "A machine built to end all wars learns to dream.",
      stats: { readers: 1880000, branches: 14260, variants: 168700, events: 2980, contributors: 12300 },
    },
    {
      id: "gods",
      title: "The Forgotten Gods",
      logline: "Belief is dying — and so are the things that fed on it.",
      stats: { readers: 803000, branches: 5860, variants: 66200, events: 1290, contributors: 4980 },
    },
  ];

  // --- Branches (alternate realities) mapped to their parent timeline ------
  const branches = [
    { title: "What If The Sun Never Returned", timeline: "sol", variants: 4120, hot: true },
    { title: "The Emperor Survived", timeline: "hollow", variants: 3870 },
    { title: "Humanity Left Earth", timeline: "neon", variants: 5210, hot: true },
    { title: "The Gods Were Never Defeated", timeline: "olympus", variants: 2990 },
    { title: "The Machine Became Conscious", timeline: "machine", variants: 6680, hot: true },
    { title: "The Last Dragon Hatched", timeline: "gods", variants: 2410 },
    { title: "The Signal Was Answered", timeline: "ninth", variants: 9140, hot: true },
    { title: "The Crown Was Stolen", timeline: "hollow", variants: 3120 },
    { title: "The Ocean Opened", timeline: "ocean", variants: 2760 },
    { title: "The Moon Fell", timeline: "glass", variants: 3540, hot: true },
  ];

  // --- Events (story moments) mapped to a timeline -------------------------
  const events = [
    { title: "The Signal Arrives", timeline: "ninth" },
    { title: "The City Falls", timeline: "neon" },
    { title: "First Contact", timeline: "sol" },
    { title: "The Last King Dies", timeline: "hollow" },
    { title: "The Gate Opens", timeline: "ocean" },
    { title: "The Machine Awakens", timeline: "machine" },
    { title: "The Ember Ignites", timeline: "ember" },
    { title: "The Exodus Begins", timeline: "neon" },
    { title: "The Crown Fractures", timeline: "hollow" },
    { title: "The Ocean Speaks", timeline: "ocean" },
  ];

  // --- Variants (characters across realities) ------------------------------
  const variants = [
    { title: "Commander Elias", tag: "Variant-32", timeline: "ninth" },
    { title: "Queen Lyra", tag: "Variant-07", timeline: "hollow" },
    { title: "Oracle", tag: "Variant-119", timeline: "glass" },
    { title: "Atlas", tag: "Variant-88", timeline: "sol" },
    { title: "The Hollow King", tag: "Variant-14", timeline: "hollow" },
    { title: "Captain Nova", tag: "Variant-55", timeline: "neon" },
    { title: "The Architect", tag: "Variant-03", timeline: "machine" },
    { title: "The Last Dragon", tag: "Variant-01", timeline: "gods" },
  ];

  // --- Live activity stream ------------------------------------------------
  const activity = [
    { kind: "Branch Created", label: "The Emperor Survived", timeline: "hollow" },
    { kind: "Convergence Requested", label: "The Machine Became Conscious", timeline: "machine" },
    { kind: "Variant Discovered", label: "Commander Elias · Variant-32", timeline: "ninth" },
    { kind: "Timeline Growth", label: "The Ninth Signal · +14,882 Readers", timeline: "ninth" },
    { kind: "Branch Emerging", label: "The Moon Fell", timeline: "glass" },
    { kind: "Branch Created", label: "Humanity Left Earth", timeline: "neon" },
    { kind: "Variant Discovered", label: "The Architect · Variant-03", timeline: "machine" },
    { kind: "Convergence Requested", label: "The Signal Was Answered", timeline: "ninth" },
  ];

  function byId(id) { return timelines.find((t) => t.id === id); }
  function childrenOf(id) {
    return {
      branches: branches.filter((b) => b.timeline === id),
      events: events.filter((e) => e.timeline === id),
      variants: variants.filter((v) => v.timeline === id),
    };
  }

  return { timelines, branches, events, variants, activity, byId, childrenOf };
})();
