import React from 'react';
import { FaReact, FaNodeJs, FaTools, FaPlus, FaCogs } from 'react-icons/fa';
import { SiMongodb, SiPostgresql, SiDjango, SiSpringboot } from 'react-icons/si';

const BLUEPRINTS = [
  {
    id: 'mern',
    name: 'MERN Stack',
    tagline: 'Standard Modern Web Apps',
    desc: 'The industry standard for dynamic web applications, social platforms, and SaaS products. Fully JavaScript-based from front to back.',
    icons: [
      { Icon: FaReact, color: '#61dafb' },
      { Icon: FaNodeJs, color: '#68a063' },
      { Icon: SiMongodb, color: '#47a248' }
    ],
    timeline: '1-2 Weeks',
    active: true
  },
  {
    id: 'django-react',
    name: 'Django + React',
    tagline: 'AI & Data-Heavy Systems',
    desc: 'Robust Python-backed architecture designed for machine learning platforms, admin-heavy backends, and precise data applications.',
    icons: [
      { Icon: FaReact, color: '#61dafb' },
      { Icon: SiDjango, color: '#092e20' },
      { Icon: SiPostgresql, color: '#336791' }
    ],
    timeline: '1-2 Weeks',
    active: false
  },
  {
    id: 'springboot-react',
    name: 'Spring Boot + React',
    tagline: 'Enterprise-Grade Scale',
    desc: 'Heavy-duty enterprise framework built for maximum reliability, bulletproof security, and complex transactional microservices.',
    icons: [
      { Icon: FaReact, color: '#61dafb' },
      { Icon: SiSpringboot, color: '#6db33f' },
      { Icon: SiPostgresql, color: '#336791' }
    ],
    timeline: '1-3 Weeks',
    active: false
  },
  {
    id: 'pern',
    name: 'PERN Stack',
    tagline: 'Relational Javascript Apps',
    desc: 'The perfect alternative to MERN for apps requiring structured SQL relationships. Extremely reliable database model with full node logic.',
    icons: [
      { Icon: FaReact, color: '#61dafb' },
      { Icon: FaNodeJs, color: '#68a063' },
      { Icon: SiPostgresql, color: '#336791' }
    ],
    timeline: '2-3 Weeks',
    active: false
  },
  {
    id: 'custom',
    name: 'Custom Stack',
    tagline: 'personalized mix & match',
    desc: 'Mix and match components (e.g. Django + Vue, FastAPI + Svelte, Go + Angular). We fully customize the database, cache layers, message queues, and cloud pipelines.',
    icons: [
      { Icon: FaTools, color: '#64748B' },
      { Icon: FaPlus, color: '#3C50E0' },
      { Icon: FaCogs, color: '#64748B' }
    ],
    timeline: 'Custom',
    active: false
  }
];

export default function TechMarquee() {
  return (
    <section id="tech" style={{
      padding: '40px 0',
      background: '#FFFFFF', // Light background
      position: 'relative'
    }}>
      <div className="tail-grid-bg" />

      <div className="wrap">
        
        {/* Section Header */}
        <div className="sec-head" style={{ marginBottom: '40px' }}>
          <div className="eyebrow" style={{ color: 'var(--primary-blue)', display: 'inline-flex', alignItems: 'center' }}>
            Choose Your Stack
          </div>
          <h2 className="h2" style={{ marginTop: '12px', marginBottom: '16px', color: '#1C2434' }}>
            Select Your Project Blueprint
          </h2>
          <p className="body-md" style={{ maxWidth: '600px', margin: '0 auto', color: '#64748B' }}>
            Select one of our core architectural frameworks. We handle the devops, auth, data model, and custom features.
          </p>
        </div>

        {/* Blueprint Selector Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px'
        }} className="frameworks-grid">
          {BLUEPRINTS.map((bp) => (
            <div
              key={bp.id}
              style={{
                background: '#FFFFFF',
                border: bp.active ? '1px solid rgba(60, 80, 224, 0.4)' : '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '32px 24px',
                textAlign: 'center',
                boxShadow: bp.active ? '0 10px 30px rgba(60, 80, 224, 0.08)' : '0 6px 16px rgba(166, 175, 195, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(60, 80, 224, 0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = bp.active ? 'rgba(60, 80, 224, 0.4)' : '#E2E8F0';
              }}
            >
              {/* Dev Timeline Badge */}
              <span style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                fontSize: '0.62rem',
                fontWeight: 700,
                color: 'var(--primary-blue)',
                background: 'rgba(60, 80, 224, 0.06)',
                padding: '2px 8px',
                borderRadius: '99px',
                fontFamily: 'var(--fm)'
              }}>⏱️ {bp.timeline}</span>

              {/* Stack Circles */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '24px',
                marginTop: '12px'
              }}>
                {bp.icons.map((ico, idx) => {
                  const Icon = ico.Icon;
                  return (
                    <div key={idx} style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 10px rgba(166, 175, 195, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      color: ico.color
                    }}>
                      <Icon />
                    </div>
                  );
                })}
              </div>

              {/* Title */}
              <div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#1C2434', // Dark charcoal text
                  marginBottom: '4px'
                }}>{bp.name}</h3>
                
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--primary-blue)',
                  letterSpacing: '0.05em',
                  marginBottom: '16px'
                }}>{bp.tagline}</span>
              </div>

              {/* Description */}
              <p style={{
                fontSize: '0.86rem',
                lineHeight: 1.65,
                color: '#64748B', // Slate gray text
                marginBottom: '24px',
                minHeight: '66px'
              }}>{bp.desc}</p>

              {/* Button */}
              <a
                href={`/register?stack=${bp.id}`}
                className={bp.active ? "btn btn-tail" : "btn btn-tail-outline"}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.85rem'
                }}
              >
                {bp.id === 'custom' ? 'Create Custom Stack' : 'Select Stack'}
              </a>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 576px) {
          .frameworks-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
