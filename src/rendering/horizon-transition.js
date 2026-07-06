import * as THREE from 'three';

const FLASH_INDEX = {
  default: 0,
  red_heat: 1,
  white_burst: 2,
  blue_scan: 3,
  babel_text: 4,
  tri_regime: 5,
  portal_spiral: 6,
  fuzz_strings: 7,
  island_pulse: 8,
  bridge_er: 9,
  mirror_flip: 10,
  gold_fracture: 11,
  green_foam: 12,
  orange_invert: 13,
  photon_ring: 14,
  entropy_noise: 15,
  wormhole_blue: 16,
  baby_expand: 17,
  friedmann_shells: 18,
  resonance_wave: 19,
  loop_spin: 20,
  planck_lattice: 21,
  ads_bulk: 22,
  multiverse_fork: 23,
  string_resonance: 24,
  time_reverse: 25,
  gravity_invert: 26,
};

function colorToVec3(hex, target) {
  target.set((hex >> 16) & 255, (hex >> 8) & 255, hex & 255).multiplyScalar(1 / 255);
  return target;
}

export function createHorizonTransition(camera) {
  const geo = new THREE.PlaneGeometry(2, 2);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      flash: { value: 0 },
      flashType: { value: 0 },
      flashColor: { value: new THREE.Vector3(1, 1, 1) },
      time: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform float flash;
      uniform float flashType;
      uniform vec3 flashColor;
      uniform float time;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        if (flash < 0.001) discard;

        vec2 uv = vUv;
        vec2 centered = uv - 0.5;
        float dist = length(centered);
        float edge = smoothstep(0.85, 0.0, dist);
        vec3 col = flashColor;
        float alpha = flash * edge;

        if (flashType < 0.5) {
          alpha *= 1.0 - dist * 0.5;
        } else if (flashType < 1.5) {
          float heat = sin(uv.y * 40.0 + time * 12.0) * 0.5 + 0.5;
          col = mix(vec3(1.0, 0.15, 0.0), vec3(1.0, 0.9, 0.2), heat);
          alpha *= 0.9;
        } else if (flashType < 2.5) {
          col = vec3(1.0);
          alpha = flash * (1.0 - dist * 1.2);
        } else if (flashType < 3.5) {
          float scan = step(0.92, fract(uv.y * 60.0 - time * 8.0));
          col = mix(vec3(0.0, 0.5, 0.9), vec3(0.2, 1.0, 0.85), scan);
          alpha *= 0.75 + scan * 0.25;
        } else if (flashType < 4.5) {
          float glyphs = step(0.7, hash(floor(uv * vec2(80.0, 40.0))));
          col = mix(vec3(0.9, 0.7, 0.4), vec3(1.0, 0.95, 0.8), glyphs);
          alpha *= 0.6 + glyphs * 0.4;
        } else if (flashType < 5.5) {
          float band = smoothstep(0.1, 0.0, abs(fract(dist * 3.0 - time * 2.0) - 0.5));
          col = mix(vec3(0.2, 0.5, 1.0), mix(vec3(0.2, 1.0, 0.5), vec3(0.7, 0.4, 1.0), band), band);
        } else if (flashType < 6.5) {
          float ang = atan(centered.y, centered.x);
          float spiral = sin(ang * 8.0 + dist * 30.0 - time * 6.0) * 0.5 + 0.5;
          col = mix(vec3(0.8, 0.2, 1.0), vec3(0.2, 0.8, 1.0), spiral);
        } else if (flashType < 7.5) {
          float strands = sin(uv.x * 50.0 + time * 5.0) * sin(uv.y * 50.0 - time * 4.0);
          col = mix(vec3(0.3, 0.9, 0.5), vec3(0.6, 1.0, 0.7), strands * 0.5 + 0.5);
        } else if (flashType < 8.5) {
          float pulse = sin(dist * 25.0 - time * 10.0) * 0.5 + 0.5;
          col = mix(vec3(0.2, 0.4, 0.9), vec3(0.5, 0.8, 1.0), pulse);
        } else if (flashType < 9.5) {
          col = mix(vec3(0.1, 0.6, 1.0), vec3(1.0, 0.3, 0.8), sin(time * 8.0) * 0.5 + 0.5);
        } else if (flashType < 10.5) {
          col = mix(flashColor, vec3(1.0) - flashColor, step(0.5, fract(time * 3.0)));
        } else if (flashType > 23.5 && flashType < 24.5) {
          float harmonics = sin(uv.x * 80.0 + time * 12.0) * sin(uv.y * 60.0 - time * 9.0);
          float resonance = sin(dist * 40.0 - time * 15.0) * 0.5 + 0.5;
          col = mix(vec3(0.5, 0.2, 1.0), vec3(0.9, 0.6, 1.0), harmonics * 0.5 + 0.5);
          col = mix(col, vec3(1.0, 0.8, 1.0), resonance * 0.4);
          alpha *= 0.85 + resonance * 0.15;
        } else if (flashType > 24.5 && flashType < 25.5) {
          float rewind = sin(dist * 50.0 + time * 18.0);
          col = mix(vec3(0.9, 0.2, 0.6), vec3(0.3, 0.8, 1.0), rewind * 0.5 + 0.5);
          alpha *= 0.9 - dist * 0.3;
          col.rgb = mix(col.rgb, col.gbr, step(0.5, fract(time * 4.0)));
        } else if (flashType > 25.5) {
          float invert = sin(time * 10.0 + dist * 30.0) * 0.5 + 0.5;
          col = mix(vec3(0.2, 0.9, 1.0), vec3(1.0, 0.3, 0.2), invert);
          alpha *= 1.0 - dist * 0.4;
          col.rgb = mix(col.rgb, vec3(1.0) - col.rgb, step(0.7, fract(uv.y * 20.0 - time * 5.0)));
        } else {
          col = flashColor * (0.7 + 0.3 * sin(time * 6.0 + dist * 10.0));
        }

        gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
      }
    `,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 9999;
  mesh.frustumCulled = false;
  camera.add(mesh);
  mesh.position.z = -0.5;

  let flashDecay = 0;

  function flash(flashType, colorHex = 0xffffff) {
    mat.uniforms.flash.value = 1;
    mat.uniforms.flashType.value = FLASH_INDEX[flashType] ?? 0;
    colorToVec3(colorHex, mat.uniforms.flashColor.value);
    flashDecay = 0.85;
  }

  function update(dt, animTime) {
    mat.uniforms.time.value = animTime;
    if (mat.uniforms.flash.value > 0) {
      flashDecay -= dt;
      mat.uniforms.flash.value = Math.max(0, flashDecay);
    }
    mesh.visible = mat.uniforms.flash.value > 0.001;
  }

  return { mesh, flash, update };
}
