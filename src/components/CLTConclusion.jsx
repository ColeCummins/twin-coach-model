import React from 'react';
import { FiShield, FiMapPin } from 'react-icons/fi';
import { formatCurrency } from '../utils/formatters';

const CLTConclusion = ({ cltData }) => {
  if (!cltData) return null;

  const { landValue, annualGroundLease } = cltData;

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5 card-lift">
      <div className="flex items-center space-x-3 mb-4">
        <FiShield className="h-6 w-6 text-brand-green-dark" />
        <h3 className="text-2xl font-bold text-brand-green-dark">Community Land Trust</h3>
      </div>
      <p className="text-gray-700 mb-4">
        The Community Land Trust (CLT) acquires the land, ensuring permanent affordability and community control. The CLT provides a long-term ground lease to the co-op, which owns and manages the building.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard label="Land Value" value={formatCurrency(landValue)} />
        <InfoCard label="Annual Ground Lease" value={formatCurrency(annualGroundLease)} />
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

export default CLTConclusion;
