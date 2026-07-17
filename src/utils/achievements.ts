import { Achievement, DailyCompletion, GamificationState, Task } from "@/types";
import { isWeekend, isMorning, isNight } from "./dateUtils";

/**
 * Achievement kontrolcüsü
 * Her görev tamamlandığında veya belirli koşullar oluştuğunda kontrol edilir
 */

export const checkAchievements = (
  state: GamificationState,
  tasks: Task[],
  justCompletedTask?: Task
): Achievement[] => {
  const newlyUnlocked: Achievement[] = [];

  state.achievements.forEach((achievement) => {
    // Zaten açılmışsa atla
    if (achievement.unlockedAt) return;

    const isUnlocked = evaluateRequirement(
      achievement,
      state,
      tasks,
      justCompletedTask
    );

    if (isUnlocked) {
      achievement.unlockedAt = new Date().toISOString();
      newlyUnlocked.push(achievement);
    }
  });

  return newlyUnlocked;
};

const evaluateRequirement = (
  achievement: Achievement,
  state: GamificationState,
  tasks: Task[],
  justCompletedTask?: Task
): boolean => {
  const { requirement } = achievement;
  const completedTasks = tasks.filter((t) => t.status === "completed");

  switch (requirement.type) {
    case "streak_days":
      return state.currentStreak >= requirement.value;

    case "tasks_completed":
      return completedTasks.length >= requirement.value;

    case "tasks_in_timeframe": {
      if (!requirement.timeframeHours) return false;
      const timeframeMs = requirement.timeframeHours * 60 * 60 * 1000;
      const now = Date.now();
      const recentTasks = completedTasks.filter(
        (t) => t.completedAt && now - new Date(t.completedAt).getTime() <= timeframeMs
      );
      return recentTasks.length >= requirement.value;
    }

    case "category_tasks": {
      if (!requirement.categoryId) return false;
      const categoryTasks = completedTasks.filter(
        (t) => t.category === requirement.categoryId
      );
      return categoryTasks.length >= requirement.value;
    }

    case "level_reached":
      return state.level >= requirement.value;

    case "xp_earned":
      return state.totalXpEarned >= requirement.value;

    case "subtasks_completed": {
      const totalSubtasks = completedTasks.reduce(
        (acc, t) => acc + t.subtasks.filter((s) => s.completed).length,
        0
      );
      return totalSubtasks >= requirement.value;
    }

    case "early_completion": {
      const earlyTasks = completedTasks.filter((t) => {
        if (!t.dueDate || !t.completedAt) return false;
        return new Date(t.completedAt) < new Date(t.dueDate);
      });
      return earlyTasks.length >= requirement.value;
    }

    case "weekend_tasks": {
      const weekendTasks = completedTasks.filter((t) => {
        if (!t.completedAt) return false;
        return isWeekend(new Date(t.completedAt));
      });
      return weekendTasks.length >= requirement.value;
    }

    case "morning_tasks": {
      const morningTasks = completedTasks.filter((t) => {
        if (!t.completedAt) return false;
        const hour = new Date(t.completedAt).getHours();
        const startH = requirement.startHour ?? 6;
        const endH = requirement.endHour ?? 8;
        return hour >= startH && hour < endH;
      });
      return morningTasks.length >= requirement.value;
    }

    case "night_tasks": {
      const nightTasks = completedTasks.filter((t) => {
        if (!t.completedAt) return false;
        return isNight(new Date(t.completedAt).getHours());
      });
      return nightTasks.length >= requirement.value;
    }

    case "perfect_week": {
      // Son N hafta boyunca her gün en az 1 görev tamamlanmış mı
      const perfectWeeks = countPerfectWeeks(state.completionHistory);
      return perfectWeeks >= requirement.value;
    }

    default:
      return false;
  }
};

const countPerfectWeeks = (history: DailyCompletion[]): number => {
  if (history.length < 7) return 0;

  let perfectWeeks = 0;
  let consecutiveDays = 0;

  // Son 365 günü kontrol et
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (let i = 0; i < sortedHistory.length; i++) {
    if (sortedHistory[i].tasksCompleted > 0) {
      consecutiveDays++;
      if (consecutiveDays >= 7) {
        perfectWeeks++;
        consecutiveDays = 0;
      }
    } else {
      consecutiveDays = 0;
    }
  }

  return perfectWeeks;
};

export const getAchievementProgress = (
  achievement: Achievement,
  state: GamificationState,
  tasks: Task[]
): number => {
  const { requirement } = achievement;
  const completedTasks = tasks.filter((t) => t.status === "completed");

  switch (requirement.type) {
    case "streak_days":
      return Math.min((state.currentStreak / requirement.value) * 100, 100);

    case "tasks_completed":
      return Math.min((completedTasks.length / requirement.value) * 100, 100);

    case "level_reached":
      return Math.min((state.level / requirement.value) * 100, 100);

    case "xp_earned":
      return Math.min((state.totalXpEarned / requirement.value) * 100, 100);

    case "subtasks_completed": {
      const total = completedTasks.reduce(
        (acc, t) => acc + t.subtasks.filter((s) => s.completed).length,
        0
      );
      return Math.min((total / requirement.value) * 100, 100);
    }

    case "weekend_tasks": {
      const count = completedTasks.filter(
        (t) => t.completedAt && isWeekend(new Date(t.completedAt))
      ).length;
      return Math.min((count / requirement.value) * 100, 100);
    }

    case "morning_tasks": {
      const count = completedTasks.filter((t) => {
        if (!t.completedAt) return false;
        const h = new Date(t.completedAt).getHours();
        return h >= (requirement.startHour ?? 6) && h < (requirement.endHour ?? 8);
      }).length;
      return Math.min((count / requirement.value) * 100, 100);
    }

    default:
      return 0;
  }
};
