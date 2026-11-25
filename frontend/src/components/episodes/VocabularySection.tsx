"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookMarked,
  Volume2,
  Clock,
  Sparkles,
  HelpCircle,
  Headphones,
} from "lucide-react";
import { fetchPodcastVocabulary, VocabularyTerm } from "@/lib/api";
import { ListenPlayer } from "@/components/audio/ListenPlayer";

interface VocabularySectionProps {
  episodeId: string | number;
  onSeek?: (seconds: number) => void;
}

export function VocabularySection({ episodeId, onSeek }: VocabularySectionProps) {
  const [activeSpeechText, setActiveSpeechText] = useState<string | null>(null);

  const { data: vocabData, isLoading } = useQuery({
    queryKey: ["podcastVocabulary", episodeId],
    queryFn: () => fetchPodcastVocabulary(episodeId),
  });

  const handleSpeakTerm = (term: VocabularyTerm) => {
    setActiveSpeechText(
      `${term.term}. Meaning: ${term.simple_meaning}. In this podcast: ${term.contextual_explanation}. Example: ${term.example}`
    );
  };

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#171E35] via-[#141824] to-[#0F1219] border border-violet-500/20 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Contextual Jargon Demystifier</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-amber-400" />
            <span>AI Vocabulary Extractor</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Understand technical and unfamiliar terminology used in this episode with 1-click audio explanations.
          </p>
        </div>

        {vocabData && (
          <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
            {vocabData.total_terms} Terms Extracted
          </span>
        )}
      </div>

      {/* Embedded Listen Player for Active Term */}
      {activeSpeechText && (
        <ListenPlayer
          title="Vocabulary Audio Explanation"
          subtitle="Audio dictionary breakdown"
          textToSpeak={activeSpeechText}
          onEnded={() => setActiveSpeechText(null)}
        />
      )}

      {/* Term Cards Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-zinc-500 animate-pulse">
          Extracting technical terminology from transcript...
        </div>
      ) : vocabData && vocabData.terms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vocabData.terms.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {item.term}
                  </h4>
                  {item.timestamp && onSeek && (
                    <button
                      onClick={() => onSeek(item.start_seconds || 0)}
                      className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-amber-400 transition-colors"
                      title="Seek audio to this moment"
                    >
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{item.timestamp}</span>
                    </button>
                  )}
                </div>

                {/* Simple Meaning */}
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  {item.simple_meaning}
                </p>

                {/* Contextual Usage */}
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 text-[11px] text-zinc-400 leading-relaxed">
                  <strong className="text-zinc-300 block mb-0.5">In Context:</strong>
                  <span>{item.contextual_explanation}</span>
                </div>
              </div>

              {/* Action Button: Listen to Explanation */}
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 italic truncate max-w-[200px]">
                  Ex: &ldquo;{item.example}&rdquo;
                </span>
                <button
                  onClick={() => handleSpeakTerm(item)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/20 transition-all shrink-0"
                >
                  <Headphones className="w-3 h-3" />
                  <span>Listen</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
