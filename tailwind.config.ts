import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./emails/**/*.tsx"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366f1",
          dark: "#4f46e5",
          light: "#818cf8",
        },
        surface: {
          DEFAULT: "#ffffff",
          dark: "#1e1e2e",
        },
        muted: {
          DEFAULT: "#6b7280",
          light: "#f3f4f6",
          dark: "#374151",
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
