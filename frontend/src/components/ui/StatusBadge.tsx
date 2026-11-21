import React from "react";
import { EpisodeStatus } from "@/types";
import { Clock, Loader2, Sparkles, CheckCircle, UploadCloud } from "lucide-react";

interface StatusBadgeProps {
  status: EpisodeStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const configs: Record<
    EpisodeStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    uploaded: {
      label: "Uploaded",
      bg: "bg-white/[0.04]",
      text: "text-[#9CA3AF]",
      border: "border-white/[0.08]",
      icon: <UploadCloud className="w-3 h-3" />,
    },
    transcribing: {
      label: "Transcribing",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
    },
    processing: {
      label: "Processing AI",
      bg: "bg-violet-500/10",
      text: "text-violet-400",
      border: "border-violet-500/20",
      icon: <Sparkles className="w-3 h-3 animate-pulse" />,
    },
    ready_for_review: {
      label: "Ready for Review",
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
      border: "border-cyan-500/20",
      icon: <Clock className="w-3 h-3" />,
    },
    published: {
      label: "Published",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      icon: <CheckCircle className="w-3 h-3" />,
    },
  };

  const config = configs[status] || configs.uploaded;
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${padding} ${config.bg} ${config.text} ${config.border}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}
