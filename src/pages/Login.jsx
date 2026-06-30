// ===== src/pages/Login.jsx =====
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

/* ── Animated particle dots ─────────────────────────── */
const ParticleField = () => {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${4 + Math.random() * 6}px`,
    duration: `${6 + Math.random() * 10}s`,
    delay: `${Math.random() * 8}s`,
    opacity: 0.3 + Math.random() * 0.5,
    color: ['rgba(108,99,255,0.7)', 'rgba(100,220,255,0.6)', 'rgba(167,139,250,0.7)'][
      Math.floor(Math.random() * 3)
    ],
  }));

  return (
    <div className="auth-particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
};

/* ── Hero left panel ────────────────────────────────── */
const AuthHeroPanel = () => (
  <div className="auth-left">
    <div className="auth-blob auth-blob-1" />
    <div className="auth-blob auth-blob-2" />
    <div className="auth-blob auth-blob-3" />

    <ParticleField />

    {/* Floating decorative icons */}
    <div className="auth-float-icon auth-float-icon-1">💰</div>
    <div className="auth-float-icon auth-float-icon-2">📈</div>
    <div className="auth-float-icon auth-float-icon-3">💳</div>
    <div className="auth-float-icon auth-float-icon-4">🎯</div>
    <div className="auth-float-icon auth-float-icon-5">💎</div>

    {/* Hero content */}
    <div className="auth-hero">
      <div className="auth-hero-logo">E</div>

      <h1>
        Track Every <span>Rupee.</span>
        <br />
        Master Your <span>Finances.</span>
      </h1>
      <p>
        Beautiful insights, effortless tracking,<br />
        and smart budget control — all in one place.
      </p>

      <div className="auth-features">
        <div className="auth-feature-pill">
          <div className="pill-icon" style={{ background: 'rgba(108,99,255,0.25)' }}>📊</div>
          Real-time analytics &amp; spending insights
        </div>
        <div className="auth-feature-pill">
          <div className="pill-icon" style={{ background: 'rgba(46,204,113,0.25)' }}>🔒</div>
          Bank-grade security for your data
        </div>
        <div className="auth-feature-pill">
          <div className="pill-icon" style={{ background: 'rgba(100,220,255,0.25)' }}>⚡</div>
          Instant sync across all devices
        </div>
      </div>

      <div className="auth-stats">
        <div className="auth-stat">
          <div className="auth-stat-num">10K+</div>
          <div className="auth-stat-label">Users</div>
        </div>
        <div className="auth-stat">
          <div className="auth-stat-num">₹50M+</div>
          <div className="auth-stat-label">Tracked</div>
        </div>
        <div className="auth-stat">
          <div className="auth-stat-num">4.9★</div>
          <div className="auth-stat-label">Rating</div>
        </div>
      </div>
    </div>
  </div>
);

/* ── Login page ─────────────────────────────────────── */
export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass]   = useState(false);

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
    <div className="auth-page">
      {/* ── Left decorative panel ── */}
      <AuthHeroPanel />

      {/* ── Right form panel ── */}
      <div className="auth-right">
        <div className="auth-form-card">

          {/* Header */}
          <div className="auth-form-header">
            <div className="auth-form-badge">
              <span>🔐</span> Secure Login
            </div>
            <h2>Welcome Back!</h2>
            <p>Sign in to your account to continue managing your finances.</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="auth-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="auth-field">
              <label htmlFor="login-email">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input
                  id="login-email"
                  type="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔑</span>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    color: '#a0aec0',
                    padding: 0,
                  }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              className="auth-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="btn-spinner" />
                  Signing in…
                </>
              ) : (
                <>Sign In →</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>New to ExpenseTracker?</span>
          </div>

          {/* Footer */}
          <div className="auth-footer">
            Don&apos;t have an account?{' '}
            <Link to="/register">Create one free →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
