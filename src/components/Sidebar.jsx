// ===== client/src/components/Sidebar.jsx =====
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/transactions', label: 'Transactions', icon: '📊' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/profile', label: 'My Profile', icon: '👤' },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-[260px] bg-[#1E1E2E] flex flex-col justify-between py-8 px-6 shadow-xl z-40 transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-10">
          {/* Logo / Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 bg-[#6C63FF] rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#6C63FF50]">
                E
              </div>
              <span className="text-white font-bold text-xl tracking-tight italic">
                Tracker
              </span>
            </div>
            {/* Mobile close button */}
            <button 
              onClick={onClose}
              className="md:hidden text-[#CDD6F4] hover:text-[#6C63FF] text-xl font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Nav Links */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-4 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF40]'
                      : 'text-[#CDD6F4] hover:bg-[#2A2A3E]'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-[#CDD6F420] pt-6 space-y-4">
          {user && (
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#A29BFE] flex items-center justify-center font-bold text-white text-sm shadow-md">
                {getInitials(user.name)}
              </div>
              <div className="overflow-hidden">
                <p className="text-[#CDD6F4] text-sm font-semibold truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[#8A91A5] text-[11px] truncate mt-0.5" title={user.email}>
                  {user.email}
                </p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center gap-4 py-3 px-4 w-full rounded-lg text-[#CDD6F4] hover:bg-[#E74C3C20] hover:text-[#E74C3C] transition-all font-medium cursor-pointer"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
