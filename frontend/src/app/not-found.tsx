"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Home, ArrowRight } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  // Auto redirect to dashboard after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-zinc-100">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-glow mb-6">
        <Sparkles className="w-8 h-8" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-2">Page Not Found</h1>
      <p className="text-sm text-zinc-400 max-w-md mb-6">
        Aapne jo URL open kiya hai woh exist nahi karta. Hum aapko 2 second mein Dashboard par redirect kar rahe hain...
      </p>

      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow transition-all"
      >
        <Home className="w-4 h-4" />
        <span>Go to Dashboard</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
