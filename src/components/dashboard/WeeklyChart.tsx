"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { clsx } from "clsx";
import { useStats } from "@/hooks/useStats";

export const WeeklyChart: React.FC = () => {
  const { weeklyStats } = useStats();

  const chartData = weeklyStats.days.map((day) => ({
    name: day.dayName,
    completed: day.completed,
    xp: day.xp,
  }));

  const maxCompleted = Math.max(...chartData.map((d) => d.completed), 1);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-xl px-3 py-2 border border-deep-border shadow-glass">
          <p className="text-xs font-semibold text-white mb-1">{label}</p>
          <p className="text-xs text-emerald-400">
            ✅ {payload[0]?.value || 0} görev
          </p>
          <p className="text-xs text-amber-400">
            ⚡ {payload[0]?.payload?.xp || 0} XP
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Haftalık İlerleme</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Bu hafta {weeklyStats.totalCompleted} görev tamamladın
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Trend */}
          {weeklyStats.comparisonToPrevWeek !== 0 && (
            <div
              className={clsx(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                weeklyStats.comparisonToPrevWeek > 0
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              )}
            >
              {weeklyStats.comparisonToPrevWeek > 0 ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              %{Math.abs(weeklyStats.comparisonToPrevWeek)}
            </div>
          )}
          {weeklyStats.comparisonToPrevWeek === 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 text-xs font-medium">
              <Minus size={12} />
              Stabil
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={32}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.03)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <Bar
              dataKey="completed"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Summary */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-deep-border">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[10px] text-slate-600">Toplam XP</p>
            <p className="text-sm font-bold text-amber-400">
              ⚡ {weeklyStats.totalXp}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-600">Tamamlanma</p>
            <p className="text-sm font-bold text-accent-blue">
              %{weeklyStats.completionRate}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-600">Günlük Ortalama</p>
          <p className="text-sm font-bold text-white">
            {weeklyStats.days.length > 0
              ? (weeklyStats.totalCompleted / 7).toFixed(1)
              : "0"}{" "}
            görev
          </p>
        </div>
      </div>
    </motion.div>
  );
};
