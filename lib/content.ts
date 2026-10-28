// ============================================================
// THE WORKSPACE v2 — all copy & content, ported from the design.
// Items are pages ("page"), product pages ("showcase"), section anchors
// ("anchor"), demos ("demo"), or links to another workspace ("ws").
// ============================================================

import type { BrandId } from "./brands";

export const PH = {
  NAME: "Nicholas Howell",
  FIRST: "Nicholas",
  YEARS: "10",
  EMAIL: "nickhowell6425@gmail.com",
  STATUS_LINE: "Multiple multi-million valuations · 0 abandoned codebases",
  FOOTER: "⌘K — jump to any project or feature",
} as const;

export type FragmentId =
  | "spine"
  | "gateway"
  | "divergence"
  | "flap"
  | "dial"
  | "rank"
  | "branches"
  | "forecast";

export interface Section {
  heading?: string;
  paras: string[];
  cta?: "message";
  ctaLabel?: string;
}

export interface PageItem {
  type: "page";
  label: string;
  desc: string;
  sections: Section[];
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

export type SidebarItem = PageItem | DemoItem | ShowcaseItem | AnchorItem | WsLinkItem;

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
  /** Accent for text in the light theme, when `accent` is too pale to read on white. */
  accentInk?: string;
  groups: SidebarGroup[];
  items: Record<string, SidebarItem>;
}

/** A workspace's accent as text colour: its light-theme ink when it has one. */
export function accentText(ws: Pick<Workspace, "accent" | "accentInk">): string {
  return ws.accentInk
    ? `color-mix(in srgb, ${ws.accent} calc(100% - var(--light, 0) * 100%), ${ws.accentInk})`
    : ws.accent;
}

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
      { title: "Work", items: ["go-paradox", "go-timetrack", "go-constellation"] },
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
              "The left rail is real work: three products, each with a page on how it's built and why. The components inside are live — click through any of them.",
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
        desc: "Time tracking for the age of AI",
      },
      "go-constellation": {
        label: "Constellation",
        type: "ws",
        ws: "constellation",
        desc: "Prioritization across every client",
      },
    },
  },
  {
    id: "paradox",
    initials: "P",
    name: "Paradox",
    desc: "A living multiverse of stories",
    status: "storytelling · 2026",
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
          src: "/showcase/paradox/home.webp",
          alt: "Paradox homepage: a living graph of story timelines",
        },
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
                  width: 1520,
                  height: 1280,
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
              poster: { src: "/showcase/paradox/branches.webp", width: 560, height: 743 },
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
        lead: "Paradox, live and edge-to-edge — traverse the multiverse, open a timeline, fork a reality.",
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
    },
  },
  {
    id: "timetrack",
    initials: "TT",
    name: "Timetrack",
    desc: "Time tracking for the age of AI",
    status: "time tracking · 2026",
    accent: "#ffb454",
    groups: [
      { title: "Project", items: ["overview"] },
      {
        title: "Features",
        items: ["a-dashboard", "a-signin", "a-log", "a-reports", "a-manual", "a-rules"],
      },
    ],
    items: {
      overview: {
        type: "showcase",
        label: "Overview",
        desc: "Tracks every AI session, even several at once",
        seoTitle: "Timetrack — key sign-in, live dashboards, audit trails and reports",
        tagline: "Time tracking for the age of AI, all on your machine.",
        summary:
          "Timetrack, designed and built end to end: key sign-in, a live dashboard, an audit trail, reports and a rules engine, built the way production apps need it.",
        cover: {
          src: "/showcase/timetrack/cover.webp",
          alt: "Timetrack dashboard: a week of sessions on one dial, with totals, overlap and billing",
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
            title: "Dashboard",
            line: "Raw activity, one clear picture.",
            img: "/showcase/timetrack/command-center.webp",
            target: "dashboard",
            lead: true,
          },
          {
            title: "Sign-in",
            line: "Secure, no accounts.",
            img: "/showcase/timetrack/sign-in.webp",
            target: "sign-in",
            contain: true,
          },
          {
            title: "Audit trail",
            line: "Every record, with receipts.",
            img: "/showcase/timetrack/time-log.webp",
            target: "time-log",
          },
          {
            title: "Reports",
            line: "Frozen the moment they’re sent.",
            img: "/showcase/timetrack/reports.webp",
            target: "reports",
          },
          {
            title: "Forms",
            line: "Forms that do the math.",
            img: "/showcase/timetrack/manual-entry.webp",
            target: "manual-entry",
          },
          {
            title: "Rules engine",
            line: "Automation that asks, not guesses.",
            img: "/showcase/timetrack/client-rules.webp",
            target: "client-rules",
            contain: true,
          },
        ],
        sections: [
          {
            id: "dashboard",
            kicker: "Dashboards & data viz",
            title: "Raw activity, one clear picture.",
            line: "Hundreds of events become one dial: each session placed by when it ran, one ring per client. Point at any dot.",
            points: [
              "Totals, overlap and money in one view",
              "Weak data dims on its own",
              "Same view for a day or a week",
            ],
            media: {
              frag: "dial",
              poster: { src: "/showcase/timetrack/dial.webp", width: 480, height: 535 },
            },
          },
          {
            id: "sign-in",
            kicker: "Key authentication",
            title: "Secure sign-in, no accounts.",
            line: "Not every app needs sign-up. One owner, one key, and a sign-in that never shows what you type. Try it.",
            points: [
              "Signed session cookie, real sign-out",
              "Nothing secret ever on screen",
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
            title: "Every record, with receipts.",
            line: "Each entry links to the proof behind it, so anything can be checked later.",
            points: [
              "Filter to what’s missing proof",
              "Attach proof in one click",
              "Search across everything",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/timetrack/time-log.webp",
                  alt: "Audit trail: each session with the pull request that proves it",
                  width: 2390,
                  height: 1670,
                },
              ],
            },
          },
          {
            id: "reports",
            kicker: "Reports & exports",
            title: "Reports nobody argues with.",
            line: "Real documents generated from live data, then frozen the moment they’re sent.",
            points: [
              "Three report types, one click",
              "A sent number never changes",
              "Each one says how it was counted",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/timetrack/reports.webp",
                  alt: "Time report: hours and amount per client for the period",
                  width: 1700,
                  height: 1470,
                },
              ],
            },
          },
          {
            id: "manual-entry",
            kicker: "Forms",
            title: "Forms that do the math.",
            line: "Manual entry for what automation can’t see, clearly marked so it never mixes with tracked data.",
            points: [
              "Search-as-you-type pickers",
              "Durations worked out live",
              "Hand-entered data stays labeled",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/timetrack/manual-entry.webp",
                  alt: "Manual entry form: work, client, time range, kind and project",
                  width: 859,
                  height: 1200,
                },
              ],
            },
          },
          {
            id: "client-rules",
            kicker: "Rules engine",
            title: "Automation people can trust.",
            line: "Ordered rules sort incoming data on their own. Anything they can’t place waits for a person instead of a guess.",
            points: [
              "First match wins, in order",
              "No guessing where money is involved",
              "Change a rule, history updates",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/timetrack/client-rules.webp",
                  alt: "Rules engine: each client with its rate and the repositories it matches",
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
            q: "Why sign in with a key instead of accounts?",
            a: "A one-owner tool doesn’t need sign-up, password resets or a user table. One key behind a signed session cookie is less to build, less to leak and nothing to forget.",
          },
          {
            q: "Why count parallel sessions in full?",
            a: "Several jobs running at once is real work. Each one counts in full, and the overlap sits right beside the total, so nothing is hidden.",
          },
          {
            q: "Why keep the raw data untouched?",
            a: "Every number is rebuilt from the original record. Change a rule and history updates cleanly; nothing is ever patched by hand or lost.",
          },
          {
            q: "Why freeze reports once they’re sent?",
            a: "Once someone has a number, it shouldn’t quietly change. Later edits only touch new drafts, so everything you’ve sent stays exactly as sent.",
          },
          {
            q: "Why make automation ask instead of guess?",
            a: "A wrong guess costs more trust than a gap. Anything the rules can’t place waits for a person to confirm, and nothing gets billed by accident.",
          },
          {
            q: "Why keep the data on your machine?",
            a: "Activity data is sensitive. Hooks capture only what you allow, file paths are stripped, prompt text is thrown away, and it all stays local.",
          },
          {
            q: "What happens if it’s set up wrong?",
            a: "It fails closed. A half-configured install shows an error, never an open dashboard full of names and rates.",
          },
        ],
        builtBy: {
          personal: `${PH.NAME}, designed and built end to end. It’s how I’d build your product, too.`,
          fst: "Full Stack Technologies, LLC, designed and built end to end. It’s how we’d build your product, too.",
        },
        next: "constellation",
      },
      "a-signin": {
        type: "anchor",
        label: "Key sign-in",
        desc: "Secure, no accounts",
        page: "overview",
        hash: "sign-in",
      },
      "a-dashboard": {
        type: "anchor",
        label: "Dashboard",
        desc: "Raw activity, one clear picture",
        page: "overview",
        hash: "dashboard",
      },
      "a-log": {
        type: "anchor",
        label: "Audit trail",
        desc: "Every record, with receipts",
        page: "overview",
        hash: "time-log",
      },
      "a-manual": {
        type: "anchor",
        label: "Forms",
        desc: "Forms that do the math",
        page: "overview",
        hash: "manual-entry",
      },
      "a-reports": {
        type: "anchor",
        label: "Reports",
        desc: "Frozen once sent",
        page: "overview",
        hash: "reports",
      },
      "a-rules": {
        type: "anchor",
        label: "Rules engine",
        desc: "Automation that asks, not guesses",
        page: "overview",
        hash: "client-rules",
      },
    },
  },
  {
    id: "constellation",
    initials: "CN",
    name: "Constellation",
    desc: "Prioritization across every client",
    status: "planning · 2026",
    accent: "#c8f542",
    accentInk: "#3f5c00",
    groups: [
      { title: "Project", items: ["overview"] },
      {
        title: "Features",
        items: [
          "a-queue",
          "a-branches",
          "a-forecast",
          "a-inbox",
          "a-timeline",
          "a-portal",
          "a-client",
          "a-setup",
        ],
      },
    ],
    items: {
      overview: {
        type: "showcase",
        label: "Overview",
        desc: "What to work on next, across every client",
        seoTitle: "Constellation — prioritization and project planning across every client",
        tagline: "Know what to work on next, across every client.",
        summary:
          "Constellation, designed and built end to end: one ranked queue across every client, plans that branch like code, ship dates with honest error bars, client messages turned into proposed changes, and a live status page clients check for themselves.",
        cover: {
          src: "/showcase/constellation/cover.webp",
          alt: "Constellation queue: every client's issues in one ranked list, with forecasts and a capacity-planned Today",
        },
        stack: [
          "Next.js",
          "React",
          "TypeScript",
          "Zod",
          "PostgreSQL",
          "Redis",
          "Background jobs",
          "Gmail & Slack APIs",
          "Calendar sync",
          "Stripe API",
          "WebSockets",
          "Vercel",
          "GitHub Actions CI/CD",
        ],
        tiles: [
          {
            title: "Queue",
            line: "Every client, one ranked list.",
            img: "/showcase/constellation/queue.webp",
            target: "queue",
            lead: true,
          },
          {
            title: "Inbox",
            line: "Messages become proposed changes.",
            img: "/showcase/constellation/inbox.webp",
            target: "inbox",
          },
          {
            title: "Timeline",
            line: "Forecast bands, not guesses.",
            img: "/showcase/constellation/timeline.webp",
            target: "timeline",
          },
          {
            title: "Issue",
            line: "What moves the date, spelled out.",
            img: "/showcase/constellation/issue.webp",
            target: "forecast",
          },
          {
            title: "Client portal",
            line: "The same truth, read-only.",
            img: "/showcase/constellation/portal.webp",
            target: "portal",
          },
          {
            title: "Phone",
            line: "Today, in one hand.",
            img: "/showcase/constellation/phone.webp",
            target: "queue",
            contain: true,
          },
        ],
        sections: [
          {
            id: "queue",
            kicker: "Prioritization",
            title: "One ranked queue across every client.",
            line: "Every open issue, scored on deadline, client value, who’s waiting and effort. Change what matters and the queue re-sorts. Try it.",
            points: [
              "Today fills itself to your capacity",
              "Every score shows its reasons",
              "J / K, X and ⌘K for everything",
            ],
            media: { frag: "rank" },
          },
          {
            id: "branches",
            kicker: "Scenario planning",
            title: "Plans branch like code.",
            line: "Say yes to the rush job on a branch first. Every forecast moves, and you merge only if the week still works.",
            points: [
              "A diff against main before you commit",
              "Forecasts, load and late count recompute",
              "Merge or discard in one click",
            ],
            media: { frag: "branches" },
          },
          {
            id: "forecast",
            kicker: "Forecasting",
            title: "Dates with honest error bars.",
            line: "Each issue ships on a range, not a guess. Finish a sub-issue and watch the date pull in.",
            points: [
              "A p10–p90 range on every date",
              "The chance of hitting the due date",
              "Shows which work moves the date",
            ],
            media: { frag: "forecast" },
          },
          {
            id: "inbox",
            kicker: "Intake",
            title: "Client messages become proposed changes.",
            line: "Email, Slack, calendar and billing are read for what they change: a new issue, a moved date, more scope. You accept or decline.",
            points: [
              "The effect on your week, shown first",
              "Nothing changes without a yes",
              "A and D on the keyboard",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/constellation/inbox.webp",
                  alt: "Inbox: a client email proposing a new due date, with the field-by-field change and its effect on the plan",
                  width: 1440,
                  height: 900,
                },
              ],
            },
          },
          {
            id: "timeline",
            kicker: "Timeline & load",
            title: "The whole quarter, and this week.",
            line: "Every project’s plan, forecast band and due date on one timeline, and daily hours against capacity underneath.",
            points: [
              "Late work is visible weeks early",
              "Overbooked days turn red",
              "Same view on every plan branch",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/constellation/timeline.webp",
                  alt: "Timeline on the ferro-rush branch: plan bars, forecast bands, due dates and a diff of what slips",
                  width: 1440,
                  height: 760,
                },
              ],
            },
          },
          {
            id: "portal",
            kicker: "Client portal",
            title: "Clients see what you see.",
            line: "A read-only live page per project: status in plain language, milestones, the forecast, and exactly what’s waiting on them.",
            points: [
              "Their blockers, with the days they’d recover",
              "Updates without a status meeting",
              "No internal ranks, rates or other clients",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/constellation/portal.webp",
                  alt: "Client portal: expected delivery against target, milestones, what's waiting on the client and the delivery forecast",
                  width: 1440,
                  height: 1000,
                },
              ],
            },
          },
          {
            id: "client",
            kicker: "Client workspace",
            title: "Every client on one page.",
            line: "Retainer hours, open issues, forecasts, people and the signals worth noticing, like replies getting slower.",
            points: [
              "Retainer burn against plan",
              "Projects and issues with forecasts",
              "Upcoming dates in one list",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/constellation/client.webp",
                  alt: "Client workspace for Halcyon Health: retainer use, forecast, projects, issues, weekly hours and people",
                  width: 1440,
                  height: 1000,
                },
              ],
            },
          },
          {
            id: "setup",
            kicker: "Onboarding",
            title: "Set up from the tools you already use.",
            line: "Connect mail, chat, calendar and billing, confirm the clients it finds, set your deep-work hours and tune the ranking.",
            points: [
              "Clients detected from real threads",
              "Capacity set per weekday",
              "Ranking preview on your own issues",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/constellation/setup.webp",
                  alt: "Setup, step one: connect sources like Gmail, Slack, Google Calendar and Stripe",
                  width: 1440,
                  height: 720,
                },
              ],
            },
            gold: true,
          },
        ],
        faq: [
          {
            q: "How is the rank score worked out?",
            a: "A weighted average of four signals scored 0 to 10: deadline pressure, client value, whether someone is waiting, and effort. You set the weights, and every issue shows its score and the main reason for it, so the order is never a black box.",
          },
          {
            q: "Why branches instead of a what-if mode?",
            a: "Because a plan change is a change you might not keep. A branch shows the diff first (which projects slip, by how many days, how many hours it adds) and then you merge it or throw it away, the same way you would with code.",
          },
          {
            q: "Why forecast a range instead of one date?",
            a: "One date hides the risk. A p10–p90 band and an on-time percentage make a late project visible weeks earlier, while there’s still time to move work around it.",
          },
          {
            q: "Does it ever message a client on its own?",
            a: "No. Intake proposes changes; nothing reaches a client and no date moves without an explicit yes.",
          },
          {
            q: "What does the client see?",
            a: "A read-only live page for their project: status in plain language, milestones, the forecast and what’s waiting on them. Never internal ranks, rates or other clients.",
          },
        ],
        builtBy: {
          personal: `${PH.NAME}, designed and built end to end. It’s how I’d build your product, too.`,
          fst: "Full Stack Technologies, LLC, designed and built end to end. It’s how we’d build your product, too.",
        },
        next: "paradox",
      },
      "a-queue": {
        type: "anchor",
        label: "Ranked queue",
        desc: "Every client, one list",
        page: "overview",
        hash: "queue",
      },
      "a-branches": {
        type: "anchor",
        label: "Plan branches",
        desc: "What-ifs you can merge",
        page: "overview",
        hash: "branches",
      },
      "a-forecast": {
        type: "anchor",
        label: "Forecasts",
        desc: "Dates with error bars",
        page: "overview",
        hash: "forecast",
      },
      "a-inbox": {
        type: "anchor",
        label: "Inbox",
        desc: "Messages to proposed changes",
        page: "overview",
        hash: "inbox",
      },
      "a-timeline": {
        type: "anchor",
        label: "Timeline & load",
        desc: "The quarter and this week",
        page: "overview",
        hash: "timeline",
      },
      "a-portal": {
        type: "anchor",
        label: "Client portal",
        desc: "A live, read-only page",
        page: "overview",
        hash: "portal",
      },
      "a-client": {
        type: "anchor",
        label: "Client workspace",
        desc: "Every client on one page",
        page: "overview",
        hash: "client",
      },
      "a-setup": {
        type: "anchor",
        label: "Onboarding",
        desc: "Sources, capacity, ranking",
        page: "overview",
        hash: "setup",
      },
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
    { title: "Work", items: ["go-paradox", "go-timetrack", "go-constellation"] },
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
            "The left rail is real work — three products designed and built end to end: Paradox, a storytelling platform built around interactive data; Timetrack, time tracking for the age of AI; and Constellation, prioritization and planning across every client. The components inside are live: click through any of them.",
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
    "go-constellation": PERSONAL_HOME.items["go-constellation"],
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
      "Designed and built Paradox, Timetrack and Constellation end to end",
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
