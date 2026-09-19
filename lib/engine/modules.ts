// Registration table for non-core engine modules (orchestrator-owned integration point).
// Each builder exports its class; add one line here to have bootEngine() construct it in source order
// (HomeContact, ProjectMenu, ProjectFilters, World, then Navigation, Menu, WorldButton, Cursor, Router).
import { registerModule } from "./registry";
import { HomeContact } from "./scenes/home-contact/home-contact";
import { registerHomeContactDevEnter } from "./scenes/home-contact/dev-enter";
import { ProjectMenu } from "./scenes/project-menu/project-menu";
import { ProjectFilters } from "./dom/project-filters";
import { registerProjectsDevEnter } from "./scenes/project-menu/dev-enter";
import { World } from "./scenes/world/world";

export function registerModules() {
  registerModule("HomeContact", () => new HomeContact());
  registerModule("ProjectMenu", () => new ProjectMenu());
  registerModule("ProjectFilters", () => new ProjectFilters());
  registerModule("World", () => new World());
  registerHomeContactDevEnter();
  registerProjectsDevEnter();
}
