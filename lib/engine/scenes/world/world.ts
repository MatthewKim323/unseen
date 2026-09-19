/* eslint-disable @typescript-eslint/no-explicit-any */
// World scene (source `ns`, theme.js 9432-10982): infinite wrap-around drag gallery on the "world" route.
// Every constant, ease, duration and lerp factor is copied from source.
import gsap from "gsap";
import {
  Box3,
  Color,
  Euler,
  Fog,
  Frustum,
  Group,
  LinearFilter,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
  VideoTexture,
  WebGLRenderTarget,
  WireframeGeometry,
} from "three";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { SavePass } from "three/examples/jsm/postprocessing/SavePass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { Text } from "troika-three-text";
import { store } from "../../core/store";
import { E } from "../../core/event-bus";
import { assetUrl } from "../../core/asset-url";
import { CSS3DObject } from "../../core/css3d";
import { ResourceTracker } from "../../core/dispose";
import { commonFullscreenUvVert } from "../../shaders/common-fullscreen-uv.vert.glsl";
import { worldHandMatcapMaskVert } from "../../shaders/world-hand-matcap-mask.vert.glsl";
import { worldHandMatcapMaskFrag } from "../../shaders/world-hand-matcap-mask.frag.glsl";
import { worldIntroTextFlickerVert } from "../../shaders/world-intro-text-flicker.vert.glsl";
import { worldIntroTextFlickerFrag } from "../../shaders/world-intro-text-flicker.frag.glsl";
import { worldTransitionGlitchRevealVert } from "../../shaders/world-transition-glitch-reveal.vert.glsl";
import { worldTransitionGlitchRevealFrag } from "../../shaders/world-transition-glitch-reveal.frag.glsl";
import { worldIntroGlitchScanlinesFrag } from "../../shaders/world-intro-glitch-scanlines.frag.glsl";
import { worldEdgeWarpVert } from "../../shaders/world-edge-warp.vert.glsl";
import { worldEdgeWarpBarrelFrag } from "../../shaders/world-edge-warp-barrel.frag.glsl";
import { worldScanlinesVert } from "../../shaders/world-scanlines.vert.glsl";
import { worldScanlinesTintFrag } from "../../shaders/world-scanlines-tint.frag.glsl";
import worldJson from "../../../data/world.json";
import { WorldTile, WorldTileMaterial } from "./world-tile";
import { AfterimagePass } from "./afterimage-pass";
import { WorldNavHand } from "./world-nav-hand";

// Brand word rendered in the intro (source renders its own 6-letter wordmark here).
const BRAND_WORD = "NOCTURNE";

type WorldCamera = PerspectiveCamera & { originalScale: Vector3 };
type WorldCursor = Group & { grab: Mesh; grabbing: Mesh; pointer: Mesh; originalScale: number };

const $ = (sel: string, ctx: ParentNode = document) => ctx.querySelector(sel) as HTMLElement;
const o = store;
const gl = (): any => store.Gl;

/** window.worldData is defined by the route's inline script (source); fall back to the bundled json. */
function worldData(): any[] {
  if (!window.worldData) window.worldData = JSON.parse(JSON.stringify(worldJson));
  return window.worldData;
}

export class World {
  dom: Record<string, any> = {};
  camera: WorldCamera;
  scene: Scene;
  firstLoad: boolean;
  allowControl: boolean;
  allowSwitch: boolean;
  pointerDown: boolean;
  itemOpen: boolean;
  hoveredItem: any;
  hoveredHand: any;
  updateIntroText: boolean;
  introFinished: boolean;
  showGridPlayed: boolean;
  gridReady: boolean;
  hasVisited: boolean;
  switchTimeline: gsap.core.Timeline | null;
  params: { velocity: number; trailDrag: number; trailVelocity: number };
  backgroundColorGl: Color;
  clickableItems: WorldTile[];
  postLoadVideos: any[];
  sectionWidth: number;
  sectionHeight: number;
  mousePos: Vector2;
  mouseVelocity: Vector2;
  initialCameraZ: number;
  dragVelocity: Vector2;
  smoothDragVelocity: Vector2;
  dragFriction: number;
  dragMultiplier: number;
  smoothMouse: Vector2;
  smoothMouse2: Vector2;
  _q: Quaternion;
  _e: Euler;
  options: {
    mouseMoveAngleX: number;
    mouseMoveAngleY: number;
    cameraZOffset: number;
    cameraTranslateZ: number;
    cameraMovementMultiplier: number;
    navHandsSpaceFromCenter: number;
    openItemScale: number;
  };
  raycaster: Raycaster;
  frustum: Frustum;
  cameraViewProjectionMatrix: Matrix4;
  resourceTracker: any;

  // built later
  detailsScene!: Scene;
  mediaMaterial!: WorldTileMaterial;
  media!: any[];
  dragPos!: Vector3;
  previousDragPos!: Vector3;
  dragging = false;
  items!: Group;
  gridMap!: { columns: Group[][]; rows: Group[][] };
  itemCount!: number;
  loopCount!: Vector2;
  navHands!: Group;
  handMaterial!: ShaderMaterial;
  prevHand!: WorldNavHand;
  nextHand!: WorldNavHand;
  cursor?: WorldCursor;
  details!: any;
  sphere!: LineSegments;
  introTextGroup!: Group;
  brandWordPos = 0;
  worldWordPos = 0;
  renderPass!: RenderPass;
  savePass!: SavePass;
  transitionPass!: ShaderPass;
  introPass!: ShaderPass;
  renderDetails!: RenderPass;
  edgeWarpParams!: { strength: number };
  edgeWarp!: ShaderPass;
  scanlines!: ShaderPass;
  afterImagePass!: AfterimagePass;
  visibleItems: any[] = [];
  intersects: any[] = [];
  openItem: any = false;
  openTimeline?: gsap.core.Timeline;
  draggingTl?: gsap.core.Timeline;
  introTimeline!: gsap.core.Timeline;
  showGridTimeline!: gsap.core.Timeline;
  doClick: any = false;
  clickTimeout?: ReturnType<typeof setTimeout>;
  allowSwitchTimeout?: ReturnType<typeof setTimeout>;
  hoveringPrev = false;
  hoveringNext = false;
  assets!: { itemTextures: any[]; models: Record<string, any>; textures: Record<string, any> };

  introRaf = (e: number) => {
    this.params.velocity *= 0.94;
    this.sphere.rotation.y += this.params.velocity + 0.002 * Math.sign(this.params.velocity);
    this.camera.position.z = this.initialCameraZ;
    this.camera.lookAt(this.camera.position);
    this.camera.translateZ(this.options.cameraTranslateZ);
    this.renderIntroText(e);
    this.transitionPass.uniforms.u_time.value = e;
  };

  onRaf = (e: number) => {
    if (this.allowControl) {
      if (this.dragging) {
        this.dragVelocity.x = this.dragPos.x - this.previousDragPos.x;
        this.dragVelocity.y = this.dragPos.y - this.previousDragPos.y;
      } else if (!this.itemOpen) {
        this.dragPos.x += this.dragVelocity.x;
        this.dragPos.y += this.dragVelocity.y;
        this.dragVelocity.multiplyScalar(this.dragFriction);
      }
    }
    this.smoothDragVelocity.x += 0.05 * (Math.abs(this.dragVelocity.x) - this.smoothDragVelocity.x);
    this.smoothDragVelocity.y += 0.05 * (Math.abs(this.dragVelocity.y) - this.smoothDragVelocity.y);
    this.afterImagePass.uniforms.damp.value = MathUtils.clamp(
      (this.smoothDragVelocity.x + this.smoothDragVelocity.y) * this.params.trailVelocity,
      0,
      this.params.trailDrag,
    );
    this.mouseVelocity.multiplyScalar(0.9);
    this.smoothMouse.lerp(o.mouse.glNormalized, 0.075);
    this.smoothMouse2.lerp(o.mouse.glNormalized, 0.02);
    this.updateCamera();
    this.sphere.position.x = this.camera.position.x;
    this.sphere.position.y = this.camera.position.y;
    this.updatePositions();
    this.updateCursorPosition();
    this.checkVisibility();
    this.updateProximity();
    this.updateRaycaster();
    this.scanlines.uniforms.time.value = e;
    gl().cssRenderer.render(gl().cssScene, this.camera);
  };

  onClick = (e: any) => {
    if (e.contains(o.ASScroll.containerElement) && !this.dragging && this.allowSwitch) {
      if (this.itemOpen) {
        if (this.hoveringPrev) return void this.switchItem();
        if (this.hoveringNext) return void this.switchItem(true);
        this.hideItem();
      } else if (this.intersects.length > 0) {
        this.itemOpen = true;
        this.dragVelocity.setScalar(0);
        this.openItem = this.intersects[0].object;
        this.showItem();
      }
    }
  };

  onWheel = (e: WheelEvent) => {
    if (!this.allowControl || this.itemOpen) return;
    this.dragging = true;
    this.previousDragPos.copy(this.dragPos);
    this.dragPos.x += 1.2 * e.deltaX;
    this.dragPos.y -= 1.2 * e.deltaY;
    this.params.velocity -= 1e-5 * e.deltaX;
  };

  onPointerDrag = ({ ox: e, px: t, x: i, oy: s, py: p, y: n }: any) => {
    if (!this.allowControl) return;
    if (this.itemOpen || Math.abs(e - i) < 2 || Math.abs(s - n) < 2) return;
    this.dragging = true;
    this.previousDragPos.copy(this.dragPos);
    this.dragPos.x += (t - i) * this.dragMultiplier;
    this.dragPos.y -= (p - n) * this.dragMultiplier;
    this.params.velocity += 1e-4 * (i - t);
  };

  onPointerMove = ({ mousePos: e }: any) => {
    if (!this.allowControl) return;
    this.mouseVelocity.x += 0.2 * (this.mousePos.x - e.x);
    this.mouseVelocity.y += 0.2 * (this.mousePos.y - e.y);
    this.mousePos.copy(e);
  };

  onPointerDown = ({ event: t }: any) => {
    if (!this.allowControl) return;
    this.pointerDown = true;
    this.doClick = t.target;
    clearTimeout(this.clickTimeout);
    this.clickTimeout = setTimeout(() => {
      this.doClick = false;
    }, 200);
    if (this.itemOpen) return;
    if (this.cursor) {
      this.cursor.grab.visible = false;
      this.cursor.grabbing.visible = true;
      this.cursor.pointer.visible = false;
    }
    if (this.openTimeline && this.openTimeline.isActive()) {
      // source kills tweens of `edgeWarp.u_strength` / `edgeWarp.u_scale` (undefined targets), kept as-is
      gsap.killTweensOf((this.edgeWarp as any).u_strength, null as any);
      gsap.killTweensOf((this.edgeWarp as any).u_scale);
      gsap.killTweensOf(this.camera.scale, "x,y");
    }
    if (this.draggingTl) this.draggingTl.kill();
    this.draggingTl = gsap
      .timeline({ defaults: { ease: "power2.out", duration: 0.75, delay: 0.1 } })
      .to(this.edgeWarp.uniforms.u_strength, { value: this.edgeWarpParams.strength }, 0)
      .to(this.edgeWarp.uniforms.u_scale, { value: 1.2 }, 0)
      .to(
        this.camera.scale,
        { x: this.camera.originalScale.x + 0.35, y: this.camera.originalScale.y + 0.35 },
        0,
      );
    if (this.cursor) this.draggingTl.to(this.cursor.position, { z: -100, duration: 1 }, 0);
  };

  onPointerUp = () => {
    clearTimeout(this.clickTimeout);
    if (this.doClick) this.onClick(this.doClick);
    this.dragging = false;
    this.pointerDown = false;
    if (this.cursor) {
      this.cursor.grab.visible = true;
      this.cursor.grabbing.visible = false;
    }
    if (this.itemOpen) return;
    if (this.draggingTl) this.draggingTl.kill();
    this.draggingTl = gsap
      .timeline({ defaults: { ease: "expo.out", duration: 1 } })
      .to(this.edgeWarp.uniforms.u_strength, { value: 0 }, 0)
      .to(this.edgeWarp.uniforms.u_scale, { value: 1 }, 0)
      .to(this.camera.scale, { x: this.camera.originalScale.x, y: this.camera.originalScale.y }, 0);
    if (this.cursor) this.draggingTl.to(this.cursor.position, { z: 0, duration: 1 }, 0);
  };

  onKeyUp = (e: KeyboardEvent) => {
    if (!this.itemOpen || this.dragging || !this.allowSwitch) return;
    if (e.key === "ArrowLeft") this.switchItem();
    else if (e.key === "ArrowRight") this.switchItem(true);
    else if (e.key === "Escape") this.hideItem();
  };

  onLinkEnter = () => {
    if (this.cursor && this.allowControl)
      gsap.to(this.cursor.scale, { x: 0, y: 0, z: 0, ease: "expo.out", duration: 0.2, overwrite: true });
  };

  onLinkLeave = () => {
    if (this.cursor && this.allowControl)
      gsap.to(this.cursor.scale, {
        x: this.cursor.originalScale,
        y: this.cursor.originalScale,
        z: this.cursor.originalScale,
        ease: "elastic.out(1, 0.3)",
        duration: 2,
        overwrite: true,
      });
  };

  onResize = () => {
    this.scaleScene();
    this.camera.fov = (2 * Math.atan(o.window.fullHeight / 2 / this.initialCameraZ) * 180) / Math.PI;
    this.camera.aspect = o.window.w / o.window.fullHeight;
    this.camera.updateProjectionMatrix();
    this.setOpenItemScale();
  };

  updateHtmlScale = () => {
    this.details.scale.setScalar(1.5 / (0.001 * gl().cssRenderer.cache.camera.fov));
  };

  constructor() {
    this.camera = gl().camera.clone() as WorldCamera;
    this.scene = new Scene();
    this.firstLoad = false;
    this.allowControl = false;
    this.allowSwitch = true;
    this.pointerDown = false;
    this.itemOpen = false;
    this.hoveredItem = false;
    this.hoveredHand = false;
    this.updateIntroText = true;
    this.introFinished = false;
    this.showGridPlayed = false;
    this.gridReady = false;
    this.hasVisited = false;
    this.switchTimeline = null;
    this.params = { velocity: 0.005, trailDrag: 0.7, trailVelocity: 0.03 };
    this.backgroundColorGl = new Color(328965);
    this.scene.background = this.backgroundColorGl;
    this.scene.fog = new Fog(this.backgroundColorGl, this.camera.position.z, this.camera.far);
    this.scaleScene();
    this.clickableItems = [];
    this.postLoadVideos = [];
    this.sectionWidth = 700;
    this.sectionHeight = 700;
    this.mousePos = new Vector2(o.window.w / 2, o.window.h / 2);
    this.mouseVelocity = new Vector2();
    this.initialCameraZ = this.camera.position.z;
    this.dragVelocity = new Vector2();
    this.smoothDragVelocity = new Vector2();
    this.dragFriction = o.isTouch ? 0.94 : 0.96;
    this.dragMultiplier = o.isTouch ? 3 : 1.25;
    this.smoothMouse = new Vector2();
    this.smoothMouse2 = new Vector2();
    this._q = new Quaternion();
    this._e = new Euler();
    this.options = {
      mouseMoveAngleX: 0.135,
      mouseMoveAngleY: 0.035,
      cameraZOffset: 100,
      cameraTranslateZ: 0,
      cameraMovementMultiplier: 0,
      navHandsSpaceFromCenter: o.mq.md.matches ? 520 : 320,
      openItemScale: 1.3,
    };
    this.setOpenItemScale();
    this.raycaster = new Raycaster();
    this.frustum = new Frustum();
    this.cameraViewProjectionMatrix = new Matrix4();
    this.resourceTracker = new ResourceTracker();
  }

  build() {
    Object.assign(this.dom, {
      details: $(".js-details"),
      detailsTitleWrap: $(".js-details-title-wrap"),
      detailsTitle: $(".js-details-title"),
      detailsMeta: $(".js-details-meta"),
      detailsAuthorWrap: $(".js-details-author-wrap"),
      detailsAuthor: $(".js-details-author"),
      detailsBtn: $(".js-details-btn"),
      detailsCaption: $(".js-details-caption"),
    });
    this.camera.rotation.set(0, 0, 0);
    this.detailsScene = new Scene();
    this.mediaMaterial = new WorldTileMaterial();
    this.mediaMaterial.setFog(this.scene.fog as Fog);
    this.media = worldData();
    for (let e = 0; e < this.media.length; e++) this.media[e].color = new Color(this.media[e].color);
    this.addItems();
    this.addDetails();
    this.buildNavHands();
    this.buildCursor();
    this.initialCameraZ = this.camera.position.z;
    this.dragPos = this.camera.position.clone();
    this.previousDragPos = this.dragPos.clone();
    this.addPost();
    this.addEvents();
    this.gridReady = true;
    if (!this.firstLoad) this.showGrid();
    if (o.urlParams.has("skipintro")) {
      this.introFinished = true;
      this.showGrid();
    }
  }

  buildIntro() {
    this.dom.introWrap = $(".js-world-intro");
    this.dom.introSvg = $("svg", this.dom.introWrap);
    this.dom.introText = $("p", this.dom.introWrap);
    document.body.appendChild(this.dom.introWrap);
    this.addSphere();
    const e: Promise<void>[] = [];
    this.introTextGroup = new Group();
    const t = new Text();
    Object.assign(t, {
      text: BRAND_WORD,
      font: gl().webglFonts["Neue Montreal"].url,
      fontSize: this.camera.scale.x === 2 ? 85 : 170,
      letterSpacing: -0.03,
      anchorX: "center",
      anchorY: "middle",
      color: 16777215,
      sdfGlyphSize: gl().webglFonts["Neue Montreal"].sdfGlyphSize,
      textAlign: "center",
      material: new ShaderMaterial({
        vertexShader: worldIntroTextFlickerVert,
        fragmentShader: worldIntroTextFlickerFrag,
        uniforms: {
          u_time: { value: 0 },
          u_strength: { value: 1 },
          u_opacity: { value: 0 },
        },
        depthTest: false,
      }),
    });
    e.push(new Promise((r) => t.sync(r)));
    this.introTextGroup.add(t);
    const i = new Text();
    Object.assign(i, {
      text: "WORLD",
      font: gl().webglFonts["Saol Display"].url,
      fontSize: this.camera.scale.x === 2 ? 91 : 178,
      letterSpacing: -0.03,
      anchorX: "center",
      anchorY: "middle",
      color: 16777215,
      sdfGlyphSize: gl().webglFonts["Saol Display"].sdfGlyphSize,
    });
    i.material.opacity = 0;
    i.material.depthTest = false;
    i.position.y = this.camera.scale.x === 2 ? 6 : 11;
    e.push(new Promise((r) => i.sync(r)));
    this.introTextGroup.add(i);
    this.scene.add(this.introTextGroup);
    Promise.all(e).then(() => {
      const e2 = (2 * t.geometry.boundingBox.max.x - 2 * i.geometry.boundingBox.max.x) / 2;
      this.brandWordPos = -t.geometry.boundingBox.max.x + e2;
      this.worldWordPos = i.geometry.boundingBox.max.x + e2 - 20;
      if (this.camera.scale.x === 2) this.worldWordPos += 7;
      if (this.firstLoad)
        o.PageLoader.hiddenPromise.then(() => {
          this.playIntro(0);
        });
    });
    this.addIntroPost();
  }

  in() {
    return new Promise<void>((e) => {
      this.renderPass.enabled = true;
      this.savePass.enabled = true;
      this.transitionPass.enabled = true;
      gsap
        .timeline()
        .fromTo(
          this.transitionPass.uniforms.u_progress,
          { value: 0 },
          {
            value: 1,
            duration: 2.5,
            ease: "power2.inOut",
            onComplete: () => {
              this.savePass.enabled = false;
              this.transitionPass.enabled = false;
              e();
            },
          },
        )
        .fromTo(
          this.options,
          { cameraTranslateZ: 1e3 },
          { cameraTranslateZ: 0, duration: 2.5, ease: "power2.inOut" },
          "<",
        )
        .call(
          () => {
            document.body.classList.add("dark");
          },
          undefined,
          1.6,
        );
      this.playIntro();
    });
  }

  out() {
    return new Promise<void>((e) => {
      this.allowControl = false;
      this.savePass.enabled = true;
      this.transitionPass.enabled = true;
      gsap.fromTo(
        this.transitionPass.uniforms.u_progress,
        { value: 1 },
        {
          value: 0,
          duration: 2.5,
          ease: "power2.inOut",
          onComplete: () => {
            e();
            setTimeout(() => {
              this.savePass.enabled = false;
              this.transitionPass.enabled = false;
            }, 100);
          },
        },
      );
      gsap.fromTo(
        this.options,
        { cameraTranslateZ: 0 },
        { cameraTranslateZ: 1e3, duration: 2.5, ease: "power2.inOut" },
      );
    });
  }

  playIntro(e = 0.5) {
    this.updateIntroText = true;
    this.addIntroEvents();
    this.introPass.enabled = true;
    const words = this.introTextGroup.children as any[];
    this.introTimeline = gsap
      .timeline({
        delay: e,
        defaults: { ease: "expo.inOut", duration: this.hasVisited ? 1 : 1.5 },
        onComplete: () => {
          this.introFinished = true;
          if (this.gridReady) this.showGrid();
          this.hasVisited = true;
        },
      })
      .to(
        this.sphere.scale,
        { x: 500, y: 500, z: 500, duration: this.hasVisited ? 2 : 3, ease: "expo.out" },
        0,
      )
      .to(
        words[0].material.uniforms.u_opacity,
        { value: 1, duration: 0.25, ease: "expo.out" },
        this.hasVisited ? "<1" : "<",
      )
      .to(words[0].material.uniforms.u_strength, { value: 0, duration: 0.2, ease: "power2.out" }, ">0.5")
      .to(words[0].position, { x: this.brandWordPos }, ">0.3")
      .to(words[1].position, { x: this.worldWordPos }, "<")
      .to(words[1].material, { opacity: 1 }, "<");
    if (!this.hasVisited)
      this.introTimeline
        .set(this.dom.introWrap, { visibility: "visible" }, "<")
        .fromTo(this.dom.introSvg, { rotateY: 90 }, { rotateY: 0 }, "<")
        .fromTo(
          this.dom.introText,
          { rotateZ: 5, y: "100%" },
          { rotateZ: 0, y: "0%", ease: "expo.out" },
          "<",
        );
  }

  showGrid() {
    if (!this.introFinished || this.showGridPlayed) return;
    this.showGridPlayed = true;
    const words = this.introTextGroup.children as any[];
    this.showGridTimeline = gsap
      .timeline({
        delay: this.hasVisited ? 0 : 1.5,
        defaults: { ease: "expo.inOut", duration: 1.5 },
        onComplete: () => {
          this.updateIntroText = false;
          this.introTextGroup.visible = false;
          this.introPass.enabled = false;
        },
      })
      .to(this.introPass.uniforms.u_strength, { value: 0, duration: 1, ease: "power2.inOut" }, 0)
      .to(this.sphere.scale, { x: 700, y: 700, z: 700 }, 0)
      .to(words[0].material.uniforms.u_opacity, { value: 0 }, "<")
      .to(words[1].material, { opacity: 0 }, "<")
      .to(this.dom.introSvg, { rotateY: 90 }, "<")
      .to(this.dom.introText, { rotateZ: 5, y: "100%" }, "<")
      .to(this.dom.introWrap, { autoAlpha: 0, duration: 0.5 }, "<0.5")
      .to(this.items.position, { z: 0, duration: 1.5, ease: "power4.out" }, 0.4)
      .to(this.options, { cameraMovementMultiplier: 0.5 }, "<")
      .to(gl().cssRenderer.domElement, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, "<")
      .call(
        () => {
          this.allowControl = true;
          if (this.cursor)
            gsap.to(this.cursor.scale, {
              x: this.cursor.originalScale,
              y: this.cursor.originalScale,
              z: this.cursor.originalScale,
              ease: "elastic.out(1, 0.3)",
              duration: 2,
            });
        },
        undefined,
        1,
      );
  }

  addItems() {
    this.items = new Group();
    this.items.position.z = -this.camera.far;
    this.gridMap = { columns: [], rows: [] };
    this.itemCount = Math.pow(Math.round(Math.sqrt(2 * this.media.length)), 2);
    this.itemCount = this.itemCount < 25 ? 25 : this.itemCount;
    const e = Math.sqrt(this.itemCount);
    let t = 0;
    let i = 0;
    let col = 0;
    let row = 0;
    const r = 100 + Math.round(this.itemCount / 2);
    this.loopCount = new Vector2(r, r);
    this.camera.position.x = this.sectionWidth * this.loopCount.x;
    this.camera.position.y = this.sectionHeight * this.loopCount.y;
    for (let k = 0; k < this.itemCount; k++) {
      if (!this.gridMap.columns[col]) this.gridMap.columns[col] = [];
      if (!this.gridMap.rows[row]) this.gridMap.rows[row] = [];
      const a = new Group() as Group & { offsetPosition: Vector3 };
      a.offsetPosition = new Vector3();
      const l = new WorldTile(this.mediaMaterial, { ...this.media[t], index: k });
      l.updateTexture(this.assets.itemTextures[t]);
      l.position.set(MathUtils.randInt(-125, 125), MathUtils.randInt(-125, 125), MathUtils.randInt(-50, 50));
      l.originalPosition = l.position.clone();
      a.add(l);
      this.gridMap.columns[col].push(a);
      this.gridMap.rows[row].push(a);
      this.items.add(a);
      this.clickableItems.push(l);
      t++;
      i++;
      col++;
      if (col === e) col = 0;
      if (i % e === 0) row++;
      if (t === this.media.length) t = 0;
    }
    this.updatePositions(true);
    this.scene.add(this.items);
    this.resourceTracker.track(this.items);
  }

  buildNavHands() {
    this.navHands = new Group();
    this.navHands.position.z = 290;
    this.handMaterial = new ShaderMaterial({
      vertexShader: worldHandMatcapMaskVert,
      fragmentShader: worldHandMatcapMaskFrag,
      uniforms: {
        uMatcapMap: { value: this.assets.textures.pointer },
        uMatcap: { value: gl().assets.textures.matcapBlack },
        uAlpha: { value: 0 },
      },
      depthTest: false,
      transparent: true,
    });
    this.prevHand = new WorldNavHand(
      this.assets.models.pointer.geometry.clone(),
      this.handMaterial,
      "prev",
      this.options.navHandsSpaceFromCenter,
    );
    this.navHands.add(this.prevHand);
    this.nextHand = new WorldNavHand(
      this.assets.models.pointer.geometry.clone(),
      this.handMaterial,
      "next",
      this.options.navHandsSpaceFromCenter,
    );
    this.navHands.add(this.nextHand);
    this.detailsScene.add(this.navHands);
    this.resourceTracker.track(this.navHands);
  }

  handMat(map: any) {
    return new ShaderMaterial({
      vertexShader: worldHandMatcapMaskVert,
      fragmentShader: worldHandMatcapMaskFrag,
      uniforms: {
        uMatcapMap: { value: map },
        uMatcap: { value: gl().assets.textures.matcapBlack },
        uAlpha: { value: 1 },
      },
      depthTest: false,
      transparent: true,
    });
  }

  buildCursor() {
    if (o.isTouch) return;
    const c = new Group() as WorldCursor;
    this.cursor = c;
    c.grab = new Mesh(this.assets.models.grab.geometry, this.handMat(this.assets.textures.grab));
    c.add(c.grab);
    c.grabbing = new Mesh(this.assets.models.grabbing.geometry, this.handMat(this.assets.textures.grabbing));
    c.grabbing.visible = false;
    c.add(c.grabbing);
    c.pointer = new Mesh(this.assets.models.pointer.geometry.clone(), this.handMat(this.assets.textures.pointer));
    c.pointer.visible = false;
    c.add(c.pointer);
    c.renderOrder = 100;
    c.position.z = 0;
    c.originalScale = 20;
    c.scale.setScalar(0);
    this.resourceTracker.track(c);
    this.scene.add(c);
  }

  addDetails() {
    this.details = new CSS3DObject($(".js-details"));
    this.resourceTracker.track(this.details);
    gl().cssScene.add(this.details);
  }

  addSphere() {
    const e = new WireframeGeometry(new SphereGeometry(1, 50, 28));
    const t = new LineBasicMaterial({ color: 3881787 });
    this.sphere = new LineSegments(e, t);
    this.sphere.scale.setScalar(50);
    this.sphere.position.z = -450;
    this.scene.add(this.sphere);
  }

  addIntroPost() {
    const G = gl();
    this.renderPass = new RenderPass(this.scene, this.camera);
    (this.renderPass as any).name = "World";
    this.renderPass.enabled = this.firstLoad;
    this.savePass = new SavePass(
      new WebGLRenderTarget(
        o.window.w * G.renderer.getPixelRatio(),
        o.window.fullHeight * G.renderer.getPixelRatio(),
        { minFilter: LinearFilter, magFilter: LinearFilter, depthBuffer: false },
      ),
    );
    (this.savePass as any).name = "World Final";
    this.savePass.enabled = false;
    this.transitionPass = new ShaderPass(
      new ShaderMaterial({
        vertexShader: worldTransitionGlitchRevealVert,
        fragmentShader: worldTransitionGlitchRevealFrag,
        uniforms: {
          u_fromScene: { value: this.savePass.renderTarget.texture },
          u_toScene: { value: null },
          u_noise: { value: G.assets.textures.gradientNoise },
          u_progress: { value: 0 },
          u_time: { value: 0 },
        },
        transparent: true,
      }),
    );
    (this.transitionPass as any).name = "World Transition";
    this.transitionPass.enabled = false;
    this.introPass = new ShaderPass(
      new ShaderMaterial({
        vertexShader: commonFullscreenUvVert,
        fragmentShader: worldIntroGlitchScanlinesFrag,
        uniforms: {
          tDiffuse: { value: null },
          u_strength: { value: 1 },
          u_noise: { value: G.assets.textures.gradientNoise },
          u_time: G.globalUniforms.u_time,
        },
        transparent: true,
      }),
    );
    (this.introPass as any).name = "World Intro";
    this.introPass.enabled = false;
    G.composerPasses.add(this.renderPass, 50);
    G.composerPasses.add(this.introPass, 55);
    G.composerPasses.add(this.savePass, 56);
    G.composerPasses.add(this.transitionPass, 57);
  }

  addPost() {
    const G = gl();
    this.renderDetails = new RenderPass(this.detailsScene, this.camera);
    this.renderDetails.clear = false;
    this.renderDetails.clearDepth = true;
    this.renderDetails.enabled = false;
    (this.renderDetails as any).name = "World Details";
    this.edgeWarpParams = { strength: 0.6 };
    this.edgeWarp = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        u_strength: { value: 0 },
        u_scale: { value: 1 },
      },
      fragmentShader: worldEdgeWarpBarrelFrag,
      vertexShader: worldEdgeWarpVert,
    });
    (this.edgeWarp as any).name = "World Edge Warp";
    this.scanlines = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        time: { value: 0 },
        u_strength: { value: 0 },
        u_color: { value: new Color(16776960) },
      },
      fragmentShader: worldScanlinesTintFrag,
      vertexShader: worldScanlinesVert,
    });
    (this.scanlines as any).name = "World Scanlines";
    this.scanlines.enabled = false;
    this.afterImagePass = new AfterimagePass();
    G.composerPasses.add(this.afterImagePass, 51);
    G.composerPasses.add(this.edgeWarp, 52);
    G.composerPasses.add(this.scanlines, 53);
    G.composerPasses.add(this.renderDetails, 54);
  }

  checkVisibility() {
    this.camera.updateMatrixWorld();
    this.camera.matrixWorldInverse.copy(this.camera.matrixWorld).invert();
    this.cameraViewProjectionMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.cameraViewProjectionMatrix);
    this.visibleItems = [];
    for (let e = 0; e < this.items.children.length; e++) {
      const t = this.items.children[e];
      if (this.frustum.intersectsObject(t.children[0])) this.visibleItems.push(t);
    }
  }

  updatePositions(e = false) {
    const t = Math.round(this.camera.position.x / this.sectionWidth);
    const i = Math.round(this.camera.position.y / this.sectionHeight);
    let s = 0;
    if (t !== this.loopCount.x || e) {
      this.loopCount.x = t;
      s = this.sectionWidth * this.loopCount.x;
      for (let a = 0; a < this.gridMap.columns.length; a++)
        for (let b = 0; b < this.gridMap.columns[a].length; b++)
          this.gridMap.columns[Math.abs(a + this.loopCount.x) % this.gridMap.columns.length][b].position.x =
            this.sectionWidth * (a - 2) + s;
    }
    if (i !== this.loopCount.y || e) {
      this.loopCount.y = i;
      s = this.sectionHeight * this.loopCount.y;
      for (let a = 0; a < this.gridMap.rows.length; a++)
        for (let b = 0; b < this.gridMap.rows[a].length; b++)
          this.gridMap.rows[Math.abs(a + this.loopCount.y) % this.gridMap.rows.length][b].position.y =
            this.sectionHeight * (a - 2) + s;
    }
  }

  updateProximity() {
    if (this.itemOpen) return;
    for (let e = 0; e < this.visibleItems.length; e++) {
      const t = this.visibleItems[e];
      t.offsetPosition.x = t.position.x + t.children[0].position.x - this.camera.position.x;
      t.offsetPosition.y = t.position.y + t.children[0].position.y - this.camera.position.y;
      const i = o.mouse.gl.distanceTo(t.offsetPosition);
      t.children[0].position.z = MathUtils.lerp(
        t.children[0].position.z,
        t.children[0].originalPosition.z - 0.15 * i,
        0.05,
      );
    }
  }

  updateCamera() {
    this.camera.position.x = MathUtils.lerp(this.camera.position.x, this.dragPos.x, 0.15);
    this.camera.position.y = MathUtils.lerp(this.camera.position.y, this.dragPos.y, 0.15);
    this.camera.position.z = this.initialCameraZ;
    this.camera.lookAt(this.camera.position);
    this.camera.translateZ(this.options.cameraTranslateZ);
    if (o.isTouch) return;
    this.camera.translateZ(-this.options.cameraZOffset * this.options.cameraMovementMultiplier);
    this._e.set(
      this.smoothMouse.y * this.options.mouseMoveAngleY * this.options.cameraMovementMultiplier,
      -this.smoothMouse.x * this.options.mouseMoveAngleX * this.options.cameraMovementMultiplier,
      0,
    );
    this._q.setFromEuler(this._e);
    this.camera.quaternion.multiply(this._q);
    this._e.set(0, 0, -0.05 * (this.smoothMouse.x - this.smoothMouse2.x) * this.options.cameraMovementMultiplier);
    this._q.setFromEuler(this._e);
    this.camera.quaternion.multiply(this._q);
    this.camera.translateZ(this.options.cameraZOffset * this.options.cameraMovementMultiplier);
    this.camera.updateMatrixWorld();
  }

  fadeOutVideo(item: any, duration: number) {
    gsap.to(item.material.uniforms.u_texture.value.image, {
      volume: 0,
      duration,
      onComplete: () => {
        item.material.uniforms.u_texture.value.image.pause();
      },
    });
  }

  updateRaycaster() {
    if (!this.allowControl) return;
    this.raycaster.setFromCamera(o.mouse.glNormalized, this.camera);
    if (this.itemOpen) {
      this.hoveringPrev = this.raycaster.ray.intersectsBox(this.prevHand.bbox);
      this.hoveringNext = this.raycaster.ray.intersectsBox(this.nextHand.bbox);
      if (this.hoveringNext && this.hoveredHand !== this.nextHand) {
        this.hoveredHand = this.nextHand;
        this.hoveredHand.onHover();
      }
      if (this.hoveringPrev && this.hoveredHand !== this.prevHand) {
        this.hoveredHand = this.prevHand;
        this.hoveredHand.onHover();
      }
      if (!this.hoveringPrev && !this.hoveringNext && this.hoveredHand !== false) {
        this.hoveredHand.reset();
        this.hoveredHand = false;
      }
      if (this.hoveredHand && !o.isTouch) this.hoveredHand.updateHoverRotation(this.raycaster.ray.direction);
      return;
    }
    if (!(o.isTouch || !this.pointerDown)) return;
    this.intersects = this.raycaster.intersectObjects(this.clickableItems, false);
    if (this.intersects.length > 0 && this.hoveredItem !== this.intersects[0].object) {
      if (this.hoveredItem.assetType === "video" && !this.hoveredItem.material.uniforms.u_texture.value.image.paused)
        this.fadeOutVideo(this.hoveredItem, 0.2);
      this.hoveredItem = this.intersects[0].object;
      const img = this.hoveredItem.material.uniforms.u_texture.value.image;
      if (this.hoveredItem.assetType === "video" && img.paused) {
        img.muted = false;
        img.volume = 0;
        img.play();
        gsap.to(img, { volume: 1, duration: 0.2 });
      }
      if (this.cursor) {
        this.cursor.grab.visible = false;
        this.cursor.grabbing.visible = false;
        this.cursor.pointer.visible = true;
      }
    } else if (this.intersects.length === 0 && this.hoveredItem !== false) {
      if (this.hoveredItem.assetType === "video" && !this.hoveredItem.material.uniforms.u_texture.value.image.paused)
        this.fadeOutVideo(this.hoveredItem, 0.2);
      if (this.cursor) {
        this.cursor.grab.visible = true;
        this.cursor.grabbing.visible = false;
        this.cursor.pointer.visible = false;
      }
      this.hoveredItem = false;
    }
  }

  updateDetails() {
    const op = this.openItem.options;
    if (op.show_caption) {
      this.dom.detailsTitle.style.display = "none";
      this.dom.detailsAuthorWrap.style.display = "none";
      this.dom.detailsCaption.style.display = "block";
      this.dom.detailsCaption.innerHTML = op.caption;
    } else {
      this.dom.detailsTitle.innerHTML = op.title;
      this.dom.detailsTitle.style.display = "block";
      if (op.author.length) {
        this.dom.detailsAuthor.innerHTML = op.author;
        this.dom.detailsAuthorWrap.style.display = "block";
      } else this.dom.detailsAuthorWrap.style.display = "none";
      this.dom.detailsCaption.style.display = "none";
    }
    if (op.link !== "") {
      this.dom.detailsBtn.href = op.link;
      this.dom.detailsBtn.style.visibility = "visible";
    } else this.dom.detailsBtn.style.visibility = "hidden";
  }

  switchItem(e?: boolean) {
    if (!this.itemOpen) return;
    this.allowSwitch = false;
    clearTimeout(this.allowSwitchTimeout);
    this.allowSwitchTimeout = setTimeout(() => {
      this.allowSwitch = true;
    }, 1e3);
    gsap.killTweensOf([this.prevHand.position, this.nextHand.position]);
    const t = this.openItem;
    const i = e ? 1 : -1;
    let idx = t.options.index + i;
    if (idx === this.itemCount) idx = 0;
    else if (idx === -1) idx = this.itemCount - 1;
    this.openItem = this.clickableItems[idx];
    this.dragPos.x = this.openItem.parent.position.x + this.openItem.position.x;
    this.dragPos.y = this.openItem.parent.position.y + this.openItem.position.y;
    this.prevHand.updateBox3(this.dragPos);
    this.nextHand.updateBox3(this.dragPos);
    this.updateDetails();
    const n = this.openItem.options.color;
    this.detailsScene.add(this.openItem.parent);
    this.items.add(t.parent);
    const r = (this.openItem.geometry.boundingBox as Box3).max;
    const a = e ? this.nextHand : this.prevHand;
    a.spinCount++;
    if (t.assetType === "video" && !t.material.uniforms.u_texture.value.image.paused) this.fadeOutVideo(t, 0.4);
    const img = this.openItem.material.uniforms.u_texture.value.image;
    if (this.openItem.assetType === "video" && img.paused) {
      img.muted = false;
      img.volume = 0;
      img.play();
      gsap.to(img, { volume: 1, duration: 0.4 });
    }
    this.switchTimeline = gsap
      .timeline({ defaults: { ease: "expo.out", duration: 0.75 } })
      .to(t.position, { duration: 1, z: t.originalPosition.z }, 0)
      .to(t.scale, { duration: 1, x: t.originalScale.x, y: t.originalScale.y }, 0)
      .to(this.openItem.position, { duration: 1, z: 300 }, 0)
      .to(this.openItem.scale, { duration: 1, x: this.options.openItemScale, y: this.options.openItemScale }, 0)
      .to(this.scanlines.uniforms.u_color.value, { duration: 1, r: n.r, g: n.g, b: n.b }, 0)
      .to(this.navHands.position, { x: this.dragPos.x, y: this.dragPos.y }, 0)
      .to(this.details.position, { x: this.dragPos.x, y: this.dragPos.y }, 0)
      .to(this.dom.detailsTitleWrap, { y: -r.y * this.options.openItemScale - 140 }, 0)
      .to(this.dom.detailsMeta, { y: r.y * this.options.openItemScale + 140 }, 0)
      .to(
        a.mesh.rotation,
        { x: MathUtils.degToRad(e ? 0 : 180) + MathUtils.degToRad(360) * a.spinCount },
        0,
      );
  }

  showItem() {
    if (this.openTimeline) this.openTimeline.kill();
    this.dragPos.x = this.openItem.parent.position.x + this.openItem.position.x;
    this.dragPos.y = this.openItem.parent.position.y + this.openItem.position.y;
    this.prevHand.updateBox3(this.dragPos);
    this.nextHand.updateBox3(this.dragPos);
    this.updateDetails();
    const e = (this.openItem.geometry.boundingBox as Box3).max;
    gsap.set(this.details.position, { x: this.dragPos.x, y: this.dragPos.y, z: 0 });
    gsap.set(this.dom.detailsTitleWrap, { y: -e.y * this.options.openItemScale - 140 });
    gsap.set(this.dom.detailsMeta, { y: e.y * this.options.openItemScale + 140 });
    this.navHands.position.set(this.dragPos.x, this.dragPos.y, -10);
    if (this.cursor) this.cursor.visible = false;
    this.scanlines.uniforms.u_color.value.copy(this.openItem.options.color);
    this.renderDetails.enabled = true;
    this.scanlines.enabled = true;
    this.detailsScene.add(this.openItem.parent);
    this.openTimeline = gsap
      .timeline({ defaults: { ease: "expo.out", duration: 1.5 } })
      .to(this.openItem.position, { duration: 2, z: 300 }, 0)
      .to(this.openItem.scale, { duration: 2, x: this.options.openItemScale, y: this.options.openItemScale }, 0)
      .to(this.scanlines.uniforms.u_strength, { value: 1 }, 0)
      .to(this.edgeWarp.uniforms.u_strength, { value: this.edgeWarpParams.strength }, 0)
      .to(this.edgeWarp.uniforms.u_scale, { value: 1.2 }, 0)
      .to(
        this.camera.scale,
        { duration: 2, x: this.camera.originalScale.x + 0.35, y: this.camera.originalScale.y + 0.35 },
        0,
      )
      .to(this.options, { duration: 2, cameraMovementMultiplier: 1 }, 0)
      .to(this.navHands.position, { z: 290, duration: 2 }, 0.2)
      .to(this.prevHand.position, { x: this.prevHand.originalPosition.x, duration: 1.8 }, 0.2)
      .to(this.nextHand.position, { x: this.nextHand.originalPosition.x, duration: 1.8 }, 0.2)
      .to(
        this.handMaterial.uniforms.uAlpha,
        {
          value: 1,
          duration: 1.8,
          onComplete: () => {
            this.prevHand.renderOrder = 10;
            this.nextHand.renderOrder = 10;
          },
        },
        0.2,
      )
      .to(this.details.position, { z: 200, duration: 1.5, ease: "expo.out" }, 0.5)
      .to(this.details.element, { autoAlpha: 1, duration: 1 }, 0.5);
    if (this.cursor) this.openTimeline.to(this.cursor.scale, { x: 0, y: 0, z: 0 }, 0);
  }

  hideItem() {
    if (!this.openItem) return;
    if (this.switchTimeline && this.switchTimeline.isActive()) return;
    const t = this.openItem;
    this.openItem = false;
    if (this.openTimeline) this.openTimeline.kill();
    this.prevHand.spinCount = 0;
    this.nextHand.spinCount = 0;
    this.prevHand.rotation.x = 0;
    this.nextHand.rotation.x = 0;
    if (this.cursor) this.cursor.visible = true;
    this.openTimeline = gsap
      .timeline({
        defaults: { ease: "expo.inOut", duration: 1.5 },
        onComplete: () => {
          if (!this.itemOpen) {
            this.renderDetails.enabled = false;
            this.scanlines.enabled = false;
          }
        },
      })
      .to(t.position, { duration: 1.1, z: t.originalPosition.z }, 0)
      .to(t.scale, { duration: 1.1, x: t.originalScale.x, y: t.originalScale.y }, 0)
      .to(this.camera.rotation, { x: 0, y: 0, z: 0 }, 0)
      .to(this.options, { cameraMovementMultiplier: 0.5 }, 0)
      .to(this.scanlines.uniforms.u_strength, { value: 0 }, 0)
      .to(this.edgeWarp.uniforms.u_strength, { value: 0 }, 0)
      .to(this.edgeWarp.uniforms.u_scale, { value: 1 }, 0)
      .to(this.camera.scale, { x: this.camera.originalScale.x, y: this.camera.originalScale.y }, 0)
      .call(
        () => {
          this.prevHand.renderOrder = 0;
          this.nextHand.renderOrder = 0;
        },
        undefined,
        0,
      )
      .to(this.navHands.position, { z: -10, duration: 1.1 }, 0)
      .to(this.prevHand.position, { x: o.mq.sm.matches ? 0 : this.prevHand.originalPosition.x + 40 }, 0)
      .to(this.nextHand.position, { x: o.mq.sm.matches ? 0 : this.nextHand.originalPosition.x - 40 }, 0)
      .to(this.handMaterial.uniforms.uAlpha, { value: 0, duration: 1.35 }, 0)
      .to(this.details.position, { duration: 0.8, z: 0 }, 0)
      .to(this.details.element, { duration: 0.65, autoAlpha: 0 }, 0)
      .call(
        () => {
          this.itemOpen = false;
        },
        undefined,
        0.2,
      )
      .call(
        () => {
          if (!(this.openItem && this.openItem === t)) this.items.add(t.parent);
        },
        undefined,
        1.1,
      );
    if (this.cursor)
      this.openTimeline.to(
        this.cursor.scale,
        { x: this.cursor.originalScale, y: this.cursor.originalScale, z: this.cursor.originalScale, duration: 0.5 },
        1,
      );
  }

  addIntroEvents() {
    o.RAFCollection!.add(this.introRaf, 70);
    E.on(o.events.RESIZE, this.onResize);
  }

  removeIntroEvents() {
    o.RAFCollection!.remove(this.introRaf);
    E.off(o.events.RESIZE, this.onResize);
  }

  addEvents() {
    o.RAFCollection!.add(this.onRaf, 80);
    E.on(o.events.MOUSEMOVE, this.onPointerMove);
    E.on(o.events.MOUSEDRAG, this.onPointerDrag);
    E.on(o.events.MOUSEDOWN, this.onPointerDown);
    E.on(o.events.MOUSEUP, this.onPointerUp);
    E.on("wheel", window, this.onWheel as any);
    E.on("keyup", window, this.onKeyUp as any);
    E.delegate("mouseenter", "a, button", this.onLinkEnter);
    E.delegate("mouseleave", "a, button", this.onLinkLeave);
  }

  renderIntroText(e: number) {
    if (!this.updateIntroText) return;
    this.introTextGroup.position.x = this.camera.position.x;
    this.introTextGroup.position.y = this.camera.position.y;
    (this.introTextGroup.children[0] as any).material.uniforms.u_time.value = e;
  }

  updateCursorPosition() {
    if (!this.cursor) return;
    this.cursor.position.x = MathUtils.lerp(
      this.cursor.position.x,
      o.mouse.gl.x * this.camera.scale.x * 1.1 + this.dragPos.x,
      0.15,
    );
    this.cursor.position.y = MathUtils.lerp(
      this.cursor.position.y,
      o.mouse.gl.y * this.camera.scale.x * 1.1 + this.dragPos.y,
      0.15,
    );
    this.cursor.rotation.x = 0.03 * -this.mouseVelocity.y;
    this.cursor.rotation.y = 0.02 * this.mouseVelocity.x;
    this.cursor.rotation.z = 0.01 * this.mouseVelocity.x;
  }

  scaleScene() {
    let e = 1920 / o.window.w;
    e = MathUtils.clamp(e, 0.3, 2);
    this.camera.scale.set(e, e, 1);
    this.camera.originalScale = this.camera.scale.clone();
    if (this.itemOpen) {
      this.camera.scale.x = this.camera.originalScale.x + 0.35;
      this.camera.scale.y = this.camera.originalScale.y + 0.35;
    }
  }

  setOpenItemScale() {
    if (
      (o.window.w > o.window.h && o.window.h / o.window.w < 0.5) ||
      (o.window.w < o.window.h && o.window.w / o.window.h > 0.5)
    )
      this.options.openItemScale = 1;
  }

  sampleVideos() {
    this.assets.itemTextures.forEach((e) => {
      if (e.image.play)
        e.image.play().then(() => {
          e.image.pause();
        });
    });
  }

  load() {
    this.assets = { itemTextures: [], models: {}, textures: {} };
    const data = worldData();
    const AL: any = o.AssetLoader;
    const done = (e: HTMLVideoElement, t: number, i: () => void) => {
      if (this.assets.itemTextures[t]) return;
      const n = new VideoTexture(e);
      gl().renderer.initTexture(n);
      this.assets.itemTextures[t] = n;
      e.pause();
      e.currentTime = 0;
      i();
    };
    for (let t = 0; t < data.length; t++) {
      if (data[t].type === "image") {
        if (data[t].file.split(".").pop() === "ktx2")
          AL.loadKtxTexture(data[t].file).then((e: any) => {
            this.assets.itemTextures[t] = e;
          });
        else
          AL.loadTexture(data[t].file).then((e: any) => {
            this.assets.itemTextures[t] = e;
          });
      } else {
        AL.add(
          new Promise<void>((i) => {
            const s = document.createElement("video");
            s.crossOrigin = "";
            s.muted = true;
            s.loop = true;
            s.playsInline = true;
            s.addEventListener(
              "loadeddata",
              () => {
                s.addEventListener(
                  "timeupdate",
                  () => {
                    done(s, t, i);
                  },
                  { once: true },
                );
              },
              { once: true },
            );
            s.addEventListener("error", () => {
              done(s, t, i);
            });
            if (o.isIOS)
              s.addEventListener(
                "suspend",
                () => {
                  done(s, t, i);
                },
                { once: true },
              );
            s.src = data[t].file;
            s.load();
            s.play().catch((err) => {
              console.error(err);
              done(s, t, i);
            });
          }),
        );
      }
    }
    AL.loadGltf(assetUrl("models/world/pointer.glb")).then((e: any) => {
      this.assets.models.pointer = e.scene.children[0];
    });
    AL.loadGltf(assetUrl("models/world/grab.glb")).then((e: any) => {
      this.assets.models.grab = e.scene.children[0];
    });
    AL.loadGltf(assetUrl("models/world/grabbing.glb")).then((e: any) => {
      this.assets.models.grabbing = e.scene.children[0];
    });
    AL.loadTexture(assetUrl("images/world/pointer.png")).then((e: any) => {
      this.assets.textures.pointer = e;
    });
    AL.loadTexture(assetUrl("images/world/grab.png")).then((e: any) => {
      this.assets.textures.grab = e;
    });
    AL.loadTexture(assetUrl("images/world/grabbing.png")).then((e: any) => {
      this.assets.textures.grabbing = e;
    });
  }

  destroy() {
    const G = gl();
    o.RAFCollection!.remove(this.onRaf);
    E.off(o.events.MOUSEMOVE, this.onPointerMove);
    E.off(o.events.MOUSEDRAG, this.onPointerDrag);
    E.off(o.events.MOUSEDOWN, this.onPointerDown);
    E.off(o.events.MOUSEUP, this.onPointerUp);
    E.off("wheel", window, this.onWheel as any);
    E.off("keyup", window, this.onKeyUp as any);
    E.off("mouseenter", "a, button", this.onLinkEnter);
    E.off("mouseleave", "a, button", this.onLinkLeave);
    this.renderDetails.enabled = false;
    G.composerPasses.remove(this.renderDetails);
    this.edgeWarp.enabled = false;
    (this.edgeWarp as any).fsQuad.dispose();
    G.composerPasses.remove(this.edgeWarp);
    this.scanlines.enabled = false;
    (this.scanlines as any).fsQuad.dispose();
    G.composerPasses.remove(this.scanlines);
    this.afterImagePass.enabled = false;
    this.afterImagePass.dispose();
    G.composerPasses.remove(this.afterImagePass);
    this.renderPass.enabled = false;
    this.transitionPass.enabled = false;
    this.savePass.enabled = false;
    this.introPass.enabled = false;
    this.introPass.uniforms.u_strength.value = 1;
    this.resourceTracker.dispose();
    this.camera.rotation.set(0, 0, 0);
    this.camera.scale.copy(this.camera.originalScale);
    this.dom.introWrap.style.visibility = "hidden";
    this.clickableItems = [];
    this.openItem = false;
    this.firstLoad = false;
    this.allowControl = false;
    this.allowSwitch = true;
    this.pointerDown = false;
    this.itemOpen = false;
    this.hoveredItem = false;
    this.hoveredHand = false;
    this.updateIntroText = true;
    this.introFinished = false;
    this.showGridPlayed = false;
    this.gridReady = false;
    this.camera.position.z = this.initialCameraZ;
    this.options.cameraTranslateZ = 0;
    this.showGridTimeline.pause().progress(0, true);
    this.showGridTimeline.clear();
    this.introTimeline.pause().progress(0, true);
    this.introTimeline.clear();
    this.introTextGroup.visible = true;
    this.removeIntroEvents();
  }
}

export default World;
