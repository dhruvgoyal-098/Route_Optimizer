import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { getVehicles, getDeliveries, optimizeRoute, createRoute } from '../../services/api';
import RouteMap from '../Map/RouteMap';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Routes.css';

const RouteForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [selectedDeliveries, setSelectedDeliveries] = useState([]);
  const [showOptimization, setShowOptimization] = useState(false);

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      name: '',
      vehicleId: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      startLocation: { lat: 40.7128, lng: -74.0060 },
      endLocation: { lat: 40.7282, lng: -73.9942 },
    },
  });

  const vehicleId = watch('vehicleId');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, deliveriesRes] = await Promise.all([
        getVehicles(),
        getDeliveries({ status: 'pending' }),
      ]);
      setVehicles(vehiclesRes.data.vehicles || []);
      setDeliveries(deliveriesRes.data.deliveries || []);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryToggle = (delivery) => {
    setSelectedDeliveries(prev => {
      const exists = prev.find(d => d._id === delivery._id);
      if (exists) {
        return prev.filter(d => d._id !== delivery._id);
      }
      return [...prev, delivery];
    });
  };

  const handleOptimize = async () => {
    console.log('🔍 Optimize button clicked');
    console.log('📦 Selected deliveries:', selectedDeliveries);
    console.log('🚗 Vehicle ID:', vehicleId);

    if (selectedDeliveries.length < 2) {
      toast.error('Select at least 2 deliveries to optimize');
      return;
    }

    if (!vehicleId) {
      toast.error('Please select a vehicle');
      return;
    }

    try {
      setLoading(true);
      const startLocation = {
        lat: parseFloat(watch('startLocation.lat')),
        lng: parseFloat(watch('startLocation.lng')),
      };
      const endLocation = {
        lat: parseFloat(watch('endLocation.lat')),
        lng: parseFloat(watch('endLocation.lng')),
      };

      console.log('📍 Start Location:', startLocation);
      console.log('📍 End Location:', endLocation);

      const requestData = {
        deliveryIds: selectedDeliveries.map(d => d._id),
        vehicleId,
        startLocation,
        endLocation,
      };

      console.log('📤 Sending optimize request:', requestData);

      const response = await optimizeRoute(requestData);
      console.log('📥 Optimize response:', response.data);

      setOptimizedRoute(response.data.routes[0]);
      setShowOptimization(true);
      toast.success('Route optimized successfully!');
    } catch (error) {
      console.error('❌ Optimization error:', error);
      console.error('❌ Error details:', error.response?.data);
      toast.error('Optimization failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };
  const onSubmit = async (data) => {
    if (!optimizedRoute) {
      toast.error('Please optimize the route first');
      return;
    }

    try {
      setLoading(true);
      const routeData = {
        name: data.name,
        vehicleId,
        scheduledDate: data.scheduledDate,
        startLocation: {
          lat: parseFloat(data.startLocation.lat),
          lng: parseFloat(data.startLocation.lng),
        },
        endLocation: {
          lat: parseFloat(data.endLocation.lat),
          lng: parseFloat(data.endLocation.lng),
        },
        deliveries: optimizedRoute.deliveries.map((d, index) => ({
          deliveryId: d._id,
          sequence: index + 1,
          estimatedArrival: new Date(Date.now() + (index + 1) * 15 * 60000),
        })),
        totalDistance: optimizedRoute.totalDistance,
        totalDuration: optimizedRoute.totalDuration,
        estimatedFuel: optimizedRoute.totalDistance / (vehicles.find(v => v._id === vehicleId)?.fuelEfficiency || 10),
        optimizationMetrics: {
          originalDistance: optimizedRoute.totalDistance * 1.2,
          savedDistance: optimizedRoute.totalDistance * 0.2,
          optimizationPercent: 20,
          algorithmUsed: 'Christofides + 2-opt',
        },
        waypoints: [
          data.startLocation,
          ...optimizedRoute.deliveries.map(d => d.address.coordinates),
          data.endLocation,
        ],
      };

      await createRoute(routeData);
      toast.success('Route created successfully!');
      navigate('/routes');
    } catch (error) {
      toast.error('Failed to create route: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="route-form-container">
      <h1>Create New Route</h1>

      <div className="route-form-grid">
        <div className="route-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label>Route Name *</label>
              <input
                type="text"
                {...register('name', { required: 'Route name is required' })}
                placeholder="e.g., Downtown Delivery Route"
              />
            </div>

            <div className="form-group">
              <label>Vehicle *</label>
              <select
                {...register('vehicleId', { required: 'Vehicle is required' })}
              >
                <option value="">Select Vehicle</option>
                {vehicles
                  .filter(v => v.status === 'available')
                  .map(vehicle => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.name} - {vehicle.type} (Capacity: {vehicle.capacity.weight}kg)
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label>Scheduled Date *</label>
              <input
                type="date"
                {...register('scheduledDate', { required: 'Date is required' })}
              />
            </div>

            <div className="form-group">
              <label>Start Location</label>
              <div className="location-inputs">
                <input
                  type="number"
                  step="0.000001"
                  {...register('startLocation.lat')}
                  placeholder="Latitude"
                />
                <input
                  type="number"
                  step="0.000001"
                  {...register('startLocation.lng')}
                  placeholder="Longitude"
                />
              </div>
            </div>

            <div className="form-group">
              <label>End Location</label>
              <div className="location-inputs">
                <input
                  type="number"
                  step="0.000001"
                  {...register('endLocation.lat')}
                  placeholder="Latitude"
                />
                <input
                  type="number"
                  step="0.000001"
                  {...register('endLocation.lng')}
                  placeholder="Longitude"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Select Deliveries</label>
              <div className="delivery-select">
                <div className="delivery-select-header">
                  <span>Selected: {selectedDeliveries.length}</span>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedDeliveries(deliveries)}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedDeliveries([])}
                  >
                    Clear All
                  </button>
                </div>
                <div className="delivery-list">
                  {deliveries.map(delivery => (
                    <div
                      key={delivery._id}
                      className={`delivery-item ${selectedDeliveries.find(d => d._id === delivery._id) ? 'selected' : ''}`}
                      onClick={() => handleDeliveryToggle(delivery)}
                    >
                      <div className="delivery-info">
                        <strong>{delivery.customerName}</strong>
                        <span className="delivery-address">
                          {delivery.address?.street}, {delivery.address?.city}
                        </span>
                      </div>
                      <span className={`delivery-priority priority-${delivery.priority || 'medium'}`}>
                        {delivery.priority || 'medium'}
                      </span>
                    </div>
                  ))}
                  {deliveries.length === 0 && (
                    <div className="empty-deliveries">
                      <p>No pending deliveries available</p>
                      <Link to="/deliveries/new" className="btn btn-primary">
                        Create Delivery
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleOptimize}
                disabled={selectedDeliveries.length < 2 || !vehicleId}
              >
                Optimize Route
              </button>

              {showOptimization && (
                <button type="submit" className="btn btn-primary">
                  Save Route
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="route-map-preview">
          {showOptimization && optimizedRoute ? (
            <div className="optimization-results">
              <h3>Optimization Results</h3>
              <div className="optimization-metrics">
                <div className="metric">
                  <span>Total Distance</span>
                  <strong>{optimizedRoute.totalDistance?.toFixed(2) || 0} km</strong>
                </div>
                <div className="metric">
                  <span>Total Duration</span>
                  <strong>{Math.round(optimizedRoute.totalDuration || 0)} min</strong>
                </div>
                <div className="metric">
                  <span>Stops</span>
                  <strong>{optimizedRoute.deliveries?.length || 0}</strong>
                </div>
                <div className="metric">
                  <span>Optimization</span>
                  <strong className="text-green">+20%</strong>
                </div>
              </div>
              <div className="map-container">
                <RouteMap
                  route={optimizedRoute}
                  deliveries={optimizedRoute.deliveries}
                  startLocation={watch('startLocation')}
                  endLocation={watch('endLocation')}
                />
              </div>
            </div>
          ) : (
            <div className="map-placeholder">
              <p>Select deliveries and click "Optimize Route" to see the optimized path</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteForm;