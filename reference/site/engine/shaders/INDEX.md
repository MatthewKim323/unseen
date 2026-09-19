# Shader index

All files are verbatim string literals from `source/pretty/theme.js` (first line of each file records the source line). They are GLSL ES 1.0 / three r143 `ShaderMaterial` style (three prepends its own prefix: `projectionMatrix`, `modelViewMatrix`, `uv`, `position`, `cameraPosition`, `viewMatrix`, `USE_INSTANCING`/`instanceMatrix` etc.) except the two `RawShaderMaterial`s (home-grass-blade.*, home-reflector-copy.*) which declare everything themselves. `#define GLSLIFY 1` lines are harmless leftovers.

Stock three.js shaders used untouched (not extracted): `FXAAShader` (created, never in the chain), `CopyShader` (SavePass), `AfterimageShader` is inlined as post-afterimage.*, troika-three-text's SDF text material (WebGLText and the home/world text meshes unless replaced).

"Gl.*" = `Gl.globalUniforms` shared objects: `u_time` (gsap ticker seconds), `u_delta` (≤0.016), `u_resolution` (w*pr, fullHeight*pr), `fogNear`, `fogFar`, `fogColor`.

## Shared
| file | used by | notes |
|---|---|---|
| common-fullscreen-uv.vert | FBO sim quads, screen FX pass, World intro pass, WorldTileMaterial | `vUv = uv; gl_Position = P*MV*pos`. Identical copies exported as project-transition-plane.vert, world-intro-text-flicker.vert, world-transition-glitch-reveal.vert, home-transition-wipe.vert, projects-to-project-transition.vert |
| matcap-model.vert | ProjectModel, Awards (project pages) | normal + view position, instancing aware |
| gltf-specgloss-onBeforeCompile.glsl | vendored GLTFLoader spec-gloss ext | only onBeforeCompile in bundle; unused by site assets |

## Core / post (Gl)
| file | material / pass | scene | uniforms (initial) | driven by |
|---|---|---|---|---|
| post-screenfx-chromatic-barrel-vignette-grain.frag (+common vert) | ShaderPass `screenFxPass`, composer idx 101 (last) | all | `tDiffuse`, `u_time 0`, `u_noiseOnly 0`, `u_maxDistort 0.4`, `u_bendAmount -0.15`, `u_vignetteStrength 0.05` (`?novignette` → 0) | `u_time = time` each frame; `u_maxDistort` from 5 → 0.4 (1.5 s power2.out) after loader; `u_noiseOnly` 1 on project/404 pages, tweened back to 0 (1 s power2.out, delay 2) on leave, → 1 (1 s) in toProject; ProjectMenu tweens `u_vignetteStrength` back to original on build |
| post-fluid-overlay.vert/.frag | ShaderPass `Gl.fluidPass` idx 21 (project pages, desktop) | project | `uFluidTexture = Gl.fluidSim.velocitySim.texture`, `tDiffuse`, `uOpacity 0.03`, `uImageDistortion 0`, `uRamp (0,1)` | uOpacity 0 at build → 0.03 (1 s expo.inOut) in intro; 0 during project→menu (0.5 s) |
| fluid-velocity-advect.frag | FluidSim velocitySim (FBO, Linear, Repeat) | Gl (128²), home water (256²), home text (128²) | `uTexture`, `uCellSize`, `uForce`, `uMouse (-1,-1)`, `uPrevMouse (-1,-1)`, `uMouseVelocity`, `uMouseRadius` (0.2 / 0.008 / 0.2), `uPressure 0.999` | FluidSim.onRaf (mouse uv, force = delta*force) |
| fluid-divergence.frag | divergenceSim (no ping-pong) | ″ | `uVelocity`, `uCellSize`, `uViscosity 0.999` | per frame |
| fluid-pressure-jacobi.frag | pressureSim | ″ | `uTexture`, `uDivergence`, `uAlpha -1`, `uBeta 0.25`, `uCellSize` | `iterations` × per frame (1 or 2) |
| fluid-subtract-pressure-gradient.frag | subtractPressureSim | ″ | `uPressure`, `uVelocity`, `uCellSize` | per frame, result fed back into velocitySim |

## HomeContact
| file | material | uniforms (initial) | driven by |
|---|---|---|---|
| home-land.vert / home-land-fog.frag | ShaderMaterial on `land` | `u_baseColor #dbaacc`, `u_gradientNoiseTexture gradient-noise`, `u_time` (scene), `fogNear 0.29`, `fogFar 1.09`, `fogColor #e0cfcf` | scene u_time per frame (noise code commented out → flat color + fog) |
| home-grass-blade.vert / .frag | RawShaderMaterial on InstancedMesh (25000/15000/5000), DoubleSide | `u_baseColor`, `u_time`, `u_blade blade.jpg`, `u_noise gradient-noise`, `u_color1 #ffd3e7`, `u_color2 #d493c0`, `u_matcap` (unused), fog as land, `lightPos (-0.26,-1.06,-0.22)` (unused) | scene u_time; `instanceColor.x` = instance id → noise uv |
| home-water-reflector.vert / .frag | Reflector `water` | `uNoiseTexture gradient-noise`, `uTime = Gl u_time`, `uColor #e2e5f6`, `uAOTexture ao.ktx2`, `uBaseLod 1`, `uDistortionAmount 0.013` (unused), `uReflectionIntensity 0.24` (unused), `uFluidTexture` (water FluidSim), `uResolution = Gl`, `uTextureMatrix`, `uTexture` (mirror RT), `uMipmapTextureSize` | Reflector.onBeforeRender each frame; fluid sim |
| home-reflector-mipmap-downsample.vert / .frag | PackedMipMapGenerator mipQuad | `map`, `originalMapSize`, `parentMapSize`, `parentLevel` | per mip level each reflection render |
| home-reflector-copy.vert / .frag | RawShaderMaterial copyQuad (depthTest/Write false, NoBlending) | `uTexture` | per reflection render |
| home-hero-text.vert / home-hero-text-fluid-iridescent.frag | `homeTextMesh`, transparent | `uTexture textRT`, `uOpacity 0`, `uFluidTexture` (text FluidSim), `uTextColor1 #ffffff`, `uTextColor2 #eecfff`, `uTextColor3 #b5bbff`, `uTextColor4 #f4e0ff`, `uProgress firstLoad ? 0 : 1` | `uOpacity` via showHome/showContact; `uProgress 0→1` (4 s power4.out) on first load |
| home-dust-particles-billboard.vert / home-dust-particles-normalmap.frag | InstancedMesh 300, transparent, depthWrite false | `u_baseColor #f4e4ef`, `u_time` (scene), `u_particleTex particles.ktx2`, `u_lightPos (0.79,0.24,0.63)`; attrs `a_progress`, `a_uv` | scene u_time |
| home-transition-wipe.vert / home-transition-wipe-zoom.frag | ShaderPass "Home Transition" idx 30 | `u_fromScene = Home savePass RT`, `u_toScene null`, `u_noise gradient-noise`, `u_progress 0`, `u_time` (scene) | route transitions (toHome/toContact/toProjectMenu), 3 s |

## ProjectMenu
| file | material | uniforms | driven by |
|---|---|---|---|
| projects-card-wave-bend-fluid.vert / projects-card-cover-fog.frag | card image + caption meshes, DoubleSide, transparent, depthWrite false, `defines FLUID: !isTouch` | `uTexture`, `fogColor/near/far` (#e5e5e5, 500, 4500), `u_random`, `u_fluidTex = Gl.fluidSim`, `u_imageSize`, `u_meshSize`, `u_innerScale 1`, `u_heightOffset` (1 image / 430/74 caption), `u_bendPoint (130,530)`→per breakpoint, `u_opacity 1`, + Gl globals (`u_time`…) | hover `u_innerScale 1↔1.1` (0.3 s power2.out); filter `u_opacity` fades |
| projects-godrays.vert / projects-godrays-noise.frag | InstancedMesh 3, additive, depthTest false | `uTime = Gl`, `uNoiseTexture`, `fogNear 500`, `fogFar 4500`, `uDirection (-100,-150)`, `uStrength 0.25`, `uLength 0.4`, `uFadeSmoothness 0.7`, `uScale 0.26`, `uSpeed 0.45`, `uLightColor #ffe5c0` | time |
| projects-butterfly-position-sim.frag | FBO 16×16 FloatType | `uBaseTexture`, `uTexture`, `u_velocity`, `u_time`, `uDelta = Gl u_delta`, `uResolution`, `u_screenResolution (w,h)`, `u_mouse (1e4,1e4,0)` | Butterflies.update |
| projects-butterfly-velocity-flocking.frag | FBO 16×16 FloatType | `u_position`, `u_separationDistance 100`, `u_alignmentDistance 5`, `u_cohesionDistance 5`, `u_mouse`, `uCentralPosition (0,0,-200)`, `uResolution` | Butterflies.update |
| projects-butterfly-instanced.vert / projects-butterfly-matcap-normalmap.frag | butterflies (120), DoubleSide, transparent | `tDiffuse`, `tNormal`, `tLightingMatcap matcap-white`, `tMatcap project-model-matcap`, `tPosition`, `tVelocity`, `uNormalMapStrength 1`, + Gl globals; attrs `aFboUv`, `aScale`, `aUvOffset`, `uv2`, `color`, `tangent` | textures swapped each frame |
| projects-to-project-transition.vert / projects-to-project-wipe.frag | ShaderPass idx 15 | `tDiffuse`, `u_bgColor`, `u_progress 0`, `u_opacity 1` | toProject (0→1, 1.7 s) / toProjectMenu from project (1→0, 1.7 s) |

## World
| file | material | uniforms | driven by |
|---|---|---|---|
| world-media-tile.frag (+common vert) | WorldTileMaterial (cloned per tile), transparent, depthTest false, fog | `fogColor/near/far` (#050505, 1500, 2200), `u_texture`, `u_textureSize`, `u_meshSize`, `u_velocity 0`, `opacity 1` | static |
| world-hand-matcap-mask.vert / .frag | hands + cursor (grab/grabbing/pointer), transparent, depthTest false | `uMatcapMap` (hand png), `uMatcap matcap-black`, `uAlpha` (nav hands 0, cursor 1) | hands `uAlpha 0↔1` in show/hide |
| world-intro-text-flicker.vert / .frag | troika `<BRAND>` word | `u_time 0`, `u_strength 1`, `u_opacity 0` | introRaf `u_time`; playIntro `u_opacity → 1`, `u_strength → 0` |
| world-intro-glitch-scanlines.frag (+common vert) | ShaderPass "World Intro" idx 55 | `tDiffuse`, `u_strength 1`, `u_noise gradient-noise`, `u_time = Gl` | showGrid `u_strength → 0` (1 s power2.inOut) |
| world-transition-glitch-reveal.vert / .frag | ShaderPass "World Transition" idx 57 | `u_fromScene = World savePass RT`, `u_toScene null`, `u_noise`, `u_progress 0`, `u_time` | in 0→1 / out 1→0 (2.5 s power2.inOut); `u_toScene` = HomeContact or ProjectMenu save RT |
| world-edge-warp.vert / world-edge-warp-barrel.frag | ShaderPass idx 52 | `tDiffuse`, `u_strength 0`, `u_scale 1` | drag/open: `u_strength → 0.6`, `u_scale → 1.2` |
| world-scanlines.vert / world-scanlines-tint.frag | ShaderPass idx 53 | `tDiffuse`, `time 0`, `u_strength 0`, `u_color #ffff00` | `time` per frame; open: `u_strength → 1`, `u_color` = tile color |
| post-afterimage.vert / .frag | AfterimagePass idx 51 | `damp 0.96`, `tOld`, `tNew` | `damp = clamp((|vx|+|vy|)_smooth * 0.03, 0, 0.7)` per frame |

## Project detail (Dom2Webgl)
| file | material | uniforms | driven by |
|---|---|---|---|
| dom-image-peel-bend.vert / dom-image-edge-rgbshift-fog.frag | WebGLImage (`di` cloned), transparent; geometry PlaneGeometry(1,1,4,20) | `u_texture`, `u_texture2`, `u_opacity 1`, `u_innerScale 1`, `u_innerY 0`, `u_innerX 0`, `u_screenCenterTexture 0`, `u_edgeFade 1`, `u_progress 0`, `u_enableBend false`, `u_time 0`, `u_size [1,1]`, `u_resolution = Gl`, fog = Gl | glProps (peel `u_progress 0→1.5` scrub; parallax `u_innerY -0.2→0.1`, `u_innerScale 1.2→1`), `u_time`/`u_scrollPos` each frame |
| project-text-reveal-noise-mask.vert / .frag | TextReveal (`ti` cloned), transparent, depthTest false | `u_bgColor` (project bg), `u_progress 0`, `u_scrollPos 0`, `u_ratio 1` | webglTextReveal / mobileWithText glProps; scroll |
| project-model-matcap-transition.frag (+matcap-model.vert) | ProjectModel, transparent, DoubleSide, depthTest false; defines LIGHTMODE / TRANSITION / TO_LIGHTMODE | `uMatcapLight`, `uMatcapDark`, `uBaseColor` (bg), `uNextBaseColor`, `uTransitionProgress 0`, fog = Gl | next-project transition 0 → 0.5 (scroll) → 1 |
| project-awards-matcap.frag (+matcap-model.vert) | Awards models, transparent, DoubleSide, depthTest false | `uMatcap`, `uBaseColor`, `uOpacity 0.3`, fog = Gl | show/hide tweens |
| project-slider-image.vert / project-slider-image-cover-edge-rgbshift.frag | Slider planes | `u_texture`, `u_imageSize`, `u_meshSize`, `u_resolution = Gl`, `u_innerScale 1` | per frame `u_meshSize.x`; hover `u_innerScale 1.05` |
| project-transition-plane.vert / project-transition-plane-color-sweep.frag | ProjectTransition plane, depthTest false | `u_toColor` (next bg), `u_progress 0`, `u_adjust 1`, `u_velo 0` | overscroll timeline + projectToProject |
| project-color-sweep.vert / project-color-sweep-screenspace-fog.frag | ProjectTransitionText + ProjectScrollProgress, transparent, depthTest false | `u_fromColor`, `u_toColor`, `u_progress 0`, `u_adjust 1`, `u_velo 0`, `u_resolution = Gl`, fog = Gl | same |
