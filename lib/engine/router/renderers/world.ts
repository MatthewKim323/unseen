// World renderer (source `Co`, theme.js 15714-15760): route /world/, data-router-view="world".
import gsap from "gsap";
import { store as storeRaw } from "../../core/store";
import { BaseRenderer } from "./base";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store: any = storeRaw;

export class WorldRenderer extends BaseRenderer {
  onEnter() {
    store.World.firstLoad = store.Highway.firstLoad;
    this.page = this.wrap.lastElementChild as HTMLElement;
    super.loadScripts();
    store.World.load();
    super.onEnter({ loadScripts: false });
    store.AssetLoader.loaded.then(() => {
      store.World.build();
    });
    store.WorldButton.hideBtn();
  }

  onEnterCompleted() {
    super.onEnterCompleted();
    store.AssetLoader.loaded.then(() => {
      if (store.isIOS && store.World) store.World.sampleVideos();
    });
    store.Cursor.disable();
    if (store.Highway.From?.properties?.slug === "notFound") store.World.in();
    if (!store.Audio.isPlaying("audio.world-loop"))
      store.Audio.play({ key: "audio.world-loop", fade: { from: 0, to: 1, duration: 1 } });
  }

  onLeave() {
    super.onLeave();
    store.Audio.fadeToStop({ key: "audio.world-loop", duration: 2 });
    store.Audio.lerpSpeed("audio.world-loop", 0.5, 2e3);
    gsap.to(store.Gl.cssRenderer.domElement, { autoAlpha: 0, duration: 0.5, ease: "power2.out" });
    gsap.to(store.World.dom.introWrap, { autoAlpha: 0, duration: 0.5, ease: "power2.out" });
  }

  onLeaveCompleted() {
    super.onLeaveCompleted();
    store.World.destroy();
    store.WorldButton.showBtn();
    store.Cursor.enable();
  }
}

export default WorldRenderer;
