import React from 'react';
import StakeholderCard from './StakeholderCard';
import RentChart from './RentChart';
import AmortizationChart from './AmortizationChart';
import { formatCurrency } from '../utils/calculations';
import { FiBarChart2, FiTrendingUp, FiTrendingDown, FiShield, FiHome, FiUser, FiBriefcase, FiAlertTriangle } from 'react-icons/fi';

const Dashboard = ({ results }) => {
  if (!results) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl font-semibold text-gray-500">Calculating...</div>
      </div>
    );
  }

  const { seller, coop, investor, clt, warnings } = results;

  return (
    <div className="space-y-8">
        {warnings && warnings.length > 0 && (
            <div className="space-y-4">
                {warnings.map((warning, index) => (
                    <Warning key={index} title={warning.title} message={warning.message} />
                ))}
            </div>
        )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StakeholderCard title="Seller" icon={<FiUser />} data={seller} />
        <StakeholderCard title="Co-op" icon={<FiHome />} data={coop} />
        <StakeholderCard title="Investor" icon={<FiBriefcase />} data={investor} />
        <StakeholderCard title="CLT" icon={<FiShield />} data={clt} />
      </div>

      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5">
        <div className="flex items-center space-x-3 mb-6">
          <FiBarChart2 className="h-6 w-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-800">Key Performance Indicators</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <KPI
            icon={<FiTrendingDown className="text-green-500" />}
            label="Phase 1 Monthly Rent"
            value={formatCurrency(coop.phase1MonthlyRent)}
            change={null}
          />
          <KPI
            icon={<FiTrendingDown className="text-green-500" />}
            label="Phase 2 Monthly Rent"
            value={formatCurrency(coop.phase2MonthlyRent)}
            change={`${(((coop.phase2MonthlyRent - coop.phase1MonthlyRent) / coop.phase1MonthlyRent) * 100).toFixed(1)}%`}
          />
          <KPI
            icon={<FiTrendingUp className="text-green-500" />}
            label="Seller Advantage"
            value={`${seller.advantagePct.toFixed(1)}%`}
            change="vs. Conventional Sale"
          />
          <KPI
            icon={<FiShield className="text-blue-500" />}
            label="Investor Y1 Tax Savings"
            value={formatCurrency(investor.taxSavingsYear1)}
            change="per Investor (assumes 5)"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5">
          <RentChart data={coop} />
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5">
          <AmortizationChart data={seller.amortizationTable} />
        </div>
      </div>
    </div>
  );
};

const KPI = ({ icon, label, value, change }) => (
  <div className="bg-gray-50/50 p-4 rounded-xl flex items-start space-x-4">
    <div className="bg-indigo-100 p-3 rounded-full">
      {React.cloneElement(icon, { className: 'h-6 w-6' })}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {change && <p className="text-xs text-gray-500 mt-1">{change}</p>}
    </div>
  </div>
);

const Warning = ({ title, message }) => (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md">
        <div className="flex items-center">
            <FiAlertTriangle className="h-6 w-6 mr-3" />
            <div className="font-bold text-lg">{title}</div>
        </div>
        <p className="mt-2 text-sm">{message}</p>
    </div>
);


export default Dashboard;
