// ===== client/src/pages/Dashboard.jsx =====
import React, { useEffect, useState } from 'react';
import api from '../api/axios.js';
import SummaryCard from '../components/SummaryCard';
import TransactionItem from '../components/TransactionItem';
import DoughnutChart from '../charts/DoughnutChart';
import TransactionForm from '../components/TransactionForm';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { currency } = useAuth();
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [budgets, setBudgets] = useState({});
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Budget settings states
  const [selectedCategory, setSelectedCategory] = useState('Food');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [budgetLoading, setBudgetLoading] = useState(false);

  const addToast = (message, type) => {
    const id = Math.random().toString(36).substring(2, 11);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchData = async () => {
    try {
      const [summaryRes, analyticsRes, budgetsRes] = await Promise.all([
        api.get('/transactions/summary'),
        api.get('/transactions/analytics'),
        api.get('/transactions/budgets'),
      ]);
      setSummary(summaryRes.data);
      setAnalytics(analyticsRes.data);
      setBudgets(budgetsRes.data.budgets || {});
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      addToast('Failed to load dashboard data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTransactionSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction._id}`, data);
        addToast(`Transaction "${data.title}" updated successfully!`, 'success');
        setEditingTransaction(null);
      } else {
        await api.post('/transactions', data);
        addToast(`Transaction "${data.title}" added successfully!`, 'success');
      }
      setShowAddModal(false);
      setLoading(true);
      await fetchData();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to process transaction. Try again.';
      addToast(errorMsg, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      addToast('Transaction deleted successfully', 'success');
      setLoading(true);
      await fetchData();
    } catch (err) {
      addToast('Failed to delete transaction.', 'error');
    }
  };

  const handleEditTrigger = (tx) => {
    setEditingTransaction(tx);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingTransaction(null);
  };

  // Budget management handlers
  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!budgetLimit || Number(budgetLimit) < 0) {
      addToast('Please enter a valid monthly limit amount.', 'error');
      return;
    }
    setBudgetLoading(true);
    try {
      const updatedBudgets = {
        ...budgets,
        [selectedCategory]: Number(budgetLimit),
      };
      
      const res = await api.post('/transactions/budgets', { budgets: updatedBudgets });
      setBudgets(res.data.budgets || {});
      addToast(`Monthly budget for ${selectedCategory} updated to ${currency.symbol || '₹'}${Number(budgetLimit).toLocaleString(currency.locale || 'en-IN')}!`, 'success');
      setBudgetLimit('');
      
      // Update data lists as budgets changed
      await fetchData();
    } catch (err) {
      addToast('Failed to save monthly budget limit.', 'error');
    } finally {
      setBudgetLoading(false);
    }
  };

  const handleDeleteBudget = async (category) => {
    try {
      const updatedBudgets = { ...budgets };
      delete updatedBudgets[category];
      const res = await api.post('/transactions/budgets', { budgets: updatedBudgets });
      setBudgets(res.data.budgets || {});
      addToast(`Removed budget limit for ${category}.`, 'success');
      await fetchData();
    } catch (err) {
      addToast('Failed to remove budget.', 'error');
    }
  };

  const getCategorySpent = (cat) => {
    if (!analytics || !analytics.categoryBreakdown) return 0;
    const item = analytics.categoryBreakdown.find((b) => b.category === cat);
    return item ? item.total : 0;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F4F6FA] dark:bg-[#12121A] min-h-[calc(100vh-5rem)]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-h-[calc(100vh-5rem)] bg-[#F4F6FA] dark:bg-[#12121A] transition-colors duration-300">
      
      {/* 3 Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <SummaryCard
          title="Total Balance"
          value={summary?.balance || 0}
          type="balance"
        />
        <SummaryCard
          title="Monthly Income"
          value={summary?.totalIncome || 0}
          type="income"
          percentage={12}
        />
        <SummaryCard
          title="Monthly Expenses"
          value={summary?.totalExpenses || 0}
          type="expense"
          percentage={-5}
        />
      </section>

      {/* Grid of details */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
        {/* Recent Transactions (60% width) */}
        <div className="lg:col-span-3 bg-white dark:bg-[#1E1E2E] p-6 md:p-8 rounded-2xl shadow-sm border border-[#E0E0E0] dark:border-[#2D313E] flex flex-col h-[400px] transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#2D3436] dark:text-[#F1F2F6]">Recent Transactions</h3>
            <button
              onClick={() => window.location.hash = '/transactions'}
              className="text-[#6C63FF] text-sm font-semibold hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {summary && summary.recentTransactions.length > 0 ? (
              summary.recentTransactions.map((tx) => (
                <TransactionItem
                  key={tx._id}
                  transaction={tx}
                  onEdit={handleEditTrigger}
                  onDelete={handleDeleteTransaction}
                />
              ))
            ) : (
              <div className="h-full flex flex-col justify-center items-center py-10 text-center text-gray-400">
                <span className="text-4xl mb-3">📝</span>
                <p className="font-bold text-sm text-[#2D3436] dark:text-[#F1F2F6]">No transactions yet</p>
                <p className="text-xs mt-1">Start tracking your finances by adding your first item.</p>
              </div>
            )}
          </div>
        </div>

        {/* Expense Split (40% width) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E1E2E] p-6 md:p-8 rounded-2xl shadow-sm border border-[#E0E0E0] dark:border-[#2D313E] flex flex-col items-center justify-between h-[400px] transition-all duration-300">
          <h3 className="text-lg font-bold text-[#2D3436] dark:text-[#F1F2F6] w-full text-left mb-4">Expense Split</h3>
          
          {analytics && analytics.categoryBreakdown.length > 0 ? (
            <div className="flex-1 w-full flex flex-col justify-center">
              <DoughnutChart data={analytics.categoryBreakdown} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-400">
              <span className="text-3xl mb-2">📊</span>
              <p className="text-xs uppercase tracking-widest font-bold">No expense categories</p>
            </div>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full bg-[#6C63FF] hover:bg-[#5A52E6] text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all cursor-pointer mt-4"
          >
            + Add New Transaction
          </button>
        </div>
      </section>

      {/* Real-time Budgets Progress Tracker and Budget Editor (3rd Row!) */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
        {/* Real-time Budget Usage progress bars (3/5 columns) */}
        <div className="lg:col-span-3 bg-white dark:bg-[#1E1E2E] p-6 md:p-8 rounded-2xl shadow-sm border border-[#E0E0E0] dark:border-[#2D313E] flex flex-col min-h-[320px] transition-all duration-300">
          <h3 className="text-lg font-bold text-[#2D3436] dark:text-[#F1F2F6] mb-6">Monthly Budgets & Progress</h3>
          <div className="flex-1 space-y-5 overflow-y-auto max-h-[300px] pr-1">
            {Object.keys(budgets).length > 0 ? (
              Object.entries(budgets).map(([category, limit]) => {
                const spent = getCategorySpent(category);
                const percent = Math.min(100, Math.round((spent / limit) * 100));
                const isOver = spent > limit;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#2D3436] dark:text-[#F1F2F6]">{category}</span>
                        {isOver && (
                          <span className="text-[10px] bg-[#E74C3C]/15 text-[#E74C3C] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            Over budget! ⚠️
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-[#636E72] dark:text-[#A4B0BE]">
                        {currency.symbol || '₹'}{spent.toLocaleString(currency.locale || 'en-IN')} spent / <span className="font-bold">{currency.symbol || '₹'}{limit.toLocaleString(currency.locale || 'en-IN')} limit</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-[#F4F6FA] dark:bg-[#12121A] rounded-full relative overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-[#E74C3C]' : 'bg-[#6C63FF]'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col justify-center items-center py-10 text-center text-gray-400">
                <span className="text-4xl mb-3">🎯</span>
                <p className="font-bold text-sm text-[#2D3436] dark:text-[#F1F2F6]">No budget targets set</p>
                <p className="text-xs mt-1">Set category-specific monthly spending limits to track real-time progress.</p>
              </div>
            )}
          </div>
        </div>

        {/* Set Budget Target Form (2/5 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E1E2E] p-6 md:p-8 rounded-2xl shadow-sm border border-[#E0E0E0] dark:border-[#2D313E] flex flex-col justify-between min-h-[320px] transition-all duration-300">
          <div>
            <h3 className="text-lg font-bold text-[#2D3436] dark:text-[#F1F2F6] mb-4">Define Spending Limits</h3>
            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">
                  Expense Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-[#F4F6FA] dark:bg-[#12121A] border border-transparent rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all text-[#2D3436] dark:text-[#F1F2F6] cursor-pointer"
                >
                  {['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">
                  Monthly Limit ({currency.symbol || '₹'})
                </label>
                <input
                  type="number"
                  placeholder="e.g. 300"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  min="0"
                  className="w-full bg-[#F4F6FA] dark:bg-[#12121A] border border-transparent rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all text-[#2D3436] dark:text-[#F1F2F6]"
                />
              </div>

              <button
                type="submit"
                disabled={budgetLoading}
                className="w-full bg-[#6C63FF] hover:bg-[#5A52E6] disabled:bg-[#a19dfc] text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all cursor-pointer mt-2"
              >
                {budgetLoading ? 'Saving...' : 'Set Budget Limit'}
              </button>
            </form>
          </div>

          {/* List of currently active budgets with delete button */}
          {Object.keys(budgets).length > 0 && (
            <div className="border-t border-gray-150 dark:border-[#2D313E] pt-4 mt-4 overflow-y-auto max-h-[110px] space-y-1.5 pr-1">
              <p className="text-[10px] font-black uppercase text-[#636E72] dark:text-[#A4B0BE] tracking-widest mb-1">Active Targets</p>
              {Object.entries(budgets).map(([category, limit]) => (
                <div key={category} className="flex items-center justify-between text-xs bg-[#F4F6FA] dark:bg-[#12121A] py-1.5 px-3 rounded-lg">
                  <span className="font-semibold text-[#2D3436] dark:text-[#F1F2F6]">{category}: <span className="text-[#6C63FF]">{currency.symbol || '₹'}{limit.toLocaleString(currency.locale || 'en-IN')}</span></span>
                  <button 
                    onClick={() => handleDeleteBudget(category)}
                    className="text-gray-400 hover:text-[#E74C3C] font-bold cursor-pointer transition-colors"
                    title="Remove limit"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Overlay Modal for Adding/Editing Transactions */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1E1E2E] w-full max-w-lg rounded-2xl p-6 shadow-2xl relative border border-[#E0E0E0] dark:border-[#2D313E]">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-xl font-black text-[#2D3436] dark:text-[#F1F2F6] mb-4">
              {editingTransaction ? '✏️ Edit Transaction' : '✨ Add New Transaction'}
            </h2>
            <TransactionForm
              onSubmit={handleAddTransactionSubmit}
              initialData={editingTransaction}
              submitLabel={editingTransaction ? 'Save Changes' : 'Create Transaction'}
              loading={formLoading}
            />
          </div>
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

export default Dashboard;
