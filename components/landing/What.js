"use client";

import React, { useRef } from "react";
import { gsap, useIsoLayoutEffect } from "@/lib/gsap";
import { FaPenNib, FaBullseye, FaMagic } from "react-icons/fa";

const PILLARS = [
  {
    icon: <FaPenNib />,
    title: "Write the day down",
    body: "A rich-text editor that feels like paper. Date every page, keep every previous entry, come back whenever.",
  },
  {
    icon: <FaBullseye />,
    title: "Set goals that stick",
    body: "Daily, weekly or monthly intentions. The calendar turns your streaks green, amber and red at a glance.",
  },
  {
    icon: <FaMagic />,
    title: "Let the AI read it",
    body: "Pick a stretch of days and get back a lifestyle analysis — or your life retold as an actual story.",
  },
];

export default function What() {
  const root = useRef(null);

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        /* Copy stays static; only the selected elements carry bounded parallax. */

        /* Ruled lines wipe in from the left */
        gsap.from("[data-rule]", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.75,
          stagger: 0.09,
          ease: "power2.out",
          scrollTrigger: { trigger: root.current, start: "top 66%" },
        });

        /* Specimen page drifts against the scroll */
        gsap.to("[data-specimen]", {
          yPercent: -9,
          x: -70,
          rotate: -1.2,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });

        /* Pillar icons do a small ink-pop as they land */
        gsap.from("[data-pillar-icon]", {
          scale: 0.2,
          rotate: -35,
          opacity: 0,
          duration: 0.7,
          stagger: 0.14,
          ease: "back.out(2.2)",
          scrollTrigger: { trigger: "[data-pillars]", start: "top 80%" },
        });
      }, root);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="what" className="bg-tan py-20 md:py-28 px-6 md:px-14 scroll-mt-20">
      <div data-chapter-visual>
        <div className="max-w-[88rem] mx-auto grid lg:grid-cols-[1fr_1fr] gap-14 lg:gap-20 items-center">
          {/* LEFT — what it is */}
          <div className="flex flex-col gap-6">
            <span data-reveal data-directional className="eyebrow">
              What it is
            </span>

            <h2
              data-reveal
              data-parallax-x="-14"
              data-parallax-y="-8"
              data-mouse-x="6"
              data-mouse-y="3"
              className="font-display font-black text-3xl md:text-5xl leading-[1.08] text-ink"
            >
              A journal that reads itself{" "}
              <span className="text-terracotta italic">back to you.</span>
            </h2>

            <p data-reveal className="drop-cap font-body text-ink leading-[1.9] text-[15px] md:text-base">
              Storify is a personal journaling app for people who want more than a
              diary. You write the day in your own words — the slow mornings, the
              guilt, the one thing you finally finished — and Storify keeps it,
              counts it, and hands it to an AI that can see the shape of it.
            </p>

            <p data-reveal className="font-body text-ink/75 leading-[1.9] text-[15px] md:text-base">
              Two lenses come out the other end: a{" "}
              <em className="text-sepia not-italic font-bold">lifestyle analysis</em>{" "}
              that names your habits, or a{" "}
              <em className="text-teal-deep not-italic font-bold">story</em> that retells
              your stretch of days as prose.
            </p>

            <div data-reveal className="ornament mt-2">
              <span className="text-sm font-display italic">Specimen page</span>
            </div>
          </div>

          {/* RIGHT — specimen page */}
          <div data-specimen className="relative will-change-transform">
            <div
              data-parallax-x="30"
              data-parallax-y="-18"
              data-mouse-x="-10"
              data-mouse-y="-7"
              className="card-vintage p-6 md:p-9 ruled-paper shadow-[0_28px_60px_-24px_rgba(74,49,32,0.5)]"
            >
              <div className="flex items-baseline justify-between mb-6">
                <span className="eyebrow">Entry — no. 214</span>
                <span className="font-mono text-[11px] text-ink-faint">
                  07 · 02 · 2026
                </span>
              </div>

              <div className="flex flex-col gap-[19px]">
                {[92, 78, 96, 64, 88, 45].map((w, i) => (
                  <div
                    key={i}
                    data-rule
                    className="h-[6px] rounded-full bg-sepia/25 will-change-transform"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {["rest", "focus", "one thing done"].map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full bg-sepia/15 text-sepia"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-6 -left-3 md:-left-6 bg-espresso text-parchment px-5 py-3 rounded-xl shadow-[0_16px_36px_-14px_rgba(74,49,32,0.8)] rotate-[-4deg]">
              <p className="font-display italic text-sm md:text-base">
                &ldquo;Imperfect, but done.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Pillars */}
        <div
          data-pillars
          className="max-w-[88rem] mx-auto mt-16 md:mt-24 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {PILLARS.map((p, i) => (
            <div
              key={p.title}
              data-reveal
              data-pillar
              data-parallax-x={i === 1 ? -20 : i === 2 ? 26 : 14}
              data-parallax-y={i === 1 ? 12 : i === 2 ? -10 : -6}
              data-mouse-x={i === 1 ? -6 : 7}
              data-mouse-y={i === 2 ? -5 : 4}
              className="card-vintage p-7 h-full flex flex-col gap-4"
            >
              <span
                data-pillar-icon
                className="w-11 h-11 rounded-full bg-terracotta/15 text-terracotta flex items-center justify-center text-lg"
                aria-hidden="true"
              >
                {p.icon}
              </span>
              <h3 className="font-display font-bold text-xl text-ink">{p.title}</h3>
              <p className="font-body text-sm text-ink-soft leading-[1.85]">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
