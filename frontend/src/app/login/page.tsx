"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Sparkles, ArrowRight, Loader2, ShieldCheck, Users } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("muskan@podcastrepurposer.ai");
  const [password, setPassword] = useState("password123");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("Please enter an email", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      showToast(`Welcome back! Signed in as ${email.split("@")[0]}`, "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectUser = async (userEmail: string) => {
    setEmail(userEmail);
    setPassword("password123");
    setIsSubmitting(true);
    try {
      await login(userEmail, "password123");
      showToast(`Logged in successfully!`, "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
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
        <div className="text-center mb-6">
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

        {/* 1-Click Fast Switch User Pills */}
        <div className="mb-6 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-2">
          <p className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-400" />
            <span>Quick Sign-In As Team Member:</span>
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleSelectUser("muskan@podcastrepurposer.ai")}
              className="p-2 rounded-xl bg-zinc-800/60 hover:bg-brand-500/15 hover:border-brand-500/40 border border-zinc-700/60 transition-all text-left flex items-center gap-2 group"
            >
              <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-bold">
                M
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-zinc-200 block truncate text-[11px]">Muskan</span>
                <span className="text-[9px] text-zinc-400 block">Creator</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectUser("shivani@podcastrepurposer.ai")}
              className="p-2 rounded-xl bg-zinc-800/60 hover:bg-brand-500/15 hover:border-brand-500/40 border border-zinc-700/60 transition-all text-left flex items-center gap-2 group"
            >
              <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold">
                S
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-zinc-200 block truncate text-[11px]">Shivani</span>
                <span className="text-[9px] text-zinc-400 block">Creator</span>
              </div>
            </button>
          </div>
        </div>

        {/* Standard Email / Password Form */}
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
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-glow transition-all duration-150 disabled:opacity-50 cursor-pointer"
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

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>JWT Protected API Session • Phase 1 & 2 MVP</span>
        </div>
      </div>
    </div>
  );
}
