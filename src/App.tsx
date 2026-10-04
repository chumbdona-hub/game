import { useEffect, useMemo, useState } from "react";
import { HubHome } from "./hub/HubHome";
import { GameShell } from "./hub/GameShell";
import type { GameId } from "./games/registry";
import { useAppStore } from "./core/store/useAppStore";
import { applySettingsToDOM } from "./core/ui/applySettings";

type Screen =
  | { type: "hub" }
  | { type: "game"; gameId: GameId; launchOpts?: any };

export default function App() {
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);

  const [screen, setScreen] = useState<Screen>({ type: "hub" });

  // Apply runtime settings to DOM.
  useEffect(() => {
    applySettingsToDOM(settings);
  }, [settings]);

  // Respect OS preference at first load.
  useEffect(() => {
    const m = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (m?.matches && !settings.reducedMotion) setSettings({ reducedMotion: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLaunch = useMemo(() => {
    return (id: GameId, launchOpts?: any) => setScreen({ type: "game", gameId: id, launchOpts });
  }, []);

  if (screen.type === "hub") return <HubHome onLaunch={onLaunch} />;

  return (
    <GameShell
      gameId={screen.gameId}
      launchOpts={screen.launchOpts}
      onQuit={() => setScreen({ type: "hub" })}
    />
  );
}
