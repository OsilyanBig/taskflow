"use client";

import { useMemo, useCallback } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { useViewStore } from "@/stores/viewStore";
import { Task, FilterState, TaskStatus } from "@/types";
import { isToday, isSameDay, parseISO, isThisWeek } from "date-fns";

export const useTasks = () => {
  const tasks = useTaskStore((s) => s.tasks);
  const filters = useViewStore((s) => s.filters);

  // Filtrelenmiş görevler
  const filteredTasks = useMemo(() => {
    return applyFilters(tasks, filters);
  }, [tasks, filters]);

  // Bugünün görevleri
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status === "completed" && t.completedAt && isToday(parseISO(t.completedAt))) {
        return true;
      }
      if (t.dueDate && isToday(parseISO(t.dueDate))) return true;
      if (t.status !== "completed" && !t.dueDate) return true;
      return false;
    });
  }, [tasks]);

  // Bu haftanın görevleri
  const weekTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.dueDate && isThisWeek(parseISO(t.dueDate), { weekStartsOn: 1 })) return true;
      if (t.completedAt && isThisWeek(parseISO(t.completedAt), { weekStartsOn: 1 })) return true;
      return false;
    });
  }, [tasks]);

  // Aktif görevler (tamamlanmamış)
  const activeTasks = useMemo(() => {
    return tasks.filter((t) => t.status !== "completed");
  }, [tasks]);

  // Tamamlanan görevler
  const completedTasks = useMemo(() => {
    return tasks.filter((t) => t.status === "completed");
  }, [tasks]);

  // Gecikmiş görevler
  const overdueTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter((t) => {
      if (t.status === "completed") return false;
      if (!t.dueDate) return false;
      return parseISO(t.dueDate) < now;
    });
  }, [tasks]);

  // Belirli bir tarihteki görevler
  const getTasksByDate = useCallback(
    (date: Date) => {
      return tasks.filter((t) => {
        if (t.dueDate && isSameDay(parseISO(t.dueDate), date)) return true;
        if (t.completedAt && isSameDay(parseISO(t.completedAt), date)) return true;
        return false;
      });
    },
    [tasks]
  );

  // Kategoriye göre görevler
  const getTasksByCategory = useCallback(
    (categoryId: string) => {
      return tasks.filter((t) => t.category === categoryId);
    },
    [tasks]
  );

  // Kanban durumuna göre görevler
  const kanbanTasks = useMemo(() => {
    const statusGroups: Record<TaskStatus, Task[]> = {
      todo: [],
      "in-progress": [],
      waiting: [],
      completed: [],
    };

    tasks.forEach((task) => {
      statusGroups[task.status].push(task);
    });

    // Her grubu order'a göre sırala
    Object.keys(statusGroups).forEach((status) => {
      statusGroups[status as TaskStatus].sort((a, b) => a.order - b.order);
    });

    return statusGroups;
  }, [tasks]);

  // İstatistikler
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = completedTasks.length;
    const active = activeTasks.length;
    const overdue = overdueTasks.length;
    const todayCompleted = todayTasks.filter((t) => t.status === "completed").length;
    const todayTotal = todayTasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      active,
      overdue,
      todayCompleted,
      todayTotal,
      completionRate,
    };
  }, [tasks, completedTasks, activeTasks, overdueTasks, todayTasks]);

  return {
    tasks,
    filteredTasks,
    todayTasks,
    weekTasks,
    activeTasks,
    completedTasks,
    overdueTasks,
    kanbanTasks,
    stats,
    getTasksByDate,
    getTasksByCategory,
  };
};

// ============================================
// FILTER HELPER
// ============================================

function applyFilters(tasks: Task[], filters: FilterState): Task[] {
  let result = [...tasks];

  // Search
  if (filters.search) {
    const query = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some((tag) => tag.name.toLowerCase().includes(query)) ||
        t.notes.toLowerCase().includes(query)
    );
  }

  // Status
  if (filters.status !== "all") {
    result = result.filter((t) => t.status === filters.status);
  }

  // Show completed toggle
  if (!filters.showCompleted && filters.status === "all") {
    result = result.filter((t) => t.status !== "completed");
  }

  // Priority
  if (filters.priority !== "all") {
    result = result.filter((t) => t.priority === filters.priority);
  }

  // Energy
  if (filters.energyLevel !== "all") {
    result = result.filter((t) => t.energyLevel === filters.energyLevel);
  }

  // Category
  if (filters.category !== "all") {
    result = result.filter((t) => t.category === filters.category);
  }

  // Tags
  if (filters.tags.length > 0) {
    result = result.filter((t) =>
      filters.tags.some((tagId) => t.tags.some((tt) => tt.id === tagId))
    );
  }

  // Sort
  result.sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case "dueDate":
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        comparison = aDate - bDate;
        break;

      case "priority":
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;

      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;

      case "title":
        comparison = a.title.localeCompare(b.title, "tr");
        break;

      case "order":
      default:
        comparison = a.order - b.order;
        break;
    }

    return filters.sortDirection === "desc" ? -comparison : comparison;
  });

  return result;
}
