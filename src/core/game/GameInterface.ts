export interface GameMountOptions {
  width: number;
  height: number;
  device: "desktop" | "mobile";
  graphicsQuality: "low" | "med" | "high";
  reducedMotion: boolean;
  showFps: boolean;
}

export interface GameInterface {
  init: (container: HTMLElement, options: GameMountOptions) => void;
  pause: () => void;
  resume: () => void;
  destroy: () => void;
}
