# Scene: ProjectMenu (`ks`, theme.js 12551-13465) + Butterflies (`Ls`, 12335-12506) — route `/projects/`

A light-grey (#e5e5e5) fogged hall: a row of 5 arches receding in z, a 3-tile floor, 3 additive god-ray planes, 120 butterflies flocking on the GPU, and the project cards (image + canvas caption) laid out in a 1/2-column grid that scrolls vertically with wheel/drag and bends back into the distance.

Data: `window.projects` (inline script on the page). Per project used fields: `project.title` (group.name, filter key), `project.description`, `project.link`, `project.bg_color`, `project.light_mode`, `project.project_grid_category` (array of `branding|digital|motion|experiment`), `project["0internal_or_external"]` (`"0"` = external → `window.open(link, "_blank")`), `images[0].name / .image / .image_size[w,h]`. 36 projects in the capture (6 `experiment`).

## Constructor state
```ts
scene = new Scene(); camera = Gl.camera.clone()
initialCameraPos = 2000; camera.position.z = 2000
camera.fov = 2 * atan(fullHeight / 2 / 2000) * 180 / PI; camera.near = 100; camera.far = 4500; updateProjectionMatrix()
initialCameraPosition = camera.position.clone()
initialColor = new Color('#e5e5e5').getHex()
scene.fog = new Fog(initialColor, 500, camera.far /*4500*/)
Gl.globalUniforms.fogColor.copy(fog.color); fogNear = 500; fogFar = 4500
scene.background = new Color(initialColor)
options = { mouseMoveAngleX: 0.05, mouseMoveAngleY: 0.035, cameraZOffset: 1000,
            cameraMotionPosAmplitude: 0.026, cameraMotionRotAmplitude: 0.0132, cameraMotionPosFrequency: 0.21,
            cameraMotionRotFrequency: 0.59, cameraMovementMultiplier: 1 }
brownianMotion = BrownianMotion(amplitudes/frequencies above, positionScale *= 0.1)
meshSizeMultiplers = { default: 0.21, sm: 0.3, md: 0.28, lg: 0.35 }; meshSize = Vector2(820, 430)
tweenParams = { smoothScrollPos: 0, cameraXOffset: 0, cameraYOffset: 0, cameraZOffset: 0, cameraYRotationOffset: 0, velocity: 0 }
globalUniforms = { u_velocity: 0, uSunDirection: Vector3(), uSunColor: 0xffffff }  // not bound to any shader
originalScreenFx* = current Gl screenFx u_bendAmount / u_maxDistort / u_vignetteStrength
butterflies = new Butterflies()
loadArches(); load()
```

## Assets
- `images/project-menu/arch.ktx2` (loaded, unused), `images/project-menu/sand-rotate.jpg` (wrap Repeat, `repeat 5,5`; loaded, unused), `models/project-menu/arch-dc.glb` (node `arch-9-object`, POSITION+NORMAL, draco), `models/project-menu/floor-dc.glb` (node `floor-object`).
- Canvas arrow image `${themeRoot}/resources/assets/svg-sprite/arrow.svg` (Image, awaited via AssetLoader) → drawn into captions.
- Each project `images[i].image` → `.ktx2` via loadKtxTexture else loadTexture (Gl.generateTexture defaults).
- Butterflies: `models/project-menu/butterfly.glb` (node `butterfly_atlas_2`, attrs POSITION, NORMAL, TEXCOORD_0, TEXCOORD_1 (→`uv2`), COLOR_0 (→`color`), 237 verts), `images/project-menu/butterfly-atlas-diffuse-1.png` (`flipY:false`, anisotropy = max), `images/project-menu/butterfly-atlas-normal-1.png` (same), `images/iri-32.png` (`flipY:false`, stored as `assets.textures.matcap`, not bound: the material uses Gl `matcap-white` and `project-model-matcap`).

## preBuild() (after first asset load, from BaseRenderer.onFirstAssetsLoad)
Order: `buildArches, buildFloor, preBuildPasses, buildGodRays, buildProjects, buildProjectTextCanvas, butterflies.build(), scene.add(butterflies), onResize(), on(GResize)`.

```
scene
├─ archesGroup (z = 0)
│   └─ arches InstancedMesh(arch geo, MeshMatcapMaterial{matcap: project-model-matcap, color: #e5e5e5}, 5)  position.z = 200
│        instance e: scale 300, rotation (0, 90°, 0), position (0, 300, -600*e)   (archLength = 2*300 = 600)
├─ floorGroup (z = 0)
│   └─ floor InstancedMesh(floor geo rotated Y -90°, MeshMatcapMaterial{matcap: project-model-matcap, color: #e5e5e5, transparent, depthWrite:false}, 3)
│        floorLength = (bbox.max.z - bbox.min.z) * 300 * 2 - 70 ; floor.position.z = 0.3 * floorLength
│        instance e: scale 300, rotation (0, 180°*(e%2), 0), position (0, -300, -0.5*floorLength*e)
├─ godraysGroup (z = 0)
│   └─ godrays InstancedMesh(PlaneGeometry(), ShaderMaterial projects-godrays.*, 3) renderOrder 100
│        instance t: position (0, 0, -1500*t), scale (10000, 3000, 1)
│        uniforms uTime = Gl u_time, uNoiseTexture gradient-noise, fogNear 500, fogFar 4500, uDirection (-100,-150),
│                 uStrength 0.25, uLength 0.4, uFadeSmoothness 0.7, uScale 0.26, uSpeed 0.45, uLightColor #ffe5c0 (16770496)
│        transparent, depthTest false, blending AdditiveBlending
├─ projects Group (position.y = smoothScrollPos)
│   └─ per project Group {name,title,description,url,bgColor,lightMode,categories,isExternal,bbox}
│        ├─ [0] image  Mesh(PlaneGeometry(1,1,12,12), card shader) renderOrder = index, frustumCulled=false, mediaType "image"
│        └─ [1] caption Mesh(PlaneGeometry(1,1,12,12), card shader) renderOrder = index+1, frustumCulled=false
│        groups with category "experiment" start visible=false
└─ butterflies (InstancedMesh, 120)
```
`scaleScene()`: `sceneScale = w / 2150`; `arches.scale = floor.scale = (sceneScale, sceneScale * (sm ? 1 : 1.75), 1)`.

Card material (both meshes, ShaderMaterial vert `projects-card-wave-bend-fluid.vert`, frag `projects-card-cover-fog.frag`, `defines {FLUID: !isTouch}`, `depthWrite:false, transparent, side DoubleSide`), uniforms = `{…, ...Gl.globalUniforms}`:
`uTexture` (image: project texture; caption: CanvasTexture), `fogColor = scene.fog.color`, `fogNear 500`, `fogFar 4500`, `u_random = Math.random()+1` (unused), `u_fluidTex = Gl.fluidSim.velocitySim.texture`, `u_imageSize` (image: `images[0].image_size`; caption: set later), `u_meshSize`, `u_innerScale 1`, `u_heightOffset` (image 1, caption 0 then `430/74`), `u_bendPoint (130, 530)` then per breakpoint, `u_opacity 1`.

Vertex (exact constants): `noise = sin((wx - wy*0.1)*0.03 - t*1.1 + cos(wz*0.04)*10.)*50.`, `noise2 = sin((wx + wy*0.1)*0.01 - t*0.4)*0.5`, `ripple = sin((wx - wy)*0.02 - t*2.)*12.` added to z; `z -= 1200*smoothstep(bend.x, bend.y, wy)`; `z -= noise*smoothstep(...)`; `y -= (1.5 - noise2)*smoothstep(bend.x*1.1, bend.y*0.7, wy)*u_heightOffset`; FLUID: screen-space lookup of fluid velocity, `xy += -normalize(fluid).xy*0.01*vec2(1., u_heightOffset)`.

### buildProjectTextCanvas / positionProjects (12866-13101)
One shared canvas `820 × 74` (2D ctx). Every caption mesh gets `new CanvasTexture(canvas)`; `positionProjects` redraws the canvas per project and immediately `renderer.initTexture()` so each texture holds its own snapshot.
```ts
positionProjects() {
  projectsHeight = 0
  const rect = $('.js-project-filters').getBoundingClientRect()
  const sc = DOMScale(camera, {x: rect.x, y: rect.y}, {x: w, y: h})          // (t.x/i.x)*viewport.x ...
  const pos = DOMPosition(camera, {x: sc.x, y: sc.y}, {x: 0, y: rect.bottom}, {x: w, y: h})
  // DOMViewport(cam): hgt = 2*tan(fov/2 rad)*cam.position.z ; {x: hgt*aspect, y: hgt}
  // DOMPosition(cam, t, i, s): {x: t.x/2 - vp.x/2 + (i.x/s.x)*vp.x, y: -t.y/2 + vp.y/2 - (i.y/s.y)*vp.y}
  canvas.width = 820; canvas.height = 74
  const r = meshSize.clone(), bend = new Vector2()
  if (lg)      { r.multiplyScalar(0.35); bend.set(100, 700).multiplyScalar(h / 1100) }
  else if (md) { r.multiplyScalar(0.28); bend.set(100, 700).multiplyScalar(h / 1100) }
  else if (sm) { r.multiplyScalar(0.3);  bend.set(100, 500) }
  else         { r.multiplyScalar(0.21); bend.set(100, 600) }
  let l = lg ? 0.35 : md ? 0.28 : sm ? 0.3 : 0.21
  let c = 1; if (xlg) c = sceneScale + 0.2; else if (lg) c = sceneScale + 0.3
  r.multiplyScalar(c); l *= c
  const rowH = r.y + 24; let u = 0
  for (group of projects.children) { if (!group.visible) continue
    const img = group.children[0], cap = group.children[1]
    ctx.clearRect(0,0,820,74); ctx.fillStyle = '#000000'
    ctx.font = '600 26px "Neue Montreal", sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'
    ctx.fillText(group.name, 0, 0)
    ctx.font = '400 26px "Neue Montreal", sans-serif'; ctx.fillText(group.description, 0, 32)
    ctx.fillStyle = '#000000'; ctx.fillRect(0, 74 - 1.5, 820, 1.5)
    ctx.drawImage(arrowImg, 820 - 16, 74 - 36, 16, 16)
    cap.uTexture.needsUpdate = true; renderer.initTexture(cap.uTexture)
    cap.u_imageSize = cap.u_meshSize = (820, 74); cap.u_heightOffset = 430 / 74
    cap.scale.set(820 * l, 74 * l, 1); cap.u_bendPoint = img.u_bendPoint = bend
    img.scale.set(r.x, r.y, 1); img.u_meshSize = r
    cap.position.x = -0.5*r.x + 0.5*cap.scale.x; cap.position.y = -0.5*r.y - 0.5*cap.scale.y - 6
    const cols = md ? 2 : 1; const gap = (md ? 20 : 10) * c
    let x = (u % cols) * r.x
    let y = md ? floor(u/cols)*rowH - pos.y/2 + 80 : floor(u/cols)*rowH - pos.y/2 + 30
    x += (u % cols) * gap; y += floor(u/cols) * gap
    if (cols > 1) x -= 0.5 * (r.x + gap)
    if (u % cols === 0) projectsHeight += rowH
    group.position.set(x, -y, 1000); u++
  }
  projectsHeight -= md ? rowH - 250*c + 0.1*h : rowH - 250 + 0.1*h
  scrollPos = tweenParams.smoothScrollPos = 0
}
```

## Butterflies (`Ls` extends InstancedMesh; `count = 120`)
- `centralPosition (0, 0, -200)`, `mouse (1e4, 1e4)`.
- Initial positions (4 floats each): `x = rand*2500 - 1250 + cx`, `y = mapLinear(rand*2500 - 1250 + cy, -1250, 2500, -200, 1000)`, `z = 3000*rand - 2000 + cz`, `w = (t % 12 === 0) ? 1 : 2` (w is the "phase"; only `w > 1` birds can respawn at the mouse).
- Initial velocities: `(rand-0.5, rand-0.5, rand-0.5, 1)`.
- `positionSim = FBO({fragmentShader: projects-butterfly-position-sim.frag, data: positions, count: 120, wrap: Repeat, type: FloatType, uniforms: {u_velocity, u_mouse (1e4,1e4,0), u_screenResolution (w, h)}})` → 16×16 texture (count 120 rounds to 256).
- `velocitySim = FBO({fragmentShader: projects-butterfly-velocity-flocking.frag, data: velocities, count 120, wrap Repeat, type FloatType, uniforms: {u_position, u_separationDistance 100, u_alignmentDistance 5, u_cohesionDistance 5, u_mouse (1e4,1e4,0), uCentralPosition}})`.
- Geometry = butterfly glb geometry `scale(16,16,16)`, `rotateY(-90°)`, `aFboUv = positionSim.fboUv.attributeInstanced`, `computeTangents()`, `aScale = randFloat(0.7, 1)` per instance, `aUvOffset = (randInt(0,4), randInt(0,1))` (pair `(7,1)` would become `(0,0)`; unreachable with randInt(0,4)).
- Material ShaderMaterial (`projects-butterfly-instanced.vert/-matcap-normalmap.frag`, transparent, DoubleSide), uniforms `tDiffuse, tNormal, tLightingMatcap = matcap-white, tMatcap = project-model-matcap, tPosition, tVelocity, uNormalMapStrength 1, ...Gl.globalUniforms` (u_time, fog*). Wing atlas uv = `vUv2 + vUvOffset / vec2(8., 2.)`; alpha `smoothstep(50., 100., depth)`; discard alpha < 0.5.
- Mouse: `onMouseMove → mouse.set(x - w/2, y - h/2)`.
```ts
update() {   // called from ProjectMenu.onRaf
  positionSim.u_screenResolution.set(w, h)
  velocitySim.u_mouse.set(0.5 * mouse.x / (w/2), -0.5 * mouse.y / (h/2), 0.1); positionSim.u_mouse.copy(velocitySim.u_mouse)
  mouse.set(1e4, 1e4)             // mouse only counts on frames with a mousemove
  positionSim.u_velocity = velocitySim.texture; velocitySim.u_position = positionSim.texture
  velocitySim.update(); positionSim.update()
  positionSim.u_velocity = velocitySim.texture; velocitySim.u_position = positionSim.texture
  material.tPosition = positionSim.texture; material.tVelocity = velocitySim.texture
}
```
Port note: the source calls `super()` with no args and assigns geometry/material/count later, so `instanceMatrix` is empty; the vertex shader never uses `instanceMatrix`. In the port use `new InstancedMesh(geo, mat, 120)` (identity matrices) or an `InstancedBufferGeometry` with `instanceCount = 120`.

## Passes (preBuildPasses, 13212)
- `renderPass` "Project Menu" idx 10, `clear = false`, disabled until enable().
- `savePass` (`bs` SavePass, RT w*pr × fullHeight*pr, Linear, no depth) "Project Menu Scene Texture" idx 11, disabled.
- `transitionPass` "Project Menu to Project Transition" idx 15 (projects-to-project-wipe.frag): `tDiffuse, u_bgColor Color(), u_progress 0, u_opacity 1`, transparent. Left→right soft wipe (smoothness 0.6) from scene to `u_bgColor`; pixels with alpha < 1 become bg color.

## Camera (onPreSceneRaf, RAF idx 10)
```ts
smoothMouse.lerp(glNormalized, 0.075); smoothMouse2.lerp(glNormalized, 0.02)
camera.position.copy(initialCameraPosition /* (0,0,2000) */); camera.lookAt(0, 0, 0)
if (!isTouch) {
  brownianMotion.update(0.5 * clockDelta); camera.updateMatrix(); camera.matrix.multiply(bm.matrix); decompose
  mouse-parallax recipe with cameraZOffset 1000, angleX 0.05, angleY 0.035, mult = options.cameraMovementMultiplier
}
camera.position.x += tweenParams.cameraXOffset; .y += cameraYOffset; .z += cameraZOffset
camera.rotation.y += tweenParams.cameraYRotationOffset
camera.updateMatrixWorld()
```

## Per-frame (onRaf, RAF idx 11)
```ts
butterflies.update()
// calculateVelocity
scrollDelta = 5e-4 * (scrollPos - smoothScrollPos)
smoothScrollDelta = lerp(scrollDelta, 0, 0.01)
tweenParams.velocity += 0.075 * (smoothScrollDelta - velocity); globalUniforms.u_velocity = velocity
// updateScrollPos
if (allowControl) smoothScrollPos += 0.05 * (scrollPos - smoothScrollPos)
// updateProjectHoverPositions
if (allowControl) for visible groups: group.bbox.setFromObject(group)
updateRaycaster()
projects.position.y = smoothScrollPos
if (smoothScrollPos > projectsHeight - 50 && !ctaVisible) { ctaVisible = true;  gsap.to('.js-project-grid-cta', {autoAlpha: 1, duration: 0.3, ease: 'power2.out'}) }
else if (smoothScrollPos < projectsHeight - 50 && ctaVisible) { ctaVisible = false; gsap.to('.js-project-grid-cta', {autoAlpha: 0, duration: 0.3, ease: 'power2.out'}) }
```
`updateRaycaster` (allowControl): `raycaster.setFromCamera(glNormalized, camera)`; if touch or not pointerDown: intersects = visible groups whose `bbox` the ray intersects; new hover → previous group image `u_innerScale → 1` (0.3 s power2.out); new group image `u_innerScale → 1.1` (0.3 s power2.out), `body.style.cursor = "pointer"`, `Cursor.hideEnter()`; no hit → `u_innerScale → 1`, cursor `auto`, `Cursor.hideLeave()`.

## Interaction
- `onScroll` (window wheel): `scrollPos = clamp(scrollPos + 1 * deltaY, 0, projectsHeight)`.
- `onDrag` (GMouseDrag): `if |py - y| > 3 → dragging = true`; `scrollPos = clamp(scrollPos - 1.5 * -(py - y), 0, projectsHeight)`.
- `onClick` (GMouseUp) when `event.target` has `asscroll-container`: if dragging → `dragging = false`; else if hovered group: store `toProjectTransitionData = {bgColor, lightMode}`, external → `window.open(url, "_blank")`, else `Highway.redirect(url, "toProject")`.
- Filters (`ProjectFilters:change(titles)`): see dom-motion.md §Project filters; GL part: timeline defaults `{duration: 0.5, ease: "power2.out"}`; each currently visible group `position.z → 900` at `0.035*i`, both mesh `u_opacity → 0` (0.3 s) same start; then set visibility from `titles.includes(group.name)`, `positionProjects()`; label `positionsUpdated`; each newly visible group `z: 1100 → 1000` (`immediateRender:false`) at `positionsUpdated + 0.035*i`, opacities → 1; `.then()` → `animatingFilter = false, allowControl = true`.

## Lifecycle
- `build(firstLoad)` (renderer `Po` after assets): `body.classList.remove("dark")`, `ASScroll.containerElement.style.zIndex = 50`, `if firstLoad enable()`, `gsap.to(screenFx.u_vignetteStrength, {value: original})` (gsap defaults 0.5 s power1.out), then `firstLoad ? addEvents() : (addInteractionEvents(), in(), hasAnimatedIn = true)`.
- `enable()`: pre-scene RAF on, `cameraMovementMultiplier = 1`, renderPass on, `Gl.fluidSim.enable()` (desktop).
- `in()`: `inTimeline = gsap.timeline({defaults: {duration: 2, ease: "expo.out"}})` (empty), `allowControl = true`.
- First load: after loader hidden → `in()`, interaction events, backing audio `fade 0→1 (1 s)` + `filterTo lowpass 14000 → 160, duration 1 (ms)`; `.js-project-filters` `autoAlpha: 1, delay: 0.1`. `?experiments` clicks the experiment filter.
- `destroy()`: all listeners off, fluid sim off, container z-index removed, body cursor removed, camera reset, scroll + tweenParams reset, `projects.position.y = 0`, dispose, passes off. Not called when leaving to a project (`isTransitioningToProject`) until the toProject transition decides.

Breakpoints: arch/floor y-stretch 1.75 below 768; card sizes/bends/columns per lg/md/sm/default; `xlg` extra scale `sceneScale + 0.2`, `lg` `sceneScale + 0.3`; parallax off on touch; FLUID define off on touch; filter dropdown on < 768.
