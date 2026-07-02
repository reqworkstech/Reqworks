import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AuthVisual from '../../components/auth/AuthVisual';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification token.');
      return;
    }

    fetch(`/api/auth/verify-email/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          // Redirect to login after 4 seconds
          const timer = setTimeout(() => {
            navigate('/login?verified=true');
          }, 4000);
          return () => clearTimeout(timer);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. The link may have expired.');
        }
      })
      .catch(err => {
        console.error('Verify error:', err);
        setStatus('error');
        setMessage('Network error during verification. Please try again.');
      });
  }, [token, navigate]);

  return (
    <div className="auth-page">
      {/* Left Column - Content */}
      <div className="auth-left">
        <div className="auth-left-content" style={{ textAlign: 'center' }}>
          {/* Logo brand */}
          <Link to="/" className="auth-brand" style={{ justifyContent: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '2px', background: '#fff' }}>
              <img src="/images/logo.png" alt="Reqworks" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            </div>
            <span className="auth-brand-name">Reqworks</span>
          </Link>

          {status === 'verifying' && (
            <div style={{ marginTop: 20 }}>
              <div className="spinner spinner-dark" style={{ width: 40, height: 40, margin: '0 auto 24px' }} />
              <h1>Verifying Email...</h1>
              <p className="auth-sub">Checking token credentials with secure servers.</p>
            </div>
          )}

          {status === 'success' && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: '3rem', marginBottom: 20 }}>✨</div>
              <h1 style={{ color: 'var(--a1)' }}>Email Verified</h1>
              <p className="auth-sub" style={{ marginBottom: 24 }}>{message}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--t3)', marginBottom: 20 }}>
                Redirecting you to the workspace in a few seconds...
              </p>
              <Link to="/login?verified=true" className="btn-dark btn-full">
                Go to Login Now
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: '3rem', marginBottom: 20 }}>⚠️</div>
              <h1 style={{ color: 'var(--a4)' }}>Verification Failed</h1>
              <p className="auth-sub" style={{ marginBottom: 24 }}>{message}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link to="/register" className="btn-dark btn-full">
                  Register Again
                </Link>
                <Link to="/login" className="link-muted" style={{ fontSize: '0.82rem' }}>
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Illustration Panel */}
      <AuthVisual />
    </div>
  );
}
