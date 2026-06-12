"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Kind } from "@/lib/content";
import { defaultItemId, hrefFor, resolvePathname, workspaceById } from "@/lib/navigation";

interface UICtx {
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  resumeOpen: boolean;
  setResumeOpen: (open: boolean) => void;
  chatOpen: boolean;
  chatClosing: boolean;
  openChat: () => void;
  closeChat: () => void;
  libFilter: Kind;
  setLibFilter: (kind: Kind) => void;
  toast: string | null;
  showToast: (msg: string) => void;
  goWorkspace: (wsId: string) => void;
}

const Ctx = createContext<UICtx | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatClosing, setChatClosing] = useState(false);
  const [libFilter, setLibFilter] = useState<Kind>("All");
  const [toast, setToast] = useState<string | null>(null);

  const lastCh = useRef<Record<string, string>>({});
  const chatT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toastT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // remember the last visited channel per workspace
  useEffect(() => {
    const r = resolvePathname(pathname);
    if (r) lastCh.current[r.ws.id] = r.itemId;
  }, [pathname]);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const openChat = useCallback(() => {
    clearTimeout(chatT.current);
    setChatOpen(true);
    setChatClosing(false);
  }, []);

  const closeChat = useCallback(() => {
    setChatClosing((closing) => {
      if (closing) return closing;
      chatT.current = setTimeout(() => {
        setChatOpen(false);
        setChatClosing(false);
      }, 240);
      return true;
    });
  }, []);

  const showToast = useCallback((msg: string) => {
    clearTimeout(toastT.current);
    setToast(msg);
    toastT.current = setTimeout(() => setToast(null), 3600);
  }, []);

  const goWorkspace = useCallback(
    (wsId: string) => {
      const ws = workspaceById(wsId);
      if (!ws) return;
      setNavOpen(false);
      router.push(hrefFor(wsId, lastCh.current[wsId] ?? defaultItemId(ws)));
    },
    [router],
  );

  // global keyboard: ⌘K / "/" opens search, Escape unwinds overlays
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = ((e.target as HTMLElement)?.tagName || "").toLowerCase();
      const inField = tag === "input" || tag === "textarea" || tag === "select";
      if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
        return;
      }
      if (e.key === "/" && !inField && !searchOpen) {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (e.key === "Escape") {
        if (chatOpen) closeChat();
        else if (resumeOpen) setResumeOpen(false);
        else if (searchOpen) setSearchOpen(false);
        else setNavOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen, resumeOpen, searchOpen, closeChat]);

  useEffect(
    () => () => {
      clearTimeout(chatT.current);
      clearTimeout(toastT.current);
    },
    [],
  );

  const value = useMemo(
    () => ({
      navOpen,
      setNavOpen,
      searchOpen,
      openSearch,
      closeSearch,
      resumeOpen,
      setResumeOpen,
      chatOpen,
      chatClosing,
      openChat,
      closeChat,
      libFilter,
      setLibFilter,
      toast,
      showToast,
      goWorkspace,
    }),
    [
      navOpen,
      searchOpen,
      openSearch,
      closeSearch,
      resumeOpen,
      chatOpen,
      chatClosing,
      openChat,
      closeChat,
      libFilter,
      toast,
      showToast,
      goWorkspace,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUI(): UICtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}
