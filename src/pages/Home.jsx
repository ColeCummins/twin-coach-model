
import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBarChart2, FiDollarSign } from 'react-icons/fi';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
          The Twin Coach Model
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
          A revolutionary approach to real estate that benefits sellers, tenants, and investors, creating a sustainable and equitable ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Card
          to="/dashboard"
          icon={<FiBarChart2 className="h-8 w-8 text-white" />}
          title="Stakeholder Dashboard"
          description="Explore the financial outcomes for the Seller, Co-op, Investor, and CLT in the proposed model."
        />
        <Card
          to="/comparison"
          icon={<FiDollarSign className="h-8 w-8 text-white" />}
          title="Sale Comparison"
          description="Analyze the after-tax financial advantage of the Twin Coach model versus a conventional sale."
        />
      </div>
    </div>
  );
};

const Card = ({ to, icon, title, description }) => (
  <Link to={to} className="group block p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="bg-indigo-600 p-4 rounded-full mr-6">
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      <FiArrowRight className="h-6 w-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
    </div>
  </Link>
);

export default Home;
