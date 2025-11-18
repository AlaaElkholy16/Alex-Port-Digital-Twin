const METERS_PER_DEGREE_LAT = 111132;

function metersPerDegreeLng(latitude) {
  return 111320 * Math.cos((latitude * Math.PI) / 180);
}

export function buildCoordinateConverter(originLatLng, scale = 0.02) {
  const { lat: originLat, lng: originLng } = originLatLng;
  const metersPerLng = metersPerDegreeLng(originLat);

  function project(lat, lng) {
    const deltaLat = lat - originLat;
    const deltaLng = lng - originLng;

    const x = deltaLng * metersPerLng * scale;
    const z = -deltaLat * METERS_PER_DEGREE_LAT * scale;
    return { x, y: 0, z };
  }

  function line(points) {
    return points.map((p) => project(p.lat, p.lng));
  }

  return { project, line };
}
