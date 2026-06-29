// ===== client/src/components/Toast.jsx =====
import React, { useEffect } from 'react';

export const Toast = ({ 
  message, 
  type, 
  onClose, 
  duration = 4000 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgStyle = type === 'success' ? 'bg-[#2ECC71]' : 'bg-[#E74C3C]';

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 text-white rounded-xl shadow-xl transform transition-all translate-y-0 opacity-100 ${bgStyle}`}
    >
      <span className="text-lg">
        {type === 'success' ? '✨' : '⚠️'}
      </span>
      <p className="font-semibold text-sm tracking-wide">{message}</p>
      <button
        onClick={onClose}
        className="ml-3 font-bold hover:opacity-80 focus:outline-none text-white text-xs cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
