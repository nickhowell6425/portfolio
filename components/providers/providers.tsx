"use client";

import { ThemeProvider } from "next-themes";
import type { BrandId } from "@/lib/brands";
import { BrandProvider } from "./brand-provider";
import { ContactProvider } from "./contact-provider";
import { FragmentStateProvider } from "./fragment-state";
import { UIProvider } from "./ui-provider";

export function Providers({ brand, children }: { brand: BrandId; children: React.ReactNode }) {
  return (
    <BrandProvider brand={brand}>
      <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
        <UIProvider>
          <ContactProvider>
            <FragmentStateProvider>{children}</FragmentStateProvider>
          </ContactProvider>
        </UIProvider>
      </ThemeProvider>
    </BrandProvider>
  );
}
