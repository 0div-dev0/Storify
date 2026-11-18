"use client";

import React, { useRef } from "react";
import { gsap, useIsoLayoutEffect } from "@/lib/gsap";
import { floatLoop } from "@/lib/motion";
import { FaChartLine, FaMagic, FaCheckCircle } from "react-icons/fa";

const REASONS = [
  {
    icon: <FaChartLine />,
    title: "Memory is unreliable",
    body: "A year of days blurs into one. Written down, the slow weeks and the good ones stay separable — and the AI can chart them for you.",
    accent: "text-terracotta bg-terracotta/15",
  },
  {
    icon: <FaMagic />,
    title: "Two lenses on one life",
    body: "Ask for a cold, honest lifestyle analysis — or ask for the same days retold as a story. Same journal, completely different reading.",
    accent: "text-teal bg-teal/15",
  },
  {
    icon: <FaCheckCircle />,
    title: "Goals that actually move",
    body: "Storify reads the day's entries against your goals and marks what genuinely happened. No manual bookkeeping, no lying to yourself.",
    accent: "text-sage bg-sage/15",
  },
];

const STATS = [
  { value: 0, suffix: "", label: "advertisements, ever" },
  { value: 2, suffix: "", label: "AI lenses on your days" },
  { value: 3, suffix: "", label: "steps to your first story" },
];

export default function Why() {
  const root = useRef(null);

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        /* Headline + lead-in */
        gsap.from("[data-reveal]", {
          y: 40,
          opacity: 0,
          duration: 0.85,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 76%" },
        });

        /* Reason cards deal in like cards onto a table */
        gsap.from("[data-reason]", {
          y: 56,
          opacity: 0,
          rotate: (i) => (i % 2 ? 1.6 : -1.6),
          duration: 0.85,
          stagger: 0.11,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-reasons]", start: "top 82%" },
        });

        /* Ink-pop the icons once the cards have landed */
        gsap.from("[data-reason-icon]", {
          scale: 0.3,
          opacity: 0,
          duration: 0.6,
          stagger: 0.11,
          delay: 0.35,
          ease: "back.out(2.4)",
          scrollTrigger: { trigger: "[data-reasons]", start: "top 82%" },
        });

        /* Number counters */
        gsap.utils.toArray("[data-count]").forEach((el) => {
          const target = Number(el.dataset.count);
          el.textContent = "0"; // only under no-preference; reduced-motion keeps the real value
          const proxy = { n: 0 };
          gsap.to(proxy, {
            n: target,
            duration: 1.4,
            ease: "power2.out",
            snap: { n: 1 },
            onUpdate: () => {
              el.textContent = String(Math.round(proxy.n));
            },
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });

        /* Stat strip underline sweep */
        gsap.from("[data-stat-line]", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.1,
          ease: "power2.inOut",
          scrollTrigger: { trigger: "[data-stats]", start: "top 85%" },
        });

        /* Cards keep breathing once they have landed — out of phase, forever */
        floatLoop("[data-reason]", { amplitude: 1.6, startDelay: 1.7, stagger: 0.45 });
      }, root);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="why" className="bg-paper py-20 md:py-28 px-6 md:px-14 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="max-w-3xl flex flex-col gap-5">
          <span data-reveal className="eyebrow">
            Why keep one
          </span>
          <h2
            data-reveal
            className="font-display font-black text-3xl md:text-5xl leading-[1.08] text-ink"
          >
            Because memory fades, and{" "}
            <span className="text-terracotta italic">patterns stay invisible</span>{" "}
            until someone reads all of it at once.
          </h2>
          <p
            data-reveal
            className="font-body text-ink-soft leading-[1.9] text-[15px] md:text-base"
          >
            Storify exists for the gap between what a day feels like and what a
            hundred days actually were.
          </p>
        </div>

        {/* Reasons */}
        <div
          data-reasons
          className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {REASONS.map((r) => (
            <div key={r.title} data-reason className="card-vintage p-7 flex flex-col gap-4 h-full">
              <span
                data-reason-icon
                className={`w-11 h-11 rounded-full flex items-center justify-center text-lg ${r.accent}`}
                aria-hidden="true"
              >
                {r.icon}
              </span>
              <h3 className="font-display font-bold text-lg leading-snug text-ink">
                {r.title}
              </h3>
              <p className="font-body text-sm text-ink-soft leading-[1.85]">{r.body}</p>
            </div>
          ))}
        </div>

        {/* Stat strip */}
        <div data-stats className="mt-16 md:mt-24">
          <div data-stat-line className="h-px w-full bg-sepia/25 origin-left" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-10">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center gap-2">
                <span
                  data-count={s.value}
                  className="font-display font-black text-5xl md:text-6xl text-sepia tabular-nums"
                >
                  {s.value}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <div data-stat-line className="h-px w-full bg-sepia/25 origin-left" />
        </div>
      </div>
    </section>
  );
}
