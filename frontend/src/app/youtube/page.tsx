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
  Copy 
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

interface YouTubeMetadata {
  videoId: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  views: string;
  publishDate: string;
}

export default function YouTubeImportPage() {
  const { showToast } = useToast();

  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState<"en" | "hi" | "hinglish">("en");
  const [isValidating, setIsValidating] = useState(false);
  const [metadata, setMetadata] = useState<YouTubeMetadata | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [generatedResults, setGeneratedResults] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"summary" | "clips" | "social" | "blog" | "seo">("summary");

  // YouTube URL parser
  const extractVideoId = (inputUrl: string): string | null => {
    const cleanUrl = inputUrl.trim();
    // Patterns for youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = cleanUrl.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleFetchMetadata = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const videoId = extractVideoId(url);

    if (!videoId) {
      showToast("Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=...)", "error");
      return;
    }

    setIsValidating(true);
    // Simulate fetching video metadata via YouTube oEmbed / API
    setTimeout(() => {
      setMetadata({
        videoId,
        title: "Autonomous Multi-Agent AI Systems: The 2026 Production Blueprint",
        channel: "Lex Fridman Podcast & AI Lab",
        duration: "48:15",
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        views: "182K views",
        publishDate: "Oct 2026",
      });
      setIsValidating(false);
      showToast("YouTube podcast metadata loaded successfully!", "success");
    }, 600);
  };

  const handleStartPipeline = () => {
    if (!metadata) return;

    setIsProcessing(true);
    setProcessingStep(1);

    // Multi-Agent Pipeline Stepper Simulation with Groq AI integration
    const timer1 = setTimeout(() => setProcessingStep(2), 1200);
    const timer2 = setTimeout(() => setProcessingStep(3), 2400);
    const timer3 = setTimeout(() => setProcessingStep(4), 3600);
    const timer4 = setTimeout(() => {
      setIsProcessing(false);
      setGeneratedResults(true);
      showToast("YouTube Podcast repurposed into 10 multi-format assets!", "success");
    }, 4800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
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
          Paste any YouTube podcast or interview URL. Our AI extracts authorized transcripts, detects viral moments, and writes full-funnel content.
        </p>
      </div>

      {/* URL Input Form */}
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <form onSubmit={handleFetchMetadata} className="space-y-4">
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
                  <span>Import Video</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Sample Links */}
          <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-400">
            <span>Try sample URL:</span>
            <button
              type="button"
              onClick={() => {
                setUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
                setMetadata({
                  videoId: "dQw4w9WgXcQ",
                  title: "How To Build Autonomous Multi-Agent AI Systems (LangGraph & Groq)",
                  channel: "AI Engineers Podcast",
                  duration: "48:15",
                  thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
                  views: "340K views",
                  publishDate: "2 weeks ago",
                });
              }}
              className="text-rose-500 hover:underline font-mono"
            >
              youtube.com/watch?v=dQw4w9WgXcQ
            </button>
          </div>
        </form>

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
                  <span>Verified YouTube Podcast</span>
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
                  <span>•</span>
                  <span>{metadata.views}</span>
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
                    <Sparkles className="w-4 h-4" />
                    <span>Start Groq AI Repurposing Pipeline</span>
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
                    {processingStep === 1 && "Fetching authorized YouTube captions & speech stream..."}
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
      {generatedResults && metadata && (
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

            <Link
              href="/episodes/ep_01"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow transition-all"
            >
              <span>Open in Full Episode Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Asset Navigation Subtabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: "summary", label: "Executive Summary" },
              { id: "clips", label: "Viral Clips (3)" },
              { id: "social", label: "LinkedIn & X Posts" },
              { id: "blog", label: "SEO Blog Article" },
              { id: "seo", label: "SEO & Show Notes" },
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
                  Short Summary (2 Sentences)
                </h4>
                <p className="text-xs leading-relaxed text-zinc-800 dark:text-zinc-200">
                  This podcast breaks down why deterministic multi-agent state machines replace fragile single-prompt LLM chains in production. The speakers emphasize that creator trust requires verifiable millisecond timestamp citations for every claim.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-500">
                  Key Takeaways & Discussion Points
                </h4>
                <ul className="text-xs space-y-2 text-zinc-700 dark:text-zinc-300 list-disc pl-4">
                  <li><strong>State Management Over Prompts:</strong> Introducing deterministic graphs increases workflow reliability from 60% to over 95%. [04:12]</li>
                  <li><strong>Anti-Hallucination Provenance:</strong> Editors will only publish AI takeaways if backed by direct audio timestamps. [18:45]</li>
                  <li><strong>Archive Vector Search:</strong> Two years of archived episodes become instant conversational intelligence via RAG. [32:10]</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Viral Clips */}
          {activeTab === "clips" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-brand-500">⏱️ 04:12 – 05:08</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400">Viral Score: 94/100</span>
                </div>
                <h5 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  &ldquo;Why Single Prompts Fail in Production&rdquo;
                </h5>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
                  Hook: &ldquo;The reason why single-prompt LLMs fail is simple: state management.&rdquo;
                </p>
                <div className="flex items-center justify-between pt-2">
                  <Link href="/clip-studio" className="text-[11px] text-brand-500 hover:underline font-semibold">
                    Open in Clip Studio →
                  </Link>
                  <button onClick={() => copyToClipboard("The reason why single-prompt LLMs fail...")} className="p-1 text-zinc-400 hover:text-zinc-200">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-brand-500">⏱️ 18:45 – 19:35</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400">Viral Score: 91/100</span>
                </div>
                <h5 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  &ldquo;The Timestamp Grounding Rule&rdquo;
                </h5>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
                  Hook: &ldquo;Never present an AI quote to an editor without the exact second it was spoken.&rdquo;
                </p>
                <div className="flex items-center justify-between pt-2">
                  <Link href="/clip-studio" className="text-[11px] text-brand-500 hover:underline font-semibold">
                    Open in Clip Studio →
                  </Link>
                  <button onClick={() => copyToClipboard("Never present an AI quote to an editor without...")} className="p-1 text-zinc-400 hover:text-zinc-200">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Social Posts */}
          {activeTab === "social" && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-brand-500">LinkedIn & X Viral Thread</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`Most AI tools hallucinate because they have no anchor to reality.\n\nIn our latest podcast, we broke down how to build grounded AI pipelines:\n\n1️⃣ Always link generated points to exact audio timestamps.\n2️⃣ Run independent agents in parallel.\n3️⃣ Give human editors a 1-click review studio.\n\nListen to the full breakdown: [link]`)}
                  className="inline-flex items-center gap-1 text-xs text-brand-500 hover:underline font-medium"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Thread</span>
                </button>
              </div>
              <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
{`Most AI tools hallucinate because they have no anchor to reality. 🎙️

In our latest podcast episode, we broke down how to build grounded AI pipelines:

1️⃣ Always link generated bullet points to exact audio timestamps.
2️⃣ Run independent agents in parallel (Highlight Agent + Content Agent).
3️⃣ Give human editors a 1-click review studio before publishing.

Listen to the full breakdown: [link] 🧵👇`}
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
{`# Why State Machines are Replacing Simple Prompts in Production AI

In Episode 42 of the Podcast, we discussed why building autonomous agentic workflows requires moving beyond basic LLM prompt chaining.

## 3 Core Architectural Takeaways
1. Deterministic State Transitions
2. Grounding & Provenance (Timestamp Citing)
3. Bounded Repair Loops`}
              </p>
            </div>
          )}

          {/* Tab 5: SEO Titles & Show Notes */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
                <h5 className="text-xs font-bold uppercase text-brand-500">High-CTR SEO Titles</h5>
                <ul className="text-xs space-y-1 text-zinc-800 dark:text-zinc-200">
                  <li>• Why LangGraph State Machines Outperform Single-Prompt LLMs</li>
                  <li>• Building Autonomous Multi-Agent AI Systems (Production Guide)</li>
                  <li>• How Top Creators Repurpose 1 Hour of Video into 15 Viral Assets</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
                <h5 className="text-xs font-bold uppercase text-brand-500">Full Show Notes & Timestamps</h5>
                <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
{`[00:00] Intro & Guest Welcome
[04:12] Why Single-Prompt LLM Chains Fail
[18:45] Hallucination Control & Source Grounding
[32:10] Turning Podcast Archives into Vector Search Engines
[45:30] Wrap-up & Creator Takeaways`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
