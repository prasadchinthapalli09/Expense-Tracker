// ===== client/src/pages/Analytics.jsx =====
import React, { useEffect, useState } from 'react';
import api from '../api/axios.js';
import DoughnutChart from '../charts/DoughnutChart';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';

export const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type) => {
    const id = Math.random().toString(36).substring(2, 11);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/transactions/analytics');
        setData(response.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        addToast('Failed to compile report. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F4F6FA] dark:bg-[#12121A] min-h-[calc(100vh-5rem)]">
        <Spinner size="lg" />
      </div>
    );
  }

  const hasData = data && (
    data.categoryBreakdown.length > 0 || 
    data.monthlyTrend.some(m => m.income > 0 || m.expense > 0)
  );

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-h-[calc(100vh-5rem)] bg-[#F4F6FA] dark:bg-[#12121A] transition-colors duration-300 font-sans">
      
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-[#2D3436] dark:text-[#F1F2F6]">Visual Analytics</h2>
        <p className="text-xs text-[#636E72] dark:text-[#A4B0BE] font-semibold mt-1">Deep-dive financial trends and expenditure splits</p>
      </div>

      {hasData && data ? (
        <div className="space-y-8">
          
          {/* Row 1: Line Chart (Income vs Expense MoM) */}
          <div className="bg-white dark:bg-[#1E1E2E] p-6 rounded-2xl shadow-sm border border-[#E0E0E0] dark:border-[#2D313E] flex flex-col h-fit transition-all duration-300">
            <div className="mb-4">
              <h3 className="text-base md:text-lg font-bold text-[#2D3436] dark:text-[#F1F2F6]">Income vs Expense over time</h3>
              <p className="text-[11px] text-[#636E72] dark:text-[#A4B0BE] font-bold mt-0.5">Month-on-Month comparison (last 6 calendar months)</p>
            </div>
            <div className="flex-1 min-h-[260px] md:min-h-[300px]">
              <LineChart data={data.monthlyTrend} />
            </div>
          </div>

          {/* Row 2: Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Column A: Doughnut Expense categories breakdown */}
            <div className="bg-white dark:bg-[#1E1E2E] p-6 rounded-2xl shadow-sm border border-[#E0E0E0] dark:border-[#2D313E] flex flex-col justify-between h-fit transition-all duration-300">
              <div className="mb-4">
                <h3 className="text-base md:text-lg font-bold text-[#2D3436] dark:text-[#F1F2F6]">Expense Category Breakdown</h3>
                <p className="text-[11px] text-[#636E72] dark:text-[#A4B0BE] font-bold mt-0.5">Percentage slice of your total expenditures</p>
              </div>
              <div className="flex-grow flex items-center justify-center min-h-[240px] md:min-h-[260px]">
                <DoughnutChart data={data.categoryBreakdown} />
              </div>
            </div>

            {/* Column B: Monthly trends */}
            <div className="bg-white dark:bg-[#1E1E2E] p-6 rounded-2xl shadow-sm border border-[#E0E0E0] dark:border-[#2D313E] flex flex-col h-fit transition-all duration-300">
              <div className="mb-4">
                <h3 className="text-base md:text-lg font-bold text-[#2D3436] dark:text-[#F1F2F6]">Monthly Outflow Trends</h3>
                <p className="text-[11px] text-[#636E72] dark:text-[#A4B0BE] font-bold mt-0.5">Gross spending trend (last 6 calendar months)</p>
              </div>
              <div className="flex-grow min-h-[240px] md:min-h-[260px]">
                <BarChart data={data.monthlySpend} />
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E1E2E] p-12 rounded-2xl shadow-sm border border-[#E0E0E0] dark:border-[#2D313E] flex flex-col items-center justify-center text-center text-gray-400 min-h-[400px] transition-all duration-300">
          <span className="text-6xl mb-4">📈</span>
          <h3 className="font-bold text-lg text-[#2D3436] dark:text-[#F1F2F6]">No financial reports compiled yet</h3>
          <p className="text-xs mt-2 max-w-sm leading-relaxed text-[#636E72] dark:text-[#A4B0BE]">
            Analytics require financial records. Try adding salary income or purchases in the Transactions tab to see graphs populate dynamically.
          </p>
        </div>
      )}

      {/* Render custom Toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

    </div>
  );
};

export default Analytics;
