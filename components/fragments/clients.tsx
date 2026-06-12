import { useEffect, useRef } from "react";
import { useFragState } from "@/components/providers/fragment-state";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { FButton, FCard, FDone, FGhostButton, FLabel, FSeg, MONO } from "./ui";

const A = "#a98bf5";

// ---------- booking widget ----------

const DAYS: [string, string][] = [
  ["Mon", "15"],
  ["Tue", "16"],
  ["Wed", "17"],
  ["Thu", "18"],
  ["Fri", "19"],
  ["Sat", "20"],
];
const SLOTS = ["9:00", "9:45", "10:30", "11:15", "13:00", "13:45", "14:30", "15:15"];
const isTaken = (d: number, i: number) => (d * 7 + i * 3) % 5 === 0;

interface BookingState extends Record<string, unknown> {
  day: number;
  slot: number | null;
  booked: boolean;
}

export function BookingWidget() {
  const [st, set] = useFragState<BookingState>("booking", { day: 2, slot: null, booked: false });

  if (st.booked) {
    return (
      <FCard w={360} accent={A} name="Northside Physio">
        <FDone
          accent={A}
          title="You're booked"
          sub={`${DAYS[st.day][0]} ${DAYS[st.day][1]} June at ${SLOTS[st.slot!]} · 45 min with Dr. Hale. Confirmation texted to you.`}
          resetLabel="book another"
          onReset={() => set({ booked: false, slot: null })}
        />
      </FCard>
    );
  }

  return (
    <FCard w={360} accent={A} name="Northside Physio">
      <div>
        <div style={{ fontWeight: 800, fontSize: 15 }}>Book a session</div>
        <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 1 }}>
          45 min · physiotherapy · no login needed
        </div>
        <div style={{ display: "flex", gap: 6, margin: "13px 0 4px" }}>
          {DAYS.map((d, i) => (
            <button
              key={i}
              aria-pressed={st.day === i}
              onClick={() => set({ day: i, slot: null })}
              style={{
                flex: 1,
                padding: "7px 0 6px",
                borderRadius: 10,
                cursor: "pointer",
                textAlign: "center",
                border: `1.5px solid ${st.day === i ? A : "var(--border2)"}`,
                background: st.day === i ? `${A}1e` : "transparent",
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 9.5,
                  textTransform: "uppercase",
                  color: st.day === i ? A : "var(--faint)",
                }}
              >
                {d[0]}
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 14.5,
                  color: st.day === i ? "var(--text)" : "var(--dim)",
                }}
              >
                {d[1]}
              </div>
            </button>
          ))}
        </div>
        <FLabel>Available times</FLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {SLOTS.map((t, i) => {
            const off = isTaken(st.day, i);
            return (
              <button
                key={t}
                disabled={off}
                aria-pressed={st.slot === i}
                onClick={() => set({ slot: i })}
                style={{
                  height: 34,
                  borderRadius: 8,
                  cursor: off ? "default" : "pointer",
                  fontFamily: MONO,
                  fontSize: 11.5,
                  fontWeight: 600,
                  border: `1.5px solid ${st.slot === i ? A : "var(--border2)"}`,
                  background: st.slot === i ? A : "transparent",
                  color: off ? "var(--faint)" : st.slot === i ? "#fff" : "var(--dim)",
                  textDecoration: off ? "line-through" : "none",
                  opacity: off ? 0.55 : 1,
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
        <div style={{ height: 14 }} />
        <FButton
          label={st.slot == null ? "Pick a time" : `Confirm · ${DAYS[st.day][0]} ${SLOTS[st.slot]}`}
          onClick={() => {
            if (st.slot != null) set({ booked: true });
          }}
          accent={A}
          full
          disabled={st.slot == null}
        />
      </div>
    </FCard>
  );
}

// ---------- identity verification (KYC) ----------

const KYC_STEPS: [string, string, string][] = [
  ["id", "Government ID", "Passport or driving licence"],
  ["selfie", "Quick selfie", "Matched against the ID by the vendor"],
  ["address", "Proof of address", "Utility bill or bank statement"],
];

interface KycState extends Record<string, unknown> {
  done: Record<string, number>;
  busy: string | null;
  pct: number;
}

export function IdentityCheck() {
  const rm = useReducedMotion();
  const [st, set] = useFragState<KycState>("kyc", { done: {}, busy: null, pct: 0 });
  const stRef = useRef(st);
  useEffect(() => {
    stRef.current = st;
  }, [st]);

  const allDone = KYC_STEPS.every((s) => st.done[s[0]]);

  const start = (key: string) => {
    if (st.busy || st.done[key]) return;
    set({ busy: key, pct: 8 });
    let p = 8;
    const tick = () => {
      p += 18 + Math.random() * 22;
      if (p >= 100) {
        set({ busy: null, pct: 0, done: { ...stRef.current.done, [key]: 1 } });
      } else {
        set({ pct: Math.min(96, p) });
        setTimeout(tick, 220);
      }
    };
    setTimeout(tick, 220);
  };

  return (
    <FCard w={380} accent={A} name="Veridia">
      <div>
        <div style={{ fontWeight: 800, fontSize: 15 }}>Verify your identity</div>
        <div style={{ fontSize: 12, color: "var(--dim)", margin: "1px 0 12px" }}>
          Takes about 2 minutes · bank-grade checks
        </div>
        {KYC_STEPS.map((s2, i) => {
          const key = s2[0];
          const ok = !!st.done[key];
          const busy = st.busy === key;
          return (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "10px 0",
                borderTop: "1px solid var(--border)",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  flex: "0 0 auto",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  fontWeight: 800,
                  border: `2px solid ${ok ? A : "var(--border2)"}`,
                  color: ok ? "#fff" : "var(--faint)",
                  background: ok ? A : "transparent",
                  transition: "background .3s, border-color .3s",
                  fontFamily: MONO,
                }}
              >
                {ok ? "✓" : i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{s2[1]}</div>
                {busy ? (
                  <div
                    style={{
                      height: 4,
                      borderRadius: 2,
                      background: "var(--surface2)",
                      marginTop: 6,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${st.pct}%`,
                        background: A,
                        borderRadius: 2,
                        transition: "width .2s",
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ fontSize: 11.5, color: "var(--dim)" }}>
                    {ok ? "Verified by vendor · receipt logged" : s2[2]}
                  </div>
                )}
              </div>
              {ok ? null : (
                <FGhostButton
                  label={busy ? "Checking…" : "Upload"}
                  onClick={() => start(key)}
                  small
                />
              )}
            </div>
          );
        })}
        {allDone ? (
          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              borderRadius: 10,
              background: `${A}1a`,
              border: `1px solid ${A}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              animation: rm ? "none" : "popIn .3s",
            }}
          >
            <span style={{ fontSize: 16 }}>🛡️</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13 }}>Identity verified</div>
              <div style={{ fontSize: 11, color: "var(--dim)" }}>
                Audit trail saved. Compliance gets its receipts.
              </div>
            </div>
            <span style={{ flex: 1 }} />
            <FGhostButton
              label="reset"
              onClick={() => set({ done: {}, busy: null, pct: 0 })}
              small
            />
          </div>
        ) : null}
      </div>
    </FCard>
  );
}

// ---------- public status page ----------

const SERVICES: [string, number, number[]][] = [
  ["API", 99.98, [22]],
  ["Dashboard", 100, []],
  ["Webhooks", 99.91, [12, 13]],
];

interface StatusState extends Record<string, unknown> {
  range: string;
  open: number | null;
}

export function StatusPage() {
  const rm = useReducedMotion();
  const [st, set] = useFragState<StatusState>("status", { range: "90d", open: null });

  const n = st.range === "30d" ? 30 : 60;

  const bar = (svc: [string, number, number[]], idx: number) => {
    const bad = svc[2];
    return (
      <div style={{ display: "flex", gap: 2, flex: 1, minWidth: 0 }}>
        {Array.from({ length: n }, (_, i) => {
          const isBad = bad.includes(n - 1 - i);
          return (
            <span
              key={i}
              title={isBad ? "partial outage" : "operational"}
              style={{
                flex: 1,
                height: 22,
                borderRadius: 2,
                minWidth: 2,
                background: isBad ? "#ff7a6b" : A,
                opacity: isBad ? 1 : 0.32 + ((i * 7 + idx * 3) % 5) * 0.02,
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <FCard w={480} accent={A} name="Veridia Status">
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 4,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "#3ddc97",
              boxShadow: "0 0 10px #3ddc97",
            }}
          />
          <span style={{ fontWeight: 800, fontSize: 15, flex: 1 }}>All systems operational</span>
          <FSeg opts={["30d", "90d"]} cur={st.range} onPick={(r) => set({ range: r })} accent={A} />
        </div>
        {SERVICES.map((svc, i) => (
          <div
            key={svc[0]}
            style={{
              padding: "9px 0",
              borderTop: i ? "1px solid var(--border)" : "none",
              marginTop: i ? 2 : 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 12.5, width: 84, flex: "0 0 auto" }}>
                {svc[0]}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10.5,
                  color: svc[1] === 100 ? A : "var(--dim)",
                }}
              >
                {svc[1].toFixed(2)}% uptime
              </span>
            </div>
            {bar(svc, i)}
          </div>
        ))}
        <button
          onClick={() => set({ open: st.open ? null : 1 })}
          style={{
            marginTop: 10,
            border: "none",
            background: "transparent",
            color: A,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
          }}
        >
          {st.open ? "hide incident history ▴" : "incident history (1) ▾"}
        </button>
        {st.open ? (
          <div
            style={{
              marginTop: 8,
              padding: "10px 13px",
              borderRadius: 10,
              border: "1px solid var(--border2)",
              background: "var(--surface2)",
              animation: rm ? "none" : "fadeUp .25s",
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 10, color: "var(--faint)" }}>
              May 19 · 14:02–14:31 UTC
            </div>
            <div style={{ fontWeight: 700, fontSize: 12.5, margin: "3px 0 2px" }}>
              Webhooks delayed up to 4 min
            </div>
            <div style={{ fontSize: 11.5, color: "var(--dim)", lineHeight: 1.5 }}>
              A queue backed up after a deploy. We rolled back in 9 minutes and replayed every
              missed event. Written by a human — honesty included.
            </div>
          </div>
        ) : null}
      </div>
    </FCard>
  );
}
