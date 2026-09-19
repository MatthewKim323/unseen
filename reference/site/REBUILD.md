# REBUILD: site

> Captured 2026-09-19T04:45:07.634Z by 1to1. Everything in this folder is measured from a live page. Build from it; never eyeball a number.

## Origin blackout (not optional)

Nothing you write may say where this came from. The source url lives in `reference/site/.origin.json` and nowhere else: it is there so the rigs can re-measure, not for you to read out. These are your own components and your own assets.

- Never put the origin's name, host, brand, logo filename or a link to it in a component, file name, class name, comment, commit message, alt text or doc. Do not write "cloned from", "based on", "like <site>", or the origin's name in any form.
- The spec trees, the modules and the harvested assets in this folder are already scrubbed: the origin's words read as `Nocturne` and its links are route-relative. Copy text verbatim from `spec/` and you stay clean; copy it from a browser tab and you do not.
- Assets are content addressed (`img-<hash>.webp`, `font-<hash>.woff2`). Keep those names when you copy them into `public/`. A logo or wordmark asset still carries the origin visually: flag it for replacement rather than shipping it.
- `1to1 blackout .` scans the project for anything that slipped through; `1to1 verify` runs it as part of the gate and FAILs on a hit.

## Ground truth in this folder

- `spec/page.txt`: DOM tree (framer names, appear ids, classes, layout inline styles, text) + every CSS rule for those classes per breakpoint (`@base` = desktop >= 1200, `(min-width:810px) and (max-width:1199.98px)` = tablet, `(max-width:809.98px)` = phone). `spec/sections/NN-*.txt` = the same sliced per section.
- `capture/<vp>/layout.json`: every visible element with its page rect and computed styles at 1440 / 1024 / 810 / 390. This is the box truth; `1to1 refboxes` reads it.
- `capture/<vp>/full.png` + `capture/<vp>/sections/`: revealed screenshots (2x). `capture/frames/<scenario>/`: 60fps frame sequences (load, per-section scroll, hovers, clicks, loops) with motion timelines.
- `motion/framer-appear.json` (+ `appear-by-name.json`): on-mount appear springs per element. `motion/rip.md` + `constants.json`: transition constants and scroll / text / ticker / drag effect windows from the page modules. `motion/observed.md`: what the browser reported.
- `modules/*.mjs`: the source page's modules, scrubbed. The biggest one is the page. `assets/`, `assets/svg/`: every image / font / sprite def.
- `dom/full.html`, `dom/styles.css`, `dom/tree.txt`: raw material for `1to1 cssq` and grep.

Stack: unknown. 1 canvas element(s): WebGL / 2D drawing to port (find the module that draws it).

## Page heights (must match to the pixel)

| viewport | width | doc height | sections |
|---|---|---|---|
| desktop | 1440 | undefined | 3 |
| tablet | 1024 | 900 | 3 |
| tablet-810 | 810 | 900 | 3 |
| mobile | 390 | 844 | 3 |

### sections @ tablet

| # | name | y | h | spec | crop |
|---|---|---|---|---|---|
| 0 | div | 251 | 398 | spec/sections/00-div.txt | capture/tablet/sections/00-div.png |
| 1 | div | 399 | 101 | spec/sections/01-div.txt | capture/tablet/sections/01-div.png |
| 2 | div | 399 | 101 | spec/sections/02-div.txt | capture/tablet/sections/02-div.png |

### sections @ tablet-810

| # | name | y | h | spec | crop |
|---|---|---|---|---|---|
| 0 | div | 251 | 398 | spec/sections/00-div.txt | capture/tablet-810/sections/00-div.png |
| 1 | div | 399 | 101 | spec/sections/01-div.txt | capture/tablet-810/sections/01-div.png |
| 2 | div | 399 | 101 | spec/sections/02-div.txt | capture/tablet-810/sections/02-div.png |

### sections @ mobile

| # | name | y | h | spec | crop |
|---|---|---|---|---|---|
| 0 | div | 223 | 398 | spec/sections/00-div.txt | capture/mobile/sections/00-div.png |
| 1 | div | 371 | 101 | spec/sections/01-div.txt | capture/mobile/sections/01-div.png |
| 2 | div | 371 | 101 | spec/sections/02-div.txt | capture/mobile/sections/02-div.png |

### sections @ desktop

| # | name | y | h | spec | crop |
|---|---|---|---|---|---|
| 0 | div | 267 | 366 | spec/sections/00-div.txt | capture/desktop/sections/00-div.png |
| 1 | div | 398 | 104 | spec/sections/01-div.txt | capture/desktop/sections/01-div.png |
| 2 | div | 398 | 104 | spec/sections/02-div.txt | capture/desktop/sections/02-div.png |

Frame scenarios (2): load, scroll-div. Details in `capture/README.md`.

## The loop

```bash
# build one section, then compare
1to1 shot "http://localhost:3777/?only=<section>" reference/site/build/<section>.png --w 1440
1to1 heights http://localhost:3777/ "$(1to1 origin reference/site --url)"          # page + section heights at all 4 widths
1to1 boxes http://localhost:3777/ 1440 <yFrom> <yTo>                       # your boxes
1to1 refboxes reference/site desktop <yFrom> <yTo>                                # reference boxes (same columns)
1to1 diff reference/site/build/desktop-full.png reference/site/capture/desktop/full.png reference/site/build/diff --ref reference/site
1to1 frames http://localhost:3777/ reference/site/build/frames/load --ms 6000 --start-before-nav && 1to1 sheet reference/site/build/frames/load reference/site/build/load-sheet.png
1to1 sheet reference/site/capture/frames/load reference/site/build/ref-load-sheet.png    # same time steps, compare side by side
1to1 verify http://localhost:3777/ reference/site --diff                          # the gate: PASS at every width or keep going
1to1 blackout .                                                            # no mention of the origin anywhere in the project
```

Rules for builders are in `CONVENTIONS.md` (project root `reference/`), method in the 1to1 skill docs (`docs/METHOD.md`, `docs/FRAMER.md`, `docs/VERIFY.md`).
