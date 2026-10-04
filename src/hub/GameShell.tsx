import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { getGameMeta, type GameId } from "../games/registry";
import { Button } from "../core/ui/Button";
import { Modal } from "../core/ui/Modal";
import { useAppStore } from "../core/store/useAppStore";
import { FpsCounter } from "../core/ui/FpsCounter";
import { useT } from "../core/i18n";

export function GameShell({ gameId, onQuit, launchOpts }: { gameId: GameId; onQuit: () => void; launchOpts?: any }) {
  const meta = getGameMeta(gameId);
  const t = useT();
  const showFps = useAppStore((s) => s.settings.showFps);
  const reducedMotion = useAppStore((s) => s.settings.reducedMotion);

  const Entry = useMemo(() => {
    return lazy(meta.loadEntry) as any;
  }, [meta]);

  const [paused, setPaused] = useState(false);
  const [fs, setFs] = useState(false);

  useEffect(() => {
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  return (
    <div className="safe-px safe-pt safe-pb relative h-screen w-screen overflow-hidden">
      <div className="absolute left-4 top-4 z-30 flex items-center gap-2">
        <Button variant="secondary" onClick={() => (paused ? setPaused(false) : onQuit())}>
          {paused ? t("resume") : t("back")}
        </Button>
        <Button variant="secondary" onClick={() => setPaused(true)}>
          {t("pause")}
        </Button>
      </div>

      <div className="absolute right-4 top-4 z-30 flex items-center gap-2">
        {showFps ? <FpsCounter /> : null}
        <Button
          variant="secondary"
          onClick={() => {
            const el = document.documentElement;
            if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => undefined);
            else document.exitFullscreen?.().catch(() => undefined);
          }}
        >
          {fs ? "Exit Fullscreen" : "Fullscreen"}
        </Button>
      </div>

      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center text-white/70">Loading…</div>
          }
        >
          <Entry onQuit={onQuit} paused={paused} setPaused={setPaused} launchOpts={launchOpts} reducedMotion={reducedMotion} />
        </Suspense>
      </div>

      <PauseMenu open={paused} onClose={() => setPaused(false)} onQuit={onQuit} />
    </div>
  );
}

function PauseMenu({ open, onClose, onQuit }: { open: boolean; onClose: () => void; onQuit: () => void }) {
  const t = useT();
  return (
    <Modal open={open} onClose={onClose} title={t("pause")}>
      <div className="grid gap-2">
        <Button onClick={onClose}>{t("resume")}</Button>
        <Button variant="danger" onClick={onQuit}>
          {t("quit_to_hub")}
        </Button>
      </div>
    </Modal>
  );
}

