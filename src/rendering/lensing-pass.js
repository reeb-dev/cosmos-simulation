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
      if (dist < rsScreen * 0.2) return uv;
      vec2 dir = toBH / max(dist, 1e-5);
      float bend = strength / pow(dist + 0.0006, 1.42);
      bend *= 1.0 + spin * 0.38;
      vec2 tangent = vec2(-dir.y, dir.x);
      float frameDrag = spin * bend * 0.22 * sign(toBH.y + 1e-4);
      return uv - dir * bend + tangent * frameDrag;
    }

    float ringBand(float dist, float center, float halfWidth) {
      return smoothstep(center - halfWidth, center, dist)
           * smoothstep(center + halfWidth, center, dist);
    }

    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      if (enabled < 0.5) { gl_FragColor = base; return; }

      vec2 toBH = vUv - blackHoleScreenPos;
      float dist = length(toBH);
      vec2 dir = toBH / max(dist, 1e-5);

      vec2 uvA = gravLens(vUv, lensStrength);
      vec2 uvB = gravLens(vUv, lensStrength * 0.72);
      vec2 uvC = gravLens(vUv, lensStrength * 0.38);
      vec4 col = texture2D(tDiffuse, clamp(uvA, 0.0, 1.0)) * 0.48
               + texture2D(tDiffuse, clamp(uvB, 0.0, 1.0)) * 0.34
               + texture2D(tDiffuse, clamp(uvC, 0.0, 1.0)) * 0.18;

      float shadowRad = rsScreen * 0.5;
      float shadow = smoothstep(shadowRad * 0.38, shadowRad * 0.95, dist);
      col.rgb *= shadow;

      if (dist < shadowRad * 0.32) {
        col.rgb = vec3(0.0);
      } else if (dist < shadowRad * 0.55) {
        col.rgb *= smoothstep(shadowRad * 0.12, shadowRad * 0.48, dist);
      }

      float photonRing = ringBand(dist, rsScreen * 1.5, rsScreen * 0.045);
      col.rgb += vec3(1.0, 0.97, 0.9) * photonRing * 0.78;

      float einsteinRing = ringBand(dist, einsteinScreen, einsteinScreen * 0.06);
      col.rgb += vec3(1.0, 0.65, 0.26) * einsteinRing * 0.82;

      float vertNarrow = exp(-pow(abs(toBH.x) / max(rsScreen * 1.55, 0.006), 2.0) * 0.65);
      float arcMask = vertNarrow * smoothstep(rsScreen * 4.2, rsScreen * 0.65, dist);
      float spinBias = 1.0 + spin * 0.28 * sign(toBH.y + 1e-4);

      vec2 topArc = vUv + vec2(dir.x * lensStrength * 0.35, -abs(toBH.y) * lensStrength * 4.2);
      vec2 botArc = vUv + vec2(-dir.x * lensStrength * 0.25, abs(toBH.y) * lensStrength * 3.6);
      col.rgb += texture2D(tDiffuse, clamp(topArc, 0.0, 1.0)).rgb * arcMask * 0.22 * spinBias;
      col.rgb += texture2D(tDiffuse, clamp(botArc, 0.0, 1.0)).rgb * arcMask * 0.19 * (2.0 - spinBias);

      float starHalo = smoothstep(rsScreen * 2.8, rsScreen * 0.9, dist)
                     * smoothstep(rsScreen * 6.5, rsScreen * 3.2, dist);
      col.rgb += texture2D(tDiffuse, clamp(gravLens(vUv, lensStrength * 1.15), 0.0, 1.0)).rgb
               * starHalo * 0.08;

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

    const dist = Math.max(cam.position.distanceTo(bhWorldPos), rsVis * 1.8);
    const rsScreen = Math.min(0.16, Math.max(0.009, (rsVis / dist) * 1.62));
    lensingPass.uniforms.rsScreen.value = rsScreen;
    lensingPass.uniforms.lensStrength.value = Math.min(0.18, (rsVis / dist) * 0.42) * lensMul;

    const einsteinAngle = (2.2 * rsVis) / dist;
    const einsteinScreen = Math.min(0.22, Math.max(rsScreen * 2.15, einsteinAngle * 1.05));
    lensingPass.uniforms.einsteinScreen.value = einsteinScreen;
  }

  return {
    render: () => composer.render(),
    update,
    setSize: (w, h) => composer.setSize(w, h),
  };
}
