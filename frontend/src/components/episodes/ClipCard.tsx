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
      className={`border rounded-2xl p-4 transition-all duration-200 bg-[#171C26] shadow-sm space-y-3 ${
        currentStatus === "approved"
          ? "border-emerald-500/40 bg-emerald-500/[0.03]"
          : currentStatus === "rejected"
          ? "border-rose-500/30 opacity-60"
          : "border-white/[0.07] hover:border-violet-500/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]"
      }`}
    >
      {/* Header bar: Time range and Status Badge */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleSeekStart}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 font-mono text-xs font-semibold transition-all group cursor-pointer"
          title="Click to seek audio to this highlight"
        >
          <Play className="w-3 h-3 fill-current group-hover:scale-110 transition-transform" />
          <span>{clip.start_time} – {clip.end_time}</span>
          <span className="text-[10px] text-[#9CA3AF] font-normal">
            ({Math.max(0, endSeconds - startSeconds)}s)
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          {currentStatus === "approved" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <Check className="w-3 h-3" />
              Approved
            </span>
          )}
          {currentStatus === "rejected" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/20">
              <X className="w-3 h-3" />
              Rejected
            </span>
          )}
          {currentStatus === "pending" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <Clock className="w-3 h-3" />
              Pending Review
            </span>
          )}
        </div>
      </div>

      {/* Quote / Highlight Text */}
      <div className="p-3.5 rounded-xl bg-[#141821] border border-white/[0.05]">
        <p className="text-xs text-[#F5F7FA] italic leading-relaxed">
          &ldquo;{clip.text}&rdquo;
        </p>
      </div>

      {/* "Why this was picked" Panel with clickable timestamp citations */}
      <div className="p-3.5 rounded-xl bg-[#141821] border border-violet-500/20 space-y-1.5">
        <div className="flex items-center gap-1.5 text-violet-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Why this was picked
          </span>
        </div>
        <p className="text-[11px] text-[#F5F7FA] leading-normal">
          {clip.reason}
        </p>

        {/* Clickable Grounding Timestamp Citation */}
        <div className="pt-1 flex items-center gap-2">
          <span className="text-[10px] text-[#9CA3AF] flex items-center gap-1">
            <Info className="w-3 h-3" />
            Source Grounding:
          </span>
          <button
            type="button"
            onClick={handleSeekStart}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/20 font-mono text-[10px] font-semibold hover:underline cursor-pointer"
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
          className="inline-flex items-center gap-1 text-[11px] text-[#9CA3AF] hover:text-[#F5F7FA] transition-colors cursor-pointer"
        >
          {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy Quote"}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={isUpdating || currentStatus === "rejected"}
            onClick={() => handleStatusUpdate("rejected")}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40 cursor-pointer"
          >
            Reject
          </button>
          <button
            type="button"
            disabled={isUpdating || currentStatus === "approved"}
            onClick={() => handleStatusUpdate("approved")}
            className="px-3 py-1 rounded-lg text-[11px] font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all disabled:opacity-40 flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3 h-3" />
            <span>Approve</span>
          </button>
        </div>
      </div>
    </div>
  );
}
