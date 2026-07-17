"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

// Stores
import { useTaskStore } from "@/stores/taskStore";
import { useGamificationStore } from "@/stores/gamificationStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useViewStore } from "@/stores/viewStore";

// Hooks
import { useTasks } from "@/hooks/useTasks";
import { useTheme } from "@/hooks/useTheme";

// Layout
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

// Views
import { DashboardView } from "@/components/dashboard/DashboardView";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { CalendarView } from "@/components/calendar/CalendarView";
import { AchievementsPanel } from "@/components/gamification/AchievementsPanel";
import { ZenMode } from "@/components/focus/ZenMode";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { TaskModal } from "@/components/tasks/TaskModal";

// Utils
import { generateRecurringTasks } from "@/utils/recurringTasks";
import { Zap } from "lucide-react";

export default function Home() {
  const [isInitialized, setIsInitialized] = useState(false);

  // Stores
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const isTasksLoaded = useTaskStore((s) => s.isLoaded);

  const loadGamification = useGamificationStore((s) => s.loadGamification);
  const isGamificationLoaded = useGamificationStore((s) => s.isLoaded);

  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const isSettingsLoaded = useSettingsStore((s) => s.isLoaded);

  const currentView = useViewStore((s) => s.currentView);
  const isSidebarOpen = useViewStore((s) => s.isSidebarOpen);

  // Hooks
  const { todayTasks, weekTasks, filteredTasks, activeTasks } = useTasks();
  const { cssVariables } = useTheme();

  // ============================================
  // INITIALIZATION
  // ============================================
  useEffect(() => {
    loadTasks();
    loadGamification();
    loadSettings();
  }, [loadTasks, loadGamification, loadSettings]);

  // Tüm store'lar yüklendiğinde
  useEffect(() => {
    if (isTasksLoaded && isGamificationLoaded && isSettingsLoaded) {
      // Tekrarlayan görevleri kontrol et
      const recurringNewTasks = generateRecurringTasks(tasks);
      recurringNewTasks.forEach((newTask) => {
        addTask({
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          energyLevel: newTask.energyLevel,
          category: newTask.category,
          status: newTask.status,
          tags: newTask.tags,
          subtasks: newTask.subtasks,
          dependencies: newTask.dependencies,
          recurring: newTask.recurring,
          notes: newTask.notes,
          estimatedMinutes: newTask.estimatedMinutes,
          dueDate: newTask.dueDate,
        });
      });

      // Kısa bir gecikme ile splash screen
      setTimeout(() => setIsInitialized(true), 800);
    }
  }, [isTasksLoaded, isGamificationLoaded, isSettingsLoaded]);

  // ============================================
  // LOADING SCREEN
  // ============================================
  if (!isInitialized) {
    return (
      <div className="fixed inset-0 bg-deep-bg flex items-center justify-center">
        <div className="absolute inset-0 bg-aurora opacity-30" />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex flex-col items-center"
        >
          {/* Logo */}
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.3)",
                "0 0 60px rgba(59, 130, 246, 0.5)",
                "0 0 20px rgba(59, 130, 246, 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 rounded-2xl bg-blue-gradient flex items-center justify-center mb-6"
          >
            <Zap size={32} className="text-white" />
          </motion.div>

          {/* Title */}
          <h1 className="text-2xl font-black text-white mb-2">TaskFlow</h1>
          <p className="text-sm text-slate-500 mb-6">Başar, Geliş, Tekrarla</p>

          {/* Loading dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 rounded-full bg-accent-blue"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // ZEN MODE (Full screen)
  // ============================================
  if (currentView === "zen") {
    return (
      <>
        <ZenMode />
        <TaskModal />
      </>
    );
  }

  // ============================================
  // RENDER VIEW CONTENT
  // ============================================
  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView />;

      case "today":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-white mb-1">
                Bugünün Görevleri ☀️
              </h2>
              <p className="text-sm text-slate-500">
                Bugün için planlanmış {todayTasks.length} görev var
              </p>
            </div>
            <TaskFilters />
            <TaskList
              tasks={todayTasks.filter((t) =>
                filteredTasks.some((ft) => ft.id === t.id) ||
                t.status === "completed"
              )}
              emptyMessage="Bugün için görev yok"
              emptySubMessage="Yeni bir görev ekleyerek güne başla!"
            />
          </div>
        );

      case "week":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-white mb-1">
                Bu Hafta 📅
              </h2>
              <p className="text-sm text-slate-500">
                Bu hafta için {weekTasks.length} görev planlandı
              </p>
            </div>
            <TaskFilters />
            <TaskList
              tasks={weekTasks.filter((t) =>
                filteredTasks.some((ft) => ft.id === t.id) ||
                t.status === "completed"
              )}
              emptyMessage="Bu hafta için görev yok"
              emptySubMessage="Haftalık planını oluştur!"
            />
          </div>
        );

      case "all-tasks":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-white mb-1">
                Tüm Görevler 📋
              </h2>
              <p className="text-sm text-slate-500">
                Toplam {tasks.length} görev, {activeTasks.length} aktif
              </p>
            </div>
            <TaskFilters />
            <TaskList
              tasks={filteredTasks}
              emptyMessage="Görev bulunamadı"
              emptySubMessage="Filtreleri değiştirmeyi veya yeni görev eklemeyi dene"
            />
          </div>
        );

      case "kanban":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-white mb-1">
                Kanban Panosu 📊
              </h2>
              <p className="text-sm text-slate-500">
                Görevlerini sürükle-bırak ile yönet
              </p>
            </div>
            <KanbanBoard />
          </div>
        );

      case "calendar":
        return <CalendarView />;

      case "achievements":
        return <AchievementsPanel />;

      case "settings":
        return <SettingsPanel />;

      default:
        return <DashboardView />;
    }
  };

  // ============================================
  // MAIN LAYOUT
  // ============================================
  return (
    <div
      className="min-h-screen bg-deep-bg bg-grid"
      style={cssVariables as React.CSSProperties}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={clsx(
          "transition-all duration-300 min-h-screen",
          "md:ml-[72px]",
          isSidebarOpen && "md:ml-[280px]"
        )}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="px-4 md:px-6 lg:px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Task Modal (Global) */}
      <TaskModal />
    </div>
  );
}
