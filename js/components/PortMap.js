import * as THREE from 'three';

export class PortMap {
  constructor(scene, converter, gisData) {
    this.scene = scene;
    this.converter = converter;
    this.gisData = gisData;
    this.group = new THREE.Group();
    this.group.name = 'PortMap';
    scene.add(this.group);

    this.vehicles = [];

    this.drawWater();
    this.drawGround();
    this.drawBoundaries();
    this.drawBerths();
    this.drawYards();
    this.drawWarehouses();
    this.drawTrafficLanes();
    this.drawContainerStacks();
    this.drawCranes();
    this.spawnYardVehicles();
  }

  drawWater() {
    const geometry = new THREE.CircleGeometry(900, 64);
    const material = new THREE.MeshStandardMaterial({
      color: 0x031225,
      opacity: 0.9,
      transparent: true,
      roughness: 0.4,
      metalness: 0.05
    });
    const water = new THREE.Mesh(geometry, material);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.5;
    water.receiveShadow = true;
    water.name = 'Mediterranean';
    this.group.add(water);
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

  drawContainerStacks() {
    const containerColors = [0x4fb3ff, 0xff9f43, 0x8b5cf6, 0x22c55e, 0xe11d48];

    this.gisData.container_yards.forEach((yard) => {
      const { x, z } = this.converter.project(yard.lat, yard.lng);
      const rows = 4;
      const cols = 5;
      const spacing = 6;

      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const stackHeight = 1 + Math.floor(Math.random() * 3);
          const geometry = new THREE.BoxGeometry(4, stackHeight * 1.6, 2.2);
          const material = new THREE.MeshStandardMaterial({
            color: containerColors[(r * cols + c) % containerColors.length],
            roughness: 0.3,
            metalness: 0.15
          });
          const container = new THREE.Mesh(geometry, material);
          container.name = `${yard.id}-stack-${r}-${c}`;
          container.position.set(
            x - (rows * spacing) / 2 + r * spacing,
            geometry.parameters.height / 2 + 0.5,
            z - (cols * spacing) / 2 + c * spacing
          );
          container.castShadow = true;
          container.receiveShadow = true;
          container.userData.tooltip = `${yard.name} stack<br/>${stackHeight} high`;
          this.group.add(container);
        }
      }
    });
  }

  drawCranes() {
    this.gisData.berths.forEach((berth, index) => {
      const { x, z } = this.converter.project(berth.lat, berth.lng);
      const crane = this.createCraneMesh();
      crane.position.set(x, 6, z - 12);
      crane.rotation.y = (index % 2 === 0 ? 1 : -1) * Math.PI / 4;
      crane.userData.tooltip = `${berth.name} crane`;
      this.group.add(crane);
    });
  }

  createCraneMesh() {
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.3 });
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.5 });

    const group = new THREE.Group();

    const base = new THREE.Mesh(new THREE.BoxGeometry(4, 12, 4), baseMaterial);
    base.position.y = 6;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 14), armMaterial);
    arm.position.set(0, 12, 5);
    arm.castShadow = true;
    group.add(arm);

    const trolley = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 2), armMaterial);
    trolley.position.set(0, 11, 10);
    group.add(trolley);

    return group;
  }

  spawnYardVehicles() {
    const vehicleColors = [0x38bdf8, 0xf43f5e, 0xfbbf24];

    this.gisData.traffic_lanes.forEach((lane, laneIndex) => {
      const points = lane.points.map(({ lat, lng }) => {
        const { x, z } = this.converter.project(lat, lng);
        return new THREE.Vector3(x, 0.6, z);
      });
      if (points.length < 2) return;

      const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);

      for (let i = 0; i < 2; i += 1) {
        const vehicle = this.createVehicleMesh(vehicleColors[(laneIndex + i) % vehicleColors.length]);
        vehicle.position.copy(points[0]);
        this.group.add(vehicle);
        this.vehicles.push({
          mesh: vehicle,
          curve,
          speed: 0.03 + Math.random() * 0.02,
          progress: Math.random()
        });
      }
    });
  }

  createVehicleMesh(color) {
    const geometry = new THREE.BoxGeometry(4, 1.4, 2);
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.2 });
    const cab = new THREE.Mesh(geometry, material);
    cab.castShadow = true;
    cab.receiveShadow = true;
    cab.userData.tooltip = 'Yard tractor';
    return cab;
  }

  update(delta) {
    this.vehicles.forEach((vehicle) => {
      vehicle.progress = (vehicle.progress + vehicle.speed * delta) % 1;
      const position = vehicle.curve.getPointAt(vehicle.progress);
      const tangent = vehicle.curve.getTangentAt(vehicle.progress);
      vehicle.mesh.position.copy(position);
      vehicle.mesh.rotation.y = Math.atan2(tangent.x, tangent.z);
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
