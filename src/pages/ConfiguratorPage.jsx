
import React, { useState, useEffect } from 'react';
import { calculateModel, solveRent } from '../utils/engineV41';
import { ParameterGroup, InputField, Toggle } from '../components/ParameterGroup';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const INITIAL_STATE = {
  // CONFIG
  investorExitYear: 7, // NEW: Flexible Exit

  numUnits: 25,
  fairMarketValue: 2300000,
  landRatio: 0.40,

  capex_5yr: 80000,
  capex_7yr: 5000,
  capex_15yr: 60000,
  capex_27yr: 95000,
  year1Repairs: 15000,

  opexInflationRate: 0.03,
  rentInflationEnabled: false,
  trueCostReservePct: 0.10,

  bargainSalePrice: 1550000,
  investorDownPayment: 310000,
  sellerLoanRate: 0.085,
  sellerLoanAmortization: 30, // NEW: Flexible Term

  monthlyRent: 700,
  vacancyRate: 0.05,
  propTax: 28344,
  insurance: 9000,
  mgmtFee: 15000,
  groundLease: 4800,
  coopMaint: 30000,

  useOhioTax: true,
  enableOhioBID: true,
  customStateTaxRate: 0.05,
  localTaxRate: 0.015,
  localTaxAppliesToInterest: false,
  investorTaxBracket: 0.35,
  placedInServiceYear: 2026,

  sellerOriginalPurchasePrice: 600000,
  sellerOriginalLandValue: 100000,
  sellerHoldingPeriod: 30,
  sellerOtherIncome: 400000,
  sellerRecaptureRate: 0.25,

  coopRefiRate: 0.075,

  useConservativeBonus: false,
  forcePassiveInvestor: false,
  passiveIncomeToOffset: 100000,
  equityKickerPct: 0.10
};

export default function ConfiguratorPage() {
  const [params, setParams] = useState(INITIAL_STATE);
  const [results, setResults] = useState(null);
  const [openGroups, setOpenGroups] = useState({ deal: true, ops: true, tax: true });

  useEffect(() => { setResults(calculateModel(params)); }, [params]);

  const updateParam = (key, value) => setParams(prev => ({ ...prev, [key]: value }));
  const applyRentScenario = (mode) => updateParam('monthlyRent', solveRent(mode, params));
  const toggleGroup = (key) => setOpenGroups(prev => ({...prev, [key]: !prev[key]}));

  if (!results) return <div>Loading...</div>;

  const totalCapex = params.capex_5yr + params.capex_7yr + params.capex_15yr + params.capex_27yr;

  // Dynamic Chart Labels based on Exit Year
  const labels = ['Start'];
  for(let i=1; i<params.investorExitYear; i++) labels.push(`Y${i}`);
  labels.push(`Y${params.investorExitYear} (Exit)`);

  const chartData = {
    labels,
    datasets: [{
      label: 'Inv. Cash Flow',
      data: results.investor.cashFlows,
      backgroundColor: results.investor.cashFlows.map(v => v >= 0 ? '#10b981' : '#ef4444'),
      borderRadius: 4
    }]
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col lg:flex-row">
      <aside className="w-full lg:w-[450px] bg-white border-r border-slate-200 h-screen overflow-y-auto p-6 shadow-xl z-10 sticky top-0">
        <h1 className="text-2xl font-bold text-blue-900 mb-2">Twin Coach v41</h1>
        <p className="text-xs text-slate-500 mb-6">Flexible Terms & Dynamic ROI</p>

        <ParameterGroup title="1. Timelines & Deal" isOpen={openGroups.deal} onToggle={() => toggleGroup('deal')}>
          <div className="grid grid-cols-2 gap-4">
            <InputField
                label="Exit Year"
                id="investorExitYear"
                value={params.investorExitYear}
                onChange={updateParam}
                min={3} max={10}
                tooltip="When does the Co-op Buyout happen?"
            />
            <InputField
                label="Amortization"
                id="sellerLoanAmortization"
                value={params.sellerLoanAmortization}
                onChange={updateParam}
                min={10} max={40}
                suffix="Yrs"
                tooltip="Length used to calc payments. Longer = Lower Pay/Higher Balloon."
            />
          </div>
          <InputField label="Down Payment" id="investorDownPayment" value={params.investorDownPayment} onChange={updateParam} prefix="$" />
          <InputField label="Total CAPEX" id="dummy" value={totalCapex} readOnly prefix="$" />
        </ParameterGroup>

        <ParameterGroup title="2. Rent & Inflation" isOpen={openGroups.ops} onToggle={() => toggleGroup('ops')}>
            <InputField label="Monthly Rent" id="monthlyRent" value={params.monthlyRent} onChange={updateParam} prefix="$" />

            <div className="p-3 bg-blue-50 rounded border border-blue-100 my-3">
                <button onClick={() => applyRentScenario('true_cost')} className="w-full py-1.5 bg-white border border-blue-300 text-blue-700 text-xs font-bold rounded shadow-sm hover:bg-blue-100">
                    Calculated Rent (Cost + Reserve)
                </button>
            </div>
            <InputField label="OpEx Inflation" id="opexInflationRate" value={params.opexInflationRate} onChange={updateParam} step={0.005} suffix="%" />
        </ParameterGroup>

        <ParameterGroup title="3. Tax Strategy" isOpen={openGroups.tax} onToggle={() => toggleGroup('tax')}>
            <div className="mb-4 p-3 bg-slate-100 rounded text-xs text-slate-600">
                Default: Yellow Springs, OH (1.5% Local Tax).
            </div>
            <Toggle
                label="Use Ohio State Tax?"
                checked={params.useOhioTax}
                onChange={(v) => updateParam('useOhioTax', v)}
                tooltip="If checked, uses 2024 Ohio Brackets/BID. If unchecked, uses flat Custom Rate."
            />
            {!params.useOhioTax && (
                <InputField label="Custom State Rate" id="customStateTaxRate" value={params.customStateTaxRate} onChange={updateParam} step={0.001} tooltip="Decimal (0.05 = 5%)" />
            )}
            <Toggle label="Enable Ohio BID?" checked={params.enableOhioBID} onChange={(v)=>updateParam('enableOhioBID', v)} tooltip="Deducts first $250k of Business Income from State Tax." />
            <InputField label="Seller Recapture Rate" id="sellerRecaptureRate" value={params.sellerRecaptureRate} onChange={updateParam} step={0.01} />
        </ParameterGroup>

        <div className="p-4 border-t border-slate-200 bg-slate-50 mt-8">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Co-op Exit Stress Test</h4>
            <div className="mt-2 text-xs space-y-2">
                <div className="flex justify-between"><span>Buyout Date:</span> <span className="font-bold">Year {params.investorExitYear}</span></div>
                <div className="flex justify-between"><span>Buyout Price:</span> <span className="font-bold">${Math.round(results.coop.buyoutPrice).toLocaleString()}</span></div>
                <div className="flex justify-between pt-2 border-t"><span>New Mortgage:</span> <span className="font-bold">${Math.round(results.coop.refiMonthly).toLocaleString()}/mo</span></div>
                <div className={results.coop.isRefiViable ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                    {results.coop.isRefiViable ? "Viable (Cheaper than Rent)" : "Risk: Higher than Rent"}
                </div>
            </div>
        </div>

      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {results.warnings.map((w, i) => <div key={i} className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 font-bold text-sm">⚠️ {w.msg}</div>)}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <MetricCard title="Seller Day 1" value={Math.round(results.seller.day1Net)} isCurrency />
            <MetricCard title="Inv. Tax ROI (Y1)" value={results.investor.roiYear1} suffix="%" color="text-green-600" />
            <MetricCard title="Co-op Buyout" value={Math.round(results.coop.buyoutPrice)} isCurrency />
            <MetricCard title="Net Profit" value={Math.round(results.investor.netProfit)} isCurrency />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
            <Bar data={chartData} options={{ responsive: true, plugins: { legend: {display:false}, title: {display: true, text: `Investor Cash Flow (${params.investorExitYear} Year Plan)`} } }} />
        </div>
      </main>
    </div>
  );
}

const MetricCard = ({ title, value, isCurrency, suffix, color="text-slate-900" }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xs font-bold text-slate-400 uppercase">{title}</h3>
        <div className={`text-2xl font-bold mt-1 ${color}`}>
            {isCurrency ? '$' : ''}{value.toLocaleString()}{suffix}
        </div>
    </div>
);
