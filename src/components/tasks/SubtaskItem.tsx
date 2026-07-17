"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GripVertical, Trash2, Clock, Pencil, Check, X } from "lucide-react";
import { clsx } from "clsx";
import { Subtask } from "@/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: () => void;
  onUpdate: (updates: Partial<Subtask>) => void;
  onDelete: () => void;
  isDraggable?: boolean;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  onToggle,
  onUpdate,
  onDelete,
  isDraggable = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subtask.title);
  const [editMinutes, setEditMinutes] = useState(subtask.estimatedMinutes);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: subtask.id,
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate({
        title: editTitle.trim(),
        estimatedMinutes: editMinutes,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(subtask.title);
    setEditMinutes(subtask.estimatedMinutes);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-deep-surface border border-deep-border">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none focus:ring-0 p-0"
          autoFocus
        />
        <div className="flex items-center gap-1">
          <Clock size={12} className="text-slate-500" />
          <input
            type="number"
            value={editMinutes}
            onChange={(e) => setEditMinutes(parseInt(e.target.value) || 0)}
            onKeyDown={handleKeyDown}
            className="w-12 bg-deep-bg border border-deep-border rounded px-1.5 py-0.5 text-xs text-slate-300 focus:outline-none focus:ring-0 text-center"
            min={0}
          />
          <span className="text-[10px] text-slate-600">dk</span>
        </div>
        <button
          onClick={handleSave}
          className="p-1 rounded hover:bg-emerald-500/20 text-emerald-400 transition-colors"
        >
          <Check size={14} />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      className={clsx(
        "group flex items-center gap-2 p-2 rounded-lg transition-all",
        "hover:bg-deep-surface/50",
        isDragging && "shadow-lg z-50 bg-deep-surface",
        subtask.completed && "opacity-60"
      )}
    >
      {/* Drag Handle */}
      {isDraggable && (
        <button
          {...attributes}
          {...listeners}
          className="p-0.5 rounded text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={14} />
        </button>
      )}

      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={clsx(
          "flex-shrink-0 w-[18px] h-[18px] rounded-md border-2 transition-all duration-200",
          "flex items-center justify-center",
          subtask.completed
            ? "bg-accent-blue border-accent-blue"
            : "border-slate-600 hover:border-accent-blue"
        )}
      >
        {subtask.completed && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.polyline
              points="20 6 9 17 4 12"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            />
          </motion.svg>
        )}
      </button>

      {/* Title */}
      <span
        className={clsx(
          "flex-1 text-sm transition-all",
          subtask.completed
            ? "line-through text-slate-500"
            : "text-slate-300"
        )}
      >
        {subtask.title}
      </span>

      {/* Estimated time */}
      {subtask.estimatedMinutes > 0 && (
        <span className="flex items-center gap-1 text-[10px] text-slate-600">
          <Clock size={10} />
          {subtask.estimatedMinutes}dk
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 rounded hover:bg-deep-surface text-slate-600 hover:text-slate-300 transition-colors"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  );
};
