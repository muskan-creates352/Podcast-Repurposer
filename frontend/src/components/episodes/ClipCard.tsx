"use client";

import React, { useState } from "react";
import { Clip } from "@/types";
import { 
  Play, 
  Check, 
  X, 
  Sparkles, 
  Clock, 
  Copy, 
  CheckCheck, 
  Info 
} from "lucide-react";
import { parseTimestampToSeconds } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { updateClipStatus } from "@/lib/api";

interface ClipCardProps {
  clip: Clip;
  onSeek: (timeInSeconds: number) => void;
  onStatusChange?: (clipId: string, newStatus: Clip["status"]) => void;
}

export function ClipCard({ clip, onSeek, onStatusChange }: ClipCardProps) {
  const { showToast } = useToast();
  const [currentStatus, setCurrentStatus] = useState<Clip["status"]>(clip.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  const startSeconds = parseTimestampToSeconds(clip.start_time);
  const endSeconds = parseTimestampToSeconds(clip.end_time);

  const handleSeekStart = () => {
    onSeek(startSeconds);
    showToast(`Seeking to clip start: ${clip.start_time}`, "info");
  };

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(`"${clip.text}" — (${clip.start_time} - ${clip.end_time})`);
    setCopied(true);
    showToast("Clip quote copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusUpdate = async (status: Clip["status"]) => {
    setIsUpdating(true);
    try {
      await updateClipStatus(clip.id, status);
      setCurrentStatus(status);
      onStatusChange?.(clip.id, status);
      showToast(
        status === "approved" ? "Clip approved for publishing!" : "Clip rejected from queue",
        status === "approved" ? "success" : "info"
      );
    } catch {
      showToast("Failed to update clip status", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`border rounded-2xl p-4 transition-all duration-200 bg-white dark:bg-[#171E35] shadow-sm space-y-3 ${
        currentStatus === "approved"
          ? "border-emerald-500/40 bg-emerald-500/[0.02]"
          : currentStatus === "rejected"
          ? "border-rose-500/30 opacity-60"
          : "border-zinc-200/80 dark:border-zinc-800/80 hover:border-brand-500/40"
      }`}
    >
      {/* Header bar: Time range and Status Badge */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleSeekStart}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-mono text-xs font-semibold transition-all group"
          title="Click to seek audio to this highlight"
        >
          <Play className="w-3 h-3 fill-current group-hover:scale-110 transition-transform" />
          <span>{clip.start_time} – {clip.end_time}</span>
          <span className="text-[10px] text-zinc-400 font-normal">
            ({Math.max(0, endSeconds - startSeconds)}s)
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          {currentStatus === "approved" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Check className="w-3 h-3" />
              Approved
            </span>
          )}
          {currentStatus === "rejected" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <X className="w-3 h-3" />
              Rejected
            </span>
          )}
          {currentStatus === "pending" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Clock className="w-3 h-3" />
              Pending Review
            </span>
          )}
        </div>
      </div>

      {/* Quote / Highlight Text */}
      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-850">
        <p className="text-xs text-zinc-900 dark:text-zinc-100 italic leading-relaxed">
          &ldquo;{clip.text}&rdquo;
        </p>
      </div>

      {/* "Why this was picked" Panel with clickable timestamp citations */}
      <div className="p-3 rounded-xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/50 dark:border-brand-800/40 space-y-1.5">
        <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Why this was picked
          </span>
        </div>
        <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-normal">
          {clip.reason}
        </p>

        {/* Clickable Grounding Timestamp Citation */}
        <div className="pt-1 flex items-center gap-2">
          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Source Grounding:
          </span>
          <button
            type="button"
            onClick={handleSeekStart}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-mono text-[10px] font-semibold hover:underline cursor-pointer"
            title="Click to jump to audio timestamp"
          >
            <span>[{clip.start_time}] Jump to Audio</span>
          </button>
        </div>
      </div>

      {/* Actions: Copy Quote, Approve, Reject */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleCopyQuote}
          className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy Quote"}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={isUpdating || currentStatus === "rejected"}
            onClick={() => handleStatusUpdate("rejected")}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40"
          >
            Reject
          </button>
          <button
            type="button"
            disabled={isUpdating || currentStatus === "approved"}
            onClick={() => handleStatusUpdate("approved")}
            className="px-3 py-1 rounded-lg text-[11px] font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all disabled:opacity-40 flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            <span>Approve</span>
          </button>
        </div>
      </div>
    </div>
  );
}
