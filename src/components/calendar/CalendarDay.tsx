"use client";

import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { Task } from "@/types";
import { isToday, isSameDay } from "date-fns";
import { PRIORITY_CONFIG } from "@/utils/constants";

interface CalendarDayProps {
  date: Date;
  tasks: Task[];
  isCurrentMonth: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  tasks,
  isCurrentMonth,
  isSelected,
  onClick,
}) => {
  const today = isToday(date);
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const activeTasks = tasks.filter((t) => t.status !== "completed");
  const hasOverdue = activeTasks.some((t) => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date() && !isToday(new Date(t.dueDate));
  });

  const maxVisibleTasks = 3;
  const visibleTasks = tasks.slice(0, maxVisibleTasks);
  const remainingCount = tasks.length - maxVisibleTasks;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={clsx(
        "flex flex-col p-2 rounded-xl min-h-[100px] text-left transition-all border",
        isCurrentMonth
          ? "bg-deep-surface/50"
          : "bg-transparent opacity-40",
        isSelected
          ? "border-accent-blue bg-accent-blue/5 shadow-glow"
          : "border-deep-border/50 hover:border-deep-border",
        today && !isSelected && "border-accent-blue/40"
      )}
    >
      {/* Day Number */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={clsx(
            "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg",
            today
              ? "bg-accent-blue text-white"
              : isCurrentMonth
              ? "text-slate-300"
              : "text-slate-700"
          )}
        >
          {date.getDate()}
        </span>

        {/* Task count badge */}
        {tasks.length > 0 && (
          <div className="flex items-center gap-1">
            {completedTasks.length > 0 && (
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                ✓{completedTasks.length}
              </span>
            )}
            {hasOverdue && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            )}
          </div>
        )}
      </div>

      {/* Task Items */}
      <div className="flex-1 space-y-0.5 overflow-hidden">
        {visibleTasks.map((task) => (
          <div
            key={task.id}
            className={clsx(
              "text-[10px] px-1.5 py-0.5 rounded truncate",
              task.status === "completed"
                ? "text-slate-600 line-through bg-emerald-500/5"
                : "text-slate-400"
            )}
            style={{
              borderLeft: `2px solid ${PRIORITY_CONFIG[task.priority].color}`,
              backgroundColor:
                task.status !== "completed"
                  ? `${PRIORITY_CONFIG[task.priority].color}08`
                  : undefined,
            }}
          >
            {task.title}
          </div>
        ))}
        {remainingCount > 0 && (
          <span className="text-[9px] text-slate-600 pl-1.5">
            +{remainingCount} daha
          </span>
        )}
      </div>
    </motion.button>
  );
};
