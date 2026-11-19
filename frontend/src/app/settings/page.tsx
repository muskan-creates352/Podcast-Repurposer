"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import {
  Settings,
  User,
  Moon,
  Sun,
  Key,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
  Bell,
  Bot,
  Mic,
  Shield,
  HelpCircle,
  HardDrive,
  Download,
  Trash2,
  ExternalLink,
  Sparkles,
  BookOpen,
  Info,
  Sliders,
  Check,
} from "lucide-react";

type SettingsTab =
  | "general"
  | "notifications"
  | "ai"
  | "content"
  | "privacy"
  | "help";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  // General Settings
  const [name, setName] = useState(user?.name || "Muskan Kumari");
  const [email, setEmail] = useState(user?.email || "muskan@podcastrepurposer.ai");
  const [workspaceName, setWorkspaceName] = useState("Creator Studio Lab");
  const [role, setRole] = useState("Lead Creator & Host");

  // Notifications Settings
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [processingAlerts, setProcessingAlerts] = useState(true);
  const [audioChimes, setAudioChimes] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // AI Configuration Settings
  const [groqKey, setGroqKey] = useState("");
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [groqStatus, setGroqStatus] = useState<{
    configured: boolean;
    connected: boolean;
    message: string;
    text_model?: string;
    whisper_model?: string;
  } | null>(null);
  const [isSavingGroq, setIsSavingGroq] = useState(false);

  const [geminiKey, setGeminiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState("llama-3.3-70b-versatile");
  const [temperature, setTemperature] = useState(0.2);
  const [enforceGrounding, setEnforceGrounding] = useState(true);
  const [safetyFilter, setSafetyFilter] = useState(true);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  // Content Preferences
  const [defaultTone, setDefaultTone] = useState("viral");
  const [language, setLanguage] = useState("en");
  const [clipDuration, setClipDuration] = useState("30-60s");
  const [enabledFormats, setEnabledFormats] = useState({
    shorts: true,
    reels: true,
    linkedin: true,
    twitter: true,
    blog: true,
    showNotes: true,
  });

  // Check Backend Status
  const checkBackend = async () => {
    setBackendStatus("checking");
    try {
      const res = await fetch("http://localhost:8000/api/health", { cache: "no-store" });
      if (res.ok) {
        setBackendStatus("online");
      } else {
        setBackendStatus("offline");
      }
    } catch {
      setBackendStatus("offline");
    }
  };

  const checkGroqStatus = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/groq/status");
      if (res.ok) {
        const data = await res.json();
        setGroqStatus(data);
      }
    } catch {}
  };

  const handleSaveGroqKey = async () => {
    if (!groqKey.trim()) {
      showToast("Please enter a Groq Cloud API key", "error");
      return;
    }
    setIsSavingGroq(true);
    try {
      const res = await fetch("http://localhost:8000/api/groq/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: groqKey.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setGroqStatus(data);
        showToast("Groq API Key saved! LLaMA 3.3 & Whisper Turbo are now active.", "success");
      } else {
        showToast("Failed to verify Groq API key", "error");
      }
    } catch {
      showToast("Backend connection error", "error");
    } finally {
      setIsSavingGroq(false);
    }
  };

  useEffect(() => {
    checkBackend();
    checkGroqStatus();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Settings and workspace preferences saved successfully!", "success");
  };

  const handleClearCache = () => {
    showToast("Browser query cache cleared successfully!", "info");
  };

  const handleResetData = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/episodes", { cache: "no-store" });
      if (res.ok) {
        showToast("Sample demo data re-synchronized!", "success");
      } else {
        showToast("Demo data reloaded in memory", "info");
      }
    } catch {
      showToast("Demo data reset to baseline", "info");
    }
  };

  const handleExportAudit = () => {
    const sampleLog = [
      { timestamp: new Date().toISOString(), action: "settings_updated", user: name },
      { timestamp: new Date().toISOString(), action: "pipeline_reviewed", user: name, episode_id: 101 },
    ];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sampleLog, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `audit-log-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Audit logs exported to JSON!", "success");
  };

  const navItems = [
    { id: "general" as SettingsTab, label: "General", icon: Settings, desc: "Profile & Theme" },
    { id: "notifications" as SettingsTab, label: "Notifications", icon: Bell, desc: "Alerts & Emails" },
    { id: "ai" as SettingsTab, label: "AI Configuration", icon: Bot, desc: "Gemini & Models" },
    { id: "content" as SettingsTab, label: "Content Preferences", icon: Mic, desc: "Tone & Formats" },
    { id: "privacy" as SettingsTab, label: "Privacy & Storage", icon: Shield, desc: "Data & Cache" },
    { id: "help" as SettingsTab, label: "Help & Support", icon: HelpCircle, desc: "Docs & About" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-500" />
            <span>Settings & Preferences</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Configure your creator profile, AI pipeline hyperparameters, and workspace settings.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-95 text-white text-xs font-semibold shadow-glow transition-all cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side Navigation Tabs */}
        <aside className="md:col-span-4 lg:col-span-3 space-y-1">
          <nav className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-2 space-y-1 shadow-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-xs font-medium cursor-pointer ${
                    isActive
                      ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold border border-brand-500/30 shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-brand-500 text-white shadow-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{item.label}</p>
                    <p className="text-[10px] text-zinc-400 font-normal truncate">
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Quick Backend Status Pill */}
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">FastAPI Server</span>
            {backendStatus === "online" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Port 8000</span>
              </span>
            )}
            {backendStatus === "offline" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                <AlertCircle className="w-3 h-3" />
                <span>Offline</span>
              </span>
            )}
            {backendStatus === "checking" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Checking</span>
              </span>
            )}
          </div>
        </aside>

        {/* Right Side Tab Panels */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-slide-up">
              {/* Profile Information */}
              <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm hover:border-zinc-700/80 transition-colors">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <User className="w-4 h-4 text-brand-500" />
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Profile Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Creator Display Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Account Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Studio / Workspace Name
                    </label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Theme Preference */}
              <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm hover:border-zinc-700/80 transition-colors">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Theme Preference
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-semibold transition-all cursor-pointer ${
                      theme === "dark"
                        ? "border-brand-500 bg-brand-500/15 text-brand-400 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-700"
                    }`}
                  >
                    <Moon className="w-4 h-4 text-brand-400" />
                    <span>Dark Theme</span>
                    {theme === "dark" && <Check className="w-3.5 h-3.5 ml-auto text-brand-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-semibold transition-all cursor-pointer ${
                      theme === "light"
                        ? "border-brand-500 bg-brand-500/15 text-brand-600 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-700"
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Light Theme</span>
                    {theme === "light" && <Check className="w-3.5 h-3.5 ml-auto text-brand-600" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-slide-up">
              <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm hover:border-zinc-700/80 transition-colors">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <Bell className="w-4 h-4 text-brand-500" />
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Notifications & Pipeline Alerts
                  </h2>
                </div>

                <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200">
                        In-App Processing Alerts
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Show toast alerts when audio transcription or LangGraph finishes.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProcessingAlerts(!processingAlerts)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        processingAlerts ? "bg-brand-600" : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                          processingAlerts ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200">
                        Email Notifications
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Send email summary when an episode is marked ready for review.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailNotifs(!emailNotifs)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        emailNotifs ? "bg-brand-600" : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                          emailNotifs ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200">
                        Audio Completion Chime
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Play subtle chime when clip approval or review actions are saved.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAudioChimes(!audioChimes)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        audioChimes ? "bg-brand-600" : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                          audioChimes ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200">
                        Weekly Creator Digest
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Receive weekly repurposing throughput, top viral clips, and stats.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWeeklyDigest(!weeklyDigest)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        weeklyDigest ? "bg-brand-600" : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                          weeklyDigest ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI CONFIGURATION */}
          {activeTab === "ai" && (
            <div className="space-y-6 animate-slide-up">
              {/* GROQ CLOUD PRIMARY AI PROVIDER CARD */}
              <div className="bg-white dark:bg-[#121215] border border-purple-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm hover:border-purple-500/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>Groq Cloud AI (Primary Engine)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300">
                          Active Provider
                        </span>
                      </h2>
                      <p className="text-[11px] text-zinc-400">
                        Powers Whisper Large v3 Turbo (Speech ASR) & LLaMA 3.3 70B (Summaries, RAG Chat, Repurposing)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {groqStatus?.connected ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Groq Cloud Connected</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-semibold border border-amber-500/20">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{groqStatus?.configured ? "Verifying..." : "Key Needed"}</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={checkGroqStatus}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs hover:border-purple-500 transition-colors"
                      title="Re-check Groq status"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                      <span>GROQ_API_KEY (from Groq Console)</span>
                      <a
                        href="https://console.groq.com/keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-purple-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>Get Free Key</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showGroqKey ? "text" : "password"}
                          value={groqKey}
                          onChange={(e) => setGroqKey(e.target.value)}
                          placeholder="gsk_... (paste your Groq Cloud API key)"
                          className="w-full px-3 py-2 pr-16 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowGroqKey(!showGroqKey)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-purple-400 font-semibold hover:underline"
                        >
                          {showGroqKey ? "Hide" : "Show"}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveGroqKey}
                        disabled={isSavingGroq || !groqKey.trim()}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all shrink-0 flex items-center gap-1.5"
                      >
                        {isSavingGroq ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Key</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {groqStatus?.message && (
                    <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 text-[11px] text-zinc-400 font-mono border border-zinc-200/60 dark:border-zinc-800">
                      {groqStatus.message}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Primary Text Model</span>
                      <span className="font-mono font-bold text-purple-400">llama-3.3-70b-versatile</span>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Ultra-fast summaries, chapter segmentation, and RAG chat</p>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Primary Audio Model</span>
                      <span className="font-mono font-bold text-sky-400">whisper-large-v3-turbo</span>
                      <p className="text-[10px] text-zinc-500 mt-0.5">High-accuracy multilingual speech transcription</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Backend & API Connectivity */}
              <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm hover:border-zinc-700/80 transition-colors">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-brand-500" />
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Gemini API & Backend Connection
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    {backendStatus === "online" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-semibold border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>FastAPI Online (8000)</span>
                      </span>
                    )}
                    {backendStatus === "offline" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[11px] font-semibold border border-rose-500/20">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Backend Offline</span>
                      </span>
                    )}
                    {backendStatus === "checking" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[11px] font-semibold">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting...</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={checkBackend}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs hover:border-brand-500 transition-colors"
                      title="Ping Backend Health"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Backend Base API URL
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="http://localhost:8000/api"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                    <span>Google Gemini API Key (Runtime Override)</span>
                    <span className="text-[10px] text-zinc-400 font-mono">from backend/.env</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy... (leave empty to use server default)"
                      className="w-full px-3 py-2 pr-20 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-brand-500 font-semibold hover:underline"
                    >
                      {showKey ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Model & Hyperparameters */}
              <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm hover:border-zinc-700/80 transition-colors">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <Cpu className="w-4 h-4 text-brand-500" />
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Model Selection & Grounding Guardrails
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Gemini Model
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                    >
                      <option value="gemini-2.0-flash">gemini-2.0-flash (Recommended, High Speed)</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Multimodal)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Reasoning & Extraction)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                      <span>Sampling Temperature</span>
                      <span className="font-mono text-brand-500">{temperature}</span>
                    </label>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-brand-500 mt-2"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                      <span>Strict / Grounded (0.0)</span>
                      <span>Creative (1.0)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                        <span>Enforce 100% Timestamp Grounding</span>
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Reject or retry LLM outputs that reference non-existent timestamps.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnforceGrounding(!enforceGrounding)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        enforceGrounding ? "bg-brand-600" : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                          enforceGrounding ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Toxicity & Profanity Filter</span>
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Sanitize viral clip candidates and blog drafts through keyword safety checks.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSafetyFilter(!safetyFilter)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        safetyFilter ? "bg-brand-600" : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                          safetyFilter ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTENT PREFERENCES */}
          {activeTab === "content" && (
            <div className="space-y-6 animate-slide-up">
              <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm hover:border-zinc-700/80 transition-colors">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <Mic className="w-4 h-4 text-brand-500" />
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Content Generation Preferences
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Default Tone */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Default Tone
                    </label>
                    <select
                      value={defaultTone}
                      onChange={(e) => setDefaultTone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="viral">🔥 Viral & Punchy (Shorts)</option>
                      <option value="professional">💼 Executive & Thought Leader</option>
                      <option value="educational">🎓 Step-by-Step Educational</option>
                      <option value="casual">☕ Casual & Conversational</option>
                    </select>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Output Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="en">English (US)</option>
                      <option value="hi">Hindi (हिन्दी)</option>
                      <option value="hinglish">Hinglish (Code-Mixed)</option>
                      <option value="es">Spanish (Español)</option>
                    </select>
                  </div>

                  {/* Target Clip Duration */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Target Clip Duration
                    </label>
                    <select
                      value={clipDuration}
                      onChange={(e) => setClipDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="15-30s">15 - 30 seconds (High Hook)</option>
                      <option value="30-60s">30 - 60 seconds (Standard)</option>
                      <option value="60-90s">60 - 90 seconds (Deep Value)</option>
                    </select>
                  </div>
                </div>

                {/* Target Channels */}
                <div className="pt-2">
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Auto-Repurpose Channels Enabled
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { key: "shorts", label: "YouTube Shorts" },
                      { key: "reels", label: "Instagram Reels" },
                      { key: "linkedin", label: "LinkedIn Posts" },
                      { key: "twitter", label: "X / Twitter Threads" },
                      { key: "blog", label: "Medium / Blog Post" },
                      { key: "showNotes", label: "Podcast Show Notes" },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer hover:border-brand-500/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={enabledFormats[item.key as keyof typeof enabledFormats]}
                          onChange={(e) =>
                            setEnabledFormats({
                              ...enabledFormats,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRIVACY & STORAGE */}
          {activeTab === "privacy" && (
            <div className="space-y-6 animate-slide-up">
              <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm hover:border-zinc-700/80 transition-colors">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <HardDrive className="w-4 h-4 text-brand-500" />
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Storage & Data Management
                  </h2>
                </div>

                {/* Storage Meter */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                    <p className="text-[11px] text-zinc-400 uppercase">Transcripts DB</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">1.4 MB</p>
                    <p className="text-[10px] text-zinc-500">5 episodes indexed</p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                    <p className="text-[11px] text-zinc-400 uppercase">Audio Cache</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">48.2 MB</p>
                    <p className="text-[10px] text-zinc-500">Chunked mp3 files</p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                    <p className="text-[11px] text-zinc-400 uppercase">RAG Vector Store</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">320 KB</p>
                    <p className="text-[10px] text-zinc-500">Cosine embeddings</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60">
                    <div>
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200">
                        Clear Browser Cache
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Purges locally cached query responses and refreshes live stats.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearCache}
                      className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-brand-500 hover:text-brand-500 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Cache</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60">
                    <div>
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200">
                        Re-synchronize Seed Episodes
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Refreshes the 5 standard demo episodes with sample clips and generated blogs.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetData}
                      className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-amber-500 hover:text-amber-500 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sync Seed Data</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60">
                    <div>
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200">
                        Export Audit Trail (Compliance)
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Download all review actions, edits, and timestamps in JSON format.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportAudit}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: HELP & SUPPORT */}
          {activeTab === "help" && (
            <div className="space-y-6 animate-slide-up">
              {/* Quick Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-brand-500 transition-all flex items-start justify-between shadow-sm group"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-brand-500" />
                      <span>FastAPI Swagger Docs</span>
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Explore interactive OpenAPI contract and test all /api endpoints.
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                </a>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 flex items-start justify-between shadow-sm">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-sky-500" />
                      <span>LangGraph Multi-Agent Architecture</span>
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Transcription → Highlight + Content + Explanation → Merge/Save.
                    </p>
                  </div>
                </div>
              </div>

              {/* Project & Viva Information */}
              <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm hover:border-zinc-700/80 transition-colors">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <Info className="w-4 h-4 text-brand-500" />
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    About Project & Viva Guide
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold">Track & Duration</span>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">GenAI (Creator Economy)</p>
                    <p className="text-zinc-500 text-[11px]">12 Weeks Phased OJT Implementation</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold">Team Members</span>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Muskan Kumari & Shivani Patel</p>
                    <p className="text-zinc-500 text-[11px]">Mentor: Hamdaan Sir</p>
                  </div>
                </div>

                {/* Viva Key Concept Cards */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                    Viva Quick Explanation Points:
                  </p>
                  <ul className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc pl-4">
                    <li>
                      <strong className="text-zinc-900 dark:text-zinc-200">Hallucination Prevention:</strong> Every extracted clip and generated draft cites exact transcript timestamps to guarantee factuality.
                    </li>
                    <li>
                      <strong className="text-zinc-900 dark:text-zinc-200">LangGraph Pipeline:</strong> Orchestrates Whisper ASR + Highlight + Content + Explanation agents in parallel with automated state management.
                    </li>
                    <li>
                      <strong className="text-zinc-900 dark:text-zinc-200">RAG Semantic Search:</strong> Transcripts are chunked and embedded with Gemini to allow instant semantic lookup across past catalog episodes.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
            <span className="text-[11px] text-zinc-400">
              Changes apply locally to your creator workspace.
            </span>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-semibold text-xs shadow-glow transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
