"use client";

import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  UploadCloud, 
  FileAudio, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  RefreshCw, 
  Radio 
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import { createEpisode, fetchEpisode } from "@/lib/api";
import { AgentStepper } from "@/components/episodes/AgentStepper";

export default function UploadPage() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(null);

  // Poll GET /episodes/{id} every 3 seconds until status is ready_for_review
  const { 
    data: pollingEpisode, 
    isRefetching: isPolling 
  } = useQuery({
    queryKey: ["episode", activeEpisodeId],
    queryFn: () => (activeEpisodeId ? fetchEpisode(activeEpisodeId) : null),
    enabled: !!activeEpisodeId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "ready_for_review" || status === "published") {
        return false; // Stop polling when ready
      }
      return 3000; // Poll every 3 seconds
    },
  });

  const handleBoxClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
      showToast(`Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`, "info");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
      showToast(`File attached: ${file.name}`, "info");
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleStartProcessing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Please enter an episode title", "error");
      return;
    }
    if (!selectedFile) {
      showToast("Please choose an audio or video file first", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const episode = await createEpisode(title, selectedFile);
      setActiveEpisodeId(episode.id);
      showToast(`Episode "${episode.title}" created. Starting Multi-Agent pipeline...`, "success");
    } catch {
      showToast("Failed to upload episode. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReady = pollingEpisode?.status === "ready_for_review" || pollingEpisode?.status === "published";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up pb-12">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-brand-500" />
          <span>Upload Podcast Episode</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Upload raw audio (.mp3, .wav, .m4a) to trigger real-time multi-agent transcription, clip extraction & content repurposing.
        </p>
      </div>

      {/* Active Processing State: Live Agent Stepper & Polling Telemetry */}
      {activeEpisodeId && pollingEpisode ? (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#171E35] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Radio className="w-5 h-5 text-brand-500 animate-pulse" />
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {pollingEpisode.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Episode ID: {pollingEpisode.id} • Polling status every 3 seconds
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isPolling && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono text-brand-500 bg-brand-500/10">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Polling live status...</span>
                  </span>
                )}
                {isReady && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ready For Review</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 4-Agent Stepper with Live Progression */}
          <AgentStepper
            status={pollingEpisode.status}
            progress={pollingEpisode.progress}
          />

          {/* Action buttons upon completion */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#171E35] border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                {isReady
                  ? "All 4 agents have finished execution! Audio is grounded & clips are scored."
                  : "Agents are actively executing deterministically in parallel. Please wait..."}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Current State: <span className="font-mono text-brand-500 font-semibold">{pollingEpisode.status}</span> ({pollingEpisode.progress}% done)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveEpisodeId(null);
                  setSelectedFile(null);
                  setTitle("");
                }}
                className="px-3.5 py-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              >
                Upload Another
              </button>

              <Link
                href={`/episodes/${activeEpisodeId}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-glow transition-all"
              >
                <span>Open Episode Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Form */
        <form onSubmit={handleStartProcessing} className="bg-white dark:bg-[#171E35] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Episode Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ep. 43: How To Scale B2B Growth With AI Agents"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Hidden HTML File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4,.aac"
            className="hidden"
          />

          {/* Clickable Drag & Drop Box */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Audio / Video Asset
            </label>
            <div
              onClick={handleBoxClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                selectedFile
                  ? "border-brand-500 bg-brand-500/5"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-brand-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              }`}
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-brand-500 mb-3">
                <FileAudio className="w-6 h-6" />
              </div>
              {selectedFile ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1 rounded-full text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-500 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>File attached from your computer. Click to replace.</span>
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                    Click here to choose file from your computer or drag & drop
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Supports MP3, WAV, M4A, MP4, AAC (Up to 500MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/dashboard"
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile || !title.trim()}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-glow transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Episode...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start AI Repurposing</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
