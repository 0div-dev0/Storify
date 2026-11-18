import { gsap } from "./gsap";

/**
 * Continuous idle float for card groups — subtle, out of phase, never stops.
 *
 * Rules for use:
 * - Call it inside a `gsap.context(() => {...}, rootRef)` so `ctx.revert()`
 *   kills the loops on cleanup.
 * - Call it only inside a `"(prefers-reduced-motion: no-preference)"` branch of
 *   `gsap.matchMedia()` — reduced-motion users must get still content.
 * - It animates `yPercent`, never `y` / `opacity` / `rotation`, so it never
 *   fights an entrance tween written against those properties.
 *
 * @param {string|Element[]} targets selector or elements to float
 * @param {object} opts amplitude (% of element height),
 *                        duration (s), startDelay (s), stagger (s)
 */
export function floatLoop(targets, {
  amplitude = 1.3,
  duration = 3.6,
  startDelay = 1.6,
  stagger = 0.4,
  ease = "sine.inOut",
} = {}) {
  const els = gsap.utils.toArray(targets);

  els.forEach((el, i) => {
    const dir = i % 2 ? 1 : -1;
    gsap.to(el, {
      yPercent: dir * amplitude,
      duration,
      delay: startDelay + i * stagger,
      ease,
      repeat: -1,
      yoyo: true,
      force3D: true,
    });
  });

  return els;
}
