// TEMP test hook: emulates the projects renderer first enter while no Router is registered.
import gsap from "gsap";
import { onBoot } from "../../registry";
import { store as storeRaw } from "../../core/store";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store: any = storeRaw;
export function registerProjectsDevEnter() {
  onBoot(() => {
    if (store.Router || !/^\/projects\/?$/.test(location.pathname)) return;
    store.ProjectMenu.firstLoad = true;
    setTimeout(() => {
      (store.AssetLoader.loaded || Promise.resolve()).then(() => {
        store.ProjectMenu.build(true);
        (store.PageLoader?.hiddenPromise || Promise.resolve()).then(() => {
          store.ProjectMenu.in();
          store.ProjectMenu.addInteractionEvents();
        });
        gsap.to(".js-project-filters", { autoAlpha: 1, delay: 0.1 });
      });
    }, 0);
  });
}
