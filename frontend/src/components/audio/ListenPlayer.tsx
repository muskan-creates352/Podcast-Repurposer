"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  FastForward,
  Rewind,
  Volume2,
  VolumeX,
  Sparkles,
  Headphones,
} from "lucide-react";

interface ListenPlayerProps {
  title: string;
  subtitle?: string;
  textToSpeak: string;
  onEnded?: () => void;
  className?: string;
}

/**
 * Cleans text for natural speech synthesis:
 * Strips timestamps, markdown, URLs, UI artifacts, and symbols.
 */
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\[\d{2}:\d{2}(?::\d{2})?\]/g, "") // remove timestamps [00:15]
    .replace(/\b\d{2}:\d{2}\b/g, "") // remove loose timestamps
    .replace(/#+\s+/g, "") // remove markdown headers
    .replace(/\*\*([^*]+)\*\*/g, "$1") // remove bold **text**
    .replace(/\*([^*]+)\*/g, "$1") // remove italics *text*
    .replace(/_([^_]+)_/g, "$1") // remove underscores
    .replace(/`([^`]+)`/g, "$1") // remove code backticks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // clean links [text](url) -> text
    .replace(/^[-*+]\s+/gm, "") // remove bullet dashes
    .replace(/---.*?---/g, "") // remove slide delimiters
    .replace(/[✨🔥💡🎯💎👉📌💬🚀•]/g, "") // remove common emoji noise
    .replace(/\s+/g, " ")
    .trim();
}

export function ListenPlayer({
  title,
  subtitle = "AI Voice Narration",
  textToSpeak,
  onEnded,
  className = "",
}: ListenPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(120);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Estimate duration based on word count (~150 words per minute at 1x)
  useEffect(() => {
    const cleaned = cleanTextForSpeech(textToSpeak);
    const words = cleaned.split(/\s+/).filter(Boolean).length;
    const estSeconds = Math.max(30, Math.round((words / 150) * 60));
    setTotalDuration(estSeconds);
  }, [textToSpeak]);

  // Cleanup on unmount or text change
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const startPlayback = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    // Stop any existing speech across app
    window.speechSynthesis.cancel();
    if (timerRef.current) clearInterval(timerRef.current);

    const cleaned = cleanTextForSpeech(textToSpeak);
    const utterance = new SpeechSynthesisUtterance(cleaned);

    utterance.rate = playbackRate;
    utterance.volume = isMuted ? 0 : volume;
    utterance.pitch = 1.0;

    // Pick best English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Natural") ||
          v.name.includes("Google") ||
          v.name.includes("Samantha") ||
          v.name.includes("Daniel"))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentTime(totalDuration);
      if (timerRef.current) clearInterval(timerRef.current);
      if (onEnded) onEnded();
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);

    // Progress tick
    const startTime = Date.now() - currentTime * 1000;
    timerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 1;
        if (next >= totalDuration) {
          if (timerRef.current) clearInterval(timerRef.current);
          return totalDuration;
        }
        return next;
      });
    }, 1000 / playbackRate);
  };

  const handlePlayPause = () => {
    if (!isPlaying) {
      startPlayback();
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => Math.min(totalDuration, prev + 1));
      }, 1000 / playbackRate);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
  };

  const handleReplay = () => {
    handleStop();
    setTimeout(() => {
      startPlayback();
    }, 100);
  };

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(totalDuration, currentTime + seconds));
    setCurrentTime(newTime);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (isPlaying) {
      handleStop();
      setTimeout(() => startPlayback(), 100);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (utteranceRef.current) {
      utteranceRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (utteranceRef.current) utteranceRef.current.volume = volume;
    } else {
      setIsMuted(true);
      if (utteranceRef.current) utteranceRef.current.volume = 0;
    }
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div
      className={`p-5 rounded-3xl bg-gradient-to-r from-violet-950/40 via-[#171E35] to-[#141419] border border-violet-500/30 shadow-2xl backdrop-blur-xl space-y-4 ${className}`}
    >
      {/* Player Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight flex items-center gap-2">
              <span>{title}</span>
              {isPlaying && !isPaused && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Speed Selector (0.75x, 1x, 1.25x, 1.5x, 2x) */}
        <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 p-1 rounded-xl text-[11px] font-mono">
          {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
            <button
              key={rate}
              onClick={() => handleRateChange(rate)}
              className={`px-2 py-0.5 rounded-lg transition-colors font-semibold ${
                playbackRate === rate
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar & Timestamps */}
      <div className="space-y-1.5">
        <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden relative cursor-pointer">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
            {isPlaying ? (isPaused ? "Paused" : "Playing Voice") : "Audio Ready"}
          </span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between pt-1">
        {/* Left: Rewind & Fast Forward */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSkip(-10)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Rewind 10s"
          >
            <Rewind className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSkip(10)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Skip forward 10s"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Replay, Main Play/Pause, Stop */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReplay}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Replay from start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayPause}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-glow transition-all scale-105 active:scale-95"
            title={isPlaying && !isPaused ? "Pause" : "Play Overview Voice"}
          >
            {isPlaying && !isPaused ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={handleStop}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
            title="Stop audio"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Volume Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>
    </div>
  );
}
