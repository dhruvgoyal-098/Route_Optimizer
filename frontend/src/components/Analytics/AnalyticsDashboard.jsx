import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMetrics, getPerformance } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import './Analytics.css';

const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [metricsRes, performanceRes] = await Promise.all([
        getMetrics(),
        getPerformance(),
      ]);
      setMetrics(metricsRes.data.metrics);
      setPerformance(performanceRes.data.performance);
    } catch (error) {
      toast.error('Failed to load analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const deliveryStatusData = [
    { name: 'Delivered', value: metrics?.completionRate || 70 },
    { name: 'In Transit', value: 20 },
    { name: 'Pending', value: 10 },
  ];

  const weeklyData = [
    { day: 'Mon', deliveries: 12, efficiency: 85 },
    { day: 'Tue', deliveries: 18, efficiency: 78 },
    { day: 'Wed', deliveries: 15, efficiency: 92 },
    { day: 'Thu', deliveries: 22, efficiency: 70 },
    { day: 'Fri', deliveries: 20, efficiency: 88 },
    { day: 'Sat', deliveries: 8, efficiency: 95 },
    { day: 'Sun', deliveries: 5, efficiency: 90 },
  ];

  return (
    <div className="analytics-container">
      <h1>Analytics Dashboard</h1>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>Average Route Distance</h3>
            <p>{metrics?.averageRouteDistance?.toFixed(2) || 0} km</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <h3>Avg Deliveries per Route</h3>
            <p>{metrics?.averageDeliveriesPerRoute?.toFixed(1) || 0}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">⛽</div>
          <div className="metric-content">
            <h3>Total Fuel Saved</h3>
            <p>{metrics?.totalFuelSaved?.toFixed(2) || 0} L</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3>Completion Rate</h3>
            <p>{metrics?.completionRate?.toFixed(1) || 0}%</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Weekly Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="deliveries" stroke="#3b82f6" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Delivery Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deliveryStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {deliveryStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Route Performance History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performance.slice(0, 10)}>
              <XAxis dataKey="routeName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="distance" fill="#3b82f6" name="Distance (km)" />
              <Bar dataKey="deliveries" fill="#10b981" name="Deliveries" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;