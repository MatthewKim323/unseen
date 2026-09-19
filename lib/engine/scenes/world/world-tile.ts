/* eslint-disable @typescript-eslint/no-explicit-any */
// WorldTile (source `Vi`, theme.js 9185-9221) + WorldTileMaterial (source `Yi`, 9222-9248).
import { Fog, MathUtils, Mesh, PlaneGeometry, ShaderMaterial, Texture, Vector3 } from "three";
import { commonFullscreenUvVert } from "../../shaders/common-fullscreen-uv.vert.glsl";
import { worldMediaTileFrag } from "../../shaders/world-media-tile.frag.glsl";

export interface WorldTileOptions {
  type: "image" | "video";
  title: string;
  author: string;
  link: string;
  color: any;
  file: string;
  show_caption: boolean;
  caption: string;
  image_size: [number, number];
  index: number;
  position?: Vector3;
}

export class WorldTileMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        fogColor: { value: null },
        fogNear: { value: null },
        fogFar: { value: null },
        u_texture: { value: null },
        u_textureSize: { value: [1, 1] },
        u_meshSize: { value: [1, 1] },
        u_velocity: { value: 0 },
        opacity: { value: 1 },
      },
      fragmentShader: worldMediaTileFrag,
      vertexShader: commonFullscreenUvVert,
      transparent: true,
      depthTest: false,
    });
    // source passes `fog: !0` in the parameters (@types/three 0.143 omits it from ShaderMaterialParameters)
    this.fog = true;
  }

  setFog(e: Fog) {
    this.uniforms.fogColor.value = e.color;
    this.uniforms.fogNear.value = e.near;
    this.uniforms.fogFar.value = e.far;
  }
}

function fitInside(e: number, t: number, i: number, s: number) {
  const o = Math.min(i / e, s / t);
  return { width: e * o, height: t * o };
}

export class WorldTile extends Mesh<PlaneGeometry, ShaderMaterial> {
  options: WorldTileOptions;
  assetType: "image" | "video";
  offsetPosition: Vector3;
  originalPosition!: Vector3;
  originalScale!: Vector3;

  constructor(e: ShaderMaterial, t: WorldTileOptions) {
    super();
    this.options = t;
    this.assetType = this.options.type;
    this.geometry = new PlaneGeometry(1, 1);
    this.material = e.clone();
    if (this.options.position) this.position.copy(this.options.position);
    this.offsetPosition = new Vector3();
    this.name = this.options.title;
    this.renderOrder = 1;
  }

  updateTexture(e: Texture & { image: any }) {
    const t = {
      w: this.assetType === "image" ? this.options.image_size[0] : e.image.videoWidth,
      h: this.assetType === "image" ? this.options.image_size[1] : e.image.videoHeight,
    };
    const i = fitInside(t.w, t.h, 550, 550);
    this.material.uniforms.u_texture.value = e;
    this.material.uniforms.u_textureSize.value = [t.w, t.h];
    this.material.uniforms.u_meshSize.value = [i.width, i.height];
    this.geometry = new PlaneGeometry(i.width, i.height);
    const o = MathUtils.randFloat(0.6, 0.9);
    this.scale.set(o, o, 1);
    this.originalScale = this.scale.clone();
    this.geometry.computeBoundingBox();
  }
}
