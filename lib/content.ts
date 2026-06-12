// ============================================================
// THE WORKSPACE v2 — all copy & content, ported from the design.
// Items are pages ("page"), live components ("comp"), or the
// cross-project library ("library").
// ============================================================

export const PH = {
  NAME: "Nicholas Howell",
  FIRST: "Nicholas",
  YEARS: "10",
  EMAIL: "nickhowell6425@gmail.com",
  STATUS_LINE: "Multiple multi-million valuations · 0 abandoned codebases",
  FOOTER: "⌘K — jump to any project or component",
} as const;

export const KINDS = [
  "All",
  "Auth",
  "Discovery",
  "Dashboards",
  "Commerce",
  "Onboarding",
  "Admin",
] as const;

export type Kind = (typeof KINDS)[number];

export type FragmentId =
  | "multiverse"
  | "spine"
  | "ribbon"
  | "gateway"
  | "divergence"
  | "onboarding"
  | "notifications"
  | "admin"
  | "booking"
  | "kyc"
  | "status";

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
  frag: FragmentId;
  kicker: string;
  lead: string;
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

export type SidebarItem = PageItem | CompItem | WsLinkItem | LibraryItem;

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
  tags: string[];
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
  onboarding: {
    title: "Onboarding",
    kind: "Onboarding",
    product: "Shiftsum",
    year: "2022",
    prod: false,
    accent: "#e3a84e",
    code: {
      file: "Onboarding.tsx",
      lang: "tsx",
      src: `// Nine fields became three questions with smart defaults.
const STEPS = [TeamSize, ShiftPattern, InviteManagers]

export function Onboarding() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(defaults())  // guesses well

  function next(patch: Partial<Setup>) {
    setAnswers({ ...answers, ...patch })
    step < STEPS.length - 1 ? setStep(step + 1) : finish(answers)
  }

  const Step = STEPS[step]
  return (
    <Card>
      <Progress value={step} total={STEPS.length} />
      <Step answers={answers} onNext={next} />
    </Card>
  )
}`,
    },
  },
  notifications: {
    title: "Notification preferences",
    kind: "Admin",
    product: "Shiftsum",
    year: "2022",
    prod: false,
    accent: "#e3a84e",
    code: {
      file: "NotificationPrefs.tsx",
      lang: "tsx",
      src: `// Defaults are the product: quiet by default, loud only when it matters.
const DEFAULTS = {
  shift: true, swap: true, digest: true,
  market: false,            // off on purpose
  quiet: { enabled: true, from: '22:00', to: '07:00' },
}

export function NotificationPrefs() {
  const [prefs, setPrefs] = usePrefs(DEFAULTS)
  const set = (k: string, v: unknown) => setPrefs({ ...prefs, [k]: v })

  return (
    <Card>
      <Toggle label='Your shift changed' checked={prefs.shift} onChange={(v) => set('shift', v)} />
      <Toggle label='Swap requests' checked={prefs.swap} onChange={(v) => set('swap', v)} />
      <QuietHours value={prefs.quiet} onChange={(v) => set('quiet', v)} />
    </Card>
  )
}`,
    },
  },
  admin: {
    title: "Roster admin",
    kind: "Admin",
    product: "Shiftsum",
    year: "2023",
    prod: false,
    accent: "#e3a84e",
    code: {
      file: "RosterAdmin.tsx",
      lang: "tsx",
      src: `// Instant, client-side, forgives typos. ~20 min/day became ~4.
export function RosterAdmin({ people }: { people: Person[] }) {
  const [q, setQ] = useState('')
  const [role, setRole] = useState('All')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const rows = useMemo(
    () => people.filter((p) => matchesRole(p, role) && fuzzy(p, q)),
    [people, role, q],
  )

  async function approveSelected() {
    await api.approve([...selected])   // no page reload
    setSelected(new Set())
  }

  return (
    <Table rows={rows} selected={selected} onSelect={setSelected} onApprove={approveSelected} />
  )
}`,
    },
  },
  booking: {
    title: "Booking widget",
    kind: "Commerce",
    product: "Client: physio clinic",
    year: "2024",
    prod: true,
    accent: "#a98bf5",
    code: {
      file: "BookingWidget.tsx",
      lang: "tsx",
      src: `// A widget, not an app — it drops into the clinic's existing site.
export function BookingWidget({ clinicId }: { clinicId: string }) {
  const [day, setDay] = useState(today())
  const [slot, setSlot] = useState<Slot | null>(null)
  const slots = useAvailability(clinicId, day)   // buffers + double-booking guards

  async function confirm() {
    if (!slot) return
    await book({ clinicId, slot })   // two-way calendar sync
    setConfirmed(true)
  }

  return (
    <Widget>
      <DayStrip value={day} onChange={setDay} />
      <SlotGrid slots={slots} value={slot} onPick={setSlot} />
      <Confirm disabled={!slot} onClick={confirm} />
    </Widget>
  )
}`,
    },
  },
  kyc: {
    title: "Identity verification",
    kind: "Onboarding",
    product: "Client: fintech",
    year: "2025",
    prod: true,
    accent: "#a98bf5",
    code: {
      file: "IdentityCheck.tsx",
      lang: "tsx",
      src: `// The senior move was NOT building this — just the glue around a vendor.
const STEPS = ['id', 'selfie', 'address'] as const

export function IdentityCheck() {
  const [done, setDone] = useState<Record<string, boolean>>({})

  async function upload(step: string, file: File) {
    const ref = await vendor.submit(step, file)
    const ok = await pollStatus(ref)      // retries + timeouts + webhooks
    audit.log(step, ref, ok)              // compliance wants receipts
    setDone((d) => ({ ...d, [step]: ok }))
  }

  return STEPS.map((s) => (
    <Step key={s} id={s} done={done[s]} onUpload={(f) => upload(s, f)} />
  ))
}`,
    },
  },
  status: {
    title: "Public status page",
    kind: "Dashboards",
    product: "Client: SaaS API",
    year: "2025",
    prod: true,
    accent: "#a98bf5",
    code: {
      file: "StatusPage.tsx",
      lang: "tsx",
      src: `// Honest when it isn't green. A two-day build that halved support tickets.
export function StatusPage({ services }: { services: Service[] }) {
  const [range, setRange] = useState<'30d' | '90d'>('90d')
  const checks = useHealthChecks(services)   // pinged every 60s from 3 regions

  return (
    <Page>
      <Banner ok={checks.every((c) => c.up)} />
      {services.map((svc) => (
        <Row key={svc.id} name={svc.name} uptime={svc.uptime}>
          <UptimeBars days={range === '30d' ? 30 : 90} incidents={svc.incidents} />
        </Row>
      ))}
      <IncidentLog entries={incidents} />
    </Page>
  )
}`,
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

export const WORKSPACES: Workspace[] = [
  {
    id: "home",
    initials: "NH",
    name: PH.NAME,
    desc: "The person behind the products",
    status: "a living showcase",
    accent: "#5b8def",
    tags: [],
    groups: [
      { title: "Profile", items: ["about", "how-i-work", "straight-answers", "off-clock"] },
      { title: "Library", items: ["go-paradox", "go-shiftsum", "go-clients", "component-library"] },
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
      "go-shiftsum": {
        label: "Shiftsum",
        type: "ws",
        ws: "shiftsum",
        desc: "Shift scheduling for hourly teams",
      },
      "go-clients": {
        label: "Client builds",
        type: "ws",
        ws: "clients",
        desc: "Selected engagements, 2–12 weeks",
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
    tags: ["Product concept", "Canvas 2D", "Vanilla JS", "7 screens", "Design system"],
    groups: [
      { title: "Project", items: ["overview"] },
      {
        title: "Components",
        items: ["timeline-view", "reality-ribbon", "branch-cards", "gateway-comp"],
      },
      { title: "Library", items: ["component-library"] },
    ],
    items: {
      overview: {
        label: "Overview",
        type: "page",
        desc: "A storytelling app where the timeline is the interface",
        hero: {
          frag: "multiverse",
          kicker: "the homepage",
          lead: "No feed. No thumbnail grid. You land inside a living graph of stories and traverse it — drag, zoom, click a node, enter a reality.",
        },
        sections: [
          {
            paras: [
              "Paradox is a product concept: collaborative storytelling as a multiverse. Every story is a Sacred Timeline; every “what if” forks it into a branch; every branch is an alternate reality written by its readers.",
              "Seven screens on one design system — homepage, sign-in, explore, timeline, event and branch views, plus the sheet that defines them: emerald is canon, gold is divergence, Cormorant Garamond carries the stories.",
              "Four of those screens run as miniatures in the left rail. Each one is rebuilt, not screenshotted — flip any of them to Code to read the real thing.",
            ],
          },
        ],
      },
      "timeline-view": {
        label: "Timeline View",
        type: "comp",
        frag: "spine",
        desc: "One universe as a flight deck",
        paras: [
          "The Ninth Signal's whole canon on a single spine — eight chapters, branches forking off the gold one where everything changed. Drag to pan, scrub the minimap, click a node, or press tour and let it walk the chapters. The full screen adds zoom and a four-tab inspector; this is the postcard.",
        ],
      },
      "reality-ribbon": {
        label: "Branch View",
        type: "comp",
        frag: "ribbon",
        desc: "What changed at 02:09",
        paras: [
          "A branch in one strip: four chapters of shared canon, a gold diamond where this reality answered differently, then five chapters it wrote for itself. The split panel underneath states the divergence both ways — in canon, and in this reality. Click any node on the ribbon.",
        ],
      },
      "branch-cards": {
        label: "Branch cards",
        type: "comp",
        frag: "divergence",
        desc: "Every fork answers “what changed?”",
        paras: [
          "Six realities fork from Chapter V, and every card leads with its divergence — a one-sentence answer to what changed, never optional in this design. Sorting is live, and the trending tags are the ones the data says are hot, not the layout.",
        ],
      },
      "gateway-comp": {
        label: "Sign-in gateway",
        type: "comp",
        frag: "gateway",
        desc: "Guest-first, passwords never",
        paras: [
          "Try it: any email works, the magic link can be “opened” right here, and you get a keeper name with a generated sigil instead of a profile form. Note what's missing — a password field, and any demand to sign up before you've seen the multiverse.",
        ],
      },
      "component-library": LIBRARY,
    },
  },
  {
    id: "shiftsum",
    initials: "S",
    name: "Shiftsum",
    desc: "Shift scheduling for hourly teams",
    status: "acquired 2023",
    accent: "#e3a84e",
    tags: ["React", "Ruby on Rails", "Postgres", "Redis", "Twilio"],
    groups: [
      { title: "Project", items: ["overview"] },
      { title: "Components", items: ["onboarding", "notifications", "admin"] },
      { title: "Library", items: ["component-library"] },
    ],
    items: {
      overview: {
        label: "Overview",
        type: "page",
        desc: "Built, grown, acquired",
        hero: {
          frag: "admin",
          kicker: "the screen managers lived in",
          lead: "Search, filter, bulk-approve, zero page reloads. The roster screen that took ~20 minutes a day down to ~4.",
        },
        sections: [
          {
            paras: [
              "Shiftsum scheduled shifts for restaurants and clinics — 280 teams at peak. Built it with one co-founder, sold it to a workforce-management company in 2023.",
              "The components in the left rail are from the version that got acquired. Flip any of them to Code to read the real implementation.",
            ],
          },
        ],
      },
      onboarding: {
        label: "Onboarding",
        type: "comp",
        frag: "onboarding",
        desc: "From 9 fields to 3 questions",
        paras: [
          "Onboarding went from nine fields to three questions. Everything else gets a sensible default you can change later. Activation went up 34%. Walk through it — takes twenty seconds.",
        ],
      },
      notifications: {
        label: "Notifications",
        type: "comp",
        frag: "notifications",
        desc: "Quiet by default",
        paras: [
          "Shift workers sleep at odd hours, so notifications default to quiet: digests instead of pings, loud only for “your shift changed.” Unsubscribe rate stayed under 1% — for a product whose whole job is interrupting you.",
        ],
      },
      admin: {
        label: "Roster admin",
        type: "comp",
        frag: "admin",
        desc: "The screen managers lived in",
        paras: [
          "Managers lived in this roster screen about 20 minutes a day. Search, filters and bulk-approve cut it to about 4. It's the least glamorous screen in this portfolio — and the one users thanked us for most.",
        ],
      },
      "component-library": LIBRARY,
    },
  },
  {
    id: "clients",
    initials: "CB",
    name: "Client builds",
    desc: "Selected engagements, 2–12 weeks",
    status: "3 of 9 shown",
    accent: "#a98bf5",
    tags: ["Next.js", "TypeScript", "Stripe", "Vendor APIs", "Webhooks"],
    groups: [
      { title: "Project", items: ["overview"] },
      { title: "Components", items: ["booking-widget", "kyc-flow", "status-page"] },
      { title: "Library", items: ["component-library"] },
    ],
    items: {
      overview: {
        label: "Overview",
        type: "page",
        desc: "Other people's products, same standards",
        hero: {
          frag: "status",
          kicker: "a public status page",
          lead: "A two-day build. The week it shipped the client's API had a bad day — and support tickets halved, because customers could watch the fix happen.",
        },
        sections: [
          {
            paras: [
              "A few pieces from client work. Different products, different industries — same job: make the right thing, make it hold up, hand it over clean.",
              "Names are blurred where contracts say so. The numbers and the decisions are real. Open any component on the left, then flip it to Code to see how it's built.",
            ],
          },
        ],
      },
      "booking-widget": {
        label: "Booking widget",
        type: "comp",
        frag: "booking",
        desc: "A physio clinic, off the phone",
        paras: [
          "A physio clinic was taking every appointment by phone. This widget sits on their existing site — 41% of bookings now happen after office hours, when the front desk is asleep.",
        ],
      },
      "kyc-flow": {
        label: "Identity verification",
        type: "comp",
        frag: "kyc",
        desc: "The code I didn't write",
        paras: [
          "A fintech client needed identity verification. The senior move was NOT building it: I recommended a vendor and built the glue around it. Saved roughly four months and a compliance headache. Sometimes the most valuable code is the code you don't write.",
        ],
      },
      "status-page": {
        label: "Status page",
        type: "comp",
        frag: "status",
        desc: "Two days, lasting trust",
        paras: [
          "A two-day build: a public status page for a client's API. The week it launched their API had a bad day — and support tickets halved, because customers could see what was happening and when it would be fixed. Trust is a feature. Sometimes it costs two days.",
        ],
      },
      "component-library": LIBRARY,
    },
  },
];
