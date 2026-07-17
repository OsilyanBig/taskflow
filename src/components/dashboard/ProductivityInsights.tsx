"use client";

import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { useStats } from "@/hooks/useStats";
import { ProductivityInsight } from "@/types";
import { Brain, ArrowRight, Target } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";

export const ProductivityInsights: React.FC = () => {
  const { insights, prediction } = useStats();

  const getInsightBorder = (type: ProductivityInsight["type"]) => {
    switch (type) {
      case "improvement":
        return "border-emerald-500/20";
      case "warning":
        return "border-amber-500/20";
      case "achievement":
        return "border-blue-500/20";
      case "suggestion":
        return "border-purple-500/20";
    }
  };

  const getInsightBg = (type: ProductivityInsight["type"]) => {
    switch (type) {
      case "improvement":
        return "rgba(16, 185, 129, 0.05)";
      case "warning":
        return "rgba(245, 158, 11, 0.05)";
      case "achievement":
        return "rgba(59, 130, 246, 0.05)";
      case "suggestion":
        return "rgba(139, 92, 246, 0.05)";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-xl bg-purple-500/15">
          <Brain size={18} className="text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">
            Üretkenlik Analizi
          </h3>
          <p className="text-xs text-slate-500">
            Akıllı öneriler ve tahminler
          </p>
        </div>
      </div>

      {/* Prediction Card */}
      <div className="p-4 rounded-xl bg-deep-surface border border-deep-border mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-accent-blue" />
            <span className="text-xs font-semibold text-slate-300">
              Haftalık Tahmin
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={clsx(
                "text-xs font-bold px-2 py-0.5 rounded-full",
                prediction.trend === "up" &&
                  "bg-emerald-500/10 text-emerald-400",
                prediction.trend === "down" &&
                  "bg-red-500/10 text-red-400",
                prediction.trend === "stable" &&
                  "bg-slate-500/10 text-slate-400"
              )}
            >
              {prediction.trend === "up" && "📈 Yükseliş"}
              {prediction.trend === "down" && "📉 Düşüş"}
              {prediction.trend === "stable" && "📊 Stabil"}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between mb-1.5">
            <span className="text-xs text-slate-500">
              Tahmini: {prediction.predictedCompletion} / {prediction.weeklyTarget}
            </span>
            <span className="text-xs font-mono text-slate-500">
              Güven: %{prediction.confidence}
            </span>
          </div>
          <ProgressBar
            value={prediction.predictedCompletion}
            max={prediction.weeklyTarget}
            height="sm"
            gradientFrom={
              prediction.predictedCompletion >= prediction.weeklyTarget
                ? "#10b981"
                : "#3b82f6"
            }
            gradientTo={
              prediction.predictedCompletion >= prediction.weeklyTarget
                ? "#34d399"
                : "#60a5fa"
            }
            glow
          />
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {prediction.message}
        </p>
      </div>

      {/* Insights List */}
      <div className="space-y-2.5">
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className={clsx(
                "flex items-start gap-3 p-3 rounded-xl border transition-all",
                "hover:scale-[1.01]",
                getInsightBorder(insight.type)
              )}
              style={{ backgroundColor: getInsightBg(insight.type) }}
            >
              <span className="text-lg flex-shrink-0 mt-0.5">
                {insight.icon}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-slate-300">
                  {insight.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-xs text-slate-600">
              Daha fazla veri toplandıkça burada akıllı öneriler görünecek.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
