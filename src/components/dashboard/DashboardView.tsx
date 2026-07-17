"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTasks } from "@/hooks/useTasks";
import { getDailyQuote } from "@/data/motivationalQuotes";
import { getGreeting } from "@/utils/dateUtils";
import { StatsCards } from "./StatsCards";
import { StreakCounter } from "./StreakCounter";
import { WeeklyChart } from "./WeeklyChart";
import { HeatmapCalendar } from "./HeatmapCalendar";
import { ProductivityInsights } from "./ProductivityInsights";
import { TaskList } from "@/components/tasks/TaskList";
import { XPBar } from "@/components/gamification/XPBar";

export const DashboardView: React.FC = () => {
  const { showMotivationalQuotes } = useSettingsStore();
  const { todayTasks, overdueTasks } = useTasks();
  const dailyQuote = getDailyQuote();

  const todayActiveTasks = todayTasks.filter(
    (t) => t.status !== "completed"
  );
  const todayCompletedTasks = todayTasks.filter(
    (t) => t.status === "completed"
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl glass-card p-6"
      >
        {/* Background Aurora */}
        <div className="absolute inset-0 bg-aurora opacity-50" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white">
                {getGreeting()} 👋
              </h1>
              {showMotivationalQuotes && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-slate-400 mt-1 max-w-lg italic"
                >
                  &quot;{dailyQuote.text}&quot;
                  <span className="text-slate-600 not-italic">
                    {" "}
                    — {dailyQuote.author}
                  </span>
                </motion.p>
              )}
            </div>
            <div className="w-full md:w-64">
              <XPBar />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5"
            >
              <TaskList
                tasks={overdueTasks}
                title={`⚠️ Gecikmiş Görevler (${overdueTasks.length})`}
                emptyMessage="Gecikmiş görev yok"
                showAddButton={false}
                compact
              />
            </motion.div>
          )}

          {/* Today Active Tasks */}
          <TaskList
            tasks={todayActiveTasks}
            title={`📋 Bugünün Görevleri (${todayActiveTasks.length})`}
            emptyMessage="Bugün için görev yok"
            emptySubMessage="Yeni bir görev ekleyerek güne başla!"
          />

          {/* Today Completed */}
          {todayCompletedTasks.length > 0 && (
            <TaskList
              tasks={todayCompletedTasks}
              title={`✅ Bugün Tamamlananlar (${todayCompletedTasks.length})`}
              showAddButton={false}
              compact
            />
          )}

          {/* Heatmap */}
          <HeatmapCalendar />
        </div>

        {/* Right Column: Stats & Insights */}
        <div className="space-y-6">
          <StreakCounter />
          <WeeklyChart />
          <ProductivityInsights />
        </div>
      </div>
    </div>
  );
};
