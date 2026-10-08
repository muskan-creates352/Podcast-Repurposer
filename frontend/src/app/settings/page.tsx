"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { Settings, User, Moon, Sun, Key, Save } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || "Muskan Kumari");
  const [email, setEmail] = useState(user?.email || "muskan@podcastrepurposer.ai");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Settings updated successfully!", "success");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-500" />
          <span>Workspace Settings</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Manage creator profile, UI appearance theme, and API integrations.
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

        {/* API Key Configuration */}
        <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <Key className="w-4 h-4 text-brand-500" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              API & Backend Connection
            </h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Backend REST API Endpoint
            </label>
            <input
              type="text"
              readOnly
              value="http://localhost:8000/api (Configured in lib/api.ts)"
              className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-500 cursor-not-allowed"
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
