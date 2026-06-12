"use client";

import { useUI } from "@/components/providers/ui-provider";
import { FRAGMENTS, type FragmentId } from "@/lib/content";
import { ComponentCard } from "./component-card";

/** The cross-project component library — a filterable visual gallery. */
export function LibraryGrid() {
  const { libFilter } = useUI();
  const fids = (Object.keys(FRAGMENTS) as FragmentId[]).filter(
    (fid) => libFilter === "All" || FRAGMENTS[fid].kind === libFilter,
  );
  return (
    <div
      key={libFilter}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16,
        alignItems: "start",
        marginTop: 6,
      }}
    >
      {fids.map((fid, i) => (
        <ComponentCard key={fid} fid={fid} animDelay={Math.min(i * 70, 420)} />
      ))}
    </div>
  );
}
