import React, { useState, useEffect } from 'react';
import DealParameters from './components/DealParameters';
import RentScenarios from './components/RentScenarios';
import Dashboard from './components/Dashboard';
import { DEFAULT_PARAMS, RENT_SCENARIOS, calculateTwinCoachModel } from './utils/calculations';

function App() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const newResults = calculateTwinCoachModel(params);
    setResults(newResults);
  }, [params]);

  const handleScenarioChange = (scenario) => {
    setParams((prevParams) => ({
      ...prevParams,
      ...RENT_SCENARIOS[scenario],
    }));
  };

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-purple-600 to-indigo-700 transform -skew-y-6 sm:-skew-y-3"></div>
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <header className="text-center pt-16 pb-12">
          <h1 className="text-5xl font-extrabold text-white tracking-tight">Twin Coach v33+</h1>
          <p className="mt-4 text-xl text-indigo-100">Community Ownership Model for Affordable Housing</p>
        </header>

        <main className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
            <div className="lg:col-span-1 space-y-8">
              <DealParameters params={params} setParams={setParams} />
              <RentScenarios onScenarioChange={handleScenarioChange} />
            </div>

            <div className="lg:col-span-2">
              <Dashboard results={results} />
            </div>
          </div>
        </main>

        <footer className="mt-16 pb-8 text-center text-gray-400">
          <p>Powered by Firebase and React</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
