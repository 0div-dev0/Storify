"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import {
  IoMailOutline,
  IoLockClosedOutline,
  IoPersonOutline,
  IoSparklesOutline,
  IoArrowForwardOutline,
} from "react-icons/io5";

export default function RegisterPage() {
  const router = useRouter();
  const { user, signup } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  // If already authenticated, redirect to /home immediately
  useEffect(() => {
    if (user) {
      router.replace("/home");
    }
  }, [user, router]);

  const onSubmit = async (data) => {
    setServerError("");

    try {
      await signup(data.name.trim(), data.email.trim(), data.password);
      router.push("/home");
    } catch (err) {
      console.error("Register error:", err);
      let msg = err.message || "Failed to create account.";
      if (msg.includes("auth/email-already-in-use")) {
        msg = "This email is already in use. Please sign in instead.";
      } else if (msg.includes("auth/weak-password")) {
        msg = "Password should be at least 6 characters.";
      } else if (msg.includes("auth/invalid-email")) {
        msg = "Please enter a valid email address.";
      }
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 pt-10 pb-28 md:py-12">
        <div className="w-full max-w-md card-vintage p-8 bg-paper">
          <div className="text-center mb-6">
            <span className="eyebrow flex items-center justify-center gap-1.5 mb-2">
              <IoSparklesOutline size={14} /> Begin Your Chronicle
            </span>
            <h1 className="text-3xl font-display font-black text-ink">Register</h1>
            <p className="text-sm text-ink-soft mt-1">Start turning your daily entries into living stories.</p>
          </div>

          {serverError && (
            <div className="mb-4 p-3 rounded-md bg-brick/10 border border-brick/30 text-brick text-xs font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-name" className="text-[11px] font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
                <IoPersonOutline size={14} /> Full Name
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                {...register("name", {
                  required: "Full name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                })}
                placeholder="e.g. Leo Tolstoy"
                className="input-vintage"
              />
              {errors.name && (
                <span className="text-[11px] text-brick">{errors.name.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-email" className="text-[11px] font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
                <IoMailOutline size={14} /> Email Address
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                })}
                placeholder="writer@storify.me"
                className="input-vintage"
              />
              {errors.email && (
                <span className="text-[11px] text-brick">{errors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-password" className="text-[11px] font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
                <IoLockClosedOutline size={14} /> Password
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                placeholder="••••••••"
                className="input-vintage"
              />
              {errors.password && (
                <span className="text-[11px] text-brick">{errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-vintage w-full mt-2 justify-center py-2.5 cursor-pointer disabled:opacity-50 text-sm"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-parchment/40 border-t-parchment rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  <span>Create Account</span>
                  <IoArrowForwardOutline size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-sepia/15 text-center text-xs text-ink-soft">
            Already have an account?{" "}
            <Link href="/login" className="text-terracotta font-bold hover:underline ml-1">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
