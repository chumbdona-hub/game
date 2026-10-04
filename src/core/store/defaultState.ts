import type { AppPersistedState } from "./types";

export const DEFAULT_STATE: AppPersistedState = {
  version: 1,
  settings: {
    masterVolume: 0.8,
    sfxVolume: 0.9,
    musicVolume: 0.6,
    graphicsQuality: "high",
    language: "en",
    controlScheme: "auto",
    showFps: false,
    reducedMotion: false,
    palette: "default",
    uiScale: 1,
  },
  profile: {
    coins: 0,
    xp: 0,
    level: 1,
    lastDailyClaimDate: null,
  },
  meta: {
    achievements: {},
    powerups: { rotate: 1, bomb: 0, undo: 0 },
    lastPlayed: null,
  },
  prismDrop: {
    highScoreClassic: 0,
    dailyBestByDate: {},
    adventure: { unlockedLevelIndex: 0, bestStarsByLevelId: {} },
    currentRun: null,
  },
};
