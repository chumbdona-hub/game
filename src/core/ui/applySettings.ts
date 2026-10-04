import type { SettingsState } from "../store/types";

export function applySettingsToDOM(settings: SettingsState) {
  const root = document.documentElement;

  root.style.setProperty("--ui-scale", String(settings.uiScale));

  // Palette swap: keep it subtle and colorblind-safer by shifting accents.
  if (settings.palette === "colorblind") {
    root.style.setProperty("--nexus-accent-a", "#34d399"); // emerald
    root.style.setProperty("--nexus-accent-b", "#60a5fa"); // blue
  } else {
    root.style.setProperty("--nexus-accent-a", "#22d3ee");
    root.style.setProperty("--nexus-accent-b", "#a78bfa");
  }
}
