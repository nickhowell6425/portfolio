"use client";

import { createContext, useContext } from "react";
import { BRANDS, type Brand, type BrandId } from "@/lib/brands";
import { navFor, type Nav } from "@/lib/navigation";

const Ctx = createContext<BrandId>("personal");

/** Which front door the visitor came through — fixed for the page's lifetime. */
export function BrandProvider({ brand, children }: { brand: BrandId; children: React.ReactNode }) {
  return <Ctx.Provider value={brand}>{children}</Ctx.Provider>;
}

export function useBrand(): Brand {
  return BRANDS[useContext(Ctx)];
}

/** Route/search resolution over the current brand's workspaces. */
export function useNav(): Nav {
  return navFor(useContext(Ctx));
}
