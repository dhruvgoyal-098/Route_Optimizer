const TSPSolver = require('./tspSolver');
const Pathfinding = require('./pathfindingService');

class OptimizationService {
  static async optimizeRoute(deliveries, startLocation, endLocation, vehicle) {
    try {
      console.log('🧮 Starting optimization for', deliveries.length, 'deliveries');
      
      const orderedDeliveries = TSPSolver.solveTSP(
        deliveries,
        startLocation,
        endLocation
      );

      console.log('✅ TSP solved, order:', orderedDeliveries.map(d => d.orderId));

      const routeDetails = await Pathfinding.calculateRoute(
        startLocation,
        orderedDeliveries,
        endLocation
      );

      return [{
        deliveries: orderedDeliveries,
        ...routeDetails,
      }];
    } catch (error) {
      console.error('❌ Optimization error:', error);
      throw error;
    }
  }

  static calculateSavings(originalRoute, optimizedRoute) {
    const originalDistance = originalRoute.totalDistance || originalRoute * 1.2;
    const newDistance = optimizedRoute.totalDistance;
    const savedDistance = originalDistance - newDistance;
    const optimizationPercent = (savedDistance / originalDistance) * 100;

    return {
      originalDistance,
      newDistance,
      savedDistance,
      optimizationPercent: Math.round(optimizationPercent),
    };
  }
}

module.exports = OptimizationService;