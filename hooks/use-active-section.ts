"use client";

import { useEffect, useState } from "react";

/**
 * Which of `ids` (sections on the current page, in page order) the reader is
 * on: the last one whose top has crossed a line a third of the way down the
 * viewport. Null above the first one. Listens to scroll in capture so it sees
 * the content stage's own scroller, not just the window.
 */
export function useActiveSection(ids: string[], pageKey: string): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    if (!key) return;
    const list = key.split("|");
    let raf = 0;
    const measure = () => {
      raf = 0;
      const line = window.innerHeight * 0.34;
      let current: string | null = null;
      for (const id of list) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    // the page renders after the route changes; measure once it's there
    const first = requestAnimationFrame(measure);
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("hashchange", onScroll);
    return () => {
      cancelAnimationFrame(first);
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("hashchange", onScroll);
    };
  }, [key, pageKey]);

  return key ? active : null;
}
