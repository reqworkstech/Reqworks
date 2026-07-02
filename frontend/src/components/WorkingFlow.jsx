import React from 'react';

const STEPS = [
  {
    num: '01',
    badge: 'Kickoff',
    title: 'Submit Requirements',
    desc: 'Fill out our brief details — features, stack preferences, target timeline & budget. It takes under 5 minutes.',
    color: '#6366F1', // Indigo
    bg: 'rgba(99, 102, 241, 0.04)',
    badgeBg: 'rgba(99, 102, 241, 0.08)',
    shadow: 'rgba(99, 102, 241, 0.15)'
  },
  {
    num: '02',
    badge: 'Review',
    title: 'Expert Analysis',
    desc: 'Our engineering lead reviews your brief and responds with a detailed proposal & cost estimate within 24 hours.',
    color: '#0EA5E9', // Sky Blue
    bg: 'rgba(14, 165, 233, 0.04)',
    badgeBg: 'rgba(14, 165, 233, 0.08)',
    shadow: 'rgba(14, 165, 233, 0.15)'
  },
  {
    num: '03',
    badge: 'Queue Entry',
    title: 'Enter Live Queue',
    desc: 'Approve the proposal. Receive confirmation and watch your slot appear instantly in our public active build queue.',
    color: '#10B981', // Emerald Green
    bg: 'rgba(16, 185, 129, 0.04)',
    badgeBg: 'rgba(16, 185, 129, 0.08)',
    shadow: 'rgba(16, 185, 129, 0.15)'
  },
  {
    num: '04',
    badge: 'Development',
    title: 'Structured Sprints',
    desc: 'We start building immediately. Check your client dashboard anytime to track milestones and review code outputs.',
    color: '#F59E0B', // Amber Gold
    bg: 'rgba(245, 158, 11, 0.04)',
    badgeBg: 'rgba(245, 158, 11, 0.08)',
    shadow: 'rgba(245, 158, 11, 0.15)'
  },
  {
    num: '05',
    badge: 'Handoff',
    title: 'Production Launch',
    desc: 'Delivered with complete documentation, code repository ownership transfer, and live deployment configuration.',
    color: '#F43F5E', // Rose Red
    bg: 'rgba(244, 63, 94, 0.04)',
    badgeBg: 'rgba(244, 63, 94, 0.08)',
    shadow: 'rgba(244, 63, 94, 0.15)'
  }
];

export default function WorkingFlow() {
  return (
    <section id="flow" style={{
      padding: '40px 0',
      background: '#090B11', // Dark background
      position: 'relative',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    }}>
      <div className="tail-grid-bg" style={{ opacity: 0.15 }} />

      <div className="wrap">
        
        {/* Section Header */}
        <div className="sec-head" style={{ marginBottom: '48px' }}>
          <h2 className="h2" style={{ marginTop: '12px', marginBottom: '16px', color: '#FFFFFF' }}>
            From Brief to Live Delivery
          </h2>
          <p className="body-md" style={{ maxWidth: '600px', margin: '0 auto', color: '#94A3B8' }}>
            A structured, transparent 5-step process designed to eliminate guesswork, delays, and communication barriers.
          </p>
        </div>

        {/* Steps Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '20px',
          position: 'relative',
        }} className="flow-grid">
          {STEPS.map((step, idx) => (
            <div key={idx} style={{
              background: '#181B27', // Dark card
              border: `1px solid rgba(255, 255, 255, 0.08)`,
              borderRadius: '16px',
              padding: '32px 24px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = step.color;
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = `0 12px 30px ${step.shadow}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
            }}
            >
              {/* Step indicator */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '28px'
              }}>
                {/* Large Colorful Step Number */}
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: step.color,
                  lineHeight: 1
                }}>{step.num}</span>

                {/* Soft Colorful Badge */}
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: step.color,
                  background: step.badgeBg,
                  padding: '4px 12px',
                  borderRadius: '99px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}>{step.badge}</span>
              </div>

              {/* Step title */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                <h3 style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#FFFFFF', // White text
                  marginBottom: '12px',
                  lineHeight: 1.35
                }}>{step.title}</h3>
                
                <p style={{
                  fontSize: '0.84rem',
                  lineHeight: 1.6,
                  color: '#94A3B8', // Gray desc
                  margin: 0
                }}>{step.desc}</p>
              </div>

              {/* Soft decorative bottom colored bar */}
              <div style={{
                height: '4px',
                width: '40px',
                background: step.color,
                borderRadius: '99px',
                marginTop: '24px',
                opacity: 0.8
              }} />

            </div>
          ))}
        </div>

      </div>

      <style>{`
        .flow-grid {
          grid-template-columns: repeat(5, 1fr);
        }
        @media (max-width: 991px) {
          .flow-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 20px !important;
          }
        }
        @media (max-width: 768px) {
          .flow-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .flow-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
