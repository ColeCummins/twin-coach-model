import React, { useState } from 'react';
import { FiSliders, FiRefreshCw, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { DEFAULT_PARAMS } from '../utils/calculations';

const DealParameters = ({ params, setParams }) => {
  const [openSection, setOpenSection] = useState('Core Deal');

  const handleValueChange = (name, value, isCheckbox = false, isNumeric = true) => {
    setParams(prev => ({ ...prev, [name]: isCheckbox ? value : (isNumeric ? parseFloat(value) : value) }));
  };

  const resetParams = () => setParams(DEFAULT_PARAMS);

  const parameterGroups = [
    { name: 'Core Deal', fields: ['fairMarketValue', 'bargainSalePrice', 'investorDownPayment'] },
    { name: 'Bonus Depreciation', fields: ['placedInServiceYear', 'bonusDepreciationOptimistic']},
    { name: 'Seller Details', fields: ['sellerOriginalPurchasePrice', 'sellerOriginalLandValue', 'sellerHoldingPeriodYrs', 'sellerPartners', 'sellerLoanRate', 'sellerLoanAmortization'] },
    { name: 'Investor Details', fields: ['investorCount', 'investorTaxBracket', 'investorIsRealEstatePro', 'passiveIncomeToOffset'] },
    { name: 'Capital Expenditures', fields: ['capex27_5', 'capex15', 'capex7', 'capex5', 'costSegStudyCost', 'bargainSaleClosingCosts', 'communityReinvestmentPct'] },
    { name: 'Property Operations', fields: ['numUnits', 'opExTaxes', 'opExInsurance', 'professionalManagementFee', 'cltGroundLease', 'coopMaintAdmin', 'opExVacancy'] },
    { name: 'Co-op & CLT', fields: ['coopBuyoutYear', 'coopBuyoutRate', 'coopLoanAmortization', 'grants'] },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5 card-lift">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <FiSliders className="h-6 w-6 text-brand-green-dark" />
          <h2 className="text-2xl font-bold text-brand-green-dark">Deal Parameters</h2>
        </div>
        <button onClick={resetParams} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition">
          <FiRefreshCw className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-2">
        {parameterGroups.map(group => (
          <Section
            key={group.name}
            title={group.name}
            isOpen={openSection === group.name}
            setIsOpen={() => setOpenSection(openSection === group.name ? null : group.name)}
          >
            <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {group.fields.map(fieldName => (
                <ParameterInput
                  key={fieldName}
                  name={fieldName}
                  params={params}
                  onChange={handleValueChange}
                />
              ))}
            </div>
          </Section>
        ))}
      </div>
    </div>
  );
};

const Section = ({ title, isOpen, setIsOpen, children }) => (
  <div className="border border-stone-200 rounded-lg">
    <button onClick={setIsOpen} className="w-full flex justify-between items-center p-3 bg-stone-50 hover:bg-stone-100 transition">
      <h3 className="font-bold text-brand-green-medium">{title}</h3>
      {isOpen ? <FiChevronUp /> : <FiChevronDown />}
    </button>
    {isOpen && <div>{children}</div>}
  </div>
);


const PARAM_CONFIG = {
    fairMarketValue: { label: 'Fair Market Value', type: 'currency', min: 1000000, max: 4000000, step: 25000 },
    bargainSalePrice: { label: 'Bargain Sale Price', type: 'currency', min: 500000, max: 3000000, step: 25000 },
    investorDownPayment: { label: 'Investor Down Payment', type: 'currency', min: 100000, max: 1000000, step: 10000 },
    placedInServiceYear: { label: 'Placed in Service', type: 'select', options: [2024, 2025, 2026, 2027] },
    bonusDepreciationOptimistic: { label: 'Optimistic Bonus (100%)', type: 'checkbox' },
    sellerOriginalPurchasePrice: { label: 'Seller Original Cost', type: 'currency', min: 50000, max: 1500000, step: 10000 },
    sellerOriginalLandValue: { label: 'Seller Original Land Value', type: 'currency', min: 10000, max: 500000, step: 5000 },
    sellerHoldingPeriodYrs: { label: 'Seller Holding Period', type: 'year', min: 1, max: 50, step: 1 },
    sellerPartners: { label: 'Number of Sellers', type: 'number', min: 1, max: 10, step: 1 },
    sellerLoanRate: { label: 'Seller Loan Rate', type: 'percent', min: 0.01, max: 0.12, step: 0.001 },
    sellerLoanAmortization: { label: 'Seller Loan Term', type: 'year', min: 10, max: 40, step: 1 },
    investorCount: { label: 'Number of Investors', type: 'number', min: 1, max: 20, step: 1 },
    investorTaxBracket: { label: 'Investor Fed Tax Bracket', type: 'percent', min: 0.10, max: 0.50, step: 0.01 },
    investorIsRealEstatePro: { label: 'Is Real Estate Pro', type: 'checkbox' },
    passiveIncomeToOffset: { label: 'Passive Income to Offset', type: 'currency', min: 0, max: 500000, step: 10000, dependsOn: 'investorIsRealEstatePro', showIf: false },
    capex27_5: { label: '27.5yr CAPEX (Structure)', type: 'currency', min: 0, max: 500000, step: 10000 },
    capex15: { label: '15yr CAPEX (Site)', type: 'currency', min: 0, max: 200000, step: 5000 },
    capex7: { label: '7yr CAPEX (Fixtures)', type: 'currency', min: 0, max: 200000, step: 5000 },
    capex5: { label: '5yr CAPEX (Appliances)', type: 'currency', min: 0, max: 200000, step: 5000 },
    costSegStudyCost: { label: 'Cost Segregation Study', type: 'currency', min: 0, max: 50000, step: 1000 },
    bargainSaleClosingCosts: { label: 'This Deal Closing Costs', type: 'currency', min: 0, max: 75000, step: 1000 },
    communityReinvestmentPct: { label: 'Community Reinvestment', type: 'percent', min: 0, max: 0.5, step: 0.01 },
    numUnits: { label: 'Number of Units', type: 'number', min: 1, max: 100, step: 1 },
    opExTaxes: { label: 'Annual Prop. Taxes', type: 'currency', min: 0, max: 200000, step: 1000 },
    opExInsurance: { label: 'Annual Insurance', type: 'currency', min: 0, max: 100000, step: 500 },
    professionalManagementFee: { label: 'Annual Mgmt. Fee', type: 'currency', min: 0, max: 50000, step: 1000 },
    cltGroundLease: { label: 'CLT Ground Lease (Ann.)', type: 'currency', min: 0, max: 100000, step: 1000 },
    coopMaintAdmin: { label: 'Co-op Maint/Admin Fund', type: 'currency', min: 0, max: 100000, step: 1000 },
    opExVacancy: { label: 'Vacancy Rate', type: 'percent', min: 0, max: 0.25, step: 0.005 },
    coopBuyoutYear: { label: 'Co-op Buyout Year', type: 'year', min: 5, max: 15, step: 1 },
    coopBuyoutRate: { label: 'Future Co-op Loan Rate', type: 'percent', min: 0.01, max: 0.12, step: 0.001 },
    coopLoanAmortization: { label: 'Future Co-op Loan Term', type: 'year', min: 10, max: 40, step: 1 },
    grants: { label: 'Grant Funding', type: 'currency', min: 0, max: 500000, step: 10000 },
};

const formatters = {
    currency: (val) => `$${(val/1000).toFixed(0)}k`,
    percent: (val) => `${(val * 100).toFixed(1)}%`,
    year: (val) => `${val} yrs`,
    number: (val) => val,
}

const ParameterInput = ({ name, params, onChange }) => {
    const config = PARAM_CONFIG[name];
    if (!config) return null;

    const { label, type, min, max, step, options, dependsOn, showIf } = config;

    if (dependsOn && params[dependsOn] !== showIf) {
        return null;
    }

    const value = params[name];

    if (type === 'checkbox') {
        return (
            <div className="flex items-center justify-between col-span-1 md:col-span-2">
                <label className="font-medium text-brand-green-dark text-sm">{label}</label>
                <input type="checkbox" checked={!!value} onChange={(e) => onChange(name, e.target.checked, true, false)} className="h-5 w-5 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow" />
            </div>
        )
    }

    if (type === 'select') {
        return (
             <div className="flex items-center justify-between col-span-1 md:col-span-2">
                <label className="font-medium text-brand-green-dark text-sm">{label}</label>
                <select value={value} onChange={(e) => onChange(name, e.target.value, false, true)} className="w-32 p-1 rounded-md border-stone-300 text-sm">
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
        )
    }

    const formattedValue = (formatters[type] || formatters.number)(value);

    return (
        <div>
            <div className="flex justify-between items-baseline">
                <label className="block text-sm font-medium text-brand-green-dark">{label}</label>
                <span className="text-brand-green-medium font-semibold">{formattedValue}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(name, e.target.value)} className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer mt-2 accent-brand-yellow" />
        </div>
    );
}


export default DealParameters;
