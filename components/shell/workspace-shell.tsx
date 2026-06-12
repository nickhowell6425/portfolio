"use client";

import { MessageDrawer } from "@/components/overlays/message-drawer";
import { ResumeModal } from "@/components/overlays/resume-modal";
import { SearchPalette } from "@/components/overlays/search-palette";
import { Toast } from "@/components/overlays/toast";
import { useUI } from "@/components/providers/ui-provider";
import { AmbientCanvas } from "./ambient-canvas";
import { ContentArea } from "./content-area";
import { PageChrome } from "./page-chrome";
import { Rail } from "./rail";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

/** The whole app frame: rail + sidebar on the left, the stage on the right. */
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const { navOpen, setNavOpen, chatOpen, searchOpen, resumeOpen } = useUI();
  // keep focus inside open dialogs by making the shell inert behind them
  const overlayOpen = chatOpen || searchOpen || resumeOpen;
  return (
    <div
      id="wsroot"
      data-drawer={navOpen ? "open" : "closed"}
      className="font-sans"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        overflow: "hidden",
        background: "var(--bg2)",
        color: "var(--text)",
        fontSize: 15,
        lineHeight: 1.5,
        perspective: 1500,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <AmbientCanvas />

      {/* mobile nav scrim */}
      <div
        onClick={() => setNavOpen(false)}
        style={{
          display: "var(--scrim-d)" as React.CSSProperties["display"],
          position: "fixed",
          inset: 0,
          zIndex: 30,
          background: "rgba(4,8,16,.55)",
        }}
      />

      <nav
        aria-label="Projects and components"
        className="boot-nav"
        inert={overlayOpen || undefined}
        style={{
          position: "var(--nav-pos)" as React.CSSProperties["position"],
          zIndex: 40,
          top: 0,
          bottom: 0,
          left: 0,
          display: "flex",
          alignItems: "stretch",
          transform: "var(--nav-tx)" as React.CSSProperties["transform"],
          transition: "transform .55s cubic-bezier(.2,.8,.25,1)",
        }}
      >
        <Rail />
        <Sidebar />
      </nav>

      <main
        className="boot-main"
        inert={overlayOpen || undefined}
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
        }}
      >
        <TopBar />
        <PageChrome />
        <ContentArea>{children}</ContentArea>
      </main>

      <MessageDrawer />
      <SearchPalette />
      <ResumeModal />
      <Toast />
    </div>
  );
}
