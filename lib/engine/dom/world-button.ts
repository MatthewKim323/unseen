// WorldButton (source `Hi`, theme.js 8415-8510): footer globe button.
import gsap from "gsap";
import { store } from "../core/store";
import { E } from "../core/event-bus";

export class WorldButton {
  dom: {
    el: HTMLElement;
    icon: Element | null;
    bg: Element | null;
    hover: Element | null;
    hoverIcon: Element | null;
    textLeft: Element | null;
    textRight: Element | null;
  };
  timeline: gsap.core.Timeline | undefined;

  constructor() {
    E.bindAll(this);
    const e = document.querySelector(".js-world-btn") as HTMLElement;
    this.dom = {
      el: e,
      icon: e.querySelector(".js-world-icon"),
      bg: e.querySelector(".js-world-inner-bg"),
      hover: e.querySelector(".js-world-btn-hover"),
      hoverIcon: e.querySelector(".js-world-hover-icon"),
      textLeft: e.querySelector(".js-world-text-left"),
      textRight: e.querySelector(".js-world-text-right"),
    };
    this.build();
  }

  build() {
    if (!store.isTouch) this.addEvents();
  }

  addEvents() {
    E.on("mouseenter", this.dom.el, this.onMouseEnter);
    E.on("mouseleave", this.dom.el, this.onMouseLeave);
    E.on("click", this.dom.el, this.click);
  }

  onMouseEnter() {
    this.animateBtnIn();
  }

  onMouseLeave() {
    this.animateBtnOut();
  }

  click() {
    gsap
      .timeline({ defaults: { ease: "none", duration: 0.1 } })
      .to([this.dom.bg, this.dom.hover], { scale: 0.9 })
      .to([this.dom.bg, this.dom.hover], { scale: 1 });
  }

  animateBtnIn() {
    if (this.timeline) this.timeline.clear();
    this.timeline = gsap
      .timeline({ defaults: { ease: "expo.inOut", duration: 0.5 } })
      .to(this.dom.bg, { scale: 1.15, duration: 0.25, ease: "none" })
      .to(this.dom.icon, { scaleX: 0.3, scaleY: 0.7, rotate: "10deg" }, "<")
      .to(this.dom.hover, { scale: 1.05, duration: 0.6 }, "<0.05")
      .to(this.dom.hoverIcon, { scale: 1, opacity: 1, rotate: 0 }, "<")
      .to([this.dom.textLeft, this.dom.textRight], { x: "0%" }, "<")
      .to(this.dom.bg, { scale: 1, duration: 0.25, ease: "none" }, "<0.15");
  }

  animateBtnOut() {
    if (this.timeline) this.timeline.clear();
    this.timeline = gsap
      .timeline()
      .to(this.dom.hoverIcon, { scale: 0, opacity: 0, rotate: "-80deg", ease: "expo.out", duration: 0.5 })
      .to(this.dom.hover, { scale: 0, ease: "expo.out", duration: 0.6 }, "<")
      .to(this.dom.icon, { scale: 1, rotate: 0, duration: 0.5 }, "<")
      .to(this.dom.textLeft, { x: "100%", ease: "expo.out", duration: 0.5 }, "<")
      .to(this.dom.textRight, { x: "-100%", ease: "expo.out", duration: 0.5 }, "<");
  }

  hideBtn() {
    gsap.timeline().to(this.dom.el, { opacity: 0, ease: "expo.out", duration: 0.2 });
  }

  showBtn() {
    gsap.timeline().to(this.dom.el, { opacity: 1, ease: "expo.out", duration: 0.2 });
  }
}

export default WorldButton;
