"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FRAGMENT_COMPONENTS } from "@/components/fragments/registry";
import type { FragmentId } from "@/lib/content";

/**
 * Client boundary for a live fragment inside server-rendered content.
 * Mounts only as it nears the viewport — live fragments animate and hydrate
 * heavy trees, so mounting them all up front blocks the main thread. Until
 * then a captured still holds the space (no layout shift, nothing blank).
 */
export function LiveFragment({
  fid,
  poster,
}: {
  fid: FragmentId;
  poster?: { src: string; width: number; height: number };
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLive(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Fragment = FRAGMENT_COMPONENTS[fid];
  return (
    <div ref={ref} style={{ width: "100%", display: "grid", placeItems: "center" }}>
      {live ? (
        <Fragment />
      ) : poster ? (
        <Image
          src={poster.src}
          alt=""
          width={poster.width}
          height={poster.height}
          sizes="(max-width: 700px) 90vw, 560px"
          style={{ width: "100%", maxWidth: poster.width, height: "auto", borderRadius: 12 }}
        />
      ) : (
        <div
          aria-hidden="true"
          style={{ width: "100%", maxWidth: 560, aspectRatio: "560 / 294" }}
        />
      )}
    </div>
  );
}
