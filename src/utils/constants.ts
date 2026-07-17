import { Category, LevelInfo, AccentColor } from "@/types";

// ============================================
// DEFAULT CATEGORIES
// ============================================

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "work", name: "İş", icon: "💼", color: "#3b82f6" },
  { id: "personal", name: "Kişisel", icon: "🏠", color: "#8b5cf6" },
  { id: "learning", name: "Öğrenim", icon: "📚", color: "#22d3ee" },
  { id: "health", name: "Sağlık", icon: "💪", color: "#10b981" },
  { id: "finance", name: "Finans", icon: "💰", color: "#f59e0b" },
  { id: "social", name: "Sosyal", icon: "👥", color: "#ec4899" },
  { id: "project", name: "Proje", icon: "🚀", color: "#f97316" },
  { id: "other", name: "Diğer", icon: "📌", color: "#6b7280" },
];

// ============================================
// LEVEL SYSTEM
// ============================================

export const LEVELS: LevelInfo[] = [
  { level: 1, title: "Başlangıç", minXp: 0, maxXp: 100, color: "#6b7280", icon: "🌱" },
  { level: 2, title: "Çaylak", minXp: 100, maxXp: 250, color: "#22d3ee", icon: "🌿" },
  { level: 3, title: "Keşifçi", minXp: 250, maxXp: 500, color: "#3b82f6", icon: "🔍" },
  { level: 4, title: "Azimli", minXp: 500, maxXp: 850, color: "#8b5cf6", icon: "⚡" },
  { level: 5, title: "Odaklı", minXp: 850, maxXp: 1300, color: "#a855f7", icon: "🎯" },
  { level: 6, title: "Savaşçı", minXp: 1300, maxXp: 1900, color: "#f59e0b", icon: "⚔️" },
  { level: 7, title: "Stratejist", minXp: 1900, maxXp: 2600, color: "#f97316", icon: "🧠" },
  { level: 8, title: "Usta", minXp: 2600, maxXp: 3500, color: "#ef4444", icon: "🏆" },
  { level: 9, title: "Efsane", minXp: 3500, maxXp: 4700, color: "#ec4899", icon: "👑" },
  { level: 10, title: "Titan", minXp: 4700, maxXp: 6200, color: "#e11d48", icon: "🔥" },
  { level: 11, title: "İmparator", minXp: 6200, maxXp: 8000, color: "#dc2626", icon: "🌟" },
  { level: 12, title: "Tanrısal", minXp: 8000, maxXp: 10000, color: "#fbbf24", icon: "💎" },
  { level: 13, title: "Aşkın", minXp: 10000, maxXp: 13000, color: "#f472b6", icon: "🌌" },
  { level: 14, title: "Ölümsüz", minXp: 13000, maxXp: 17000, color: "#c084fc", icon: "♾️" },
  { level: 15, title: "Kozmik", minXp: 17000, maxXp: Infinity, color: "#fef3c7", icon: "✨" },
];

// ============================================
// PRIORITY CONFIG
// ============================================

export const PRIORITY_CONFIG = {
  critical: {
    label: "Kritik",
    color: "#ef4444",
    bgColor: "rgba(239, 68, 68, 0.15)",
    icon: "🔴",
    xpMultiplier: 3,
  },
  high: {
    label: "Yüksek",
    color: "#f97316",
    bgColor: "rgba(249, 115, 22, 0.15)",
    icon: "🟠",
    xpMultiplier: 2,
  },
  medium: {
    label: "Orta",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.15)",
    icon: "🟡",
    xpMultiplier: 1.5,
  },
  low: {
    label: "Düşük",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.15)",
    icon: "🟢",
    xpMultiplier: 1,
  },
};

// ============================================
// ENERGY CONFIG
// ============================================

export const ENERGY_CONFIG = {
  high: { label: "Yüksek Enerji", icon: "⚡", color: "#f59e0b" },
  medium: { label: "Orta Enerji", icon: "🔋", color: "#3b82f6" },
  low: { label: "Düşük Enerji", icon: "🪫", color: "#10b981" },
};

// ============================================
// STATUS CONFIG
// ============================================

export const STATUS_CONFIG = {
  todo: { label: "Yapılacak", color: "#6b7280", icon: "📋" },
  "in-progress": { label: "Devam Ediyor", color: "#3b82f6", icon: "🔄" },
  waiting: { label: "Bekliyor", color: "#f59e0b", icon: "⏳" },
  completed: { label: "Tamamlandı", color: "#10b981", icon: "✅" },
};

// ============================================
// ACCENT COLORS
// ============================================

export const ACCENT_COLORS: Record<AccentColor, { primary: string; glow: string; name: string }> = {
  blue: { primary: "#3b82f6", glow: "rgba(59, 130, 246, 0.3)", name: "Mavi" },
  cyan: { primary: "#22d3ee", glow: "rgba(34, 211, 238, 0.3)", name: "Camgöbeği" },
  purple: { primary: "#8b5cf6", glow: "rgba(139, 92, 246, 0.3)", name: "Mor" },
  pink: { primary: "#ec4899", glow: "rgba(236, 72, 153, 0.3)", name: "Pembe" },
  green: { primary: "#10b981", glow: "rgba(16, 185, 129, 0.3)", name: "Yeşil" },
  orange: { primary: "#f97316", glow: "rgba(249, 115, 22, 0.3)", name: "Turuncu" },
};

// ============================================
// DAY NAMES (Turkish)
// ============================================

export const DAY_NAMES_SHORT = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
export const DAY_NAMES_LONG = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
];
export const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

// ============================================
// MISC
// ============================================

export const STORAGE_KEYS = {
  TASKS: "taskflow_tasks",
  GAMIFICATION: "taskflow_gamification",
  SETTINGS: "taskflow_settings",
  VIEW: "taskflow_view",
};

export const XP_BASE = 10;
export const STREAK_BONUS_MULTIPLIER = 0.1; // her streak günü %10 bonus
export const MAX_STREAK_BONUS = 2; // max 2x bonus
export const PENALTY_XP_DEFAULT = 15;
