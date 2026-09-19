# Dependencies found in the bundle and what to use in the rebuild

Webpack 5 split: `manifest.js` (runtime), `vendor.js` (1.2 MB), `theme.js` (app, module 3329). Identification by version strings / signatures in `source/raw/vendor.js`.

| library | evidence | version in bundle | how it is used |
|---|---|---|---|
| three.js | module 9477, `const r="143"` (REVISION) | **r143** | everything GL. Plus vendored examples copied into theme.js: GLTFLoader, DRACOLoader, KTX2Loader, FileLoader, CSS3DRenderer (patched to emit `cssrenderer:cacheUpdated`), SkeletonUtils.clone, AfterimagePass/Shader, SavePass; and from vendor: EffectComposer (8606), ShaderPass (7531), RenderPass (4458), SavePass (5184), Pass/FullScreenQuad (8304), CopyShader (1154), FXAAShader (185), MeshSurfaceSampler (441) |
| GSAP | module 5317/990, `version="3.6.0"` | **3.6.0** core + CSSPlugin | all tweens, `gsap.ticker` as master clock, `registerEffect`, `utils.interpolate/clamp` |
| ScrollTrigger | module 7082, `ae.version="3.6.0"` | 3.6.0 | scrubbed WebGL effects on project pages, scrollerProxy on ASScroll |
| SplitText (clone) | theme.js 7622-8027, `zi.version = "3.0.5"` | 3.0.5 API | nav, menu, content toggle, naked loader |
| CustomEase (clone) | theme.js ~13811-14271, `version "3.2.4"` | 3.2.4 | registers `projectMenuToProject` = `M0,0 C0.532,0 0.5,0.5 1,1` (unused afterwards) |
| gsap three plugin | theme.js 4790-4856 `{version:"3.0.0", name:"three"}` | 3.0.0 | registered, not relied on |
| @ashthornton/asscroll | module 4212 (`ASScroll`, `asscroll-container`, `.asscrollbar`) | 2.x (options API "Since 2.0") | smooth scroll on project pages, custom scrollbar |
| @dogstudio/highway | module 1219, `console.log("Highway v2.2.0")` | **2.2.0** | router, renderers, contextual transitions (subclassed with a regex route table) |
| howler | module 1766 (`_html5AudioPool`, `Howler`) | 2.2.x (no version string) | audio sprite, fades, per-sound BiquadFilter via `Howler.ctx` |
| troika-three-text | module 9240 (`aTroikaGlyphBounds`, `webgl-sdf-generator`, `sdfExponent`, exports `Text` as `xv`, `preloadFont` as `C5`) | ~0.46.x (webgl-sdf-generator era, r143 compatible) | all WebGL text |
| @svgdotjs/svg.js | module 5500 (`http://svgjs.com/svgjs`, `SVG()` as `Wj`) | 3.x | SvgButton shapes and masks |
| "E" event lib (tiny delegate-capable emitter: `on/off/emit/delegate/bindAll`; npm "e"-style event lib) | module 1613 | – | global event bus + DOM delegation |
| lodash.debounce | module 1296 | – | resize debounce 150 ms |
| tweakpane (+2 plugins: fpsgraph, image input) | modules 6498 / 6041 / 670, `new e("3.0.5")` | 3.0.5 | `?debug` GUI only |
| core-js polyfills | modules 3948, 1637, 5306 (`version:"3.11.2"`, `"3.3.6"`) | 3.11.2 / 3.3.6 | not needed |
| IntersectionObserver polyfill | module 6337 | – | not needed |
| Draco decoder / Basis transcoder | loaded at runtime from `${assetsUrl}draco/`, `${assetsUrl}basis/` | – | use three's bundled libs |

## Recommended npm packages for the Next.js (App Router, React 19, TS) port
```
three@0.143.0            # pin to r143 for identical shader chunks, GLTF/KTX2 behaviour, color management (outputEncoding Linear)
@types/three@0.143.0
gsap@3.12.x              # ScrollTrigger, SplitText and CustomEase are free/official plugins now (SplitText API changed in 3.13: use `type`, `charsClass` — or port the bundled 3.0.5 clone from theme.js 7622-8027 for byte-identical wrappers)
@studio-freight/lenis or asscroll   # asscroll is unmaintained; to be 1:1 re-implement its lerp (ease 0.075, `limitLerpRate:false`) or use `@ashthornton/asscroll@2` directly
howler@2.2.4 @types/howler
troika-three-text@0.46.4 # last line that supports three r143 cleanly
@svgdotjs/svg.js@3        # or hand-write the button SVG+mask markup (it is static per button)
lodash.debounce
```
Notes:
- If you move to a newer three (r152+), set `THREE.ColorManagement.enabled = false`, `renderer.outputColorSpace = THREE.LinearSRGBColorSpace`, textures `colorSpace = NoColorSpace` to match r143 Linear output; `uv2` attribute becomes `uv1`; EffectComposer/RenderPass paths change to `three/addons/...`.
- Highway has no React equivalent: implement the route/transition table in a client-side "TransitionRouter" (usePathname + a persistent `<Canvas>`-less vanilla three layer mounted in the root layout), keeping all scenes alive in one renderer exactly like the source (HomeContact, ProjectMenu, World are constructed once at boot and toggled via composer passes).
- The `glProps` gsap plugin and `webgl*` effects are small; port from theme.js 5618-6128.
