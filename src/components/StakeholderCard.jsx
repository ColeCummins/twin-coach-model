
import React from 'react';
import { formatData, getLabel } from '../utils/formatting';

const StakeholderCard = ({ title, icon, data, changedKeys }) => {
  if (!data) {
    return null;
  }

  const renderValue = (key, value) => {
    const beforeTaxKey = key.replace('Net', 'Gross');
    const hasBeforeTax = data.hasOwnProperty(beforeTaxKey);

    return (
      <div key={key} className={`py-3 px-4 rounded-lg ${changedKeys.includes(key) ? 'bg-yellow-100' : 'bg-gray-50/50'}`}>
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-gray-600">{getLabel(key)}</p>
          <p className="text-lg font-bold text-gray-800">{formatData(key, value)}</p>
        </div>
        {hasBeforeTax && (
          <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
            <span>(Before Tax: {formatData(beforeTaxKey, data[beforeTaxKey])})</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="flex items-center space-x-4 mb-4">
        <div className="bg-indigo-100 p-3 rounded-full">
          {React.cloneElement(icon, { className: 'h-6 w-6 text-indigo-600' })}
        </div>
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => {
          if (key.includes('Gross') || key.includes('amortization')) return null;
          return renderValue(key, value);
        })}
      </div>
    </div>
  );
};

export default StakeholderCard;
