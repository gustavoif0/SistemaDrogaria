import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pharma: {
          50: "#eefdf6",
          100: "#d5f7e6",
          500: "#18a058",
          600: "#11834b",
          700: "#0d693d",
        },
        ink: {
          900: "#17202a",
          700: "#344054",
          500: "#667085",
        },
      },
      boxShadow: {
        soft: "0 8px 24px rgba(16, 24, 40, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
