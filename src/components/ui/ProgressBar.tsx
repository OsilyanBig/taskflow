"use client";

import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  height?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
  glow?: boolean;
  className?: string;
}

const heightStyles = {
  xs: "h-1",
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color,
  gradientFrom = "#3b82f6",
  gradientTo = "#60a5fa",
  height = "sm",
  showLabel = false,
  label,
  showPercentage = false,
  animated = true,
  glow = false,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={clsx("w-full", className)}>
      {/* Label */}
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {showLabel && (
            <span className="text-xs font-medium text-slate-400">
              {label || "İlerleme"}
            </span>
          )}
          {showPercentage && (
            <span className="text-xs font-bold text-slate-300">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className={clsx(
          "w-full rounded-full overflow-hidden",
          heightStyles[height],
          "bg-deep-surface"
        )}
      >
        {/* Fill */}
        <motion.div
          className={clsx("h-full rounded-full relative", glow && "shadow-lg")}
          style={{
            background: color
              ? color
              : `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
            boxShadow: glow
              ? `0 0 12px ${color || gradientFrom}`
              : undefined,
          }}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 1 : 0,
            ease: "easeOut",
          }}
        >
          {/* Shimmer effect */}
          {animated && percentage > 0 && percentage < 100 && (
            <div
              className="absolute inset-0 shimmer rounded-full"
              style={{ opacity: 0.3 }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};
