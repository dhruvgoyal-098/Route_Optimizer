const Route = require('../models/Route');
const Vehicle = require('../models/Vehicle');
const Delivery = require('../models/Delivery');
const OptimizationService = require('../services/optimizationService');

exports.optimizeRoute = async (req, res) => {
  try {
    console.log('📥 Optimize route request received');
    console.log('📦 Request body:', req.body);
    console.log('👤 User ID:', req.userId);

    const { deliveryIds, vehicleId, startLocation, endLocation } = req.body;

    if (!deliveryIds || deliveryIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 deliveries required' });
    }

    if (!vehicleId) {
      return res.status(400).json({ error: 'Vehicle ID required' });
    }

    if (!startLocation || !endLocation) {
      return res.status(400).json({ error: 'Start and end locations required' });
    }

    const deliveries = await Delivery.find({
      _id: { $in: deliveryIds },
      userId: req.userId,
    });

    console.log(`📦 Found ${deliveries.length} deliveries`);

    if (deliveries.length < 2) {
      return res.status(400).json({ error: 'Not enough deliveries found' });
    }

    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      userId: req.userId,
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    console.log('🚗 Vehicle found:', vehicle.name);

    const optimizedRoutes = await OptimizationService.optimizeRoute(
      deliveries,
      startLocation,
      endLocation,
      vehicle
    );

    console.log('✅ Route optimized successfully');

    const savings = OptimizationService.calculateSavings(
      deliveries.length * 5,
      optimizedRoutes[0]
    );

    res.json({
      success: true,
      routes: optimizedRoutes,
      vehicle: vehicle,
      savings: savings,
    });
  } catch (error) {
    console.error('❌ Route optimization error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const routeData = {
      ...req.body,
      userId: req.userId,
    };

    const route = new Route(routeData);
    await route.save();

    res.status(201).json({
      success: true,
      route,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRoutes = async (req, res) => {
  try {
    const { status, date } = req.query;
    const query = { userId: req.userId };

    if (status) query.status = status;
    if (date) query.scheduledDate = { $gte: new Date(date) };

    const routes = await Route.find(query)
      .populate('vehicleId')
      .populate('deliveries.deliveryId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      routes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRouteById = async (req, res) => {
  try {
    const route = await Route.findOne({
      _id: req.params.id,
      userId: req.userId,
    })
      .populate('vehicleId')
      .populate('deliveries.deliveryId');

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json({
      success: true,
      route,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ UPDATED: Update route with vehicle status management
exports.updateRoute = async (req, res) => {
  try {
    console.log('📝 Updating route:', req.params.id);
    console.log('📝 Update data:', req.body);
    
    // Find the route first
    const existingRoute = await Route.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!existingRoute) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // ✅ Check if we're completing the route
    const isCompleting = req.body.status === 'completed' && existingRoute.status !== 'completed';
    const isCancelling = req.body.status === 'cancelled' && existingRoute.status !== 'cancelled';
    
    // Update the route
    const route = await Route.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    // ✅ If route is being completed, update vehicle status to available
    if (isCompleting && route.vehicleId) {
      console.log('🔄 Route completed! Updating vehicle status to available...');
      
      const vehicle = await Vehicle.findOne({
        _id: route.vehicleId,
        userId: req.userId,
      });
      
      if (vehicle) {
        console.log(`🚗 Vehicle found: ${vehicle.name}, Current status: ${vehicle.status}`);
        vehicle.status = 'available';
        await vehicle.save();
        console.log(`✅ Vehicle ${vehicle.name} status updated to: ${vehicle.status}`);
      } else {
        console.log('⚠️ Vehicle not found for route:', route.vehicleId);
      }
    }
    
    // ✅ If route is being cancelled, update vehicle status to available
    if (isCancelling && route.vehicleId) {
      console.log('🔄 Route cancelled! Updating vehicle status to available...');
      
      const vehicle = await Vehicle.findOne({
        _id: route.vehicleId,
        userId: req.userId,
      });
      
      if (vehicle) {
        console.log(`🚗 Vehicle found: ${vehicle.name}, Current status: ${vehicle.status}`);
        vehicle.status = 'available';
        await vehicle.save();
        console.log(`✅ Vehicle ${vehicle.name} status updated to: ${vehicle.status}`);
      }
    }

    console.log('✅ Route updated successfully:', route.status);

    res.json({
      success: true,
      route,
      vehicleUpdated: isCompleting || isCancelling ? true : false,
    });
  } catch (error) {
    console.error('❌ Update route error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ UPDATED: Execute route with vehicle status update
exports.executeRoute = async (req, res) => {
  try {
    console.log('▶️ Executing route:', req.params.id);
    
    const route = await Route.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // Update route status
    route.status = 'active';
    await route.save();
    console.log('✅ Route status updated to: active');

    // ✅ Update vehicle status to on-route
    if (route.vehicleId) {
      const vehicle = await Vehicle.findOne({
        _id: route.vehicleId,
        userId: req.userId,
      });
      
      if (vehicle) {
        console.log(`🚗 Vehicle found: ${vehicle.name}, Current status: ${vehicle.status}`);
        vehicle.status = 'on-route';
        await vehicle.save();
        console.log(`✅ Vehicle ${vehicle.name} status updated to: ${vehicle.status}`);
      } else {
        console.log('⚠️ Vehicle not found for route:', route.vehicleId);
      }
    }

    res.json({
      success: true,
      message: 'Route execution started',
      route,
    });
  } catch (error) {
    console.error('❌ Execute route error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // ✅ If route is active or planned, update vehicle status back to available
    if (route.vehicleId && (route.status === 'active' || route.status === 'planned')) {
      const vehicle = await Vehicle.findOne({
        _id: route.vehicleId,
        userId: req.userId,
      });
      
      if (vehicle && vehicle.status === 'on-route') {
        vehicle.status = 'available';
        await vehicle.save();
        console.log(`✅ Vehicle ${vehicle.name} status updated to available`);
      }
    }

    res.json({
      success: true,
      message: 'Route deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};