export type GraphicsQuality = "low" | "med" | "high";
export type Language = "en" | "vi";
export type ControlScheme = "auto" | "kbm" | "touch";
export type PaletteMode = "default" | "colorblind";

export interface SettingsState {
  masterVolume: number; // 0..1
  sfxVolume: number; // 0..1
  musicVolume: number; // 0..1
  graphicsQuality: GraphicsQuality;
  language: Language;
  controlScheme: ControlScheme;
  showFps: boolean;
  reducedMotion: boolean;
  palette: PaletteMode;
  uiScale: number; // 0.85..1.25
}

export interface ProfileState {
  coins: number;
  xp: number;
  level: number;
  lastDailyClaimDate: string | null; // YYYY-MM-DD
}

export interface PowerupCounts {
  rotate: number;
  bomb: number;
  undo: number;
}

export interface PrismDropRunState {
  version: 1;
  mode: "classic" | "daily" | "adventure";
  seed: number;
  score: number;
  combo: number;
  linesClearedTotal: number;
  grid: number[]; // 64 cells: -1 empty, >=0 = color index
  tray: Array<{ shapeId: string; rot: number; color: number } | null>; // length 3
  rngState: { seed: number; steps: number };
  adventure?: { levelId: string; goalLines: number; maxMoves: number; movesUsed: number };
  undo?: {
    grid: number[];
    tray: Array<{ shapeId: string; rot: number; color: number } | null>;
    score: number;
    combo: number;
    linesClearedTotal: number;
    adventureMovesUsed?: number;
  };
}

export interface PrismDropSaveState {
  highScoreClassic: number;
  dailyBestByDate: Record<string, number>;
  adventure: { unlockedLevelIndex: number; bestStarsByLevelId: Record<string, number> };
  currentRun: PrismDropRunState | null;
}

export interface MetaState {
  achievements: Record<string, boolean>;
  powerups: PowerupCounts;
  lastPlayed: { gameId: string; mode?: string; at: number } | null;
}

export interface AppPersistedState {
  version: 1;
  settings: SettingsState;
  profile: ProfileState;
  meta: MetaState;
  prismDrop: PrismDropSaveState;
}
