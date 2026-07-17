"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  FileJson,
  Shield,
} from "lucide-react";
import { clsx } from "clsx";
import { useTaskStore } from "@/stores/taskStore";
import { useGamificationStore } from "@/stores/gamificationStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { Button } from "@/components/ui/Button";

export const DataManager: React.FC = () => {
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetText, setResetText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const taskStore = useTaskStore();
  const gamificationStore = useGamificationStore();
  const settingsStore = useSettingsStore();

  // Export all data
  const handleExport = () => {
    const exportData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      tasks: JSON.parse(taskStore.exportTasks()),
      gamification: JSON.parse(gamificationStore.exportGamification()),
      settings: JSON.parse(settingsStore.exportSettings()),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taskflow_backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import data
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data.tasks) {
          taskStore.importTasks(JSON.stringify(data.tasks));
        }
        if (data.gamification) {
          gamificationStore.importGamification(
            JSON.stringify(data.gamification)
          );
        }
        if (data.settings) {
          settingsStore.importSettings(JSON.stringify(data.settings));
        }

        setImportStatus("success");
        setTimeout(() => setImportStatus("idle"), 3000);
      } catch (error) {
        setImportStatus("error");
        setTimeout(() => setImportStatus("idle"), 3000);
      }
    };
    reader.readAsText(file);

    // Input'u resetle
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Reset all data
  const handleReset = () => {
    if (resetText !== "SİL") return;

    // Tüm localStorage'ı temizle
    if (typeof window !== "undefined") {
      localStorage.clear();
    }

    // Store'ları resetle
    gamificationStore.resetGamification();
    settingsStore.resetSettings();

    setShowResetConfirm(false);
    setResetText("");

    // Sayfayı yenile
    window.location.reload();
  };

  // Storage boyutu hesapla
  const getStorageSize = () => {
    if (typeof window === "undefined") return "0 KB";
    let totalSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage.getItem(key)?.length || 0;
      }
    }
    const sizeInKB = (totalSize * 2) / 1024; // UTF-16 için 2 byte
    if (sizeInKB > 1024) {
      return `${(sizeInKB / 1024).toFixed(2)} MB`;
    }
    return `${sizeInKB.toFixed(1)} KB`;
  };

  return (
    <div className="space-y-6">
      {/* Storage Info */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-blue-500/15">
            <Shield size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Veri Depolama</h3>
            <p className="text-xs text-slate-500">
              Tüm veriler tarayıcında saklanır
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-deep-surface">
          <div className="flex items-center gap-2">
            <FileJson size={16} className="text-slate-500" />
            <span className="text-xs text-slate-400">
              Kullanılan alan
            </span>
          </div>
          <span className="text-sm font-bold text-white">{getStorageSize()}</span>
        </div>
        <p className="text-[10px] text-slate-600 mt-2">
          Tarayıcı limiti: ~5-10 MB (yıllarca kullanım için fazlasıyla yeterli)
        </p>
      </div>

      {/* Export */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-white mb-2">
          Veri Yedekleme
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tüm görevlerin, başarımların ve ayarlarının yedeğini al. Tarayıcı
          verilerini temizlesen bile bu dosyayla geri yükleyebilirsin.
        </p>
        <Button
          variant="primary"
          leftIcon={<Download size={16} />}
          onClick={handleExport}
          fullWidth
        >
          Yedeği İndir (.json)
        </Button>
      </div>

      {/* Import */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-white mb-2">
          Veri Geri Yükleme
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Daha önce aldığın yedeği geri yükle. Mevcut veriler üzerine yazılır.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        <Button
          variant="secondary"
          leftIcon={<Upload size={16} />}
          onClick={() => fileInputRef.current?.click()}
          fullWidth
        >
          Yedek Dosyası Seç
        </Button>

        {/* Import Status */}
        {importStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span className="text-xs text-emerald-400">
              Veriler başarıyla geri yüklendi!
            </span>
          </motion.div>
        )}

        {importStatus === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <AlertTriangle size={16} className="text-red-400" />
            <span className="text-xs text-red-400">
              Dosya okunamadı. Geçerli bir yedek dosyası seçin.
            </span>
          </motion.div>
        )}
      </div>

      {/* Reset */}
      <div className="glass-card rounded-2xl p-4 border border-red-500/20">
        <h3 className="text-sm font-semibold text-red-400 mb-2">
          Tehlikeli Bölge
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tüm verileri kalıcı olarak sil. Bu işlem geri alınamaz!
        </p>

        {!showResetConfirm ? (
          <Button
            variant="danger"
            leftIcon={<Trash2 size={16} />}
            onClick={() => setShowResetConfirm(true)}
            fullWidth
          >
            Tüm Verileri Sil
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle
                size={16}
                className="text-red-400 flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-red-300">
                Bu işlem tüm görevleri, başarımları, XP&apos;ni ve ayarlarını
                kalıcı olarak silecek. Onaylamak için{" "}
                <strong>&quot;SİL&quot;</strong> yazın.
              </p>
            </div>

            <input
              type="text"
              value={resetText}
              onChange={(e) => setResetText(e.target.value)}
              placeholder='Onaylamak için "SİL" yazın'
              className="border-red-500/30 focus:border-red-500"
            />

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowResetConfirm(false);
                  setResetText("");
                }}
                fullWidth
              >
                İptal
              </Button>
              <Button
                variant="danger"
                onClick={handleReset}
                disabled={resetText !== "SİL"}
                fullWidth
              >
                Onayla ve Sil
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
