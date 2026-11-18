"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { gsap, useIsoLayoutEffect } from "@/lib/gsap";
import Logo from "@/components/Logo";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/home" },
      { label: "Journal", href: "/journal" },
      { label: "Landing", href: "/" },
    ],
  },
  {
    title: "This page",
    links: [
      { label: "What it is", href: "#what" },
      { label: "Why keep one", href: "#why" },
      { label: "How to use it", href: "#how" },
    ],
  },
  {
    title: "Elsewhere",
    links: [
      { label: "hello@storify.app", href: "mailto:hello@storify.app" },
      { label: "Report a bug", href: "mailto:hello@storify.app?subject=Bug" },
      { label: "Request a feature", href: "mailto:hello@storify.app?subject=Feature" },
    ],
  },
];

export default function Footer() {
  const root = useRef(null);

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.from("[data-reveal]", {
          y: 34,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 88%" },
        });

        gsap.from("[data-col]", {
          y: 26,
          opacity: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 90%" },
        });

        gsap.to("[data-foot-diamond]", {
          rotate: 360,
          duration: 24,
          repeat: -1,
          ease: "none",
        });
      }, root);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <footer ref={root} className="bg-espresso px-6 md:px-14 pt-16 pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto">
        {/* Top */}
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div data-reveal className="flex flex-col gap-5 max-w-sm">
            <Logo tone="dark" />
            <p className="font-body text-sm text-tan/75 leading-[1.85]">
              A vintage-styled journal that keeps your days, tracks your goals,
              and lets an AI read the whole thing back to you — as analysis, or
              as a story.
            </p>
            <div data-foot-diamond className="w-fit text-gold text-lg" aria-hidden="true">
              ◆
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} data-col className="flex flex-col gap-3.5">
              <h3 className="eyebrow-light">{col.title}</h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="font-body text-sm text-tan/75 hover:text-parchment transition-colors duration-200 cursor-pointer"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Ornament */}
        <div data-reveal className="ornament mt-14 mb-7">
          <span className="font-display italic text-tan/60 text-sm">
            Finis — for now
          </span>
        </div>

        {/* Bottom */}
        <div
          data-reveal
          className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-tan/70">
            &copy; {new Date().getFullYear()} Storify — your life is your story
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-tan/70">
            Next.js &middot; GSAP &middot; Firebase
          </p>
        </div>
      </div>
    </footer>
  );
}
