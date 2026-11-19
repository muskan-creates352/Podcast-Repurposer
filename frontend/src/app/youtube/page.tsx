"use client";

import React, { useState } from "react";
import { 
  Video, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Languages, 
  RefreshCw, 
  Copy,
  AlertCircle,
  UploadCloud,
  Layers,
  Scissors
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

interface YouTubeMetadata {
  videoId: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  views?: string;
  publishDate?: string;
}

interface YouTubeIntelligence {
  overview?: {
    podcast_title: string;
    explanation: string;
    purpose: string;
    central_idea: string;
    subjects_covered: string[];
  };
  summaries?: {
    thirty_seconds: string;
    one_minute: string;
    detailed: string;
    five_takeaways: string[];
  };
  topics?: Array<{
    title: string;
    timestamp: string;
    description: string;
    significance: string;
  }>;
  chapters?: Array<{
    title: string;
    start_time: number;
    end_time: number;
    timestamp_formatted: string;
    summary: string;
  }>;
  takeaways?: Array<{
    id: number;
    point: string;
    actionable_tip: string;
    timestamp: string;
  }>;
}

export default function YouTubeImportPage() {
  const { showToast } = useToast();

  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState<"en" | "hi" | "hinglish">("en");
  const [isValidating, setIsValidating] = useState(false);
  const [metadata, setMetadata] = useState<YouTubeMetadata | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdEpisodeId, setCreatedEpisodeId] = useState<number | null>(null);
  const [intelligence, setIntelligence] = useState<YouTubeIntelligence | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "clips" | "social" | "blog" | "seo">("summary");

  // Validate and fetch authentic YouTube metadata
  const handleFetchMetadata = async (e?: React.FormEvent, targetUrl?: string) => {
    if (e) e.preventDefault();
    const queryUrl = (targetUrl || url).trim();

    if (!queryUrl) {
      showToast("Please enter a valid YouTube URL", "error");
      return;
    }

    setIsValidating(true);
    setErrorMessage(null);
    setIntelligence(null);
    setCreatedEpisodeId(null);

    try {
      const res = await fetch("http://localhost:8000/api/youtube/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: queryUrl }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Could not validate YouTube URL.");
      }

      const data = await res.json();
      const meta = data.metadata;
      setMetadata({
        videoId: data.video_id,
        title: meta.title || `YouTube Video (${data.video_id})`,
        channel: meta.channel || "YouTube Creator",
        duration: meta.duration_formatted || "00:00",
        thumbnail: meta.thumbnail || `https://img.youtube.com/vi/${data.video_id}/hqdefault.jpg`,
        views: "Public YouTube Video",
      });
      showToast("YouTube video metadata verified!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load YouTube video";
      setErrorMessage(msg);
      showToast(msg, "error");
    } finally {
      setIsValidating(false);
    }
  };

  // Run full Groq AI import and pipeline
  const handleStartPipeline = async () => {
    if (!metadata || !url) return;

    setIsProcessing(true);
    setProcessingStep(1);
    setErrorMessage(null);

    // Realistic visual stepper feedback
    const stepTimer1 = setTimeout(() => setProcessingStep(2), 1200);
    const stepTimer2 = setTimeout(() => setProcessingStep(3), 2800);

    try {
      const res = await fetch("http://localhost:8000/api/youtube/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), language }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to process YouTube import.");
      }

      setProcessingStep(4);
      const data = await res.json();

      setCreatedEpisodeId(data.episode_id);
      setIntelligence(data.intelligence);
      showToast("YouTube Podcast repurposed into multi-format assets!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Pipeline processing failed";
      setErrorMessage(msg);
      showToast(msg, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-up pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
            <Video className="w-5 h-5" />
          </div>
          <span>YouTube Podcast Import & Repurposer</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Paste any YouTube podcast or video URL. Our AI extracts authentic transcripts, detects viral moments, and writes full-funnel content.
        </p>
      </div>

      {/* URL Input Form */}
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <form onSubmit={(e) => handleFetchMetadata(e)} className="space-y-4">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Paste YouTube Podcast URL
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Video className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-500" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={isValidating || !url.trim()}
              className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Fetch Video</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Verified Samples */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-400">
            <span>Verified public sample:</span>
            <button
              type="button"
              onClick={() => {
                const sample = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
                setUrl(sample);
                handleFetchMetadata(undefined, sample);
              }}
              className="text-rose-500 hover:underline font-mono bg-rose-500/10 px-2 py-0.5 rounded"
            >
              youtube.com/watch?v=dQw4w9WgXcQ
            </button>
          </div>
        </form>

        {/* Error message / Upload fallback */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-slide-up">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
            <Link
              href="/upload"
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] shrink-0 flex items-center gap-1.5 transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Video Directly</span>
            </Link>
          </div>
        )}

        {/* Video Preview & Configuration Card */}
        {metadata && (
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Thumbnail / Iframe preview */}
              <div className="md:col-span-5 relative aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-md group">
                <iframe
                  src={`https://www.youtube.com/embed/${metadata.videoId}`}
                  title="YouTube video player"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Metadata Details */}
              <div className="md:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified YouTube Metadata</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {metadata.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-mono">
                  <span>Channel: {metadata.channel}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {metadata.duration}
                  </span>
                </div>

                {/* Repurposing Language Selector */}
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-brand-500" />
                    Target Language:
                  </span>
                  <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl text-xs">
                    {(["en", "hi", "hinglish"] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setLanguage(lang)}
                        className={`px-2.5 py-1 rounded-lg uppercase font-mono font-medium transition-colors ${
                          language === lang
                            ? "bg-brand-600 text-white font-bold shadow-sm"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                        }`}
                      >
                        {lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "Hinglish"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary CTA */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleStartPipeline}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs sm:text-sm shadow-glow transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing with Groq...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Start Groq AI Repurposing Pipeline</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Processing Stepper when Pipeline is Active */}
            {isProcessing && (
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-brand-500 animate-spin" />
                    {processingStep === 1 && "Fetching authorized YouTube captions & transcript..."}
                    {processingStep === 2 && "Transcribing with Groq Whisper Large v3 Turbo..."}
                    {processingStep === 3 && "Scoring viral highlight clips & timestamp grounding..."}
                    {processingStep === 4 && "Drafting blogs, social threads, and SEO descriptions..."}
                  </span>
                  <span className="font-mono text-brand-500">{processingStep * 25}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 transition-all duration-500 rounded-full"
                    style={{ width: `${processingStep * 25}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Repurposed Results Workspace */}
      {intelligence && metadata && (
        <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>AI Repurposing Complete</span>
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                Generated Asset Portfolio ({language.toUpperCase()})
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/episodes/${createdEpisodeId || 1}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow transition-all"
              >
                <span>Episode Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/review?episode=${createdEpisodeId || 1}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all"
              >
                <Layers className="w-4 h-4 text-brand-500" />
                <span>Review Queue</span>
              </Link>
            </div>
          </div>

          {/* Asset Navigation Subtabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: "summary", label: "Executive Summary" },
              { id: "clips", label: "Viral Clips" },
              { id: "social", label: "Social Posts" },
              { id: "blog", label: "SEO Blog Draft" },
              { id: "seo", label: "Show Notes" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Executive Summary */}
          {activeTab === "summary" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-500">
                  Short Summary (30s)
                </h4>
                <p className="text-xs leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {intelligence.summaries?.thirty_seconds || "Summary generated from transcript dialogue."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-500">
                  Key Takeaways
                </h4>
                <ul className="text-xs space-y-2 text-zinc-700 dark:text-zinc-300 list-disc pl-4">
                  {(intelligence.summaries?.five_takeaways || [
                    "All spoken content grounded in audio timestamps.",
                    "Full transcript vectorized for RAG search.",
                    "Ready for editorial review and 9:16 vertical export.",
                  ]).map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Viral Clips */}
          {activeTab === "clips" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(intelligence.topics || [
                { title: "Opening Hook", timestamp: "00:00 - 01:00", description: "Intro segment", significance: "Hook" }
              ]).map((top, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-500">⏱️ {top.timestamp}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400">Viral Moment</span>
                  </div>
                  <h5 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {top.title}
                  </h5>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {top.description}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <Link href="/clip-studio" className="text-[11px] text-brand-500 hover:underline font-semibold flex items-center gap-1">
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Edit & Export MP4</span>
                    </Link>
                    <button onClick={() => copyToClipboard(top.title)} className="p-1 text-zinc-400 hover:text-zinc-200">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Social Posts */}
          {activeTab === "social" && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-brand-500">LinkedIn & X Viral Post</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`🎙️ Key insight from '${metadata.title}':\n\n${intelligence.summaries?.thirty_seconds}\n\n#Podcast #Repurposing`)}
                  className="inline-flex items-center gap-1 text-xs text-brand-500 hover:underline font-medium"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Post</span>
                </button>
              </div>
              <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
{`🎙️ Key insight from '${metadata.title}':

${intelligence.summaries?.thirty_seconds}

Key Takeaways:
${(intelligence.summaries?.five_takeaways || []).map((t) => `• ${t}`).join("\n")}

#Podcast #Repurposing #${metadata.channel.replace(/\s+/g, "")}`}
              </p>
            </div>
          )}

          {/* Tab 4: SEO Blog Article */}
          {activeTab === "blog" && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-brand-500">Drafted Markdown Article</span>
                <Link
                  href="/content-studio"
                  className="text-xs text-brand-500 hover:underline font-semibold"
                >
                  Open in Content Studio →
                </Link>
              </div>
              <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-mono leading-relaxed">
{`# ${metadata.title}

*By ${metadata.channel} • Repurposed Draft*

${intelligence.summaries?.detailed || "Detailed editorial breakdown."}`}
              </p>
            </div>
          )}

          {/* Tab 5: SEO Titles & Show Notes */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
                <h5 className="text-xs font-bold uppercase text-brand-500">Full Show Notes & Timestamps</h5>
                <div className="text-xs font-mono text-zinc-700 dark:text-zinc-300 space-y-1">
                  {(intelligence.chapters || [
                    { title: "Intro", timestamp_formatted: "00:00 - 02:00" },
                    { title: "Main Discussion", timestamp_formatted: "02:00 - End" }
                  ]).map((ch, i) => (
                    <div key={i}>[{ch.timestamp_formatted}] {ch.title}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
