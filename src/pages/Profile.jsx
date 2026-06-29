// ===== client/src/pages/Profile.jsx =====
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Phone, 
  MapPin, 
  Coins, 
  Lock, 
  Save, 
  CheckCircle,
  Activity
} from 'lucide-react';
import Toast from '../components/Toast';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', locale: 'en-IN', name: 'Indian Rupee (₹)', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar ($)', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro (€)', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound (£)', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen (¥)', flag: '🇯🇵' },
  { code: 'CAD', symbol: 'C$', locale: 'en-CA', name: 'Canadian Dollar (C$)', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', locale: 'en-AU', name: 'Australian Dollar (A$)', flag: '🇦🇺' },
  { code: 'AED', symbol: 'د.إ', locale: 'ar-AE', name: 'UAE Dirham (د.إ)', flag: '🇦🇪' },
  { code: 'SGD', symbol: 'S$', locale: 'en-SG', name: 'Singapore Dollar (S$)', flag: '🇸🇬' },
];

export const Profile = () => {
  const { user, setUser, currency, updateCurrency } = useAuth();
  const [toasts, setToasts] = useState([]);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '+91 98765 43210',
    location: 'Mumbai, India',
    currencyCode: 'INR',
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        currencyCode: currency?.code || 'INR',
      }));
    }
  }, [user, currency]);

  const addToast = (message, type) => {
    const id = Math.random().toString(36).substring(2, 11);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      addToast('Name field cannot be empty.', 'error');
      return;
    }

    setSavingProfile(true);
    // Simulate API delay
    setTimeout(() => {
      const updatedUser = {
        ...user,
        name: profileData.name,
        email: profileData.email,
      };
      
      // Persist in localStorage and context
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Update currency configuration
      const selectedCurr = CURRENCIES.find(c => c.code === profileData.currencyCode);
      if (selectedCurr) {
        updateCurrency(selectedCurr);
      }
      
      addToast('Profile details updated successfully!', 'success');
      setSavingProfile(false);
    }, 800);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('Please fill out all password fields.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setSavingPassword(true);
    // Simulate API update
    setTimeout(() => {
      addToast('Password updated successfully!', 'success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setSavingPassword(false);
    }, 1000);
  };

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
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
      {/* Toast Notification HUD */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        {/* Header Hero Section */}
        <div className="bg-white dark:bg-[#1E1E2E] rounded-3xl p-6 md:p-8 shadow-sm border border-[#E0E0E0] dark:border-[#2D313E] flex flex-col md:flex-row items-center md:items-start justify-between gap-6 transition-all duration-300">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#A29BFE] flex items-center justify-center font-black text-white text-3xl shadow-xl shadow-[#6C63FF20]">
              {getInitials(profileData.name)}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl font-black text-[#2D3436] dark:text-[#F1F2F6]">
                  {profileData.name}
                </h2>
                <span className="bg-[#6C63FF]/15 text-[#6C63FF] text-xs font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Personal Account
                </span>
              </div>
              <p className="text-sm text-[#636E72] dark:text-[#A4B0BE] font-medium flex items-center justify-center md:justify-start gap-1.5">
                <Mail size={14} className="opacity-80" /> {profileData.email}
              </p>
              <p className="text-xs text-[#636E72] dark:text-[#A4B0BE] flex items-center justify-center md:justify-start gap-1.5 opacity-80">
                <Calendar size={13} /> Joined June 2026
              </p>
            </div>
          </div>
          
          <div className="bg-[#F4F6FA] dark:bg-[#12121A] py-3.5 px-5 rounded-2xl border border-transparent dark:border-[#202030] flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
            <div className="w-10 h-10 rounded-xl bg-[#2ECC71]/15 text-[#2ECC71] flex items-center justify-center text-xl">
              {currency?.flag || '🇮🇳'}
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#636E72] dark:text-[#A4B0BE] tracking-wider">Base Currency</p>
              <p className="text-sm font-black text-[#2D3436] dark:text-[#F1F2F6] flex items-center gap-1">
                {currency?.name ? currency.name.split(' (')[0] : 'Indian Rupee'} <span className="text-[#2ECC71]">({currency?.code || 'INR'})</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Account Details Form */}
          <div className="col-span-1 md:col-span-7 bg-white dark:bg-[#1E1E2E] p-6 md:p-8 rounded-3xl shadow-sm border border-[#E0E0E0] dark:border-[#2D313E] space-y-6 transition-all duration-300">
            <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-[#2D313E] pb-4">
              <div className="p-2 bg-[#6C63FF]/10 text-[#6C63FF] rounded-lg">
                <User size={18} />
              </div>
              <h3 className="text-lg font-bold text-[#2D3436] dark:text-[#F1F2F6]">Personal Information</h3>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full bg-[#F4F6FA] dark:bg-[#12121A] border border-transparent rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all text-[#2D3436] dark:text-[#F1F2F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    disabled
                    title="Email cannot be changed"
                    className="w-full bg-[#E0E0E0]/50 dark:bg-[#12121A]/50 border border-transparent rounded-xl py-2.5 px-4 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="w-full bg-[#F4F6FA] dark:bg-[#12121A] border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all text-[#2D3436] dark:text-[#F1F2F6]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                      className="w-full bg-[#F4F6FA] dark:bg-[#12121A] border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all text-[#2D3436] dark:text-[#F1F2F6]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">
                  App Currency Context
                </label>
                <div className="relative">
                  <Coins size={14} className="absolute left-4 top-3.5 text-gray-400 z-10" />
                  <select
                    name="currencyCode"
                    value={profileData.currencyCode}
                    onChange={handleProfileChange}
                    className="w-full bg-[#F4F6FA] dark:bg-[#12121A] border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all text-[#2D3436] dark:text-[#F1F2F6] cursor-pointer appearance-none"
                  >
                    {CURRENCIES.map(curr => (
                      <option key={curr.code} value={curr.code}>{curr.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                    ▼
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">This changes the currency prefix and regional formatting throughout the app.</p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-[#6C63FF] hover:bg-[#5A52E6] text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-md shadow-[#6C63FF20] flex items-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  <Save size={15} />
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Security & Password Reset / Account Stats */}
          <div className="col-span-1 md:col-span-5 space-y-6">
            
            {/* Account Status Card */}
            <div className="bg-white dark:bg-[#1E1E2E] p-6 rounded-3xl shadow-sm border border-[#E0E0E0] dark:border-[#2D313E] space-y-4 transition-all duration-300">
              <h4 className="text-sm font-black uppercase text-[#636E72] dark:text-[#A4B0BE] tracking-widest border-b border-gray-150 dark:border-[#2D313E] pb-2.5">
                Financial Health & Status
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Security Status</span>
                  <span className="text-xs font-bold text-[#2ECC71] flex items-center gap-1">
                    <CheckCircle size={12} /> Verified Guarded
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Account Tier</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-[#F1F2F6]">Personal Basic</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Sync Status</span>
                  <span className="text-xs font-bold text-[#6C63FF] flex items-center gap-1">
                    <Activity size={12} className="animate-pulse" /> Live Cloud DB
                  </span>
                </div>
              </div>
            </div>

            {/* Password Reset Section */}
            <div className="bg-white dark:bg-[#1E1E2E] p-6 rounded-3xl shadow-sm border border-[#E0E0E0] dark:border-[#2D313E] space-y-5 transition-all duration-300">
              <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-[#2D313E] pb-3">
                <div className="p-1.5 bg-[#E74C3C]/10 text-[#E74C3C] rounded-lg">
                  <Shield size={16} />
                </div>
                <h3 className="text-sm font-bold text-[#2D3436] dark:text-[#F1F2F6]">Security & Password</h3>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="••••••••"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-[#F4F6FA] dark:bg-[#12121A] border border-transparent rounded-xl py-2 px-9 text-xs focus:outline-none focus:ring-2 focus:ring-[#6C63FF] text-[#2D3436] dark:text-[#F1F2F6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="At least 6 characters"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-[#F4F6FA] dark:bg-[#12121A] border border-transparent rounded-xl py-2 px-9 text-xs focus:outline-none focus:ring-2 focus:ring-[#6C63FF] text-[#2D3436] dark:text-[#F1F2F6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Re-enter password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-[#F4F6FA] dark:bg-[#12121A] border border-transparent rounded-xl py-2 px-9 text-xs focus:outline-none focus:ring-2 focus:ring-[#6C63FF] text-[#2D3436] dark:text-[#F1F2F6]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full bg-gray-900 hover:bg-black dark:bg-[#2D2D3E] dark:hover:bg-[#3D3D52] text-white font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
                >
                  <Shield size={13} />
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
