"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useNav } from "@/components/providers/brand-provider";

// Keyed by the sidebar's workspace: moving between home and a resource it
// hosts (blog, services…) keeps the same nav, so nothing swaps.
function useWsIdOf() {
  const { resolvePathname, navHostOf } = useNav();
  return (path: string) => {
    const ws = resolvePathname(path)?.ws;
    return ws ? navHostOf(ws).id : null;
  };
}

/**
 * Sticky workspace-switch flag: false on first mount, true once the user
 * has crossed workspaces. Pair with key={wsId} so the swap animation
 * replays via remount on every workspace change but never on first load.
 */
export function useWsSticky(): { wsId: string | null; swapped: boolean } {
  const pathname = usePathname();
  const wsIdOf = useWsIdOf();
  const wsId = wsIdOf(pathname);
  const [mark, setMark] = useState({ wsId, swapped: false });
  if (mark.wsId !== wsId) setMark({ wsId, swapped: true });
  return { wsId, swapped: mark.wsId !== wsId ? true : mark.swapped };
}

/**
 * Per-navigation flag: true only when the latest navigation crossed
 * workspaces. Pair with key={pathname} so content remounts every visit
 * but the stage-swap animation only plays on workspace changes.
 */
export function useNavSwap(): boolean {
  const pathname = usePathname();
  const wsIdOf = useWsIdOf();
  const [mark, setMark] = useState({ path: pathname, swap: false });
  if (mark.path !== pathname) {
    setMark({ path: pathname, swap: wsIdOf(mark.path) !== wsIdOf(pathname) });
    return wsIdOf(mark.path) !== wsIdOf(pathname);
  }
  return mark.swap;
}
