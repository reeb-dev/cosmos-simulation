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

    vec2 lensUv(vec2 uv, float strength) {
      vec2 toBH = uv - blackHoleScreenPos;
      float dist = length(toBH);
      if (dist < rsScreen * 0.5) return uv;
      float alpha = strength / (dist + 0.001);
      float deflection = alpha * (1.0 + spin * 0.3);
      vec2 tangent = vec2(-toBH.y, toBH.x);
      return uv - normalize(toBH) * deflection + tangent * spin * deflection * 0.2;
    }

    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      if (enabled < 0.5) { gl_FragColor = base; return; }

      vec2 toBH = vUv - blackHoleScreenPos;
      float dist = length(toBH);

      vec2 uv1 = lensUv(vUv, lensStrength);
      vec2 uv2 = lensUv(vUv, lensStrength * 0.5);
      vec4 col = texture2D(tDiffuse, clamp(uv1, 0.0, 1.0)) * 0.6
               + texture2D(tDiffuse, clamp(uv2, 0.0, 1.0)) * 0.4;

      if (dist < rsScreen * 0.35) {
        float shadow = smoothstep(rsScreen * 0.08, rsScreen * 0.3, dist);
        col.rgb *= shadow;
        gl_FragColor = col;
        return;
      }

      float einsteinRing = smoothstep(einsteinScreen * 0.92, einsteinScreen, dist)
                         * smoothstep(einsteinScreen * 1.35, einsteinScreen * 1.05, dist);
      col.rgb += vec3(1.0, 0.6, 0.15) * einsteinRing * 0.55;

      float photonRing = smoothstep(rsScreen * 1.4, rsScreen * 1.5, dist)
                       * smoothstep(rsScreen * 1.7, rsScreen * 1.55, dist);
      col.rgb += vec3(1.0, 0.9, 0.5) * photonRing * 0.35;

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

  function update(cam, bhWorldPos, enabled, rsVis, spin = 0) {
    lensingPass.uniforms.enabled.value = enabled ? 1.0 : 0.0;
    lensingPass.uniforms.spin.value = spin;

    const screenPos = bhWorldPos.clone().project(cam);
    lensingPass.uniforms.blackHoleScreenPos.value.set(
      (screenPos.x + 1) / 2,
      (screenPos.y + 1) / 2
    );

    const dist = Math.max(cam.position.distanceTo(bhWorldPos), rsVis * 1.2);
    const rsScreen = Math.min(0.08, Math.max(0.006, (rsVis / dist) * 1.2));
    lensingPass.uniforms.rsScreen.value = rsScreen;
  lensingPass.uniforms.lensStrength.value = Math.min(0.07, (rsVis / dist) * 0.18);

    // Radio de Einstein θ_E ≈ 2rₛ/d → escala en pantalla proporcional a rₛ/d
    const einsteinAngle = (2 * rsVis) / dist;
    const einsteinScreen = Math.min(0.15, Math.max(rsScreen * 1.8, einsteinAngle * 0.85));
    lensingPass.uniforms.einsteinScreen.value = einsteinScreen;
  }

  return {
    render: () => composer.render(),
    update,
    setSize: (w, h) => composer.setSize(w, h),
  };
}
