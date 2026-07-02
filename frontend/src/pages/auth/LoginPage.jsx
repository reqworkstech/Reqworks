import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  
  const { login, loginAdmin, toast } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if redirecting from email verification
    if (searchParams.get('verified') === 'true') {
      toast.success('Email verified successfully! You can now log in.');
    }
  }, [searchParams, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setLoading(true);
    try {
      const credentials = { email: 'user@devqueue.studio', password: 'SuperSecureUserPass123!' };
      const loggedUser = await login(credentials);
      toast.success(`Welcome to DevQueue (Demo), ${loggedUser.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Quick login failed. Please ensure the database is seeded.');
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
          {/* Small floating accents */}
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
          marginBottom: 32,
          marginTop: 0,
        }}>
          Log in
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Email input field */}
          <div style={{ marginBottom: 24, textAlign: 'left' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
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

          {/* Password input field */}
          <div style={{ marginBottom: 16, textAlign: 'left' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: '1px solid #e2e8f0',
                  padding: '8px 30px 8px 0',
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: 8,
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Forgot password link */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
            <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: '#f5a623', fontWeight: 600, textDecoration: 'none' }}>
              Forgot password?
            </Link>
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
            onMouseEnter={e => {
              e.currentTarget.style.background = '#e0951b';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(245,166,35,0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#f5a623';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(245,166,35,0.3)';
            }}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>





        {/* Toggle to register page */}
        <div style={{ marginTop: 24, fontSize: '0.82rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#f5a623', fontWeight: 600, textDecoration: 'none' }}>
            Register
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
