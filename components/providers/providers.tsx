"use client";

import { ThemeProvider } from "next-themes";
import { ContactProvider } from "./contact-provider";
import { FragmentStateProvider } from "./fragment-state";
import { UIProvider } from "./ui-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <UIProvider>
        <ContactProvider>
          <FragmentStateProvider>{children}</FragmentStateProvider>
        </ContactProvider>
      </UIProvider>
    </ThemeProvider>
  );
}
