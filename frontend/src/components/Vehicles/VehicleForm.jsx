import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { createVehicle, updateVehicle, getVehicleById } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Vehicles.css';

const VehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      type: 'van',
      capacityWeight: 500,
      capacityVolume: 8,
      fuelEfficiency: 10,
      lat: 40.7128,
      lng: -74.0060,
      status: 'available',
    },
  });

  const fetchVehicle = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getVehicleById(id);
      const vehicle = response.data.vehicle;
      setValue('name', vehicle.name);
      setValue('type', vehicle.type);
      setValue('capacityWeight', vehicle.capacity.weight);
      setValue('capacityVolume', vehicle.capacity.volume || 0);
      setValue('fuelEfficiency', vehicle.fuelEfficiency);
      setValue('lat', vehicle.currentLocation.lat);
      setValue('lng', vehicle.currentLocation.lng);
      setValue('status', vehicle.status);
    } catch (error) {
      toast.error('Failed to load vehicle');
      navigate('/vehicles');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, setValue]);

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchVehicle();
    }
  }, [id, fetchVehicle]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const vehicleData = {
        name: data.name,
        type: data.type,
        capacity: {
          weight: parseFloat(data.capacityWeight),
          volume: parseFloat(data.capacityVolume) || 0,
        },
        fuelEfficiency: parseFloat(data.fuelEfficiency),
        currentLocation: {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
        },
        status: data.status,
      };

      if (isEdit) {
        await updateVehicle(id, vehicleData);
        toast.success('Vehicle updated successfully');
      } else {
        await createVehicle(vehicleData);
        toast.success('Vehicle created successfully');
      }
      navigate('/vehicles');
    } catch (error) {
      toast.error(isEdit ? 'Failed to update vehicle' : 'Failed to create vehicle');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="vehicle-form-container">
      <h1>{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>
      <div className="vehicle-form-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row">
            <div className="form-group">
              <label>Vehicle Name *</label>
              <input
                type="text"
                {...register('name', { required: 'Vehicle name is required' })}
                placeholder="e.g., Delivery Van 01"
              />
              {errors.name && <span className="error">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label>Vehicle Type *</label>
              <select {...register('type', { required: 'Vehicle type is required' })}>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="car">Car</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Capacity Weight (kg) *</label>
              <input
                type="number"
                {...register('capacityWeight', { required: 'Weight capacity is required', min: 0 })}
                placeholder="500"
              />
            </div>

            <div className="form-group">
              <label>Capacity Volume (m³)</label>
              <input
                type="number"
                {...register('capacityVolume')}
                placeholder="8"
                step="0.1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fuel Efficiency (km/L) *</label>
              <input
                type="number"
                {...register('fuelEfficiency', { required: 'Fuel efficiency is required', min: 1 })}
                placeholder="10"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select {...register('status')}>
                <option value="available">Available</option>
                <option value="on-route">On Route</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Current Location - Latitude *</label>
              <input
                type="number"
                step="0.000001"
                {...register('lat', { required: 'Latitude is required' })}
                placeholder="40.7128"
              />
            </div>

            <div className="form-group">
              <label>Current Location - Longitude *</label>
              <input
                type="number"
                step="0.000001"
                {...register('lng', { required: 'Longitude is required' })}
                placeholder="-74.0060"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/vehicles')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Vehicle' : 'Create Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleForm;