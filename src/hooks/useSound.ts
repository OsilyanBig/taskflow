"use client";

import { useCallback, useRef } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

type SoundType = "complete" | "levelup" | "achievement" | "click" | "error";

export const useSound = () => {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Web Audio API ile ses üretme (dosya gerektirmez)
  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = "sine", volume: number = 0.3) => {
      if (!soundEnabled) return;

      try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
      } catch (error) {
        // Ses çalamıyorsa sessizce devam et
      }
    },
    [soundEnabled, getAudioContext]
  );

  const playSound = useCallback(
    (type: SoundType) => {
      if (!soundEnabled) return;

      switch (type) {
        case "complete":
          // Tatmin edici tamamlama sesi
          playTone(523.25, 0.15, "sine", 0.2); // C5
          setTimeout(() => playTone(659.25, 0.15, "sine", 0.2), 100); // E5
          setTimeout(() => playTone(783.99, 0.3, "sine", 0.2), 200); // G5
          break;

        case "levelup":
          // Seviye atlama fanfar
          playTone(523.25, 0.1, "square", 0.15);
          setTimeout(() => playTone(659.25, 0.1, "square", 0.15), 100);
          setTimeout(() => playTone(783.99, 0.1, "square", 0.15), 200);
          setTimeout(() => playTone(1046.5, 0.4, "square", 0.2), 300);
          break;

        case "achievement":
          // Achievement açma sesi
          playTone(440, 0.1, "sine", 0.2);
          setTimeout(() => playTone(554.37, 0.1, "sine", 0.2), 80);
          setTimeout(() => playTone(659.25, 0.1, "sine", 0.2), 160);
          setTimeout(() => playTone(880, 0.5, "sine", 0.25), 240);
          break;

        case "click":
          playTone(800, 0.05, "sine", 0.1);
          break;

        case "error":
          playTone(200, 0.15, "sawtooth", 0.15);
          setTimeout(() => playTone(150, 0.2, "sawtooth", 0.15), 150);
          break;
      }
    },
    [soundEnabled, playTone]
  );

  // Haptic feedback (mobil cihazlar için)
  const vibrate = useCallback(
    (pattern: number | number[] = 50) => {
      if (!hapticEnabled) return;

      try {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(pattern);
        }
      } catch {
        // Haptic desteklenmiyorsa sessizce devam et
      }
    },
    [hapticEnabled]
  );

  // Kombinasyon efektler
  const playCompleteEffect = useCallback(() => {
    playSound("complete");
    vibrate(50);
  }, [playSound, vibrate]);

  const playLevelUpEffect = useCallback(() => {
    playSound("levelup");
    vibrate([50, 100, 50, 100, 100]);
  }, [playSound, vibrate]);

  const playAchievementEffect = useCallback(() => {
    playSound("achievement");
    vibrate([100, 50, 100]);
  }, [playSound, vibrate]);

  const playErrorEffect = useCallback(() => {
    playSound("error");
    vibrate([100, 50, 100]);
  }, [playSound, vibrate]);

  return {
    playSound,
    vibrate,
    playCompleteEffect,
    playLevelUpEffect,
    playAchievementEffect,
    playErrorEffect,
  };
};
