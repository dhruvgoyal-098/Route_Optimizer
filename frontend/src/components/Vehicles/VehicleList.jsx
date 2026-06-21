import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { getVehicles, deleteVehicle } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import './Vehicles.css';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await getVehicles();
      setVehicles(response.data.vehicles);
    } catch (error) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await deleteVehicle(id);
      toast.success('Vehicle deleted successfully');
      fetchVehicles();
    } catch (error) {
      toast.error('Failed to delete vehicle');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'on-route': return '#3b82f6';
      case 'maintenance': return '#f59e0b';
      case 'offline': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'van': return '🚐';
      case 'truck': return '🚛';
      case 'motorcycle': return '🏍️';
      case 'car': return '🚗';
      default: return '🚗';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="vehicles-container">
      <div className="vehicles-header">
        <h1>Vehicles</h1>
        <Link to="/vehicles/new" className="btn btn-primary">
          <FaPlus /> Add Vehicle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="empty-state">
          <p>No vehicles found. Add your first vehicle!</p>
          <Link to="/vehicles/new" className="btn btn-primary">
            Add Vehicle
          </Link>
        </div>
      ) : (
        <div className="vehicles-grid">
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="vehicle-card">
              <div className="vehicle-icon">{getTypeIcon(vehicle.type)}</div>
              <div className="vehicle-info">
                <h3>{vehicle.name}</h3>
                <span className="vehicle-type">{vehicle.type}</span>
                <div className="vehicle-details">
                  <span>⚖️ {vehicle.capacity.weight}kg</span>
                  <span>⛽ {vehicle.fuelEfficiency} km/L</span>
                </div>
<div className="vehicle-status">
  <span className={`status-dot ${vehicle.status}`}></span>
  <span className="status-text">{vehicle.status}</span>
</div>
                <div className="vehicle-location">
                  📍 {vehicle.currentLocation.lat.toFixed(4)}, {vehicle.currentLocation.lng.toFixed(4)}
                </div>
                <span className="status-badge" style={{ backgroundColor: getStatusColor(vehicle.status) }}>
                  {vehicle.status}
                </span>
              </div>
              <div className="vehicle-actions">
                <Link to={`/vehicles/${vehicle._id}`} className="btn btn-secondary">
                  <FaEdit /> Edit
                </Link>
                <button className="btn btn-danger" onClick={() => handleDelete(vehicle._id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehicleList;