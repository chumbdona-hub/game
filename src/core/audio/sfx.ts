import { makeSineWavBlob } from "./wav";

export type SfxId = "ui_click" | "place" | "clear" | "game_over" | "reward";

export function buildSfxUrls(): Record<SfxId, string> {
  // Keep them short to minimize memory; these are ORIGINAL generated tones.
  const urls: Partial<Record<SfxId, string>> = {};

  urls.ui_click = URL.createObjectURL(makeSineWavBlob(660, 0.05, { volume: 0.45 }));
  urls.place = URL.createObjectURL(makeSineWavBlob(420, 0.06, { volume: 0.5 }));
  urls.clear = URL.createObjectURL(makeSineWavBlob(920, 0.12, { volume: 0.55 }));
  urls.game_over = URL.createObjectURL(makeSineWavBlob(190, 0.22, { volume: 0.6 }));
  urls.reward = URL.createObjectURL(makeSineWavBlob(780, 0.14, { volume: 0.55 }));

  return urls as Record<SfxId, string>;
}
