// Project renderer (source `Mo`, theme.js 15656-15713): route /projects/<slug>/, data-router-view="project".
// Creates the Project controller before the base enter (so dom2webgl items can read its colours),
// grid sliders, backing track + lowpass, builds the project once assets and troika text are ready,
// and is the only renderer that enables ASScroll smooth scrolling.
import gsap from "gsap";
import { store as storeRaw } from "../../core/store";
import { ComponentManager } from "../../core/component-manager";
import { Project } from "../../scenes/project/project";
import { GridSlider } from "../../dom/grid-slider";
import { BaseRenderer } from "./base";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store: any = storeRaw;

export class ProjectRenderer extends BaseRenderer {
  gridSliders!: ComponentManager<GridSlider>;
  projectBuilt!: Promise<void>;

  onEnter() {
    store.ASScroll.currentPos = 0;
    store.ASScroll.scrollTo(0);
    store.Project = new Project();
    super.onEnter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.gridSliders = new ComponentManager(GridSlider as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.currentProjectMenuId = (window as any).currentProjectMenuId;
    store.projectLightMode = document.body.classList.contains("dark");
    store.PageLoader.hiddenPromise.then(() => {
      if (!store.Audio.isPlaying("audio.backing")) {
        store.Audio.play({ key: "audio.backing", fade: { from: 0, to: 1, duration: 1 } });
        store.Audio.filterTo({
          key: "audio.backing",
          duration: 1,
          type: "lowpass",
          from: { frequency: 14e3 },
          to: { frequency: 160 },
        });
      }
    });
    this.projectBuilt = new Promise<void>((resolve) => {
      Promise.all([store.AssetLoader.loaded, store.TextLoader.loaded]).then(() => {
        store.Project.build();
        resolve();
        store.ASScroll.on("scroll", store.Navigation.handleScroll);
      });
    });
  }

  onEnterCompleted() {
    super.onEnterCompleted();
    store.ASScroll.enable({ newScrollElements: this.page, reset: true });
    store.html.classList.remove("asscroll-disabled");
    store.ASScroll.currentPos = 0;
    store.ASScroll.scrollTo(0);
  }

  onLeave() {
    super.onLeave();
    store.ASScroll.off("scroll", store.Navigation.handleScroll);
    if (!store.projectToProjectTransition)
      gsap.to(store.Gl.screenFxPass.uniforms.u_noiseOnly, { value: 0, ease: "power2.out", duration: 1, delay: 2 });
  }

  onLeaveCompleted() {
    super.onLeaveCompleted();
    store.Project.destroy();
    this.gridSliders.destroy();
    store.currentProjectMenuId = 0;
  }
}

export default ProjectRenderer;
