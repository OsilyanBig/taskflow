import { DailyCompletion, PredictionData, Task } from "@/types";
import { differenceInDays, parseISO, subDays, format } from "date-fns";

/**
 * Kullanıcının mevcut hızına göre tahminler üretir
 * Son 14 günlük veriye bakarak haftalık/aylık hedef tahmini yapar
 */

export const generatePrediction = (
  history: DailyCompletion[],
  weeklyGoal: number,
  activeTasks: Task[]
): PredictionData => {
  if (history.length < 3) {
    return {
      weeklyTarget: weeklyGoal,
      predictedCompletion: 0,
      confidence: 0,
      trend: "stable",
      message: "Yeterli veri yok. Birkaç gün daha kullanarak tahminleri aktifleştir! 📊",
    };
  }

  // Son 14 günlük ortalama
  const last14Days = history
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 14);

  const avgDaily =
    last14Days.reduce((sum, d) => sum + d.tasksCompleted, 0) / last14Days.length;

  // Son 7 gün vs önceki 7 gün karşılaştırması
  const last7 = last14Days.slice(0, 7);
  const prev7 = last14Days.slice(7, 14);

  const last7Avg =
    last7.reduce((sum, d) => sum + d.tasksCompleted, 0) / Math.max(last7.length, 1);
  const prev7Avg =
    prev7.reduce((sum, d) => sum + d.tasksCompleted, 0) / Math.max(prev7.length, 1);

  // Trend hesapla
  let trend: "up" | "down" | "stable";
  const trendDiff = last7Avg - prev7Avg;

  if (trendDiff > 0.5) trend = "up";
  else if (trendDiff < -0.5) trend = "down";
  else trend = "stable";

  // Haftalık tahmin
  const predictedWeekly = Math.round(avgDaily * 7);

  // Güven skoru (veri miktarına ve tutarlılığa bağlı)
  const variance = calculateVariance(last14Days.map((d) => d.tasksCompleted));
  const consistencyScore = Math.max(0, 100 - variance * 10);
  const dataScore = Math.min(100, (history.length / 30) * 100);
  const confidence = Math.round((consistencyScore + dataScore) / 2);

  // Mesaj oluştur
  const message = generatePredictionMessage(
    predictedWeekly,
    weeklyGoal,
    trend,
    avgDaily
  );

  return {
    weeklyTarget: weeklyGoal,
    predictedCompletion: predictedWeekly,
    confidence,
    trend,
    message,
  };
};

const calculateVariance = (values: number[]): number => {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length;
};

const generatePredictionMessage = (
  predicted: number,
  target: number,
  trend: "up" | "down" | "stable",
  avgDaily: number
): string => {
  const ratio = predicted / Math.max(target, 1);

  if (ratio >= 1.2) {
    return `🔥 Harika gidiyorsun! Hedefinin %${Math.round(ratio * 100)}ini tutturma yolundasın. Günde ortalama ${avgDaily.toFixed(1)} görev tamamlıyorsun.`;
  }

  if (ratio >= 1) {
    return `✅ Haftalık hedefini tutturma yolundasın. Günde ortalama ${avgDaily.toFixed(1)} görev tamamlıyorsun. Böyle devam!`;
  }

  if (ratio >= 0.7) {
    return `⚠️ Hedefe yakınsın ama biraz daha hız lazım. Günde ${Math.ceil(target / 7)} görev tamamlarsan hedefe ulaşırsın.`;
  }

  return `📈 Hedefin altındasın. Günde en az ${Math.ceil(target / 7)} görev tamamlamayı hedefle. Küçük adımlarla başla!`;
};

/**
 * En verimli saat aralıklarını hesaplar
 */
export const getMostProductiveHours = (
  history: DailyCompletion[]
): { hour: number; count: number }[] => {
  const hourCounts: Record<number, number> = {};

  history.forEach((day) => {
    day.completionTimes.forEach((time) => {
      const hour = parseInt(time.split(":")[0]);
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
  });

  return Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count);
};

/**
 * En verimli günleri hesaplar
 */
export const getMostProductiveDays = (
  history: DailyCompletion[]
): { day: number; dayName: string; avgTasks: number }[] => {
  const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const dayCounts: Record<number, { total: number; count: number }> = {};

  history.forEach((entry) => {
    const day = new Date(entry.date).getDay();
    if (!dayCounts[day]) dayCounts[day] = { total: 0, count: 0 };
    dayCounts[day].total += entry.tasksCompleted;
    dayCounts[day].count += 1;
  });

  return Object.entries(dayCounts)
    .map(([day, data]) => ({
      day: parseInt(day),
      dayName: dayNames[parseInt(day)],
      avgTasks: data.total / data.count,
    }))
    .sort((a, b) => b.avgTasks - a.avgTasks);
};

/**
 * Haftalık karşılaştırma yüzdesi
 */
export const getWeeklyComparison = (history: DailyCompletion[]): number => {
  if (history.length < 14) return 0;

  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const thisWeek = sorted
    .slice(0, 7)
    .reduce((sum, d) => sum + d.tasksCompleted, 0);
  const lastWeek = sorted
    .slice(7, 14)
    .reduce((sum, d) => sum + d.tasksCompleted, 0);

  if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;

  return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
};
