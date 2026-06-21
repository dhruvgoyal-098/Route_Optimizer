const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['van', 'truck', 'motorcycle', 'car'],
    required: true,
  },
  capacity: {
    weight: {
      type: Number,
      required: true,
    },
    volume: {
      type: Number,
    },
  },
  fuelEfficiency: {
    type: Number,
    default: 10,
  },
  currentLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  status: {
    type: String,
    enum: ['available', 'on-route', 'maintenance', 'offline'],
    default: 'available',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Vehicle', vehicleSchema);