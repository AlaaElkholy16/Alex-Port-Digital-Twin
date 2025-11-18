import * as THREE from 'three';

export class PortMap {
  constructor(scene, converter, gisData) {
    this.scene = scene;
    this.converter = converter;
    this.gisData = gisData;
    this.group = new THREE.Group();
    this.group.name = 'PortMap';
    scene.add(this.group);

    this.drawGround();
    this.drawBoundaries();
    this.drawBerths();
    this.drawYards();
    this.drawWarehouses();
    this.drawTrafficLanes();
  }

  drawGround() {
    const geometry = new THREE.PlaneGeometry(600, 600);
    const material = new THREE.MeshStandardMaterial({
      color: 0x1f3a4d,
      roughness: 0.9,
      metalness: 0.05
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    plane.name = 'PortGround';
    this.group.add(plane);
  }

  drawBoundaries() {
    const points = this.gisData.boundaries.map(({ lat, lng }) => {
      const { x, z } = this.converter.project(lat, lng);
      return new THREE.Vector3(x, 0.1, z);
    });
    const geometry = new THREE.BufferGeometry().setFromPoints(points.concat(points[0]));
    const material = new THREE.LineDashedMaterial({ color: 0x66c2ff, dashSize: 4, gapSize: 2 });
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    line.name = 'PortBoundary';
    this.group.add(line);
  }

  drawBerths() {
    const material = new THREE.MeshStandardMaterial({ color: 0xffb347 });
    this.gisData.berths.forEach((berth) => {
      const mesh = this.createExtrudedMarker(berth, material, {
        width: berth.length_m * 0.05,
        height: 3,
        depth: 12
      });
      mesh.userData.tooltip = `Berth ${berth.id}<br/>Type: ${berth.type}<br/>Length: ${berth.length_m} m`;
      this.group.add(mesh);
    });
  }

  drawYards() {
    const material = new THREE.MeshStandardMaterial({ color: 0x87e8b1 });
    this.gisData.container_yards.forEach((yard) => {
      const mesh = this.createExtrudedMarker(yard, material, {
        width: 40,
        height: 2,
        depth: 25
      });
      mesh.userData.tooltip = `${yard.name}<br/>Capacity: ${yard.capacity_teu.toLocaleString()} TEU`;
      this.group.add(mesh);
    });
  }

  drawWarehouses() {
    const material = new THREE.MeshStandardMaterial({ color: 0xd4d4dc });
    this.gisData.warehouses.forEach((wh) => {
      const mesh = this.createExtrudedMarker(wh, material, {
        width: 25,
        height: 4,
        depth: 15
      });
      mesh.userData.tooltip = `${wh.name}<br/>Area: ${wh.area_sqm.toLocaleString()} m²`;
      this.group.add(mesh);
    });
  }

  drawTrafficLanes() {
    const laneMaterial = new THREE.LineBasicMaterial({ color: 0xfde047 });
    this.gisData.traffic_lanes.forEach((lane) => {
      const converted = lane.points.map(({ lat, lng }) => {
        const { x, z } = this.converter.project(lat, lng);
        return new THREE.Vector3(x, 0.2, z);
      });
      const geometry = new THREE.BufferGeometry().setFromPoints(converted);
      const line = new THREE.Line(geometry, laneMaterial);
      line.userData.tooltip = `${lane.name}`;
      this.group.add(line);
    });
  }

  createExtrudedMarker(item, material, size) {
    const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const mesh = new THREE.Mesh(geometry, material.clone());
    const { x, z } = this.converter.project(item.lat, item.lng);
    mesh.position.set(x, size.height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = item.name;
    return mesh;
  }
}
