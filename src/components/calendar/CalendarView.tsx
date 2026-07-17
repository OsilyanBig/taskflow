"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
} from "lucide-react";
import { clsx } from "clsx";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import { tr } from "date-fns/locale";
import { useTaskStore } from "@/stores/taskStore";
import { useViewStore } from "@/stores/viewStore";
import { DAY_NAMES_SHORT, MONTH_NAMES } from "@/utils/constants";
import { CalendarDay } from "./CalendarDay";
import { TaskList } from "@/components/tasks/TaskList";
import { Button } from "@/components/ui/Button";

export const CalendarView: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const tasks = useTaskStore((s) => s.tasks);
  const { openTaskModal } = useViewStore();

  // Takvim günlerini hesapla
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // Seçili tarihin görevleri
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    return tasks.filter((t) => {
      if (t.dueDate && isSameDay(parseISO(t.dueDate), selectedDate)) return true;
      if (t.completedAt && isSameDay(parseISO(t.completedAt), selectedDate)) return true;
      return false;
    });
  }, [tasks, selectedDate]);

  // Bir günün görevlerini bul
  const getTasksForDate = (date: Date) => {
    return tasks.filter((t) => {
      if (t.dueDate && isSameDay(parseISO(t.dueDate), date)) return true;
      if (t.completedAt && isSameDay(parseISO(t.completedAt), date)) return true;
      return false;
    });
  };

  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const monthYear = format(currentMonth, "MMMM yyyy", { locale: tr });

  // Hafta başlıkları (Pzt'den başla)
  const weekHeaders = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent-blue/15">
            <Calendar size={20} className="text-accent-blue" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white capitalize">
              {monthYear}
            </h2>
            <p className="text-xs text-slate-500">
              Görevlerini takvim üzerinde görüntüle
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Bugün
          </Button>
          <div className="flex items-center gap-1 bg-deep-surface border border-deep-border rounded-xl">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToPrevMonth}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToNextMonth}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <div className="glass-card rounded-2xl p-4">
            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekHeaders.map((day) => (
                <div
                  key={day}
                  className="text-center text-[11px] font-semibold text-slate-600 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMonth.toISOString()}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-7 gap-1"
              >
                {calendarDays.map((date, index) => (
                  <CalendarDay
                    key={index}
                    date={date}
                    tasks={getTasksForDate(date)}
                    isCurrentMonth={isSameMonth(date, currentMonth)}
                    isSelected={
                      selectedDate ? isSameDay(date, selectedDate) : false
                    }
                    onClick={() => setSelectedDate(date)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Month Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {(() => {
              const monthTasks = tasks.filter((t) => {
                const monthStart = startOfMonth(currentMonth);
                const monthEnd = endOfMonth(currentMonth);
                if (t.dueDate) {
                  const due = parseISO(t.dueDate);
                  return due >= monthStart && due <= monthEnd;
                }
                return false;
              });
              const completed = monthTasks.filter(
                (t) => t.status === "completed"
              ).length;
              const pending = monthTasks.filter(
                (t) => t.status !== "completed"
              ).length;

              return (
                <>
                  <div className="glass-card rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-white">
                      {monthTasks.length}
                    </p>
                    <p className="text-[10px] text-slate-500">Toplam</p>
                  </div>
                  <div className="glass-card rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-emerald-400">
                      {completed}
                    </p>
                    <p className="text-[10px] text-slate-500">Tamamlanan</p>
                  </div>
                  <div className="glass-card rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-amber-400">
                      {pending}
                    </p>
                    <p className="text-[10px] text-slate-500">Bekleyen</p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Selected Date Tasks */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-4 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                {selectedDate
                  ? format(selectedDate, "d MMMM yyyy", { locale: tr })
                  : "Bir gün seçin"}
              </h3>
              {selectedDate && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openTaskModal()}
                >
                  <Plus size={16} />
                </Button>
              )}
            </div>

            {selectedDate ? (
              <TaskList
                tasks={selectedDateTasks}
                emptyMessage="Görev yok"
                emptySubMessage="Bu güne görev ekle"
                compact
                showAddButton={false}
              />
            ) : (
              <div className="text-center py-8">
                <Calendar size={32} className="mx-auto text-slate-700 mb-2" />
                <p className="text-xs text-slate-600">
                  Görevleri görmek için bir gün seçin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
