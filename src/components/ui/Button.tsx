"use client";

import React from "react";
import { clsx } from "clsx";
import { motion, HTMLMotionProps } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "accent";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "size"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  glow?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-blue hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20",
  secondary:
    "bg-deep-surface hover:bg-deep-hover text-slate-200 border border-deep-border",
  ghost:
    "bg-transparent hover:bg-deep-surface text-slate-300 hover:text-white",
  danger:
    "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20",
  success:
    "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20",
  accent:
    "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25",
};

const lightVariantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20",
  secondary:
    "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200",
  ghost:
    "bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900",
  danger:
    "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
  success:
    "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200",
  accent:
    "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2.5",
  icon: "p-2.5 rounded-xl",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  glow = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={clsx(
        "inline-flex items-center justify-center font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 focus-visible:ring-offset-deep-bg",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "dark:ring-offset-deep-bg",
        variantStyles[variant],
        sizeStyles[size],
        glow && "glow-accent",
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};
