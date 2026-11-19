"use client";

import React from "react";
import { EpisodeStatus } from "@/types";
import { 
  FileAudio, 
  Scissors, 
  Sparkles, 
  CheckCircle, 
  Loader2, 
  Clock, 
  ShieldCheck 
} from "lucide-react";

interface AgentStepperProps {
  status: EpisodeStatus;
  progress: number;
}

interface StepInfo {
  id: string;
  number: number;
  name: string;
  agent: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: StepInfo[] = [
  {
    id: "transcription",
    number: 1,
    name: "Transcription Engine",
    agent: "Whisper ASR + Diarization",
    description: "Speech-to-text with millisecond timestamps & speaker identification",
    icon: FileAudio,
  },
  {
    id: "highlight",
    number: 2,
    name: "Highlight / Clip Agent",
    agent: "Engagement Scoring Agent",
    description: "Scores information density, viral potential & narrative standalone value",
    icon: Scissors,
  },
  {
    id: "content",
    number: 3,
    name: "Multi-Format Content Agent",
    agent: "LLM Repurposing Engine",
    description: "Drafts long-form blog articles, social media threads & detailed show notes",
    icon: Sparkles,
  },
  {
    id: "explanation",
    number: 4,
    name: "Explanation & Grounding Agent",
    agent: "Provenance Verification",
    description: "Verifies facts against transcript timestamps and writes editorial notes",
    icon: ShieldCheck,
  },
];

export function AgentStepper({ status, progress }: AgentStepperProps) {
  const getStepState = (stepIndex: number): "completed" | "running" | "waiting" => {
    if (status === "ready_for_review" || status === "published") {
      return "completed";
    }

    if (status === "uploaded") {
      if (stepIndex === 0) return "running";
      return "waiting";
    }

    if (status === "transcribing") {
      if (stepIndex === 0) return "running";
      return "waiting";
    }

    if (status === "processing") {
      if (stepIndex === 0) return "completed";
      if (stepIndex === 1 || stepIndex === 2) return "running";
      return "waiting";
    }

    return "waiting";
  };

  return (
    <div className="bg-white dark:bg-[#171E35] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"></span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              LangGraph Multi-Agent Pipeline Status
            </h3>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            4 Autonomous AI Agents executing state transitions with deterministic grounding
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-mono text-zinc-400">Total Progress:</span>
            <span className="ml-1.5 text-xs font-mono font-bold text-brand-500">{progress}%</span>
          </div>
          <div className="w-24 sm:w-32 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress === 100 ? "bg-emerald-500" : "bg-brand-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {STEPS.map((step, idx) => {
          const state = getStepState(idx);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all duration-200 relative ${
                state === "completed"
                  ? "border-emerald-500/30 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.03]"
                  : state === "running"
                  ? "border-brand-500/40 bg-brand-500/[0.06] shadow-sm dark:bg-brand-500/[0.04] ring-1 ring-brand-500/20"
                  : "border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    state === "completed"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : state === "running"
                      ? "bg-brand-500/15 text-brand-500 animate-pulse"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div>
                  {state === "completed" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Done
                    </span>
                  )}
                  {state === "running" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Running
                    </span>
                  )}
                  {state === "waiting" && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      Queued
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] font-mono font-medium text-brand-500 uppercase tracking-wider">
                  Agent {step.number} • {step.agent}
                </p>
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {step.name}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-2 mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
