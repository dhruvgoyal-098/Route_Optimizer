const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  deliveries: [{
    deliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
      required: true,
    },
    sequence: {
      type: Number,
      required: true,
    },
    estimatedArrival: Date,
    actualArrival: Date,
  }],
  startLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  endLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  waypoints: [{
    lat: Number,
    lng: Number,
    stopIndex: Number,
  }],
  totalDistance: {
    type: Number,
    required: true,
  },
  totalDuration: {
    type: Number,
    required: true,
  },
  estimatedFuel: {
    type: Number,
  },
  optimizationMetrics: {
    originalDistance: Number,
    savedDistance: Number,
    optimizationPercent: Number,
    algorithmUsed: String,
  },
  status: {
    type: String,
    enum: ['planned', 'active', 'completed', 'cancelled'],
    default: 'planned',
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Route', routeSchema);