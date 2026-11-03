"use client";

import * as React from "react";
import Image from "next/image";
import { APP_LOGO_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

// ============================================================================
// INTRO ANIMATION TUNING CONSTANTS
// Change any parameter here to tune timing, easing, or disable completely
// ============================================================================

/** Master switch: set to false to completely turn off the intro animation */
export const INTRO_ENABLED = true;

/** Session storage key used to show the intro only once per browser session */
export const STORAGE_KEY = "soc_intro_shown";

/** Animation timing breakdown in milliseconds */
export const ENTRANCE_DURATION_MS = 500; // Logo + wordmark fade & scale in
export const TAGLINE_DELAY_MS = 350;     // Delay before tagline reveals
export const HOLD_DURATION_MS = 400;     // Pause once identity is fully visible
export const EXIT_DURATION_MS = 550;     // Overlay lift & fade out duration
export const TOTAL_DURATION_MS = 1850;   // Complete runtime before DOM unmount
export const HARD_TIMEOUT_MS = 2500;     // Safety cutoff (always unfreezes site)

/** Smooth Apple/Vercel-like quintic deceleration curve (zero bounce) */
export const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

type IntroStage = "idle" | "enter" | "tagline" | "exit" | "finished";

export function IntroAnimation() {
  const [stage, setStage] = React.useState<IntroStage>("idle");

  const cleanupAndFinish = React.useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore private browsing storage restrictions
    }
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("soc-intro-pending", "soc-intro-revealing");
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    setStage("finished");
  }, []);

  React.useEffect(() => {
    // 1. Feature disabled check
    if (!INTRO_ENABLED) {
      cleanupAndFinish();
      return;
    }

    // 2. Accessibility: respect prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      cleanupAndFinish();
      return;
    }

    // 3. Show-once check with URL override support (?intro=1 or ?replay=1 for instant preview)
    try {
      const hasSeen = sessionStorage.getItem(STORAGE_KEY);
      const urlParams = new URLSearchParams(window.location.search);
      const forceReplay = urlParams.get("intro") === "1" || urlParams.get("replay") === "1";

      if (hasSeen && !forceReplay) {
        cleanupAndFinish();
        return;
      }
    } catch {
      // If sessionStorage is unavailable, continue safely
    }

    // 4. Lock page scrolling while intro plays
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // 5. Hard safety timeout ensures the page is NEVER blocked if anything stalls
    const safetyTimer = setTimeout(() => {
      cleanupAndFinish();
    }, HARD_TIMEOUT_MS);

    // 6. Choreographed animation phase triggers
    // Phase 1: Logo and wordmark appear immediately
    const enterTimer = setTimeout(() => {
      setStage("enter");
    }, 40);

    // Phase 2: Tagline reveals smoothly
    const taglineTimer = setTimeout(() => {
      setStage("tagline");
    }, TAGLINE_DELAY_MS);

    // Phase 3: Hand-off begins — overlay lifts away while hero reveals synchronously
    const exitTimer = setTimeout(() => {
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("soc-intro-pending");
        document.documentElement.classList.add("soc-intro-revealing");
      }
      setStage("exit");
    }, TAGLINE_DELAY_MS + HOLD_DURATION_MS + 450);

    // Phase 4: Animation completes, unmount and restore scroll
    const finishTimer = setTimeout(() => {
      cleanupAndFinish();
    }, TOTAL_DURATION_MS);

    // Keyboard escape listener to dismiss instantly
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cleanupAndFinish();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(safetyTimer);
      clearTimeout(enterTimer);
      clearTimeout(taglineTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [cleanupAndFinish]);

  // If already finished, remove completely from DOM
  if (stage === "finished") {
    return null;
  }

  return (
    <div
      id="soc-intro-overlay"
      aria-hidden="true"
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-canvas select-none cursor-default px-4",
        stage === "exit" && "pointer-events-none"
      )}
      style={{
        opacity: stage === "exit" ? 0 : 1,
        transform: stage === "exit" ? "translateY(-12px) scale(1.015)" : "translateY(0) scale(1)",
        transition:
          stage === "exit"
            ? `opacity ${EXIT_DURATION_MS}ms ${EASING}, transform ${EXIT_DURATION_MS}ms ${EASING}`
            : undefined,
      }}
    >
      {/* Subtle brand glow underlay */}
      <div className="absolute w-[450px] h-[450px] sm:w-[620px] sm:h-[620px] rounded-full bg-brand-500/8 blur-[100px] pointer-events-none -z-10" />

      {/* Center brand presentation */}
      <div className="flex flex-col items-center text-center max-w-sm sm:max-w-md mx-auto">
        {/* Logo mark */}
        <div
          className="relative mb-4 sm:mb-5 flex items-center justify-center"
          style={{
            opacity: stage === "enter" || stage === "tagline" || stage === "exit" ? 1 : 0,
            transform:
              stage === "enter" || stage === "tagline" || stage === "exit"
                ? "translateY(0) scale(1)"
                : "translateY(14px) scale(0.94)",
            transition: `opacity ${ENTRANCE_DURATION_MS}ms ${EASING}, transform ${ENTRANCE_DURATION_MS}ms ${EASING}`,
          }}
        >
          {APP_LOGO_URL && (
            <Image
              src={APP_LOGO_URL}
              alt="SellOnCampus Logo"
              width={72}
              height={72}
              priority
              unoptimized
              className="h-14 w-14 sm:h-16 sm:w-16 object-contain mix-blend-multiply drop-shadow-xs"
            />
          )}
        </div>

        {/* Wordmark */}
        <div
          className="text-3xl min-[360px]:text-4xl sm:text-5xl font-black tracking-tight text-charcoal-900 font-jakarta leading-none"
          style={{
            opacity: stage === "enter" || stage === "tagline" || stage === "exit" ? 1 : 0,
            transform:
              stage === "enter" || stage === "tagline" || stage === "exit"
                ? "translateY(0)"
                : "translateY(12px)",
            transition: `opacity ${ENTRANCE_DURATION_MS}ms ${EASING} 80ms, transform ${ENTRANCE_DURATION_MS}ms ${EASING} 80ms`,
          }}
        >
          Sell<span className="text-brand-500">On</span>Campus
        </div>

        {/* Tagline & network pill */}
        <div
          className="mt-3.5 sm:mt-4 flex flex-col items-center gap-2.5"
          style={{
            opacity: stage === "tagline" || stage === "exit" ? 1 : 0,
            transform:
              stage === "tagline" || stage === "exit" ? "translateY(0)" : "translateY(8px)",
            transition: `opacity 400ms ${EASING}, transform 400ms ${EASING}`,
          }}
        >
          <p className="text-xs sm:text-sm font-medium tracking-wide text-charcoal-500">
            The student marketplace for your campus
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-charcoal-200/70 shadow-xs text-[11px] font-semibold text-charcoal-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span>Verified Student Network</span>
          </div>
        </div>
      </div>

      {/* Discreet skip button */}
      <button
        type="button"
        onClick={cleanupAndFinish}
        className="absolute bottom-6 right-6 text-[11px] sm:text-xs font-medium text-charcoal-400 hover:text-charcoal-700 transition-colors px-2.5 py-1 rounded-lg bg-white/70 hover:bg-white border border-charcoal-200/60 shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label="Skip intro animation"
      >
        Skip ✕
      </button>
    </div>
  );
}
