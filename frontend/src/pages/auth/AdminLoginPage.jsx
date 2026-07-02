import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/ui/InputField';
import AuthVisual from '../../components/auth/AuthVisual';

const ADMIN_IMAGE = "/images/Admin.jpg";

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  
  const { loginAdmin, toast } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginAdmin(form);
      toast.success('Successfully logged into Admin dashboard!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Column - Form */}
      <div className="auth-left">
        
        <div className="auth-left-content">
          {/* Logo brand */}
          <Link to="/" className="auth-brand">
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '2px', background: '#fff' }}>
              <img src="/images/logo.png" alt="Reqworks" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            </div>
            <span className="auth-brand-name">Reqworks</span>
          </Link>

          <h1>Welcome Admin</h1>
          <p className="auth-sub">Access the admin control panel.</p>

          <form onSubmit={handleSubmit}>
            <InputField
              label="Email"
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            
            <InputField
              label="Password"
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />

            <button type="submit" className="btn-dark btn-full btn-admin" style={{ marginTop: 12 }} disabled={loading}>
              {loading ? <div className="spinner" /> : 'Enter Control Console →'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column - Illustration Panel */}
      <AuthVisual image={ADMIN_IMAGE} isAdmin={true} />
    </div>
  );
}
