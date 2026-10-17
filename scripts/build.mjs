// Writes one of the three shorts into index.html (the project's one root composition):
//   node scripts/build.mjs clutch|arsenal|laptop
// Footage: game-3d/marketing/raw/<take>-film.mp4 (+ .json kill times), filmed frame by frame at 60 fps.
// Every cut, slam and kill lands on the 128 BPM grid of assets/audio/music.wav.
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const SHORT = process.argv[2] ?? "clutch";
const BEAT = 60 / 128;
const b = (n) => +(n * BEAT).toFixed(4);
const RAW = "../game-3d/marketing/raw";
for (const d of ["assets/footage", "assets/stills"]) mkdirSync(d, { recursive: true });
const takes = {};
for (const t of ["plaza", "reactor", "skyline"]) {
  if (!existsSync(`${RAW}/${t}-film.json`)) continue; // not filmed yet
  if (!existsSync(`assets/footage/${t}.mp4`)) copyFileSync(`${RAW}/${t}-film.mp4`, `assets/footage/${t}.mp4`);
  takes[t] = JSON.parse(readFileSync(`${RAW}/${t}-film.json`, "utf8"));
  // where the autopilot teleported to its next target: a hard jump in the footage
  const cutsFile = `assets/footage/${t}.cuts.json`;
  if (!existsSync(cutsFile)) {
    const { stderr } = spawnSync("ffmpeg", ["-hide_banner", "-i", `assets/footage/${t}.mp4`, "-vf", "select='gt(scene,0.3)',showinfo", "-an", "-f", "null", "-"], { encoding: "utf8" });
    writeFileSync(cutsFile, JSON.stringify([...stderr.matchAll(/pts_time:([\d.]+)/g)].map((m) => +(+m[1]).toFixed(3))));
  }
  takes[t].cuts = JSON.parse(readFileSync(cutsFile, "utf8"));
}
const still = (take, at, name) => {
  const out = `assets/stills/${name}.jpg`;
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(at), "-i", `assets/footage/${take}.mp4`, "-frames:v", "1", "-q:v", "2", out]);
  return out;
};

// ---------- shared pieces ----------

const css = `
@font-face { font-family: "Lilita One"; src: url("assets/fonts/LilitaOne-Regular.ttf") format("truetype"); }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1080px; height: 1920px; overflow: hidden; background: #1b1e2b; }
#root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: "Lilita One", sans-serif; }
#cam { position: absolute; inset: 0; overflow: hidden; transform-origin: 50% 46%; }
#cam video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.full { position: absolute; inset: 0; }
#flash { background: #fffaf0; opacity: 0; pointer-events: none; }
.ink { color: #fffaf0; -webkit-text-stroke: 18px #1b1e2b; paint-order: stroke fill; text-shadow: 0 12px 0 #1b1e2b; }
.ink.y { color: #ffd23f; }
.mono { font-family: "Space Mono", monospace; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
.hook { position: absolute; left: 90px; width: 860px; line-height: 0.95; }
.hook div { display: block; transform-origin: 0% 100%; white-space: nowrap; }
#xhair { position: absolute; left: 540px; top: 883px; width: 0; height: 0; }
#xhair i { position: absolute; background: #fffaf0; outline: 3px solid #1b1e2b; }
#xhair .h { width: 22px; height: 5px; top: -2.5px; } #xhair .h.l { left: -36px; } #xhair .h.r { left: 14px; }
#xhair .v { width: 5px; height: 22px; left: -2.5px; } #xhair .v.t { top: -36px; } #xhair .v.b { top: 14px; }
.hitmark { position: absolute; left: 540px; top: 883px; width: 0; height: 0; opacity: 0; }
.hitmark i { position: absolute; width: 30px; height: 7px; left: -15px; top: -3.5px; background: #ffd23f; outline: 3px solid #1b1e2b; }
.sticker { position: absolute; left: 0; right: 0; text-align: center; font-size: 150px; }
.sticker div { display: inline-block; }
/* end card */
#end .bg { position: absolute; inset: -60px; background-size: cover; background-position: center; filter: blur(14px) saturate(1.15); }
#end .shade { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 42%, rgba(27,30,43,0.25), rgba(27,30,43,0.78) 75%); }
#end .ghost { position: absolute; left: -200px; width: 1600px; font-size: 230px; color: #ffd23f; opacity: 0.16; white-space: nowrap; transform: rotate(-8deg); }
#end .logo { position: absolute; left: 0; right: 0; top: 540px; text-align: center; font-size: 182px; }
#end .logo div { display: inline-block; }
#end .line1 { position: absolute; left: 0; right: 0; top: 820px; text-align: center; font-size: 132px; }
#end .line2 { position: absolute; left: 0; right: 0; top: 972px; text-align: center; font-size: 74px; }
#end .url { position: absolute; left: 190px; width: 700px; top: 1130px; height: 150px; border-radius: 75px; background: #ffd23f;
  border: 9px solid #1b1e2b; box-shadow: 0 12px 0 #1b1e2b; display: flex; align-items: center; justify-content: center; }
#end .url span { font-size: 88px; color: #1b1e2b; }
`;

const crosshair = (start, dur) => `
  <div id="xhair" class="clip" data-start="${start}" data-duration="${dur}" data-track-index="5"><i class="h l"></i><i class="h r"></i><i class="v t"></i><i class="v b"></i></div>`;

function endCard(start, dur, bg) {
  return `
  <section id="end" class="clip full" data-start="${start}" data-duration="${dur}" data-track-index="8">
    <div class="bg" style="background-image:url('${bg}')"></div>
    <div class="shade"></div>
    <div class="ghost" style="top:250px" data-layout-allow-occlusion data-layout-allow-overflow>CLUTCHZONE</div>
    <div class="ghost" style="top:1420px;left:-480px" data-layout-allow-occlusion data-layout-allow-overflow>CLUTCHZONE</div>
    <div class="logo"><div class="ink y" id="end-logo">CLUTCHZONE</div></div>
    <div class="line1"><div class="ink" id="end-l1">PLAY FREE</div></div>
    <div class="line2"><div class="ink" id="end-l2">IN YOUR BROWSER</div></div>
    <div class="url" id="end-url"><span>clutchzone.pro</span></div>
  </section>`;
}

function endMotion(s) {
  return `
  tl.fromTo("#end .ghost", { x: 0 }, { x: -260, duration: ${b(6)}, ease: "none" }, ${s});
  tl.fromTo("#end-logo", { scale: 0.2, rotation: -14, opacity: 0 }, { scale: 1, rotation: -4, opacity: 1, duration: 0.55, ease: "back.out(2.2)" }, ${s});
  tl.fromTo("#end-l1", { x: -700, opacity: 0 }, { x: 0, opacity: 1, duration: 0.42, ease: "expo.out" }, ${s + b(1)});
  tl.fromTo("#end-l2", { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "circ.out" }, ${s + b(1.5)});
  tl.fromTo("#end-url", { scale: 0, rotation: 6 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2)" }, ${s + b(2)});
  tl.fromTo("#end-url", { scale: 1 }, { scale: 1.06, duration: ${b(1)}, ease: "sine.inOut", yoyo: true, repeat: 2, immediateRender: false }, ${s + b(3.4)});`;
}

/** One kill's hit: punch-in on the footage, a white flash, the hit marker, a bass impact. */
function hit(t, i) {
  return {
    js: `
  tl.fromTo("#cam", { scale: 1.075 }, { scale: 1, duration: 0.4, ease: "power3.out", immediateRender: false }, ${t});
  tl.fromTo("#flash", { opacity: 0.42 }, { opacity: 0, duration: 0.14, ease: "none", immediateRender: false }, ${t});
  tl.fromTo("#hm", { opacity: 1, scale: 1.4 }, { opacity: 0, scale: 1, duration: 0.3, ease: "power2.in", immediateRender: false }, ${t});`,
    audio: `
  <audio id="sfx-hit-${i}" src="assets/sfx/impact-bass-${(i % 2) + 1}.mp3" data-start="${t}" data-duration="1.2" data-track-index="${20 + i}" data-volume="0.38"></audio>`,
  };
}

/** Video segments, back to back: each a source range [from, to) of a take; every kill inside one is a hit. */
function shots(segs) {
  let at = 0, html = "";
  const hits = [];
  segs.forEach((s, i) => {
    const len = +(s.to - s.from).toFixed(4);
    html += `
    <video id="v${i}" src="assets/footage/${s.take}.mp4" data-start="${at}" data-duration="${len}" data-media-start="${s.from}" data-track-index="0" playsinline data-has-audio="true" data-volume="0.9"></video>`;
    takes[s.take].kills.forEach((k, j) => {
      if (k >= s.from && k < s.to) hits.push({ t: +(at + k - s.from).toFixed(4), weapon: takes[s.take].weapons?.[j] });
    });
    at = +(at + len).toFixed(4);
  });
  return { html, hits, end: at };
}

/** endAt: where the end card starts — the game's sound stops there, so the music comes up. */
function page(id, dur, body, js, audio, endAt) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>${css}</style>
  </head>
  <body>
    <div id="root" data-composition-id="${id}" data-start="0" data-duration="${dur}" data-width="1080" data-height="1920" data-fps="60">
${body}
      <div id="flash" class="full"></div>
      <div id="hm" class="hitmark"><i style="transform:rotate(45deg) translateX(-26px)"></i><i style="transform:rotate(45deg) translateX(26px)"></i><i style="transform:rotate(-45deg) translateX(-26px)"></i><i style="transform:rotate(-45deg) translateX(26px)"></i></div>
      <audio id="music" src="assets/audio/music.wav" data-start="0" data-duration="${dur}" data-track-index="10"
        data-automation='{"version":1,"lanes":[{"target":"volume","points":[{"t":0,"v":0.5},{"t":${endAt},"v":0.5},{"t":${(endAt + 0.3).toFixed(3)},"v":0.85},{"t":${(dur - 0.9).toFixed(3)},"v":0.85},{"t":${dur},"v":0}]}]}'></audio>
${audio}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
${js}
      window.__timelines["${id}"] = tl;
    </script>
  </body>
</html>
`;
}

// ---------- 1. CLUTCH: 1 vs 5 ----------
if (SHORT === "clutch") {
  const segs = [
    { take: "plaza", from: 0, to: 5.15 }, // a spree: four kills in five seconds
    { take: "plaza", from: 22.05, to: 23.5 },
  ];
  const v = shots(segs);
  const freeze = v.end, endAt = +(freeze + b(4)).toFixed(4), dur = +(endAt + b(6)).toFixed(4);
  const last = segs.at(-1), freezeImg = still(last.take, last.to - 0.03, "clutch-freeze");
  const endBg = still("plaza", 0.25, "end-bg");
  const pips = [0, 1, 2, 3, 4].map((i) => `<i id="pip${i}"></i>`).join("");
  let js = `
  tl.fromTo("#h1", { scale: 1.6, filter: "blur(18px)", opacity: 0 }, { scale: 1, filter: "blur(0px)", opacity: 1, duration: 0.45, ease: "power4.out" }, 0);
  tl.fromTo("#h2", { x: -900, opacity: 0 }, { x: 0, opacity: 1, duration: 0.42, ease: "expo.out" }, ${b(1.5)});
  tl.fromTo("#hook", { y: 0, scale: 1 }, { y: -460, scale: 0.6, opacity: 0, duration: 0.4, ease: "power3.in", immediateRender: false }, ${b(5.4)});
  tl.fromTo("#count-in", { y: -180 }, { y: 0, duration: 0.45, ease: "back.out(2)" }, 0.1);
  tl.fromTo("#ffz", { scale: 1.02 }, { scale: 1.16, duration: ${b(4)}, ease: "power1.out" }, ${freeze});
  tl.fromTo("#clutch-word", { scale: 3.2, rotation: 12, opacity: 0 }, { scale: 1, rotation: -6, opacity: 1, duration: 0.42, ease: "power4.out" }, ${freeze + 0.05});
  tl.fromTo("#clutch-sub", { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "circ.out" }, ${freeze + b(1)});
  tl.fromTo("#flash", { opacity: 0.8 }, { opacity: 0, duration: 0.25, ease: "none", immediateRender: false }, ${freeze});`;
  let audio = `
      <audio id="sfx-hook" src="assets/sfx/whoosh-short.mp3" data-start="0" data-duration="0.57" data-track-index="30" data-volume="0.6"></audio>
      <audio id="sfx-riser" src="assets/sfx/riser.mp3" data-start="${(freeze - 1.4).toFixed(3)}" data-duration="1.4" data-track-index="31" data-volume="0.35"></audio>
      <audio id="sfx-clutch" src="assets/sfx/impact-bass-1.mp3" data-start="${freeze}" data-duration="1.5" data-track-index="32" data-volume="0.8"></audio>
      <audio id="sfx-end" src="assets/sfx/whoosh.mp3" data-start="${endAt}" data-duration="0.57" data-track-index="33" data-volume="0.55"></audio>`;
  v.hits.forEach(({ t }, i) => {
    const h = hit(t, i);
    js += h.js + `
  tl.fromTo("#pip${i}", { scale: 1, opacity: 1 }, { scale: 0.4, opacity: 0.22, duration: 0.25, ease: "back.in(2)", immediateRender: false }, ${t});
  tl.fromTo("#kc${i}", { scale: 0, rotation: -10 }, { scale: 1, rotation: -4, duration: 0.32, ease: "back.out(2.4)" }, ${t});
  tl.to("#kc${i}", { opacity: 0, y: -40, duration: 0.25, ease: "power2.in" }, ${Math.min(t + b(2.3), freeze - 0.25).toFixed(3)});`;
    audio += h.audio;
  });
  js += endMotion(endAt);
  // confetti: index-seeded ballistic pieces, baked here so the page stays deterministic
  const prand = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  let confetti = "";
  for (let i = 0; i < 34; i++) {
    const ang = -Math.PI / 2 + (prand(i) - 0.5) * 2.4, sp = 900 + prand(i * 7 + 3) * 900;
    const vx = Math.cos(ang) * sp, vy = Math.sin(ang) * sp, T = 1.6, G = 2600;
    const color = ["#ffd23f", "#ff8a2e", "#3d8bff", "#fffaf0"][i % 4];
    confetti += `<i class="cf" id="cf${i}" style="background:${color};width:${18 + prand(i * 5) * 16}px;height:${10 + prand(i * 11) * 10}px"></i>`;
    js += `
  tl.fromTo("#cf${i}", { x: 0, y: 0, rotation: 0, opacity: 1 }, { x: ${vx * T * 0.55 | 0}, rotation: ${(prand(i * 13) - 0.5) * 1440 | 0}, duration: ${T}, ease: "none" }, ${freeze + 0.05});
  tl.fromTo("#cf${i}", { y: 0 }, { y: ${(vy * T + 0.5 * G * T * T) * 0.55 | 0}, duration: ${T}, ease: "power1.in", immediateRender: false }, ${freeze + 0.05});`;
  }
  const body = `
      <div id="cam">${v.html}
      </div>
      <img id="ffz" class="clip full" src="${freezeImg}" data-start="${freeze}" data-duration="${b(4)}" data-track-index="1" style="width:100%;height:100%;object-fit:cover" />
${crosshair(0, freeze)}
      <div id="hook" class="hook clip" data-start="0" data-duration="${b(6)}" data-track-index="6" style="top:360px">
        <div id="h1" class="ink y" style="font-size:230px">1 VS 5</div>
        <div id="h2" class="ink" style="font-size:96px;margin-top:14px">CAN I CLUTCH IT?</div>
      </div>
      <div id="count" class="clip" data-start="0" data-duration="${freeze}" data-track-index="7" style="position:absolute;left:220px;top:190px;width:640px;height:130px">
        <div id="count-in" style="width:100%;height:100%;border-radius:65px;background:#1b1e2b;display:flex;align-items:center;justify-content:center;gap:18px">
          <span class="mono" style="color:#fffaf0;font-size:36px;margin-right:4px">ENEMIES</span>
          <span class="pips" style="display:flex;gap:14px">${pips}</span>
        </div>
      </div>
      ${v.hits.map(({ t }, i) => `<div id="kc${i}" class="sticker ink y clip" data-start="${t}" data-duration="${Math.min(b(2.6), freeze - t).toFixed(3)}" data-track-index="7" style="top:1120px;font-size:180px">${i + 1}/5</div>`).join("\n      ")}
      <div id="clutch" class="clip full" data-start="${freeze}" data-duration="${b(4)}" data-track-index="7">
        <div style="position:absolute;left:540px;top:700px;width:0;height:0">${confetti}</div>
        <div class="sticker" style="top:610px"><div id="clutch-word" class="ink y" style="font-size:250px">CLUTCH!</div></div>
        <div class="sticker" style="top:900px"><div id="clutch-sub" class="ink" style="font-size:100px">1 VS 5. EZ.</div></div>
      </div>
${endCard(endAt, b(6), endBg)}`;
  const html = page("clutch", dur, body, js, audio, endAt).replace(
    "</style>",
    `#count .pips i { display:block; width:48px; height:48px; border-radius:50%; background:#ff8a2e; border:6px solid #fffaf0; }
.cf { position:absolute; left:0; top:0; border-radius:3px; }
</style>`,
  );
  writeFileSync("index.html", html);
  console.log(`clutch.html: ${dur}s, kills at ${v.hits.map((h) => h.t).join(", ")}`);
}

/** The kill `k` (seconds in the take) with `pre` seconds before it and `post` after; no other kill inside. */
function around(take, k, pre = 1.4, post = 0.6, min = 1.5) {
  const { cuts } = takes[take];
  const jump = Math.max(-1, ...cuts.filter((c) => c <= k - 0.15)); // start at the teleport, not before it
  const from = Math.max(k - pre, jump + 0.02);
  // a short run-up gets a longer look at the kill instead, up to the next teleport
  const next = Math.min(Infinity, ...cuts.filter((c) => c > k + 0.15), ...takes[take].kills.filter((x) => x > k));
  const to = Math.min(k + Math.max(post, min - (k - from)), next - 0.03);
  const seg = { take, from: +from.toFixed(3), to: +to.toFixed(3) };
  if (seg.from < 0) throw new Error(`${take} ${k}: starts before the take`);
  const inside = takes[take].kills.filter((x) => x >= seg.from && x < seg.to);
  if (inside.length !== 1) throw new Error(`${take} ${k}: ${inside.length} kills in [${seg.from}, ${seg.to})`);
  return seg;
}
/** The kill with this weapon, in any take, that leaves the longest clean segment around it (up to 2 s). */
function killWith(weapon, avoid = []) {
  let best = null;
  for (const [take, { kills, weapons }] of Object.entries(takes)) {
    kills.forEach((k, j) => {
      if (weapons?.[j] !== weapon || avoid.some((a) => a.take === take && a.from <= k && k < a.to)) return;
      try {
        const seg = around(take, k);
        if (!best || Math.min(2, seg.to - seg.from) > Math.min(2, best.to - best.from)) best = seg;
      } catch { /* crowded */ }
    });
  }
  if (!best) throw new Error(`no clean kill with weapon ${weapon}`);
  return best;
}
const whooshes = (cuts, base) => cuts.map((t, i) => `
      <audio id="sfx-cut-${i}" src="assets/sfx/whoosh-short.mp3" data-start="${Math.max(0, t - 0.12).toFixed(3)}" data-duration="0.57" data-track-index="${base + i}" data-volume="0.4"></audio>`).join("");

// ---------- 2. ARSENAL: 6 weapons, 1 browser tab ----------
if (SHORT === "arsenal") {
  const WEAPONS = [
    ["AR-7", "ASSAULT RIFLE", killWith(0)],
    ["P-9", "PISTOL", around("plaza", 23.0)],
    ["WASP", "SMG", killWith(3)],
    ["BREACHER", "SHOTGUN", killWith(4)],
    ["LONGBOW", "SNIPER", killWith(2)],
    ["BLADE", "KNIFE", killWith(5)],
  ];
  const v = shots(WEAPONS.map((w) => w[2]));
  const endAt = v.end, dur = +(endAt + b(6)).toFixed(4);
  const endBg = still("reactor", 1.0, "end-bg-arsenal");
  const starts = [];
  let at = 0;
  for (const w of WEAPONS) { starts.push(+at.toFixed(4)); at += w[2].to - w[2].from; }
  let js = `
  tl.fromTo("#h1", { scale: 1.6, filter: "blur(18px)", opacity: 0 }, { scale: 1, filter: "blur(0px)", opacity: 1, duration: 0.45, ease: "power4.out" }, 0);
  tl.fromTo("#h2", { x: -900, opacity: 0 }, { x: 0, opacity: 1, duration: 0.42, ease: "expo.out" }, ${b(1.5)});
  tl.fromTo("#hook", { y: 0, scale: 1 }, { y: -460, scale: 0.6, opacity: 0, duration: 0.4, ease: "power3.in", immediateRender: false }, ${(starts[1] - 0.42).toFixed(3)});`;
  let audio = `
      <audio id="sfx-hook" src="assets/sfx/whoosh-short.mp3" data-start="0" data-duration="0.57" data-track-index="30" data-volume="0.6"></audio>
      <audio id="sfx-end" src="assets/sfx/whoosh.mp3" data-start="${endAt}" data-duration="0.57" data-track-index="31" data-volume="0.55"></audio>${whooshes(starts.slice(1), 40)}`;
  v.hits.forEach(({ t }, i) => {
    const h = hit(t, i);
    js += h.js;
    audio += h.audio;
  });
  let cards = "";
  WEAPONS.forEach(([name, cls, seg], i) => {
    const s = starts[i], len = +(seg.to - seg.from).toFixed(4);
    cards += `
      <div id="wc${i}" class="clip wcard" data-start="${s}" data-duration="${len}" data-track-index="7">
        <div id="wc${i}-in" class="wcard-in">
          <div class="mono num">0${i + 1} / 06</div>
          <div class="ink name">${name}</div>
          <div class="mono cls">${cls}</div>
        </div>
      </div>`;
    js += `
  tl.fromTo("#wc${i}-in", { x: -760, rotation: -2 }, { x: 0, rotation: -3, duration: 0.42, ease: "expo.out" }, ${(s + 0.04).toFixed(3)});
  tl.fromTo("#wc${i}-in .name", { scale: 1.25 }, { scale: 1, duration: 0.35, ease: "back.out(2)" }, ${(s + 0.12).toFixed(3)});`;
  });
  js += endMotion(endAt);
  const body = `
      <div id="cam">${v.html}
      </div>
${crosshair(0, endAt)}
      <div id="hook" class="hook clip" data-start="0" data-duration="${starts[1]}" data-track-index="6" style="top:330px">
        <div id="h1" class="ink y" style="font-size:150px">6 WEAPONS.</div>
        <div id="h2" class="ink" style="font-size:112px;margin-top:14px">1 BROWSER TAB.</div>
      </div>${cards}
${endCard(endAt, b(6), endBg)}`;
  const html = page("arsenal", dur, body, js, audio, endAt).replace("</style>", `.wcard { position:absolute; left:70px; top:1160px; width:880px; height:330px; }
.wcard-in { position:absolute; left:0; top:0; transform-origin: 0% 100%; }
.wcard .num { display:inline-block; background:#1b1e2b; color:#ffd23f; font-size:38px; padding:10px 22px; border-radius:14px; }
.wcard .name { font-size:170px; line-height:1; margin-top:6px; transform-origin: 0% 50%; }
.wcard .cls { display:inline-block; background:#ffd23f; color:#1b1e2b; font-size:36px; padding:8px 20px; border-radius:12px; border:5px solid #1b1e2b; margin-top:8px; }
</style>`);
  writeFileSync("index.html", html);
  console.log(`arsenal: ${dur}s, cuts at ${starts.join(", ")}, kills at ${v.hits.map((h) => h.t).join(", ")}`);
}

// ---------- 3. LAPTOP: too weak for big shooters? ----------
if (SHORT === "laptop") {
  const CHIPS = ["NO DOWNLOAD", "NO ACCOUNT", "FREE", "PLAY WITH FRIENDS"];
  const segs = [
    { take: "reactor", from: 14.6, to: 17.0 }, // under the hook: an SMG kill as the question lands
    killWith(0),
    killWith(2),
    around("plaza", 25.3),
    killWith(5),
  ];
  const v = shots(segs);
  const endAt = v.end, dur = +(endAt + b(6)).toFixed(4);
  const endBg = still("skyline", 2.0, "end-bg-laptop");
  const starts = [];
  let at = 0;
  for (const s of segs) { starts.push(+at.toFixed(4)); at += s.to - s.from; }
  const barIn = starts[1];
  let js = `
  tl.fromTo("#scrim", { opacity: 0.55 }, { opacity: 0, duration: 0.3, ease: "power1.out", immediateRender: false }, ${(barIn - 0.3).toFixed(3)});
  tl.fromTo("#h1", { scale: 1.6, filter: "blur(18px)", opacity: 0 }, { scale: 1, filter: "blur(0px)", opacity: 1, duration: 0.45, ease: "power4.out" }, 0);
  tl.fromTo("#h2", { y: 120, rotation: 6, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.5, ease: "circ.out" }, ${b(1.5)});
  tl.fromTo("#hook", { y: 0, scale: 1 }, { y: -460, scale: 0.6, opacity: 0, duration: 0.4, ease: "power3.in", immediateRender: false }, ${(barIn - 0.42).toFixed(3)});
  tl.fromTo("#tab-in", { y: -320 }, { y: 0, duration: 0.5, ease: "back.out(1.6)" }, ${barIn});
  tl.fromTo("#answer-in", { scale: 0, rotation: -8 }, { scale: 1, rotation: -3, duration: 0.45, ease: "back.out(2)" }, ${(barIn + 0.15).toFixed(3)});
  tl.to("#answer-in", { scale: 0.7, opacity: 0, duration: 0.3, ease: "power2.in" }, ${(starts[2] - 0.3).toFixed(3)});`;
  let audio = `
      <audio id="sfx-hook" src="assets/sfx/whoosh-short.mp3" data-start="0" data-duration="0.57" data-track-index="30" data-volume="0.6"></audio>
      <audio id="sfx-tab" src="assets/sfx/pop.mp3" data-start="${barIn}" data-duration="0.5" data-track-index="31" data-volume="0.6"></audio>
      <audio id="sfx-end" src="assets/sfx/whoosh.mp3" data-start="${endAt}" data-duration="0.57" data-track-index="32" data-volume="0.55"></audio>${whooshes(starts.slice(2), 40)}`;
  v.hits.forEach(({ t }, i) => {
    const h = hit(t, i);
    js += h.js;
    audio += h.audio;
  });
  let chips = "";
  CHIPS.forEach((c, i) => {
    const t = +(starts[Math.min(i + 1, starts.length - 1)] + (i === 0 ? 1.1 : 0.1) + (i === 3 ? 0.9 : 0)).toFixed(3);
    chips += `
        <div id="chip${i}" class="chip"><i></i><span class="ink">${c}</span></div>`;
    js += `
  tl.fromTo("#chip${i}", { scale: 0, x: -60 }, { scale: 1, x: 0, duration: 0.4, ease: "back.out(2.2)" }, ${t});`;
    audio += `
      <audio id="sfx-chip-${i}" src="assets/sfx/pop.mp3" data-start="${t}" data-duration="0.5" data-track-index="${50 + i}" data-volume="0.45"></audio>`;
  });
  js += endMotion(endAt);
  const body = `
      <div id="cam">${v.html}
      </div>
      <div id="scrim" class="full" style="background:#1b1e2b;opacity:0.55"></div>
${crosshair(barIn, endAt - barIn)}
      <div id="hook" class="hook clip" data-start="0" data-duration="${barIn}" data-track-index="6" style="top:420px">
        <div id="h1" class="ink" style="font-size:104px">LAPTOP TOO WEAK</div>
        <div id="h2" class="ink y" style="font-size:98px;margin-top:16px">FOR BIG SHOOTERS?</div>
      </div>
      <div id="tab" class="clip" data-start="${barIn}" data-duration="${(endAt - barIn).toFixed(4)}" data-track-index="7" style="position:absolute;left:60px;top:150px;width:960px;height:220px">
        <div id="tab-in" class="browser">
          <div class="tabs"><span class="t">Clutchzone</span></div>
          <div class="addr"><b></b><span>clutchzone.pro</span></div>
        </div>
      </div>
      <div id="answer" class="clip" data-start="${barIn}" data-duration="${(starts[2] - barIn).toFixed(4)}" data-track-index="8" style="position:absolute;left:0;right:0;top:1120px;text-align:center">
        <div id="answer-in" class="ink" style="display:inline-block;font-size:104px;line-height:1.05;width:900px">THIS ONE RUNS IN A BROWSER TAB</div>
      </div>
      <div id="chips" class="clip" data-start="${starts[1]}" data-duration="${(endAt - starts[1]).toFixed(4)}" data-track-index="9" style="position:absolute;left:70px;top:420px;width:820px;height:560px">${chips}
      </div>
${endCard(endAt, b(6), endBg)}`;
  const html = page("laptop", dur, body, js, audio, endAt).replace("</style>", `.browser { position:absolute; inset:0; background:#fffaf0; border:8px solid #1b1e2b; border-radius:34px; box-shadow:0 12px 0 #1b1e2b; overflow:hidden; }
.browser .tabs { height:86px; background:#ffd23f; border-bottom:6px solid #1b1e2b; padding:16px 0 0 26px; }
.browser .tabs .t { display:inline-block; height:70px; padding:14px 30px; background:#fffaf0; border:6px solid #1b1e2b; border-bottom:none; border-radius:20px 20px 0 0; font-size:38px; color:#1b1e2b; }
.browser .addr { margin:18px 26px; height:84px; border-radius:42px; background:#ece4d2; display:flex; align-items:center; gap:18px; padding-left:28px; }
.browser .addr b { width:30px; height:30px; border-radius:50%; background:#1b1e2b; }
.browser .addr span { font-family:"Space Mono", monospace; font-weight:700; font-size:44px; color:#1b1e2b; }
.chip { display:flex; align-items:center; gap:18px; margin-bottom:22px; transform-origin: 0% 50%; }
.chip i { display:block; width:72px; height:72px; border-radius:18px; background:#ffd23f; border:6px solid #1b1e2b; box-shadow:0 6px 0 #1b1e2b; position:relative; }
.chip i::after { content:""; position:absolute; left:20px; top:6px; width:16px; height:32px; border:solid #1b1e2b; border-width:0 9px 9px 0; transform:rotate(45deg); }
.chip span { font-size:76px; }
</style>`);
  writeFileSync("index.html", html);
  console.log(`laptop: ${dur}s, cuts at ${starts.join(", ")}, kills at ${v.hits.map((h) => h.t).join(", ")}`);
}
