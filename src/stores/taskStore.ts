"use client";

import { create } from "zustand";
import { Task, Subtask, TaskStatus, Tag, RecurringRule, TaskDependency } from "@/types";
import { STORAGE_KEYS } from "@/utils/constants";

interface TaskState {
  tasks: Task[];
  isLoaded: boolean;

  // CRUD
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "order" | "xpEarned" | "actualMinutes" | "completedAt">) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => void;

  // Status
  completeTask: (id: string) => Task | null;
  uncompleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;

  // Subtasks
  addSubtask: (taskId: string, title: string, estimatedMinutes?: number) => void;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  reorderSubtasks: (taskId: string, subtaskIds: string[]) => void;

  // Dependencies
  addDependency: (taskId: string, dependencyTaskId: string) => void;
  removeDependency: (taskId: string, dependencyTaskId: string) => void;
  canStartTask: (taskId: string) => boolean;

  // Tags
  addTagToTask: (taskId: string, tag: Tag) => void;
  removeTagFromTask: (taskId: string, tagId: string) => void;

  // Recurring
  setRecurringRule: (taskId: string, rule: RecurringRule | null) => void;

  // Ordering
  reorderTasks: (taskIds: string[]) => void;

  // Bulk
  clearCompletedTasks: () => void;

  // Persistence
  loadTasks: () => void;
  saveTasks: () => void;

  // Import/Export
  exportTasks: () => string;
  importTasks: (json: string) => boolean;
}

const generateId = (): string => {
  return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const generateSubtaskId = (): string => {
  return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoaded: false,

  // ============================================
  // CRUD
  // ============================================

  addTask: (taskData) => {
    const now = new Date().toISOString();
    const tasks = get().tasks;
    const maxOrder = tasks.length > 0 ? Math.max(...tasks.map((t) => t.order)) : 0;

    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      order: maxOrder + 1,
      xpEarned: 0,
      actualMinutes: 0,
    };

    set((state) => {
      const updated = { tasks: [...state.tasks, newTask] };
      saveToStorage(updated.tasks);
      return updated;
    });

    return newTask;
  },

  updateTask: (id, updates) => {
    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === id
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      );
      saveToStorage(tasks);
      return { tasks };
    });
  },

  deleteTask: (id) => {
    set((state) => {
      const tasks = state.tasks.filter((t) => t.id !== id);
      // Bağımlılıkları da temizle
      const cleanedTasks = tasks.map((t) => ({
        ...t,
        dependencies: t.dependencies.filter((d) => d.taskId !== id),
      }));
      saveToStorage(cleanedTasks);
      return { tasks: cleanedTasks };
    });
  },

  duplicateTask: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const now = new Date().toISOString();
    const maxOrder = Math.max(...get().tasks.map((t) => t.order));

    const duplicated: Task = {
      ...task,
      id: generateId(),
      title: `${task.title} (kopya)`,
      status: "todo",
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      order: maxOrder + 1,
      xpEarned: 0,
      actualMinutes: 0,
      subtasks: task.subtasks.map((s) => ({
        ...s,
        id: generateSubtaskId(),
        completed: false,
      })),
    };

    set((state) => {
      const tasks = [...state.tasks, duplicated];
      saveToStorage(tasks);
      return { tasks };
    });
  },

  // ============================================
  // STATUS
  // ============================================

  completeTask: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return null;

    // Bağımlılık kontrolü
    if (!get().canStartTask(id)) return null;

    const now = new Date().toISOString();
    const completedTask = {
      ...task,
      status: "completed" as TaskStatus,
      completedAt: now,
      updatedAt: now,
      subtasks: task.subtasks.map((s) => ({ ...s, completed: true })),
    };

    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === id ? completedTask : t
      );
      saveToStorage(tasks);
      return { tasks };
    });

    return completedTask;
  },

  uncompleteTask: (id) => {
    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "todo" as TaskStatus,
              completedAt: null,
              updatedAt: new Date().toISOString(),
              xpEarned: 0,
            }
          : t
      );
      saveToStorage(tasks);
      return { tasks };
    });
  },

  updateTaskStatus: (id, status) => {
    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              completedAt: status === "completed" ? new Date().toISOString() : t.completedAt,
              updatedAt: new Date().toISOString(),
            }
          : t
      );
      saveToStorage(tasks);
      return { tasks };
    });
  },

  // ============================================
  // SUBTASKS
  // ============================================

  addSubtask: (taskId, title, estimatedMinutes = 15) => {
    set((state) => {
      const tasks = state.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const maxOrder = t.subtasks.length > 0
          ? Math.max(...t.subtasks.map((s) => s.order))
          : 0;
        return {
          ...t,
          subtasks: [
            ...t.subtasks,
            {
              id: generateSubtaskId(),
              title,
              completed: false,
              estimatedMinutes,
              order: maxOrder + 1,
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      });
      saveToStorage(tasks);
      return { tasks };
    });
  },

  updateSubtask: (taskId, subtaskId, updates) => {
    set((state) => {
      const tasks = state.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, ...updates } : s
          ),
          updatedAt: new Date().toISOString(),
        };
      });
      saveToStorage(tasks);
      return { tasks };
    });
  },

  deleteSubtask: (taskId, subtaskId) => {
    set((state) => {
      const tasks = state.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
          updatedAt: new Date().toISOString(),
        };
      });
      saveToStorage(tasks);
      return { tasks };
    });
  },

  toggleSubtask: (taskId, subtaskId) => {
    set((state) => {
      const tasks = state.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          ),
          updatedAt: new Date().toISOString(),
        };
      });
      saveToStorage(tasks);
      return { tasks };
    });
  },

  reorderSubtasks: (taskId, subtaskIds) => {
    set((state) => {
      const tasks = state.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const reordered = subtaskIds.map((id, index) => {
          const subtask = t.subtasks.find((s) => s.id === id);
          return subtask ? { ...subtask, order: index } : null;
        }).filter(Boolean) as Subtask[];
        return { ...t, subtasks: reordered, updatedAt: new Date().toISOString() };
      });
      saveToStorage(tasks);
      return { tasks };
    });
  },

  // ============================================
  // DEPENDENCIES
  // ============================================

  addDependency: (taskId, dependencyTaskId) => {
    const depTask = get().tasks.find((t) => t.id === dependencyTaskId);
    if (!depTask) return;

    set((state) => {
      const tasks = state.tasks.map((t) => {
        if (t.id !== taskId) return t;
        // Zaten ekliyse atla
        if (t.dependencies.some((d) => d.taskId === dependencyTaskId)) return t;
        return {
          ...t,
          dependencies: [
            ...t.dependencies,
            { taskId: dependencyTaskId, taskTitle: depTask.title },
          ],
          updatedAt: new Date().toISOString(),
        };
      });
      saveToStorage(tasks);
      return { tasks };
    });
  },

  removeDependency: (taskId, dependencyTaskId) => {
    set((state) => {
      const tasks = state.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          dependencies: t.dependencies.filter((d) => d.taskId !== dependencyTaskId),
          updatedAt: new Date().toISOString(),
        };
      });
      saveToStorage(tasks);
      return { tasks };
    });
  },

  canStartTask: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return false;
    if (task.dependencies.length === 0) return true;

    return task.dependencies.every((dep) => {
      const depTask = get().tasks.find((t) => t.id === dep.taskId);
      return depTask?.status === "completed";
    });
  },

  // ============================================
  // TAGS
  // ============================================

  addTagToTask: (taskId, tag) => {
    set((state) => {
      const tasks = state.tasks.map((t) => {
        if (t.id !== taskId) return t;
        if (t.tags.some((tg) => tg.id === tag.id)) return t;
        return {
          ...t,
          tags: [...t.tags, tag],
          updatedAt: new Date().toISOString(),
        };
      });
      saveToStorage(tasks);
      return { tasks };
    });
  },

  removeTagFromTask: (taskId, tagId) => {
    set((state) => {
      const tasks = state.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          tags: t.tags.filter((tg) => tg.id !== tagId),
          updatedAt: new Date().toISOString(),
        };
      });
      saveToStorage(tasks);
      return { tasks };
    });
  },

  // ============================================
  // RECURRING
  // ============================================

  setRecurringRule: (taskId, rule) => {
    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, recurring: rule, updatedAt: new Date().toISOString() }
          : t
      );
      saveToStorage(tasks);
      return { tasks };
    });
  },

  // ============================================
  // ORDERING
  // ============================================

  reorderTasks: (taskIds) => {
    set((state) => {
      const tasks = state.tasks.map((t) => {
        const newIndex = taskIds.indexOf(t.id);
        return newIndex !== -1 ? { ...t, order: newIndex } : t;
      });
      saveToStorage(tasks);
      return { tasks };
    });
  },

  // ============================================
  // BULK
  // ============================================

  clearCompletedTasks: () => {
    set((state) => {
      const tasks = state.tasks.filter((t) => t.status !== "completed");
      saveToStorage(tasks);
      return { tasks };
    });
  },

  // ============================================
  // PERSISTENCE
  // ============================================

  loadTasks: () => {
    try {
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(STORAGE_KEYS.TASKS);
        if (stored) {
          const tasks = JSON.parse(stored) as Task[];
          set({ tasks, isLoaded: true });
        } else {
          set({ isLoaded: true });
        }
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      set({ isLoaded: true });
    }
  },

  saveTasks: () => {
    saveToStorage(get().tasks);
  },

  // ============================================
  // IMPORT / EXPORT
  // ============================================

  exportTasks: () => {
    return JSON.stringify(get().tasks, null, 2);
  },

  importTasks: (json) => {
    try {
      const imported = JSON.parse(json) as Task[];
      if (!Array.isArray(imported)) return false;
      set({ tasks: imported });
      saveToStorage(imported);
      return true;
    } catch {
      return false;
    }
  },
}));

// Helper: localStorage'a kaydet
function saveToStorage(tasks: Task[]) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }
  } catch (error) {
    console.error("Error saving tasks:", error);
  }
}
