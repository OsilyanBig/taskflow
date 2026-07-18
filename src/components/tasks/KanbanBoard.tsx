"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical } from "lucide-react";
import { clsx } from "clsx";
import { Task, TaskStatus } from "@/types";
import { useTaskStore } from "@/stores/taskStore";
import { useViewStore } from "@/stores/viewStore";
import { useTasks } from "@/hooks/useTasks";
import { useGamification } from "@/hooks/useGamification";
import { STATUS_CONFIG } from "@/utils/constants";
import { Badge } from "@/components/ui/Badge";
import { PRIORITY_CONFIG } from "@/utils/constants";
import { ConfettiEffect } from "@/components/gamification/ConfettiEffect";

const COLUMN_COLORS: Record<TaskStatus, string> = {
  todo: "#6b7280",
  "in-progress": "#3b82f6",
  waiting: "#f59e0b",
  completed: "#10b981",
};

// ============================================
// KANBAN CARD (Sortable)
// ============================================
interface KanbanCardProps {
  task: Task;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", status: task.status },
  });

  const priority = PRIORITY_CONFIG[task.priority];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...attributes}
        {...listeners}
        className={clsx(
          "p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all",
          "bg-deep-bg/60 border border-deep-border hover:border-slate-600",
          `priority-${task.priority}`,
          task.status === "completed" && "opacity-60"
        )}
      >
        <div className="flex items-start gap-2">
          <GripVertical size={14} className="text-slate-700 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4
              className={clsx(
                "text-xs font-semibold leading-snug",
                task.status === "completed"
                  ? "line-through text-slate-500"
                  : "text-white"
              )}
            >
              {task.title}
            </h4>

            <div className="flex items-center gap-1.5 mt-1.5">
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  color: priority.color,
                  backgroundColor: priority.bgColor,
                }}
              >
                {priority.icon}
              </span>

              {task.subtasks.length > 0 && (
                <span className="text-[9px] text-slate-600">
                  {task.subtasks.filter((s) => s.completed).length}/
                  {task.subtasks.length}
                </span>
              )}

              {task.dueDate && (
                <span className="text-[9px] text-slate-600">
                  📅 {new Date(task.dueDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// KANBAN COLUMN (Droppable)
// ============================================
interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks }) => {
  const { openTaskModal } = useViewStore();
  const config = STATUS_CONFIG[status];
  const color = COLUMN_COLORS[status];

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { type: "column", status },
  });

  return (
    <div
      className={clsx(
        "flex flex-col rounded-2xl min-h-[400px] min-w-[260px] flex-1 transition-all duration-200",
        isOver && "ring-2 ring-accent-blue/50"
      )}
      style={{
        background: isOver
          ? "rgba(59, 130, 246, 0.05)"
          : `${color}08`,
        border: `1px solid ${isOver ? "rgba(59, 130, 246, 0.3)" : `${color}20`}`,
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
          />
          <span className="text-sm font-semibold" style={{ color }}>
            {config.label}
          </span>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ color, backgroundColor: `${color}20` }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <div ref={setNodeRef} className="flex-1 px-3 pb-3 space-y-2 overflow-y-auto min-h-[80px]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20">
            <p className="text-[10px] text-slate-700">
              {isOver ? "Buraya bırak" : "Görev yok"}
            </p>
          </div>
        )}
      </div>

      {/* Add Task */}
      <div className="p-3 pt-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openTaskModal()}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed text-xs font-medium transition-all"
          style={{ borderColor: `${color}30`, color: `${color}80` }}
        >
          <Plus size={14} />
          Görev Ekle
        </motion.button>
      </div>
    </div>
  );
};

// ============================================
// DRAG OVERLAY CARD
// ============================================
const DragOverlayCard: React.FC<{ task: Task }> = ({ task }) => {
  const priority = PRIORITY_CONFIG[task.priority];

  return (
    <div
      className={clsx(
        "p-3 rounded-xl w-[250px] rotate-3 scale-105",
        "bg-deep-surface border border-accent-blue/40",
        "shadow-2xl shadow-blue-500/20",
        `priority-${task.priority}`
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-white">{task.title}</h4>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ color: priority.color, backgroundColor: priority.bgColor }}
            >
              {priority.icon} {priority.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// KANBAN BOARD (Main)
// ============================================
export const KanbanBoard: React.FC = () => {
  const { updateTaskStatus } = useTaskStore();
  const { kanbanTasks } = useTasks();
  const { completeTaskWithRewards } = useGamification();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const columns: TaskStatus[] = ["todo", "in-progress", "waiting", "completed"];

  const allTasks = Object.values(kanbanTasks).flat();

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const activeTask = allTasks.find((t) => t.id === active.id);
      if (!activeTask) return;

      // Sütun üzerine bırakma
      let targetStatus: TaskStatus | null = null;

      // Sütuna bırakıldıysa
      if (String(over.id).startsWith("column-")) {
        targetStatus = String(over.id).replace("column-", "") as TaskStatus;
      }
      // Başka bir task'ın üzerine bırakıldıysa
      else {
        const overTask = allTasks.find((t) => t.id === over.id);
        if (overTask) {
          targetStatus = overTask.status;
        }
      }

      if (targetStatus && targetStatus !== activeTask.status) {
        updateTaskStatus(activeTask.id, targetStatus);

        // Tamamlanana sürüklenirse confetti
        if (targetStatus === "completed") {
          const result = completeTaskWithRewards(activeTask.id);
          if (result) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
          }
        }
      }
    },
    [allTasks, updateTaskStatus, completeTaskWithRewards]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const activeTask = activeId ? allTasks.find((t) => t.id === activeId) : null;

  return (
    <>
      <ConfettiEffect trigger={showConfetti} />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
          {columns.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={kanbanTasks[status] || []}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeTask ? <DragOverlayCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </>
  );
};
