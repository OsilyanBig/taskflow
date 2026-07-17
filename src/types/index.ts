// ============================================
// TASK TYPES
// ============================================

export type Priority = "critical" | "high" | "medium" | "low";
export type EnergyLevel = "high" | "medium" | "low";
export type TaskStatus = "todo" | "in-progress" | "waiting" | "completed";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes: number;
  order: number;
}

export interface TaskDependency {
  taskId: string;
  taskTitle: string;
}

export interface RecurringRule {
  enabled: boolean;
  type: "daily" | "weekly" | "monthly" | "custom";
  // Weekly: hangi günler (0=Pazar, 1=Pazartesi, ..., 6=Cumartesi)
  daysOfWeek?: number[];
  // Monthly: ayın hangi günü (1-31, -1 = son gün)
  dayOfMonth?: number;
  // Custom: kaç günde bir
  intervalDays?: number;
  // Sadece hafta içi mi
  weekdaysOnly?: boolean;
  // Son tekrar tarihi
  lastGenerated?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  energyLevel: EnergyLevel;
  category: string;
  tags: Tag[];
  subtasks: Subtask[];
  dependencies: TaskDependency[];
  recurring: RecurringRule | null;
  notes: string;
  estimatedMinutes: number;
  actualMinutes: number;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  order: number;
  xpEarned: number;
}

// ============================================
// CATEGORY TYPES
// ============================================

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// ============================================
// GAMIFICATION TYPES
// ============================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "streak" | "productivity" | "explorer" | "mastery" | "special";
  requirement: AchievementRequirement;
  xpReward: number;
  unlockedAt: string | null;
  isSecret: boolean;
}

export interface AchievementRequirement {
  type:
    | "streak_days"
    | "tasks_completed"
    | "tasks_in_timeframe"
    | "category_tasks"
    | "level_reached"
    | "xp_earned"
    | "subtasks_completed"
    | "early_completion"
    | "weekend_tasks"
    | "morning_tasks"
    | "night_tasks"
    | "perfect_week"
    | "custom";
  value: number;
  // Ek parametreler
  timeframeHours?: number;
  categoryId?: string;
  startHour?: number;
  endHour?: number;
}

export interface GamificationState {
  xp: number;
  level: number;
  xpToNextLevel: number;
  totalXpEarned: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  achievements: Achievement[];
  completionHistory: DailyCompletion[];
  penaltyEnabled: boolean;
}

export interface DailyCompletion {
  date: string; // YYYY-MM-DD
  tasksCompleted: number;
  totalTasks: number;
  xpEarned: number;
  categories: { [categoryId: string]: number };
  completionTimes: string[]; // HH:MM formatında tamamlama saatleri
}

// ============================================
// LEVEL SYSTEM
// ============================================

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  color: string;
  icon: string;
}

// ============================================
// STATS TYPES
// ============================================

export interface WeeklyStats {
  weekStart: string;
  days: {
    date: string;
    dayName: string;
    completed: number;
    total: number;
    xp: number;
  }[];
  totalCompleted: number;
  totalXp: number;
  completionRate: number;
  comparisonToPrevWeek: number; // yüzde fark
}

export interface ProductivityInsight {
  type: "improvement" | "warning" | "achievement" | "suggestion";
  icon: string;
  title: string;
  description: string;
  value?: number;
}

export interface HeatmapData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // 0=boş, 4=en yoğun
}

export interface PredictionData {
  weeklyTarget: number;
  predictedCompletion: number;
  confidence: number; // 0-100
  trend: "up" | "down" | "stable";
  message: string;
}

// ============================================
// VIEW & UI TYPES
// ============================================

export type ViewType =
  | "dashboard"
  | "today"
  | "week"
  | "all-tasks"
  | "kanban"
  | "calendar"
  | "achievements"
  | "zen"
  | "settings";

export interface FilterState {
  search: string;
  status: TaskStatus | "all";
  priority: Priority | "all";
  energyLevel: EnergyLevel | "all";
  category: string | "all";
  tags: string[];
  sortBy: "dueDate" | "priority" | "createdAt" | "title" | "order";
  sortDirection: "asc" | "desc";
  showCompleted: boolean;
}

// ============================================
// SETTINGS TYPES
// ============================================

export type AccentColor =
  | "blue"
  | "cyan"
  | "purple"
  | "pink"
  | "green"
  | "orange";

export interface Settings {
  theme: "dark" | "light";
  accentColor: AccentColor;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  penaltyEnabled: boolean;
  penaltyXpLoss: number;
  weeklyGoal: number;
  dailyGoal: number;
  showMotivationalQuotes: boolean;
  compactMode: boolean;
  categories: Category[];
  tags: Tag[];
}

// ============================================
// NOTIFICATION / TOAST TYPES
// ============================================

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info" | "xp" | "achievement";
  title: string;
  description?: string;
  duration?: number;
  icon?: string;
}
