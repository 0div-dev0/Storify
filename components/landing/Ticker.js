"use client";

import React, { useRef } from "react";
import { gsap, useIsoLayoutEffect } from "@/lib/gsap";

/**
 * Infinite horizontal type marquee — a motion-graphics band.
 * Content is duplicated once so the track can loop by exactly -50%.
 */
export default function Ticker({ items, reverse = false, className = "" }) {
  const root = useRef(null);

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const track = root.current?.querySelector("[data-track]");
        if (!track) return;

        gsap.fromTo(
          track,
          { xPercent: reverse ? -50 : 0 },
          {
            xPercent: reverse ? 0 : -50,
            duration: 34,
            ease: "none",
            repeat: -1,
          }
        );
      }, root);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, [reverse]);

  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="font-display italic text-lg md:text-2xl px-5">{item}</span>
          <span className="text-gold text-xs" aria-hidden="true">
            ◆
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      ref={root}
      className={`relative overflow-hidden py-4 md:py-5 select-none ${className}`}
      aria-hidden="true"
    >
      <div data-chapter-visual className="w-max will-change-transform">
        <div data-track className="flex w-max will-change-transform">
          {row}
          {row}
        </div>
      </div>
    </div>
  );
}
