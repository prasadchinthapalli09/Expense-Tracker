// ===== client/src/components/TransactionForm.jsx =====
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Bills',
  'Health', 'Entertainment', 'Salary', 'Freelance', 'Other'
];

export const TransactionForm = ({
  onSubmit,
  initialData = null,
  submitLabel = 'Add Transaction',
  loading = false,
}) => {
  const { currency } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    amount: 0,
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        amount: initialData.amount,
        type: initialData.type,
        category: initialData.category,
        date: new Date(initialData.date).toISOString().split('T')[0],
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        title: '',
        amount: 0,
        type: 'expense',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setErrors({});
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
    }));
    
    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      // Auto assign suitable category defaults based on type
      category: type === 'income' ? 'Salary' : 'Food',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSubmit(formData);
      if (!initialData) {
        // Reset form
        setFormData({
          title: '',
          amount: 0,
          type: 'expense',
          category: 'Food',
          date: new Date().toISOString().split('T')[0],
          notes: '',
        });
      }
    } catch (err) {
      console.error('Submit form error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Toggle */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <button
          type="button"
          onClick={() => handleTypeSelect('income')}
          className={`py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
            formData.type === 'income'
              ? 'bg-[#2ECC71]/15 border-[#2ECC71] text-[#2ECC71]'
              : 'border-[#E0E0E0] dark:border-[#2D313E] text-[#636E72] dark:text-[#A4B0BE] hover:bg-gray-50 dark:hover:bg-[#1E1E2E]'
          }`}
        >
          📈 Income
        </button>
        <button
          type="button"
          onClick={() => handleTypeSelect('expense')}
          className={`py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
            formData.type === 'expense'
              ? 'bg-[#E74C3C]/15 border-[#E74C3C] text-[#E74C3C]'
              : 'border-[#E0E0E0] dark:border-[#2D313E] text-[#636E72] dark:text-[#A4B0BE] hover:bg-gray-50 dark:hover:bg-[#1E1E2E]'
          }`}
        >
          📉 Expense
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">
          Transaction Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Grocery Store"
          className={`w-full bg-[#F4F6FA] dark:bg-[#1E1E2E] border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all text-[#2D3436] dark:text-[#F1F2F6] ${
            errors.title ? 'border-[#E74C3C]' : 'border-transparent'
          }`}
        />
        {errors.title && <p className="text-xs text-[#E74C3C] mt-1 font-medium">{errors.title}</p>}
      </div>

      {/* Amount and Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">
            Amount ({currency.symbol || '₹'})
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount || ''}
            onChange={handleChange}
            placeholder="0.00"
            step="any"
            min="0"
            className={`w-full bg-[#F4F6FA] dark:bg-[#1E1E2E] border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all text-[#2D3436] dark:text-[#F1F2F6] ${
              errors.amount ? 'border-[#E74C3C]' : 'border-transparent'
            }`}
          />
          {errors.amount && <p className="text-xs text-[#E74C3C] mt-1 font-medium">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full bg-[#F4F6FA] dark:bg-[#1E1E2E] border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all text-[#2D3436] dark:text-[#F1F2F6] ${
              errors.date ? 'border-[#E74C3C]' : 'border-transparent'
            }`}
          />
          {errors.date && <p className="text-xs text-[#E74C3C] mt-1 font-medium">{errors.date}</p>}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full bg-[#F4F6FA] dark:bg-[#1E1E2E] border border-transparent rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all text-[#2D3436] dark:text-[#F1F2F6] cursor-pointer"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">
          Notes (Optional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add comments or notes..."
          rows={2}
          className="w-full bg-[#F4F6FA] dark:bg-[#1E1E2E] border border-transparent rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all text-[#2D3436] dark:text-[#F1F2F6] resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#6C63FF] hover:bg-[#5A52E6] disabled:bg-[#a19dfc] text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#6C63FF30] flex justify-center items-center gap-2 cursor-pointer mt-2"
      >
        {loading ? 'Processing...' : submitLabel}
      </button>
    </form>
  );
};

export default TransactionForm;
