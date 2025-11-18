export const alexandriaPortGIS = {
  "port_name": "Alexandria Port",
  "center_coordinates": {
    "lat": 31.2045796,
    "lng": 29.8800659
  },
  "boundaries": [
    {"lat": 31.2156, "lng": 29.9124},
    {"lat": 31.1964, "lng": 29.8658},
    {"lat": 31.1876, "lng": 29.8423},
    {"lat": 31.2098, "lng": 29.8987}
  ],
  "berths": [
    {"id": "B1", "name": "Berth 1", "lat": 31.2021, "lng": 29.8765, "length_m": 200, "type": "Container"},
    {"id": "B2", "name": "Berth 2", "lat": 31.2045, "lng": 29.8789, "length_m": 250, "type": "General Cargo"},
    {"id": "B3", "name": "Berth 3", "lat": 31.2067, "lng": 29.8812, "length_m": 180, "type": "Bulk"}
  ],
  "container_yards": [
    {"id": "CY1", "name": "Container Yard 1", "lat": 31.2089, "lng": 29.8834, "capacity_teu": 10000},
    {"id": "CY2", "name": "Container Yard 2", "lat": 31.1998, "lng": 29.8721, "capacity_teu": 15000}
  ],
  "warehouses": [
    {"id": "WH1", "name": "Warehouse 1", "lat": 31.1954, "lng": 29.8698, "area_sqm": 5000},
    {"id": "WH2", "name": "Warehouse 2", "lat": 31.2076, "lng": 29.8845, "area_sqm": 7500}
  ],
  "traffic_lanes": [
    {"name": "Internal Road 1", "points": [{"lat": 31.2021, "lng": 29.8765}, {"lat": 31.2045, "lng": 29.8789}]},
    {"name": "Internal Road 2", "points": [{"lat": 31.2045, "lng": 29.8789}, {"lat": 31.2067, "lng": 29.8812}]}
  ]
};
