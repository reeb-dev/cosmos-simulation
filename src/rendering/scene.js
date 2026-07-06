import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function createScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020210);
  scene.fog = new THREE.FogExp2(0x020210, 0.0008);

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    2000
  );
  camera.position.set(0, 40, 120);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 0.5;
  controls.maxDistance = 400;
  controls.target.set(0, 0, 0);

  function setMinDistance(rs) {
    controls.minDistance = Math.max(0.5, rs * 0.35);
  }

  const ambient = new THREE.AmbientLight(0x111133, 0.5);
  scene.add(ambient);

  const pointLight = new THREE.PointLight(0xffaa66, 2, 300);
  pointLight.position.set(0, 20, 0);
  scene.add(pointLight);

  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', onResize);

  return { scene, camera, renderer, controls, onResize, setMinDistance };
}
