// ===== client/src/pages/Login.jsx =====
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA] dark:bg-[#12121A] p-6 font-sans transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-[#1E1E2E] p-8 rounded-2xl shadow-sm border border-[#E0E0E0] dark:border-[#2D313E] space-y-6 transition-all duration-300">
        
        {/* Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 bg-[#6C63FF] rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-[#6C63FF40]">
            E
          </div>
          <h2 className="text-2xl font-extrabold text-[#2D3436] dark:text-[#F1F2F6] tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-[#636E72] dark:text-[#A4B0BE] font-semibold tracking-wider uppercase">
            Log in to manage your budget
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-[#E74C3C]/15 border-l-4 border-[#E74C3C] text-[#E74C3C] px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#F4F6FA] dark:bg-[#12121A] border border-transparent rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all text-[#2D3436] dark:text-[#F1F2F6]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#636E72] dark:text-[#A4B0BE] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#F4F6FA] dark:bg-[#12121A] border border-transparent rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all text-[#2D3436] dark:text-[#F1F2F6]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#6C63FF] hover:bg-[#5A52E6] disabled:bg-[#a19dfc] text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-[#6C63FF30] flex justify-center items-center gap-2 cursor-pointer text-sm"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Register Redirect */}
        <div className="text-center text-sm font-medium pt-2 border-t border-gray-100 dark:border-[#2D313E]">
          <p className="text-[#636E72] dark:text-[#A4B0BE]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#6C63FF] hover:underline font-bold">
              Sign Up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
