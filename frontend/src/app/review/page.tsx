"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchClips } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { CheckSquare, CheckCircle, XCircle, Sparkles, Copy } from "lucide-react";

export default function ReviewQueuePage() {
  const { showToast } = useToast();
  const { data: clips = [] } = useQuery({
    queryKey: ["clips"],
    queryFn: () => fetchClips(),
  });

  const [approvedClips, setApprovedClips] = useState<string[]>([]);
  const [rejectedClips, setRejectedClips] = useState<string[]>([]);

  const handleApprove = (id: string) => {
    setApprovedClips((prev) => [...prev, id]);
    showToast("Clip approved for publishing!", "success");
  };

  const handleReject = (id: string) => {
    setRejectedClips((prev) => [...prev, id]);
    showToast("Clip marked as rejected", "info");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Snippet copied to clipboard!", "success");
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-brand-500" />
          <span>Review Queue</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Review extracted clips, verify source audio timestamps, and approve AI content before publishing.
        </p>
      </div>

      <div className="space-y-4">
        {clips.map((clip) => {
          const isApproved = approvedClips.includes(clip.id) || clip.status === "approved";
          const isRejected = rejectedClips.includes(clip.id) || clip.status === "rejected";

          return (
            <div
              key={clip.id}
              className={`p-5 rounded-2xl border bg-white dark:bg-[#121215] shadow-sm transition-all duration-200 ${
                isApproved
                  ? "border-emerald-500/40 bg-emerald-500/[0.02]"
                  : isRejected
                  ? "border-rose-500/40 opacity-60"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 font-mono text-xs font-semibold">
                    ⏱️ {clip.start_time} - {clip.end_time}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">
                    Episode: Ep. 42
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(clip.text)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs flex items-center gap-1"
                    title="Copy transcript snippet"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>

                  <button
                    onClick={() => handleReject(clip.id)}
                    disabled={isRejected}
                    className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleApprove(clip.id)}
                    disabled={isApproved}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isApproved ? "Approved" : "Approve Clip"}</span>
                  </button>
                </div>
              </div>

              {/* Clip transcript content */}
              <div className="mt-4">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  &ldquo;{clip.text}&rdquo;
                </p>
              </div>

              {/* Explanation Agent Reason Box */}
              <div className="mt-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 text-xs">
                <div className="flex items-center gap-1.5 text-brand-500 font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explanation Agent Note:</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {clip.reason}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
