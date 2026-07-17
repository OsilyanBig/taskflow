"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Clock,
  Zap,
  Volume2,
  VolumeX,
} from "lucide-react";
import { clsx } from "clsx";
import { Task } from "@/types";
import { useViewStore } from "@/stores/viewStore";
import { useTasks } from "@/hooks/useTasks";
import { useGamification } from "@/hooks/useGamification";
import { useSound } from "@/hooks/useSound";
import { PRIORITY_CONFIG } from "@/utils/constants";
import { Button } from "@/components/ui/Button";
import { ConfettiEffect } from "@/components/gamification/ConfettiEffect";

export const ZenMode: React.FC = () => {
  const { setView } = useViewStore();
  const { todayTasks, activeTasks } = useTasks();
  const { completeTaskWithRewards } = useGamification();
  const { playCompleteEffect, playSound } = useSound();

  // Tamamlanmamış görevler
  const pendingTasks = todayTasks.filter((t) => t.status !== "completed");
  const allPending = activeTasks.filter((t) => t.status !== "completed");
  const taskPool = pendingTasks.length > 0 ? pendingTasks : allPending;

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTask = taskPool[currentTaskIndex] || null;

  // Timer
  useEffect(() => {
    if (isTimerRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleComplete = () => {
    if (!currentTask) return;

    const result = completeTaskWithRewards(currentTask.id);
    if (result) {
      playCompleteEffect();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setCompletedCount((prev) => prev + 1);
    }

    // Sonraki göreve geç
    setElapsedSeconds(0);
    if (currentTaskIndex < taskPool.length - 1) {
      setCurrentTaskIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    setElapsedSeconds(0);
    if (currentTaskIndex < taskPool.length - 1) {
      setCurrentTaskIndex((prev) => prev + 1);
    } else {
      setCurrentTaskIndex(0);
    }
  };

  const handleReset = () => {
    setElapsedSeconds(0);
    setIsTimerRunning(false);
  };

  const handleExit = () => {
    setIsTimerRunning(false);
    setView("dashboard");
  };

  // Progress ring hesaplaması
  const estimatedSeconds = currentTask
    ? currentTask.estimatedMinutes * 60
    : 1500;
  const progressPercentage = Math.min(
    (elapsedSeconds / estimatedSeconds) * 100,
    100
  );
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[60] bg-deep-bg flex items-center justify-center">
      <ConfettiEffect trigger={showConfetti} intensity="high" />

      {/* Background Effects */}
      <div className="absolute inset-0 bg-aurora opacity-30" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Exit Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleExit}
        className="absolute top-6 right-6 p-3 rounded-xl glass text-slate-400 hover:text-white transition-colors z-10"
      >
        <X size={20} />
      </motion.button>

      {/* Mute Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-6 left-6 p-3 rounded-xl glass text-slate-400 hover:text-white transition-colors z-10"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </motion.button>

      {/* Completed Counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-xl glass z-10"
      >
        <CheckCircle2 size={16} className="text-emerald-400" />
        <span className="text-sm font-bold text-white">
          {completedCount} tamamlandı
        </span>
      </motion.div>

      {currentTask ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center max-w-lg mx-auto px-6"
        >
          {/* Priority Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <span
              className="px-4 py-1.5 rounded-full text-xs font-bold"
              style={{
                color: PRIORITY_CONFIG[currentTask.priority].color,
                backgroundColor: PRIORITY_CONFIG[currentTask.priority].bgColor,
              }}
            >
              {PRIORITY_CONFIG[currentTask.priority].icon}{" "}
              {PRIORITY_CONFIG[currentTask.priority].label} Öncelik
            </span>
          </motion.div>

          {/* Timer Ring */}
          <div className="relative mb-8">
            <svg
              width="280"
              height="280"
              className="transform -rotate-90"
            >
              {/* Track */}
              <circle
                cx="140"
                cy="140"
                r="120"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="6"
              />
              {/* Progress */}
              <motion.circle
                cx="140"
                cy="140"
                r="120"
                fill="none"
                stroke="url(#zenGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="zenGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>

            {/* Timer Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-white font-mono tracking-wider">
                {formatTime(elapsedSeconds)}
              </span>
              <span className="text-xs text-slate-500 mt-2">
                Tahmini: {currentTask.estimatedMinutes} dk
              </span>
            </div>
          </div>

          {/* Task Title */}
          <motion.h2
            key={currentTask.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-black text-white text-center mb-3 max-w-md"
          >
            {currentTask.title}
          </motion.h2>

          {/* Task Description */}
          {currentTask.description && (
            <p className="text-sm text-slate-400 text-center mb-8 max-w-md">
              {currentTask.description}
            </p>
          )}

          {/* Subtask Progress */}
          {currentTask.subtasks.length > 0 && (
            <div className="flex items-center gap-2 mb-8 text-xs text-slate-500">
              <span>
                Alt görevler:{" "}
                {currentTask.subtasks.filter((s) => s.completed).length}/
                {currentTask.subtasks.length}
              </span>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Reset */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleReset}
              className="p-3 rounded-xl glass text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw size={20} />
            </motion.button>

            {/* Play/Pause */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={clsx(
                "p-5 rounded-2xl text-white transition-all",
                isTimerRunning
                  ? "bg-amber-500 shadow-lg shadow-amber-500/30"
                  : "bg-accent-blue shadow-lg shadow-blue-500/30"
              )}
            >
              {isTimerRunning ? <Pause size={28} /> : <Play size={28} />}
            </motion.button>

            {/* Complete */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleComplete}
              className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
              <CheckCircle2 size={20} />
            </motion.button>

            {/* Skip */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSkip}
              className="p-3 rounded-xl glass text-slate-400 hover:text-white transition-colors"
            >
              <SkipForward size={20} />
            </motion.button>
          </div>

          {/* Task queue info */}
          <p className="text-xs text-slate-600 mt-6">
            Görev {currentTaskIndex + 1} / {taskPool.length}
          </p>
        </motion.div>
      ) : (
        /* No Tasks */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <span className="text-6xl block mb-4">🎉</span>
          <h2 className="text-2xl font-black text-white mb-2">
            Tüm görevler tamamlandı!
          </h2>
          <p className="text-sm text-slate-400 mb-8">
            Harika iş çıkardın. Biraz mola ver.
          </p>
          <Button variant="accent" onClick={handleExit} glow>
            Dashboard&apos;a Dön
          </Button>
        </motion.div>
      )}
    </div>
  );
};
