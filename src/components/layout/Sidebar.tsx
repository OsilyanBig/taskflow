"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Sun,
  CalendarDays,
  ListTodo,
  Columns3,
  Calendar,
  Trophy,
  Focus,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Zap,
  Flame,
  Target,
} from "lucide-react";
import { clsx } from "clsx";
import { ViewType } from "@/types";
import { useViewStore } from "@/stores/viewStore";
import { useGamificationStore } from "@/stores/gamificationStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { LEVELS } from "@/utils/constants";
import { calculateLevelFromXP } from "@/utils/xpCalculator";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Tooltip } from "@/components/ui/Tooltip";

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { id: "today", label: "Bugün", icon: <Sun size={20} /> },
  { id: "week", label: "Bu Hafta", icon: <CalendarDays size={20} /> },
  { id: "all-tasks", label: "Tüm Görevler", icon: <ListTodo size={20} /> },
  { id: "kanban", label: "Kanban", icon: <Columns3 size={20} /> },
  { id: "calendar", label: "Takvim", icon: <Calendar size={20} /> },
];

const secondaryNavItems: NavItem[] = [
  { id: "achievements", label: "Başarımlar", icon: <Trophy size={20} /> },
  { id: "zen", label: "Odak Modu", icon: <Focus size={20} /> },
  { id: "settings", label: "Ayarlar", icon: <Settings size={20} /> },
];

export const Sidebar: React.FC = () => {
  const { currentView, setView, isSidebarOpen, toggleSidebar, openTaskModal } =
    useViewStore();
  const { level, totalXpEarned, currentStreak } = useGamificationStore();
  const accentColor = useSettingsStore((s) => s.accentColor);

  const currentLevelInfo = LEVELS.find((l) => l.level === level) || LEVELS[0];
  const nextLevelInfo = LEVELS.find((l) => l.level === level + 1);
  const { currentLevelXp, xpToNextLevel, progress } =
    calculateLevelFromXP(totalXpEarned);

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? 280 : 72,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={clsx(
          "hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40",
          "glass-card border-r border-deep-border",
          "overflow-hidden"
        )}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between p-4 h-[72px]">
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-gradient flex items-center justify-center shadow-glow">
                  <Zap size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">
                    TaskFlow
                  </h1>
                  <p className="text-[10px] text-slate-500 -mt-0.5">
                    Başar, Geliş, Tekrarla
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isSidebarOpen && (
            <div className="w-9 h-9 rounded-xl bg-blue-gradient flex items-center justify-center shadow-glow mx-auto">
              <Zap size={20} className="text-white" />
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSidebar}
            className={clsx(
              "p-1.5 rounded-lg hover:bg-deep-surface text-slate-400 hover:text-white transition-colors",
              !isSidebarOpen && "hidden"
            )}
          >
            <ChevronLeft size={16} />
          </motion.button>
        </div>

        {/* New Task Button */}
        <div className="px-3 mb-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openTaskModal()}
            className={clsx(
              "w-full flex items-center gap-2.5 font-medium",
              "bg-blue-gradient text-white rounded-xl shadow-glow",
              "transition-all duration-200 hover:shadow-glow-lg",
              isSidebarOpen ? "px-4 py-2.5 justify-start" : "p-2.5 justify-center"
            )}
          >
            <Plus size={18} />
            {isSidebarOpen && <span className="text-sm">Yeni Görev</span>}
          </motion.button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto no-scrollbar">
          <div className="mb-3">
            {isSidebarOpen && (
              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3">
                Ana Menü
              </span>
            )}
          </div>

          {mainNavItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={currentView === item.id}
              isCollapsed={!isSidebarOpen}
              onClick={() => setView(item.id)}
            />
          ))}

          <div className="my-4 mx-3 border-t border-deep-border" />

          {isSidebarOpen && (
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3">
              Araçlar
            </span>
          )}

          {secondaryNavItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={currentView === item.id}
              isCollapsed={!isSidebarOpen}
              onClick={() => setView(item.id)}
            />
          ))}
        </nav>

        {/* Level & Streak Footer */}
        <div className="px-3 pb-4 mt-auto">
          {/* Streak */}
          {currentStreak > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={clsx(
                "flex items-center gap-2 mb-3 px-3 py-2 rounded-xl",
                "bg-orange-500/10 border border-orange-500/20",
                !isSidebarOpen && "justify-center px-2"
              )}
            >
              <Flame
                size={18}
                className="text-orange-400 animate-streak-fire"
              />
              {isSidebarOpen && (
                <div>
                  <span className="text-xs font-bold text-orange-400">
                    {currentStreak} Gün Streak
                  </span>
                  <p className="text-[10px] text-orange-400/60">
                    +%{Math.min(currentStreak * 10, 200)} bonus XP
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Level Card */}
          <div
            className={clsx(
              "rounded-xl bg-deep-surface border border-deep-border p-3",
              !isSidebarOpen && "flex items-center justify-center"
            )}
          >
            {isSidebarOpen ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{currentLevelInfo.icon}</span>
                    <div>
                      <span className="text-xs font-bold text-white">
                        Seviye {level}
                      </span>
                      <p className="text-[10px] text-slate-500">
                        {currentLevelInfo.title}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {currentLevelXp}/{xpToNextLevel}
                  </span>
                </div>
                <ProgressBar
                  value={progress}
                  height="xs"
                  gradientFrom={currentLevelInfo.color}
                  gradientTo={nextLevelInfo?.color || currentLevelInfo.color}
                  glow
                />
              </>
            ) : (
              <Tooltip content={`Seviye ${level} - ${currentLevelInfo.title}`}>
                <span className="text-lg cursor-default">
                  {currentLevelInfo.icon}
                </span>
              </Tooltip>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Collapsed toggle button (desktop) */}
      {!isSidebarOpen && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className="hidden md:flex fixed left-[72px] top-5 z-50 p-1.5 rounded-lg bg-deep-surface border border-deep-border text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight size={14} />
        </motion.button>
      )}
    </>
  );
};

// ============================================
// NAV BUTTON COMPONENT
// ============================================

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({
  item,
  isActive,
  isCollapsed,
  onClick,
}) => {
  const button = (
    <motion.button
      whileHover={{ x: isCollapsed ? 0 : 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={clsx(
        "w-full flex items-center gap-3 rounded-xl transition-all duration-200",
        isCollapsed ? "p-2.5 justify-center" : "px-3 py-2.5",
        isActive
          ? "bg-accent-blue/10 text-accent-blue shadow-sm"
          : "text-slate-400 hover:text-white hover:bg-deep-surface"
      )}
    >
      <span
        className={clsx(
          "flex-shrink-0 transition-colors",
          isActive && "text-accent-blue"
        )}
      >
        {item.icon}
      </span>
      {!isCollapsed && (
        <span className="text-sm font-medium truncate">{item.label}</span>
      )}
      {!isCollapsed && item.badge && item.badge > 0 && (
        <span className="ml-auto text-xs bg-accent-blue/20 text-accent-blue px-2 py-0.5 rounded-full font-bold">
          {item.badge}
        </span>
      )}
    </motion.button>
  );

  if (isCollapsed) {
    return <Tooltip content={item.label} position="right">{button}</Tooltip>;
  }

  return button;
};
