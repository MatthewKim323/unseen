// extracted verbatim from source/pretty/theme.js line 11686
#define GLSLIFY 1
varying vec3 vWorldPosition;

void main () {
	vWorldPosition = (modelMatrix * vec4(position, 1.)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1 );
}
