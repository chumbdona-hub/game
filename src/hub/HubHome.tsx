import { useEffect, useMemo, useState } from "react";
import { GAMES, type GameId } from "../games/registry";
import { useAppStore } from "../core/store/useAppStore";
import { AudioManager } from "../core/audio/AudioManager";
import { todayKey } from "../core/device";
import { useT } from "../core/i18n";
import { Button } from "../core/ui/Button";
import { GameCard } from "./components/GameCard";
import { NexusLogo } from "./components/NexusLogo";
import { SettingsModal } from "./components/SettingsModal";
import { DailyRewardModal } from "./components/DailyRewardModal";

export function HubHome({ onLaunch }: { onLaunch: (id: GameId, opts?: any) => void }) {
  const t = useT();
  const coins = useAppStore((s) => s.profile.coins);
  const level = useAppStore((s) => s.profile.level);
  const settings = useAppStore((s) => s.settings);
  const prism = useAppStore((s) => s.prismDrop);
  const lastDaily = useAppStore((s) => s.profile.lastDailyClaimDate);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dailyOpen, setDailyOpen] = useState(false);

  const today = useMemo(() => todayKey(), []);

  useEffect(() => {
    AudioManager.instance.init(settings);
  }, [settings]);

  useEffect(() => {
    if (lastDaily !== today) setDailyOpen(true);
  }, [lastDaily, today]);

  const hasContinuePrism = !!prism.currentRun;

  return (
    <div className="safe-px safe-pt safe-pb mx-auto flex min-h-screen max-w-6xl flex-col gap-6 py-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <NexusLogo />
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
            <div className="text-[11px] uppercase tracking-wide text-white/60">{t("level")}</div>
            <div className="text-sm font-semibold text-white">{level}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
            <div className="text-[11px] uppercase tracking-wide text-white/60">{t("coins")}</div>
            <div className="text-sm font-semibold text-white">{coins}</div>
          </div>
          <Button variant="secondary" onClick={() => setDailyOpen(true)}>
            {t("daily_reward")}
          </Button>
          <Button variant="secondary" onClick={() => setSettingsOpen(true)}>
            {t("settings")}
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {GAMES.map((g) => {
          const disabled = !g.playable;
          if (g.id === "prism-drop") {
            return (
              <GameCard
                key={g.id}
                meta={g}
                disabled={disabled}
                onPlay={() => {
                  AudioManager.instance.play("ui_click");
                  onLaunch("prism-drop", { mode: "menu" });
                }}
                onContinue={
                  hasContinuePrism
                    ? () => {
                        AudioManager.instance.play("ui_click");
                        onLaunch("prism-drop", { mode: "continue" });
                      }
                    : undefined
                }
                continueLabel={t("continue")}
                stats={[
                  { label: "Classic Best", value: String(prism.highScoreClassic) },
                  { label: "Today", value: String(prism.dailyBestByDate[today] ?? 0) },
                ]}
              />
            );
          }
          return (
            <GameCard
              key={g.id}
              meta={g}
              disabled={disabled}
              onPlay={() => {
                AudioManager.instance.play("ui_click");
                onLaunch(g.id);
              }}
            />
          );
        })}
      </section>

      <footer className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="font-semibold text-white">Phase 1</span>: Hub systems + Prism Drop fully playable.
          </div>
          <div className="text-xs text-white/50">Tip: Use fullscreen for the cleanest gameplay.</div>
        </div>
      </footer>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <DailyRewardModal open={dailyOpen} onClose={() => setDailyOpen(false)} />
    </div>
  );
}
