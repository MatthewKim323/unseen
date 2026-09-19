# Nocturne components

Per component: markup (full cleaned copies live in `markup/shell.html` and `markup/<route>.html`), every CSS rule with values per breakpoint, state classes, and motion. CSS is verbatim from `source/pretty/style.css` unless marked **(inline)**, which means the `<style>` block injected at the top of `<body>` (the "loader.css" chunk: fonts + loader). JS motion is from `source/pretty/theme.js` (GSAP 3). Breakpoints: sm 768, md 1024, lg 1366 (see TOKENS.md).

## State classes the CSS (or JS) expects

| class | on | set by | effect |
|---|---|---|---|
| `.dark` | `body` | server per template (world, 404) + JS `classList.add/remove("dark")` on route change | white text/icons: logo, nav, cursor, footer__cr, infinity, asscrollbar thumb, award/testimonial borders, naked-loader text |
| `.home` | `body` | server | `.footer__cta` visible (opacity 1, visibility visible) |
| `.page-template-home-contact` | `body` | server (home + contact) | `.footer__cr` white |
| `.post-type-archive-project` | `body` | server (projects) | hides `.world-btn` and `.footer__cr`; shows `.grid-toggle` |
| `.has-open-mobile-menu` | `body` | JS `openMenu()/closeMenu()` | `.dark.has-open-mobile-menu .header__logo svg` fill #212121 below lg, #fff at lg+ |
| `.is-touch` | `body` | JS (`ontouchstart`), removed on real mouse move | `[asscroll]` width 100%; asscrollbar hidden; cursor element removed; body keeps native overflow |
| `.asscroll-disabled` | `html` | server default; JS toggles | `.asscroll-disabled body.is-touch { overflow-y: hidden }` |
| `.project-template-default` | `body` | server (project pages) | allows text selection (all other bodies are `user-select: none`) |
| `.is-grid` | ancestor of `.grid-toggle` | JS (projects grid view) | swaps which grid-toggle button is filled |
| `.is-active` | `.project-filters__filter__button` | JS click | dark pill |
| `.active` | `.menu__nav-item` | JS `updateActiveItem()` (href === location.href) | grey, sans, underline shown |
| `.open` | `.menu` | server (always present) | no CSS attached |
| `.loader--animate` | `.loader`, `.naked-loader` | server on `.loader`; JS on naked-loader show/hide | runs the 3D cube keyframes |
| `.visible` | `[dom2webgl]` | JS | `visibility: visible` |
| `.btn__content--cloned/--select`, `.btn__text--cloned/--select`, `.btn__icon--cloned/--select` | btn internals | JS `cloneContent()` | hover/selected copies of the label |
| `.show`, `.active` | `.asscrollbar` | ASScroll lib | thumb visible / 0.9 opacity |

Body classes per route: home `home page-template-home-contact`; projects `archive post-type-archive post-type-archive-project`; world `dark page-template-world`; contact `page-template-home-contact`; 404 `error404 dark`.

---

## loader (intro, first load only)

Markup (shell.html top): `.loader.loader--animate.js-loader` > `.loader__inner` (dark cube `.loader__wrap > .loader__box > div x6`, `.loader__title`, `.loader__tagline`) + `button.loader__btn.js-enter-no-audio-btn` ("Enter without audio" + 2 underline spans) + `.loader__progress.js-loader-progress > .js-loader-progress-inner > .loader__inner` (pink cube `.loader__box--pink`, `.loader__eyes-container > svg.loader__eyes.js-eyes` (311.3 x 233.3), title, tagline, `.btn.btn--regular.btn--fill.btn--light.js-enter-btn` "Enter").

Brand note: the cube has 6 faces and the source faces spell the 6-letter origin word (reveal order = DOM faces 1,2,3,4,6,5). "NOCTURNE" has 8 letters, so markup currently fills faces N,O,C,T,R,U (reads N-O-C-T-U-R when rotating). **Needs a design call** (e.g. "NOCTRN", a 6-letter tagline word, or an extra rotation step). Title reads "Nocturne Studio®" (uppercased by CSS).

CSS **(inline)**, verbatim:
```css
.loader{align-items:center;background:#212121;color:#424242;display:flex;font-family:Neue Montreal,sans-serif;height:100%;justify-content:center;left:0;position:fixed;text-align:center;top:0;width:100%;z-index:12000}
.loader__progress{background:#efded9;overflow:hidden;position:absolute;transform:translateY(100%);z-index:1}
.loader__progress,.loader__progress>div{height:100%;transition:transform 1s ease-out;width:100%}
.loader__progress>div{transform:translateY(-100%)}
.loader__inner,.loader__progress>div{align-items:center;display:flex;justify-content:center}
.loader__inner{flex-direction:column;position:relative}
.loader__tagline,.loader__title{position:relative;z-index:1}
.loader__eyes-container{position:absolute;top:-9.5rem;width:12.8rem}
@media (min-width:768px){.loader__eyes-container{top:-10.5rem;width:14.4rem}}
.loader__eyes{display:none;height:auto;transform:scale(0);width:100%}
.loader__title{display:block;font-size:1.125rem;letter-spacing:-.025rem;margin-bottom:.35rem;text-transform:uppercase}
.loader__tagline{font-size:1rem;letter-spacing:-.025rem;line-height:1.15;margin-bottom:1.75rem}
.loader .btn{bottom:-2.5rem}
.loader .btn,.loader__btn{opacity:0;position:absolute;visibility:hidden}
.loader__btn{-webkit-appearance:none;-moz-appearance:none;appearance:none;background:none;border:0;bottom:4rem;color:#000;cursor:pointer;display:block;font-size:.7rem;font-weight:500;overflow:hidden;padding:0 0 .1rem;text-transform:uppercase;z-index:2}
.loader__btn span{background:#000;bottom:0;display:block;height:1px;position:absolute;transition:transform .2s ease-out;width:50%}
.loader__btn span:first-child{left:0}
.loader__btn span:last-child{right:0}
.loader__btn:hover span:first-child{transform:translateX(-101%)}
.loader__btn:hover span:last-child{transform:translateX(101%)}
.loader__wrap{perspective:32rem;position:absolute;top:-9rem;z-index:-1}
.loader__box{height:8rem;margin:0 auto 1rem;pointer-events:none;position:relative;transform-style:preserve-3d;width:8rem}
.loader__box,.loader__box div{align-items:center;display:flex;justify-content:center}
.loader__box div{background:#212121;font-size:4rem;height:100%;padding:5rem;position:absolute;width:100%}
.loader__box div:first-child{transform:rotateY(0deg) translateZ(4rem)}
.loader__box div:nth-child(2){transform:rotateY(-90deg) translateZ(4rem)}
.loader__box div:nth-child(3){transform:rotateX(-90deg) rotate(-90deg) translateZ(4rem)}
.loader__box div:nth-child(4){transform:rotateX(180deg) rotate(-90deg) translateZ(4rem)}
.loader__box div:nth-child(5){transform:rotateX(90deg) translateZ(4rem)}
.loader__box div:nth-child(6){transform:rotateY(90deg) rotate(90deg) translateZ(4rem)}
.loader__box--pink div{background:#efded9}
.loader--animate .loader__box{animation:loader 4s cubic-bezier(.34,1.56,.64,1) infinite}
@keyframes loader{
  0%{transform:rotateY(0) rotateX(0)}
  16.6%{transform:rotateY(90deg) rotateX(0)}
  33.3%{transform:rotateY(90deg) rotateX(0) rotate(90deg)}
  50%{transform:rotateY(180deg) rotateX(0) rotate(90deg)}
  66.6%{transform:rotateY(180deg) rotateX(-90deg) rotate(90deg)}
  83.3%{transform:rotateY(270deg) rotateX(-90deg) rotate(90deg)}
  to{transform:rotateY(270deg) rotateX(-90deg) rotate(90deg) rotateX(90deg)}
}
```
Eyes SVG internal classes: `.eyes-st0 {fill:#FFFFFF; stroke:#000000; stroke-width:3; stroke-miterlimit:9.9999}`, `.eyes-st1 {fill:#FFFFFF}`, `.eyes-st2 {stroke:#000000; stroke-width:3; stroke-miterlimit:9.9999}`, `.eyes-st3 {fill:#F8D8D8; stroke:#000000; stroke-width:3; stroke-miterlimit:9.9999}`, `.eyes-st4 {fill:#FF4E1B}`.

Motion (JS): progress panel rises by translating `.loader__progress` from `translateY(100%)` and its child from `-100%` toward 0 as assets load (CSS transition 1s ease-out, progress throttled 150ms). Eyes: heart pupils start `scale:0`; `openEyes()` 0.5s power3.out eyelids to yPercent leftTop -59 / leftBottom 43 / rightTop -59 / rightBottom 67; `animateEyes()` loops a look-down / blink cycle every 3s; pupils follow the pointer. Hide (Enter or Enter-without-audio): expo.inOut, eyes opacity 0 0.5s, loader autoAlpha 0 1s, progress inner autoAlpha 0 0.8s + scale 1.8 1.1s, resolves at 0.3s.

## naked-loader (route transition loader)

Markup: `.naked-loader.js-naked-loader > .loader__inner > .loader__wrap.js-naked-loader-wrap > .loader__box > div.js-naked-loader-box x6` + `.naked-loader__text.absolute.t-sans.t-uppercase.t-1.3.t-normal.t-lh-1.js-naked-loader-text > div "(Loading)"`.

```css
.naked-loader { align-items:center; background:#fff; color:#424242; display:flex; font-family:Neue Montreal, sans-serif; height:100%; justify-content:center; left:0; opacity:0; position:fixed; text-align:center; top:0; visibility:hidden; width:100%; z-index:39; }
.dark .naked-loader { color:#fff; }
.naked-loader .loader__wrap { background:#fff; top:auto; }
.naked-loader .loader__box div { background:#fff; }
.naked-loader__text { align-items:center; display:flex; justify-content:center; left:0; top:0; visibility:hidden; }
.naked-loader__text > div { display:flex; overflow:hidden; position:absolute; }
```
Inherits all `.loader__inner/.loader__wrap/.loader__box` inline rules above.
Motion: `show(hex="ffffff", small, anchorEl)`: sets loader + box bg to `#hex`; expo.inOut: loader autoAlpha 0->1 1s, wrap scale 0 -> (small ? 0.5 : 1) 0.8s, adds `.loader--animate` at 0.6s. If small: text positioned at the anchor's center, chars y 100% -> 0%, stagger 0.03, 0.7s power3.inOut. `hide()`: power4.out, autoAlpha 0 0.8s, wrap scale 0 0.9s, then removes `.loader--animate`.

## header

Markup:
```html
<header class="header fixed d-flex items-center w-1/1 p-1 px-2@sm z-80 justify-center justify-between@sm">
  <div class="header__logo d-flex absolute relative@sm items-center flex-no-shrink h-1/1 pointer-events-none">
    <a href="/" class="d-block pointer-events-auto" data-cursor="hide" title="Nocturne Studio Home"><svg viewBox="0 0 1263.3 159.6">…wordmark…</svg></a>
  </div>
  <div class="d-flex justify-end items-center w-1/1 w-auto@sm js-navigation">
    <nav class="overflow-hidden d-block js-nav-inner" data-cursor="navWrapper">
      <div class="d-none d-flex@sm align-center justify-end"> 3x a.nav-item </div>
    </nav>
    <button class="btn btn--circle menu-btn d-flex js-menu-toggle"> … </button>
  </div>
</header>
```
Layout: padding 1rem, @sm `0 2rem` horizontally (`px-2@sm`); mobile: logo absolute + centered row (`justify-center`), @sm space-between with logo relative. The logo SVG in markup is a **placeholder** (origin wordmark removed): keep viewBox 0 0 1263.3 159.6 proportions.

```css
.header__logo svg { fill:#212121; display:block; height:1.7rem; transition:fill 0.5s ease-out; width:13.2rem; }
.dark .header__logo svg { fill:#fff; }
.dark.has-open-mobile-menu .header__logo svg { fill:#212121; }
@media (min-width:1366px) { .dark.has-open-mobile-menu .header__logo svg { fill:#fff; } }
nav { margin-right:-1rem; }
nav a { color:#212121; display:block; overflow:hidden; padding:0.15rem 0.75rem; text-decoration:none; transition:color 0.5s ease-out; user-select:none; }
.dark nav a { color:#fff; }
```
Scroll behaviour (JS, sm+ only): scrolling past 0 plays `navItemsTl`: nav items `x: navInnerWidth`, ease expo.in, stagger -0.04, 0.8s; menu-btn dots x +9 / -9 (expo.inOut 0.6s, at "<0.2"); then nav inner autoAlpha 0. Reverses at scroll 0.

## nav-item

Markup:
```html
<a href="/projects" class="nav-item js-nav-item" data-cursor="navItem" data-audio-enter="audio.ratchet" aria-label="Projects" title="Projects">
  <div class="relative">
    <div class="nav-item__text t-lh-1.1 t-1.2 js-nav-item-text">Projects</div>
    <div class="nav-item__text--hover t-lh-0.9 absolute t-serif t-1.3 t-italic js-nav-item-hover-text" style="padding-left: 0.1rem;">Projects</div>
  </div>
</a>
```
(`style="padding-left: 0.1rem"` only on Projects; Index has `js-nav-home`, Contact `js-nav-contact`.)
```css
.nav-item__text { white-space:nowrap; }
.nav-item__text--hover { left:0; opacity:0; top:0; white-space:nowrap; }
.nav-item:last-of-type { margin-right:1rem; }
/* Safari only (see TOKENS.md hack) */ .nav-item__text > div, .nav-item__text--hover div { margin:0 -0.2rem; padding:0 0.2rem; }
```
Hover (JS, SplitText chars): on init hover chars `yPercent:150` then hover layer opacity 1. mouseenter: sans chars `yPercent:-120`, then serif italic chars `yPercent:0` at "<0.014"; ease circ.inOut, stagger each 0.014 (default 0.5s duration). mouseleave reverses to 0 / 150. Cursor morphs into a pill the width of the item (see cursor).

## menu-btn (circle button in header)

Markup: `button.btn.btn--circle.menu-btn.d-flex.js-menu-toggle` > `span.sr "Toggle Menu"`, `div.btn__bg.absolute.d-block.menu-btn__bg.js-menu-toggle-bg`, `svg.btn__icon.menu-btn__icon.relative.js-menu-icon` (viewBox 0 0 14 5, two circles r 2.4 at cx 2.4 / 11.6, fill #212121), `div.btn__inner.menu-btn__inner.absolute > span.btn__inner-bg.menu-btn__inner-bg + svg.btn__inner-icon.menu-btn__inner-icon > use #close`.
```css
.menu-btn { position:relative; }
.menu-btn__icon { height:0.6rem; width:0.8rem; }
.menu-btn__inner-icon { height:17.98px; position:absolute; transform:rotate(-50deg) scale(0.00001); transform-origin:center; width:17.98px; }
```
+ `.btn--circle` rules (see btn). Motion: hover (not open) icon rotate 180deg expo.inOut 0.5s + bg pulse scale 1.15 (0.25s none) back to 1 at "<0.15". Click: bg scale 0.9 -> 1 (0.1s each, none). Open (`btnTL`, expo.inOut): inner-bg `scale:1` 1s (from 0.00001, a #212121 disc), close icon rotate 0 + scale 1 1s, dots x +4.5 / -4.5 0.5s at "<0.1". Close = reverse.

## menu (slide-in panel)

Markup (shell.html): `.menu.open.overflow-hidden.fixed.z-70.h-1/1.js-menu > .menu__inner.absolute.h-1/1.d-flex.justify-center.justify-start@lg.items-center.js-menu-inner` > `.menu__nav.d-flex.items-start.w-auto.w-1/1@lg` (4x `a.menu__nav-item`) + `.menu__footer.absolute.d-flex.justify-between.items-end` (left: email + phone `a.d-block.arrow-link.js-menu-link`; right `.overflow-hidden`: 5x `a.social-link.arrow-link.js-social-links`). Sibling click-catcher: `div.fixed.fill.z-40.js-menu-wrapper[style="display:none"]`.

Menu item:
```html
<a href="/world" class="menu__nav-item relative d-flex items-start js-menu-item" data-cursor="hide" aria-label="World" title="World">
  <span class="menu__nav-number js-menu-number">04</span>
  <span class="menu__text t-ls-tighter relative js-menu-text">World<span class="menu__underline js-active-underline"></span></span>
  <span class="t-italic t-ls-tighter menu__hover-text js-menu-hover-text">World</span>   <!-- items 01-03 also have t-serif here -->
  <span class="menu__world js-menu-world-icon"><svg><use href="#globe"/></svg></span>   <!-- World only -->
</a>
```
CSS:
```css
.menu { bottom:0; max-width:100%; right:0; top:0; transform:translateX(100%); width:100%; }
@media (min-width:1366px) { .menu { max-width:41rem; } }
.menu__inner { background-color:#f1edeb; bottom:0; min-width:100%; padding:8.3rem 1rem; right:0; top:0; transform:translateX(-100%); }
@media (min-width:1366px) { .menu__inner { min-width:41rem; padding:8.3rem 0 8.3rem 6.25rem; } }
.menu__nav { flex-direction:column; }
.menu__nav-item { color:#212121 !important; font-family:Saol Display, Georgia, Cambria, Times New Roman, Times, serif; font-size:6.25rem; line-height:6.25rem; margin-bottom:1rem; max-width:700px; position:relative; text-decoration:none; white-space:nowrap; }
.menu__nav-item > span { pointer-events:none; }
.menu__nav-item:after { content:""; margin-top:-8%; }
@media (min-width:1366px) { .menu__nav-item { margin:0; max-width:unset; } }
.menu__nav-item.active { color:#d6d6d6 !important; font-family:Neue Montreal, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif; margin-bottom:0.4rem; }
.menu__nav-item.active .menu__underline { display:block; }
.menu__nav-item.active .menu__nav-number { padding-top:0.9rem; }
.menu__nav-item.active:last-of-type { margin-bottom:0; }
.menu__nav-number { font-family:Neue Montreal, …sans stack…; font-size:1.3rem; line-height:1.3rem; padding-right:0.6rem; padding-top:1.2rem; }
.menu__world { opacity:0; transform:scaleX(0); }
.menu__world svg { stroke:#212121; height:1.75rem; margin-left:0.5rem; width:3.09rem; }
.menu__nav-item.active .menu__world svg { stroke:#d6d6d6; }
.menu__hover-text { left:2.6rem; opacity:0; position:absolute; }
.menu__underline { background-color:#d6d6d6; bottom:0; display:none; height:7px; position:absolute; right:0; transform:translateX(40%); width:0; }
.menu__footer { bottom:2.5rem; left:0; padding:0 3rem; right:0; }
@media (min-width:768px) { .menu__footer { padding:0 6.25rem; } }
.menu__footer a { color:#212121 !important; margin-right:0.8rem; opacity:0; text-decoration:none; white-space:nowrap; }
/* Safari only */ .menu__text > div { margin:0 -1rem; padding:0 1rem; }  .menu__hover-text > div { margin:0 -2rem; padding:0 2rem; }
```
Note the default (non-active) item is **Saol Display** (serif upright), the active item is Neue Montreal grey #d6d6d6 with a 7px underline; hover swaps to the italic layer.

Motion (JS):
- Initial set: each item's chars `scaleX:0, opacity:0, x: i*(0.9*i)px`; items `x: 10*(index+1)%`; hover chars `scaleX:0, opacity:0`; hover text `opacity:1, x:-10%`.
- Open (`openTL`, expo.inOut, 1s default, all at "<"/0): `.menu` x 0% and `.menu__inner` x 0% (the two opposite translates make a curtain reveal), items x 0, underline `width:100%, x:0`, chars `x:0, opacity:1, scaleX:1, stagger 0.02` per item; world icon `opacity:1, scaleX:1` at "<0.1"; `.js-menu-link` opacity 1 stagger 0.075 at "<0.1"; header nav + `.footer__cr` autoAlpha 0 0.4s; socials opacity 1 0.7s; below lg also `.footer__cta` opacity 0 0.4s. Close = reverse. Body gets `.has-open-mobile-menu`, click-catcher `display:block`, smooth scroll disabled.
- Item hover (non-active, expo.inOut): chars `scaleX:0, opacity:0, x:50%` 0.6s stagger 0.03; hover chars `scaleX:1, opacity:1` 0.6s stagger 0.03 at "<0.1"; hover text x 5% (0.8s); number x 100% (0.8s); world icon `x:40%, y:-40%, scaleX:-1`.

## social-link / arrow-link

Markup: `<a class="social-link arrow-link js-social-links" href="https://twitter.com/nocturne" rel="nofollow" target="_blank" data-cursor="hide"><span><span><span>&#11169;&nbsp;</span></span>Twitter</span></a>` (Twitter, Instagram, LinkedIn, Dribbble, Behance). Menu contact links use the same arrow structure (`a.d-block.arrow-link.js-menu-link`). Contact page emails use `arrow-link arrow-link--large` with `&#11169;&nbsp;&nbsp;`. The glyph `&#11169;` is U+2BA1 (down-right arrow).
```css
.menu__footer .social-link { display:block; font-size:0.7rem; text-transform:uppercase; }
.arrow-link * { pointer-events:none; }
.arrow-link > span { display:inline-block; transition:transform 1s cubic-bezier(0.16, 1, 0.3, 1); }
.arrow-link > span > span { display:inline-block; overflow:hidden; position:absolute; transform:translateX(-100%); }
.arrow-link > span > span > span { display:inline-block; transform:translateX(100%); transition:transform 1s cubic-bezier(0.16, 1, 0.3, 1); width:0.75rem; }
.arrow-link:hover > span { transform:translateX(0.75rem); }
.arrow-link:hover > span > span > span { transform:translateX(0); }
.arrow-link--large:hover > span { transform:translateX(1.25rem); }
.arrow-link--large > span > span > span { width:1.25rem; }
```
Hover: label slides right 0.75rem (large 1.25rem) while the arrow slides in from its clipped slot on the left.

## btn

Two families: `.btn--regular` (pill with SVG-drawn border/fill, hover roll) and `.btn--circle` (icon buttons: menu, mute, world). Colorway = `.btn--fill|.btn--border` x `.btn--light|.btn--dark`; `data-btn="fill|border"` tells JS which SVG to build.

Regular markup:
```html
<a href="/projects" title="View our work" class="btn btn--regular btn--fill btn--light js-btn" data-btn="fill" data-cursor="hide">
  <span class="btn__inner js-btn-inner">
    <span class="btn__content js-btn-content">
      <span class="d-flex flex-row items-end">
        <span class="btn__text">View our work</span>
        <svg class="btn__icon d-inline-block js-btn-icon"><use href="/assets/images/img-687f48138f.svg#arrow"/></svg>
      </span>
    </span>
  </span>
</a>
```
Contact toggles add `data-togglecontent="new-business|general" data-router-disabled` and `js-content-toggle-btn js-btn-selected|js-btn-not-selected js-manager-ignore`.

CSS:
```css
.btn { appearance:none; background:transparent; border:0; color:inherit; cursor:pointer; padding:0; position:relative; text-decoration:none; }
.btn * { pointer-events:none; }
.btn:active, .btn:focus { outline:none; }
.btn--regular, .btn--regular > svg { display:inline-block; }
.btn--regular > svg { height:100%; left:0; position:absolute; top:0; width:100%; z-index:5; }
.btn--regular .btn__content { display:block; }
.btn--regular .btn__content--cloned, .btn--regular .btn__content--select { align-items:center; bottom:0; display:flex !important; justify-content:center; left:0; position:absolute; right:0; top:0; transform:translateY(-120%); }
.btn--regular .btn__content--cloned .btn__icon, .btn--regular .btn__content--select .btn__icon { transform:translateX(-1.8rem); }
.btn--regular .btn__inner { border-radius:1.5rem; display:block; margin:2px 0 3px; overflow-y:hidden; padding:calc(0.8rem - 2px) 1.5rem; position:relative; z-index:10; }
.btn--regular .btn__rect { height:calc(100% - 2.5px); width:calc(100% - 2.5px); }
.btn--regular .btn__border { stroke:var(--border); }
.btn--regular .btn__border--hover { stroke:var(--hoverBorder); }
.btn--regular .btn__bg { fill:var(--background); stroke:var(--background); }
.btn--regular .btn__fill { fill:var(--hoverFill); stroke:var(--hoverFill); }
.btn--regular .btn__clip-right { transform-origin:center; }
.btn--regular .btn__clip-bottom { transform:scaleX(-1); transform-origin:center; }
.btn--regular .btn__clip-left { transform:scaleY(-1); transform-origin:center left; }
.btn--regular .btn__icon { fill:var(--text); height:0.67rem; margin-left:0.55rem; width:0.57rem; }
.btn--regular .btn__icon--cloned { fill:var(--hoverText); }
.btn--regular .btn__icon--select { fill:var(--text); }
.btn--regular .btn__text { color:var(--text); font-size:1.05rem; line-height:0.9rem; }
.btn--regular .btn__text--cloned { color:var(--hoverText); }
.btn--regular .btn__text--select { fill:var(--text); }
.btn--fill.btn--light   { --text:#212121; --hoverText:#fff;    --hoverFill:#212121; --border:#fff;    --background:#fff; }
.btn--fill.btn--dark    { --text:#fff;    --hoverText:#212121; --hoverFill:#fff;    --border:#212121; --background:#212121; }
.btn--border.btn--light { --text:#fff;    --hoverText:#212121; --hoverFill:transparent; --border:#fff; --hoverBorder:#212121; --background:transparent; }
.btn--border.btn--dark  { --text:#212121; --hoverText:#fff;    --hoverFill:#fff;    --border:#212121; --hoverBorder:#fff; --background:transparent; }
```
JS-built SVG (svg.js, appended into the button, sized to clientWidth x clientHeight): rects `width/height 100%`, `x=1 y=1`, `stroke-width 2`, `rx 1.3em`, `ry 3em`. fill buttons: `rect.btn__bg.btn__rect` + masked `rect.btn__fill.btn__rect` (mask rect `.btn__fill-mask.js-btn-fill` starts `yPercent:120`). border buttons: `rect.btn__border.btn__rect` + `rect.btn__border--hover.btn__rect`, masked by three clip rects (`.btn__clip-right` x 50% y -6px w/h 0%; `.btn__clip-bottom` y 84% w 0% h 25%; `.btn__clip-left` x 0 y 10% w 15% h 0%). JS also clones `.btn__content` to `.btn__content--cloned` (and `--select` for contact toggles).

Hover (`contentTimeline`, expo.inOut, 0.6s): original content `y:250%`; cloned content `y:0` 0.8s; icon `x:200%`; cloned icon `x:0` 0.8s; fill: `.js-btn-fill` yPercent 120 -> 0 (fill wipes up). Border buttons also play `borderTimeline`: set right clip h 18%, right w 50% (expo.in 0.25s), right h 100% (none 0.12s), bottom w 100% (none 0.12s, -=0.01), left h 100% (none 0.1s), left w 51% (expo.out 0.25s): the hover-colored border draws clockwise around the pill. Leave = reverse. Selected toggle button stays in hover state (`selectTimeline`).

Circle:
```css
.btn--circle { align-items:center; border-radius:50%; height:3.7rem; justify-content:center; padding:0; width:3.7rem; }
.btn--circle .btn__bg { background-color:#fff; border-radius:100%; height:2.7rem; transform:scale(1); width:2.7rem; will-change:transform; }
.btn--circle .btn__inner { align-items:center; border-radius:1.65rem; display:flex; height:2.7rem; justify-content:center; width:2.7rem; }
.btn--circle .btn__inner-bg { background-color:#212121; border-radius:1.65rem; height:100%; position:absolute; transform:scale(0.00001); transform-origin:center; width:100%; }
```

## cursor

Markup (shell.html): `.cursor.js-cursor > .cursor__wrap.js-cursor-wrap` > `.cursor__inner.js-cursor-inner > span.cursor__circle.absolute.fill.js-cursor-circle`; `span.cursor__hold.absolute.fill` (`.cursor__hold-inner`, `.cursor__hold-outer`); `span.cursor__video.video-indicator.video-indicator--cursor.absolute.fill` (svg 100x100: outer circle r49 + play/pause paths); `span.cursor__click-hold-prompt.absolute.fill` (svg 48x48 with 3 lines + circle r23.5, label "Click & Hold"); `span.absolute.fill.cursor__drag` (circle + `svg.cursor__drag__arrows` 46x10); `span.absolute.fill.cursor__progress` (two r39 circles, track #EAEAEA, progress #6D6D6D, `stroke-dasharray/offset 244px`, rotate(-90)).
```css
.cursor { align-items:center; display:flex; justify-content:center; pointer-events:none; position:fixed; z-index:11000; }
.cursor__wrap { transform-origin:top left; }
.cursor__inner { height:7rem; position:relative; transform:translate(-50%, -50%); width:7rem; }
.cursor__circle { border:1.5px solid #212121; border-radius:1.2rem; height:2.2rem; margin:auto; width:2.2rem; }
.dark .cursor__circle { border-color:#fff; }
.cursor__hold { backface-visibility:hidden; transform:translate(-50%, -50%); }
.cursor__hold, .cursor__hold-inner { border-radius:100%; height:2.2rem; width:2.2rem; }
.cursor__hold-inner { background-color:#212121; transform:scale(0); }
.dark .cursor__hold-inner { background-color:#fff; }
.cursor__hold-outer { border:1px solid #212121; border-radius:100%; height:2.2rem; margin:auto; transform:scale(0); width:2.2rem; }
.dark .cursor__hold-outer { border-color:#fff; }
.cursor__click-hold-prompt { height:2.2rem; opacity:0; text-align:center; transform:translate(-50%, -50%); visibility:hidden; width:2.2rem; }
.cursor__click-hold-prompt svg { display:block; height:100%; width:100%; }
.cursor__click-hold-prompt svg circle, .cursor__click-hold-prompt svg line { stroke:#212121; }
.dark .cursor__click-hold-prompt svg circle, .dark .cursor__click-hold-prompt svg line { stroke:#fff; }
.cursor__click-hold-prompt > span { display:flex; justify-content:center; margin-top:0.25rem; }
.cursor__click-hold-prompt > span > span { color:#212121; font-size:0.5rem; text-transform:uppercase; white-space:nowrap; }
.dark .cursor__click-hold-prompt > span > span { color:#fff; }
.cursor__drag { height:5rem; transform:translate(-50%, -50%) scale(0); width:5rem; }
.cursor__drag__arrows { height:50%; left:50%; position:absolute; top:50%; transform:translate(-50%, -50%); width:50%; }
.cursor__progress { height:5rem; transform:translate(-50%, -50%) scale(0); width:5rem; }
.video-indicator { transform:translate(-50%, -50%); }
.video-indicator--cursor { height:5rem; width:5rem; }
.video-indicator--video { height:100%; width:100%; }
.video-indicator__outer { fill:#fff; }
.video-indicator__inner, .video-indicator__progress { fill:none; }
```
Behaviour (JS, removed entirely on touch): position lerps to the mouse each RAF with `speed 0.2` (`translate3d(x, y, 0)` on `.cursor`). Circle squash-and-stretch: angle = atan2(dy, dx), squeeze = min(dist/200, 0.55), `transform: rotate(angle) scale(1+s, 1-s)`. States come from `data-cursor` on hovered `a, button, [data-cursor]` (default "link"): `hide` -> wrap scale 0 + opacity 0 (expo.out 0.8s), leave back to 1; `navWrapper` -> stops mouse follow + squeeze; `navItem` -> cursor snaps to the item's center (expo.out 0.2s) and the circle width tweens to the item's width (expo.inOut 0.65s) = pill highlight; leave -> width 2.2rem (expo.out 0.2s). mousedown: inner scale 0.8 (0.2s); on projects route holding 250ms plays click-and-hold (hold rings). Progress ring: `strokeDashoffset = round(2.44 * (100 - 100*p))`.

## footer (fixed chrome)

Markup: `div.footer` containing: global mute button, `.footer__cta` (pill link), `.world-btn`, `.footer__cr` ("©2026").
```css
.footer__cta { bottom:1.5rem; left:2rem; opacity:0; right:2rem; transition:opacity 0.5s ease-out, visibility 0.5s ease-out; visibility:hidden; }
.home .footer__cta { opacity:1; visibility:visible; }
@media (min-width:1024px) { .footer__cta { bottom:2rem; left:6rem; right:auto; } }
.footer__cr { bottom:2rem; color:#212121; right:2rem; transition:color 0.5s ease-out; }
.dark .footer__cr, .page-template-home-contact .footer__cr { color:#fff; }
.post-type-archive-project .footer__cr { display:none; }
```
Utility classes: `.footer__cta.z-50.fixed.d-flex.justify-center.justify-start@md`, `.footer__cr.z-50.fixed.d-none.d-block@md` (copyright hidden below md). CTA copy: home "Our 2025 Wrapped" (`btn--border btn--light`, `target=_blank`), every other route "Read about our rebrand" (variant kept in shell.html `<template data-variant="footer-cta-non-home">`). (JS only overrides header top / fixed-chrome bottoms when a `?mobilerecording=` debug param is present; ignore.)

### mute-btn
```css
.mute-btn--global { bottom:1.5rem; left:1.5rem; margin-bottom:-0.5rem; margin-left:-0.5rem; position:fixed; }
@media (min-width:1024px) { .mute-btn--global { bottom:2rem; left:2rem; } }
.mute-btn--video { bottom:0; left:0; position:absolute; }
.mute-btn__icon { height:0.98rem; margin:auto; transform-origin:0 50%; width:0.98rem; z-index:2; }
.mute-btn__icon-line { stroke:#212121; transform-origin:50% 100%; }
```
Icon = 5 vertical lines (x 1, 13, 5, 17, 9; stroke-width 2) resting at scaleY `[0.4, 0.3, 1, 0.8, 0.6]` (0.5s none). Hover: lines yoyo `scaleY: random(0.1, 0.95, 0.05)` 0.45s, infinite; bg pulse 1.15. Mute: icon scaleY 0.15, fill disc scale 1.05 (0.7s), lines scaleY 1 + stroke #fff (expo.inOut 0.3s). Unmute: fill scale 0 (0.5s) then equalizer restarts.

### world-btn
```css
.world-btn { bottom:2rem; left:50%; margin-bottom:-0.5rem; position:fixed !important; transform:translateX(-50%); }
.post-type-archive-project .world-btn { display:none; }
.world-btn__icon { stroke:#212121; }
.world-btn__icon, .world-btn__inner-icon { height:1.48rem; margin:auto; width:1.48rem; }
.world-btn__inner-icon { stroke:#fff; opacity:0; transform:scale(0.6) rotate(-80deg); }
.world-btn__text { pointer-events:none; }
.world-btn__text > div { overflow:hidden; position:absolute; top:50%; transform:translateY(-50%); }
.world-btn__text > div span { display:block; font-size:0.8rem; padding:0 0.4rem; }
.world-btn__text-left { position:absolute; right:100%; text-align:right; transform:translateY(-50%); }
.world-btn__text-left span { transform:translate(100%); }
.world-btn__text-right { left:100%; position:absolute; transform:translateY(-50%); }
.world-btn__text-right span { transform:translate(-100%); }
```
Visible md+ only (`d-none d-flex@md`). Label left "Nocturne", right "World". Hover (expo.inOut 0.5s): bg scale 1.15 (0.25s none) then back at "<0.15"; outline globe `scaleX 0.3, scaleY 0.7, rotate 10deg`; dark hover disc `scale 1.05` (0.6s); white globe `scale 1, opacity 1, rotate 0`; both labels `x: 0%` (slide out from behind the button). Leave (expo.out): hover icon scale 0/opacity 0/rotate -80deg 0.5s, disc scale 0 0.6s, icon reset, labels back to 100% / -100%.

### infinity (in CSS, not in captured markup)
```css
.infinity { bottom:1.9rem; opacity:0; position:fixed; right:1.5rem; visibility:hidden; }
@media (min-width:1366px) { .infinity { bottom:2.5rem; right:3rem; } }
.infinity svg { fill:none; stroke-width:2px; stroke-linecap:round; stroke-linejoin:round; stroke-miterlimit:23.3333; display:block; height:1.5rem; width:2.5rem; }
.infinity svg path { stroke:#c5c5c5; transition:stroke 0.4s ease-out; }
.dark .infinity svg path { stroke:hsla(0, 0%, 100%, 0.3); }
.infinity svg .js-infinity { stroke:#212121; }
.dark .infinity svg .js-infinity { stroke:#fff; }
```

## project-filters (projects route, lives in shell)

Markup: `.project-filters.js-project-filters[style="visibility:hidden;opacity:0"]` > `.project-filters__overlay`, `.project-filters__inner` > `h1.project-filters__title.t-sans.t-offblack.t-center.t-ls--2 "Selected Projects"`, `.project-filters__filter` > `.project-filters__filter__bg`, `button.project-filters__filter__toggle.d-none@md "Filter" + svg chevron`, `.project-filters__filter__list` > 5x `button.project-filters__filter__button[data-filter=all|branding|digital|motion|experiment]` each with a count `div.js-project-filters:filter:number` (filled by JS). "All" starts `.is-active`.
```css
.project-filters { left:0; margin-top:5rem; position:fixed; top:0; width:100%; z-index:50; }
.project-filters__title { display:none; font-size:3rem; font-weight:400; line-height:1.2; margin-bottom:1rem; }
@media (min-width:768px) { .project-filters__title { display:block; font-size:4rem; } }
.project-filters__overlay { background:rgba(0, 0, 0, 0.5); height:100%; left:0; pointer-events:none; position:fixed; top:0; width:100%; z-index:5; }
@media (min-width:768px) { .project-filters__overlay { display:none; } }
.project-filters__filter { align-items:center; display:flex; flex-direction:column; margin:0 auto 4rem; position:relative; width:15.625rem; z-index:10; }
@media (min-width:768px) { .project-filters__filter { border-radius:12.5rem; flex-direction:row; margin:0 auto; padding:0.4rem; width:fit-content; } }
.project-filters__filter__bg { background:#fff; border-radius:1.875rem; height:2.875rem; left:50%; position:absolute; top:0; transform:translateX(-50%); width:7.5625rem; }
@media (min-width:768px) { .project-filters__filter__bg { height:100%; width:100%; } }
.project-filters__filter__toggle { align-items:center; background:none; border:0; color:#212121; cursor:pointer; display:flex; font-size:1.375rem; height:2.875rem; justify-content:center; line-height:1; position:relative; width:7.5625rem; z-index:1; }
@media (min-width:768px) { .project-filters__filter__toggle { display:none; } }
.project-filters__filter__list { align-items:center; flex-direction:column; position:absolute; top:100%; width:100%; }
@media (min-width:768px) { .project-filters__filter__list { display:flex; flex-direction:row; position:relative; } }
.project-filters__filter__button { align-items:start; background:none; border:1px solid #e7e7e7; border-radius:12.5rem; color:#212121; cursor:pointer; display:flex; font-size:1.5rem; letter-spacing:-0.0225rem; line-height:1; margin-bottom:0.5rem; padding:0.625rem 1.375rem; transition:all 0.4s ease-in-out; }
@media (min-width:768px) { .project-filters__filter__button { font-size:0.8rem; margin-bottom:0; margin-right:0.1875rem; padding:0.325rem 0.875rem; } }
.project-filters__filter__button:last-of-type { margin-bottom:1.5rem; }
@media (min-width:768px) { .project-filters__filter__button:last-of-type { margin-bottom:0; margin-right:0; } }
.project-filters__filter__button * { pointer-events:none; }
.project-filters__filter__button:hover:not(.is-active) { background:#cacaca; border-color:#cacaca; }
.project-filters__filter__button.is-active { background:#212121; border:1px solid #212121; color:#faf6f4; }
.project-filters__filter__button div { font-size:0.625rem; margin-left:0.1875rem; }
.project-filters__filter__chevron { height:0.375rem; margin-left:0.5625rem; width:0.625rem; }
```
Desktop: white pill bar with 5 chips, superscript counts. Mobile (<768, JS): list hidden; toggle opens (expo.inOut 0.8s) bg to `height: collapsed+list height, width: 15.8125rem`, overlay autoAlpha 1, list autoAlpha 1 at 0.2s, chips autoAlpha 0->1 stagger 0.05 0.4s linear, chevron rotate 180 at 0.4s. Picking a filter closes it. Counts: "all" excludes experiment-only projects.

## grid-toggle (projects; CSS only, not in captured markup)
```css
.grid-toggle { align-items:center; background-color:#fff; border-radius:12.5rem; bottom:1.5rem; display:flex; height:3.0625rem; justify-content:center; left:50%; opacity:0; position:fixed; transform:translateX(-50%); visibility:hidden; width:5.6875rem; z-index:100; }
/* @media (min-width: bp("md")) { .grid-toggle { bottom:2rem } }  <- invalid in source, never applies */
.post-type-archive-project .grid-toggle { opacity:1; transition:opacity 0.4s, visibility 0.4s; visibility:visible; }
.grid-toggle__button { align-items:center; background-color:#fff; border:0; border-radius:100%; cursor:pointer; display:flex; height:2.25rem; justify-content:center; padding:0; position:relative; width:2.25rem; }
.grid-toggle__button svg { fill:#212121; height:0.75rem; transition:fill 0.4s cubic-bezier(0.87, 0, 0.13, 1); width:1.1875rem; z-index:1; }
.grid-toggle__button__bg { background:#212121; border-radius:100%; height:100%; scale:0; transition:scale 0.4s cubic-bezier(0.87, 0, 0.13, 1); width:100%; will-change:transform; }
.grid-toggle__button:first-of-type .grid-toggle__button__bg { scale:1; }   .is-grid .grid-toggle__button:first-of-type .grid-toggle__button__bg { scale:0; }
.grid-toggle__button:first-of-type svg { fill:#fff; }                     .is-grid .grid-toggle__button:first-of-type svg { fill:#212121; }
.grid-toggle__button:last-of-type .grid-toggle__button__bg { scale:0; }    .is-grid .grid-toggle__button:last-of-type .grid-toggle__button__bg { scale:1; }
.grid-toggle__button:last-of-type svg { fill:#212121; }                   .is-grid .grid-toggle__button:last-of-type svg { fill:#fff; }
```
The captured projects page has no `.grid-toggle` element (the current build ships the WebGL list only); CSS kept for parity.

## project-grid-cta (projects route, inside main)

Markup:
```html
<div class="project-grid-cta | js-project-grid-cta">
  <p>Looking for a creative partner for your project?</p>
  <a href="mailto:projects@nocturne.studio" target="_blank" title="projects@nocturne.studio" class="btn btn--regular btn--fill btn--dark js-btn" data-btn="fill" data-cursor="hide">… projects@nocturne.studio + arrow …</a>
</div>
```
```css
.project-grid-cta { bottom:9rem; left:0; opacity:0; position:fixed; text-align:center; visibility:hidden; width:100%; }
@media (min-width:1024px) { .project-grid-cta { bottom:15vh; } }
.project-grid-cta p { font-size:0.8rem; font-weight:600; margin-bottom:0.5rem; }
```
Revealed by the WebGL project list JS (autoAlpha), hidden on leave with `x:-100%, autoAlpha:0`.

## archive (projects route)

No `.archive` rules exist in CSS; `archive` is only a WordPress body class. Route = `post-type-archive-project`: hides `.world-btn` + `.footer__cr`, shows `.grid-toggle`, and the page is the WebGL canvas (`canvas#gl`) driven by the inline `projects` JSON + `.project-filters` + `.project-grid-cta`. `main` holds only a visually hidden `h1.absolute.z-negative[style="opacity:0.001"] "Projects"`.

## error404

No `.error404` rules in CSS; the page is built from utilities on a `.dark` body:
```html
<div class="d-flex items-center justify-center w-1/1 relative bg-black" style="min-height: 100vh">
  <div class="container py-8">
    <h1 class="t-5 t-10@sm t-lh-0.85 t-ls-0.3 t-normal t-uppercase mb-2">
      <span class="d-block t-pink">404/</span>
      <span class="d-block pl-9 pl-19@sm">Page</span>
      <span class="d-block">Nocturne</span>
    </h1>
    <hr class="mb-1">
    <div class="d-flex@md items-center">
      <div class="w-3/4 w-1/2@sm mb-2 mb-0@md"><p class="pl-19.5@md t-lh-1.1 mb-0">It looks like the page …</p></div>
      <div class="w-1/2@md d-flex@md justify-end"> btn "Back to the homepage" (fill light, mr-1) + btn "View our work" (fill light) </div>
    </div>
  </div>
</div>
```
`hr` gets only normalize (`box-sizing: content-box; height: 0; overflow: visible`) + UA border (reads white-ish on black).

## world route

```css
.world-intro { margin-top:27rem; }
.world-intro svg { display:block; height:2.6rem; margin:0 auto; width:4rem; }
.world-intro p { transform-origin:left; }
.world-details { align-items:center; display:flex; justify-content:center; opacity:0; pointer-events:none !important; text-align:center; user-select:none; visibility:hidden; }
.world-details__title-wrap { align-items:flex-end; display:flex; height:8rem; position:absolute; width:100vw; }
.world-details__title { -webkit-text-stroke:0.5px; -webkit-text-stroke-color:#fff; color:transparent; font-size:5rem; font-weight:500; letter-spacing:-0.1rem; line-height:1; margin:0 auto; max-width:100vw; text-transform:uppercase; }
@media (min-width:768px) { .world-details__title { font-size:3rem; max-width:65vw; } }
@media (min-width:1366px) { .world-details__title { -webkit-text-stroke:1px; -webkit-text-stroke-color:#fff; font-size:4.5rem; letter-spacing:-0.2rem; } }
.world-details__btn { margin-top:2rem; pointer-events:auto; transform:scale(2); }
@media (min-width:768px) { .world-details__btn { margin-top:0; transform:none; } }
.world-details__caption { display:block; font-size:2.5rem; line-height:1.1; margin-left:auto; margin-right:auto; max-width:500px; }
@media (min-width:768px) { .world-details__caption { font-size:1.6rem; } }
.world-details__author span { text-transform:uppercase; }
.world-details__author span:first-child { font-family:Saol Display, …serif stack…; font-size:3.15rem; font-style:italic; }
@media (min-width:768px) { .world-details__author span:first-child { font-size:2.1rem; } }
.world-details__author span:last-child { font-family:Neue Montreal, …sans stack…; font-size:3rem; }
@media (min-width:768px) { .world-details__author span:last-child { font-size:2rem; } }
```
World intro (shell): `.fixed.top.left.w-1/1.h-1/1.d-flex.items-center.justify-center.z-50.pointer-events-none.user-select-none.js-world-intro[style="visibility:hidden"] > .world-intro` > drag-globe icon + `p.t-white.t-center.mb-0 "Drag to explore our world"`. JS intro: svg rotateY 90 -> 0, text rotateZ 5 / y 100% -> 0.

## asscrollbar / smooth scroll

Markup (end of body): `<div class="asscrollbar"><div class="asscrollbar__handle"><div></div></div></div>` + `<div class="height-div"></div>`; scroll container `div[asscroll-container][data-router-wrapper] > main[asscroll]`.

Theme CSS:
```css
html { scrollbar-width:none !important; }
body { -ms-overflow-style:none; }
body::-webkit-scrollbar { height:0 !important; width:0 !important; }
.height-div { height:100vh; left:0; position:fixed; top:0; visibility:hidden; }
.dark .asscrollbar > div > div { background-color:#fff; }
.is-touch [asscroll] { width:100%; }
[asscroll-container] { contain:none !important; }
body:not(.is-touch) { overflow-y:hidden; overscroll-behavior-y:none; }
.asscroll-disabled body.is-touch { overflow-y:hidden; }
```
Library-injected CSS (ASScroll, `scrollbarStyles: true` default), verbatim:
```css
.asscrollbar {position:fixed;top:0;right:0;width:20px;height:100%;z-index:900;}
.is-touch .asscrollbar {display:none;}
.asscrollbar > div {padding:6px 0;width:10px;height:0;margin:0 auto;visibility:hidden;}
.asscrollbar > div > div {width:100%;height:100%;border-radius:10px;opacity:0.3;background-color:#000;}
.asscrollbar > div > div:hover {opacity:0.9;}
.asscrollbar:hover > div, .asscrollbar.show > div, .asscrollbar.active > div {visibility:visible;}
.asscrollbar.active > div > div {opacity:0.9;}
```
Config: `new ASScroll({ disableRaf: true, disableResize: true, touchScrollType: "transform", lockIOSBrowserUI: false, disableNativeScrollbar: false, limitLerpRate: false })`, default `ease: 0.075`, `touchEase: 1`. Handle height set by JS.

## misc (CSS present, not in the 5 captured routes)

- `.slider` (project pages): `touch-action:pan-y`; hover `cursor:grab`, active `grabbing`; `img { height:100%; margin-left:1rem; visibility:hidden; width:5rem }`; `button { appearance:none; background:none; border:0; color:inherit; cursor:pointer; line-height:1.2; margin:0; overflow:hidden; padding:0; position:relative; transition:opacity 0.7s cubic-bezier(0.19, 1, 0.22, 1) }`, `[disabled] { opacity:0.3; pointer-events:none }`, `> span { background:#000; bottom:0; height:1px; left:0; position:absolute; width:100% }`.
- `.award { border-top:1px solid #212121 }` (`.dark` #fff); `.award__arrow { display:inline-block; overflow:hidden; position:absolute; transform:translateX(-100%) }`, `span { display:inline-block; transform:translateX(100%); width:1.25rem }`; `.award-trophy { height:10rem }` -> lg `20rem`.
- `.testimonial__text-box { border-top:1px solid #000 }` (`.dark` border-color #fff).
- `[dom2webgl]:not(p) { visibility:hidden }`, `.visible` -> visible; `[dom2webgl="c:ProjectTransitionText"], [dom2webgl="c:WebGLText"] { opacity:0.0001; visibility:visible !important }` (DOM kept for layout, WebGL draws the pixels).
- Global: `::selection { background:#fff; color:#212121 }`; `body:not(.project-template-default) { user-select:none }`; `a { color:#212121 }`; `.dark, .dark a { color:#fff }`.
- Persistent hidden elements: `#p-cover` (no CSS, JS page-transition cover), `canvas#gl` inside `div.fixed.fill.w-1/1.h-1/1.z-40.user-select-none.pointer-events-none`.
