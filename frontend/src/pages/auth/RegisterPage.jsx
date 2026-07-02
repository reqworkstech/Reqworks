import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function getStrength(password) {
  let score = 0;
  if (!password) return 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const validatePhone = (phone) => {
  const cleaned = phone.replace(/[^0-9]/g, '');
  return cleaned.length === 10;
};

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', occupation: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(1); // 1: Info, 2: Pass, 3: Contact/OTP
  const [otpSent, setOtpSent] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, setUser, toast } = useAuth();
  const navigate = useNavigate();

  // Validate and advance step
  const handleNextPhase = async () => {
    if (phase === 1) {
      if (!form.name || !form.email || !form.occupation) {
        toast.error("Please fill in your name, email, and select your occupation.");
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email })
        });
        const data = await res.json();
        if (data.success && data.exists) {
          toast.error("Email is already registered. Please use another email or sign in.");
          return;
        }
      } catch (err) {
        console.error("Check email failed:", err);
      } finally {
        setLoading(false);
      }
      
      setPhase(2);
    } else if (phase === 2) {
      const strength = getStrength(form.password);
      if (strength < 3) {
        toast.error("Password is too weak. Ensure it has at least 8 characters, an uppercase letter, and a number.");
        return;
      }
      setPhase(3);
    }
  };

  const handlePrevPhase = () => {
    setPhase(prev => Math.max(1, prev - 1));
  };

  // Submit registration & send OTP (Step 3)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validatePhone(form.phone)) {
      toast.error("Please enter a valid 10 mobile number.");
      return;
    }

    setLoading(true);
    try {
      // Check duplicate phone first
      const phoneRes = await fetch('/api/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, email: form.email })
      });
      const phoneData = await phoneRes.json();
      if (phoneData.success && phoneData.exists) {
        toast.error("Phone number is already registered.");
        return;
      }

      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        occupation: form.occupation
      });
      toast.success("Account registered! A 6-digit OTP has been sent to your email.");
      setOtpSent(true);
      setAttemptsLeft(3);
    } catch (err) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP & Enter Dashboard directly
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp })
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "OTP Verification failed");
      }

      toast.success("Verification successful! Welcome to your dashboard.");
      setUser(prev => ({ ...prev, isEmailVerified: true }));
      navigate('/dashboard');
    } catch (err) {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      
      if (remaining <= 0) {
        toast.error("Verification failed. 3 incorrect attempts. Please register again.");
        // Reset state
        setUser(null);
        setForm({ name: '', email: '', password: '', phone: '' });
        setOtp('');
        setOtpSent(false);
        setPhase(1);
      } else {
        toast.error(`Invalid OTP code. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const isPhoneValid = validatePhone(form.phone);

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

        {/* Phase Header Titles */}
        <h1 style={{
          fontFamily: 'var(--fd)',
          fontSize: '1.6rem',
          fontWeight: 700,
          color: '#1e293b',
          marginBottom: 4,
          marginTop: 0,
        }}>
          {otpSent ? 'Verification' : 'Register'}
        </h1>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: 28, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {phase === 1 && 'Step 1 of 3: General Info'}
          {phase === 2 && 'Step 2 of 3: Set Password'}
          {phase === 3 && !otpSent && 'Step 3 of 3: Details & Verification'}
          {phase === 3 && otpSent && `Verify OTP (${attemptsLeft} chances left)`}
        </p>

        {/* PHASE 1: Info */}
        {phase === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ marginBottom: 24, textAlign: 'left' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</label>
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
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

            <div style={{ marginBottom: 32, textAlign: 'left' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Occupation / Role</label>
              <select
                value={form.occupation}
                onChange={e => setForm({ ...form, occupation: e.target.value })}
                required
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: '1px solid #e2e8f0',
                  padding: '8px 0',
                  background: 'transparent',
                  color: form.occupation ? '#1e293b' : '#94a3b8',
                  fontSize: '0.9rem',
                  outline: 'none',
                  marginTop: 4,
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
                onFocus={e => e.target.style.borderBottomColor = '#f5a623'}
                onBlur={e => e.target.style.borderBottomColor = '#e2e8f0'}
              >
                <option value="" disabled style={{ color: '#94a3b8' }}>Select your role</option>
                <option value="student" style={{ color: '#1e293b' }}>Student</option>
                <option value="business_owner" style={{ color: '#1e293b' }}>Business Owner</option>
                <option value="entrepreneur" style={{ color: '#1e293b' }}>Entrepreneur</option>
                <option value="freelancer" style={{ color: '#1e293b' }}>Freelancer / Developer</option>
                <option value="other" style={{ color: '#1e293b' }}>Other</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextPhase}
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
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#e0951b'}
              onMouseLeave={e => e.currentTarget.style.background = '#f5a623'}
            >
              Next Step →
            </button>
          </div>
        )}

        {/* PHASE 2: Password */}
        {phase === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ marginBottom: 12, textAlign: 'left' }}>
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

            {/* Password strength indicators */}
            {form.password && (
              <div style={{ display: 'flex', gap: 4, marginTop: 4, marginBottom: 28 }}>
                {[1, 2, 3, 4].map(i => {
                  const strength = getStrength(form.password);
                  const isActive = strength >= i;
                  const color = strength === 1 ? '#ef4444' : strength === 2 ? '#f59e0b' : strength === 3 ? '#3b82f6' : '#10b981';
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 2,
                        background: isActive ? color : '#e2e8f0',
                        transition: 'background 0.3s',
                      }}
                    />
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button
                type="button"
                onClick={handlePrevPhase}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: 99,
                  background: 'transparent',
                  color: '#64748b',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNextPhase}
                style={{
                  flex: 1.5,
                  padding: '11px 0',
                  borderRadius: 99,
                  background: '#f5a623',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(245,166,35,0.2)',
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* PHASE 3: Details & Inline OTP */}
        {phase === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Phone Number Field */}
            <div style={{ marginBottom: 24, textAlign: 'left' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</label>
              <input
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                maxLength={10}
                onChange={e => {
                  const cleaned = e.target.value.replace(/\D/g, '');
                  setForm({ ...form, phone: cleaned });
                }}
                disabled={otpSent}
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: '1px solid #e2e8f0',
                  padding: '8px 0',
                  background: 'transparent',
                  color: otpSent ? '#94a3b8' : '#1e293b',
                  fontSize: '0.9rem',
                  outline: 'none',
                  marginTop: 4,
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderBottomColor = '#f5a623'}
                onBlur={e => e.target.style.borderBottomColor = '#e2e8f0'}
              />
              {!otpSent && (
                <div style={{ fontSize: '0.72rem', color: isPhoneValid ? '#10b981' : '#94a3b8', marginTop: 6, textAlign: 'right' }}>
                  {isPhoneValid ? '✓ Phone is valid' : 'Enter 10-digit number'}
                </div>
              )}
            </div>

            {/* Inline OTP Input Field (Revealed once registration submits and sends OTP) */}
            {otpSent && (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 0, animation: 'fade-in 0.3s ease' }}>
                <div style={{ marginBottom: 20, textAlign: 'left' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OTP</label>
                  <input
                    type="text"
                    placeholder="OTP"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{
                      width: '100%',
                      border: 'none',
                      borderBottom: '1px solid #e2e8f0',
                      padding: '8px 0',
                      background: 'transparent',
                      color: '#1e293b',
                      fontSize: '1.15rem',
                      fontWeight: 'bold',
                      letterSpacing: '0.3em',
                      textAlign: 'center',
                      outline: 'none',
                      marginTop: 4,
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderBottomColor = '#f5a623'}
                    onBlur={e => e.target.style.borderBottomColor = '#e2e8f0'}
                  />
                </div>
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
                >
                  {loading ? 'Verifying...' : 'Verify OTP & Enter Dashboard'}
                </button>
              </form>
            )}

            {/* Navigation buttons */}
            {!otpSent && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={handlePrevPhase}
                  style={{
                    flex: 1,
                    padding: '11px 0',
                    borderRadius: 99,
                    background: 'transparent',
                    color: '#64748b',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!isPhoneValid || loading}
                  style={{
                    flex: 1.5,
                    padding: '11px 0',
                    borderRadius: 99,
                    background: isPhoneValid ? '#f5a623' : '#e2e8f0',
                    color: isPhoneValid ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: isPhoneValid ? 'pointer' : 'not-allowed',
                    boxShadow: isPhoneValid ? '0 4px 14px rgba(245,166,35,0.2)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {loading ? 'Registering...' : 'Register & Send OTP'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Card Footer toggle back to login */}
        {!otpSent && (
          <div style={{ marginTop: 28, fontSize: '0.82rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#f5a623', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        )}
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
