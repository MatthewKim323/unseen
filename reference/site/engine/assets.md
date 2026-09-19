# Assets loaded by the bundle

`${assetsUrl}` = `window.globalData.assetsUrl` (theme `resources/assets/`). `assetUrl(p)` (`ft`, 4787) = `${assetsUrl}${p}?v=1786625394974`. Loader: `AssetLoader` (every promise contributes to the intro progress %). Local copies (captured) live in `reference/site/assets/…` under hashed names; mapping below. "not captured" = the rebuild must source/recreate it.

Texture defaults via `Gl.generateTexture(tex, opts, isKtx)`: `minFilter = opts.minFilter || (isKtx ? LinearFilter : LinearMipmapLinearFilter)`, `magFilter = opts.magFilter || LinearFilter`, `wrapS = wrapT = opts.wrapping || ClampToEdgeWrapping`, `flipY = opts.flipY ?? true`, `renderer.initTexture()` right away. No `colorSpace`/`encoding` is set anywhere (three r143 default `LinearEncoding`; renderer `outputEncoding` left at default Linear) → port with `NoColorSpace`/`LinearSRGBColorSpace` on textures and `renderer.outputColorSpace = LinearSRGBColorSpace` to match the look.

Decoders: DRACO `${assetsUrl}draco/` (`draco_wasm_wrapper.js` + `draco_decoder.wasm`, or `draco_decoder.js` without WebAssembly), 4 workers. KTX2/Basis transcoder `${assetsUrl}basis/` (`basis_transcoder.js` + `.wasm`); `ktx2Loader.detectSupport(renderer)`. Not captured → use three's `examples/jsm/libs/draco/gltf/` and `libs/basis/`.

## Global (Gl.loadGlobalAssets, 5382) — every page
| path | local | usage / settings |
|---|---|---|
| `fonts/NeueMontreal-Regular.woff` | assets/fonts/font-359c5ab9d4.woff | troika SDF font "Neue Montreal", sdfGlyphSize 128, preloaded chars `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789’()&-,` |
| `fonts/SaolDisplay-LightItalic.woff` | assets/fonts/font-500074fd37.woff | troika "Saol Display", chars same minus `,` |
| `images/matcap-white.png` | assets/images/img-92dc40d587.png | `Gl.assets.textures.matcap` → butterflies `tLightingMatcap` |
| `images/matcap-black.png` | assets/images/img-d2a2032436.png | `matcapBlack` → World hands + cursor `uMatcap` |
| `images/project-model-matcap.png` | assets/images/img-47f40171c3.png | `projectModelMatcap` → ProjectMenu arches/floor, butterflies `tMatcap`, ProjectModel light, PhoneModel, Awards, grass `u_matcap` (unused) |
| `images/project-model-matcap-dark.png` | assets/images/img-5e062fa310.png | `projectModelMatcapDark` → light-mode project models |
| `images/noise-small.png` | assets/images/img-4cdd0993c0.png | `noiseSmall`, wrapping Repeat (loaded, not bound in shipped code) |
| `images/gradient-noise.jpg` | assets/images/img-9f33ed6e22.jpg | `gradientNoise`, wrapping Repeat → home land/grass/water/transition, godrays, World intro + transition passes |
| audio sprite `audio/audio.webm`, `audio/audio.mp3` (Howl src order) | assets/videos/vid-7ff678f7e8.webm (mp3 not captured) | see Audio below |
| CSS webfonts `NeueMontreal-Regular.woff2/.woff`, `SaolDisplay-Light.woff2/.woff`, `SaolDisplay-LightItalic.woff2/.woff` | assets/fonts/font-ea8dbf28ff.woff2, font-959854959d.woff2, font-4e7609cb6b.woff2 | inline @font-face; AssetLoader waits `document.fonts.ready` |

## HomeContact (`ws.load`, 12171)
Models `${assetsUrl}models/home/<file>` (no `?v`), draco, node = `scene.children[0]`:
| file | local | node | use |
|---|---|---|---|
| room-1.glb | data-76fd49c18b.glb | room-1-export (POSITION, NORMAL, TEXCOORD_0) | home room, MeshBasic map room-1.ktx2 |
| room-2.glb | data-b56cc0af4d.glb | room-2-export | contact room, map room-2.ktx2 |
| chair.glb | data-cda1f94fd2.glb | chair-export | map chair.ktx2 |
| pillows.glb | data-065345fa2a.glb | pillow-export | map pillows.ktx2 |
| rocks.glb | data-f56af80870.glb | rock-export | map rocks.ktx2 |
| table-3.glb | data-7041463470.glb | table-3-export | map table.ktx2 + envMap skymap, `uv2 = uv` |
| land-group.glb | data-53a74c238a.glb | land-export (POSITION only) | land shader + grass sampler source |
| grass-simple.glb | data-d613785fad.glb | grass-export | loaded, unused |
| `models/home/objectsData.glb` (via assetUrl) | data-eadd34a126.glb | empties (see scenes/home-contact.md) | transforms, camera paths |
KTX2 `images/home/<name>.ktx2` (assetUrl; `generateTexture(tex, {}, true)` → Linear/Linear, ClampToEdge, flipY true) — **none captured**:
`room-1`, `room-2`, `chair`, `pillows`, `rocks`, `table`, `pearl-matcap` (ball matcap, flipY forced true), `particles` (dust atlas 8×2, normal rg + alpha b), `skymap-tile` (mapping EquirectangularReflectionMapping, wrap Repeat both, flipY true, repeat 6×6, offset (0, 1.254)), `ao` (water AO mask).
`images/home/blade.jpg` → assets/images/img-98b51bd6cf.jpg — grass blade alpha (r < 0.35 discarded), defaults (mipmapped, clamp).

## ProjectMenu (`ks.loadArches/load`, `Ls.load`)
| path | local | use / settings |
|---|---|---|
| models/project-menu/arch-dc.glb | data-d335e5208d.glb | node arch-9-object (POSITION, NORMAL), InstancedMesh ×5, MeshMatcap |
| models/project-menu/floor-dc.glb | data-9bae41dee9.glb | node floor-object, InstancedMesh ×3, MeshMatcap transparent |
| images/project-menu/arch.ktx2 | not captured | loaded, unused |
| images/project-menu/sand-rotate.jpg | assets/images/img-38a0cd8dec.jpg | wrapping Repeat, `repeat.set(5,5)`; loaded, unused |
| models/project-menu/butterfly.glb | data-0e852e61ba.glb | node butterfly_atlas_2 (POSITION, NORMAL, TEXCOORD_0, TEXCOORD_1, COLOR_0; not draco) |
| images/project-menu/butterfly-atlas-diffuse-1.png | assets/images/img-0030a2cf47.png | `flipY:false`, `anisotropy = renderer.capabilities.getMaxAnisotropy()` → `tDiffuse` |
| images/project-menu/butterfly-atlas-normal-1.png | assets/images/img-4f9c820f7e.png | same → `tNormal` |
| images/iri-32.png | assets/images/img-21712a0d36.png | `flipY:false`; loaded, not bound |
| `${themeRoot}/resources/assets/svg-sprite/arrow.svg` (absolute theme path, `new Image()`) | assets/images/img-d6b138251b.svg | drawn 16×16 into caption canvas |
| `window.projects[i].images[j].image` (uploads; `.ktx2` → KTX2 loader else TextureLoader) | assets/images/* (36 covers captured, see ../assets/manifest.json) | card image `uTexture`, default filters |

## World (`ns.load`, 10843) — none of the hand assets were captured
| path | use |
|---|---|
| models/world/pointer.glb, grab.glb, grabbing.glb | `scene.children[0].geometry` for 3D cursor + nav hands |
| images/world/pointer.png, grab.png, grabbing.png | hand matcap masks (`uMatcapMap`), default settings |
| `window.worldData[i].file` | 43 images (jpg/png/ktx2 → texture) + 15 videos (mp4/m4v → `<video crossOrigin="" muted loop playsInline>` → VideoTexture). Files live on the uploads CDN; not captured |

## Project pages (Dom2Webgl)
| path | use |
|---|---|
| `models/phone.glb` (assetUrl) | PhoneModel; nodes `Body` (matcap) and `Screen` (media texture). not captured |
| `models/awards/{awwwards,css,euro,fwa,lovie,webby,generic}.glb` | Awards models (child[0] mesh). not captured |
| `[dom2webgl="c:ProjectModel"][data-src]` | per-project GLB (SkeletonUtils clone) |
| page `<img>`/`<video>` with `dom2webgl` | WebGLImage textures (Image with crossOrigin "" / VideoTexture); iOS: minFilter Linear, no mips |
| all page `img:not([lazy="full"])` and `video` | awaited by AssetLoader (videos: muted play until first timeupdate, then paused if `dom2webgl`, currentTime 0) |

## Audio (`po`, 14355)
One Howl: `src: [assetUrl("audio/audio.webm"), assetUrl("audio/audio.mp3")]`, `html5 = (macOS 10_15 && Safari && Version 15)`, sprite (ms: [offset, duration, loop]):
| key | offset | duration | loop |
|---|---|---|---|
| backing | 0 | 30747.16553287982 | true |
| click | 31200 | 500 | |
| contact_swoosh | 32400 | 4500 | |
| hover | 37600 | 500 | |
| menu_close | 38800.00000000001 | 1000 | |
| menu_swoosh | 40000.00000000001 | 1071.020408163264 | |
| navlinks_hover | 42200 | 1567.3469387755076 | |
| new_water_projects | 44400 | 2500 | |
| ratchet | 47600 | 61.609977324259546 | |
| world_static | 48800 | 5294.8526077097495 | |
| world-intro | 54999.99999999999 | 12800.000000000004 | (never played) |
| world-loop | 68200 | 12799.999999999996 | true |
Keys are addressed as `"audio.<key>"`.

## Misc
- `favicon`: tab hidden → `${themeRoot}/resources/assets/images/eyes-<sizes>.png?=<rand>`; visible → `${publicUrl}favicon/favicon-<sizes>.png?=<rand>`.
- `svgsprite.svg` (`${publicUrl}images/svgsprite.svg#arrow|close|globe|drag-globe|chevron-down`) → assets/images/img-687f48138f.svg.
- `ktxPreview` debug route reads `?ktx=` / `window.ktxUrl` / `window.ktxSize`.
