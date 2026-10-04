import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_STATE } from "./defaultState";
import type {
  AppPersistedState,
  PrismDropRunState,
  PrismDropSaveState,
  SettingsState,
} from "./types";

export interface AppState extends AppPersistedState {
  setSettings: (patch: Partial<SettingsState>) => void;
  addCoins: (delta: number) => void;
  spendCoins: (cost: number) => boolean;
  addXP: (delta: number) => void;
  claimDailyReward: (today: string, amount: number) => boolean;
  grantAchievement: (id: string) => void;

  addPowerup: (id: keyof AppPersistedState["meta"]["powerups"], delta: number) => void;
  consumePowerup: (id: keyof AppPersistedState["meta"]["powerups"]) => boolean;

  prismDropSetSave: (patch: Partial<PrismDropSaveState>) => void;
  prismDropSaveRun: (run: PrismDropRunState | null) => void;
}

function levelFromXP(xp: number) {
  // Smooth early progression: each level requires slightly more
  let level = 1;
  let remaining = xp;
  let req = 100;
  while (remaining >= req) {
    remaining -= req;
    level += 1;
    req = Math.floor(req * 1.15);
  }
  return level;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setSettings: (patch) =>
        set((s) => ({
          settings: { ...s.settings, ...patch },
        })),

      addCoins: (delta) =>
        set((s) => ({
          profile: { ...s.profile, coins: Math.max(0, s.profile.coins + delta) },
        })),

      spendCoins: (cost) => {
        const coins = get().profile.coins;
        if (coins < cost) return false;
        set((s) => ({ profile: { ...s.profile, coins: s.profile.coins - cost } }));
        return true;
      },

      addXP: (delta) =>
        set((s) => {
          const xp = Math.max(0, s.profile.xp + delta);
          return {
            profile: { ...s.profile, xp, level: levelFromXP(xp) },
          };
        }),

      claimDailyReward: (today, amount) => {
        const last = get().profile.lastDailyClaimDate;
        if (last === today) return false;
        set((s) => ({
          profile: {
            ...s.profile,
            coins: s.profile.coins + amount,
            lastDailyClaimDate: today,
          },
        }));
        return true;
      },

      grantAchievement: (id) =>
        set((s) => ({
          meta: {
            ...s.meta,
            achievements: { ...s.meta.achievements, [id]: true },
          },
        })),

      addPowerup: (id, delta) =>
        set((s) => ({
          meta: {
            ...s.meta,
            powerups: {
              ...s.meta.powerups,
              [id]: Math.max(0, (s.meta.powerups as any)[id] + delta),
            },
          },
        })),

      consumePowerup: (id) => {
        const cur = (get().meta.powerups as any)[id] as number;
        if (cur <= 0) return false;
        set((s) => ({
          meta: {
            ...s.meta,
            powerups: { ...s.meta.powerups, [id]: cur - 1 } as any,
          },
        }));
        return true;
      },

      prismDropSetSave: (patch) => set((s) => ({ prismDrop: { ...s.prismDrop, ...patch } })),
      prismDropSaveRun: (run) => set((s) => ({ prismDrop: { ...s.prismDrop, currentRun: run } })),
    }),
    {
      name: "arcade-nexus-v1",
      version: 1,
      partialize: (s) => ({
        version: s.version,
        settings: s.settings,
        profile: s.profile,
        meta: s.meta,
        prismDrop: s.prismDrop,
      }),
      migrate: (persisted) => {
        // Future-proofing: ensure we can evolve schema.
        if (!persisted || typeof persisted !== "object") return DEFAULT_STATE;
        const p = persisted as any;
        if (p.version !== 1) return DEFAULT_STATE;
        return { ...DEFAULT_STATE, ...p } as AppPersistedState;
      },
    }
  )
);
