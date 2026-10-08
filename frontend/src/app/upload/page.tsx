"use client";

import React, { useState } from "react";
import { UploadCloud, FileAudio, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

export default function UploadPage() {
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [fileSelected, setFileSelected] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      showToast("Please enter an episode title", "error");
      return;
    }
    setIsUploading(true);
    setProgress(15);
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsUploading(false);
          showToast("Episode uploaded successfully! Sent to transcription queue.", "success");
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-brand-500" />
          <span>Upload Podcast Episode</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Upload your raw audio (.mp3, .wav, .m4a) or video file to start the automated AI repurposing pipeline.
        </p>
      </div>

      {/* Stepper overview */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold">
          <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[11px]">1</span>
          <span>Upload</span>
        </div>
        <ArrowRight className="w-4 h-4 text-zinc-400" />
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[11px]">2</span>
          <span>Transcription</span>
        </div>
        <ArrowRight className="w-4 h-4 text-zinc-400" />
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[11px]">3</span>
          <span>Multi-Agent GenAI</span>
        </div>
        <ArrowRight className="w-4 h-4 text-zinc-400" />
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[11px]">4</span>
          <span>Review & Publish</span>
        </div>
      </div>

      <form onSubmit={handleSimulateUpload} className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
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

        {/* Drag & Drop Box */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Audio / Video Asset
          </label>
          <div
            onClick={() => setFileSelected(true)}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              fileSelected
                ? "border-brand-500 bg-brand-500/5"
                : "border-zinc-200 dark:border-zinc-800 hover:border-brand-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
            }`}
          >
            <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-brand-500 mb-3">
              <FileAudio className="w-6 h-6" />
            </div>
            {fileSelected ? (
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  episode_43_final_master.wav (68.4 MB)
                </p>
                <p className="text-[11px] text-emerald-500 mt-1 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready for upload</span>
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                  Click to choose file or drag and drop here
                </p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Supports MP3, WAV, M4A, MP4 (Up to 500MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {progress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Uploading & extracting audio stream...</span>
              <span className="font-mono font-semibold">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Link
            href="/dashboard"
            className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isUploading}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-glow transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isUploading ? "Uploading..." : "Start AI Repurposing"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
