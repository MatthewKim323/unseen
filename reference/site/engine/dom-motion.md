# DOM motion (every DOM tween in the bundle)

GSAP 3.6.0. Unless stated, gsap defaults apply: `duration 0.5`, `ease "power1.out"`. Position params: `"<"` = start of previous, `"<0.1"` = 0.1 s after previous start, `">"` = end of previous, number = absolute seconds. `autoAlpha` = opacity + visibility. `SplitText` = bundled clone (`chars` get `position:relative; display:inline-block` wrappers with the given class).

---------------------------------------------------------------------------------------------------
## 1. Intro gate / PageLoader (`P`, 670-993) and CSS

Markup: `.js-loader` (fixed, `#212121`, z 12000) › `.loader__inner` › `.js-loader-box` (letter cube, 6 faces = brand letters) + title + tagline; `.js-enter-no-audio-btn` (`.loader__btn`, text "Enter without audio" with two underline spans); `.js-loader-progress` (pink `#efded9` curtain, `transform: translateY(100%)`, `transition: transform 1s ease-out`) › `.js-loader-progress-inner` (`translateY(-100%)`, same transition) containing a pink cube copy, the SVG eyes `.js-eyes`, title, tagline and the Enter SvgButton `.js-enter-btn` (`data-btn="fill"`).

CSS: `.loader--animate .loader__box { animation: loader 4s cubic-bezier(.34,1.56,.64,1) infinite }`
```
@keyframes loader {
  0%    { transform: rotateY(0) rotateX(0) }
  16.6% { transform: rotateY(90deg) rotateX(0) }
  33.3% { transform: rotateY(90deg) rotateX(0) rotate(90deg) }
  50%   { transform: rotateY(180deg) rotateX(0) rotate(90deg) }
  66.6% { transform: rotateY(180deg) rotateX(-90deg) rotate(90deg) }
  83.3% { transform: rotateY(270deg) rotateX(-90deg) rotate(90deg) }
  to    { transform: rotateY(270deg) rotateX(-90deg) rotate(90deg) rotateX(90deg) }
}
```
Cube: `.loader__wrap { perspective: 32rem; position:absolute; top:-9rem }`, `.loader__box` 8rem, faces `translateZ(4rem)` with rotations (see inline loader.css in page HTML). `.loader__eyes { display:none; transform: scale(0) }`. `.loader .btn, .loader__btn { opacity:0; visibility:hidden }`. Loader button underline spans: `transition: transform .2s ease-out`, hover left → `translateX(-101%)`, right → `translateX(101%)`.

| trigger | target | tween |
|---|---|---|
| progress event (throttled 150 ms) | `.js-loader-progress` | `set {y: (100 - p) + "%"}` (CSS transition 1 s ease-out does the easing) |
| ″ | `.js-loader-progress-inner` | `set {y: -(100 - p) + "%"}` |
| init | `.js-eyes-heart` | `set {transformOrigin: "center center", scale: 0}` |
| assets done | `.js-loader-box` (both cubes) | `to {scale: 0, autoAlpha: 0, duration: 0.5, ease: "power2.out", delay: 0.5, onComplete: showEyes}` |
| ″ | `.js-enter-btn` | `to {autoAlpha: 1, duration: 0.5, ease: "power2.inOut", delay: 0.5}` |
| ″ | `.js-enter-no-audio-btn` | same |
| showEyes | eyelids (openEyes) | timeline defaults `{duration: 0.5, ease: "power3.out"}` at 0: leftTop `yPercent -59`, leftBottom `43`, rightTop `-59`, rightBottom `67` |
| ″ | `.js-eyes` | `to {display: "block", scale: 1, duration: 1, ease: "elastic.out(0.5, 0.4)"}` (source: `Elastic.easeOut.config(0.5, 0.4)`), onComplete: measure; touch → `animateEyes()` after 200 ms |
| hover Enter (desktop) | `.js-eyes-normal` / `.js-eyes-heart` | timeline defaults `{transformOrigin: "center center", duration: 0.3}`: normal `scale 0.2` (0); heart `scale 1, ease "elastic.out(0.5, 0.3)"` at 0.1. Hearts moved to top of their `<g>` first |
| leave Enter (after 200 ms) | | heart `scale 0, duration 0.2` (0); normal `scale 1` (0). Normals moved to top |
| hide() | timeline `{delay: e, defaults: {ease: "expo.inOut"}}` | `.js-eyes` `opacity 0, 0.5` (then display none) @0; `.js-loader` `autoAlpha 0, 1` @0; progress-inner `autoAlpha 0, 0.8` @0; progress-inner `scale 1.8, 1.1` @0; then `set` Enter btn / no-audio btn `autoAlpha 0`, loader boxes `autoAlpha 1, scale 1`; `hiddenResolve()` @0.3 |
| show() (used by default/toWorld/homeToProject transitions) | | timeline `{defaults: {ease: "expo.inOut"}}`: `set progressInner {autoAlpha 1, scale 1}` @0; `.js-loader` `autoAlpha 1, duration 1` @0 |

Eye tracking (desktop, RAF idx 3):
```ts
eyelidTl = timeline({paused}) .to(leftTop,{yPercent:-59},0).to(leftBottom,{yPercent:43},0).to(rightTop,{yPercent:-59},0).to(rightBottom,{yPercent:67},0)  // default 0.5 s power1.out, scrubbed
getEyesCenter(): rect = eyes rect; eyesCenterY = top + h/2; maxMovementX = rect.width/15; maxMovementY = (rect.width / w) * 65
                 eyesMin = -eyesCenterY / h; eyesMax = (h - eyesCenterY) / h
getBtnCenter():  btnCenterX/Y from Enter button rect; btnMin = -btnCenterY/h; btnMax = (h - btnCenterY)/h
onPointerMove(): mouse.x = (mouseX - btnCenterX)/w*2 ; mouse.y = (mouseY - btnCenterY)/h*2 ; mouse.y *= mouseY < btnCenterY ? -0.5/btnMin : 0.5/btnMax
                 eyes.y = (mouseY - eyesCenterY)/h*2 ; eyes.y *= mouseY < eyesCenterY ? -0.5/eyesMin : 1.2/eyesMax
onRAF(): e = min(eyes.y || 0, 3)
         current.x = interpolate(current.x, mouse.x, 0.1); current.y = interpolate(current.y, e, 0.1)
         dist = sqrt(mouse.x² + mouse.y²); currentDist = interpolate(currentDist, dist, 0.09)
         eyelidTl.progress(1 - Sine.easeOut(clamp(0, 1, currentDist)))      // eyes close as the cursor approaches the button
         left/right eye style.transform = translate3d(current.x*maxMovementX px, current.y*maxMovementY px, 0)
```
Touch idle loop `animateEyes()` (defaults `{duration: 0.5, ease: "power3.out"}`, repeats 3000 ms after completion): 0: both eyes `y maxMovementY`; label center `+=0.5`: `y 0`; label down `+=1`: `y maxMovementY`; center2 `+=0.6`: `y 0`; sus `+=0.6`: all 4 lids `yPercent 0` (blink/close); open `+=0.8`: lids back to `-59 / 43 / -59 / 67`.

## 2. NakedLoader (`vo`, 14738) — in-page loader between projects
Markup `.js-naked-loader` (fixed, white bg, z 39, opacity 0) with `.js-naked-loader-wrap` cube and `.js-naked-loader-text > div` "(Loading)" split into chars.
- `show(hex = "ffffff", withText = false, anchorEl = false)`: `set [loader, loaderBox] {backgroundColor: "#" + hex}`; timeline `{defaults: {ease: "expo.inOut"}}`: loader `autoAlpha 0→1, duration 1`; wrap `scale 0 → (withText ? 0.5 : 1), duration 0.8, "<"`; at 0.6 add class `loader--animate` (starts cube keyframes). withText: position text at anchor center (`x = left + w/2, y = top + h/2`), `set text visibility visible` @0, chars `y "100%" → "0%"`, `stagger 0.03, duration 0.7, ease "power3.inOut"` @0.
- `hide(resetText = false)`: timeline `{defaults: {ease: "power4.out"}}`: loader `autoAlpha 0, duration 0.8`; wrap `scale 0, duration 0.9, "<"`; remove `loader--animate`; resetText → `set text {visibility: hidden, x: 0, y: 0}`.

## 3. SvgButton (`y`, 299-656) — `.js-btn` (`data-btn="fill"|"border"`, optional `data-togglecontent`)
Build: svg.js canvas `size(clientWidth, clientHeight)`; rect settings `{width: "100%", height: "100%", strokeWidth: 2, rx: "1.3em", ry: "3em"}`, rects at `x 1, y 1`.
- border type: `rect.btn__border.btn__rect` (stroke #000 → CSS var --border) + `rect.btn__border--hover` masked by 3 animated clip rects (`.js-right-reveal` rect `0%×0%` at `x 50%, y -6px`; `.js-bottom-reveal` `0%×25%` at `y 84%`; `.js-left-reveal` `15%×0%` at `x 0, y 10%`); base border uses the inverse mask.
- fill type: `rect.btn__bg`; always a `rect.btn__fill` masked by `.js-btn-fill` rect (white) → fill wipes up.
- Content: `.js-btn-content` cloned into `.js-btn-content-cloned` (CSS starts `translateY(-120%)`, icon `translateX(-1.8rem)`), and for selectable border buttons a `.js-btn-content-select` clone.
- init: `set .js-btn-fill {yPercent: 120}`.

| timeline | defaults | steps (all at "<" = 0 unless noted) |
|---|---|---|
| contentTimeline (paused) | `ease "expo.inOut", duration 0.6` | `.js-btn-content` `y "250%"`; `.js-btn-content-cloned` `y 0, duration 0.8`; if icon: `.js-btn-icon` `x "200%"`, cloned icon `x 0, duration 0.8`; fill: `.js-btn-fill` `yPercent 0`; `.call(play "audio.hover" unless reversed)` at 0.1 |
| borderTimeline (paused, border only) | `duration 0.1` | `set .js-right-reveal {height "18%"}`; right `width "50%", ease "expo.in", 0.25`; right `height "100%", ease "none", 0.12`; bottom `width "100%", ease "none", 0.12, "-=0.01"`; left `height "100%", ease "none"` (0.1); left `width "51%", ease "expo.out", 0.25` (sequential) |
| selectTimeline (selectable) | `ease "expo.inOut", duration 0.6` | cloned `y "250%"` (onComplete `set {y:"-120%", opacity:0}`, onReverseComplete `set {y:"-120%", opacity:1}`); select clone `y 0, 0.8`; icons `x "200%"` / `x 0, 0.8`; `.js-btn-fill yPercent 0` |
mouseenter → `contentTimeline.play()` (+ border `.play()`); mouseleave → `.reverse()`. Ignored for the currently active toggle button. Click on a toggle button (when neither section timeline is active) → new active plays border/select/content, previous reverses all three, `ContentToggle.updateContent`.

## 4. ContentToggle (`fs`, 11071) — contact "New Business / General"
SplitText on `.js-content-toggle-section` `{type: "chars, words", wordsClass: "js-content-toggle-words", charsClass: "js-content-toggle-chars"}`; `set chars {yPercent: 120}`, `set words {overflow: "hidden"}`.
Per section timeline (paused, `ease "expo.inOut", duration 0.9`): for each word `to(chars, {yPercent: 0, stagger: {each: 0.014}}, "<")` (all words start together).
`updateContent(clicked)`: matching section plays after `clicked ? 400 : 0` ms and gets `z-index 10`; others reverse and get `z-index -1`. Initial active = `.js-btn-selected` (timelines forced to progress 1 after 1 ms).

## 5. Header nav (`Gi`, 8028)
SplitText `.js-nav-item-text` `{type: "chars", charsClass: "js-nav-item-chars"}` and `.js-nav-item-hover-text` `{charsClass: "js-nav-item-hover-chars"}`; `set .js-nav-item-hover-chars {yPercent: 150}` then `.nav-item__text--hover { opacity: 1 }` (CSS starts 0).
- mouseenter item: timeline `{defaults: {ease: "circ.inOut"}}`: chars `yPercent -120, stagger {each: 0.014}`; hover chars `yPercent 0, stagger {each: 0.014}` at `"<0.014"` (default 0.5 s).
- mouseleave: chars `yPercent 0`; hover chars `yPercent 150` at `"<0.014"`.
- navItemsTl (paused, defaults `expo.inOut`): items `x: navInnerWidth, ease "expo.in", stagger -0.04, duration 0.8`; `.js-menu-icon-circle[0]` `x 9, expo.inOut, 0.6` at `"<0.2"`; circle[1] `x -9` `"<"`; `set .js-nav-inner {autoAlpha: 0}`. `hideNavItems` plays, `showNavItems` reverses. Used on project pages (`scroll > 0` at ≥768) and `onEnterCompleted` shows.
CSS: `nav a { transition: color 0.5s ease-out }`, logo `fill 0.5s ease-out` (dark mode swaps to white).

## 6. Menu (`Ui`, 8139)
Initial CSS: `.menu { transform: translateX(100%) }` (max-width 41rem ≥1366), `.menu__inner { transform: translateX(-100%) }`, `.menu__underline { width: 0; transform: translateX(40%) }`, `.menu__world { opacity: 0; transform: scaleX(0) }`, `.menu__hover-text { opacity: 0 }`, toggle `.btn__inner-bg { transform: scale(0.00001) }`, `.menu-btn__inner-icon { transform: rotate(-50deg) scale(0.00001) }`.
SplitText `.js-menu-text` → `.js-menu-chars`, `.js-menu-hover-text` → `.js-menu-hover-chars`.
Initial sets: per item chars `{scaleX: 0, opacity: 0, x: (i) => i * (0.9 * i) + "px"}`; items `{x: (i) => 10 * (i + 1) + "%"}`; hover chars `{scaleX: "0", opacity: 0}`; hover text `{opacity: 1, x: "-10%"}`.
- item hover timeline (paused, defaults `expo.inOut, 0.8`): chars `{scaleX 0, opacity 0, x "50%", duration 0.6, stagger 0.03}`; hover chars `{scaleX 1, opacity 1, duration 0.6, stagger 0.03}` `"<0.1"`; hover text `x "5%"` `"<"`; `.js-menu-number` `x "100%"` `"<"`; world item icon `{x "40%", y "-40%", scaleX -1}` `"<"`. Enter plays (+`audio.navlinks_hover` if not active; blocked while menu animating), leave reverses. Active item ignored.
- openTL (paused, `repeatRefresh`, defaults `expo.inOut, 1`): `.js-menu` `x "0%"` @0; `.js-menu-inner` `x "0%"` @0; items `x 0` `"<"`; `.js-active-underline` `{width "100%", x 0}` `"<"`; per item chars `{x 0, opacity 1, scaleX 1, stagger 0.02}` `"<"`; world icon `{opacity 1, scaleX 1}` `"<0.1"`; `.js-menu-link` `{opacity 1, stagger 0.075}` `"<0.1"`; `[.js-nav-inner, .js-footer-cr]` `{autoAlpha 0, duration 0.4}` `"<"`; `.js-social-links` `{opacity 1, duration 0.7}` `"<"`; below 1366: `.js-footer-cta` `{opacity 0, duration 0.4}` `"<"`. onComplete: `menuIsAnimating=false` (+ replay hovered item); onReverseComplete: update active, restore text opacity, clear inline transforms.
- btnTL (paused, `expo.inOut`): `.js-menu-toggle-inner-bg` `scale 1, 1`; `.js-menu-toggle-inner-icon` `{rotate 0, scale 1, duration 1}` `"<"`; circle[0] `x 4.5, 0.5` `"<0.1"`; circle[1] `x -4.5, 0.5` `"<"`.
- toggle hover (desktop): hoverTL `.js-menu-icon {rotate "180deg", ease "expo.inOut", 0.5}` play/reverse; bg pulse timeline `.js-menu-toggle-bg scale 1.15 (0.25, none)` then `scale 1 (0.25, none)` at `"<0.15"`.
- click toggle / backdrop `.js-menu-wrapper`: open → `openMenu()` + bg `scale 0.9 → 1` (0.1 each, none); close → inner-bg `scale 0.9 → 1` (0.1 each) then `closeMenu()`.
- open: `body.has-open-mobile-menu`, `.js-menu-wrapper display block`, play openTL + btnTL, `menu_swoosh` +100 ms, ASScroll disable, ProjectMenu control off. close: reverse, `menu_close` +400 ms. Clicking a menu item (not active) hides its text (desktop) and closes.

## 7. World button (`Hi`, 8415) — `.js-world-btn` (desktop only)
- enter: timeline defaults `expo.inOut, 0.5`: `.js-world-inner-bg scale 1.15 (0.25, none)`; `.js-world-icon {scaleX 0.3, scaleY 0.7, rotate "10deg"}` `"<"`; `.js-world-btn-hover scale 1.05, 0.6` `"<0.05"`; `.js-world-hover-icon {scale 1, opacity 1, rotate 0}` `"<"`; `[text-left, text-right] x "0%"` `"<"`; bg `scale 1 (0.25, none)` `"<0.15"`. (CSS initial: hover icon `opacity 0; scale(0.6) rotate(-80deg)`, left text `translate(100%)`, right text opposite.)
- leave: hover icon `{scale 0, opacity 0, rotate "-80deg", expo.out, 0.5}`; hover `{scale 0, expo.out, 0.6}` `"<"`; icon `{scale 1, rotate 0, 0.5}` `"<"`; text-left `x "100%"` and text-right `x "-100%"` (expo.out 0.5) `"<"`.
- click: `[bg, hover] scale 0.9 → 1` (0.1 each, none). hideBtn/showBtn: `opacity 0/1, expo.out, 0.2`.

## 8. Mute button (`Ni`, 8511) — `.js-mute` (global + per video)
Bars `.js-sound-line` ×5, rest scales `[0.4, 0.3, 1, 0.8, 0.6]`, `transformOrigin "50% 100%"`.
- animateLinesTL (paused, `repeat -1, repeatRefresh, yoyo`): each bar `scaleY "random(0.1, 0.95, 0.05)", duration 0.45, ease "none"` `"<"`.
- resetLinesTL: each bar to its rest scale `0.5, none` `"<"` (played on build; if muted at load then plays mute anim).
- mute anim (defaults `expo.inOut, 0.3`, onStart pause lines): `.js-mute-icon scaleY 0.15`; `.js-mute-fill scale 1.05, 0.7` `"<"`; bars `{scaleY 1, stroke "#fff"}` `"<0.05"`.
- unmute anim (defaults `expo.inOut, 0.5`, onComplete restart lines): fill `scale 0`; bars `stroke "#000"` `"<"`; icon `scaleY 1` (onStart reset lines) `"<"`.
- hover (unmuted): regenerate + play lines; bg pulse `1.15 (0.25 none)` → `1 (0.25 none)` at `"<0.15"`. leave: pause, reset.
- click: muted → `[fill, bg] scale 0.9 → 1.05` (0.1 each, none) then unmute; unmuted → mute + `bg 0.9 → 1`. Listens to `AudioMute`.

## 9. Cursor (`Wi`, 8693) — desktop only
Markup `.js-cursor` › `.js-cursor-wrap` › `.js-cursor-inner` › `.js-cursor-circle` (2.2rem ring, radius 1.2rem, 1.5px border), `.js-cursor-hold-inner/outer`, video indicator (`-outer`, `-play`, `-pause`, `-icon`), `.js-cursor-click-hold-prompt` ("Click & Hold"), `.js-cursor-drag`, `.js-cursor-progress` (ring r 39, `stroke-dasharray 244px`).
Per frame: `dx = round(mouse.x - pos.x)`, `dy` same; `pos += d * 0.2`; `el.style.transform = translate3d(pos)`; unless stopSqueeze: `circle.style.transform = rotate(atan2(dy,dx) deg) scale(1 + s, 1 - s)` with `s = min(hypot(dx,dy)/200, 0.55)`. mouse starts `(-100,-100)`.
States from `data-cursor` on `a, button, [data-cursor]` (default "link" has no handlers):
| state | enter | leave |
|---|---|---|
| hide | `.js-cursor-wrap {scale 0, opacity 0, expo.out, 0.8}` | `{scale 1, opacity 1, expo.out, 0.8}` |
| navWrapper | `stopSqueeze = stopMouseMove = true` | `stopMouseMove = false` |
| navItem | set circle `{rotate 0, scale 1}`; timeline: `mouse → link center (expo.out, 0.2)`; circle `width: linkWidth + "px" (expo.inOut, 0.65)` `"<"` (click-hold prompt hides if active) | circle `width "2.2rem" (expo.out, 0.2)` then `stopSqueeze=false`, clearProps |
| video | videoCursorTl play (`[outer, icon] scale 0→1, 0.3, power1.inOut`), `.js-cursor-progress scale 1 (0.3 power1.inOut)` | reverse, progress `scale 0`, reset ring |
| drag | ring progress from `data-cursor-progress`; `.js-cursor-drag scale 1` and progress `scale 1` (0.3 power1.inOut) | both `scale 0`, reset ring |
- progress ring: `set {strokeDashoffset: round(2.44 * (100 - 100 * p))}`, `opacity p <= 0 ? 0 : 1`.
- mousedown: inner `scale 0.8, 0.2`; on the projects route only, after 250 ms still held → clickHoldTl: inner `scale 0 (0.2)`, hold-inner `scale 0.65 (0.2 expo.out)` `"<0.05"`, hold-outer `scale 1 (0.2 expo.out)` `"<0.05"`. mouseup: reverse (or after finish), or inner `scale 1 (0.2)`.
- click-hold prompt show: `{autoAlpha 1, 0.5, expo.out}` then inner `autoAlpha 0 (0.2 expo.out)` `"<0.25"`; hide: prompt `autoAlpha 0 (0.3 sine.out)`, inner `autoAlpha 1 (0.2 expo.out)` `"<"`.
- disable/enable: `.js-cursor autoAlpha 0/1, 0.5`.

## 10. Video player (`Zi`, `.js-video`)
Icons toggle `scale` 1/0 with `ease "power1.out", duration 0.1` (desktop uses the cursor's play/pause icons). Touch shows `.js-mobile-video-progress`. `timeupdate` → `cursor:progress = currentTime/duration`.

## 11. HomeContact DOM
- `showContact(instant)`: text mesh `uOpacity → 0 (1, expo.out)` at `instant ? 0 : 1`; `.js-view-projects-btn autoAlpha 0 (expo.out, 0.5)` at `instant ? 0 : 1.2`; contact `.js-reveal-anim` `autoAlpha 0 → 1, stagger 0.04, duration 1, power2.out` at `instant ? 0 : 2` (onComplete `renderCss = true`).
- `showHome(instant)`: `.js-reveal-anim autoAlpha 0, stagger 0.05, duration 1, expo.out` at `instant ? 0 : 0.5`; text `uOpacity → 1 (1, power2.out)` at `instant ? 0 : 1.6`; view-projects button `autoAlpha 0 → 1 (power2.out, 0.5)` at `instant ? 0.25 : 1.85`.
- CSS3D layer: renderer `Eo.onEnter` → `autoAlpha 1 (0.5, power2.out)`; `onLeave` (not to / or /contact) → `autoAlpha 0 (1, power2.out)`.
- Footer CTA `.footer__cta { opacity 0; visibility hidden; transition: opacity .5s ease-out, visibility .5s ease-out }`, visible on `.home`.

## 12. Projects page DOM
- `.js-project-filters` (fixed, starts `visibility hidden; opacity 0`): first load `autoAlpha 1, delay 0.1`; transitions: from home/contact `{y "200vh", autoAlpha 0} → {y 0, autoAlpha 1}` (3 s power4.inOut); leaving to home/contact `{y "240vh", autoAlpha 0, duration 3}`; to project `{x "-100%", autoAlpha 0}` (2 s power4.inOut); back from project `{x "-100vw", autoAlpha 0} → {x 0, autoAlpha 1}` (2 s).
- `.js-project-grid-cta` (fixed bottom, starts hidden): `autoAlpha 1/0, 0.3 s power2.out` when scrolled within 50 of the end; hidden with the filters in transitions (`y "240vh"` / `x "-100%"`).
- Filter dropdown (< 768 only) tl (paused, defaults `expo.inOut, 0.8`, isAnimating flags): `set overlay {display block, pointerEvents auto}` @0; `set filterList {display flex}` @0; filterBg `{height: expandedHeight, width "15.8125rem"}`; overlay `autoAlpha 1` `"<"`; filterList `autoAlpha 1` @0.2; filterBtn `autoAlpha 0 → 1, stagger 0.05, duration 0.4, ease "linear"` @0; `set chevron {rotate 180}` @0.4. Open = restart, close = reverse; resize resets. Buttons: CSS `transition: all 0.4s ease-in-out`; counts written into `.js-project-filters:filter:number`.

## 13. World DOM
- `.js-world-intro` (drag-globe svg + "Drag to explore our world"): first visit in playIntro: `set visibility visible`, svg `rotateY 90 → 0`, `p {rotateZ 5, y "100%"} → {rotateZ 0, y "0%", ease "expo.out"}` (duration 1.5 on first visit, timeline default `expo.inOut`); showGrid: svg `rotateY 90`, p `{rotateZ 5, y "100%"}`, wrap `autoAlpha 0 (0.5)` at `"<0.5"`. Leaving world: wrap and CSS3D layer `autoAlpha 0 (0.5 power2.out)`.
- Details panel `.js-details` (CSS3D): `autoAlpha 1 (1)` at 0.5 on open, `autoAlpha 0 (0.65)` on close; title wrap / meta `y ∓ (bbox.max.y * openItemScale + 140)` (switch: 0.75 expo.out). Title is outlined text (`-webkit-text-stroke 0.5px #fff; color transparent`).

## 14. Project page DOM
- Intro: `main autoAlpha 1 (0.5, expo.inOut)` @0 (plus GL glyph reveals, see scenes/project-detail.md).
- ≥768: `.js-current-title x: -leftOffset (1.3 s expo.inOut)` with matching glProps.
- Slider nav hover: inner span `x "-101%" → "0%"` enter, `→ "101%"` leave (0.5 expo.out). Buttons `transition: opacity 0.7s cubic-bezier(0.19, 1, 0.22, 1)`, disabled opacity 0.3.
- Awards list hover: `.js-award-inner x "1.25rem"`, arrow span `x "0%"` (1 s expo.out); unset `0rem` / `100%`.
- Grid slider text: `translate3d(0, 0, -800*progress px)`, `opacity 1 - 5*progress` per frame.
- Transitions: ASScroll container (+ header clone) `y += h` & `autoAlpha 0 (1)` (to home/contact, 1.5 s power4.inOut); `x 0.25w` & `autoAlpha 0 (1 at "<0.17")` (to project menu); `scale 0.4` & `autoAlpha 0 (1)` (other project via header); incoming project: `from {x: 0.25w, 1, power2.out, clearProps transform}`, `from {autoAlpha 0, 0.8, power2.out}`.
- Body background color set instantly to the project/next bg color in toProject and projectToProject; `body.dark` toggles (light-mode projects use class `dark`).

## 15. ScrollAnimations presets (project pages, attribute-driven)
`fade`: `from {autoAlpha 0, duration 1.5, ease "expo.out", clearProps "all"}`; `fadeUp`: same + `y 30, force3D true`; custom `animate-from`/`animate-to` default `{ease "none", duration 1.5, scrollTrigger {trigger el, once true}}`; WebGL presets in scenes/project-detail.md.

## 16. CSS transitions worth porting
| selector | transition |
|---|---|
| `.arrow-link > span`, `.arrow-link > span > span > span` | `transform 1s cubic-bezier(0.16, 1, 0.3, 1)`; hover: outer `translateX(0.75rem)`, arrow glyph slides in from `translateX(100%)` inside a `translateX(-100%)` mask (width 0.75rem) |
| `.loader__progress`, `.loader__progress > div` | `transform 1s ease-out` |
| `.loader__btn span` | `transform .2s ease-out` |
| `.header__logo svg` | `fill 0.5s ease-out` |
| `nav a`, `.footer__cr` | `color 0.5s ease-out` |
| `.infinity svg path` | `stroke 0.4s ease-out` |
| `.footer__cta` | `opacity 0.5s ease-out, visibility 0.5s ease-out` |
| `.project-filters__filter__button` | `all 0.4s ease-in-out` |
| `.slider button` | `opacity 0.7s cubic-bezier(0.19, 1, 0.22, 1)` |
| `.grid-toggle`, `__button svg`, `__button__bg` | `opacity .4s, visibility .4s`; `fill 0.4s cubic-bezier(0.87, 0, 0.13, 1)`; `scale 0.4s cubic-bezier(0.87, 0, 0.13, 1)` |
