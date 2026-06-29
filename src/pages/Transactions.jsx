// ===== client/src/pages/Transactions.jsx =====
import React, { useEffect, useState } from 'react';
import api from '../api/axios.js';
import TransactionItem from '../components/TransactionItem';
import TransactionForm from '../components/TransactionForm';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export const Transactions = () => {
  const { currency } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  
  // Filter States
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const addToast = (message, type) => {
    const id = Math.random().toString(36).substring(2, 11);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchTransactions = async () => {
    try {
      const params = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/transactions', { params });
      setTransactions(response.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      addToast('Failed to load transactions. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, categoryFilter, startDate, endDate]);

  const handleFormSubmit = async (data) => {
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
      await fetchTransactions();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to submit transaction.';
      addToast(errorMsg, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      addToast('Transaction deleted successfully', 'success');
      setLoading(true);
      await fetchTransactions();
    } catch (err) {
      addToast('Failed to delete transaction.', 'error');
    }
  };

  const handleEditTrigger = (tx) => {
    setEditingTransaction(tx);
    setShowAddModal(true);
  };

  const handleResetFilters = () => {
    setTypeFilter('all');
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  // Perform client-side text filtering for fuzzy title matches
  const filteredTransactions = transactions.filter((tx) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.title.toLowerCase().includes(q) || 
      (tx.notes && tx.notes.toLowerCase().includes(q))
    );
  });

  // Calculate dynamic running balances on display list
  const displayIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const displayExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const displayNet = displayIncome - displayExpense;

  const CATEGORIES = [
    'Food', 'Transport', 'Shopping', 'Bills',
    'Health', 'Entertainment', 'Salary', 'Freelance', 'Other'
  ];

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-h-[calc(100vh-5rem)] bg-[#F4F6FA] dark:bg-[#12121A] transition-colors duration-300 font-sans">
      
      {/* Top action layout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#2D3436] dark:text-[#F1F2F6]">Transaction Records</h2>
          <p className="text-xs text-[#636E72] dark:text-[#A4B0BE] font-semibold mt-1">Review, filter, and modify financial transactions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#6C63FF] hover:bg-[#5A52E6] text-white py-2.5 px-6 rounded-xl font-bold transition-all shadow-md shadow-[#6C63FF30] cursor-pointer"
        >
          + Add Transaction
        </button>
      </div>

      {/* Filter and Query Panels */}
      <div className="bg-white dark:bg-[#1E1E2E] p-6 rounded-2xl shadow-sm border border-[#E0E0E0] dark:border-[#2D313E] space-y-4 transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search */}
          <div>
            <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">Search Title</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Utility bill"
              className="w-full bg-[#F4F6FA] dark:bg-[#12121A] border border-transparent rounded-xl py-2 px-4 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] text-[#2D3436] dark:text-[#F1F2F6]"
            />
          </div>

          {/* Type Segment Control */}
          <div>
            <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">Transaction Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-[#F4F6FA] dark:bg-[#12121A] border border-transparent rounded-xl py-2 px-4 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] text-[#2D3436] dark:text-[#F1F2F6] cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="income">Only Income</option>
              <option value="expense">Only Expense</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#F4F6FA] dark:bg-[#12121A] border border-transparent rounded-xl py-2 px-4 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] text-[#2D3436] dark:text-[#F1F2F6] cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Action */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full bg-[#F4F6FA] dark:bg-[#12121A] hover:bg-slate-100 dark:hover:bg-[#252538] text-[#2D3436] dark:text-[#F1F2F6] py-2 px-4 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-[#34344E]"
            >
              🔄 Reset Filters
            </button>
          </div>

        </div>

        {/* Date Ranges search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100 dark:border-[#2D313E]">
          <div>
            <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#F4F6FA] dark:bg-[#12121A] border border-transparent rounded-xl py-2 px-4 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] text-[#2D3436] dark:text-[#F1F2F6]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#F4F6FA] dark:bg-[#12121A] border border-transparent rounded-xl py-2 px-4 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] text-[#2D3436] dark:text-[#F1F2F6]"
            />
          </div>
          
          {/* Metrics summary of display subset */}
          <div className="flex items-center gap-3 justify-end h-full pt-4 md:pt-0">
            <div className="text-right">
              <p className="text-[10px] text-[#636E72] dark:text-[#A4B0BE] uppercase font-bold tracking-wider">Filtered Net</p>
              <p className={`font-black text-sm md:text-base ${displayNet >= 0 ? 'text-[#2ECC71]' : 'text-[#E74C3C]'}`}>
                {displayNet >= 0 ? '+' : '-'}{currency.symbol || '₹'}{Math.abs(displayNet).toLocaleString(currency.locale || 'en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-[#1E1E2E] p-6 rounded-2xl shadow-sm border border-[#E0E0E0] dark:border-[#2D313E] min-h-[360px] flex flex-col transition-all duration-300">
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <Spinner size="md" />
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-3.5 flex-1">
            {filteredTransactions.map((tx) => (
              <TransactionItem
                key={tx._id}
                transaction={tx}
                onEdit={handleEditTrigger}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center py-20 text-center text-gray-400">
            <span className="text-5xl mb-4">📂</span>
            <p className="font-bold text-base text-[#2D3436] dark:text-[#F1F2F6]">No matches found</p>
            <p className="text-xs mt-1">Try adjusting your filters, clearing dates, or search phrases.</p>
          </div>
        )}
      </div>

      {/* Overlay modal for Add/Edit */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1E1E2E] w-full max-w-lg rounded-2xl p-6 shadow-2xl relative border border-[#E0E0E0] dark:border-[#2D313E]">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingTransaction(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-xl font-black text-[#2D3436] dark:text-[#F1F2F6] mb-4">
              {editingTransaction ? '✏️ Edit Transaction' : '✨ Add New Transaction'}
            </h2>
            <TransactionForm
              onSubmit={handleFormSubmit}
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

export default Transactions;
