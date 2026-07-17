"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { useStats } from "@/hooks/useStats";
import { MONTH_NAMES } from "@/utils/constants";
import { Tooltip } from "@/components/ui/Tooltip";

const CELL_SIZE = 13;
const CELL_GAP = 3;

const LEVEL_COLORS = [
  "rgba(255, 255, 255, 0.03)", // 0 - boş
  "rgba(59, 130, 246, 0.2)",   // 1 - az
  "rgba(59, 130, 246, 0.4)",   // 2 - orta
  "rgba(59, 130, 246, 0.65)",  // 3 - çok
  "rgba(59, 130, 246, 0.9)",   // 4 - en çok
];

export const HeatmapCalendar: React.FC = () => {
  const { heatmapData } = useStats();

  // Haftalar ve aylar hesapla
  const { weeks, monthLabels } = useMemo(() => {
    const weeks: typeof heatmapData[][] = [];
    let currentWeek: typeof heatmapData[] = [];

    // İlk günün haftanın hangi gününe denk geldiğini bul
    if (heatmapData.length > 0) {
      const firstDate = new Date(heatmapData[0].date);
      const firstDayOfWeek = firstDate.getDay(); // 0=Pazar

      // Boş günler ekle (haftanın başlangıcını hizalamak için)
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push({ date: "", count: 0, level: 0 as const });
      }
    }

    heatmapData.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    // Ay etiketleri
    const monthLabels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      week.forEach((day) => {
        if (day.date) {
          const month = new Date(day.date).getMonth();
          if (month !== lastMonth) {
            monthLabels.push({
              month: MONTH_NAMES[month],
              weekIndex,
            });
            lastMonth = month;
          }
        }
      });
    });

    return { weeks, monthLabels };
  }, [heatmapData]);

  const totalContributions = heatmapData.reduce(
    (sum, d) => sum + d.count,
    0
  );

  const dayLabels = ["", "Pzt", "", "Çar", "", "Cum", ""];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Aktivite Haritası
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Son 1 yılda{" "}
            <span className="text-accent-blue font-bold">
              {totalContributions}
            </span>{" "}
            görev tamamladın
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-600">Az</span>
          {LEVEL_COLORS.map((color, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
          ))}
          <span className="text-[10px] text-slate-600">Çok</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="inline-flex gap-0">
          {/* Day Labels */}
          <div className="flex flex-col gap-[3px] mr-2 pt-5">
            {dayLabels.map((label, i) => (
              <div
                key={i}
                className="text-[9px] text-slate-600 h-[13px] flex items-center"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div>
            {/* Month Labels */}
            <div className="flex mb-1 relative h-4">
              {monthLabels.map(({ month, weekIndex }, i) => (
                <span
                  key={i}
                  className="text-[9px] text-slate-600 absolute"
                  style={{
                    left: weekIndex * (CELL_SIZE + CELL_GAP),
                  }}
                >
                  {month}
                </span>
              ))}
            </div>

            {/* Cells */}
            <div className="flex gap-[3px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIndex) => (
                    <Tooltip
                      key={`${weekIndex}-${dayIndex}`}
                      content={
                        day.date
                          ? `${new Date(day.date).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "long",
                            })}: ${day.count} görev`
                          : ""
                      }
                      position="top"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: weekIndex * 0.005,
                          duration: 0.2,
                        }}
                        className={clsx(
                          "rounded-sm cursor-default transition-all hover:ring-1 hover:ring-white/20",
                          !day.date && "invisible"
                        )}
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          backgroundColor: LEVEL_COLORS[day.level],
                        }}
                      />
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
