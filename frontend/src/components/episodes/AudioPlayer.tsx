"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Headphones 
} from "lucide-react";
import { formatSeconds } from "@/lib/utils";

interface AudioPlayerProps {
  episodeTitle: string;
  durationInSeconds: number;
  currentTime: number;
  onTimeUpdate: React.Dispatch<React.SetStateAction<number>>;
  onSeek: (time: number) => void;
}

export function AudioPlayer({
  episodeTitle,
  durationInSeconds,
  currentTime,
  onTimeUpdate,
  onSeek,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Audio Context Ref for synthetic speech tone if local audio file is not loaded
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);

  // Initialize Web Audio tone generator for smooth simulation
  const startAudioTone = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current && AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
      if (audioContextRef.current && !oscillatorRef.current) {
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, audioContextRef.current.currentTime); // Gentle A3 warm tone
        gain.gain.setValueAtTime(isMuted ? 0 : volume * 0.03, audioContextRef.current.currentTime);
        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);
        osc.start();
        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
      }
    } catch {
      // AudioContext unavailable or restricted in environment
    }
  }, [isMuted, volume]);

  const stopAudioTone = useCallback(() => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
    } catch {
      // cleanup error ignored
    }
  }, []);

  // Timer loop for advancing playback smoothly
  useEffect(() => {
    if (isPlaying) {
      lastTickTimeRef.current = performance.now();
      const tick = () => {
        const now = performance.now();
        const delta = (now - lastTickTimeRef.current) / 1000;
        lastTickTimeRef.current = now;

        onTimeUpdate((prev) => {
          const next = prev + delta * playbackRate;
          if (next >= durationInSeconds) {
            setIsPlaying(false);
            stopAudioTone();
            return durationInSeconds;
          }
          return next;
        });

        animationFrameRef.current = requestAnimationFrame(tick);
      };
      animationFrameRef.current = requestAnimationFrame(tick);
      startAudioTone();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      stopAudioTone();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      stopAudioTone();
    };
  }, [isPlaying, playbackRate, durationInSeconds, onTimeUpdate, startAudioTone, stopAudioTone]);

  // Adjust volume on tone
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      const targetGain = isMuted ? 0 : volume * 0.03;
      gainNodeRef.current.gain.setValueAtTime(targetGain, audioContextRef.current.currentTime);
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    const nextTime = Math.min(currentTime + 10, durationInSeconds);
    onSeek(nextTime);
  };

  const skipBackward = () => {
    const nextTime = Math.max(currentTime - 10, 0);
    onSeek(nextTime);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onSeek(newTime);
  };

  const handleSpeedToggle = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackRate(speeds[nextIndex]);
  };

  return (
    <div className="bg-white dark:bg-[#171E35] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-md sticky top-20 z-10 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 shrink-0">
            <Headphones className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {episodeTitle}
            </h4>
            <p className="text-[10px] text-zinc-400">
              Interactive Audio Player • Click transcript or clip citations to seek
            </p>
          </div>
        </div>

        {/* Playback rate & Volume controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSpeedToggle}
            className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:bg-brand-500 hover:text-white transition-colors"
            title="Toggle playback speed"
          >
            {playbackRate}x
          </button>

          <div className="flex items-center gap-1.5 text-zinc-400">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-16 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Main Scrubber Slider */}
      <div className="space-y-1.5">
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max={durationInSeconds || 100}
            step="0.5"
            value={currentTime}
            onChange={handleSliderChange}
            className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>{formatSeconds(currentTime)}</span>
          <span>{formatSeconds(durationInSeconds)}</span>
        </div>
      </div>

      {/* Central transport buttons */}
      <div className="flex items-center justify-center gap-3 mt-1">
        <button
          type="button"
          onClick={skipBackward}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Rewind 10 seconds"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-glow transition-all"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={skipForward}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Forward 10 seconds"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
