# ARCADE NEXUS (Phase 1)

A polished web game hub built with **Vite + React + TypeScript + Tailwind**, with games loaded as separate chunks. Phase 1 ships the hub core systems and **Game 1: Prism Drop** fully playable.

> All visuals and audio in this repo are original placeholders (procedural shapes + generated SFX). No copyrighted assets are included.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## PWA

- Includes `public/manifest.webmanifest` + `public/sw.js`
- In production (`npm run build` + serve), you should be able to **Install** / **Add to Home Screen**.

## Folder Structure (Phase 1)

```
src/
  App.tsx
  index.css
  core/
    audio/
      AudioManager.ts
      sfx.ts
      wav.ts
    device.ts
    game/
      GameInterface.ts
    i18n/
      index.ts
    input/
      InputManager.ts
    pwa/
      registerSW.ts
    store/
      defaultState.ts
      types.ts
      useAppStore.ts
    ui/
      applySettings.ts
      Button.tsx
      FpsCounter.tsx
      Modal.tsx
      Select.tsx
      Slider.tsx
      Toggle.tsx
  hub/
    HubHome.tsx
    GameShell.tsx
    components/
      DailyRewardModal.tsx
      GameCard.tsx
      NexusLogo.tsx
      SettingsModal.tsx
  games/
    registry.ts
    stub/
      ComingSoonEntry.tsx
    prism-drop/
      PrismDropEntry.tsx
      PrismDropGame.ts
      config/
        levels.ts
        rng.ts
        shapes.ts
      logic/
        prismLogic.ts
      scenes/
        PrismDropScene.ts
public/
  manifest.webmanifest
  sw.js
  icons/
    icon-192.png
    icon-512.png
```

## What’s Playable (Phase 1)

### Hub
- Home screen with animated game cards
- Profile: **level + coins** (persistent)
- **Daily reward** (+50 coins/day)
- Settings (persistent): volume, graphics quality, language EN/VI, UI scale, reduced motion, FPS toggle
- Shared overlay when a game is running: **pause menu + fullscreen + FPS counter**

### Game 1 — Prism Drop (Block Puzzle)
- 8×8 grid
- 3-piece tray, drag-and-drop with snap ghost preview
- Clear full rows/columns
- Combo multiplier & streak bonus, screen shake + particles on clears (reduced motion disables heavy effects)
- Smart tray generator avoids unwinnable hands (guarantees at least 1 current placement when generating)
- Modes:
  - Classic (endless)
  - Daily Challenge (seeded by date)
  - Adventure (goal-based levels with stars + coin rewards)
- Power-ups (persistent inventory, buy with coins): **Rotate / Bomb / Undo**
- Touch support: drag offset lifts piece above finger
- Continue: active run state saved to localStorage and can be resumed

## Testing Checklist

### Desktop (keyboard + mouse)
- [ ] Hub loads, settings open, daily reward claim works
- [ ] Launch Prism Drop → Classic → place pieces, clear lines
- [ ] Rotate/Bomb/Undo buttons work and update inventory
- [ ] Pause menu pauses gameplay input
- [ ] Fullscreen toggle works
- [ ] Close the tab mid-run, reload → Continue restores run

### Mobile (touch)
- [ ] Hub layout fits portrait, safe-area padding works
- [ ] Prism Drop dragging stays visible above finger
- [ ] Bomb mode: tap a grid cell to detonate
- [ ] Install as PWA (Add to Home Screen) and re-open

## Notes

- Phaser audio is disabled; all audio uses **Howler** with generated WAV tones.
- Phaser particles use the v3.60+ emitter API.

## Next Phases
- Phase 2: Last Ember (survivor) + raid mode + permanent shop
- Phase 3: Vector Strike (Three.js FPS) + bots + abilities
- Phase 4: Neon Sprint / Gate Keepers / Quick Pack
- Phase 5: Full polish, balance, performance audit, expanded PWA + documentation
