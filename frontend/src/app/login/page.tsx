"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Sparkles, ArrowRight, Loader2, ShieldCheck, Zap } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("muskan@podcastrepurposer.ai");
  const [password, setPassword] = useState("password123");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      showToast("Welcome back! Logged in successfully.", "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async () => {
    setIsSubmitting(true);
    try {
      await login("muskan@podcastrepurposer.ai", "password123");
      showToast("Signed in as demo creator!", "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Demo login failed";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090b] text-zinc-100 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#121215]/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            AI Podcast Repurposer
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Sign in to your GenAI creator studio workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Password
              </label>
              <span className="text-[11px] text-brand-400 cursor-pointer hover:underline">
                Forgot password?
              </span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-glow transition-all duration-150 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign in to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Button for Viva / Mentors */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80">
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Demo Login</span>
            </div>
            <button
              onClick={handleQuickDemo}
              type="button"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 underline"
            >
              Auto Sign-in
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>JWT Protected API Session • Phase 1 MVP</span>
        </div>
      </div>
    </div>
  );
}
