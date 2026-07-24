// paradox-density.js — synthetic density engine.
// Given a timeline (or branch), procedurally generates a LARGE, deterministic
// body of branches, variants, events, activity and contributors so that any
// reality can be opened and shown teeming with data. Everything is seeded from
// the parent id, so re-renders and navigation are stable. A registry lets the
// UI navigate to any generated item by its assigned _did.

window.PARADOX_DENSITY = (function () {
  "use strict";

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  // ---- word banks (genre-neutral, fit any reality) ------------------------
  const NOUN = ["Signal","Crown","Ocean","Machine","Ember","Exodus","Gate","Throne","Comet","Library","Oracle","Engine","Cathedral","Archive","Eclipse","Tide","Spire","Covenant","Reliquary","Lantern","Verdict","Requiem","Bastion","Aurora","Citadel","Maelstrom","Sanctum","Vigil","Harbinger","Threshold","Beacon","Choir","Mirror","Garden","Furnace","Cradle","Wound","Pilgrim","Sovereign","Echo","Lattice","Veil","Anchor","Crucible","Sermon","Star","Moon","Glass","Dragon","Serpent"];
  const VERB = ["Fell","Woke","Burned","Drowned","Answered","Shattered","Returned","Vanished","Bloomed","Fractured","Ascended","Collapsed","Awakened","Sealed","Opened","Bled","Sang","Wept","Rose","Turned","Listened","Forgave","Remembered","Forgot","Hungered","Surrendered","Knelt","Spoke","Dreamed","Endured"];
  const ADJ = ["Hollow","Drowned","Last","Ninth","Silent","Broken","Endless","Forgotten","Gilded","Frozen","Burning","Sunken","Distant","Eternal","Fading","Sacred","Wounded","Hidden","Crimson","Pale","Severed","Quiet","Patient","Nameless","Unspoken","Ruined","Wandering","Sleeping","First","Final"];

  const FIRST = ["Elias","Lyra","Atlas","Nova","Sable","Cassian","Vesper","Orrin","Mira","Dax","Sela","Kael","Iris","Thorne","Wren","Caius","Lyssa","Bran","Soren","Talia","Rook","Vance","Aria","Cyrus","Maren","Dorian","Isolde","Magnus","Ondine","Perrin","Quill","Rhea","Silas","Una","Vega","Wynn","Yara","Zephyr","Ada","Bastian","Cleo","Halden","Ivo","Juno","Kestrel","Lior","Marlow","Nyx","Oriel","Phaedra"];
  const ROLE = ["The Cartographer","The Warden","The Architect","The Oracle","The Hollow King","The Last Witness","The Keeper","The Stranger","The Heir","The Exile","The Navigator","The Confessor","The Sleeper","The Cipher","The Pale Envoy","The First Reader","The Drowned Scribe","The Sentinel","The Inheritor","The Unwritten"];
  const SURNAME = ["Vane","Ashford","Quell","Mourne","Calloway","Dusk","Renn","Holloway","Sterling","Voss","Crane","Marsh","Aldous","Pike","Thessaly","Greer","Maddox","Wilder","Sorrel","Nakamura"];

  const ACT_KINDS = ["Branch Created","Variant Discovered","Convergence Requested","Reader Joined","Branch Emerging","Event Recorded","Timeline Growth","Variant Traced","Branch Merged","Annotation Added","Reality Forked","Canon Disputed"];

  // ---- registry so the UI can navigate to any generated node --------------
  const reg = new Map();
  let uid = 0;
  function register(obj) { obj._did = "d" + (uid++); reg.set(obj._did, obj); return obj; }

  // ---- generators ---------------------------------------------------------
  function makeBranchTitle(rng) {
    const pick = (a) => a[Math.floor(rng() * a.length)];
    const n = () => pick(NOUN), v = () => pick(VERB), a = () => pick(ADJ);
    const forms = [
      () => `What If The ${n()} Never ${v()}`,
      () => `The ${n()} ${v()}`,
      () => `The ${a()} ${n()}`,
      () => `When The ${n()} ${v()}`,
      () => `${n()} of the ${a()} ${n()}`,
      () => `The Day The ${n()} ${v()}`,
      () => `Before The ${n()} ${v()}`,
      () => `The ${a()} ${n()} Remembers`,
      () => `If The ${a()} ${n()} Had ${v()}`,
      () => `Where The ${n()} ${v()}`,
    ];
    return pick(forms)();
  }
  function makeVariantName(rng) {
    const pick = (a) => a[Math.floor(rng() * a.length)];
    const r = rng();
    if (r < 0.34) return pick(ROLE);
    if (r < 0.62) return pick(FIRST) + " " + pick(SURNAME);
    if (r < 0.82) return pick(FIRST);
    return pick(["Commander","Captain","Warden","Oracle","Envoy","Magister","Sister","Brother","Prefect","Marshal"]) + " " + pick(FIRST);
  }
  function makeEventTitle(rng) {
    const pick = (a) => a[Math.floor(rng() * a.length)];
    const n = () => pick(NOUN), a = () => pick(ADJ);
    const forms = [
      () => `The ${n()} ${pick(["Falls","Wakes","Opens","Breaks","Burns","Speaks","Returns","Bleeds","Rises"])}`,
      () => `The ${a()} ${n()}`,
      () => `First ${pick(["Contact","Light","Silence","Fire","Frost","Verdict","Convergence"])}`,
      () => `The Last ${n()}`,
      () => `${n()} of ${n()}`,
    ];
    return pick(forms)();
  }

  function ago(min) {
    if (min < 1) return "just now";
    if (min < 60) return min + "m ago";
    const h = Math.floor(min / 60);
    if (h < 24) return h + "h ago";
    const d = Math.floor(h / 24);
    if (d < 30) return d + "d ago";
    return Math.floor(d / 30) + "mo ago";
  }

  const cache = {};
  function buildFor(seedStr, timelineId) {
    if (cache[seedStr]) return cache[seedStr];
    const rng = mulberry32(hash(seedStr));
    const pick = (a) => a[Math.floor(rng() * a.length)];

    // branches — generate a deep pool (rendered progressively)
    const branches = [];
    for (let i = 0; i < 140; i++) {
      const hot = rng() < 0.22;
      branches.push(register({
        title: makeBranchTitle(rng),
        timeline: timelineId,
        variants: hot ? 1800 + Math.floor(rng() * 8400) : 90 + Math.floor(rng() * 2600),
        growth: hot ? 18 + Math.floor(rng() * 58) : Math.floor(rng() * 16) - 3,
        hot,
        activeMin: Math.floor(rng() * rng() * 4000),
      }));
    }
    branches.sort((a, b) => (b.hot - a.hot) || (b.growth - a.growth));

    // variants — large pool
    const variants = [];
    for (let i = 0; i < 320; i++) {
      const num = String(1 + Math.floor(rng() * 999)).padStart(2, "0");
      variants.push(register({
        title: makeVariantName(rng),
        tag: "Variant-" + num,
        timeline: timelineId,
        activeMin: Math.floor(rng() * rng() * 6000),
      }));
    }
    variants.sort((a, b) => a.activeMin - b.activeMin);

    // events — a chronology
    const events = [];
    let t = 2 + Math.floor(rng() * 40);
    for (let i = 0; i < 48; i++) {
      events.push(register({
        title: makeEventTitle(rng),
        timeline: timelineId,
        activeMin: t,
        chapter: "Chapter " + (Math.floor(i / 4) + 1),
      }));
      t += 20 + Math.floor(rng() * 600);
    }

    // contributors
    const contributors = [];
    for (let i = 0; i < 12; i++) {
      const name = rng() < 0.5 ? pick(FIRST) + " " + pick(SURNAME) : pick(FIRST) + "_" + pick(["weaver","keeper","drift","echo","void","nova","tide","ember","relic","oracle"]);
      contributors.push({ name, hue: Math.floor(rng() * 360), count: 40 + Math.floor(rng() * 1800) });
    }
    contributors.sort((a, b) => b.count - a.count);

    // a seed live-feed (denser than the homepage's)
    const feed = [];
    let fmin = 0;
    for (let i = 0; i < 16; i++) {
      const kind = pick(ACT_KINDS);
      let label;
      const r = rng();
      if (r < 0.4) label = pick(branches).title;
      else if (r < 0.75) { const v = pick(variants); label = v.title + " · " + v.tag; }
      else label = pick(events).title;
      feed.push({ kind, label, min: fmin });
      fmin += 1 + Math.floor(rng() * 14);
    }

    const out = { branches, variants, events, contributors, feed };
    cache[seedStr] = out;
    return out;
  }

  return {
    forTimeline: (id) => buildFor("tl:" + id, id),
    forBranch: (b) => buildFor("br:" + (b._did || b.title), b.timeline),
    get: (did) => reg.get(did),
    ago,
  };
})();
