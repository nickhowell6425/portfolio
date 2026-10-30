import type { BeforeSendEvent } from "@vercel/analytics";

export function redactAnalyticsUrl(event: BeforeSendEvent): BeforeSendEvent {
  return { ...event, url: event.url.split(/[?#]/, 1)[0] };
}
