import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user, setUser, toast } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [tempEmail, setTempEmail] = useState('');

  const handleTextChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const clean = e.target.value.replace(/\D/g, '');
    if (clean.length <= 10) {
      setForm({ ...form, phone: clean });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    if (!form.email.trim()) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (form.phone && form.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setUser(data.user);
      toast.success(data.message);

      // If email changed, show OTP input block
      if (!data.user.isEmailVerified) {
        setTempEmail(form.email);
        setShowOtpInput(true);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP code.');
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tempEmail, otp })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'OTP Verification failed');
      }

      toast.success('Email successfully verified!');
      setUser(prev => ({ ...prev, isEmailVerified: true }));
      setShowOtpInput(false);
      setOtp('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '640px' }}>
      
      <div>
        <h2 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '2rem', fontWeight: 700, margin: 0 }}>
          Profile Settings
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', marginTop: '6px' }}>
          Manage your account information and contact details.
        </p>
      </div>

      {showOtpInput && (
        <div className="dash-card animate-fade-in" style={{ borderLeft: '4px solid var(--dash-warning)', background: 'var(--dash-card-sec)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertCircle size={20} style={{ color: 'var(--dash-warning)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.92rem', fontWeight: 700 }}>Email Verification Required</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: 'var(--dash-text-sec)', lineHeight: 1.5 }}>
                You have updated your email address to <strong>{tempEmail}</strong>. Please enter the 6-digit verification OTP sent to your new inbox.
              </p>
              
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                  type="text"
                  maxLength={6}
                  placeholder="OTP Code"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="dash-input"
                  style={{ width: '120px', padding: '8px 12px', fontSize: '1rem', letterSpacing: '0.2em', textAlign: 'center', margin: 0 }}
                  required
                />
                <button 
                  type="submit" 
                  disabled={verifyingOtp}
                  className="dash-btn dash-btn-primary" 
                  style={{ padding: '9px 18px', fontSize: '0.82rem', margin: 0 }}
                >
                  {verifyingOtp ? (
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    'Verify Email'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="dash-card">
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="dash-input-group">
            <label className="dash-label">
              <User size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Full Name
            </label>
            <input 
              type="text"
              name="name"
              value={form.name}
              onChange={handleTextChange}
              className="dash-input"
              required
            />
          </div>

          <div className="dash-input-group">
            <label className="dash-label">
              <Mail size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email"
                name="email"
                value={form.email}
                onChange={handleTextChange}
                className="dash-input"
                required
              />
              {user?.isEmailVerified ? (
                <span style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  fontSize: '0.72rem', 
                  color: 'var(--dash-success)', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <CheckCircle2 size={12} /> Verified
                </span>
              ) : (
                <span style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  fontSize: '0.72rem', 
                  color: 'var(--dash-warning)', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <AlertCircle size={12} /> Unverified
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
              Note: Changing your email address will require re-verification of the new inbox.
            </span>
          </div>

          <div className="dash-input-group">
            <label className="dash-label">
              <Phone size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Phone Number
            </label>
            <input 
              type="tel"
              name="phone"
              maxLength={10}
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChange={handlePhoneChange}
              className="dash-input"
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
              Must be exactly 10 digits.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'var(--dash-card-sec)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--dash-text-sec)' }}>
            <Shield size={14} style={{ flexShrink: 0 }} />
            <span>Isolated Security: Profile details are secured in your session. No other users can access this record.</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button 
              type="submit" 
              disabled={loading}
              className="dash-btn dash-btn-primary"
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
