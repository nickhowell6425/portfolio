// Managed by Warden. Edits are a protected change (instrumentation).
/**
 * Funnel instrumentation with a denominator.
 *
 * Call `attempt` when a user begins an action and `complete` when it succeeds.
 * Zero completions with zero attempts is a quiet day; zero completions with many
 * attempts is an incident. Both numbers are needed to tell them apart.
 */
export type FunnelAction = "signup" | "checkout";

interface FunnelEvent {
  action: FunnelAction;
  phase: "attempt" | "complete";
  at: string;
  /** Opaque, non-identifying correlation id for joining attempt to complete. */
  cid: string;
}

const endpoint = process.env.NEXT_PUBLIC_WARDEN_EVENTS_URL;

function send(e: FunnelEvent): void {
  if (endpoint === undefined || endpoint === "") return;
  const body = JSON.stringify(e);
  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    navigator.sendBeacon(endpoint, body);
    return;
  }
  void fetch(endpoint, {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
    keepalive: true,
  }).catch(() => undefined);
}

function cid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Record that a user started `action`. Returns the correlation id to pass to `complete`. */
export function attempt(action: FunnelAction): string {
  const id = cid();
  send({ action, phase: "attempt", at: new Date().toISOString(), cid: id });
  return id;
}

/** Record that the action begun with `id` succeeded. */
export function complete(action: FunnelAction, id: string): void {
  send({ action, phase: "complete", at: new Date().toISOString(), cid: id });
}
