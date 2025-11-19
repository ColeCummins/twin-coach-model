import React from 'react';
import { FiSliders, FiRefreshCw } from 'react-icons/fi';
import { DEFAULT_PARAMS } from '../utils/calculations';

const DealParameters = ({ params, setParams }) => {
  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setParams((prevParams) => ({
      ...prevParams,
      [name]: parseFloat(value),
    }));
  };

  const resetParams = () => {
    setParams(DEFAULT_PARAMS);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FiSliders className="h-6 w-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-800">Deal Parameters</h2>
        </div>
        <button onClick={resetParams} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition">
          <FiRefreshCw className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6">
        <ParameterSlider
          label="Fair Market Value"
          name="fairMarketValue"
          value={params.fairMarketValue}
          min={1500000}
          max={3500000}
          step={50000}
          onChange={handleSliderChange}
          format={(value) => `$${(value / 1000000).toFixed(2)}M`}
        />
        <ParameterSlider
          label="Bargain Sale Price"
          name="bargainSalePrice"
          value={params.bargainSalePrice}
          min={1000000}
          max={3000000}
          step={50000}
          onChange={handleSliderChange}
          format={(value) => `$${(value / 1000000).toFixed(2)}M`}
        />
        <ParameterSlider
          label="Investor Down Payment"
          name="investorDownPaymentPct"
          value={params.investorDownPaymentPct}
          min={0.1}
          max={0.5}
          step={0.01}
          onChange={handleSliderChange}
          format={(value) => `${(value * 100).toFixed(0)}%`}
        />
        <ParameterSlider
          label="Seller Loan Rate"
          name="sellerLoanRate"
          value={params.sellerLoanRate}
          min={0.05}
          max={0.1}
          step={0.001}
          onChange={handleSliderChange}
          format={(value) => `${(value * 100).toFixed(1)}%`}
        />
        <ParameterSlider
          label="Seller Loan Amortization"
          name="sellerLoanAmortization"
          value={params.sellerLoanAmortization}
          min={15}
          max={40}
          step={1}
          onChange={handleSliderChange}
          format={(value) => `${value} years`}
        />
        <ParameterSlider
          label="Co-op Buyout Rate"
          name="coopBuyoutRate"
          value={params.coopBuyoutRate}
          min={0.04}
          max={0.08}
          step={0.001}
          onChange={handleSliderChange}
          format={(value) => `${(value * 100).toFixed(1)}%`}
        />
      </div>
    </div>
  );
};

const ParameterSlider = ({ label, name, value, min, max, step, onChange, format }) => (
  <div>
    <div className="flex justify-between items-baseline">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <span className="text-indigo-600 font-semibold">{format(value)}</span>
    </div>
    <input
      type="range"
      id={name}
      name={name}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 accent-indigo-600"
    />
  </div>
);

export default DealParameters;
