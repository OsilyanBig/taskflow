"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Moon,
  Sun,
  Plus,
  X,
  Menu,
  Command,
} from "lucide-react";
import { clsx } from "clsx";
import { useViewStore } from "@/stores/viewStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useGamificationStore } from "@/stores/gamificationStore";
import { useTheme } from "@/hooks/useTheme";
import { getGreeting } from "@/utils/dateUtils";
import { getDailyQuote } from "@/data/motivationalQuotes";
import { XPBar } from "@/components/gamification/XPBar";
import { Button } from "@/components/ui/Button";

export const Header: React.FC = () => {
  const { setSearchQuery, openTaskModal, isSidebarOpen, toggleSidebar } =
    useViewStore();
  const filters = useViewStore((s) => s.filters);
  const showQuotes = useSettingsStore((s) => s.showMotivationalQuotes);
  const { isDark, toggleTheme } = useTheme();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dailyQuote = getDailyQuote();

  // Ctrl+K kısayolu ile arama
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        openTaskModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openTaskModal]);

  return (
    <header
      className={clsx(
        "sticky top-0 z-30 h-[72px]",
        "glass border-b border-deep-border",
        "flex items-center justify-between gap-4 px-6"
      )}
    >
      {/* Left: Menu & Greeting */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Mobile menu toggle */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-xl hover:bg-deep-surface text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Greeting / Quote */}
        <div className="hidden sm:block min-w-0">
          <h2 className="text-sm font-semibold text-white truncate">
            {getGreeting()} 👋
          </h2>
          {showQuotes && (
            <p className="text-xs text-slate-500 truncate max-w-[300px]">
              &quot;{dailyQuote.text}&quot;{" "}
              <span className="text-slate-600">— {dailyQuote.author}</span>
            </p>
          )}
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-4">
        <div
          className={clsx(
            "relative flex items-center rounded-xl transition-all duration-200",
            "bg-deep-surface border",
            isSearchFocused
              ? "border-accent-blue shadow-glow"
              : "border-deep-border"
          )}
        >
          <Search
            size={16}
            className={clsx(
              "absolute left-3 transition-colors",
              isSearchFocused ? "text-accent-blue" : "text-slate-500"
            )}
          />
          <input
            ref={searchRef}
            type="text"
            placeholder="Görev ara..."
            value={filters.search}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full pl-10 pr-20 py-2 bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:shadow-none rounded-xl"
          />

          {/* Search shortcut badge */}
          {!isSearchFocused && !filters.search && (
            <div className="absolute right-3 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-600 bg-deep-bg border border-deep-border rounded">
                ⌘K
              </kbd>
            </div>
          )}

          {/* Clear button */}
          {filters.search && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 p-1 rounded-md hover:bg-deep-hover text-slate-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* XP Bar (compact) */}
        <div className="hidden lg:block">
          <XPBar compact />
        </div>

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-deep-surface text-slate-400 hover:text-white transition-colors"
          title={isDark ? "Açık Mod" : "Koyu Mod"}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun size={18} />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon size={18} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* New Task Button */}
        <Button
          size="sm"
          variant="accent"
          leftIcon={<Plus size={16} />}
          onClick={() => openTaskModal()}
          className="hidden sm:flex"
        >
          Yeni Görev
        </Button>

        {/* Mobile: just icon */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => openTaskModal()}
          className="sm:hidden p-2.5 rounded-xl bg-accent-blue text-white shadow-glow"
        >
          <Plus size={18} />
        </motion.button>
      </div>
    </header>
  );
};
