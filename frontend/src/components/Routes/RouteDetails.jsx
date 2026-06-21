import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlay, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { getRouteById, deleteRoute, executeRoute, updateRoute } from '../../services/api';
import RouteMap from '../Map/RouteMap';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import './Routes.css';

const RouteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const fetchRoute = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching route:', id);
      const response = await getRouteById(id);
      console.log('📥 Route data:', response.data.route);
      setRoute(response.data.route);
    } catch (error) {
      console.error('❌ Failed to load route:', error);
      toast.error('Failed to load route details');
      navigate('/routes');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    try {
      await deleteRoute(id);
      toast.success('Route deleted successfully');
      navigate('/routes');
    } catch (error) {
      toast.error('Failed to delete route');
    }
  };

  const handleExecute = async () => {
    try {
      console.log('▶️ Starting route:', id);
      await executeRoute(id);
      toast.success('Route execution started! 🚀');
      fetchRoute();
    } catch (error) {
      console.error('❌ Failed to start route:', error);
      toast.error('Failed to execute route');
    }
  };

  const handleComplete = async () => {
    console.log('✅ Complete button clicked!');
    
    if (!route) {
      toast.error('Route not found');
      return;
    }

    // ✅ SAFE: Check if all deliveries are delivered (with null checks)
    const allDelivered = route.deliveries?.every(d => {
      // Skip if deliveryId is null
      if (!d.deliveryId) {
        console.warn('⚠️ Delivery has null deliveryId:', d);
        return false;
      }
      return d.deliveryId.status === 'delivered';
    });
    
    console.log('All deliveries delivered?', allDelivered);
    
    if (!allDelivered) {
      toast.error('Cannot complete route. All deliveries must be delivered first!');
      return;
    }

    if (!window.confirm('Are you sure you want to mark this route as completed?')) {
      console.log('❌ User cancelled completion');
      return;
    }

    try {
      setCompleting(true);
      console.log('⏳ Updating route status to completed...');
      
      const updateData = { 
        status: 'completed',
        completedAt: new Date().toISOString()
      };
      
      const response = await updateRoute(id, updateData);
      console.log('📥 Update response:', response.data);
      
      toast.success('✅ Route marked as completed! 🎉');
      fetchRoute();
    } catch (error) {
      console.error('❌ Failed to complete route:', error);
      toast.error('Failed to complete route: ' + (error.response?.data?.error || error.message));
    } finally {
      setCompleting(false);
    }
  };

  // ✅ SAFE: Check if all deliveries are delivered (with null checks)
  const areAllDeliveriesDelivered = () => {
    if (!route?.deliveries || route.deliveries.length === 0) return false;
    return route.deliveries.every(d => {
      if (!d.deliveryId) return false;
      return d.deliveryId.status === 'delivered';
    });
  };

  // Count delivered deliveries
  const getDeliveredCount = () => {
    if (!route?.deliveries) return 0;
    return route.deliveries.filter(d => d.deliveryId?.status === 'delivered').length;
  };

  if (loading) return <LoadingSpinner />;
  if (!route) return <div className="error-message">Route not found</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'planned': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const allDelivered = areAllDeliveriesDelivered();
  const deliveredCount = getDeliveredCount();
  const totalDeliveries = route.deliveries?.length || 0;

  // ✅ SAFE: Filter out null deliveries for display
  const validDeliveries = (route.deliveries || []).filter(d => d.deliveryId !== null);

  return (
    <div className="route-details-container">
      <div className="route-details-header">
        <button className="btn btn-secondary" onClick={() => navigate('/routes')}>
          <FaArrowLeft /> Back
        </button>
        <h1>{route.name}</h1>
        <div className="route-actions">
          {route.status === 'planned' && (
            <>
              <button className="btn btn-success" onClick={handleExecute}>
                <FaPlay /> Start Route
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                <FaTrash /> Delete
              </button>
            </>
          )}
          
          {route.status === 'active' && (
            <>
              <button 
                className="btn btn-success" 
                onClick={handleComplete}
                disabled={!allDelivered || completing}
              >
                <FaCheckCircle /> {completing ? 'Completing...' : 'Complete Route'}
              </button>
              <span className="delivery-progress">
                📦 {deliveredCount}/{totalDeliveries} delivered
              </span>
            </>
          )}
          
          {route.status === 'completed' && (
            <span className="completed-badge">✅ Completed</span>
          )}
        </div>
      </div>

      <div className="route-details-grid">
        <div className="route-info-card">
          <h3>Route Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Status</label>
              <span className="status-badge" style={{ backgroundColor: getStatusColor(route.status) }}>
                {route.status}
              </span>
            </div>
            <div className="info-item">
              <label>Vehicle</label>
              <span>{route.vehicleId?.name || 'Not assigned'}</span>
            </div>
            <div className="info-item">
              <label>Scheduled Date</label>
              <span>{new Date(route.scheduledDate).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Total Distance</label>
              <span>{route.totalDistance?.toFixed(2) || 0} km</span>
            </div>
            <div className="info-item">
              <label>Total Duration</label>
              <span>{Math.round(route.totalDuration || 0)} minutes</span>
            </div>
            <div className="info-item">
              <label>Estimated Fuel</label>
              <span>{route.estimatedFuel?.toFixed(2) || 0} L</span>
            </div>
            {route.optimizationMetrics?.optimizationPercent > 0 && (
              <div className="info-item">
                <label>Optimization</label>
                <span className="optimization-value">
                  🚀 {route.optimizationMetrics.optimizationPercent}% saved
                </span>
              </div>
            )}
            {route.status === 'active' && (
              <div className="info-item full-width">
                <label>Progress</label>
                <span className="progress-text">
                  {deliveredCount}/{totalDeliveries} deliveries completed
                </span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: totalDeliveries > 0 ? `${(deliveredCount / totalDeliveries) * 100}%` : '0%',
                      backgroundColor: allDelivered ? '#10b981' : '#3b82f6'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="route-deliveries-card">
          <h3>Deliveries ({validDeliveries.length})</h3>
          <div className="deliveries-list">
            {validDeliveries.length === 0 ? (
              <div className="empty-deliveries">
                <p>No deliveries in this route</p>
                {route.deliveries && route.deliveries.length > 0 && (
                  <p className="warning-text">⚠️ Some deliveries may have been deleted</p>
                )}
              </div>
            ) : (
              validDeliveries.map((item, index) => (
                <div key={index} className="delivery-item">
                  <div className="delivery-sequence">{index + 1}</div>
                  <div className="delivery-info">
                    <strong>{item.deliveryId?.customerName || 'Unknown'}</strong>
                    <span>{item.deliveryId?.address?.street || 'No address'}, {item.deliveryId?.address?.city || ''}</span>
                  </div>
                  <div className="delivery-status">
                    <span className="status-badge" style={{ 
                      backgroundColor: item.deliveryId?.status === 'delivered' ? '#10b981' : '#f59e0b' 
                    }}>
                      {item.deliveryId?.status || 'deleted'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="route-map-card">
        <h3>Route Map</h3>
        <div className="map-container">
          <RouteMap
            route={route}
            deliveries={validDeliveries.map(d => d.deliveryId).filter(d => d !== null)}
            startLocation={route.startLocation}
            endLocation={route.endLocation}
          />
        </div>
      </div>
    </div>
  );
};

export default RouteDetails;