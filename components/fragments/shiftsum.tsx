import { useFragState } from "@/components/providers/fragment-state";
import { FButton, FCard, FDone, FGhostButton, FInput, FSeg, FToggle, MONO } from "./ui";

const A = "#e3a84e";

// ---------- onboarding ----------

interface OnboardingState extends Record<string, unknown> {
  step: number;
  size: string;
  pattern: string;
  emails: string;
  done: boolean;
}

export function Onboarding() {
  const [st, set] = useFragState<OnboardingState>("onboarding", {
    step: 0,
    size: "",
    pattern: "",
    emails: "",
    done: false,
  });

  if (st.done) {
    return (
      <FCard w={400} accent={A} name="Shiftsum">
        <FDone
          accent={A}
          title="Your team is set up"
          sub="Sensible defaults applied — change anything later, when you actually care."
          resetLabel="run it again"
          onReset={() => set({ step: 0, size: "", pattern: "", emails: "", done: false })}
        />
      </FCard>
    );
  }

  const chipRow = (opts: string[], cur: string, key: "size" | "pattern") => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
      {opts.map((o) => (
        <button
          key={o}
          aria-pressed={cur === o}
          onClick={() => set({ [key]: o } as Partial<OnboardingState>)}
          style={{
            height: 44,
            padding: "0 16px",
            borderRadius: 10,
            cursor: "pointer",
            fontSize: 13.5,
            fontWeight: 600,
            border: `1.5px solid ${cur === o ? A : "var(--border2)"}`,
            background: cur === o ? `${A}1e` : "transparent",
            color: cur === o ? "var(--text)" : "var(--dim)",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );

  const steps = [
    {
      q: "How big is the team?",
      body: chipRow(["Just me", "2–10", "11–50", "50+"], st.size, "size"),
      ok: !!st.size,
    },
    {
      q: "What's the shift pattern?",
      body: chipRow(["Same every week", "Rotating", "Chaos, honestly"], st.pattern, "pattern"),
      ok: !!st.pattern,
    },
    {
      q: "Invite your managers",
      body: (
        <div>
          <FInput
            accent={A}
            value={st.emails}
            placeholder="maria@team.com, sam@team.com"
            aria-label="Manager emails"
            onChange={(e) => set({ emails: e.target.value })}
          />
          <div style={{ fontFamily: MONO, fontSize: 10.5, color: "var(--faint)", marginTop: 7 }}>
            or skip — everything works without it
          </div>
        </div>
      ),
      ok: true,
    },
  ];

  const cur = steps[st.step];

  return (
    <FCard w={400} accent={A} name="Shiftsum">
      <div>
        <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
          {steps.map((_, i) => (
            <span
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i <= st.step ? A : "var(--surface2)",
                transition: "background .3s",
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: ".07em",
            textTransform: "uppercase",
            color: "var(--faint)",
          }}
        >
          step {st.step + 1} of 3
        </div>
        <div style={{ fontWeight: 800, fontSize: 16.5, margin: "3px 0 12px" }}>{cur.q}</div>
        {cur.body}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {st.step > 0 ? <FGhostButton label="← Back" onClick={() => set({ step: st.step - 1 })} /> : null}
          <span style={{ flex: 1 }} />
          <FButton
            label={st.step === 2 ? (st.emails.trim() ? "Send invites & finish" : "Skip & finish") : "Next →"}
            onClick={() => {
              if (st.step === 2) set({ done: true });
              else set({ step: st.step + 1 });
            }}
            accent={A}
            disabled={!cur.ok}
          />
        </div>
      </div>
    </FCard>
  );
}

// ---------- notification preferences ----------

interface NotificationsState extends Record<string, unknown> {
  shift: boolean;
  swap: boolean;
  digest: boolean;
  market: boolean;
  quiet: boolean;
  from: string;
  to: string;
  freq: string;
}

export function NotificationPrefs() {
  const [st, set] = useFragState<NotificationsState>("notifications", {
    shift: true,
    swap: true,
    digest: true,
    market: false,
    quiet: true,
    from: "22:00",
    to: "07:00",
    freq: "Daily",
  });

  const row = (key: "shift" | "swap" | "digest" | "market", title: string, sub: string) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: "var(--dim)" }}>{sub}</div>
      </div>
      <FToggle on={st[key]} onClick={() => set({ [key]: !st[key] } as Partial<NotificationsState>)} accent={A} label={title} />
    </div>
  );

  const timeSel = (key: "from" | "to") => (
    <select
      value={st[key]}
      aria-label={key === "from" ? "Quiet from" : "Quiet until"}
      onChange={(e) => set({ [key]: e.target.value } as Partial<NotificationsState>)}
      style={{
        height: 32,
        borderRadius: 8,
        border: "1.5px solid var(--border2)",
        background: "var(--surface2)",
        padding: "0 8px",
        fontSize: 12.5,
        fontFamily: MONO,
        outline: "none",
      }}
    >
      {["20:00", "21:00", "22:00", "23:00", "06:00", "07:00", "08:00"].map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );

  return (
    <FCard w={380} accent={A} name="Shiftsum">
      <div>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>Notifications</div>
        {row("shift", "Your shift changed", "The one that's always loud")}
        {row("swap", "Swap requests", "Someone wants your Tuesday")}
        {row("digest", "Weekly digest", "One email, Sunday evening")}
        {row("market", "Product news", "Off by default — on purpose")}
        <div style={{ padding: "10px 0 4px", borderTop: "1px solid var(--border)", marginTop: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Quiet hours</div>
              <div style={{ fontSize: 11.5, color: "var(--dim)" }}>Nothing pings while you sleep</div>
            </div>
            <FToggle on={st.quiet} onClick={() => set({ quiet: !st.quiet })} accent={A} label="Quiet hours" />
          </div>
          {st.quiet ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 9,
                fontFamily: MONO,
                fontSize: 11.5,
                color: "var(--dim)",
              }}
            >
              {timeSel("from")}
              <span>→</span>
              {timeSel("to")}
              <span style={{ color: "var(--faint)" }}>local time</span>
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            paddingTop: 12,
            borderTop: "1px solid var(--border)",
            marginTop: 8,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 13, flex: 1 }}>Digest frequency</span>
          <FSeg opts={["Daily", "Weekly", "Off"]} cur={st.freq} onPick={(v) => set({ freq: v })} accent={A} />
        </div>
      </div>
    </FCard>
  );
}

// ---------- roster admin ----------

const ROSTER: [string, string, string][] = [
  ["Maria Santos", "Front desk", "Mon–Fri · 32h"],
  ["Jules Okafor", "Kitchen", "Rotating · 40h"],
  ["Sam Whitfield", "Front desk", "Weekends · 16h"],
  ["Priya Nair", "Kitchen", "Mon–Wed · 24h"],
  ["Tom Eriksen", "Delivery", "Evenings · 28h"],
  ["Ana Kovač", "Front desk", "Rotating · 36h"],
  ["Leo Martín", "Delivery", "Weekends · 12h"],
  ["Dana Brooks", "Kitchen", "Mon–Fri · 40h"],
];

interface AdminState extends Record<string, unknown> {
  q: string;
  filter: string;
  sel: Record<number, boolean>;
  approved: Record<number, number>;
}

export function RosterAdmin() {
  const [st, set] = useFragState<AdminState>("admin", {
    q: "",
    filter: "All",
    sel: {},
    approved: { 0: 1, 3: 1, 7: 1 },
  });

  const roles = ["All", "Front desk", "Kitchen", "Delivery"];
  const rows = ROSTER.map((r, i) => ({ i, name: r[0], role: r[1], sched: r[2], ok: !!st.approved[i] })).filter(
    (r) =>
      (st.filter === "All" || r.role === st.filter) &&
      `${r.name} ${r.role}`.toLowerCase().includes(st.q.toLowerCase()),
  );
  const selCount = Object.keys(st.sel).filter((k) => st.sel[Number(k)]).length;

  return (
    <FCard w={560} accent={A} name="Shiftsum">
      <div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 15, flex: "1 0 auto" }}>Roster · next week</div>
          <FInput
            accent={A}
            value={st.q}
            placeholder="⌕ search people…"
            aria-label="Search roster"
            onChange={(e) => set({ q: e.target.value })}
            styleX={{ width: 170, height: 32, fontSize: 12.5 }}
          />
          <select
            value={st.filter}
            aria-label="Filter by role"
            onChange={(e) => set({ filter: e.target.value })}
            style={{
              height: 32,
              borderRadius: 8,
              border: "1.5px solid var(--border2)",
              background: "var(--surface2)",
              padding: "0 8px",
              fontSize: 12.5,
              outline: "none",
            }}
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          {rows.length === 0 ? (
            <div style={{ padding: "22px 14px", textAlign: "center", color: "var(--dim)", fontSize: 12.5 }}>
              Nobody matches — even the search forgives typos, but not that one.
            </div>
          ) : (
            rows.map((r, k) => (
              <div
                key={r.i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderTop: k ? "1px solid var(--border)" : "none",
                  background: st.sel[r.i] ? `${A}10` : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!st.sel[r.i]}
                  aria-label={`Select ${r.name}`}
                  onChange={() => set({ sel: { ...st.sel, [r.i]: !st.sel[r.i] } })}
                  style={{ width: 15, height: 15, accentColor: A, cursor: "pointer" }}
                />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 12.5,
                    width: 110,
                    flex: "0 0 auto",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.name}
                </span>
                <span style={{ fontSize: 11.5, color: "var(--dim)", width: 80, flex: "0 0 auto" }}>{r.role}</span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    color: "var(--faint)",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.sched}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    flex: "0 0 auto",
                    color: r.ok ? A : "var(--dim)",
                    background: r.ok ? `${A}1c` : "var(--surface2)",
                    border: `1px solid ${r.ok ? `${A}55` : "var(--border2)"}`,
                  }}
                >
                  {r.ok ? "approved" : "pending"}
                </span>
              </div>
            ))
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
          <span style={{ fontFamily: MONO, fontSize: 10.5, color: "var(--faint)", flex: 1 }}>
            {rows.length} of {ROSTER.length} shown
          </span>
          <FButton
            label={`Approve selected${selCount ? ` (${selCount})` : ""}`}
            onClick={() => {
              if (!selCount) return;
              const ap = { ...st.approved };
              Object.keys(st.sel).forEach((k) => {
                if (st.sel[Number(k)]) ap[Number(k)] = 1;
              });
              set({ approved: ap, sel: {} });
            }}
            accent={A}
            small
            disabled={!selCount}
          />
        </div>
      </div>
    </FCard>
  );
}
