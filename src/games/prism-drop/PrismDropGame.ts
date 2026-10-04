import Phaser from "phaser";
import type { GameInterface, GameMountOptions } from "../../core/game/GameInterface";
import { PrismDropScene, type PrismDropSceneCallbacks } from "./scenes/PrismDropScene";
import type { RunState } from "./logic/prismLogic";

export class PrismDropGame implements GameInterface {
  private game: Phaser.Game | null = null;
  private scene: PrismDropScene | null = null;

  constructor(private callbacks: PrismDropSceneCallbacks) {}

  init(container: HTMLElement, options: GameMountOptions) {
    if (this.game) return;

    this.scene = new PrismDropScene({
      ...this.callbacks,
      reducedMotion: options.reducedMotion,
    });

    const antialias = options.graphicsQuality !== "low";

    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: container,
      width: options.width,
      height: options.height,
      backgroundColor: "#070a14",
      antialias,
      fps: { target: 60, forceSetTimeOut: false },
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [this.scene],
      audio: { noAudio: true },
      render: {
        pixelArt: false,
        roundPixels: options.graphicsQuality === "low",
      },
    });
  }

  setRun(run: RunState) {
    this.scene?.setRun(run);
  }

  getRun(): RunState | null {
    return this.scene?.getRunClone() ?? null;
  }

  rotateSelected() {
    return this.scene?.rotateSelected();
  }

  canUndo() {
    return this.scene?.canUndo() ?? false;
  }

  undo() {
    return this.scene?.undo();
  }

  beginBombMode() {
    this.scene?.beginBombMode();
  }

  pause() {
    this.scene?.scene.pause();
  }

  resume() {
    this.scene?.scene.resume();
  }

  destroy() {
    if (!this.game) return;
    this.game.destroy(true);
    this.game = null;
    this.scene = null;
  }
}
