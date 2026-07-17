"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, TrendingUp } from "lucide-react";
import { clsx } from "clsx";
import { useGamificationStore } from "@/stores/gamificationStore";

export const StreakCounter: React.FC = () => {
  const { currentStreak, longestStreak } = useGamificationStore();

  const streakBonus = Math.min(currentStreak * 10, 200);

  const getStreakEmoji = () => {
    if (currentStreak >= 100) return "💎";
    if (currentStreak >= 60) return "👑";
    if (currentStreak >= 30) return "🔥";
    if (currentStreak >= 14) return "⚡";
    if (currentStreak >= 7) return "✨";
    if (currentStreak >= 3) return "🌟";
    return "🌱";
  };

  const getStreakMessage = () => {
    if (currentStreak >= 100) return "Efsanevi streak!";
    if (currentStreak >= 60) return "İnanılmaz disiplin!";
    if (currentStreak >= 30) return "Bir ay boyunca!";
    if (currentStreak >= 14) return "Durdurulamıyorsun!";
    if (currentStreak >= 7) return "Harika gidiyorsun!";
    if (currentStreak >= 3) return "İyi başlangıç!";
    if (currentStreak >= 1) return "Devam et!";
    return "Streak başlat!";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-5 relative overflow-hidden"
    >
      {/* Background glow */}
      {currentStreak > 0 && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(ellipse at 30% 50%, rgba(249, 115, 22, 0.3) 0%, transparent 70%)`,
          }}
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame
              size={20}
              className={clsx(
                currentStreak > 0
                  ? "text-orange-400 animate-streak-fire"
                  : "text-slate-600"
              )}
            />
            <h3 className="text-sm font-semibold text-slate-300">Streak</h3>
          </div>
          <span className="text-2xl">{getStreakEmoji()}</span>
        </div>

        {/* Streak Number */}
        <div className="flex items-baseline gap-2 mb-1">
          <motion.span
            key={currentStreak}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={clsx(
              "text-4xl font-black tabular-nums",
              currentStreak > 0 ? "text-orange-400" : "text-slate-600"
            )}
          >
            {currentStreak}
          </motion.span>
          <span className="text-sm font-medium text-slate-500">gün</span>
        </div>

        {/* Message */}
        <p className="text-xs text-slate-500 mb-4">{getStreakMessage()}</p>

        {/* Stats Row */}
        <div className="flex gap-3">
          {/* Longest Streak */}
          <div className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-deep-surface/80">
            <Trophy size={14} className="text-amber-500" />
            <div>
              <p className="text-[10px] text-slate-600">En Uzun</p>
              <p className="text-sm font-bold text-slate-300">
                {longestStreak} gün
              </p>
            </div>
          </div>

          {/* Streak Bonus */}
          <div className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-deep-surface/80">
            <TrendingUp size={14} className="text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-600">XP Bonus</p>
              <p className="text-sm font-bold text-emerald-400">
                +%{streakBonus}
              </p>
            </div>
          </div>
        </div>

        {/* Streak Dots */}
        {currentStreak > 0 && currentStreak <= 30 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {Array.from({ length: Math.min(currentStreak, 30) }, (_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: `rgba(249, 115, 22, ${0.3 + (i / 30) * 0.7})`,
                  boxShadow:
                    i === currentStreak - 1
                      ? "0 0 8px rgba(249, 115, 22, 0.6)"
                      : "none",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
