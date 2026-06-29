// ===== client/src/components/TransactionItem.jsx =====
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CATEGORY_EMOJIS = {
  Food: '🛒',
  Transport: '🚗',
  Shopping: '🛍️',
  Bills: '⚡',
  Health: '🏥',
  Entertainment: '🎮',
  Salary: '💼',
  Freelance: '💻',
  Other: '🏷️',
};

export const TransactionItem = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const { currency } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(transaction._id || transaction.id);
    } catch (err) {
      console.error('Delete error in component:', err);
    } finally {
      setDeleting(false);
      setIsConfirming(false);
    }
  };

  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? 'text-[#2ECC71]' : 'text-[#E74C3C]';
  const amountPrefix = isIncome ? '+' : '-';
  const emoji = CATEGORY_EMOJIS[transaction.category] || '🏷️';

  const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex items-center justify-between p-4 bg-[#F4F6FA] dark:bg-[#1E1E2E] hover:bg-slate-100 dark:hover:bg-[#252538] rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-[#34344E]">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-10 h-10 bg-white dark:bg-[#12121A] rounded-lg flex items-center justify-center text-xl shadow-sm flex-shrink-0 select-none">
          {emoji}
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-sm text-[#2D3436] dark:text-[#F1F2F6] truncate">{transaction.title}</p>
          <p className="text-xs text-[#636E72] dark:text-[#A4B0BE] truncate">
            {transaction.category} • {formattedDate}
            {transaction.notes && <span className="italic ml-2 opacity-80">({transaction.notes})</span>}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 flex-shrink-0">
        <p className={`font-bold text-sm md:text-base ${amountColor}`}>
          {amountPrefix}{currency.symbol || '₹'}{transaction.amount.toLocaleString(currency.locale || 'en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>

        {/* Action Controls */}
        <div className="flex items-center gap-2 border-l border-gray-200 dark:border-[#2D313E] pl-3.5">
          {isConfirming ? (
            <div className="flex items-center gap-1.5 animate-fadeIn">
              <span className="text-[11px] font-medium text-[#E74C3C] hidden xs:inline">Confirm?</span>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="bg-[#E74C3C] text-white hover:bg-[#c0392b] px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                title="Confirm Delete"
              >
                {deleting ? '⏳' : 'Yes'}
              </button>
              <button
                onClick={() => setIsConfirming(false)}
                disabled={deleting}
                className="bg-gray-200 dark:bg-[#2D2D3E] text-[#2D3436] dark:text-[#F1F2F6] hover:bg-gray-300 dark:hover:bg-[#3E3E56] px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all"
                title="Cancel Delete"
              >
                No
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onEdit(transaction)}
                className="text-gray-500 dark:text-[#A4B0BE] hover:text-[#6C63FF] p-1.5 hover:bg-white dark:hover:bg-[#12121A] rounded-lg transition-colors cursor-pointer text-xs"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => setIsConfirming(true)}
                className="text-gray-400 dark:text-gray-500 hover:text-[#E74C3C] p-1.5 hover:bg-[#E74C3C10] rounded-lg transition-colors cursor-pointer text-xs"
                title="Delete"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
