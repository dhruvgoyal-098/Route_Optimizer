class TSPSolver {
  static solveTSP(deliveries, startLocation, endLocation) {
    if (deliveries.length <= 1) return deliveries;

    if (deliveries.length <= 8) {
      return this.solveExactTSP(deliveries, startLocation, endLocation);
    }

    return this.solveApproxTSP(deliveries, startLocation, endLocation);
  }

  static solveExactTSP(deliveries, start, end) {
    const n = deliveries.length;
    const dist = this.createDistanceMatrix([start, ...deliveries, end]);
    
    const dp = Array(1 << n).fill(null).map(() => Array(n).fill(Infinity));
    const parent = Array(1 << n).fill(null).map(() => Array(n).fill(-1));
    
    for (let i = 0; i < n; i++) {
      dp[1 << i][i] = this.calculateDistance(start, deliveries[i].address.coordinates);
    }
    
    for (let mask = 1; mask < (1 << n); mask++) {
      for (let i = 0; i < n; i++) {
        if (!(mask & (1 << i))) continue;
        for (let j = 0; j < n; j++) {
          if (mask & (1 << j)) continue;
          const newMask = mask | (1 << j);
          const dist = this.calculateDistance(
            deliveries[i].address.coordinates,
            deliveries[j].address.coordinates
          );
          if (dp[newMask][j] > dp[mask][i] + dist) {
            dp[newMask][j] = dp[mask][i] + dist;
            parent[newMask][j] = i;
          }
        }
      }
    }
    
    let minDist = Infinity;
    let lastIdx = -1;
    const fullMask = (1 << n) - 1;
    
    for (let i = 0; i < n; i++) {
      const totalDist = dp[fullMask][i] + this.calculateDistance(
        deliveries[i].address.coordinates,
        end
      );
      if (totalDist < minDist) {
        minDist = totalDist;
        lastIdx = i;
      }
    }
    
    const path = [];
    let mask = fullMask;
    let idx = lastIdx;
    
    while (idx !== -1) {
      path.unshift(deliveries[idx]);
      const prev = parent[mask][idx];
      mask ^= (1 << idx);
      idx = prev;
    }
    
    return path;
  }

  static solveApproxTSP(deliveries, start, end) {
    let route = this.nearestNeighbor(deliveries, start);
    
    for (let i = 0; i < 10; i++) {
      route = this.twoOpt(route);
    }

    return route;
  }

  static nearestNeighbor(deliveries, start) {
    const unvisited = [...deliveries];
    const route = [];
    let current = start;

    while (unvisited.length > 0) {
      let nearest = null;
      let minDist = Infinity;

      for (const delivery of unvisited) {
        const dist = this.calculateDistance(current, delivery.address.coordinates);
        if (dist < minDist) {
          minDist = dist;
          nearest = delivery;
        }
      }

      route.push(nearest);
      current = nearest.address.coordinates;
      const index = unvisited.indexOf(nearest);
      unvisited.splice(index, 1);
    }

    return route;
  }

  static twoOpt(route) {
    let improved = true;
    let bestRoute = [...route];

    while (improved) {
      improved = false;
      for (let i = 1; i < route.length - 1; i++) {
        for (let j = i + 1; j < route.length; j++) {
          const newRoute = this.twoOptSwap(bestRoute, i, j);
          if (this.calculateRouteDistance(newRoute) < this.calculateRouteDistance(bestRoute)) {
            bestRoute = newRoute;
            improved = true;
            break;
          }
        }
        if (improved) break;
      }
    }

    return bestRoute;
  }

  static twoOptSwap(route, i, j) {
    const newRoute = [...route];
    while (i < j) {
      [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
      i++;
      j--;
    }
    return newRoute;
  }

  static calculateDistance(point1, point2) {
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

  static toRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  static calculateRouteDistance(route) {
    let total = 0;
    for (let i = 0; i < route.length - 1; i++) {
      total += this.calculateDistance(
        route[i].address.coordinates,
        route[i + 1].address.coordinates
      );
    }
    return total;
  }

  static createDistanceMatrix(points) {
    const n = points.length;
    const matrix = Array(n).fill(null).map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dist = this.calculateDistance(points[i], points[j]);
        matrix[i][j] = dist;
        matrix[j][i] = dist;
      }
    }
    
    return matrix;
  }
}

module.exports = TSPSolver;