"use client";

import { gsap, ScrollTrigger, useIsoLayoutEffect } from "@/lib/gsap";

/**
 * Bounded parallax only. Nothing leaves the viewport.
 *
 * Scroll parallax and pointer parallax write to separate CSS custom properties;
 * globals.css composes them through the independent `translate` property, so
 * they never fight GSAP's transform (rotation/scale) on the same element.
 */
export default function SectionParallax() {
  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const scrollTweens = [];
      const mouseTweens = new Map();
      const movers = [];
      let onMove = null;
      let onLeave = null;
      let raf = 0;
      let pointerX = 0;
      let pointerY = 0;
      let queued = false;

      const ctx = gsap.context(() => {
        gsap.utils.toArray("[data-parallax-x], [data-parallax-y]").forEach((el) => {
          const x = Number(el.dataset.parallaxX || 0);
          const y = Number(el.dataset.parallaxY || 0);
          if (!x && !y) return;

          const chapter = el.closest("[data-chapter]") || el;
          scrollTweens.push(
            gsap.fromTo(
              el,
              {
                "--scroll-x": `${-x}px`,
                "--scroll-y": `${-y}px`,
              },
              {
                "--scroll-x": `${x}px`,
                "--scroll-y": `${y}px`,
                ease: "none",
                scrollTrigger: {
                  trigger: chapter,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1.1,
                  invalidateOnRefresh: true,
                },
              }
            )
          );
        });
      });

      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        gsap.utils.toArray("[data-mouse-x], [data-mouse-y]").forEach((el) => {
          const x = Number(el.dataset.mouseX || 0);
          const y = Number(el.dataset.mouseY || 0);
          if (!x && !y) return;
          movers.push({ el, x, y });
        });

        const applyPointer = () => {
          queued = false;
          movers.forEach(({ el, x, y }) => {
            mouseTweens.get(el)?.kill();
            mouseTweens.set(
              el,
              gsap.to(el, {
                "--mouse-x": `${(pointerX * x).toFixed(2)}px`,
                "--mouse-y": `${(pointerY * y).toFixed(2)}px`,
                duration: 1.15,
                ease: "power3.out",
              })
            );
          });
        };

        onMove = (event) => {
          pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
          pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
          if (!queued) {
            queued = true;
            raf = requestAnimationFrame(applyPointer);
          }
        };

        onLeave = () => {
          pointerX = 0;
          pointerY = 0;
          if (!queued) {
            queued = true;
            raf = requestAnimationFrame(applyPointer);
          }
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerleave", onLeave);
      }

      const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        cancelAnimationFrame(refresh);
        if (raf) cancelAnimationFrame(raf);
        if (onMove) window.removeEventListener("pointermove", onMove);
        if (onLeave) window.removeEventListener("pointerleave", onLeave);

        scrollTweens.forEach((tween) => {
          tween.scrollTrigger?.kill();
          tween.kill();
        });
        mouseTweens.forEach((tween) => tween.kill());
        movers.forEach(({ el }) =>
          gsap.set(el, { "--mouse-x": "0px", "--mouse-y": "0px" })
        );
        gsap.utils.toArray("[data-parallax-x], [data-parallax-y]").forEach((el) =>
          gsap.set(el, { "--scroll-x": "0px", "--scroll-y": "0px" })
        );
        ctx.revert();
      };
    });

    return () => mm.revert();
  }, []);

  return null;
}
