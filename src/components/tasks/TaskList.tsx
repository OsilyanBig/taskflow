"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ListTodo, Plus, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { Task } from "@/types";
import { useTaskStore } from "@/stores/taskStore";
import { useViewStore } from "@/stores/viewStore";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/Button";
import { ConfettiEffect } from "@/components/gamification/ConfettiEffect";
import { LevelUpModal } from "@/components/gamification/LevelUpModal";
import { AchievementBadge } from "@/components/gamification/AchievementBadge";

interface TaskListProps {
  tasks: Task[];
  emptyMessage?: string;
  emptySubMessage?: string;
  showAddButton?: boolean;
  compact?: boolean;
  title?: string;
  className?: string;
}

interface SortableTaskCardProps {
  task: Task;
  compact: boolean;
  onComplete: (result: any) => void;
}

const SortableTaskCard: React.FC<SortableTaskCardProps> = ({
  task,
  compact,
  onComplete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} compact={compact} onComplete={onComplete} />
    </div>
  );
};

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  emptyMessage = "Görev bulunamadı",
  emptySubMessage = "Yeni bir görev ekleyerek başla!",
  showAddButton = true,
  compact = false,
  title,
  className,
}) => {
  const { reorderTasks } = useTaskStore();
  const { openTaskModal } = useViewStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    show: boolean;
    level: number;
    levelInfo: any;
  }>({ show: false, level: 1, levelInfo: null });
  const [newAchievements, setNewAchievements] = useState<any[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(
        tasks.map((t) => t.id),
        oldIndex,
        newIndex
      );
      reorderTasks(newOrder);
    }
  };

  const handleTaskComplete = (result: any) => {
    // Confetti
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);

    // Level up
    if (result.leveledUp) {
      setTimeout(() => {
        setLevelUpData({
          show: true,
          level: result.newLevel,
          levelInfo: result,
        });
      }, 800);
    }

    // Achievements
    if (result.newAchievements && result.newAchievements.length > 0) {
      setNewAchievements(result.newAchievements);
      setTimeout(() => setNewAchievements([]), 5000);
    }
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <>
      {/* Confetti */}
      <ConfettiEffect trigger={showConfetti} />

      {/* Level Up Modal */}
      <LevelUpModal
        isOpen={levelUpData.show}
        level={levelUpData.level}
        onClose={() => setLevelUpData({ show: false, level: 1, levelInfo: null })}
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

      <div className={clsx("space-y-3", className)}>
        {/* Title */}
        {title && (
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              {title}
            </h3>
            <span className="text-xs text-slate-600 font-mono">
              {tasks.length} görev
            </span>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-deep-surface border border-deep-border flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-slate-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-400 mb-1">
              {emptyMessage}
            </h3>
            <p className="text-sm text-slate-600 mb-6">{emptySubMessage}</p>
            {showAddButton && (
              <Button
                variant="accent"
                size="sm"
                leftIcon={<Plus size={16} />}
                onClick={() => openTaskModal()}
                glow
              >
                Görev Ekle
              </Button>
            )}
          </motion.div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {tasks.map((task) => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      compact={compact}
                      onComplete={handleTaskComplete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeTask && (
                <div className="rotate-2 scale-105 opacity-90">
                  <TaskCard
                    task={activeTask}
                    compact={compact}
                    onComplete={() => {}}
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}

        {/* Add Button at bottom */}
        {showAddButton && tasks.length > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => openTaskModal()}
            className={clsx(
              "w-full flex items-center gap-2 px-4 py-3 rounded-xl",
              "border border-dashed border-deep-border",
              "text-slate-600 hover:text-slate-400 hover:border-slate-600",
              "transition-all duration-200 text-sm"
            )}
          >
            <Plus size={16} />
            Görev ekle
          </motion.button>
        )}
      </div>
    </>
  );
};
