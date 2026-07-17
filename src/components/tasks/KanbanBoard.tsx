"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical } from "lucide-react";
import { clsx } from "clsx";
import { Task, TaskStatus } from "@/types";
import { useTaskStore } from "@/stores/taskStore";
import { useViewStore } from "@/stores/viewStore";
import { useTasks } from "@/hooks/useTasks";
import { STATUS_CONFIG } from "@/utils/constants";
import { TaskCard } from "./TaskCard";
import { ConfettiEffect } from "@/components/gamification/ConfettiEffect";
import { LevelUpModal } from "@/components/gamification/LevelUpModal";
import { AchievementBadge } from "@/components/gamification/AchievementBadge";

const COLUMN_COLORS: Record<TaskStatus, string> = {
  todo: "#6b7280",
  "in-progress": "#3b82f6",
  waiting: "#f59e0b",
  completed: "#10b981",
};

const COLUMN_BG: Record<TaskStatus, string> = {
  todo: "rgba(107, 114, 128, 0.08)",
  "in-progress": "rgba(59, 130, 246, 0.08)",
  waiting: "rgba(245, 158, 11, 0.08)",
  completed: "rgba(16, 185, 129, 0.08)",
};

interface KanbanCardProps {
  task: Task;
  onComplete: (result: any) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, onComplete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { status: task.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="relative group">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className={clsx(
            "absolute left-2 top-1/2 -translate-y-1/2 z-10",
            "p-1 rounded cursor-grab active:cursor-grabbing",
            "text-slate-700 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
          )}
        >
          <GripVertical size={14} />
        </button>
        <div className="pl-5">
          <TaskCard task={task} compact onComplete={onComplete} />
        </div>
      </div>
    </div>
  );
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onComplete: (result: any) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  tasks,
  onComplete,
}) => {
  const { openTaskModal } = useViewStore();
  const config = STATUS_CONFIG[status];
  const color = COLUMN_COLORS[status];
  const bg = COLUMN_BG[status];

  return (
    <div
      className="flex flex-col rounded-2xl min-h-[400px] min-w-[280px] flex-1"
      style={{ background: bg, border: `1px solid ${color}20` }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-current/10">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
          />
          <span
            className="text-sm font-semibold"
            style={{ color }}
          >
            {config.label}
          </span>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            color,
            backgroundColor: `${color}20`,
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 p-3 space-y-2 overflow-y-auto min-h-[100px]">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <KanbanCard key={task.id} task={task} onComplete={onComplete} />
            ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-24 text-center">
              <p className="text-xs text-slate-700">Görev yok</p>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Add Task */}
      <div className="p-3 pt-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openTaskModal()}
          className={clsx(
            "w-full flex items-center gap-2 px-3 py-2 rounded-xl",
            "border border-dashed text-xs font-medium",
            "transition-all duration-200"
          )}
          style={{
            borderColor: `${color}30`,
            color: `${color}80`,
          }}
        >
          <Plus size={14} />
          Görev Ekle
        </motion.button>
      </div>
    </div>
  );
};

export const KanbanBoard: React.FC = () => {
  const { updateTaskStatus, reorderTasks } = useTaskStore();
  const { kanbanTasks } = useTasks();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    show: boolean;
    level: number;
  }>({ show: false, level: 1 });
  const [newAchievements, setNewAchievements] = useState<any[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const columns: TaskStatus[] = ["todo", "in-progress", "waiting", "completed"];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = Object.values(kanbanTasks)
      .flat()
      .find((t) => t.id === active.id);

    if (!activeTask) return;

    // Sütun değişimi
    const overStatus = over.data?.current?.status as TaskStatus | undefined;
    const overColumn = columns.find((col) => col === over.id);
    const targetStatus = overStatus || overColumn;

    if (targetStatus && targetStatus !== activeTask.status) {
      updateTaskStatus(activeTask.id, targetStatus);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
  };

  const handleTaskComplete = (result: any) => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);

    if (result.leveledUp) {
      setTimeout(() => {
        setLevelUpData({ show: true, level: result.newLevel });
      }, 800);
    }

    if (result.newAchievements?.length > 0) {
      setNewAchievements(result.newAchievements);
      setTimeout(() => setNewAchievements([]), 5000);
    }
  };

  const activeTask = activeId
    ? Object.values(kanbanTasks)
        .flat()
        .find((t) => t.id === activeId)
    : null;

  return (
    <>
      <ConfettiEffect trigger={showConfetti} />
      <LevelUpModal
        isOpen={levelUpData.show}
        level={levelUpData.level}
        onClose={() => setLevelUpData({ show: false, level: 1 })}
      />

      {/* Achievement Notifications */}
      <div className="fixed top-24 right-4 z-50 space-y-2">
        <AnimatePresence>
          {newAchievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              isNew
            />
          ))}
        </AnimatePresence>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
          {columns.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={kanbanTasks[status]}
              onComplete={handleTaskComplete}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask && (
            <div className="rotate-3 scale-105 opacity-90 w-72">
              <TaskCard
                task={activeTask}
                compact
                onComplete={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
};
