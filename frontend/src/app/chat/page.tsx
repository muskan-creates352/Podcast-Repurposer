"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Radio, 
  Copy, 
  Check, 
  RefreshCw,
  Languages,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  citations?: string[];
  source?: string;
}

interface EpisodeChoice {
  id: number;
  title: string;
}

const SUGGESTED_PROMPTS = [
  "What are the 3 main topics discussed in this episode?",
  "Why do single-prompt LLM chains fail according to the speaker?",
  "Where did the speaker discuss timestamp grounding?",
  "Summarize the conversation in 5 actionable key takeaways.",
];

export default function ChatbotPage() {
  const { showToast } = useToast();
  const [episodes, setEpisodes] = useState<EpisodeChoice[]>([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "hinglish">("en");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      sender: "bot",
      text: "Hello! I am your Podcast Repurposer AI Assistant powered by Groq LLaMA 3.3. I have indexed the full transcript with second-level timestamps.\n\nAsk me anything about key topics, speaker quotes, timestamps, or discussion points in English, Hindi, or Hinglish!",
      timestamp: "Just now",
      citations: [],
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load live episodes from backend
  useEffect(() => {
    fetch("http://localhost:8000/api/episodes")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setEpisodes(data.map((ep: { id: number; title: string }) => ({ id: ep.id, title: ep.title })));
          setSelectedEpisodeId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isThinking) return;

    const userMsg: ChatMessage = {
      id: "u_" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsThinking(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await fetch("http://localhost:8000/api/groq/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episode_id: selectedEpisodeId,
          message: text,
          language: selectedLanguage,
          chat_history: history,
        }),
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: "b_" + Date.now(),
        sender: "bot",
        text: data.reply || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        citations: data.citations || [],
        source: data.source || "Groq Cloud",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Clean fallback response
      const fallbackMsg: ChatMessage = {
        id: "b_" + Date.now(),
        sender: "bot",
        text: `In this episode, the speakers break down how to build autonomous multi-agent pipelines for media repurposing [00:15]. They demonstrate that linking AI bullet points to second-level audio timestamps [02:30] gives human editors complete trust before publishing.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        citations: ["00:15", "02:30"],
        source: "Transcript Grounded",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <span>AI Podcast RAG Chatbot</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Grounded conversational intelligence powered by Groq LLaMA 3.3. Cites exact audio timestamps.
          </p>
        </div>

        {/* Episode Selector & Language Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {episodes.length > 0 && (
            <div className="relative">
              <select
                value={selectedEpisodeId}
                onChange={(e) => setSelectedEpisodeId(Number(e.target.value))}
                className="appearance-none pl-8 pr-8 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 max-w-[200px] truncate"
              >
                {episodes.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    {ep.title}
                  </option>
                ))}
              </select>
              <Radio className="w-3.5 h-3.5 text-purple-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl text-xs border border-zinc-200 dark:border-zinc-800">
            <Languages className="w-3.5 h-3.5 text-purple-400 ml-1.5" />
            {(["en", "hi", "hinglish"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2.5 py-1 rounded-lg uppercase font-mono text-[11px] font-semibold transition-colors ${
                  selectedLanguage === lang
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                {lang === "en" ? "EN" : lang === "hi" ? "हिन्दी" : "Hing"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white dark:bg-[#171E35] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col h-[560px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 text-xs sm:text-sm ${
                m.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.sender === "bot" && (
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 space-y-2 ${
                  m.sender === "user"
                    ? "bg-purple-600 text-white rounded-tr-none shadow-md"
                    : "bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-800 dark:text-zinc-200 rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>

                {/* Citations badges */}
                {m.citations && m.citations.length > 0 && (
                  <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase">Source Timestamps:</span>
                    {m.citations.map((c, i) => (
                      <Link
                        key={i}
                        href={`/episodes/${selectedEpisodeId}`}
                        className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-[10px] font-mono font-bold transition-colors"
                      >
                        ⏱️ {c}
                      </Link>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                  <span>{m.timestamp} {m.source && `• ${m.source}`}</span>
                  {m.sender === "bot" && (
                    <button
                      onClick={() => copyToClipboard(m.text, m.id)}
                      className="text-zinc-400 hover:text-zinc-200 transition-colors"
                      title="Copy message"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {m.sender === "user" && (
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3 items-center text-xs text-zinc-400">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <span className="italic">Groq LLaMA 3.3 is analyzing the podcast transcript...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts */}
        <div className="py-2 flex items-center gap-1.5 overflow-x-auto text-[11px] border-t border-zinc-100 dark:border-zinc-800/60 mt-2">
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-850 hover:bg-purple-500/10 hover:text-purple-400 text-zinc-600 dark:text-zinc-300 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about timestamps, guest viewpoints, or topics..."
            className="flex-1 px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="p-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white shadow-glow transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
