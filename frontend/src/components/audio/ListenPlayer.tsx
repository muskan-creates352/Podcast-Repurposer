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
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { synthesizeSpeech, SynthesizeResponse } from "@/lib/api";

export interface ListenPlayerProps {
  title: string;
  subtitle?: string;
  textToSpeak?: string;
  text?: string;
  voiceId?: string;
  onEnded?: () => void;
  className?: string;
}

// Global reference to ensure only one audio element or speech instance plays at a time
let globalActiveAudio: HTMLAudioElement | null = null;

export function ListenPlayer({
  title,
  subtitle = "AI Voice Narration",
  textToSpeak: propTextToSpeak,
  text: propText,
  voiceId,
  onEnded,
  className = "",
}: ListenPlayerProps) {
  const textToSpeak = propTextToSpeak || propText || "";
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio metrics
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);

  // Engine state: "elevenlabs" vs "browser_fallback"
  const [activeEngine, setActiveEngine] = useState<"elevenlabs" | "browser_fallback">("elevenlabs");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voiceName, setVoiceName] = useState<string>("Rachel (ElevenLabs)");

  // References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const serverOrigin = apiBase.replace(/\/api\/?$/, "");

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Initialize or reset when textToSpeak changes
  useEffect(() => {
    stopAllAudio();
    setAudioUrl(null);
    setCurrentTime(0);
    setHasError(false);
    setErrorMessage(null);

    // Initial estimated duration (~150 words per min)
    const words = textToSpeak.split(/\s+/).filter(Boolean).length;
    setDuration(Math.max(15, Math.round((words / 150) * 60)));
  }, [textToSpeak]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (globalActiveAudio === audioRef.current) {
      globalActiveAudio = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setIsBuffering(false);
  };

  /**
   * Request ElevenLabs audio from backend or switch to fallback
   */
  const loadAndPlayAudio = async () => {
    // Pause any other active audio player on the page
    if (globalActiveAudio && globalActiveAudio !== audioRef.current) {
      globalActiveAudio.pause();
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setHasError(false);
    setErrorMessage(null);

    // If audio is already loaded and paused, simply resume!
    if (activeEngine === "elevenlabs" && audioRef.current && audioUrl) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        globalActiveAudio = audioRef.current;
        return;
      } catch (err) {
        console.warn("Audio resume error, retrying synthesis:", err);
      }
    }

    // Synthesize audio via ElevenLabs
    setIsGenerating(true);
    try {
      const res: SynthesizeResponse = await synthesizeSpeech(textToSpeak, voiceId);

      if (res.status === "success" && res.audio_url) {
        const fullUrl = res.audio_url.startsWith("http")
          ? res.audio_url
          : `${serverOrigin}${res.audio_url}`;

        setAudioUrl(fullUrl);
        setActiveEngine("elevenlabs");
        setVoiceName(res.voice_used || "Rachel (ElevenLabs)");

        if (audioRef.current) {
          audioRef.current.src = fullUrl;
          audioRef.current.playbackRate = playbackRate;
          audioRef.current.volume = isMuted ? 0 : volume;
          audioRef.current.load();
          await audioRef.current.play();
          setIsPlaying(true);
          globalActiveAudio = audioRef.current;
        }
      } else {
        console.info("[TTS Engine] Falling back to browser speech synthesis:", res.message);
        setActiveEngine("browser_fallback");
        setVoiceName("Browser Voice (Fallback)");
        playBrowserSpeechFallback(res.cleaned_text || textToSpeak);
      }
    } catch (err: unknown) {
      console.warn("[TTS Engine] Backend TTS failed, using browser fallback:", err);
      setActiveEngine("browser_fallback");
      setVoiceName("Browser Voice (Fallback)");
      playBrowserSpeechFallback(textToSpeak);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Fallback using window.speechSynthesis
   */
  const playBrowserSpeechFallback = (rawText: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setHasError(true);
      setErrorMessage("Speech synthesis is not supported on this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = rawText
      .replace(/\[\d{2}:\d{2}\]/g, "")
      .replace(/[#*`~_]/g, "")
      .replace(/[✨🔥💡🎯💎👉📌💬🚀•]/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = playbackRate;
    utterance.volume = isMuted ? 0 : volume;

    const voices = window.speechSynthesis.getVoices();
    const goodVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Natural") ||
          v.name.includes("Google") ||
          v.name.includes("Samantha") ||
          v.name.includes("Daniel"))
    );
    if (goodVoice) utterance.voice = goodVoice;

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentTime(duration);
      if (timerRef.current) clearInterval(timerRef.current);
      if (onEnded) onEnded();
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= duration) {
          if (timerRef.current) clearInterval(timerRef.current);
          return duration;
        }
        return prev + 1;
      });
    }, 1000 / playbackRate);
  };

  /**
   * Play / Pause toggle
   */
  const handlePlayPause = () => {
    if (isGenerating) return;

    if (isPlaying) {
      if (activeEngine === "elevenlabs" && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else if (activeEngine === "browser_fallback") {
        if (window.speechSynthesis) window.speechSynthesis.pause();
        if (timerRef.current) clearInterval(timerRef.current);
        setIsPlaying(false);
      }
    } else {
      if (activeEngine === "elevenlabs" && audioRef.current && audioUrl) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => loadAndPlayAudio());
      } else if (activeEngine === "browser_fallback" && window.speechSynthesis?.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
        timerRef.current = setInterval(() => {
          setCurrentTime((prev) => Math.min(duration, prev + 1));
        }, 1000 / playbackRate);
      } else {
        loadAndPlayAudio();
      }
    }
  };

  /**
   * Stop playback completely
   */
  const handleStop = () => {
    stopAllAudio();
    setCurrentTime(0);
  };

  /**
   * Replay from 00:00
   */
  const handleReplay = () => {
    if (activeEngine === "elevenlabs" && audioRef.current && audioUrl) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      handleStop();
      setTimeout(() => loadAndPlayAudio(), 100);
    }
  };

  /**
   * Seek forward or backward by +/- 10 seconds
   */
  const handleSkip = (offsetSeconds: number) => {
    if (activeEngine === "elevenlabs" && audioRef.current) {
      const target = Math.max(0, Math.min(duration, audioRef.current.currentTime + offsetSeconds));
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    } else {
      setCurrentTime((prev) => Math.max(0, Math.min(duration, prev + offsetSeconds)));
    }
  };

  /**
   * Progress Bar Scrubbing
   */
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = percent * duration;

    if (activeEngine === "elevenlabs" && audioRef.current) {
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    } else {
      setCurrentTime(targetTime);
    }
  };

  /**
   * Playback Rate Changer
   */
  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (activeEngine === "elevenlabs" && audioRef.current) {
      audioRef.current.playbackRate = rate;
    } else if (activeEngine === "browser_fallback" && isPlaying) {
      handleStop();
      setTimeout(() => loadAndPlayAudio(), 100);
    }
  };

  /**
   * Volume Change
   */
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
    if (speechUtteranceRef.current) {
      speechUtteranceRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.muted = true;
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`p-5 rounded-3xl bg-gradient-to-r from-violet-950/40 via-[#171E35] to-[#141419] border border-violet-500/30 shadow-2xl backdrop-blur-xl space-y-4 ${className}`}
    >
      {/* Hidden Native HTML5 Audio Tag for true buffered audio stream */}
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && !isNaN(audioRef.current.duration)) {
            setDuration(audioRef.current.duration);
          }
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        onError={() => {
          setIsBuffering(false);
          setIsPlaying(false);
          setHasError(true);
          setErrorMessage("Failed to stream audio file.");
        }}
      />

      {/* Top Bar: Title, Engine Badge, Speed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white truncate max-w-sm">
                {title}
              </h4>

              {/* Status & Engine Badge */}
              {isGenerating ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1 animate-pulse shrink-0">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Synthesizing Voice...</span>
                </span>
              ) : activeEngine === "elevenlabs" ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>{voiceName}</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 shrink-0">
                  <span>{voiceName}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 truncate">{subtitle}</p>
          </div>
        </div>

        {/* Speed Selector (0.75x, 1x, 1.25x, 1.5x, 2x) */}
        <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 p-1 rounded-xl text-[11px] font-mono self-start sm:self-center">
          {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
            <button
              key={rate}
              type="button"
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

      {/* Error state alert if any */}
      {hasError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage || "Audio playback encountered an issue."}</span>
          </div>
          <button
            onClick={() => loadAndPlayAudio()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 font-semibold"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Scrubbable Progress Bar */}
      <div className="space-y-1.5">
        <div
          onClick={handleSeek}
          className="w-full h-2 bg-zinc-800/80 hover:h-2.5 rounded-full overflow-hidden relative cursor-pointer transition-all"
          title="Click to seek audio"
        >
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
            {isGenerating
              ? "Generating ElevenLabs Speech..."
              : isBuffering
              ? "Buffering stream..."
              : isPlaying
              ? "Narrating"
              : "Audio Ready"}
          </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons Row */}
      <div className="flex items-center justify-between pt-1">
        {/* Left: Rewind / Fast-forward 10s */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleSkip(-10)}
            disabled={isGenerating}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-40"
            title="Rewind 10s"
          >
            <Rewind className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleSkip(10)}
            disabled={isGenerating}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-40"
            title="Skip forward 10s"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Replay, Main Play/Pause, Stop */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReplay}
            disabled={isGenerating}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-40"
            title="Replay from start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handlePlayPause}
            disabled={isGenerating}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-glow transition-all scale-105 active:scale-95 disabled:opacity-50"
            title={isPlaying ? "Pause Narration" : "Play Narration"}
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleStop}
            disabled={isGenerating}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors disabled:opacity-40"
            title="Stop audio"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Volume Slider */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="text-zinc-400 hover:text-white transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
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
            title="Volume"
          />
        </div>
      </div>
    </div>
  );
}
