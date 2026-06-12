"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { resolvePathname } from "@/lib/navigation";

const wsIdOf = (path: string) => resolvePathname(path)?.ws.id ?? null;

/**
 * Sticky workspace-switch flag: false on first mount, true once the user
 * has crossed workspaces. Pair with key={wsId} so the swap animation
 * replays via remount on every workspace change but never on first load.
 */
export function useWsSticky(): { wsId: string | null; swapped: boolean } {
  const pathname = usePathname();
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
  const [mark, setMark] = useState({ path: pathname, swap: false });
  if (mark.path !== pathname) {
    setMark({ path: pathname, swap: wsIdOf(mark.path) !== wsIdOf(pathname) });
    return wsIdOf(mark.path) !== wsIdOf(pathname);
  }
  return mark.swap;
}
