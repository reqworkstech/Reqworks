import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PLATFORM_LINKS = [
  { label: 'Portal Showcase', href: '#projects' },
  { label: 'Process Workflow', href: '#flow' },
  { label: 'Core Features',     href: '#features' },
  { label: 'Project Blueprints', href: '#tech' },
  { label: 'Book Project',      href: '/register' },
];

const CONTACT_LINKS = [
  { label: 'reqworks.tech@gmail.com', href: 'mailto:reqworks.tech@gmail.com' },
  { label: 'WhatsApp Chat',          href: 'https://wa.me/916352834093' },
  { label: 'Privacy Policy',       href: '/privacy-policy' },
  { label: 'Terms of Service',     href: '/terms-of-service' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer style={{
      background: 'var(--bg-2)',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      padding: '80px 0 40px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="wrap">
        
        {/* Main Footer Content Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr 0.8fr 1.2fr',
          gap: '40px',
          marginBottom: '60px'
        }} className="footer-cols-grid">
          
          {/* Column 1: Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--primary-blue), #818cf8)',
                padding: '2px'
              }}>
                <img src="/images/logo.png" alt="Reqworks" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              </div>
              <span className="logo-text" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--t1)' }}>Reqworks</span>
            </div>
            
            <p style={{
              fontSize: '0.86rem',
              lineHeight: 1.6,
              color: 'var(--t2)',
              margin: 0
            }}>
              A transparent, queue-based development studio. We build custom dashboards, integrations, and web apps with live tracking and zero guesswork.
            </p>

            {/* Social Icons/Links */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
              {[
                { label: 'LinkedIn', href: 'https://www.linkedin.com/company/reqworks/' },
                { label: 'WhatsApp', href: 'https://wa.me/916352834093' },
                { label: 'Email', href: 'mailto:reqworks.tech@gmail.com' }
              ].map((soc, idx) => (
                <a
                  key={idx}
                  href={soc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--t3)',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-blue)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
                >
                  {soc.label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--t1)'
            }}>Platform</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0, margin: 0 }}>
              {PLATFORM_LINKS.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} style={{
                    fontSize: '0.86rem',
                    color: 'var(--t2)',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--t1)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--t2)'}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Legal Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--t1)'
            }}>Contact & Terms</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0, margin: 0 }}>
              {CONTACT_LINKS.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} style={{
                    fontSize: '0.86rem',
                    color: 'var(--t2)',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--t1)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--t2)'}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter SignUp */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--t1)'
            }}>Subscribe</h4>
            
            <p style={{
              fontSize: '0.86rem',
              lineHeight: 1.5,
              color: 'var(--t2)',
              margin: 0
            }}>
              Join our newsletter to receive case studies, project blueprint announcements, and stack updates.
            </p>

            <form onSubmit={handleSubscribe} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginTop: '4px'
            }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  background: 'var(--bg-3)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  fontSize: '0.85rem',
                  color: 'var(--t1)',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(60, 80, 224, 0.5)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
              />
              <button
                type="submit"
                className="btn btn-tail"
                style={{
                  padding: '10px 14px',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  boxShadow: 'none',
                  justifyContent: 'center'
                }}
              >
                {subscribed ? 'Subscribed ✓' : 'Subscribe'}
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar copyright & legal */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '32px',
          marginTop: '32px'
        }} className="footer-bottom-row">
          
          <span style={{ fontSize: '0.8rem', color: 'var(--t3)' }}>
            © {new Date().getFullYear()} Reqworks. All rights reserved.
          </span>

          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/privacy-policy" style={{ fontSize: '0.8rem', color: 'var(--t3)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--t2)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
            >Privacy Policy</Link>
            <Link to="/terms-of-service" style={{ fontSize: '0.8rem', color: 'var(--t3)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--t2)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
            >Terms of Service</Link>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 991px) {
          .footer-cols-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 36px !important;
          }
        }
        @media (max-width: 576px) {
          .footer-cols-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .footer-bottom-row {
            flex-direction: column !important;
            gap: 16px !important;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
