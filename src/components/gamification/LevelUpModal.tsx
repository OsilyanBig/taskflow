"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp, Sparkles } from "lucide-react";
import { LEVELS } from "@/utils/constants";
import { useSound } from "@/hooks/useSound";
import { Button } from "@/components/ui/Button";

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  level,
  onClose,
}) => {
  const levelInfo = LEVELS.find((l) => l.level === level) || LEVELS[0];
  const { playLevelUpEffect } = useSound();

  useEffect(() => {
    if (isOpen) {
      playLevelUpEffect();
    }
  }, [isOpen, playLevelUpEffect]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 300,
            }}
            className="relative w-full max-w-sm"
          >
            {/* Glow Rings */}
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-3xl"
              style={{
                boxShadow: `0 0 80px ${levelInfo.color}40, 0 0 120px ${levelInfo.color}20`,
              }}
            />

            {/* Card */}
            <div className="relative glass-card rounded-3xl overflow-hidden">
              {/* Top Glow */}
              <div
                className="absolute top-0 left-0 right-0 h-32 opacity-30"
                style={{
                  background: `radial-gradient(ellipse at 50% 0%, ${levelInfo.color}, transparent 70%)`,
                }}
              />

              {/* Sparkles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.cos((i / 8) * Math.PI * 2) * 80,
                    y: Math.sin((i / 8) * Math.PI * 2) * 80,
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.15,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="absolute top-1/3 left-1/2"
                  style={{ color: levelInfo.color }}
                >
                  <Sparkles size={12} />
                </motion.div>
              ))}

              <div className="relative z-10 p-8 text-center">
                {/* Up Arrow */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-center mb-4"
                >
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: `${levelInfo.color}20` }}
                  >
                    <ChevronUp
                      size={24}
                      style={{ color: levelInfo.color }}
                    />
                  </div>
                </motion.div>

                {/* Level Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    damping: 12,
                    stiffness: 200,
                    delay: 0.3,
                  }}
                  className="mb-4"
                >
                  <span className="text-6xl block mb-2">
                    {levelInfo.icon}
                  </span>
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Seviye Atladın!
                  </p>
                  <h2
                    className="text-3xl font-black mb-1"
                    style={{ color: levelInfo.color }}
                  >
                    Seviye {level}
                  </h2>
                  <p
                    className="text-lg font-bold"
                    style={{ color: levelInfo.color }}
                  >
                    {levelInfo.title}
                  </p>
                </motion.div>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-sm text-slate-400 mt-4 mb-6"
                >
                  {getLevelMessage(level)}
                </motion.p>

                {/* Close Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <Button
                    variant="accent"
                    onClick={onClose}
                    glow
                    fullWidth
                    className="font-bold"
                  >
                    Harika! Devam Et 🚀
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

function getLevelMessage(level: number): string {
  const messages: Record<number, string> = {
    2: "İlk seviyeni geçtin! Yolculuk daha yeni başlıyor.",
    3: "Keşfetmeye devam! Her görev seni güçlendiriyor.",
    4: "Azmin takdire şayan. Böyle devam!",
    5: "Odaklanman mükemmel. Artık bir profesyonelsin!",
    6: "Savaşçı ruhun seni bu seviyeye taşıdı!",
    7: "Stratejik düşünüyorsun. Planlama gücün artıyor!",
    8: "Ustalık seviyesindesin. Efsaneler burada başlar.",
    9: "Efsanevi bir performer oldun. Geri kalan senin!",
    10: "Titan statüsü! Artık durdurulamaz bir güçsün.",
    11: "İmparator! Görevlerin hükümdarısın.",
    12: "Tanrısal seviye. İnsanüstü bir performans!",
    13: "Aşkın bir varlık. Sınırlarını aştın!",
    14: "Ölümsüzlüğe ulaştın. Bu noktada çok az kişi var.",
    15: "Kozmik seviye. Evrenin en üretken varlığısın! ✨",
  };
  return messages[level] || "Harika bir ilerleme kaydediyorsun!";
}
