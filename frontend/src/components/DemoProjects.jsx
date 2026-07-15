import React from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';

const getStackStyle = (stk) => {
  const normalized = stk.toLowerCase().replace(/[^a-z0-9]/g, '');
  switch (normalized) {
    case 'react':
      return { color: '#61DAFB', bg: 'rgba(97, 218, 251, 0.08)', border: 'rgba(97, 218, 251, 0.15)' };
    case 'tailwind':
    case 'tailwindcss':
      return { color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.08)', border: 'rgba(56, 189, 248, 0.15)' };
    case 'nodejs':
    case 'node':
      return { color: '#68A063', bg: 'rgba(104, 160, 99, 0.08)', border: 'rgba(104, 160, 99, 0.15)' };
    case 'mongodb':
      return { color: '#47A248', bg: 'rgba(71, 162, 72, 0.08)', border: 'rgba(71, 162, 72, 0.15)' };
    case 'django':
      return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.15)' };
    case 'python':
      return { color: '#3776AB', bg: 'rgba(55, 118, 171, 0.08)', border: 'rgba(55, 118, 171, 0.15)' };
    case 'postgresql':
    case 'postgres':
      return { color: '#336791', bg: 'rgba(51, 103, 145, 0.08)', border: 'rgba(51, 103, 145, 0.15)' };
    case 'flask':
      return { color: '#818CF8', bg: 'rgba(129, 140, 248, 0.08)', border: 'rgba(129, 140, 248, 0.15)' };
    case 'javascript':
    case 'js':
      return { color: '#F7DF1E', bg: 'rgba(247, 223, 30, 0.08)', border: 'rgba(247, 223, 30, 0.15)' };
    case 'html5':
    case 'html':
      return { color: '#E34F26', bg: 'rgba(227, 79, 38, 0.08)', border: 'rgba(227, 79, 38, 0.15)' };
    case 'css3':
    case 'css':
      return { color: '#1572B6', bg: 'rgba(21, 114, 182, 0.08)', border: 'rgba(21, 114, 182, 0.15)' };
    case 'commercejs':
      return { color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.08)', border: 'rgba(244, 63, 94, 0.15)' };
    default:
      return { color: '#CBD5E1', bg: 'rgba(255, 255, 255, 0.04)', border: 'rgba(255, 255, 255, 0.08)' };
  }
};

const PROJECTS = [
  {
    title: 'Flowgen',
    desc: 'MERN-based AI workflow automation engine. Build, visualize, and deploy complex backend workflows with drag-and-drop nodes in real-time.',
    stack: ['React', 'Tailwind', 'Node.js', 'MongoDB'],
    url: 'https://flowgen-one.vercel.app/'
  },
  {
    title: 'Joyspoon',
    desc: 'Premium D2C Indian mouth-freshener e-commerce platform designed to modernize healthy, hygienic, and traditional digestive habits.',
    stack: ['JavaScript', 'HTML5', 'CSS3', 'CommerceJS'],
    url: 'https://joyspoon-six.vercel.app/'
  },
  {
    title: 'Pantry To Plate',
    desc: 'Transform your kitchen leftovers instantly. Log ingredients in your virtual pantry and receive custom recipes optimized by AI models.',
    stack: ['Django', 'React', 'MongoDB', 'Python'],
    url: 'https://pantry-to-plate-ebon.vercel.app/'
  },
  {
    title: 'Capital Nest',
    desc: 'An intelligent stock portfolio companion. Track stocks, IPOs, and mutual funds in real-time with AI-powered charts and insights.',
    stack: ['Django', 'JavaScript', 'PostgreSQL', 'Python'],
    url: 'https://capitalnest-jlmq.onrender.com/'
  },
  {
    title: 'Meal Planner',
    desc: 'Smart meal prep and macro tracking software. Automate grocery list generation and track daily caloric intakes and nutrition metrics.',
    stack: ['Python', 'Flask', 'PostgreSQL', 'CSS3'],
    url: 'https://flask-demoenv.onrender.com/'
  }
];

export default function DemoProjects() {
  return (
    <section id="demo-projects" style={{
      padding: '40px 0',
      background: '#FFFFFF', // Light bg for clean contrast
      position: 'relative'
    }}>
      <div className="tail-grid-bg" />

      <div className="wrap" style={{ maxWidth: '1200px' }}>
        
        {/* Section Header */}
        <div className="sec-head" style={{ marginBottom: '40px' }}>
          <h2 className="h2" style={{ marginTop: '12px', marginBottom: '12px', color: '#1C2434' }}>
            Featured Shipped Applications
          </h2>
          <p className="body-md" style={{ maxWidth: '600px', margin: '0 auto', color: '#64748B' }}>
            Explore real applications built, deployed, and live-tracked through our client portals.
          </p>
        </div>

        {/* 3-Column Grid of Portrait Laptop Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }} className="projects-vertical-grid">
          {PROJECTS.map((proj, idx) => (
            <div
              key={idx}
              style={{
                background: '#181B27', // Dark navy background restored
                borderRadius: '24px',
                padding: '32px',
                color: '#FFFFFF',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                minHeight: '260px',
                textAlign: 'left',
                transition: 'all 0.3s ease'
              }}
              className="vertical-laptop-card"
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(60, 80, 224, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              {/* Top Section Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Link Circles */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
                  <a
                    href={proj.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      color: '#181B27',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.95rem',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <FaExternalLinkAlt />
                  </a>
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  margin: 0,
                  fontFamily: "'Inter', sans-serif"
                }}>{proj.title}</h3>

                {/* Description */}
                <p style={{
                  fontSize: '0.84rem',
                  lineHeight: 1.5,
                  color: '#94A3B8',
                  margin: 0,
                  minHeight: '66px',
                  fontFamily: "'Inter', sans-serif"
                }}>{proj.desc}</p>

                {/* Tech Stack Styled Badges */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginTop: '4px'
                }}>
                  {proj.stack.map((stk, sIdx) => {
                    const style = getStackStyle(stk);
                    return (
                      <div key={sIdx} style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        fontFamily: 'var(--fm)',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        background: style.bg,
                        border: `1px solid ${style.border}`,
                        color: style.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        {stk}
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 576px) {
          .projects-vertical-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
