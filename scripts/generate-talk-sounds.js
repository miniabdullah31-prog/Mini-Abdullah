/** Tiny kid-friendly WAV pings for Talk with Abdullah. */
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
  const amp = gain == null ? 0.22 : gain;
  const n = Math.floor((RATE * ms) / 1000);
  const out = new Array(n);
  for (let i = 0; i < n; i += 1) {
    const p = i / n;
    const t = i / RATE;
    const attack = Math.min(1, (p * 115) / 100);
    const env = Math.sin(Math.PI * attack) * Math.exp(-2.4 * p);
    const harmonic = Math.sin(2 * Math.PI * freq * 2 * t) * 0.22;
    out[i] = (Math.sin(2 * Math.PI * freq * t) + harmonic) * amp * env;
  }
  return out;
}

function chirp(startF, endF, ms, gain) {
  const amp = gain == null ? 0.24 : gain;
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

function concat(parts) {
  return parts.reduce((acc, p) => acc.concat(p), []);
}

writeWav("talk_tap.wav", chirp(920, 1480, 110, 0.3));
writeWav(
  "talk_listen.wav",
  concat([tone(659, 70, 0.22), tone(880, 80, 0.24), tone(1175, 110, 0.26)]),
);
writeWav(
  "talk_think.wav",
  concat([tone(523, 80, 0.18), silence(50), tone(523, 90, 0.16)]),
);
writeWav(
  "talk_speak.wav",
  concat([chirp(587, 784, 90, 0.24), chirp(784, 1175, 150, 0.28)]),
);

console.log("Wrote talk sounds to", OUT);
