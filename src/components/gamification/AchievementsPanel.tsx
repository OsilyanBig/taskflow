"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Lock, Star, Filter, Search } from "lucide-react";
import { clsx } from "clsx";
import { Achievement } from "@/types";
import { useGamification } from "@/hooks/useGamification";
import { getAchievementProgress } from "@/utils/achievements";
import { useGamificationStore } from "@/stores/gamificationStore";
import { useTaskStore } from "@/stores/taskStore";
import { AchievementBadge } from "./AchievementBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";

type AchievementCategory = "all" | "streak" | "productivity" | "explorer" | "mastery" | "special";

const CATEGORY_LABELS: Record<AchievementCategory, { label: string; icon: string }> = {
  all: { label: "Tümü", icon: "🏆" },
  streak: { label: "Streak", icon: "🔥" },
  productivity: { label: "Üretkenlik", icon: "📋" },
  explorer: { label: "Keşif", icon: "🔍" },
  mastery: { label: "Ustalık", icon: "🎯" },
  special: { label: "Özel", icon: "⭐" },
};

export const AchievementsPanel: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<AchievementCategory>("all");
  const [showLocked, setShowLocked] = useState(true);

  const { achievements, achievementStats } = useGamification();
  const gamificationState = useGamificationStore();
  const tasks = useTaskStore((s) => s.tasks);

  const filteredAchievements = useMemo(() => {
    let filtered = achievements;

    if (activeCategory !== "all") {
      filtered = filtered.filter((a) => a.category === activeCategory);
    }

    if (!showLocked) {
      filtered = filtered.filter((a) => a.unlockedAt !== null);
    }

    // Açılanları üste, kilitlileri alta sırala
    filtered.sort((a, b) => {
      if (a.unlockedAt && !b.unlockedAt) return -1;
      if (!a.unlockedAt && b.unlockedAt) return 1;
      // İkisi de açıksa tarihe göre
      if (a.unlockedAt && b.unlockedAt) {
        return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
      }
      return 0;
    });

    return filtered;
  }, [achievements, activeCategory, showLocked]);

  const completionPercentage = achievementStats.total > 0
    ? Math.round((achievementStats.unlocked / achievementStats.total) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(ellipse at 30% 50%, rgba(245, 158, 11, 0.3), transparent 70%)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-amber-500/15">
              <Trophy size={24} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Başarımlar</h2>
              <p className="text-sm text-slate-400">
                Koleksiyonunu tamamla, XP kazan!
              </p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-slate-400">
                  {achievementStats.unlocked} / {achievementStats.total} başarım
                </span>
                <span className="text-xs font-bold text-amber-400">
                  %{completionPercentage}
                </span>
              </div>
              <ProgressBar
                value={completionPercentage}
                height="sm"
                gradientFrom="#f59e0b"
                gradientTo="#fbbf24"
                glow
              />
            </div>

            <div className="flex gap-3 text-center">
              <div>
                <p className="text-lg font-black text-emerald-400">
                  {achievementStats.unlocked}
                </p>
                <p className="text-[10px] text-slate-600">Açıldı</p>
              </div>
              <div>
                <p className="text-lg font-black text-slate-500">
                  {achievementStats.locked}
                </p>
                <p className="text-[10px] text-slate-600">Kilitli</p>
              </div>
              {achievementStats.secret > 0 && (
                <div>
                  <p className="text-lg font-black text-purple-400">
                    {achievementStats.secretUnlocked}/{achievementStats.secret + achievementStats.secretUnlocked}
                  </p>
                  <p className="text-[10px] text-slate-600">Gizli</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {(Object.keys(CATEGORY_LABELS) as AchievementCategory[]).map((cat) => {
          const count = cat === "all"
            ? achievements.length
            : achievements.filter((a) => a.category === cat).length;
          const unlockedCount = cat === "all"
            ? achievementStats.unlocked
            : achievements.filter((a) => a.category === cat && a.unlockedAt).length;

          return (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border",
                activeCategory === cat
                  ? "bg-accent-blue/10 border-accent-blue/30 text-accent-blue"
                  : "bg-deep-surface border-deep-border text-slate-500 hover:text-slate-300"
              )}
            >
              <span>{CATEGORY_LABELS[cat].icon}</span>
              <span>{CATEGORY_LABELS[cat].label}</span>
              <span className="text-[10px] opacity-60">
                {unlockedCount}/{count}
              </span>
            </motion.button>
          );
        })}

        {/* Toggle Locked */}
        <button
          onClick={() => setShowLocked(!showLocked)}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all border ml-auto",
            showLocked
              ? "bg-deep-surface border-deep-border text-slate-500"
              : "bg-accent-blue/10 border-accent-blue/30 text-accent-blue"
          )}
        >
          <Lock size={14} />
          <span className="text-xs">{showLocked ? "Kilitlileri Gizle" : "Kilitlileri Göster"}</span>
        </button>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <AnimatePresence mode="popLayout">
          {filteredAchievements.map((achievement, index) => {
            const progress = getAchievementProgress(
              achievement,
              gamificationState,
              tasks
            );

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.03 }}
              >
                <AchievementBadge
                  achievement={achievement}
                  showProgress={!achievement.unlockedAt}
                  progress={progress}
                  size="md"
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy size={40} className="mx-auto text-slate-700 mb-3" />
          <p className="text-sm text-slate-500">
            Bu kategoride başarım bulunamadı.
          </p>
        </div>
      )}
    </div>
  );
};
