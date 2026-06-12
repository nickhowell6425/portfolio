import { NextResponse } from "next/server";
import { z } from "zod";
import { PH } from "@/lib/content";

const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100).optional().default(""),
  email: z.email().max(200),
  message: z.string().trim().min(1).max(5000),
});

// Light in-memory rate limit: 5 messages per IP per minute. Per-instance on
// serverless, which is fine — this guards against casual abuse, not DDoS.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 1000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many messages" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // honeypot: humans never see this field — accept silently and drop
  if (typeof body === "object" && body !== null && "website" in body && body.website) {
    return NextResponse.json({ ok: true });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid message" }, { status: 400 });
  }
  const { firstName, lastName, email, message } = parsed.data;
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
      to: process.env.CONTACT_TO_EMAIL ?? PH.EMAIL,
      replyTo: email,
      subject: `Portfolio message from ${fullName}`,
      text: `From: ${fullName} <${email}>\n\n${message}`,
    });
    if (error) {
      console.error("[contact] resend error:", error);
      return NextResponse.json({ ok: false, error: "Send failed" }, { status: 502 });
    }
  } else {
    // No email provider configured — log so messages aren't silently dropped in dev.
    console.log(`[contact] ${fullName} <${email}>: ${message}`);
  }

  return NextResponse.json({ ok: true });
}
