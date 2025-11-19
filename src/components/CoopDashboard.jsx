import React from 'react';
import { FiHome, FiTrendingDown, FiClipboard } from 'react-icons/fi';
import { formatCurrency, formatPercent } from '../utils/formatters';

const CoopDashboard = ({ coopData }) => {
  if (!coopData) return null;

  const { 
    phase1MonthlyRent, 
    phase2MonthlyRent, 
    rentDecreasePct, 
    totalHousingCost, 
    rentAsPctOfAMI, 
    buyoutSavingsGoal 
  } = coopData;

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5 card-lift">
      <div className="flex items-center space-x-3 mb-4">
        <FiHome className="h-6 w-6 text-brand-green-dark" />
        <h3 className="text-2xl font-bold text-brand-green-dark">Co-op Tenant's Perspective</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RentCard label="Phase 1 Rent" rent={phase1MonthlyRent} />
          <RentCard label="Phase 2 Rent" rent={phase2MonthlyRent} />
        </div>

        <div className={`flex justify-between items-center p-4 rounded-lg ${rentDecreasePct > 0 ? 'bg-indigo-100' : 'bg-orange-100'}`}>
          <div className="flex items-center space-x-3">
            <FiTrendingDown className={`h-6 w-6 ${rentDecreasePct > 0 ? 'text-indigo-600' : 'text-orange-600'}`} />
            <span className="font-bold text-lg">Rent Change</span>
          </div>
          <span className={`font-bold text-2xl ${rentDecreasePct > 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
            {rentDecreasePct > 0 ? '-' : '+'}{Math.abs(rentDecreasePct).toFixed(0)}%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard label="Total Monthly Housing Cost" value={formatCurrency(totalHousingCost)} />
            <InfoCard label="Rent as % of AMI" value={formatPercent(rentAsPctOfAMI / 100)} />
            <InfoCard label="Annual Buyout Savings (per unit)" value={`${formatCurrency(buyoutSavingsGoal)}`} />
        </div>
      </div>
    </div>
  );
};

const RentCard = ({ label, rent }) => (
  <div className="p-4 bg-gray-100 rounded-lg text-center">
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-bold text-3xl text-brand-green-dark">{formatCurrency(rent)}</p>
    <p className="text-xs text-gray-500">per month</p>
  </div>
);

const InfoCard = ({ label, value }) => (
    <div className="p-3 bg-white rounded-lg shadow ring-1 ring-black ring-opacity-5">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-bold text-lg text-brand-green-dark">{value}</p>
    </div>
);

export default CoopDashboard;
