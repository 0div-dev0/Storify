"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { gsap, useIsoLayoutEffect } from "@/lib/gsap";
import { floatLoop } from "@/lib/motion";
import { FaPenNib, FaBullseye, FaRobot, FaBookOpen } from "react-icons/fa";

const STEPS = [
  {
    n: "01",
    icon: <FaPenNib />,
    title: "Write the day down",
    body: "Open the journal and pour the day out in your own words. Rich text, dated pages, everything kept — no formatting to fuss over.",
  },
  {
    n: "02",
    icon: <FaBullseye />,
    title: "Set a few goals",
    body: "Daily, weekly or monthly. Storify checks each day's entries against them and colours the calendar green, amber or red.",
  },
  {
    n: "03",
    icon: <FaRobot />,
    title: "Ask the AI",
    body: "Choose a date range, pick Lifestyle analysis or Story, set the length and theme — then let it read everything you wrote.",
  },
  {
    n: "04",
    icon: <FaBookOpen />,
    title: "Read your own story",
    body: "Get back either an honest read on your habits or your days retold as prose. Then go write the next page.",
  },
];

export default function How() {
  const root = useRef(null);

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.set("[data-connector]", { scaleX: 0 });

        gsap.from("[data-reveal]", {
          y: 40,
          opacity: 0,
          duration: 0.85,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 76%" },
        });

        /* The connector line draws itself across the four steps */
        gsap.to("[data-connector]", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-steps]",
            start: "top 78%",
            end: "bottom 65%",
            scrub: 0.6,
          },
        });

        /* Steps drop into place one after another */
        gsap.from("[data-step]", {
          y: 64,
          opacity: 0,
          duration: 0.85,
          stagger: 0.14,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-steps]", start: "top 80%" },
        });

        /* Big numerals roll up as the line passes them */
        gsap.from("[data-step-num]", {
          yPercent: 100,
          opacity: 0,
          duration: 0.9,
          stagger: 0.14,
          ease: "power4.out",
          scrollTrigger: { trigger: "[data-steps]", start: "top 80%" },
        });

        /* Step badges pulse once, staggered */
        gsap.from("[data-step-icon]", {
          scale: 0.3,
          rotate: -40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.14,
          delay: 0.25,
          ease: "back.out(2.4)",
          scrollTrigger: { trigger: "[data-steps]", start: "top 80%" },
        });

        /* The badges hover above the connector line, one after another.
           Their entrance tween owns scale/rotation/opacity; the loop only
           moves them on Y, so the two never write the same property. */
        floatLoop("[data-step-icon]", {
          amplitude: 2.4,
          startDelay: 2.6,
          stagger: 0.55,
          duration: 4.2,
        });

        /* Closing CTA */
        gsap.from("[data-cta]", {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-cta]", start: "top 90%" },
        });
      }, root);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={root}
      id="how"
      className="bg-espresso py-20 md:py-28 px-6 md:px-14 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="max-w-3xl flex flex-col gap-5">
          <span data-reveal className="eyebrow-light">
            How to use it
          </span>
          <h2
            data-reveal
            className="font-display font-black text-3xl md:text-5xl leading-[1.08] text-parchment"
          >
            Four steps, and the{" "}
            <span className="text-gold italic">third one does the reading.</span>
          </h2>
          <p data-reveal className="font-body text-tan/85 leading-[1.9] text-[15px] md:text-base">
            No setup wizard, no onboarding tour. Write something, tell it what
            you&rsquo;re working toward, and press the button.
          </p>
        </div>

        {/* Steps */}
        <div data-steps className="relative mt-14 md:mt-20">
          {/* Connector line — drawn on scroll */}
          <div
            data-connector
            aria-hidden="true"
            className="hidden md:block absolute left-0 right-0 top-[34px] h-px bg-gradient-to-r from-gold/10 via-gold/60 to-gold/10 origin-left will-change-transform"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
            {STEPS.map((s) => (
              <div key={s.n} data-step className="relative flex flex-col gap-4">
                {/* Badge sits on the connector */}
                <div className="flex items-center gap-4">
                  <span
                    data-step-icon
                    className="relative z-10 w-[68px] h-[68px] shrink-0 rounded-full bg-cocoa text-gold flex items-center justify-center text-xl shadow-[0_10px_26px_-10px_rgba(0,0,0,0.7)]"
                    aria-hidden="true"
                  >
                    {s.icon}
                  </span>
                  <span className="lg:hidden inline-block overflow-hidden font-display font-black text-4xl text-parchment/25">
                    <span data-step-num className="inline-block">
                      {s.n}
                    </span>
                  </span>
                </div>

                <span className="hidden lg:block overflow-hidden">
                  <span
                    data-step-num
                    className="block font-display font-black text-6xl leading-none text-parchment/25"
                  >
                    {s.n}
                  </span>
                </span>

                <h3 className="font-display font-bold text-xl text-parchment">
                  {s.title}
                </h3>
                <p className="font-body text-sm text-tan/75 leading-[1.85]">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Closing CTA */}
        <div data-cta className="mt-16 md:mt-24 flex flex-col items-center text-center gap-5">
          <div className="ornament w-full max-w-xl">
            <span className="font-display italic text-tan/70 text-sm">Ready when you are</span>
          </div>
          <Link href="/journal" className="btn-vintage px-10 py-4 text-base">
            Open the journal
          </Link>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-tan/70">
            It takes about four minutes
          </p>
        </div>
      </div>
    </section>
  );
}
