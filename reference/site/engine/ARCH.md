# Engine architecture (source bundle map)

All line numbers refer to `reference/site/source/pretty/theme.js` (17 286 lines, one webpack module `3329`).
three.js is imported as `s` (vendor module `9477`, three **r143**). gsap core is `l.ZP` (module 990) and also `v.ZP` (module 5317, same instance). "E" event bus is `n` (module 1613). Store/global state object is `o` (becomes `window.store`).

Brand placeholder: wherever the source renders its own wordmark, this doc writes `<BRAND>` (6 uppercase letters). Theme asset root is written `${assetsUrl}` (= `window.globalData.assetsUrl`, `<origin>/…/resources/assets/`) and `${publicUrl}`.

---------------------------------------------------------------------------------------------------

## 1. Module / class inventory

| Lines | Minified | Descriptive name | Role |
|---|---|---|---|
| 9-59 | `o` | **Store** | global singleton: `html, body, window{w,h,fullHeight,dpr}, mouse{x,y,gl,glNormalized,glScreenSpace,smooth.glNormalized}, mq{xs,sm,md,lg,xlg}, urlParams, isTouch, isIOS, projectToProjectTransition, currentProjectMenuId, projectLightMode, audioMuted, debug`, plus every manager instance (ASScroll, AssetLoader, Gl, HomeContact, ProjectMenu, World, Audio, Cursor, Menu, …). `window.globalData` (`publicUrl`, `assetsUrl`) merged in on DOMContentLoaded (17236). |
| 60 | `n` | **EventBus** (`E` lib, vendor 1613) | `n.on/off/emit/delegate/bindAll`. DOM + custom events. |
| 64-216 | `c` | **GlobalEvents** | pointer/touch/resize plumbing, emits `GRAF` from `gsap.ticker`. |
| 220-250 | `m` | **RAFCollection** | sorted callback list fired on `GRAF`, `add(cb, index)` ascending index order. |
| 251-257 | `p`,`f` | `$$` (querySelectorAll→array), `$` | helpers |
| 258-296 | `g` | **ComponentManager** | instantiates a class for every `Component.selector` match in a parent (`make`, `callAll`, `destroy`). |
| 299-656 | `y` | **SvgButton** (`.js-btn:not(.js-manager-ignore)`) | svg.js-drawn pill button, fill/border hover timelines, content-toggle select state. |
| 670-993 | `P` | **PageLoader** (intro gate) | progress curtain, 3D letter cube, SVG eyes that track mouse, "Enter" / "Enter without audio" buttons. |
| 1006-1148 | `_` | FileLoader (vendored three) | |
| 1150-1476 | `C`,`j` | DRACOLoader (vendored) | decoder path `${assetsUrl}draco/` |
| 1478-3853 | `A`,`O…Me` | GLTFLoader r143 (vendored, incl. KHR ext plugins) | |
| 3854-4337 | `Xe` | KTX2Loader (vendored) | transcoder path `${assetsUrl}basis/` |
| 4338-4557 | `tt` | **AssetLoader** | promise registry, progress %, `loadGltf/loadTexture/loadKtxTexture/loadJson`, fonts (`document.fonts.ready`, Typekit), `<img>`/`<video>` in page. Two instances: `AssetLoader` (event `AssetsProgress`) and `TextLoader` (event `TextLoaderProgress`). |
| 4559 | `it` | shared fullscreen vUv vertex shader | |
| 4564-4586 | `at` | **OrderedPassList** | keeps `composer.passes` sorted by an index (`composerPasses.add(pass, index)`). |
| 4590-4786 | `ut`,`pt` | CSS3DObject / CSS3DRenderer (vendored three examples, modified: emits `cssrenderer:cacheUpdated` when perspective changes) | |
| 4787-4789 | `ft(path)` | **assetUrl()** | `${assetsUrl}${path}?v=1786625394974` |
| 4790-4856 | `_t` | gsap **three plugin** (`name:"three"`, v3.0.0) | tween `x/y/z/rotationX…/scale/opacity/visible` on Object3D |
| 4857-5022 | `Mt` | **FBO / GPGPU ping-pong** | fullscreen quad sim into `WebGLRenderTarget`s. **Sets `renderer.autoClear = false` globally.** |
| 5036-5268 | `jt` | **FluidSim** (stable fluids: advect → divergence → pressure (Jacobi ×iterations) → subtract gradient) | mouse from screen space or from a raycast UV on a mesh. |
| 5282-5538 | `Lt` | **Gl** (renderer/camera/composer/global uniforms/screen FX/fluid pass) | see §6 |
| 5553-5591 | `Ot` | **ObserverRegistry** (IntersectionObserver subclass) | `Dom2WebglObserver`, emits `dom2webgl` and `firstObservation`. |
| 5618-5911 | `Ft,Gt,Nt,Bt` | **gsap effects registry** (`fade`, `fadeUp`, `webglTextReveal`, `webglPeelEffect`, `webglParallaxEffect`, `mobileWithText`) | |
| 5959-6128 | `Yt` | **ScrollAnimations** | parses `animate-from` / `animate-to` attributes into ScrollTrigger tweens; registers `glProps` gsap plugin. |
| 6173-6278 | `Qt` | **WebGLItem** base (Group) | DOM-synced object: `syncDomSize`, `animate(scrollPos, time)`, `_glProps` mirroring. |
| 6279-6388 | `Jt` | **WebGLText** (troika `Text` bound to a DOM text node) | glyph-bounds animation helpers. |
| 6389-6403 | `ei`,`ti` | TextReveal plane geo + noise-mask material | |
| 6404-6426 | `ii` | SkeletonUtils.clone equivalent | |
| 6460-7324 | `hi` | **Dom2Webgl component map**: `WebGLText, TextReveal, ProjectModel, PhoneModel, Slider, ProjectTransition, ProjectTransitionText, ProjectScrollProgress, Awards` | |
| 7325-7349 | `ui`,`di` | image plane geo `PlaneGeometry(1,1,4,20)` + image material | |
| 7350-7385 | `mi` | **WebGLImage** (dom2webgl `<img>`/`<video>`) | |
| 7386-7449 | `pi` | **ResourceTracker** (dispose helper) | |
| 7463-7621 | `gi` | **Dom2Webgl** manager | |
| 7622-8027 | `zi` | SplitText clone (v3.0.5 API: `chars/words/lines`, `charsClass`, `wordsClass`) | |
| 8028-8138 | `Gi` | **HeaderNav** (top-right nav items, hide on scroll) | |
| 8139-8414 | `Ui` | **Menu** (fullscreen side menu + toggle button) | |
| 8415-8510 | `Hi` | **WorldButton** (footer globe button) | |
| 8511-8679 | `Ni` | **MuteButton** (`.js-mute`, 5 bars eq) | |
| 8693-9062 | `Wi` | **Cursor** | |
| 9063-9183 | `Zi` | **VideoPlayer** (`.js-video`) | |
| 9185-9221 | `Vi` | **WorldTile** (Mesh, media plane) | |
| 9222-9248 | `Yi` | **WorldTileMaterial** | |
| 9249-9252 | `Ki`,`Xi` | hand matcap-mask shaders | |
| 9255-9316 | `Ji`,`es` | AfterimagePass (three examples, damp 0.96 default) | |
| 9317-9387 | `ts` | **WorldNavHand** (prev/next pointer-hand mesh) | |
| 9432-10982 | `ns` | **World** scene (infinite drag gallery, "world" route) | scenes/world.md |
| 10984-11070 | `as`,`ms`,`ps` | **BrownianMotion** camera shake (fractal 1D value noise, rehash random times) | |
| 11071-11132 | `fs` | **ContentToggle** (contact "New Business / General" sections) | |
| 11133-11154 | `gs` | FullScreenQuad | |
| 11155-11241 | `vs` | **PackedMipMapGenerator** (1.5× wide atlas mip chain) | |
| 11242-11433 | `xs` | **Reflector** (planar mirror + mipmapped reflection RT) | |
| 11447-12251 | `ws` | **HomeContact** scene | scenes/home-contact.md |
| 12253-12286 | `bs` | SavePass variant (CopyShader, `needsSwap=false`) | |
| 12287-12290 | `Ss`,`Ts` | project-card frag/vert | |
| 12335-12506 | `Ls` | **Butterflies** (InstancedMesh + 2 GPGPU sims, flocking) | |
| 12551-13465 | `ks` | **ProjectMenu** scene ("projects" route) | scenes/projects-menu.md |
| 13470-~13810 | `Gs` | Debug GUI (Tweakpane, only with `?debug`) | not needed for port |
| ~13811-14271 | `ao` etc | CustomEase clone (v3.2.4) | |
| 14273-14345 | `co` | **TaskScheduler** (requestIdleCallback queue, timeout 3000, concurrency 1) | |
| 14347-14351 | `uo` | **audio sprite map** | |
| 14355-14637 | `po` | **Audio** (Howler) | |
| 14651-14737 | `go` | **FPSChecker** | |
| 14738-14804 | `vo` | **NakedLoader** (in-transition loader) | |
| 14818-14966 | `yo` | **ProjectFilters** (`.js-project-filters`) | |
| 14967-15159 | `wo` | **BaseRenderer** (Highway Renderer): app boot + per-page enter/leave | |
| 15160-15213 | `Po` | Renderer `projects` | |
| 15227-15570 | `So` | **Project** (project detail controller) | scenes/project-detail.md |
| 15584-15655 | `_o` | **GridSlider** (`.js-grid-slider`) | |
| 15656-15713 | `Mo` | Renderer `project` | |
| 15714-15760 | `Co` | Renderer `world` | |
| 15761-15776 | `jo` | Renderer `notFound` | |
| 15777-15791 | `Ao` | Transition `default` | |
| 15792-15854 | `Lo` | Transition `toWorld` | |
| 15855-15975 | `Eo` | Renderer `homeContact` | |
| 15976-16176 | `Oo` | Transition `toHome` | |
| 16177-16389 | `Ro` | Transition `toContact` | |
| 16390-16612 | `ko` | Transition `toProjectMenu` | |
| 16613-16794 | `Io` | Transition `toProject` | |
| 16795-16814 | `Fo` | dispose-deep helper | |
| 16815-16981 | `Do` | Transition `projectToProject` | |
| 16982-17005 | `zo` | Transition `homeToProject` | |
| 17006-17027 | `Go` | Renderer `ktxPreview` (debug) | |
| 17028-17182 | `Uo` | **Router** (Highway.Core subclass with contextual route table) | |
| 17183-17202 | `Ho` | Favicon swap (tab hidden → "eyes" favicon) | |
| 17228-17271 | `Wo` | **App bootstrap** (`Wo.init()`) | |

---------------------------------------------------------------------------------------------------

## 2. Globals, breakpoints, events, RAF order

Breakpoints (`o.mq`, line 26): `xs (max-width:415px)`, `sm (min-width:768px)`, `md (min-width:1024px)`, `lg (min-width:1366px)`, `xlg (min-width:1921px)`.

Global events (`o.events`, 73): `GRAF, GMouseMove, GMouseDrag, GMouseDown, GMouseUp, GResize, TouchDetected, GWheel`.
Custom events: `AssetsProgress{percent}`, `AssetLoader:beforeResolve`, `AssetLoader:afterResolve`, `TextLoader:*`, `dom2webgl`, `firstObservation`, `cssrenderer:cacheUpdated`, `cursor:progress`, `AudioMute(bool)`, `FPSChecked(tier)`, `CheckFPS`, `ProjectFilters:change(titles[])`.

Pointer model (143-202): `mouse.gl = (x - w/2, -y + h/2)` (pixel space, origin center), `mouse.glNormalized = (x/w*2-1, -y/h*2+1)`, `mouse.glScreenSpace = (x/w, 1-y/h)`. `mouse.smooth.glNormalized` lerps 0.05/frame toward glNormalized inside `Gl.onRaf`. Drag events carry `{ox,oy (origin), px,py (prev), x,y}`. Touch devices use touchstart/move/end; a real mousemove with movement on a touch device flips `isTouch=false` (208).

Resize (98-128): debounced 150 ms (lodash.debounce). Sets `--vh = 0.01*h px`, `--screen-height`. On touch, ignores height-only resizes. `window.fullHeight = .height-div.clientHeight` (a 100vh helper div). Calls `ASScroll.resize({width,height})` then emits `GResize`.

Clock: `gsap.ticker` → `GlobalEvents.onRaf(time)` → emits `GRAF(time)`; time is gsap ticker seconds. `Gl.onRaf` sets `u_time = time`, `u_delta = min(clock.getDelta(), 0.016)`.

RAFCollection priorities (ascending = earlier):
| idx | callback |
|---|---|
| 0 | `ASScroll.update` |
| 2 | `FluidSim.onRaf` (each enabled sim) |
| 3 | `Dom2Webgl.onRaf`, `PageLoader.onRAF` (eyes), `Project.onRaf` |
| 4 | `ProjectModel.onRaf`, `Awards.onRaf`, `GridSlider.onRaf` |
| 10 | `ProjectMenu.onPreSceneRaf` (camera) |
| 11 | `ProjectMenu.onRaf` |
| 70 | `World.introRaf` |
| 80 | `World.onRaf` |
| 99 | `Gl.onRaf` → `composer.render()` |
| 100 | `FPSChecker.check`, `HomeContact.onRaf` (note: after render → HomeContact camera is one frame behind; port faithfully or accept) |
| (event) | `Cursor.onRaf` subscribes to `GRAF` directly |

URL flags honoured: `debug`, `skiploader`, `skipintro`, `novignette` (screen FX vignette 0), `forcehq` (disables FPS checker), `devcam`, `homedemo`, `disablecursor`, `experiments`, `mobilerecording[=px]`, `ktx`.

---------------------------------------------------------------------------------------------------

## 3. Boot sequence

1. `Wo.init()` (17229): `history.scrollRestoration="manual"`, on DOMContentLoaded merge `window.globalData` into store, `new GlobalEvents()`, `new Router()` (Highway). Tab visibility swaps favicon to "eyes" images.
2. Highway instantiates the renderer for the first view; `BaseRenderer.setup()` → `onFirstLoad()` (14999):
   - `ASScroll({disableRaf:true, disableResize:true, touchScrollType:"transform", lockIOSBrowserUI:false, disableNativeScrollbar:false, limitLerpRate:false})` (library default `ease: 0.075`, `touchEase: 1`).
   - `RAFCollection`, `FPSChecker`, `AssetLoader`, `TextLoader`, `Dom2WebglObserver(rootMargin "0% 0% 0% 0%")`, `PageLoader`, `NakedLoader`, `ScrollAnimations`, `TaskScheduler`, `Gl` (+`Gl.addPasses()`), `Audio`, `Dom2Webgl`.
   - `CustomEase.create("projectMenuToProject", "M0,0 C0.532,0 0.5,0.5 1,1 ")` (registered, not referenced elsewhere).
   - Scenes constructed immediately (all load their assets into the same AssetLoader, so the intro progress covers every scene): `HomeContact`, `ProjectMenu`, `ProjectFilters`, `World`, then `Navigation`, `Menu`, `WorldButton`, `Cursor`.
   - `RAFCollection.add(ASScroll.update, 0)`, `ASScroll.on("update", ScrollTrigger.update)`, `ScrollTrigger.addEventListener("refresh", ASScroll.resize)`.
   - `onEnter()`; subscribe `AssetLoader:beforeResolve` → `onFirstAssetsLoad`.
3. `onEnter()` (15054): page = last child of router wrapper; eval inline `<script>`s (first load only) → defines `window.projects` / `window.worldData`; `ASScroll.currentPos=0`; `Dom2Webgl.build()`; ComponentManagers for `SvgButton`, `VideoPlayer`, `MuteButton` in the page; `AssetLoader.load({element: page})` → then `updateScrollTrigger()` (scrollerProxy on ASScroll container), `ScrollAnimations.build()`, `Dom2Webgl.enable()`; `TextLoader.load({element:false})`.
4. `onFirstAssetsLoad` (at `AssetLoader:beforeResolve`): `HomeContact.build()`, `ProjectMenu.preBuild()`, `World.buildIntro()`, rebrand SvgButton (`.js-rebrand-btn`), global MuteButton (`.js-global-mute-btn`); after `TextLoader.loaded` and `PageLoader.hiddenPromise`: `onEnterCompleted()`, emit `CheckFPS`, `gsap.from(screenFx.u_maxDistort, {value: 5, duration: 1.5, ease: "power2.out"})` (chromatic barrel settles from 5 to 0.4).
5. **Loader progress** (PageLoader, 670): throttled 150 ms; per update `gsap.set(.js-loader-progress, {y: (100-p)+"%"})` and `gsap.set(.js-loader-progress-inner, {y: -(100-p)+"%"})` (CSS `transition: transform 1s ease-out` smooths it). Pink curtain rises; inside it the pink letter cube and eyes.
6. **At `AssetLoader:afterResolve`**: progress 100; (desktop) build eye tracking; `.js-loader-box` → `{scale:0, autoAlpha:0, duration:.5, ease:"power2.out", delay:.5, onComplete: showEyes}`; Enter button and "Enter without audio" → `{autoAlpha:1, duration:.5, ease:"power2.inOut", delay:.5}`. `?skiploader` hides immediately.
7. **Gate**: Enter → `Audio.muteAll(false)` + `hide()`. Enter without audio → `Audio.muteAll(true)` + `hide()`. Howler starts globally muted (`Howler.mute(true)` in Audio ctor) so nothing is audible before the choice. The global mute button reflects `AudioMute`.
8. `hide()`: timeline `ease "expo.inOut"`: eyes opacity→0 (0.5 s, then display none), `.js-loader` autoAlpha→0 (1 s), progressInner autoAlpha→0 (0.8 s) and scale→1.8 (1.1 s), then resets buttons/boxes; `hiddenResolve()` called at t=0.3 s. Everything waiting on `PageLoader.hiddenPromise` (scene intros, audio backing) starts 0.3 s into the fade.

Audio vs no audio: the only difference is `Howler.mute(bool)` + `store.audioMuted`; all `Audio.play` calls still run (so un-muting later resumes the ambience).

---------------------------------------------------------------------------------------------------

## 4. Router and page transitions (Highway 2.2.0)

`Router` (17028): renderers `{default, homeContact, projects, project, world, notFound, ktxPreview}` keyed by `data-router-view` on `<main>`. Pages are fetched HTML; the router wrapper is `[asscroll-container][data-router-wrapper]`. Links: `a[href]:not([target]):not([href|="#"]):not([data-router-disabled])`. `NAVIGATE_IN` copies the new page's `<body class>` onto `document.body` (drives `.home`, `.dark`, page-template classes). Cmd/Ctrl click bypasses.

Contextual route table (from → to regex → transition):
| from | to | transition |
|---|---|---|
| `/` | `/contact/` | toContact |
| `/` | `/world/` | toWorld |
| `/` | `/projects/` | toProjectMenu |
| `/` | `/projects/.+` | homeToProject |
| `/contact/` | `/` | toHome |
| `/contact/` | `/world/` | toWorld |
| `/contact/` | `/projects/` | toProjectMenu |
| `/contact/` | `/projects/.+` | homeToProject |
| `/world/` | `/` | toHome |
| `/world/` | `/contact/` | toContact |
| `/world/` | `/projects/` | toProjectMenu |
| `/world/` | `/projects/.+` | default |
| `/projects/` | `/` | toHome |
| `/projects/` | `/contact/` | toContact |
| `/projects/` | `/world/` | toWorld |
| `/projects/` | `/projects/.+` | toProject (also forced by `Highway.redirect(url,"toProject")` from a card click) |
| `/projects/.+` | `/` `/contact/` `/world/` `/projects/` | toHome / toContact / toWorld / toProjectMenu |
| `/projects/.+` | `/projects/.+` | projectToProject (also forced by the scroll-to-next footer) |

Every transition `out` removes the old view node then calls `done()`; `in` usually just `done()` (scenes already running) or waits on loaders.

Summary (all values exact; full tweens in dom-motion.md §Transitions and scene docs):
- **default** (15777): out `PageLoader.show()` (loader autoAlpha 0→1, 1 s, expo.inOut); in: after assets `PageLoader.hide()`.
- **toHome** (15976) / **toContact** (16177) (mirror images, `cameraPathProgress` 1 vs 0):
  - from homeContact: tween `HomeContact.tweenParams.cameraPathProgress` to 1 (home) / 0 (contact), 3 s `power4.inOut`; play `audio.contact_swoosh`; `showHome()` / `showContact()` DOM swap.
  - from projects: 3 s `expo.inOut` timeline: HomeContact transition pass `u_progress 1→0` (vertical noisy zoom wipe from projects render to home render), HomeContact `cameraYOffset (h/2)*-5e-5 → 0`, ProjectMenu `cameraYOffset → 2*h`, `.js-project-filters` & `.js-project-grid-cta` → `{y:"240vh", autoAlpha:0, duration:3}`; at 0.6 s play `audio.new_water_projects` and backing lowpass 160→20000 Hz over 1800 ms. toContact also calls `showContact(true)` at 1 s.
  - from world: HomeContact enabled + savePass on, World transition pass `u_toScene = HomeContact save RT`, backing plays at speed 0.7 fading 0→1 over 4 s then `lerpSpeed(→1, 2000ms)`, HomeContact `cameraTranslateZ -0.09 → 0` (2.5 s power2.inOut), `body.dark` removed at 0.8 s, `World.out()` (glitch-circle reverse 2.5 s).
  - from project: 1.5 s `power4.inOut`: project camera `y += h`, ASScroll container `y += h` and autoAlpha→0 (1 s), fog near/far `-=1000`; at (end-0.5 s) HomeContact save+transition passes on, `u_progress 1→0` (`power4.out`), `cameraYOffset (h/2)*-5e-5→0`; audio as above.
- **toProjectMenu** (16390): from homeContact 3 s `power4.inOut` (`u_progress 0→1`, HomeContact `cameraYOffset 0→(h/2)*-5e-5`, ProjectMenu `cameraYOffset 2h→0`, filters `{y:"200vh",autoAlpha:0}→{y:0,autoAlpha:1}`, audio at 0.6 s with lowpass 14000→160). From world: ProjectMenu `cameraZOffset -1000→0` 2.5 s power2.inOut + `World.out()`. From project: 1.5 s power4.inOut, project camera `x → -0.25w`, container `x → 0.25w`, fluid overlay opacity→0 (0.5 s power2.out), container autoAlpha→0 (1 s, at +0.17), fog -=1000, then ProjectMenu `cameraXOffset 1400→0` (2 s) + filters `{x:"-100vw",autoAlpha:0}→{x:0,autoAlpha:1}` (2 s) + menu→project wipe `u_progress 1→0` (1.7 s).
- **toProject** (16613, projects → project): out 2 s `power4.inOut`: ProjectMenu `cameraXOffset → 1400`, filters & CTA `{x:"-100%", autoAlpha:0}`, menu→project wipe pass `u_progress 0→1` (1.7 s) in project bg color, `velocity → 0` (0.5 s), screen FX `u_noiseOnly → 1` (1 s); `body.dark` toggled at 0.8 s from project light_mode; old view removed at 1.2 s. If the next page is not ready 500 ms after the timeline ends, NakedLoader shows with the project bg color. in: waits AssetLoader + TextLoader + TaskScheduler queue + `projectBuilt`, then slides the project in: camera x from `-0.25w`, container x from `0.25w` (1 s power2.out), autoAlpha from 0 (0.8 s), fog back to `origVals` (0.8 s), then `Project.introTimeline.play()`.
- **projectToProject** (16815): triggered by overscroll at the bottom of a project; see scenes/project-detail.md.
- **toWorld** (15792): out: backing fades to 0 over 2 s and `lerpSpeed 0.5 over 2000 ms`; `audio.world_static` (unless leaving a project); at 1 s `audio.world-loop` fade 0→1 over 3 s. From project/projects: `PageLoader.show()` then in: `World.renderPass.enabled`, `World.playIntro()`, `PageLoader.hide()`. From homeContact/projects: that scene's save pass feeds World transition pass (`u_toScene`), scene camera pushes (`HomeContact cameraTranslateZ → -0.09` or `ProjectMenu cameraZOffset → -1000`, 2.5 s power2.inOut) and `World.in()` (glitch circle reveal 2.5 s power2.inOut; `body.dark` added at 1.6 s).
- **homeToProject** (16982): `PageLoader.show()`, backing lowpass 14000→160 over 1800 ms, in: `PageLoader.hide()`.

Renderer hooks (BaseRenderer 14967): `onLeave` disables cursor, ASScroll, adds `html.asscroll-disabled`, destroys scroll animations, resets observer. `onLeaveCompleted` resets Dom2Webgl and destroys buttons/videos/mute toggles. `onEnterCompleted` enables ScrollAnimations, shows nav items, enables cursor, updates menu active item.

---------------------------------------------------------------------------------------------------

## 5. Scroll system (ASScroll 2.x, "asscrollbar")

- Markup: `<div asscroll-container data-router-wrapper><main asscroll …>`; scrollbar `<div class="asscrollbar"><div class="asscrollbar__handle"><div></div></div></div>` (in page HTML). Custom scrollbar is ASScroll's own (library default `customScrollbar: true`, disabled on touch).
- Options: `disableRaf:true` (driven by RAFCollection idx 0), `disableResize:true` (driven by GlobalEvents resize), `touchScrollType:"transform"`, `limitLerpRate:false`, `ease 0.075` (lib default), `touchEase 1`.
- Note `Menu.closeMenu()` also calls `ASScroll.enable()` on any page (harmless where `<main>` is only viewport tall) and `openMenu()` calls `ASScroll.disable()`.
- Only the **project detail** page actually enables smooth scroll from a renderer: `Mo.onEnterCompleted` → `ASScroll.enable({newScrollElements: page, reset: true})`, removes `html.asscroll-disabled`. Home/contact/projects/world keep ASScroll disabled (their "scroll" is custom wheel/drag handling inside each scene).
- ScrollTrigger is proxied onto the ASScroll container (`scrollerProxy` returning `ASScroll.currentPos`; `getBoundingClientRect` = viewport) and updated on `ASScroll.on("update")`.
- WebGL sync: `Dom2Webgl.onRaf` reads `ASScroll.currentPos` every frame, items do `position.y = originalPosition.y + scrollPos` (vertical, operator "-") so GL planes track DOM.
- Header nav: on project pages `ASScroll.on("scroll", Navigation.handleScroll)`: at ≥768 px, `scroll > 0` hides nav items, `0` shows.
- Custom scrolls elsewhere: ProjectMenu wheel (`scrollPos += deltaY`, clamp, lerp 0.05), drag (`1.5 * -(py - y)`); World wheel/drag pans camera; Project footer overscroll drives the next-project transition.

---------------------------------------------------------------------------------------------------

## 6. WebGL core (`Gl`, 5282) — see scenes/core-gl.md for pseudo-TS

- `WebGLRenderer({alpha:true, antialias:false, canvas:#gl, powerPreference:"high-performance", stencil:false})`, `setPixelRatio(dpr<=2 ? dpr : 2)`, size `w × fullHeight`. Canvas sits in a fixed full-screen `z-40` wrapper, pointer-events none.
- Camera: `PerspectiveCamera(fov, w/fullHeight, 1, 2200)` at `z = 1500`, `fov = 2*atan(fullHeight/2/1500)*180/PI` (1 world unit = 1 CSS px at z=0). Scene fog `Fog(0xffffff, 1500, 2200)` (`origVals` saved).
- Composer: `EffectComposer(renderer, WebGLRenderTarget(drawingBuffer w,h, {samples: isTouch ? 0 : dpr > 1 ? 1 : 2}))`. Passes are inserted by index (`OrderedPassList`):

| idx | pass | owner | default enabled |
|---|---|---|---|
| 0 | RenderPass "HomeContact" | HomeContact | false (on when enabled) |
| 1 | SavePass "Home Final" | HomeContact | false |
| 10 | RenderPass "Project Menu" (`clear=false`) | ProjectMenu | false |
| 11 | SavePass "Project Menu Scene Texture" | ProjectMenu | false |
| 15 | ShaderPass "Project Menu to Project Transition" | ProjectMenu | false |
| 20 | RenderPass "Project" (Gl.scene/Gl.camera; `clearColor = #050505`) | Project (added per page) | true |
| 21 | ShaderPass fluid overlay (`Gl.fluidPass`) | Project, desktop only | true while on project |
| 30 | ShaderPass "Home Transition" | HomeContact | false |
| 50 | RenderPass "World" | World | = firstLoad |
| 51 | AfterimagePass | World | true |
| 52 | ShaderPass "World Edge Warp" | World | true |
| 53 | ShaderPass "World Scanlines" | World | false |
| 54 | RenderPass "World Details" (`clear=false`, `clearDepth=true`) | World | false |
| 55 | ShaderPass "World Intro" | World | false |
| 56 | SavePass "World Final" | World | false |
| 57 | ShaderPass "World Transition" | World | false |
| 101 | ShaderPass **screen FX** (always last) | Gl | true |

  `fxaaPass` (FXAAShader) is created and resized but never added to the composer (dead code).
- Global uniforms: `u_time`, `u_delta (≤0.016)`, `u_resolution = (w*pr, fullHeight*pr)`, `fogNear 1500`, `fogFar 2200`, `fogColor Color()` (repointed per scene).
- Global textures: `matcap-white.png`, `matcap-black.png`, `project-model-matcap.png`, `project-model-matcap-dark.png`, `noise-small.png` (Repeat), `gradient-noise.jpg` (Repeat). `generateTexture` defaults: minFilter `LinearMipmapLinear` (KTX: `Linear`), magFilter `Linear`, wrap `ClampToEdge` unless `wrapping`, `flipY` true unless false, `renderer.initTexture()` immediately.
- troika SDF fonts preloaded: "Neue Montreal" `fonts/NeueMontreal-Regular.woff` (chars `a-zA-Z0-9’()&-,`) and "Saol Display" `fonts/SaolDisplay-LightItalic.woff` (chars `a-zA-Z0-9’()&-`), `sdfGlyphSize: 128`.
- Screen FX pass (always on): chromatic barrel (5 spectral taps), vignette, grain. Uniforms `u_maxDistort 0.4`, `u_bendAmount -0.15`, `u_vignetteStrength 0.05` (0 with `?novignette`), `u_noiseOnly 0` (1 = grain only; used on project pages and 404).
- Global FluidSim (screen space, 128², force 20, 1 iteration, radius 0.2, pressure .999, viscosity .999) feeds `fluidPass` (uOpacity 0.03, uImageDistortion 0, uRamp (0,1)) on project pages, and the project-menu card vertex displacement.
- FPS quality step-down: FPSChecker (600 ms windows × 5, drop min & max, tiers `[15,30,45,55]`, `gpuTier = count(avg >= tier)`), when tier < 4: pixelRatio 2→1.5; if already 1.5 and not touch → composer reset with `samples:0`, pixelRatio 1. Rechecks up to 10 times.
- CSS3DRenderer layer: absolute, `z-index 60`, pointer-events none, starts `opacity 0; visibility hidden`; `Gl.cssScene` holds HTML planes for the Home "View our work" button, Contact content block and World details panel.

---------------------------------------------------------------------------------------------------

## 7. Scenes (details in scenes/*.md)

| Scene | Route(s) | Renders | Camera |
|---|---|---|---|
| **HomeContact** (`ws`) | `/`, `/contact/` | baked-lightmap interior (2 rooms, chair, pillows, rocks, table with env reflection, pearl ball), skybox sphere, pink land + 25k/15k/5k instanced grass blades, mirror water plane with fluid ripples + mip-blurred reflection, SDF hero text rendered to RT and displayed with fluid iridescence, 300 dust billboards | clone of Gl camera, `near 0.001 far 2`, `setFocalLength(sm ? 36 : 42)`, rides CatmullRom path `cam` → target path `tgt` from `objectsData.glb`, progress 1 = home, 0 = contact; brownian shake + mouse parallax |
| **ProjectMenu** (`ks`) | `/projects/` | #e5e5e5 fog world, 5 instanced arches + 3 instanced floor tiles (matcap), 3 additive god-ray planes, 120 flocking butterflies (GPGPU), project cards (image plane + canvas caption plane) in a 1- or 2-column grid with wave/bend vertex shader and fluid displacement | clone, `z 2000`, `near 100 far 4500`, fov pixel-matched, brownian + mouse parallax |
| **World** (`ns`) | `/world/` | #050505 infinite wrap-around grid of media tiles (images/videos/ktx2), proximity z-push, intro wireframe sphere + SDF brand/"WORLD" words, 3D hand cursor (grab/grabbing/pointer), prev/next pointer hands, CSS3D details panel; post: afterimage trails, barrel edge warp, colored scanlines, glitch intro, glitch-circle transition | clone of Gl camera (z 1500), `camera.scale = clamp(1920/w, 0.3, 2)` |
| **Project detail** (`So` + Dom2Webgl) | `/projects/<slug>/` | Gl.scene with DOM-synced planes: images/videos (peel/parallax effects), WebGLText (troika) titles, matcap GLB model(s), phone model, slider, awards, next-project transition planes | Gl camera (pixel camera), project bg-colored fog |

Materials, lights: **no three.js lights are used anywhere**. Everything is unlit: `MeshBasicMaterial` with baked textures, `MeshMatcapMaterial`, or custom `ShaderMaterial` with matcaps. Fog is always done manually in shaders (`smoothstep(fogNear, fogFar, gl_FragCoord.z/gl_FragCoord.w)`).

---------------------------------------------------------------------------------------------------

## 8. Header / nav / footer / menu / cursor / audio (summaries; tweens in dom-motion.md)

- **Header** (`.header`, fixed, z-80): logo SVG link + `.js-navigation` with 3 `.js-nav-item` (Index/Projects/Contact) each having a sans text and an italic serif hover text split into chars. Hover: chars roll up `yPercent -120` / hover chars from 150 → 0, `circ.inOut`, stagger 0.014. `≥768px` + project scroll > 0 → items slide right out (`x: navInnerWidth`, stagger -0.04, 0.8 s expo.in) and the two menu-dot circles move ±9 px.
- **Menu toggle** `.js-menu-toggle` (two dots icon): hover rotates icon 180° (0.5 s expo.inOut) + bg pulse 1.15. Click opens `.js-menu` side panel (41rem max at lg). `ASScroll.disable()` and `ProjectMenu.allowControl=false` while open. Audio: `menu_swoosh` +100 ms on open, `menu_close` +400 ms on close; `navlinks_hover` on item hover.
- **Footer**: global mute button (bottom), `.js-footer-cta` border button (bottom-left, visible on `.home`), `.js-world-btn` globe button (center bottom, md+; hidden on the world page), `.js-footer-cr` © year (bottom-right, md+).
- **Cursor** (`.js-cursor`, fixed z 11000, desktop only, removed on touch): lerp follow `speed 0.2` with velocity squash/stretch (`squeeze = min(dist/200, 0.55)`, `scale(1+s, 1-s)` rotated to motion angle) on a 2.2rem ring. States via `data-cursor` on hovered `a, button, [data-cursor]`: `hide`, `navItem` (ring morphs to link width, snaps to its center), `navWrapper`, `video`, `drag` (progress ring `strokeDashoffset = round(2.44*(100-100p))`). Mouse-down squeeze `scale .8`; on the projects route, click-and-hold (250 ms) plays the hold timeline. WebGL scenes call `Cursor.hideEnter()/hideLeave()` when hovering 3D items.
- **Audio**: one Howler sprite `audio/audio.webm` + `audio/audio.mp3` (html5 mode only on macOS 10.15 Safari 15). Keys: `backing` (loop 30.7 s), `click`, `contact_swoosh`, `hover`, `menu_close`, `menu_swoosh`, `navlinks_hover`, `new_water_projects`, `ratchet`, `world_static`, `world-intro`, `world-loop` (loop). Played via `data-audio-enter|leave|click` attributes (desktop), SvgButton hover (`audio.hover` at 0.1 s into hover timeline), menu, transitions. The backing track runs through a BiquadFilter lowpass inserted per-sound (`filterTo`), 14000→160 Hz when entering the projects/project areas, back to 20000 Hz when returning home/contact. Tab hidden → `Howler.mute(true)`.

---------------------------------------------------------------------------------------------------

## 9. Animation library usage

- **GSAP 3.6.0** for every tween (DOM, uniforms, Object3D, camera params), ScrollTrigger 3.6.0 (scrubbed WebGL effects on project pages, video play/pause toggles), a custom `glProps` plugin (tween `el._glProps` which Dom2Webgl mirrors onto meshes each frame), a vendored three plugin, SplitText clone, CustomEase clone, `gsap.utils.interpolate/clamp`, `gsap.ticker` as the master RAF.
- Frame-lerp constants are used heavily instead of tweens (listed per scene). There is **no** CSS-keyframe animation except the loader cube (`@keyframes loader`, 4 s `cubic-bezier(.34,1.56,.64,1)` infinite) and CSS transitions (arrow links 1 s `cubic-bezier(0.16,1,0.3,1)`, loader progress 1 s ease-out, logo/nav colors 0.5 s ease-out, etc.).
- Every duration/ease/delay is in dom-motion.md (DOM) and scenes/*.md (GL).

---------------------------------------------------------------------------------------------------

## 10. Porting notes / quirks found

- `o.ProjectMenu.combinedSavePass` is referenced in `toWorld` (15840) but never created → that branch would throw; in practice `projects → world` uses the loader branch (`"projects" === routerView` sets `usingLoader`), so the combinedSavePass line is dead. Keep the loader path.
- `o.Project.dom.headerClone` is referenced in transitions but never assigned (undefined targets are ignored by gsap).
- `sand-rotate.jpg` and `images/project-menu/arch.ktx2` are loaded by ProjectMenu but never bound to a material (arches/floor use `project-model-matcap.png`). Load them only if you want identical network/progress behaviour.
- `ProjectMenu.in()` creates an empty 2 s expo.out timeline (`inTimeline`) and flips `allowControl=true`.
- `HomeContact.onRaf` runs at index 100 after the composer render at 99.
- Project `isExternal = project["0internal_or_external"] === "0"`; external cards `window.open(url,"_blank")`, internal ones `Highway.redirect(url, "toProject")`.
- Captured pages: home, contact, projects, world. **No project-detail HTML was captured** (p4/p5 are 404 `notFound` views), so project-page DOM classes are known only from selectors in the bundle.
