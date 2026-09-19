// extracted verbatim from source/pretty/theme.js line 11159
#define GLSLIFY 1
varying vec2 vUv;

void main() {
    #include <begin_vertex>
    #include <project_vertex>
    vUv = uv;
}
