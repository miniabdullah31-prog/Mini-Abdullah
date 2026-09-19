/** Short child-friendly UI SFX WAVs for Mini Abdullah (no extra audio libs). */
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "src", "assets", "sounds");
fs.mkdirSync(OUT, { recursive: true });

const RATE = 22050;

function writeWav(fileName, samples) {
  const dataSize = samples.length * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i += 1) {
    const clipped = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(clipped * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT, fileName), buf);
}

function silence(ms) {
  return new Array(Math.floor((RATE * ms) / 1000)).fill(0);
}

function tone(freq, ms, gain) {
  const amp = gain == null ? 0.2 : gain;
  const n = Math.floor((RATE * ms) / 1000);
  const out = new Array(n);
  for (let i = 0; i < n; i += 1) {
    const p = i / n;
    const t = i / RATE;
    const attack = Math.min(1, p * 8);
    const env = Math.sin(Math.PI * attack) * Math.exp(-2.1 * p);
    const harmonic = Math.sin(2 * Math.PI * freq * 2 * t) * 0.18;
    out[i] = (Math.sin(2 * Math.PI * freq * t) + harmonic) * amp * env;
  }
  return out;
}

function chirp(startF, endF, ms, gain) {
  const amp = gain == null ? 0.2 : gain;
  const n = Math.floor((RATE * ms) / 1000);
  const out = new Array(n);
  for (let i = 0; i < n; i += 1) {
    const p = i / n;
    const t = i / RATE;
    const freq = startF + (endF - startF) * p;
    const env = Math.sin(Math.PI * p);
    out[i] = Math.sin(2 * Math.PI * freq * t) * amp * env;
  }
  return out;
}

function drip(freq, ms, gain) {
  const amp = gain == null ? 0.16 : gain;
  const n = Math.floor((RATE * ms) / 1000);
  const out = new Array(n);
  for (let i = 0; i < n; i += 1) {
    const p = i / n;
    const t = i / RATE;
    const env = Math.exp(-6 * p) * (1 - p);
    out[i] = Math.sin(2 * Math.PI * freq * t) * amp * env;
  }
  return out;
}

function softNoise(ms, gain) {
  const amp = gain == null ? 0.05 : gain;
  const n = Math.floor((RATE * ms) / 1000);
  const out = new Array(n);
  let prev = 0;
  for (let i = 0; i < n; i += 1) {
    const p = i / n;
    const env = Math.sin(Math.PI * p);
    const white = Math.random() * 2 - 1;
    prev = prev * 0.72 + white * 0.28;
    out[i] = prev * amp * env;
  }
  return out;
}

function concat(parts) {
  return parts.reduce((acc, p) => acc.concat(p), []);
}

writeWav("ui_tap.wav", chirp(880, 1380, 90, 0.22));
writeWav(
  "ui_success.wav",
  concat([tone(659, 70, 0.18), tone(784, 70, 0.2), tone(988, 120, 0.22)]),
);
writeWav("ui_wrong.wav", chirp(420, 260, 170, 0.13));
writeWav(
  "ui_coin.wav",
  concat([tone(1319, 55, 0.2), tone(1568, 90, 0.22)]),
);
writeWav(
  "ui_achievement.wav",
  concat([
    tone(523, 90, 0.16),
    tone(659, 90, 0.18),
    tone(784, 110, 0.2),
    tone(1047, 180, 0.22),
  ]),
);
writeWav(
  "ui_gameWin.wav",
  concat([
    tone(523, 110, 0.18),
    tone(659, 110, 0.2),
    tone(784, 120, 0.22),
    tone(1047, 160, 0.24),
    silence(40),
    tone(784, 90, 0.18),
    tone(1319, 280, 0.22),
  ]),
);
writeWav("ui_cardOpen.wav", chirp(360, 920, 140, 0.17));
writeWav(
  "ui_goodDeed.wav",
  concat([tone(392, 100, 0.16), tone(523, 110, 0.18), tone(659, 200, 0.2)]),
);
writeWav(
  "ui_wudu.wav",
  concat([
    softNoise(90, 0.06),
    drip(1180, 70, 0.14),
    silence(30),
    drip(1480, 80, 0.12),
  ]),
);

console.log("Wrote UI sounds to", OUT);
