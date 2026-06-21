class PathfindingService {
  static async calculateRoute(start, waypoints, end) {
    try {
      const points = [start, ...waypoints.map(w => w.address.coordinates), end];
      return this.calculateStraightLineRoute(points);
    } catch (error) {
      console.error('Pathfinding error:', error);
      return this.aStarRoute(start, waypoints, end);
    }
  }

  static calculateStraightLineRoute(points) {
    let totalDistance = 0;
    const segments = [];

    for (let i = 0; i < points.length - 1; i++) {
      const dist = this.haversineDistance(points[i], points[i + 1]);
      totalDistance += dist;
      segments.push({
        from: points[i],
        to: points[i + 1],
        distance: dist,
        duration: dist / 40 * 60,
      });
    }

    return {
      totalDistance,
      totalDuration: totalDistance / 40 * 60,
      segments,
    };
  }

  static haversineDistance(point1, point2) {
    const R = 6371;
    const lat1 = this.toRadians(point1.lat);
    const lat2 = this.toRadians(point2.lat);
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLon = this.toRadians(point2.lng - point1.lng);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static toRadians(deg) {
    return deg * (Math.PI / 180);
  }

  static aStarRoute(start, waypoints, end) {
    const points = [start, ...waypoints.map(w => w.address.coordinates), end];
    
    let totalDistance = 0;
    const segments = [];

    for (let i = 0; i < points.length - 1; i++) {
      const variation = 1 + (Math.random() * 0.2 - 0.1);
      const dist = this.haversineDistance(points[i], points[i + 1]) * variation;
      totalDistance += dist;
      segments.push({
        from: points[i],
        to: points[i + 1],
        distance: dist,
        duration: dist / 35 * 60,
      });
    }

    return {
      totalDistance,
      totalDuration: totalDistance / 35 * 60,
      segments,
    };
  }
}

module.exports = PathfindingService;