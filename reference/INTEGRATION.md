# Integration queue (orchestrator)

- world: boot must construct `store.World = new World()` (lib/engine/scenes/world/world.ts) after Gl/AssetLoader/RAFCollection; router registers WorldRenderer as `world`. Verify vs runtime world shots once captured.
- shared shader lib/engine/shaders/common-fullscreen-uv.vert.glsl.ts created by world builder; core may import it.
