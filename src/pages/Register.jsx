// ===== src/pages/Register.jsx =====
import React, { useState } from 'react';
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
    <div className="auth-float-icon auth-float-icon-1">🚀</div>
    <div className="auth-float-icon auth-float-icon-2">✨</div>
    <div className="auth-float-icon auth-float-icon-3">💡</div>
    <div className="auth-float-icon auth-float-icon-4">🎉</div>
    <div className="auth-float-icon auth-float-icon-5">🌟</div>

    {/* Hero content */}
    <div className="auth-hero">
      <div className="auth-hero-logo">E</div>

      <h1>
        Start Your <span>Journey</span>
        <br />
        to <span>Financial</span> Freedom.
      </h1>
      <p>
        Join thousands of users who take control<br />
        of their money with smart, beautiful tools.
      </p>

      <div className="auth-features">
        <div className="auth-feature-pill">
          <div className="pill-icon" style={{ background: 'rgba(108,99,255,0.25)' }}>🆓</div>
          Completely free — no credit card needed
        </div>
        <div className="auth-feature-pill">
          <div className="pill-icon" style={{ background: 'rgba(46,204,113,0.25)' }}>📱</div>
          Works on every device, anytime
        </div>
        <div className="auth-feature-pill">
          <div className="pill-icon" style={{ background: 'rgba(100,220,255,0.25)' }}>🔔</div>
          Smart alerts &amp; budget reminders
        </div>
      </div>

      <div className="auth-stats">
        <div className="auth-stat">
          <div className="auth-stat-num">2 min</div>
          <div className="auth-stat-label">Setup time</div>
        </div>
        <div className="auth-stat">
          <div className="auth-stat-num">Free</div>
          <div className="auth-stat-label">Forever</div>
        </div>
        <div className="auth-stat">
          <div className="auth-stat-num">100%</div>
          <div className="auth-stat-label">Private</div>
        </div>
      </div>
    </div>
  </div>
);

/* ── Register page ──────────────────────────────────── */
export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Try another email.');
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
              <span>🎉</span> Get Started Free
            </div>
            <h2>Create Account</h2>
            <p>Start tracking your expenses in under 2 minutes.</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="auth-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Full name */}
            <div className="auth-field">
              <label htmlFor="reg-name">Full Name</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">👤</span>
                <input
                  id="reg-name"
                  type="text"
                  className="auth-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="reg-email">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input
                  id="reg-email"
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
              <label htmlFor="reg-password">Password (6+ chars)</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔑</span>
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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
              id="register-submit"
              type="submit"
              className="auth-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="btn-spinner" />
                  Creating account…
                </>
              ) : (
                <>Create Free Account →</>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
            Already have an account?{' '}
            <Link to="/login">Sign In →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
