"use client"
import { useState } from "react"
import { useForm } from 'react-hook-form';
import Navbar from "@/components/Navbar";
import sendEmail from "../actions/email";
import Image from "next/image";
import Logo from "@/components/Logo";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting }
    } = useForm();

    const [isSuccess, setIsSuccess] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");

    const onSubmit = async (data) => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                setError('email', {
                    type: "manual",
                    message: result.error || "Something went wrong"
                });
                return;
            }

            if (result.user?.email && result.user?.token) {
                // Trigger email verification
                await sendEmail({ email: result.user.email, token: result.user.token });
                setRegisteredEmail(result.user.email);
                setIsSuccess(true);
            }
        } catch (err) {
            console.error("Registration error:", err);
            setError('root', {
                type: "manual",
                message: "An unexpected error occurred. Please try again."
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <Navbar />

            <main className="relative flex min-h-[calc(100vh-80px)] items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    {!isSuccess ? (
                        <motion.div 
                            key="register-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="w-full max-w-md"
                        >
                            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                                {/* Subtle animated gradient border at the top */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient-x" />
                                
                                <div className="flex flex-col items-center mb-8">
                                                             <div className="logobg bg-indigo-500/10 px-20 mb-5 rounded-lg py-0 border border-indigo-500/20">
                                 
                                                             <div className="mb-4 relative object-contain  w-20 h-20 logo-container rounded-2xl">
                                                                 <Logo className="" />
                                                             </div>
                                                             </div>
                                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                        Create Account
                                    </h1>
                                    <p className="text-slate-400 mt-2 text-center">
                                        Join us and start your journey today
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="email">
                                            Email Address
                                        </label>
                                        <input
                                            {...register('email', {
                                                required: 'Email is required',
                                                pattern: {
                                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                    message: 'Invalid email address'
                                                }
                                            })}
                                            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white placeholder:text-slate-600"
                                            id="email"
                                            type="email"
                                            placeholder="name@example.com"
                                        />
                                        {errors.email && (
                                            <p className="text-rose-500 text-xs mt-1 ml-1 font-medium animate-in fade-in slide-in-from-top-1">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="password">
                                            Password
                                        </label>
                                        <input
                                            {...register('password', {
                                                required: 'Password is required',
                                                minLength: {
                                                    value: 6,
                                                    message: 'Password must be at least 6 characters'
                                                }
                                            })}
                                            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white placeholder:text-slate-600"
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                        />
                                        {errors.password && (
                                            <p className="text-rose-500 text-xs mt-1 ml-1 font-medium animate-in fade-in slide-in-from-top-1">
                                                {errors.password.message}
                                            </p>
                                        )}
                                    </div>

                                    {errors.root && (
                                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                                            <p className="text-rose-500 text-sm font-medium text-center">
                                                {errors.root.message}
                                            </p>
                                        </div>
                                    )}

                                    <button 
                                        disabled={isSubmitting}
                                        className="w-full group relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed" 
                                        type="submit"
                                    >
                                        <span className={isSubmitting ? "opacity-0" : "opacity-100"}>
                                            Create Account
                                        </span>
                                        {isSubmitting && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </button>

                                    <p className="text-center text-sm text-slate-500 pt-2">
                                        Already have an account?{" "}
                                        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                                            Login
                                        </Link>
                                    </p>
                                </form>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="success-message"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="w-full max-w-md text-center"
                        >
                            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-10 rounded-3xl shadow-2xl">
                                <div className="mb-6 inline-flex p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                    <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-4">Check your email</h2>
                                <p className="text-slate-400 mb-8 leading-relaxed">
                                    We've sent a verification link to <span className="text-indigo-400 font-medium">{registeredEmail}</span>. 
                                    Please click the link to activate your account.
                                </p>
                                <div className="space-y-4">
                                    <Link 
                                        href="/login" 
                                        className="inline-block w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
                                    >
                                        Go to Login
                                    </Link>
                                    <p className="text-xs text-slate-500">
                                        Didn't receive the email? Check your spam folder or try again.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
