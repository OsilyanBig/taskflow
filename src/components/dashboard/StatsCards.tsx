"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Target,
  AlertTriangle,
  Zap,
  TrendingUp,
} from "lucide-react";
import { clsx } from "clsx";
import { useTasks } from "@/hooks/useTasks";
import { useGamificationStore } from "@/stores/gamificationStore";
import { useSettingsStore } from "@/stores/settingsStore";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  trend?: { value: number; isUp: boolean };
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  glowColor,
  trend,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="glass-card rounded-2xl p-4 relative overflow-hidden group"
  >
    {/* Background glow on hover */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: `radial-gradient(ellipse at 50% 50%, ${glowColor} 0%, transparent 70%)`,
      }}
    />

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div
          className="p-2 rounded-xl"
          style={{ backgroundColor: `${color}15` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        {trend && (
          <div
            className={clsx(
              "flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full",
              trend.isUp
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            )}
          >
            <TrendingUp
              size={12}
              className={clsx(!trend.isUp && "rotate-180")}
            />
            %{Math.abs(trend.value)}
          </div>
        )}
      </div>

      <div>
        <motion.p
          key={value}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-black text-white tabular-nums"
        >
          {value}
        </motion.p>
        <p className="text-xs font-medium text-slate-500 mt-0.5">{title}</p>
        {subtitle && (
          <p className="text-[10px] text-slate-600 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  </motion.div>
);

export const StatsCards: React.FC = () => {
  const { stats, todayTasks, overdueTasks } = useTasks();
  const { totalXpEarned, level } = useGamificationStore();
  const { dailyGoal, weeklyGoal } = useSettingsStore();

  const todayCompleted = todayTasks.filter(
    (t) => t.status === "completed"
  ).length;
  const todayProgress =
    dailyGoal > 0 ? Math.round((todayCompleted / dailyGoal) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        title="Bugün Tamamlanan"
        value={todayCompleted}
        subtitle={`Hedef: ${dailyGoal} | %${Math.min(todayProgress, 100)}`}
        icon={<CheckCircle2 size={18} />}
        color="#10b981"
        glowColor="rgba(16, 185, 129, 0.08)"
        delay={0}
      />
      <StatCard
        title="Aktif Görevler"
        value={stats.active}
        subtitle={`Toplam: ${stats.total}`}
        icon={<Clock size={18} />}
        color="#3b82f6"
        glowColor="rgba(59, 130, 246, 0.08)"
        delay={0.1}
      />
      <StatCard
        title="Toplam XP"
        value={totalXpEarned.toLocaleString("tr-TR")}
        subtitle={`Seviye ${level}`}
        icon={<Zap size={18} />}
        color="#f59e0b"
        glowColor="rgba(245, 158, 11, 0.08)"
        delay={0.2}
      />
      <StatCard
        title="Gecikmiş"
        value={overdueTasks.length}
        subtitle={
          overdueTasks.length > 0
            ? "Acil ilgilenilmeli!"
            : "Harika, geciken yok!"
        }
        icon={
          overdueTasks.length > 0 ? (
            <AlertTriangle size={18} />
          ) : (
            <Target size={18} />
          )
        }
        color={overdueTasks.length > 0 ? "#ef4444" : "#10b981"}
        glowColor={
          overdueTasks.length > 0
            ? "rgba(239, 68, 68, 0.08)"
            : "rgba(16, 185, 129, 0.08)"
        }
        delay={0.3}
      />
    </div>
  );
};
