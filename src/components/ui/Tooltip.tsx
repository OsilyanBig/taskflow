"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { clsx } from "clsx";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = "top",
  delay = 300,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    const id = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        let x = 0;
        let y = 0;

        switch (position) {
          case "top":
            x = rect.left + rect.width / 2;
            y = rect.top - 8;
            break;
          case "bottom":
            x = rect.left + rect.width / 2;
            y = rect.bottom + 8;
            break;
          case "left":
            x = rect.left - 8;
            y = rect.top + rect.height / 2;
            break;
          case "right":
            x = rect.right + 8;
            y = rect.top + rect.height / 2;
            break;
        }

        setCoords({ x, y });
      }
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  if (!content) {
    return <>{children}</>;
  }

  const getTransformStyle = () => {
    switch (position) {
      case "top":
        return { left: coords.x, top: coords.y, transform: "translate(-50%, -100%)" };
      case "bottom":
        return { left: coords.x, top: coords.y, transform: "translate(-50%, 0%)" };
      case "left":
        return { left: coords.x, top: coords.y, transform: "translate(-100%, -50%)" };
      case "right":
        return { left: coords.x, top: coords.y, transform: "translate(0%, -50%)" };
    }
  };

  const motionDirection = {
    top: { y: 4 },
    bottom: { y: -4 },
    left: { x: 4 },
    right: { x: -4 },
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={clsx("relative inline-flex", className)}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isVisible && (
              <motion.div
                initial={{ opacity: 0, ...motionDirection[position] }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, ...motionDirection[position] }}
                transition={{ duration: 0.15 }}
                className={clsx(
                  "fixed pointer-events-none select-none",
                  "px-3 py-1.5 rounded-lg",
                  "bg-slate-800 border border-slate-700",
                  "text-xs text-slate-200 whitespace-nowrap",
                  "shadow-xl"
                )}
                style={{
                  ...getTransformStyle(),
                  zIndex: 99999,
                }}
              >
                {content}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};
