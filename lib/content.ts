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
  | "gateway"
  | "palette"
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
    title: "The living timeline",
    kind: "Discovery",
    product: "Paradox",
    year: "2026",
    prod: false,
    accent: "#3edba6",
    code: {
      file: "MultiverseTimeline.tsx",
      lang: "tsx",
      src: `// The homepage is the graph itself — no feed, no grid.
export function MultiverseTimeline({ graph }: { graph: Graph }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [selected, setSelected] = useState<Node | null>(null)

  useRaf((t) => {
    const ctx = canvas.current!.getContext('2d')!
    drawStrands(ctx, graph.timelines, t)
    drawBranches(ctx, graph.branches, t)
    drawNodes(ctx, graph.nodes, t)
  })

  return (
    <canvas
      ref={canvas}
      onPointerDown={beginTraverse}
      onClick={(e) => setSelected(hitTest(graph, e))}
    />
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
  palette: {
    title: "Command palette",
    kind: "Discovery",
    product: "Paradox",
    year: "2026",
    prod: false,
    accent: "#3edba6",
    code: {
      file: "CommandPalette.tsx",
      lang: "tsx",
      src: `// One Cmd-K index carries the whole navigation.
export function CommandPalette({ index }: { index: Entry[] }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const groups = useMemo(() => groupByKind(search(index, q)), [index, q])

  useHotkey('cmd+k', open)
  return (
    <Dialog>
      <Input value={q} onChange={setQ} placeholder='Search the multiverse' />
      {groups.map((g) => (
        <Group key={g.kind} label={g.kind}>
          {g.items.map((it) => <Result key={it.id} entry={it} active={it === sel} />)}
        </Group>
      ))}
    </Dialog>
  )
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
    tags: ["Product concept", "Canvas 2D", "Vanilla JS", "6 screens", "Design system"],
    groups: [
      { title: "Project", items: ["overview"] },
      { title: "Components", items: ["living-timeline", "gateway-comp", "palette-comp"] },
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
              "Six screens deep — homepage, sign-in, explore, timeline, event and branch views — all on one design system: emerald on void, Cormorant Garamond for the stories.",
              "Open any component in the left rail to see it running, then flip it to Code to read the real thing.",
            ],
          },
        ],
      },
      "living-timeline": {
        label: "The living timeline",
        type: "comp",
        frag: "multiverse",
        desc: "The homepage is a place, not a page",
        paras: [
          "The homepage in miniature. Drag to traverse the multiverse, click a node to see what lives there. The real one runs full-screen with zoom and a guided tour — this is the postcard version.",
        ],
      },
      "gateway-comp": {
        label: "Sign-in gateway",
        type: "comp",
        frag: "gateway",
        desc: "Guest-first, passwords never",
        paras: [
          "Try it: any email works, and the magic link can be “opened” right here. Note what's missing — a password field, and any demand to sign up before you've seen the multiverse.",
        ],
      },
      "palette-comp": {
        label: "Command palette",
        type: "comp",
        frag: "palette",
        desc: "The only menu in the product",
        paras: [
          "Search carries the whole navigation. Type a few letters — timelines, branches and events surface in groups; arrows and enter to dive in.",
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
