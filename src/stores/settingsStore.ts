"use client";

import { create } from "zustand";
import { Settings, AccentColor, Category, Tag } from "@/types";
import { STORAGE_KEYS, DEFAULT_CATEGORIES } from "@/utils/constants";

interface SettingsStore extends Settings {
  isLoaded: boolean;

  // Theme
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;
  setAccentColor: (color: AccentColor) => void;

  // Sound & Haptic
  toggleSound: () => void;
  toggleHaptic: () => void;

  // Penalty
  togglePenalty: () => void;
  setPenaltyXpLoss: (value: number) => void;

  // Goals
  setWeeklyGoal: (value: number) => void;
  setDailyGoal: (value: number) => void;

  // UI
  toggleMotivationalQuotes: () => void;
  toggleCompactMode: () => void;

  // Categories
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Tags
  addTag: (tag: Tag) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;

  // Persistence
  loadSettings: () => void;
  saveSettings: () => void;

  // Export/Import
  exportSettings: () => string;
  importSettings: (json: string) => boolean;

  // Reset
  resetSettings: () => void;
}

const initialSettings: Settings = {
  theme: "dark",
  accentColor: "blue",
  soundEnabled: true,
  hapticEnabled: true,
  penaltyEnabled: false,
  penaltyXpLoss: 15,
  weeklyGoal: 20,
  dailyGoal: 5,
  showMotivationalQuotes: true,
  compactMode: false,
  categories: DEFAULT_CATEGORIES,
  tags: [
    { id: "tag_urgent", name: "acil", color: "#ef4444" },
    { id: "tag_important", name: "önemli", color: "#f59e0b" },
    { id: "tag_easy", name: "kolay", color: "#10b981" },
    { id: "tag_creative", name: "yaratıcı", color: "#8b5cf6" },
    { id: "tag_meeting", name: "toplantı", color: "#3b82f6" },
    { id: "tag_review", name: "gözden geçir", color: "#ec4899" },
  ],
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...initialSettings,
  isLoaded: false,

  // ============================================
  // THEME
  // ============================================

  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.classList.toggle("light", theme === "light");
    }
    saveSettingsToStorage(get());
  },

  toggleTheme: () => {
    const newTheme = get().theme === "dark" ? "light" : "dark";
    get().setTheme(newTheme);
  },

  setAccentColor: (color) => {
    set({ accentColor: color });
    saveSettingsToStorage(get());
  },

  // ============================================
  // SOUND & HAPTIC
  // ============================================

  toggleSound: () => {
    set((s) => ({ soundEnabled: !s.soundEnabled }));
    saveSettingsToStorage(get());
  },

  toggleHaptic: () => {
    set((s) => ({ hapticEnabled: !s.hapticEnabled }));
    saveSettingsToStorage(get());
  },

  // ============================================
  // PENALTY
  // ============================================

  togglePenalty: () => {
    set((s) => ({ penaltyEnabled: !s.penaltyEnabled }));
    saveSettingsToStorage(get());
  },

  setPenaltyXpLoss: (value) => {
    set({ penaltyXpLoss: value });
    saveSettingsToStorage(get());
  },

  // ============================================
  // GOALS
  // ============================================

  setWeeklyGoal: (value) => {
    set({ weeklyGoal: Math.max(1, value) });
    saveSettingsToStorage(get());
  },

  setDailyGoal: (value) => {
    set({ dailyGoal: Math.max(1, value) });
    saveSettingsToStorage(get());
  },

  // ============================================
  // UI
  // ============================================

  toggleMotivationalQuotes: () => {
    set((s) => ({ showMotivationalQuotes: !s.showMotivationalQuotes }));
    saveSettingsToStorage(get());
  },

  toggleCompactMode: () => {
    set((s) => ({ compactMode: !s.compactMode }));
    saveSettingsToStorage(get());
  },

  // ============================================
  // CATEGORIES
  // ============================================

  addCategory: (category) => {
    set((s) => ({
      categories: [...s.categories, category],
    }));
    saveSettingsToStorage(get());
  },

  updateCategory: (id, updates) => {
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
    saveSettingsToStorage(get());
  },

  deleteCategory: (id) => {
    set((s) => ({
      categories: s.categories.filter((c) => c.id !== id),
    }));
    saveSettingsToStorage(get());
  },

  // ============================================
  // TAGS
  // ============================================

  addTag: (tag) => {
    set((s) => ({
      tags: [...s.tags, tag],
    }));
    saveSettingsToStorage(get());
  },

  updateTag: (id, updates) => {
    set((s) => ({
      tags: s.tags.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    saveSettingsToStorage(get());
  },

  deleteTag: (id) => {
    set((s) => ({
      tags: s.tags.filter((t) => t.id !== id),
    }));
    saveSettingsToStorage(get());
  },

  // ============================================
  // PERSISTENCE
  // ============================================

  loadSettings: () => {
    try {
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (stored) {
          const parsed = JSON.parse(stored) as Settings;
          // Yeni kategorileri merge et
          const mergedCategories = DEFAULT_CATEGORIES.map((defaultCat) => {
            const existing = parsed.categories?.find((c) => c.id === defaultCat.id);
            return existing || defaultCat;
          });
          // Kullanıcının eklediği özel kategorileri de ekle
          const customCategories = (parsed.categories || []).filter(
            (c) => !DEFAULT_CATEGORIES.some((dc) => dc.id === c.id)
          );

          set({
            ...parsed,
            categories: [...mergedCategories, ...customCategories],
            isLoaded: true,
          });

          // Temayı uygula
          document.documentElement.classList.toggle("dark", parsed.theme === "dark");
          document.documentElement.classList.toggle("light", parsed.theme === "light");
        } else {
          set({ isLoaded: true });
          document.documentElement.classList.add("dark");
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      set({ isLoaded: true });
    }
  },

  saveSettings: () => {
    saveSettingsToStorage(get());
  },

  // ============================================
  // EXPORT / IMPORT
  // ============================================

  exportSettings: () => {
    const { isLoaded, ...settings } = get();
    return JSON.stringify(settings, null, 2);
  },

  importSettings: (json) => {
    try {
      const imported = JSON.parse(json) as Settings;
      set({ ...imported, isLoaded: true });
      saveSettingsToStorage(imported);
      return true;
    } catch {
      return false;
    }
  },

  // ============================================
  // RESET
  // ============================================

  resetSettings: () => {
    set({ ...initialSettings });
    saveSettingsToStorage(initialSettings);
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  },
}));

function saveSettingsToStorage(state: Partial<Settings>) {
  try {
    if (typeof window !== "undefined") {
      const { ...settings } = state;
      window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}
