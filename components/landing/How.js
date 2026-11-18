"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { gsap, useIsoLayoutEffect } from "@/lib/gsap";
import { FaPenNib, FaBullseye, FaRobot, FaBookOpen, FaArrowRight } from "react-icons/fa";

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

    /* ---- Desktop: pinned horizontal scroll ------------------------------- */
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 1024px)", () => {
      const ctx = gsap.context(() => {
        const track = root.current.querySelector("[data-track]");
        const viewport = root.current.querySelector("[data-track-viewport]");
        const progress = root.current.querySelector("[data-progress]");
        if (!track || !viewport) return;

        const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth + 64);
        const scrollLength = () => Math.max(window.innerHeight, distance() + window.innerHeight * 0.45);

        gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });

        // Vertical scrolling drives the track sideways. ease:"none" is required
        // for a 1:1 scroll-to-position mapping.
        const horizontal = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${scrollLength()}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        gsap.to(progress, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${scrollLength()}`,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        // Each card is revealed as it enters; cards never fly off screen.
        gsap.utils.toArray("[data-step]").forEach((step) => {
          const inner = step.querySelector("[data-step-inner]");
          if (!inner) return;

          gsap.fromTo(
            inner,
            { y: 68, autoAlpha: 0, rotation: -7, scale: 0.86 },
            {
              y: 0,
              autoAlpha: 1,
              rotation: 0,
              scale: 1,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: step,
                containerAnimation: horizontal,
                start: "left 92%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });
      }, root);
      return () => ctx.revert();
    });

    /* ---- Small screens: same content, vertical directional reveals ------- */
    mm.add("(prefers-reduced-motion: no-preference) and (max-width: 1023px)", () => {
      const ctx = gsap.context(() => {
        /* Heading stays static; the pinned track owns its own motion. */

        gsap.from("[data-step]", {
          y: 70,
          autoAlpha: 0,
          rotation: -4,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-track]", start: "top 84%" },
        });

        gsap.from("[data-step-icon]", {
          scale: 0.3,
          rotation: -45,
          autoAlpha: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "back.out(2.4)",
          scrollTrigger: { trigger: "[data-track]", start: "top 84%" },
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
      className="relative flex items-center overflow-hidden bg-espresso py-20 md:py-28 lg:h-screen lg:py-0 scroll-mt-20"
    >
      <div data-chapter-visual className="w-full max-w-[88rem] mx-auto px-6 md:px-14">
        <div className="max-w-3xl flex flex-col gap-5 pt-4 lg:pt-10">
          <span data-reveal className="eyebrow-light" data-directional>
            How to use it
          </span>
          <h2
            data-reveal
            data-parallax-x="-12"
            data-parallax-y="-8"
            data-mouse-x="6"
            data-mouse-y="3"
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

        <div data-track-viewport className="relative mt-14 overflow-hidden lg:mt-10">
          <div data-track className="flex flex-col gap-10 lg:w-max lg:flex-row lg:gap-8">
            {STEPS.map((s, i) => (
              <div key={s.n} data-step className="w-full lg:w-[30rem] lg:shrink-0 will-change-transform">
                <div
                  data-step-inner
                  className="flex h-full min-h-[19rem] flex-col rounded-2xl bg-cocoa/55 p-7 md:p-8"
                >
                  <div
                    data-parallax-x={i % 2 ? -16 : 20}
                    data-parallax-y={i % 2 ? 10 : -8}
                    data-mouse-x={i % 2 ? -6 : 6}
                    data-mouse-y={i % 2 ? 4 : -4}
                    className="flex h-full flex-col gap-5"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        data-step-icon
                        className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-espresso text-xl text-gold shadow-[0_12px_30px_-12px_rgba(0,0,0,0.8)]"
                        aria-hidden="true"
                      >
                        <span
                          data-mouse-x={i % 2 ? -5 : 5}
                          data-mouse-y={i % 2 ? 3 : -3}
                          className="flex"
                          aria-hidden="true"
                        >
                          {s.icon}
                        </span>
                      </span>
                      <span className="font-display font-black text-5xl leading-none text-parchment/20">
                        {s.n}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-xl text-parchment">{s.title}</h3>
                    <p className="font-body text-sm text-tan/75 leading-[1.85]">{s.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 hidden items-center gap-4 lg:flex">
          <div className="h-px flex-1 bg-gold/20">
            <div data-progress className="h-full w-full bg-gold" />
          </div>
          <span data-directional className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-gold/80">
            Scroll <FaArrowRight />
          </span>
        </div>

        <div data-cta className="mt-12 flex flex-col items-center gap-4 text-center lg:mt-8">
          <Link href="/journal" className="btn-vintage landing-cta">
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
