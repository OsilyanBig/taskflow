"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Palette,
  Bell,
  Target,
  Shield,
  Swords,
  Quote,
  Minimize2,
} from "lucide-react";
import { clsx } from "clsx";
import { AccentColor } from "@/types";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTheme } from "@/hooks/useTheme";
import { ACCENT_COLORS } from "@/utils/constants";
import { Toggle } from "@/components/ui/Toggle";
import { DataManager } from "./DataManager";

export const SettingsPanel: React.FC = () => {
  const settings = useSettingsStore();
  const { isDark, toggleTheme, setAccentColor } = useTheme();

  return (
    <div className="space-y-6 pb-8 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-2.5 rounded-xl bg-slate-500/15">
          <Settings size={20} className="text-slate-400" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">Ayarlar</h2>
          <p className="text-xs text-slate-500">
            Uygulamayı kişiselleştir
          </p>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-5">
          <Palette size={18} className="text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Görünüm</h3>
        </div>

        <div className="space-y-5">
          {/* Theme Toggle */}
          <Toggle
            checked={isDark}
            onChange={toggleTheme}
            label="Koyu Tema"
            description="Karanlık mod ile gözlerini koru"
          />

          {/* Accent Color */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">
              Vurgu Rengi
            </label>
            <div className="flex gap-3">
              {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((color) => (
                <motion.button
                  key={color}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAccentColor(color)}
                  className={clsx(
                    "w-10 h-10 rounded-xl transition-all",
                    settings.accentColor === color
                      ? "ring-2 ring-offset-2 ring-offset-deep-bg scale-110"
                      : "opacity-70 hover:opacity-100"
                  )}
                  style={{
                    backgroundColor: ACCENT_COLORS[color].primary,
                    ringColor:
                      settings.accentColor === color
                        ? ACCENT_COLORS[color].primary
                        : "transparent",
                    boxShadow:
                      settings.accentColor === color
                        ? `0 0 20px ${ACCENT_COLORS[color].glow}`
                        : "none",
                  }}
                  title={ACCENT_COLORS[color].name}
                />
              ))}
            </div>
          </div>

          {/* Compact Mode */}
          <Toggle
            checked={settings.compactMode}
            onChange={settings.toggleCompactMode}
            label="Kompakt Mod"
            description="Daha yoğun ve küçük görev kartları"
          />
        </div>
      </motion.div>

      {/* Sound & Haptic */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-5">
          <Bell size={18} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">
            Ses & Titreşim
          </h3>
        </div>

        <div className="space-y-4">
          <Toggle
            checked={settings.soundEnabled}
            onChange={settings.toggleSound}
            label="Ses Efektleri"
            description="Görev tamamlama, seviye atlama sesleri"
          />
          <Toggle
            checked={settings.hapticEnabled}
            onChange={settings.toggleHaptic}
            label="Titreşim"
            description="Mobil cihazlarda haptik geri bildirim"
          />
        </div>
      </motion.div>

      {/* Goals */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-5">
          <Target size={18} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Hedefler</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1 block">
              Günlük Hedef
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Günde kaç görev tamamlamak istiyorsun?
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={20}
                value={settings.dailyGoal}
                onChange={(e) =>
                  settings.setDailyGoal(parseInt(e.target.value))
                }
                className="flex-1 accent-accent-blue"
              />
              <span className="text-sm font-bold text-white w-8 text-center">
                {settings.dailyGoal}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-1 block">
              Haftalık Hedef
            </label>
            <p className="text-xs text-slate-600 mb-2">
              Haftada kaç görev tamamlamak istiyorsun?
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={100}
                value={settings.weeklyGoal}
                onChange={(e) =>
                  settings.setWeeklyGoal(parseInt(e.target.value))
                }
                className="flex-1 accent-accent-blue"
              />
              <span className="text-sm font-bold text-white w-8 text-center">
                {settings.weeklyGoal}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Penalty System */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-5">
          <Swords size={18} className="text-red-400" />
          <h3 className="text-sm font-semibold text-white">
            Ceza Sistemi
          </h3>
        </div>

        <div className="space-y-4">
          <Toggle
            checked={settings.penaltyEnabled}
            onChange={settings.togglePenalty}
            label="Ceza Sistemi"
            description="Geciken görevlerde XP kaybı ve streak kırılması"
          />

          {settings.penaltyEnabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
            >
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                Ceza XP Miktarı
              </label>
              <p className="text-xs text-slate-600 mb-2">
                Geciken görev başına kaybedilecek XP
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={settings.penaltyXpLoss}
                  onChange={(e) =>
                    settings.setPenaltyXpLoss(parseInt(e.target.value))
                  }
                  className="flex-1 accent-red-500"
                />
                <span className="text-sm font-bold text-red-400 w-10 text-center">
                  -{settings.penaltyXpLoss}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Motivational Quotes */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-5">
          <Quote size={18} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Diğer</h3>
        </div>

        <Toggle
          checked={settings.showMotivationalQuotes}
          onChange={settings.toggleMotivationalQuotes}
          label="Motivasyon Sözleri"
          description="Dashboard'da günlük motivasyon sözü göster"
        />
      </motion.div>

      {/* Data Manager */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-white">
            Veri Yönetimi
          </h3>
        </div>
        <DataManager />
      </motion.div>
    </div>
  );
};
