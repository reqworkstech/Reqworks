import React from 'react';

const SERVICES = [
  {
    image: '/images/11.jpeg',
    service: 'Portfolio Websites',
    emoji: '🎓',
    title: 'Students',
    desc: 'Showcase your academic projects, coding profiles, and resume hubs to kickstart your professional tech career.'
  },
  {
    image: '/images/22.jpeg',
    service: 'Landing Pages',
    emoji: '🚀',
    title: 'Creators',
    desc: 'Launch high-converting pages for newsletters, personal brands, course signups, and digital product campaigns.'
  },
  {
    image: '/images/33.jpeg',
    service: 'Portfolio Websites',
    emoji: '👨‍🎨',
    title: 'Freelancers',
    desc: 'Stunning personal portfolio galleries and interactive resume hubs engineered to win client contracts.'
  },
  {
    image: '/images/44.jpeg',
    service: 'SaaS MVP Development',
    emoji: '⚡',
    title: 'Startups',
    desc: 'Validate your core concepts fast with a secure, highly scalable minimum viable product built for real users.'
  },
  {
    image: '/images/55.jpeg',
    service: 'Custom Web Apps',
    emoji: '⚙️',
    title: 'Business',
    desc: 'Bespoke corporate management dashboards, client portals, and custom workflows to automate business operations.'
  }
];

const TICKER_ROW_1 = [
  { name: 'Business Websites', active: true },
  { name: 'SaaS MVP Development', active: true },
  { name: 'Custom Web Applications', active: false },
  { name: 'E-Commerce Solutions', active: true },
  { name: 'Workflow Automation', active: false },
  { name: 'Client Portals', active: true }
];

const TICKER_ROW_2 = [
  { name: 'Portfolio Websites', active: true },
  { name: 'Landing Pages', active: false },
  { name: 'AI-Powered Solutions', active: true },
  { name: 'Custom Software Solutions', active: true },
  { name: 'Admin Dashboards', active: false },
  { name: 'Internal Operations Tools', active: true }
];

export default function ServicesShowcase() {
  return (
    <section id="services" style={{
      padding: '40px 0',
      background: '#FFFFFF', // Light background
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="tail-grid-bg" />

      <div className="wrap" style={{ maxWidth: '1200px', position: 'relative', zIndex: 1 }}>
        
        {/* Section Header */}
        <div className="sec-head" style={{ marginBottom: '48px' }}>
          <h2 className="h2" style={{ marginTop: '12px', marginBottom: '16px', color: '#1C2434' }}>
            Our 5 Targeted Audiences
          </h2>
          <p className="body-md" style={{ maxWidth: '600px', margin: '0 auto', color: '#64748B' }}>
            Bespoke full-stack digital architectures custom-tailored for specific profiles and operational scales.
          </p>
        </div>

        {/* 3-on-top, 2-on-bottom centered grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '24px',
          marginBottom: '80px'
        }} className="audience-grid">
          
          {/* Card 1: Students */}
          <div style={{ gridColumn: 'span 2' }} className="audience-card-wrapper">
            <AudienceCard srv={SERVICES[0]} />
          </div>

          {/* Card 2: Creators */}
          <div style={{ gridColumn: 'span 2' }} className="audience-card-wrapper">
            <AudienceCard srv={SERVICES[1]} />
          </div>

          {/* Card 3: Freelancers */}
          <div style={{ gridColumn: 'span 2' }} className="audience-card-wrapper">
            <AudienceCard srv={SERVICES[2]} />
          </div>

          {/* Card 4: Startups - Centered on Second Row */}
          <div style={{ gridColumn: '2 / span 2' }} className="audience-card-wrapper card-row-2">
            <AudienceCard srv={SERVICES[3]} />
          </div>

          {/* Card 5: Business - Centered on Second Row */}
          <div style={{ gridColumn: '4 / span 2' }} className="audience-card-wrapper card-row-2">
            <AudienceCard srv={SERVICES[4]} />
          </div>

        </div>

        {/* Marquee Ticker Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          {/* Row 1: Right to Left */}
          <div style={{ overflow: 'hidden', display: 'flex', width: '100%' }}>
            <div style={{
              display: 'flex',
              gap: '16px',
              whiteSpace: 'nowrap',
              animation: 'scroll-left 30s linear infinite',
              width: 'max-content'
            }}>
              {[...TICKER_ROW_1, ...TICKER_ROW_1].map((pill, idx) => (
                <PillBadge key={idx} pill={pill} />
              ))}
            </div>
          </div>

          {/* Row 2: Left to Right */}
          <div style={{ overflow: 'hidden', display: 'flex', width: '100%' }}>
            <div style={{
              display: 'flex',
              gap: '16px',
              whiteSpace: 'nowrap',
              animation: 'scroll-right 30s linear infinite',
              width: 'max-content'
            }}>
              {[...TICKER_ROW_2, ...TICKER_ROW_2].map((pill, idx) => (
                <PillBadge key={idx} pill={pill} />
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Styled Keyframes inside inline style element */}
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @media (max-width: 991px) {
          .audience-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .audience-card-wrapper {
            grid-column: span 6 !important;
          }
          .card-row-2 {
            grid-column: span 6 !important;
          }
        }
      `}</style>
    </section>
  );
}

// Sub-component for clean audience cards containing only Image, Tag, Title, Para, Button
function AudienceCard({ srv }) {
  return (
    <div
      style={{
        background: '#FFFFFF', // Light card background
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 6px 18px rgba(166, 175, 195, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        textAlign: 'left'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.borderColor = 'rgba(60, 80, 224, 0.3)';
        e.currentTarget.style.boxShadow = '0 16px 36px rgba(166, 175, 195, 0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#E2E8F0';
        e.currentTarget.style.boxShadow = '0 6px 18px rgba(166, 175, 195, 0.05)';
      }}
    >
      {/* Top Screenshot */}
      <div style={{
        background: '#F8FAFC',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '20px',
        border: '1px solid #F1F5F9',
        position: 'relative'
      }}>
        <img
          src={srv.image}
          alt={srv.title}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block'
          }}
        />
      </div>

      {/* Target Service Tag styled as a premium pill badge */}
      <div style={{
        marginBottom: '14px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(60, 80, 224, 0.05)',
        border: '1px solid rgba(60, 80, 224, 0.12)',
        borderRadius: '6px',
        padding: '4px 10px',
        width: 'fit-content'
      }}>
        <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>{srv.emoji}</span>
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 750,
          color: 'var(--primary-blue)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>{srv.service}</span>
      </div>

      {/* Title is the Targeted Audience (Students, Creators, Freelancers, Startups, Business) */}
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: '#1C2434', // Dark title
        marginBottom: '10px',
        fontFamily: "'Inter', sans-serif",
        lineHeight: 1.3
      }}>{srv.title}</h3>

      {/* Shortened Paragraph Description */}
      <p style={{
        fontSize: '0.84rem',
        lineHeight: 1.55,
        color: '#64748B', // Gray desc
        marginBottom: '24px',
        minHeight: '60px'
      }}>{srv.desc}</p>

      {/* Action Button */}
      <a
        href="/register"
        className="btn btn-tail"
        style={{
          width: '100%',
          justifyContent: 'center',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: 'none',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        Select Blueprint →
      </a>
    </div>
  );
}

// Sub-component for ticker pill badges
function PillBadge({ pill }) {
  return (
    <div
      style={{
        padding: '10px 24px',
        borderRadius: '99px',
        fontSize: '0.85rem',
        fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
        transition: 'all 0.3s ease',
        background: pill.active ? 'rgba(60, 80, 224, 0.05)' : '#FFFFFF',
        color: pill.active ? 'var(--primary-blue)' : '#64748B',
        border: pill.active ? '1px solid rgba(60, 80, 224, 0.3)' : '1px solid #E2E8F0',
        boxShadow: pill.active ? '0 4px 12px rgba(60, 80, 224, 0.1)' : '0 2px 6px rgba(166, 175, 195, 0.03)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'default'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--primary-blue)';
        e.currentTarget.style.color = 'var(--primary-blue)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = pill.active ? 'rgba(60, 80, 224, 0.3)' : '#E2E8F0';
        e.currentTarget.style.color = pill.active ? 'var(--primary-blue)' : '#64748B';
      }}
    >
      {pill.active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />}
      {pill.name}
    </div>
  );
}
