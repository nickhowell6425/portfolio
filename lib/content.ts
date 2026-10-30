// ============================================================
// THE WORKSPACE v2 — all copy & content, ported from the design.
// Items are pages ("page"), product pages ("showcase"), section anchors
// ("anchor"), demos ("demo"), or links to another workspace ("ws").
// ============================================================

import { BRANDS, type BrandId } from "./brands";

export const PH = {
  NAME: "Nicholas Howell",
  FIRST: "Nicholas",
  YEARS: "10",
  EMAIL: BRANDS.personal.email,
  STATUS_LINE: "One-on-one · hands-on engineering · clear next steps",
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
  | "forecast"
  | "deck"
  | "rule"
  | "voice"
  | "launch"
  | "import"
  | "grid"
  | "extract"
  | "ask";

export interface Section {
  heading?: string;
  paras: string[];
  prompt?: string;
  table?: { headers: string[]; rows: string[][] };
  links?: { label: string; href: string }[];
  cta?: "message";
  ctaLabel?: string;
}

export interface PageItem {
  type: "page";
  label: string;
  desc: string;
  title?: string;
  seoTitle?: string;
  article?: { published: string; modified: string };
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
  context?: Section[];
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
  /** Owning brand for the studio libraries; former personal URLs redirect here. */
  canonicalBrand?: BrandId;
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
      {
        title: "Profile",
        items: ["about", "how-i-work", "working-through-a-build", "straight-answers", "off-clock"],
      },
      {
        title: "Explore",
        items: [
          "go-paradox",
          "go-timetrack",
          "go-constellation",
          "go-helm",
          "go-nemo",
          "go-snakenfriends",
          "go-coverly",
        ],
      },
    ],
    items: {
      about: {
        label: "About",
        type: "page",
        desc: "Work one-on-one with Nicholas Howell: hands-on engineering, honest advice, and help turning your app idea into a working product.",
        sections: [
          {
            heading: "What working together feels like",
            paras: [
              "Bring a rough sketch, an AI prototype, or a problem you haven't quite figured out how to explain yet. We'll talk it through directly, decide what to try, and look at working software together. You don't need to speak developer to take part in the decisions.",
              "Ask questions as we go. I'll explain my recommendation, what it would change, and what we still need to find out. If you want to get into the tools yourself, we can work through a real task together. If you want me to own the build, we'll agree on the checkpoints that keep you involved.",
            ],
            links: [
              {
                label: "A real example: working through the details",
                href: "/home/working-through-a-build",
              },
            ],
          },
          {
            heading: "Experience behind the work",
            paras: [
              `At AccountTouch, I served as CTO and founding engineer and architected the platform: a cross-platform mobile app, a serverless backend, and a web portal. My ${PH.YEARS}+ years of experience span product architecture, implementation, and technical leadership.`,
              "Before that I helped scale a fintech startup from 3 people to 20+ and worked with it through an acquisition. I've also worked inside client teams and run my own studio. That experience gives us a practical starting point for talking about what your product needs now and what can wait.",
            ],
          },
          {
            heading: "Work directly with the engineer",
            paras: [
              "You talk to the person doing the work. I can take a build forward, work alongside your team, or help you get comfortable building with AI yourself. We'll agree on the responsibility you need me to take, how we stay in touch, and when you'll see working software.",
            ],
          },
          {
            heading: "If you're building something",
            cta: "message",
            ctaLabel: "Tell me what you're working on →",
            paras: [
              "Tell me who you're trying to help, what you've tried, and where you're stuck. A few sentences are enough. If you have a deadline or budget boundary, include it so we can find a sensible next step together.",
            ],
          },
        ],
      },
      "how-i-work": {
        label: "How I work",
        type: "page",
        title: "What working together feels like",
        seoTitle: "Working one-on-one with a hands-on engineer",
        desc: "Direct conversations, working software, and clear next steps: how Nicholas Howell collaborates with founders and small teams.",
        sections: [
          {
            paras: [
              "You work directly with me. We talk about the problem, decide what to try, and look at the result together. I'll explain my recommendation and the tradeoffs so you can question it and make an informed decision.",
            ],
          },
          {
            heading: "It starts with a conversation",
            paras: [
              "Show me what you're working on, even if it's rough. We'll talk through who it helps, what already works, and what you're unsure about. If something needs a closer look before I can give you an answer, I'll say so.",
            ],
          },
          {
            heading: "A working relationship that fits",
            paras: [
              "Some founders want to learn as we build. Others want someone to own the technical work and keep them involved in product decisions. We can work out the right balance, including how we communicate and when we check in. If you have a team, I start with the tools and habits it already uses.",
            ],
          },
          {
            heading: "Review working software early",
            paras: [
              "You'll have something concrete to react to at agreed checkpoints. We define what each step needs to do, try the important flows, and discuss what we learn. If a new idea changes the scope or timing, we talk it through before adding the work.",
            ],
          },
          {
            heading: "Use tools that earn their place",
            paras: [
              "I use AI for planning, implementation, and review, and stay responsible for the result. We agree on the tools, access, and costs before work starts. I check the behavior that matters to your users, including permissions, failed requests, and what happens if a release needs to be undone.",
            ],
            links: [
              {
                label: "See that approach in a Timetrack decision",
                href: "/home/working-through-a-build",
              },
            ],
          },
        ],
      },
      "working-through-a-build": {
        label: "Working through a build",
        type: "page",
        title: "Working through the details, together",
        seoTitle: "How I explain engineering decisions: a Timetrack example",
        desc: "A concrete decision from Timetrack shows how I make technical tradeoffs understandable, check the result, and keep you involved in a build.",
        sections: [
          {
            heading: "Something concrete to talk through",
            paras: [
              "When we work together, I want you to be able to question a recommendation without needing to read the code first. A small example from Timetrack shows what that conversation can be about: should a short manual entry disappear from a summary just because automated sessions ran longer?",
              "Timetrack turns recorded AI sessions and manual entries into reports. A check in the project puts a fifteen-minute manual entry beside ten long agent sessions and makes sure all eleven entries remain available to the summary. Duration alone doesn't tell us which work matters to the reader.",
            ],
            links: [{ label: "Explore Timetrack's interface", href: "/timetrack/overview" }],
          },
          {
            heading: "Connect the decision to a check",
            paras: [
              "A repeatable test checks that the short manual entry stays in the summary's starting data. It checks behavior a person would notice: whether their work remains visible as the records move through the system.",
              "This is the kind of evidence we can review together: what should happen, a concrete example, and a check that would catch the wrong result. You can change your mind about the requirement while the consequences are still easy to discuss.",
            ],
          },
          {
            heading: "Be clear about where AI fits",
            paras: [
              "I used AI assistance while building Timetrack, including how session records are organized and updated. I remain responsible for deciding which information belongs in a report and checking that it survives each step.",
              "When we work on your app, we can use AI to explore and implement a change while keeping those decisions understandable. I'll explain the proposed behavior and what we've checked. If you want to use the tools yourself, we can work through the same task together.",
            ],
            links: [
              {
                label: "The fuller Timetrack engineering walkthrough at FST",
                href: new URL("/blog/timetrack-session-reporting", BRANDS.fst.url).href,
              },
            ],
          },
          {
            heading: "Bring the part you're unsure about",
            paras: [
              "It might be a number that doesn't look right, a user flow that feels awkward, or a feature you're not sure you need. We can start there, make the choices concrete, and work out the next useful step. No finished specification required.",
            ],
            links: [{ label: "More about how I work", href: "/home/how-i-work" }],
            cta: "message",
            ctaLabel: "Tell me what you're working on →",
          },
        ],
      },
      "straight-answers": {
        label: "Straight answers",
        type: "page",
        title: "Working with Nicholas Howell: common questions",
        seoTitle: "Working with Nick: questions and answers",
        desc: "Questions about working directly with Nick, learning to build with AI, project costs, and support after launch.",
        sections: [
          {
            heading: "“Do I need to know how to code?”",
            paras: [
              "No. You bring the understanding of your users and the problem you're solving. I'll help turn that into a practical plan and explain the technical choices in plain language. If you want to learn the tools as we go, we can make that part of the work.",
            ],
          },
          {
            heading: "“Should I just build it myself with AI?”",
            paras: [
              "If you need to test an idea with sample data, building a small experiment yourself can be a useful first step. Get feedback before committing to a larger build.",
              "When you're ready for real users or private data, we can review what you've built and work through the gaps together. You don't have to throw your prototype away or pretend you built it without AI.",
            ],
          },
          {
            heading: "“Can you help with an app I've already started?”",
            paras: [
              "I can start with an idea, pick up an existing app, or work alongside your team. We'll look at what you already have before deciding what needs to change.",
            ],
          },
          {
            heading: "“What do you cost?”",
            paras: [
              "Pricing depends on the scope, the condition of the existing system, and the responsibility you need me to take on. We agree on deliverables and commercial terms before starting. A defined piece of work may suit a fixed scope; embedded work needs a different arrangement.",
            ],
          },
          {
            heading: "“How will we stay in touch?”",
            paras: [
              "You communicate directly with me. Before starting, we'll agree on the channel, review checkpoints, and availability that fit the engagement. Bring questions as they come up; we'll keep the decisions and next steps clear.",
            ],
          },
          {
            heading: "“Will you maintain it after launch?”",
            paras: [
              "Ongoing maintenance or a handoff to your team can be part of the engagement. We should agree on ownership, documentation, access, and support expectations before the build begins.",
            ],
          },
        ],
      },
      "off-clock": {
        label: "Off the clock",
        type: "page",
        title: "Nicholas Howell, away from the keyboard",
        seoTitle: "Life in Saint Petersburg, Florida",
        desc: "Family, travel, ice hockey, and the interests behind Nicholas Howell’s engineering work.",
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
      "go-helm": {
        label: "Helm",
        type: "ws",
        ws: "helm",
        desc: "One decision at a time, every client and agent",
      },
      "go-nemo": {
        label: "Nemo",
        type: "ws",
        ws: "nemo",
        desc: "Your AI identities, portable to any model",
      },
      "go-snakenfriends": {
        label: "Snake n Friends",
        type: "ws",
        ws: "snakenfriends",
        desc: "Classic snake, rebuilt for head-to-head play",
      },
      "go-coverly": {
        label: "Coverly",
        type: "ws",
        ws: "coverly",
        desc: "Every insurance policy, readable and answerable",
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
    accentInk: "#0a7553",
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
        seoTitle: "Paradox — interactive storytelling",
        tagline: "A living multiverse of stories.",
        summary:
          "Explore Paradox, an interactive storytelling app with branching timelines, guest-first onboarding, search, and a canvas for navigating connected stories.",
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
            line: "Explore connected timelines on a pannable canvas, with a minimap that keeps the wider story in view.",
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
            title: "Let readers explore before signing up.",
            line: "Guest access lets readers explore first, with magic-link, Google, and Discord sign-in when they choose to join.",
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
            title: "Search stories and run commands in one place.",
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
            title: "Inspect the details without losing your place.",
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
            title: "Keep recent story activity in view.",
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
          },
        ],
        faq: [
          {
            q: "Why magic links instead of passwords?",
            a: "Magic links remove the need to create and remember a password. Their security still depends on email access, short-lived tokens, safe redirects, and session handling.",
          },
          {
            q: "Why let people in as a guest first?",
            a: "Guest access lets readers understand the stories and navigation before deciding whether to create an account. The sign-in flow is available when they want to take part.",
          },
          {
            q: "Why a ⌘K command palette?",
            a: "The palette brings search and common actions into one keyboard-accessible entry point, with results grouped by content type. It gives readers an alternative to navigating each view separately.",
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
        desc: "Open search and commands with ⌘K",
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
    accentInk: "#955300",
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
        desc: "Inspect AI session records, including parallel activity",
        seoTitle: "Timetrack — AI coding session tracking",
        tagline: "Self-hosted AI session tracking, with records you can inspect.",
        summary:
          "Explore Timetrack, a self-hosted tool for tracking AI coding sessions, reviewing parallel activity, and creating reports from inspectable records. Selected activity metadata flows from local hooks to a Supabase collector and a Vercel-hosted dashboard.",
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
            line: "A stored snapshot at export.",
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
            line: "Attribution with reviewable rules.",
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
            line: "Session activity becomes one dial: each session placed by when it ran, one ring per client. Inspect a point to see the record behind it.",
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
            title: "Key-based sign-in for a single owner.",
            line: "A single-owner tool can use a key-based sign-in flow, with masked input and a signed session cookie.",
            points: [
              "Signed session cookie, real sign-out",
              "Key input stays masked",
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
            line: "Session records can carry repository, commit, or pull-request references so the work behind an entry is easier to inspect.",
            points: [
              "Filter to what’s missing proof",
              "Attach proof in one click",
              "Search across everything",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/timetrack/time-log.webp",
                  alt: "Session records with evidence references in the audit trail",
                  width: 2390,
                  height: 1670,
                },
              ],
            },
          },
          {
            id: "reports",
            kicker: "Reports & exports",
            title: "Reports with a traceable calculation.",
            line: "Export saves the report document. Reopening that saved report reads its stored snapshot instead of recalculating it from current activity.",
            points: [
              "Three report types, one click",
              "Reopen the stored export snapshot",
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
            line: "Manual entry for what automation can’t see, labeled separately from automatically captured sessions.",
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
            title: "Attribution you can review.",
            line: "Ordered rules match incoming activity to projects. An unrecognized project can become a reviewable draft without a rate, leaving that decision to a person.",
            points: [
              "First match wins, in order",
              "Draft projects start without a rate",
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
          },
        ],
        faq: [
          {
            q: "Why sign in with a key instead of accounts?",
            a: "A one-owner tool doesn’t need sign-up, password resets or a user table. One key behind a signed session cookie is less to build, less to leak and nothing to forget.",
          },
          {
            q: "Why count parallel sessions in full?",
            a: "Session time records each job’s duration, including concurrent jobs. Overlap is shown alongside the total so it can be distinguished from elapsed human time. What is billable depends on the client agreement.",
          },
          {
            q: "Why keep the raw data untouched?",
            a: "Source events are kept separately from derived session records. Attribution can be rebuilt when rules change, while the original events remain available for inspection.",
          },
          {
            q: "What does saving a report preserve?",
            a: "Export stores a snapshot of the report document. Reopening it reads that saved document instead of recalculating against current data. Saved reports can also be deleted.",
          },
          {
            q: "What happens to an unrecognized project?",
            a: "It can become a draft for review, without an automatically assigned rate. A person can review the attribution and set the relevant configuration. Recorded activity alone does not establish what a client has agreed to pay for.",
          },
          {
            q: "Where does captured activity go?",
            a: "Local hooks capture activity within configured repository roots, then selected metadata is sent to a Supabase collector and shown in a Vercel-hosted dashboard. Paths are shortened or aliased, rather than removed entirely. Default hook capture discards prompt and tool contents. Self-hosted here means you control the configured services; it does not mean all data stays on the device.",
          },
          {
            q: "Can optional AI features send text to a model provider?",
            a: "Yes. Optional title generation is off by default and, when explicitly enabled, can send bounded excerpts of human messages to a model provider. Report narration is a separate optional model feature. Review the enabled features, provider, and data flow before using either with sensitive work.",
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
        desc: "A stored snapshot at export",
        page: "overview",
        hash: "reports",
      },
      "a-rules": {
        type: "anchor",
        label: "Rules engine",
        desc: "Attribution with reviewable rules",
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
        seoTitle: "Constellation — multi-client project planning",
        tagline: "Know what to work on next, across every client.",
        summary:
          "Explore Constellation, a multi-client planning tool with a ranked work queue, plan branches, delivery forecasts, and a read-only client portal.",
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
        next: "helm",
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
  {
    id: "helm",
    initials: "HM",
    name: "Helm",
    desc: "One decision at a time, every client and agent",
    status: "client operations · 2026",
    accent: "#ff6b3d",
    accentInk: "#b4471f",
    groups: [
      { title: "Project", items: ["overview"] },
      {
        title: "Features",
        items: ["a-deck", "a-client", "a-rules", "a-voice", "a-settings", "a-setup"],
      },
    ],
    items: {
      overview: {
        type: "showcase",
        label: "Overview",
        desc: "One decision at a time, every client and agent",
        seoTitle: "Helm — one decision at a time across every client and AI agent",
        tagline: "One decision at a time, across every client and every agent.",
        summary:
          "Helm, designed and built end to end: one deck of decisions drawn from every client’s email and Slack and every agent run across Claude, OpenAI and Grok, a board and concierge for each client, plain-language rules that keep every client hearing from you, and people, voice and access set up once per client.",
        cover: {
          src: "/showcase/helm/cover.webp",
          alt: "Helm’s deck: projects as rings across the top, one decision card in the middle with a drafted client update, and running agents in a dock below",
        },
        stack: [
          "Next.js",
          "React",
          "TypeScript",
          "Zod",
          "PostgreSQL",
          "Background jobs",
          "Claude, OpenAI & Grok APIs",
          "GitHub API",
          "Gmail & Slack APIs",
          "Encrypted key vault",
          "Vercel",
          "GitHub Actions CI/CD",
        ],
        tiles: [
          {
            title: "Deck",
            line: "One decision at a time.",
            img: "/showcase/helm/cover.webp",
            target: "deck",
            lead: true,
          },
          {
            title: "Client",
            line: "A board and a concierge.",
            img: "/showcase/helm/client.webp",
            target: "client",
          },
          {
            title: "Rules",
            line: "Written in plain words.",
            img: "/showcase/helm/rules.webp",
            target: "rules",
          },
          {
            title: "People",
            line: "@ anyone, in their voice.",
            img: "/showcase/helm/settings.webp",
            target: "voice",
          },
          {
            title: "Setup",
            line: "Six questions per client.",
            img: "/showcase/helm/setup.webp",
            target: "setup",
          },
          {
            title: "Phone",
            line: "The deck, in one hand.",
            img: "/showcase/helm/phone.webp",
            target: "deck",
            contain: true,
          },
        ],
        sections: [
          {
            id: "deck",
            kicker: "Decisions",
            title: "One decision at a time.",
            line: "Helm reads every client thread and every agent run, then deals you only what needs a person, most urgent first. Answer one and the next is up. Try it.",
            points: [
              "Drafts, failing checks and agent questions, one tap each",
              "Every running agent in the dock, whatever the model",
              "Starting work puts a new agent in the dock",
            ],
            media: {
              frag: "deck",
              poster: { src: "/showcase/helm/deck-poster.webp", width: 520, height: 431 },
            },
          },
          {
            id: "client",
            kicker: "Client view",
            title: "Dive into any client.",
            line: "A board of what they asked for, what’s building, what’s in review and what shipped, with Helm’s suggestions beside it in priority order.",
            points: [
              "Suggestions that move the board when you act",
              "This week’s update rhythm at a glance",
              "Ask anything about the client",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/helm/client.webp",
                  alt: "Kestrel Labs client view: a board of asked-for, building, review and shipped work, with Helm’s prioritised suggestions beside it",
                  width: 1440,
                  height: 740,
                },
              ],
            },
          },
          {
            id: "rules",
            kicker: "Rules",
            title: "Rules you write in plain words.",
            line: "Say it the way you’d say it. Helm asks only what it needs, writes the rule out and shows exactly which days it will step in. Try it.",
            points: [
              "When, what counts, then, always",
              "A two-week preview before it’s on",
              "Nothing sends without your review",
            ],
            media: {
              frag: "rule",
              poster: { src: "/showcase/helm/rule-poster.webp", width: 520, height: 574 },
            },
          },
          {
            id: "voice",
            kicker: "People & voice",
            title: "The right person, in their voice.",
            line: "@ anyone at a client and Helm knows how they like to hear from you: the channel, the tone, what they get. Try it.",
            points: [
              "@ mentions for everyone at every client",
              "Channel and tone per person",
              "Learns from what you’ve already sent",
            ],
            media: {
              frag: "voice",
              poster: { src: "/showcase/helm/voice-poster.webp", width: 480, height: 432 },
            },
          },
          {
            id: "settings",
            kicker: "Client settings",
            title: "Everything about a client, in one place.",
            line: "People, channels and quiet hours, voice, scoped access keys, rules and docs, set once and used by every agent that works for them.",
            points: [
              "Keys scoped per client, rotated in place",
              "Quiet hours in the client’s time zone",
              "Briefs and contracts the agents can read",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/helm/settings.webp",
                  alt: "Client settings for Kestrel Labs: people with their channel and tone, and an @ mention picker suggesting Jordan and Josie",
                  width: 1440,
                  height: 500,
                },
              ],
            },
          },
          {
            id: "setup",
            kicker: "Onboarding",
            title: "Add a client in six questions.",
            line: "Who they are, how they talk, who you write to, how you sound, what Helm can touch and any rules, one card at a time.",
            points: [
              "Channels, with one marked primary",
              "People added by @handle",
              "Access connected as you go",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/helm/setup.webp",
                  alt: "Adding a client, step two of six: how do they talk? Email marked primary, Slack on",
                  width: 1440,
                  height: 800,
                },
              ],
            },
          },
        ],
        faq: [
          {
            q: "Why one decision at a time instead of a dashboard?",
            a: "Because a dashboard leaves the sorting to you. Helm ranks what needs a person (an update you promised, an agent waiting on an answer, a failing check) and shows one at a time, so you clear the morning instead of scanning it.",
          },
          {
            q: "How does it decide what comes first?",
            a: "Promised update rhythms that are due, agents blocked on a question, failing checks, how long a client has gone without hearing from you, and how big the engagement is.",
          },
          {
            q: "Which AI agents does it work with?",
            a: "Claude, OpenAI and Grok in the cloud, and agents running on your own machine. Every run shows its model, and you can hand a session to a different model without losing the conversation or the sandbox.",
          },
          {
            q: "Does it ever message a client on its own?",
            a: "Only if a rule you wrote says so. By default Helm drafts and you send, and either way it respects each client’s quiet hours.",
          },
          {
            q: "Where do client keys live?",
            a: "Scoped per client, encrypted at rest and never shown in full. Each key says what it can touch and when it was last used, and rotates in place.",
          },
        ],
        builtBy: {
          personal: `${PH.NAME}, designed and built end to end. It’s how I’d build your product, too.`,
          fst: "Full Stack Technologies, LLC, designed and built end to end. It’s how we’d build your product, too.",
        },
        next: "nemo",
      },
      "a-deck": {
        type: "anchor",
        label: "The deck",
        desc: "One decision at a time",
        page: "overview",
        hash: "deck",
      },
      "a-client": {
        type: "anchor",
        label: "Client view",
        desc: "A board and a concierge",
        page: "overview",
        hash: "client",
      },
      "a-rules": {
        type: "anchor",
        label: "Rules",
        desc: "Written in plain words",
        page: "overview",
        hash: "rules",
      },
      "a-voice": {
        type: "anchor",
        label: "People & voice",
        desc: "@ anyone, in their voice",
        page: "overview",
        hash: "voice",
      },
      "a-settings": {
        type: "anchor",
        label: "Client settings",
        desc: "Keys, channels, docs",
        page: "overview",
        hash: "settings",
      },
      "a-setup": {
        type: "anchor",
        label: "Onboarding",
        desc: "Six questions per client",
        page: "overview",
        hash: "setup",
      },
    },
  },
  {
    id: "nemo",
    initials: "NE",
    name: "Nemo",
    desc: "Your AI identities, portable to any model",
    status: "AI memory · 2026",
    accent: "#8979e4",
    accentInk: "#624bbc",
    groups: [
      { title: "Project", items: ["overview"] },
      {
        title: "Features",
        items: ["a-launch", "a-import", "a-knows", "a-growth", "a-kits", "a-launches"],
      },
    ],
    items: {
      overview: {
        type: "showcase",
        label: "Overview",
        desc: "Your AI identities, portable to any model",
        seoTitle: "Nemo — your AI memory, as identities you can take into any model",
        tagline: "Your AI memory, kept in one place and carried into any model.",
        summary:
          "Nemo, designed and built end to end: it imports your ChatGPT, Claude, Gemini and Grok history, distills it into identities for the people, companies and projects you talk about, and assembles a compact copy of any of them to launch into whichever model you choose. What you learn there comes back as new memories, and everything stays encrypted on your device.",
        cover: {
          src: "/showcase/nemo/identity.webp",
          alt: "Nemo’s identity page for a studio: memories, launches and context size, a health line, what Nemo knows grouped into pricing, pipeline, hiring and positioning, and a portable-context card with a Launch button",
        },
        stack: [
          "Next.js",
          "React",
          "TypeScript",
          "Zod",
          "Claude, OpenAI, Gemini & Grok APIs",
          "Conversation export parsing",
          "On-device encryption",
          "Vercel",
          "GitHub Actions CI/CD",
        ],
        tiles: [
          {
            title: "Identity",
            line: "Who and what Nemo knows.",
            img: "/showcase/nemo/identity.webp",
            target: "knows",
            lead: true,
          },
          {
            title: "Knows",
            line: "Understanding, not storage.",
            img: "/showcase/nemo/understanding.webp",
            target: "knows",
          },
          {
            title: "Growth",
            line: "Sharper every month.",
            img: "/showcase/nemo/lifecycle.webp",
            target: "growth",
          },
          {
            title: "Kits",
            line: "Context packaged for a job.",
            img: "/showcase/nemo/launch-kits.webp",
            target: "kits",
          },
          {
            title: "Launches",
            line: "Where it went, what came back.",
            img: "/showcase/nemo/launch-log.webp",
            target: "launches",
          },
          {
            title: "Launch",
            line: "Into any model.",
            img: "/showcase/nemo/assemble-poster.webp",
            target: "launch",
            contain: true,
          },
        ],
        sections: [
          {
            id: "launch",
            kicker: "Assemble & launch",
            title: "Take an identity into any model.",
            line: "Pick identities, kits and documents, watch them compress into one small package, then launch into ChatGPT, Claude, Gemini or Grok. What you learn there comes back to Nemo. Try it.",
            points: [
              "Hundreds of thousands of tokens of history, sent as a few thousand",
              "Any model, and any version of it",
              "New learning reviewed before it’s kept",
            ],
            media: {
              frag: "launch",
              poster: { src: "/showcase/nemo/assemble-poster.webp", width: 566, height: 821 },
            },
          },
          {
            id: "import",
            kicker: "Import",
            title: "Bring your AI history with you.",
            line: "Connect ChatGPT, Claude, Gemini or Grok, or drop an export. Nemo reads every conversation, distills the facts worth keeping and sorts them into identities. Try it.",
            points: [
              "Conversations, memories and identities, counted as they land",
              "Processed and encrypted on your device",
              "Or drop in an export file",
            ],
            media: {
              frag: "import",
              poster: { src: "/showcase/nemo/import-poster.webp", width: 540, height: 458 },
            },
          },
          {
            id: "knows",
            kicker: "Identities",
            title: "What Nemo knows, in plain words.",
            line: "Each identity opens with Nemo’s own read of a person, company or project, then the themes it has pieced together, each with how many memories back it and which model they came from.",
            points: [
              "A summary, not a list of facts",
              "Every theme traced to its sources",
              "Goals and preferences kept beside it",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/nemo/understanding.webp",
                  alt: "What Nemo knows about a studio: a paragraph summary, four themes (pricing and terms, pipeline, hiring, positioning) and a portable-context card showing 5.1k tokens, 33 times smaller than the raw history",
                  width: 1136,
                  height: 480,
                },
              ],
            },
          },
          {
            id: "growth",
            kicker: "Lifecycle",
            title: "An identity that keeps getting sharper.",
            line: "Every month Nemo shows what an identity gained, who it connects to, and a timeline of what it learned, refined, imported and built, so you can see how it got here.",
            points: [
              "A monthly recap of new memories, conversations and launches",
              "Relationships written as a sentence",
              "A health line that says when one is going stale",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/nemo/lifecycle.webp",
                  alt: "Identity improved this month: 18 memories, 9 conversations, 2 documents and 6 launches added, the studio connected to its founder and its product, and a learning timeline from today back to earlier in May",
                  width: 774,
                  height: 745,
                },
              ],
            },
          },
          {
            id: "kits",
            kicker: "Launch kits",
            title: "Context packaged for the job.",
            line: "Nemo suggests kits from what it knows: the identity, the right memories, a few conversations and the documents that matter, built for a strategy review or a client proposal.",
            points: [
              "Suggested from each identity",
              "Shows exactly what goes in",
              "Built in one click when it isn’t there yet",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/nemo/launch-kits.webp",
                  alt: "Suggested launch kits for a studio: Business Strategy Review and Mobile Delivery Context already in Nemo, and Client Proposal Assistant ready to build",
                  width: 774,
                  height: 490,
                },
              ],
            },
          },
          {
            id: "launches",
            kicker: "Launches",
            title: "Where it went, and what came back.",
            line: "Every launch is logged with the model and version it went to and the learning it brought back, beside the conversations the identity was built from.",
            points: [
              "Each launch tagged with its model",
              "Captured learning shown inline",
              "Source conversations kept as reference",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/nemo/launch-log.webp",
                  alt: "Conversations, documents and launches for a studio: a launch into Claude Opus 4.5 that captured a move to fixed-bid pricing, and a launch into ChatGPT with no new learning",
                  width: 774,
                  height: 690,
                },
              ],
            },
          },
        ],
        faq: [
          {
            q: "Why identities instead of one big memory?",
            a: "Because you rarely want everything at once. An identity is a person, a company or a project, so you can bring exactly the context a conversation needs and leave the rest at home.",
          },
          {
            q: "Which models does it work with?",
            a: "It imports from ChatGPT, Claude, Gemini and Grok, or from an export file, and launches into any of them, down to the model version.",
          },
          {
            q: "How does the context get so small?",
            a: "Nemo sends what it has distilled (the summary, the memories and the key conversations) instead of raw transcripts, so years of history travel as a few thousand tokens.",
          },
          {
            q: "Where does my data live?",
            a: "On your device, encrypted. A launch sends a copy of what you chose into the model; the identity itself stays in Nemo.",
          },
          {
            q: "How does it learn from a launch?",
            a: "When you come back, Nemo shows what it picked up from that conversation. You keep or dismiss each item before it’s added to an identity.",
          },
        ],
        builtBy: {
          personal: `${PH.NAME}, designed and built end to end. It’s how I’d build your product, too.`,
          fst: "Full Stack Technologies, LLC, designed and built end to end. It’s how we’d build your product, too.",
        },
        next: "snakenfriends",
      },
      "a-launch": {
        type: "anchor",
        label: "Assemble & launch",
        desc: "Into any model",
        page: "overview",
        hash: "launch",
      },
      "a-import": {
        type: "anchor",
        label: "Import",
        desc: "Your AI history, on device",
        page: "overview",
        hash: "import",
      },
      "a-knows": {
        type: "anchor",
        label: "Identities",
        desc: "What Nemo knows",
        page: "overview",
        hash: "knows",
      },
      "a-growth": {
        type: "anchor",
        label: "Lifecycle",
        desc: "Sharper every month",
        page: "overview",
        hash: "growth",
      },
      "a-kits": {
        type: "anchor",
        label: "Launch kits",
        desc: "Context packaged for a job",
        page: "overview",
        hash: "kits",
      },
      "a-launches": {
        type: "anchor",
        label: "Launches",
        desc: "Where it went, what came back",
        page: "overview",
        hash: "launches",
      },
    },
  },
  {
    id: "snakenfriends",
    initials: "SN",
    name: "Snake n Friends",
    desc: "Classic snake, rebuilt for head-to-head play",
    status: "mobile game · 2026",
    accent: "#59f425",
    accentInk: "#2b8a0e",
    groups: [
      { title: "Project", items: ["overview"] },
      {
        title: "Features",
        items: ["a-grid", "a-sectors", "a-arena", "a-friends"],
      },
    ],
    items: {
      overview: {
        type: "showcase",
        label: "Overview",
        desc: "Classic snake, rebuilt for head-to-head play",
        seoTitle: "Snake n Friends — a mobile snake game with a campaign and ranked 1v1",
        tagline: "Classic snake, rebuilt for a phone and played head to head.",
        summary:
          "Snake n Friends, designed and built end to end: a mobile snake game with a 60-sector campaign and a 1v1 arena where friends and strangers play best-of series for skill rating. Firewalls, glitches and decoy cores make every grid a puzzle, and every run is replayed on the server from its seed and inputs before the score counts.",
        cover: {
          src: "/showcase/snakenfriends/cover.webp",
          alt: "The Snake n Friends pixel logo beside three phone screens: the sector map, a game grid with the snake and a core, and a head-to-head arena with game history",
        },
        stack: [
          "Expo",
          "React Native",
          "TypeScript",
          "React Native Skia",
          "Reanimated",
          "Expo Router",
          "Firebase Auth & Firestore",
          "Cloud Functions",
          "RevenueCat",
          "App Store Connect API",
          "react-i18next",
          "Sentry",
          "EAS Build",
        ],
        tiles: [
          {
            title: "The grid",
            line: "Steer, eat, don’t crash.",
            img: "/showcase/snakenfriends/cover.webp",
            target: "grid",
            lead: true,
          },
          {
            title: "Sectors",
            line: "Sixty levels, three stars each.",
            img: "/showcase/snakenfriends/sectors.webp",
            target: "sectors",
            contain: true,
          },
          {
            title: "Arena",
            line: "Best-of series, 1v1.",
            img: "/showcase/snakenfriends/arena.webp",
            target: "arena",
            contain: true,
          },
          {
            title: "Home",
            line: "Rewards, challenges, play.",
            img: "/showcase/snakenfriends/home.webp",
            target: "friends",
            contain: true,
          },
          {
            title: "In game",
            line: "Score, stars, touch controls.",
            img: "/showcase/snakenfriends/game.webp",
            target: "grid",
            contain: true,
          },
          {
            title: "Replay check",
            line: "Every run, re-simulated.",
            img: "/showcase/snakenfriends/grid-poster.webp",
            target: "grid",
            contain: true,
          },
        ],
        sections: [
          {
            id: "grid",
            kicker: "The grid",
            title: "A game you can check.",
            line: "The engine is a seeded, tick-based simulation: a run is its seed plus the turns you made. Firewalls flash a warning before they go live. Play a round and watch it get replayed. Try it.",
            points: [
              "The same seed always produces the same grid",
              "The server re-runs every run before the score counts",
              "Drawn on a Skia canvas, glows and all",
            ],
            media: {
              frag: "grid",
              poster: { src: "/showcase/snakenfriends/grid-poster.webp", width: 340, height: 533 },
            },
          },
          {
            id: "sectors",
            kicker: "Campaign",
            title: "Sixty sectors, one at a time.",
            line: "The campaign climbs through easy, medium, hard and expert tiers. Each sector has its own firewall layout, earns up to three stars, and unlocks the next.",
            points: [
              "Firewalls, glitches and decoy cores raise the stakes",
              "Stars and best scores saved to your account",
              "Seasons with a live countdown",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/snakenfriends/sectors.webp",
                  alt: "The sector map for season 1: Grid Engine cleared with three stars, Byte Lane highlighted as the current sector, and Circuit Path, Node Zero and Pulse Gate locked",
                  width: 780,
                  height: 1696,
                },
              ],
            },
          },
          {
            id: "arena",
            kicker: "Arena",
            title: "Head to head, a game at a time.",
            line: "Challenge a friend with an invite code or get matched by rank, then play a series of games in the same arena. Ranked games move your skill rating from Bronze up to Iridescent and the Top 250.",
            points: [
              "Wins, score and rating change for both players",
              "Ranked and casual games in one series",
              "Matchmaking within your rank band",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/snakenfriends/arena.webp",
                  alt: "An arena between two players: 2 wins to 3, scores 7 to 11, a 32-point rating gain, a Start game button for game 6, and the history of games 1 to 5",
                  width: 780,
                  height: 1688,
                },
              ],
            },
          },
          {
            id: "friends",
            kicker: "Friends & rewards",
            title: "Reasons to come back tomorrow.",
            line: "Daily rewards and challenges sit one tap from Play. Playing a friend every day builds a streak with milestone rewards, and calling cards, themes and power-ups fill out your loadout.",
            points: [
              "Friend streaks with milestone rewards",
              "Calling cards on weekly, monthly and seasonal rotation",
              "In-app purchases granted on the server, once",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/snakenfriends/home.webp",
                  alt: "The home screen: player name and sector, a 6 of 180 star count, the pixel logo, Rewards and Challenges buttons, and a large Play button above the Home, Sectors, Arena and Store tabs",
                  width: 780,
                  height: 1688,
                },
              ],
            },
          },
        ],
        faq: [
          {
            q: "How do you keep scores honest?",
            a: "The game engine is deterministic. The app sends a run’s seed and inputs, and a Cloud Function replays them on the same engine. The score that counts is the one the server gets.",
          },
          {
            q: "How do arena games work?",
            a: "Two players share an arena and play a series of games in it. Each game is settled on the server, and ranked games adjust both players’ skill rating with an Elo-style formula.",
          },
          {
            q: "Why Skia instead of plain React Native views?",
            a: "The grid redraws every tick with glows, particles and shaders. Skia draws it on a GPU-backed canvas, and Reanimated runs the animation off the JavaScript thread, so effects don’t wait on game logic.",
          },
          {
            q: "How are purchases handled?",
            a: "RevenueCat handles the store. The app asks a Cloud Function to grant the item, and the store’s webhook is a backstop; both write to one ledger, so a purchase is never granted twice.",
          },
          {
            q: "Which languages does it support?",
            a: "Nine: English, Spanish, French, German, Portuguese, Japanese, Korean, Chinese and Arabic.",
          },
        ],
        builtBy: {
          personal: `${PH.NAME}, designed and built end to end. It’s how I’d build your product, too.`,
          fst: "Full Stack Technologies, LLC, designed and built end to end. It’s how we’d build your product, too.",
        },
        next: "coverly",
      },
      "a-grid": {
        type: "anchor",
        label: "The grid",
        desc: "Play a replayable run",
        page: "overview",
        hash: "grid",
      },
      "a-sectors": {
        type: "anchor",
        label: "Campaign",
        desc: "Sixty sectors, three stars each",
        page: "overview",
        hash: "sectors",
      },
      "a-arena": {
        type: "anchor",
        label: "Arena",
        desc: "Ranked 1v1 series",
        page: "overview",
        hash: "arena",
      },
      "a-friends": {
        type: "anchor",
        label: "Friends & rewards",
        desc: "Streaks, cards and loadouts",
        page: "overview",
        hash: "friends",
      },
    },
  },
  {
    id: "coverly",
    initials: "CO",
    name: "Coverly",
    desc: "Every insurance policy, readable and answerable",
    status: "insurance · 2026",
    accent: "#3b82f6",
    accentInk: "#1d4ed8",
    groups: [
      { title: "Project", items: ["overview"] },
      {
        title: "Features",
        items: ["a-extract", "a-ask", "a-wallet", "a-plain", "a-renewal"],
      },
    ],
    items: {
      overview: {
        type: "showcase",
        label: "Overview",
        desc: "Every insurance policy, readable and answerable",
        seoTitle: "Coverly — every insurance policy in one place, with answers on demand",
        tagline: "Every policy. One place. Answers on demand.",
        summary:
          "Coverly, designed and built end to end: a mobile wallet for home, auto, health, life and pet insurance. It reads a declarations page into fields you confirm, explains each policy in plain English, and answers coverage questions with a quote from the page it came from, then tells you who to call and what to say.",
        cover: {
          src: "/showcase/coverly/cover.webp",
          alt: "The Coverly shield and wordmark beside three phone screens: a wallet of home, pet and auto policy passes, a plain-English answer about a kitchen-sink leak citing page 14 of the home policy, and an auto policy’s detail page",
        },
        stack: [
          "Expo",
          "React Native",
          "TypeScript",
          "Expo Router",
          "Claude API",
          "Document extraction",
          "Camera & PDF capture",
          "On-device encryption",
          "Face ID",
          "Push notifications",
          "RevenueCat",
          "EAS Build",
        ],
        tiles: [
          {
            title: "Wallet",
            line: "Every policy, one stack.",
            img: "/showcase/coverly/cover.webp",
            target: "wallet",
            lead: true,
          },
          {
            title: "Add a policy",
            line: "Read in, checked by you.",
            img: "/showcase/coverly/review.webp",
            target: "extract",
            contain: true,
          },
          {
            title: "Ask",
            line: "Answers that cite the page.",
            img: "/showcase/coverly/answer.webp",
            target: "ask",
            contain: true,
          },
          {
            title: "Plain English",
            line: "What you’re actually covered for.",
            img: "/showcase/coverly/detail.webp",
            target: "plain",
            contain: true,
          },
          {
            title: "Renewals",
            line: "Thirty days’ notice.",
            img: "/showcase/coverly/renewal.webp",
            target: "renewal",
            contain: true,
          },
        ],
        sections: [
          {
            id: "extract",
            kicker: "Add a policy",
            title: "From paperwork to fields you can check.",
            line: "Upload a PDF, scan the paper or forward the email. Coverly reads the declarations page field by field, then hands it back for review, with anything it’s less sure of marked in amber. Try it.",
            points: [
              "Carrier, limits, deductible, premium, renewal and contacts",
              "Lower-confidence fields flagged for a second look",
              "Nothing is saved until you confirm",
            ],
            media: {
              frag: "extract",
              poster: { src: "/showcase/coverly/extract-poster.webp", width: 360, height: 363 },
            },
          },
          {
            id: "ask",
            kicker: "Ask Coverly",
            title: "Answers that show their source.",
            line: "Ask a plain question across every policy. The answer names the policy it used, quotes the language and page, pulls out the numbers that matter and, for a claim, gives you the number to call and what to say. Try it.",
            points: [
              "Every answer cites your own documents",
              "Deductibles and limits pulled out as numbers",
              "A script ready for the claims call",
            ],
            media: {
              frag: "ask",
              poster: { src: "/showcase/coverly/ask-poster.webp", width: 360, height: 424 },
            },
          },
          {
            id: "wallet",
            kicker: "Wallet",
            title: "Every policy in one stack.",
            line: "Policies sit together like passes in a wallet, each in its own color, with the next renewal and the total yearly premium at the top. The one renewing soonest opens first, with its claims line one tap away.",
            points: [
              "Home, auto, health, life and pet side by side",
              "Total premium across every policy",
              "Call claims straight from the pass",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/coverly/wallet.webp",
                  alt: "Your wallet: three policies totalling $3,508 a year, stacked passes for Cascade Mutual home and HappyTails pet, and an open Meridian auto pass renewing in 26 days with its policy number and a Call claims button",
                  width: 780,
                  height: 1688,
                },
              ],
            },
          },
          {
            id: "plain",
            kicker: "Plain English",
            title: "What you’re covered for, in a paragraph.",
            line: "Each policy opens with a short explanation of what it pays for and what you pay first, then the four numbers worth knowing, the claims line, your agent and the original document.",
            points: [
              "A summary written for people, not underwriters",
              "How far through the policy year you are",
              "The original document kept alongside",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/coverly/detail.webp",
                  alt: "Meridian auto policy detail: renews in 26 days, a plain-English summary of liability, collision and theft coverage after a $500 deductible, key numbers, the claims line and the agent",
                  width: 780,
                  height: 1688,
                },
              ],
            },
          },
          {
            id: "renewal",
            kicker: "Renewals",
            title: "No more surprise auto-charges.",
            line: "Thirty days before a policy renews, Coverly says when and how much will be charged, so there’s time to review the coverage or shop for quotes.",
            points: [
              "A reminder for every policy",
              "The amount, not just the date",
              "Opens straight to the policy",
            ],
            media: {
              imgs: [
                {
                  src: "/showcase/coverly/renewal.webp",
                  alt: "A lock-screen notification from Coverly: the Meridian auto policy renews July 28 and will auto-charge $1,320, with a Review policy button",
                  width: 780,
                  height: 1688,
                },
              ],
            },
          },
        ],
        faq: [
          {
            q: "How does Coverly read a policy?",
            a: "From the declarations page: the summary page every policy has. AI pulls out the carrier, policy number, limits, deductible, premium, renewal date and contacts, then shows you every field to check. Fields it is less sure of are marked, and nothing is saved until you confirm.",
          },
          {
            q: "Where do the answers come from?",
            a: "Only from your own documents. Each answer names the policy it used and quotes the language and page, so you can check it yourself. It’s guidance, not a coverage decision; your carrier still decides claims.",
          },
          {
            q: "What does it cost?",
            a: "The free plan holds up to three policies and a few questions a month. Pro is $4.99 a month or $39 a year for unlimited policies and questions.",
          },
          {
            q: "What kinds of insurance does it handle?",
            a: "Home, auto, health, life and pet. Each gets its own pass in the wallet, its own plain-English summary and its own renewal reminder.",
          },
        ],
        builtBy: {
          personal: `${PH.NAME}, designed and built end to end. It’s how I’d build your product, too.`,
          fst: "Full Stack Technologies, LLC, designed and built end to end. It’s how we’d build your product, too.",
        },
        next: "paradox",
      },
      "a-extract": {
        type: "anchor",
        label: "Add a policy",
        desc: "Read in, checked by you",
        page: "overview",
        hash: "extract",
      },
      "a-ask": {
        type: "anchor",
        label: "Ask Coverly",
        desc: "Answers that cite the page",
        page: "overview",
        hash: "ask",
      },
      "a-wallet": {
        type: "anchor",
        label: "Wallet",
        desc: "Every policy in one stack",
        page: "overview",
        hash: "wallet",
      },
      "a-plain": {
        type: "anchor",
        label: "Plain English",
        desc: "What you’re covered for",
        page: "overview",
        hash: "plain",
      },
      "a-renewal": {
        type: "anchor",
        label: "Renewals",
        desc: "Thirty days’ notice",
        page: "overview",
        hash: "renewal",
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
  STATUS_LINE: "App ideas to production · AI-assisted · engineer-led",
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
    { title: "Resources", items: ["go-services", "go-blog", "go-ai", "go-prompts"] },
    {
      title: "Work",
      items: [
        "go-paradox",
        "go-timetrack",
        "go-constellation",
        "go-helm",
        "go-nemo",
        "go-snakenfriends",
        "go-coverly",
      ],
    },
  ],
  items: {
    about: {
      label: "About",
      type: "page",
      desc: "Take your app idea or AI prototype into production with clear scope, hands-on engineering, and practical AI guidance.",
      sections: [
        {
          paras: [
            `${FST.LEGAL} helps founders take app ideas and AI prototypes into production. Work directly with ${PH.NAME}, a hands-on engineer with ${PH.YEARS}+ years of experience, based in Saint Petersburg, Florida.`,
            "Bring what you have: a sketch, a working demo, or an app that's stuck before launch. We can review it, build the first useful release, or help you learn to develop it with AI. Start with one user journey and a clear definition of what needs to work.",
          ],
          links: [
            { label: "Review my app or prototype", href: "/services/codebase-rescue" },
            { label: "Build a first production release", href: "/services/product-development" },
            { label: "Help me build with AI", href: "/services/ai-development-coaching" },
          ],
        },
        {
          heading: "The work speaks first",
          paras: [
            "The left rail is real work — seven products designed and built end to end: Paradox, a storytelling platform built around interactive data; Timetrack, time tracking for the age of AI; Constellation, prioritization and planning across every client; Helm, one decision at a time across every client and AI agent; Nemo, your AI identities, portable to any model; Snake n Friends, a mobile snake game played head to head; and Coverly, every insurance policy in one place with answers on demand. The components inside are live: click through any of them.",
          ],
          links: [
            {
              label: "Inside Timetrack: records, reports, and decisions you can check",
              href: "/blog/timetrack-session-reporting",
            },
          ],
        },
        {
          heading: "AI is part of the process. So is engineering judgment.",
          paras: [
            "We use AI openly to reduce repetitive work and test ideas sooner. Nicholas directs the work and reviews the result, including data access, failure handling, testing, and deployment. A quick demo is a starting point; a release needs evidence that the important behavior works.",
            "We agree on scope, accounts, tool costs, and handoff before work starts. You'll know which tools we use, what access they need, and what we'll check before a change reaches your users.",
          ],
          links: [{ label: "How we handle AI tools, usage, and costs", href: "/ai/resources" }],
        },
        {
          heading: "What are you trying to launch?",
          cta: "message",
          ctaLabel: "Discuss your app →",
          paras: [
            "Tell us who it's for, what works today, and what's stopping the launch. Include any deadline or budget boundary. You don't need a finished specification to start the conversation.",
          ],
        },
      ],
    },
    services: {
      label: "Services",
      type: "page",
      title: "Help for your next app release",
      seoTitle: "App development, prototype review, and AI coaching",
      desc: "Choose a prototype review, first production release, hands-on AI coaching, or continuing technical leadership for your app.",
      sections: [
        {
          heading: "Build a first production release",
          paras: [
            "Turn an idea, design, or prototype into a complete user journey. Define the scope, build and review working software, then prepare deployment and handoff around the behavior your first users need.",
          ],
          links: [{ label: "Explore app development", href: "/services/product-development" }],
        },
        {
          heading: "Review an app or AI prototype",
          paras: [
            "Find out what stands between your demo and a usable release. Get findings ordered by launch risk, a recommendation on what to keep or repair, and a scoped next step. Existing applications with recurring failures fit here too.",
          ],
          links: [
            {
              label: "Explore prototype review and codebase rescue",
              href: "/services/codebase-rescue",
            },
          ],
        },
        {
          heading: "Learn to build with AI",
          paras: [
            "Get your tools and repository set up, turn your idea into a reviewable task, and work through a real change together. Learn how to inspect, test, and maintain the result, with guidance that fits your experience.",
          ],
          links: [
            { label: "Explore AI development coaching", href: "/services/ai-development-coaching" },
          ],
        },
        {
          heading: "Fractional CTO",
          paras: [
            "Work through architecture, hiring, vendor choices, and delivery priorities with a technical partner who can also implement the decisions. Agree on availability, decision ownership, and hands-on responsibilities.",
          ],
          links: [{ label: "Explore technical leadership", href: "/services/fractional-cto" }],
        },
      ],
    },
    engagements: {
      label: "Engagements",
      type: "page",
      title: "From your first conversation to a working release",
      seoTitle: "App project scope, delivery, and handoff",
      desc: "Agree on a useful first release, AI tools and costs, review checkpoints, deployment, and ownership before starting your app project.",
      sections: [
        {
          heading: "1 · Conversation",
          paras: [
            "Talk through your intended users, what you've built, and what's blocking progress. A conversation establishes fit; an app with unknown risks may need a bounded review before a reliable build estimate is possible.",
          ],
        },
        {
          heading: "2 · Agree on the next useful outcome",
          paras: [
            "Write down deliverables, acceptance criteria, assumptions, exclusions, and pricing. Use a focused review when uncertainty is high; agree on a defined build milestone once the important unknowns are understood. State how changes to scope will be handled.",
            "Agree on the AI tools, project data access, account ownership, usage costs, spending approvals, and any third-party services before work starts. Set handoff and maintenance expectations at the same time.",
          ],
        },
        {
          heading: "3 · Build in the open",
          paras: [
            "Review working software at agreed checkpoints. Use those reviews to confirm behavior, resolve questions, and make any change in scope explicit before it changes the schedule.",
          ],
          links: [
            {
              label: "A concrete example: Timetrack's reporting decisions",
              href: "/blog/timetrack-session-reporting",
            },
          ],
        },
        {
          heading: "4 · Launch & handoff",
          paras: [
            "Check the agreed user journey, permissions, failure cases, deployment, and recovery process. Record what is verified and any remaining limits. Hand over the agreed repository and account access, setup and operating notes, and support responsibilities. A client should know how to continue without depending on undocumented knowledge.",
          ],
        },
      ],
    },
    "straight-answers": {
      label: "Straight answers",
      type: "page",
      title: "Working with Full Stack Technologies: common questions",
      seoTitle: "Software development pricing, ownership, and fit",
      desc: "Answers for founders about AI prototypes, delivery costs, code ownership, learning to build, and support after launch.",
      sections: [
        {
          heading: "“What does it cost?”",
          paras: [
            "The quote depends on scope, technical uncertainty, integrations, and ongoing responsibilities. Defined deliverables can be quoted as a fixed scope; embedded or ongoing work needs terms that reflect the work. We agree on pricing before starting.",
          ],
        },
        {
          heading: "“Do you use AI to build my app?”",
          paras: [
            `Yes. ${PH.NAME} uses AI for planning, implementation, and review, and takes responsibility for the engineering work. We agree on tool access and costs, inspect the generated changes, and check the behavior your release needs.`,
            "AI can reduce repetitive work and shorten feedback cycles. The quote accounts for design, integrations, review, testing, and operation, with the tools and their costs agreed before work starts.",
          ],
        },
        {
          heading: "“Who's a good fit?”",
          paras: [
            "Founders with an app idea or prototype, a clear user problem, and a need for hands-on help getting to a useful release. You can be technical or nontechnical. Bring your constraints and a willingness to choose a focused first scope.",
          ],
        },
        {
          heading: "“Who owns the code?”",
          paras: [
            "We agree on ownership, repository and hosting access, and handoff in the written scope. Client-controlled accounts are worth discussing from the start. Third-party software, assets, and services retain their own licenses and terms; a custom build does not remove those dependencies.",
          ],
        },
        {
          heading: "“Can you work with my AI-built prototype?”",
          paras: [
            "Yes. We review what it does, how it handles data, and what can be retained. The result may be a focused repair, a partial replacement, or further investigation. A rewrite is a decision to justify, not the default starting point.",
          ],
          links: [
            {
              label: "What changes between prototype and production",
              href: "/blog/ai-prototype-to-production",
            },
          ],
        },
        {
          heading: "“Can you show me how to build it myself?”",
          paras: [
            "We can make learning part of the engagement: tool and repository setup, a real task worked through together, and the checks needed to understand the result. Agree on a learning goal that matches your experience and the risk of the project.",
          ],
          links: [
            {
              label: "Hands-on AI development coaching",
              href: "/services/ai-development-coaching",
            },
          ],
        },
        {
          heading: "“What happens after launch?”",
          paras: [
            "Agree on maintenance, support availability, hosting and API costs, and who handles incidents before starting. A handoff should cover deployment, access, backups where needed, and recovery. Ongoing support is a defined engagement, not an unstated promise of unlimited availability.",
          ],
        },
      ],
    },
    "go-ai": {
      type: "ws",
      label: "AI playbook",
      desc: "AI across the delivery lifecycle",
      ws: "ai",
    },
    "go-prompts": {
      type: "ws",
      label: "Prompt library",
      desc: "Prompts and when to use them",
      ws: "prompts",
    },
    "go-services": {
      type: "ws",
      label: "Services",
      desc: "Ways to work together",
      ws: "services",
    },
    "go-blog": {
      type: "ws",
      label: "Blog",
      desc: "Practical product engineering guides",
      ws: "blog",
    },
    "go-paradox": PERSONAL_HOME.items["go-paradox"],
    "go-timetrack": PERSONAL_HOME.items["go-timetrack"],
    "go-constellation": PERSONAL_HOME.items["go-constellation"],
    "go-helm": PERSONAL_HOME.items["go-helm"],
    "go-nemo": PERSONAL_HOME.items["go-nemo"],
    "go-snakenfriends": PERSONAL_HOME.items["go-snakenfriends"],
    "go-coverly": PERSONAL_HOME.items["go-coverly"],
  },
};

const SERVICES: Workspace = {
  id: "services",
  initials: "S",
  name: "Services",
  desc: "App reviews, first releases, and building with AI",
  status: "work together",
  accent: "#f7931e",
  canonicalBrand: "fst",
  groups: [
    {
      title: "Ways to work together",
      items: [
        "product-development",
        "codebase-rescue",
        "ai-development-coaching",
        "fractional-cto",
      ],
    },
  ],
  items: {
    "product-development": {
      type: "page",
      label: "Build your app",
      title: "Take your app idea to a first production release",
      seoTitle: "AI-assisted app development for founders",
      desc: "Build a focused web or mobile app with Nicholas Howell: clear scope, AI-assisted engineering, release checks, deployment, and handoff.",
      sections: [
        {
          heading: "Who this is for",
          paras: [
            "For founders who have a specific problem to solve and need hands-on help putting an app in front of real users. Your starting point can be an idea, designs, an AI-built prototype, or a product with an unfinished workflow.",
            "Work directly with Nicholas Howell through Full Stack Technologies. First, choose the user outcome the release must deliver. If an existing prototype has substantial unknowns, review it before committing to the build scope.",
          ],
        },
        {
          heading: "What the work can include",
          paras: [
            "The agreed release can include product scoping, web or mobile interfaces, backend APIs, data storage, integrations, and deployment. We use AI to assist the work and engineering review to check the result. Choose the parts your app needs instead of buying a larger build by default.",
            "Deliverables should include a complete user journey, checks for important permissions and failures, a deployable revision, and setup and operating notes. Hosting, external services, migration, and maintenance must be included in the scope or called out separately.",
          ],
        },
        {
          heading: "How we define a useful first release",
          paras: [
            "Start with one audience and one repeated task. List the data, permissions, and external systems involved. Separate essential behavior from work that can wait, and write down how we will decide that the release is ready.",
            "You review working software at agreed checkpoints. Handoff should cover the repository, infrastructure access, setup instructions, and maintenance responsibilities.",
          ],
          links: [
            {
              label: "What an AI prototype needs before production",
              href: "/blog/ai-prototype-to-production",
            },
            {
              label: "How to scope the first version of a software product",
              href: "/blog/scope-first-software-release",
            },
            {
              label: "Paradox: onboarding and interactive storytelling",
              href: "/paradox/overview",
            },
          ],
        },
        {
          heading: "Agree on tools, costs, and ownership",
          paras: [
            "Before starting, agree on project accounts, what information AI tools may access, usage charges, repository access, and the handoff. A faster first draft does not remove the work of reviewing, testing, and operating the app. Price the agreed outcome with those responsibilities visible.",
          ],
          links: [{ label: "Our AI tools and cost transparency", href: "/ai/resources" }],
        },
        {
          heading: "Start with the problem",
          paras: [
            "Send a short brief: who the users are, what they need to do, what exists today, and the deadline or budget constraints. That is enough to begin a useful scoping conversation.",
          ],
          cta: "message",
          ctaLabel: "Discuss your app →",
        },
      ],
    },
    "codebase-rescue": {
      type: "page",
      label: "App and prototype review",
      title: "Find out what your app needs before launch",
      seoTitle: "AI prototype review and codebase rescue",
      desc: "Review an AI-built prototype or existing app, identify launch blockers, and plan focused repairs with findings you can act on.",
      sections: [
        {
          heading: "Your demo works. What needs to happen next?",
          paras: [
            "An AI prototype can demonstrate the idea without proving that private data stays private, failed requests are recoverable, or a deployment will work outside your machine. A review helps you decide what is ready, what to keep, and what needs attention before real users depend on it.",
            "This also fits an existing app with recurring bugs, unclear ownership, or fragile deployments. Bring the user journey and next milestone; the goal is a useful release decision rather than a list of cosmetic code changes.",
          ],
        },
        {
          heading: "What a review should examine",
          paras: [
            "Trace an important user journey from the interface to the stored data. Review access controls, input validation, integrations, error handling, and the way changes reach production. Identify where a failed request or deployment could lose data or leave the system inconsistent.",
            "Findings should point to specific behavior and explain the consequence. Separate confirmed defects from concerns that need measurement or access to production evidence.",
          ],
        },
        {
          heading: "What you should get from the review",
          paras: [
            "A written set of findings ordered by launch risk, with evidence, affected behavior, and recommended action. Separate verified defects from questions that need more access or testing. Identify what can stay, what needs repair, and whether a targeted replacement is justified.",
            "Agree on the review boundaries first: repositories, environments, integrations, access, and the journey being examined. A review is not a blanket certification that every part of an app is secure or ready for every scale. The handoff should make those limits clear and propose the next release scope with estimate assumptions.",
          ],
          links: [
            {
              label: "From AI prototype to production: a practical checklist",
              href: "/blog/ai-prototype-to-production",
            },
            {
              label: "Repair or rewrite an existing application?",
              href: "/blog/repair-or-rewrite",
            },
            {
              label: "A practical review checklist for AI-generated code",
              href: "/blog/review-ai-generated-code",
            },
            {
              label: "Inside Timetrack: decisions and checks behind a report",
              href: "/blog/timetrack-session-reporting",
            },
          ],
        },
        {
          heading: "Describe the failure you want solved",
          paras: [
            "Share the symptoms, the affected workflow, the stack, and the next change you need to make. Keep credentials and sensitive customer data out of the initial message.",
          ],
          cta: "message",
          ctaLabel: "Discuss an app review →",
        },
      ],
    },
    "fractional-cto": {
      type: "page",
      label: "Fractional CTO",
      title: "A technical partner for the decisions beyond your first release",
      seoTitle: "Fractional CTO and hands-on support for founders",
      desc: "Work through architecture, app delivery, hiring, and AI workflow decisions with Nicholas Howell, with responsibilities and availability agreed up front.",
      sections: [
        {
          heading: "When technical leadership is the missing piece",
          paras: [
            "You have an app to move forward and decisions that keep coming back: what to build next, which service to buy, whether a prototype can grow, or when to hire. You may need someone to implement the decision as well as help make it.",
            "Nicholas Howell works with founders and engineering teams through Full Stack Technologies. The role can focus on technical direction, hands-on delivery, or a clearly agreed combination.",
          ],
        },
        {
          heading: "What we can work through",
          paras: [
            "Architecture and data decisions, technical due diligence, delivery planning, hiring needs, engineering review practices, and the use of AI coding tools. Start with the decisions that are blocking progress instead of creating a new process for its own sake.",
            "Embedded engineering fits into your existing repository, stack, and review process. Agree on decision ownership, availability, and the deliverables the engagement is meant to produce.",
          ],
        },
        {
          heading: "Define the responsibility before the title",
          paras: [
            "A useful engagement has a specific outcome: a technical plan the team can execute, a risky integration resolved, or a review process people can use. Agree on availability, which decisions Nicholas owns, implementation capacity, and who handles support. A fractional role does not imply full-time or on-call coverage.",
            "If you already have engineering leadership and need additional senior delivery capacity, the scope can focus on that work.",
          ],
          links: [
            {
              label: "Decide when to build, buy, or integrate",
              href: "/blog/build-vs-buy-software",
            },
            {
              label: "Constellation: prioritization and delivery planning",
              href: "/constellation/overview",
            },
            {
              label: "Scope a release around one useful outcome",
              href: "/blog/scope-first-software-release",
            },
          ],
        },
        {
          heading: "Start with the decision in front of you",
          paras: [
            "Describe the product, the team, and the technical decision or delivery problem you need help with. Include the next milestone so we can discuss the responsibility the role needs to carry.",
          ],
          cta: "message",
          ctaLabel: "Discuss your project →",
        },
      ],
    },
    "ai-development-coaching": {
      type: "page",
      label: "Build with me",
      title: "Learn to build your app with AI, alongside an engineer",
      seoTitle: "Hands-on AI development coaching for founders",
      desc: "Set up your AI development tools, work through a real app change with Nicholas Howell, and learn how to review, test, and maintain it.",
      sections: [
        {
          heading: "Bring a project and a question",
          paras: [
            "For founders who want to understand and participate in building their app, and small teams improving how they use AI coding tools. You might be setting up for the first time, stuck with a prototype, or unsure how to check an agent's work.",
            "Work one-on-one with Nicholas Howell on a bounded task from your project. Agree on a learning goal that fits your experience. A first session might focus on setup and a local change; releasing a feature needs the appropriate checks and access too.",
          ],
        },
        {
          heading: "Set up a workflow you can understand",
          paras: [
            "Review your existing tools and repository before adding anything. Agree on accounts, subscriptions or usage costs, permissions, and what information the tools may see. Use sample data while learning, and keep secrets out of prompts and source files.",
            "Write down the app's purpose, current constraints, and how to run and test it. Turn one goal into a small task with expected behavior. The useful setup is one you can repeat, not a collection of agents you cannot explain.",
          ],
          links: [
            { label: "AI tools, usage, and costs", href: "/ai/resources" },
            { label: "The delivery workflow", href: "/ai/workflow" },
          ],
        },
        {
          heading: "Work through a real change together",
          paras: [
            "Give the tool the relevant context, inspect its proposal, and compare the result with the task. Read the important changes, try the user journey, and test the failure that would matter most. Keep the change small enough to understand and undo.",
            "You'll practice asking for evidence, spotting unsupported assumptions, and deciding when to stop and investigate. If the task is ready for release, work through the existing deployment process; otherwise record the blockers and the next check.",
          ],
          links: [
            {
              label: "How Nick works through a decision with you",
              href: new URL("/home/working-through-a-build", BRANDS.personal.url).href,
            },
          ],
        },
        {
          heading: "Leave with a next step you can repeat",
          paras: [
            "The agreed outputs can include a working local setup, project instructions, a reviewed change, test results, and a short guide to the next task. Record unresolved questions and who owns deployment and ongoing maintenance.",
            "Coaching does not make every generated change safe to ship or replace experience with sensitive data, payments, and complex infrastructure. We can identify where you can continue independently and where another review would help.",
          ],
          links: [
            { label: "Prompts for each stage of delivery", href: "/prompts" },
            { label: "Review an AI prototype before launch", href: "/services/codebase-rescue" },
          ],
        },
        {
          heading: "Tell me what you want to learn by doing",
          paras: [
            "Share your app idea or current project, your experience with coding and AI tools, and the task you'd like help with. We can agree on a useful goal, prerequisites, scope, and price before starting. Leave credentials and private customer data out of the message.",
          ],
          cta: "message",
          ctaLabel: "Discuss building together →",
        },
      ],
    },
  },
};

const BLOG: Workspace = {
  id: "blog",
  initials: "B",
  name: "Blog",
  desc: "Practical product engineering guides",
  status: "writing by Nicholas Howell",
  accent: "#5b8def",
  canonicalBrand: "fst",
  groups: [
    {
      title: "Guides",
      items: [
        "index",
        "timetrack-session-reporting",
        "ai-prototype-to-production",
        "scope-first-software-release",
        "build-vs-buy-software",
        "review-ai-generated-code",
        "repair-or-rewrite",
      ],
    },
  ],
  items: {
    index: {
      type: "page",
      label: "All articles",
      title: "Practical guides for taking your app forward",
      seoTitle: "App development and AI guides for founders",
      desc: "Guides and a Timetrack engineering walkthrough from Nicholas Howell: taking AI prototypes into production, reviewing code, and deciding whether to build or buy.",
      sections: [
        {
          heading: "For founders and small engineering teams",
          paras: [
            "Use these guides to decide what to build first, what your prototype needs before launch, and where AI helps with the work. The examples make the checks and tradeoffs concrete so you can discuss them with an engineer or use them on your own project.",
          ],
        },
        {
          heading: "Inside a real build: Timetrack",
          paras: [
            "See how session records become a useful report: keep short manual entries visible, distinguish parallel session time from human time, and preserve exported documents for later review.",
          ],
          links: [
            {
              label: "Read: Timetrack's session records and reporting decisions",
              href: "/blog/timetrack-session-reporting",
            },
          ],
        },
        {
          heading: "Take a prototype into production",
          paras: [
            "Turn a convincing demo into a release decision: check real permissions, stored data, integrations, deployment, and the support plan around one useful journey.",
          ],
          links: [
            {
              label: "Read: from AI prototype to production",
              href: "/blog/ai-prototype-to-production",
            },
          ],
        },
        {
          heading: "Decide what to build and what to buy",
          paras: [
            "Compare the same workflow over 12 and 24 months, including subscriptions, build effort, hosting, maintenance, and migration. Follow a clearly illustrative cost example.",
          ],
          links: [
            { label: "Read: build, buy, or integrate?", href: "/blog/build-vs-buy-software" },
          ],
        },
        {
          heading: "Plan a first release",
          paras: [
            "A practical guide for founders: choose one user journey, define acceptance criteria, and expose dependencies before committing to a software build.",
          ],
          links: [
            {
              label: "Read: how to scope the first version of a software product",
              href: "/blog/scope-first-software-release",
            },
          ],
        },
        {
          heading: "Review AI-assisted work",
          paras: [
            "A practical review checklist for AI-assisted software: trace the user journey, check authorization and data writes, test failure paths, and plan recovery.",
          ],
          links: [
            {
              label: "Read: how to review AI-generated code before release",
              href: "/blog/review-ai-generated-code",
            },
          ],
        },
        {
          heading: "Make an existing application easier to change",
          paras: [
            "Decide whether to repair, replace a component, or rewrite an application by examining user impact, data risk, and the next required change.",
          ],
          links: [
            {
              label: "Read: should you repair or rewrite an existing application?",
              href: "/blog/repair-or-rewrite",
            },
          ],
        },
        {
          heading: "Put the guidance to work",
          paras: [
            "If a guide describes the problem in front of you, bring a short account of your product, current constraints, and the outcome you need.",
          ],
          links: [
            {
              label: "Product development",
              href: "/services/product-development",
            },
            {
              label: "Codebase rescue",
              href: "/services/codebase-rescue",
            },
            {
              label: "Build with me: AI development coaching",
              href: "/services/ai-development-coaching",
            },
            {
              label: "Fractional CTO and embedded engineering",
              href: "/services/fractional-cto",
            },
          ],
          cta: "message",
          ctaLabel: "Discuss your project →",
        },
      ],
    },
    "timetrack-session-reporting": {
      type: "page",
      label: "Inside Timetrack",
      title: "Inside Timetrack: keep the work visible",
      seoTitle: "Timetrack walkthrough: AI session records and reporting decisions",
      desc: "A concrete engineering walkthrough: preserve short manual entries, explain parallel AI sessions, and keep exported reports available for review.",
      article: { published: "2026-10-30", modified: "2026-10-30" },
      sections: [
        {
          heading: "Start with the detail a reader could lose",
          paras: [
            "A fifteen-minute manual entry can matter even when automated sessions run for hours. Timetrack records AI coding sessions and manual activity, then turns those records into views and reports. One engineering decision is to preserve the short entry when preparing a summary, rather than take only the longest sessions.",
            "A repeatable check uses ten long agent sessions and one fifteen-minute manual entry. All eleven remain in the summary's starting data. The test checks that the summary retains those sample records; their duration alone does not establish what the work achieved.",
            "For a founder building an app, this is a useful review question: does the transformation preserve the information a person needs to make a decision? A clear screen can still hide an important record.",
          ],
        },
        {
          heading: "Define what the recorded time means",
          paras: [
            "Concurrent AI sessions keep their own durations. Two sessions running during the same hour can add up to more than one hour of session time. The dashboard makes overlap visible so the reader can distinguish recorded activity from elapsed human time.",
            "Manual entries carry a separate source label. Session attribution connects the selected project to that project's client, keeping those two labels consistent. The labels explain where the records came from and what they belong to; session duration alone is not a measure of human effort.",
          ],
        },
        {
          heading: "Keep an exported report available for review",
          paras: [
            "Export stores a snapshot of the report document. Opening that saved report retrieves the stored document instead of recalculating it against today's records and rules. A fresh draft can reflect later changes without silently replacing the saved document.",
            "This is a stored export snapshot, not an immutable archive: saved reports can be deleted. The broader lesson is to decide whether a historical view should show what was recorded then or what the system would calculate now.",
          ],
        },
        {
          heading: "Separate AI-assisted development from AI product features",
          paras: [
            "Nicholas used AI assistance while building Timetrack, including work on session attribution and reconciliation. Deciding what a report should preserve and checking that behavior still require engineering judgment.",
            "The product also has separate, optional model features, including title generation and report narration. A summary can start from recorded labels with blank descriptions and next steps, without inventing a narrative. Generated prose still needs review: a model's sentence is not independent evidence that an outcome occurred.",
          ],
        },
        {
          heading: "Describe where the data actually goes",
          paras: [
            "Timetrack is self-hosted across configured services, rather than entirely on-device. Local hooks collect activity within allowed repository roots; selected metadata goes to a Supabase collector and is shown in a Vercel-hosted dashboard. Default hook capture discards prompt and tool contents, while paths are shortened or aliased rather than removed entirely.",
            "Optional title generation is off by default. When explicitly enabled, it can send bounded excerpts of human messages to a model provider. Report narration is another optional model feature. Deciding which features to enable requires understanding their inputs and destinations, not relying on a broad privacy label.",
          ],
        },
        {
          heading: "Explore the interface, then apply the questions to your app",
          paras: [
            "The public Timetrack page includes an interactive dashboard with sample data: switch between day and week, then inspect a point on the dial. The other views illustrate the interface. That demonstration is separate from the capture, authentication, and export systems described here; clicking through it does not exercise those integrations.",
            "For your app, choose one consequential result and trace it back to its inputs. Decide what each label means, which records must survive a summary, and what a saved document preserves. A small, repeatable check can make the next product decision much clearer.",
          ],
          links: [
            { label: "Explore Timetrack's sample-data interface", href: "/timetrack/overview" },
            {
              label: "How Nick works through these decisions with you",
              href: new URL("/home/working-through-a-build", BRANDS.personal.url).href,
            },
            {
              label: "Review your AI prototype before launch",
              href: "/services/codebase-rescue",
            },
            {
              label: "Work through a real task together",
              href: "/services/ai-development-coaching",
            },
          ],
          cta: "message",
          ctaLabel: "Discuss the part of your app that needs a closer look →",
        },
      ],
    },
    "ai-prototype-to-production": {
      type: "page",
      label: "Prototype to production",
      title: "Your AI prototype works. What does it need before launch?",
      seoTitle: "From AI prototype to production: a founder's checklist",
      desc: "Check the user journey, permissions, data writes, integrations, deployment, and support before putting an AI-built app in front of real users.",
      article: { published: "2026-10-30", modified: "2026-10-30" },
      sections: [
        {
          heading: "Start with the release you actually need",
          paras: [
            "A prototype can help you learn whether an idea makes sense. Production adds a different question: can people rely on the app to complete the intended task with their real accounts and data? Start by defining that task and the smallest audience you intend to support.",
            "Write down what works today, what is mocked, and what still requires you to intervene. A small private pilot may need fewer features than a public launch, but it still needs appropriate access controls, honest error handling, and someone responsible when things go wrong.",
          ],
          links: [
            { label: "Scope one useful first release", href: "/blog/scope-first-software-release" },
          ],
        },
        {
          heading: "Test the boundary between two users",
          paras: [
            "Use two test accounts with separate sample records. Confirm each can complete the intended task, then try requesting the other account's record directly. A hidden interface button is not protection; the server or data layer must enforce access to the record and action.",
            "For an illustrative client portal, client A should not retrieve client B's document by changing an ID in a URL or API request. Test signed-out access and privileged actions too. Keep the sample fictional and record the result so the check can be repeated after changes.",
          ],
        },
        {
          heading: "Follow the data when a request fails",
          paras: [
            "Trace one important write from the form through storage and any external service. Try invalid input, a repeated submission, and an unavailable dependency. Check what was saved and what the user sees. A success message should reflect the operation that actually succeeded.",
            "For example, an illustrative booking app must not silently create two bookings when a user retries after a timeout. If payment and booking are separate operations, define how you detect and resolve a partial failure. The required design depends on the provider and workflow; asking an agent to add a retry is not enough.",
          ],
          links: [
            {
              label: "Review AI-generated code and its failure paths",
              href: "/blog/review-ai-generated-code",
            },
          ],
        },
        {
          heading: "Make the app reproducible outside the demo",
          paras: [
            "Confirm that someone can set up the exact revision from documented steps. Identify required accounts, configuration, licenses, external APIs, and recurring charges. Keep secrets out of the browser bundle and repository, and use separate test credentials where available.",
            "Try the important flow on a phone and with a keyboard. Labels, focus, loading states, and useful errors are part of a working release. Check expected usage and any slow or costly operation with representative data; do not infer capacity from a fast demo with three records.",
          ],
        },
        {
          heading: "Know how you will release and recover",
          paras: [
            "Record the candidate revision, checks run, unresolved findings, and required configuration or data changes. Decide who can deploy and what they will verify immediately afterward. Set up an appropriate way to detect failed requests and important user-flow failures without collecting unnecessary private data.",
            "If the app stores valuable data, establish backups and test the relevant recovery steps. Reverting application code may not reverse a database change. Decide who responds to incidents, what support is available, and which operating costs continue after handoff.",
          ],
        },
        {
          heading: "Turn the findings into a launch decision",
          paras: [
            "Separate launch blockers from later improvements and unanswered questions. A useful note says what was tested, on which revision and environment, what failed, and who owns the next action. Avoid describing a limited review as a guarantee about every feature or future load level.",
            "Keep the parts of the prototype that meet the requirements. Repair a contained failure where possible; investigate a replacement when the existing design cannot support the necessary behavior. You need an evidenced next step, not an automatic rewrite.",
          ],
          links: [
            { label: "Get an app or prototype review", href: "/services/codebase-rescue" },
            { label: "Build the first production release", href: "/services/product-development" },
            {
              label: "Work through the checks together",
              href: "/services/ai-development-coaching",
            },
          ],
          cta: "message",
          ctaLabel: "Discuss your prototype →",
        },
      ],
    },
    "build-vs-buy-software": {
      type: "page",
      label: "Build, buy, or integrate?",
      title: "Before another subscription: should you build, buy, or integrate?",
      seoTitle: "Build vs. buy software: a practical cost comparison",
      desc: "Compare a custom tool with SaaS using the same workflow, ownership needs, and 12- and 24-month costs, with an explicitly illustrative example.",
      article: { published: "2026-10-30", modified: "2026-10-30" },
      sections: [
        {
          heading: "Compare the job, not the feature lists",
          paras: [
            "Before buying another subscription, write down the task you need to complete, who uses it, and what is wrong with the current workaround. Compare options against that same task. A quick custom demo and a mature service are not equivalent just because their screens look alike.",
            "Buy standard capabilities when a suitable service solves the problem at an acceptable cost. Build when the workflow or product difference justifies ownership and ongoing work. Integrate existing services when a small connection closes the gap. The right answer can include all three.",
          ],
        },
        {
          heading: "Account for the work after the first build",
          paras: [
            "For buying, include the actual seat or usage tier, setup, migration, integration, administration, and the cost of leaving later. For building, include design, implementation, review, test work, AI tools, hosting, APIs, maintenance, support, and migration. Someone's time is still a cost when it does not produce a vendor invoice.",
            "AI can reduce parts of implementation effort. It does not remove the need to understand the result, patch dependencies, handle incidents, or adapt when an external API changes. Compare a useful 12-month and 24-month horizon with the same service expectations.",
          ],
        },
        {
          heading: "An illustrative cost comparison",
          paras: [
            "These are fictional planning assumptions in US dollars, not FST prices, a quote, or observed client savings. Imagine a ten-person team choosing a simple internal reporting tool with the same required workflow in both options. No AI runs inside the finished app, and usage and scope stay constant.",
            "The buy option assumes $500 for setup and migration, $50 per person per month, and $200 per month of internal administration and integration upkeep. The custom option assumes $8,000 for scoped design, implementation, review, and testing, $200 of initial AI-tool usage, $500 for migration and training, $75 per month of hosting and services, and $200 per month of maintenance and support effort.",
          ],
          table: {
            headers: ["Cost under these assumptions", "Buy", "Custom build"],
            rows: [
              ["One-time setup / delivery", "$500", "$8,700"],
              ["Monthly licenses / hosting and services", "$500", "$75"],
              ["Monthly administration / maintenance effort", "$200", "$200"],
              ["12-month total", "$8,900", "$12,000"],
              ["24-month total", "$17,300", "$15,300"],
            ],
          },
        },
        {
          heading: "Change the assumptions before trusting the answer",
          paras: [
            "Each total is the one-time cost plus the number of months multiplied by both monthly costs. Buying is cheaper at 12 months in this example; the custom option is cheaper at 24. That result depends on the assumptions. If custom maintenance were $400 rather than $200 per month, its 24-month total would become $20,100 and buying would stay cheaper.",
            "This simplified comparison excludes taxes, financing, growth, new features, major incidents, and the cost of waiting for the build. Add them when relevant. If your app uses an AI API at runtime, include its usage separately from the AI tools used to develop it. Estimate a conservative case as well as the expected case, and write down who will own the ongoing work.",
          ],
        },
        {
          heading: "Check fit and ownership alongside cost",
          paras: [
            "Can the service export the data you need? Does the required integration exist on the plan you are comparing? Who can access the records, and what happens when a team member leaves? Can another engineer deploy and maintain the custom app? These questions can change the decision even when the totals are close.",
            "Before replacing a working service, try the highest-risk workflow with representative data. Confirm migration and recovery, keep an appropriate transition path, and decide what evidence would justify the switch. You can build a narrow feature around an existing service without replacing the whole system.",
          ],
        },
        {
          heading: "Bring the workflow and the current bill",
          paras: [
            "List the task, the tools involved, current costs, workarounds, and what a successful change would look like. We can use that context to decide whether the next step is configuration, an integration, a focused build, or leaving a suitable service in place.",
          ],
          links: [
            { label: "Discuss a focused app build", href: "/services/product-development" },
            { label: "Work through technical decisions", href: "/services/fractional-cto" },
            { label: "How we agree on AI tools and costs", href: "/ai/resources" },
          ],
          cta: "message",
          ctaLabel: "Discuss your build-or-buy decision →",
        },
      ],
    },
    "scope-first-software-release": {
      type: "page",
      label: "Scope your first release",
      title: "How to scope the first version of a software product",
      seoTitle: "How to scope your first software release",
      desc: "A practical guide for founders: choose one user journey, define acceptance criteria, and expose dependencies before committing to a software build.",
      sections: [
        {
          heading: "Start with one complete user journey",
          paras: [
            "Scope a first release around a specific person completing a useful task. “Build a dashboard” describes a screen. “A project owner can review this week’s activity and export an agreed report” describes an outcome you can inspect.",
            "Write the journey in plain language before listing features. Include how the user arrives, what information they need, what action they take, and how they know it worked. If the journey depends on somebody doing manual work behind the scenes, describe that work too.",
          ],
        },
        {
          heading: "Use a short brief that exposes the unknowns",
          paras: [
            "A useful brief identifies the user, the problem, the current workaround, and the reason to change it. Add the information the system must store, the people allowed to see it, and any external services it depends on.",
            "Then record the constraints: a fixed event date, a required integration, an existing technology choice, or a budget boundary. Separate confirmed requirements from assumptions. An unanswered question about a payment provider or data import can affect the schedule more than several interface screens.",
          ],
        },
        {
          heading: "Turn the core journey into acceptance criteria",
          paras: [
            "Acceptance criteria describe observable behavior. For a reporting workflow, they might say that a user can select a date range, see which records contribute to a total, and export the same figures. A user without access to the project must be unable to retrieve those records.",
            "Include important failure cases: an empty result, a duplicate submission, an unavailable integration, or an interrupted operation. These cases reveal work that a polished mockup can hide. The criteria should be specific enough that you and the engineer can agree whether the behavior is present.",
          ],
        },
        {
          heading: "Separate launch requirements from later work",
          paras: [
            "Keep a feature in the first release when the core journey cannot work safely without it. Permissions and data validation often belong there. Extra reporting views, extensive customization, or support for additional audiences may be able to wait.",
            "For example, a focused reporting tool might begin with one import format and one export layout. Supporting every possible format introduces separate parsing, validation, and support work. Write down that limit so the first release is a deliberate choice rather than a surprise.",
          ],
        },
        {
          heading: "Test the riskiest dependency before fixing the plan",
          paras: [
            "If the build relies on an unfamiliar API, uncertain source data, or a platform restriction, investigate that dependency early. A small technical check can tell you whether the proposed workflow is feasible and what access it needs.",
            "Once the unknowns are clearer, agree on deliverables, exclusions, review points, and who handles deployment and support. Treat new requirements as explicit scope decisions. This gives you a way to adapt the plan without hiding the effect on cost or delivery.",
          ],
        },
        {
          heading: "What to bring to a scoping conversation",
          paras: [
            "Bring the short brief, any designs, a representative example of the input and output, and the questions you cannot yet answer. You do not need a complete specification to start. You need enough context to identify the next useful piece of work.",
          ],
          links: [
            {
              label: "Explore product development services",
              href: "/services/product-development",
            },
            {
              label: "See Timetrack’s reporting workflow",
              href: "/timetrack/overview",
            },
            {
              label: "Next: how to review AI-generated code",
              href: "/blog/review-ai-generated-code",
            },
          ],
          cta: "message",
          ctaLabel: "Discuss your project →",
        },
      ],
      article: {
        published: "2026-10-28",
        modified: "2026-10-28",
      },
    },
    "review-ai-generated-code": {
      type: "page",
      label: "Review AI-generated code",
      title: "How to review AI-generated code before release",
      seoTitle: "Reviewing AI-generated code before release",
      desc: "A practical review checklist for AI-assisted software: trace the user journey, check authorization and data writes, test failure paths, and plan recovery.",
      sections: [
        {
          heading: "Review the behavior the change introduces",
          paras: [
            "Treat AI-generated code as a proposed implementation that needs the same scrutiny as any other change. A successful build confirms that the project can compile. It does not confirm that the application meets its requirements or protects the right data.",
            "Start by identifying what changed for a user. Trace that journey through the interface, request handler, business logic, and storage. Read the callers and the surrounding code so that a locally plausible change is checked against the system it joins.",
          ],
        },
        {
          heading: "Check authorization where the data is accessed",
          paras: [
            "Signing in establishes identity. Authorization decides which records and actions that identity is allowed to access. A hidden button in the interface does not establish that boundary.",
            "Inspect the server-side handler and data query. Ask what happens if someone changes a record identifier, sends the request directly, or uses another account. Check tenant ownership and privileged actions explicitly. Never paste real credentials or private customer records into a review prompt.",
          ],
        },
        {
          heading: "Follow every important write and failure path",
          paras: [
            "For a write operation, identify what is validated, what can change, and what happens when the operation only partly succeeds. A retry must not silently duplicate a charge, message, or record. Where several changes must succeed together, examine how consistency is maintained.",
            "Check error handling at external services and storage boundaries. The application should distinguish a successful operation from one that failed or needs attention. Avoid swallowing an error and presenting a success state simply because the generated code supplied a convenient fallback.",
          ],
        },
        {
          heading: "Choose tests that could catch a real defect",
          paras: [
            "Use a small set of checks tied to the behavior at risk. For a protected report, verify the expected result for an allowed account and denial for an account without access. For an import, include malformed input and a repeated submission.",
            "Read the test itself. A test that repeats the same calculation as the implementation can reproduce the same mistake. Prefer expected results derived from the requirement or a small example you can calculate independently. Run the existing relevant checks as well as the new ones.",
          ],
        },
        {
          heading: "Inspect what reaches the browser and logs",
          paras: [
            "Look for secrets in client bundles, sensitive fields returned unnecessarily by APIs, and private information written into logs. Check that new dependencies and scripts are actually needed and that generated files do not introduce unrelated changes.",
            "Review the diff after running tooling. Formatting, scaffolding, and code generation can obscure a small behavior change inside a much larger patch. Remove unrelated changes where possible so the reviewer can see the decision being made.",
          ],
        },
        {
          heading: "Define how to release and recover",
          paras: [
            "Before release, know which configuration, permissions, and migrations the change requires. Decide how you will observe whether the core journey still works. For data changes, establish a recovery approach that preserves user data; reverting application code alone may not undo a migration.",
            "If you cannot explain the important control flow, reduce the change or investigate it before accepting it. AI assistance is useful when the resulting work remains understandable to the people responsible for operating it.",
          ],
          links: [
            {
              label: "Discuss a codebase review",
              href: "/services/codebase-rescue",
            },
            {
              label: "See Timetrack’s audit trail and reporting design",
              href: "/timetrack/overview",
            },
            {
              label: "Next: repair or rewrite an existing application?",
              href: "/blog/repair-or-rewrite",
            },
          ],
          cta: "message",
          ctaLabel: "Discuss your project →",
        },
      ],
      article: {
        published: "2026-10-28",
        modified: "2026-10-28",
      },
    },
    "repair-or-rewrite": {
      type: "page",
      label: "Repair or rewrite?",
      title: "Should you repair or rewrite an existing application?",
      seoTitle: "Repair or rewrite your application?",
      desc: "Decide whether to repair, replace a component, or rewrite an application by examining user impact, data risk, and the next required change.",
      sections: [
        {
          heading: "Diagnose the failure before choosing a rewrite",
          paras: [
            "Begin with the behavior that is stopping progress. “The code is messy” is difficult to act on. “Customers lose a draft when this request fails” or “every billing change breaks reporting” identifies a problem you can investigate.",
            "A rewrite may be appropriate, but it replaces working behavior as well as broken behavior. Before choosing it, identify what the current application does that users depend on, including undocumented rules and integrations. Those requirements do not disappear when the implementation changes.",
          ],
        },
        {
          heading: "Map one critical path through the application",
          paras: [
            "Pick a workflow that matters to the business and trace it from entry to stored result. Note the services, data, permissions, and background work involved. Establish whether you can reproduce the reported failure in a safe environment.",
            "Review the deployment and recovery process alongside the code. A system that is difficult to release safely may need better operating practices before substantial implementation changes. Check what evidence exists: incidents, logs, support reports, and relevant tests. Separate observed failures from untested suspicions.",
          ],
        },
        {
          heading: "Prefer focused repairs when the boundaries still work",
          paras: [
            "Repair is a useful starting point when the application’s structure supports the required behavior and the failures are identifiable. Examples include missing validation, an incorrect query, or an integration without reliable error handling.",
            "Add a check that demonstrates the failure, make the smallest complete repair, and verify the affected callers. The immediate goal is a safer critical path and a clearer next change. There is no requirement to clean up every file before restoring useful behavior.",
          ],
        },
        {
          heading: "Replace a component when the problem is contained",
          paras: [
            "A targeted replacement can make sense when one module repeatedly blocks the work but the rest of the application remains useful. Define the boundary and expected behavior before replacing the implementation.",
            "For example, a reporting component can sometimes be replaced while retaining the source records and existing sign-in flow. Compare outputs on representative data before moving users. This approach still needs a plan for compatibility, deployment, and recovery; a smaller replacement is not automatically risk-free.",
          ],
        },
        {
          heading: "Consider a rewrite when repair cannot meet the requirement",
          paras: [
            "A rewrite deserves consideration when the existing design fundamentally cannot support a necessary change, or when maintaining the current platform is no longer feasible. Document the specific constraint and the alternatives that were considered.",
            "The plan must account for data migration, integrations, behavior parity, access controls, and the transition for existing users. Identify which features must move first and how results will be reconciled. If those costs are missing, the rewrite estimate is incomplete.",
          ],
        },
        {
          heading: "Ask for a decision you can review",
          paras: [
            "A useful assessment connects findings to user impact, identifies the next business milestone, and compares repair, targeted replacement, and rewrite against that milestone. It states what is known, what still needs investigation, and the order of recommended work.",
            "Start there before commissioning a broad rebuild. The result should help you decide what to preserve and what to change, with enough evidence to question the recommendation.",
          ],
          links: [
            {
              label: "Explore codebase rescue and review",
              href: "/services/codebase-rescue",
            },
            {
              label: "Review AI-generated changes before release",
              href: "/blog/review-ai-generated-code",
            },
            {
              label: "Need technical direction? Fractional CTO services",
              href: "/services/fractional-cto",
            },
          ],
          cta: "message",
          ctaLabel: "Discuss your project →",
        },
      ],
      article: {
        published: "2026-10-28",
        modified: "2026-10-28",
      },
    },
  },
};

const AI_PLAYBOOK: Workspace = {
  id: "ai",
  initials: "AI",
  name: "AI playbook",
  desc: "Tools, people, and a working delivery path",
  status: "practical AI delivery",
  accent: "#a78bfa",
  accentInk: "#6842b8",
  canonicalBrand: "fst",
  groups: [
    {
      title: "Workflow",
      items: ["index", "workflow", "models"],
    },
    {
      title: "People and delivery",
      items: ["why-an-engineer", "why-a-designer", "lean-team", "offshore-tradeoffs"],
    },
    {
      title: "Transparency",
      items: ["resources", "community-research"],
    },
  ],
  items: {
    index: {
      type: "page",
      label: "Start here",
      title: "Build with AI. Keep the judgment.",
      seoTitle: "AI software development playbook",
      desc: "How Nicholas Howell uses Claude Code and Codex across product design, implementation, review, and delivery.",
      sections: [
        {
          heading: "A practical path from idea to maintained software",
          paras: [
            "AI is part of the delivery process here. Nicholas uses Claude /design for product design, Claude Code generally for implementation, and Codex for code reviews, image and logo exploration, landing pages, and websites. Some tasks move between both tools.",
            "The purpose is a smaller, more effective delivery team with clear ownership. Engineers still need to understand the system. Designers still need to understand the people using it. A founder still needs to decide which problem is worth solving.",
          ],
        },
        {
          heading: "Follow the workflow",
          paras: [
            "Start with the software development lifecycle, then use the model guide and prompts for the stage you are in.",
          ],
          links: [
            {
              label: "The AI-assisted software development lifecycle",
              href: "/ai/workflow",
            },
            {
              label: "Which tool and model to use when",
              href: "/ai/models",
            },
            {
              label: "The prompt library: when to use each prompt",
              href: "/prompts",
            },
          ],
        },
        {
          heading: "Understand the people and commercial decisions",
          paras: [
            "See where experienced engineering and design earn their place, when a smaller external team can work, and how to evaluate a delivery partner.",
          ],
          links: [
            {
              label: "Why an engineer still matters",
              href: "/ai/why-an-engineer",
            },
            {
              label: "Why a designer still matters",
              href: "/ai/why-a-designer",
            },
            {
              label: "Do you need a full in-house development team?",
              href: "/ai/lean-team",
            },
            {
              label: "When an offshore handoff is the wrong fit",
              href: "/ai/offshore-tradeoffs",
            },
          ],
        },
        {
          heading: "See the resources and the evidence",
          paras: [
            "Our workflow preferences are different from a provider capability claim or an independent performance benchmark. The resources page separates those, and the community review links to the Reddit discussions we read.",
          ],
          links: [
            {
              label: "AI tools, access, usage, and cost transparency",
              href: "/ai/resources",
            },
            {
              label: "What Reddit users report about Claude Code and Codex",
              href: "/ai/community-research",
            },
          ],
          cta: "message",
          ctaLabel: "Discuss an AI-assisted project →",
        },
      ],
    },
    workflow: {
      type: "page",
      label: "AI across the SDLC",
      title: "An AI-assisted software development lifecycle",
      seoTitle: "AI across the software development lifecycle",
      desc: "A working path through discovery, design, planning, implementation, review, release, and maintenance, with an owner and an output at every stage.",
      sections: [
        {
          heading: "Give each stage an owner and an observable result",
          paras: [
            "The software development lifecycle, or SDLC, is the path from deciding what to build to operating and improving it. AI can help throughout that path. It does not remove the need to agree on requirements, examine evidence, or own a release decision.",
            "Our starting split is Claude /design for product design, Claude Code for implementation, and Codex for review. Codex can also own a website or landing-page build. Choose the next tool based on the task and the evidence, rather than forcing every task through a fixed sequence.",
          ],
        },
        {
          heading: "The delivery path",
          paras: [
            "These are recommended responsibilities for a project. One person may cover several roles, but each decision still needs an accountable owner.",
          ],
          table: {
            headers: ["Stage", "AI contribution", "Human decision and output"],
            rows: [
              [
                "Discover",
                "Turn notes into questions, assumptions, and a brief.",
                "Founder and engineer agree on one user outcome and acceptance criteria.",
              ],
              [
                "Design",
                "Use Claude /design to explore flows and interface states.",
                "Designer reviews hierarchy, usability, accessibility, and the handoff.",
              ],
              [
                "Plan",
                "Inspect the repository and propose a small change sequence.",
                "Engineer confirms architecture, permissions, dependencies, and scope.",
              ],
              [
                "Build",
                "Claude Code usually implements; Codex can also implement.",
                "Engineer keeps changes reviewable and inspects affected callers.",
              ],
              [
                "Review and verify",
                "Codex reviews the change and helps exercise failure cases.",
                "Engineer triages evidence; designer checks the implemented experience.",
              ],
              [
                "Release",
                "Prepare checks, release notes, and operating instructions.",
                "Named owner approves deployment, data changes, and recovery.",
              ],
              [
                "Maintain",
                "Help investigate incidents and propose improvements.",
                "Owner checks behavior, support needs, and the next priority.",
              ],
            ],
          },
        },
        {
          heading: "A worked example: a client report",
          paras: [
            "Start with the outcome: a client can view only their project’s report for an agreed date range. The designer covers loading, empty, error, mobile, and export states. The engineer identifies the records, tenant boundary, calculations, and existing reporting code.",
            "Give the implementer the approved flow and acceptance criteria. Give the reviewer the same requirement, the revision, and the surrounding code. Verify the expected total and attempt the request with an account that must not have access. A persuasive explanation cannot substitute for that check.",
            "Before release, confirm how the report is observed, what happens if the export fails, and how the deployment can be recovered. The example is illustrative; it is not a claim about a client engagement.",
          ],
        },
        {
          heading: "Use a written handoff when switching tools",
          paras: [
            "Carry forward the goal, approved design, revision or diff, files changed, checks run, unresolved questions, and decisions already accepted. The second tool should verify the code rather than inherit the first tool’s confidence.",
            "Stop a review cycle when the agreed checks pass and material findings have a recorded resolution. Repeating reviews indefinitely can add cost without resolving the underlying uncertainty.",
          ],
          links: [
            {
              label: "Get discovery and scoping prompts",
              href: "/prompts/discovery",
            },
            {
              label: "Get implementation and handoff prompts",
              href: "/prompts/implementation",
            },
            {
              label: "Get review and release prompts",
              href: "/prompts/review-release",
            },
          ],
        },
      ],
    },
    models: {
      type: "page",
      label: "Tools and model selection",
      title: "Which AI tool and model should you use when?",
      seoTitle: "Claude Code and Codex: tools and model guide",
      desc: "Our Claude Code and Codex workflow, with dated model examples and a practical way to choose quality, speed, and cost.",
      sections: [
        {
          heading: "Choose the workbench, then the model",
          paras: [
            "Claude Code and Codex are working environments with tools, repository context, and permissions. The model is one component inside that environment. A model name alone does not tell you which browser, image tool, integrations, or account limits you have.",
            "Nicholas’s starting workflow is shown below. The model roles are editorial starting points, not a cross-vendor benchmark or a claim that each named model is used on every engagement.",
          ],
        },
        {
          heading: "Our starting tool split",
          paras: [
            "Switch roles when the task or observed output justifies it. Give either tool the same approved requirements and design references.",
          ],
          table: {
            headers: ["Work", "Usual starting point", "What remains a human responsibility"],
            rows: [
              [
                "Product design",
                "Claude /design",
                "Define the user journey, critique options, and approve the interaction design.",
              ],
              [
                "Application implementation",
                "Claude Code; sometimes Codex or both",
                "Confirm architecture and inspect the behavior being added.",
              ],
              [
                "Code review",
                "Codex, with permission to read the connected code",
                "Reproduce important findings and decide what must change.",
              ],
              [
                "Images and logo exploration",
                "Codex with its image-generation tools",
                "Art direction, brand consistency, asset checks, and final suitability.",
              ],
              [
                "Landing pages and websites",
                "Codex, using an approved brief and visual direction",
                "Claims, content, responsive behavior, accessibility, and conversion flow.",
              ],
            ],
          },
        },
        {
          heading: "Concrete model examples, checked October 28, 2026",
          paras: [
            "Claude’s model aliases can resolve differently by provider. Confirm the actual model in your session rather than copying a version from an old article. OpenAI model availability and settings also depend on the product and account.",
            "The following routing choices are our suggested starting points. Compare them on representative tasks before making them a project rule.",
          ],
          links: [
            {
              label: "Anthropic: model aliases and provider-specific versions",
              href: "https://code.claude.com/docs/en/model-config",
            },
            {
              label: "OpenAI: current model family and capabilities",
              href: "https://developers.openai.com/api/docs/guides/latest-model",
            },
          ],
          table: {
            headers: ["Task shape", "Model starting point", "When to change"],
            rows: [
              [
                "Routine Claude Code implementation",
                "Sonnet family; Anthropic API example: Sonnet 5.5",
                "Try Opus for unresolved ambiguity or a harder architectural problem.",
              ],
              [
                "Difficult Claude Code investigation",
                "Opus family; Anthropic API example: Opus 5.5",
                "Return to a lighter model once the work is well specified.",
              ],
              [
                "Focused, low-risk Claude tasks",
                "Haiku family; Anthropic API example: Haiku 5.5",
                "Escalate if results repeatedly miss the acceptance criteria.",
              ],
              [
                "Codex implementation or review",
                "GPT-6.1 Sol",
                "Try GPT-6 Astra for difficult, high-consequence analysis.",
              ],
              [
                "Bounded OpenAI tasks",
                "GPT-6 Luna",
                "Use a stronger model when verification exposes a quality gap.",
              ],
              [
                "Visual analysis and writing",
                "GPT-6.1 Terra",
                "Evaluate on your real screenshots and deliverable.",
              ],
            ],
          },
        },
        {
          heading: "Spend more reasoning where the decision needs it",
          paras: [
            "A small copy edit and a permissions migration should not have the same budget. Start with a setting appropriate to the task, measure whether the output passes the checks, and increase effort when better analysis is worth the delay and usage.",
            "Compare total work: retries, human corrections, and review time as well as token or subscription cost. More agents and more review rounds are not automatically an improvement.",
          ],
          links: [
            {
              label: "OpenAI: model selection and evaluation guidance",
              href: "https://developers.openai.com/api/docs/guides/model-selection",
            },
          ],
        },
        {
          heading: "Image generation is its own capability",
          paras: [
            "Using Codex as the workbench for a visual asset does not mean the selected coding model is also the image generator. Record the tool or image model used when that matters to the handoff. A generated logo direction also needs checks at small sizes and suitable final file formats.",
            "Use Claude /design for the product interface workflow described here. A visual-generation task can be handled through Codex, then brought into the approved design system.",
          ],
          links: [
            {
              label: "Claude: using /design in Claude Code",
              href: "https://support.claude.com/en/articles/14604416-get-started-with-claude-design",
            },
            {
              label: "OpenAI: image generation in the app",
              href: "https://learn.chatgpt.com/docs/image-generation",
            },
            {
              label: "Design and visual asset prompts",
              href: "/prompts/design",
            },
          ],
        },
      ],
    },
    "why-an-engineer": {
      type: "page",
      label: "Why an engineer?",
      title: "Why you still need an engineer when AI writes code",
      seoTitle: "Why AI software projects still need engineers",
      desc: "AI can accelerate implementation. An engineer connects requirements, architecture, data safety, verification, and long-term ownership.",
      sections: [
        {
          heading: "Someone must decide what correct means",
          paras: [
            "An AI coding tool can create a plausible implementation before the requirements are clear. An engineer asks which records belong to whom, what happens when a request fails, and how the new behavior interacts with the system already in place.",
            "That work starts before code generation. It includes identifying assumptions, reading existing callers, defining trust boundaries, and choosing a change that solves the user’s problem without introducing unnecessary machinery.",
          ],
        },
        {
          heading: "The expensive decisions often sit between files",
          paras: [
            "A screen can look finished while its API exposes another customer’s data. A payment flow can pass its happy-path test and duplicate a write on retry. An import can appear to work while corrupting an existing record.",
            "The engineer follows those paths across the application, examines failure cases, and selects checks that would reveal the mistake. The question is whether the whole behavior holds, including under the conditions users will actually encounter.",
          ],
        },
        {
          heading: "AI review is a second input to the decision",
          paras: [
            "Our usual split puts Codex in the review role and Claude Code in implementation. Either can be wrong. A separate reviewer can challenge assumptions, but agreement between models is not proof of correctness.",
            "A useful finding identifies a reproducible failure, affected behavior, and consequence. An engineer checks the finding, fixes or explicitly accepts it, and verifies that the repair did not break a caller. The person accepting the change needs enough understanding to explain it.",
          ],
        },
        {
          heading: "You need an owner after the code is generated",
          paras: [
            "Releases involve configuration, permissions, data changes, observability, and recovery. The engineer should be able to explain how the team will deploy, diagnose failures, and maintain the system.",
            "For a focused product, that responsibility may fit an experienced external engineer instead of several full-time hires. The ownership still has to exist, with an agreed support and handoff arrangement.",
          ],
          links: [
            {
              label: "Review AI-generated code before release",
              href: "/blog/review-ai-generated-code",
            },
            {
              label: "See the complete delivery workflow",
              href: "/ai/workflow",
            },
            {
              label: "Explore codebase rescue and review",
              href: "/services/codebase-rescue",
            },
          ],
          cta: "message",
          ctaLabel: "Discuss an AI-assisted project →",
        },
      ],
    },
    "why-a-designer": {
      type: "page",
      label: "Why a designer?",
      title: "Why you still need a designer when AI makes interfaces",
      seoTitle: "Why AI product work still needs designers",
      desc: "AI can produce interface options quickly. A designer makes the workflow understandable, coherent, accessible, and appropriate for the people using it.",
      sections: [
        {
          heading: "An attractive screen is only part of the job",
          paras: [
            "A product designer connects a person’s goal to the information and actions on a screen. That includes deciding what appears first, how navigation works, which language makes sense, and what happens when the user has incomplete information.",
            "Generating several polished options is useful. Choosing which option supports the actual task requires product context, critique, and feedback from the people who will use it.",
          ],
        },
        {
          heading: "Our product design starting point is Claude /design",
          paras: [
            "Nicholas uses Claude /design for product design. Bring the existing components, brand system, target audience, core journey, and content constraints. Generate an interactive direction, then refine it before implementation.",
            "The designer’s work is to question the default: can a new user find the next action, recover from a mistake, read the content, and operate the interface with a keyboard? Ask for loading, empty, error, success, and mobile states alongside the main screen.",
          ],
          links: [
            {
              label: "Claude Design: context, iteration, and handoff",
              href: "https://support.claude.com/en/articles/14604416-get-started-with-claude-design",
            },
          ],
        },
        {
          heading: "Review the implemented experience as well as the design",
          paras: [
            "A development handoff should identify components, spacing and type rules, responsive changes, interaction behavior, and the states the engineer must preserve. A screenshot alone leaves many decisions unspecified.",
            "After implementation, review the actual browser experience. Check reading order, contrast, focus visibility, labels, touch targets, and long content. Automated checks can help, but they do not replace watching a person try the important task.",
          ],
        },
        {
          heading: "Image and website work still needs art direction",
          paras: [
            "Codex is also part of our workflow for images, logo exploration, landing pages, and websites. A designer helps keep those outputs consistent with the product and brand rather than treating each generated asset as a separate style.",
            "You may need a focused design engagement instead of a permanent design department. You still benefit from someone owning the decisions and leaving a usable system for the next page or feature.",
          ],
          links: [
            {
              label: "Use the design brief and visual asset prompts",
              href: "/prompts/design",
            },
            {
              label: "Compare a lean team with in-house hiring",
              href: "/ai/lean-team",
            },
          ],
          cta: "message",
          ctaLabel: "Discuss an AI-assisted project →",
        },
      ],
    },
    "lean-team": {
      type: "page",
      label: "A smaller delivery team",
      title: "Do you need a full in-house development team?",
      seoTitle: "AI-assisted delivery versus an in-house dev team",
      desc: "When an AI-assisted senior engineer and focused design support can fit the work, and when a permanent team is the better investment.",
      sections: [
        {
          heading: "You may be able to buy the capability you need now",
          paras: [
            "A focused build with one main user journey may not need separate full-time hires for every discipline. An experienced engineer can cover connected implementation work, while a designer joins for the product decisions and reviews that need design expertise.",
            "AI can assist with code drafts, investigation, repetitive updates, documentation, and review preparation. That can reduce the need to staff every execution task separately. The size of the benefit depends on scope, system complexity, and how much rework the output needs; there is no fixed team-replacement ratio.",
          ],
        },
        {
          heading: "Compare responsibility and total cost",
          paras: [
            "Consider coordination, ramp-up, review, maintenance, availability, and recovery as well as the quoted hourly rate.",
          ],
          table: {
            headers: ["Approach", "Can fit when", "Check before choosing"],
            rows: [
              [
                "Senior engineer plus focused design support",
                "The scope is bounded and a small number of people can own the decisions.",
                "Availability, backup coverage, handoff, support, and ownership of each discipline.",
              ],
              [
                "Permanent in-house team",
                "Product knowledge, continuing delivery, and operational responsibility are ongoing needs.",
                "Hiring and management capacity, continuity, specialist needs, and support coverage.",
              ],
              [
                "Distributed or offshore partner",
                "The handoff, working-hour overlap, and quality controls fit the project.",
                "Direct senior access, communication, data access, review evidence, and release ownership.",
              ],
            ],
          },
        },
        {
          heading: "Keep a permanent team when the responsibility is permanent",
          paras: [
            "A product with many concurrent workstreams, demanding service commitments, deep specialist requirements, or substantial ongoing support may justify an in-house team. AI tools do not create a support rota or preserve institutional knowledge by themselves.",
            "A lean external team can also become a bottleneck if every decision depends on one person. Plan for absences, documentation, infrastructure access, and the point at which it makes sense to bring work inside.",
          ],
        },
        {
          heading: "Start with a milestone, then choose the team",
          paras: [
            "Define the next outcome and the skills it needs. A first engagement might be a codebase assessment, a complete product workflow, or technical direction for your existing team. Review what capacity you need after that milestone.",
            "The commercial case is paying for the responsibilities the project needs at this stage, with explicit expectations about delivery and maintenance.",
          ],
          links: [
            {
              label: "Product development engagements",
              href: "/services/product-development",
            },
            {
              label: "Fractional CTO and embedded engineering",
              href: "/services/fractional-cto",
            },
            {
              label: "AI usage and cost transparency",
              href: "/ai/resources",
            },
          ],
          cta: "message",
          ctaLabel: "Discuss an AI-assisted project →",
        },
      ],
    },
    "offshore-tradeoffs": {
      type: "page",
      label: "Offshore tradeoffs",
      title: "When an offshore development handoff is the wrong fit",
      seoTitle: "Offshore development: delivery tradeoffs",
      desc: "Evaluate a development partner by working-hour overlap, direct access, context, code ownership, and evidence of quality.",
      sections: [
        {
          heading: "Avoid buying a low rate without a delivery system",
          paras: [
            "If the work requires frequent discovery and decisions with the founder, a handoff with little working-hour overlap can make feedback harder. Several layers between the client and the engineer can also leave important questions unresolved while implementation continues.",
            "These are properties of the engagement. They can occur in a domestic agency or an offshore contract. A well-run international team with direct communication and sound engineering practices can be a good fit.",
          ],
        },
        {
          heading: "Where a distant handoff can become expensive",
          paras: [
            "Requirements that are still moving need fast feedback. If each question waits for another workday or travels through an account manager, the apparent savings can be offset by coordination and rework. The same problem appears when the people scoping the work are not the people doing it.",
            "Another risk is accepting demonstrations without access to the repository, tests, or operating knowledge. You need evidence that the team can change and run the system, wherever that team is located. AI-generated output makes that inspection more important because a large volume of code is easy to produce.",
          ],
        },
        {
          heading: "Questions to ask any partner",
          paras: [
            "Ask who makes architecture decisions, who reviews generated code, which working hours overlap, and how questions reach the implementer. Establish who owns the repository and infrastructure and what happens if the engagement ends.",
            "Ask to review a small deliverable with its acceptance criteria and verification evidence before committing to a larger scope. Agree on escalation, backup coverage, and support responsibilities. A clear answer to those questions matters more than the country listed on the invoice.",
          ],
        },
        {
          heading: "Our alternative is direct access and a defined scope",
          paras: [
            "Nicholas is based in Saint Petersburg, Florida. Work directly with the person responsible for technical decisions and delivery, with the design and specialist input the scope requires. Working hours, availability, and support still need to be agreed.",
            "Choose this model when direct decisions and a smaller senior team fit the work. Choose a larger or distributed team when it can provide the ownership, capacity, and coverage you need.",
          ],
          links: [
            {
              label: "How a smaller delivery team can fit",
              href: "/ai/lean-team",
            },
            {
              label: "What to expect in a project scope",
              href: "/blog/scope-first-software-release",
            },
            {
              label: "Technical leadership services",
              href: "/services/fractional-cto",
            },
          ],
          cta: "message",
          ctaLabel: "Discuss an AI-assisted project →",
        },
      ],
    },
    resources: {
      type: "page",
      label: "Tools, usage, and costs",
      title: "Our AI resources and what a client should know",
      seoTitle: "AI tools, resources, usage, and cost transparency",
      desc: "The Claude Code and Codex tool split, project access decisions, and the AI usage and billing details that belong in a written scope.",
      sections: [
        {
          heading: "The tools are part of the work",
          paras: [
            "Nicholas uses Claude Code and Codex. Product design starts with Claude /design. Claude Code is generally the implementation tool; Codex is generally the review tool and is also used for images, logo directions, landing pages, and websites. Some work uses both.",
            "That is a workflow preference, not a promise that one vendor or model is always better. Model versions, account access, and tool capabilities change. The model guide is a dated reference, while a project should record the versions and tools actually used.",
          ],
          links: [
            {
              label: "Tool and model selection guide",
              href: "/ai/models",
            },
            {
              label: "Community reports and their limitations",
              href: "/ai/community-research",
            },
          ],
        },
        {
          heading: "Separate the workbench, model, tools, and project services",
          paras: [
            "The workbench is Claude Code or Codex. A selected language model handles reasoning and code generation. An image tool may use a different model. Connected tools can add repository access, browser actions, design assets, or other services. Those are separate access and cost decisions.",
            "This site itself uses Next.js, React, TypeScript, and Vercel integrations, with Resend for configured contact delivery. A technology used by the portfolio is not automatically required for your product. Reuse the systems that fit the engagement.",
          ],
        },
        {
          heading: "Agree on scope, accounts, and tool costs before work starts",
          paras: [
            "We agree on the deliverable, pricing basis, accounts, and expected tool costs before work starts. The written scope should state whether subscriptions and usage are included, separately billed, or supplied through your accounts, plus any pass-through charges or markup, spending limits, and who approves extra usage.",
            "Record who owns each account and what access remains after handoff. Compare the current provider plan with the expected workload, including recurring services in the finished app. An engagement sets its own usage allowance and billing terms; a long-running agent session is not, by itself, a billable-time policy.",
          ],
        },
        {
          heading: "Agree on access before supplying private information",
          paras: [
            "Identify which code, documents, assets, and data can be shared with each tool and which integrations are permitted. Confirm the account and provider settings that apply to the work. Do not assume every plan has identical data handling.",
            "Use representative or redacted examples when possible. Keep credentials in approved secret storage, grant only the access the task needs, and plan to remove temporary access after handoff. If a task requires production data or a production action, make that requirement explicit before the task starts.",
          ],
        },
        {
          heading: "The useful deliverable is inspectable work",
          paras: [
            "A client should be able to see what changed, why it changed, what was checked, and what remains uncertain. A handoff can record the models and tools used alongside the revision, design references, tests, and operating instructions.",
            "Model agreement, hours of agent activity, or a large token count are not evidence of business value. Judge the work against the outcome, acceptance criteria, and responsibilities agreed for the project.",
          ],
          links: [
            {
              label: "AI-assisted delivery workflow",
              href: "/ai/workflow",
            },
            {
              label: "Review and handoff prompts",
              href: "/prompts/review-release",
            },
            {
              label: "Set up and learn the workflow together",
              href: "/services/ai-development-coaching",
            },
            {
              label: "Compare the costs of building and buying",
              href: "/blog/build-vs-buy-software",
            },
          ],
          cta: "message",
          ctaLabel: "Discuss an AI-assisted project →",
        },
      ],
    },
    "community-research": {
      type: "page",
      label: "What the community says",
      title: "What Reddit users report about Claude Code and Codex",
      seoTitle: "Claude Code and Codex: Reddit workflow research",
      desc: "A dated reading of user-reported workflows: cross-tool reviews, clear handoffs, frontend preferences, and the limits of repeated AI review.",
      sections: [
        {
          heading: "A qualitative reading, not a popularity ranking",
          paras: [
            "Reviewed October 28, 2026. We read discussions in r/ClaudeCode, r/codex, and r/ClaudeAI, including older and recent posts. These are self-selected accounts, with different projects, model versions, prompts, and levels of experience. They cannot establish which tool is objectively best or how most developers work.",
            "The observations below paraphrase the linked threads. They are useful ideas to test against your own codebase, not independently verified performance results.",
          ],
        },
        {
          heading: "Some users like Claude implementation with Codex review",
          paras: [
            "One discussion describes using Claude Code for planning and execution and Codex to look for edge cases. A separate setup discussion also describes that split, while its author notes the overhead of moving work between agents.",
            "That resembles Nicholas’s preferred implementation and review roles. The practical lesson we take is to pass a compact written brief and a specific revision, rather than repeatedly copying a long conversation between tools.",
          ],
          links: [
            {
              label: "Reddit: combining Claude Code and Codex",
              href: "https://www.reddit.com/r/ClaudeCode/comments/1rh0kuo/anyone_else_using_claude_code_codex_together_way/",
            },
            {
              label: "Reddit: actual workflow and setup discussion",
              href: "https://www.reddit.com/r/codex/comments/1wyzbib/claude_code_codex_users_what_does_your_actual/",
            },
          ],
        },
        {
          heading: "Others reverse the roles",
          paras: [
            "Another thread describes Codex implementing and Claude Code actively reviewing and attempting to exercise the result. Its author reports finding a test that was not exercising the intended product behavior.",
            "That supports trying a separate review role. It does not show that either vendor must always implement or review. Ask the reviewer to inspect the requirement and connected code, and verify the behavior yourself.",
          ],
          links: [
            {
              label: "Reddit: Codex implements, Claude reviews",
              href: "https://www.reddit.com/r/ClaudeAI/comments/1vv7pdk/codex_writes_claude_code_reviews_heres_how_it_went/",
            },
          ],
        },
        {
          heading: "Review loops and frontend preferences have caveats",
          paras: [
            "A reviewer report includes both useful findings and repeated non-issues. Commenters discuss keeping accepted decisions and review rules available to both tools. In a frontend discussion, participants disagree about visual quality and distinguish interface design from the technical implementation.",
            "Our takeaway is to keep a record of resolved findings, give the next tool the same design system, and stop rerunning reviews without a concrete question. Design quality, implementation correctness, and familiarity with a stack are different things to evaluate.",
          ],
          links: [
            {
              label: "Reddit: useful findings and repeated review noise",
              href: "https://www.reddit.com/r/codex/comments/1xcku1r/codex_reviewed_claude_codes_pull_requests_for_3/",
            },
            {
              label: "Reddit: frontend design versus implementation",
              href: "https://www.reddit.com/r/codex/comments/1s4h9hy/frontend_ui_design_performance_comparison/",
            },
          ],
        },
        {
          heading: "How this changes the workflow",
          paras: [
            "Use a defined task, observable acceptance criteria, and a written handoff. Try the alternate tool when a model repeats the same failure after receiving clear feedback. Keep humans responsible for design acceptance and engineering release decisions.",
            "The linked posts mention older models and personal configurations. Use the current model guide for examples rather than copying the settings in an older comment.",
          ],
          links: [
            {
              label: "Current model examples and selection criteria",
              href: "/ai/models",
            },
            {
              label: "Use the handoff and review prompts",
              href: "/prompts/implementation",
            },
          ],
        },
      ],
    },
  },
};

const PROMPTS: Workspace = {
  id: "prompts",
  initials: "PR",
  name: "Prompt library",
  desc: "What to ask, when to ask, and what to check",
  status: "reusable workflow templates",
  accent: "#3edba6",
  accentInk: "#0a7553",
  canonicalBrand: "fst",
  groups: [
    {
      title: "Workflow prompts",
      items: ["index", "discovery", "design", "implementation", "review-release"],
    },
  ],
  items: {
    index: {
      type: "page",
      label: "Start here",
      title: "Prompts for each stage of an AI-assisted software project",
      seoTitle: "AI software development prompt library",
      desc: "Reusable prompts with timing, required context, and review checks for discovery, design, implementation, code review, and release.",
      sections: [
        {
          heading: "Choose a prompt for the stage you are in",
          paras: [
            "Start with discovery if the problem is unclear, design when you need a usable flow, implementation after the scope and design are approved, and review when there is a concrete revision to inspect. These prompts are starting templates rather than a tested guarantee of a correct result.",
            "Replace bracketed fields with verified context. Provide the relevant files and references through your tool’s supported attachments or repository access. Keep credentials and private customer records out of the prompt. Read the proposed actions before letting an agent change a live system.",
          ],
        },
        {
          heading: "The library",
          paras: [
            "Each template says when to use it, what to bring, and what to check. Select the prompt text to copy it into the tool you use.",
          ],
          links: [
            {
              label: "Discovery: a useful brief and acceptance criteria",
              href: "/prompts/discovery",
            },
            {
              label: "Design: a Claude /design brief and Codex asset brief",
              href: "/prompts/design",
            },
            {
              label: "Implementation: a focused change and tool-to-tool handoff",
              href: "/prompts/implementation",
            },
            {
              label: "Review and release: evidence, risks, and recovery",
              href: "/prompts/review-release",
            },
          ],
        },
        {
          heading: "Keep the request concrete",
          paras: [
            "Specify the outcome, constraints, allowed actions, relevant context, and the format of the result. Ask for evidence and open questions rather than an elaborate explanation of hidden reasoning. For reasoning models, OpenAI recommends direct instructions and does not require chain-of-thought prompting.",
          ],
          links: [
            {
              label: "OpenAI: reasoning prompt guidance",
              href: "https://developers.openai.com/api/docs/guides/reasoning-best-practices",
            },
            {
              label: "See the complete AI delivery path",
              href: "/ai/workflow",
            },
            {
              label: "Choose a model for the task",
              href: "/ai/models",
            },
          ],
        },
        {
          heading: "A prompt does not replace the owner",
          paras: [
            "The founder approves the problem and priorities, the designer reviews the experience, and the engineer checks the system behavior. Stop if a required input is missing or a proposed action exceeds the approved scope.",
          ],
          links: [
            {
              label: "Why the engineer still matters",
              href: "/ai/why-an-engineer",
            },
            {
              label: "Why the designer still matters",
              href: "/ai/why-a-designer",
            },
          ],
        },
      ],
    },
    discovery: {
      type: "page",
      label: "Discovery prompts",
      title: "Prompts for discovery and software scope",
      seoTitle: "AI prompts for product discovery and scope",
      desc: "Turn an early idea into a useful brief, then turn an approved workflow into acceptance criteria before asking an agent to build it.",
      sections: [
        {
          heading: "1 · Turn an idea into a decision-ready brief",
          paras: [
            "Use when: the idea is still broad and you do not know what the first build should include. Start in Claude Code or Codex with read-only access to relevant material.",
            "Bring: a description of the audience, current workaround, known constraints, and any source notes. Check: the output separates facts from assumptions and describes a complete user journey.",
          ],
          prompt:
            "Act as a product discovery partner. Do not edit files or build the product.\n\nAudience: [who will use this]\nProblem and current workaround: [what happens today]\nDesired outcome: [what should improve]\nKnown constraints: [budget boundary, date, stack, integrations]\nSource context: [notes or attached references]\n\nProduce a short brief with one core user journey, the smallest useful first release, explicit exclusions, and dependencies that need investigation. Separate confirmed requirements from assumptions. Ask only the questions that would materially change scope or feasibility. Do not invent demand, user research, or results.\n\nFinish with the decisions a founder and engineer need to make before implementation.",
        },
        {
          heading: "2 · Define acceptance and failure cases",
          paras: [
            "Use when: the core journey is agreed but “done” is still vague. This is a planning task before implementation.",
            "Bring: the approved brief, user roles, data boundaries, and relevant existing behavior. Check: the expected results can be verified independently, including a denied-access and a failure case where relevant.",
          ],
          prompt:
            "Create acceptance criteria for the approved journey below. Do not implement changes.\n\nApproved journey: [user, task, expected result]\nRoles and access rules: [who can see and change which records]\nRelevant existing behavior: [files, docs, or examples]\nOut of scope: [explicit exclusions]\n\nDescribe observable success, empty input or results, invalid input, permission denial, and meaningful integration failures. For write operations, cover repeated submission and partial failure where relevant.\n\nGive a small set of checks with explicit inputs and expected outcomes. Identify missing requirements as questions rather than choosing business rules silently. Flag dependencies that need a technical check before a delivery estimate.",
        },
        {
          heading: "Move from the brief into design",
          paras: [
            "Have the founder confirm the outcome and an engineer examine the technical unknowns. Then bring the approved journey into the design stage.",
          ],
          links: [
            {
              label: "Next: design prompts",
              href: "/prompts/design",
            },
            {
              label: "Guide: scoping a first release",
              href: "/blog/scope-first-software-release",
            },
          ],
        },
      ],
    },
    design: {
      type: "page",
      label: "Design and asset prompts",
      title: "Prompts for Claude product design and Codex visual work",
      seoTitle: "Claude design and Codex visual prompts",
      desc: "Brief Claude /design with a real user journey and design system, and brief Codex for a visual asset or landing page with clear acceptance checks.",
      sections: [
        {
          heading: "3 · Explore the product experience with Claude /design",
          paras: [
            "Use when: the core user journey is agreed and you need to explore the interface before implementation. Run /design in Claude Code, then provide this brief and your references.",
            "Bring: the approved journey, actual content, design tokens or components, and mobile requirements. Check: a designer can trace the task through the important states and the developer has a clear handoff.",
          ],
          prompt:
            "Design the following product journey using the attached design system and references.\n\nAudience and goal: [user and task]\nApproved journey and acceptance criteria: [brief]\nExisting components and brand rules: [files or references]\nContent and data examples: [representative, non-sensitive examples]\nConstraints: [devices, accessibility needs, existing navigation]\n\nExplore a focused direction that supports the task. Include loading, empty, error, success, and narrow-screen behavior where relevant. Show labels, hierarchy, keyboard interaction intent, and recovery from mistakes. Reuse existing components where they work.\n\nList design decisions for human review and any assumptions. Provide an implementation handoff with states, components, responsive behavior, and unresolved questions. Do not treat generated visuals as evidence of user research.",
        },
        {
          heading: "4 · Brief a visual asset or landing page in Codex",
          paras: [
            "Use when: you have an approved brand direction and need an image, logo exploration, landing page, or website. Pick one deliverable before running the prompt.",
            "Bring: approved assets and copy, the audience, dimensions or breakpoints, and examples of the intended visual direction. Check: a designer reviews the result in context; an engineer checks any implemented page.",
          ],
          prompt:
            "Create one deliverable: [image / logo direction / landing page / website].\n\nPurpose and audience: [where this will appear and who it serves]\nApproved brand direction: [assets, palette, type, references]\nRequired content: [verified copy and claims]\nOutput requirements: [file format, dimensions, transparency or page breakpoints]\nPrimary action for a page: [what the visitor should do]\n\nUse the appropriate image tool for raster artwork or the existing site components for an implemented page. Preserve supplied logos and brand constraints unless a redesign is explicitly requested. Do not invent testimonials, customer logos, statistics, or endorsements.\n\nFor a page, include responsive and keyboard behavior. For an asset, inspect the crop and legibility at its intended sizes. State the tools used and any limitations in the final artifact. Leave publishing to an explicitly authorized step.",
        },
        {
          heading: "Review before handing it to implementation",
          paras: [
            "Confirm that the design solves the agreed task, uses approved content, and covers the states the implementation needs. Record the accepted direction so the next tool does not reinterpret it from scratch.",
          ],
          links: [
            {
              label: "Next: implementation and handoff prompts",
              href: "/prompts/implementation",
            },
            {
              label: "Why a designer still matters",
              href: "/ai/why-a-designer",
            },
            {
              label: "Claude /design documentation",
              href: "https://support.claude.com/en/articles/14604416-get-started-with-claude-design",
            },
          ],
        },
      ],
    },
    implementation: {
      type: "page",
      label: "Implementation prompts",
      title: "Prompts for implementation and AI tool handoff",
      seoTitle: "AI implementation and handoff prompts",
      desc: "Give Claude Code or Codex a bounded change, then hand the result to the next tool with its requirements, revision, and verification evidence.",
      sections: [
        {
          heading: "5 · Implement an approved change",
          paras: [
            "Use when: the brief, design, and acceptance criteria are ready. Claude Code is Nicholas’s usual implementation starting point; Codex can also own the task.",
            "Bring: the relevant repository, approved design, requirements, and allowed actions. Check: the implementation reaches affected callers and the verification tests behavior rather than repeating the implementation.",
          ],
          prompt:
            "Implement the approved change in this repository.\n\nOutcome and acceptance criteria: [approved requirements]\nDesign reference and required states: [approved design]\nKnown relevant files: [starting points, not an exhaustive scope]\nOut of scope: [exclusions]\nAllowed actions: [local edits and checks, or other explicitly approved actions]\n\nRead the relevant code and callers first. Reuse the existing components, stack, validation, and error handling. Make the smallest complete change, including affected callers, fixtures, and configuration. Do not add an abstraction or dependency without a concrete need.\n\nVerify the behavior with checks appropriate to its risk, including important failure paths. Do not deploy, delete data, change production access, or run a destructive migration without explicit authorization.\n\nReport changed behavior, checks actually run, failures or gaps, and any human decision still required.",
        },
        {
          heading: "6 · Hand work from Claude Code to Codex, or back",
          paras: [
            "Use when: implementation is ready for review, a different tool may help investigate a concrete failure, or another session must continue the work.",
            "Bring: the actual revision and evidence. Check: the receiving tool can locate the work and distinguish decisions from unverified assumptions. Shared requirements should live with the project, not only in a chat.",
          ],
          prompt:
            "Prepare a concise handoff for the next engineering session. Do not make further changes.\n\nGoal and approved scope: [brief or source path]\nDesign reference: [approved source]\nWork revision: [commit or precise diff]\nReceiving task: [review / investigate a named failure / continue a named step]\n\nInclude:\n- Files and connected behavior changed.\n- Acceptance criteria and business rules to preserve.\n- Checks actually run and their results.\n- Exact reproduction steps for remaining failures.\n- Assumptions, unresolved questions, and accepted design decisions.\n- Findings already resolved or explicitly accepted, with evidence.\n- Allowed next actions and actions requiring human authorization.\n\nPoint to repository evidence. Do not claim the change is correct because another model accepted it. Do not include credentials, private customer data, or unnecessary chat history.",
        },
        {
          heading: "Give the reviewer enough context to disagree",
          paras: [
            "The review should start with the requirement and code, not just the implementer’s summary. Use the next prompts to examine the change and prepare an explicit release decision.",
          ],
          links: [
            {
              label: "Next: review and release prompts",
              href: "/prompts/review-release",
            },
            {
              label: "How to review AI-generated code",
              href: "/blog/review-ai-generated-code",
            },
          ],
        },
      ],
    },
    "review-release": {
      type: "page",
      label: "Review and release prompts",
      title: "Prompts for code review and release readiness",
      seoTitle: "AI code review and release prompts",
      desc: "Ask Codex or Claude Code for evidence-backed findings, then prepare a release decision that records verification, operating needs, and recovery.",
      sections: [
        {
          heading: "7 · Review a specific change against the requirement",
          paras: [
            "Use when: there is an identifiable change to inspect. Codex is Nicholas’s usual reviewer; Claude Code can review too. Start with read-only access and explicitly permitted non-destructive checks.",
            "Bring: the approved requirement, revision, business rules, and previous review decisions. Check: each material finding has evidence and a consequence; a human resolves it rather than counting model approvals.",
          ],
          prompt:
            "Review this change. Do not edit files or production data.\n\nRequirement and acceptance criteria: [source]\nRevision or diff: [exact change]\nImportant business rules and design decisions: [source]\nPrevious findings and resolutions: [source, if any]\nAllowed verification actions: [read-only inspection and named safe checks]\n\nRead the connected code and callers, not only the diff. Prioritize incorrect behavior, authorization boundaries, data loss, partial failure, regressions, and missing checks for material risk. Check whether the tests exercise the real product behavior.\n\nFor each finding, give severity, file and location, a concrete scenario, evidence or reproduction steps, and user impact. Separate confirmed defects from questions. Do not repeat a resolved finding without new evidence. If no material finding is supported, say so and state the verification limits. Do not give a safety guarantee.",
        },
        {
          heading: "8 · Prepare a release decision and handoff",
          paras: [
            "Use when: implementation and review are complete enough for the release owner to decide. This prompt prepares evidence; it does not authorize deployment.",
            "Bring: the final revision, review resolutions, check output, deployment process, and recovery requirements. Check: the owner can see what is ready, what is unknown, and who is responsible afterward.",
          ],
          prompt:
            "Prepare a release-readiness note for human review. Do not deploy or modify data.\n\nCandidate revision: [exact version]\nAcceptance criteria and check results: [evidence]\nReview findings and resolutions: [record]\nDeployment and configuration: [current process]\nData changes and recovery requirements: [details or none]\nSupport owner and access handoff: [agreed responsibilities]\n\nList what is verified, what is not verified, unresolved blockers, required configuration or permissions, and checks to run after deployment. Explain recovery limits, including whether reverting code would leave data changes behind.\n\nRecord the AI tools and model versions used when known; mark unknown values as unknown. Note any approved usage costs and unresolved billing terms without inventing amounts.\n\nEnd with the specific decisions the release owner must make and the operating information the team needs after handoff.",
        },
        {
          heading: "Use the result to make a human decision",
          paras: [
            "A release note is useful when it points to evidence and makes uncertainty visible. It does not replace a deployment policy, the agreed support arrangement, or the engineer’s understanding of the system.",
          ],
          links: [
            {
              label: "See the complete delivery path",
              href: "/ai/workflow",
            },
            {
              label: "AI usage and billing transparency",
              href: "/ai/resources",
            },
            {
              label: "Discuss engineering review support",
              href: "/services/codebase-rescue",
            },
          ],
          cta: "message",
          ctaLabel: "Discuss an AI-assisted project →",
        },
      ],
    },
  },
};

(BLOG.items.index as PageItem).sections.splice(1, 0, {
  heading: "Build with Claude Code and Codex",
  paras: [
    "Follow the AI-assisted delivery lifecycle, understand the engineering and design roles, compare team models, and use prompts for the stage you are in.",
  ],
  links: [
    { label: "Read the AI delivery playbook", href: "/ai" },
    { label: "Choose tools and models for the task", href: "/ai/models" },
    { label: "Open the prompt library", href: "/prompts" },
    { label: "Read our Reddit workflow research", href: "/ai/community-research" },
  ],
});

const PERSONAL_RESOURCES = [
  {
    label: "At FST: build with me",
    href: new URL("/services/ai-development-coaching", BRANDS.fst.url).href,
  },
  { label: "At FST: my AI delivery workflow", href: new URL("/ai/workflow", BRANDS.fst.url).href },
  { label: "At FST: practical engineering articles", href: new URL("/blog", BRANDS.fst.url).href },
  { label: "At FST: prompts and when to use them", href: new URL("/prompts", BRANDS.fst.url).href },
];

for (const home of [PERSONAL_HOME, FST_HOME]) {
  const personal = home === PERSONAL_HOME;
  const about = home.items.about as PageItem;
  about.sections.splice(2, 0, {
    heading: personal ? "Explore my work and writing" : "Explore the work and guides",
    paras: personal
      ? [
          "The product pages here explain my contribution and engineering decisions. I publish the practical guides and AI resources at Full Stack Technologies, the studio I lead.",
        ]
      : [],
    links: [
      { label: "Paradox: interactive storytelling", href: "/paradox/overview" },
      { label: "Timetrack: AI session tracking and reports", href: "/timetrack/overview" },
      { label: "Constellation: multi-client planning", href: "/constellation/overview" },
      { label: "Helm: client and agent decisions", href: "/helm/overview" },
      { label: "Nemo: portable AI identities", href: "/nemo/overview" },
      { label: "Snake n Friends: a head-to-head mobile game", href: "/snakenfriends/overview" },
      { label: "Coverly: insurance policies, answered", href: "/coverly/overview" },
      ...(personal
        ? PERSONAL_RESOURCES
        : [
            { label: "Build your first app release", href: "/services/product-development" },
            { label: "Review your app or prototype", href: "/services/codebase-rescue" },
            { label: "Learn to build with AI", href: "/services/ai-development-coaching" },
            { label: "Read the product engineering blog", href: "/blog" },
            { label: "How we build with Claude Code and Codex", href: "/ai" },
            { label: "Prompts for each stage of delivery", href: "/prompts" },
          ]),
    ],
  });
  for (const id of home.groups[0].items) {
    const item = home.items[id];
    if (item.type !== "page" || id === "about" || id === "off-clock") continue;
    item.sections.push({
      heading: personal ? "Continue exploring" : "Choose the next step",
      paras: [
        personal
          ? "Explore the decisions behind my product work, or use the guides at Full Stack Technologies. If you'd like to work through your own project together, tell me where you're starting."
          : "Bring the problem, what already exists, and the outcome you need. We can use that context to discuss a focused next step.",
      ],
      links: personal
        ? [
            { label: "Explore my product work", href: "/" },
            ...PERSONAL_RESOURCES,
            {
              label: "Work with my studio",
              href: new URL("/services/product-development", BRANDS.fst.url).href,
            },
          ]
        : [
            { label: "Build your first app release", href: "/services/product-development" },
            { label: "App review and codebase rescue", href: "/services/codebase-rescue" },
            { label: "Build with me: AI coaching", href: "/services/ai-development-coaching" },
            { label: "Fractional CTO and embedded engineering", href: "/services/fractional-cto" },
            { label: "Practical product engineering guides", href: "/blog" },
            { label: "AI tools, workflow, and resources", href: "/ai" },
            { label: "Reusable prompts and when to use them", href: "/prompts" },
          ],
      cta: "message",
      ctaLabel: personal ? "Tell me what you're working on →" : "Discuss your app →",
    });
  }
}

const PROJECT_FRAMING: Record<
  string,
  { personal: Partial<ShowcaseItem>; fst: Partial<ShowcaseItem> }
> = {
  paradox: {
    personal: {
      seoTitle: "Paradox — my approach to interactive storytelling",
      summary:
        "I designed and built Paradox around branching stories. Explore my approach to the canvas, guest-first onboarding, search, and readable story details.",
      tagline: "My approach to making connected stories explorable.",
      context: [
        {
          heading: "My contribution and decisions",
          paras: [
            "I designed and built the product end to end. The central interaction is a timeline canvas: it needs to show a connected story without making readers lose their place.",
            "Guest access, a command palette, and a details panel give readers several ways to explore. The examples below show how I connect navigation, information hierarchy, and interaction behavior.",
          ],
        },
      ],
    },
    fst: {
      context: [
        {
          heading: "The problem this approach addresses",
          paras: [
            "Products with connected information need ways to explore detail while retaining context. Paradox demonstrates a canvas, search, and a side panel working together around that problem.",
            "For a new product engagement, the useful questions are which journey readers need first, where onboarding belongs, and how the interface behaves with more content. The examples show capabilities to discuss against your own requirements.",
          ],
        },
      ],
    },
  },
  timetrack: {
    personal: {
      seoTitle: "Timetrack — my approach to inspectable activity data",
      summary:
        "I designed and built Timetrack to make AI coding activity inspectable. Explore my decisions around parallel sessions, raw records, and traceable reports.",
      tagline: "My approach to activity records you can inspect.",
      context: [
        {
          heading: "My contribution and decisions",
          paras: [
            "I designed and built the product end to end. My focus here is how to turn session activity into a view that can be understood and checked, including when several sessions overlap.",
            "The dashboard, audit trail, and reporting views make the source of a total visible. Separating session duration from elapsed human time is part of presenting the data honestly.",
          ],
          links: [
            {
              label: "How I work through a decision like this with you",
              href: "/home/working-through-a-build",
            },
            {
              label: "Read the full Timetrack walkthrough at FST",
              href: new URL("/blog/timetrack-session-reporting", BRANDS.fst.url).href,
            },
          ],
        },
      ],
    },
    fst: {
      context: [
        {
          heading: "The problem this approach addresses",
          paras: [
            "Operational software often needs to turn activity records into decisions and reports. Timetrack demonstrates dashboards, an audit trail, and reporting rules that keep the calculation inspectable.",
            "For a founder building an app, these patterns turn a vague requirement into decisions you can check: what counts, which records support the result, and how a correction affects a saved report. Recorded session time remains distinct from human effort and any commercial agreement.",
          ],
          links: [
            {
              label: "Inside Timetrack: the session records and reporting decisions",
              href: "/blog/timetrack-session-reporting",
            },
          ],
        },
      ],
    },
  },
  constellation: {
    personal: {
      seoTitle: "Constellation — my approach to prioritization",
      summary:
        "I designed and built Constellation around multi-client planning. Explore my decisions on ranked work, plan branches, forecast ranges, and client visibility.",
      tagline: "My approach to making planning decisions visible.",
      context: [
        {
          heading: "My contribution and decisions",
          paras: [
            "I designed and built the product end to end. My focus is making planning decisions visible: why a task comes first, what a proposed change affects, and which information a client should see.",
            "The ranked queue, plan branches, and forecast ranges present those decisions in different ways. The client portal makes the boundary between internal planning and external status part of the interface.",
          ],
        },
      ],
    },
    fst: {
      context: [
        {
          heading: "The problem this approach addresses",
          paras: [
            "Teams balancing work across clients need to compare priorities and understand the effect of a plan change. Constellation demonstrates a ranked queue, branching plans, and forecasts that show uncertainty.",
            "A client-facing view raises a separate requirement: useful status without exposing internal rates, priorities, or other clients. These examples provide a starting point for discussing a planning tool or client portal.",
          ],
        },
      ],
    },
  },
  helm: {
    personal: {
      seoTitle: "Helm — my approach to client and agent decisions",
      summary:
        "I designed and built Helm around one decision at a time. Explore my approach to agent activity, client context, rules, and review before sending.",
      tagline: "My approach to turning client and agent activity into decisions.",
      context: [
        {
          heading: "My contribution and decisions",
          paras: [
            "I designed and built the product end to end. My focus is making the next decision clear when client conversations and agent runs compete for attention.",
            "The decision deck, client board, and plain-language rules connect the work to its context. Per-client settings make access, communication preferences, and review part of the experience.",
          ],
        },
      ],
    },
    fst: {
      context: [
        {
          heading: "The problem this approach addresses",
          paras: [
            "Client operations can span messages, delivery work, and agents that need an answer. Helm demonstrates bringing those inputs into a ranked decision deck while retaining a view of each client.",
            "The examples provide discussion points for an operations tool: how decisions are prioritized, what needs human review, and how client-specific access and communication rules stay visible.",
          ],
        },
      ],
    },
  },
  nemo: {
    personal: {
      seoTitle: "Nemo — my approach to portable AI memory",
      summary:
        "I designed and built Nemo around AI memory you own. Explore my approach to importing history, distilling it into identities, and carrying a compact copy into any model.",
      tagline: "My approach to AI memory that travels between models.",
      context: [
        {
          heading: "My contribution and decisions",
          paras: [
            "I designed and built the product end to end. My focus is making accumulated AI context something you own: kept in one place, organized by the people, companies and projects it describes, and readable in plain language.",
            "The launch flow shows exactly what is being sent and how much smaller it is than the raw history, and nothing learned in a model is added back without review. Keeping identities encrypted on the device makes the boundary between what stays and what travels part of the interface.",
          ],
        },
      ],
    },
    fst: {
      context: [
        {
          heading: "The problem this approach addresses",
          paras: [
            "People who work across several AI models end up repeating the same background in each one, and the context they build lives in separate silos. Nemo demonstrates importing that history, organizing it into identities and assembling a compact package for any model.",
            "The examples provide discussion points for an AI product: what gets distilled and how it is traced to its sources, what leaves the device and when, and how learning from a model is reviewed before it is kept.",
          ],
        },
      ],
    },
  },
  snakenfriends: {
    personal: {
      seoTitle: "Snake n Friends — my approach to a fair, replayable mobile game",
      summary:
        "I designed and built Snake n Friends, a mobile snake game with a 60-sector campaign and ranked 1v1 arenas. Explore my approach to a deterministic engine the server can replay, head-to-head series, and rewards that are granted exactly once.",
      tagline: "My approach to a mobile game where every score can be checked.",
      context: [
        {
          heading: "My contribution and decisions",
          paras: [
            "I designed and built the game end to end: the engine and renderer, the campaign and arena, the Cloud Functions behind them, purchases, notifications and the admin tools for the store.",
            "The central decision is a deterministic engine. Because a run is just a seed and a list of turns, the server can replay it to settle scores and rating changes, and the same tests that pin the engine down protect both the app and the backend.",
          ],
        },
      ],
    },
    fst: {
      context: [
        {
          heading: "The problem this approach addresses",
          paras: [
            "Competitive mobile games have to trust a score that was produced on a player’s phone. Snake n Friends demonstrates a deterministic engine the server replays before a result counts, alongside matchmaking, seasons and a store.",
            "The examples provide discussion points for a consumer mobile product: what runs on the device and what the server verifies, how purchases are granted once even when the store calls back twice, and how a release reaches nine languages.",
          ],
        },
      ],
    },
  },
  coverly: {
    personal: {
      seoTitle: "Coverly — my approach to AI answers you can check against the policy",
      summary:
        "I designed and built Coverly, a mobile wallet for every insurance policy. Explore my approach to reading documents into fields people confirm, answers that quote the page they came from, and renewal reminders that keep the next date visible.",
      tagline: "My approach to AI that shows its source.",
      context: [
        {
          heading: "My contribution and decisions",
          paras: [
            "I designed and built Coverly end to end: capture and document extraction, the review step, the wallet and policy pages, cited answers, renewal reminders, Face ID and the subscription.",
            "The central decision is that the AI never has the last word. Extraction is handed back for review with its uncertain fields marked, and every answer quotes the policy language and page it relied on, so a person can check it before acting on it.",
          ],
        },
      ],
    },
    fst: {
      context: [
        {
          heading: "The problem this approach addresses",
          paras: [
            "Insurance documents are long, scattered across inboxes and drawers, and hard to read when something has just gone wrong. Coverly demonstrates turning them into structured, confirmed records and answering questions from them with citations.",
            "The examples provide discussion points for an AI product in a regulated area: where a person confirms what the model extracted, how answers are grounded in and traced to source documents, and what data each feature uses and where it is processed.",
          ],
        },
      ],
    },
  },
};

function projectsFor(brand: BrandId): Workspace[] {
  return PROJECTS.map((ws) => ({
    ...ws,
    items: {
      ...ws.items,
      overview: { ...(ws.items.overview as ShowcaseItem), ...PROJECT_FRAMING[ws.id][brand] },
    },
  }));
}

const BRAND_WORKSPACES: Record<BrandId, Workspace[]> = {
  personal: [PERSONAL_HOME, ...projectsFor("personal")],
  fst: [FST_HOME, ...projectsFor("fst"), SERVICES, BLOG, AI_PLAYBOOK, PROMPTS],
};

export function workspacesFor(brand: BrandId): Workspace[] {
  return BRAND_WORKSPACES[brand];
}
