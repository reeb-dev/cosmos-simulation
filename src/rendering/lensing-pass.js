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
    gargantuaBoost: { value: 0.0 },
    bloomStrength: { value: 0.0 },
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
    uniform float gargantuaBoost;
    uniform float bloomStrength;
    varying vec2 vUv;

    vec2 gravLens(vec2 uv, float strength) {
      vec2 toBH = uv - blackHoleScreenPos;
      float dist = length(toBH);
      if (dist < rsScreen * 0.15) return uv;
      vec2 dir = toBH / max(dist, 1e-5);
      float bend = strength / pow(dist + 0.0004, 1.38);
      bend *= 1.0 + spin * 0.42 + gargantuaBoost * 0.35;
      vec2 tangent = vec2(-dir.y, dir.x);
      float frameDrag = spin * bend * 0.18 * sign(toBH.y + 1e-4);
      return uv - dir * bend + tangent * frameDrag;
    }

    float ringBand(float dist, float center, float halfWidth) {
      return smoothstep(center - halfWidth, center, dist)
           * smoothstep(center + halfWidth, center, dist);
    }

    vec3 sampleBloom(vec2 uv, float strength) {
      vec3 acc = vec3(0.0);
      float wsum = 0.0;
      for (float x = -3.0; x <= 3.0; x += 1.0) {
        for (float y = -3.0; y <= 3.0; y += 1.0) {
          vec2 off = vec2(x, y) * 0.0028 * (1.0 + gargantuaBoost);
          vec3 s = texture2D(tDiffuse, clamp(uv + off, 0.0, 1.0)).rgb;
          float br = max(max(s.r, s.g), s.b);
          float w = exp(-(x*x + y*y) * 0.22);
          acc += max(s - 0.35, 0.0) * w;
          wsum += w;
        }
      }
      return (acc / max(wsum, 1.0)) * strength;
    }

    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      if (enabled < 0.5) { gl_FragColor = base; return; }

      vec2 toBH = vUv - blackHoleScreenPos;
      float dist = length(toBH);
      vec2 dir = toBH / max(dist, 1e-5);
      float boost = 1.0 + gargantuaBoost * 1.8;

      vec2 uvA = gravLens(vUv, lensStrength * boost);
      vec2 uvB = gravLens(vUv, lensStrength * 0.68 * boost);
      vec2 uvC = gravLens(vUv, lensStrength * 0.34 * boost);
      vec4 col = texture2D(tDiffuse, clamp(uvA, 0.0, 1.0)) * 0.5
               + texture2D(tDiffuse, clamp(uvB, 0.0, 1.0)) * 0.32
               + texture2D(tDiffuse, clamp(uvC, 0.0, 1.0)) * 0.18;

      float shadowRad = rsScreen * 0.52;
      float shadow = smoothstep(shadowRad * 0.28, shadowRad * 0.88, dist);
      col.rgb *= shadow;

      if (dist < shadowRad * 0.28) {
        col.rgb = vec3(0.0);
      } else if (dist < shadowRad * 0.5) {
        col.rgb *= smoothstep(shadowRad * 0.08, shadowRad * 0.42, dist);
      }

      float photonRing = ringBand(dist, rsScreen * 1.5, rsScreen * 0.055 * boost);
      col.rgb += vec3(1.0, 0.98, 0.92) * photonRing * (0.85 + gargantuaBoost * 0.35);

      float einsteinRing = ringBand(dist, einsteinScreen, einsteinScreen * 0.07);
      col.rgb += vec3(1.0, 0.62, 0.22) * einsteinRing * 0.75;

      float vertNarrow = exp(-pow(abs(toBH.x) / max(rsScreen * 1.35, 0.005), 2.0) * 0.55);
      float arcMask = vertNarrow * smoothstep(rsScreen * 5.0, rsScreen * 0.55, dist);

      float arcStr = lensStrength * (4.5 + gargantuaBoost * 6.0);
      vec2 topArc = vUv + vec2(dir.x * arcStr * 0.28, -abs(toBH.y) * arcStr);
      vec2 botArc = vUv + vec2(-dir.x * arcStr * 0.2, abs(toBH.y) * arcStr * 0.82);
      float topW = 0.28 + gargantuaBoost * 0.42;
      float botW = 0.22 + gargantuaBoost * 0.28;
      col.rgb += texture2D(tDiffuse, clamp(topArc, 0.0, 1.0)).rgb * arcMask * topW;
      col.rgb += texture2D(tDiffuse, clamp(botArc, 0.0, 1.0)).rgb * arcMask * botW;

      float horizBand = exp(-pow(toBH.y / max(rsScreen * 0.85, 0.004), 2.0) * 0.35);
      horizBand *= smoothstep(rsScreen * 4.5, rsScreen * 0.7, dist);
      col.rgb += texture2D(tDiffuse, clamp(gravLens(vUv, lensStrength * 0.5), 0.0, 1.0)).rgb
               * horizBand * (0.12 + gargantuaBoost * 0.18);

      float starHalo = smoothstep(rsScreen * 3.0, rsScreen * 0.85, dist)
                     * smoothstep(rsScreen * 7.0, rsScreen * 3.0, dist);
      col.rgb += texture2D(tDiffuse, clamp(gravLens(vUv, lensStrength * 1.2 * boost), 0.0, 1.0)).rgb
               * starHalo * 0.1;

      col.rgb += sampleBloom(vUv, bloomStrength * (0.35 + gargantuaBoost * 0.55));

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

  function update(cam, bhWorldPos, enabled, rsVis, spin = 0, lensMul = 1, gargantuaMode = false) {
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
    lensingPass.uniforms.gargantuaBoost.value = gargantuaMode ? 1.0 : 0.0;
    lensingPass.uniforms.bloomStrength.value = gargantuaMode ? 1.0 : 0.35;

    lensingPass.uniforms.blackHoleScreenPos.value.set(
      (screenPos.x + 1) / 2,
      (screenPos.y + 1) / 2,
    );

    const dist = Math.max(cam.position.distanceTo(bhWorldPos), rsVis * 1.5);
    const rsScreen = Math.min(0.18, Math.max(0.01, (rsVis / dist) * 1.75));
    lensingPass.uniforms.rsScreen.value = rsScreen;
    const baseLens = Math.min(0.22, (rsVis / dist) * 0.48) * lensMul;
    lensingPass.uniforms.lensStrength.value = gargantuaMode ? baseLens * 1.35 : baseLens;

    const einsteinAngle = (2.4 * rsVis) / dist;
    const einsteinScreen = Math.min(0.26, Math.max(rsScreen * 2.2, einsteinAngle * 1.1));
    lensingPass.uniforms.einsteinScreen.value = einsteinScreen;
  }

  return {
    render: () => composer.render(),
    update,
    setSize: (w, h) => composer.setSize(w, h),
  };
}
