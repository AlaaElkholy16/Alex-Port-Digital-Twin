export const scenarios = {
  "ship_arrival": {
    "scenario": "ship_arrival",
    "timestamp": "2025-11-18T08:00:00Z",
    "vessel": {
      "name": "MSC NITA",
      "mmsi": 636018389,
      "type": "Container Ship",
      "length_m": 300,
      "dwt": 75000,
      "draft_m": 12.5,
      "flag": "LR"
    },
    "route": [
      {"time": "2025-11-18T08:00:00Z", "lat": 31.1000, "lng": 29.8000, "speed_knots": 12},
      {"time": "2025-11-18T10:00:00Z", "lat": 31.1500, "lng": 29.8400, "speed_knots": 8},
      {"time": "2025-11-18T12:00:00Z", "lat": 31.1900, "lng": 29.8700, "speed_knots": 4},
      {"time": "2025-11-18T14:00:00Z", "lat": 31.2045, "lng": 29.8800, "speed_knots": 0, "status": "moored"}
    ],
    "berth_assignment": {
      "berth_id": "B5",
      "berth_name": "Container Berth 5",
      "eta": "2025-11-18T14:00:00Z",
      "etd": "2025-11-19T18:00:00Z"
    }
  },
  "berth_congestion": {
    "scenario": "berth_congestion",
    "timestamp": "2025-11-18T06:00:00Z",
    "congestion_level": "high",
    "affected_berths": ["B1", "B2", "B3", "B4", "B5"],
    "waiting_vessels": [
      {
        "name": "MAERSK NEWBURY",
        "mmsi": 566278000,
        "waiting_time_hours": 6,
        "scheduled_berth": "B3",
        "reason": "previous vessel delayed"
      },
      {
        "name": "TRITON LEADER",
        "mmsi": 357795000,
        "waiting_time_hours": 4,
        "scheduled_berth": "B1",
        "reason": "equipment shortage"
      }
    ],
    "kpi_impact": {
      "berth_occupancy_percent": 92,
      "average_waiting_time_hours": 5.2,
      "vessel_turnaround_increase_percent": 25
    }
  }
};
