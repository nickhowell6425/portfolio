// ============================================================
// THE WORKSPACE v2 — all copy & content, ported from the design.
// Items are pages ("page"), live components ("comp"), or the
// cross-project library ("library").
// ============================================================

import type { BrandId } from "./brands";

export const PH = {
  NAME: "Nicholas Howell",
  FIRST: "Nicholas",
  YEARS: "10",
  EMAIL: "nickhowell6425@gmail.com",
  STATUS_LINE: "Multiple multi-million valuations · 0 abandoned codebases",
  FOOTER: "⌘K — jump to any project or component",
} as const;

export const KINDS = ["All", "Auth", "Discovery", "Dashboards"] as const;

export type Kind = (typeof KINDS)[number];

export type FragmentId =
  | "multiverse"
  | "spine"
  | "ribbon"
  | "gateway"
  | "divergence"
  | "flap"
  | "dial";

export interface FragmentCode {
  file: string;
  lang: string;
  src: string;
}

export interface FragmentMeta {
  title: string;
  kind: Exclude<Kind, "All">;
  product: string;
  year: string;
  /** still in production */
  prod: boolean;
  accent: string;
  code: FragmentCode;
}

export interface Section {
  heading?: string;
  paras: string[];
  cta?: "message";
  ctaLabel?: string;
}

export interface OverviewHero {
  /** A live fragment mounted in the hero (the default treatment). */
  frag?: FragmentId;
  /** OR a static screenshot of the real screen (path under public/). */
  img?: string;
  kicker: string;
  lead: string;
  /** Optional call-to-action link — e.g. through to the interactive demo. */
  cta?: { label: string; href: string };
}

export interface PageItem {
  type: "page";
  label: string;
  desc: string;
  hero?: OverviewHero;
  sections: Section[];
}

export interface CompItem {
  type: "comp";
  label: string;
  desc: string;
  frag: FragmentId;
  paras: string[];
}

export interface DemoItem {
  type: "demo";
  label: string;
  desc: string;
  /**
   * The real app, embedded edge-to-edge. `src` points at a self-contained
   * bundle under public/ (served in an iframe — the app owns its viewport).
   * `frag` mounts a portfolio fragment instead. With neither, the demo
   * renders a scaffold placeholder.
   */
  src?: string;
  frag?: FragmentId;
  kicker?: string;
  lead?: string;
}

export interface ShowcaseMedia {
  /** A live fragment, mounted in place. */
  frag?: FragmentId;
  /** Still shown until the live fragment scrolls near (same size, under public/). */
  poster?: { src: string; width: number; height: number };
  /** OR one or more captured screens (paths under public/). */
  imgs?: { src: string; alt: string; width: number; height: number }[];
}

export interface ShowcaseSection {
  /** In-page anchor; sidebar anchor items point here. */
  id: string;
  kicker: string;
  title: string;
  line: string;
  points: string[];
  media: ShowcaseMedia;
  /** Gold treatment (Paradox's "divergence" colour). */
  gold?: boolean;
}

export interface ShowcaseTile {
  title: string;
  line: string;
  img: string;
  /** Section id this tile jumps to; omitted = the live demo. */
  target?: string;
  /** Show the whole screen instead of cropping to fill. */
  contain?: boolean;
  /** The big lead tile. */
  lead?: boolean;
}

/** A product landing page: cover, identity, what it does, feature sections, FAQ. */
export interface ShowcaseItem {
  type: "showcase";
  label: string;
  desc: string;
  /** <title> for search; the label is just the sidebar name. */
  seoTitle: string;
  tagline: string;
  /** One factual paragraph — also the meta description. */
  summary: string;
  cover: { src: string; alt: string };
  /** Where "Try it live" goes (an item id in the same workspace); omitted = no live demo. */
  live?: string;
  stack: string[];
  tiles: ShowcaseTile[];
  sections: ShowcaseSection[];
  faq: { q: string; a: string }[];
  /** Answer to "Who built it?", per brand. */
  builtBy: Record<BrandId, string>;
  /** The workspace the "next product" card points to. */
  next?: string;
}

/** Sidebar entry that jumps to a section of a page in the same workspace. */
export interface AnchorItem {
  type: "anchor";
  label: string;
  desc: string;
  /** Item id of the page holding the section. */
  page: string;
  /** Section id on that page. */
  hash: string;
}

export interface WsLinkItem {
  type: "ws";
  label: string;
  desc: string;
  ws: string;
}

export interface LibraryItem {
  type: "library";
  label: string;
  desc: string;
}

export type SidebarItem =
  | PageItem
  | CompItem
  | DemoItem
  | ShowcaseItem
  | AnchorItem
  | WsLinkItem
  | LibraryItem;

export interface SidebarGroup {
  title: string;
  items: string[];
}

export interface Workspace {
  id: string;
  initials: string;
  name: string;
  desc: string;
  status: string;
  accent: string;
  groups: SidebarGroup[];
  items: Record<string, SidebarItem>;
}

// ---- Component fragments (the bits & pieces) ----------------

export const FRAGMENTS: Record<FragmentId, FragmentMeta> = {
  multiverse: {
    title: "The Sacred Timeline",
    kind: "Discovery",
    product: "Paradox",
    year: "2026",
    prod: false,
    accent: "#3edba6",
    code: {
      file: "timeline-engine.ts",
      lang: "tsx",
      src: `// The homepage is the graph itself — no feed, no grid.
// One canvas, additive blending, a beating core at the origin.
function frame(t: number) {
  drawVoid(ctx)                          // radial green-black, brighter at the core
  ctx.globalCompositeOperation = 'lighter'
  for (const s of strands) drawStrand(s, t)     // glow halo pass + bright core pass
  for (const s of strands) drawParticles(s, t)  // light flowing toward the future
  drawCore(t)                            // 26 woven fibers round a pulsing nucleus
  for (const n of nodes) drawNode(n, t)  // emerald = canon, gold = divergence
  ctx.globalCompositeOperation = 'source-over'
}

// ten timelines fan out from a tight band around the core, then
// grow organically — each limb forks into smaller and dimmer kids
function grow(origin: Pt, ang: number, len: number, depth: number) {
  const end = reach(origin, ang, len)
  strands.push(bowedBezier(origin, end, {
    w: 3.4 - depth * 0.7,
    bright: 0.62 - depth * 0.1,
  }))
  for (const spread of spreads(depth)) grow(end, ang + spread, len * 0.6, depth + 1)
  return end
}`,
    },
  },
  spine: {
    title: "Timeline View",
    kind: "Dashboards",
    product: "Paradox",
    year: "2026",
    prod: false,
    accent: "#3edba6",
    code: {
      file: "tlv2-spine.ts",
      lang: "tsx",
      src: `// "Forget everything and reimagine it." One universe, full-bleed:
// canon flows left → right, branches fork off their divergence point.
const GAP = 460                              // px between canon events

// hero framing: open punchy and centered on the great divergence —
// whole-canon orientation lives in the minimap, not the first frame
const heroScale = () => clamp(Math.min(0.95, W / (2.6 * GAP)))
const heroNode = () => nodes.find((n) => n.type === 'event' && n.gold)

// the bottom scrubber is the same world at 1:1 — a draggable window
function syncMinimap() {
  const cw = content.maxX - content.minX
  win.style.left = \`\${((cam.x - W / 2 - content.minX) / cw) * 100}%\`
  win.style.width = \`\${(W / cw) * 100}%\`
}

function scrubTo(f: number) {
  cam.tx = content.minX + f * (content.maxX - content.minX)
}

// guided tour: fly the camera down the canon, one chapter at a time,
// the inspector following — first interaction hands control back
const tour = setInterval(() => focusEvent(chronology[i++ % 8]), 3600)`,
    },
  },
  ribbon: {
    title: "Reality ribbon",
    kind: "Dashboards",
    product: "Paradox",
    year: "2026",
    prod: false,
    accent: "#3edba6",
    code: {
      file: "BranchHero.tsx",
      lang: "tsx",
      src: `// A branch is a fork of the canon. The hero says it in one strip:
// shared chapters → gold divergence diamond → this reality, unfolding.
type Phase = 'canon' | 'split' | 'reality' | 'live'

function phaseOf(node: RibbonNode, divergence: Divergence): Phase {
  if (node.chapter < divergence.chapter) return 'canon'   // dashed jade — shared
  if (node.chapter === divergence.chapter) return 'split' // the 02:09 diamond
  return node.live ? 'live' : 'reality'                   // emerald — ours now
}

export function RealityRibbon({ nodes, divergence }: Props) {
  return (
    <ol className='ribbon'>
      {nodes.map((n) => (
        <li key={n.id} data-phase={phaseOf(n, divergence)}>
          <Knob />          {/* jade dot · gold diamond · emerald glow */}
          <Chapter n={n} />
        </li>
      ))}
    </ol>
  )
}`,
    },
  },
  gateway: {
    title: "Sign-in gateway",
    kind: "Auth",
    product: "Paradox",
    year: "2026",
    prod: false,
    accent: "#3edba6",
    code: {
      file: "SignInGateway.tsx",
      lang: "tsx",
      src: `// Guest first. Magic link second. Passwords never.
export function SignInGateway() {
  const [step, setStep] = useState<'gate' | 'sent' | 'in'>('gate')
  const [email, setEmail] = useState('')

  async function sendLink() {
    if (!email.includes('@')) return setError(true)
    await auth.sendMagicLink(email)
    setStep('sent')
  }

  if (step === 'in') return <Welcome name={forgeKeeperName()} />
  return (
    <Gate>
      <Provider id='google' recommended />
      <Provider id='discord' />
      <EmailField value={email} onChange={setEmail} onSubmit={sendLink} />
      <GuestLink onClick={enterAsGuest} />
    </Gate>
  )
}`,
    },
  },
  divergence: {
    title: "Branch cards",
    kind: "Discovery",
    product: "Paradox",
    year: "2026",
    prod: false,
    accent: "#3edba6",
    code: {
      file: "BranchCard.tsx",
      lang: "tsx",
      src: `// Design rule: every branch answers "what changed?" — it is never optional.
interface Branch {
  title: string
  divergence: string      // one sentence, serif, emerald-railed
  log: string
  stats: { readers: number; events: number; variants: number }
  hot?: boolean           // the data decides what's trending, not the layout
}

export function BranchCard({ b, onOpen }: { b: Branch; onOpen: () => void }) {
  return (
    <Card hot={b.hot} onClick={onOpen}>
      <Origin from='The Ninth Signal' trending={b.hot} />
      <Title>{b.title}</Title>
      <Divergence>{b.divergence}</Divergence>   {/* the load-bearing line */}
      <Logline>{b.log}</Logline>
      <Stats {...b.stats} creator={<Sigil seed={b.creator} />} />
    </Card>
  )
}

const sorters = {
  popular: (a, b) => b.stats.readers - a.stats.readers,
  newest: (a, b) => b.forkedAt - a.forkedAt,
  active: (a, b) => b.stats.contributors - a.stats.contributors,
}`,
    },
  },
  flap: {
    title: "Split-flap sign-in",
    kind: "Auth",
    product: "Timetrack",
    year: "2026",
    prod: true,
    accent: "#ffb454",
    code: {
      file: "CypherLock.tsx",
      lang: "tsx",
      src: `// One owner, one key. The board IS the form: no button, no status line.
// Every filled leaf shows a random character, so the key never appears.
export function CypherLock({ cells, next }: { cells: number; next: string }) {
  const [deck, setDeck] = useState<'' | 'working' | 'granted' | 'denied'>('')

  function onInput(value: string) {
    riffleTo(value.length, pick)                 // ciphertext, not the typed char
    if (value.length === cells) submit(value)    // the last leaf commits
  }

  async function submit(key: string) {
    setDeck('working')                           // every leaf turning, in cyan
    const res = await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ key, next }) })
    if (res.ok) return word('ACCEPTED', 'granted'), router.push(next)
    word('DENIED', 'denied')                     // the board answers for itself
  }

  // still a real <form> posting to /api/auth: with JS off it is a password field
  return <form method='post' action='/api/auth'>{/* leaves + invisible input */}</form>
}`,
    },
  },
  dial: {
    title: "The day as one dial",
    kind: "Dashboards",
    product: "Timetrack",
    year: "2026",
    prod: true,
    accent: "#ffb454",
    code: {
      file: "DayDial.tsx",
      lang: "tsx",
      src: `// A day of sessions as one dial: outer ring by hand, one ring per client.
// The dial only draws. Deciding what a mark means is the screen's job.
const angle = (min: number) => ((min - WINDOW_START) / WINDOW_LEN) * 100

const marks = sessions.map((s) => ({
  angle: angle(s.start + s.dur / 2),         // placed by when it happened
  radius: s.byHand ? rings[0] : rings[ringOf(s.client)],
  size: clamp(5 + s.dur / 12, 6, 15),        // longer sessions, bigger dots
  hue: s.byHand ? GOLD : s.client.hue,       // hue is identity, never status
  opacity: s.evidence ? 1 : 0.5,             // a gappy day reads faint at a glance
}))

// overlapping sessions all count: two matters in one hour are two billable hours
const worked = sum(sessions, (s) => s.dur)
const atOnce = worked / unionOf(sessions)    // concurrency, shown, not hidden

return <RadialDial figure={fmt(worked / 60)} caption='Hours worked' marks={marks} />`,
    },
  },
};

// ---- Shared library item -------------------------------------

const LIBRARY: LibraryItem = {
  label: "Component library",
  type: "library",
  desc: "Every piece from every project — filter by what your product needs.",
};

// ---- Workspaces ----------------------------------------------
// The personal home first, then the projects every brand shares.

const PERSONAL_WORKSPACES: Workspace[] = [
  {
    id: "home",
    initials: "NH",
    name: PH.NAME,
    desc: "",
    status: "a living showcase",
    accent: "#5b8def",
    groups: [
      { title: "Profile", items: ["about", "how-i-work", "straight-answers", "off-clock"] },
      { title: "Library", items: ["go-paradox", "go-timetrack", "component-library"] },
    ],
    items: {
      about: {
        label: "About",
        type: "page",
        desc: "Who you'd be working with",
        sections: [
          {
            paras: [
              `I'm ${PH.NAME} — CTO, founding engineer, and senior full-stack developer. For ${PH.YEARS}+ years I've shipped products to real customers — greenfield builds and established codebases alike — and helped teams reach multiple multi-million-dollar valuations.`,
              "My honest framing for 2026: I've mastered AI as an accelerator — but mastering the tool is the easy half. The harder half is understanding what it produces — evaluating it, hardening it, and making it perform under real load and real scale. Point me at a blank repo or drop me into your existing product and team; either way you get someone who runs with AI agents and knows exactly what to do when they get it wrong.",
            ],
          },
          {
            heading: "The receipts",
            paras: [
              `${PH.YEARS}+ years building. ${PH.STATUS_LINE}. As CTO and founding engineer at AccountTouch I solely architected and shipped the whole platform — a cross-platform mobile app, a serverless backend, and a web portal, all Dockerized and in production.`,
              "Before that I helped scale a fintech startup from 3 people to 20+ and into a multi-million-dollar acquisition, embedded with client teams at Good Code, and have run my own studio — Pinnacle — since 2019.",
              "The left rail is real work. The components inside are live — click through any of them, then flip from Preview to Code to read how it's built.",
            ],
          },
          {
            heading: "What I'm not",
            paras: [
              "An agency, a dev shop, or a body-leasing arrangement. You get me, my judgment, my agents, and the receipts.",
            ],
          },
          {
            heading: "If you're building something",
            cta: "message",
            ctaLabel: "Leave a message →",
            paras: [
              "Drop a note in the message box below — bring the idea in whatever shape it's in. I'll tell you straight whether it's a six-week build or a six-month one — even if the answer is “you don't need me yet.”",
            ],
          },
        ],
      },
      "how-i-work": {
        label: "How I work",
        type: "page",
        desc: "What an engagement actually looks like",
        sections: [
          {
            paras: ["Built in public, shipped in days"],
          },
          {
            heading: "It starts with a conversation",
            paras: [
              "Before anything else, we talk. If there's already something built, I'll be upfront about where it actually stands and what I'd do about it — no sugar-coating. If there's nothing yet, we figure out the shortest path to proof together.",
            ],
          },
          {
            heading: "I mold to you and your team",
            paras: [
              "I fit into how you already do things — your stack, your process, your people. You don't reshape your workflow around me; I shape mine around yours. Lead or follow, solo or embedded, I take the role the job actually needs.",
            ],
          },
          {
            heading: "Results in days, not months",
            paras: [
              "With AI doing the heavy lifting and me steering it, you start seeing real, working output in days — not weeks, not months. Momentum you can watch instead of wait for.",
            ],
          },
          {
            heading: "I push the code to the edge",
            paras: [
              "I keep a close eye on what's shipping and keep pushing the limits — newest tools, latest patterns, the best version that still holds up under real load. Cutting-edge where it earns its place, boring and bulletproof everywhere it counts.",
            ],
          },
        ],
      },
      "straight-answers": {
        label: "Straight answers",
        type: "page",
        desc: "The honest FAQ",
        sections: [
          {
            heading: "“Should I just build it myself with AI?”",
            paras: [
              "Genuinely: maybe. If it's a prototype to test interest, yes — go. Today's tools are great at that, and you'll learn more in a weekend than in a month of meetings.",
              "Where it bites is the moment real users, real money, or real data show up. That's when you want someone who's seen what breaks — and who knows where AI quietly cuts the wrong corner.",
            ],
          },
          {
            heading: "“Do you only do greenfield, solo builds?”",
            paras: [
              "No — that's the smaller half. I join existing codebases and existing teams as readily as I start something new. Sometimes the job is leading; sometimes it's being one strong pair of hands inside your team. Both are the work.",
            ],
          },
          {
            heading: "“What do you cost?”",
            paras: [
              "Less than a bad hire, more than a tool subscription. Fixed scope wherever possible, so the risk sits with me, not you.",
            ],
          },
          {
            heading: "“When should I NOT hire you?”",
            paras: [
              "If you're a large corporate org looking to fill one more seat on a big engineering floor — that's honestly not where I do my best work. I move fast and close to the decisions: startups, small teams, founders shipping something real. Anywhere in that world, I'm your guy.",
            ],
          },
          {
            heading: "“Will you maintain it after launch?”",
            paras: [
              "Yes — or I'll hand it to your team so cleanly they won't need me. Your call. “0 abandoned codebases” is a number I intend to keep.",
            ],
          },
        ],
      },
      "off-clock": {
        label: "Off the clock",
        type: "page",
        desc: "The human running the agents",
        sections: [
          {
            paras: ["The rest of this portfolio is the work. This page is the person running it."],
          },
          {
            heading: "Where I actually am",
            paras: [
              "Saint Petersburg, Florida. Most of my hours away from the keyboard go to my wife and family — including our two cats, who consider every warm laptop their rightful property.",
            ],
          },
          {
            heading: "Off the screen",
            paras: [
              "I travel whenever the schedule lets me, and I play ice hockey. Two separate loves — one keeps me curious, the other keeps me on my skates.",
            ],
          },
          {
            heading: "And, predictably",
            paras: [
              "I unwind with video games — and, like any true developer, with more software. My free-time builds are where I pressure-test new tools and AI workflows long before they ever touch client work. The hobby and the craft are the same thing; I just stopped pretending otherwise.",
            ],
          },
        ],
      },
      "go-paradox": {
        label: "Paradox",
        type: "ws",
        ws: "paradox",
        desc: "A living multiverse of stories",
      },
      "go-timetrack": {
        label: "Timetrack",
        type: "ws",
        ws: "timetrack",
        desc: "Time tracking for AI coding work",
      },
      "component-library": LIBRARY,
    },
  },
  {
    id: "paradox",
    initials: "P",
    name: "Paradox",
    desc: "A living multiverse of stories",
    status: "concept · 2026",
    accent: "#3edba6",
    groups: [
      { title: "Project", items: ["overview", "demo"] },
      {
        title: "Features",
        items: [
          "a-canvas",
          "a-signin",
          "a-search",
          "a-details",
          "a-activity",
          "a-filters",
          "a-branches",
        ],
      },
      { title: "Library", items: ["component-library"] },
    ],
    items: {
      overview: {
        type: "showcase",
        label: "Overview",
        desc: "A storytelling app where the timeline is the interface",
        seoTitle: "Paradox — sign-up, search, real-time and interactive data",
        tagline: "A living multiverse of stories.",
        summary:
          "Paradox, designed and built end to end: sign-up, search, a details panel, real-time activity and an interactive canvas, built the way production apps need it.",
        cover: {
          src: "/uploads/paradox-home.jpg",
          alt: "Paradox homepage: a living graph of story timelines",
        },
        live: "demo",
        stack: [
          "Next.js",
          "React",
          "TypeScript",
          "Tailwind CSS",
          "Node.js",
          "PostgreSQL",
          "Redis",
          "REST & GraphQL APIs",
          "Magic-link auth",
          "Docker",
          "Vercel",
          "AWS",
          "Cloudflare",
          "GitHub Actions CI/CD",
          "Sentry",
        ],
        tiles: [
          {
            title: "Timeline View",
            line: "One universe as a flight deck.",
            img: "/showcase/paradox/timeline.webp",
            target: "interactive-data",
            lead: true,
          },
          {
            title: "Sign-in",
            line: "Passwords never.",
            img: "/showcase/paradox/gateway.webp",
            target: "sign-up",
            contain: true,
          },
          {
            title: "Command palette",
            line: "Everything, two keystrokes away.",
            img: "/showcase/paradox/command-palette.webp",
            target: "command-palette",
          },
          {
            title: "Explore",
            line: "What’s alive, at a glance.",
            img: "/showcase/paradox/explore.webp",
            target: "filters",
          },
          {
            title: "Branch cards",
            line: "Every fork says what changed.",
            img: "/showcase/paradox/branches.webp",
            target: "user-content",
          },
          {
            title: "Homepage",
            line: "The graph is the front door.",
            img: "/showcase/paradox/home.webp",
          },
        ],
        sections: [
          {
            id: "interactive-data",
            kicker: "Interactive data",
            title: "Complex data people want to explore.",
            line: "A pannable canvas with a minimap underneath. It never gets lost. Try it.",
            points: [
              "Minimap at 1:1 with the canvas",
              "Drag, scrub and guided tour",
              "Color that carries meaning",
            ],
            media: { frag: "spine" },
          },
          {
            id: "sign-up",
            kicker: "Sign-up & onboarding",
            title: "Sign-up that doesn’t lose people.",
            line: "Most apps lose users at the front door. This one lets them in first.",
            points: [
              "Guest mode before any account",
              "Magic links, Google and Discord",
              "No passwords to forget or leak",
            ],
            media: {
              frag: "gateway",
              poster: { src: "/showcase/paradox/gateway.webp", width: 400, height: 417 },
            },
          },
          {
            id: "command-palette",
            kicker: "Search & command palette",
            title: "Find anything in two keystrokes.",
            line: "⌘K searches every timeline, branch, event and variant, and runs commands too.",
            points: [
              "Grouped, ranked results",
              "Full keyboard control",
              "Content and actions in one box",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/paradox/command-palette.webp",
                  alt: "Command palette with grouped results for timelines, branches, events and variants",
                  width: 1240,
                  height: 1070,
                },
              ],
            },
          },
          {
            id: "details-panel",
            kicker: "Details panel",
            title: "Click anything. Get everything.",
            line: "Overview, canon, branches and variants in one panel, without leaving the view.",
            points: [
              "Tabs instead of new pages",
              "Primary action always in reach",
              "Creator and rights built in",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/paradox/details-overview.webp",
                  alt: "Details panel, overview tab: stats, read and branch actions, creator",
                  width: 760,
                  height: 1340,
                },
                {
                  src: "/showcase/paradox/details-branches.webp",
                  alt: "Details panel, branches tab: branch list with what changed",
                  width: 760,
                  height: 1340,
                },
              ],
            },
          },
          {
            id: "live-activity",
            kicker: "Real-time activity",
            title: "Show that it’s alive.",
            line: "A live stream of what’s happening right now: new branches, discoveries, milestones.",
            points: ["Real-time events", "Readable at a glance", "Every item leads somewhere"],
            media: {
              imgs: [
                {
                  src: "/showcase/paradox/activity.webp",
                  alt: "Live activity stream: branches created, variants discovered, timeline growth",
                  width: 580,
                  height: 576,
                },
              ],
            },
          },
          {
            id: "filters",
            kicker: "Search filters",
            title: "Filters with live counts.",
            line: "Narrow by type, source and genre. Counts update as you go.",
            points: [
              "Faceted by type, source and genre",
              "A count on every option",
              "One-click reset",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/paradox/filters.webp",
                  alt: "Explore screen: faceted filters with counts beside trending timelines",
                  width: 1000,
                  height: 838,
                },
              ],
            },
          },
          {
            id: "user-content",
            kicker: "User content",
            title: "User content that stays readable.",
            line: "When anyone can post, structure is what keeps quality up.",
            points: [
              "Required summaries, shown first",
              "Live sorting by real activity",
              "Creator credit on everything",
            ],
            media: {
              frag: "divergence",
              poster: { src: "/showcase/paradox/branches.webp", width: 560, height: 558 },
            },
            gold: true,
          },
        ],
        faq: [
          {
            q: "Why magic links instead of passwords?",
            a: "Passwords are where sign-ups stall and support tickets start. A one-tap link removes both, and there’s no password to leak.",
          },
          {
            q: "Why let people in as a guest first?",
            a: "People decide to sign up after they see something worth it. Asking first loses them at the door, so here looking is never gated.",
          },
          {
            q: "Why a ⌘K command palette?",
            a: "One box finds everything and runs everything. Power users never leave the keyboard, and new users never hunt through menus.",
          },
          {
            q: "Why a details panel instead of a new page?",
            a: "Users keep their place. Stats, people and actions open beside what they’re looking at, so nobody loses the thread or hits back five times.",
          },
          {
            q: "How does the canvas stay easy to navigate?",
            a: "The minimap and the canvas share one model, so they never drift out of sync. A guided tour shows the way, and hands control back the moment you touch it.",
          },
          {
            q: "Why require a summary on every branch?",
            a: "When anyone can post, structure keeps quality up. One required sentence, shown first, means every card is readable at a glance.",
          },
          {
            q: "How is discovery ranked?",
            a: "By what readers actually do: readers, branches and recent activity. The busiest worlds rise on their own, no guesswork.",
          },
        ],
        builtBy: {
          personal: `${PH.NAME}, designed and built end to end. It’s how I’d build your product, too.`,
          fst: "Full Stack Technologies, LLC, designed and built end to end. It’s how we’d build your product, too.",
        },
        next: "timetrack",
      },
      demo: {
        type: "demo",
        label: "Interactive demo",
        desc: "The whole app, running in the browser",
        kicker: "the app, running",
        src: "/demos/paradox/02-Marketing/Homepage.html",
        lead: "The full Paradox concept, live and edge-to-edge — traverse the multiverse, open a timeline, fork a reality.",
      },
      "a-signin": {
        type: "anchor",
        label: "Sign-up flow",
        desc: "Guest-first, passwords never",
        page: "overview",
        hash: "sign-up",
      },
      "a-search": {
        type: "anchor",
        label: "Command palette",
        desc: "Find anything in two keystrokes",
        page: "overview",
        hash: "command-palette",
      },
      "a-details": {
        type: "anchor",
        label: "Details panel",
        desc: "Click anything, get everything",
        page: "overview",
        hash: "details-panel",
      },
      "a-activity": {
        type: "anchor",
        label: "Live activity",
        desc: "A real-time stream",
        page: "overview",
        hash: "live-activity",
      },
      "a-filters": {
        type: "anchor",
        label: "Filters",
        desc: "Faceted, with live counts",
        page: "overview",
        hash: "filters",
      },
      "a-canvas": {
        type: "anchor",
        label: "Interactive data",
        desc: "A canvas with a 1:1 minimap",
        page: "overview",
        hash: "interactive-data",
      },
      "a-branches": {
        type: "anchor",
        label: "User content",
        desc: "Branch cards that stay readable",
        page: "overview",
        hash: "user-content",
      },
      "component-library": LIBRARY,
    },
  },
  {
    id: "timetrack",
    initials: "TT",
    name: "Timetrack",
    desc: "Time tracking for AI coding work",
    status: "self-hosted · v0.1 beta",
    accent: "#ffb454",
    groups: [
      { title: "Project", items: ["overview"] },
      {
        title: "Features",
        items: ["a-dashboard", "a-signin", "a-log", "a-reports", "a-manual", "a-rules"],
      },
      { title: "Library", items: ["component-library"] },
    ],
    items: {
      overview: {
        type: "showcase",
        label: "Overview",
        desc: "Billable hours from AI coding sessions",
        seoTitle: "Timetrack — time tracking and client billing for AI coding agents",
        tagline: "Billable hours for work done with AI coding agents.",
        summary:
          "Timetrack, designed and built end to end: a secure sign-in, a live dashboard, an audit-ready time log, client reports and billing rules, built the way production apps need it.",
        cover: {
          src: "/showcase/timetrack/cover.webp",
          alt: "Timetrack Command Center: a week of work sessions on one dial, with hours, overlap and billing",
        },
        stack: [
          "Next.js",
          "React",
          "TypeScript",
          "Zod",
          "Deno",
          "Hono",
          "Supabase",
          "PostgreSQL",
          "Edge Functions",
          "Python",
          "Vercel AI SDK",
          "Docker",
          "Vercel",
          "GitHub Actions CI/CD",
          "Biome",
        ],
        tiles: [
          {
            title: "Command Center",
            line: "A whole week on one dial.",
            img: "/showcase/timetrack/command-center.webp",
            target: "dashboard",
            lead: true,
          },
          {
            title: "Sign-in",
            line: "A board that never shows the key.",
            img: "/showcase/timetrack/sign-in.webp",
            target: "sign-in",
            contain: true,
          },
          {
            title: "Time log",
            line: "Every hour, with receipts.",
            img: "/showcase/timetrack/time-log.webp",
            target: "time-log",
          },
          {
            title: "Reports",
            line: "Frozen the moment you export.",
            img: "/showcase/timetrack/reports.webp",
            target: "reports",
          },
          {
            title: "Manual entry",
            line: "For time the tracker can’t see.",
            img: "/showcase/timetrack/manual-entry.webp",
            target: "manual-entry",
          },
          {
            title: "Client rules",
            line: "Attribution by rule, not guesswork.",
            img: "/showcase/timetrack/client-rules.webp",
            target: "client-rules",
            contain: true,
          },
        ],
        sections: [
          {
            id: "dashboard",
            kicker: "Dashboard",
            title: "A whole day in one glance.",
            line: "Every session lands on a dial by when it happened, one ring per client. Point at any dot for the story behind it.",
            points: [
              "Hours, overlap and billing together",
              "Unproven time dims on its own",
              "Day or week, same dial",
            ],
            media: {
              frag: "dial",
              poster: { src: "/showcase/timetrack/dial.webp", width: 480, height: 535 },
            },
          },
          {
            id: "sign-in",
            kicker: "Authentication",
            title: "Sign-in that fits the product.",
            line: "A one-owner app doesn’t need accounts. One key, set into a split-flap board that answers for itself. Try it.",
            points: [
              "The key never appears on screen",
              "Signed session cookie, real sign-out",
              "Still works with JavaScript off",
            ],
            media: {
              frag: "flap",
              poster: { src: "/showcase/timetrack/flap.webp", width: 460, height: 178 },
            },
          },
          {
            id: "time-log",
            kicker: "Audit trail",
            title: "Every hour, with receipts.",
            line: "The log ties each session to the pull request or commit that proves the work happened.",
            points: [
              "Filter to what lacks evidence",
              "Attach a PR in one click",
              "Search by work, client or project",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/timetrack/time-log.webp",
                  alt: "Time log: sessions by client with the pull request that evidences each one",
                  width: 1440,
                  height: 900,
                },
              ],
            },
          },
          {
            id: "reports",
            kicker: "Client reports",
            title: "Invoices clients don’t argue with.",
            line: "Time, detailed and summary reports, rendered as real documents and frozen the moment you export.",
            points: [
              "Three report types, one click",
              "A sent figure never changes",
              "Every report says how hours were counted",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/timetrack/reports.webp",
                  alt: "Time report: hours and amount per client for the period",
                  width: 1200,
                  height: 1038,
                },
                {
                  src: "/showcase/timetrack/reports-detailed.webp",
                  alt: "Detail of Work report: every session listed under its client",
                  width: 1200,
                  height: 1038,
                },
              ],
            },
          },
          {
            id: "manual-entry",
            kicker: "Forms",
            title: "For the time the tracker can’t see.",
            line: "Calls and meetings go in by hand, tagged so they’re never mistaken for tracked time.",
            points: [
              "Find a client as you type",
              "Duration worked out for you",
              "Marked “by hand” everywhere it shows",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/timetrack/manual-entry.webp",
                  alt: "Manual entry drawer: work, client, time range, kind and project",
                  width: 640,
                  height: 894,
                },
              ],
            },
          },
          {
            id: "client-rules",
            kicker: "Billing rules",
            title: "Attribution by rule, not guesswork.",
            line: "Ordered rules map each repository to a client and a rate. Anything unmatched becomes a draft, never an invented client.",
            points: [
              "First match wins, in order",
              "No rate means tracked, never billed",
              "Change a rule and history recomputes",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/timetrack/client-rules.webp",
                  alt: "Client rules: each client with its hourly rate and the repositories it matches",
                  width: 1460,
                  height: 585,
                },
              ],
            },
            gold: true,
          },
        ],
        faq: [
          {
            q: "Why count overlapping sessions in full?",
            a: "Two agents working two clients’ code in the same hour is two hours of billable work. Timetrack counts both, then shows the overlap right next to the total, so nothing is hidden from you or your client.",
          },
          {
            q: "What makes an hour “defensible”?",
            a: "It carries proof: a pull request or a commit. The dashboard shows how much of your time has it, and the log makes the rest easy to fix before a client ever asks.",
          },
          {
            q: "Why never invent a client or a rate?",
            a: "A wrong name on an invoice costs more trust than a missing one. Unmatched work becomes an unbilled draft you confirm, and a client without a rate is tracked but never charged.",
          },
          {
            q: "Why freeze reports at export?",
            a: "Once a client has a number, it can’t quietly change. Edits after export only touch new drafts, so every invoice you’ve sent stays exactly as sent.",
          },
          {
            q: "Why keep the raw events untouched?",
            a: "Every figure is rebuilt from the original record. Change a rule and history recomputes cleanly; nothing is ever patched by hand or lost.",
          },
          {
            q: "What about privacy?",
            a: "Capture is deny-by-default: only folders you allow are tracked, file paths are redacted, and prompt text is thrown away. It’s self-hosted, so the data never leaves your own database.",
          },
          {
            q: "What happens if it’s misconfigured?",
            a: "It fails closed. A half-configured deployment shows an error, never an open dashboard full of client names and rates.",
          },
        ],
        builtBy: {
          personal: `${PH.NAME}, designed and built end to end. It’s how I’d build your product, too.`,
          fst: "Full Stack Technologies, LLC, designed and built end to end. It’s how we’d build your product, too.",
        },
        next: "paradox",
      },
      "a-signin": {
        type: "anchor",
        label: "Sign-in",
        desc: "A split-flap board, key never shown",
        page: "overview",
        hash: "sign-in",
      },
      "a-dashboard": {
        type: "anchor",
        label: "Dashboard",
        desc: "The day as one dial",
        page: "overview",
        hash: "dashboard",
      },
      "a-log": {
        type: "anchor",
        label: "Time log",
        desc: "Every hour, with receipts",
        page: "overview",
        hash: "time-log",
      },
      "a-manual": {
        type: "anchor",
        label: "Manual entry",
        desc: "Time the tracker can’t see",
        page: "overview",
        hash: "manual-entry",
      },
      "a-reports": {
        type: "anchor",
        label: "Reports",
        desc: "Frozen at export",
        page: "overview",
        hash: "reports",
      },
      "a-rules": {
        type: "anchor",
        label: "Client rules",
        desc: "Attribution by rule",
        page: "overview",
        hash: "client-rules",
      },
      "component-library": LIBRARY,
    },
  },
];

const [PERSONAL_HOME, ...PROJECTS] = PERSONAL_WORKSPACES;

// ---- Full Stack Technologies --------------------------------
// Same projects and live components; its own front door.

export const FST = {
  NAME: "Full Stack Technologies",
  LEGAL: "Full Stack Technologies, LLC",
  INITIALS: "FS",
  ACCENT: "#f7931e",
  STATUS_LINE: "Senior product engineering · fixed scope · 0 abandoned codebases",
} as const;

const FST_HOME: Workspace = {
  id: "home",
  initials: FST.INITIALS,
  name: FST.NAME,
  desc: "",
  status: "product engineering studio",
  accent: FST.ACCENT,
  groups: [
    { title: "Company", items: ["about", "services", "engagements", "straight-answers"] },
    { title: "Work", items: ["go-paradox", "go-timetrack", "component-library"] },
  ],
  items: {
    about: {
      label: "About",
      type: "page",
      desc: "Who builds your product",
      sections: [
        {
          paras: [
            `${FST.LEGAL} is a product engineering studio led by ${PH.NAME} — CTO, founding engineer, and senior full-stack developer with ${PH.YEARS}+ years shipping products to real customers and multiple multi-million-dollar valuations behind him.`,
            "We build new products from a blank repo, rescue and harden existing ones, and scale what's already working. AI agents do the heavy lifting; senior engineers steer, evaluate, and make the output hold up under real load.",
          ],
        },
        {
          heading: "The work speaks first",
          paras: [
            "The left rail is real work — two products designed and built end to end: Paradox, a storytelling platform built around interactive data, and Timetrack, self-hosted time tracking for AI coding agents. The components inside are live: click through any of them.",
          ],
        },
        {
          heading: "Who you work with",
          paras: [
            "Senior hands only. No account managers between you and the people writing your code, no junior bench learning on your budget. The person scoping the work is the person accountable for shipping it.",
          ],
        },
        {
          heading: "Start a project",
          cta: "message",
          ctaLabel: "Start a conversation →",
          paras: [
            "Tell us what you're building — in whatever shape it's in. You'll get a straight read on scope, timeline, and whether we're the right fit, usually the same day.",
          ],
        },
      ],
    },
    services: {
      label: "Services",
      type: "page",
      desc: "What we take on",
      sections: [
        {
          heading: "New product builds",
          paras: [
            "From idea to production: architecture, mobile and web apps, backend and infrastructure, launched to real users. Shortest path to proof first, then the version that scales.",
          ],
        },
        {
          heading: "Rescue & hardening",
          paras: [
            "An existing codebase that's slowing down, breaking under load, or was generated faster than anyone could review. We assess it honestly, stabilize what matters, and leave it better documented than we found it.",
          ],
        },
        {
          heading: "Embedded senior engineering",
          paras: [
            "A senior engineer inside your team — your stack, your process, your rituals. Lead or follow, whichever the work needs.",
          ],
        },
        {
          heading: "AI-assisted delivery",
          paras: [
            "Adopting AI agents in your engineering workflow without shipping what they get wrong: tooling, review practice, and guardrails that keep velocity and quality together.",
          ],
        },
        {
          heading: "Fractional CTO",
          paras: [
            "Technical leadership for founders without one: architecture calls, hiring, vendor decisions, and a roadmap that matches what the team can actually ship.",
          ],
        },
      ],
    },
    engagements: {
      label: "Engagements",
      type: "page",
      desc: "How a project runs",
      sections: [
        {
          heading: "1 · Conversation",
          paras: [
            "A short call about what you're building and where it stands. If something exists, you get an honest assessment. If nothing does, we map the shortest path to proof.",
          ],
        },
        {
          heading: "2 · Fixed-scope proposal",
          paras: [
            "A written scope, timeline, and price. Fixed scope wherever possible, so the risk sits with us, not you. Typical builds run 2–12 weeks.",
          ],
        },
        {
          heading: "3 · Build in the open",
          paras: [
            "Working software in days, not months — shared as it's built, so you watch momentum instead of waiting for it.",
          ],
        },
        {
          heading: "4 · Launch & handoff",
          paras: [
            "We ship it, then either maintain it or hand it to your team so cleanly they won't need us. Your call.",
          ],
        },
      ],
    },
    "straight-answers": {
      label: "Straight answers",
      type: "page",
      desc: "The honest FAQ",
      sections: [
        {
          heading: "“What does it cost?”",
          paras: [
            "Less than a bad hire, more than a tool subscription. Most work is quoted as fixed scope after the first conversation; ongoing and embedded work is billed monthly.",
          ],
        },
        {
          heading: "“Who actually writes the code?”",
          paras: [
            `Senior engineers, led by ${PH.NAME}, working with AI agents — and accountable for every line those agents produce.`,
          ],
        },
        {
          heading: "“Who's a good fit?”",
          paras: [
            "Startups, small teams, and founders shipping something real. If you're a large org looking to fill one more seat on a big engineering floor, we're honestly not the best fit.",
          ],
        },
        {
          heading: "“Who owns the code?”",
          paras: ["You do — the repository, the infrastructure, and the IP, from day one."],
        },
      ],
    },
    "go-paradox": PERSONAL_HOME.items["go-paradox"],
    "go-timetrack": PERSONAL_HOME.items["go-timetrack"],
    "component-library": LIBRARY,
  },
};

/** The capabilities sheet — FST's counterpart to the résumé. */
export const CAPABILITIES: { heading: string; items: string[] }[] = [
  {
    heading: "Services",
    items: [
      "New product builds — web, mobile, backend",
      "Rescue & hardening of existing codebases",
      "Embedded senior engineering",
      "AI-assisted delivery & agent workflows",
      "Fractional CTO",
    ],
  },
  {
    heading: "Stack",
    items: [
      "TypeScript · React · Next.js",
      "Cross-platform mobile apps",
      "Ruby on Rails",
      "Serverless & containerized backends (Docker)",
    ],
  },
  {
    heading: "Track record",
    items: [
      `${PH.YEARS}+ years shipping production software`,
      "Multiple multi-million-dollar valuations",
      "Scaled a fintech startup from 3 to 20+ people into an acquisition",
      "Designed and built Paradox and Timetrack end to end",
      "0 abandoned codebases",
    ],
  },
  {
    heading: "Engagement",
    items: [
      "Fixed scope wherever possible",
      "Typical builds: 2–12 weeks",
      "You own the code and IP from day one",
      "Maintain after launch, or a clean handoff",
    ],
  },
];

const BRAND_WORKSPACES: Record<BrandId, Workspace[]> = {
  personal: PERSONAL_WORKSPACES,
  fst: [FST_HOME, ...PROJECTS],
};

export function workspacesFor(brand: BrandId): Workspace[] {
  return BRAND_WORKSPACES[brand];
}
