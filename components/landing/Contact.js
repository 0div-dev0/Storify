"use client";

import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { gsap, useIsoLayoutEffect } from "@/lib/gsap";
import { FaEnvelope, FaPaperPlane, FaCheck } from "react-icons/fa";

const CONTACT_EMAIL = "hello@storify.app";

export default function Contact() {
  const root = useRef(null);
  const successRef = useRef(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", email: "", message: "" },
    mode: "onTouched",
  });

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        /* Reveal and headline pops are gone — the form only breathes parallax. */

        gsap.from("[data-quill]", {
          rotate: -18,
          scale: 0.5,
          opacity: 0,
          duration: 0.9,
          ease: "back.out(2)",
          scrollTrigger: { trigger: root.current, start: "top 70%" },
        });
      }, root);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  /* Success state gets its own little pop whenever it mounts. */
  useIsoLayoutEffect(() => {
    if (!sent || !successRef.current) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tween = gsap.from(successRef.current, {
        scale: 0.85,
        opacity: 0,
        duration: 0.55,
        ease: "back.out(2.2)",
      });
      return () => tween.revert();
    });
    return () => mm.revert();
  }, [sent]);

  const onFormSubmit = (data) => {
    const subject = encodeURIComponent(`Storify — note from ${data.name}`);
    const body = encodeURIComponent(
      `${data.message}\n\n— ${data.name}\n${data.email}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <section ref={root} className="bg-clay py-20 md:py-28 px-6 md:px-14">
      <div data-chapter-visual className="max-w-[88rem] mx-auto grid lg:grid-cols-[1fr_1.05fr] gap-14 lg:gap-20 items-start">
        {/* LEFT — invitation */}
        <div className="flex flex-col gap-6 relative">
          <span data-reveal className="eyebrow">
            Say hello
          </span>
          <h2
            data-reveal
            data-parallax-x="-14"
            data-parallax-y="-8"
            data-mouse-x="6"
            data-mouse-y="3"
            className="font-display font-black text-3xl md:text-5xl leading-[1.08] text-ink"
          >
            Questions, ideas, or just want to{" "}
            <span className="text-terracotta italic">talk journals?</span>
          </h2>
          <p
            data-reveal
            className="font-body text-ink/75 leading-[1.9] text-[15px] md:text-base max-w-xl"
          >
            Feature requests, bug reports, a workflow you wish Storify had — all
            of it is welcome. Write it the way you&rsquo;d write an entry: plainly
            and honestly.
          </p>

          <a
            data-reveal
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center gap-3 self-start mt-1 px-5 py-3.5 rounded-xl bg-parchment text-ink font-body font-bold cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 shadow-[0_10px_26px_-14px_rgba(74,49,32,0.7)]"
          >
            <FaEnvelope className="text-sepia" />
            {CONTACT_EMAIL}
          </a>

          <div data-reveal className="flex flex-wrap gap-x-8 gap-y-2 mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/75">
            <span>Replies within a day or two</span>
            <span>No newsletters</span>
          </div>

          {/* Quill ornament */}
          <div
            data-quill
            data-directional
            aria-hidden="true"
            className="absolute -top-6 right-2 lg:right-10 text-sepia/25 text-6xl md:text-7xl pointer-events-none select-none"
          >
            <span data-mouse-x="12" data-mouse-y="8" aria-hidden="true">
              &#10022;
            </span>
          </div>
        </div>

        {/* RIGHT — form */}
        <div
          data-form
          data-parallax-x="24"
          data-parallax-y="-12"
          data-mouse-x="-8"
          data-mouse-y="-6"
          className="relative"
        >
          {sent ? (
            <div
              ref={successRef}
              className="card-vintage p-9 md:p-12 flex flex-col items-center text-center gap-4"
              role="status"
            >
              <span className="w-14 h-14 rounded-full bg-sage/20 text-sage flex items-center justify-center text-2xl">
                <FaCheck />
              </span>
              <h3 className="font-display font-black text-2xl md:text-3xl text-ink">
                Your note is on its way
              </h3>
              <p className="font-body text-ink-soft leading-[1.85] text-sm md:text-base">
                Your mail app should have opened with everything filled in. If it
                didn&rsquo;t, write to{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-sepia font-bold underline">
                  {CONTACT_EMAIL}
                </a>{" "}
                directly.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  reset();
                }}
                className="btn-outline mt-1 cursor-pointer"
              >
                Write another
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onFormSubmit)}
              noValidate
              className="card-vintage p-7 md:p-9 flex flex-col gap-5"
            >
              <div className="flex items-center justify-between pb-1">
                <span className="eyebrow">Leave a note</span>
                <span className="font-mono text-[10px] text-ink-faint uppercase tracking-widest">
                  No. 001
                </span>
              </div>

              <div data-field className="flex flex-col gap-1.5">
                <label htmlFor="c-name" className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                  Your name
                </label>
                <input
                  id="c-name"
                  type="text"
                  {...register("name", { required: "Please enter your name" })}
                  placeholder="Ada Lovelace"
                  className="input-vintage w-full"
                  autoComplete="name"
                />
                {errors.name && (
                  <span className="text-[11px] text-brick">{errors.name.message}</span>
                )}
              </div>

              <div data-field className="flex flex-col gap-1.5">
                <label htmlFor="c-email" className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                  Email
                </label>
                <input
                  id="c-email"
                  type="email"
                  {...register("email", {
                    required: "Please enter your email",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "That email address doesn't look right.",
                    },
                  })}
                  placeholder="you@example.com"
                  className="input-vintage w-full"
                  autoComplete="email"
                />
                {errors.email && (
                  <span className="text-[11px] text-brick">{errors.email.message}</span>
                )}
              </div>

              <div data-field className="flex flex-col gap-1.5">
                <label htmlFor="c-msg" className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                  Message
                </label>
                <textarea
                  id="c-msg"
                  rows={5}
                  {...register("message", { required: "Please write a short note" })}
                  placeholder="Tell me what you'd like Storify to do…"
                  className="input-vintage w-full resize-y leading-[1.8]"
                />
                {errors.message && (
                  <span className="text-[11px] text-brick">{errors.message.message}</span>
                )}
              </div>

              <div data-field className="flex flex-col gap-3 pt-1">
                <button type="submit" className="btn-vintage w-full cursor-pointer">
                  <FaPaperPlane />
                  Send the note
                </button>
                <p className="font-mono text-[10px] text-ink-faint text-center uppercase tracking-widest">
                  Opens your mail app
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
