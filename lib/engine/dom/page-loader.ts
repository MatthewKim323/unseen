/* eslint-disable @typescript-eslint/no-explicit-any */
// PageLoader (source `P`, theme.js 670-993): intro gate. Progress curtain, letter cube,
// SVG eyes that track the pointer, "Enter" / "Enter without audio".
import gsap from "gsap";
import { store } from "../core/store";
import { E } from "../core/event-bus";
import { SvgButton } from "./svg-button";

const $ = (sel: string) => document.querySelector(sel) as HTMLElement;
const $$ = (sel: string) => Array.prototype.slice.call(document.querySelectorAll(sel)) as HTMLElement[];

export class PageLoader {
  dom: { loader: HTMLElement; loaderBox: HTMLElement[]; progress: HTMLElement; progressInner: HTMLElement };
  eyes: {
    el: HTMLElement;
    left: HTMLElement;
    right: HTMLElement;
    leftTop: HTMLElement;
    leftBottom: HTMLElement;
    rightTop: HTMLElement;
    rightBottom: HTMLElement;
    normal: HTMLElement[];
    heart: HTMLElement[];
    y?: number;
  };
  enterButton: SvgButton;
  enterNoAudioButton: HTMLElement;
  hidden = false;
  percent = 0;
  throttledProgressFunc: (...args: any[]) => void;
  hiddenPromise: Promise<void>;
  hiddenResolve!: () => void;
  current = { x: 0, y: 0 };
  mouse = { x: 0, y: 0 };
  currentDist = 0;
  eyelidTl!: gsap.core.Timeline;
  timeout: number | undefined;
  eyesCenterY = 0;
  maxMovementX = 0;
  maxMovementY = 0;
  eyesMin = 0;
  eyesMax = 0;
  btnRect!: DOMRect;
  btnCenterX = 0;
  btnCenterY = 0;
  btnMin = 0;
  btnMax = 0;

  constructor() {
    this.dom = {
      loader: $(".js-loader"),
      loaderBox: $$(".js-loader-box"),
      progress: $(".js-loader-progress"),
      progressInner: $(".js-loader-progress-inner"),
    };
    this.eyes = {
      el: $(".js-eyes"),
      left: $(".js-eyes-left"),
      right: $(".js-eyes-right"),
      leftTop: $(".js-eyes-eyelid-left-top"),
      leftBottom: $(".js-eyes-eyelid-left-bottom"),
      rightTop: $(".js-eyes-eyelid-right-top"),
      rightBottom: $(".js-eyes-eyelid-right-bottom"),
      normal: $$(".js-eyes-normal"),
      heart: $$(".js-eyes-heart"),
    };
    this.enterButton = new SvgButton(document.querySelector(".js-enter-btn") as HTMLElement);
    this.enterNoAudioButton = document.querySelector(".js-enter-no-audio-btn") as HTMLElement;
    this.throttledProgressFunc = this.throttle(this.onAssetsProgress, 150);
    E.on("AssetsProgress", this.throttledProgressFunc);
    E.on("AssetLoader:afterResolve", this.onAssetsLoaded);
    E.on("click", this.enterButton.dom.el, this.onEnterButtonClick);
    E.on("click", this.enterNoAudioButton, this.onEnterNoAudioButtonClick);
    this.hiddenPromise = new Promise((e) => {
      this.hiddenResolve = e;
    });
    gsap.set(this.eyes.heart, { transformOrigin: "center center", scale: 0 });
  }

  onAssetsProgress = ({ percent: e }: { percent: number }) => {
    if (this.percent === e) return;
    this.percent = e;
    gsap.set(this.dom.progress, { y: 100 - this.percent + "%" });
    gsap.set(this.dom.progressInner, { y: -(100 - this.percent) + "%" });
  };

  onAssetsLoaded = () => {
    this.onAssetsProgress({ percent: 100 });
    if (!store.isTouch) this.buildEyes();
    gsap.to(this.dom.loaderBox, {
      onComplete: this.showEyes,
      duration: 0.5,
      scale: 0,
      autoAlpha: 0,
      ease: "power2.out",
      delay: 0.5,
    });
    gsap.to(this.enterButton.dom.el, { duration: 0.5, autoAlpha: 1, ease: "power2.inOut", delay: 0.5 });
    gsap.to(this.enterNoAudioButton, { duration: 0.5, autoAlpha: 1, ease: "power2.inOut", delay: 0.5 });
    if (store.urlParams.has("skiploader")) this.hide();
  };

  buildEyes = () => {
    this.createEyelidTl();
    this.getBtnCenter();
    E.on("mouseenter", this.enterButton.dom.el, this.eyesMouseEnter);
    E.on("mouseleave", this.enterButton.dom.el, this.eyesMouseLeave);
    E.on(store.events.RESIZE, this.onResize);
    E.on(store.events.MOUSEMOVE, this.onPointerMove);
    store.RAFCollection!.add(this.onRAF, 3);
  };

  showEyes = () => {
    this.openEyes();
    gsap.to(this.eyes.el, {
      display: "block",
      scale: 1,
      duration: 1,
      ease: "elastic.out(0.5, 0.4)",
      onComplete: () => {
        this.getEyesCenter();
        if (store.isTouch)
          window.setTimeout(() => {
            this.animateEyes();
          }, 200);
      },
    });
  };

  createEyelidTl = () => {
    this.eyelidTl = gsap
      .timeline({ paused: true })
      .to(this.eyes.leftTop, { yPercent: -59 }, 0)
      .to(this.eyes.leftBottom, { yPercent: 43 }, 0)
      .to(this.eyes.rightTop, { yPercent: -59 }, 0)
      .to(this.eyes.rightBottom, { yPercent: 67 }, 0);
  };

  getEyesCenter = () => {
    const e = this.eyes.el.getBoundingClientRect();
    this.eyesCenterY = e.top + e.height / 2;
    this.maxMovementX = e.width / 15;
    this.maxMovementY = (e.width / store.window.w) * 65;
    this.eyesMin = -this.eyesCenterY / store.window.h;
    this.eyesMax = (store.window.h - this.eyesCenterY) / store.window.h;
  };

  getBtnCenter = () => {
    this.btnRect = this.enterButton.dom.el.getBoundingClientRect();
    this.btnCenterX = this.btnRect.left + this.btnRect.width / 2;
    this.btnCenterY = this.btnRect.top + this.btnRect.height / 2;
    this.btnMin = -this.btnCenterY / store.window.h;
    this.btnMax = (store.window.h - this.btnCenterY) / store.window.h;
  };

  bringToTop = (e: HTMLElement[]) => {
    for (let t = 0; t < e.length; t++) e[t].parentNode!.appendChild(e[t]);
  };

  eyesMouseEnter = () => {
    window.clearTimeout(this.timeout);
    this.bringToTop(this.eyes.heart);
    gsap
      .timeline({ defaults: { transformOrigin: "center center", duration: 0.3 } })
      .to(this.eyes.normal, { scale: 0.2 })
      .to(this.eyes.heart, { scale: 1, ease: "elastic.out(0.5, 0.3)" }, 0.1);
  };

  eyesMouseLeave = () => {
    this.timeout = window.setTimeout(() => {
      this.bringToTop(this.eyes.normal);
      gsap
        .timeline({ defaults: { transformOrigin: "center center", duration: 0.3 } })
        .to(this.eyes.heart, { scale: 0, duration: 0.2 })
        .to(this.eyes.normal, { scale: 1 }, 0);
    }, 200);
  };

  onResize = () => {
    this.getEyesCenter();
    this.getBtnCenter();
  };

  onPointerMove = () => {
    this.mouse.x = ((store.mouse.x - this.btnCenterX) / store.window.w) * 2;
    this.mouse.y = ((store.mouse.y - this.btnCenterY) / store.window.h) * 2;
    if (store.mouse.y < this.btnCenterY) this.mouse.y *= -0.5 / this.btnMin;
    else this.mouse.y *= 0.5 / this.btnMax;
    this.eyes.y = ((store.mouse.y - this.eyesCenterY) / store.window.h) * 2;
    if (store.mouse.y < this.eyesCenterY) this.eyes.y *= -0.5 / this.eyesMin;
    else this.eyes.y *= 1.2 / this.eyesMax;
  };

  onRAF = () => {
    const e = Math.min(this.eyes.y || 0, 3);
    this.current.x = gsap.utils.interpolate(this.current.x, this.mouse.x, 0.1);
    this.current.y = gsap.utils.interpolate(this.current.y, e, 0.1);
    const t = Math.sqrt(Math.pow(this.mouse.x, 2) + Math.pow(this.mouse.y, 2));
    this.currentDist = gsap.utils.interpolate(this.currentDist, t, 0.09);
    // Sine.easeOut of the clamped distance
    this.eyelidTl.progress(1 - gsap.parseEase("sine.out")(gsap.utils.clamp(0, 1, this.currentDist)));
    const tr = `translate3d(${this.current.x * this.maxMovementX}px, ${this.current.y * this.maxMovementY}px, 0)`;
    this.eyes.left.style.transform = tr;
    this.eyes.right.style.transform = tr;
  };

  onEnterButtonClick = () => {
    store.Audio?.muteAll(false);
    this.hide();
  };

  onEnterNoAudioButtonClick = () => {
    store.Audio?.muteAll(true);
    this.hide();
  };

  show() {
    return new Promise<void>((e) => {
      gsap
        .timeline({ defaults: { ease: "expo.inOut" }, onComplete: () => e() })
        .set(this.dom.progressInner, { autoAlpha: 1, scale: 1 }, 0)
        .to(this.dom.loader, { duration: 1, autoAlpha: 1 }, 0);
    });
  }

  hide(e = 0) {
    this.removeEvents();
    this.hidden = true;
    gsap
      .timeline({ delay: e, defaults: { ease: "expo.inOut" } })
      .to(
        this.eyes.el,
        {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            this.eyes.el.style.display = "none";
          },
        },
        0,
      )
      .to(this.dom.loader, { duration: 1, autoAlpha: 0 }, 0)
      .to(this.dom.progressInner, { duration: 0.8, autoAlpha: 0 }, 0)
      .to(this.dom.progressInner, { duration: 1.1, scale: 1.8 }, 0)
      .set(this.enterButton.dom.el, { autoAlpha: 0 })
      .set(this.enterNoAudioButton, { autoAlpha: 0 })
      .set(this.dom.loaderBox, { autoAlpha: 1, scale: 1 })
      .call(
        () => {
          this.hiddenResolve();
        },
        undefined,
        0.3,
      );
    return this.hiddenPromise;
  }

  openEyes() {
    gsap
      .timeline({ defaults: { duration: 0.5, ease: "power3.out" } })
      .to(this.eyes.leftTop, { yPercent: -59 }, 0)
      .to(this.eyes.leftBottom, { yPercent: 43 }, 0)
      .to(this.eyes.rightTop, { yPercent: -59 }, 0)
      .to(this.eyes.rightBottom, { yPercent: 67 }, 0);
  }

  animateEyes() {
    gsap
      .timeline({
        defaults: { duration: 0.5, ease: "power3.out" },
        onComplete: () => {
          window.setTimeout(() => {
            this.animateEyes();
          }, 3e3);
        },
      })
      .to(this.eyes.left, { y: this.maxMovementY }, 0)
      .to(this.eyes.right, { y: this.maxMovementY }, 0)
      .addLabel("center", "+=0.5")
      .to(this.eyes.left, { y: 0 }, "center")
      .to(this.eyes.right, { y: 0 }, "center")
      .addLabel("down", "+=1")
      .to(this.eyes.left, { y: this.maxMovementY }, "down")
      .to(this.eyes.right, { y: this.maxMovementY }, "down")
      .addLabel("center2", "+=0.6")
      .to(this.eyes.left, { y: 0 }, "center2")
      .to(this.eyes.right, { y: 0 }, "center2")
      .addLabel("sus", "+=0.6")
      .to(this.eyes.leftTop, { yPercent: 0 }, "sus")
      .to(this.eyes.leftBottom, { yPercent: 0 }, "sus")
      .to(this.eyes.rightTop, { yPercent: 0 }, "sus")
      .to(this.eyes.rightBottom, { yPercent: 0 }, "sus")
      .addLabel("open", "+=0.8")
      .to(this.eyes.leftTop, { yPercent: -59 }, "open")
      .to(this.eyes.leftBottom, { yPercent: 43 }, "open")
      .to(this.eyes.rightTop, { yPercent: -59 }, "open")
      .to(this.eyes.rightBottom, { yPercent: 67 }, "open");
  }

  throttle(e: (...args: any[]) => void, t: number) {
    let i = false;
    return function (this: any, ...args: any[]) {
      if (i) return;
      e.apply(this, args);
      i = true;
      setTimeout(function () {
        i = false;
      }, t);
    };
  }

  removeEvents() {
    E.off("AssetsProgress", this.throttledProgressFunc);
    E.off("AssetLoader:afterResolve", this.onAssetsLoaded);
    E.off("click", this.enterButton.dom.el, this.onEnterButtonClick);
    E.off("click", this.enterNoAudioButton, this.onEnterNoAudioButtonClick);
    if (!store.isTouch) {
      E.off("mouseenter", this.enterButton.dom.el, this.eyesMouseEnter);
      E.off("mouseleave", this.enterButton.dom.el, this.eyesMouseLeave);
      E.off(store.events.RESIZE, this.onResize);
      E.off(store.events.MOUSEMOVE, this.onPointerMove);
      store.RAFCollection?.remove(this.onRAF);
    }
  }
}

export default PageLoader;
