"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { usePathname } from "next/navigation";
import { sendContact } from "@/lib/contact";
import { hrefFor } from "@/lib/navigation";
import { useBrand, useNav } from "./brand-provider";
import { useUI } from "./ui-provider";

export interface ChatMsg {
  who: "you" | "auto";
  t: string;
  text: string;
}

export type SendResult =
  | { ok: true }
  | { ok: false; error: "empty" | "name" | "email" | "send" | "busy" };

type ContactEvent = "contact_open" | "contact_start" | "contact_success" | "contact_error";

interface ContactCtx {
  first: string;
  last: string;
  email: string;
  emailErr: boolean;
  sending: boolean;
  sendError: boolean;
  thread: ChatMsg[];
  setFirst: (v: string) => void;
  setLast: (v: string) => void;
  setEmail: (v: string) => void;
  send: (message: string) => Promise<SendResult>;
  trackContact: (event: ContactEvent) => void;
}

const Ctx = createContext<ContactCtx | null>(null);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function nowStr() {
  const d = new Date();
  let hh = d.getHours();
  const mm = `0${d.getMinutes()}`.slice(-2);
  const ap = hh >= 12 ? "PM" : "AM";
  hh = hh % 12 || 12;
  return `${hh}:${mm} ${ap}`;
}

/**
 * The message thread lives above the drawer so nothing is lost when
 * the drawer closes. Sends go through the real /api/contact endpoint.
 */
export function ContactProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useUI();
  const brand = useBrand();
  const pathname = usePathname();
  const nav = useNav();
  const [first, setFirstRaw] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmailRaw] = useState("");
  const [emailErr, setEmailErr] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [thread, setThread] = useState<ChatMsg[]>([]);
  const pending = useRef(false);

  const trackContact = useCallback(
    (event: ContactEvent) => {
      const source = nav.resolvePathname(pathname);
      if (!source) return;
      try {
        track(event, { brand: brand.id, source_path: hrefFor(source.ws.id, source.itemId) });
      } catch {
        // Analytics availability must never prevent an inquiry.
      }
    },
    [brand.id, nav, pathname],
  );

  const setFirst = useCallback((v: string) => setFirstRaw(v), []);
  const setEmail = useCallback((v: string) => {
    setEmailRaw(v);
    setEmailErr(false);
  }, []);

  const send = useCallback(
    async (message: string): Promise<SendResult> => {
      if (pending.current) return { ok: false, error: "busy" };
      const text = message.trim();
      if (!text) return { ok: false, error: "empty" };
      const fn = first.trim();
      if (!fn) {
        showToast("Add your name so I know who I'm talking to.");
        return { ok: false, error: "name" };
      }
      const em = email.trim();
      if (!EMAIL_RE.test(em)) {
        setEmailErr(true);
        showToast("Add your email first — it's the only way I can reply.");
        return { ok: false, error: "email" };
      }

      pending.current = true;
      setSending(true);
      setSendError(false);
      const accepted = await sendContact({
        firstName: fn,
        lastName: last.trim(),
        email: em,
        message: text,
      });
      pending.current = false;
      setSending(false);
      if (!accepted) {
        setSendError(true);
        trackContact("contact_error");
        return { ok: false, error: "send" };
      }

      setThread((p) => [
        ...p,
        { who: "you", t: nowStr(), text },
        {
          who: "auto",
          t: nowStr(),
          text: `Thanks, ${fn} — your note has been sent for delivery. I'll reply by email. (This confirmation is automatic.)`,
        },
      ]);
      trackContact("contact_success");
      return { ok: true };
    },
    [first, last, email, showToast, trackContact],
  );

  const value = useMemo(
    () => ({
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
    }),
    [
      first,
      last,
      email,
      emailErr,
      sending,
      sendError,
      thread,
      setFirst,
      setEmail,
      send,
      trackContact,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useContact(): ContactCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useContact must be used within ContactProvider");
  return ctx;
}
