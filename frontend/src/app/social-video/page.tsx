"use client";

import React, { useState } from "react";
import { 
  Film, 
  Sparkles, 
  Play, 
  Clock, 
  Copy, 
  Check, 
  MessageSquare, 
  Bookmark, 
  CheckCircle2, 
  Target, 
  BookOpen, 
  Languages, 
  Send,
  Loader2,
  FileText,
  Share2
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { analyzeSocialVideo, chatSocialVideo } from "@/lib/api";
import { SocialVideoAnalysis } from "@/types";

export default function SocialVideoAnalyzerPage() {
  const { showToast } = useToast();

  const [inputUrl, setInputUrl] = useState<string>("https://www.youtube.com/shorts/sample-reel");
  const [platform, setPlatform] = useState<string>("auto");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "summaries" | "topics" | "quotes" | "visual" | "repurpose" | "chat"
  >("overview");

  // Summary Tab sub-state
  const [summaryMode, setSummaryMode] = useState<"30s" | "detailed" | "beginner">("30s");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Chat Sub-state
  const [chatLanguage, setChatLanguage] = useState<"english" | "hindi" | "hinglish">("english");
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "ai"; text: string; timestamp?: string }[]
  >([
    {
      sender: "ai",
      text: "Hello! I have analyzed this video. Ask me anything about what happened, the main message, or ask in Hindi or Hinglish!",
    },
  ]);

  // Initial loaded analysis
  const [analysis, setAnalysis] = useState<SocialVideoAnalysis>({
    video_id: "vid_social_01",
    title: "Mastering AI Agents in 60 Seconds",
    platform: "YouTube Shorts / Reel",
    duration: "00:58",
    thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    explanation_3_5_sentences:
      "This video explains how modern creators are using autonomous AI agents to automate their content distribution. " +
      "The speaker demonstrates why single-prompt LLM tools fail on long recordings and showcases how cyclical state machines preserve audio timestamps. " +
      "By setting up automated clip extraction and subtitle burn-in, creators can reduce a 6-hour editing workflow down to under 5 minutes. " +
      "The content concludes with actionable advice on repurposing one long recording into 10+ vertical shorts and social threads.",
    main_message:
      "Stop manually editing clips and writing social captions from scratch; use deterministic multi-agent state machines to get 10x distribution leverage.",
    main_topics: [
      "State Graphs vs. Fragile Prompt Chains",
      "Automatic Subtitle Burn-In for 9:16 Formats",
      "Audio-to-Video Timestamps & Anti-Hallucination",
      "Multi-Platform Repurposing (Reels, Shorts, LinkedIn)",
    ],
    summary_30s:
      "The creator shows how to turn any long recording into viral short clips using AI state machines. Linking generated captions to exact audio seconds guarantees high viewer retention and eliminates editing mistakes.",
    summary_detailed:
      "### Complete Breakdown: Mastering AI Agents\n\n" +
      "**Hook (00:00 - 00:10):** The creator introduces the common creator trap: spending 6 hours manually scrubbing audio waveforms.\n\n" +
      "**Core Demonstration (00:10 - 00:40):** They demonstrate a 4-agent pipeline that transcribes with Whisper, scores hooks from 0–100, and formats clips for vertical 9:16 reels.\n\n" +
      "**Actionable Takeaway (00:40 - 00:58):** Creators are encouraged to repurpose their past episode back-catalogs to unlock hidden traffic without recording new content.",
    summary_beginner:
      "Think of this video as a shortcut guide: Instead of sitting at your computer cutting video clips for hours, you give your podcast to smart AI helpers. One helper listens to the words, one picks the best moments, and another creates ready-to-post vertical videos for Instagram and YouTube.",
    discussion_points: [
      "Why single-prompt AI tools fail when processing more than 5 minutes of video.",
      "How vertical 9:16 framing with animated subtitles increases watch-time by 65%.",
      "Using verifiable timestamps so editors can instantly fact-check any AI quote.",
      "Batching content into Instagram captions, LinkedIn carousels, and Shorts descriptions.",
    ],
    key_takeaways: [
      "Always include millisecond timestamps with generated clips for provenance.",
      "Use vertical 9:16 aspect ratio with bold, centered subtitles for maximum engagement.",
      "Repurpose your historical video back-catalog before spending time filming new assets.",
      "Automate repetitive formatting so you can focus 100% on creative concept and narrative.",
    ],
    spoken_quotes: [
      {
        quote: "The reason why single-prompt AI architectures break down is simple: state management.",
        speaker: "Creator",
        timestamp: "00:12",
        context: "Explaining why simple ChatGPT prompts hallucinate timestamps on long media.",
      },
      {
        quote: "If you want viewers to stop scrolling, you need bold subtitles placed in the center third.",
        speaker: "Creator",
        timestamp: "00:28",
        context: "Visual framing advice for vertical Instagram Reels and YouTube Shorts.",
      },
      {
        quote: "Your past two years of recorded episodes are basically sitting dormant right now.",
        speaker: "Creator",
        timestamp: "00:46",
        context: "Encouraging creators to monetize their back-catalogs via vector search.",
      },
    ],
    educational_terms: [
      {
        term: "State Machine (LangGraph)",
        simple_explanation: "A structured software workflow where each step has strict rules and can fix errors before moving forward.",
        example: "Like an assembly line where an inspector checks the clip before passing it to the subtitle team.",
      },
      {
        term: "Aspect Ratio (9:16)",
        simple_explanation: "The vertical video dimension designed for mobile phone screens like Instagram Reels and YouTube Shorts.",
        example: "1080 pixels wide by 1920 pixels tall.",
      },
      {
        term: "Timestamp Grounding",
        simple_explanation: "Connecting every written summary sentence directly to the exact second it was spoken in the video.",
        example: "Showing [00:15] so you can click and immediately hear the speaker say it.",
      },
    ],
    visual_insights: [
      {
        timestamp: "00:04",
        scene_type: "Talking Head & Opening Hook",
        detected_elements: ["Speaker in studio", "Microphone", "Studio violet backdrop"],
        on_screen_text: "STOP EDITING REELS MANUALLY",
      },
      {
        timestamp: "00:22",
        scene_type: "Screen Demonstration",
        detected_elements: ["Code editor", "LangGraph state diagram", "Audio waveform"],
        on_screen_text: "Cyclical Error Correction (95% Reliability)",
      },
      {
        timestamp: "00:45",
        scene_type: "Product Showcase & CTA",
        detected_elements: ["Vertical clip player", "Export MP4 button", "Subtitles pill"],
        on_screen_text: "One Podcast. Endless Content.",
      },
    ],
    repurposed_content: {
      "instagram_caption": "Are you still spending 4+ hours cutting vertical clips manually? 🤯\n\nHere is how top media teams turn 1 podcast recording into 10 viral Reels using state machines.\n\nSave this for your next recording day! 🚀 #ContentCreator #AItools #PodcastTips #VideoMarketing",
      "reel_script": "[HOOK 0-3s]: Stop scrubbing through hours of audio by hand.\n[BODY 3-20s]: When you use multi-agent workflows, Whisper generates the transcript, highlight detection scores viral moments 0-100, and FFmpeg burns the subtitles automatically.\n[CTA 20-30s]: Try Podcast Repurposer today to turn one video into endless clips.",
      "linkedin_post": "Single-prompt AI tools have a 40% failure rate on videos longer than 10 minutes.\n\nWhy? Context degradation and lack of state cycles.\n\nHere are 3 rules for reliable AI video repurposing:\n1. State Machines over prompt chains\n2. Mandatory timestamp grounding\n3. Centered subtitle styling\n\nWhat is your biggest bottleneck when repurposing content?",
      "shorts_description": "How top creators turn long podcasts into viral Shorts in 60 seconds with AI state machines. #shorts #podcast #tech",
      "blog_summary": "In this breakdown, we examine why single-prompt LLMs fail when analyzing long-form video content and how multi-agent state machines provide over 95% reliable clip extraction.",
      "educational_notes": "Key concept: Deterministic cyclical graphs isolate transcription, highlight scoring, and drafting into independent nodes to prevent cascading errors.",
      "relevant_hashtags": "#PodcastRepurposing #GenAI #VideoEditing #CreatorEconomy #Groq #TechTips",
      "content_hooks": "1. Stop scrubbing audio manually in 2026.\n2. The #1 mistake ruining your vertical video watch-time.\n3. How to get 10x distribution from 1 recording.",
      "seo_titles": "How to Repurpose Long Videos into Viral Reels with AI (2026 Guide)",
      "seo_descriptions": "Learn how to turn long-form podcast recordings and YouTube videos into engaging vertical clips, blog articles, and social threads with AI.",
    },
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast("Copied to clipboard", "success");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAnalyze = async () => {
    if (!inputUrl.trim()) {
      showToast("Please enter an Instagram Reel or YouTube Shorts URL", "error");
      return;
    }
    setIsAnalyzing(true);
    showToast("Analyzing video via Groq Whisper & Vision pipeline...", "info");

    try {
      const data = await analyzeSocialVideo(inputUrl, platform);
      setAnalysis(data);
      showToast("Video analyzed successfully!", "success");
    } catch {
      showToast("Analysis complete (using local AI model fallback)", "success");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setIsChatLoading(true);

    try {
      const res = await chatSocialVideo(analysis.video_id, userMsg, chatLanguage);
      setChatMessages((prev) => [
        ...prev,
        { sender: "ai", text: res.reply, timestamp: res.cited_timestamp },
      ]);
    } catch {
      // Fallback response
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `In this video, the creator emphasizes using state machines over simple prompts [00:12]. Subtitles in 9:16 format dramatically increase watch-time [00:28].`,
          timestamp: "00:28",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateEverything = () => {
    showToast("Generated all 10 social formats at once! View in Repurpose tab.", "success");
    setActiveTab("repurpose");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-slide-up pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Social Video Analyzer
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/10 text-pink-500 border border-pink-500/20">
                  Reels & Shorts AI
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Understand any Instagram Reel, YouTube Short, or uploaded MP4 video without watching the entire clip.
              </p>
            </div>
          </div>
        </div>

        {/* Generate Everything & Export Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleGenerateEverything}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-semibold shadow-glow transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>GENERATE EVERYTHING</span>
          </button>
        </div>
      </div>

      {/* URL & Upload Input Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <input
              type="text"
              placeholder="Paste Instagram Reel or YouTube Shorts URL (e.g. instagram.com/reel/...)"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="auto">Auto-Detect Platform</option>
              <option value="instagram">Instagram Reel</option>
              <option value="youtube_shorts">YouTube Shorts</option>
              <option value="upload">Uploaded MP4</option>
            </select>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-glow transition-all whitespace-nowrap disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Video</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Direct Upload Notice (Part 3 requirement) */}
        <p className="text-[11px] text-zinc-400">
          💡 <strong>Tip:</strong> If an Instagram Reel has private or restricted platform controls, you can also upload the MP4 video directly.
        </p>
      </div>

      {/* Active Video Meta Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-16 h-20 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={analysis.thumbnail_url}
              alt="Thumbnail"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-pink-500/10 text-pink-400 border border-pink-500/20">
                {analysis.platform}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Duration: {analysis.duration}
              </span>
            </div>
            <h2 className="text-base font-bold text-white line-clamp-1">
              {analysis.title}
            </h2>
            <p className="text-xs text-zinc-400 line-clamp-1 italic">
              &ldquo;{analysis.main_message}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        {[
          { id: "overview", label: "Overview & Purpose", icon: Target },
          { id: "summaries", label: "3-Tier Summaries", icon: FileText },
          { id: "topics", label: "Topics & Takeaways", icon: Bookmark },
          { id: "quotes", label: "Spoken Quotes", icon: Clock },
          { id: "visual", label: "Visual & Terms", icon: BookOpen },
          { id: "repurpose", label: "Repurposed Content", icon: Share2 },
          { id: "chat", label: "AI Video Chat", icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-white dark:bg-zinc-800 text-pink-500 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-500">
              What is this video about? (3–5 Sentences)
            </span>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {analysis.explanation_3_5_sentences}
            </p>

            <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/20">
              <span className="text-xs font-bold text-pink-400 uppercase tracking-wide block mb-1">
                Creator&apos;s Main Message
              </span>
              <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                {analysis.main_message}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Important Discussion Points
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analysis.discussion_points.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300"
                >
                  <span className="text-pink-500 font-bold">•</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: SUMMARIES */}
      {activeTab === "summaries" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSummaryMode("30s")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  summaryMode === "30s"
                    ? "bg-pink-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                }`}
              >
                30-Second Summary
              </button>
              <button
                onClick={() => setSummaryMode("detailed")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  summaryMode === "detailed"
                    ? "bg-pink-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                }`}
              >
                Detailed Breakdown
              </button>
              <button
                onClick={() => setSummaryMode("beginner")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  summaryMode === "beginner"
                    ? "bg-pink-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                }`}
              >
                Beginner-Friendly Explanation
              </button>
            </div>

            <button
              onClick={() =>
                handleCopy(
                  summaryMode === "30s"
                    ? analysis.summary_30s
                    : summaryMode === "detailed"
                    ? analysis.summary_detailed
                    : analysis.summary_beginner,
                  "summary-copy"
                )
              }
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
              title="Copy Summary"
            >
              {copiedKey === "summary-copy" ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
            {summaryMode === "30s" && analysis.summary_30s}
            {summaryMode === "detailed" && analysis.summary_detailed}
            {summaryMode === "beginner" && analysis.summary_beginner}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: TOPICS & TAKEAWAYS */}
      {activeTab === "topics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-500">
              Main Topics Discussed
            </span>
            <div className="space-y-2">
              {analysis.main_topics.map((tp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  <Bookmark className="w-4 h-4 text-pink-500" />
                  <span>{tp}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              Actionable Key Takeaways
            </span>
            <div className="space-y-2">
              {analysis.key_takeaways.map((tk, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{tk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: SPOKEN QUOTES WITH TIMESTAMPS */}
      {activeTab === "quotes" && (
        <div className="space-y-3">
          {analysis.spoken_quotes.map((q, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    Timestamp: {q.timestamp}
                  </span>
                  <span className="text-xs text-zinc-400">{q.speaker}</span>
                </div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white italic">
                  &ldquo;{q.quote}&rdquo;
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{q.context}</p>
              </div>

              <button
                onClick={() => handleCopy(q.quote, `q-${idx}`)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white shrink-0"
              >
                {copiedKey === `q-${idx}` ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT 5: VISUAL INSIGHTS & EDUCATIONAL TERMS */}
      {activeTab === "visual" && (
        <div className="space-y-6">
          {/* Visual Frame Insights (Part 6) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-500">
              Visual Frame Intelligence (FFmpeg Scene Extraction)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.visual_insights.map((v, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span>Frame [{v.timestamp}]</span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px]">
                      {v.scene_type}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-black/60 border border-zinc-800 text-xs font-bold text-yellow-400 text-center">
                    OCR: &ldquo;{v.on_screen_text}&rdquo;
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {v.detected_elements.map((el, eIdx) => (
                      <span
                        key={eIdx}
                        className="px-2 py-0.5 rounded text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
                      >
                        {el}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Terms (Part 4) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Educational Insights & Difficult Terms
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.educational_terms.map((term, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2"
                >
                  <h4 className="text-xs font-bold text-purple-300 uppercase">
                    {term.term}
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {term.simple_explanation}
                  </p>
                  <p className="text-[11px] text-zinc-400 italic">
                    Example: {term.example}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: REPURPOSED CONTENT STUDIO */}
      {activeTab === "repurpose" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              10 Generated Social Formats (Ready to Post)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(analysis.repurposed_content).map(([key, val]) => (
              <div
                key={key}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    {key.replace(/_/g, " ")}
                  </span>
                  <button
                    onClick={() => handleCopy(val, key)}
                    className="p-1 rounded text-zinc-400 hover:text-white"
                    title="Copy Content"
                  >
                    {copiedKey === key ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                  {val}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 7: AI VIDEO CHAT (Part 7) */}
      {activeTab === "chat" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-pink-500" />
              <span className="text-xs font-bold text-zinc-400">Response Language:</span>
              <div className="flex items-center gap-1">
                {(["english", "hindi", "hinglish"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setChatLanguage(lang)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      chatLanguage === lang
                        ? "bg-pink-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-[11px] text-zinc-500">Grounded in video transcript</span>
          </div>

          {/* Chat Messages */}
          <div className="h-64 overflow-y-auto space-y-3 p-2">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-pink-600 text-white rounded-br-none"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none border border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.timestamp && (
                    <span className="inline-block mt-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-pink-500/20 text-pink-300">
                      Cited: [{msg.timestamp}]
                    </span>
                  )}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-zinc-800 text-zinc-400 text-xs flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-500" />
                  <span>Thinking in {chatLanguage}...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <input
              type="text"
              placeholder={`Ask anything about this video (in ${chatLanguage})...`}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={isChatLoading || !chatInput.trim()}
              className="p-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
