"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Copy,
  Check,
  Headphones,
  Sparkles,
  Quote,
  Wrench,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { PodcastBrief } from "@/lib/api";
import { ListenPlayer } from "@/components/audio/ListenPlayer";
import { useToast } from "@/context/ToastContext";
import { downloadFile } from "@/lib/utils";

interface PodcastBriefSectionProps {
  brief: PodcastBrief;
  onSeek?: (seconds: number) => void;
}

export function PodcastBriefSection({ brief, onSeek }: PodcastBriefSectionProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showListen, setShowListen] = useState(false);

  const fullTextToRead = [
    `Podcast Brief for ${brief.episode_title}.`,
    `Main Topic: ${brief.main_topic}.`,
    `Summary: ${brief.short_summary}`,
    `Top Takeaways: ${brief.key_takeaways.join(". ")}.`,
    `Actionable Insights: ${brief.actionable_insights.join(". ")}.`,
    `Conclusion: ${brief.conclusion}`,
  ].join(" ");

  const handleCopy = () => {
    const md = [
      `# Podcast Brief: ${brief.episode_title}`,
      `**Main Topic**: ${brief.main_topic}\n`,
      `## Summary\n${brief.short_summary}\n`,
      `## Key Takeaways`,
      ...brief.key_takeaways.map((t) => `- ${t}`),
      `\n## Actionable Insights`,
      ...brief.actionable_insights.map((a) => `- ${a}`),
      `\n## Notable Quotes`,
      ...brief.key_quotes.map((q) => `> "${q.quote}" — ${q.speaker} [${q.timestamp}]`),
      `\n## Tools & Resources Mentioned`,
      ...brief.mentioned_tools_and_resources.map((r) => `- ${r}`),
      `\n## Conclusion\n${brief.conclusion}`,
    ].join("\n");

    navigator.clipboard.writeText(md);
    setCopied(true);
    showToast("Copied Podcast Brief to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (format: "md" | "txt") => {
    const content = [
      `PODCAST BRIEF: ${brief.episode_title.toUpperCase()}`,
      `Main Topic: ${brief.main_topic}\n`,
      `SUMMARY:\n${brief.short_summary}\n`,
      `KEY TAKEAWAYS:\n` + brief.key_takeaways.map((t, i) => `${i + 1}. ${t}`).join("\n"),
      `\nACTIONABLE INSIGHTS:\n` + brief.actionable_insights.map((a, i) => `${i + 1}. ${a}`).join("\n"),
      `\nTOOLS & RESOURCES:\n` + brief.mentioned_tools_and_resources.map((r) => `• ${r}`).join("\n"),
      `\nCONCLUSION:\n${brief.conclusion}`,
    ].join("\n\n");

    downloadFile(
      `${brief.episode_title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-brief.${format}`,
      content,
      format === "md" ? "text/markdown" : "text/plain"
    );
    showToast(`Exported brief as .${format.toUpperCase()}`, "success");
  };

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#171E35] via-[#141824] to-[#0F1219] border border-violet-500/20 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Executive Synthesis</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Podcast Brief</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Structured, high-density summary with verified quotes, mentioned tools, and takeaways.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowListen(!showListen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showListen
                ? "bg-purple-600 text-white border-purple-500 shadow-glow"
                : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-purple-400" />
            <span>{showListen ? "Hide Listen" : "Listen to Brief"}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Brief"}</span>
          </button>

          <button
            onClick={() => handleExport("md")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-glow transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export MD</span>
          </button>
        </div>
      </div>

      {/* Embedded ListenPlayer */}
      {showListen && (
        <ListenPlayer
          title={`Podcast Brief: ${brief.episode_title}`}
          subtitle="AI Executive Brief Narration"
          textToSpeak={fullTextToRead}
        />
      )}

      {/* Main Topic & Short Summary */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
          Main Discussion Theme
        </span>
        <h4 className="text-base font-bold text-white">{brief.main_topic}</h4>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-1">
          {brief.short_summary}
        </p>
      </div>

      {/* Grid: Key Takeaways & Actionable Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Takeaways */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>Core Takeaways</span>
          </span>
          <ul className="space-y-2 text-xs text-zinc-300">
            {brief.key_takeaways.map((t, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actionable Insights */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Actionable Implementation</span>
          </span>
          <ul className="space-y-2 text-xs text-zinc-300">
            {brief.actionable_insights.map((a, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quotes & Tools Mentioned Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quotes */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Quote className="w-4 h-4 text-amber-400" />
            <span>Key Audio Quotes</span>
          </span>
          <div className="space-y-3">
            {brief.key_quotes.map((q, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
                <p className="text-xs italic text-zinc-200">&ldquo;{q.quote}&rdquo;</p>
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>— {q.speaker}</span>
                  <span className="font-mono text-purple-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{q.timestamp}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tools Mentioned */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-sky-400" />
            <span>Identified Tools & Resources</span>
          </span>
          <ul className="space-y-2 text-xs text-zinc-300">
            {brief.mentioned_tools_and_resources.map((tool, idx) => (
              <li key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span className="font-medium text-zinc-200">{tool}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
