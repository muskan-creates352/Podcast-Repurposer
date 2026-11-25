"use client";

import React, { useState } from "react";
import {
  Headphones,
  BookOpen,
  Volume2,
  Sparkles,
  CheckCircle2,
  ListFilter,
  Lightbulb,
  Bookmark,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { ConversationalOverview } from "@/lib/api";
import { ListenPlayer } from "@/components/audio/ListenPlayer";
import { useToast } from "@/context/ToastContext";

interface EpisodeOverviewSectionProps {
  overview: ConversationalOverview;
}

export function EpisodeOverviewSection({ overview }: EpisodeOverviewSectionProps) {
  const { showToast } = useToast();
  const [activeMode, setActiveMode] = useState<"listen" | "read">("listen");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(overview.conversational_script);
    setCopied(true);
    showToast("Copied overview script to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#171E35] via-[#141824] to-[#0F1219] border border-violet-500/20 shadow-2xl space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>AI Conversational Overview</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Listen to Episode Overview</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Listen to what happened in this episode without having to read everything.
          </p>
        </div>

        {/* Mode Toggle: READ vs LISTEN */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveMode("listen")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === "listen"
                ? "bg-purple-600 text-white shadow-glow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>LISTEN TO OVERVIEW</span>
          </button>
          <button
            onClick={() => setActiveMode("read")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === "read"
                ? "bg-purple-600 text-white shadow-glow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>READ OVERVIEW</span>
          </button>
        </div>
      </div>

      {/* Embedded ListenPlayer (Active in both, prominent in Listen Mode) */}
      <ListenPlayer
        title={`Episode Overview: ${overview.episode_title}`}
        subtitle="AI Human-like Conversational Narration"
        textToSpeak={overview.conversational_script}
      />

      {/* Written Overview Deep Dive */}
      <div className="space-y-6 pt-2">
        {/* Full Conversational Script */}
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800/90 space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono">
              Natural Conversational Script
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
              title="Copy script"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-sans select-text">
            &ldquo;{overview.conversational_script}&rdquo;
          </p>
        </div>

        {/* 8 Structured Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. What Episode Is About */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>1. What This Episode Is About</span>
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {overview.what_episode_is_about}
            </p>
          </div>

          {/* 2. Most Useful Takeaway */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" />
              <span>2. Most Useful Takeaway</span>
            </span>
            <p className="text-xs text-zinc-200 font-medium leading-relaxed">
              {overview.most_useful_takeaway}
            </p>
          </div>

          {/* 3. Topics Discussed */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <ListFilter className="w-3.5 h-3.5" />
              <span>3. Topics Discussed</span>
            </span>
            <ul className="space-y-1.5 text-xs text-zinc-300">
              {overview.topics_discussed.map((topic, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Important Points & Arguments */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>4. Important Arguments & Proof</span>
            </span>
            <ul className="space-y-1.5 text-xs text-zinc-300">
              {overview.important_arguments.map((arg, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{arg}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
