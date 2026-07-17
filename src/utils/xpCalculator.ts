import { Task, Priority } from "@/types";
import {
  PRIORITY_CONFIG,
  XP_BASE,
  STREAK_BONUS_MULTIPLIER,
  MAX_STREAK_BONUS,
} from "./constants";

/**
 * XP Formülü:
 * Base XP = 10
 * Priority Multiplier: Critical=3x, High=2x, Medium=1.5x, Low=1x
 * Time Bonus: estimatedMinutes / 10 (her 10 dakika = +1 XP)
 * Subtask Bonus: completedSubtasks * 2
 * Streak Bonus: streak * 10% (max 2x)
 * Early Completion Bonus: Eğer due date'ten önce tamamlandıysa +20%
 */

export const calculateTaskXP = (
  task: Task,
  currentStreak: number = 0
): number => {
  const priorityMultiplier = PRIORITY_CONFIG[task.priority].xpMultiplier;

  // Base XP with priority
  let xp = XP_BASE * priorityMultiplier;

  // Time bonus: her 10 dakika +1 XP
  if (task.estimatedMinutes > 0) {
    xp += Math.floor(task.estimatedMinutes / 10);
  }

  // Subtask bonus: tamamlanan her alt görev +2 XP
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  xp += completedSubtasks * 2;

  // Streak bonus
  const streakBonus = Math.min(
    currentStreak * STREAK_BONUS_MULTIPLIER,
    MAX_STREAK_BONUS
  );
  xp *= 1 + streakBonus;

  // Early completion bonus
  if (task.dueDate && task.completedAt) {
    const dueDate = new Date(task.dueDate);
    const completedDate = new Date(task.completedAt);
    if (completedDate < dueDate) {
      xp *= 1.2; // %20 bonus
    }
  }

  return Math.round(xp);
};

export const calculateLevelFromXP = (
  totalXp: number
): { level: number; currentLevelXp: number; xpToNextLevel: number; progress: number } => {
  // Her level için gereken XP artarak gider
  // Level 1: 0-100, Level 2: 100-250, Level 3: 250-500, ...
  const levelThresholds = [
    0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 4700,
    6200, 8000, 10000, 13000, 17000,
  ];

  let level = 1;
  for (let i = 1; i < levelThresholds.length; i++) {
    if (totalXp >= levelThresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  // Max level kontrolü
  if (level > 15) level = 15;

  const currentThreshold = levelThresholds[level - 1] || 0;
  const nextThreshold =
    level < 15
      ? levelThresholds[level] || currentThreshold + 5000
      : currentThreshold + 5000;

  const currentLevelXp = totalXp - currentThreshold;
  const xpToNextLevel = nextThreshold - currentThreshold;
  const progress = Math.min((currentLevelXp / xpToNextLevel) * 100, 100);

  return { level, currentLevelXp, xpToNextLevel, progress };
};

export const calculatePenaltyXP = (
  task: Task,
  penaltyBase: number = 15
): number => {
  // Kritik görevler daha fazla ceza alır
  const multiplier = PRIORITY_CONFIG[task.priority].xpMultiplier;
  return Math.round(penaltyBase * multiplier * 0.5);
};

export const getXPBreakdown = (
  task: Task,
  currentStreak: number = 0
): {
  base: number;
  priorityBonus: number;
  timeBonus: number;
  subtaskBonus: number;
  streakBonus: number;
  earlyBonus: number;
  total: number;
} => {
  const priorityMultiplier = PRIORITY_CONFIG[task.priority].xpMultiplier;
  const base = XP_BASE;
  const priorityBonus = Math.round(XP_BASE * (priorityMultiplier - 1));
  const timeBonus = task.estimatedMinutes > 0 ? Math.floor(task.estimatedMinutes / 10) : 0;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const subtaskBonus = completedSubtasks * 2;

  const subtotal = base + priorityBonus + timeBonus + subtaskBonus;

  const streakMultiplier = Math.min(
    currentStreak * STREAK_BONUS_MULTIPLIER,
    MAX_STREAK_BONUS
  );
  const streakBonus = Math.round(subtotal * streakMultiplier);

  let earlyBonus = 0;
  if (task.dueDate && task.completedAt) {
    const dueDate = new Date(task.dueDate);
    const completedDate = new Date(task.completedAt);
    if (completedDate < dueDate) {
      earlyBonus = Math.round((subtotal + streakBonus) * 0.2);
    }
  }

  const total = subtotal + streakBonus + earlyBonus;

  return { base, priorityBonus, timeBonus, subtaskBonus, streakBonus, earlyBonus, total };
};
