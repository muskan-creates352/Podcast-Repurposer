"use client";

import React, { useState } from "react";
import { GeneratedContent } from "@/types";
import { 
  Download, 
  Copy, 
  CheckCheck, 
  Sparkles, 
  Play, 
  FileText, 
  Check, 
  Clock 
} from "lucide-react";
import { downloadFile, parseTimestampToSeconds } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

interface ContentTabProps {
  contentItems: GeneratedContent[];
  onSeek: (seconds: number) => void;
}

export function ContentTab({ contentItems, onSeek }: ContentTabProps) {
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState<GeneratedContent["type"]>("blog");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeItem = contentItems.find((c) => c.type === selectedType) || contentItems[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Content copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadMd = (item: GeneratedContent) => {
    const filename = `${item.type}_repurposed_${item.episode_id}.md`;
    downloadFile(filename, item.body, "text/markdown");
    showToast(`Downloaded ${filename}`, "success");
  };

  const handleDownloadTxt = (item: GeneratedContent) => {
    const filename = `${item.type}_repurposed_${item.episode_id}.txt`;
    downloadFile(filename, item.body, "text/plain");
    showToast(`Downloaded ${filename}`, "success");
  };

  const getTypeLabel = (type: GeneratedContent["type"]) => {
    switch (type) {
      case "blog":
        return "Blog Article";
      case "social":
        return "Social Media Thread";
      case "show_notes":
        return "Comprehensive Show Notes";
    }
  };

  return (
    <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col h-[650px] shadow-sm overflow-hidden">
      {/* Sub-Tabs: Blog, Social, Show Notes */}
      <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {(["blog", "social", "show_notes"] as const).map((type) => {
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-brand-600 text-white shadow-sm font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {getTypeLabel(type)}
              </button>
            );
          })}
        </div>

        {activeItem && (
          <div className="flex items-center gap-1.5 shrink-0">
            {activeItem.status === "approved" ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Check className="w-3 h-3" />
                Approved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="w-3 h-3" />
                Draft
              </span>
            )}
          </div>
        )}
      </div>

      {activeItem ? (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Main Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Grounding Source Timestamps bar */}
            {activeItem.source_timestamps && activeItem.source_timestamps.length > 0 && (
              <div className="p-2.5 rounded-xl bg-brand-500/5 border border-brand-500/20 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 text-[11px] font-medium text-brand-600 dark:text-brand-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Grounding Timestamps:</span>
                </div>
                {activeItem.source_timestamps.map((ts, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const sec = parseTimestampToSeconds(ts);
                      onSeek(sec);
                      showToast(`Seeking to ${ts}`, "info");
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-mono text-[10px] font-semibold hover:bg-brand-200 dark:hover:bg-brand-800 transition-colors"
                    title="Click to jump audio"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>{ts}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Rendered Text Body */}
            <div className="p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/60 font-sans text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap select-text">
              {activeItem.body}
            </div>
          </div>

          {/* Export Toolbar at Bottom */}
          <div className="p-3.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <FileText className="w-4 h-4 text-brand-500" />
              <span className="font-medium">Export Formats:</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(activeItem.body, activeItem.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-all"
                title="Copy body to clipboard"
              >
                {copiedId === activeItem.id ? (
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedId === activeItem.id ? "Copied" : "Copy to Clipboard"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadTxt(activeItem)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-all"
                title="Download as Plain Text file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>.TXT</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadMd(activeItem)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow transition-all"
                title="Download as Markdown file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .MD</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-zinc-400">
          No generated content found for this episode.
        </div>
      )}
    </div>
  );
}
