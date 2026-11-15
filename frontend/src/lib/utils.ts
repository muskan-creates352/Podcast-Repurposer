import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Formats seconds (number) into MM:SS or HH:MM:SS format
 * @param seconds e.g. 252.5 -> "04:12"
 */
export function formatSeconds(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(remainingSeconds)}`;
  }
  return `${pad(minutes)}:${pad(remainingSeconds)}`;
}

/**
 * Parses timestamp string like "04:12", "[04:12]", "04:12 - 05:08", "01:23:45" into seconds.
 * Always returns the starting timestamp in seconds.
 */
export function parseTimestampToSeconds(timestamp: string): number {
  if (!timestamp) return 0;

  // Clean brackets and extract first timestamp token
  const cleaned = timestamp.replace(/[\[\]]/g, "").trim();
  const firstPart = cleaned.split(/[-–—]/)[0].trim();

  const parts = firstPart.split(":").map(Number);
  if (parts.some(isNaN)) return 0;

  if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return 0;
}

/**
 * Triggers a browser file download for exported text or markdown.
 */
export function downloadFile(filename: string, content: string, mimeType = "text/plain") {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
