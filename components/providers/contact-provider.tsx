"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PH } from "@/lib/content";
import { useUI } from "./ui-provider";

export interface ChatMsg {
  who: "you" | "auto";
  t: string;
  text: string;
}

export type SendResult = { ok: true } | { ok: false; error: "empty" | "name" | "email" };

interface ContactCtx {
  first: string;
  last: string;
  email: string;
  emailErr: boolean;
  thread: ChatMsg[];
  setFirst: (v: string) => void;
  setLast: (v: string) => void;
  setEmail: (v: string) => void;
  send: (message: string) => Promise<SendResult>;
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
  const [first, setFirstRaw] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmailRaw] = useState("");
  const [emailErr, setEmailErr] = useState(false);
  const [thread, setThread] = useState<ChatMsg[]>([]);
  const threadRef = useRef(thread);
  useEffect(() => {
    threadRef.current = thread;
  }, [thread]);

  const setFirst = useCallback((v: string) => setFirstRaw(v), []);
  const setEmail = useCallback((v: string) => {
    setEmailRaw(v);
    setEmailErr(false);
  }, []);

  const send = useCallback(
    async (message: string): Promise<SendResult> => {
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

      const firstSend = !threadRef.current.some((m) => m.who === "auto");
      setThread((p) => p.concat([{ who: "you", t: nowStr(), text }]));

      const started = Date.now();
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName: fn, lastName: last.trim(), email: em, message: text }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (firstSend) {
          const wait = Math.max(0, 900 - (Date.now() - started));
          setTimeout(() => {
            setThread((p) =>
              p.concat([
                {
                  who: "auto",
                  t: nowStr(),
                  text: `Thanks, ${fn} — your note just landed in my real inbox. I'll reply to ${em}, usually same day. (This is the only automated message you'll see.)`,
                },
              ]),
            );
          }, wait);
        }
      } catch {
        showToast(`Couldn't send just now — email me directly at ${PH.EMAIL}.`);
      }
      return { ok: true };
    },
    [first, last, email, showToast],
  );

  const value = useMemo(
    () => ({ first, last, email, emailErr, thread, setFirst, setLast, setEmail, send }),
    [first, last, email, emailErr, thread, setFirst, setEmail, send],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useContact(): ContactCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useContact must be used within ContactProvider");
  return ctx;
}
