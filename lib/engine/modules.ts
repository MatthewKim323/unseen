// Registration table for non-core engine modules (orchestrator-owned integration point).
// bootEngine() constructs them in source order (see MODULE_ORDER in registry.ts).
import { registerModule } from "./registry";
import { PageLoader } from "./dom/page-loader";
import { NakedLoader } from "./dom/naked-loader";
import { ScrollAnimations } from "./dom2webgl/scroll-animations";
import { Dom2Webgl } from "./dom2webgl/dom2webgl";
import { HomeContact } from "./scenes/home-contact/home-contact";
import { ProjectMenu } from "./scenes/project-menu/project-menu";
import { ProjectFilters } from "./dom/project-filters";
import { World } from "./scenes/world/world";
import { Navigation } from "./dom/navigation";
import { Menu } from "./dom/menu";
import { WorldButton } from "./dom/world-button";
import { Cursor } from "./dom/cursor";
import Router from "./router/router";

export function registerModules() {
  registerModule("PageLoader", () => new PageLoader());
  registerModule("NakedLoader", () => new NakedLoader());
  registerModule("ScrollAnimations", () => new ScrollAnimations());
  registerModule("Dom2Webgl", () => new Dom2Webgl());
  registerModule("HomeContact", () => new HomeContact());
  registerModule("ProjectMenu", () => new ProjectMenu());
  registerModule("ProjectFilters", () => new ProjectFilters());
  registerModule("World", () => new World());
  registerModule("Navigation", () => new Navigation());
  registerModule("Menu", () => new Menu());
  registerModule("WorldButton", () => new WorldButton());
  registerModule("Cursor", () => new Cursor());
  registerModule("Router", () => new Router());
}
