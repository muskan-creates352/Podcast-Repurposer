import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { AppLayout } from "@/components/layout/AppLayout";

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
