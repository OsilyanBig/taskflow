"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Sun,
  ListTodo,
  Columns3,
  Trophy,
  MoreHorizontal,
} from "lucide-react";
import { clsx } from "clsx";
import { ViewType } from "@/types";
import { useViewStore } from "@/stores/viewStore";

interface MobileNavItem {
  id: ViewType;
  label: string;
  icon: React.ReactNode;
}

const mobileNavItems: MobileNavItem[] = [
  { id: "dashboard", label: "Ana Sayfa", icon: <LayoutDashboard size={20} /> },
  { id: "today", label: "Bugün", icon: <Sun size={20} /> },
  { id: "all-tasks", label: "Görevler", icon: <ListTodo size={20} /> },
  { id: "kanban", label: "Kanban", icon: <Columns3 size={20} /> },
  { id: "achievements", label: "Başarım", icon: <Trophy size={20} /> },
];

export const MobileNav: React.FC = () => {
  const { currentView, setView } = useViewStore();

  return (
    <nav
      className={clsx(
        "md:hidden fixed bottom-0 left-0 right-0 z-50",
        "glass border-t border-deep-border",
        "px-2 pb-safe"
      )}
    >
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => {
          const isActive = currentView === item.id;

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => setView(item.id)}
              className={clsx(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
                "min-w-[56px]",
                isActive
                  ? "text-accent-blue"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="absolute -top-0.5 w-8 h-1 bg-accent-blue rounded-full shadow-glow"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              <span className="relative">
                {item.icon}
                {isActive && (
                  <motion.div
                    layoutId="mobileNavGlow"
                    className="absolute inset-0 bg-accent-blue/20 rounded-full blur-md"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </span>

              <span
                className={clsx(
                  "text-[10px] font-medium",
                  isActive ? "text-accent-blue" : "text-slate-500"
                )}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
