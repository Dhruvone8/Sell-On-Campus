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
 * - `lerp: 0.1` — responsive interpolation for desktop mousewheel/trackpad
 * - `duration: 1.2` — smooth scroll duration
 * - `smoothWheel: true` — smooths mouse-wheel events on desktop & responsive desktop viewports
 * - `syncTouch: true` — enables smooth momentum scrolling for touch devices & mobile viewports
 * - `syncTouchLerp: 0.08` — tuned interpolation for natural mobile swipe deceleration
 * - `touchMultiplier: 1.2` — calibrated touch velocity multiplier for fluid finger gestures
 * - `touchInertiaExponent: 1.7` — natural mobile touch inertia curve
 * - `autoToggle: true` — automatically stops/starts Lenis when the page is hidden or visible
 * - `anchors: true` — smooth anchor-link navigation (#id jumps)
 * - `allowNestedScroll: true` — allows inner scrollable elements (modals, dropdowns, chat panels) to scroll normally
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
        syncTouch: true,
        syncTouchLerp: 0.08,
        touchMultiplier: 1.2,
        touchInertiaExponent: 1.7,
        autoToggle: true,
        anchors: true,
        allowNestedScroll: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
