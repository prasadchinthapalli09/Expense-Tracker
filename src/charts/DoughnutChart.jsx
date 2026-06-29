// ===== client/src/charts/DoughnutChart.jsx =====
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORY_COLORS = {
  Food: '#6C63FF',          // Purple Accent
  Transport: '#F1C40F',     // Yellow
  Shopping: '#E74C3C',      // Red Accent
  Bills: '#2ECC71',         // Green Accent
  Health: '#1ABC9C',        // Turquoise
  Entertainment: '#9B59B6', // Amethyst Purple
  Salary: '#27AE60',        // Deep Green
  Freelance: '#3498DB',     // Blue
  Other: '#95A5A6',         // Muted Gray
};

export const DoughnutChart = ({ data }) => {
  const { currency } = useAuth();
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex flex-col justify-center items-center py-10 text-center">
        <span className="text-3xl mb-2">📊</span>
        <p className="text-xs text-[#636E72] font-semibold uppercase tracking-wider">No expense data available</p>
      </div>
    );
  }

  const categories = data.map(item => item.category);
  const totals = data.map(item => item.total);
  const colors = data.map(item => CATEGORY_COLORS[item.category] || '#95A5A6');

  const chartData = {
    labels: categories,
    datasets: [
      {
        data: totals,
        backgroundColor: colors,
        borderColor: '#FFFFFF',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            family: "'Segoe UI', system-ui, sans-serif",
            size: 11,
            weight: 'bold',
          },
          color: '#636E72',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const val = context.raw || 0;
            const sum = context.dataset.data.reduce((a, b) => a + b, 0);
            const percent = ((val / sum) * 100).toFixed(1);
            return ` ${label}: ${currency.symbol || '₹'}${val.toLocaleString(currency.locale || 'en-IN')} (${percent}%)`;
          },
        },
      },
    },
    cutout: '65%',
  };

  return (
    <div className="relative w-full h-[240px] md:h-[260px]">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default DoughnutChart;
