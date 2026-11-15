"use client";

import React, { useEffect, useRef } from "react";
import { TranscriptSegment } from "@/types";
import { Play, Volume2, Search, User } from "lucide-react";
import { formatSeconds } from "@/lib/utils";

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (seconds: number) => void;
}

export function TranscriptViewer({
  segments,
  currentTime,
  onSeek,
}: TranscriptViewerProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const activeSegmentRef = useRef<HTMLDivElement | null>(null);

  const filteredSegments = segments.filter((seg) =>
    seg.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seg.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-scroll active transcript into view smoothly if playing
  useEffect(() => {
    if (activeSegmentRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentTime]);

  return (
    <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col h-[650px] shadow-sm overflow-hidden">
      {/* Header with Search */}
      <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
            <span>Diarized Transcript</span>
            <span className="text-[10px] font-normal text-zinc-400 font-mono">
              ({segments.length} segments)
            </span>
          </h3>
          <p className="text-[11px] text-zinc-400">
            Click any sentence or timestamp to jump audio
          </p>
        </div>

        <div className="relative w-48">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search dialogue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Transcript Segments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-zinc-100 dark:divide-zinc-850/50">
        {filteredSegments.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">
            No dialogue matching &ldquo;{searchTerm}&rdquo;
          </div>
        ) : (
          filteredSegments.map((segment) => {
            const isActive = currentTime >= segment.start && currentTime < segment.end;

            return (
              <div
                key={segment.id}
                ref={isActive ? activeSegmentRef : null}
                onClick={() => onSeek(segment.start)}
                className={`pt-2.5 p-3 rounded-xl transition-all cursor-pointer group select-text ${
                  isActive
                    ? "bg-brand-500/10 border-l-4 border-brand-500 shadow-sm"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40 border-l-4 border-transparent"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-zinc-400" />
                    <span
                      className={`text-xs font-semibold ${
                        isActive
                          ? "text-brand-600 dark:text-brand-400"
                          : "text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {segment.speaker}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isActive && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-brand-500 text-white animate-pulse">
                        <Volume2 className="w-3 h-3" />
                        Playing
                      </span>
                    )}

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] transition-colors ${
                        isActive
                          ? "bg-brand-500/20 text-brand-600 dark:text-brand-300 font-bold"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-brand-500"
                      }`}
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      {formatSeconds(segment.start)}
                    </span>
                  </div>
                </div>

                <p
                  className={`text-xs leading-relaxed ${
                    isActive
                      ? "text-zinc-950 dark:text-zinc-50 font-medium"
                      : "text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
                  }`}
                >
                  {segment.text}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
