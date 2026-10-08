/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        page: "#F8F9FB",
        card: "#FFFFFF",
        border: {
          DEFAULT: "#E5E7EB",
          medium: "#D1D5DB",
        },
        ink: {
          primary: "#0F172A",
          secondary: "#475569",
          muted: "#94A3B8",
        },
        navy: {
          DEFAULT: "#1E3A5F",
          deep: "#0F2942",
        },
        mint: {
          DEFAULT: "#22C55E",
          light: "#4ADE80",
        },
        amber: {
          DEFAULT: "#F59E0B",
        },
        danger: {
          DEFAULT: "#DC2626",
          light: "#EF4444",
        },
        chain: {
          bg: "#DBEAFE",
          text: "#1E40AF",
        },
        certificate: {
          bg: "#FEF9E7",
          gold: "#D4AF37",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Playfair Display", "serif"],
        mono: ["JetBrains Mono", "SF Mono", "monospace"],
      },
      borderRadius: {
        xl: "12px",
        lg: "8px",
      },
      keyframes: {
        "pulse-live": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.3)" },
        },
      },
      animation: {
        "pulse-live": "pulse-live 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
