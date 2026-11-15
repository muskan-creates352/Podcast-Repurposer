"use client";

import React, { useState } from "react";
import { 
  Scissors, 
  Sparkles, 
  Play, 
  Pause, 
  Check, 
  X, 
  Clock, 
  TrendingUp, 
  Download, 
  Sliders, 
  Info 
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { formatSeconds } from "@/lib/utils";

interface StudioClip {
  id: string;
  title: string;
  hook: string;
  quote: string;
  startTime: number;
  endTime: number;
  viralScore: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

const INITIAL_CLIPS: StudioClip[] = [
  {
    id: "clip_s1",
    title: "Why Single-Prompt LLM Chains Fail in Production",
    hook: "The reason why single-prompt AI architectures break down is simple: state management.",
    quote: "Once you introduce a deterministic graph like LangGraph with clear state cycles, reliability jumps from 60% to over 95%.",
    startTime: 252, // 04:12
    endTime: 308,   // 05:08
    viralScore: 95,
    reason: "Contrarian technical insight challenging common wisdom. Extremely high retention hook suitable for LinkedIn & YouTube Shorts.",
    status: "approved",
  },
  {
    id: "clip_s2",
    title: "The Grounding Rule Every AI Creator Must Follow",
    hook: "If you want creators to actually trust AI output, you must give them source timestamps.",
    quote: "Never present a generated claim without showing exactly which second it was spoken in the audio.",
    startTime: 1125, // 18:45
    endTime: 1175,  // 19:35
    viralScore: 92,
    reason: "Clear actionable rule for editors and founders. Emotional resonance with creators frustrated by hallucinations.",
    status: "pending",
  },
  {
    id: "clip_s3",
    title: "Your Podcast Back-Catalog is Dormant Gold",
    hook: "Your past two years of recorded episodes are sitting completely idle right now.",
    quote: "With vector search, every word spoken in your archive becomes instant, searchable intelligence for your audience.",
    startTime: 1930, // 32:10
    endTime: 1982,  // 33:02
    viralScore: 88,
    reason: "Direct monetization appeal for podcasters with existing backlogs. High curiosity factor.",
    status: "pending",
  },
];

export default function ClipStudioPage() {
  const { showToast } = useToast();
  const [clips, setClips] = useState<StudioClip[]>(INITIAL_CLIPS);
  const [selectedClipId, setSelectedClipId] = useState<string>("clip_s1");
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState<number>(252);

  const activeClip = clips.find((c) => c.id === selectedClipId) || clips[0];

  const handleUpdateStatus = (id: string, newStatus: StudioClip["status"]) => {
    setClips((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    showToast(
      newStatus === "approved" ? "Clip approved for publishing!" : "Clip rejected from queue",
      newStatus === "approved" ? "success" : "info"
    );
  };

  const handleAdjustTime = (field: "startTime" | "endTime", delta: number) => {
    setClips((prev) =>
      prev.map((c) => {
        if (c.id === activeClip.id) {
          const updated = { ...c, [field]: Math.max(0, c[field] + delta) };
          return updated;
        }
        return c;
      })
    );
    showToast(`Updated timestamp range`, "info");
  };

  const handleExportClip = () => {
    showToast(`Exporting clip "${activeClip.title}" (MP4 9:16 Vertical format)`, "success");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-up pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Scissors className="w-5 h-5" />
            </div>
            <span>AI Viral Clip Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Scored high-density moments with AI opening hooks, viral rankings (0–100), and precise timestamp trimming.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportClip}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Selected Clip (MP4)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Clips List & Viral Rankings (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Detected Highlights ({clips.length})
            </span>
            <span className="text-[11px] text-brand-400 font-mono">
              Scored by Groq AI
            </span>
          </div>

          <div className="space-y-3">
            {clips.map((clip) => {
              const isSelected = clip.id === activeClip.id;
              const durationSec = Math.max(0, clip.endTime - clip.startTime);

              return (
                <div
                  key={clip.id}
                  onClick={() => {
                    setSelectedClipId(clip.id);
                    setPreviewTime(clip.startTime);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-[#121215] shadow-sm space-y-2.5 ${
                    isSelected
                      ? "border-brand-500 ring-1 ring-brand-500/30"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-brand-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatSeconds(clip.startTime)} – {formatSeconds(clip.endTime)} ({durationSec}s)
                    </span>

                    {/* Viral Score Pill */}
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold">
                      <TrendingUp className="w-3 h-3 text-pink-400" />
                      <span>{clip.viralScore}/100</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                    {clip.title}
                  </h4>

                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic line-clamp-2">
                    Hook: &ldquo;{clip.hook}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-850">
                    <span className="text-[10px] text-zinc-400 capitalize">
                      Status: <strong className={clip.status === "approved" ? "text-emerald-500" : clip.status === "rejected" ? "text-rose-500" : "text-amber-500"}>{clip.status}</strong>
                    </span>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(clip.id, "rejected")}
                        className="p-1 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Reject clip"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(clip.id, "approved")}
                        className="p-1 rounded-lg text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                        title="Approve clip"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Clip Editor, Audio/Video Scrubber & Grounding (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Video Preview Aspect Card */}
          <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="relative aspect-video rounded-xl bg-zinc-950 flex flex-col items-center justify-center border border-zinc-800 overflow-hidden group">
              {/* Animated Waveform Visualizer */}
              <div className="flex items-center gap-1 mb-4 h-16">
                {[40, 65, 85, 30, 95, 75, 45, 90, 60, 30, 80, 50, 70, 90, 40].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-300 ${
                      isPlaying ? "bg-brand-500 animate-pulse" : "bg-zinc-700"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              {/* Central Play/Pause Overlay */}
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-full bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-glow transition-all"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-lg backdrop-blur">
                <span>Current: {formatSeconds(previewTime)}</span>
                <span>Active Range: {formatSeconds(activeClip.startTime)} – {formatSeconds(activeClip.endTime)}</span>
              </div>
            </div>

            {/* Manual Timestamp Trim Controls */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-brand-500" />
                  Manual Boundary Trimming
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Clip Duration: {Math.max(0, activeClip.endTime - activeClip.startTime)}s
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 font-medium">Start Time ({formatSeconds(activeClip.startTime)})</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAdjustTime("startTime", -1)}
                      className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-[11px] font-mono hover:bg-zinc-300 dark:hover:bg-zinc-700"
                    >
                      -1s
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustTime("startTime", 1)}
                      className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-[11px] font-mono hover:bg-zinc-300 dark:hover:bg-zinc-700"
                    >
                      +1s
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 font-medium">End Time ({formatSeconds(activeClip.endTime)})</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAdjustTime("endTime", -1)}
                      className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-[11px] font-mono hover:bg-zinc-300 dark:hover:bg-zinc-700"
                    >
                      -1s
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustTime("endTime", 1)}
                      className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-[11px] font-mono hover:bg-zinc-300 dark:hover:bg-zinc-700"
                    >
                      +1s
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Editorial Reasoning & Opening Hook */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-brand-500/5 border border-brand-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-brand-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Curated Opening Hook</span>
                </div>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                  &ldquo;{activeClip.hook}&rdquo;
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5" />
                  <span>Why this was picked (AI Reasoning)</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {activeClip.reason}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  Exact Audio Dialogue (Ground Truth Quote)
                </span>
                <p className="text-xs italic text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  &ldquo;{activeClip.quote}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
