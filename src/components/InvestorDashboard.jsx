import React from 'react';
import { FiBarChart2, FiLayers, FiPercent } from 'react-icons/fi';
import { formatCurrency, formatPercent } from '../utils/formatters';

const InvestorDashboard = ({ investorData }) => {
  if (!investorData) return null;

  const { irr, cashOnCashReturn, roi, taxSavingsPerInvestor, downPayment, holdPeriod } = investorData;

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5 card-lift">
      <div className="flex items-center space-x-3 mb-4">
        <FiBarChart2 className="h-6 w-6 text-brand-green-dark" />
        <h3 className="text-2xl font-bold text-brand-green-dark">Investor's Perspective</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <InfoCardLg label="IRR" value={formatPercent(irr)} />
          <InfoCardLg label="Cash on Cash" value={formatPercent(cashOnCashReturn)} />
          <InfoCardLg label="ROI" value={formatPercent(roi)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard label="Total Capital Invested" value={formatCurrency(downPayment)} />
            <InfoCard label="Hold Period" value={`${holdPeriod} years`} />
            <InfoCard label="Avg. Tax Savings / Investor" value={formatCurrency(taxSavingsPerInvestor / holdPeriod)} />
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

const InfoCardLg = ({ label, value }) => (
    <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-bold text-2xl text-brand-green-dark">{value}</p>
    </div>
);

export default InvestorDashboard;
