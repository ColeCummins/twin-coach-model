import React from 'react';
import { FiBarChart } from 'react-icons/fi';

const RentScenarios = ({ onScenarioChange }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="flex items-center space-x-3 mb-6">
        <FiBarChart className="h-6 w-6 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-800">Rent Scenarios</h2>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => onScenarioChange('low')}
          className="px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
        >
          Low
        </button>
        <button
          onClick={() => onScenarioChange('medium')}
          className="px-4 py-2 text-sm font-semibold text-white bg-yellow-500 rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition"
        >
          Medium
        </button>
        <button
          onClick={() => onScenarioChange('high')}
          className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
        >
          High
        </button>
      </div>
    </div>
  );
};

export default RentScenarios;
