"use client";

import { ReactLenis } from "lenis/react";

/**
 * SmoothScrollProvider — wraps the application with Lenis smooth scrolling.
 *
 * Uses `<ReactLenis root>` which applies to the `<html>` scroll container
 * and makes the Lenis instance globally accessible via `useLenis()` from
 * any component.
 *
 * Configuration rationale:
 * - `autoRaf: true` — Lenis manages its own rAF loop (no GSAP dependency)
 * - `lerp: 0.1` — responsive interpolation; fast enough to feel snappy,
 *   smooth enough to be polished
 * - `duration: 1.2` — caps the maximum scroll animation duration for
 *   consistency across wheel/touch/keyboard
 * - `smoothWheel: true` — smooths mouse-wheel events on desktop
 * - `syncTouch: false` — keeps native touch scrolling on mobile devices
 *   for the best feel and battery efficiency
 * - `autoToggle: true` — automatically stops/starts Lenis when the page
 *   is hidden or visible, preventing background CPU waste
 * - `anchors: true` — smooth anchor-link navigation (#id jumps)
 * - `allowNestedScroll: true` — allows inner scrollable elements (modals,
 *   dropdowns, chat panels) to scroll normally without interference
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        syncTouch: false,
        autoToggle: true,
        anchors: true,
        allowNestedScroll: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
