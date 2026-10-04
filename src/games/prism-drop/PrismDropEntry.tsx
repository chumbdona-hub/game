import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../core/ui/Button";
import { Modal } from "../../core/ui/Modal";
import { useAppStore } from "../../core/store/useAppStore";
import { isMobileLike, todayKey } from "../../core/device";
import { AudioManager } from "../../core/audio/AudioManager";
import { useT } from "../../core/i18n";
import { PrismDropGame } from "./PrismDropGame";
import { ADVENTURE_LEVELS } from "./config/levels";
import { hashStringToSeed } from "./config/rng";
import { newRun, type RunState } from "./logic/prismLogic";

type View = "menu" | "adventure" | "playing" | "gameover" | "victory";

export default function PrismDropEntry({
  onQuit,
  paused,
  setPaused,
  launchOpts,
}: {
  onQuit: () => void;
  paused?: boolean;
  setPaused?: (v: boolean) => void;
  launchOpts?: any;
}) {
  const t = useT();
  const settings = useAppStore((s) => s.settings);
  const prism = useAppStore((s) => s.prismDrop);
  const metaPowerups = useAppStore((s) => s.meta.powerups);
  const addCoins = useAppStore((s) => s.addCoins);
  const addXP = useAppStore((s) => s.addXP);
  const spendCoins = useAppStore((s) => s.spendCoins);
  const addPowerup = useAppStore((s) => s.addPowerup);
  const consumePowerup = useAppStore((s) => s.consumePowerup);
  const setPrismSave = useAppStore((s) => s.prismDropSetSave);
  const saveRun = useAppStore((s) => s.prismDropSaveRun);
  const grantAchievement = useAppStore((s) => s.grantAchievement);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<PrismDropGame | null>(null);

  const [view, setView] = useState<View>("menu");
  const [run, setRun] = useState<RunState | null>(null);
  const [starsEarned, setStarsEarned] = useState(0);

  const today = useMemo(() => todayKey(), []);

  // Mount Phaser instance once.
  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      // Phaser scale manager handles RESIZE; we just ensure container exists.
    });
    ro.observe(el);

    const device = isMobileLike() ? "mobile" : "desktop";

    const g = new PrismDropGame({
      onRunUpdate: (r) => {
        setRun(r);
        saveRun(r);

        // Minimal achievements
        if (r.linesClearedTotal > 0) grantAchievement("prism_first_clear");
        if (r.score >= 5000) grantAchievement("prism_5k");
      },
      onGameOver: (finalRun) => {
        setRun(finalRun);
        saveRun(null);
        setView("gameover");
      },
      onVictory: (finalRun, stars) => {
        setRun(finalRun);
        setStarsEarned(stars);
        saveRun(null);
        setView("victory");
      },
    });

    gameRef.current = g;

    const rect = el.getBoundingClientRect();
    g.init(el, {
      width: Math.max(320, Math.floor(rect.width)),
      height: Math.max(320, Math.floor(rect.height)),
      device,
      graphicsQuality: settings.graphicsQuality,
      reducedMotion: settings.reducedMotion,
      showFps: settings.showFps,
    });

    return () => {
      ro.disconnect();
      g.destroy();
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pause / resume from shell.
  useEffect(() => {
    if (!gameRef.current) return;
    if (paused) gameRef.current.pause();
    else gameRef.current.resume();
  }, [paused]);

  // Auto-launch Continue.
  useEffect(() => {
    if (launchOpts?.mode === "continue" && prism.currentRun && view === "menu") {
      startFromRun(prism.currentRun as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launchOpts]);

  function startFromRun(saved: RunState) {
    const g = gameRef.current;
    if (!g) return;
    g.setRun(saved);
    setRun(saved);
    setView("playing");
    AudioManager.instance.play("ui_click");
  }

  function startMode(mode: "classic" | "daily") {
    const g = gameRef.current;
    if (!g) return;

    const seed = mode === "daily" ? hashStringToSeed(`prismdrop:${today}`) : (Math.random() * 1e9) | 0;
    const r = newRun({ seed, mode });
    g.setRun(r);
    setRun(r);
    saveRun(r);
    setView("playing");
    AudioManager.instance.play("ui_click");
  }

  function startAdventure(levelIndex: number) {
    const level = ADVENTURE_LEVELS[levelIndex];
    const g = gameRef.current;
    if (!g) return;

    const r = newRun({
      seed: level.seed,
      mode: "adventure",
      adventure: { levelId: level.id, goalLines: level.goalLines, maxMoves: level.maxMoves, movesUsed: 0 },
    });
    g.setRun(r);
    setRun(r);
    saveRun(r);
    setView("playing");
    AudioManager.instance.play("ui_click");
  }

  function finalizeRunRewards(finalRun: RunState) {
    // Coins + XP reward based on performance (tunable)
    const coinsEarned = Math.max(0, Math.floor(finalRun.score / 500));
    const xpEarned = Math.max(0, Math.floor(finalRun.score / 80));
    if (coinsEarned) addCoins(coinsEarned);
    if (xpEarned) addXP(xpEarned);
    return { coinsEarned, xpEarned };
  }

  function updateHighScores(finalRun: RunState) {
    if (finalRun.mode === "classic") {
      if (finalRun.score > prism.highScoreClassic) setPrismSave({ highScoreClassic: finalRun.score });
    }
    if (finalRun.mode === "daily") {
      const cur = prism.dailyBestByDate[today] ?? 0;
      if (finalRun.score > cur) setPrismSave({ dailyBestByDate: { ...prism.dailyBestByDate, [today]: finalRun.score } });
    }
  }

  const canContinue = !!prism.currentRun;

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {/* Overlay UI */}
      <div className="pointer-events-none absolute inset-0">
        {view === "menu" ? (
          <div className="pointer-events-auto absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-black/45 p-5 shadow-2xl">
              <div className="mb-2 text-2xl font-semibold text-white">{t("prismdrop_title")}</div>
              <div className="mb-4 text-sm text-white/70">8×8 grid • drag pieces • clear rows/columns • chain combos.</div>

              <div className="grid gap-2">
                {canContinue ? (
                  <Button onClick={() => startFromRun(prism.currentRun as any)}>{t("continue")}</Button>
                ) : null}
                <Button variant="secondary" onClick={() => startMode("classic")}>
                  {t("prismdrop_classic")} (Best: {prism.highScoreClassic})
                </Button>
                <Button variant="secondary" onClick={() => startMode("daily")}>
                  {t("prismdrop_daily")} (Today: {prism.dailyBestByDate[today] ?? 0})
                </Button>
                <Button variant="secondary" onClick={() => setView("adventure")}>
                  {t("prismdrop_adventure")}
                </Button>
                <Button variant="ghost" onClick={onQuit}>
                  {t("quit_to_hub")}
                </Button>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
                Power-ups are persistent inventory (buy with coins): Rotate, Bomb, Undo.
              </div>
            </div>
          </div>
        ) : null}

        {view === "adventure" ? (
          <div className="pointer-events-auto absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-black/45 p-5 shadow-2xl">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <div className="text-2xl font-semibold text-white">{t("prismdrop_adventure")}</div>
                  <div className="text-sm text-white/70">Goal-based levels. Earn coins and stars.</div>
                </div>
                <Button variant="secondary" onClick={() => setView("menu")}>
                  {t("back")}
                </Button>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                {ADVENTURE_LEVELS.map((lvl, idx) => {
                  const unlocked = idx <= prism.adventure.unlockedLevelIndex;
                  const bestStars = prism.adventure.bestStarsByLevelId[lvl.id] ?? 0;
                  return (
                    <div key={lvl.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {t("prismdrop_level")} {idx + 1}: {lvl.name}
                          </div>
                          <div className="mt-1 text-xs text-white/70">
                            Goal: {lvl.goalLines} lines • Moves: {lvl.maxMoves}
                          </div>
                          <div className="mt-1 text-xs text-white/60">Reward: +{lvl.rewardCoins} coins</div>
                        </div>
                        <div className="text-sm text-white/70">{"★".repeat(bestStars)}{bestStars ? "" : "—"}</div>
                      </div>
                      <div className="mt-3">
                        <Button
                          disabled={!unlocked}
                          onClick={() => startAdventure(idx)}
                          className="w-full"
                        >
                          {unlocked ? "Start" : "Locked"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {view === "playing" && run ? (
          <HUD
            run={run}
            powerups={metaPowerups}
            onRotate={() => {
              if (!gameRef.current) return;
              if (!consumeOrBuy("rotate", 10)) return;
              gameRef.current.rotateSelected();
            }}
            onBomb={() => {
              if (!gameRef.current) return;
              if (!consumeOrBuy("bomb", 25)) return;
              gameRef.current.beginBombMode();
            }}
            onUndo={() => {
              if (!gameRef.current) return;
              if (!gameRef.current.canUndo()) return;
              if (!consumeOrBuy("undo", 20)) return;
              gameRef.current.undo();
            }}
          />
        ) : null}
      </div>

      <GameEndModals
        view={view}
        run={run}
        starsEarned={starsEarned}
        onDismiss={() => {
          setView("menu");
          setStarsEarned(0);
        }}
        onRestart={() => {
          setStarsEarned(0);
          if (run?.mode === "classic") startMode("classic");
          else if (run?.mode === "daily") startMode("daily");
          else setView("adventure");
        }}
        onQuit={() => {
          setPaused?.(false);
          onQuit();
        }}
        onFinalize={(finalRun, stars) => {
          if (!finalRun) return;
          updateHighScores(finalRun);
          const { coinsEarned } = finalizeRunRewards(finalRun);

          if (finalRun.mode === "adventure" && finalRun.adventure) {
            const levelIndex = ADVENTURE_LEVELS.findIndex((l) => l.id === finalRun.adventure!.levelId);
            const level = ADVENTURE_LEVELS[levelIndex];
            if (level) addCoins(level.rewardCoins);

            const prevStars = prism.adventure.bestStarsByLevelId[level.id] ?? 0;
            const newStars = Math.max(prevStars, stars);
            const unlockedNext = Math.max(prism.adventure.unlockedLevelIndex, levelIndex + 1);
            setPrismSave({
              adventure: {
                unlockedLevelIndex: unlockedNext,
                bestStarsByLevelId: { ...prism.adventure.bestStarsByLevelId, [level.id]: newStars },
              },
            });
          }

          if (coinsEarned > 0) AudioManager.instance.play("reward");
        }}
      />

      {/* helpers */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white/50">
        Tip: Drag pieces from the tray. Rotate/Bomb/Undo are on the HUD.
      </div>

      {/** Power-up purchase/consume */}
      <PowerupHelper
        spendCoins={spendCoins}
        addPowerup={addPowerup}
        consumePowerup={consumePowerup}
        metaPowerups={metaPowerups}
      />
    </div>
  );

  function consumeOrBuy(id: "rotate" | "bomb" | "undo", cost: number) {
    if (metaPowerups[id] > 0) {
      return consumePowerup(id);
    }
    const ok = spendCoins(cost);
    if (!ok) return false;
    addPowerup(id, 1);
    return consumePowerup(id);
  }
}

function HUD({
  run,
  powerups,
  onRotate,
  onBomb,
  onUndo,
}: {
  run: RunState;
  powerups: { rotate: number; bomb: number; undo: number };
  onRotate: () => void;
  onBomb: () => void;
  onUndo: () => void;
}) {
  return (
    <div className="pointer-events-auto absolute inset-x-3 top-20 z-20 flex flex-col gap-3 md:inset-x-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Stat label="Score" value={run.score} />
          <Stat label="Lines" value={run.linesClearedTotal} />
          <Stat label="Combo" value={run.combo} />
          {run.mode === "adventure" && run.adventure ? (
            <Stat label="Moves" value={`${run.adventure.movesUsed}/${run.adventure.maxMoves}`} />
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <PowerBtn label={`Rotate (${powerups.rotate}) / 10c`} onClick={onRotate} />
        <PowerBtn label={`Bomb (${powerups.bomb}) / 25c`} onClick={onBomb} />
        <PowerBtn label={`Undo (${powerups.undo}) / 20c`} onClick={onUndo} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-white/60">{label}</div>
      <div className="text-sm font-semibold text-white tabular-nums">{value}</div>
    </div>
  );
}

function PowerBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10 active:scale-[0.99]"
    >
      {label}
    </button>
  );
}

function GameEndModals({
  view,
  run,
  starsEarned,
  onRestart,
  onDismiss,
  onQuit,
  onFinalize,
}: {
  view: View;
  run: RunState | null;
  starsEarned: number;
  onRestart: () => void;
  onDismiss: () => void;
  onQuit: () => void;
  onFinalize: (run: RunState | null, stars: number) => void;
}) {
  useEffect(() => {
    if (view === "gameover" || view === "victory") onFinalize(run, starsEarned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  if (view !== "gameover" && view !== "victory") return null;

  const title = view === "victory" ? "Goal reached!" : "Run ended";

  return (
    <Modal open title={title} onClose={onDismiss}>
      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60">Final Score</div>
          <div className="mt-1 text-2xl font-semibold text-white tabular-nums">{run?.score ?? 0}</div>
          {view === "victory" ? (
            <div className="mt-2 text-sm text-white/80">Stars: {"★".repeat(starsEarned)}</div>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Button onClick={onRestart}>Restart</Button>
          <Button variant="secondary" onClick={onDismiss}>
            Back to Menu
          </Button>
          <Button variant="danger" onClick={onQuit}>
            Quit to Hub
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function PowerupHelper({
  spendCoins,
  addPowerup,
  consumePowerup,
  metaPowerups,
}: {
  spendCoins: (cost: number) => boolean;
  addPowerup: (id: "rotate" | "bomb" | "undo", delta: number) => void;
  consumePowerup: (id: "rotate" | "bomb" | "undo") => boolean;
  metaPowerups: { rotate: number; bomb: number; undo: number };
}) {
  // This component intentionally renders nothing; it just ensures the functions are retained
  // and makes it easy to move power-up shop logic into its own modal in Phase 2.
  void spendCoins;
  void addPowerup;
  void consumePowerup;
  void metaPowerups;
  return null;
}
