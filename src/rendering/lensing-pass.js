import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

const LensingShader = {
  uniforms: {
    tDiffuse: { value: null },
    blackHoleScreenPos: { value: new THREE.Vector2(0.5, 0.5) },
    lensStrength: { value: 0.04 },
    rsScreen: { value: 0.03 },
    einsteinScreen: { value: 0.08 },
    enabled: { value: 1.0 },
    spin: { value: 0.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 blackHoleScreenPos;
    uniform float lensStrength;
    uniform float rsScreen;
    uniform float einsteinScreen;
    uniform float enabled;
    uniform float spin;
    varying vec2 vUv;

    vec2 gravLens(vec2 uv, float strength) {
      vec2 toBH = uv - blackHoleScreenPos;
      float dist = length(toBH);
      if (dist < rsScreen * 0.25) return uv;
      vec2 dir = toBH / max(dist, 1e-5);
      float bend = strength / pow(dist + 0.0015, 1.25);
      bend *= 1.0 + spin * 0.25;
      vec2 tangent = vec2(-dir.y, dir.x);
      return uv - dir * bend + tangent * spin * bend * 0.15;
    }

    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      if (enabled < 0.5) { gl_FragColor = base; return; }

      vec2 toBH = vUv - blackHoleScreenPos;
      float dist = length(toBH);

      vec2 uvA = gravLens(vUv, lensStrength);
      vec2 uvB = gravLens(vUv, lensStrength * 0.65);
      vec2 uvC = gravLens(vUv, lensStrength * 0.35);
      vec4 col = texture2D(tDiffuse, clamp(uvA, 0.0, 1.0)) * 0.5
               + texture2D(tDiffuse, clamp(uvB, 0.0, 1.0)) * 0.32
               + texture2D(tDiffuse, clamp(uvC, 0.0, 1.0)) * 0.18;

      float shadowRad = rsScreen * 0.42;
      float shadow = smoothstep(shadowRad * 0.55, shadowRad * 1.05, dist);
      col.rgb *= shadow;

      if (dist < shadowRad * 1.2) {
        col.rgb *= smoothstep(shadowRad * 0.15, shadowRad * 0.5, dist);
      }

      float einsteinRing = smoothstep(einsteinScreen * 0.94, einsteinScreen, dist)
                         * smoothstep(einsteinScreen * 1.28, einsteinScreen * 1.02, dist);
      col.rgb += vec3(1.0, 0.72, 0.35) * einsteinRing * 0.55;

      float photonRing = smoothstep(rsScreen * 1.38, rsScreen * 1.48, dist)
                       * smoothstep(rsScreen * 1.62, rsScreen * 1.52, dist);
      col.rgb += vec3(1.0, 0.95, 0.88) * photonRing * 0.45;

      float verticalSmear = exp(-pow(abs(toBH.x) / max(rsScreen * 2.5, 0.01), 2.0) * 0.5);
      verticalSmear *= smoothstep(rsScreen * 3.5, rsScreen * 0.8, dist);
      col.rgb += texture2D(tDiffuse, clamp(vUv + vec2(0.0, toBH.y * lensStrength * 2.5), 0.0, 1.0)).rgb
               * verticalSmear * 0.12;

      gl_FragColor = col;
    }
  `,
};

export function createLensingPass(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const lensingPass = new ShaderPass(LensingShader);
  lensingPass.renderToScreen = true;
  composer.addPass(lensingPass);

  const size = renderer.getSize(new THREE.Vector2());
  composer.setSize(size.x, size.y);

  function update(cam, bhWorldPos, enabled, rsVis, spin = 0, lensMul = 1) {
    const screenPos = bhWorldPos.clone().project(cam);
    const onScreen =
      Number.isFinite(screenPos.x) &&
      Number.isFinite(screenPos.y) &&
      screenPos.z <= 1 &&
      screenPos.z >= -1;

    if (!enabled || !onScreen) {
      lensingPass.uniforms.enabled.value = 0.0;
      return;
    }

    lensingPass.uniforms.enabled.value = 1.0;
    lensingPass.uniforms.spin.value = spin;

    lensingPass.uniforms.blackHoleScreenPos.value.set(
      (screenPos.x + 1) / 2,
      (screenPos.y + 1) / 2
    );

    const dist = Math.max(cam.position.distanceTo(bhWorldPos), rsVis * 2.0);
    const rsScreen = Math.min(0.14, Math.max(0.008, (rsVis / dist) * 1.45));
    lensingPass.uniforms.rsScreen.value = rsScreen;
    lensingPass.uniforms.lensStrength.value = Math.min(0.14, (rsVis / dist) * 0.32) * lensMul;

    const einsteinAngle = (2 * rsVis) / dist;
    const einsteinScreen = Math.min(0.2, Math.max(rsScreen * 2.0, einsteinAngle * 0.95));
    lensingPass.uniforms.einsteinScreen.value = einsteinScreen;
  }

  return {
    render: () => composer.render(),
    update,
    setSize: (w, h) => composer.setSize(w, h),
  };
}
