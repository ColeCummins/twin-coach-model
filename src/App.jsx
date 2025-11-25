
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import DashboardPage from './pages/DashboardPage';
import ComparisonPage from './pages/ComparisonPage';
import ConfiguratorPage from './pages/ConfiguratorPage';
import NavBar from './components/NavBar';

const App = () => {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/comparison" element={<ComparisonPage />} />
        <Route path="/v41" element={<ConfiguratorPage />} />
      </Routes>
    </Router>
  );
};

export default App;
