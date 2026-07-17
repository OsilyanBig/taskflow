"use client";

import { useCallback } from "react";
import { useGamificationStore } from "@/stores/gamificationStore";
import { useTaskStore } from "@/stores/taskStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { Task, Achievement } from "@/types";
import { LEVELS } from "@/utils/constants";
import { calculateLevelFromXP } from "@/utils/xpCalculator";

interface CompleteTaskResult {
  xpEarned: number;
  leveledUp: boolean;
  newLevel: number;
  newAchievements: Achievement[];
  task: Task;
}

export const useGamification = () => {
  const gamification = useGamificationStore();
  const tasks = useTaskStore((s) => s.tasks);
  const completeTaskInStore = useTaskStore((s) => s.completeTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const penaltyEnabled = useSettingsStore((s) => s.penaltyEnabled);

  // Görev tamamlama + XP + Achievement + Streak
  const completeTaskWithRewards = useCallback(
    (taskId: string): CompleteTaskResult | null => {
      // Görevi tamamla
      const completedTask = completeTaskInStore(taskId);
      if (!completedTask) return null;

      // Streak güncelle
      gamification.updateStreak();

      // XP ver ve achievement kontrol et
      const result = gamification.awardXP(completedTask, tasks);

      // Task'a kazanılan XP'yi kaydet
      updateTask(taskId, { xpEarned: result.xpEarned });

      // Completion history'ye kaydet
      gamification.recordCompletion({
        ...completedTask,
        xpEarned: result.xpEarned,
      });

      return {
        ...result,
        task: completedTask,
      };
    },
    [completeTaskInStore, gamification, tasks, updateTask]
  );

  // Ceza uygula (gecikmiş görevler için)
  const applyPenalty = useCallback(
    (task: Task): number => {
      if (!penaltyEnabled) return 0;
      return gamification.penalizeXP(task);
    },
    [gamification, penaltyEnabled]
  );

  // Mevcut level bilgisi
  const currentLevelInfo = LEVELS.find((l) => l.level === gamification.level) || LEVELS[0];
  const nextLevelInfo = LEVELS.find((l) => l.level === gamification.level + 1);

  // XP progress
  const { currentLevelXp, xpToNextLevel, progress } = calculateLevelFromXP(
    gamification.totalXpEarned
  );

  // Achievement istatistikleri
  const achievementStats = {
    total: gamification.achievements.length,
    unlocked: gamification.achievements.filter((a) => a.unlockedAt).length,
    locked: gamification.achievements.filter((a) => !a.unlockedAt && !a.isSecret).length,
    secret: gamification.achievements.filter((a) => a.isSecret && !a.unlockedAt).length,
    secretUnlocked: gamification.achievements.filter((a) => a.isSecret && a.unlockedAt).length,
  };

  // Streak bilgisi
  const streakInfo = {
    current: gamification.currentStreak,
    longest: gamification.longestStreak,
    isActive: gamification.lastActiveDate === new Date().toISOString().split("T")[0],
    streakBonus: Math.min(gamification.currentStreak * 0.1, 2),
    streakBonusPercent: Math.min(gamification.currentStreak * 10, 200),
  };

  return {
    // State
    xp: gamification.xp,
    level: gamification.level,
    totalXpEarned: gamification.totalXpEarned,
    currentLevelXp,
    xpToNextLevel,
    xpProgress: progress,
    currentLevelInfo,
    nextLevelInfo,
    achievements: gamification.achievements,
    completionHistory: gamification.completionHistory,
    achievementStats,
    streakInfo,

    // Actions
    completeTaskWithRewards,
    applyPenalty,
    updateStreak: gamification.updateStreak,
    getUnlockedAchievements: gamification.getUnlockedAchievements,
    getLockedAchievements: gamification.getLockedAchievements,
    getTodayCompletion: gamification.getTodayCompletion,
  };
};
