import { Task, RecurringRule } from "@/types";
import {
  addDays,
  getDay,
  isToday,
  isSameDay,
  parseISO,
  startOfDay,
  endOfMonth,
  format,
} from "date-fns";

/**
 * Tekrarlayan görevleri yöneten sistem
 * Her gün kontrol edilir ve yeni görevler oluşturulur
 */

export const generateRecurringTasks = (tasks: Task[]): Task[] => {
  const newTasks: Task[] = [];
  const today = startOfDay(new Date());

  tasks.forEach((task) => {
    if (!task.recurring || !task.recurring.enabled) return;

    const shouldGenerate = shouldGenerateToday(task.recurring, today);

    if (shouldGenerate) {
      // Bugün için zaten oluşturulmuş mu kontrol et
      const alreadyExists = tasks.some(
        (t) =>
          t.title === task.title &&
          t.createdAt &&
          isSameDay(parseISO(t.createdAt), today) &&
          t.id !== task.id
      );

      if (!alreadyExists) {
        const newTask = createRecurringInstance(task, today);
        newTasks.push(newTask);
      }
    }
  });

  return newTasks;
};

const shouldGenerateToday = (rule: RecurringRule, today: Date): boolean => {
  // Son oluşturma tarihini kontrol et
  if (rule.lastGenerated) {
    const lastGen = parseISO(rule.lastGenerated);
    if (isSameDay(lastGen, today)) return false;
  }

  const dayOfWeek = getDay(today); // 0=Pazar ... 6=Cumartesi
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

  // Sadece hafta içi kuralı
  if (rule.weekdaysOnly && !isWeekday) return false;

  switch (rule.type) {
    case "daily":
      return true;

    case "weekly":
      if (!rule.daysOfWeek || rule.daysOfWeek.length === 0) return false;
      return rule.daysOfWeek.includes(dayOfWeek);

    case "monthly": {
      const todayDate = today.getDate();
      if (rule.dayOfMonth === -1) {
        // Ayın son günü
        const lastDay = endOfMonth(today).getDate();
        return todayDate === lastDay;
      }
      return todayDate === rule.dayOfMonth;
    }

    case "custom": {
      if (!rule.intervalDays || !rule.lastGenerated) return true;
      const lastGen = parseISO(rule.lastGenerated);
      const daysSince = Math.floor(
        (today.getTime() - lastGen.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSince >= rule.intervalDays;
    }

    default:
      return false;
  }
};

const createRecurringInstance = (template: Task, date: Date): Task => {
  const now = new Date().toISOString();
  return {
    ...template,
    id: `${template.id}_${format(date, "yyyy-MM-dd")}_${Date.now()}`,
    status: "todo",
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    xpEarned: 0,
    actualMinutes: 0,
    subtasks: template.subtasks.map((s) => ({
      ...s,
      completed: false,
      id: `${s.id}_${Date.now()}`,
    })),
    // Due date'i bugüne ayarla
    dueDate: date.toISOString(),
    // Recurring bilgisini güncelle
    recurring: {
      ...template.recurring!,
      lastGenerated: now,
    },
  };
};

export const getRecurringDescription = (rule: RecurringRule): string => {
  if (!rule.enabled) return "Devre dışı";

  const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

  switch (rule.type) {
    case "daily":
      if (rule.weekdaysOnly) return "Her hafta içi";
      return "Her gün";

    case "weekly":
      if (!rule.daysOfWeek || rule.daysOfWeek.length === 0) return "Haftalık";
      const days = rule.daysOfWeek.map((d) => dayNames[d]).join(", ");
      return `Her ${days}`;

    case "monthly":
      if (rule.dayOfMonth === -1) return "Her ayın son günü";
      return `Her ayın ${rule.dayOfMonth}. günü`;

    case "custom":
      return `Her ${rule.intervalDays} günde bir`;

    default:
      return "Tekrarlayan";
  }
};
