"use client";

import { useMemo } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { ACCENT_COLORS } from "@/utils/constants";

export const useTheme = () => {
  const theme = useSettingsStore((s) => s.theme);
  const accentColor = useSettingsStore((s) => s.accentColor);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);
  const setAccentColor = useSettingsStore((s) => s.setAccentColor);

  const isDark = theme === "dark";

  const accent = useMemo(() => {
    return ACCENT_COLORS[accentColor];
  }, [accentColor]);

  // CSS custom properties olarak kullanılacak değerler
  const cssVariables = useMemo(() => {
    return {
      "--accent-primary": accent.primary,
      "--accent-glow": accent.glow,
      "--bg-primary": isDark ? "#040812" : "#f8fafc",
      "--bg-secondary": isDark ? "#0a1020" : "#ffffff",
      "--bg-surface": isDark ? "#0f1729" : "#f1f5f9",
      "--border-color": isDark ? "#1a2744" : "#e2e8f0",
      "--text-primary": isDark ? "#f1f5f9" : "#0f172a",
      "--text-secondary": isDark ? "#94a3b8" : "#64748b",
      "--text-muted": isDark ? "#475569" : "#94a3b8",
    } as Record<string, string>;
  }, [accent, isDark]);

  // Glassmorphism stili
  const glassStyle = useMemo(() => {
    if (isDark) {
      return {
        background: "rgba(10, 16, 32, 0.7)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
      };
    }
    return {
      background: "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(16px)",
      border: "1px solid rgba(0, 0, 0, 0.05)",
    };
  }, [isDark]);

  // Kart stili
  const cardStyle = useMemo(() => {
    if (isDark) {
      return {
        background: "linear-gradient(180deg, rgba(15, 23, 41, 0.8), rgba(10, 16, 32, 0.9))",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
      };
    }
    return {
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      boxShadow: "0 4px 24px rgba(0, 0, 0, 0.05)",
    };
  }, [isDark]);

  // Accent glow stili
  const glowStyle = useMemo(() => {
    return {
      boxShadow: `0 0 20px ${accent.glow}`,
    };
  }, [accent]);

  return {
    theme,
    isDark,
    accent,
    accentColor,
    cssVariables,
    glassStyle,
    cardStyle,
    glowStyle,
    setTheme,
    toggleTheme,
    setAccentColor,
  };
};
