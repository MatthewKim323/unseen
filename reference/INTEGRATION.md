# Integration queue (orchestrator)

- world: boot must construct `store.World = new World()` (lib/engine/scenes/world/world.ts) after Gl/AssetLoader/RAFCollection; router registers WorldRenderer as `world`. Verify vs runtime world shots once captured.
- shared shader lib/engine/shaders/common-fullscreen-uv.vert.glsl.ts created by world builder; core may import it.
- projects: remove scenes/project-menu/dev-enter.ts + home-contact dev-enter once Router registered. Experiment links point to /labs/<slug>/ (no route): check source data for external vs internal and fix. CTA fill needs SvgButton.
- project-details json: 65 blackout leaks (project detail builder). Re-run blackout after it reports.
- runtime shots only cover home: capture projects/world/contact/project after entering (needs a second capture pass if runtime agent doesn't).
