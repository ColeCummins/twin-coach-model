import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AmortizationChart = ({ data }) => {
  const chartData = {
    labels: data.map((d) => d.year),
    datasets: [
      {
        label: 'Remaining Balance',
        data: data.map((d) => d.remainingBalance),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Cumulative Principal',
        data: data.map((d) => d.cumulativePrincipal),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Seller Loan Amortization',
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default AmortizationChart;
