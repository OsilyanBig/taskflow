"use client";

import { create } from "zustand";
import { GamificationState, Achievement, DailyCompletion, Task } from "@/types";
import { STORAGE_KEYS } from "@/utils/constants";
import { DEFAULT_ACHIEVEMENTS } from "@/data/achievements";
import { calculateTaskXP, calculateLevelFromXP, calculatePenaltyXP } from "@/utils/xpCalculator";
import { checkAchievements } from "@/utils/achievements";
import { toDateString } from "@/utils/dateUtils";
import { format } from "date-fns";

interface GamificationStore extends GamificationState {
  isLoaded: boolean;

  // XP
  awardXP: (task: Task, allTasks: Task[]) => { xpEarned: number; leveledUp: boolean; newLevel: number; newAchievements: Achievement[] };
  penalizeXP: (task: Task) => number;

  // Streak
  updateStreak: () => void;

  // History
  recordCompletion: (task: Task) => void;
  getTodayCompletion: () => DailyCompletion | undefined;

  // Achievement
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];

  // Persistence
  loadGamification: () => void;
  saveGamification: () => void;

  // Reset
  resetGamification: () => void;

  // Export/Import
  exportGamification: () => string;
  importGamification: (json: string) => boolean;
}

const initialState: GamificationState = {
  xp: 0,
  level: 1,
  xpToNextLevel: 100,
  totalXpEarned: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  achievements: [...DEFAULT_ACHIEVEMENTS],
  completionHistory: [],
  penaltyEnabled: false,
};

export const useGamificationStore = create<GamificationStore>((set, get) => ({
  ...initialState,
  isLoaded: false,

  // ============================================
  // XP SYSTEM
  // ============================================

  awardXP: (task, allTasks) => {
    const state = get();
    const xpEarned = calculateTaskXP(task, state.currentStreak);

    const newTotalXp = state.totalXpEarned + xpEarned;
    const { level: newLevel, xpToNextLevel } = calculateLevelFromXP(newTotalXp);
    const leveledUp = newLevel > state.level;

    // Achievement kontrolü
    const tempState: GamificationState = {
      ...state,
      xp: state.xp + xpEarned,
      level: newLevel,
      totalXpEarned: newTotalXp,
    };

    const newAchievements = checkAchievements(
      { ...tempState, achievements: [...state.achievements] },
      allTasks,
      task
    );

    // Achievement XP bonus
    const achievementXp = newAchievements.reduce((sum, a) => sum + a.xpReward, 0);
    const finalTotalXp = newTotalXp + achievementXp;
    const finalLevel = calculateLevelFromXP(finalTotalXp);

    set((s) => {
      const updatedAchievements = s.achievements.map((a) => {
        const unlocked = newAchievements.find((na) => na.id === a.id);
        return unlocked ? { ...a, unlockedAt: unlocked.unlockedAt } : a;
      });

      const newState = {
        xp: s.xp + xpEarned + achievementXp,
        level: finalLevel.level,
        xpToNextLevel: finalLevel.xpToNextLevel,
        totalXpEarned: finalTotalXp,
        achievements: updatedAchievements,
      };

      saveGamificationToStorage({ ...s, ...newState });
      return newState;
    });

    return {
      xpEarned: xpEarned + achievementXp,
      leveledUp: finalLevel.level > state.level,
      newLevel: finalLevel.level,
      newAchievements,
    };
  },

  penalizeXP: (task) => {
    const state = get();
    if (!state.penaltyEnabled) return 0;

    const penalty = calculatePenaltyXP(task);
    const newXp = Math.max(0, state.xp - penalty);

    set((s) => {
      const newState = { xp: newXp };
      saveGamificationToStorage({ ...s, ...newState });
      return newState;
    });

    return penalty;
  },

  // ============================================
  // STREAK SYSTEM
  // ============================================

  updateStreak: () => {
    const state = get();
    const today = toDateString(new Date());
    const yesterday = toDateString(new Date(Date.now() - 86400000));

    let newStreak = state.currentStreak;

    if (state.lastActiveDate === today) {
      // Bugün zaten aktif
      return;
    } else if (state.lastActiveDate === yesterday) {
      // Dün aktifti, streak devam
      newStreak += 1;
    } else if (state.lastActiveDate === null) {
      // İlk kez
      newStreak = 1;
    } else {
      // Streak kırıldı
      newStreak = 1;
    }

    const newLongest = Math.max(newStreak, state.longestStreak);

    set((s) => {
      const newState = {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: today,
      };
      saveGamificationToStorage({ ...s, ...newState });
      return newState;
    });
  },

  // ============================================
  // COMPLETION HISTORY
  // ============================================

  recordCompletion: (task) => {
    const today = toDateString(new Date());
    const currentTime = format(new Date(), "HH:mm");

    set((state) => {
      const existingIndex = state.completionHistory.findIndex(
        (h) => h.date === today
      );

      let updatedHistory: DailyCompletion[];

      if (existingIndex !== -1) {
        updatedHistory = state.completionHistory.map((h, i) => {
          if (i !== existingIndex) return h;
          const categories = { ...h.categories };
          categories[task.category] = (categories[task.category] || 0) + 1;
          return {
            ...h,
            tasksCompleted: h.tasksCompleted + 1,
            xpEarned: h.xpEarned + task.xpEarned,
            categories,
            completionTimes: [...h.completionTimes, currentTime],
          };
        });
      } else {
        const newEntry: DailyCompletion = {
          date: today,
          tasksCompleted: 1,
          totalTasks: 0,
          xpEarned: task.xpEarned,
          categories: { [task.category]: 1 },
          completionTimes: [currentTime],
        };
        updatedHistory = [...state.completionHistory, newEntry];
      }

      // Son 365 günü tut sadece
      if (updatedHistory.length > 365) {
        updatedHistory = updatedHistory.slice(-365);
      }

      saveGamificationToStorage({ ...state, completionHistory: updatedHistory });
      return { completionHistory: updatedHistory };
    });
  },

  getTodayCompletion: () => {
    const today = toDateString(new Date());
    return get().completionHistory.find((h) => h.date === today);
  },

  // ============================================
  // ACHIEVEMENTS
  // ============================================

  getUnlockedAchievements: () => {
    return get().achievements.filter((a) => a.unlockedAt !== null);
  },

  getLockedAchievements: () => {
    return get().achievements.filter((a) => a.unlockedAt === null && !a.isSecret);
  },

  // ============================================
  // PERSISTENCE
  // ============================================

  loadGamification: () => {
    try {
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(STORAGE_KEYS.GAMIFICATION);
        if (stored) {
          const parsed = JSON.parse(stored) as GamificationState;
          // Yeni achievement'ları ekle (güncelleme sonrası)
          const mergedAchievements = DEFAULT_ACHIEVEMENTS.map((defaultAch) => {
            const existing = parsed.achievements?.find((a) => a.id === defaultAch.id);
            return existing || defaultAch;
          });
          set({
            ...parsed,
            achievements: mergedAchievements,
            isLoaded: true,
          });
        } else {
          set({ isLoaded: true });
        }
      }
    } catch (error) {
      console.error("Error loading gamification:", error);
      set({ isLoaded: true });
    }
  },

  saveGamification: () => {
    const state = get();
    saveGamificationToStorage(state);
  },

  // ============================================
  // RESET
  // ============================================

  resetGamification: () => {
    set({ ...initialState });
    saveGamificationToStorage(initialState);
  },

  // ============================================
  // EXPORT / IMPORT
  // ============================================

  exportGamification: () => {
    const { isLoaded, ...state } = get();
    return JSON.stringify(state, null, 2);
  },

  importGamification: (json) => {
    try {
      const imported = JSON.parse(json);
      set({ ...imported, isLoaded: true });
      saveGamificationToStorage(imported);
      return true;
    } catch {
      return false;
    }
  },
}));

function saveGamificationToStorage(state: Partial<GamificationState>) {
  try {
    if (typeof window !== "undefined") {
      const current = window.localStorage.getItem(STORAGE_KEYS.GAMIFICATION);
      const existing = current ? JSON.parse(current) : {};
      window.localStorage.setItem(
        STORAGE_KEYS.GAMIFICATION,
        JSON.stringify({ ...existing, ...state })
      );
    }
  } catch (error) {
    console.error("Error saving gamification:", error);
  }
}
