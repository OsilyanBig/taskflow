import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef2ff",
          100: "#dce4ff",
          200: "#b9c8ff",
          300: "#8ba3ff",
          400: "#5c7cff",
          500: "#3b5bdb",
          600: "#2a45b2",
          700: "#1e3489",
          800: "#142560",
          900: "#0c1a42",
          950: "#060e24",
        },
        deep: {
          bg: "#040812",
          card: "#0a1020",
          surface: "#0f1729",
          border: "#1a2744",
          hover: "#162035",
        },
        accent: {
          blue: "#3b82f6",
          cyan: "#22d3ee",
          purple: "#8b5cf6",
          pink: "#ec4899",
          green: "#10b981",
          yellow: "#f59e0b",
          orange: "#f97316",
          red: "#ef4444",
        },
        glow: {
          blue: "rgba(59, 130, 246, 0.15)",
          cyan: "rgba(34, 211, 238, 0.15)",
          purple: "rgba(139, 92, 246, 0.15)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Cal Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(59, 130, 246, 0.3)",
        "glow-lg": "0 0 40px rgba(59, 130, 246, 0.4)",
        "glow-cyan": "0 0 20px rgba(34, 211, 238, 0.3)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.3)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.3)",
        "glass-lg": "0 16px 64px rgba(0, 0, 0, 0.4)",
        card: "0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "blue-gradient": "linear-gradient(135deg, #3b82f6, #60a5fa)",
        "cyan-gradient": "linear-gradient(135deg, #22d3ee, #3b82f6)",
        "purple-gradient": "linear-gradient(135deg, #8b5cf6, #3b82f6)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
        "card-gradient": "linear-gradient(180deg, rgba(15, 23, 41, 0.8), rgba(10, 16, 32, 0.9))",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "shake": "shake 0.5s ease-in-out",
        "confetti": "confetti 1s ease-out forwards",
        "streak-fire": "streakFire 1.5s ease-in-out infinite",
        "xp-fill": "xpFill 1s ease-out",
        "bounce-in": "bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "spin-slow": "spin 3s linear infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(59, 130, 246, 0.5)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
        streakFire: {
          "0%, 100%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(1.3)" },
        },
        xpFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--xp-width)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
