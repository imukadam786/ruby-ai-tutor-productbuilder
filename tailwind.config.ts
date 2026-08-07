import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#FF6B35",
          600: "#ea580c",
          700: "#c2410c",
          900: "#7c2d12",
        },
        // ── Concept C gem tokens (see lib/design/gemColors.ts) ──
        ruby: {
          DEFAULT: "#E11D48",
          bright: "#FF2D63",
          deep: "#B3123C",
          soft: "#FFF1F4",
        },
        gem: {
          gold: "#FFB323",
          rough: "#D8C7D0",
        },
        answer: {
          a: "#FF5D73",
          b: "#FFB323",
          c: "#12C99B",
          d: "#2EA6FF",
        },
      },
      boxShadow: {
        // The chunky, pressable "lip" under buttons/nodes (Concept C). Colour is
        // set per-element with an inline value where a matching lip is needed.
        lip: "0 4px 0 0 rgba(0,0,0,0.16)",
        "lip-sm": "0 3px 0 0 rgba(0,0,0,0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
