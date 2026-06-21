import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './components/Dashboard/Dashboard';
import RouteList from './components/Routes/RouteList';
import RouteForm from './components/Routes/RouteForm';
import RouteDetails from './components/Routes/RouteDetails';
import VehicleList from './components/Vehicles/VehicleList';
import VehicleForm from './components/Vehicles/VehicleForm';
import DeliveryList from './components/Deliveries/DeliveryList';
import DeliveryForm from './components/Deliveries/DeliveryForm';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Navbar from './components/Common/Navbar';
import Sidebar from './components/Common/Sidebar';
import PrivateRoute from './components/Common/PrivateRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
              <Route path="/routes" element={<Layout><RouteList /></Layout>} />
              <Route path="/routes/new" element={<Layout><RouteForm /></Layout>} />
              <Route path="/routes/:id" element={<Layout><RouteDetails /></Layout>} />
              <Route path="/vehicles" element={<Layout><VehicleList /></Layout>} />
              <Route path="/vehicles/new" element={<Layout><VehicleForm /></Layout>} />
              <Route path="/deliveries" element={<Layout><DeliveryList /></Layout>} />
              <Route path="/deliveries/new" element={<Layout><DeliveryForm /></Layout>} />
              <Route path="/analytics" element={<Layout><AnalyticsDashboard /></Layout>} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <div className="main-content">
        <Sidebar />
        <div className="content">{children}</div>
      </div>
    </div>
  );
};

export default App;