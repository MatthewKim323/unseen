// extracted verbatim from source/pretty/theme.js line 11177
precision highp float;
precision highp int;
#define GLSLIFY 1

uniform sampler2D uTexture;

varying vec2 vUv;

void main () {
    gl_FragColor = texture2D(uTexture, vUv);
}
