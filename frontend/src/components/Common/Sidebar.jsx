import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaRoute, FaTruck, FaBox, FaChartLine } from 'react-icons/fa';
import './Common.css';

const Sidebar = () => {
  const menuItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/routes', icon: <FaRoute />, label: 'Routes' },
    { path: '/vehicles', icon: <FaTruck />, label: 'Vehicles' },
    { path: '/deliveries', icon: <FaBox />, label: 'Deliveries' },
    { path: '/analytics', icon: <FaChartLine />, label: 'Analytics' },
  ];

  return (
    <aside className="sidebar">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            `sidebar-item ${isActive ? 'active' : ''}`
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
};

export default Sidebar;