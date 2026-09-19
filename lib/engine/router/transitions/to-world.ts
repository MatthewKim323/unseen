// Transition `toWorld` (source `Lo`, theme.js 15792-15854).
import gsap from "gsap";
import { store } from "../../core/store";
import { Transition, removeView, type TransitionInArgs, type TransitionOutArgs } from "./base";

export class ToWorldTransition extends Transition {
  usingLoader?: boolean;

  in({ done }: TransitionInArgs) {
    if (this.usingLoader)
      (store.AssetLoader!.loaded as Promise<void>).then(() => {
        store.World.renderPass.enabled = true;
        done();
        store.World.playIntro();
        store.PageLoader.hide();
      });
    else done();
  }

  out({ from, done }: TransitionOutArgs) {
    store.Highway.cached = store.Highway.cache.has(store.Highway.location.href);
    gsap
      .timeline()
      .call(() => {
        store.Audio!.fadeToStop({ key: "audio.backing", duration: 2 });
        store.Audio!.lerpSpeed("audio.backing", 0.5, 2e3);
        if (from.dataset.routerView !== "project") store.Audio!.play({ key: "audio.world_static" });
      })
      .call(
        () => {
          store.Audio!.play({ key: "audio.world-loop", fade: { from: 0, to: 1, duration: 3 } });
        },
        [],
        1,
      );
    if (from.dataset.routerView === "project" || from.dataset.routerView === "projects") {
      this.usingLoader = true;
      store.PageLoader.show().then(() => {
        removeView(from);
        done();
      });
    } else {
      if (from.dataset.routerView === "homeContact") {
        store.HomeContact.savePass.enabled = true;
        store.World.transitionPass.uniforms.u_fromScene.value = store.World.savePass.renderTarget.texture;
        store.World.transitionPass.uniforms.u_toScene.value = store.HomeContact.savePass.renderTarget.texture;
        gsap.to(store.HomeContact.options, { cameraTranslateZ: -0.09, duration: 2.5, ease: "power2.inOut" });
      }
      // Dead in practice: "projects" takes the loader branch above (ARCH §10), kept for parity.
      if (from.dataset.routerView === "projects") {
        store.ProjectMenu.combinedSavePass.enabled = true;
        store.World.transitionPass.uniforms.u_fromScene.value = store.World.savePass.renderTarget.texture;
        store.World.transitionPass.uniforms.u_toScene.value = store.ProjectMenu.combinedSavePass.renderTarget.texture;
        gsap.to(store.ProjectMenu.tweenParams, { cameraZOffset: -1e3, duration: 2.5, ease: "power2.inOut" });
      }
      store.World.in().then(() => {
        removeView(from);
        done();
      });
    }
  }
}

export default ToWorldTransition;
