"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ListingStatus } from "@/lib/types";
import { playStampSound } from "@/lib/audio";
import { cn } from "@/lib/utils";

export interface ListingStampOverlayProps {
  status: ListingStatus;
  animate?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

interface SmogPuff {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  color: string;
}

// Earthy beige & rich dust brown smog palette
const SMOG_COLORS = [
  "rgba(210, 180, 140, 0.75)", // #d2b48c Tan / Sand dust
  "rgba(193, 154, 107, 0.7)",  // #c19a6b Warm Earth
  "rgba(160, 130, 95, 0.65)",  // Deep Clay Dirt
  "rgba(222, 198, 165, 0.7)",  // Light Fine Powder
  "rgba(139, 115, 85, 0.6)",   // Ground Soil
];

export function ListingStampOverlay({
  status,
  animate = false,
  className,
  size = "md",
}: ListingStampOverlayProps) {
  const [showDust, setShowDust] = React.useState(false);
  const [puffs, setPuffs] = React.useState<SmogPuff[]>([]);
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = Boolean(animate && !shouldReduceMotion);
  const rawId = React.useId();
  const filterId = `stamp-distress-${rawId.replace(/:/g, "")}`;

  // Only render for RESERVED or SOLD
  const isTargetStatus = status === "SOLD" || status === "RESERVED";

  React.useEffect(() => {
    if (!isTargetStatus || !shouldAnimate) return;

    // Trigger audio thump & dust shockwave at impact point (140ms)
    const impactTimer = setTimeout(() => {
      playStampSound();
      setShowDust(true);

      // Generate 26 thick, overlapping smog-cloud puffs radiating outward
      const newPuffs: SmogPuff[] = Array.from({ length: 26 }).map((_, i) => {
        const angle = (i / 26) * 2 * Math.PI + (Math.random() - 0.5) * 0.45;
        const distance = 45 + Math.random() * 85; // 45px - 130px outward spread
        return {
          id: i,
          x: Math.round(Math.cos(angle) * distance),
          y: Math.round(Math.sin(angle) * distance),
          size: Math.round(26 + Math.random() * 32), // 26px - 58px thick smog puff
          delay: Math.random() * 0.08,
          color: SMOG_COLORS[i % SMOG_COLORS.length],
        };
      });
      setPuffs(newPuffs);
    }, 140);

    // Cleanup smog after 1650ms slow-motion linger
    const dustCleanupTimer = setTimeout(() => {
      setShowDust(false);
    }, 1650);

    return () => {
      clearTimeout(impactTimer);
      clearTimeout(dustCleanupTimer);
    };
  }, [status, shouldAnimate, isTargetStatus]);

  if (!isTargetStatus) return null;

  const isSold = status === "SOLD";
  const stampColor = isSold ? "#FF0000" : "#F59E0B";
  const stampText = isSold ? "SOLD" : "RESERVED";
  const textColor = isSold ? "#F5F0EB" : "#F8FAFC";

  // Explicit pixel dimension constraints (no rem) - substantially increased scale
  const sizeStyles = {
    sm: "w-[190px] max-w-[190px] sm:w-[220px] sm:max-w-[220px]",
    md: "w-[240px] max-w-[240px] sm:w-[280px] sm:max-w-[280px]",
    lg: "w-[330px] max-w-[330px] sm:w-[390px] sm:max-w-[390px]",
  }[size];

  return (
    <>
      {/* 1. Isolated dimming overlay: light frosted white/warm wash over product image */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: shouldAnimate ? 0 : 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: shouldAnimate ? 0.35 : 0 }}
          className="w-full h-full bg-white/45 backdrop-grayscale-[60%] backdrop-blur-[0.5px]"
        />
      </div>

      {/* 2. Elevated stamp layer outside the dimmed container on higher z-index (z-30) */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none flex items-center justify-center z-30 overflow-hidden",
          className
        )}
      >
        {/* Earthy Smog-Like Dust Cloud Burst on Impact using Framer Motion */}
        <AnimatePresence>
          {showDust && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 pointer-events-none">
              {puffs.map((p) => (
                <motion.span
                  key={p.id}
                  initial={{
                    opacity: 0,
                    x: 0,
                    y: 0,
                    scale: 0.35,
                    filter: "blur(4px)",
                  }}
                  animate={{
                    opacity: [0, 0.85, 0.65, 0.25, 0],
                    x: [0, p.x, p.x * 1.35, p.x * 1.6, p.x * 1.8],
                    y: [0, p.y, p.y * 1.35, p.y * 1.6, p.y * 1.8],
                    scale: [0.35, 1.0, 1.75, 2.4, 2.9],
                    filter: ["blur(4px)", "blur(5px)", "blur(7px)", "blur(10px)", "blur(14px)"],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: p.delay,
                    times: [0, 0.12, 0.45, 0.8, 1],
                    ease: [0.12, 0.7, 0.25, 1], // Viscous slow-motion cloud ease
                  }}
                  style={{
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                  }}
                  className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 will-change-transform"
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* 3. Slamming Stamp Graphic driven by Framer Motion: Clean inline SVG stamp with distressed texture */}
        <motion.div
          key={status}
          initial={
            shouldAnimate
              ? {
                  scale: 4.2,
                  opacity: 0,
                  rotate: 14,
                }
              : {
                  scale: 1,
                  opacity: 1,
                  rotate: -12,
                }
          }
          animate={
            shouldAnimate
              ? {
                  scale: [4.2, 0.88, 1.14, 0.96, 1.02, 1],
                  opacity: [0, 1, 1, 1, 1, 1],
                  rotate: [14, -16, -9, -13, -11.5, -12],
                }
              : {
                  scale: 1,
                  opacity: 1,
                  rotate: -12,
                }
          }
          transition={
            shouldAnimate
              ? {
                  duration: 1.4,
                  times: [0, 0.1, 0.3, 0.6, 0.85, 1],
                  ease: [0.1, 0.95, 0.2, 1], // Fast attack with dramatic slow-motion viscous settling
                }
              : { duration: 0 }
          }
          className={cn(
            "relative select-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)] pointer-events-none opacity-[0.94]",
            sizeStyles
          )}
        >
          <svg
            viewBox="0 0 320 120"
            className="w-full h-auto select-none overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
            aria-label={isSold ? "Sold Stamp" : "Reserved Stamp"}
            role="img"
          >
            <defs>
              <filter id={filterId} x="-15%" y="-15%" width="130%" height="130%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.045 0.08"
                  numOctaves="3"
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale="4"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>

            <g filter={`url(#${filterId})`}>
              {/* Outer thick distressed border */}
              <rect
                x="6"
                y="6"
                width="308"
                height="108"
                rx="8"
                fill="none"
                stroke={stampColor}
                strokeWidth="6"
              />
              {/* Inner thin border line */}
              <rect
                x="14"
                y="14"
                width="292"
                height="92"
                rx="4"
                fill="none"
                stroke={stampColor}
                strokeWidth="2.5"
              />
              {/* Solid vibrant stamp body (zero transparency bleed-through) */}
              <rect
                x="18"
                y="18"
                width="284"
                height="84"
                rx="3"
                fill={stampColor}
              />
              {/* Bold softened off-white text */}
              <text
                x="160"
                y="60"
                textAnchor="middle"
                dominantBaseline="central"
                fill={textColor}
                stroke={isSold ? "none" : "#92400E"}
                strokeWidth={isSold ? 0 : 1.2}
                paintOrder="stroke fill"
                fontFamily="'Arial Black', 'Impact', sans-serif"
                fontSize={isSold ? "56" : "38"}
                fontWeight="900"
                letterSpacing={isSold ? "5" : "3"}
              >
                {stampText}
              </text>
            </g>
          </svg>
        </motion.div>
      </div>
    </>
  );
}
