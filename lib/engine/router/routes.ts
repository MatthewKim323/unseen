// Contextual route table (source Router `Uo`, theme.js 17028-17182; ARCH.md §4).
// Patterns are the source's, written with WordPress-style trailing slashes. Next paths have no
// trailing slash, so every pathname goes through `normalizePath` before matching.

export type TransitionName =
  | "default"
  | "homeToProject"
  | "toWorld"
  | "toHome"
  | "toContact"
  | "toProjectMenu"
  | "toProject"
  | "projectToProject";

export interface ContextualRoute {
  toPattern: string;
  transition: TransitionName;
}

// Same insertion order as the source `addContextualRoute` calls (order matters: first `from` key
// that matches wins, and the lookup stops there even when no `to` pattern matched).
export const CONTEXTUAL_ROUTES: [from: string, to: string, transition: TransitionName][] = [
  ["/", "/contact/", "toContact"],
  ["/", "/world/", "toWorld"],
  ["/", "/projects/", "toProjectMenu"],
  ["/contact/", "/", "toHome"],
  ["/contact/", "/world/", "toWorld"],
  ["/contact/", "/projects/", "toProjectMenu"],
  ["/world/", "/", "toHome"],
  ["/world/", "/contact/", "toContact"],
  ["/world/", "/projects/", "toProjectMenu"],
  ["/world/", "/projects/.+", "default"],
  ["/projects/", "/", "toHome"],
  ["/projects/", "/contact/", "toContact"],
  ["/projects/", "/world/", "toWorld"],
  ["/projects/", "/projects/.+", "toProject"],
  ["/projects/.+", "/", "toHome"],
  ["/projects/.+", "/contact/", "toContact"],
  ["/projects/.+", "/world/", "toWorld"],
  ["/projects/.+", "/projects/", "toProjectMenu"],
  ["/projects/.+", "/projects/.+", "projectToProject"],
  ["/", "/projects/.+", "homeToProject"],
  ["/contact/", "/projects/.+", "homeToProject"],
];

/** "/contact" -> "/contact/", "/" stays "/". */
export function normalizePath(pathname: string): string {
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

// Body classes per route (source NAVIGATE_IN copies the fetched page's <body class>). Kept identical to
// the pre-paint script in app/layout.tsx so first load and client navigation agree. A view can
// override with `data-body-class` on its <main> (project pages add `dark` from light_mode that way).
export function bodyClassFor(pathname: string, view?: Element | null): string {
  const override = view?.getAttribute("data-body-class");
  if (override !== null && override !== undefined) return override;
  if (view?.getAttribute("data-router-view") === "notFound") return "error404 dark";
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/") return "home page-template-home-contact";
  if (p === "/contact") return "page-template-home-contact";
  if (p === "/projects") return "archive post-type-archive post-type-archive-project";
  if (p === "/world") return "dark page-template-world";
  if (/^\/projects\/[^/]+$/.test(p)) return "project-template-default";
  return "error404 dark";
}
