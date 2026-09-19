# Sprite symbols

Source: `source/raw/svgsprite.svg` (local asset `/assets/images/img-687f48138f.svg`). Each `<symbol>` exported verbatim as a standalone SVG (symbol `viewBox` + `fill` attrs moved to the root `<svg>`). Markup references them as `<use xlink:href="/assets/images/img-687f48138f.svg#<id>">`; sizing/colour comes from CSS on the host `<svg>`.

| file | id | viewBox | own paint | used by (captured routes) | host CSS |
|---|---|---|---|---|---|
| `arrow.svg` | arrow | 0 0 20 20 | none (inherits `fill`) | every `.btn--regular .btn__icon` (Enter, View our work, contact toggles, projects email CTA, 404 buttons, world "View more") | `.btn__icon { fill: var(--text); height: 0.67rem; width: 0.57rem; margin-left: 0.55rem }`, cloned copy `fill: var(--hoverText)` |
| `close.svg` | close | 0 0 14 14 | `fill="none"` root, path `fill="#fff"` | `.menu-btn__inner-icon` | `height/width: 17.98px; transform: rotate(-50deg) scale(0.00001)` until menu opens |
| `globe.svg` | globe | 0 0 27 18 | `fill="none"`, strokes inherit; has its own `<defs><clipPath id="clip0">` | `.menu__world svg`, `.world-btn__icon`, `.world-btn__inner-icon` | menu: `stroke: #212121; height: 1.75rem; width: 3.09rem; margin-left: 0.5rem` (active `#d6d6d6`); world-btn: `stroke: #212121` / inner `#fff`, `1.48rem` square |
| `drag-globe.svg` | drag-globe | 0 0 69 45 | `fill="none"` root, path `fill="#fff"` (white on the dark world scene) | `.world-intro svg` ("Drag to explore our world") | `display: block; height: 2.6rem; width: 4rem; margin: 0 auto` |
| `chevron-down.svg` | chevron-down | 0 0 10 6 | path `fill="#212121"` | `.project-filters__filter__chevron` (mobile Filter toggle) | `height: 0.375rem; width: 0.625rem; margin-left: 0.5625rem`; rotates 180 when open |
| `arrow-down.svg` | arrow-down | 0 0 12 12 | none | not used on captured routes | |
| `drag-arrows.svg` | drag-arrows | 0 0 46 10 | `fill="none"`, paths `#000` | not referenced via `<use>` (cursor drag arrows are inlined with the same geometry) | `.cursor__drag__arrows` 50% x 50% centered |
| `menu.svg` | menu | 0 0 14 5 | two circles `#212121` | not referenced via `<use>` (header menu dots are inlined, same geometry, circles get `js-menu-icon-circle`) | `.menu-btn__icon { height: 0.6rem; width: 0.8rem }` |
| `sound.svg` | sound | 0 0 18 16 | stroke `#212121`, width 2 | not referenced via `<use>` (mute button inlines 5 `line`s instead) | `.mute-btn__icon` 0.98rem square |
| `logo.svg` | logo | 0 0 1263.3 159.6 | none (inherits `fill`) | not referenced via `<use>` (header inlines the same wordmark) | `.header__logo svg { height: 1.7rem; width: 13.2rem; fill: #212121 }` |

**`logo.svg` is the origin's wordmark artwork.** Do not ship it: replace with the Nocturne wordmark at the same viewBox proportions (1263.3 x 159.6, about 7.92:1). The header markup in `markup/shell.html` already carries a text placeholder.
