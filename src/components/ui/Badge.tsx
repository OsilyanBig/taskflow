"use client";

import React from "react";
import { clsx } from "clsx";
import { motion } from "framer-motion";

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  bgColor?: string;
  variant?: "solid" | "outline" | "glow";
  size?: "sm" | "md";
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  animate?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  color,
  bgColor,
  variant = "solid",
  size = "sm",
  icon,
  removable = false,
  onRemove,
  className,
  animate = false,
}) => {
  const Component = animate ? motion.span : "span";
  const animationProps = animate
    ? {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0, opacity: 0 },
      }
    : {};

  const baseStyles = clsx(
    "inline-flex items-center gap-1 font-medium rounded-full transition-all",
    size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
  );

  const variantStyles = {
    solid: "border border-transparent",
    outline: "bg-transparent border",
    glow: "border border-transparent shadow-lg",
  };

  const style: React.CSSProperties = {
    color: color || "#fff",
    backgroundColor:
      variant === "outline"
        ? "transparent"
        : bgColor || "rgba(59, 130, 246, 0.15)",
    borderColor:
      variant === "outline" ? color || "#3b82f6" : bgColor || "transparent",
    ...(variant === "glow"
      ? { boxShadow: `0 0 12px ${color || "rgba(59, 130, 246, 0.3)"}` }
      : {}),
  };

  return (
    <Component
      className={clsx(baseStyles, variantStyles[variant], className)}
      style={style}
      {...animationProps}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      )}
    </Component>
  );
};
