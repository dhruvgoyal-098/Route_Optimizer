import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { createDelivery } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Deliveries.css';

const DeliveryForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      customerName: '',
      customerPhone: '',
      street: '',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      lat: 40.7128,
      lng: -74.0060,
      weight: 10,
      description: '',
      priority: 'medium',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const deliveryData = {
        orderId: data.orderId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          coordinates: {
            lat: parseFloat(data.lat),
            lng: parseFloat(data.lng),
          },
        },
        packageDetails: {
          weight: parseFloat(data.weight),
          description: data.description,
        },
        priority: data.priority,
        status: 'pending',
      };

      await createDelivery(deliveryData);
      toast.success('Delivery created successfully!');
      navigate('/deliveries');
    } catch (error) {
      toast.error('Failed to create delivery');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="delivery-form-container">
      <h1>Create New Delivery</h1>
      <div className="delivery-form-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row">
            <div className="form-group">
              <label>Order ID *</label>
              <input
                type="text"
                {...register('orderId', { required: 'Order ID is required' })}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Customer Name *</label>
              <input
                type="text"
                {...register('customerName', { required: 'Customer name is required' })}
                placeholder="John Doe"
              />
              {errors.customerName && <span className="error">{errors.customerName.message}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Customer Phone *</label>
              <input
                type="text"
                {...register('customerPhone', { required: 'Phone is required' })}
                placeholder="+1-555-1234"
              />
              {errors.customerPhone && <span className="error">{errors.customerPhone.message}</span>}
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select {...register('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Street Address *</label>
              <input
                type="text"
                {...register('street', { required: 'Street is required' })}
                placeholder="123 Main St"
              />
              {errors.street && <span className="error">{errors.street.message}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                {...register('city', { required: 'City is required' })}
                placeholder="New York"
              />
            </div>

            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                {...register('state', { required: 'State is required' })}
                placeholder="NY"
              />
            </div>

            <div className="form-group">
              <label>Zip Code *</label>
              <input
                type="text"
                {...register('zipCode', { required: 'Zip code is required' })}
                placeholder="10001"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude *</label>
              <input
                type="number"
                step="0.000001"
                {...register('lat', { required: 'Latitude is required' })}
                placeholder="40.7128"
              />
            </div>

            <div className="form-group">
              <label>Longitude *</label>
              <input
                type="number"
                step="0.000001"
                {...register('lng', { required: 'Longitude is required' })}
                placeholder="-74.0060"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Package Weight (kg) *</label>
              <input
                type="number"
                {...register('weight', { required: 'Weight is required', min: 0 })}
                placeholder="10"
              />
              {errors.weight && <span className="error">{errors.weight.message}</span>}
            </div>

            <div className="form-group">
              <label>Package Description</label>
              <input
                type="text"
                {...register('description')}
                placeholder="Fragile electronics"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/deliveries')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Delivery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryForm;