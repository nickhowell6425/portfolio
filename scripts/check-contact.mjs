import assert from "node:assert/strict";
import { test } from "node:test";
import { sendContact } from "../lib/contact.ts";
import { redactAnalyticsUrl } from "../lib/analytics.ts";

const message = {
  firstName: "Contact check",
  lastName: "",
  email: "contact-check@example.com",
  message: "Local test only",
};

test("analytics strips query values and fragments from pageview and inquiry URLs", () => {
  for (const type of ["pageview", "event"]) {
    const url = "https://fullstacktechnologiesllc.com/services/codebase-rescue";
    assert.deepEqual(
      redactAnalyticsUrl({
        type,
        url: `${url}?email=private@example.com&utm_source=private#secret`,
      }),
      { type, url },
    );
    assert.deepEqual(redactAnalyticsUrl({ type, url: `${url}#secret` }), { type, url });
    assert.deepEqual(redactAnalyticsUrl({ type, url }), { type, url });
  }
});

test("contact success requires an explicit accepted response; failures remain retryable", async () => {
  const originalFetch = globalThis.fetch;
  try {
    for (const response of [
      Response.json({ ok: false }, { status: 503 }),
      Response.json({ ok: false }, { status: 502 }),
      Response.json({ ok: false }),
      Response.json({}),
      Response.json(null),
      new Response("not JSON"),
    ]) {
      globalThis.fetch = async () => response;
      assert.equal(await sendContact(message), false);
    }
    globalThis.fetch = async () => {
      throw new Error("Connection lost");
    };
    assert.equal(await sendContact(message), false);
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "/api/contact");
      assert.equal(options.method, "POST");
      assert.deepEqual(JSON.parse(options.body), message);
      return Response.json({ ok: true });
    };
    assert.equal(await sendContact(message), true, "A retry can succeed after a failed send");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

const base = process.env.CONTACT_CHECK_URL;
test(
  "local API validates requests and fails closed without an email provider",
  { skip: !base },
  async () => {
    const url = new URL("/api/contact", base);
    assert(
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname),
      "Only test a local server started with RESEND_API_KEY empty",
    );
    const post = (body) =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
    for (const body of [
      "{",
      JSON.stringify({ ...message, email: "invalid" }),
      JSON.stringify({ ...message, message: "x".repeat(5001) }),
    ]) {
      const response = await post(body);
      assert.equal(response.status, 400);
      assert.equal((await response.json()).ok, false);
    }
    const unavailable = await post(JSON.stringify(message));
    assert.equal(
      unavailable.status,
      503,
      "Start the local server with RESEND_API_KEY=; this check must not send real email",
    );
    assert.equal((await unavailable.json()).ok, false);
  },
);
