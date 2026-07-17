"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Calendar,
  Clock,
  Tag,
  Zap,
  Link2,
  Repeat,
  Trash2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { clsx } from "clsx";
import {
  Task,
  Priority,
  EnergyLevel,
  TaskStatus,
  Subtask,
  RecurringRule,
  Tag as TagType,
} from "@/types";
import { useTaskStore } from "@/stores/taskStore";
import { useViewStore } from "@/stores/viewStore";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  PRIORITY_CONFIG,
  ENERGY_CONFIG,
  STATUS_CONFIG,
  DAY_NAMES_SHORT,
} from "@/utils/constants";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SubtaskItem } from "./SubtaskItem";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

export const TaskModal: React.FC = () => {
  const { isTaskModalOpen, editingTaskId, closeTaskModal } = useViewStore();
  const { tasks, addTask, updateTask, addSubtask, updateSubtask, deleteSubtask, toggleSubtask, reorderSubtasks, addDependency, removeDependency, setRecurringRule, addTagToTask, removeTagFromTask } = useTaskStore();
  const { categories, tags: availableTags } = useSettingsStore();

  const editingTask = editingTaskId ? tasks.find((t) => t.id === editingTaskId) : null;

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>("medium");
  const [category, setCategory] = useState("personal");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Recurring State
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [recurringType, setRecurringType] = useState<"daily" | "weekly" | "monthly" | "custom">("daily");
  const [recurringDays, setRecurringDays] = useState<number[]>([]);
  const [recurringDayOfMonth, setRecurringDayOfMonth] = useState(1);
  const [recurringInterval, setRecurringInterval] = useState(2);
  const [recurringWeekdaysOnly, setRecurringWeekdaysOnly] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<"details" | "subtasks" | "advanced">("details");

  // DnD
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Form'u doldur (edit mode)
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setPriority(editingTask.priority);
      setEnergyLevel(editingTask.energyLevel);
      setCategory(editingTask.category);
      setStatus(editingTask.status);
      setDueDate(editingTask.dueDate ? editingTask.dueDate.split("T")[0] : "");
      setEstimatedMinutes(editingTask.estimatedMinutes);
      setNotes(editingTask.notes);
      setSelectedTags(editingTask.tags);

      if (editingTask.recurring) {
        setRecurringEnabled(editingTask.recurring.enabled);
        setRecurringType(editingTask.recurring.type);
        setRecurringDays(editingTask.recurring.daysOfWeek || []);
        setRecurringDayOfMonth(editingTask.recurring.dayOfMonth || 1);
        setRecurringInterval(editingTask.recurring.intervalDays || 2);
        setRecurringWeekdaysOnly(editingTask.recurring.weekdaysOnly || false);
      }
    } else {
      resetForm();
    }
  }, [editingTask, isTaskModalOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setEnergyLevel("medium");
    setCategory("personal");
    setStatus("todo");
    setDueDate("");
    setEstimatedMinutes(30);
    setNotes("");
    setSelectedTags([]);
    setNewSubtaskTitle("");
    setRecurringEnabled(false);
    setRecurringType("daily");
    setRecurringDays([]);
    setRecurringDayOfMonth(1);
    setRecurringInterval(2);
    setRecurringWeekdaysOnly(false);
    setActiveTab("details");
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const recurring: RecurringRule | null = recurringEnabled
      ? {
          enabled: true,
          type: recurringType,
          daysOfWeek: recurringType === "weekly" ? recurringDays : undefined,
          dayOfMonth: recurringType === "monthly" ? recurringDayOfMonth : undefined,
          intervalDays: recurringType === "custom" ? recurringInterval : undefined,
          weekdaysOnly: recurringWeekdaysOnly,
        }
      : null;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: title.trim(),
        description,
        priority,
        energyLevel,
        category,
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        estimatedMinutes,
        notes,
        tags: selectedTags,
        recurring,
      });
    } else {
      addTask({
        title: title.trim(),
        description,
        priority,
        energyLevel,
        category,
        status: "todo",
        tags: selectedTags,
        subtasks: [],
        dependencies: [],
        recurring,
        notes,
        estimatedMinutes,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
    }

    closeTaskModal();
    resetForm();
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim() || !editingTask) return;
    addSubtask(editingTask.id, newSubtaskTitle.trim());
    setNewSubtaskTitle("");
  };

  const handleSubtaskDragEnd = (event: DragEndEvent) => {
    if (!editingTask) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const subtasks = editingTask.subtasks;
    const oldIndex = subtasks.findIndex((s) => s.id === active.id);
    const newIndex = subtasks.findIndex((s) => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(
        subtasks.map((s) => s.id),
        oldIndex,
        newIndex
      );
      reorderSubtasks(editingTask.id, newOrder);
    }
  };

  const toggleTag = (tag: TagType) => {
    if (selectedTags.some((t) => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
      if (editingTask) removeTagFromTask(editingTask.id, tag.id);
    } else {
      setSelectedTags([...selectedTags, tag]);
      if (editingTask) addTagToTask(editingTask.id, tag);
    }
  };

  const toggleRecurringDay = (day: number) => {
    setRecurringDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const tabs = [
    { id: "details" as const, label: "Detaylar", icon: <FileText size={14} /> },
    { id: "subtasks" as const, label: `Alt Görevler${editingTask ? ` (${editingTask.subtasks.length})` : ""}`, icon: <Plus size={14} /> },
    { id: "advanced" as const, label: "Gelişmiş", icon: <Zap size={14} /> },
  ];

  return (
    <Modal
      isOpen={isTaskModalOpen}
      onClose={closeTaskModal}
      title={editingTask ? "Görevi Düzenle" : "Yeni Görev"}
      subtitle={editingTask ? `Oluşturulma: ${new Date(editingTask.createdAt).toLocaleDateString("tr-TR")}` : "Yeni bir görev ekle"}
      size="lg"
    >
      <div className="space-y-5">
        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Görev başlığı..."
            className="w-full text-lg font-semibold bg-transparent border-none p-0 text-white placeholder-slate-600 focus:outline-none focus:ring-0"
            autoFocus
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-deep-surface">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                activeTab === tab.id
                  ? "bg-accent-blue/20 text-accent-blue"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {/* Description */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Açıklama
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Görev hakkında detaylar..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Priority & Energy Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-2 block">
                    Öncelik
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={clsx(
                          "flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all",
                          "border",
                          priority === p
                            ? "border-current bg-current/10"
                            : "border-deep-border hover:border-slate-600"
                        )}
                        style={{
                          color: priority === p ? PRIORITY_CONFIG[p].color : undefined,
                        }}
                      >
                        {PRIORITY_CONFIG[p].icon} {PRIORITY_CONFIG[p].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 mb-2 block">
                    Enerji Seviyesi
                  </label>
                  <div className="space-y-1.5">
                    {(Object.keys(ENERGY_CONFIG) as EnergyLevel[]).map((e) => (
                      <button
                        key={e}
                        onClick={() => setEnergyLevel(e)}
                        className={clsx(
                          "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all",
                          "border",
                          energyLevel === e
                            ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                            : "border-deep-border text-slate-400 hover:border-slate-600"
                        )}
                      >
                        {ENERGY_CONFIG[e].icon} {ENERGY_CONFIG[e].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category & Due Date & Time */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">
                    Tahmini Süre (dk)
                  </label>
                  <input
                    type="number"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 0)}
                    min={0}
                    step={5}
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-2 block">
                  Etiketler
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag)}
                      className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                        selectedTags.some((t) => t.id === tag.id)
                          ? "border-current bg-current/10"
                          : "border-deep-border text-slate-500 hover:border-slate-600"
                      )}
                      style={{
                        color: selectedTags.some((t) => t.id === tag.id)
                          ? tag.color
                          : undefined,
                      }}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Notlar
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ek notlar..."
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Status (edit mode only) */}
              {editingTask && (
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-2 block">
                    Durum
                  </label>
                  <div className="flex gap-1.5">
                    {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={clsx(
                          "flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all border",
                          status === s
                            ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                            : "border-deep-border text-slate-500 hover:border-slate-600"
                        )}
                      >
                        {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "subtasks" && (
            <motion.div
              key="subtasks"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              {editingTask ? (
                <>
                  {/* Add Subtask */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                      placeholder="Alt görev ekle..."
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddSubtask}
                      disabled={!newSubtaskTitle.trim()}
                      leftIcon={<Plus size={14} />}
                    >
                      Ekle
                    </Button>
                  </div>

                  {/* Subtask List */}
                  {editingTask.subtasks.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleSubtaskDragEnd}
                    >
                      <SortableContext
                        items={editingTask.subtasks.map((s) => s.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-1">
                          {editingTask.subtasks
                            .sort((a, b) => a.order - b.order)
                            .map((subtask) => (
                              <SubtaskItem
                                key={subtask.id}
                                subtask={subtask}
                                onToggle={() => toggleSubtask(editingTask.id, subtask.id)}
                                onUpdate={(updates) => updateSubtask(editingTask.id, subtask.id, updates)}
                                onDelete={() => deleteSubtask(editingTask.id, subtask.id)}
                              />
                            ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="text-center py-8 text-slate-600">
                      <Plus size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Henüz alt görev yok</p>
                      <p className="text-xs mt-1">
                        Büyük görevleri küçük adımlara böl!
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-slate-600">
                  <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Önce görevi kaydet</p>
                  <p className="text-xs mt-1">
                    Alt görev eklemek için önce görevi oluşturmalısın
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "advanced" && (
            <motion.div
              key="advanced"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-5"
            >
              {/* Recurring Tasks */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Repeat size={16} />
                    Tekrarlayan Görev
                  </label>
                  <button
                    onClick={() => setRecurringEnabled(!recurringEnabled)}
                    className={clsx(
                      "relative w-10 h-5 rounded-full transition-colors",
                      recurringEnabled ? "bg-accent-blue" : "bg-deep-surface border border-deep-border"
                    )}
                  >
                    <motion.div
                      className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white"
                      animate={{ x: recurringEnabled ? 20 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                {recurringEnabled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="space-y-3 p-3 rounded-xl bg-deep-surface border border-deep-border overflow-hidden"
                  >
                    {/* Type */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {(["daily", "weekly", "monthly", "custom"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setRecurringType(type)}
                          className={clsx(
                            "px-2 py-1.5 rounded-lg text-xs font-medium transition-all border",
                            recurringType === type
                              ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                              : "border-deep-border text-slate-500"
                          )}
                        >
                          {type === "daily" && "Günlük"}
                          {type === "weekly" && "Haftalık"}
                          {type === "monthly" && "Aylık"}
                          {type === "custom" && "Özel"}
                        </button>
                      ))}
                    </div>

                    {/* Weekly: Day Selection */}
                    {recurringType === "weekly" && (
                      <div>
                        <span className="text-xs text-slate-500 block mb-1.5">
                          Hangi günler?
                        </span>
                        <div className="flex gap-1">
                          {DAY_NAMES_SHORT.map((day, index) => (
                            <button
                              key={index}
                              onClick={() => toggleRecurringDay(index)}
                              className={clsx(
                                "flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border",
                                recurringDays.includes(index)
                                  ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                                  : "border-deep-border text-slate-500"
                              )}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Monthly: Day of Month */}
                    {recurringType === "monthly" && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          Her ayın
                        </span>
                        <select
                          value={recurringDayOfMonth}
                          onChange={(e) => setRecurringDayOfMonth(parseInt(e.target.value))}
                          className="w-20"
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                          <option value={-1}>Son gün</option>
                        </select>
                        <span className="text-xs text-slate-500">günü</span>
                      </div>
                    )}

                    {/* Custom: Interval */}
                    {recurringType === "custom" && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Her</span>
                        <input
                          type="number"
                          value={recurringInterval}
                          onChange={(e) => setRecurringInterval(parseInt(e.target.value) || 1)}
                          min={1}
                          className="w-16 text-center"
                        />
                        <span className="text-xs text-slate-500">günde bir</span>
                      </div>
                    )}

                    {/* Weekdays Only */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={recurringWeekdaysOnly}
                        onChange={(e) => setRecurringWeekdaysOnly(e.target.checked)}
                        className="custom-checkbox"
                      />
                      <span className="text-xs text-slate-400">
                        Sadece hafta içi
                      </span>
                    </label>
                  </motion.div>
                )}
              </div>

              {/* Dependencies */}
              {editingTask && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                    <Link2 size={16} />
                    Bağımlılıklar
                  </label>
                  <p className="text-xs text-slate-600 mb-2">
                    Bu görev hangi görevlerin tamamlanmasını bekliyor?
                  </p>

                  {/* Current Dependencies */}
                  {editingTask.dependencies.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {editingTask.dependencies.map((dep) => (
                        <div
                          key={dep.taskId}
                          className="flex items-center justify-between p-2 rounded-lg bg-deep-surface"
                        >
                          <span className="text-xs text-slate-400">
                            🔗 {dep.taskTitle}
                          </span>
                          <button
                            onClick={() => removeDependency(editingTask.id, dep.taskId)}
                            className="p-1 rounded hover:bg-red-500/10 text-slate-600 hover:text-red-400"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Dependency */}
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        addDependency(editingTask.id, e.target.value);
                      }
                    }}
                    className="text-sm"
                  >
                    <option value="">Bağımlılık ekle...</option>
                    {tasks
                      .filter(
                        (t) =>
                          t.id !== editingTask.id &&
                          !editingTask.dependencies.some((d) => d.taskId === t.id)
                      )
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-deep-border">
          <Button variant="ghost" onClick={closeTaskModal}>
            İptal
          </Button>
          <Button
            variant="accent"
            onClick={handleSubmit}
            disabled={!title.trim()}
            glow
          >
            {editingTask ? "Güncelle" : "Oluştur"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
