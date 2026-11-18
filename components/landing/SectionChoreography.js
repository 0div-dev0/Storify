"use client";

import React, { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useIsoLayoutEffect } from "@/lib/gsap";

/**
 * Every boundary has its own route off screen and back in. The underlying
 * rhythm is identical (slow scrub, ~84% opacity floor, springy arrivals) so the
 * page still feels composed, but no two transitions move the same way.
 */
const RECIPES = [
  {
    name: "sweep-right",
    out: { x: "58vw", y: "-6vh", scale: 1.12, rotation: 6 },
    outLead: { x: "38vw", y: "-4vh", scale: 1.06, rotation: 4 },
    in: { x: "-42vw", y: "5vh", scale: 0.88, rotation: -4 },
    inLead: { x: "-26vw", y: "4vh", scale: 0.94, rotation: -2 },
    outEase: "power2.inOut",
    inEase: "back.out(1.7)",
  },
  {
    name: "lift-northeast",
    out: { x: "44vw", y: "-52vh", scale: 1.06, rotation: -9 },
    outLead: { x: "28vw", y: "-32vh", scale: 1.02, rotation: -5 },
    in: { x: "-30vw", y: "38vh", scale: 0.82, rotation: 7 },
    inLead: { x: "-18vw", y: "24vh", scale: 0.92, rotation: 4 },
    outEase: "power2.in",
    inEase: "back.out(1.55)",
  },
  {
    name: "cascade-left",
    out: { x: "-56vw", y: "12vh", scale: 1.14, rotation: -7 },
    outLead: { x: "-34vw", y: "8vh", scale: 1.05, rotation: -4 },
    in: { x: "46vw", y: "-30vh", scale: 0.86, rotation: 6 },
    inLead: { x: "28vw", y: "-18vh", scale: 0.94, rotation: 3 },
    outEase: "power2.inOut",
    inEase: "back.out(1.8)",
  },
  {
    name: "drop-southwest",
    out: { x: "-36vw", y: "54vh", scale: 1.1, rotation: 10 },
    outLead: { x: "-22vw", y: "32vh", scale: 1.03, rotation: 6 },
    in: { x: "58vw", y: "-8vh", scale: 0.84, rotation: -6 },
    inLead: { x: "36vw", y: "-5vh", scale: 0.93, rotation: -3 },
    outEase: "power2.in",
    inEase: "back.out(1.6)",
  },
  {
    name: "glide-northwest",
    out: { x: "-48vw", y: "-48vh", scale: 1.08, rotation: -11 },
    outLead: { x: "-30vw", y: "-30vh", scale: 1.02, rotation: -6 },
    in: { x: "40vw", y: "42vh", scale: 0.86, rotation: 8 },
    inLead: { x: "24vw", y: "26vh", scale: 0.94, rotation: 5 },
    outEase: "power2.inOut",
    inEase: "back.out(1.7)",
  },
  {
    name: "push-east",
    out: { x: "62vw", y: "4vh", scale: 1.16, rotation: 8 },
    outLead: { x: "38vw", y: "3vh", scale: 1.06, rotation: 5 },
    in: { x: "-22vw", y: "46vh", scale: 1.18, rotation: -3 },
    inLead: { x: "-14vw", y: "28vh", scale: 1.08, rotation: -2 },
    outEase: "power2.in",
    inEase: "back.out(1.45)",
  },
  {
    name: "fan-out",
    out: { x: "34vw", y: "-56vh", scale: 1.1, rotation: -12 },
    outLead: { x: "20vw", y: "-34vh", scale: 1.03, rotation: -7 },
    in: { x: "-12vw", y: "52vh", scale: 0.9, rotation: 5 },
    inLead: { x: "-8vw", y: "32vh", scale: 0.96, rotation: 3 },
    outEase: "power2.inOut",
    inEase: "back.out(1.75)",
  },
];

const unique = (els) => Array.from(new Set(els));
const query = (section, selector) => Array.from(section.querySelectorAll(selector));

/** Elements that should ride a transition, excluding the pinned How track. */
function itemsFor(section) {
  return unique([
    ...query(section, "[data-reveal], [data-pillar], [data-reason], [data-field], [data-col]"),
    ...query(section, ".card-vintage, [data-form], [data-cta], [data-hero-chips] li"),
    ...query(section, "[data-hero-cta] > *"),
  ]).filter((el) => !el.closest("#how"));
}

export default function SectionChoreography() {
  const root = useRef(null);

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const splits = [];

      const ctx = gsap.context(() => {
        const chapters = Array.from(document.querySelectorAll("[data-chapter]"));
        if (!chapters.length) return;

        const ribbon = root.current.querySelector("[data-ribbon]");
        const diamonds = gsap.utils.toArray("[data-ribbon-diamond]", root.current);
        const hud = root.current.querySelector("[data-hud]");
        const hudIndex = root.current.querySelector("[data-hud-index]");
        const hudName = root.current.querySelector("[data-hud-name]");
        const hudProgress = root.current.querySelector("[data-hud-progress]");

        gsap.set(ribbon, { autoAlpha: 0, xPercent: -120, rotation: -5 });
        gsap.set(diamonds, { scale: 0.4, rotation: -120, transformOrigin: "50% 50%" });
        gsap.set(hudProgress, { scaleY: 0, transformOrigin: "top center" });

        chapters.forEach((chapter, i) => {
          const next = chapters[i + 1];
          if (!next) return;

          const recipe = RECIPES[i % RECIPES.length];
          const isHow = (section) => Boolean(section.querySelector("#how"));

          const outHead = chapter.querySelector("h1, h2");
          const outLead = chapter.querySelector("p");
          const outItems = isHow(chapter)
            ? query(chapter, "[data-cta], .eyebrow-light")
            : itemsFor(chapter).filter((el) => el !== outHead && el !== outLead);

          const inHead = next.querySelector("h1, h2");
          const inLead = next.querySelector("p");
          const inItems = isHow(next)
            ? query(next, "[data-cta], .eyebrow-light, [data-progress]")
            : itemsFor(next).filter((el) => el !== inHead && el !== inLead);

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: chapter,
              start: "bottom 108%",
              end: "bottom -18%",
              scrub: 1.3,
              invalidateOnRefresh: true,
            },
          });

          /* ---- outgoing: visible, drifting off screen -------------------- */
          if (outHead) {
            tl.to(
              outHead,
              { ...recipe.out, opacity: 0.84, duration: 0.62, ease: recipe.outEase },
              0
            );
          }
          if (outLead) {
            tl.to(
              outLead,
              { ...recipe.outLead, opacity: 0.86, duration: 0.58, ease: recipe.outEase },
              0.04
            );
          }
          if (outItems.length) {
            tl.to(
              outItems,
              {
                ...recipe.out,
                rotation: (j) => recipe.out.rotation + (j % 2 ? 5 : -5),
                opacity: 0.82,
                duration: 0.64,
                stagger: 0.045,
                ease: recipe.outEase,
              },
              0.06
            );
          }

          /* ---- incoming: progressive word pops, then elements ------------ */
          if (inHead && !inHead.hasAttribute("data-no-split")) {
            const split = new SplitText(inHead, {
              type: "words",
              wordsClass: "st-word",
            });
            splits.push(split);
            tl.fromTo(
              split.words,
              {
                yPercent: 72,
                scale: 0.7,
                opacity: 0.86,
                rotation: (j) => (j % 2 ? 6 : -6),
              },
              {
                yPercent: 0,
                scale: 1,
                opacity: 1,
                rotation: 0,
                duration: 0.56,
                stagger: 0.042,
                ease: recipe.inEase,
                immediateRender: false,
              },
              0.32
            );
          } else if (inHead) {
            tl.fromTo(
              inHead,
              {
                ...recipe.in,
                scale: 0.86,
                opacity: 0.86,
              },
              {
                x: 0,
                y: 0,
                scale: 1,
                rotation: 0,
                opacity: 1,
                duration: 0.58,
                ease: recipe.inEase,
                immediateRender: false,
              },
              0.32
            );
          }

          if (inLead) {
            tl.fromTo(
              inLead,
              { ...recipe.inLead, opacity: 0.86 },
              {
                x: 0,
                y: 0,
                scale: 1,
                rotation: 0,
                opacity: 1,
                duration: 0.54,
                ease: recipe.inEase,
                immediateRender: false,
              },
              0.4
            );
          }

          if (inItems.length) {
            tl.fromTo(
              inItems,
              {
                ...recipe.in,
                rotation: (j) => recipe.in.rotation + (j % 2 ? -5 : 5),
                opacity: 0.84,
              },
              {
                x: 0,
                y: 0,
                scale: 1,
                rotation: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.05,
                ease: recipe.inEase,
                immediateRender: false,
              },
              0.44
            );
          }

          /* ---- faint travelling ribbon, never a full-screen wipe -------- */
          tl.fromTo(
            ribbon,
            { xPercent: -120, autoAlpha: 0 },
            {
              xPercent: 120,
              autoAlpha: 0.16,
              duration: 0.86,
              ease: "none",
              immediateRender: false,
            },
            0.08
          )
            .to(ribbon, { autoAlpha: 0, duration: 0.14, ease: "none" }, 0.92)
            .fromTo(
              diamonds,
              { scale: 0.4, rotation: -120 },
              {
                scale: 1,
                rotation: 180,
                duration: 0.86,
                ease: "none",
                immediateRender: false,
              },
              0.08
            );
        });

        /* ---- directional lean (subtle, velocity based) ------------------ */
        const directional = Array.from(document.querySelectorAll("[data-directional]"));
        if (directional.length) {
          const movers = directional.map((el) => ({
            x: gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }),
            skewX: gsap.quickTo(el, "skewX", { duration: 0.5, ease: "power3.out" }),
          }));

          ScrollTrigger.create({
            start: 0,
            end: "max",
            onUpdate: (self) => {
              const dir = self.direction || 1;
              const energy = Math.min(1, Math.abs(self.getVelocity()) / 2800);
              movers.forEach((m) => {
                m.x(dir * 22 * energy);
                m.skewX(dir * 2.5 * energy);
              });
            },
          });
        }

        /* ---- chapter HUD ------------------------------------------------- */
        const setChapter = (i) => {
          const label = chapters[i].getAttribute("data-chapter") || `Chapter ${i + 1}`;
          if (hudIndex) hudIndex.textContent = String(i + 1).padStart(2, "0");
          if (hudName) hudName.textContent = label;
          if (hud) {
            gsap.fromTo(
              hud,
              { scale: 0.92, opacity: 0.82 },
              { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.6)", overwrite: true }
            );
          }
        };

        chapters.forEach((chapter, i) => {
          ScrollTrigger.create({
            trigger: chapter,
            start: "top 58%",
            end: "bottom 42%",
            onEnter: () => setChapter(i),
            onEnterBack: () => setChapter(i),
          });
        });

        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            if (hudProgress) gsap.set(hudProgress, { scaleY: self.progress });
          },
        });

        const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
        return () => cancelAnimationFrame(raf);
      }, root);

      return () => {
        splits.forEach((split) => split.revert());
        ctx.revert();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={root}
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
      aria-hidden="true"
    >
      {/* Faint travelling rule — a breadcrumb, not a curtain */}
      <div
        data-ribbon
        className="invisible opacity-0 absolute -inset-y-16 left-0 flex w-[120vw] items-center"
      >
        <div className="h-px w-full bg-gradient-to-r from-transparent via-sepia/40 to-transparent" />
        {[18, 48, 78].map((left, i) => (
          <span
            key={i}
            data-ribbon-diamond
            className="absolute text-gold/50 text-lg"
            style={{ left: `${left}%`, top: `${42 + i * 8}%` }}
          >
            ◆
          </span>
        ))}
      </div>

      <div
        data-hud
        className="absolute right-4 top-1/2 hidden -translate-y-1/2 md:flex flex-col items-center gap-3 rounded-full bg-parchment/90 px-2.5 py-3 shadow-[0_10px_30px_-14px_rgba(74,49,32,0.7)]"
      >
        <span data-hud-index className="font-mono text-[10px] font-bold text-sepia">
          01
        </span>
        <div className="h-20 w-px bg-sepia/25">
          <div data-hud-progress className="h-full w-full bg-terracotta" />
        </div>
        <span
          data-hud-name
          className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-soft"
          style={{ writingMode: "vertical-rl" }}
        >
          Hero
        </span>
      </div>
    </div>
  );
}
