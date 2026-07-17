"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock, Star } from "lucide-react";
import { clsx } from "clsx";
import { Achievement } from "@/types";
import { useSound } from "@/hooks/useSound";

interface AchievementBadgeProps {
  achievement: Achievement;
  isNew?: boolean;
  showProgress?: boolean;
  progress?: number;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  isNew = false,
  showProgress = false,
  progress = 0,
  size = "md",
  onClick,
}) => {
  const isUnlocked = !!achievement.unlockedAt;
  const isSecret = achievement.isSecret && !isUnlocked;
  const { playAchievementEffect } = useSound();

  React.useEffect(() => {
    if (isNew) {
      playAchievementEffect();
    }
  }, [isNew, playAchievementEffect]);

  // New achievement notification style
  if (isNew) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 100, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.8 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="glass-card rounded-2xl p-4 border border-amber-500/30 shadow-lg max-w-xs"
        style={{
          boxShadow: "0 0 30px rgba(245, 158, 11, 0.2)",
        }}
      >
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ rotate: -30, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{
              type: "spring",
              damping: 10,
              stiffness: 200,
              delay: 0.2,
            }}
            className="text-3xl flex-shrink-0"
          >
            {achievement.icon}
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Başarım Açıldı!
              </span>
            </div>
            <h4 className="text-sm font-bold text-white truncate">
              {achievement.name}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {achievement.description}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-amber-400">
              <Star size={10} className="fill-amber-400" />
              <span className="font-bold">+{achievement.xpReward} XP</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Regular badge styles
  const sizeStyles = {
    sm: "p-3",
    md: "p-4",
    lg: "p-5",
  };

  const iconSizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={clsx(
        "glass-card rounded-2xl relative overflow-hidden cursor-default transition-all",
        sizeStyles[size],
        isUnlocked
          ? "border border-amber-500/20"
          : "border border-deep-border opacity-60",
        onClick && "cursor-pointer"
      )}
    >
      {/* Unlocked glow */}
      {isUnlocked && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(245, 158, 11, 0.4), transparent 70%)",
          }}
        />
      )}

      <div className="relative z-10">
        {/* Icon */}
        <div className="flex items-center justify-center mb-2">
          {isSecret ? (
            <div className="relative">
              <span className={clsx(iconSizes[size], "opacity-20")}>❓</span>
              <Lock
                size={size === "sm" ? 12 : 16}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-600"
              />
            </div>
          ) : (
            <motion.span
              className={clsx(
                iconSizes[size],
                !isUnlocked && "grayscale opacity-40"
              )}
              animate={
                isUnlocked
                  ? { scale: [1, 1.1, 1] }
                  : {}
              }
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {achievement.icon}
            </motion.span>
          )}
        </div>

        {/* Info */}
        <div className="text-center">
          <h4
            className={clsx(
              "font-bold truncate",
              size === "sm" ? "text-xs" : "text-sm",
              isUnlocked ? "text-white" : "text-slate-600"
            )}
          >
            {isSecret ? "Gizli Başarım" : achievement.name}
          </h4>
          {size !== "sm" && (
            <p
              className={clsx(
                "text-xs mt-1",
                isUnlocked ? "text-slate-400" : "text-slate-700"
              )}
            >
              {isSecret
                ? "Bu başarımı keşfetmeni bekliyoruz!"
                : achievement.description}
            </p>
          )}
        </div>

        {/* XP Reward */}
        {!isSecret && (
          <div className="flex items-center justify-center gap-1 mt-2">
            <Star
              size={10}
              className={clsx(
                isUnlocked
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-700"
              )}
            />
            <span
              className={clsx(
                "text-[10px] font-bold",
                isUnlocked ? "text-amber-400" : "text-slate-700"
              )}
            >
              {achievement.xpReward} XP
            </span>
          </div>
        )}

        {/* Progress */}
        {showProgress && !isUnlocked && !isSecret && (
          <div className="mt-2">
            <div className="w-full h-1.5 rounded-full bg-deep-surface overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-accent-blue/50"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <p className="text-[9px] text-slate-600 text-center mt-1">
              %{Math.round(progress)}
            </p>
          </div>
        )}

        {/* Unlocked date */}
        {isUnlocked && achievement.unlockedAt && size !== "sm" && (
          <p className="text-[9px] text-slate-600 text-center mt-2">
            {new Date(achievement.unlockedAt).toLocaleDateString("tr-TR")}
          </p>
        )}
      </div>
    </motion.div>
  );
};
