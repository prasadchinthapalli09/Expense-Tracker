// ===== client/src/charts/LineChart.jsx =====
import React from 'react';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const LineChart = ({ data }) => {
  const { currency } = useAuth();
  const months = data.map(item => item.month);
  const incomes = data.map(item => item.income);
  const expenses = data.map(item => item.expense);

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Income',
        data: incomes,
        borderColor: '#2ECC71',
        backgroundColor: 'rgba(46, 204, 113, 0.05)',
        borderWidth: 3.5,
        tension: 0.35,
        pointBackgroundColor: '#2ECC71',
        pointHoverRadius: 6,
        fill: true,
      },
      {
        label: 'Expense',
        data: expenses,
        borderColor: '#E74C3C',
        backgroundColor: 'rgba(231, 76, 60, 0.05)',
        borderWidth: 3.5,
        tension: 0.35,
        pointBackgroundColor: '#E74C3C',
        pointHoverRadius: 6,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 15,
          font: {
            family: "'Segoe UI', system-ui, sans-serif",
            size: 11,
            weight: 'bold',
          },
          color: '#636E72',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
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
          label: (context) => ` ${context.dataset.label || ''}: ${currency.symbol || '₹'}${context.raw.toLocaleString(currency.locale || 'en-IN')}`,
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
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
