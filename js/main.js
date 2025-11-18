import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { alexandriaPortGIS } from './data/port-gis-data.js';
import { currentAISData } from './data/ais-data.js';
import { portKPIs } from './data/kpi-data.js';
import { scenarios } from './data/scenario-data.js';
import { buildCoordinateConverter } from './utils/coordinateConverter.js';
import { PortMap } from './components/PortMap.js';
import { VesselTracker } from './components/VesselTracker.js';
import { KPIDashboard } from './components/KPIDashboard.js';
import { ScenarioPlayer } from './components/ScenarioPlayer.js';
import { WeatherDisplay } from './components/WeatherDisplay.js';

const sceneContainer = document.getElementById('scene-container');
const kpiPanel = document.getElementById('kpi-panel');
const scenarioPanel = document.getElementById('scenario-panel');
const weatherPanel = document.getElementById('weather-panel');
const tooltip = document.getElementById('tooltip');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030712);
scene.fog = new THREE.Fog(0x030712, 200, 800);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
sceneContainer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

const converter = buildCoordinateConverter(alexandriaPortGIS.center_coordinates);
const portMap = new PortMap(scene, converter, alexandriaPortGIS);
const vesselTracker = new VesselTracker(scene, converter);
vesselTracker.setAISData(currentAISData);

new KPIDashboard(kpiPanel, portKPIs);
new ScenarioPlayer(scenarioPanel, scenarios, vesselTracker);
new WeatherDisplay(weatherPanel, portKPIs.weather_constraints);

const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffffff, 1);
const sunPos = converter.project(alexandriaPortGIS.center_coordinates.lat + 0.01, alexandriaPortGIS.center_coordinates.lng - 0.02);
sun.position.set(sunPos.x, 200, sunPos.z);
sun.castShadow = true;
scene.add(sun);

camera.position.set(80, 140, 220);
controls.update();

function resizeRenderer() {
  const { clientWidth, clientHeight } = sceneContainer;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight, false);
}
window.addEventListener('resize', resizeRenderer);
resizeRenderer();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerEvent = null;

sceneContainer.addEventListener('pointermove', (event) => {
  pointerEvent = event;
  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
});

sceneContainer.addEventListener('pointerleave', () => {
  pointerEvent = null;
  hideTooltip();
});

function updateTooltip() {
  if (!pointerEvent) return;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  const interactive = intersects.find((i) => i.object.userData && i.object.userData.tooltip);
  if (interactive) {
    tooltip.innerHTML = interactive.object.userData.tooltip;
    tooltip.classList.remove('hidden');
    tooltip.style.left = `${pointerEvent.clientX + 16}px`;
    tooltip.style.top = `${pointerEvent.clientY + 16}px`;
  } else {
    hideTooltip();
  }
}

function hideTooltip() {
  tooltip.classList.add('hidden');
  tooltip.innerHTML = '';
}

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  vesselTracker.update(delta);
  controls.update();
  updateTooltip();
  renderer.render(scene, camera);
}
animate();
