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
  IoSparklesOutline,
  IoArrowForwardOutline,
} from "react-icons/io5";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
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
      await login(data.email.trim(), data.password);
      router.push("/home");
    } catch (err) {
      console.error("Login error:", err);
      let msg = err.message || "Failed to sign in.";
      if (
        msg.includes("auth/invalid-credential") ||
        msg.includes("auth/wrong-password") ||
        msg.includes("auth/user-not-found")
      ) {
        msg = "Invalid email or password. Please try again.";
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
              <IoSparklesOutline size={14} /> The Writer&apos;s Desk
            </span>
            <h1 className="text-3xl font-display font-black text-ink">Sign In</h1>
            <p className="text-sm text-ink-soft mt-1">Welcome back to your private journal chronicles.</p>
          </div>

          {serverError && (
            <div className="mb-4 p-3 rounded-md bg-brick/10 border border-brick/30 text-brick text-xs font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-[11px] font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
                <IoMailOutline size={14} /> Email Address
              </label>
              <input
                id="login-email"
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
                className="input-vintage text-sm"
              />
              {errors.email && (
                <span className="text-[11px] text-brick">{errors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-[11px] font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
                <IoLockClosedOutline size={14} /> Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                placeholder="••••••••"
                className="input-vintage text-sm"
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
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <IoArrowForwardOutline size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-sepia/15 text-center text-xs text-ink-soft">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-terracotta font-bold hover:underline ml-1">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
