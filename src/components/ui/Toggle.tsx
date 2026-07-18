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
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) onChange(!checked);
        }}
        className={clsx(
          "relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none",
          size === "sm" ? "w-9 h-5" : "w-12 h-7",
          checked
            ? "bg-accent-blue shadow-glow"
            : "bg-deep-surface border border-deep-border"
        )}
      >
        <motion.span
          className={clsx(
            "rounded-full bg-white shadow-md pointer-events-none",
            size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5"
          )}
          animate={{
            x: checked
              ? size === "sm"
                ? 18
                : 22
              : size === "sm"
              ? 3
              : 4,
            y: size === "sm" ? 3 : 4,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </button>
    </label>
  );
};
