"use client";

import { useLayoutEffect, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Plugin registration is idempotent and guarded so it never runs during SSR.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/**
 * useLayoutEffect that stays silent during SSR/prerender.
 *
 * Why this exists: GSAP `from()` / `fromTo()` tweens paint their start state
 * synchronously when they are created. Running them in a layout effect means the
 * start state is applied BEFORE the first paint — so there is no flash of
 * un-animated content. useEffect runs after paint, which would flash.
 */
export const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Re-derive ScrollTrigger positions once webfonts settle. Line breaks and
 * element heights change when the real fonts swap in, which invalidates every
 * trigger start/end computed earlier.
 */
export function useScrollRefresh() {
  useIsoLayoutEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const fonts = typeof document !== "undefined" ? document.fonts : null;
    fonts?.ready?.then(refresh).catch(() => {});

    return () => window.removeEventListener("load", refresh);
  }, []);
}

export { gsap, ScrollTrigger, SplitText };
