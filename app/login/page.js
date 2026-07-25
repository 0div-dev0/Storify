"use client"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useForm } from 'react-hook-form';
import { signIn } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Maps NextAuth error codes and our custom verify errors to human-readable messages
const ERROR_MESSAGES = {
    CredentialsSignin: "Invalid email or password. Please check your credentials.",
    "Verify Email first": "Your email isn't verified yet. Please check your inbox.",
    "No account found with this email": "No account found with that email address.",
    "This account uses GitHub login. Please sign in with GitHub.": "This account was registered via GitHub. Please use the GitHub login button.",
    invalid_or_expired_token: "Your verification link is invalid or has expired. Please register again.",
    missing_token: "Verification link is malformed. Please request a new one.",
    server_error: "A server error occurred. Please try again later.",
    OAuthCallback: "GitHub sign-in failed. Please try again.",
    OAuthCreateAccount: "Could not create your account via GitHub. Please try again.",
    default: "Something went wrong. Please try again.",
}

import { Suspense } from 'react'

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">Loading...</div>}>
            <LoginContent />
        </Suspense>
    )
}

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isVerified = searchParams.get("verified") === "true";
    const errorParam = searchParams.get("error");

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting }
    } = useForm();

    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [githubLoading, setGithubLoading] = useState(false);

    useEffect(() => {
        if (isVerified) {
            setSuccessMessage("Email verified successfully! You can now log in.");
        }
        if (errorParam) {
            const msg = ERROR_MESSAGES[errorParam] || ERROR_MESSAGES.default;
            setServerError(msg);
        }
    }, [isVerified, errorParam]);

    const onSubmit = async (data) => {
        setServerError("");
        setSuccessMessage("");

        try {
            const res = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (res?.error) {
                // res.error is the message passed to throw new Error() in authorize()
                const msg = ERROR_MESSAGES[res.error] || ERROR_MESSAGES.default;
                setServerError(msg);
            } else if (res?.ok) {
                router.push("/home");
                router.refresh();
            }
        } catch (err) {
            console.error("Login error:", err);
            setServerError("An unexpected error occurred. Please try again.");
        }
    };

    const handleGithubLogin = async () => {
        setGithubLoading(true);
        setServerError("");
        try {
            await signIn("github", { callbackUrl: "/home" });
        } catch (err) {
            console.error("GitHub login error:", err);
            setServerError("Failed to initiate GitHub login. Please try again.");
            setGithubLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <Navbar />

            <main className="flex-1 flex items-center justify-center p-6 w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-slate-900/50 w-full backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

                        <div className="flex flex-col items-center mb-8">
                            <div className="logobg bg-indigo-500/10 px-20 mb-5 rounded-lg py-0 border border-indigo-500/20">
                                <div className="mb-4 relative object-contain w-20 h-20 logo-container rounded-2xl">
                                    <Logo className="" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                Welcome Back
                            </h1>
                            <p className="text-slate-400 mt-2 text-center">
                                Log in to your account to continue
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {successMessage && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-medium flex items-center gap-3"
                                >
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {successMessage}
                                </motion.div>
                            )}

                            {serverError && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium flex items-start gap-3"
                                >
                                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {serverError}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: 'Please enter a valid email address'
                                        }
                                    })}
                                    className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-white placeholder:text-slate-600 ${
                                        errors.email
                                            ? 'border-rose-500/60 focus:ring-rose-500/30'
                                            : 'border-slate-800 focus:ring-indigo-500/50 focus:border-indigo-500/50'
                                    }`}
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    autoComplete="email"
                                />
                                <AnimatePresence>
                                    {errors.email && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            className="text-rose-400 text-xs mt-1 ml-1 font-medium flex items-center gap-1.5"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.email.message}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-medium text-slate-300" htmlFor="password">
                                        Password
                                    </label>
                                    <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                        Forgot Password?
                                    </Link>
                                </div>
                                <input
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 1,
                                            message: 'Password cannot be empty'
                                        }
                                    })}
                                    className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-white placeholder:text-slate-600 ${
                                        errors.password
                                            ? 'border-rose-500/60 focus:ring-rose-500/30'
                                            : 'border-slate-800 focus:ring-indigo-500/50 focus:border-indigo-500/50'
                                    }`}
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <AnimatePresence>
                                    {errors.password && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            className="text-rose-400 text-xs mt-1 ml-1 font-medium flex items-center gap-1.5"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.password.message}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Submit */}
                            <button
                                disabled={isSubmitting}
                                className="w-full group relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                type="submit"
                            >
                                <span className={isSubmitting ? "opacity-0" : "opacity-100"}>
                                    Log In
                                </span>
                                {isSubmitting && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    </div>
                                )}
                            </button>

                            {/* Divider */}
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-800"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-slate-900/50 px-3 text-slate-500 backdrop-blur-sm">Or continue with</span>
                                </div>
                            </div>

                            {/* GitHub */}
                            <button
                                type="button"
                                onClick={handleGithubLogin}
                                disabled={githubLoading}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {githubLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.841 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                )}
                                {githubLoading ? "Redirecting to GitHub…" : "Continue with GitHub"}
                            </button>

                            <p className="text-center text-sm text-slate-500 pt-2">
                                Don't have an account?{" "}
                                <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                                    Sign up
                                </Link>
                            </p>
                        </form>
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
