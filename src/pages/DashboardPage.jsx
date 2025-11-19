
import React, { useState, useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import { flywheelCalculator } from '../utils/flywheelCalculator';

const DashboardPage = () => {
  const [results, setResults] = useState(null);

  useEffect(() => {
    const params = {
      fairMarketValue: 2300000,
      landValuePct: 0.40,
      bargainSalePrice: 1550000,
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
    };
    const calculatedResults = flywheelCalculator(params);
    setResults(calculatedResults);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Stakeholder Dashboard</h1>
        <p className="text-lg md:text-xl text-gray-600">Financial outcomes for all parties in the Twin Coach model.</p>
      </header>
      <main className="max-w-7xl mx-auto">
        <Dashboard results={results} changedKeys={[]} />
      </main>
    </div>
  );
};

export default DashboardPage;
