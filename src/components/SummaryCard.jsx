// ===== client/src/components/SummaryCard.jsx =====
import React from 'react';
import { useAuth } from '../context/AuthContext';

export const SummaryCard = ({
  title,
  value,
  type,
  percentage,
}) => {
  const { currency } = useAuth();

  const formatValue = (val) => {
    const formatted = Math.abs(val).toLocaleString(currency.locale || 'en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    const sym = currency.symbol || '₹';
    
    if (type === 'income') return `+${sym}${formatted}`;
    if (type === 'expense') return `-${sym}${formatted}`;
    return val < 0 ? `-${sym}${Math.abs(val).toLocaleString(currency.locale || 'en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${sym}${formatted}`;
  };

  if (type === 'balance') {
    return (
      <div className="bg-white dark:bg-[#1E1E2E] p-6 rounded-2xl shadow-sm border border-[#E0E0E0] dark:border-[#2D313E] flex flex-col justify-between h-32 relative overflow-hidden transition-all duration-300">
        <div className="z-10">
          <p className="text-xs text-[#636E72] dark:text-[#A4B0BE] font-semibold uppercase tracking-wider mb-1">
            {title}
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-[#2D3436] dark:text-[#F1F2F6]">
            {formatValue(value)}
          </h2>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10 text-5xl md:text-6xl select-none">
          💰
        </div>
      </div>
    );
  }

  const isIncome = type === 'income';
  const colorClass = isIncome ? 'text-[#2ECC71]' : 'text-[#E74C3C]';
  const progressBgClass = isIncome ? 'bg-[#2ECC71]' : 'bg-[#E74C3C]';
  const tagBgClass = isIncome ? 'bg-[#2ECC71]/15' : 'bg-[#E74C3C]/15';

  const barWidth = isIncome ? '85%' : '45%';

  return (
    <div className="bg-white dark:bg-[#1E1E2E] p-6 rounded-2xl shadow-sm border border-[#E0E0E0] dark:border-[#2D313E] flex flex-col justify-between h-32 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-[#636E72] dark:text-[#A4B0BE] font-semibold uppercase tracking-wider mb-1">
            {title}
          </p>
          <h2 className={`text-2xl md:text-3xl font-black ${colorClass}`}>
            {formatValue(value)}
          </h2>
        </div>
        {percentage !== undefined && (
          <span className={`${tagBgClass} ${colorClass} text-xs font-bold px-2 py-1 rounded-md`}>
            {percentage > 0 ? `+${percentage}` : percentage}%
          </span>
        )}
      </div>
      <div className="h-1.5 w-full bg-[#F4F6FA] dark:bg-[#12121A] rounded-full mt-2">
        <div 
          className={`h-full ${progressBgClass} rounded-full transition-all duration-500`}
          style={{ width: barWidth }}
        />
      </div>
    </div>
  );
};

export default SummaryCard;
