"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Lock,
  Zap,
  AlertTriangle,
  Repeat,
} from "lucide-react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { Task } from "@/types";
import { useTaskStore } from "@/stores/taskStore";
import { useViewStore } from "@/stores/viewStore";
import { useGamification } from "@/hooks/useGamification";
import { useSound } from "@/hooks/useSound";
import { PRIORITY_CONFIG, ENERGY_CONFIG } from "@/utils/constants";
import { getDueDateStatus } from "@/utils/dateUtils";
import { getRecurringDescription } from "@/utils/recurringTasks";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  showCategory?: boolean;
  onComplete?: (result: any) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  compact = false,
  showCategory = true,
  onComplete,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const { deleteTask, duplicateTask, toggleSubtask, canStartTask } =
    useTaskStore();
  const { openTaskModal } = useViewStore();
  const { completeTaskWithRewards } = useGamification();
  const { playCompleteEffect, playErrorEffect } = useSound();

  const priority = PRIORITY_CONFIG[task.priority];
  const energy = ENERGY_CONFIG[task.energyLevel];
  const dueDateInfo = getDueDateStatus(task.dueDate);
  const isLocked = !canStartTask(task.id);
  const isCompleted = task.status === "completed";

  const subtaskProgress =
    task.subtasks.length > 0
      ? (task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100
      : 0;

  // Menü dışına tıklanınca kapat
  useEffect(() => {
    if (showMenu) {
      const handleClickOutside = () => setShowMenu(false);
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showMenu]);

  const handleComplete = async () => {
    if (isLocked) {
      playErrorEffect();
      return;
    }
    if (isCompleted) return;

    setIsCompleting(true);
    playCompleteEffect();

    setTimeout(() => {
      const result = completeTaskWithRewards(task.id);
      if (result && onComplete) {
        onComplete(result);
      }
      setIsCompleting(false);
    }, 400);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 176,
      });
    }
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    openTaskModal(task.id);
    setShowMenu(false);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateTask(task.id);
    setShowMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
    setShowMenu(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      whileHover={{ y: -2 }}
      className={clsx(
        "group relative glass-card rounded-2xl overflow-hidden transition-all duration-300",
        `priority-${task.priority}`,
        isCompleted && "opacity-60",
        isCompleting && "task-complete-animation",
        isLocked && "opacity-70"
      )}
    >
      <div className={clsx("p-4", compact && "p-3")}>
        <div className="flex items-start gap-3">
          {/* Complete Button */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={handleComplete}
            disabled={isLocked || isCompleted}
            className={clsx(
              "flex-shrink-0 mt-0.5 transition-all duration-200",
              isCompleted
                ? "text-emerald-400"
                : isLocked
                ? "text-slate-600 cursor-not-allowed"
                : "text-slate-500 hover:text-accent-blue"
            )}
          >
            {isCompleted ? (
              <CheckCircle2 size={22} className="fill-emerald-400/20" />
            ) : isLocked ? (
              <Lock size={20} />
            ) : (
              <Circle size={22} />
            )}
          </motion.button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={clsx(
                "font-semibold text-sm leading-snug",
                isCompleted
                  ? "line-through text-slate-500"
                  : "text-white"
              )}
            >
              {task.title}
            </h3>

            {task.description && !compact && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge
                color={priority.color}
                bgColor={priority.bgColor}
                size="sm"
              >
                {priority.icon} {!compact && priority.label}
              </Badge>

              {!compact && (
                <Badge
                  color={energy.color}
                  bgColor={`${energy.color}20`}
                  size="sm"
                >
                  {energy.icon}
                </Badge>
              )}

              {dueDateInfo.label && (
                <Badge
                  color={dueDateInfo.color}
                  bgColor={`${dueDateInfo.color}15`}
                  size="sm"
                  icon={
                    dueDateInfo.isOverdue ? (
                      <AlertTriangle size={10} />
                    ) : (
                      <Calendar size={10} />
                    )
                  }
                >
                  {dueDateInfo.label}
                </Badge>
              )}

              {task.estimatedMinutes > 0 && !compact && (
                <Badge
                  color="#6b7280"
                  bgColor="rgba(107, 114, 128, 0.15)"
                  size="sm"
                  icon={<Clock size={10} />}
                >
                  {task.estimatedMinutes}dk
                </Badge>
              )}

              {task.recurring?.enabled && (
                <Badge
                  color="#8b5cf6"
                  bgColor="rgba(139, 92, 246, 0.15)"
                  size="sm"
                  icon={<Repeat size={10} />}
                >
                  {compact ? "" : getRecurringDescription(task.recurring)}
                </Badge>
              )}

              {showCategory && !compact && (
                <span className="text-[10px] text-slate-600">
                  {task.category}
                </span>
              )}
            </div>

            {/* Tags */}
            {task.tags.length > 0 && !compact && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    color={tag.color}
                    bgColor={`${tag.color}15`}
                    size="sm"
                  >
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Dependencies Warning */}
            {isLocked && task.dependencies.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-400/80">
                <Lock size={12} />
                <span>
                  Bekliyor:{" "}
                  {task.dependencies.map((d) => d.taskTitle).join(", ")}
                </span>
              </div>
            )}

            {/* Subtasks Progress */}
            {task.subtasks.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setShowSubtasks(!showSubtasks)}
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors w-full"
                >
                  <ProgressBar
                    value={subtaskProgress}
                    height="xs"
                    className="flex-1"
                    animated={false}
                  />
                  <span className="text-[10px] font-mono whitespace-nowrap">
                    {task.subtasks.filter((s) => s.completed).length}/
                    {task.subtasks.length}
                  </span>
                  {showSubtasks ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>

                <AnimatePresence>
                  {showSubtasks && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 space-y-1 overflow-hidden"
                    >
                      {task.subtasks
                        .sort((a, b) => a.order - b.order)
                        .map((subtask) => (
                          <div
                            key={subtask.id}
                            className="flex items-center gap-2 pl-1"
                          >
                            <button
                              onClick={() => toggleSubtask(task.id, subtask.id)}
                              className={clsx(
                                "flex-shrink-0 w-4 h-4 rounded border transition-all",
                                "flex items-center justify-center",
                                subtask.completed
                                  ? "bg-accent-blue border-accent-blue"
                                  : "border-slate-600 hover:border-accent-blue"
                              )}
                            >
                              {subtask.completed && (
                                <svg
                                  className="w-2.5 h-2.5 text-white"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </button>
                            <span
                              className={clsx(
                                "text-xs",
                                subtask.completed
                                  ? "line-through text-slate-600"
                                  : "text-slate-400"
                              )}
                            >
                              {subtask.title}
                            </span>
                          </div>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* XP Earned */}
            {isCompleted && task.xpEarned > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-amber-400">
                <Zap size={12} />
                <span>+{task.xpEarned} XP kazanıldı</span>
              </div>
            )}
          </div>

          {/* Menu Button */}
          <motion.button
            ref={menuButtonRef}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleMenuClick}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-deep-surface text-slate-500 hover:text-white transition-all"
          >
            <MoreHorizontal size={16} />
          </motion.button>
        </div>
      </div>

      {/* Dropdown Menu - Portal */}
      {showMenu &&
        typeof document !== "undefined" &&
        createPortal(
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed w-44 py-1 rounded-xl shadow-2xl"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              zIndex: 99999,
              background: "rgba(15, 23, 41, 0.98)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            <button
              onClick={handleEdit}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Pencil size={14} />
              Düzenle
            </button>
            <button
              onClick={handleDuplicate}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Copy size={14} />
              Kopyala
            </button>
            <div className="my-1 border-t border-white/5" />
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={14} />
              Sil
            </button>
          </motion.div>,
          document.body
        )}
    </motion.div>
  );
};
