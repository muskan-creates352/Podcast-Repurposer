"use client";

import React, { useState } from "react";
import { 
  Scissors, 
  Play, 
  Pause, 
  Check, 
  X, 
  Clock, 
  TrendingUp, 
  Download, 
  Sliders, 
  Square,
  Smartphone,
  Monitor,
  Type,
  Loader2,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { formatSeconds } from "@/lib/utils";
import { exportClipViaFFmpeg } from "@/lib/api";

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
  
  // Aspect Ratio & Subtitle Styling States
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9" | "1:1">("9:16");
  const [fontSize, setFontSize] = useState<number>(24);
  const [fontColor, setFontColor] = useState<string>("yellow");
  const [position, setPosition] = useState<"bottom" | "center" | "top">("bottom");
  const [editableCaption, setEditableCaption] = useState<string>("");
  const [editableTitle, setEditableTitle] = useState<string>("");

  // FFmpeg Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const activeClip = clips.find((c) => c.id === selectedClipId) || clips[0];

  const handleSelectClip = (clip: StudioClip) => {
    setSelectedClipId(clip.id);
    setEditableCaption(clip.hook);
    setEditableTitle(clip.title);
  };

  const handleUpdateStatus = (id: string, status: "approved" | "rejected") => {
    setClips((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    showToast(`Clip ${status === "approved" ? "approved" : "rejected"}`, "success");
  };

  const handleAdjustTime = (type: "startTime" | "endTime", delta: number) => {
    setClips((prev) =>
      prev.map((c) => {
        if (c.id === activeClip.id) {
          const updated = { ...c };
          if (type === "startTime") {
            updated.startTime = Math.max(0, updated.startTime + delta);
          } else {
            updated.endTime = Math.max(updated.startTime + 5, updated.endTime + delta);
          }
          return updated;
        }
        return c;
      })
    );
    showToast(`Adjusted ${type === "startTime" ? "Start" : "End"} Time by ${delta > 0 ? `+${delta}` : delta}s`, "info");
  };

  // Real FFmpeg Video Export
  const handleExportClip = async () => {
    setIsExporting(true);
    setExportProgress(15);
    showToast(`Initiating FFmpeg rendering in ${aspectRatio} format...`, "info");

    try {
      const interval = setInterval(() => {
        setExportProgress((p) => Math.min(90, p + 25));
      }, 500);

      const res = await exportClipViaFFmpeg({
        clip_id: activeClip.id,
        title: editableTitle || activeClip.title,
        aspect_ratio: aspectRatio,
        start_time: activeClip.startTime,
        end_time: activeClip.endTime,
        caption_text: editableCaption || activeClip.hook,
        font_size: fontSize,
        font_color: fontColor,
        position: position,
      });

      clearInterval(interval);
      setExportProgress(100);
      showToast(`MP4 Render complete! Starting download...`, "success");

      // Trigger actual browser download
      const link = document.createElement("a");
      link.href = res.download_url;
      link.download = res.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      showToast("Export failed. Please check backend connection.", "error");
    } finally {
      setTimeout(() => {
        setIsExporting(false);
      }, 1500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-slide-up pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F7FA] flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Scissors className="w-5 h-5" />
            </div>
            <span>AI Viral Clip Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
            Real FFmpeg video rendering, aspect ratio switching (9:16, 16:9, 1:1), subtitle styling, and viral moment trimming.
          </p>
        </div>

        {/* Export Button */}
        <button
          type="button"
          onClick={handleExportClip}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50 cursor-pointer"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Rendering FFmpeg ({exportProgress}%)...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Export {aspectRatio} Clip (MP4)</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Clips List & Viral Rankings (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
              Detected Highlights ({clips.length})
            </span>
            <span className="text-[11px] text-violet-400 font-mono">
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
                  onClick={() => handleSelectClip(clip)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-violet-500/10 border-violet-500/60 shadow-[0_0_20px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/30"
                      : "bg-[#171C26] border-white/[0.07] hover:border-violet-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Viral Score: {clip.viralScore}/100</span>
                    </span>

                    <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF] font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{formatSeconds(clip.startTime)} - {formatSeconds(clip.endTime)}</span>
                      <span className="text-[10px] text-[#9CA3AF]/70">({durationSec}s)</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#F5F7FA] line-clamp-1 mb-1">
                    {clip.title}
                  </h3>

                  <p className="text-xs text-[#9CA3AF] line-clamp-2 italic mb-3">
                    &ldquo;{clip.hook}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                        clip.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : clip.status === "rejected"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {clip.status}
                    </span>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(clip.id, "approved")}
                        className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-[#9CA3AF] hover:text-emerald-400 transition-colors cursor-pointer"
                        title="Approve Clip"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(clip.id, "rejected")}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-[#9CA3AF] hover:text-rose-400 transition-colors cursor-pointer"
                        title="Reject Clip"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Video Preview & Editing Workspace (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Aspect Ratio Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#171C26] border border-white/[0.07] shadow-sm">
            <span className="text-xs font-semibold text-[#9CA3AF] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-violet-400" />
              <span>Aspect Ratio:</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAspectRatio("9:16")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  aspectRatio === "9:16"
                    ? "bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                    : "bg-[#141821] text-[#9CA3AF] hover:text-[#F5F7FA] border border-white/[0.06]"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>9:16 Vertical (Reels/Shorts)</span>
              </button>

              <button
                onClick={() => setAspectRatio("16:9")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  aspectRatio === "16:9"
                    ? "bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                    : "bg-[#141821] text-[#9CA3AF] hover:text-[#F5F7FA] border border-white/[0.06]"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>16:9 Landscape</span>
              </button>

              <button
                onClick={() => setAspectRatio("1:1")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  aspectRatio === "1:1"
                    ? "bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                    : "bg-[#141821] text-[#9CA3AF] hover:text-[#F5F7FA] border border-white/[0.06]"
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>1:1 Square</span>
              </button>
            </div>
          </div>

          {/* Video Player Box */}
          <div className="p-6 rounded-3xl bg-[#0B0D12] border border-white/[0.08] shadow-2xl flex flex-col items-center justify-center relative overflow-hidden min-h-[380px]">
            {/* Background Canvas representation */}
            <div
              className={`relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#141821] via-violet-950/20 to-[#141821] border border-white/[0.08] shadow-2xl transition-all duration-300 flex flex-col justify-between p-4 ${
                aspectRatio === "9:16"
                  ? "w-64 h-[420px]"
                  : aspectRatio === "1:1"
                  ? "w-80 h-80"
                  : "w-full max-w-xl h-72"
              }`}
            >
              {/* Top hook label */}
              <div className="flex items-center justify-between text-[10px] text-[#9CA3AF] font-mono">
                <span className="px-2 py-0.5 rounded bg-black/60 border border-white/[0.08]">
                  {aspectRatio}
                </span>
                <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  AI Viral Hook
                </span>
              </div>

              {/* Subtitle Overlay Preview with Real-time Styling */}
              <div
                className={`w-full text-center transition-all px-2 ${
                  position === "top"
                    ? "my-2"
                    : position === "center"
                    ? "my-auto"
                    : "mt-auto mb-3"
                }`}
              >
                <div className="inline-block px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-violet-500/30 shadow-lg">
                  <p
                    style={{
                      fontSize: `${fontSize}px`,
                      color:
                        fontColor === "yellow"
                          ? "#facc15"
                          : fontColor === "cyan"
                          ? "#22D3EE"
                          : fontColor === "violet"
                          ? "#A78BFA"
                          : "#ffffff",
                    }}
                    className="font-extrabold tracking-wide uppercase leading-tight drop-shadow-md"
                  >
                    {editableCaption || activeClip.hook}
                  </p>
                </div>
              </div>

              {/* Waveform Visualization during Playback */}
              <div className="flex items-center justify-center gap-1 h-8 opacity-80">
                {[12, 28, 45, 20, 60, 35, 18, 50, 70, 40, 25, 65, 30, 15].map((val, idx) => (
                  <div
                    key={idx}
                    style={{
                      height: isPlaying ? `${Math.max(6, (val * (idx % 2 === 0 ? 1.2 : 0.7)))}%` : "20%",
                    }}
                    className="w-1 rounded-full bg-violet-400 transition-all duration-150"
                  />
                ))}
              </div>
            </div>

            {/* Play/Pause Button on Video */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? "Pause Preview" : "Play Clip"}</span>
            </button>
          </div>

          {/* Subtitle & Caption Styling Controls */}
          <div className="p-5 rounded-2xl bg-[#171C26] border border-white/[0.07] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5">
                <Type className="w-4 h-4 text-violet-400" />
                <span>Subtitle Style & Positioning</span>
              </span>
              <span className="text-[11px] text-[#9CA3AF]">Live render preview</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Font Size */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#9CA3AF]">Font Size</label>
                <div className="flex items-center gap-1">
                  {[18, 24, 30].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setFontSize(sz)}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        fontSize === sz
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-[#141821] text-[#9CA3AF] hover:text-[#F5F7FA] border border-white/[0.06]"
                      }`}
                    >
                      {sz === 18 ? "Small" : sz === 24 ? "Medium" : "Large"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#9CA3AF]">Subtitle Color</label>
                <div className="flex items-center gap-1.5">
                  {[
                    { name: "yellow", bg: "bg-yellow-400" },
                    { name: "white", bg: "bg-white" },
                    { name: "cyan", bg: "bg-cyan-400" },
                    { name: "violet", bg: "bg-violet-400" },
                  ].map((col) => (
                    <button
                      key={col.name}
                      onClick={() => setFontColor(col.name)}
                      className={`w-7 h-7 rounded-lg ${col.bg} border-2 transition-all cursor-pointer ${
                        fontColor === col.name ? "border-violet-400 scale-110 shadow-sm" : "border-transparent"
                      }`}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>

              {/* Position */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#9CA3AF]">Position</label>
                <div className="flex items-center gap-1">
                  {(["bottom", "center", "top"] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setPosition(pos)}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                        position === pos
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-[#141821] text-[#9CA3AF] hover:text-[#F5F7FA] border border-white/[0.06]"
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Editable Caption Text */}
            <div className="pt-2 space-y-1.5">
              <label className="text-xs font-medium text-[#9CA3AF]">
                Editable Subtitle Text:
              </label>
              <textarea
                value={editableCaption || activeClip.hook}
                onChange={(e) => setEditableCaption(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl bg-[#141821] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder:text-[#9CA3AF] focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
              />
            </div>
          </div>

          {/* Interactive Timeline Trimming Controls */}
          <div className="p-5 rounded-2xl bg-[#171C26] border border-white/[0.07] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-violet-400" />
                <span>Fine-Tune Clip Range (-1s / +1s)</span>
              </span>
              <span className="text-xs font-mono text-cyan-400">
                Duration: {Math.max(0, activeClip.endTime - activeClip.startTime)}s
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#141821] border border-white/[0.06]">
                <span className="text-xs text-[#9CA3AF]">Start Time:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdjustTime("startTime", -1)}
                    className="px-2 py-0.5 rounded bg-[#171C26] text-xs font-bold text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-violet-600 transition-colors border border-white/[0.06] cursor-pointer"
                  >
                    -1s
                  </button>
                  <span className="text-xs font-mono font-bold text-[#F5F7FA]">
                    {formatSeconds(activeClip.startTime)}
                  </span>
                  <button
                    onClick={() => handleAdjustTime("startTime", 1)}
                    className="px-2 py-0.5 rounded bg-[#171C26] text-xs font-bold text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-violet-600 transition-colors border border-white/[0.06] cursor-pointer"
                  >
                    +1s
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#141821] border border-white/[0.06]">
                <span className="text-xs text-[#9CA3AF]">End Time:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdjustTime("endTime", -1)}
                    className="px-2 py-0.5 rounded bg-[#171C26] text-xs font-bold text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-violet-600 transition-colors border border-white/[0.06] cursor-pointer"
                  >
                    -1s
                  </button>
                  <span className="text-xs font-mono font-bold text-[#F5F7FA]">
                    {formatSeconds(activeClip.endTime)}
                  </span>
                  <button
                    onClick={() => handleAdjustTime("endTime", 1)}
                    className="px-2 py-0.5 rounded bg-[#171C26] text-xs font-bold text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-violet-600 transition-colors border border-white/[0.06] cursor-pointer"
                  >
                    +1s
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
