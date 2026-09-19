# Scene: HomeContact (`ws`, theme.js 11447-12251) — routes `/` and `/contact/`

One scene serves both pages. The camera travels along a spline between the "home" room (progress 1) and the "contact" room (progress 0). Everything is baked: no lights. Units are tiny (whole diorama ≈ 0.5 world units), camera `near 0.001`, `far 2`.

## Load (constructor → `load()`, 12171)
Models (`${assetsUrl}models/home/<file>`, **no** `?v=` suffix), each `gltf.scene.children[0]`:
`homeRoom room-1.glb`, `contactRoom room-2.glb`, `chair chair.glb`, `pillows pillows.glb`, `rocks rocks.glb`, `table table-3.glb`, `land land-group.glb`, `grass grass-simple.glb` (loaded, never used; blades are a PlaneGeometry).
KTX2 textures (`assetUrl("images/home/<name>.ktx2")`, `generateTexture(tex, {}, isKtx=true)` → min/mag Linear, ClampToEdge, flipY true): `homeRoom room-1`, `contactRoom room-2`, `chair chair`, `pillows pillows`, `rock rocks`, `table table`, `pearlMatcap pearl-matcap`, `particle particles`, `skymap skymap-tile`, `aoMap ao`.
Plus `images/home/blade.jpg` (texture), `models/home/objectsData.glb` (empties only, used for transforms and camera paths).

GLB node names (the `*-export` meshes have identity transforms; placement comes from objectsData):
`room-1-export, room-2-export, pillow-export, rock-export, chair-export, table-3-export, land-export, grass-export`.

objectsData.glb empties (exact glTF values):
| node | translation | rotation (quat xyzw) | scale |
|---|---|---|---|
| chair | (-0.034363, 0.018201, 0.157265) | – | – |
| rock | (-0.026526, 0.009862, -0.0734) | – | – |
| room-1 | (-0.124165, 0.042344, -0.045988) | – | – |
| room-2 | (-0.023947, 0.046906, 0.208365) | – | – |
| table-3 | (-0.040546, 0.014155, 0.168434) | – | – |
| sphere | (-0.080474, 0.025038, -0.12132) | – | – |
| wate | (0, 0.007851, 0) | – | – |
| pillow | – | (0, 0.707107, 0, 0.707107) | – |
| land | (-0.427959, -0.03115, -0.19695) | (0.002178, 0.057676, 0.010988, 0.998273) | – |
| ho (home text anchor) | (-0.078319, 0.034024, -0.045864) | (0.692347, 0.143723, -0.143723, 0.692347) | (0.019259, 0.019259, 0.011027) |
| conta (contact html anchor) | (-0.013721, 0.032006, 0.191753) | (0.63074, 0.319635, -0.319635, 0.63074) | (0.019259, 0.019259, 0.011027) |
| cam → children p, p.001, p.002, p.003 | (0.067978, 0.028394, 0.2516), (0.046976, 0.02839, 0.181759), (0.008457, 0.028385, 0.124526), (-0.025776, 0.028385, 0.07518) | | |
| tgt → children p.004, p.005 | (-0.037794, 0.028394, 0.174177), (-0.083081, 0.028385, -0.056805) | | |

`mapObjectsData()` indexes `objectsData.children` by name. `applyObjectTransforms(obj, name)` copies position, rotation (Euler from the quat), scale.

## build() (11542) object graph
```
scene
└─ container (Group)
   ├─ homeRoom     Mesh(room-1)  MeshBasicMaterial{map: room-1.ktx2}        transforms "room-1"  matrixAutoUpdate=false
   ├─ contactRoom  Mesh(room-2)  MeshBasicMaterial{map: room-2.ktx2}        "room-2"
   ├─ chair        MeshBasicMaterial{map: chair.ktx2}                        "chair"
   ├─ pillows      MeshBasicMaterial{map: pillows.ktx2}                      "pillow"
   ├─ rocks        MeshBasicMaterial{map: rocks.ktx2}                        "rock"
   ├─ table        geometry.uv2 = uv; MeshBasicMaterial{map: table.ktx2, envMap: skymap, reflectivity: 1}   "table-3"
   ├─ ballContainer (Group, "sphere" transforms, scale 0.01)
   │   └─ ball Mesh(SphereGeometry(1,20,20), MeshMatcapMaterial{matcap: pearl-matcap.ktx2 (flipY=true)}), position.y = bbox.max.z (=1)
   ├─ world        Mesh(SphereGeometry(1,6,6), MeshBasicMaterial{color:0xffffff, map: skymap, side: BackSide, fog:false})  (rotates)
   ├─ land         ShaderMaterial home-land.vert / home-land-fog.frag   "land"
   ├─ grass        InstancedMesh(blade, RawShaderMaterial home-grass-blade.*, count)  "land" transforms
   ├─ water        Reflector(PlaneGeometry(), ShaderMaterial home-water-reflector.*)
   ├─ homeTextMesh Mesh(PlaneGeometry(), home-hero-text.*)   position = ho.position, rotation.y = -ho.rotation.z
   ├─ contactText  Group  position = conta.position, rotation.y = -conta.rotation.z
   └─ particles    InstancedMesh(PlaneGeometry(0.001,0.001), dust shader, 300)
```
Skymap (`skymap-tile.ktx2`): `mapping = EquirectangularReflectionMapping (303)`, `wrapS = wrapT = RepeatWrapping`, `flipY = true`, `repeat (6, 6)`, `offset (0, 1.254)`, needsUpdate. Used as the sky sphere map and the table envMap.

### Grass (11671)
- Shared uniforms: `u_baseColor #dbaacc (14396108)`, `u_gradientNoiseTexture gradient-noise.jpg`, `fogNear 0.29`, `fogFar 1.09`, `fogColor #e0cfcf (14733263)`, `lightPos (-0.26, -1.06, -0.22)`.
- Land material uniforms: `u_baseColor, u_gradientNoiseTexture, u_time (scene time), fogNear, fogFar, fogColor` (flat pink + fog).
- Count: `md ? 25000 : sm ? 15000 : 5000`.
- Blade geometry: `PlaneGeometry(0.01, 1, 2, 5)`, translated `(0, -0.5, 0)`, rotated `X -PI`; vertices with `x === 0` get `z = 0.005` (center crease).
- Distribution: `MeshSurfaceSampler(new Mesh(land.geometry.clone().toNonIndexed())).build()`; for each i: `sample(pos, normal)`, dummy `position = pos`, `scale (0.07, 0.005, 0.07)`, `rotation.y = randFloat(-0.5, 0.5)`; `setMatrixAt`; `setColorAt(i, Vector3(i, (i % 256)/256, floor(i/256)/256))` (instanceColor encodes id → noise uv).
- RawShaderMaterial uniforms: `u_baseColor, u_time, u_blade = blade.jpg, u_noise = gradient-noise, u_color1 #ffd3e7 (16765927), u_color2 #d493c0 (13931456), u_matcap = project-model-matcap (unused in shader), fogNear, fogFar, fogColor, lightPos`, `side: DoubleSide`.
- Vertex: bends blade tip toward `normalize(position + perturbedNormal) * (0.8 + noise(curlUv*0.08 + u_time*0.007))` with cubic ease on height; fragment: alpha-test `blade.r < 0.35` discard, color mix by world-space noise scrolling `u_time*0.01`, fog.

### Water (11757)
- `Reflector(PlaneGeometry(), material, "water")`; `applyObjectTransforms(water, "wate")`, then `rotation.x = -90°`, `position.set(-0.1193, 0.007851, 0.048929)`, `scale.setScalar(0.5)`, `updateMatrix()` (matrixAutoUpdate=false), `updateCameraScene(camera, scene)`.
- Uniforms: `uNoiseTexture gradient-noise`, `uTime = Gl u_time`, `uColor #e2e5f6 (14870006)`, `uAOTexture ao.ktx2`, `uBaseLod 1`, `uDistortionAmount 0.013` (unused), `uReflectionIntensity 0.24` (unused), `uFluidTexture = fluidSim.velocitySim.texture`, `uResolution = Gl u_resolution`, + injected `uTextureMatrix`, `uTexture`, `uMipmapTextureSize`.
- `ignoreObjects = [homeTextMesh, particles]` (hidden during the reflection render).
- FluidSim for water: `new FluidSim({raycastPointer: mouse.glNormalized, raycastCamera: camera, raycastObject: water})` with **default** fluid params (256², force 50, 2 iterations, radius 0.008, pressure .999, viscosity .999). Mouse UV on the water plane drives ripples; fragment offsets reflection uv by `fluidPos*0.02*ao*edgeReduce` and noise, adds spec + luminance.

### Home hero text (11787)
- `textScene` + `OrthographicCamera(-1,1,1,-1,0.1,2)` at z 1, render target `textRT = (w*pr*0.5, fullHeight*pr*0.5)`.
- troika texts in `homeText` group (color `#353535` 3487029, anchor center/middle):
  1. `"A BRAND, DIGITAL & MOTION STUDIO"` Neue Montreal, `fontSize 0.0014`, `letterSpacing -0.01`, `textAlign center`, `position.y = fontSize/2 + 0.0082`.
  2. `"Creating the"` Saol Display (LightItalic), `fontSize 0.009`, `letterSpacing -0.04`, `position.y = fontSize/2 - 4e-4`.
  3. `"unexpected"` Neue Montreal, `fontSize 0.009`, `letterSpacing -0.02`, `textAlign center`, `position.y = -fontSize/2 + 4e-4`.
  After line 3 syncs: bbox of the group → `homeTextMesh.scale = size * 1.08` (x,y; z = 1); ortho camera frustum set to ±scale/2; render once into `textRT`.
- `homeTextMesh` ShaderMaterial (transparent) uniforms: `uTexture textRT.texture`, `uOpacity 0`, `uFluidTexture = textFluidSim.velocitySim.texture`, `uTextColor1 #ffffff`, `uTextColor2 #eecfff (15650815)`, `uTextColor3 #b5bbff (11910143)`, `uTextColor4 #f4e0ff (16048383)`, `uProgress firstLoad ? 0 : 1`.
- `textFluidSim = new FluidSim({raycastPointer: mouse.glNormalized, raycastCamera: camera, raycastObject: homeTextMesh, fluid: {resolution:128, force:20, iterations:1, mouseRadius:0.2, pressure:0.999, viscosity:0.999, forceClamp:false}})`.
- Fragment: noise-dissolve reveal from top-left while `uProgress < 1`; fluid velocity offsets uv (`*0.025`) and drives a 4-stop iridescent gradient; base `max(vec3(0.13), col*lum)`; alpha = tex.a * uOpacity.

### Dust particles (11905)
- `InstancedMesh(PlaneGeometry(0.001, 0.001), ShaderMaterial, 300)`, `transparent, depthWrite:false`.
- Per instance: position `(randFloat(-0.2, 0.05), 0.09, randFloat(-0.1, 0.3))`; attributes `a_progress = Math.random()`, `a_uv = i % 8` (atlas column).
- Uniforms: `u_baseColor #f4e4ef (16049391)`, `u_time`, `u_particleTex particles.ktx2` (8×2 atlas: sharp row / blurred row, normal in rg, alpha in b), `u_lightPos (0.79, 0.24, 0.63)`.
- Vertex: billboard, `progress = mod(a_progress + (100 + u_time*0.8)*0.002, 0.09)`, falls `y -= p, z -= p, x += 0.8p`. Fragment: blur mix by depth, normal-mapped lighting, fades below `vPos.y` −0.015…−0.02.

### HTML in 3D (12002, CSS3DRenderer)
- `.js-view-projects-btn` → `CSS3DObject`, position = `homeTextMesh.position * 1000`, `y -= 13`, rotation = homeTextMesh.rotation, scale = `1000 * -(ho.position.z - cam.children[3].position.z) / cssRenderer.cache.camera.fov`.
- `.js-contact-content` → CSS3DObject at `contactText.position * 1000`, rotation = contactText.rotation, scale `100 / cssRenderer.cache.camera.fov`.
- Rendered only when `renderCss` (camera position multiplied ×1000 for the CSS render then ×0.001 back). Rescaled on `cssrenderer:cacheUpdated`.
- `new SvgButton` for the view-projects button and each contact `.js-btn`; `store.contentToggle = new ContentToggle()`.
- View-projects hover: `gsap.to(options, {cameraTranslateZ: -0.005, overwrite:true, duration:2, ease:"power2.out"})`; leave `{cameraTranslateZ:0, duration:1, ease:"power2.out"}`; click removes those listeners.

## Camera
```ts
camera = Gl.camera.clone(); camera.near = 0.001; camera.far = 2
onResize: camera.aspect = w/fullHeight; updateProjectionMatrix(); camera.setFocalLength(mq.sm ? 36 : 42)
cameraCurvePath  = new CatmullRomCurve3(objectsData.cam.children.map(c => c.position))   // p, p.001, p.002, p.003
cameraTargetPath = new CatmullRomCurve3(objectsData.tgt.children.map(c => c.position))   // p.004, p.005
tweenParams = { cameraPathProgress: isHome ? 1 : 0, cameraYOffset: 0 }
options = { mouseMoveAngleX: 0.135, mouseMoveAngleY: 0.035, cameraZOffset: 0.1, cameraTranslateZ: 0,
            cameraMotionPosAmplitude: 0.026, cameraMotionRotAmplitude: 0.0132,
            cameraMotionPosFrequency: 0.21, cameraMotionRotFrequency: 0.59 }
brownianMotion: amplitudes/frequencies above, positionScale *= 0.1
devCam (?devcam): position (-0.15, 0.05, 0), lookAt (-0.26, 0.04, -0.1)

updateCameraPosition() {
  p = cameraCurvePath.getPointAt(progress); t = cameraTargetPath.getPointAt(progress)
  camera.position.copy(p); camera.lookAt(t)
  camera.translateZ(options.cameraTranslateZ)
  if (!disableCursor) {
    brownianMotion.update(0.5 * clockDelta); camera.updateMatrix(); camera.matrix.multiply(bm.matrix)
    camera.matrix.decompose(camera.position, camera.quaternion, camera.scale)
    if (!isTouch) mouse-parallax recipe with cameraZOffset 0.1, angles 0.135 / 0.035, mult 1
  }
  camera.position.y += tweenParams.cameraYOffset
  camera.updateMatrixWorld()
}
```

## Per-frame (`onRaf`, RAF idx 100)
```ts
smoothMouse.lerp(mouse.glNormalized, 0.075); smoothMouse2.lerp(mouse.glNormalized, 0.02)
world.rotation.y -= 1e-4
globalUniforms.u_time.value = time      // scene-local u_time (grass, land, particles)
if (renderCss) { camera.position.multiplyScalar(1000); cssRenderer.render(cssScene, camera); camera.position.multiplyScalar(0.001) }
updateCameraPosition()
```
Water, text fluid sims run on their own RAF (idx 2) once `enable()` called.

## Passes (11964)
- `renderPass` RenderPass(scene, camera) "HomeContact" idx 0 (disabled until `enable()`).
- `savePass` SavePass(RT w*pr × fullHeight*pr, {min/mag Linear, depthBuffer:false}) "Home Final" idx 1.
- `transitionPass` ShaderPass (home-transition-wipe.vert/-zoom.frag) "Home Transition" idx 30: `u_fromScene = savePass RT`, `u_toScene null`, `u_noise gradient-noise`, `u_progress 0`, `u_time = scene u_time`. Shader: noisy horizontal band sweeping bottom→top (`intpl = pow(smoothstep(0,1, prog*2 - vUv.y + .5), 20)`), from-scene zooms out, to-scene zooms in.

## State machine
- `firstLoad` (page loaded directly on / or /contact): `enable()` inside build; renderer `Eo.onFirstLoad`: after assets + loader hidden → `showHome()`/`showContact()` jumped to end (`.pause().progress(1)`), `cameraTranslateZ 0.05 → 0` (2 s power4.out), `homeTextMesh.uProgress → 1` (4 s power4.out) and on start `textFluidSim.tweenMousePos({x:0,y:1}, {x:1,y:0}, 4, "power4.out")` (a fake stroke across the text).
- `?homedemo`: path progress → 1 (3 s power4.inOut, delay 5), text opacity → 1 at 6.6, uProgress 4 s delay 6.6, view button autoAlpha delay 7.3.
- `showHome(instant=false)` / `showContact(instant=false)` (DOM + text opacity timelines, see dom-motion.md).
- `enable()`: renderPass on, re-read `body.home`, progress = isHome ? 1 : 0, RAF + fluid sims on.
- `destroy()`: RAF off, renderCss false, passes off, camera reset to origin, `cameraYOffset 0`, `cameraTranslateZ 0`, `renderer.setRenderTarget(null)`, `setScissorTest(false)`, dispose tracked resources, sims off. Called by `Eo.onLeaveCompleted` unless the destination is `/` or `/contact/`.

Breakpoint differences: grass count 25000 / 15000 / 5000 (md / sm / below); focal length 36 (≥768) vs 42; mouse parallax off on touch; CSS3D layer fades per page.
