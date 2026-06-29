// ===== client/src/components/Navbar.jsx =====
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({
  onToggleSidebar,
  title = 'Dashboard',
  searchQuery = '',
  onSearchChange,
  showSearch = false,
}) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Sync theme with DOM documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <header className="h-20 flex items-center justify-between px-6 md:px-10 bg-white dark:bg-[#1E1E2E] border-b border-[#E0E0E0] dark:border-[#2D313E] sticky top-0 z-20 transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Menu */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-[#2D3436] dark:text-[#F1F2F6] p-2 hover:bg-[#F4F6FA] dark:hover:bg-[#2D2D3E] rounded-lg transition-colors cursor-pointer text-xl"
          aria-label="Toggle menu"
        >
          ☰
        </button>
        
        <h1 className="text-xl md:text-2xl font-bold text-[#2D3436] dark:text-[#F1F2F6] capitalize">
          {title} {title === 'Dashboard' && user ? `, ${user.name.split(' ')[0]}! 👋` : ''}
        </h1>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Search Input (Conditionally Rendered based on page requirements) */}
        {showSearch && onSearchChange && (
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-[#F4F6FA] dark:bg-[#2D2D3E] border-none rounded-full py-2 px-6 w-52 md:w-64 text-sm focus:ring-2 focus:ring-[#6C63FF] transition-all text-[#2D3436] dark:text-[#F1F2F6] outline-none"
            />
          </div>
        )}

        {/* Dark / Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F4F6FA] dark:bg-[#2D2D3E] hover:bg-[#E0E0E0] dark:hover:bg-[#34344E] transition-colors cursor-pointer text-lg"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {/* Notifications and Profile Status */}
        <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#F4F6FA] dark:bg-[#2D2D3E] hover:bg-[#E0E0E0] dark:hover:bg-[#34344E] transition-colors cursor-pointer text-base">
          🔔
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#E74C3C] rounded-full ring-2 ring-white dark:ring-[#1E1E2E]"></span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
