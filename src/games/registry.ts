export type GameId =
  | "prism-drop"
  | "last-ember"
  | "vector-strike"
  | "neon-sprint"
  | "gate-keepers"
  | "quick-pack";

import type { ComponentType } from "react";

export interface GameMeta {
  id: GameId;
  title: string;
  subtitle: string;
  phase: number;
  playable: boolean;
  accent: { a: string; b: string };
  loadEntry: () => Promise<{ default: ComponentType<any> }>;
}

export const GAMES: GameMeta[] = [
  {
    id: "prism-drop",
    title: "Prism Drop",
    subtitle: "Block puzzle with combos, power-ups and daily seeds.",
    phase: 1,
    playable: true,
    accent: { a: "#22d3ee", b: "#a78bfa" },
    loadEntry: () => import("./prism-drop/PrismDropEntry"),
  },
  {
    id: "last-ember",
    title: "Last Ember",
    subtitle: "Auto-battler survivor roguelite (Phase 2).",
    phase: 2,
    playable: false,
    accent: { a: "#fb7185", b: "#fbbf24" },
    loadEntry: () => import("./stub/ComingSoonEntry"),
  },
  {
    id: "vector-strike",
    title: "Vector Strike",
    subtitle: "Single-player tactical FPS vs bots (Phase 3).",
    phase: 3,
    playable: false,
    accent: { a: "#60a5fa", b: "#34d399" },
    loadEntry: () => import("./stub/ComingSoonEntry"),
  },
  {
    id: "neon-sprint",
    title: "Neon Sprint",
    subtitle: "Swipe lane runner with missions (Phase 4).",
    phase: 4,
    playable: false,
    accent: { a: "#f472b6", b: "#22c55e" },
    loadEntry: () => import("./stub/ComingSoonEntry"),
  },
  {
    id: "gate-keepers",
    title: "Gate Keepers",
    subtitle: "Grid tower defense across 3 maps (Phase 4).",
    phase: 4,
    playable: false,
    accent: { a: "#f97316", b: "#fde047" },
    loadEntry: () => import("./stub/ComingSoonEntry"),
  },
  {
    id: "quick-pack",
    title: "Quick Pack",
    subtitle: "Two swipe minis: merge + match pack (Phase 4).",
    phase: 4,
    playable: false,
    accent: { a: "#c084fc", b: "#38bdf8" },
    loadEntry: () => import("./stub/ComingSoonEntry"),
  },
];

export function getGameMeta(id: GameId) {
  const g = GAMES.find((x) => x.id === id);
  if (!g) throw new Error(`Unknown game id: ${id}`);
  return g;
}
