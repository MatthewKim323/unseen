# Nocturne tokens

Source of truth: `source/pretty/style.css` (theme CSS, 3465 lines) + the inline `<style>` at the top of `<body>` on every page (fonts + loader, "loader.css"). All numbers below are copied verbatim.

There are **no CSS custom properties** for colors, spacing or easing in the source. The only custom properties are the button color slots (`--text`, `--hoverText`, `--hoverFill`, `--border`, `--hoverBorder`, `--background`), set per `.btn--fill/.btn--border` x `.btn--light/.btn--dark` (see COMPONENTS.md > btn).

---

## 1. Root size (everything is rem)

```css
html { font-size: clamp(14px, 1vw, 38px); line-height: 1.5; box-sizing: border-box; }
```

1rem = `clamp(14px, 1vw, 38px)`: 14px below 1400px viewport width, then 1vw (14.4px at 1440, 19.2px at 1920), capped at 38px (3800px+). Every font-size / spacing / component size below is rem, so the whole site scales fluidly above 1400px.

| viewport | 1rem |
|---|---|
| 390 | 14px |
| 810 | 14px |
| 1024 | 14px |
| 1366 | 14px |
| 1440 | 14.4px |
| 1920 | 19.2px |

(`html` is also declared earlier by normalize with `line-height: 1.15`; the later `line-height: 1.5` wins.)

---

## 2. Breakpoints

All min-width, mobile-first. Suffix `@name` on utility classes.

| name | query | used by |
|---|---|---|
| xs | `(min-width: 414px)` | `w-*@xs`, `mb-*@xs`, `offset-*@xs` |
| sm | `(min-width: 768px)` | most responsive utilities, `.container` padding, `aspect--*@sm`, `.menu__footer`, `.project-filters*`, `.world-details*`, loader eyes (inline CSS) |
| md | `(min-width: 1024px)` | `w/d/mb/pl/pr/justify/offset @md`, `.t-6@md`, `.mute-btn--global`, `.footer__cta`, `.project-grid-cta` |
| lg | `(min-width: 1366px)` | `w/mb/offset/justify-start @lg`, `.menu`, `.menu__inner`, `.menu__nav-item`, `.header__logo` dark+menu, `.infinity`, `.award-trophy`, `.world-details__title` |
| xlg | `(min-width: 1921px)` | `w/mb/offset @xlg` only |

JS mirrors these (`theme.js` `mq`): `xs: (max-width: 415px)` (note: **max**-width 415 in JS, min-width 414 in CSS), `sm: (min-width: 768px)`, `md: (min-width: 1024px)`, `lg: (min-width: 1366px)`, `xlg: (min-width: 1921px)`. JS uses `mq.sm` (nav items hide on scroll only at sm+) and `mq.lg` (menu open fades `.footer__cta` only below lg).

Other queries in the CSS:

- **Safari-only hack** (4 occurrences), wraps negative-margin bleed fixes for split text:
  ```css
  @media not all and (-webkit-min-device-pixel-ratio: 0), not all and (min-resolution: 0.001dpcm) {
    @supports (-webkit-appearance: none) { ... }
  }
  ```
  Targets: `.nav-item__text > div`, `.nav-item__text--hover div` (margin `0 -0.2rem`, padding `0 0.2rem`), `.menu__text > div` (`0 -1rem` / `0 1rem`), `.menu__hover-text > div` (`0 -2rem` / `0 2rem`).
- **Broken query**: `@media (min-width: bp("md")) { .grid-toggle { bottom: 2rem } }` is an unprocessed Sass function, invalid CSS, so it never applies in the browser. For a 1:1 match, do NOT apply it (grid-toggle stays `bottom: 1.5rem` at all sizes).

---

## 3. Colors

| value | where |
|---|---|
| `#212121` (off-black, primary ink) | `a` default color; `.t-offblack`; `.header__logo svg` fill; `nav a`; `.menu__nav-item`; `.menu__world svg` stroke; `.menu__footer a`; `.footer__cr`; `.cursor__circle` border; `.cursor__hold-inner` bg; `.cursor__hold-outer` border; `.cursor__click-hold-prompt` stroke + text; `.world-btn__icon` stroke; `.mute-btn__icon-line` stroke; `.infinity .js-infinity` stroke; `.btn--circle .btn__inner-bg`; btn color slots; `.project-filters__filter__toggle/__button` text; `.project-filters__filter__button.is-active` bg/border; `.grid-toggle__button svg` fill + `__bg`; `::selection` text; loader bg `.loader` + `.loader__box div`; menu-btn dots (inline `fill="#212121"`); sprite `chevron-down`, `menu`, `sound` fills/strokes |
| `#fff` | `.dark` text + links; `.t-white`; `.bg` of `.btn--circle .btn__bg`; `.naked-loader` bg + its `.loader__wrap` / `.loader__box div`; `.world-btn__inner-icon` stroke; `.video-indicator__outer` fill; `.project-filters__filter__bg`; `.grid-toggle` + `__button` bg; `.world-details__title` text-stroke; `.dark` variants of logo, cursor, award borders, asscrollbar thumb; `::selection` bg; btn color slots; sprite `close` fill |
| `#000` | `.bg-black` (404 page panel); `.t-black`; `.slider button > span`; `.testimonial__text-box` border; loader `.loader__btn` text + underline spans |
| `#424242` | `.loader` text color, `.naked-loader` text color |
| `#efded9` (blush) | `.loader__progress` bg, `.loader__box--pink div` bg |
| `#f1edeb` (warm off-white) | `.menu__inner` background (the slide-in menu panel) |
| `#f6c8c3` (pink) | `.t-pink` (404 "404/" line) |
| `#faf6f4` | `.project-filters__filter__button.is-active` text |
| `#d6d6d6` | `.menu__nav-item.active` text, `.menu__underline` bg, `.menu__nav-item.active .menu__world svg` stroke |
| `#cacaca` | `.project-filters__filter__button:hover:not(.is-active)` bg + border |
| `#e7e7e7` | `.project-filters__filter__button` border |
| `#c5c5c5` | `.infinity svg path` stroke |
| `hsla(0, 0%, 100%, 0.3)` | `.dark .infinity svg path` stroke |
| `rgba(0, 0, 0, 0.5)` | `.project-filters__overlay` (mobile filter dim) |
| `#EAEAEA` / `#6D6D6D` | cursor progress ring: track / progress (inline SVG stroke attrs) |
| `#040404` | cursor video play-triangle fill (inline) |
| `#FFFFFF`, `#000000`, `#F8D8D8`, `#FF4E1B` | loader eyes SVG internal classes `.eyes-st0..4` (white sclera, black stroke 3, pink eyelids `#F8D8D8`, orange-red heart pupils `#FF4E1B`) |

Theme switch: body class `.dark` (set by JS per route: world, 404, project pages) flips text/icon colors to `#fff`. The home/contact template adds `.page-template-home-contact` which forces `.footer__cr` to `#fff`.

---

## 4. Fonts

Declared in the inline body `<style>` (not in style.css). Only weight 400 of each face exists; `t-300/t-500/t-600` and component `font-weight: 500/600` are **browser-synthesized** from these files (match that: do not add real weights).

| family | style | weight | woff2 (local) | woff fallback (local) |
|---|---|---|---|---|
| `Neue Montreal` | normal | 400 | `/assets/fonts/font-ea8dbf28ff.woff2` (NeueMontreal-Regular) | `/assets/fonts/font-359c5ab9d4.woff` |
| `Saol Display` | normal | 400 | `/assets/fonts/font-959854959d.woff2` (SaolDisplay-Light) | not captured |
| `Saol Display` | italic | 400 | `/assets/fonts/font-4e7609cb6b.woff2` (SaolDisplay-LightItalic) | `/assets/fonts/font-500074fd37.woff` |

All three woff2 are `<link rel="preload" as="font" crossorigin>` in `<head>`.

Stacks (verbatim):

- sans (body default + `.t-sans`): `Neue Montreal, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif`
- serif (`.t-serif`): `Saol Display, Georgia, Cambria, Times New Roman, Times, serif`
- loader / naked-loader: `Neue Montreal, sans-serif`

---

## 5. Type scale

All `t-*` utilities use `!important` (except `.t-italic`). Sizes are rem on the fluid root (section 1), so there are **no vw/clamp formulas in the type utilities themselves**; the only fluid formula is the root `clamp(14px, 1vw, 38px)`.

### Font size

| class | base | @sm (768) | @md (1024) |
|---|---|---|---|
| `.t-small` | 0.8rem | `.t-small@sm` 0.8rem | |
| `.t-0.9` | 0.9rem | | |
| `.t-base` | 1rem | | |
| `.t-1.05` | 1.05rem | | |
| `.t-1.1` | 1.1rem | | |
| `.t-1.2` | 1.2rem | | |
| `.t-1.3` | 1.3rem | `.t-1.3@sm` 1.3rem | |
| `.t-19` | 1.1875rem (note: name is "19", value is 19px-at-16 = 1.1875rem) | | |
| `.t-2` | 2rem | `.t-2@sm` 2rem | |
| `.t-2.25@sm` | | 2.25rem | |
| `.t-3` | 3rem | `.t-3@sm` 3rem | |
| `.t-5` | 5rem | | |
| `.t-6@sm` / `.t-6@md` | | 6rem | 6rem |
| `.t-10` | 10rem | `.t-10@sm` 10rem | |

### Weight
`.t-normal` 400, `.t-300` 300, `.t-500` 500, `.t-600` 600.

### Letter-spacing
`.t-ls--2` -0.02em, `.t-ls-0.3` -0.3rem, `.t-ls-tighter` -0.1rem, `.t-ls-tight` -0.05rem.

### Line-height
`.t-lh-0.85` 0.85, `.t-lh-0.9` 0.9, `.t-lh-1` 1, `.t-lh-1.1` 1.1, `.t-lh-1.2` 1.2, `.t-lh-1.3` 1.3. Body default is 1.5 (from `html`).

### Other text utilities
`.t-black` #000, `.t-offblack` #212121, `.t-white` #fff, `.t-pink` #f6c8c3, `.t-uppercase`, `.t-no-underline`, `.t-italic` (no !important), `.t-sans`, `.t-serif`, `.t-center`, `.t-right`; `@sm`: `.t-left@sm`, `.t-center@sm`, `.t-right@sm`.

### Component-level type (not utilities, for reference)

| element | size / lh / ls / other |
|---|---|
| nav item text | `.t-1.2 .t-lh-1.1` sans; hover twin `.t-1.3 .t-lh-0.9 .t-serif .t-italic` |
| `.menu__nav-item` | Saol Display 6.25rem / 6.25rem, `.t-ls-tighter` (-0.1rem); active: Neue Montreal |
| `.menu__nav-number` | Neue Montreal 1.3rem / 1.3rem |
| `.menu__footer .social-link` | 0.7rem uppercase |
| `.btn--regular .btn__text` | 1.05rem / line-height 0.9rem |
| loader `.loader__title` | 1.125rem, ls -0.025rem, uppercase |
| loader `.loader__tagline` | 1rem, ls -0.025rem, lh 1.15 |
| loader `.loader__box div` | 4rem |
| `.loader__btn` | 0.7rem, 500, uppercase |
| naked loader text | `.t-sans .t-uppercase .t-1.3 .t-normal .t-lh-1` |
| `.cursor__click-hold-prompt` label | 0.5rem uppercase |
| `.world-btn__text span` | 0.8rem |
| `.project-filters__title` | 3rem (display none) -> @sm 4rem, weight 400, lh 1.2 |
| `.project-filters__filter__toggle` | 1.375rem, lh 1 |
| `.project-filters__filter__button` | 1.5rem, ls -0.0225rem, lh 1 -> @sm 0.8rem; count `div` 0.625rem |
| `.project-grid-cta p` | 0.8rem, 600 |
| `.world-details__title` | 5rem, 500, ls -0.1rem, lh 1, uppercase, transparent + 0.5px #fff text-stroke -> @sm 3rem (max-width 65vw) -> @lg 4.5rem, ls -0.2rem, 1px stroke |
| `.world-details__caption` | 2.5rem, lh 1.1 -> @sm 1.6rem |
| `.world-details__author span:first-child` | Saol italic 3.15rem -> @sm 2.1rem |
| `.world-details__author span:last-child` | Neue Montreal 3rem -> @sm 2rem |
| 404 h1 | `.t-5 .t-10@sm .t-lh-0.85 .t-ls-0.3 .t-normal .t-uppercase` |
| contact "Say hello" | `.t-5 .t-6@sm .t-lh-0.9` + `.t-serif .t-normal .t-ls-tighter .t-italic` |
| contact email | `.t-2 .t-300 .t-lh-1` (general) / `.t-lh-1.1` (new business) |

---

## 6. Spacing scale

Formula: **the number in the class name is the rem value**. `mb-N` = `margin-bottom: Nrem !important`, decimals use an escaped dot (`.mb-0\.25` = 0.25rem). `-auto` = `auto`, `-0` = `0`. All spacing utilities are `!important`. Prefixes: `m`/`p` + `t r b l x y` (x = left+right, y = top+bottom), bare `m-`/`p-` = all sides.

Classes that actually exist (only these are defined):

- **base**: `mx-auto mb-auto ml-auto m-0 mb-0 mt-0.25 mb-0.25 ml-0.25 mb-0.5 mb-0.75 mt-1 mr-1 mb-1 mt-1.5 mb-1.5 mt-2 mb-2 mb-2.5 mb-3 mr-4 mb-4 my-5 mr-5 mb-5 mt-6 mb-6 mt-8 mb-8 ml-8 mb-9 mt-10 mb-10 mb-13 mb-15 mb-19 mb-19.5 mb-20` / `p-0 pr-0 pl-0.25 p-1 py-1 pt-1 px-2 pt-2 px-5 pb-5 py-8 pr-8 pl-9 px-10 pt-10`
- **@xs**: `mb-{auto,0,0.25,0.5,0.75,1,1.5,2,2.5,3,4,5,6,8,9,10,13,15,19,19.5,20}@xs`
- **@sm**: the same `mb-*@sm` set + `mt-0@sm mr-2@sm mt-2.5@sm mt-3@sm mr-8@sm pb-0@sm pl-0.75@sm px-2@sm pr-2@sm pl-2@sm pr-3@sm pt-5@sm px-8@sm pl-19@sm`
- **@md**: the `mb-*@md` set + `my-10@md pl-0@md pr-4@md pl-19.5@md`
- **@lg**, **@xlg**: the `mb-*` set only

Grid system:

- `.container`: `margin: 0 auto; max-width: 80rem; padding: 0 1rem; width: 100%` -> @sm `padding: 0 2rem`
- `.grid`: `display: flex; flex-wrap: wrap; margin-left: -2rem`; children `[class*="w-"]` get `padding-left: 2rem` (gutter 2rem). `.grid--no-gutter` zeroes both.
- `.grid > [class*="w-"] + div img/video { margin-top: 5rem }` -> @sm 0.
- Widths `w-{1/1,1/2,1/3,2/3,1/4,3/4,1/5..4/5,1/6,5/6,1/12..12/12}`, `w-auto`, `w-100vw` at base/@xs/@sm/@md/@lg/@xlg; each sets `width` and `max-width` to the same % (e.g. `33.3333333333%`, `66.6666666667%`, `8.3333333333%`, `41.6666666667%`, `58.3333333333%`, `91.6666666667%`, `16.6666666667%`, `83.3333333333%`).
- Offsets `offset-*` (same fractions, `margin-left: X% !important`) at base/@xs/@sm/@md/@lg/@xlg.
- Aspect: `.aspect` (relative, overflow hidden) + `--16/9` 56.25%, `--1/1` 100%, `--3/2` 150% (padding-top), `@sm` variants for 1/1 and 3/2.

---

## 7. Easing and transitions

No easing custom properties. CSS transitions (verbatim):

| curve | duration | where |
|---|---|---|
| `cubic-bezier(0.19, 1, 0.22, 1)` (expo out) | 0.7s opacity | `.slider button` |
| `cubic-bezier(0.16, 1, 0.3, 1)` (expo out) | 1s transform | `.arrow-link > span` and its inner arrow |
| `cubic-bezier(0.87, 0, 0.13, 1)` (expo in-out) | 0.4s fill / scale | `.grid-toggle__button svg`, `.grid-toggle__button__bg` |
| `cubic-bezier(.34,1.56,.64,1)` (back out) | 4s infinite keyframes | loader cube `@keyframes loader` |
| `ease-out` | 0.5s fill | `.header__logo svg` |
| `ease-out` | 0.5s color | `nav a`, `.footer__cr` |
| `ease-out` | 0.5s opacity + visibility | `.footer__cta` |
| `ease-out` | 0.4s stroke | `.infinity svg path` |
| `ease-out` | 1s transform | `.loader__progress`, `.loader__progress > div` |
| `ease-out` | 0.2s transform | `.loader__btn span` (underline split) |
| `ease-in-out` | 0.4s all | `.project-filters__filter__button` |
| default (ease) | 0.4s opacity + visibility | `.post-type-archive-project .grid-toggle` |

Everything else (menu, buttons, nav items, cursor, loader intro) is GSAP in `theme.js`. GSAP eases used: `expo.inOut` (dominant), `expo.in`, `expo.out`, `circ.inOut` (nav item char roll), `sine.out`, `none`. Equivalents: expo.inOut ~ `cubic-bezier(0.87, 0, 0.13, 1)`, expo.out ~ `cubic-bezier(0.16, 1, 0.3, 1)`, expo.in ~ `cubic-bezier(0.7, 0, 0.84, 0)`, circ.inOut ~ `cubic-bezier(0.85, 0, 0.15, 1)`. Durations per component are in COMPONENTS.md.

---

## 8. z-index layers

| z | element |
|---|---|
| 12000 | `.loader` (inline CSS) |
| 11000 | `.cursor` |
| 100 | `.grid-toggle` |
| 80 | `header.header` (`.z-80`) |
| 70 | `.menu` (`.z-70`) |
| 60 | `.mute-btn--global` (`.z-60`) |
| 50 | `.project-filters`; `.footer__cta`, `.world-btn`, `.footer__cr`, world-intro wrapper (`.z-50`) |
| 40 | menu click-catcher `.js-menu-wrapper`, WebGL canvas wrapper, `.world-btn__inner` / `.world-btn__text` (`.z-40`) |
| 39 | `.naked-loader` |
| 10 | `.btn--regular .btn__inner`; `.project-filters__filter` |
| 5 | `.btn--regular > svg` (button border/fill canvas); `.project-filters__overlay` |
| 2 | `.loader__btn`; `.mute-btn__icon` |
| 1 | `.loader__progress`, `.loader__tagline/__title`; `.project-filters__filter__toggle`; `.grid-toggle__button svg` |
| -1 | `.loader__wrap` (cube behind text); `.z-negative` (projects h1) |

Utility classes: `.z-negative` -1, `.z-40`, `.z-50`, `.z-60`, `.z-70`, `.z-80`.
