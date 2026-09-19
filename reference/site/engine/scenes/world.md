# Scene: World (`ns`, theme.js 9432-10982) — route `/world/`

Dark (#050505) infinite 2D grid of media tiles you drag/wheel around. Custom 3D hand cursor (grab / grabbing / pointer GLBs), click a tile to open it (tile flies forward, prev/next pointing hands appear, CSS3D details panel, scanlines tinted with the tile color). Intro: wireframe sphere + SDF words `<BRAND>` / `WORLD` with a glitch post pass. Enter/leave: glitch-circle reveal transition between the World render and the previous scene's saved render.

Data: `window.worldData` (inline script on the world page), 58 items: `{type: "image"|"video", title, author, link, color "#rrggbb", file (jpg/png/ktx2/mp4/m4v), show_caption, caption, image_size [w,h]}`.

## Constructor (9432-9713) constants
```ts
camera = Gl.camera.clone()   // z 1500, pixel fov
scene = new Scene(); backgroundColorGl = new Color(0x050505) (328965); scene.background = it
scene.fog = new Fog(backgroundColorGl, camera.position.z /*1500*/, camera.far /*2200*/)
params = { velocity: 0.005, trailDrag: 0.7, trailVelocity: 0.03 }
sectionWidth = 700; sectionHeight = 700
mousePos = Vector2(w/2, h/2); mouseVelocity = Vector2(); dragVelocity; smoothDragVelocity
dragFriction = isTouch ? 0.94 : 0.96; dragMultiplier = isTouch ? 3 : 1.25
options = { mouseMoveAngleX: 0.135, mouseMoveAngleY: 0.035, cameraZOffset: 100, cameraTranslateZ: 0,
            cameraMovementMultiplier: 0, navHandsSpaceFromCenter: mq.md ? 520 : 320, openItemScale: 1.3 }
setOpenItemScale(): if ((w > h && h/w < 0.5) || (w < h && w/h > 0.5)) openItemScale = 1
scaleScene(): s = clamp(1920 / w, 0.3, 2); camera.scale.set(s, s, 1); camera.originalScale = clone
              if itemOpen: camera.scale.x/y = original + 0.35
flags: firstLoad, allowControl=false, allowSwitch=true, itemOpen=false, introFinished, showGridPlayed, gridReady, hasVisited
```

## load() (10843) — called by the world renderer on enter
- Each `worldData[t]`: image → `.ktx2` ? `loadKtxTexture(file)` : `loadTexture(file)`; video → `<video crossOrigin="" muted loop playsInline src=file>`, waits `loadeddata` then first `timeupdate` (or `error`, or iOS `suspend`) → `new VideoTexture(video)`, `renderer.initTexture`, pause, `currentTime = 0`.
- `models/world/pointer.glb`, `grab.glb`, `grabbing.glb` → `gltf.scene.children[0]` (geometry used).
- `images/world/pointer.png`, `grab.png`, `grabbing.png` → matcap masks for the hands.

## buildIntro() (9746) — at first asset load (all routes)
- `introWrap = .js-world-intro` (moved to `<body>`), its `svg` (drag-globe icon) and `p` ("Drag to explore our world").
- `addSphere()`: `LineSegments(EdgesGeometry(SphereGeometry(1, 50, 28)), LineBasicMaterial({color: 0x3b3b3b}))`, `scale 50`, `position.z = -450`.
- `introTextGroup`:
  - child 0: troika Text `<BRAND>` (6 caps), font Neue Montreal, `fontSize: camera.scale.x === 2 ? 85 : 170`, `letterSpacing -0.03`, anchor center/middle, color white, `textAlign center`, material = ShaderMaterial(world-intro-text-flicker.*, `u_time 0, u_strength 1, u_opacity 0`, `depthTest false`) (6 vertical bands flicker until `u_strength` → 0).
  - child 1: troika Text `WORLD`, font Saol Display (LightItalic), `fontSize: scale.x === 2 ? 91 : 178`, `letterSpacing -0.03`, center/middle, white, `material.opacity 0`, `depthTest false`, `position.y = scale.x === 2 ? 6 : 11`.
  - after both sync: `gap = (2*t0.bbox.max.x - 2*t1.bbox.max.x) / 2`; `brandWordPos = -t0.bbox.max.x + gap`; `worldWordPos = t1.bbox.max.x + gap - 20` (`+7` more when `scale.x === 2`). If `firstLoad`: after loader hidden → `playIntro(0)`.
- `addIntroPost()`:
  - `renderPass` RenderPass(scene, camera) "World" idx 50, `enabled = firstLoad`.
  - `savePass` SavePass(RT w*pr × fullHeight*pr, Linear, no depth) "World Final" idx 56, disabled.
  - `transitionPass` "World Transition" idx 57 (world-transition-glitch-reveal.*): `u_fromScene = savePass RT`, `u_toScene null`, `u_noise gradient-noise`, `u_progress 0`, `u_time 0` (set in introRaf), transparent, disabled.
  - `introPass` "World Intro" idx 55 (common-fullscreen-uv.vert + world-intro-glitch-scanlines.frag): `tDiffuse`, `u_strength 1`, `u_noise gradient-noise`, `u_time = Gl u_time`, transparent, disabled.

## build() (9714) — after World assets load
```
dom: .js-details, .js-details-title-wrap, .js-details-title, .js-details-meta, .js-details-author-wrap, .js-details-author, .js-details-btn, .js-details-caption
camera.rotation.set(0,0,0); detailsScene = new Scene()
mediaMaterial = new WorldTileMaterial(); mediaMaterial.setFog(scene.fog)   // fogColor/near/far from scene.fog
media = worldData (color strings → Color)
addItems(); addDetails(); buildNavHands(); buildCursor()
dragPos = camera.position.clone(); previousDragPos = clone
addPost(); addEvents(); gridReady = true
if (!firstLoad) showGrid(); if (?skipintro) { introFinished = true; showGrid() }
```

### addItems (10006) – wrap-around grid
```ts
items = new Group(); items.position.z = -camera.far   // -2200, animated to 0 by showGrid
itemCount = round(sqrt(2 * media.length))^2; if (itemCount < 25) itemCount = 25    // 58 -> round(10.77)=11 -> 121
cols = sqrt(itemCount)          // 11
loop = 100 + round(itemCount/2) // 161 ; loopCount = (loop, loop)
camera.position.x = 700 * loop; camera.position.y = 700 * loop    // start far from origin so modulo math stays positive
for (r = 0 .. itemCount-1) {
  cell = new Group(); cell.offsetPosition = Vector3()
  tile = new WorldTile(mediaMaterial, {...media[t], index: r}); tile.updateTexture(itemTextures[t])
  tile.position.set(randInt(-125, 125), randInt(-125, 125), randInt(-50, 50)); tile.originalPosition = clone
  cell.add(tile); gridMap.columns[col].push(cell); gridMap.rows[row].push(cell); items.add(cell); clickableItems.push(tile)
  t++ (wrap to 0 at media.length); col++ (wrap at cols); if ((r+1) % cols == 0) row++
}
updatePositions(true)
```
`WorldTile` (Vi): `Mesh(PlaneGeometry(1,1), material.clone())`, `renderOrder 1`, name = title. `updateTexture(tex)`: size = image_size (image) or `videoWidth/Height`; fit into 550×550 (`k = min(550/w, 550/h)`), geometry `PlaneGeometry(w*k, h*k)`; uniforms `u_texture, u_textureSize (w,h), u_meshSize (fit)`; `scale = randFloat(0.6, 0.9)` (x,y); `originalScale`; computeBoundingBox.
`WorldTileMaterial` (Yi): ShaderMaterial(common-fullscreen-uv.vert, world-media-tile.frag) uniforms `fogColor, fogNear, fogFar, u_texture, u_textureSize [1,1], u_meshSize [1,1], u_velocity 0, opacity 1`, `fog:true, transparent, depthTest:false`.

`updatePositions(force)` (10267):
```ts
cx = round(camera.position.x / 700); cy = round(camera.position.y / 700)
if (cx !== loopCount.x || force) { loopCount.x = cx; off = 700 * cx
  for (e in columns) for (cell of columns[abs(e + cx) % columns.length]) cell.position.x = 700 * (e - 2) + off }
if (cy !== loopCount.y || force) { loopCount.y = cy; off = 700 * cy
  for (e in rows)    for (cell of rows[abs(e + cy) % rows.length])       cell.position.y = 700 * (e - 2) + off }
```

### Hands and cursor
- Hand shaders: `world-hand-matcap-mask.vert/.frag` (matcap = Gl `matcap-black.png`, mask = hand png: `final = (1 - mask) + matcap*mask.r`, alpha uAlpha).
- `navHands` Group `position.z = 290` in `detailsScene`; `handMaterial` (uMatcapMap pointer.png, uMatcap matcapBlack, `uAlpha 0`, depthTest false, transparent) shared by `prevHand`/`nextHand` = `WorldNavHand(pointer geometry clone, handMaterial, "prev"|"next", navHandsSpaceFromCenter)`:
  - prev: mesh rotation `(180°, 0, 90°)`, x = -space; next: `(0, 0, -90°)`, x = +space. Below 768 (`!sm`): `y = -525`, `x = ∓100`.
  - `originalPosition` saved, `mesh.scale 20` (`originalScale`), `spinCount 0`, `bbox = Box3.setFromObject(this).expandByScalar(75)` (`originalBbox`), then `position.x = 0` (hands start collapsed at center).
  - `updateBox3(dragPos)`: bbox = originalBbox translated by `(dragPos.x, dragPos.y, 290)`.
  - `updateHoverRotation(rayDir)`: kill rotation tweens; `rotation.x = lerp(rotation.x, 3*dir.y, 0.1)`, `rotation.y = lerp(rotation.y, -2*dir.x, 0.1)`.
  - `onHover` (desktop): mesh scale → original + 10 (1 s expo.out). `reset`: rotation → 0 and scale → original (1 s expo.out).
- `cursor` (desktop only) Group in `scene`, `renderOrder 100`, `originalScale 20`, starts `scale 0`: `grab` (visible), `grabbing` (hidden), `pointer` (hidden) meshes, each ShaderMaterial hand shader with its own png mask, `uAlpha 1`, depthTest false, transparent.
- `details` = CSS3DObject(.js-details) in `Gl.cssScene`; `updateHtmlScale` sets `details.scale = 1.5 / (0.001 * cssRenderer.cache.camera.fov)` (listener defined; `.js-details` panel CSS starts `opacity 0; visibility hidden`).

### addPost (10209)
- `renderDetails` RenderPass(detailsScene, camera) "World Details" idx 54, `clear false`, `clearDepth true`, disabled.
- `edgeWarp` ShaderPass "World Edge Warp" idx 52 (world-edge-warp.vert / -barrel.frag): `u_strength 0`, `u_scale 1`. `edgeWarpParams.strength = 0.6`.
- `scanlines` ShaderPass "World Scanlines" idx 53: `time 0`, `u_strength 0`, `u_color #ffff00` (16776960), disabled.
- `afterImagePass` = AfterimagePass() idx 51 (`damp` default 0.96, overwritten every frame).

## Per-frame
`introRaf` (RAF idx 70, from playIntro until destroy):
```ts
params.velocity *= 0.94
sphere.rotation.y += params.velocity + 0.002 * Math.sign(params.velocity)
camera.position.z = initialCameraZ; camera.lookAt(camera.position); camera.translateZ(options.cameraTranslateZ)
if (updateIntroText) { introTextGroup.position.xy = camera.position.xy; text0.u_time = time }
transitionPass.uniforms.u_time.value = time
```
`onRaf` (RAF idx 80, after build):
```ts
if (allowControl) {
  if (dragging) dragVelocity = dragPos - previousDragPos
  else if (!itemOpen) { dragPos += dragVelocity; dragVelocity *= dragFriction }
}
smoothDragVelocity.x += 0.05 * (|dragVelocity.x| - smoothDragVelocity.x)   // same for y
afterImagePass.uniforms.damp.value = clamp((smoothDragVelocity.x + smoothDragVelocity.y) * params.trailVelocity /*0.03*/, 0, params.trailDrag /*0.7*/)
mouseVelocity *= 0.9
smoothMouse.lerp(glNormalized, 0.075); smoothMouse2.lerp(glNormalized, 0.02)
updateCamera()
sphere.position.xy = camera.position.xy
updatePositions(); updateCursorPosition(); checkVisibility(); updateProximity(); updateRaycaster()
scanlines.uniforms.time.value = time
Gl.cssRenderer.render(Gl.cssScene, camera)
```
`updateCamera`:
```ts
camera.position.x = lerp(camera.position.x, dragPos.x, 0.15); .y likewise
camera.position.z = initialCameraZ; camera.lookAt(camera.position); camera.translateZ(options.cameraTranslateZ)
if (!isTouch) { mouse-parallax recipe: cameraZOffset 100, angles 0.135/0.035, mult = options.cameraMovementMultiplier (0 → 0.5 after grid, 1 when item open) ; updateMatrixWorld }
```
`checkVisibility`: frustum from camera; `visibleItems` = cells whose tile intersects.
`updateProximity` (not itemOpen): for visible cells `offset = cell.pos + tile.pos - camera.pos` (xy); `d = mouse.gl.distanceTo(offset)`; `tile.position.z = lerp(tile.z, tile.originalPosition.z - 0.15 * d, 0.05)` (tiles near the pointer come forward).
`updateCursorPosition`: `cursor.x = lerp(cursor.x, mouse.gl.x * camera.scale.x * 1.1 + dragPos.x, 0.15)` (y same), `rotation = (0.03 * -mouseVelocity.y, 0.02 * mouseVelocity.x, 0.01 * mouseVelocity.x)`.
`updateRaycaster` (allowControl): ray from `glNormalized`. Item open → hovering prev/next via `ray.intersectsBox(hand.bbox)`, `onHover`/`reset`, `updateHoverRotation(ray.direction)` (desktop). Else (touch or pointer up): intersect `clickableItems`; entering a tile: fade previous video volume → 0 (0.2 s) then pause; if new tile is video & paused: `muted=false, volume=0, play()`, volume → 1 (0.2 s); cursor shows `pointer`. Leaving all tiles: same fade/pause, cursor back to `grab`.

## Input
- `onPointerMove`: `mouseVelocity += 0.2 * (mousePos - newPos)`, store pos.
- `onPointerDrag`: ignore if itemOpen or `|ox-x| < 2` or `|oy-y| < 2`; `dragging = true`; `previousDragPos = dragPos`; `dragPos.x += (px - x) * dragMultiplier`; `dragPos.y -= (py - y) * dragMultiplier`; `params.velocity += 1e-4 * (x - px)` (spins intro sphere).
- `onWheel`: not itemOpen → `dragging = true`, `dragPos.x += 1.2 * deltaX`, `dragPos.y -= 1.2 * deltaY`, `params.velocity -= 1e-5 * deltaX`.
- `onPointerDown`: `doClick = target` (cleared after 200 ms); not open: cursor grab→grabbing; kill running open tweens; `draggingTl` (defaults `power2.out, duration 0.75, delay 0.1`): `edgeWarp.u_strength → 0.6`, `u_scale → 1.2`, `camera.scale → original + 0.35`, cursor `z → -100` (duration 1).
- `onPointerUp`: if `doClick` still set → `onClick`; `dragging = false`; cursor grabbing→grab; not open: `draggingTl` (`expo.out, 1`): `u_strength → 0`, `u_scale → 1`, `camera.scale → original`, cursor `z → 0`.
- `onClick(target)` (target inside the ASScroll container, not dragging, allowSwitch): open → hovering prev/next → `switchItem(false|true)`, else `hideItem()`; closed + intersect → `itemOpen = true`, `dragVelocity = 0`, `openItem = tile`, `showItem()`.
- `onKeyUp` (open): ArrowLeft → prev, ArrowRight → next, Escape → hide.
- Links hover (`a, button` delegated): cursor scale → 0 (0.2 s expo.out, overwrite); leave → 20 (`elastic.out(1, 0.3)`, 2 s, overwrite).

## Timelines (exact)
`in()` (9820): enable renderPass, savePass, transitionPass; `transitionPass.u_progress 0 → 1` (2.5 s `power2.inOut`, then save/transition off, resolve); `options.cameraTranslateZ 1000 → 0` (2.5 s `power2.inOut`, same start); `body.classList.add("dark")` at 1.6 s; `playIntro()`.
`out()` (9856): `allowControl = false`; save + transition on; `u_progress 1 → 0` (2.5 s power2.inOut; resolve, passes off 100 ms later); `cameraTranslateZ 0 → 1000` (2.5 s power2.inOut).
`playIntro(delay = 0.5)`: `updateIntroText = true`, intro RAF on, `introPass.enabled = true`; timeline `{delay, defaults: {ease: "expo.inOut", duration: hasVisited ? 1 : 1.5}}`:
| at | target | to | dur / ease |
|---|---|---|---|
| 0 | sphere.scale | 500 | `hasVisited ? 2 : 3`, expo.out |
| `hasVisited ? "<1" : "<"` | text0 u_opacity | 1 | 0.25, expo.out |
| `">0.5"` | text0 u_strength | 0 | 0.2, power2.out |
| `">0.3"` | text0.position.x | brandWordPos | default (1 / 1.5, expo.inOut) |
| `"<"` | text1.position.x | worldWordPos | default |
| `"<"` | text1.material.opacity | 1 | default |
| (first visit only) `"<"` | introWrap | set visibility visible | |
| `"<"` | introSvg | rotateY 90 → 0 | default |
| `"<"` | introText (p) | `{rotateZ: 5, y: "100%"} → {rotateZ: 0, y: "0%"}` | expo.out |
onComplete: `introFinished = true`, `gridReady && showGrid()`, `hasVisited = true`.

`showGrid()` (once): timeline `{delay: hasVisited ? 0 : 1.5, defaults: {ease: "expo.inOut", duration: 1.5}}`:
| at | target | to |
|---|---|---|
| 0 | introPass u_strength | 0 (1 s power2.inOut) |
| 0 | sphere.scale | 700 |
| "<" | text0 u_opacity | 0 |
| "<" | text1 opacity | 0 |
| "<" | introSvg | rotateY 90 |
| "<" | introText | rotateZ 5, y "100%" |
| "<0.5" | introWrap | autoAlpha 0 (0.5 s) |
| 0.4 | items.position.z | 0 (1.5 s power4.out) |
| "<" | options.cameraMovementMultiplier | 0.5 |
| "<" | Gl.cssRenderer.domElement | autoAlpha 1 (0.5 s power2.out) |
| 1 | call | `allowControl = true`; cursor scale → 20 (`elastic.out(1, 0.3)`, 2 s) |
onComplete: `updateIntroText = false`, `introTextGroup.visible = false`, `introPass.enabled = false`.

`showItem()` (10583): dragPos = tile world xy; hands `updateBox3`; `updateDetails()` (caption vs title/author, link button visibility); set details position `(dragPos, 0)`, titleWrap `y = -bbox.max.y * openItemScale - 140`, meta `y = bbox.max.y * openItemScale + 140`; navHands at `(dragPos, -10)`; hide cursor; `scanlines.u_color = tile color`; renderDetails + scanlines on; move tile's cell into `detailsScene`. Timeline defaults `expo.out, 1.5`:
| at | target | to | dur |
|---|---|---|---|
| 0 | tile.position.z | 300 | 2 |
| 0 | tile.scale x,y | openItemScale (1.3 or 1) | 2 |
| 0 | scanlines u_strength | 1 | 1.5 |
| 0 | edgeWarp u_strength | 0.6 | 1.5 |
| 0 | edgeWarp u_scale | 1.2 | 1.5 |
| 0 | camera.scale x,y | original + 0.35 | 2 |
| 0 | options.cameraMovementMultiplier | 1 | 2 |
| 0.2 | navHands.position.z | 290 | 2 |
| 0.2 | prevHand.position.x / nextHand.position.x | originalPosition.x | 1.8 |
| 0.2 | handMaterial uAlpha | 1 (then hands renderOrder 10) | 1.8 |
| 0.5 | details.position.z | 200 | 1.5 expo.out |
| 0.5 | details.element | autoAlpha 1 | 1 |
| 0 | cursor.scale | 0 | 1.5 |

`switchItem(next)`: `allowSwitch = false` for 1000 ms; kill hand position tweens; index ±1 wraps over itemCount; new dragPos/boxes/details; move cells between scenes; hand `spinCount++`; fade out old video (0.4 s) / fade in new (0.4 s). Timeline defaults `expo.out, 0.75`: old tile z → originalPosition.z (1), scale → originalScale (1); new tile z → 300 (1), scale → openItemScale (1); `scanlines.u_color` r,g,b → new color (1); navHands.xy and details.xy → dragPos (0.75); titleWrap/meta y as above (0.75); pressed hand `mesh.rotation.x → deg(next ? 0 : 180) + 360° * spinCount` (0.75).

`hideItem()` (skipped while switchTimeline active): reset spin counts/rotations, show cursor. Timeline defaults `expo.inOut, 1.5`, onComplete (if still closed) renderDetails + scanlines off:
| at | target | to | dur |
|---|---|---|---|
| 0 | tile z / scale | original | 1.1 |
| 0 | camera.rotation | 0,0,0 | 1.5 |
| 0 | cameraMovementMultiplier | 0.5 | 1.5 |
| 0 | scanlines u_strength, edgeWarp u_strength | 0 | 1.5 |
| 0 | edgeWarp u_scale | 1 | 1.5 |
| 0 | camera.scale | original | 1.5 |
| 0 | call | hands renderOrder 0 | |
| 0 | navHands.z | -10 | 1.1 |
| 0 | prevHand.x | `sm ? 0 : original.x + 40` | 1.5 |
| 0 | nextHand.x | `sm ? 0 : original.x - 40` | 1.5 |
| 0 | handMaterial uAlpha | 0 | 1.35 |
| 0 | details.z | 0 | 0.8 |
| 0 | details.element autoAlpha | 0 | 0.65 |
| 0.2 | call | `itemOpen = false` | |
| 1.1 | call | cell back to `items` (unless reopened) | |
| 1 | cursor.scale | 20 | 0.5 |

## Renderer hooks (Co, 15714)
- onEnter: `World.firstLoad = Highway.firstLoad`, eval scripts, `World.load()`, base onEnter, after assets `World.build()`, `WorldButton.hideBtn()`.
- onEnterCompleted: iOS → `sampleVideos()` (play-then-pause each video texture); `Cursor.disable()` (DOM cursor hidden, the 3D hand replaces it); from 404 → `World.in()`; `audio.world-loop` fade 0→1 (1 s) if not playing.
- onLeave: `world-loop` fadeToStop 2 s + lerpSpeed 0.5 over 2000 ms; CSS3D layer and introWrap autoAlpha → 0 (0.5 s power2.out).
- onLeaveCompleted: `World.destroy()` (removes passes 51-54, disposes, resets all flags, rewinds/clears intro & grid timelines, `introPass.u_strength = 1`), WorldButton.showBtn(), Cursor.enable().

Breakpoints: `navHandsSpaceFromCenter` 520 (≥1024) / 320; below 768 hands sit at `y -525`, `x ∓100`; camera scale `clamp(1920/w, 0.3, 2)` (so ≤960 px wide uses the "scale 2" intro font sizes 85/91); drag friction/multiplier touch vs desktop; no 3D cursor and no parallax on touch.
