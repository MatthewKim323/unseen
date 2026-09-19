// Registration table for non-core engine modules (orchestrator-owned integration point).
// Each builder exports its class; add one line here to have bootEngine() construct it in source order.
// Example:
//   import { HomeContact } from "./scenes/home-contact/HomeContact";
//   registerModule("HomeContact", () => new HomeContact());
import { registerModule } from "./registry";

export function registerModules() {
  // Intentionally empty until the scene / dom / router builders land.
  void registerModule;
}
