// Upbeat synthesized music bed for the shorts: 128 BPM, A minor (Am F C G), drums + pumping bass + stabs.
// node scripts/music.mjs <seconds> <out.wav>
import { writeFileSync } from "node:fs";

const DUR = Number(process.argv[2] ?? 20);
const OUT = process.argv[3] ?? "assets/audio/music.wav";
const SR = 44100, BPM = 128, beat = 60 / BPM, bar = beat * 4;
const N = Math.floor(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

const add = (t0, len, fn, pan = 0.5) => {
  for (let s = Math.max(0, Math.floor(t0 * SR)); s < Math.min(N, Math.floor((t0 + len) * SR)); s++) {
    const v = fn(s / SR - t0);
    L[s] += v * (1 - pan) * 2;
    R[s] += v * pan * 2;
  }
};

// sidechain: everything but the kick ducks after each beat
const duck = (t) => 0.35 + 0.65 * Math.min(1, ((t % beat) / beat) * 2.2);

const beats = Math.ceil(DUR / beat);
for (let b = 0; b < beats; b++) {
  const t = b * beat;
  // kick
  add(t, 0.35, (x) => {
    const f = 45 + 95 * Math.exp(-x * 28);
    return 0.42 * Math.sin(2 * Math.PI * f * x) * Math.exp(-x * 7);
  });
  // clap on 2 and 4
  if (b % 2 === 1) {
    let lp = 0;
    add(t, 0.22, (x) => {
      const n = rnd();
      lp += 0.35 * (n - lp);
      return 0.16 * (n - lp) * Math.exp(-x * 18) * (x < 0.012 || x > 0.02 ? 1 : 0.4);
    });
  }
  // hats: closed on every eighth, the off-beat one louder
  for (const [off, g] of [[0, 0.025], [beat / 2, 0.05]]) {
    let prev = 0;
    add(t + off, 0.06, (x) => {
      const n = rnd(), hp = n - prev;
      prev = n;
      return g * hp * Math.exp(-x * 60) * duck(t + off + x);
    }, 0.62);
  }
}

// bass: eighth notes on the chord root, pumping with the kick
const chords = [[45, 57, 60, 64], [41, 53, 57, 60], [48, 55, 60, 64], [43, 55, 59, 62]];
for (let c = 0; c * bar < DUR; c++) {
  const ch = chords[c % 4];
  for (let e = 0; e < 8; e++) {
    const t = c * bar + e * (beat / 2), f = hz(ch[0] - 12 + (e === 7 ? 12 : 0));
    add(t, beat / 2, (x) => {
      const env = Math.min(1, x / 0.005) * Math.exp(-x * 5);
      let v = 0;
      for (let k = 1; k <= 6; k++) v += Math.sin(2 * Math.PI * f * k * x) / k;
      return 0.075 * v * env * duck(t + x);
    });
  }
  // chord stabs on the off-beats
  for (const e of [1, 3, 5, 6]) {
    const t = c * bar + e * (beat / 2);
    for (const [i, m] of ch.slice(1).entries()) {
      const f = hz(m + 12);
      add(t, 0.22, (x) => {
        const env = Math.min(1, x / 0.004) * Math.exp(-x * 14);
        return 0.028 * env * (Math.sin(2 * Math.PI * f * x) + 0.4 * Math.sin(4 * Math.PI * f * x + 0.5)) * duck(t + x);
      }, 0.3 + 0.2 * i);
    }
  }
}

// gentle fade in / out
for (let s = 0; s < N; s++) {
  const t = s / SR, g = Math.min(1, t / 0.05) * Math.min(1, (DUR - t) / 0.8);
  L[s] *= g;
  R[s] *= g;
}

let peak = 0;
for (let s = 0; s < N; s++) peak = Math.max(peak, Math.abs(L[s]), Math.abs(R[s]));
const norm = 0.89 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVEfmt ", 8);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let s = 0; s < N; s++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[s] * norm)) * 32767), 44 + s * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[s] * norm)) * 32767), 46 + s * 4);
}
writeFileSync(OUT, buf);
console.log(`${OUT}: ${DUR}s, ${BPM} BPM`);
