# Core GL layer: Gl, FBO, FluidSim, BrownianMotion, Reflector, mip generator

Source: `Gl` class `Lt` (5282-5538), `Mt` FBO (4857-5022), `jt` FluidSim (5036-5268), `as` BrownianMotion (10984-11070), `vs` PackedMipMapGenerator (11155-11241), `xs` Reflector (11242-11433), `at` OrderedPassList (4564-4586), `go` FPSChecker (14651-14737).

## Gl

```ts
class Gl {
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, canvas: document.getElementById('gl'),
                                       powerPreference: 'high-performance', stencil: false })
  // setup()
  renderer.setPixelRatio(store.window.dpr <= 2 ? store.window.dpr : 2)
  renderer.setSize(w, fullHeight)
  const Z = 1500
  camera = new THREE.PerspectiveCamera(2 * Math.atan(fullHeight / 2 / Z) * 180 / Math.PI, w / fullHeight, 1, 2200)
  camera.position.set(0, 0, Z)
  scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xffffff, Z, camera.far) // 1500..2200
  scene.fog.origVals = { near: 1500, far: 2200 }
  AssetLoader.ktxLoader.detectSupport(renderer)
  const size = renderer.getDrawingBufferSize(new Vector2())
  const samples = store.isTouch ? 0 : store.window.dpr > 1 ? 1 : 2
  composer = new EffectComposer(renderer, new WebGLRenderTarget(size.width, size.height, { samples }))
  composerPasses = new OrderedPassList(composer.passes) // add(pass, index) keeps passes sorted by index
  clock = new THREE.Clock()
  cssRenderer = new CSS3DRenderer(); cssRenderer.setSize(w, fullHeight)
  // domElement: position absolute; top 0; zIndex 60; pointerEvents none; opacity 0; visibility hidden
  cssScene = new THREE.Scene()
  globalUniforms = {
    u_time: { value: 0 }, u_delta: { value: 0 },
    u_resolution: { value: new Vector2(w * pr, fullHeight * pr) },
    fogNear: { value: 1500 }, fogFar: { value: 2200 }, fogColor: { value: new Color() },
  }
  loadGlobalAssets() // fonts + matcaps + noise (see assets.md)

  addPasses() {
    screenFxPass = new ShaderPass({ uniforms: {
        tDiffuse: null, u_time: 0, u_noiseOnly: 0, u_maxDistort: 0.4, u_bendAmount: -0.15,
        u_vignetteStrength: urlParams.has('novignette') ? 0 : 0.05 },
      vertexShader: 'common-fullscreen-uv.vert', fragmentShader: 'post-screenfx-chromatic-barrel-vignette-grain.frag' })
    fxaaPass = new ShaderPass(FXAAShader) // resolution = 1/(w*pr), 1/(fullHeight*pr) ; NEVER added to composer
    fluidSim = new FluidSim({ fluid: { resolution: 128, force: 20, iterations: 1, mouseRadius: 0.2,
                                       pressure: 0.999, viscosity: 0.999, forceClamp: false } })
    fluidPass = new ShaderPass(new ShaderMaterial({ vertexShader: 'post-fluid-overlay.vert', fragmentShader: 'post-fluid-overlay.frag',
      uniforms: { uFluidTexture: fluidSim.velocitySim.texture, tDiffuse: null, uOpacity: 0.03, uImageDistortion: 0, uRamp: new Vector2(0, 1) } }))
    composerPasses.add(screenFxPass, 101)
  }

  onRaf(time) {           // RAFCollection index 99
    store.clockDelta = clock.getDelta()
    globalUniforms.u_time.value = time
    globalUniforms.u_delta.value = store.clockDelta > 0.016 ? 0.016 : store.clockDelta
    screenFxPass.uniforms.u_time.value = time
    store.mouse.smooth.glNormalized.lerp(store.mouse.glNormalized, 0.05)
    composer.render()
  }

  onResize() {
    camera.fov = 2 * Math.atan(fullHeight / 2 / camera.position.z) * 180 / Math.PI
    camera.aspect = w / fullHeight; camera.updateProjectionMatrix()
    renderer.setSize(w, fullHeight); composer.setSize(w, fullHeight)
    fxaa resolution = 1/(w*pr), 1/(fullHeight*pr); cssRenderer.setSize(w, fullHeight)
    u_resolution = (w*pr, fullHeight*pr)
  }

  onFPSChecked(tier) {
    if (tier < 4) {
      if (renderer.getPixelRatio() === 2) { renderer.setPixelRatio(1.5); composer.setPixelRatio(1.5) }
      else if (renderer.getPixelRatio() === 1.5 && !store.isTouch) {
        composer.reset(new WebGLRenderTarget(w, fullHeight, { samples: 0 }))
        renderer.setPixelRatio(1); composer.setPixelRatio(1)
      }
      composer.setSize(w, fullHeight); fxaa resolution; u_resolution
    }
  }

  generateTexture(src, opts = {}, isKtx = false) {
    tex = src instanceof HTMLImageElement ? new Texture(src) : src instanceof HTMLVideoElement ? new VideoTexture(src) : src
    tex.minFilter = opts.minFilter || (isKtx ? LinearFilter : LinearMipmapLinearFilter)
    tex.magFilter = opts.magFilter || LinearFilter
    tex.wrapS = tex.wrapT = opts.wrapping || ClampToEdgeWrapping
    tex.flipY = opts.flipY === undefined || opts.flipY
    tex.needsUpdate = true; renderer.initTexture(tex); return tex
  }
}
```
Note: `FBO` constructor sets `renderer.autoClear = false` the first time any FBO is made (inside `addPasses`), so the whole app runs with `autoClear=false`; RenderPasses clear themselves (`clear` defaults true on RenderPass), except ProjectMenu render (`clear=false`) and World details (`clear=false, clearDepth=true`).

Screen FX shader math (post-screenfx…frag): 5 spectral taps of `barrelDistortion(vUv, u_bendAmount*u_maxDistort*t)` weighted by `spectrum_offset(t)`; vignette `uv2 = vUv * (1.0 - vUv.yx); vig = pow(uv2.x * uv2.y * 20.0, u_vignetteStrength)`, `screenFx = mix(black, sumcol/sumw, vig)`; grain `hash12(gl_FragCoord.xy + u_time)` * `vec4(vec3(f),0.05)*0.07` added. `u_noiseOnly=1` bypasses distortion/vignette (grain only).

## FBO (GPGPU ping-pong) `Mt`

```ts
new FBO({ fragmentShader, uniforms = {}, width = 32, height = 32, data = false, count, filter = NearestFilter,
          wrap = ClampToEdgeWrapping, type = HalfFloatType, createTexture = true, pingPong = true, autoSwap = true })
// count given -> width = height = sqrt(nearest of [4,16,64,256,1024,2048,4096,8192,16384,32768,65536,131072,262144] >= count)
// render targets: WebGLRenderTarget(width,height,{min/magFilter: filter, wrapS/T: wrap, generateMipmaps:false,
//                 format: RGBAFormat, type, encoding: LinearEncoding, depthBuffer:false, stencilBuffer:false}); b = a.clone()
// uniforms added: uBaseTexture, uTexture, uTime: Gl.globalUniforms.u_time, uDelta: Gl.globalUniforms.u_delta,
//                 uResolution: (width,height), uCellSize: (1/width, 1/height)
// quad: Mesh(PlaneGeometry(2,2), ShaderMaterial{ vertexShader: common-fullscreen-uv.vert, fragmentShader })
// camera: THREE.Camera at z=1 (identity projection)
// baseTexture (createTexture): DataTexture(Float32Array(w*h*4) from data or (0,0,0,1)), RGBAFormat, type, filter, no mips
// fboUv: per-instance uv = ((i % w)/w + 0.5/w, floor(i/w)/h + 0.5/h) as BufferAttribute and InstancedBufferAttribute (itemSize 2)
update(useTexture = true) { if (useTexture) uTexture = pingPong ? read.texture : write.texture; render() }
render() { prev = renderer.getRenderTarget(); setRenderTarget(write); render(scene, camera); setRenderTarget(prev);
           pingPong && autoSwap ? swap() : texture = write.texture }
swap() { [write, read] = [read, write]; texture = read.texture }
```

## FluidSim `jt`

Defaults: `{ resolution: 256, force: 50, iterations: 2, mouseRadius: 0.008, pressure: 0.999, viscosity: 0.999, forceClamp: false }`, `raycastPointer/Camera/Object: null`.
Sims (all `filter: LinearFilter, wrap: RepeatWrapping`, size = resolution²):
- `velocitySim` (fluid-velocity-advect.frag), uniforms `uMouse (-1,-1)`, `uPrevMouse (-1,-1)`, `uMouseVelocity`, `uForce`, `uMouseRadius`, `uPressure`; `createTexture:false`.
- `divergenceSim` (fluid-divergence.frag) `uVelocity`, `uViscosity`; `pingPong:false`.
- `pressureSim` (fluid-pressure-jacobi.frag) `uDivergence`, `uAlpha -1`, `uBeta 0.25`.
- `subtractPressureSim` (fluid-subtract-pressure-gradient.frag) `uPressure`, `uVelocity`.

```ts
onRaf() { // RAF index 2, only while enabled (MOUSEMOVE sets pointerMoved)
  vel.uPrevMouse.copy(prevMouse)
  if (pointerMoved) {
    if (raycastObject) {
      raycaster.setFromCamera(raycastPointer, raycastCamera)
      hit = raycaster.intersectObject(raycastObject)[0]
      if (hit) { if (mousePosTween?.isActive()) { forcePointer = false; mousePosTween.kill() }
                 const {x, y} = hit.uv; if (prevMouse == (-1,-1)) prevMouse.set(x, y)
                 vel.uMouse.set(x, y); vel.uForce.set((x - prevMouse.x) * force, (y - prevMouse.y) * force)
                 forceClamp && uForce.clampScalar(-forceClamp, forceClamp); prevMouse.set(x, y) }
      else { uMouse.set(-1,-1); uForce.set(0,0); prevMouse.set(-1,-1) }
    } else { same using store.mouse.glScreenSpace (x/w, 1-y/h) }
    pointerMoved = false
  } else if (!forcePointer) { uMouse.set(-1,-1); uForce.set(0,0); prevMouse.set(-1,-1) }
  vel.uMouseVelocity.set((uMouse.x - uPrevMouse.x) / 16, (uMouse.y - uPrevMouse.y) / 16)
  velocitySim.update(); divergenceSim.uVelocity = velocitySim.texture; divergenceSim.update()
  pressureSim.uDivergence = divergenceSim.texture; for (i < iterations) pressureSim.update()
  subtract.uPressure = pressureSim.texture; subtract.uVelocity = velocitySim.texture; subtract.update()
  velocitySim.uTexture = subtract.texture; velocitySim.update(false)
}
tweenMousePos(from, to, duration, ease) // gsap.fromTo(uMouse, from, to) with forcePointer=true, sets uForce from delta*force each update
enable()/disable() add/remove RAF + MOUSEMOVE listener
```
Consumers read `fluidSim.velocitySim.texture` (rg = velocity).

## BrownianMotion `as` (camera shake, from three.js "brownian motion" example)
Defaults: `positionFrequency 0.25, rotationFrequency 0.25, positionAmplitude 0.3, rotationAmplitude 0.003, positionScale (1,1,1), rotationScale (1,1,0), positionFractalLevel 3, rotationFractalLevel 3`, `times[6] = -10000*random()`.
`update(dt = 1000/60)`: `times[0..2] += posFreq*dt`, `pos = fbm(times)*positionScale*positionAmplitude*(1/0.75)`; same for rotation (Euler → quaternion); `matrix.compose(pos, rot, scale)`. `fbm(t, levels)`: sum over levels `amp(0.5, halving) * valueNoise(t)`, doubling t. valueNoise: 256 random table, smoothstep interp.
Scenes set: `positionAmplitude 0.026, rotationAmplitude 0.0132, positionFrequency 0.21, rotationFrequency 0.59, positionScale *= 0.1`, update with `0.5 * clockDelta`, then `camera.matrix.multiply(bm.matrix).decompose(...)`.

## Mouse parallax (shared recipe, HomeContact / ProjectMenu / World)
```ts
smoothMouse.lerp(mouse.glNormalized, 0.075); smoothMouse2.lerp(mouse.glNormalized, 0.02)
camera.translateZ(-cameraZOffset * mult)
q.setFromEuler(new Euler(smoothMouse.y * mouseMoveAngleY * mult, -smoothMouse.x * mouseMoveAngleX * mult, 0)); camera.quaternion.multiply(q)
q.setFromEuler(new Euler(0, 0, -0.05 * (smoothMouse.x - smoothMouse2.x) * mult)); camera.quaternion.multiply(q)
camera.translateZ(cameraZOffset * mult)
```
(orbit around a pivot `cameraZOffset` in front of the camera, plus roll from mouse acceleration). Disabled on touch.

## Reflector `xs` + PackedMipMapGenerator `vs`
- RT `WebGLRenderTarget(0.5*w, 0.5*fullHeight, {minFilter: LinearFilter})`, resized on GResize.
- `onBeforeRender`: standard three Reflector math (mirror camera about plane normal (0,0,1) in object space, oblique near-plane clip; `projectionMatrix.elements[10] = clip.z + 1 - 0.003`). Hides itself and `ignoreObjects` (home text mesh, particles), renders `scene` with mirror camera into RT with viewport `(0,0,texW/pr,texH/pr)` + scissor, restores `(0,0,w,fullHeight)`, then `mipmapper.update(rt.texture, rt, renderer)`.
- Packed mip atlas: target size `(floor(1.5*w), h)`; level 0 at left, successive levels stacked in the right third; 9-tap weighted downsample (`home-reflector-mipmap-downsample.frag`), copy via `home-reflector-copy.*` RawShaderMaterial (`depthTest/Write false, blending NoBlending`). Sampling helper `packedTexture2DLOD` lives in the water fragment shader.
- Uniforms injected into the owning material: `uTextureMatrix`, `uTexture` (= RT texture), `uMipmapTextureSize` (= mipmapper.targetSize).
