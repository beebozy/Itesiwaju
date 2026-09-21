import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B1120",
        surface: "#111827",
        "surface-border": "#1F2937",
        primary: {
          DEFAULT: "#10B981",
          hover: "#059669",
          muted: "rgba(16, 185, 129, 0.15)",
        },
        accent: {
          blue: "#3B82F6",
          amber: "#F59E0B",
          purple: "#8B5CF6",
          red: "#EF4444",
        },
      },
    },
  },
  plugins: [],
};
export default config;
