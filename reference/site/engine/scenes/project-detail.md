# Scene: Project detail (`So` Project 15227-15570, Dom2Webgl `gi` 7463-7621, components `hi` 6460-7324, WebGLImage `mi` 7350) — route `/projects/<slug>/`

No project-detail HTML was captured; everything below is from the bundle. The page is a normal DOM layout scrolled by ASScroll; elements tagged with `dom2webgl="…"` are hidden in CSS and re-drawn in WebGL as planes/text/models in `Gl.scene` with the pixel camera (1 unit = 1 px), kept in sync with scroll every frame. The page itself sets `data-bgcolor`, `data-next-bgcolor`, `data-next-link` and the footer `.js-footer[data-next-light-mode]`.

CSS contract: `[dom2webgl]` elements are `visibility: hidden` until `.visible`; `[dom2webgl="c:ProjectTransitionText"], [dom2webgl="c:WebGLText"] { opacity: 0.0001; visibility: visible !important }` (so they still take layout and remain selectable). On touch devices `<img>/<video>` dom2webgl elements are left as DOM (`visibility: visible`) and never go to WebGL.

## Dom2Webgl manager
```ts
selector = 'dom2webgl'; components = { WebGLText, TextReveal, ProjectModel, PhoneModel, Slider, ProjectTransition,
                                       ProjectTransitionText, ProjectScrollProgress, Awards }
// axis: ASScroll.isHorizontal ? ['+','x'] : ['-','y']
// operations: '+': (orig, scroll, glOffset=0) => orig - scroll + glOffset ; '-': (orig, scroll, glOffset=0) => orig + scroll - glOffset
build():   for el of $$('[dom2webgl]'):
             img/video → isTouch ? (visible, skip) : webGLItems[attr] = new WebGLImage({name: attr, domEl: el})
             value 'c:Name' → webGLItems['c:Name' + n] = new components[Name]({name, domEl: el, assetType:'component', elObj})
             videos: elObj.enter = play, elObj.leave = pause
             Dom2WebglObserver.els.push({el, updateSize: true, params: {webglEl: key}})
enable():  for item: observer.observe(domEl); item.build?.(); resourceTracker.track(item); item.calcPixelScale(); item.syncDomSize(); Gl.scene.add(item)
onFirstObservation(els): (once) for each: item.mapAnimateProps(); item.visible = true; updateDom2Webgl(el)
onElIntersect(el): if !firstObservation && el.updateSize: updateDom2Webgl(el)
updateDom2Webgl({el, bcr, params}):
   gx = el._glProps?.['position.x'] ?? 0 ; gy = el._glProps?.['position.y'] ?? 0
   item.position.x = -w/2 + (bcr.x + bcr.width/2) - gx + (horizontal ? smoothScrollPos : 0)
   item.position.y = fullHeight/2 - bcr.y - bcr.height/2 + gy - (horizontal ? 0 : smoothScrollPos)
   item.originalPosition.copy(item.position)
onRaf(time) (idx 3): smoothScrollPos = ASScroll.currentPos; for item: item.animate(smoothScrollPos, time)
onResize: for each observed el: unobserve, item.syncDomSize(), observe; firstObservation = true (re-map on next observation)
reset(): resourceTracker.dispose()
```
WebGLItem base (`Qt`): `animate(scroll, t)`: `position[axis] = op(originalPosition[axis], scroll)`; then for every `_glProps` key: `position.<axis>` → `op(orig, scroll, _glProps[key])`, other keys copied to the mapped target (`"rotation.y"` → `item.rotation.y`), `uniforms.*` copied into `item.material.uniforms[*].value`; also sets `u_time`/`u_scrollPos` uniforms when present. `syncDomSize()`: `item.scale = (clientWidth, clientHeight, 1)`; images also set `u_size` and `u_imageSize = naturalWidth/Height`. `build()` for images enqueues `renderer.initTexture` on the TaskScheduler (idle callback).

`glProps` gsap plugin (ScrollAnimations.registerGsapPlugins): tweening `{glProps: {"position.x": v, uniforms: {u_progress: 1}}}` on a DOM element tweens `el._glProps[...]`, which the item mirrors each frame. This is how DOM timelines drive GL.

## WebGLImage (`mi`) — every `<img dom2webgl>` / `<video dom2webgl>`
- Geometry shared `PlaneGeometry(1, 1, 4, 20)`; material = clone of `di` ShaderMaterial (`dom-image-peel-bend.vert`, `dom-image-edge-rgbshift-fog.frag`, transparent).
- Uniforms: `u_texture` (VideoTexture for video; for img a new `Image()` with `crossOrigin=""` loading the same src → Texture, initTexture on load), `u_texture2 null`, `u_opacity 1`, `u_innerScale 1`, `u_innerY 0`, `u_innerX 0`, `u_screenCenterTexture 0`, `u_edgeFade 1`, `u_progress 0`, `u_enableBend false`, `u_time 0`, `u_size [1,1]`, `u_resolution = Gl u_resolution`, `fogNear/fogFar/fogColor = Gl globals`. iOS: `minFilter Linear`, no mips.
- Vertex: when `u_enableBend`: `bend = smoothstep(uv.y - 0.5, uv.y, 1. - u_progress)`; `pos.x *= 1. + bend*.2*abs(ssCoords.x)`; `pos.z += (1. - u_progress + 0.5) * 250.` (peel-in from depth). Fragment: uv offset by `u_innerY/X`, scale by `u_innerScale`, RG channel blur shift near screen edges (`smoothstep(0.85, 1.)`) times `u_edgeFade`, fog.

## Components (`dom2webgl="c:<Name>"`)
| Name | Build | Per frame / behaviour |
|---|---|---|
| **WebGLText** (`Jt`) | troika `Text` with `text = el.innerText`, anchor center/middle, `material.depthTest=false`, `renderOrder 10`, `defines.FOG = true`. Registers a promise in `TextLoader`. `syncDomSize`: font from computed `font-family` first name → `Gl.webglFonts[name].url`, `fontSize = px`, `letterSpacing = ls/fontSize`, `maxWidth = rect.width + 4`, `lineHeight = lh/fontSize`, `textAlign`, `color` from computed rgb, `sdfGlyphSize 128`, `clipRect [-0.6w, -0.5h, 0.6w, 0.5h]`; after sync copies `aTroikaGlyphBounds` into `glyphPositions[{minX,minY,maxX,maxY}]`. `_glProps = {"position.x":0,"position.y":0}` | Helpers `addToGlyphPositions({minY,maxY})`, `updateGlyphPositions()` let timelines slide glyphs (per-glyph masked reveal thanks to clipRect). |
| **TextReveal** | `Mesh(PlaneGeometry(), ti.clone())` (project-text-reveal-noise-mask.*), `u_bgColor = Project.backgroundColorGl`, `u_progress 0`, `u_scrollPos`, `u_ratio = max(w/h, h/w)`, `renderOrder -2`, transparent, depthTest false | a bg-colored cover plane that dissolves (noise, from top-left) as `u_progress` 0→1; `u_scrollPos` fed each frame. Used by `webglTextReveal` effect and `mobileWithText`. |
| **ProjectModel** | `loadGltf(el.dataset.src)` → SkeletonUtils-clone; every child gets one ShaderMaterial (matcap-model.vert + project-model-matcap-transition.frag, transparent, DoubleSide, depthTest false) uniforms `uMatcapLight = project-model-matcap`, `uMatcapDark = project-model-matcap-dark`, `uBaseColor = Project.backgroundColorGl`, `uNextBaseColor = Color(el.dataset.nextBgcolor || 0)`, `uTransitionProgress 0`, fog globals; defines `LIGHTMODE = projectLightMode`, `TRANSITION = el.dataset.transition !== undefined`, `TO_LIGHTMODE = el.dataset.lightMode === "true"`. `item.renderOrder -1`; `data-scale` → group scale. `syncDomSize`: `item.scale = min(w/bboxW, h/bboxH)`. `_glProps = {"position.y": 0}` | RAF idx 4: each child `i`: `rot.x = orig.x + (0.1 * -smoothMouse.y + 0.02*sin(t + i))`, `rot.y = orig.y + (0.15 * smoothMouse.x + 0.05*cos(t + i + 21.263))`, `pos.y = orig.y + 5*cos(t + i)/item.scale.x`; group `rotation.x = 0.1 * -smoothMouse.y`, `rotation.y = 0.15 * smoothMouse.x` (`smoothMouse = store.mouse.smooth.glNormalized`). Output alpha 0.3. |
| **PhoneModel** | `models/phone.glb` once; clone; node `Body` → `MeshMatcapMaterial{matcap: lightMode ? matcapDark : matcapLight, color: Project.backgroundColorGl, opacity 0.3, transparent}`, node `Screen` → `MeshBasicMaterial{map: first media texture, transparent}`, both `renderOrder 100`. Media = `img, video` children of the element (images: new Image, `flipY false`; videos: `generateTexture(video, {flipY:false, minFilter: Linear})`). If any video: ScrollTrigger on `closest(".container")` plays/pauses it. | `animate`: `item.rotation.x += 75e-5*sin(t + r)`, `rotation.y += 0.01*cos(t + r)` (r = `100*random()`), child0 rotation lerps 0.075 toward `(-0.05*mouse.glNormalized.y, 0.1*mouse.glNormalized.x)`, `position.y += 0.1*cos(t + r)`. |
| **Slider** | `.js-slider-wrap` with `.js-slider-image`s, `.js-slider-prev/next` (inner span), `.js-slider-index`. One Group + `Mesh(PlaneGeometry(), slider material)` per image (project-slider-image.*; `u_texture`, `u_imageSize` natural, `u_meshSize`, `u_resolution`, `u_innerScale 1`). `dragSpeed = touch ? 0.75 : 0.5`. | `syncDomSize`: `minWidth = images[1].clientWidth`, gap `xs ? 15 : sm ? 25 : 35`, `leftEdge = -minWidth - 33.5`, `rightEdge = minWidth + 33.5`, `positionOffsetLimit = w/2 - minWidth/2`, `maxDragPos = (-minWidth - gap)*(count-1)`, slide `origPos = (minWidth + gap)*i`. `animate`: `position.y = orig.y + ASScroll.currentPos`; when active (in view): `smoothDragPos += 0.1*(dragPos - smoothDragPos)`; slide x = origPos + smooth; `i = clamp(2*((|x|-L)/(R-L) - .5), 0, 1)`, `o = clamp(2*((x-L)/(R-L) - .5), -1, 1)`; mesh `scale.x = max(w*(1-i), minWidth)`, mesh `x = clamp(0.5*w*o, -limit, limit)`, `u_meshSize.x = scale.x`; hover raycast → `u_innerScale → 1.05` (0.5 s expo.out) / `→ 1`, Cursor hide. Drag → `dragPos -= (px - x)*dragSpeed` clamp `[maxDragPos, 0]`, emits `cursor:progress`; release snaps to nearest `origPos`; click on a non-active slide jumps to it. Prev/next buttons, disabled states, index text; nav hover spans `x -101% → 0%` / `→ 101%` (0.5 s expo.out). |
| **ProjectTransition** | `Mesh(PlaneGeometry(), project-transition-plane.* )` uniforms `u_toColor = Color(data-next-bgcolor)`, `u_progress 0`, `u_adjust 1`, `u_velo 0`, depthTest false, renderOrder 0 | full-screen color sweep (curved by `u_velo`) that floods the next project's bg color |
| **ProjectTransitionText** | WebGLText with material replaced by project-color-sweep.vert / -screenspace-fog.frag, `u_fromColor = text color`, `u_toColor = Color(data-next-color)`, `u_progress/u_adjust/u_velo`, `u_resolution`, fog globals; depthTest false, transparent | text recolors with the same sweep |
| **ProjectScrollProgress** | same sweep material on `Mesh(PlaneGeometry())`, `u_fromColor = data-color`, `u_toColor = data-next-color`, `renderOrder 10`, group `scale.x = 0`; `syncDomSize`: `item.scale = (.js-keep-scrolling offsetWidth, 2, 1)` | 2 px progress line under "keep scrolling" |
| **Awards** | `.js-awards .js-award[data-award-model]`; loads `models/awards/<key>.glb` for keys in `["awwwards","css","euro","fwa","lovie","webby"]` or `generic` (once). Each model: child[0] gets clone of awards matcap ShaderMaterial (matcap-model.vert + project-awards-matcap.frag; `uMatcap = lightMode ? dark : light`, `uBaseColor`, `uOpacity 0.3`, fog, transparent, DoubleSide, depthTest false, `LIGHTMODE`), hidden. Group rotation `(-0.1, 0, 0.3)`. `syncDomSize`: each model `scale = min(w/bboxW, h/bboxH)` → `originalScale`. | RAF idx 4: `rotation.x = 0.1*-smoothMouse.y + 0.02*sin(t)`, `rotation.y = 0.15*smoothMouse.x + 0.05*cos(t + 21.263)`, `item.position.y = 5*cos(t)`. Auto-cycle every 2500 ms (after a hover-leave: resume after 1000 ms with 3000 ms interval). show: scale 0.5x→1x, uOpacity 0→0.3, rotation `{y:180°,x:-45°}→{y:360°,x:0}` (1 s expo.out); hide: scale → 0.5x, uOpacity → 0 (0.5 s expo.out). List row hover: `.js-award-inner x → 1.25rem`, `.js-award-arrow span x → 0%` (1 s expo.out); unset `x → 0rem`, arrow `→ 100%`. |

## Project controller (`So`, created in renderer `Mo.onEnter`)
DOM hooks: `.js-current-model, .js-next-model, .js-projects-text, .js-description1, .js-description2, .js-current-title, .js-next-title, .js-next-title-position, .js-footer-next, .js-keep-scrolling, .js-scroll-progress, .js-transition-plane`, `[data-bgcolor]`, `[data-next-bgcolor]`, `[data-next-link]`.

```ts
setup(): scene = Gl.scene; camera = Gl.camera; camera.position.y = 0
  document.body.style.backgroundColor = data-bgcolor; scene.fog.color.set(bg)
  if projectToProjectTransition: prevRenderPass = old Project.renderPass
  renderPass = new RenderPass(scene, camera) "Project"; renderPass.clearColor = World.backgroundColorGl (#050505)
  if (!From.isTransitioningToProject) { resume(); kill tweens of screenFx.u_noiseOnly; u_noiseOnly = 1 }
resume(): composerPasses.add(renderPass, 20); desktop: if !projectToProject add(Gl.fluidPass, 21); Gl.fluidSim.enable()
          Gl.fxaaPass.enabled = false; projectToProject: prevRenderPass off + removed
build() (after AssetLoader + TextLoader): grab _webGLItem of each hook; nextTitlePosition.innerHTML = nextTitle.innerHTML; onResize()
  Gl fog uniforms = scene.fog near/far/color; fluidPass.uOpacity = 0; buildIntro(); addEvents(); renderer.compile(scene, camera)
  if (!From.isTransitioningToProject) introTimeline.play()
onResize(): nextTitlePos = -(nextTitlePosition.rect.y + ASScroll.currentPos - fullHeight/2 + rect.height/2)
```
`buildIntro()`: shift glyphs of projectsText/description1/description2 down by one fontSize (`addToGlyphPositions({minY:-fs, maxY:-fs})`, then snapshot). `introTimeline` (paused, `delay 0.1`, defaults `expo.inOut`, `onStart: buildTransition`):
| at | target | to | dur |
|---|---|---|---|
| 0 | `main` | autoAlpha 1 | 0.5 |
| 0 | Gl.fluidPass uOpacity | 0.03 | 1 |
| "<0.25" | projectsText glyphs minY/maxY | `+= fontSize`, stagger 0.03 | 0.9 |
| "<" | description1 glyphs | same | 0.9 |
| "<" | description2 glyphs | same | 0.9 |
| 0 (≥768 only) | currentTitle | `x: -e, glProps: {"position.x": -e}` (e = title left offset in its parent) | 1.3 |

### Next-project overscroll (the "keep scrolling" footer)
```ts
params = { scrollPos: 0, dragPos: 0, transitionProgress: 0, footerContentTweenProgress: 0, smoothTransitionProgress: 0 }
onScroll(wheel): if transitioning return
  if (ASScroll.currentPos < ASScroll.maxScroll - 10) { scrollPos = dragPos = transitionProgress = 0; return }
  setTransitionTimeout(); scrollPos += deltaY; transitionProgress = scrollPos / (2 * h)
onDrag: if |oy - y| < 2 return; if (currentPos + h < maxScroll + h - 1) { dragPos = transitionProgress = 0; return }
  setTransitionTimeout(); dragPos += py - y; transitionProgress = dragPos / 400
setTransitionTimeout(): kill tweens of params (scrollPos,dragPos,transitionProgress); after 75 ms idle:
  gsap.to(params, {scrollPos: 0, dragPos: 0, transitionProgress: 0, duration: 1, ease: "power2.in"})   // springs back if you stop
onRaf (idx 3): if !transitioning:
  smoothTransitionProgress += 0.2 * (transitionProgress - smoothTransitionProgress)
  transitionTimeline?.progress(smoothTransitionProgress)
  delta = transitionProgress - smoothTransitionProgress; velocity += 0.1 * (delta - velocity); velocity = clamp(velocity, -0.1, 2)
  u_velo of transitionPlane, keepScrolling, footerNext, nextTitle, scrollProgress = velocity
```
`buildTransition()` (paused, defaults `{duration: 1, ease: "sine.out"}`, onStart `buildFooterContentTween`, onUpdate `footerContentTween.progress(params.footerContentTweenProgress)`):
- 0: `u_progress → 0.5` on transitionPlane, keepScrolling, footerNext, nextTitle, scrollProgress + nextModel `uTransitionProgress → 0.5`
- 0: `u_adjust → 0.9` (`power4.out`) on the 5 sweep materials
- 0: `scrollProgress.scale.x → 1`
- 0: `params.footerContentTweenProgress → 0.2`
- onComplete: `transitioning = true`, `projectToProjectTransition = true`, `ASScroll.currentPos = maxScroll`, `Highway.redirect(data-next-link, "projectToProject")`.

`buildFooterContentTween()` (paused, defaults `power4.out, 1`): footerNext glyphs `+= 1.1*fontSize` (0.25); `.js-next-title` `y: e, glProps {"position.y": -e}` with `e = nextTitlePos - (nextTitle.originalPosition.y + maxScroll)`; `.js-next-model` `y: t, glProps {"position.y": -t}` with `t = currentModel.originalPosition.y`.

### projectToProject transition (`Do`, 16815)
out (Project.transitioning): untrack nextModel/nextTitle/transitionPlane from disposal (they survive into the next page). Timeline defaults `{duration: 0.7, ease: "power3.inOut"}`:
- 0: `u_progress → 1` on the 5 sweeps + nextModel `uTransitionProgress → 1`
- 0: `u_adjust → 0` (5) and `u_velo → 0` (5)
- 0: `footerContentTween.progress → 1`
- 0: keepScrolling glyphs `+= 1.1*fontSize`, stagger 0.03
- 0: `scrollProgress.scale.x → 0`
- 0: `Gl.globalUniforms.fogColor` r,g,b → next bg
- 0.3: body `dark` class from `.js-footer[data-next-light-mode] === "1"`
- 0.5: after 500 ms more, if still loading: body bg = next color, fluid overlay 0, hide transition plane, `NakedLoader.show(hex, true, keepScrollingEl)` (loader text placed at the keep-scrolling element).
- onComplete: freeze `updatePosition` on the 3 carried items, remove old view, done.
in: scroll to 0; on `firstObservation` of the new page dispose the carried items; when `projectBuilt`: hide NakedLoader (`hide(true)`) and fluid overlay → 0.03 (gsap default 0.5 s).
Otherwise (not transitioning, e.g. header link to another project): 1.5 s `power4.inOut`: camera z → `2.1 × z`, container scale → 0.4, autoAlpha → 0 (1 s), `PageLoader.show()` at 0.2.

Renderer `Mo`: onEnter: scroll reset, `new Project()`, base onEnter, `GridSlider`s, `currentProjectMenuId = window.currentProjectMenuId`, `projectLightMode = body.dark`; after loader hidden: backing audio (fade 0→1 over 1 s + lowpass 14000→160 over 1 ms) if not playing; `projectBuilt` promise after AssetLoader+TextLoader → `Project.build()`, `ASScroll.on("scroll", Navigation.handleScroll)`. onEnterCompleted: `ASScroll.enable({newScrollElements: page, reset: true})`, remove `html.asscroll-disabled`, scroll to 0. onLeave: unhook nav scroll; unless projectToProject: `u_noiseOnly → 0` (1 s power2.out, delay 2). onLeaveCompleted: `Project.destroy()` (listeners, dispose, remove renderPass + fluidPass unless projectToProject, `fxaaPass.enabled = true`), sliders destroyed.

## GridSlider (`_o`, `.js-grid-slider`)
`.js-grid-slider-text`, `.js-slider-items`, `.js-slider-item` (each also a dom2webgl item, `data-z` → `_glProps {"position.x":0, "position.z": data-z || 0, uniforms: {u_edgeFade: 1}}`). Drag `dragPos -= 1.5*(px - x)` clamp `[maxDragPos, 0]` with `maxDragPos = -itemWrap.scrollWidth - left + w - 50`; RAF idx 4: `smoothDragPos += 0.15*(dragPos - smooth)`, `smoothDragProgress` same; `gsap.set(item, {x: smooth, glProps: {"position.x": smooth}})`; text `translate3d(0,0, -200*progress*4 px)`, `opacity = 1 - 5*progress`; emits `cursor:progress`.

## ScrollAnimations (`Yt`) + effects (attribute driven)
Elements with `animate-from="{…}"` and/or `animate-to="{…}"` (JS object literal bodies evaluated with `Function`). Base vars: `{ease: "none", duration: 1.5, scrollTrigger: {trigger: el, horizontal: false, once: true}}`; `stagger` in either → animate `el.children`. For dom2webgl elements, keys `x,y,z,rotationX/Y/Z` are mirrored into `glProps` (`"%"` values resolved against the element rect; rotations in degrees → radians) and `uniforms` into `glProps.uniforms`. `preset` → gsap effect:
- `fade`: `gsap.from(el, {autoAlpha: 0, duration: 1.5, ease: "expo.out", clearProps: "all"})`
- `fadeUp`: `gsap.from(el, {autoAlpha: 0, y: 30, duration: 1.5, ease: "expo.out", clearProps: "all", force3D: true})`
- `webglTextReveal`: sets `_glProps.uniforms.u_progress = 0` → to `1` (defaults `duration 3.5, ease "power2.out"`), onComplete hides the GL item (DOM text shows through).
- `webglPeelEffect`: `u_enableBend = true` when ≥768; `u_progress 0 → 1.5`, defaults `ease "sine.out"`, `scrollTrigger {scrub: true, once: false, start: "top bottom", end: "bottom 70%"}`.
- `webglParallaxEffect`: `u_innerY -0.2 → 0.1`, `u_innerScale 1.2 → 1`, `ease "none"`, `scrollTrigger {scrub: true, once: false, start: "top bottom", end: "bottom top"}`.
- `mobileWithText`: two TextReveal planes each scrubbed (`scrub 0.5, start "top bottom", end "bottom top"`, ease none) `u_progress 0 → 1 → 0`; the PhoneModel `_glProps {x:0, y:0, rotation.y: 30°, rotation.z: 10°}` scrubbed (`scrub 0.5`, trigger phone, endTrigger last text, `start "center center-=15%"`, `end "center center"`) to `position.x = a.right - r.left`, `position.y = a.top - r.top - r.height/2 + a.height/2`, `rotation.y -390°`, `rotation.z -10°` (duration 1); at 0.4 swaps the screen texture to the second media (direction aware) and plays/pauses videos.
All tweens are created paused with ScrollTrigger disabled, then `enable()` in `onEnterCompleted` (non-scrub triggers already active restart).
