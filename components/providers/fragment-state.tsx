"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type FragMap = Record<string, Record<string, unknown>>;

interface FragmentStateCtx {
  frag: FragMap;
  patch: (fid: string, patch: Record<string, unknown>) => void;
}

const Ctx = createContext<FragmentStateCtx | null>(null);

/**
 * Fragment state lives above the page tree so a component keeps its
 * state when you navigate away and back, and the library view shares
 * state with the per-channel view — exactly like the prototype.
 */
export function FragmentStateProvider({ children }: { children: React.ReactNode }) {
  const [frag, setFrag] = useState<FragMap>({});
  const patch = useCallback((fid: string, p: Record<string, unknown>) => {
    setFrag((prev) => ({ ...prev, [fid]: { ...prev[fid], ...p } }));
  }, []);
  const value = useMemo(() => ({ frag, patch }), [frag, patch]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFragState<T extends Record<string, unknown>>(
  fid: string,
  defaults: T,
): [T, (patch: Partial<T>) => void] {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFragState must be used within FragmentStateProvider");
  const [initialDefaults] = useState(defaults);
  const stored = ctx.frag[fid];
  const state = useMemo(() => ({ ...initialDefaults, ...stored }) as T, [initialDefaults, stored]);
  const set = useCallback((p: Partial<T>) => ctx.patch(fid, p), [ctx, fid]);
  return [state, set];
}
