// extracted from source/pretty/theme.js lines 2280-2336
// This is the ONLY onBeforeCompile chunk injection in the bundle. It belongs to the
// vendored three r143 GLTFLoader (KHR_materials_pbrSpecularGlossiness extension,
// class `$` extends MeshStandardMaterial). None of the site's GLBs are expected to use
// that extension; the stock `three/examples/jsm/loaders/GLTFLoader.js` of r143 carries
// the identical code. Listed for completeness only.
//
// fragmentShader.replace(...) pairs, in order:
//   "uniform float roughness;"                -> "uniform vec3 specular;"
//   "uniform float metalness;"                -> "uniform float glossiness;"
//   "#include <roughnessmap_pars_fragment>"   -> CHUNK_SPECULARMAP_PARS
//   "#include <metalnessmap_pars_fragment>"   -> CHUNK_GLOSSINESSMAP_PARS
//   "#include <roughnessmap_fragment>"        -> CHUNK_SPECULARMAP_FRAGMENT
//   "#include <metalnessmap_fragment>"        -> CHUNK_GLOSSINESSMAP_FRAGMENT
//   "#include <lights_physical_fragment>"     -> CHUNK_LIGHTS_PHYSICAL
// extra uniforms: specular = Color(0xffffff), glossiness = 1, specularMap = null, glossinessMap = null

// ---- CHUNK_SPECULARMAP_PARS
#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif

// ---- CHUNK_GLOSSINESSMAP_PARS
#ifdef USE_GLOSSINESSMAP
	uniform sampler2D glossinessMap;
#endif

// ---- CHUNK_SPECULARMAP_FRAGMENT
vec3 specularFactor = specular;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vUv );
	// reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture
	specularFactor *= texelSpecular.rgb;
#endif

// ---- CHUNK_GLOSSINESSMAP_FRAGMENT
float glossinessFactor = glossiness;
#ifdef USE_GLOSSINESSMAP
	vec4 texelGlossiness = texture2D( glossinessMap, vUv );
	// reads channel A, compatible with a glTF Specular-Glossiness (RGBA) texture
	glossinessFactor *= texelGlossiness.a;
#endif

// ---- CHUNK_LIGHTS_PHYSICAL
PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1. - max( specularFactor.r, max( specularFactor.g, specularFactor.b ) ) );
vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( 1.0 - glossinessFactor, 0.0525 ); // 0.0525 corresponds to the base mip of a 256 cubemap.
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
material.specularColor = specularFactor;
