// Transition `projectToProject` (source `Do`, theme.js 16815-16981) + dispose-deep helper (`Fo`, 16795-16814).
import gsap from "gsap";
import { Material, Object3D, Texture } from "three";
import E from "../../core/event-bus";
import { store } from "../../core/store";
import { $ } from "../../core/component-manager";
import { Transition, removeView, type TransitionInArgs, type TransitionOutArgs } from "./base";

/** Source `Fo`. CSS3DObject extends Object3D, so the source's `Object3D || CSS3DObject` check is one test. */
export function disposeDeep(e: any): any {
  if (!e) return;
  if (Array.isArray(e)) {
    e.forEach((x) => disposeDeep(x));
    return e;
  }
  if (e instanceof Object3D) {
    disposeDeep((e as any).geometry);
    disposeDeep((e as any).material);
    disposeDeep(e.children);
  } else if (e instanceof Material) {
    for (const v of Object.values(e)) if (v instanceof Texture) disposeDeep(v);
    const uniforms = (e as any).uniforms;
    if (uniforms)
      for (const u of Object.values(uniforms) as any[])
        if (u) {
          const val = u.value;
          if (val instanceof Texture || Array.isArray(val)) disposeDeep(val);
        }
  }
  if (e instanceof Object3D && e.parent) e.parent.remove(e);
  e.dispose && e.dispose();
}

export class ProjectToProjectTransition extends Transition {
  loaderVisible = false;
  showLoaderTimeout?: ReturnType<typeof setTimeout>;
  title: any;
  model: any;
  transitionPlane: any;
  nextBackgroundColorGl: any;
  keepScrollingEl: any;

  in({ done }: TransitionInArgs) {
    store.ASScroll.scrollTo(0);
    store.ASScroll.currentPos = 0;
    if (store.projectToProjectTransition) {
      const cleanup = function (this: ProjectToProjectTransition) {
        this.title.visible = false;
        this.model.visible = false;
        this.transitionPlane.visible = false;
        disposeDeep(this.title);
        disposeDeep(this.model);
        disposeDeep(this.transitionPlane);
        E.off("firstObservation", bound);
      };
      store.projectToProjectTransition = false;
      const bound = cleanup.bind(this);
      E.on("firstObservation", bound);
      store.Highway.To.projectBuilt.then(() => {
        clearTimeout(this.showLoaderTimeout);
        if (this.loaderVisible) {
          store.NakedLoader.hide(true);
          gsap.to(store.Gl!.fluidPass.uniforms.uOpacity, { value: 0.03 });
        }
        done();
      });
    } else
      (store.AssetLoader!.loaded as Promise<void>).then(() => {
        store.PageLoader.hide().then(() => {
          done();
        });
      });
  }

  out({ from, done }: TransitionOutArgs) {
    if (store.Project.transitioning) {
      const P = store.Project;
      this.loaderVisible = false;
      store.Dom2Webgl.resourceTracker.untrack(P.nextModel);
      store.Dom2Webgl.resourceTracker.untrack(P.nextTitle);
      store.Dom2Webgl.resourceTracker.untrack(P.transitionPlane);
      this.title = P.nextTitle;
      this.model = P.nextModel;
      this.transitionPlane = P.transitionPlane;
      this.nextBackgroundColorGl = P.nextBackgroundColorGl;
      this.keepScrollingEl = P.keepScrolling.domEl;
      gsap
        .timeline({
          defaults: { duration: 0.7, ease: "power3.inOut" },
          onComplete: () => {
            this.title.updatePosition = false;
            this.model.updatePosition = false;
            this.transitionPlane.updatePosition = false;
            removeView(from);
            done();
          },
        })
        .to(
          [
            P.transitionPlane.item.material.uniforms.u_progress,
            P.keepScrolling.item.material.uniforms.u_progress,
            P.footerNext.item.material.uniforms.u_progress,
            P.nextTitle.item.material.uniforms.u_progress,
            P.nextModel.item.children[0].material.uniforms.uTransitionProgress,
            P.scrollProgress.item.material.uniforms.u_progress,
          ],
          { value: 1 },
          0,
        )
        .to(
          [
            P.transitionPlane.item.material.uniforms.u_adjust,
            P.keepScrolling.item.material.uniforms.u_adjust,
            P.footerNext.item.material.uniforms.u_adjust,
            P.nextTitle.item.material.uniforms.u_adjust,
            P.scrollProgress.item.material.uniforms.u_adjust,
            P.transitionPlane.item.material.uniforms.u_velo,
            P.keepScrolling.item.material.uniforms.u_velo,
            P.footerNext.item.material.uniforms.u_velo,
            P.nextTitle.item.material.uniforms.u_velo,
            P.scrollProgress.item.material.uniforms.u_velo,
          ],
          { value: 0 },
          0,
        )
        .to(P.footerContentTween, { progress: 1 }, 0)
        .to(
          P.keepScrolling.glyphPositions,
          {
            minY: "+=" + 1.1 * P.keepScrolling.fontSize,
            maxY: "+=" + 1.1 * P.keepScrolling.fontSize,
            stagger: 0.03,
            onUpdate: () => {
              P.keepScrolling.updateGlyphPositions();
            },
          },
          0,
        )
        .to(P.scrollProgress.scale, { x: 0 }, 0)
        .to(
          store.Gl!.globalUniforms.fogColor.value,
          { r: P.nextBackgroundColorGl.r, g: P.nextBackgroundColorGl.g, b: P.nextBackgroundColorGl.b },
          0,
        )
        .call(
          () => {
            this.showLoaderTimeout = setTimeout(() => {
              this.loaderVisible = true;
              const hex = this.nextBackgroundColorGl.getHexString();
              gsap.set(store.body, { backgroundColor: "#" + hex });
              store.Gl!.fluidPass.uniforms.uOpacity.value = 0;
              this.transitionPlane.visible = false;
              store.NakedLoader.show(hex, true, this.keepScrollingEl);
            }, 500);
          },
          undefined,
          0.5,
        )
        .call(
          () => {
            ($(".js-footer") as HTMLElement).dataset.nextLightMode === "1"
              ? document.body.classList.add("dark")
              : document.body.classList.remove("dark");
          },
          undefined,
          0.3,
        );
    } else {
      const camZ = store.Project.camera.position.z;
      gsap
        .timeline({
          defaults: { duration: 1.5, ease: "power4.inOut" },
          onComplete: () => {
            gsap.set(store.ASScroll.containerElement, { clearProps: "transform,opacity,visibility" });
            store.Project.camera.position.z = camZ;
            removeView(from);
            done();
          },
        })
        .to(store.Project.camera.position, { z: 2.1 * store.Project.camera.position.z }, 0)
        .to([store.ASScroll.containerElement, store.Project.dom.headerClone], { scale: 0.4 }, "<")
        .to([store.ASScroll.containerElement, store.Project.dom.headerClone], { autoAlpha: 0, duration: 1 }, "<")
        .call(
          () => {
            store.PageLoader.show();
          },
          undefined,
          0.2,
        );
    }
  }
}

export default ProjectToProjectTransition;
