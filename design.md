# Clutchzone shorts — design

Concept: the game's own loud, sunny cartoon UI stamped over smooth gameplay — sticker-like type that hits on
the beat, like a kill feed that learned to shout.

## Palette
- Ink (outlines, panels): `#1b1e2b`
- Text: `#fffaf0` (warm white)
- Accent (the one hue): game yellow `#ffd23f`
- Footage carries the rest (sunny town, orange/blue teams). Team orange `#ff8a2e` only for enemy pips.

## Type
- Display: Lilita One (the game's HUD/logo face), embedded from `assets/fonts`. Thick ink stroke
  (`-webkit-text-stroke` + `paint-order: stroke fill`) and a hard 10 px ink drop — sticker, not glow.
- Labels: Space Mono 700 (embedded family), uppercase, letter-spaced — weapon class, counters.
- Hooks 120–170 px; labels 30–40 px.

## Layout (9:16, platform-safe)
- Text inside x 80..960, y 200..1540 (TikTok/Shorts buttons on the right and the caption at the bottom).
- Hooks sit in the upper third over the sky; HUD chips top centre; the crosshair stays in the centre.

## Motion
- 128 BPM grid (beat 0.46875 s): cuts, slams and kill hits land on beats.
- Kill hit: 2-frame white flash, 1.0 → 1.07 punch-in on the footage, bass impact.
- Entrances: scale-blur slam (power4.out), side snap (expo.out), spring pop (back.out(2)).

## Don't
- No glows, gradients on text, neon, or dark "tech" looks — the game is bright and friendly.
- No real gun or Valve names.
