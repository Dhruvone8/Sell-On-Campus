"use client";

import * as React from "react";
import { useLenis } from "lenis/react";

const STORAGE_KEY = "soc_seen_loader";
const DISPLAY_DURATION_MS = 950;
const EXIT_DURATION_MS = 300;

export function LoadingScreen() {
  const lenis = useLenis();

  // Always initialize as "visible" on initial render so server and client match identically.
  // We check sessionStorage in a layout effect or effect immediately on mount.
  const [stage, setStage] = React.useState<"visible" | "exiting" | "done">("visible");

  React.useEffect(() => {
    try {
      if (
        sessionStorage.getItem(STORAGE_KEY) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setStage("done");
        return;
      }
    } catch {
      setStage("done");
      return;
    }
  }, []);

  // Pause Lenis smooth scrolling whenever the loader is actively visible
  React.useEffect(() => {
    if (stage === "visible" && lenis) {
      lenis.stop();
    }
  }, [lenis, stage]);

  // Main lifecycle timer: displays for ~950ms, then initiates 300ms fade-and-lift exit
  React.useEffect(() => {
    if (stage === "done") {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const exitTimer = setTimeout(() => {
      setStage("exiting");
      lenis?.start();
      document.body.style.overflow = originalOverflow;
    }, DISPLAY_DURATION_MS);

    const unmountTimer = setTimeout(() => {
      setStage("done");
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // Silently handle storage quota or private browsing exceptions
      }
    }, DISPLAY_DURATION_MS + EXIT_DURATION_MS);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(unmountTimer);
      lenis?.start();
      document.body.style.overflow = originalOverflow;
    };
  }, [lenis]);

  if (stage === "done") {
    return null;
  }

  const isExiting = stage === "exiting";

  return (
    <div
      id="soc-loading-screen"
      suppressHydrationWarning
      aria-live="polite"
      aria-label="Loading page content"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-canvas select-none transition-all duration-300 ease-out ${
        isExiting ? "opacity-0 -translate-y-2 pointer-events-none" : "opacity-100 translate-y-0"
      }`}
    >
      {/* Synchronous script to immediately hide overlay before first paint for returning visitors */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem('${STORAGE_KEY}')||window.matchMedia('(prefers-reduced-motion: reduce)').matches){var el=document.getElementById('soc-loading-screen');if(el)el.style.display='none';}}catch(e){}`,
        }}
      />

      <div className="flex flex-col items-center gap-3">
        <p className="text-sm font-medium text-charcoal-600 tracking-tight">
          Getting things ready...
        </p>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span
            className="w-1.5 h-1.5 rounded-full bg-brand-500 soc-dot-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-brand-500 soc-dot-bounce"
            style={{ animationDelay: "160ms" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-brand-500 soc-dot-bounce"
            style={{ animationDelay: "320ms" }}
          />
        </div>
      </div>
    </div>
  );
}

