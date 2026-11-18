"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/AuthContext";
import {
  IoCloseOutline,
  IoMailOutline,
  IoLockClosedOutline,
  IoPersonOutline,
  IoSparklesOutline,
} from "react-icons/io5";

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  // Escape closes the modal, and the page behind it stops scrolling while open.
  // Declared before the early return below so the hook order never changes.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setServerError("");
    reset();
  };

  const onSubmit = async (data) => {
    setServerError("");

    try {
      if (mode === "signup") {
        await signup(data.name.trim(), data.email.trim(), data.password);
      } else {
        await login(data.email.trim(), data.password);
      }
      reset();
      onClose();
    } catch (err) {
      console.error("Auth error:", err);
      let msg = err.message || "Authentication failed.";
      if (
        msg.includes("auth/invalid-credential") ||
        msg.includes("auth/wrong-password") ||
        msg.includes("auth/user-not-found")
      ) {
        msg = "Invalid email or password. Please try again.";
      } else if (msg.includes("auth/email-already-in-use")) {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "login" ? "Sign in to Storify" : "Create your Storify account"}
    >
      <div
        className="relative w-full max-w-md card-vintage p-6 md:p-8 bg-paper text-ink shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            reset();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-ink-soft hover:text-sepia transition-colors rounded-full hover:bg-vellum cursor-pointer"
          aria-label="Close authentication modal"
        >
          <IoCloseOutline size={22} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <span className="eyebrow flex items-center justify-center gap-1.5 mb-1.5">
            <IoSparklesOutline size={14} />
            {mode === "login" ? "Welcome Back" : "Begin Your Chapter"}
          </span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-ink">
            {mode === "login" ? "Sign In to Storify" : "Create Your Account"}
          </h2>
          <p className="text-xs text-ink-soft font-body mt-1">
            {mode === "login"
              ? "Access your journals, habits, and personal stories."
              : "Start recording your days with AI-powered reflections."}
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-4 p-3 rounded-md bg-brick/10 border border-brick/30 text-brick text-xs font-medium">
            {serverError}
          </div>
        )}

        {/* Form using React Hook Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          {mode === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="auth-modal-name" className="text-[11px] font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
                <IoPersonOutline size={14} /> Full Name
              </label>
              <input
                id="auth-modal-name"
                type="text"
                autoComplete="name"
                {...register("name", {
                  required: mode === "signup" ? "Full name is required" : false,
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                })}
                placeholder="e.g. Leo Tolstoy"
                className="input-vintage text-sm"
              />
              {errors.name && (
                <span className="text-[11px] text-brick">{errors.name.message}</span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-modal-email" className="text-[11px] font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
              <IoMailOutline size={14} /> Email Address
            </label>
            <input
              id="auth-modal-email"
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
            <label htmlFor="auth-modal-password" className="text-[11px] font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
              <IoLockClosedOutline size={14} /> Password
            </label>
            <input
              id="auth-modal-password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
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
            className="btn-vintage w-full mt-2 justify-center text-sm py-2.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-parchment/40 border-t-parchment rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="mt-6 pt-4 border-t border-sepia/15 text-center text-xs text-ink-soft font-body">
          {mode === "login" ? (
            <p>
              Don&apos;t have an account yet?{" "}
              <button
                type="button"
                onClick={() => handleModeSwitch("signup")}
                className="text-terracotta font-bold hover:underline cursor-pointer ml-1"
              >
                Sign up here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => handleModeSwitch("login")}
                className="text-terracotta font-bold hover:underline cursor-pointer ml-1"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
