
import React, { useState, useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import DealParameters from '../components/DealParameters';
import { flywheelCalculator } from '../utils/flywheelCalculator';

const DashboardPage = () => {
  const [params, setParams] = useState({
      fairMarketValue: 2300000,
      landValuePct: 0.40,
      bargainSalePrice: 1550000,
      investorDownPayment: 310000, // initialized to match 20% of 1.55M
      investorDownPaymentPct: 0.20,
      sellerLoanRate: 0.075,
      sellerLoanAmortization: 30,
      coopBuyoutYear: 7,
      coopBuyoutRate: 0.06,
      coopLoanAmortization: 25,
      opExTaxes: 28344,
      opExInsurance: 9000,
      coopMaintAdmin: 10000,
      professionalManagementFee: 15000,
      coopManagementFeePct: 0.60,
      cltManagementFeePct: 0.40,
      cltGroundLease: 48000,
      numUnits: 25,
      opExVacancy: 0.05,
      bonusDepreciationRate: 1.0,
      depreciableAssetPct: 0.42,
      sellerFederalTaxBracket: 0.22,
      investorFederalTaxBracket: 0.35,
      stateIncomeTaxRate: 0.03688,
      federalCapGainsRate: 0.15,
      charitableDeductionPct: 0.40,
      sellerOriginalPurchasePrice: 500000,
      sellerHoldingPeriod: 30,
      sellerPartners: 2,
      bargainSaleClosingCosts: 15000, // Added default for verification
  });

  const [results, setResults] = useState(null);
  const [changedKeys, setChangedKeys] = useState([]);

  useEffect(() => {
    const calculatedResults = flywheelCalculator(params);
    setResults(calculatedResults);
  }, [params]);

  const handleParamChange = (newParams) => {
      // This logic to track changed keys is a bit simplified but functional for now
      // It relies on DealParameters calling setParams with a new object.
      // Ideally, we'd compare old and new params here if we had access to both in the setState callback
      // But since DealParameters updates state, we can just let useEffect handle the recalculation.
      // For highlighting, we might need a different approach if we want to show what *just* changed.
      // For now, we'll just pass empty array or implement a smarter tracker if needed.
      setParams(newParams);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Stakeholder Dashboard</h1>
        <p className="text-lg md:text-xl text-gray-600">Financial outcomes for all parties in the Twin Coach model.</p>
      </header>
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
             <DealParameters params={params} setParams={setParams} />
        </div>
        <div className="lg:col-span-2">
            <Dashboard results={results} changedKeys={changedKeys} />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
