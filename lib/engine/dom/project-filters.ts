// ProjectFilters (source `yo`): category filter bar over the project menu (dropdown under 768px).
import gsap from "gsap";
import { store as storeRaw } from "../core/store";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store: any = storeRaw;
import { E } from "../core/event-bus";
import { ensureProjects, type ProjectEntry } from "../scenes/project-menu/projects-data";

const $ = (sel: string, ctx: ParentNode = document) => ctx.querySelector(sel) as HTMLElement;
const $$ = (sel: string, ctx: ParentNode = document) => Array.from(ctx.querySelectorAll(sel)) as HTMLElement[];

type FilterKey = "all" | "branding" | "digital" | "motion" | "experiment";

export class ProjectFilters {
  static get selector() {
    return ".js-project-filters";
  }

  isAnimating = false;
  toggleOpen = false;
  dom: {
    filterBtn: HTMLElement[];
    filter: HTMLElement;
    toggle: HTMLElement;
    filterBg: HTMLElement;
    filterList: HTMLElement;
    overlay: HTMLElement;
    chevron: HTMLElement[];
  };
  items: Record<FilterKey, string[]>;
  originalHeight = 0;
  expandedHeight = 0;
  tl!: gsap.core.Timeline;

  handleFilterClick = (e: Event) => {
    if (store.ProjectMenu.animatingFilter) return;
    const target = e.target as HTMLElement;
    if (target.classList.contains("is-active")) return;
    this.dom.filterBtn.forEach((b) => {
      b.classList.remove("is-active");
    });
    target.classList.add("is-active");
    store.window.w < 768 && this.closeFilterDropdown();
    const t = target.dataset.filter as FilterKey;
    E.emit("ProjectFilters:change", this.items[t]);
  };

  onResize = () => {
    this.reset();
    this.toggleOpen = false;
  };

  manageDropdownState = () => {
    this.isAnimating || (this.toggleOpen ? this.closeFilterDropdown() : this.openFilterDropdown());
  };

  constructor(_el?: unknown) {
    ensureProjects();
    this.dom = {
      filterBtn: $$(".js-project-filters\\:filterBtn"),
      filter: $(".js-project-filters\\:filter"),
      toggle: $(".js-project-filters\\:toggle"),
      filterBg: $(".js-project-filters\\:filterBg"),
      filterList: $(".js-project-filters\\:filterList"),
      overlay: $(".js-project-filters\\:overlay"),
      chevron: $$(".js-project-filters\\:chevron"),
    };
    this.items = { all: [], branding: [], digital: [], motion: [], experiment: [] };
    E.on("click", this.dom.filterBtn, this.handleFilterClick);
    E.on("click", this.dom.toggle, this.manageDropdownState);
    E.on("click", this.dom.overlay, this.manageDropdownState);
    E.on(store.events.RESIZE, this.onResize);
    this.setInitialStyles();
    this.categorizeItems();
    this.updateButtonNumbers();
    this.buildDropdownTL();
  }

  setInitialStyles() {
    this.originalHeight = this.dom.filter.offsetHeight;
    this.expandedHeight = this.originalHeight + this.dom.filterList.offsetHeight;
    store.window.w < 768 && gsap.set(this.dom.filterList, { display: "none", autoAlpha: 0 });
    gsap.set(this.dom.overlay, { display: "none", autoAlpha: 0 });
  }

  categorizeItems() {
    (window.projects as ProjectEntry[]).forEach((e) => {
      const t = e.project.project_grid_category;
      // source: (!t && 0 !== t.length) || t.includes("experiment") || all.push(...)
      // `false.length` is undefined, so uncategorised projects (category `false`) are left out of "all" (count 20 of 36)
      ((!t && 0 !== (t as any).length) || (t && t.includes("experiment")) || this.items.all.push(e.project.title));
      if (t && 0 !== t.length) {
        t.includes("branding") && this.items.branding.push(e.project.title);
        t.includes("digital") && this.items.digital.push(e.project.title);
        t.includes("motion") && this.items.motion.push(e.project.title);
        t.includes("experiment") && this.items.experiment.push(e.project.title);
      }
    });
  }

  updateButtonNumbers() {
    this.dom.filterBtn.forEach((e) => {
      const t = e.dataset.filter as FilterKey,
        i = this.items[t].length;
      $(".js-project-filters\\:filter\\:number", e).innerHTML = String(i);
    });
  }

  buildDropdownTL() {
    this.tl = gsap.timeline({
      defaults: { ease: "expo.inOut", duration: 0.8 },
      paused: true,
      onStart: () => {
        this.isAnimating = true;
      },
      onComplete: () => {
        this.isAnimating = false;
      },
    });
    store.window.w < 768 &&
      this.tl
        .set(this.dom.overlay, { display: "block", pointerEvents: "auto" }, 0)
        .set(this.dom.filterList, { display: "flex" }, 0)
        .to(this.dom.filterBg, { height: this.expandedHeight, width: "15.8125rem" })
        .to(this.dom.overlay, { autoAlpha: 1 }, "<")
        .to(this.dom.filterList, { autoAlpha: 1 }, 0.2)
        .fromTo(this.dom.filterBtn, { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.05, duration: 0.4, ease: "linear" }, 0)
        .set(this.dom.chevron, { rotate: 180 }, 0.4);
  }

  openFilterDropdown() {
    this.tl.restart();
    this.toggleOpen = true;
    store.ProjectMenu.allowControl = false;
  }

  closeFilterDropdown() {
    this.tl.reverse();
    this.toggleOpen = false;
    store.ProjectMenu.allowControl = true;
  }

  reset() {
    gsap.set([this.dom.filterList, this.dom.filterBtn, this.dom.filterBg], { clearProps: "all" });
    this.tl.kill();
    this.setInitialStyles();
    store.window.w < 768 && this.buildDropdownTL();
  }

  destroy() {
    E.off("click", this.dom.filterBtn, this.handleFilterClick);
    E.off("click", this.dom.toggle, this.manageDropdownState);
    E.off("click", this.dom.overlay, this.manageDropdownState);
    E.off(store.events.RESIZE, this.onResize);
  }
}
