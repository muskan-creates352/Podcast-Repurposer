"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { Settings, User, Moon, Sun, Key, Save, CheckCircle2, AlertCircle, RefreshCw, Cpu } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || "Shivani Patel");
  const [email, setEmail] = useState(user?.email || "shivani@podcastrepurposer.ai");
  const [geminiKey, setGeminiKey] = useState("");
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

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

  useEffect(() => {
    checkBackend();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Settings and workspace preferences saved!", "success");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-500" />
          <span>Workspace Settings</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Manage creator profile, UI appearance theme, and FastAPI & Gemini API integrations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Details */}
        <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <User className="w-4 h-4 text-brand-500" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Profile Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Display Name
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
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Theme Preference */}
        <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Theme Preference
          </h2>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                theme === "dark"
                  ? "border-brand-500 bg-brand-500/10 text-brand-400 font-semibold shadow-subtle"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Dark Theme</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                theme === "light"
                  ? "border-brand-500 bg-brand-500/10 text-brand-600 font-semibold shadow-subtle"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300"
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Light Theme</span>
            </button>
          </div>
        </div>

        {/* API & Backend Connection */}
        <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-brand-500" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                API & Backend Connection
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
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs"
                title="Test backend connection"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Backend REST API Endpoint
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
              <span>Google Gemini API Key (Optional Override)</span>
              <span className="text-[10px] text-zinc-500 font-normal">Configured in backend/.env</span>
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy... (leave blank to use backend .env)"
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-glow transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
