"use client";

import React, { useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";

interface ConfettiEffectProps {
  trigger: boolean;
  intensity?: "low" | "medium" | "high";
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  trigger,
  intensity = "medium",
}) => {
  const firedRef = useRef(false);

  const fireConfetti = useCallback(() => {
    const configs = {
      low: {
        particleCount: 30,
        spread: 50,
        startVelocity: 20,
        decay: 0.95,
      },
      medium: {
        particleCount: 80,
        spread: 70,
        startVelocity: 30,
        decay: 0.93,
      },
      high: {
        particleCount: 150,
        spread: 100,
        startVelocity: 45,
        decay: 0.91,
      },
    };

    const config = configs[intensity];

    // Sol taraftan
    confetti({
      ...config,
      origin: { x: 0.3, y: 0.7 },
      colors: ["#3b82f6", "#22d3ee", "#8b5cf6", "#f59e0b", "#10b981"],
      ticks: 150,
      gravity: 1.2,
      scalar: 1.1,
      shapes: ["circle", "square"],
    });

    // Sağ taraftan
    confetti({
      ...config,
      origin: { x: 0.7, y: 0.7 },
      colors: ["#3b82f6", "#22d3ee", "#8b5cf6", "#f59e0b", "#10b981"],
      ticks: 150,
      gravity: 1.2,
      scalar: 1.1,
      shapes: ["circle", "square"],
    });

    if (intensity === "high") {
      // Ekstra: ortadan
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 120,
          origin: { x: 0.5, y: 0.5 },
          colors: ["#fbbf24", "#f472b6", "#a78bfa"],
          ticks: 120,
          gravity: 0.8,
          scalar: 1.3,
          shapes: ["circle"],
          startVelocity: 35,
        });
      }, 200);
    }
  }, [intensity]);

  useEffect(() => {
    if (trigger && !firedRef.current) {
      firedRef.current = true;
      fireConfetti();
    }
    if (!trigger) {
      firedRef.current = false;
    }
  }, [trigger, fireConfetti]);

  return null; // Sadece efekt, görsel element yok
};
