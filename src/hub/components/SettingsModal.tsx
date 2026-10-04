import { useEffect } from "react";
import { Modal } from "../../core/ui/Modal";
import { Slider } from "../../core/ui/Slider";
import { Toggle } from "../../core/ui/Toggle";
import { Select } from "../../core/ui/Select";
import { useAppStore } from "../../core/store/useAppStore";
import type { ControlScheme, GraphicsQuality, Language, PaletteMode } from "../../core/store/types";
import { applySettingsToDOM } from "../../core/ui/applySettings";

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);

  // Apply immediately so UI scaling/palette updates live.
  useEffect(() => {
    if (typeof document !== "undefined") applySettingsToDOM(settings);
  }, [settings]);

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="grid gap-3">
        <Slider
          label="Master Volume"
          value={settings.masterVolume}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setSettings({ masterVolume: v })}
          format={(v) => `${Math.round(v * 100)}%`}
        />
        <Slider
          label="SFX Volume"
          value={settings.sfxVolume}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setSettings({ sfxVolume: v })}
          format={(v) => `${Math.round(v * 100)}%`}
        />
        <Slider
          label="Music Volume"
          value={settings.musicVolume}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setSettings({ musicVolume: v })}
          format={(v) => `${Math.round(v * 100)}%`}
        />

        <Select<GraphicsQuality>
          label="Graphics Quality"
          value={settings.graphicsQuality}
          options={[
            { value: "low", label: "Low" },
            { value: "med", label: "Medium" },
            { value: "high", label: "High" },
          ]}
          onChange={(v) => setSettings({ graphicsQuality: v })}
        />

        <Select<Language>
          label="Language"
          value={settings.language}
          options={[
            { value: "en", label: "English" },
            { value: "vi", label: "Tiếng Việt" },
          ]}
          onChange={(v) => setSettings({ language: v })}
        />

        <Select<ControlScheme>
          label="Control Scheme"
          value={settings.controlScheme}
          options={[
            { value: "auto", label: "Auto" },
            { value: "kbm", label: "Keyboard + Mouse" },
            { value: "touch", label: "Touch" },
          ]}
          onChange={(v) => setSettings({ controlScheme: v })}
        />

        <Select<PaletteMode>
          label="Palette"
          value={settings.palette}
          options={[
            { value: "default", label: "Default" },
            { value: "colorblind", label: "Colorblind-friendly" },
          ]}
          onChange={(v) => setSettings({ palette: v })}
        />

        <Slider
          label="UI Size"
          value={settings.uiScale}
          min={0.85}
          max={1.25}
          step={0.01}
          onChange={(v) => setSettings({ uiScale: v })}
          format={(v) => `${Math.round(v * 100)}%`}
        />

        <Toggle
          label="Reduced motion"
          description="Disables screen shake and reduces flashy animations"
          value={settings.reducedMotion}
          onChange={(v) => setSettings({ reducedMotion: v })}
        />

        <Toggle label="Show FPS" value={settings.showFps} onChange={(v) => setSettings({ showFps: v })} />
      </div>

      <div className="mt-4 text-xs text-white/50">
        Tip: On mobile, add to Home Screen to install ARCADE NEXUS as an app.
      </div>
    </Modal>
  );
}
