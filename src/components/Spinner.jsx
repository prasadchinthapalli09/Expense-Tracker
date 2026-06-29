// ===== client/src/components/Spinner.jsx =====
import React from 'react';

export const Spinner = ({ 
  size = 'md', 
  color = 'border-[#6C63FF]', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-t-transparent ${color} rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
    </div>
  );
};

export default Spinner;
