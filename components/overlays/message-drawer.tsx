"use client";

import { useEffect, useRef, useState } from "react";
import { MONO } from "@/components/fragments/ui";
import { useContact, type ChatMsg } from "@/components/providers/contact-provider";
import { useUI } from "@/components/providers/ui-provider";
import { useBrand } from "@/components/providers/brand-provider";
import { PH } from "@/lib/content";

const ME_AVATAR: React.CSSProperties = {
  background: "url('/uploads/avatar-circle-96.png') center/cover no-repeat, #1c2435",
  color: "#fff",
};

function Message({
  name,
  time,
  auto,
  text,
  avStyle,
  avText,
}: {
  name: string;
  time: string;
  auto?: boolean;
  text: string;
  avStyle: React.CSSProperties;
  avText: string;
}) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "6px 0", animation: "fadeUp .25s both" }}>
      <div
        aria-hidden="true"
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          display: "grid",
          placeItems: "center",
          fontWeight: 800,
          fontSize: 12,
          flex: "0 0 auto",
          ...avStyle,
        }}
      >
        {avText}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 800, fontSize: 12.5 }}>{name}</span>
          <span style={{ fontFamily: MONO, fontSize: 9.5, color: "var(--faint)" }}>{time}</span>
          {auto ? (
            <span
              style={{
                fontFamily: MONO,
                fontSize: 9,
                color: "var(--faint)",
                border: "1px solid var(--border2)",
                borderRadius: 4,
                padding: "0 5px",
              }}
            >
              auto-reply
            </span>
          ) : null}
        </div>
        <p style={{ margin: "2px 0 0", fontSize: 13, lineHeight: 1.5, textWrap: "pretty" }}>
          {text}
        </p>
      </div>
    </div>
  );
}

/** Right-hand "Message Nicholas" drawer — not a live chat, replies by email. */
export function MessageDrawer() {
  const { chatOpen, chatClosing, closeChat } = useUI();
  const {
    first,
    last,
    email,
    emailErr,
    sending,
    sendError,
    thread,
    setFirst,
    setLast,
    setEmail,
    send,
    trackContact,
  } = useContact();
  const brand = useBrand();
  const inbox = brand.email;
  const [draft, setDraft] = useState("");
  const opened = useRef(false);
  const started = useRef(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const firstRef = useRef<HTMLInputElement | null>(null);

  // Count one open and first interaction per drawer visit, without form contents.
  useEffect(() => {
    if (!chatOpen) {
      opened.current = false;
      started.current = false;
    } else if (!opened.current) {
      opened.current = true;
      trackContact("contact_open");
    }
  }, [chatOpen, trackContact]);

  // Focus the first field once the drawer has slid in.
  useEffect(() => {
    if (!chatOpen) return;
    const t = setTimeout(() => firstRef.current?.focus(), 320);
    return () => clearTimeout(t);
  }, [chatOpen]);

  // keep the log pinned to the newest message
  useEffect(() => {
    const sc = scrollRef.current;
    if (sc) sc.scrollTop = sc.scrollHeight;
  }, [thread, chatOpen]);

  if (!chatOpen) return null;

  const youName = `${first.trim()} ${last.trim()}`.trim() || "You";
  const youInit = `${first.trim()[0] ?? ""}${last.trim()[0] ?? ""}`.toUpperCase() || "Y";

  const onSend = async () => {
    const result = await send(draft);
    if (result.ok) {
      setDraft("");
      return;
    }
    if (result.error === "name") firstRef.current?.focus();
    else if (result.error === "email") emailRef.current?.focus();
    else if (result.error === "empty") inputRef.current?.focus();
  };

  const renderMsg = (m: ChatMsg, i: number) =>
    m.who === "you" ? (
      <Message
        key={i}
        name={youName}
        time={m.t}
        text={m.text}
        avStyle={{ background: "var(--surface2)", color: "var(--dim)" }}
        avText={youInit}
      />
    ) : (
      <Message
        key={i}
        name={PH.FIRST}
        time={m.t}
        auto
        text={m.text}
        avStyle={ME_AVATAR}
        avText=""
      />
    );

  return (
    <>
      <div
        onClick={closeChat}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 72,
          background: "rgba(5,9,18,.5)",
          animation: chatClosing ? "scrimOut .22s ease forwards" : "scrimIn .2s ease",
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Message ${PH.FIRST}`}
        style={{
          position: "fixed",
          zIndex: 73,
          top: 0,
          bottom: 0,
          right: 0,
          width: 420,
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          background: "var(--bg1)",
          borderLeft: "1px solid var(--border2)",
          boxShadow: "-24px 0 60px -24px rgba(2,6,16,.6)",
          animation: chatClosing
            ? "drawerOut .24s cubic-bezier(.4,0,1,1) forwards"
            : "drawerIn .28s cubic-bezier(.2,.85,.3,1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "13px 12px 13px 18px",
            borderBottom: "1px solid var(--border)",
            flex: "0 0 auto",
          }}
        >
          <span style={{ fontWeight: 800, fontSize: 14.5 }}>Message {PH.FIRST}</span>
          <span style={{ flex: 1 }} />
          <button
            onClick={closeChat}
            aria-label="Close message panel"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 9,
              border: "1px solid var(--border2)",
              background: "var(--surface)",
              cursor: "pointer",
              fontSize: 15,
              color: "var(--dim)",
              flex: "0 0 auto",
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: "9px 18px 0", flex: "0 0 auto" }}>
          <span
            style={{
              display: "inline-block",
              fontFamily: MONO,
              fontSize: 10,
              color: "var(--dim)",
              border: "1px solid var(--border2)",
              borderRadius: 999,
              padding: "2px 9px",
            }}
          >
            not a live chat — replies come by email
          </span>
        </div>
        <div
          ref={scrollRef}
          role="log"
          aria-label="Your messages"
          style={{ flex: 1, overflowY: "auto", padding: "12px 18px", minHeight: 0 }}
        >
          <Message
            name={PH.FIRST}
            time="pinned"
            text={
              brand.id === "personal"
                ? "Tell me what you’re working on and where you’re stuck. A few sentences are enough. Leave your email so I can reply personally."
                : "Tell me who your app is for, what works today, and what is stopping your next step. Leave your email so I can respond. Replies come by email."
            }
            avStyle={ME_AVATAR}
            avText=""
          />
          {thread.map(renderMsg)}
        </div>
        <form
          noValidate
          aria-busy={sending}
          onSubmit={(event) => {
            event.preventDefault();
            void onSend();
          }}
          onInput={() => {
            if (!started.current) {
              started.current = true;
              trackContact("contact_start");
            }
          }}
          style={{
            padding: "10px 16px 14px",
            flex: "0 0 auto",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              border: "1px solid var(--border2)",
              background: "var(--surface)",
              borderRadius: 12,
              boxShadow: "var(--shadow)",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
              <input
                ref={firstRef}
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                placeholder="First name"
                aria-label="First name"
                name="given-name"
                autoComplete="given-name"
                maxLength={100}
                required
                disabled={sending}
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: "none",
                  background: "transparent",
                  height: 34,
                  padding: "0 14px",
                  fontSize: 12.5,
                  borderRight: "1px solid var(--border)",
                }}
              />
              <input
                value={last}
                onChange={(e) => setLast(e.target.value)}
                placeholder="Last name"
                aria-label="Last name"
                name="family-name"
                autoComplete="family-name"
                maxLength={100}
                disabled={sending}
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: "none",
                  background: "transparent",
                  height: 34,
                  padding: "0 14px",
                  fontSize: 12.5,
                }}
              />
            </div>
            <input
              ref={emailRef}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com — so I can reply"
              aria-label="Your email"
              type="email"
              name="email"
              autoComplete="email"
              maxLength={200}
              required
              disabled={sending}
              aria-invalid={emailErr || undefined}
              style={{
                border: "none",
                background: "transparent",
                height: 34,
                padding: "0 14px",
                fontSize: 12.5,
                borderBottom: "1px solid var(--border)",
                fontFamily: MONO,
                color: emailErr ? "#ff7a6b" : "var(--text)",
              }}
            />
            <div
              style={{ display: "flex", gap: 8, alignItems: "center", padding: "5px 5px 5px 14px" }}
            >
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="What are you building?"
                aria-label="Your message"
                name="message"
                maxLength={5000}
                required
                disabled={sending}
                rows={3}
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  minWidth: 0,
                  minHeight: 78,
                  resize: "vertical",
                  fontFamily: "inherit",
                  fontSize: 13.5,
                }}
              />
              <button
                type="submit"
                disabled={sending}
                style={{
                  border: "none",
                  cursor: "pointer",
                  height: 32,
                  padding: "0 15px",
                  borderRadius: 9,
                  background: "var(--action)",
                  color: "var(--action-text)",
                  fontWeight: 700,
                  fontSize: 12.5,
                }}
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
          {sendError ? (
            <p role="alert" style={{ fontSize: 12.5, margin: "10px 0", color: "var(--text)" }}>
              Your note could not be sent. It is still here to retry, or you can email me directly.
            </p>
          ) : null}
          <p style={{ fontSize: 12, margin: "10px 0 0", color: "var(--dim)" }}>
            Prefer email?{" "}
            <a href={`mailto:${inbox}`} style={{ color: "var(--text)" }}>
              {inbox}
            </a>
          </p>
          <p style={{ fontSize: 11.5, margin: "6px 0 0", color: "var(--dim)" }}>
            Your details and note are used to respond to your inquiry. Do not include passwords or
            sensitive customer data.
          </p>
        </form>
      </aside>
    </>
  );
}
