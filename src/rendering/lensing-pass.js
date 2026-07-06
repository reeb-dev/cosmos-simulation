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
      if (dist < rsScreen * 0.12) return uv;
      vec2 dir = toBH / max(dist, 1e-5);
      float bend = strength / pow(dist + 0.0005, 1.42);
      bend *= 1.0 + spin * 0.35 + gargantuaBoost * 0.28;
      vec2 tangent = vec2(-dir.y, dir.x);
      float frameDrag = spin * bend * 0.14 * sign(toBH.y + 1e-4);
      return uv - dir * bend + tangent * frameDrag;
    }

    float ringBand(float dist, float center, float halfWidth) {
      return smoothstep(center - halfWidth, center, dist)
           * smoothstep(center + halfWidth, center, dist);
    }

    vec3 sampleBloom(vec2 uv, float strength, float mask) {
      vec3 acc = vec3(0.0);
      float wsum = 0.0;
      for (float x = -2.0; x <= 2.0; x += 1.0) {
        for (float y = -2.0; y <= 2.0; y += 1.0) {
          vec2 off = vec2(x, y) * 0.0032;
          vec3 s = texture2D(tDiffuse, clamp(uv + off, 0.0, 1.0)).rgb;
          float w = exp(-(x*x + y*y) * 0.28);
          acc += max(s - 0.55, 0.0) * w;
          wsum += w;
        }
      }
      return (acc / max(wsum, 1.0)) * strength * mask;
    }

    vec3 sampleDiskBand(vec2 uv) {
      float bandY = blackHoleScreenPos.y;
      float bandH = rsScreen * 0.55;
      float band = exp(-pow((uv.y - bandY) / max(bandH, 0.001), 2.0) * 0.55);
      return texture2D(tDiffuse, uv).rgb * band;
    }

    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      if (enabled < 0.5) { gl_FragColor = base; return; }

      vec2 toBH = vUv - blackHoleScreenPos;
      float dist = length(toBH);
      vec2 dir = toBH / max(dist, 1e-5);
      float boost = 1.0 + gargantuaBoost * 0.55;

      vec2 uvA = gravLens(vUv, lensStrength * boost);
      vec2 uvB = gravLens(vUv, lensStrength * 0.48 * boost);
      vec4 col = texture2D(tDiffuse, clamp(uvA, 0.0, 1.0)) * 0.58
               + texture2D(tDiffuse, clamp(uvB, 0.0, 1.0)) * 0.42;
      col = max(col, base * 0.42);

      float shadowRad = rsScreen * 0.38;
      if (dist < shadowRad * 0.18) {
        col.rgb = vec3(0.0);
      } else {
        float shadow = smoothstep(shadowRad * 0.16, shadowRad * 0.62, dist);
        col.rgb *= shadow;
      }

      float photonRing = ringBand(dist, rsScreen * 1.48, rsScreen * 0.032);
      col.rgb += vec3(1.0, 0.96, 0.86) * photonRing * (0.55 + gargantuaBoost * 0.35);

      if (gargantuaBoost > 0.5) {
        vec2 mirrorY = vec2(vUv.x, blackHoleScreenPos.y - (vUv.y - blackHoleScreenPos.y));
        vec2 mirrorY2 = vec2(vUv.x, blackHoleScreenPos.y + (blackHoleScreenPos.y - vUv.y) * 0.82);

        float xNarrow = exp(-pow(abs(toBH.x) / max(rsScreen * 1.8, 0.004), 2.0) * 0.45);
        float distMask = smoothstep(rsScreen * 0.45, rsScreen * 2.8, dist)
                       * smoothstep(rsScreen * 7.5, rsScreen * 1.8, dist);

        float topMask = xNarrow * distMask
                      * smoothstep(blackHoleScreenPos.y + rsScreen * 0.15, blackHoleScreenPos.y + rsScreen * 1.8, vUv.y);
        float botMask = xNarrow * distMask
                      * smoothstep(blackHoleScreenPos.y - rsScreen * 0.1, blackHoleScreenPos.y - rsScreen * 1.2, vUv.y);

        vec3 diskBand = sampleDiskBand(vec2(vUv.x, blackHoleScreenPos.y));
        col.rgb += texture2D(tDiffuse, clamp(mirrorY, 0.0, 1.0)).rgb * topMask * 0.55;
        col.rgb += texture2D(tDiffuse, clamp(mirrorY2, 0.0, 1.0)).rgb * botMask * 0.32;
        col.rgb += diskBand * distMask * xNarrow * 0.18;

        float horizBand = exp(-pow(toBH.y / max(rsScreen * 0.75, 0.003), 2.0) * 0.5);
        horizBand *= smoothstep(rsScreen * 3.8, rsScreen * 0.55, dist);
        col.rgb += texture2D(tDiffuse, clamp(vec2(vUv.x, blackHoleScreenPos.y), 0.0, 1.0)).rgb
                 * horizBand * 0.22;
      } else {
        float einsteinRing = ringBand(dist, einsteinScreen, einsteinScreen * 0.06);
        col.rgb += vec3(1.0, 0.62, 0.22) * einsteinRing * 0.45;
      }

      float bloomMask = smoothstep(rsScreen * 0.2, rsScreen * 0.55, dist);
      col.rgb += sampleBloom(vUv, bloomStrength * (0.18 + gargantuaBoost * 0.22), bloomMask);

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
    lensingPass.uniforms.bloomStrength.value = gargantuaMode ? 0.65 : 0.3;

    lensingPass.uniforms.blackHoleScreenPos.value.set(
      (screenPos.x + 1) / 2,
      (screenPos.y + 1) / 2,
    );

    const dist = Math.max(cam.position.distanceTo(bhWorldPos), rsVis * 1.5);
    const rsMul = gargantuaMode ? 1.22 : 1.65;
    const rsCap = gargantuaMode ? 0.09 : 0.14;
    const rsScreen = Math.min(rsCap, Math.max(0.01, (rsVis / dist) * rsMul));
    lensingPass.uniforms.rsScreen.value = rsScreen;
    const baseLens = Math.min(0.1, (rsVis / dist) * 0.28) * lensMul;
    lensingPass.uniforms.lensStrength.value = gargantuaMode ? baseLens * 1.2 : baseLens;

    const einsteinAngle = (2.4 * rsVis) / dist;
    const einsteinScreen = Math.min(0.24, Math.max(rsScreen * 2.0, einsteinAngle * 1.05));
    lensingPass.uniforms.einsteinScreen.value = einsteinScreen;
  }

  return {
    render: () => composer.render(),
    update,
    setSize: (w, h) => composer.setSize(w, h),
  };
}
