import React from 'react';
import { Link } from 'react-router-dom';
import { FaReact, FaNodeJs } from 'react-icons/fa';
import {
  SiMongodb, SiPostgresql, SiDjango, SiSpringboot
} from 'react-icons/si';

const BLUEPRINTS = [
  {
    id: 'mern',
    name: 'MERN Stack',
    accent: '#6ee7b7',
    tagline: 'Standard Modern Web Apps',
    desc: 'The industry standard for dynamic web applications, social platforms, and SaaS products. Fully JavaScript-based from front to back.',
    icons: [
      { Icon: FaReact, color: '#61dafb', name: 'React' },
      { Icon: FaNodeJs, color: '#68a063', name: 'Node.js' },
      { Icon: SiMongodb, color: '#47a248', name: 'MongoDB' },
    ],
    timeline: '1-2 Weeks',
    link: '/register?stack=mern'
  },
  {
    id: 'django-react',
    name: 'Django + React',
    accent: '#34d399',
    tagline: 'AI & Data-Heavy Systems',
    desc: 'Robust Python-backed architecture designed for machine learning platforms, admin-heavy backends, and precise data applications.',
    icons: [
      { Icon: FaReact, color: '#61dafb', name: 'React' },
      { Icon: SiDjango, color: '#092e20', name: 'Django' },
      { Icon: SiPostgresql, color: '#336791', name: 'Postgres' },
    ],
    timeline: '1-2 Weeks',
    link: '/register?stack=django-react'
  },
  {
    id: 'springboot-react',
    name: 'Spring Boot + React',
    accent: '#f89820',
    tagline: 'Enterprise-Grade Scale',
    desc: 'Heavy-duty enterprise framework built for maximum reliability, bulletproof security, and complex transactional microservices.',
    icons: [
      { Icon: FaReact, color: '#61dafb', name: 'React' },
      { Icon: SiSpringboot, color: '#6db33f', name: 'Spring' },
      { Icon: SiPostgresql, color: '#336791', name: 'Postgres' },
    ],
    timeline: '1-3 Weeks',
    link: '/register?stack=springboot-react'
  },
  {
    id: 'pern',
    name: 'PERN Stack',
    accent: '#3b82f6',
    tagline: 'Relational Javascript Apps',
    desc: 'The perfect alternative to MERN for apps requiring structured SQL relationships. Extremely reliable database model with full node logic.',
    icons: [
      { Icon: FaReact, color: '#61dafb', name: 'React' },
      { Icon: FaNodeJs, color: '#68a063', name: 'Node.js' },
      { Icon: SiPostgresql, color: '#336791', name: 'Postgres' },
    ],
    timeline: '2-3 Weeks',
    link: '/register?stack=pern'
  }
];

export default function FullStackProjects() {
  return (
    <section id="tech" style={{ padding: '60px 0', background: 'var(--bg-2)' }}>
      <div className="wrap">
        
        {/* Header */}
        <div className="sec-head">
          <div className="eyebrow">Project Blueprints</div>
          <h2 className="h2">Ready-To-Build Full Stack Stacks</h2>
          <p className="body-md">
            Select one of our core architectural frameworks. We handle the devops, auth, data model, and custom features.
          </p>
        </div>

        {/* Blueprint Grid */}
        <div className="blueprints-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24,
        }}>
          {BLUEPRINTS.map((bp) => (
            <div
              key={bp.id}
              className="blueprint-card"
              style={{
                background: 'var(--bg-3)',
                border: '1px solid var(--b1)',
                borderRadius: 20,
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = `${bp.accent}40`;
                e.currentTarget.style.boxShadow = `0 16px 36px rgba(0, 0, 0, 0.3), 0 0 20px ${bp.accent}12`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--b1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Colored Glow Accent at Top */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${bp.accent}, transparent)`,
              }} />

              {/* Top Section: Stack name + tagline */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--fd)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--t1)',
                      marginBottom: 4
                    }}>
                      {bp.name}
                    </h3>
                    <span style={{
                      fontFamily: 'var(--fm)',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: bp.accent,
                      letterSpacing: '0.08em',
                    }}>
                      {bp.tagline}
                    </span>
                  </div>

                  {/* Dev Timeline Badge */}
                  <span style={{
                    fontFamily: 'var(--fm)',
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    color: 'var(--t3)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--b2)',
                    padding: '3px 8px',
                    borderRadius: 99,
                  }}>
                    ⏱️ {bp.timeline}
                  </span>
                </div>

                {/* Description */}
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--t3)',
                  lineHeight: 1.6,
                  marginBottom: 20,
                  height: 60,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {bp.desc}
                </p>

                {/* Tech Logos Row */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
                  {bp.icons.map((ico, idx) => {
                    const IconComponent = ico.Icon;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          background: 'var(--bg-4)',
                          border: '1px solid var(--b2)',
                          borderRadius: 99,
                        }}
                      >
                        <IconComponent style={{ color: ico.color, fontSize: '0.9rem' }} />
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: 'var(--t2)',
                        }}>
                          {ico.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <Link
                to={bp.link}
                className="btn"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: 'var(--bg-4)',
                  color: 'var(--t2)',
                  border: '1px solid var(--b1)',
                  padding: '11px',
                  borderRadius: 10,
                  fontSize: '0.82rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = bp.accent;
                  e.currentTarget.style.color = '#0d1018';
                  e.currentTarget.style.borderColor = bp.accent;
                  e.currentTarget.style.boxShadow = `0 4px 12px ${bp.accent}33`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-4)';
                  e.currentTarget.style.color = 'var(--t2)';
                  e.currentTarget.style.borderColor = 'var(--b1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Order This Stack →
              </Link>

            </div>
          ))}

          {/* Many More Card */}
          <div
            className="blueprint-card"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px dashed var(--b2)',
              borderRadius: 20,
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.borderColor = 'var(--a1)';
              e.currentTarget.style.boxShadow = `0 16px 36px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 255, 209, 0.05)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--b2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div>
              <h3 style={{
                fontFamily: 'var(--fd)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--t1)',
                marginBottom: 4,
                marginTop: 8
              }}>
                And Many More...
              </h3>
              <span style={{
                fontFamily: 'var(--fm)',
                fontSize: '0.62rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--a1)',
                letterSpacing: '0.08em',
              }}>
                Custom Architectures
              </span>
              
              <p style={{
                fontSize: '0.8rem',
                color: 'var(--t3)',
                lineHeight: 1.6,
                marginTop: 20,
                marginBottom: 20,
              }}>
                Launching Soon, but if you have a specific stack in mind, let us know and we can build it for you.
              </p>
            </div>

            <Link
              to="/register?stack=custom"
              className="btn"
              style={{
                width: '100%',
                justifyContent: 'center',
                background: 'var(--bg-4)',
                color: 'var(--t2)',
                border: '1px dashed var(--b1)',
                padding: '11px',
                borderRadius: 10,
                fontSize: '0.82rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--a1)';
                e.currentTarget.style.color = '#0d1018';
                e.currentTarget.style.borderColor = 'var(--a1)';
                e.currentTarget.style.borderStyle = 'solid';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(110,231,183,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-4)';
                e.currentTarget.style.color = 'var(--t2)';
                e.currentTarget.style.borderColor = 'var(--b1)';
                e.currentTarget.style.borderStyle = 'dashed';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Request Custom Stack →
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
