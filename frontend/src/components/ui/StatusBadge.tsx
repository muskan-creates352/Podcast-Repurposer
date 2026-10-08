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
      bg: "bg-zinc-500/10",
      text: "text-zinc-600 dark:text-zinc-400",
      border: "border-zinc-300 dark:border-zinc-700",
      icon: <UploadCloud className="w-3.5 h-3.5" />,
    },
    transcribing: {
      label: "Transcribing",
      bg: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-300/40 dark:border-amber-500/30",
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    },
    processing: {
      label: "Processing AI",
      bg: "bg-brand-500/10",
      text: "text-brand-600 dark:text-brand-400",
      border: "border-brand-300/40 dark:border-brand-500/30",
      icon: <Sparkles className="w-3.5 h-3.5 animate-pulse" />,
    },
    ready_for_review: {
      label: "Ready for Review",
      bg: "bg-sky-500/10",
      text: "text-sky-600 dark:text-sky-400",
      border: "border-sky-300/40 dark:border-sky-500/30",
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    published: {
      label: "Published",
      bg: "bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-300/40 dark:border-emerald-500/30",
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
  };

  const config = configs[status] || configs.uploaded;
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${padding} ${config.bg} ${config.text} ${config.border}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}
