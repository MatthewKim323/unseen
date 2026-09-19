// Transition `toProject` (source `Io`, theme.js 16613-16794). projects -> project.
import gsap from "gsap";
import E from "../../core/event-bus";
import { store } from "../../core/store";
import { Transition, removeView, type TransitionInArgs, type TransitionOutArgs } from "./base";

export class ToProjectTransition extends Transition {
  loaded = false;
  loaderVisible = false;
  outTimeline!: gsap.core.Timeline;
  showLoaderTimeout?: ReturnType<typeof setTimeout>;

  in(_args: TransitionInArgs) {
    const { done } = _args;
    const onFirstObservation = function (this: ToProjectTransition) {
      Promise.all([
        store.AssetLoader!.loaded,
        store.TextLoader!.loaded,
        store.TaskScheduler!.queueFinished,
        store.Highway.To.projectBuilt,
      ]).then(() => {
        this.loaded = true;
        this.outTimeline.then(() => {
          clearTimeout(this.showLoaderTimeout);
          if (this.loaderVisible) {
            store.ProjectMenu.transitionPass.enabled = false;
            store.ProjectMenu.transitionPass.clear = false;
            store.ProjectMenu.transitionPass.uniforms.u_opacity.value = 1;
            store.NakedLoader.hide();
          } else store.ProjectMenu.destroy();
          store.Project.resume();
          gsap
            .timeline({
              onComplete: () => {
                store.ProjectMenu.options.cameraMovementMultiplier = 1;
                done();
              },
            })
            .from(store.Project.camera.position, { x: 0.25 * -store.window.w, ease: "power2.out", duration: 1 }, "<")
            .from(
              [store.ASScroll.containerElement, store.Project.dom.headerClone],
              { x: 0.25 * store.window.w, ease: "power2.out", duration: 1, clearProps: "transform" },
              "<",
            )
            .from(
              [store.ASScroll.containerElement, store.Project.dom.headerClone],
              { autoAlpha: 0, duration: 0.8, ease: "power2.out" },
              "<",
            )
            .fromTo(
              store.Project.scene.fog,
              { near: "-=1000", far: "-=1000" },
              { near: store.Project.scene.fog.origVals.near, far: store.Project.scene.fog.origVals.far, duration: 0.8 },
              "<",
            )
            .fromTo(
              store.Gl!.globalUniforms.fogNear,
              { value: "-=1000" },
              { value: store.Project.scene.fog.origVals.near, duration: 0.8 },
              "<",
            )
            .fromTo(
              store.Gl!.globalUniforms.fogFar,
              { value: "-=1000" },
              { value: store.Project.scene.fog.origVals.far, duration: 0.8 },
              "<",
            )
            .call(
              () => {
                store.Project.introTimeline.play();
                store.Highway.From.isTransitioningToProject = false;
              },
              undefined,
              "<",
            );
        });
      });
      E.off("firstObservation", bound);
    };
    const bound = onFirstObservation.bind(this);
    E.on("firstObservation", bound);
  }

  out({ from, done }: TransitionOutArgs) {
    let bg: string | undefined;
    store.Highway.From.isTransitioningToProject = true;
    this.loaded = false;
    this.loaderVisible = false;
    store.ProjectMenu.transitionPass.enabled = true;
    store.ProjectMenu.transitionPass.uniforms.u_bgColor.value.set(store.ProjectMenu.toProjectTransitionData.bgColor);
    if (from.dataset.routerView !== "projects" && store.Audio!.isPlaying("audio.backing"))
      store.Audio!.filterTo({
        key: "audio.backing",
        duration: 1,
        type: "lowpass",
        from: { frequency: 14e3 },
        to: { frequency: 160 },
      });
    store.ProjectMenu.inTimeline?.clear();
    store.ProjectMenu.allowControl = false;
    if (store.ProjectMenu.toProjectTransitionData.bgColor) {
      bg = store.ProjectMenu.toProjectTransitionData.bgColor.replace("#", "");
      gsap.set(store.body, { backgroundColor: "#" + bg });
      store.ProjectMenu.transitionPass.uniforms.u_bgColor.value.set("#" + bg);
    }
    this.outTimeline = gsap
      .timeline({
        defaults: { duration: 2, ease: "power4.inOut" },
        onComplete: () => {
          this.showLoaderTimeout = setTimeout(() => {
            this.loaderVisible = true;
            if (!bg) bg = store.ProjectMenu.scene.background.getHexString();
            gsap.set(store.body, { backgroundColor: "#" + bg });
            store.ProjectMenu.destroy();
            store.ProjectMenu.transitionPass.enabled = true;
            store.ProjectMenu.transitionPass.clear = true;
            store.ProjectMenu.transitionPass.uniforms.u_opacity.value = 0;
            store.NakedLoader.show(bg);
          }, 500);
        },
      })
      .to(store.ProjectMenu.tweenParams, { cameraXOffset: 1400 }, "<")
      .to(".js-project-filters", { x: "-100%", autoAlpha: 0 }, "<")
      .to(".js-project-grid-cta", { x: "-100%", autoAlpha: 0 }, "<")
      .fromTo(store.ProjectMenu.transitionPass.uniforms.u_progress, { value: 0 }, { value: 1, duration: 1.7 }, "<")
      .to(store.ProjectMenu.tweenParams, { velocity: 0, duration: 0.5 }, "<")
      .to(store.Gl!.screenFxPass.uniforms.u_noiseOnly, { value: 1, duration: 1 }, "<")
      .call(
        () => {
          // Source quirk kept: only ever adds `dark` (the else branch is unreachable).
          if (store.ProjectMenu.toProjectTransitionData.lightMode)
            store.ProjectMenu.toProjectTransitionData.lightMode
              ? store.body.classList.add("dark")
              : store.body.classList.remove("dark");
        },
        undefined,
        0.8,
      )
      .call(
        () => {
          removeView(from);
          done();
        },
        undefined,
        1.2,
      );
  }
}

export default ToProjectTransition;
