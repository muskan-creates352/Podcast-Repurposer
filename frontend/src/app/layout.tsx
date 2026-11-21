import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { AppLayout } from "@/components/layout/AppLayout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Podcast Repurposer | GenAI Creator Studio",
  description:
    "Convert long-form podcasts into highlight clips, SEO blog posts, social threads, and show notes with multi-agent orchestration and human-in-the-loop review.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${geistSans.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-[#0B0D12] text-[#F5F7FA] font-sans selection:bg-violet-500/30 selection:text-white">
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
