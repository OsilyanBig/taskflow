"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Star } from "lucide-react";
import { clsx } from "clsx";
import { useGamification } from "@/hooks/useGamification";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Tooltip } from "@/components/ui/Tooltip";

interface XPBarProps {
  compact?: boolean;
}

export const XPBar: React.FC<XPBarProps> = ({ compact = false }) => {
  const {
    level,
    totalXpEarned,
    currentLevelXp,
    xpToNextLevel,
    xpProgress,
    currentLevelInfo,
    nextLevelInfo,
  } = useGamification();

  if (compact) {
    return (
      <Tooltip
        content={`Seviye ${level} - ${currentLevelInfo.title} | ${currentLevelXp}/${xpToNextLevel} XP`}
        position="bottom"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-deep-surface border border-deep-border">
          <span className="text-sm">{currentLevelInfo.icon}</span>
          <div className="w-20">
            <ProgressBar
              value={xpProgress}
              height="xs"
              gradientFrom={currentLevelInfo.color}
              gradientTo={nextLevelInfo?.color || currentLevelInfo.color}
              animated={false}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            Lv.{level}
          </span>
        </div>
      </Tooltip>
    );
  }

  return (
    <div className="space-y-2">
      {/* Level Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.span
            key={level}
            initial={{ scale: 1.5, rotate: 10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-xl"
          >
            {currentLevelInfo.icon}
          </motion.span>
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className="text-sm font-bold"
                style={{ color: currentLevelInfo.color }}
              >
                Seviye {level}
              </span>
              <span className="text-xs text-slate-600">•</span>
              <span className="text-xs text-slate-400">
                {currentLevelInfo.title}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs">
          <Zap size={12} className="text-amber-400" />
          <span className="font-mono text-slate-400">
            {currentLevelXp}
            <span className="text-slate-600">/{xpToNextLevel}</span>
          </span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <ProgressBar
        value={xpProgress}
        height="sm"
        gradientFrom={currentLevelInfo.color}
        gradientTo={nextLevelInfo?.color || currentLevelInfo.color}
        glow
      />

      {/* Next Level Info */}
      {nextLevelInfo && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-600">
            Toplam: {totalXpEarned.toLocaleString("tr-TR")} XP
          </span>
          <div className="flex items-center gap-1 text-[10px] text-slate-600">
            <span>Sonraki:</span>
            <span>{nextLevelInfo.icon}</span>
            <span style={{ color: nextLevelInfo.color }}>
              {nextLevelInfo.title}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
