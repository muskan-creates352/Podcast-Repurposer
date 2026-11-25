"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  GraduationCap,
  Code2,
  Briefcase,
  Zap,
  BookOpen,
  Headphones,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { fetchAudienceMode, AudienceModeData } from "@/lib/api";
import { ListenPlayer } from "@/components/audio/ListenPlayer";

interface AudienceModeSectionProps {
  episodeId: string | number;
}

const MODES = [
  { id: "beginner", name: "Beginner", icon: BookOpen, desc: "Simple language & metaphors" },
  { id: "student", name: "Student", icon: GraduationCap, desc: "Learning concepts & study takeaways" },
  { id: "developer", name: "Developer", icon: Code2, desc: "Architecture, LangGraph & code" },
  { id: "professional", name: "Professional", icon: Briefcase, desc: "Strategy, business ROI & decisions" },
  { id: "quick_summary", name: "Quick Summary", icon: Zap, desc: "60-second essential bullet points" },
];

export function AudienceModeSection({ episodeId }: AudienceModeSectionProps) {
  const [selectedMode, setSelectedMode] = useState<string>("beginner");
  const [showListen, setShowListen] = useState(false);

  const { data: audienceData, isLoading } = useQuery({
    queryKey: ["audienceMode", episodeId, selectedMode],
    queryFn: () => fetchAudienceMode(episodeId, selectedMode),
  });

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#171E35] via-[#141824] to-[#0F1219] border border-violet-500/20 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Audience Adaptive Intelligence</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Audience Mode</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Tailor the explanation depth, vocabulary, and takeaways to your specific background.
          </p>
        </div>

        {/* Listen Button */}
        <button
          onClick={() => setShowListen(!showListen)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            showListen
              ? "bg-purple-600 text-white border-purple-500 shadow-glow"
              : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
          }`}
        >
          <Headphones className="w-3.5 h-3.5 text-purple-400" />
          <span>{showListen ? "Hide Listen" : `Listen as ${selectedMode.toUpperCase()}`}</span>
        </button>
      </div>

      {/* Mode Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => {
                setSelectedMode(mode.id);
                setShowListen(false);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                isSelected
                  ? "bg-purple-600/20 border-purple-500 text-white shadow-glow ring-1 ring-purple-500/40"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isSelected ? "text-purple-400" : "text-zinc-400"}`} />
                {isSelected && <span className="w-2 h-2 rounded-full bg-purple-400" />}
              </div>
              <div>
                <span className="text-xs font-bold block">{mode.name}</span>
                <span className="text-[10px] text-zinc-400 line-clamp-1">{mode.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Embedded ListenPlayer */}
      {showListen && audienceData && (
        <ListenPlayer
          title={audienceData.title}
          subtitle={`Narrated for ${selectedMode.toUpperCase()} profile`}
          textToSpeak={`${audienceData.explanation}. Key concepts include: ${audienceData.key_concepts.join(
            ". "
          )}. Practical implication: ${audienceData.practical_implication}`}
        />
      )}

      {/* Explanation Content Card */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-zinc-500 animate-pulse">
          Synthesizing {selectedMode} explanation...
        </div>
      ) : audienceData ? (
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>{audienceData.title}</span>
            </h4>
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
              {audienceData.mode}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
            {audienceData.explanation}
          </p>

          {/* Key Concepts */}
          <div className="pt-3 border-t border-zinc-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Focus Concepts:
            </span>
            <div className="flex flex-wrap gap-2">
              {audienceData.key_concepts.map((concept, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-xl bg-zinc-800 border border-zinc-700/80 text-xs text-zinc-200 font-medium"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>

          {/* Practical Implication */}
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-300 leading-relaxed">
              <strong className="text-white block font-semibold">Practical Takeaway:</strong>
              <span>{audienceData.practical_implication}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
