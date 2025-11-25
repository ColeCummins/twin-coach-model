
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiBarChart2, FiDollarSign } from 'react-icons/fi';

const NavBar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <NavLink to="/" className="text-2xl font-bold text-indigo-600">Twin Coach</NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavItem to="/" icon={<FiHome />} label="Home" />
              <NavItem to="/dashboard" icon={<FiBarChart2 />} label="Dashboard" />
              <NavItem to="/comparison" icon={<FiDollarSign />} label="Comparison" />
              <NavItem to="/v41" icon={<FiBarChart2 />} label="Configurator v41" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}>
    {icon && React.cloneElement(icon, { className: 'h-5 w-5 mr-2' })}
    {label}
  </NavLink>
);

export default NavBar;
