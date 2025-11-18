import * as THREE from 'three';

export class VesselTracker {
  constructor(scene, converter) {
    this.scene = scene;
    this.converter = converter;
    this.group = new THREE.Group();
    this.group.name = 'VesselTracker';
    scene.add(this.group);

    this.vesselMeshes = [];
    this.routeLine = null;
    this.routeProgress = 0;
    this.routeDuration = 1;
    this.routePoints = [];
    this.clock = 0;
  }

  setAISData(aisData) {
    this.clearVessels();
    const vesselMaterial = new THREE.MeshStandardMaterial({ color: 0x4ade80 });

    aisData.recent_arrivals.forEach((vessel, index) => {
      const mesh = this.createVesselMesh(vesselMaterial, index);
      const { x, z } = this.converter.project(
        vessel.lat ?? 31.20 + Math.random() * 0.01,
        vessel.lng ?? 29.87 + Math.random() * 0.01
      );
      mesh.position.set(x, 1.5, z);
      mesh.userData.tooltip = `${vessel.vessel_name}<br/>Type: ${vessel.type}<br/>Length: ${vessel.length_m} m`;
      this.group.add(mesh);
      this.vesselMeshes.push(mesh);
    });
  }

  createVesselMesh(material, offsetIndex) {
    const geometry = new THREE.ConeGeometry(1.2, 6, 8);
    const mesh = new THREE.Mesh(geometry, material.clone());
    mesh.rotation.x = Math.PI / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = `Vessel-${offsetIndex}`;
    return mesh;
  }

  clearVessels() {
    this.vesselMeshes.forEach((mesh) => {
      this.group.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    this.vesselMeshes = [];
  }

  playRoute(route) {
    if (!route || route.length < 2) return;
    this.routePoints = route.map((step) => {
      const { x, z } = this.converter.project(step.lat, step.lng);
      return new THREE.Vector3(x, 1.5, z);
    });
    const geometry = new THREE.BufferGeometry().setFromPoints(this.routePoints);
    if (this.routeLine) {
      this.group.remove(this.routeLine);
      this.routeLine.geometry.dispose();
      this.routeLine.material.dispose();
    }
    this.routeLine = new THREE.Line(
      geometry,
      new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 2, gapSize: 1 })
    );
    this.routeLine.computeLineDistances();
    this.group.add(this.routeLine);

    const start = new Date(route[0].time).getTime();
    const end = new Date(route[route.length - 1].time).getTime();
    this.routeDuration = (end - start) / 1000 || 1;
    this.routeProgress = 0;

    if (!this.routeVessel) {
      this.routeVessel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 5, 12),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8 })
      );
      this.routeVessel.rotation.z = Math.PI / 2;
      this.routeVessel.castShadow = true;
      this.group.add(this.routeVessel);
    }
    this.routeVessel.visible = true;
    this.routeVessel.userData.tooltip = `${route[route.length - 1].status || 'Inbound vessel'}`;
  }

  stopRoute() {
    this.routeProgress = 0;
    this.routePoints = [];
    if (this.routeLine) this.routeLine.visible = false;
    if (this.routeVessel) this.routeVessel.visible = false;
  }

  update(delta) {
    this.clock += delta;
    this.vesselMeshes.forEach((mesh, index) => {
      mesh.position.y = 1.5 + Math.sin(this.clock * 2 + index) * 0.3;
      mesh.rotation.y += delta * 0.6;
    });

    if (this.routePoints.length >= 2 && this.routeVessel) {
      this.routeProgress = (this.routeProgress + delta) % this.routeDuration;
      const t = this.routeProgress / this.routeDuration;
      const segment = t * (this.routePoints.length - 1);
      const startIndex = Math.floor(segment);
      const endIndex = Math.min(this.routePoints.length - 1, startIndex + 1);
      const lerpT = segment - startIndex;
      const start = this.routePoints[startIndex];
      const end = this.routePoints[endIndex];
      this.routeVessel.position.lerpVectors(start, end, lerpT);
      const direction = new THREE.Vector3().subVectors(end, start).normalize();
      const heading = Math.atan2(direction.z, direction.x);
      this.routeVessel.rotation.y = heading;
    }
  }
}
