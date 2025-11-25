
import React, { useState, useEffect } from 'react';
import { calculateModel, calculateRequiredRent } from '../utils/engineV41';
import { ParameterGroup, InputField, Toggle } from '../components/ParameterGroup';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const INITIAL_STATE = {
  // CONFIG
  investorExitYear: 7,

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
  trueCostReservePct: 0.05, // Default 5% Margin

  bargainSalePrice: 1550000,
  investorDownPayment: 310000,
  sellerLoanRate: 0.085,
  sellerLoanAmortization: 30,

  monthlyRent: 700, // Will be auto-calculated on load
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
  const [openGroups, setOpenGroups] = useState({ deal: true, ops: true, tax: false });

  // Auto-calculate rent whenever relevant params change
  useEffect(() => {
    const newRent = calculateRequiredRent(params, params.trueCostReservePct);
    if (newRent !== params.monthlyRent) {
        setParams(prev => ({ ...prev, monthlyRent: newRent }));
    }
  }, [
      params.trueCostReservePct,
      params.propTax, params.insurance, params.mgmtFee, params.groundLease, params.coopMaint,
      params.sellerLoanRate, params.sellerLoanAmortization, params.bargainSalePrice, params.investorDownPayment,
      params.numUnits, params.vacancyRate
  ]);

  useEffect(() => { setResults(calculateModel(params)); }, [params]);

  const updateParam = (key, value) => setParams(prev => ({ ...prev, [key]: value }));
  const toggleGroup = (key) => setOpenGroups(prev => ({...prev, [key]: !prev[key]}));

  if (!results) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">Loading Engine...</div>;

  const totalCapex = params.capex_5yr + params.capex_7yr + params.capex_15yr + params.capex_27yr;

  const labels = ['Start'];
  for(let i=1; i<params.investorExitYear; i++) labels.push(`Y${i}`);
  labels.push(`Y${params.investorExitYear} (Exit)`);

  const chartData = {
    labels,
    datasets: [{
      label: 'Inv. Cash Flow',
      data: results.investor.cashFlows,
      backgroundColor: results.investor.cashFlows.map(v => v >= 0 ? '#10b981' : '#f43f5e'),
      borderRadius: 6,
      borderWidth: 1,
      borderColor: results.investor.cashFlows.map(v => v >= 0 ? '#059669' : '#e11d48'),
    }]
  };

  const chartOptions = {
      responsive: true,
      plugins: {
          legend: {display:false},
          title: {display: true, text: `Investor Cash Flow (${params.investorExitYear} Year Plan)`, color: '#cbd5e1'},
          tooltip: {
              backgroundColor: '#1e293b',
              titleColor: '#f8fafc',
              bodyColor: '#cbd5e1',
              borderColor: '#334155',
              borderWidth: 1
          }
      },
      scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
      }
  };

  const rentBand = results.coop.rentBand;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 flex flex-col lg:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full lg:w-[420px] bg-slate-800/50 border-r border-slate-700 h-screen overflow-y-auto p-6 shadow-2xl z-10 sticky top-0 scrollbar-thin scrollbar-thumb-slate-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent mb-1">Twin Coach v41</h1>
        <p className="text-xs text-slate-400 mb-8 font-medium tracking-wide">FLEXIBLE TIMELINES & DYNAMIC ROI</p>

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
          <InputField label="Down Payment" id="investorDownPayment" value={params.investorDownPayment} onChange={updateParam} prefix="$" step={5000} />
          <InputField label="Total CAPEX" id="dummy" value={totalCapex} readOnly prefix="$" />
        </ParameterGroup>

        <ParameterGroup title="2. Rent & Margin" isOpen={openGroups.ops} onToggle={() => toggleGroup('ops')}>
             <div className="mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Calculated Rent</span>
                    <span className="text-2xl font-bold text-white">${params.monthlyRent}</span>
                </div>

                {/* Rent Band Indicator */}
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div
                        className={`h-full transition-all duration-500 bg-${rentBand.color}-500`}
                        style={{ width: `${rentBand.score}%` }}
                    ></div>
                </div>
                <div className={`text-right text-xs font-bold text-${rentBand.color}-400`}>
                    {rentBand.label}
                </div>
            </div>

            <InputField
                label="Safety Margin (Reserve)"
                id="trueCostReservePct"
                value={params.trueCostReservePct}
                onChange={updateParam}
                step={0.01}
                min={0} max={0.25}
                suffix="%"
                tooltip="Buffer added on top of OpEx + Debt to ensure safety. Increases Rent."
            />

            <InputField label="OpEx Inflation" id="opexInflationRate" value={params.opexInflationRate} onChange={updateParam} step={0.005} suffix="%" />
        </ParameterGroup>

        <ParameterGroup title="3. Tax Strategy" isOpen={openGroups.tax} onToggle={() => toggleGroup('tax')}>
            <div className="mb-4 p-3 bg-slate-700/30 rounded border border-slate-700 text-xs text-slate-400">
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

        <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 mt-auto">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Co-op Exit Stress Test</h4>
            <div className="mt-2 text-xs space-y-3">
                <div className="flex justify-between text-slate-300"><span>Buyout Date:</span> <span className="font-bold text-white">Year {params.investorExitYear}</span></div>
                <div className="flex justify-between text-slate-300"><span>Buyout Price:</span> <span className="font-bold text-white">${Math.round(results.coop.buyoutPrice).toLocaleString()}</span></div>
                <div className="flex justify-between pt-3 border-t border-slate-700/50 text-slate-300"><span>New Mortgage:</span> <span className="font-bold text-white">${Math.round(results.coop.refiMonthly).toLocaleString()}/mo</span></div>
                <div className={`text-center py-2 rounded font-bold ${results.coop.isRefiViable ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                    {results.coop.isRefiViable ? "Viable (Cheaper than Rent)" : "Risk: Higher than Rent"}
                </div>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto bg-slate-900">
        {results.warnings.map((w, i) => (
            <div key={i} className="mb-6 bg-rose-500/10 border-l-4 border-rose-500 p-4 text-rose-400 font-bold text-sm shadow-lg backdrop-blur-sm rounded-r-lg">
                ⚠️ {w.msg}
            </div>
        ))}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <MetricCard title="Seller Day 1" value={Math.round(results.seller.day1Net)} isCurrency />
            <MetricCard title="Seller Advantage" value={Math.round(results.seller.advantage)} isCurrency color={results.seller.advantage > 0 ? "text-emerald-400" : "text-rose-400"} />
            <MetricCard title="Inv. IRR (After-Tax)" value={(results.investor.irr * 100).toFixed(2)} suffix="%" color="text-emerald-400" />
            <MetricCard title="Inv. Net Profit" value={Math.round(results.investor.netProfit)} isCurrency />
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl mb-8">
            <Bar data={chartData} options={chartOptions} />
        </div>

        {/* Helper Note */}
        <div className="text-center text-slate-600 text-xs max-w-2xl mx-auto">
            <p>Rent is automatically calculated based on Property Taxes, Insurance, Maint, Debt Service, and your selected Safety Margin.</p>
        </div>
      </main>
    </div>
  );
}

const MetricCard = ({ title, value, isCurrency, suffix, color="text-white" }) => (
    <div className="bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-700 hover:border-slate-600 transition-colors group">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-slate-400 transition-colors">{title}</h3>
        <div className={`text-3xl font-bold mt-2 ${color} tracking-tight`}>
            {isCurrency ? '$' : ''}{value.toLocaleString()}{suffix}
        </div>
    </div>
);
