import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const StakeholderCard = ({ title, icon, data }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatCurrency = (value) => {
    if (typeof value !== 'number') {
      return 'N/A';
    }
    return '$' + value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Determine which key-value pairs to show initially
  const initialData = {
    Seller: ['advantagePct', 'conventionalNet'],
    'Co-op': ['phase1MonthlyRent', 'phase2MonthlyRent'],
    Investor: ['taxSavingsYear1', 'holdPeriod'],
    CLT: ['landValue', 'annualGroundLease']
  }[title] || [];

  const visibleData = Object.entries(data).filter(([key]) => initialData.includes(key));
  const hiddenData = Object.entries(data).filter(([key]) => !initialData.includes(key));

  return (
    <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-indigo-100 p-3 rounded-full">
            {React.cloneElement(icon, { className: 'h-6 w-6 text-indigo-600' })}
          </div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>

        <div className="text-sm text-gray-700 space-y-2">
          {visibleData.map(([key, value]) => (
            <DataRow key={key} label={key} value={value} formatCurrency={formatCurrency} />
          ))}
          {isOpen && hiddenData.map(([key, value]) => (
             <DataRow key={key} label={key} value={value} formatCurrency={formatCurrency} />
          ))}
        </div>
      </div>

      {hiddenData.length > 0 && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mt-4 w-full flex items-center justify-center space-x-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
        >
          <span>{isOpen ? 'Show Less' : 'Show More'}</span>
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      )}
    </div>
  );
};

const DataRow = ({ label, value, formatCurrency }) => {
    const formattedLabel = label.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

    let formattedValue;
    if (typeof value === 'number') {
        formattedValue = formatCurrency(value);
    } else if (Array.isArray(value)) {
        formattedValue = 'See Details';
    } else if (typeof value === 'boolean') {
        formattedValue = value ? 'Yes' : 'No';
    } else {
        formattedValue = value.toString();
    }

    return (
        <div className="flex justify-between items-baseline">
            <span className="text-gray-600">{formattedLabel}</span>
            <span className="font-semibold text-gray-800 text-right">{formattedValue}</span>
        </div>
    );
};


export default StakeholderCard;
