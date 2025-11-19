import React from 'react';
import { FiTrendingUp, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import { formatCurrency, formatPercent } from '../utils/formatters';

const SellerDashboard = ({ sellerData }) => {
  if (!sellerData) return null;

  const { advantagePct, conventionalNetPerPartner, totalValuePerPartner, day1Net, loanToValue, notePrincipal } = sellerData;

  const advantage = advantagePct / 100; // Convert back to fraction for comparison

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5 card-lift">
      <div className="flex items-center space-x-3 mb-4">
        <FiDollarSign className="h-6 w-6 text-brand-green-dark" />
        <h3 className="text-2xl font-bold text-brand-green-dark">Seller's Perspective</h3>
      </div>

      <div className="space-y-4">
        <div className={`flex justify-between items-center p-4 rounded-lg ${advantage > 0.01 ? 'bg-green-100' : 'bg-red-100'}`}>
          <div className="flex items-center space-x-3">
            <FiTrendingUp className={`h-6 w-6 ${advantage > 0.01 ? 'text-green-600' : 'text-red-600'}`} />
            <span className="font-bold text-lg">Seller Advantage</span>
          </div>
          <span className={`font-bold text-2xl ${advantage > 0.01 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(advantage)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">Conventional Sale (per partner)</p>
            <p className="font-bold text-xl text-brand-green-medium">{formatCurrency(conventionalNetPerPartner)}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">This Deal (per partner, NPV)</p>
            <p className="font-bold text-xl text-brand-green-dark">{formatCurrency(totalValuePerPartner)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard label="Day 1 Net Proceeds" value={formatCurrency(day1Net)} />
          <InfoCard label="Loan to Value" value={`${(loanToValue * 100).toFixed(0)}%`} />
          <InfoCard label="Seller Financed Note" value={formatCurrency(notePrincipal)} />
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ label, value }) => (
  <div className="p-3 bg-white rounded-lg shadow ring-1 ring-black ring-opacity-5">
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-bold text-lg text-brand-green-dark">{value}</p>
  </div>
);

export default SellerDashboard;
