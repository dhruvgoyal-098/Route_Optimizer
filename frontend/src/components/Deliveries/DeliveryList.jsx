import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaPlus, FaCheck } from 'react-icons/fa';
import { getDeliveries, deleteDelivery, updateDelivery } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import './Deliveries.css';

const DeliveryList = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await getDeliveries(params);
      setDeliveries(response.data.deliveries || []);
    } catch (error) {
      toast.error('Failed to load deliveries');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this delivery?')) return;
    try {
      await deleteDelivery(id);
      toast.success('Delivery deleted successfully');
      fetchDeliveries();
    } catch (error) {
      toast.error('Failed to delete delivery');
    }
  };

  // ✅ NEW: Mark delivery as delivered
  const handleMarkDelivered = async (id) => {
    try {
      await updateDelivery(id, { status: 'delivered' });
      toast.success('✅ Delivery marked as delivered!');
      fetchDeliveries();
    } catch (error) {
      console.error('Failed to mark as delivered:', error);
      toast.error('Failed to mark as delivered');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'in-transit': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="deliveries-container">
      <div className="deliveries-header">
        <h1>Deliveries</h1>
        <Link to="/deliveries/new" className="btn btn-primary">
          <FaPlus /> Add Delivery
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
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filter === 'in-transit' ? 'active' : ''}`}
          onClick={() => setFilter('in-transit')}
        >
          In Transit
        </button>
        <button
          className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilter('delivered')}
        >
          Delivered
        </button>
      </div>

      {deliveries.length === 0 ? (
        <div className="empty-state">
          <p>No deliveries found. Create your first delivery!</p>
          <Link to="/deliveries/new" className="btn btn-primary">
            Add Delivery
          </Link>
        </div>
      ) : (
        <div className="deliveries-table-container">
          <table className="deliveries-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Weight</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr key={delivery._id}>
                  <td><strong>{delivery.orderId}</strong></td>
                  <td>{delivery.customerName}</td>
                  <td>{delivery.address?.street}, {delivery.address?.city}</td>
                  <td>
                    <span className="priority-badge" style={{ backgroundColor: getPriorityColor(delivery.priority) }}>
                      {delivery.priority}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(delivery.status) }}>
                      {delivery.status}
                    </span>
                  </td>
                  <td>{delivery.packageDetails?.weight} kg</td>
                  <td className="actions-cell">
                    {/* ✅ NEW: Mark as Delivered button */}
                    {delivery.status !== 'delivered' && (
                      <button 
                        className="btn btn-success btn-sm" 
                        onClick={() => handleMarkDelivered(delivery._id)}
                        title="Mark as delivered"
                      >
                        <FaCheck /> Delivered
                      </button>
                    )}
                    {delivery.status === 'delivered' && (
                      <span className="delivered-badge">✅ Done</span>
                    )}
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => handleDelete(delivery._id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeliveryList;