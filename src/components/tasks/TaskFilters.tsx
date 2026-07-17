"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  Search,
  SortAsc,
  SortDesc,
  X,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { clsx } from "clsx";
import { Priority, EnergyLevel, TaskStatus } from "@/types";
import { useViewStore } from "@/stores/viewStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { PRIORITY_CONFIG, ENERGY_CONFIG, STATUS_CONFIG } from "@/utils/constants";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const TaskFilters: React.FC = () => {
  const { filters, setFilter, resetFilters } = useViewStore();
  const { categories, tags } = useSettingsStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.energyLevel !== "all" ||
    filters.category !== "all" ||
    filters.tags.length > 0 ||
    filters.search !== "";

  const activeFilterCount = [
    filters.status !== "all",
    filters.priority !== "all",
    filters.energyLevel !== "all",
    filters.category !== "all",
    filters.tags.length > 0,
  ].filter(Boolean).length;

  const sortOptions = [
    { value: "order", label: "Varsayılan" },
    { value: "dueDate", label: "Son Tarih" },
    { value: "priority", label: "Öncelik" },
    { value: "createdAt", label: "Oluşturulma" },
    { value: "title", label: "Başlık" },
  ];

  return (
    <div className="space-y-3">
      {/* Top Bar */}
      <div className="flex items-center gap-2">
        {/* Filter Toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border",
            isExpanded || hasActiveFilters
              ? "bg-accent-blue/10 border-accent-blue/30 text-accent-blue"
              : "bg-deep-surface border-deep-border text-slate-400 hover:text-white"
          )}
        >
          <Filter size={15} />
          <span>Filtrele</span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-blue text-white text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={14} />
          </motion.div>
        </motion.button>

        {/* Sort */}
        <div className="flex items-center gap-1 bg-deep-surface border border-deep-border rounded-xl overflow-hidden">
          <select
            value={filters.sortBy}
            onChange={(e) => setFilter("sortBy", e.target.value as any)}
            className="bg-transparent border-none text-sm text-slate-400 py-2 pl-3 pr-1 focus:outline-none focus:ring-0 cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              setFilter(
                "sortDirection",
                filters.sortDirection === "asc" ? "desc" : "asc"
              )
            }
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            {filters.sortDirection === "asc" ? (
              <SortAsc size={15} />
            ) : (
              <SortDesc size={15} />
            )}
          </button>
        </div>

        {/* Show Completed Toggle */}
        <button
          onClick={() => setFilter("showCompleted", !filters.showCompleted)}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all border",
            filters.showCompleted
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-deep-surface border-deep-border text-slate-500 hover:text-slate-300"
          )}
        >
          {filters.showCompleted ? <Eye size={15} /> : <EyeOff size={15} />}
          <span className="hidden sm:inline">
            {filters.showCompleted ? "Tamamlananlar" : "Tamamlananlar"}
          </span>
        </button>

        {/* Reset */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              leftIcon={<X size={14} />}
            >
              Temizle
            </Button>
          </motion.div>
        )}
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="glass-card rounded-2xl p-4 space-y-4">
              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                  Durum
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    label="Tümü"
                    isActive={filters.status === "all"}
                    onClick={() => setFilter("status", "all")}
                  />
                  {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
                    <FilterChip
                      key={s}
                      label={`${STATUS_CONFIG[s].icon} ${STATUS_CONFIG[s].label}`}
                      isActive={filters.status === s}
                      color={STATUS_CONFIG[s].color}
                      onClick={() =>
                        setFilter("status", filters.status === s ? "all" : s)
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                  Öncelik
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    label="Tümü"
                    isActive={filters.priority === "all"}
                    onClick={() => setFilter("priority", "all")}
                  />
                  {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                    <FilterChip
                      key={p}
                      label={`${PRIORITY_CONFIG[p].icon} ${PRIORITY_CONFIG[p].label}`}
                      isActive={filters.priority === p}
                      color={PRIORITY_CONFIG[p].color}
                      onClick={() =>
                        setFilter(
                          "priority",
                          filters.priority === p ? "all" : p
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Energy */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                  Enerji Seviyesi
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    label="Tümü"
                    isActive={filters.energyLevel === "all"}
                    onClick={() => setFilter("energyLevel", "all")}
                  />
                  {(Object.keys(ENERGY_CONFIG) as EnergyLevel[]).map((e) => (
                    <FilterChip
                      key={e}
                      label={`${ENERGY_CONFIG[e].icon} ${ENERGY_CONFIG[e].label}`}
                      isActive={filters.energyLevel === e}
                      color={ENERGY_CONFIG[e].color}
                      onClick={() =>
                        setFilter(
                          "energyLevel",
                          filters.energyLevel === e ? "all" : e
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                  Kategori
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    label="Tümü"
                    isActive={filters.category === "all"}
                    onClick={() => setFilter("category", "all")}
                  />
                  {categories.map((cat) => (
                    <FilterChip
                      key={cat.id}
                      label={`${cat.icon} ${cat.name}`}
                      isActive={filters.category === cat.id}
                      color={cat.color}
                      onClick={() =>
                        setFilter(
                          "category",
                          filters.category === cat.id ? "all" : cat.id
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                  Etiketler
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => {
                    const isActive = filters.tags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => {
                          if (isActive) {
                            setFilter(
                              "tags",
                              filters.tags.filter((t) => t !== tag.id)
                            );
                          } else {
                            setFilter("tags", [...filters.tags, tag.id]);
                          }
                        }}
                        className={clsx(
                          "px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                          isActive
                            ? "border-current bg-current/10"
                            : "border-deep-border text-slate-500 hover:border-slate-600"
                        )}
                        style={{ color: isActive ? tag.color : undefined }}
                      >
                        #{tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Chips */}
      {hasActiveFilters && !isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-1.5"
        >
          {filters.status !== "all" && (
            <ActiveChip
              label={`${STATUS_CONFIG[filters.status as TaskStatus]?.icon} ${STATUS_CONFIG[filters.status as TaskStatus]?.label}`}
              onRemove={() => setFilter("status", "all")}
            />
          )}
          {filters.priority !== "all" && (
            <ActiveChip
              label={`${PRIORITY_CONFIG[filters.priority as Priority]?.icon} ${PRIORITY_CONFIG[filters.priority as Priority]?.label}`}
              onRemove={() => setFilter("priority", "all")}
            />
          )}
          {filters.energyLevel !== "all" && (
            <ActiveChip
              label={`${ENERGY_CONFIG[filters.energyLevel as EnergyLevel]?.icon} ${ENERGY_CONFIG[filters.energyLevel as EnergyLevel]?.label}`}
              onRemove={() => setFilter("energyLevel", "all")}
            />
          )}
          {filters.category !== "all" && (
            <ActiveChip
              label={filters.category}
              onRemove={() => setFilter("category", "all")}
            />
          )}
          {filters.tags.map((tagId) => {
            const tag = tags.find((t) => t.id === tagId);
            return tag ? (
              <ActiveChip
                key={tagId}
                label={`#${tag.name}`}
                onRemove={() =>
                  setFilter(
                    "tags",
                    filters.tags.filter((t) => t !== tagId)
                  )
                }
              />
            ) : null;
          })}
        </motion.div>
      )}
    </div>
  );
};

// ============================================
// SUB COMPONENTS
// ============================================

const FilterChip: React.FC<{
  label: string;
  isActive: boolean;
  color?: string;
  onClick: () => void;
}> = ({ label, isActive, color, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className={clsx(
      "px-3 py-1.5 rounded-xl text-xs font-medium transition-all border",
      isActive
        ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
        : "border-deep-border text-slate-500 hover:text-slate-300 hover:border-slate-600"
    )}
    style={
      isActive && color
        ? { borderColor: `${color}50`, color, backgroundColor: `${color}15` }
        : {}
    }
  >
    {label}
  </motion.button>
);

const ActiveChip: React.FC<{
  label: string;
  onRemove: () => void;
}> = ({ label, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/30 text-accent-blue text-xs font-medium"
  >
    {label}
    <button
      onClick={onRemove}
      className="hover:opacity-70 transition-opacity ml-0.5"
    >
      <X size={12} />
    </button>
  </motion.div>
);
