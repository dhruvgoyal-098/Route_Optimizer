const Route = require('../models/Route');
const Delivery = require('../models/Delivery');
const Vehicle = require('../models/Vehicle');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.userId;

    const [routes, deliveries, vehicles] = await Promise.all([
      Route.find({ userId }),
      Delivery.find({ userId }),
      Vehicle.find({ userId }),
    ]);

    const stats = {
      totalRoutes: routes.length,
      activeRoutes: routes.filter(r => r.status === 'active').length,
      completedRoutes: routes.filter(r => r.status === 'completed').length,
      totalDeliveries: deliveries.length,
      completedDeliveries: deliveries.filter(d => d.status === 'delivered').length,
      pendingDeliveries: deliveries.filter(d => d.status === 'pending').length,
      activeVehicles: vehicles.filter(v => v.status === 'available').length,
      totalDistance: routes.reduce((sum, r) => sum + r.totalDistance, 0),
    };

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyPerformance = weekDays.map((day, index) => {
      const dayRoutes = routes.filter(r => {
        const date = new Date(r.createdAt);
        return date.getDay() === (index + 1) % 7;
      });
      return {
        day,
        deliveries: dayRoutes.reduce((sum, r) => sum + r.deliveries.length, 0),
        efficiency: dayRoutes.length > 0 
          ? Math.round(dayRoutes.reduce((sum, r) => sum + r.totalDistance, 0) / dayRoutes.length * 100) / 100
          : 0,
      };
    });

    const recentRoutes = routes
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map(r => ({
        _id: r._id,
        name: r.name,
        status: r.status,
        totalDistance: r.totalDistance,
        deliveries: r.deliveries,
      }));

    res.json({
      success: true,
      data: {
        stats,
        weeklyPerformance,
        recentRoutes,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMetrics = async (req, res) => {
  try {
    const userId = req.userId;
    
    const routes = await Route.find({ userId });
    const deliveries = await Delivery.find({ userId });

    const metrics = {
      averageRouteDistance: routes.length > 0 
        ? routes.reduce((sum, r) => sum + r.totalDistance, 0) / routes.length 
        : 0,
      averageDeliveriesPerRoute: routes.length > 0
        ? routes.reduce((sum, r) => sum + r.deliveries.length, 0) / routes.length
        : 0,
      totalFuelSaved: routes.reduce((sum, r) => sum + (r.optimizationMetrics?.savedDistance || 0), 0),
      completionRate: deliveries.length > 0
        ? (deliveries.filter(d => d.status === 'delivered').length / deliveries.length) * 100
        : 0,
    };

    res.json({
      success: true,
      metrics,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPerformance = async (req, res) => {
  try {
    const userId = req.userId;
    
    const routes = await Route.find({ userId })
      .populate('vehicleId')
      .sort({ createdAt: -1 });

    const performance = routes.map(r => ({
      date: r.createdAt,
      routeName: r.name,
      vehicle: r.vehicleId?.name || 'Unknown',
      distance: r.totalDistance,
      duration: r.totalDuration,
      deliveries: r.deliveries.length,
      optimization: r.optimizationMetrics?.optimizationPercent || 0,
    }));

    res.json({
      success: true,
      performance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};