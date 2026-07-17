"use client";

import { useMemo } from "react";
import { useGamificationStore } from "@/stores/gamificationStore";
import { useTaskStore } from "@/stores/taskStore";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  WeeklyStats,
  ProductivityInsight,
  HeatmapData,
  PredictionData,
} from "@/types";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  subWeeks,
  format,
  parseISO,
  isSameDay,
  subDays,
} from "date-fns";
import { DAY_NAMES_SHORT } from "@/utils/constants";
import {
  generatePrediction,
  getMostProductiveHours,
  getMostProductiveDays,
  getWeeklyComparison,
} from "@/utils/predictions";

export const useStats = () => {
  const tasks = useTaskStore((s) => s.tasks);
  const completionHistory = useGamificationStore((s) => s.completionHistory);
  const currentStreak = useGamificationStore((s) => s.currentStreak);
  const longestStreak = useGamificationStore((s) => s.longestStreak);
  const weeklyGoal = useSettingsStore((s) => s.weeklyGoal);

  // ============================================
  // WEEKLY STATS
  // ============================================
  const weeklyStats = useMemo((): WeeklyStats => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const prevWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const prevWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    const dayStats = days.map((day, index) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const historyEntry = completionHistory.find((h) => h.date === dateStr);

      const dayTasks = tasks.filter((t) => {
        if (t.completedAt && isSameDay(parseISO(t.completedAt), day)) return true;
        if (t.dueDate && isSameDay(parseISO(t.dueDate), day)) return true;
        return false;
      });

      const completed = dayTasks.filter((t) => t.status === "completed").length;

      return {
        date: dateStr,
        dayName: DAY_NAMES_SHORT[(index + 1) % 7], // Pazartesi'den başla
        completed: historyEntry?.tasksCompleted || completed,
        total: dayTasks.length,
        xp: historyEntry?.xpEarned || 0,
      };
    });

    const totalCompleted = dayStats.reduce((sum, d) => sum + d.completed, 0);
    const totalXp = dayStats.reduce((sum, d) => sum + d.xp, 0);

    // Geçen hafta karşılaştırması
    const comparison = getWeeklyComparison(completionHistory);

    return {
      weekStart: format(weekStart, "yyyy-MM-dd"),
      days: dayStats,
      totalCompleted,
      totalXp,
      completionRate:
        weeklyGoal > 0 ? Math.round((totalCompleted / weeklyGoal) * 100) : 0,
      comparisonToPrevWeek: comparison,
    };
  }, [tasks, completionHistory, weeklyGoal]);

  // ============================================
  // HEATMAP DATA (365 gün)
  // ============================================
  const heatmapData = useMemo((): HeatmapData[] => {
    const today = new Date();
    const yearAgo = subDays(today, 364);
    const days = eachDayOfInterval({ start: yearAgo, end: today });

    // Max değeri bul (normalizasyon için)
    const maxCount = Math.max(
      ...completionHistory.map((h) => h.tasksCompleted),
      1
    );

    return days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const entry = completionHistory.find((h) => h.date === dateStr);
      const count = entry?.tasksCompleted || 0;

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count === 0) level = 0;
      else if (count <= maxCount * 0.25) level = 1;
      else if (count <= maxCount * 0.5) level = 2;
      else if (count <= maxCount * 0.75) level = 3;
      else level = 4;

      return { date: dateStr, count, level };
    });
  }, [completionHistory]);

  // ============================================
  // PRODUCTIVITY INSIGHTS
  // ============================================
  const insights = useMemo((): ProductivityInsight[] => {
    const result: ProductivityInsight[] = [];

    // Haftalık karşılaştırma
    if (weeklyStats.comparisonToPrevWeek !== 0) {
      const isUp = weeklyStats.comparisonToPrevWeek > 0;
      result.push({
        type: isUp ? "improvement" : "warning",
        icon: isUp ? "📈" : "📉",
        title: isUp ? "Yükselen Performans" : "Düşen Performans",
        description: `Geçen haftaya göre %${Math.abs(weeklyStats.comparisonToPrevWeek)} ${isUp ? "daha fazla" : "daha az"} görev tamamladın.`,
        value: weeklyStats.comparisonToPrevWeek,
      });
    }

    // Streak bilgisi
    if (currentStreak >= 3) {
      result.push({
        type: "achievement",
        icon: "🔥",
        title: `${currentStreak} Günlük Streak!`,
        description: `${currentStreak} gündür üst üste görev tamamlıyorsun. Streak bonusun: +%${Math.min(currentStreak * 10, 200)}`,
        value: currentStreak,
      });
    }

    // En verimli saatler
    const productiveHours = getMostProductiveHours(completionHistory);
    if (productiveHours.length > 0) {
      const topHour = productiveHours[0];
      result.push({
        type: "suggestion",
        icon: "⏰",
        title: "En Verimli Saatin",
        description: `${topHour.hour}:00 - ${topHour.hour + 1}:00 arası en çok görev tamamladığın zaman dilimi. Bu saatlerde zor görevlere odaklan!`,
        value: topHour.hour,
      });
    }

    // En verimli günler
    const productiveDays = getMostProductiveDays(completionHistory);
    if (productiveDays.length > 0) {
      const topDay = productiveDays[0];
      result.push({
        type: "suggestion",
        icon: "📅",
        title: "En Verimli Günün",
        description: `${topDay.dayName} günleri ortalama ${topDay.avgTasks.toFixed(1)} görev tamamlıyorsun. Bu günü büyük işler için kullan!`,
      });
    }

    // Gecikmiş görev uyarısı
    const overdueTasks = tasks.filter((t) => {
      if (t.status === "completed") return false;
      if (!t.dueDate) return false;
      return parseISO(t.dueDate) < new Date();
    });

    if (overdueTasks.length > 0) {
      result.push({
        type: "warning",
        icon: "⚠️",
        title: `${overdueTasks.length} Gecikmiş Görev`,
        description: `${overdueTasks.length} görevin son tarihi geçmiş. Öncelikle bunları tamamlamayı düşün!`,
        value: overdueTasks.length,
      });
    }

    // Hedef durumu
    const weeklyProgress = weeklyStats.completionRate;
    if (weeklyProgress >= 100) {
      result.push({
        type: "achievement",
        icon: "🎯",
        title: "Haftalık Hedef Tamamlandı!",
        description: `Bu hafta ${weeklyStats.totalCompleted} görev tamamlayarak hedefini aştın. Tebrikler!`,
        value: weeklyProgress,
      });
    } else if (weeklyProgress >= 70) {
      result.push({
        type: "improvement",
        icon: "💪",
        title: "Hedefe Yaklaşıyorsun",
        description: `Haftalık hedefinin %${weeklyProgress}ını tamamladın. Biraz daha gayret!`,
        value: weeklyProgress,
      });
    }

    return result;
  }, [weeklyStats, currentStreak, completionHistory, tasks]);

  // ============================================
  // PREDICTIONS
  // ============================================
  const prediction = useMemo((): PredictionData => {
    const activeTasks = tasks.filter((t) => t.status !== "completed");
    return generatePrediction(completionHistory, weeklyGoal, activeTasks);
  }, [completionHistory, weeklyGoal, tasks]);

  // ============================================
  // CATEGORY STATS
  // ============================================
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; xp: number }> = {};

    tasks.forEach((task) => {
      if (!stats[task.category]) {
        stats[task.category] = { total: 0, completed: 0, xp: 0 };
      }
      stats[task.category].total += 1;
      if (task.status === "completed") {
        stats[task.category].completed += 1;
        stats[task.category].xp += task.xpEarned;
      }
    });

    return stats;
  }, [tasks]);

  return {
    weeklyStats,
    heatmapData,
    insights,
    prediction,
    categoryStats,
    currentStreak,
    longestStreak,
  };
};
