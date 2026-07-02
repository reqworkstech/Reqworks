import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const { user, logout }          = useAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { label: 'Workflow', href: '#flow' },
    { label: 'Blueprints', href: '#tech' },
    { label: 'Features', href: '#features' },
    { label: 'Applications', href: '#demo-projects' },
  ];

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} style={{
        background: scrolled ? 'var(--g1)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--b1)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        padding: '8px 0',
      }}>
        <div className="navbar-inner" style={{ padding: '8px 24px' }}>

          {/* Left Logo + Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: 'linear-gradient(135deg, var(--primary-blue), #818cf8)',
                padding: '2px'
              }}>
                <img src="/images/logo.png" alt="Reqworks" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              </div>
              <span className="logo-text" style={{ fontSize: '1.2rem', fontWeight: 800, color: scrolled ? '#1C2434' : '#FFFFFF', transition: 'color 0.3s ease' }}>Reqworks</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <ul className="nav-links" style={{ listStyle: 'none', gap: '30px' }}>
            {navLinks.map(link => (
              <li key={link.label}>
                <a href={link.href} style={{
                  color: scrolled ? '#64748B' : '#E2E8F0',
                  fontWeight: 500,
                  fontSize: '0.88rem',
                  letterSpacing: '-0.01em',
                  transition: 'color 0.25s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.color = scrolled ? '#1C2434' : '#FFFFFF'}
                onMouseLeave={e => e.currentTarget.style.color = scrolled ? '#64748B' : '#E2E8F0'}
                >{link.label}</a>
              </li>
            ))}
          </ul>

          {/* Desktop Actions */}
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-tail-outline" style={{ padding: '8px 18px', fontSize: '0.82rem', borderRadius: 8 }}>
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="btn btn-tail"
                  style={{ padding: '8px 18px', fontSize: '0.82rem', borderRadius: 8, boxShadow: 'none' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost" style={{ padding: '8px 18px', fontSize: '0.82rem', border: 'none' }}>
                  Log In
                </Link>
                <Link to="/register" className="btn btn-tail" style={{ padding: '9px 20px', fontSize: '0.82rem', borderRadius: 8 }}>
                  Book Project
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span style={{
              transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
              background: 'var(--t1)',
            }} />
            <span style={{ opacity: menuOpen ? 0 : 1, background: 'var(--t1)' }} />
            <span style={{
              transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
              background: 'var(--t1)',
            }} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`} style={{ zIndex: 105, background: 'var(--bg)' }}>

        {/* Top Header Bar inside Mobile Menu */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '2px', background: 'linear-gradient(135deg, var(--primary-blue), #818cf8)' }}>
              <img src="/images/logo.png" alt="Reqworks" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            </div>
            <span className="logo-text">Reqworks</span>
          </Link>

          {/* Close button */}
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              background: 'var(--b2)', border: '1px solid var(--b1)',
              borderRadius: '50%', width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--t2)', fontSize: '1.2rem',
              transition: 'background 0.2s',
            }}
          >
            ×
          </button>
        </div>

        {/* Links Container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          marginTop: 100,
        }}>
          {navLinks.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                animationDelay: `${i * 60}ms`,
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--t2)',
                transition: 'color 0.2s',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginTop: 36,
          width: '100%',
          maxWidth: '280px',
          padding: '0 16px',
        }}>
          {user ? (
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              className="btn btn-tail"
              style={{ justifyContent: 'center', width: '100%', padding: '10px 16px', fontSize: '0.85rem', borderRadius: 8 }}
            >Sign Out</button>
          ) : (
            <>
              <Link to="/login" className="btn btn-tail-outline" onClick={() => setMenuOpen(false)} style={{ justifyContent: 'center', width: '100%', padding: '10px 16px', fontSize: '0.85rem', borderRadius: 8 }}>
                Log In
              </Link>
              <Link to="/register" className="btn btn-tail" onClick={() => setMenuOpen(false)} style={{ justifyContent: 'center', width: '100%', padding: '10px 16px', fontSize: '0.85rem', borderRadius: 8 }}>
                Book Project
              </Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

