const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Delivery = require('./models/Delivery');
const Route = require('./models/Route');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Delivery.deleteMany({});
    await Route.deleteMany({});
    console.log('Cleared existing data');

    // Create demo user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'Demo Dispatcher',
      email: 'demo@example.com',
      password: hashedPassword,
      company: 'Demo Logistics Inc.',
      role: 'dispatcher',
    });
    console.log('✅ Created demo user:', user.email);

    // Create vehicles
    const vehicles = await Vehicle.create([
      {
        userId: user._id,
        name: 'Van 01',
        type: 'van',
        capacity: { weight: 500, volume: 8 },
        fuelEfficiency: 12,
        currentLocation: { lat: 40.7128, lng: -74.0060 },
        status: 'available',
      },
      {
        userId: user._id,
        name: 'Truck 01',
        type: 'truck',
        capacity: { weight: 2000, volume: 25 },
        fuelEfficiency: 8,
        currentLocation: { lat: 40.7282, lng: -73.9942 },
        status: 'available',
      },
      {
        userId: user._id,
        name: 'Motorcycle 01',
        type: 'motorcycle',
        capacity: { weight: 100, volume: 2 },
        fuelEfficiency: 20,
        currentLocation: { lat: 40.7489, lng: -73.9680 },
        status: 'available',
      },
    ]);
    console.log(`✅ Created ${vehicles.length} vehicles`);

    // Create deliveries (NYC area)
    const deliveryLocations = [
      { lat: 40.7580, lng: -73.9855, name: 'Times Square' },
      { lat: 40.7489, lng: -73.9680, name: 'Empire State' },
      { lat: 40.7061, lng: -74.0118, name: 'Wall Street' },
      { lat: 40.7831, lng: -73.9712, name: 'Central Park' },
      { lat: 40.7306, lng: -73.9353, name: 'Williamsburg' },
      { lat: 40.6919, lng: -73.9882, name: 'Brooklyn Heights' },
      { lat: 40.7628, lng: -73.9583, name: 'Upper East Side' },
      { lat: 40.7750, lng: -73.9747, name: 'Upper West Side' },
    ];

    const deliveries = await Promise.all(
      deliveryLocations.map((loc, index) => 
        Delivery.create({
          userId: user._id,
          orderId: `ORD-${String(index + 1).padStart(4, '0')}`,
          customerName: `Customer ${index + 1}`,
          customerPhone: `+1-555-${String(100 + index).padStart(4, '0')}`,
          address: {
            street: `${100 + index} Main St`,
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            coordinates: { lat: loc.lat, lng: loc.lng },
          },
          packageDetails: {
            weight: 10 + Math.random() * 40,
            description: `Package ${index + 1}`,
          },
          priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
          status: 'pending',
        })
      )
    );
    console.log(`✅ Created ${deliveries.length} deliveries`);

    // Create a sample route
    const sampleRoute = await Route.create({
      userId: user._id,
      name: 'Manhattan Delivery Route',
      vehicleId: vehicles[0]._id,
      deliveries: deliveries.slice(0, 4).map((d, index) => ({
        deliveryId: d._id,
        sequence: index + 1,
      })),
      startLocation: { lat: 40.7128, lng: -74.0060 },
      endLocation: { lat: 40.7282, lng: -73.9942 },
      waypoints: deliveries.slice(0, 4).map(d => d.address.coordinates),
      totalDistance: 12.5,
      totalDuration: 45,
      estimatedFuel: 1.2,
      optimizationMetrics: {
        originalDistance: 15.3,
        savedDistance: 2.8,
        optimizationPercent: 18,
        algorithmUsed: 'Christofides + 2-opt',
      },
      status: 'planned',
      scheduledDate: new Date(),
    });
    console.log(`✅ Created sample route`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Email: demo@example.com');
    console.log('Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();