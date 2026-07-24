"use client";

import { useUI } from "@/components/providers/ui-provider";
import { FRAGMENTS, type FragmentId } from "@/lib/content";
import { ComponentCard } from "./component-card";

/**
 * The cross-project component gallery — every live piece, filterable by kind.
 * Fragments render their own cards at their natural widths, so this is a
 * single stacked column rather than a rigid grid.
 */
export function LibraryGrid() {
  const { libFilter } = useUI();
  const fids = (Object.keys(FRAGMENTS) as FragmentId[]).filter(
    (fid) => libFilter === "All" || FRAGMENTS[fid].kind === libFilter,
  );
  return (
    <div
      key={libFilter}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 26,
        marginTop: 8,
      }}
    >
      {fids.map((fid, i) => (
        <ComponentCard key={fid} fid={fid} animDelay={Math.min(i * 60, 420)} />
      ))}
    </div>
  );
}
