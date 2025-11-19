
import React, { useState, useMemo } from 'react';
import { calculateComparisonModel } from '../utils/calculations';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// --- UI Components ---
const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const ScenarioControls = ({ annualWithdrawal, setAnnualWithdrawal, savingsRate, setSavingsRate }) => (
    <div className="bg-gray-100 p-6 rounded-xl shadow-inner mb-10">
        <h2 className="text-xl font-bold text-gray-700 text-center mb-4">Conventional Sale Scenario Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="withdrawal" className="block text-sm font-medium text-gray-600">Seller's Annual Withdrawal</label>
                <input id="withdrawal" type="number" step="10000" value={annualWithdrawal} onChange={e => setAnnualWithdrawal(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                <p className="text-xs text-gray-500 mt-1">Amount seller withdraws each year from savings.</p>
            </div>
            <div>
                <label htmlFor="savingsRate" className="block text-sm font-medium text-gray-600">Savings Account Rate</label>
                <input id="savingsRate" type="number" step="0.005" min="0" max="0.1" value={savingsRate} onChange={e => setSavingsRate(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                 <p className="text-xs text-gray-500 mt-1">Interest rate on conventional sale proceeds.</p>
            </div>
        </div>
    </div>
);

const ComparisonChart = ({ data }) => {
    const chartData = {
        labels: data.conventional.map(p => `Year ${p.year}`),
        datasets: [
            {
                label: 'Proposed Model',
                data: data.proposed.map(p => p.cumulativeValue),
                borderColor: '#16a34a', // Green
                backgroundColor: '#16a34a',
                tension: 0.1, 
                pointRadius: 5,
            },
            {
                label: 'Conventional Sale',
                data: data.conventional.map(p => p.cumulativeValue),
                borderColor: '#6b7280', // Gray
                backgroundColor: '#6b7280',
                tension: 0.1,
                pointRadius: 5,
            }
        ]
    };
    const options = { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Seller\'s Cumulative After-Tax Position' } } };
    return <Line options={options} data={chartData} />;
};

const ComparisonPage = () => {
  const [annualWithdrawal, setAnnualWithdrawal] = useState(100000);
  const [savingsRate, setSavingsRate] = useState(0.04);

  const data = useMemo(() => calculateComparisonModel({ annualWithdrawal, savingsRate }), [annualWithdrawal, savingsRate]);

  const proposedAdvantage = data.proposed[7].cumulativeValue - data.conventional[7].cumulativeValue;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">The Twin Coach Advantage</h1>
        <p className="text-lg md:text-xl text-gray-600">An Honest, After-Tax Comparison: Proposed Model vs. Conventional Sale</p>
      </header>

      <main className="max-w-7xl mx-auto space-y-12">
        <div className="text-center bg-green-100 border-l-4 border-green-500 text-green-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold">The 7-Year Verdict</h2>
            <p className="text-4xl font-extrabold mt-2">{formatCurrency(proposedAdvantage)}</p>
            <p className="text-lg">in additional, after-tax cash for the seller with the Proposed Model.</p>
        </div>

        <ScenarioControls 
            annualWithdrawal={annualWithdrawal} setAnnualWithdrawal={setAnnualWithdrawal}
            savingsRate={savingsRate} setSavingsRate={setSavingsRate} 
        />

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <ComparisonChart data={data} />
        </div>

      </main>
    </div>
  );
};

export default ComparisonPage;
