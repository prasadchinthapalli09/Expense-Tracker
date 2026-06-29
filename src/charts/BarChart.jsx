// ===== client/src/charts/BarChart.jsx =====
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const BarChart = ({ data }) => {
  const { currency } = useAuth();
  const months = data.map(item => item.month);
  const spending = data.map(item => item.total);

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Monthly Spending',
        data: spending,
        backgroundColor: '#6C63FF',
        hoverBackgroundColor: '#5A52E6',
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 32,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        padding: 12,
        titleFont: {
          family: "'Segoe UI', system-ui, sans-serif",
          size: 12,
          weight: 'bold',
        },
        bodyFont: {
          family: "'Segoe UI', system-ui, sans-serif",
          size: 12,
        },
        callbacks: {
          label: (context) => ` Spending: ${currency.symbol || '₹'}${context.raw.toLocaleString(currency.locale || 'en-IN')}`,
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(224, 224, 224, 0.5)',
        },
        ticks: {
          color: '#636E72',
          font: {
            family: "'Segoe UI', system-ui, sans-serif",
            size: 10,
            weight: 'bold',
          },
          callback: (value) => `${currency.symbol || '₹'}${value.toLocaleString(currency.locale || 'en-IN')}`,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#636E72',
          font: {
            family: "'Segoe UI', system-ui, sans-serif",
            size: 10,
            weight: 'bold',
          },
        },
      },
    },
  };

  return (
    <div className="relative w-full h-[260px] md:h-[300px]">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
