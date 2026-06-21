import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import { FaTruck, FaRoute, FaCheckCircle, FaClock } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardData } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import 'leaflet/dist/leaflet.css';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardData();
      setData(response.data.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  const stats = [
    {
      title: 'Active Routes',
      value: data?.stats?.activeRoutes || 0,
      icon: <FaRoute />,
      color: '#3b82f6',
    },
    {
      title: 'On Route Vehicles',
      value: data?.stats?.activeVehicles || 0,
      icon: <FaTruck />,
      color: '#10b981',
    },
    {
      title: 'Completed Deliveries',
      value: data?.stats?.completedDeliveries || 0,
      icon: <FaCheckCircle />,
      color: '#f59e0b',
    },
    {
      title: 'Pending Deliveries',
      value: data?.stats?.pendingDeliveries || 0,
      icon: <FaClock />,
      color: '#ef4444',
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/routes/new" className="btn btn-primary">
          + Create New Route
        </Link>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card map-card">
          <h3>📍 Active Routes</h3>
          <MapContainer
            center={[40.7128, -74.0060]}
            zoom={12}
            style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {data?.recentRoutes?.map((route, index) => (
              <Polyline
                key={index}
                positions={[
                  [40.7128, -74.0060],
                  [40.7580, -73.9855],
                  [40.7489, -73.9680],
                  [40.7061, -74.0118],
                ]}
                color="#3b82f6"
                weight={3}
                opacity={0.7}
              />
            ))}
          </MapContainer>
        </div>

        <div className="dashboard-card chart-card">
          <h3>📊 Weekly Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.weeklyPerformance || []}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="deliveries"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="efficiency"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;