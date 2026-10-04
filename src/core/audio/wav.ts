// Tiny procedural WAV generator (16-bit PCM mono). Produces ORIGINAL audio without external assets.

export function makeSineWavBlob(
  freqHz: number,
  durationSec: number,
  {
    sampleRate = 44100,
    attack = 0.005,
    release = 0.06,
    volume = 0.6,
  }: { sampleRate?: number; attack?: number; release?: number; volume?: number } = {}
) {
  const total = Math.max(1, Math.floor(durationSec * sampleRate));
  const pcm = new Int16Array(total);

  for (let i = 0; i < total; i++) {
    const t = i / sampleRate;
    const env = envelope(t, durationSec, attack, release);
    const s = Math.sin(2 * Math.PI * freqHz * t) * env * volume;
    pcm[i] = Math.max(-1, Math.min(1, s)) * 0x7fff;
  }

  return pcmToWavBlob(pcm, sampleRate);
}

function envelope(t: number, dur: number, attack: number, release: number) {
  const a = Math.min(1, t / Math.max(attack, 1e-6));
  const r = Math.min(1, Math.max(0, dur - t) / Math.max(release, 1e-6));
  return Math.min(a, r);
}

function pcmToWavBlob(pcm: Int16Array, sampleRate: number) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcm.length * 2;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeStr(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(view, 8, "WAVE");

  writeStr(view, 12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  writeStr(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let o = 44;
  for (let i = 0; i < pcm.length; i++, o += 2) view.setInt16(o, pcm[i], true);

  return new Blob([buffer], { type: "audio/wav" });
}

function writeStr(view: DataView, offset: number, s: string) {
  for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
}
