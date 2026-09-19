// extracted verbatim from source/pretty/theme.js line 11175
precision highp float;
precision highp int;
#define GLSLIFY 1

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0 );
}
