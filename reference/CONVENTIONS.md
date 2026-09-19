# Nocturne: builder contract

Read fully before writing code. This is a 1:1 port of a custom WebGL site (vanilla JS SPA + three.js r143 + GSAP) into Next.js 16 App Router + React 19 + TypeScript. The engine is imperative; React only renders markup and boots the engine once.

## Rule zero: origin blackout
The rebuild is Nocturne's own site. Never write the source site's name, hostname, url, or its original upload file names anywhere outside `reference/` (code, comments, file names, class names, alt text, metadata, your reply). Brand copy says "Nocturne" / "NOCTURNE STUDIO®". The logo wordmark is a placeholder. Run `~/.claude/skills/1to1/bin/1to1 blackout /Volumes/Vault/vaultdev/design/unseen` before reporting done; it must be CLEAN for your files. No em dashes anywhere.

## Ground truth (read, never guess)
- `reference/site/source/pretty/theme.js`: the original engine, beautified. Line ranges per class in `reference/site/engine/ARCH.md` §1. **Port from this code.** Keep every constant, ease, duration, delay, uniform, lerp factor exactly. Do not "improve", simplify, or substitute R3F/drei.
- `reference/site/engine/`: ARCH.md, scenes/*.md, shaders/*.glsl + shaders/INDEX.md, dom-motion.md, assets.md, deps.md.
- `reference/site/css/`: TOKENS.md, COMPONENTS.md, markup/*.html (shell + each route body, already brand-scrubbed), sprite/*.svg.
- `reference/site/runtime/`: live captures after entering the site: shots/<route>/<vp>/NN.png, frames/, dom/<route>-<vp>.html, boxes/, net/ (every asset + data payload), README.md.
- Global CSS is `app/globals.css` = the site's own stylesheet verbatim + loader critical CSS + fonts. Do not restyle; render the original class names. If a rule is missing, add it to a scoped file `app/styles/<area>.css` imported from `app/layout.tsx` (tell the orchestrator), never edit globals.css.

## Stack (pinned)
three `0.143.0` (same as source: shader chunks, color management and GLTF behaviour match), gsap 3 (use `gsap`, `gsap/ScrollTrigger`, `gsap/CustomEase`, `gsap/SplitText`; all free), `troika-three-text` (pick a version compatible with three 0.143), `howler`, `@ashthornton/asscroll`, `@svgdotjs/svg.js`. Loaders/passes from `three/examples/jsm/...` of 0.143 (GLTFLoader, DRACOLoader, KTX2Loader, EffectComposer, RenderPass, ShaderPass, SavePass, CopyShader, CSS3DRenderer...). Install with `bun add <pkg>` from the project root; tell the orchestrator what you added. Do not remove packages.

## Layout
```
lib/engine/
  core/        store.ts (the `store` singleton, same field names as source `o`), event-bus.ts, global-events.ts, raf.ts (RAFCollection),
               asset-loader.ts, asset-url.ts, gl.ts (renderer/camera/composer/screen FX/global fluid), ordered-passes.ts, fbo.ts,
               fluid-sim.ts, css3d.ts, three-plugin.ts, gl-props.ts, brownian.ts, fps-checker.ts, task-scheduler.ts, audio.ts,
               component-manager.ts, observer.ts, full-screen-quad.ts, dispose.ts
  shaders/     *.glsl.ts (export const x = /* glsl */`...`), copied verbatim from reference/site/engine/shaders
  dom2webgl/   manager + items (WebGLItem, WebGLText, TextReveal, WebGLImage, ProjectModel, PhoneModel, Slider, ProjectTransition*, Awards), effects registry, scroll-animations
  scenes/home-contact/  scenes/project-menu/  scenes/world/  scenes/project/
  dom/         page-loader, naked-loader, navigation, menu, world-button, mute-button, cursor, svg-button, video-player, content-toggle, project-filters, grid-slider, favicon
  router/      router.ts (Next integration), renderers/*.ts, transitions/*.ts, routes.ts (contextual table)
  boot.ts      App bootstrap (source `Wo.init` + BaseRenderer.onFirstLoad)
components/    Shell.tsx (loader, header, menu, footer, cursor, #gl wrapper, asscrollbar), EngineRoot.tsx ('use client', boots once), Sprite.tsx
app/           layout.tsx, page.tsx (home), contact/, projects/, projects/[slug]/, world/, not-found.tsx
lib/data/      projects.json, world.json, project detail content (media paths already rewritten to /media/...)
public/theme/  theme assets, same relative paths as source `assetsUrl` (models/, images/, audio/, draco/, basis/, fonts/)
public/media/  uploaded media, content-addressed; map original->local in reference/site/media-map.json (reference only)
```
Asset urls: `assetUrl(path) => \`/theme/${path}\`` (drop the source's `?v=` cache buster). Media: look up `reference/site/media-map.json` when writing data files; never put original upload paths in the app.

## Engine conventions
- Class per source class, named descriptively (ARCH.md §1 names: `Gl`, `HomeContact`, `ProjectMenu`, `World`, `Butterflies`, `Reflector`, `PageLoader`, `Cursor`...). **Keep the source's method and field names** (`onRaf`, `build`, `preBuild`, `tweenParams`, `cameraPathProgress`, `composerPasses.add(pass, idx)`, `RAFCollection.add(cb, idx)`, `AssetLoader.loadGltf/loadTexture/loadKtxTexture/loadJson`, `savePass`, `transitionPass`...) so cross-module references in transitions work unchanged. Register instances on `store` under the same keys as source (`store.Gl`, `store.HomeContact`, `store.ProjectMenu`, `store.World`, `store.Audio`, `store.Cursor`, `store.Menu`, `store.ASScroll`, `store.AssetLoader`, `store.TextLoader`, `store.RAFCollection`...).
- TypeScript: `strict` is on. Where porting typing gets in the way, prefer explicit local types or `any` on the boundary over changing behaviour. `bunx tsc --noEmit` must be clean for your files.
- Everything runs client-side only (`'use client'` in React entry points; engine modules must not touch `window` at import time).
- No three.js lights, fog done in shaders, exactly as source.
- DOM selectors: the markup uses the source class names and `js-*` hooks (see css/markup). Query the same selectors the source queries.
- RAF order and pass indices exactly as ARCH.md §2 and §6.

## React side
- `app/layout.tsx` renders `<Shell/>` + `<EngineRoot/>` around `{children}`. Each route renders its body markup (from `reference/site/css/markup/<route>.html`, converted to JSX, same classes/attributes/`data-*`) inside `<main data-router-view="...">` which lives in `<div asscroll-container data-router-wrapper>`.
- `reactStrictMode: false` (engine boots once). Links are plain `<a href>`; the engine router intercepts clicks.
- Port 3777, one dev server run by the orchestrator (`bun run dev`). Never start another. Check with `curl -s localhost:3777 >/dev/null`.

## Ownership
Each builder owns exactly the files listed in its prompt. Do not edit other builders' files; if you need something from another area, import it by its planned path/name above and note the dependency in your reply. If a planned module does not exist yet, write against its source API (the minified class in theme.js) and leave it; the orchestrator integrates.

## Verification (what "done" means for a builder)
Compare against `reference/site/runtime/shots/` and `frames/` at 1440, 1024, 810, 390 using `~/.claude/skills/1to1/bin/1to1 shot "http://localhost:3777/<route>" out.png --w <w>` (and the Read tool on both images). Values are quoted from source, never eyeballed. Reply with: files written, packages added, what matches, honest remaining gaps, dependencies on other areas.
