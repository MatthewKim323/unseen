/* eslint-disable @typescript-eslint/no-explicit-any */
// TEMP test hook: emulates the homeContact renderer first enter (source `Eo.onEnter` + `Eo.onFirstLoad`)
// while no Router module is registered. Inert once the router exists.
import gsap from "gsap";
import { onBoot } from "../../registry";
import { store as storeRaw } from "../../core/store";

const o: any = storeRaw;

export function registerHomeContactDevEnter() {
  onBoot(() => {
    if (o.Router || !/^\/(contact\/?)?$/.test(location.pathname)) return;
    const hc = o.HomeContact;
    if (!hc) return;
    hc.firstLoad = true;
    setTimeout(() => {
      (o.AssetLoader.loaded || Promise.resolve()).then(() => {
        gsap.to(o.Gl.cssRenderer.domElement, {
          autoAlpha: 1,
          duration: 0.5,
          ease: "power2.out",
        });
        (o.PageLoader?.hiddenPromise || Promise.resolve()).then(() => {
          if (hc.isHome) hc.showHome().pause().progress(1);
          else hc.showContact().pause().progress(1);
          gsap.fromTo(
            hc.options,
            { cameraTranslateZ: 0.05 },
            { cameraTranslateZ: 0, duration: 2, ease: "power4.out" },
          );
          gsap.to(hc.homeTextMesh.material.uniforms.uProgress, {
            value: 1,
            duration: 4,
            ease: "power4.out",
            onStart: () => {
              hc.textFluidSim.tweenMousePos(
                { x: 0, y: 1 },
                { x: 1, y: 0 },
                4,
                "power4.out",
              );
            },
          });
        });
      });
    }, 0);
  });
}
