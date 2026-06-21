import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaTrash, FaPlay } from 'react-icons/fa';
import { getRoutes, deleteRoute, executeRoute } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import './Routes.css';

const RouteList = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await getRoutes(params);
      setRoutes(response.data.routes || []);
    } catch (error) {
      toast.error('Failed to load routes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    try {
      await deleteRoute(id);
      toast.success('Route deleted successfully');
      fetchRoutes();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete route');
    }
  };

  const handleExecute = async (id) => {
    try {
      await executeRoute(id);
      toast.success('Route execution started');
      fetchRoutes();
    } catch (error) {
      console.error('Execute error:', error);
      toast.error('Failed to execute route');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'planned': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span className="status-badge" style={{ backgroundColor: getStatusColor(status) }}>
        {status}
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="routes-container">
      <div className="routes-header">
        <h1>Routes</h1>
        <Link to="/routes/new" className="btn btn-primary">
          + Create New Route
        </Link>
      </div>

      <div className="filter-bar">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'planned' ? 'active' : ''}`}
          onClick={() => setFilter('planned')}
        >
          Planned
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {routes.length === 0 ? (
        <div className="empty-state">
          <p>No routes found. Create your first route!</p>
          <Link to="/routes/new" className="btn btn-primary">
            Create Route
          </Link>
        </div>
      ) : (
        <div className="routes-grid">
          {routes.map((route) => (
            <div key={route._id} className="route-card">
              <div className="route-card-header">
                <h3>{route.name}</h3>
                {getStatusBadge(route.status)}
              </div>
              <div className="route-card-body">
                <div className="route-metrics">
                  <div className="metric">
                    <span>📦 Deliveries</span>
                    <strong>{route.deliveries?.length || 0}</strong>
                  </div>
                  <div className="metric">
                    <span>📏 Distance</span>
                    <strong>{route.totalDistance?.toFixed(1) || 0} km</strong>
                  </div>
                  <div className="metric">
                    <span>⏱️ Duration</span>
                    <strong>{Math.round(route.totalDuration || 0)} min</strong>
                  </div>
                  <div className="metric">
                    <span>⛽ Fuel</span>
                    <strong>{route.estimatedFuel?.toFixed(1) || 0} L</strong>
                  </div>
                </div>
                {route.optimizationMetrics?.optimizationPercent > 0 && (
                  <div className="optimization-badge">
                    🚀 {route.optimizationMetrics.optimizationPercent}% optimized
                  </div>
                )}
                <div className="route-vehicle">
                  🚗 {route.vehicleId?.name || 'No vehicle assigned'}
                </div>
              </div>
              <div className="route-card-actions">
                <Link to={`/routes/${route._id}`} className="btn btn-secondary">
                  <FaEye /> View
                </Link>
                {route.status === 'planned' && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => handleExecute(route._id)}
                    >
                      <FaPlay /> Start
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(route._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </>
                )}
                {(route.status === 'active' || route.status === 'completed') && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(route._id)}
                  >
                    <FaTrash /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RouteList;