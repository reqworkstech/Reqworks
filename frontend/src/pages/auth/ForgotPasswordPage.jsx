import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  
  const { toast } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to request password reset');
      }

      toast.success('Reset link generated successfully!');
      setSent(true);
    } catch (err) {
      toast.error(err.message || 'Error occurred. Please verify your email.');
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
        {/* Top smartphone & profile illustration */}
        <svg viewBox="0 0 200 130" style={{ width: 140, height: 90, margin: '0 auto 16px', display: 'block' }}>
          {/* Base dotted line */}
          <line x1="30" y1="95" x2="170" y2="95" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="3,3" />
          {/* Smartphone Bezel */}
          <rect x="90" y="20" width="45" height="80" rx="6" fill="none" stroke="#f5a623" strokeWidth="2.5" />
          <line x1="108" y1="24" x2="117" y2="24" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" />
          {/* User Profile Card */}
          <rect x="62" y="32" width="44" height="52" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="84" cy="50" r="10" fill="#fef3c7" />
          {/* User Silhouette */}
          <path d="M76,64 C76,59 80,59 84,59 C88,59 92,59 92,64 L92,68 L76,68 Z" fill="#1e293b" />
          <circle cx="84" cy="47" r="4.5" fill="#1e293b" />
          {/* Accents */}
          <circle cx="68" cy="74" r="2" fill="#f5a623" />
          <circle cx="74" cy="74" r="2" fill="#cbd5e1" />
          <line x1="102" y1="70" x2="122" y2="70" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* Form Title */}
        <h1 style={{
          fontFamily: 'var(--fd)',
          fontSize: '1.6rem',
          fontWeight: 700,
          color: '#1e293b',
          marginBottom: 10,
          marginTop: 0,
        }}>
          Forgot Password
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: 28 }}>
          {sent ? 'Reset link sent!' : 'Enter your email.'}
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Email input field */}
            <div style={{ marginBottom: 32, textAlign: 'left' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
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

            {/* Submit Action Button */}
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
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div style={{ animation: 'fade-in 0.3s ease' }}>
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 12,
              padding: '16px 14px',
              marginBottom: 32,
              fontSize: '0.85rem',
              color: '#065f46',
              lineHeight: 1.6,
              textAlign: 'left'
            }}>
              ✓ <strong>Email Sent:</strong> A password reset link has been successfully sent to your email address. Please check your inbox for instructions to set a new password.
            </div>
          </div>
        )}

        {/* Back to Login link */}
        <div style={{ marginTop: 28, fontSize: '0.82rem', color: '#64748b' }}>
          <Link to="/login" style={{ color: '#f5a623', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to Login
          </Link>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
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
