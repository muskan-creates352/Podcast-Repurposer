import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        saas: {
          bg: "#0B0D12",
          surface: "#141821",
          card: "#171C26",
          cardHover: "#1C2230",
          border: "rgba(255, 255, 255, 0.07)",
          borderHover: "rgba(139, 92, 246, 0.35)",
          violet: "#8B5CF6",
          cyan: "#22D3EE",
          text: "#F5F7FA",
          muted: "#9CA3AF",
        },
        zinc: {
          700: "#333B4F",
          750: "#272E3F",
          800: "#1F2533",
          850: "#171C26",
          900: "#141821",
          950: "#0B0D12",
        },
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.25)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.3)",
        cardHover: "0 12px 32px -8px rgba(0, 0, 0, 0.6), 0 0 20px -2px rgba(139, 92, 246, 0.18)",
        glow: "0 0 24px -2px rgba(139, 92, 246, 0.35)",
        glowCyan: "0 0 24px -2px rgba(34, 211, 238, 0.35)",
        glowSm: "0 0 12px -1px rgba(139, 92, 246, 0.25)",
      },
      keyframes: {
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "pulse-subtle": "pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
