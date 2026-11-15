"use client";

import React, { useState } from "react";
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Radio, 
  Copy, 
  Check, 
  Play, 
  RefreshCw 
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  citations?: { time: string; text: string }[];
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    sender: "bot",
    text: "Hello! I am your Podcast Repurposer AI Assistant. I have indexed the full transcript of **Episode 42: Building Autonomous Multi-Agent AI Systems with LangGraph** into our vector database.\n\nAsk me anything about key topics, speaker quotes, timestamps, or discussion points!",
    timestamp: "12:00 PM",
  },
];

const SUGGESTED_PROMPTS = [
  "What are the 3 main topics discussed in this episode?",
  "Why do single-prompt LLM chains fail according to the guest?",
  "Where did the speaker talk about timestamp grounding?",
  "Summarize the conversation in 5 key takeaways.",
];

export default function ChatbotPage() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: "u_" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsThinking(true);

    // Simulate RAG transcript vector search + Groq Llama 3 grounded generation
    setTimeout(() => {
      let botResponse = "";
      let citations: { time: string; text: string }[] = [];

      const lower = text.toLowerCase();
      if (lower.includes("single-prompt") || lower.includes("fail") || lower.includes("why")) {
        botResponse = `According to Dr. Alex (Guest), single-prompt LLM architectures fail in long-form podcast workflows primarily because of **state management**. When processing a 45-minute recording, single prompts lack memory cycles and bounded repair loops.\n\nBy introducing a deterministic graph (like LangGraph), pipeline reliability jumps from **60% to over 95%**.`;
        citations = [
          { time: "04:12", text: "The reason why single-prompt LLMs fail in complex workflows is state management..." },
          { time: "05:08", text: "Reliability jumps from 60% to over 95%..." },
        ];
      } else if (lower.includes("grounding") || lower.includes("timestamp") || lower.includes("where")) {
        botResponse = `Timestamp grounding is discussed extensively around **[18:45]**.\n\nThe speaker states that creator trust depends entirely on source citations: *"Never present a generated claim without showing exactly which second it was spoken in the audio."* This rule prevents hallucinations and allows human editors to verify quotes with a single click.`;
        citations = [
          { time: "18:45", text: "If you want creators to actually trust AI output, you have to provide source timestamps..." },
        ];
      } else if (lower.includes("takeaway") || lower.includes("summary") || lower.includes("main topics")) {
        botResponse = `Here are the top 3 core takeaways grounded in the transcript:\n\n1. **Deterministic State Transitions [04:12]:** Move away from simple prompt chaining to multi-agent state machines.\n2. **Factual Grounding & Provenance [18:45]:** Every bullet point must cite its audio timestamp to eliminate hallucinations.\n3. **Archive Vector Search [32:10]:** Repurpose back-catalogs into searchable vector databases for 10x audience reach.`;
        citations = [
          { time: "04:12", text: "State machines over simple prompts" },
          { time: "18:45", text: "Hallucination control and source grounding" },
          { time: "32:10", text: "Turning podcast archives into vector search engines" },
        ];
      } else {
        botResponse = `Based on the transcript of Episode 42, the conversation centers around autonomous multi-agent pipelines for media repurposing. The hosts demonstrate how to extract highlights, draft multi-format blogs, and keep human-in-the-loop review at the core of the workflow.`;
        citations = [
          { time: "00:00", text: "Introduction to autonomous agent workflows" },
          { time: "45:30", text: "Creator studio conclusions" },
        ];
      }

      const botMsg: ChatMessage = {
        id: "b_" + Date.now(),
        sender: "bot",
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        citations,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
    }, 700);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Answer copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-slide-up pb-16">
      {/* Header with Episode Selector */}
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <Bot className="w-5 h-5" />
            </div>
            <span>Podcast AI Knowledge Chatbot</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            RAG-powered conversational search grounded in verified podcast transcripts.
          </p>
        </div>

        {/* Selected Context Episode Badge */}
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 px-3 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shrink-0">
          <Radio className="w-4 h-4 text-brand-500" />
          <div className="text-left">
            <span className="text-[10px] text-zinc-400 block font-mono">Current Context:</span>
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[180px] block">
              Ep. 42: LangGraph Multi-Agent
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] text-zinc-400 font-medium shrink-0 flex items-center gap-1 pl-1">
          <Sparkles className="w-3 h-3 text-brand-400" />
          Suggested:
        </span>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 hover:border-brand-500/50 text-[11px] text-zinc-600 dark:text-zinc-300 font-medium whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm min-h-[460px] flex flex-col justify-between space-y-4">
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "bot" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-violet-500 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                  msg.sender === "user"
                    ? "bg-brand-600 text-white font-medium rounded-tr-none shadow-glow"
                    : "bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap select-text">{msg.text}</div>

                {/* Grounding Audio Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-brand-500 block">
                      Ground Truth Audio Citations (RAG):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c, i) => (
                        <Link
                          key={i}
                          href="/episodes/ep_01"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-300 font-mono text-[10px] font-bold transition-colors"
                          title="Click to jump to audio timestamp in Episode Studio"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>[{c.time}] Jump to Audio</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400">
                  <span>{msg.timestamp}</span>
                  {msg.sender === "bot" && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="p-1 hover:text-zinc-200 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-900 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-sm mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3 items-center text-xs text-zinc-400">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <span>Searching transcript vectors & generating grounded answer...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative pt-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask a question about this podcast episode (e.g. 'What was said about LangGraph?')..."
            className="w-full pl-4 pr-12 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
