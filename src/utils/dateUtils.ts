import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  isThisWeek,
  isPast,
  differenceInDays,
  differenceInHours,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  isSameDay,
  parseISO,
  getDay,
  startOfDay,
} from "date-fns";
import { tr } from "date-fns/locale";

export const formatDate = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, "d MMMM yyyy", { locale: tr });
};

export const formatDateShort = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, "d MMM", { locale: tr });
};

export const formatTime = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, "HH:mm");
};

export const formatDateTime = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, "d MMM yyyy HH:mm", { locale: tr });
};

export const getRelativeDate = (dateString: string): string => {
  const date = parseISO(dateString);

  if (isToday(date)) return "Bugün";
  if (isTomorrow(date)) return "Yarın";
  if (isYesterday(date)) return "Dün";

  const diff = differenceInDays(date, new Date());

  if (diff > 0 && diff <= 7) return `${diff} gün sonra`;
  if (diff < 0 && diff >= -7) return `${Math.abs(diff)} gün önce`;

  return formatDateShort(dateString);
};

export const getDueDateStatus = (
  dueDate: string | null
): { label: string; color: string; isOverdue: boolean } => {
  if (!dueDate) return { label: "", color: "", isOverdue: false };

  const date = parseISO(dueDate);
  const now = new Date();

  if (isToday(date)) {
    return { label: "Bugün", color: "#f59e0b", isOverdue: false };
  }

  if (isTomorrow(date)) {
    return { label: "Yarın", color: "#3b82f6", isOverdue: false };
  }

  if (isPast(date)) {
    const daysLate = differenceInDays(now, date);
    return {
      label: `${daysLate} gün gecikmiş`,
      color: "#ef4444",
      isOverdue: true,
    };
  }

  const daysLeft = differenceInDays(date, now);
  if (daysLeft <= 3) {
    return { label: `${daysLeft} gün kaldı`, color: "#f97316", isOverdue: false };
  }

  return { label: getRelativeDate(dueDate), color: "#6b7280", isOverdue: false };
};

export const getWeekDays = (date: Date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Pazartesi başlangıç
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const getMonthDays = (date: Date = new Date()) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

export const toDateString = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

export const getCurrentHour = (): number => {
  return new Date().getHours();
};

export const getGreeting = (): string => {
  const hour = getCurrentHour();
  if (hour >= 5 && hour < 12) return "Günaydın";
  if (hour >= 12 && hour < 17) return "İyi öğleden sonralar";
  if (hour >= 17 && hour < 22) return "İyi akşamlar";
  return "İyi geceler";
};

export const isWeekend = (date: Date = new Date()): boolean => {
  const day = getDay(date);
  return day === 0 || day === 6;
};

export const isMorning = (hour?: number): boolean => {
  const h = hour ?? getCurrentHour();
  return h >= 6 && h < 8;
};

export const isNight = (hour?: number): boolean => {
  const h = hour ?? getCurrentHour();
  return h >= 22 || h < 4;
};

export {
  isToday,
  isTomorrow,
  isPast,
  isSameDay,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfDay,
  addDays,
  differenceInDays,
  differenceInHours,
  format,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  getDay,
};
