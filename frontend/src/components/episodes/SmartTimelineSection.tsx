"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  GitCommit,
  Play,
  Clock,
  Sparkles,
  Bookmark,
  MessageSquare,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { fetchSmartTimeline, TimelineSegment } from "@/lib/api";

interface SmartTimelineSectionProps {
  episodeId: string | number;
  currentTime?: number;
  onSeek?: (seconds: number) => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Introduction: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/20" },
  Story: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  "Important Insight": { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  Example: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  Debate: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
  Advice: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
  Conclusion: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
};

export function SmartTimelineSection({
  episodeId,
  currentTime = 0,
  onSeek,
}: SmartTimelineSectionProps) {
  const { data: timelineData, isLoading } = useQuery({
    queryKey: ["smartTimeline", episodeId],
    queryFn: () => fetchSmartTimeline(episodeId),
  });

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#171E35] via-[#141824] to-[#0F1219] border border-violet-500/20 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Visual Navigation</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-cyan-400" />
            <span>Smart Podcast Timeline</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Click any content segment to jump directly to that exact moment in the audio/video player.
          </p>
        </div>

        {timelineData && (
          <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
            {timelineData.segments.length} Semantic Chapters
          </span>
        )}
      </div>

      {/* Visual Timeline Segments */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-zinc-500 animate-pulse">
          Segmenting episode timeline into narrative themes...
        </div>
      ) : timelineData ? (
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-zinc-800/80 before:pointer-events-none">
          {timelineData.segments.map((seg, idx) => {
            const style = CATEGORY_STYLES[seg.category] || CATEGORY_STYLES.Introduction;
            const isCurrentlyPlaying =
              currentTime >= seg.start_seconds && currentTime <= seg.end_seconds;

            return (
              <div
                key={idx}
                onClick={() => onSeek && onSeek(seg.start_seconds)}
                className={`relative pl-12 p-4 rounded-2xl border transition-all cursor-pointer group ${
                  isCurrentlyPlaying
                    ? "bg-purple-600/15 border-purple-500 shadow-glow"
                    : "bg-zinc-900/60 border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700"
                }`}
              >
                {/* Timeline Dot Indicator */}
                <div
                  className={`absolute left-3 top-5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCurrentlyPlaying
                      ? "bg-purple-500 border-white ring-4 ring-purple-500/30"
                      : "bg-zinc-900 border-zinc-600 group-hover:border-purple-400"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isCurrentlyPlaying ? "bg-white" : "bg-zinc-500"
                    }`}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${style.bg} ${style.text} ${style.border}`}
                      >
                        {seg.category}
                      </span>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                        {seg.title}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {seg.short_explanation}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <span className="font-mono text-xs text-zinc-400 flex items-center gap-1 bg-zinc-950/60 px-2.5 py-1 rounded-xl border border-zinc-800">
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span>{seg.timestamp}</span>
                    </span>
                    <button
                      className="p-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all"
                      title="Seek player"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
