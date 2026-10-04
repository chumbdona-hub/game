import { Howl, Howler } from "howler";
import type { SettingsState } from "../store/types";
import { buildSfxUrls, type SfxId } from "./sfx";

export class AudioManager {
  private static _instance: AudioManager | null = null;
  static get instance() {
    if (!this._instance) this._instance = new AudioManager();
    return this._instance;
  }

  private inited = false;
  private sfx: Partial<Record<SfxId, Howl>> = {};
  private sfxUrls: Partial<Record<SfxId, string>> = {};
  private settings: SettingsState | null = null;

  init(settings: SettingsState) {
    this.settings = settings;
    Howler.volume(settings.masterVolume);

    if (!this.inited) {
      this.sfxUrls = buildSfxUrls();
      (Object.keys(this.sfxUrls) as SfxId[]).forEach((id) => {
        const src = this.sfxUrls[id]!;
        this.sfx[id] = new Howl({ src: [src], volume: settings.sfxVolume });
      });
      this.inited = true;
    } else {
      this.applySettings(settings);
    }

    this.installUnlockOnFirstGesture();
  }

  applySettings(settings: SettingsState) {
    this.settings = settings;
    Howler.volume(settings.masterVolume);
    (Object.keys(this.sfx) as SfxId[]).forEach((id) => {
      this.sfx[id]?.volume(settings.sfxVolume);
    });
  }

  play(id: SfxId) {
    const s = this.settings;
    if (!s) return;
    if (s.masterVolume <= 0 || s.sfxVolume <= 0) return;
    this.sfx[id]?.play();
  }

  private installUnlockOnFirstGesture() {
    // iOS/Safari requires user gesture to start AudioContext.
    if (typeof window === "undefined") return;
    const ctx = Howler.ctx;
    if (!ctx) return;
    if (ctx.state === "running") return;

    const unlock = () => {
      ctx.resume().catch(() => undefined);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
  }
}
