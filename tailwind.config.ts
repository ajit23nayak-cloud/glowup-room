import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FAF7F2",
        ink: { DEFAULT: "#1A1A1A", dim: "#4A4A4A", muted: "#7A7A7A", soft: "#B8B2A7" },
        accent: { DEFAULT: "#E11D48", warm: "#F59E0B" },
        card: "#FFFFFF",
        border: "#E8E1D4",
      },
      fontFamily: {
        serif: ["'Instrument Serif'", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      maxWidth: { content: "960px" },
    },
  },
  plugins: [],
};
export default config;
