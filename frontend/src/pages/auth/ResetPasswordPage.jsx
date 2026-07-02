import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { toast } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error('Please fill in both fields.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Reset failed');
      }

      toast.success('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      toast.error(err.message || 'Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-outer-wrapper" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px',
    }}>
      {/* Curved wave background */}
      <div className="auth-wave-bg" style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '46vh',
        background: '#f5a623',
        borderBottomRightRadius: '100% 25%',
        borderBottomLeftRadius: '20% 5%',
        zIndex: 1,
      }} />

      {/* Auth Card Container */}
      <div className="auth-card-container" style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: 420,
        background: '#ffffff',
        borderRadius: 24,
        boxShadow: '0 20px 40px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.1)',
        padding: '36px 32px 48px',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}>
        {/* Top security lock illustration */}
        <svg viewBox="0 0 200 130" style={{ width: 140, height: 90, margin: '0 auto 16px', display: 'block' }}>
          {/* Base dotted line */}
          <line x1="30" y1="95" x2="170" y2="95" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="3,3" />
          {/* Padlock */}
          <rect x="85" y="45" width="30" height="24" rx="4" fill="none" stroke="#f5a623" strokeWidth="2.5" />
          <path d="M92,45 L92,34 C92,29 96,25 100,25 C104,25 108,29 108,34 L108,45" fill="none" stroke="#f5a623" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="100" cy="54" r="2.5" fill="#f5a623" />
          <line x1="100" y1="56.5" x2="100" y2="62" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" />
          {/* Decorative floating check */}
          <circle cx="65" cy="50" r="10" fill="#ecfdf5" />
          <path d="M61,50 L64,53 L69,47" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="138" cy="62" r="3" fill="#cbd5e1" />
        </svg>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--fd)',
          fontSize: '1.6rem',
          fontWeight: 700,
          color: '#1e293b',
          marginBottom: 10,
          marginTop: 0,
        }}>
          Reset Password
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: 28 }}>
          Set a new password.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* New Password input */}
          <div style={{ marginBottom: 24, textAlign: 'left' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Password</label>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                border: 'none',
                borderBottom: '1px solid #e2e8f0',
                padding: '8px 0',
                background: 'transparent',
                color: '#1e293b',
                fontSize: '0.9rem',
                outline: 'none',
                marginTop: 4,
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderBottomColor = '#f5a623'}
              onBlur={e => e.target.style.borderBottomColor = '#e2e8f0'}
            />
          </div>

          {/* Confirm Password input */}
          <div style={{ marginBottom: 32, textAlign: 'left' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%',
                border: 'none',
                borderBottom: '1px solid #e2e8f0',
                padding: '8px 0',
                background: 'transparent',
                color: '#1e293b',
                fontSize: '0.9rem',
                outline: 'none',
                marginTop: 4,
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderBottomColor = '#f5a623'}
              onBlur={e => e.target.style.borderBottomColor = '#e2e8f0'}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 99,
              background: '#f5a623',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(245,166,35,0.3)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e0951b'}
            onMouseLeave={e => e.currentTarget.style.background = '#f5a623'}
          >
            {loading ? 'Resetting password...' : 'Reset Password'}
          </button>
        </form>

        {/* Back to Login */}
        <div style={{ marginTop: 28, fontSize: '0.82rem', color: '#64748b' }}>
          <Link to="/login" style={{ color: '#f5a623', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to Login
          </Link>
        </div>
      </div>
      <style>{`
        @media (max-width: 480px) {
          .auth-outer-wrapper {
            padding: 20px !important;
          }
          .auth-wave-bg {
            height: 32vh !important;
          }
          .auth-card-container {
            padding: 28px 20px 36px !important;
            border-radius: 18px !important;
          }
        }
      `}</style>
    </div>
  );
}
