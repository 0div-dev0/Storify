"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, SplitText, useIsoLayoutEffect, useScrollRefresh } from "@/lib/gsap";
import JournalAnimation from "@/components/JournalAnimation";
import { FaChevronDown } from "react-icons/fa";

/* Dust motes — deterministic scatter so SSR and client markup match. */
const MOTES = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 6.3 + (i % 3) * 8) % 94}%`,
  top: `${(i * 13 + (i % 4) * 7) % 90}%`,
  size: 2 + (i % 4),
}));

export default function Hero() {
  const root = useRef(null);
  const headingRef = useRef(null);
  const stageRef = useRef(null);
  const cardRef = useRef(null);

  useScrollRefresh();

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();
    let split = null;
    let ctx = null;

    const stage = stageRef.current;
    const card = cardRef.current;

    /* ---- Interactive tilt (motion graphic on hover / pointer move) ---- */
    const onMove = (e) => {
      if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, {
        rotateY: px * 9,
        rotateX: -py * 9,
        duration: 0.5,
        ease: "power2.out",
        transformPerspective: 1200,
      });
    };
    const onLeave = () => {
      if (!card) return;
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.8, ease: "power2.out" });
    };

    stage?.addEventListener("mousemove", onMove);
    stage?.addEventListener("mouseleave", onLeave);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      ctx = gsap.context(() => {
        /* ---------- Entrance timeline ---------- */
        if (headingRef.current) {
          split = new SplitText(headingRef.current, {
            type: "words",
            wordsClass: "st-word",
          });
          gsap.set(split.words, { yPercent: 120, opacity: 0 });
        }

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from("[data-hero-eyebrow]", { opacity: 0, y: -12, duration: 0.7 }, 0.05);

        if (split) {
          tl.to(
            split.words,
            { yPercent: 0, opacity: 1, duration: 0.95, stagger: 0.03, ease: "power4.out" },
            0.18
          );
        }

        tl.from("[data-hero-tag]", { opacity: 0, y: 20, duration: 0.7 }, "-=0.55")
          .from(
            "[data-hero-cta] > *",
            { opacity: 0, duration: 0.6, stagger: 0.1 },
            "-=0.4"
          )
          .from(
            "[data-hero-chips] li",
            { opacity: 0, y: 12, duration: 0.5, stagger: 0.07 },
            "-=0.35"
          )
          .from(
            "[data-card]",
            { opacity: 0, y: 70, rotate: -3, duration: 1.05 },
            0.3
          )
          .from(
            "[data-seal]",
            { opacity: 0, scale: 0.35, rotate: -45, duration: 0.9, ease: "back.out(2)" },
            0.85
          )
          .from("[data-note]", { opacity: 0, y: 24, rotate: 6, duration: 0.7 }, "-=0.35")
          .from("[data-scroll-cue]", { opacity: 0, y: -10, duration: 0.6 }, "-=0.3");

        /* ---------- Continuous motion graphics ---------- */
        gsap.to("[data-seal] .seal-disc", {
          rotation: 360,
          duration: 30,
          repeat: -1,
          ease: "none",
          transformOrigin: "50% 50%",
        });

        gsap.utils.toArray("[data-mote]").forEach((el, i) => {
          gsap.to(el, {
            y: `-=${16 + (i % 5) * 8}`,
            x: `${i % 2 ? "+" : "-"}=${5 + (i % 4) * 4}`,
            opacity: 0.2 + (i % 3) * 0.18,
            duration: 4 + (i % 5),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: (i % 6) * 0.45,
          });
        });

        gsap.to("[data-scroll-cue] .cue-chevron", {
          y: 7,
          duration: 1.1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        /* ---------- Scroll-linked parallax ---------- */
        gsap.to("[data-bg]", {
          yPercent: 14,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        gsap.to("[data-seal]", {
          yPercent: -55,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });

        gsap.to("[data-card]", {
          yPercent: -7,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }, root);

      return () => {
        ctx?.revert();
        ctx = null;
        split?.revert();
        split = null;
      };
    });

    return () => {
      stage?.removeEventListener("mousemove", onMove);
      stage?.removeEventListener("mouseleave", onLeave);
      mm.revert();
      ctx?.revert();
      split?.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      className="relative w-full min-h-[96vh] md:min-h-[104vh] overflow-hidden bg-paper flex flex-col justify-center"
    >
      {/* Aged backdrop + warm wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        data-mouse-x="7"
        data-mouse-y="4"
        aria-hidden="true"
      >
        <div data-bg className="absolute inset-0 -top-[8%] h-[116%]">
          <Image
            src="/images/heroimage1.jpg"
            alt=""
            fill
            priority
            className="object-cover opacity-[0.15]"
            style={{ filter: "sepia(0.65) contrast(1.05) saturate(0.8)" }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-paper/80 via-paper/55 to-paper" />
      </div>

      {/* Drifting dust motes */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {MOTES.map((m, i) => (
          <span
            key={i}
            data-mote
            className="absolute rounded-full bg-sepia/50"
            style={{ left: m.left, top: m.top, width: m.size, height: m.size }}
          />
        ))}
      </div>

      <div
        data-chapter-visual
        className="relative z-10 w-full max-w-[88rem] mx-auto px-6 md:px-14 py-24 md:py-28 grid lg:grid-cols-[0.95fr_1.05fr] gap-16 lg:gap-12 items-center"
      >
        {/* LEFT — headline */}
        <div className="flex flex-col gap-7 text-left">
          <span data-hero-eyebrow className="eyebrow" data-directional>
            Est. — Your life, in chapters
          </span>

          <h1
            ref={headingRef}
            data-mouse-x="7"
            data-mouse-y="4"
            className="font-display font-black text-4xl sm:text-5xl md:text-5xl lg:text-[3.9rem] leading-[1.05] text-ink"
          >
            See what you&rsquo;ve been up to with{" "}
            <span className="text-terracotta italic">AI journal summaries</span>,
            analyze your habits, change your lifestyle
          </h1>

          <p data-hero-tag className="font-display italic text-xl md:text-2xl text-sepia">
            &ldquo;Turn your life into a story.&rdquo;
          </p>

          <div
            data-hero-cta
            data-mouse-x="5"
            data-mouse-y="3"
            className="flex w-full flex-col sm:flex-row sm:items-stretch gap-3 sm:gap-4"
          >
            <Link href="/journal" className="btn-vintage landing-cta w-full sm:w-auto">
              Start building your story
            </Link>
            <Link href="#how" className="btn-outline landing-cta w-full sm:w-auto">
              See how it works
            </Link>
          </div>

          <ul
            data-hero-chips
            data-directional
            data-mouse-x="-6"
            data-mouse-y="4"
            className="flex flex-wrap gap-x-7 gap-y-2 justify-start font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft"
          >
            <li>Two AI lenses</li>
            <li>Your words, your data</li>
          </ul>
        </div>

        {/* RIGHT — rotating seal + oversized journal page */}
        <div ref={stageRef} className="relative pb-8">
          <div
            data-seal
            className="absolute -top-12 -right-2 md:-right-8 z-20 w-28 h-28 md:w-32 md:h-32 text-sepia pointer-events-none"
            aria-hidden="true"
          >
            <div
              data-parallax-x="-28"
              data-parallax-y="14"
              data-mouse-x="18"
              data-mouse-y="10"
              className="h-full w-full"
            >
            <svg viewBox="0 0 120 120" className="seal-disc w-full h-full">
              <defs>
                <path
                  id="sealPath"
                  d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"
                  fill="none"
                />
              </defs>
              <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
              <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
              <text fill="currentColor" fontSize="8.5" fontWeight="700" letterSpacing="2.6" fontFamily="JetBrains Mono, monospace">
                <textPath href="#sealPath" startOffset="0">
                  STORIFY · YOUR LIFE IS YOUR STORY · EST. MMXXVI ·
                </textPath>
              </text>
              <path d="M60 48 L72 60 L60 72 L48 60 Z" fill="currentColor" opacity="0.85" />
            </svg>
            </div>
          </div>

          <div
            ref={cardRef}
            data-card
            className="card-vintage ruled-paper relative flex min-h-[440px] md:min-h-[560px] flex-col p-6 md:p-9 shadow-[0_36px_80px_-32px_rgba(74,49,32,0.6)] will-change-transform"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              data-parallax-x="24"
              data-parallax-y="-14"
              data-mouse-x="-12"
              data-mouse-y="-8"
              className="grid flex-1 grid-cols-1 gap-7 lg:grid-cols-[1.28fr_0.72fr] lg:gap-9"
            >
              <div className="flex min-h-0 flex-col">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="eyebrow">From the diary</span>
                  <span className="font-mono text-[11px] text-ink-faint">07 · 02 · 2026</span>
                </div>
                <div className="mt-5 min-h-[300px] flex-1 overflow-hidden md:min-h-[400px]">
                  <JournalAnimation />
                </div>
              </div>

              {/* Margin notes are part of the same page, not a nested card. */}
              <div className="hidden min-h-0 flex-col gap-5 border-l border-sepia/15 pl-7 lg:flex">
                <span className="eyebrow">In the margin</span>
                <p className="font-display text-lg italic leading-relaxed text-sepia">
                  Pattern found: rest is not a failure. One thing finished is a full day.
                </p>
                <div className="h-px w-full bg-sepia/15" />
                <div className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                  <span>Mood — steady</span>
                  <span>Goal — one thing done ✓</span>
                  <span>Lens — lifestyle</span>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  {["rest", "focus", "one thing done"].map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-sepia/12 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-sepia"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            data-note
            className="absolute -bottom-7 -left-3 md:-left-8 max-w-[16rem] -rotate-3 rounded-xl bg-espresso px-5 py-3 text-parchment shadow-[0_18px_40px_-16px_rgba(74,49,32,0.9)]"
          >
            <p
              data-parallax-x="18"
              data-parallax-y="12"
              data-mouse-x="-14"
              data-mouse-y="8"
              className="font-display text-sm italic md:text-base"
            >
              Imperfect, but done.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        data-scroll-cue
        className="absolute bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-sepia/70"
        aria-hidden="true"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="cue-chevron flex">
          <FaChevronDown size={13} />
        </span>
      </div>

      <div className="ornament absolute bottom-0 left-0 right-0 px-6 md:px-14"></div>
    </section>
  );
}
