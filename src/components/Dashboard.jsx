import React from 'react';
import StakeholderCard from './StakeholderCard';
import RentChart from './RentChart';
import AmortizationChart from './AmortizationChart';
import { formatData, getLabel } from '../utils/formatting';
import { FiBarChart2, FiTrendingUp, FiTrendingDown, FiShield, FiHome, FiUser, FiBriefcase, FiAlertTriangle } from 'react-icons/fi';

const Dashboard = ({ results, changedKeys }) => {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        <StakeholderCard title="Seller" icon={<FiUser />} data={seller} changedKeys={changedKeys} />
        <StakeholderCard title="Co-op" icon={<FiHome />} data={coop} changedKeys={changedKeys} />
        <StakeholderCard title="Investor" icon={<FiBriefcase />} data={investor} changedKeys={changedKeys} />
        <StakeholderCard title="CLT" icon={<FiShield />} data={clt} changedKeys={changedKeys} />
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
            value={formatData('phase1MonthlyRent', coop.phase1MonthlyRent)}
            isHighlighted={changedKeys.includes('phase1MonthlyRent')}
          />
          <KPI
            icon={<FiTrendingDown className="text-green-500" />}
            label="Phase 2 Monthly Rent"
            value={formatData('phase2MonthlyRent', coop.phase2MonthlyRent)}
            isHighlighted={changedKeys.includes('phase2MonthlyRent')}
          />
          <KPI
            icon={<FiTrendingUp className="text-green-500" />}
            label="Seller Advantage"
            value={formatData('advantagePct', seller.advantagePct)}
            isHighlighted={changedKeys.includes('advantagePct')}
          />
          <KPI
            icon={<FiShield className="text-blue-500" />}
            label="Investor Y1 Tax Savings"
            value={formatData('taxSavingsYear1', investor.taxSavingsYear1)}
            isHighlighted={changedKeys.includes('taxSavingsYear1')}
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

const KPI = ({ icon, label, value, isHighlighted }) => (
    <div className={`bg-gray-50/50 p-4 rounded-xl flex items-start space-x-4 ${isHighlighted ? 'bg-yellow-100' : ''}`}>
    <div className="bg-indigo-100 p-3 rounded-full">
      {React.cloneElement(icon, { className: 'h-6 w-6' })}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
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
