"use client";

import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  size = "md",
  disabled = false,
  className,
}) => {
  const trackSize = size === "sm" ? "w-9 h-5" : "w-11 h-6";
  const thumbSize = size === "sm" ? "w-3.5 h-3.5" : "w-4.5 h-4.5";
  const thumbTranslate = size === "sm" ? 16 : 20;

  return (
    <label
      className={clsx(
        "flex items-center justify-between gap-3 cursor-pointer group",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
              {label}
            </span>
          )}
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
      )}

      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          "relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200",
          trackSize,
          checked
            ? "bg-accent-blue shadow-glow"
            : "bg-deep-surface border border-deep-border"
        )}
      >
        <motion.span
          className={clsx(
            "absolute top-1/2 -translate-y-1/2 left-[3px] rounded-full bg-white shadow-md",
            size === "sm" ? "w-3.5 h-3.5" : "w-[18px] h-[18px]"
          )}
          animate={{
            x: checked ? thumbTranslate : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      </button>
    </label>
  );
};
