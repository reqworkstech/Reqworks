import React from 'react';
import { Link } from 'react-router-dom';

const TECH_BADGES = [
  { name: 'React', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'Node.js', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
  { name: 'Python', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { name: 'Django', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg' },
  { name: 'Postgres', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
  { name: 'Spring', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg' },
  { name: 'Java', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
  { name: 'Tailwind', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
  { name: 'Figma', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
  { name: 'Github', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' }
];

export default function Hero() {
  return (
    <section className="hero" style={{
      padding: '100px 0 40px',
      position: 'relative',
      overflow: 'hidden',
      background: '#090B11', // Dark Background
      textAlign: 'center',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    }}>
      <div className="tail-grid-bg" style={{ opacity: 0.15 }} />
      
      {/* Centered subtle light leak gradient */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div className="wrap" style={{ position: 'relative', zIndex: 1, maxWidth: '1000px' }}>
        
        {/* Centered Heading */}
        <h1 style={{
          fontSize: 'clamp(2.2rem, 4.8vw, 3.8rem)',
          fontWeight: 700,
          color: '#FFFFFF', // White text
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          maxWidth: '850px',
          margin: '0 auto 24px',
          fontFamily: "'Inter', sans-serif",
          background: 'linear-gradient(135deg, #FFFFFF 0%, #E0E7FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          WE TURN YOUR IDEAS INTO SHIPPED PRODUCTS.
        </h1>

        {/* Centered Subtitle */}
        <p style={{
          fontSize: '0.98rem',
          lineHeight: 1.65,
          color: '#94A3B8', // Gray text
          maxWidth: '760px',
          margin: '0 auto 36px',
          fontFamily: "'Inter', sans-serif"
        }}>
          Reqworks is a transparent, queue-based development studio that provides teams with everything they need to create feature-rich back-ends, dashboards, and admin panels for web projects. Empowering developers with custom blueprints and live queue tracking.
        </p>

        {/* Tech Stack Round Icons Row */}
        <div className="hero-tech-row" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '40px',
          alignItems: 'center'
        }}>
          {TECH_BADGES.map((badge, idx) => (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              width: '66px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#FFFFFF', // Restored white background tech badges
                boxShadow: '0px 4px 10px rgba(166, 175, 195, 0.15)',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '11px',
                transition: 'transform 0.25s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <img src={badge.img} alt={badge.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <span style={{
                fontSize: '0.72rem',
                color: '#94A3B8',
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
                whiteSpace: 'nowrap'
              }}>{badge.name}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          marginBottom: '40px',
          alignItems: 'center'
        }} className="hero-actions">
          <a href="/register" className="btn btn-tail" style={{
            padding: '12px 28px',
            fontSize: '0.92rem',
            borderRadius: '8px',
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif"
          }}>
            Book Your Project
          </a>
          <Link to="/preview-lab" className="btn btn-tail-outline hero-explore-btn" style={{
            padding: '12px 28px',
            fontSize: '0.92rem',
            borderRadius: '8px',
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif"
          }}>
            Get Previews
          </Link>
        </div>

      </div>

      <style>{`
        .hero-explore-btn {
          background: #FFFFFF !important;
          border: 1px solid #FFFFFF !important;
          color: #3C50E0 !important;
        }
        .hero-explore-btn:hover {
          background: #F8FAFC !important;
          border-color: #F8FAFC !important;
          color: #2F40B8 !important;
        }
        
        /* Mobile Responsive - Keep Centered Layout Like Desktop */
        @media (max-width: 768px) {
          .hero {
            padding: 90px 0 50px !important;
            text-align: center !important;
          }
          
          .wrap {
            padding: 0 24px !important;
          }
          
          .hero h1 {
            font-size: 2.4rem !important;
            line-height: 1.15 !important;
            margin-bottom: 20px !important;
            font-weight: 800 !important;
          }
          
          .hero p {
            font-size: 0.82rem !important;
            line-height: 1.5 !important;
            margin-bottom: 32px !important;
            padding: 0 10px !important;
          }
          
          .hero-tech-row {
            gap: 14px !important;
            margin-bottom: 36px !important;
            padding: 0 10px !important;
          }
          
          .hero-tech-row > div {
            width: 58px !important;
          }
          
          .hero-tech-row > div > div {
            width: 44px !important;
            height: 44px !important;
            padding: 10px !important;
          }
          
          .hero-tech-row span {
            font-size: 0.68rem !important;
          }
          
          .hero-actions {
            flex-direction: column !important;
            gap: 12px !important;
            padding: 0 20px !important;
          }
          
          .hero-actions a {
            width: 100% !important;
            max-width: 400px !important;
            justify-content: center !important;
            padding: 14px 24px !important;
          }
        }
        
        @media (max-width: 576px) {
          .hero {
            padding: 80px 0 40px !important;
          }
          
          .wrap {
            padding: 0 20px !important;
          }
          
          .hero h1 {
            font-size: 2.1rem !important;
            line-height: 1.2 !important;
            font-weight: 800 !important;
          }
          
          .hero p {
            font-size: 0.78rem !important;
            line-height: 1.48 !important;
            padding: 0 !important;
          }
          
          .hero-tech-row {
            gap: 12px !important;
            padding: 0 !important;
          }
          
          .hero-tech-row > div {
            width: 54px !important;
          }
          
          .hero-tech-row > div > div {
            width: 42px !important;
            height: 42px !important;
            padding: 9px !important;
          }
          
          .hero-tech-row span {
            font-size: 0.65rem !important;
          }
          
          .hero-actions {
            padding: 0 !important;
          }
          
          .hero-actions a {
            padding: 13px 20px !important;
            font-size: 0.88rem !important;
          }
        }
        
        @media (max-width: 400px) {
          .hero h1 {
            font-size: 1.85rem !important;
            font-weight: 800 !important;
          }
          
          .hero p {
            font-size: 0.76rem !important;
          }
          
          .hero-tech-row > div {
            width: 52px !important;
          }
          
          .hero-tech-row > div > div {
            width: 40px !important;
            height: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
