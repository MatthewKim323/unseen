// WorldNavHand (source `ts`, theme.js 9317-9387): prev/next pointer-hand mesh shown around an open tile.
import gsap from "gsap";
import { Box3, BufferGeometry, Group, Material, MathUtils, Mesh, Vector3 } from "three";
import { store } from "../../core/store";

export class WorldNavHand extends Group {
  mesh: Mesh;
  navType: "prev" | "next";
  _dragPos: Vector3;
  rotating: boolean;
  originalPosition: Vector3;
  originalRotation: Mesh["rotation"];
  originalScale: Vector3;
  spinCount: number;
  bbox: Box3;
  originalBbox: Box3;

  constructor(e: BufferGeometry, t: Material, i: "prev" | "next", n: number) {
    super();
    this.mesh = new Mesh(e, t);
    this.add(this.mesh);
    this.navType = i;
    this._dragPos = new Vector3();
    this.rotating = false;
    if (this.navType === "prev") {
      this.mesh.rotation.set(MathUtils.degToRad(180), MathUtils.degToRad(0), MathUtils.degToRad(90));
      this.position.x = -n;
    } else if (this.navType === "next") {
      this.mesh.rotation.set(MathUtils.degToRad(0), MathUtils.degToRad(0), MathUtils.degToRad(-90));
      this.position.x = n;
    }
    if (!store.mq.sm.matches) {
      this.position.y = -525;
      this.position.x = this.navType === "prev" ? -100 : 100;
    }
    this.originalPosition = this.position.clone();
    this.originalRotation = this.mesh.rotation.clone();
    this.mesh.scale.setScalar(20);
    this.originalScale = this.mesh.scale.clone();
    this.spinCount = 0;
    this.bbox = new Box3().setFromObject(this);
    this.bbox.expandByScalar(75);
    this.originalBbox = this.bbox.clone();
    this.position.x = 0;
  }

  updateBox3(e: Vector3) {
    this._dragPos.copy(e).setZ(290);
    this.bbox.copy(this.originalBbox).translate(this._dragPos);
  }

  updateHoverRotation(e: Vector3) {
    gsap.killTweensOf(this.rotation);
    this.rotation.x = MathUtils.lerp(this.rotation.x, 3 * e.y, 0.1);
    this.rotation.y = MathUtils.lerp(this.rotation.y, -2 * e.x, 0.1);
  }

  onHover() {
    if (store.isTouch) return;
    gsap.to(this.mesh.scale, {
      x: this.originalScale.x + 10,
      y: this.originalScale.y + 10,
      z: this.originalScale.z + 10,
      duration: 1,
      ease: "expo.out",
    });
  }

  reset() {
    gsap.to(this.rotation, { x: 0, y: 0, z: 0, duration: 1, ease: "expo.out" });
    gsap.to(this.mesh.scale, {
      x: this.originalScale.x,
      y: this.originalScale.y,
      z: this.originalScale.z,
      duration: 1,
      ease: "expo.out",
    });
  }
}
