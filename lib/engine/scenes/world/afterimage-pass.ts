// AfterimagePass (source `Ji`/`es`, theme.js 9255-9316): three examples pass, damp 0.96 default.
import {
  LinearFilter,
  MeshBasicMaterial,
  NearestFilter,
  RGBAFormat,
  ShaderMaterial,
  UniformsUtils,
  WebGLRenderer,
  WebGLRenderTarget,
  type IUniform,
} from "three";
import { FullScreenQuad, Pass } from "three/examples/jsm/postprocessing/Pass.js";
import { postAfterimageFrag } from "../../shaders/post-afterimage.frag.glsl";
import { postAfterimageVert } from "../../shaders/post-afterimage.vert.glsl";

export const AfterimageShader = {
  uniforms: {
    damp: { value: 0.96 },
    tOld: { value: null },
    tNew: { value: null },
  },
  vertexShader: postAfterimageVert,
  fragmentShader: postAfterimageFrag,
};

export class AfterimagePass extends Pass {
  shader: typeof AfterimageShader;
  uniforms: { [uniform: string]: IUniform };
  textureComp: WebGLRenderTarget;
  textureOld: WebGLRenderTarget;
  shaderMaterial: ShaderMaterial;
  compFsQuad: FullScreenQuad;
  copyFsQuad: FullScreenQuad;

  constructor(e = 0.96) {
    super();
    this.shader = AfterimageShader;
    this.uniforms = UniformsUtils.clone(this.shader.uniforms);
    this.uniforms.damp.value = e;
    this.textureComp = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: LinearFilter,
      magFilter: NearestFilter,
      format: RGBAFormat,
    });
    this.textureOld = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: LinearFilter,
      magFilter: NearestFilter,
      format: RGBAFormat,
    });
    this.shaderMaterial = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.shader.vertexShader,
      fragmentShader: this.shader.fragmentShader,
    });
    this.compFsQuad = new FullScreenQuad(this.shaderMaterial);
    const t = new MeshBasicMaterial();
    this.copyFsQuad = new FullScreenQuad(t);
  }

  render(e: WebGLRenderer, t: WebGLRenderTarget, i: WebGLRenderTarget) {
    this.uniforms.tOld.value = this.textureOld.texture;
    this.uniforms.tNew.value = i.texture;
    e.setRenderTarget(this.textureComp);
    this.compFsQuad.render(e);
    (this.copyFsQuad.material as MeshBasicMaterial).map = this.textureComp.texture;
    if (this.renderToScreen) {
      e.setRenderTarget(null);
      this.copyFsQuad.render(e);
    } else {
      e.setRenderTarget(t);
      if (this.clear) e.clear();
      this.copyFsQuad.render(e);
    }
    const s = this.textureOld;
    this.textureOld = this.textureComp;
    this.textureComp = s;
  }

  setSize(e: number, t: number) {
    this.textureComp.setSize(e, t);
    this.textureOld.setSize(e, t);
  }

  dispose() {
    this.compFsQuad.dispose();
    this.copyFsQuad.dispose();
    this.textureComp.dispose();
    this.textureOld.dispose();
  }
}
