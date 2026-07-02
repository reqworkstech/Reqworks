import React, { useState, useEffect } from 'react';

const PROCESS_CARDS = [
  { label: 'Submit Project', icon: '📋' },
  { label: 'Expert Review', icon: '🔍' },
  { label: 'Stack Assembly', icon: '⚡' },
  { label: 'Cloud Deploy', icon: '🚀' },
  { label: 'Launch Active', icon: '🟢' }
];

export default function AuthVisual({ image, isAdmin = false }) {
  const [angle, setAngle] = useState(0);
  const primaryAccent = isAdmin ? '#fbbf24' : '#6ee7b7'; // Golden amber for admin, mint for user

  useEffect(() => {
    let frameId;
    const updateAngle = () => {
      setAngle((prev) => (prev + 0.25) % 360);
      frameId = requestAnimationFrame(updateAngle);
    };
    frameId = requestAnimationFrame(updateAngle);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Ellipse radii for the orbit
  const Rx = 145; // Horizontal spread
  const Ry = 55;  // Vertical depth (creates 3D tilt perspective)

  // Find the front-most card (which has the largest y-coordinate/sin value)
  let maxSin = -2;
  let activeCardIdx = 0;
  PROCESS_CARDS.forEach((_, idx) => {
    const cardAngle = (angle + idx * 72) * (Math.PI / 180);
    const currentSin = Math.sin(cardAngle);
    if (currentSin > maxSin) {
      maxSin = currentSin;
      activeCardIdx = idx;
    }
  });

  return (
    <div className="auth-right" style={{ 
      background: 'var(--bg-2)', 
      position: 'relative', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      overflow: 'hidden',
      flexDirection: 'column',
      padding: '40px'
    }}>
      {/* Keyframes Injection */}
      <style>{`
        @keyframes phone-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes logo-pulse {
          0%, 100% { box-shadow: 0 0 15px ${primaryAccent}20; border-color: ${primaryAccent}; }
          50%       { box-shadow: 0 0 25px ${primaryAccent}45; border-color: #ffffff; }
        }
      `}</style>

      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at 50% 50%, ${isAdmin ? 'rgba(251,191,36,0.05)' : 'rgba(129,140,248,0.05)'} 0%, transparent 60%)`,
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Title Header */}
      <div style={{
        textAlign: 'center',
        zIndex: 3,
        position: 'absolute',
        top: 45
      }}>
        <span style={{
          fontFamily: 'var(--fm)',
          fontSize: '0.68rem',
          fontWeight: 700,
          color: primaryAccent,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          display: 'block',
          marginBottom: 8
        }}>
          {isAdmin ? 'Operations Dashboard' : 'The Reqworks Experience'}
        </span>
        <h2 style={{
          fontFamily: 'var(--fd)',
          fontSize: '1.3rem',
          color: 'var(--t1)',
          fontWeight: 800,
          maxWidth: '320px',
          margin: '0 auto',
          lineHeight: 1.3,
          letterSpacing: '-0.02em'
        }}>
          {isAdmin ? 'System Control Pipeline' : 'Project Lifecycle in 3D Motion'}
        </h2>
      </div>

      {/* Centered Orbit Workspace */}
      <div style={{
        position: 'relative',
        width: '380px',
        height: '380px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        marginTop: 20
      }}>
        
        {/* Central Mobile Phone Mockup (z-index is fixed at 10) */}
        <div style={{
          position: 'absolute',
          width: '150px',
          height: '255px',
          background: '#12141a',
          border: '8px solid #232731',
          borderRadius: '24px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          overflow: 'hidden',
          zIndex: 10, // Foreground cards will render at zIndex > 10, background cards at zIndex < 10
          animation: 'phone-float 6s ease-in-out infinite',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Top Speaker Slit Notch */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '70px',
            height: '12px',
            background: '#232731',
            borderRadius: '0 0 8px 8px',
            zIndex: 11
          }} />

          {/* Screen Content Wrapper */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            textAlign: 'center',
            gap: 14,
            height: '100%'
          }}>
            {/* Circular Glowing Logo */}
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: '#fff',
              border: `2px solid ${primaryAccent}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'logo-pulse 3.5s ease-in-out infinite',
              padding: '3px'
            }}>
              <img src="/images/logo.png" alt="RW" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            </div>

            {/* Slogan Text */}
            <div>
              <h3 style={{
                fontFamily: 'var(--fd)',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: 'var(--t1)',
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
                marginBottom: 4
              }}>
                One-Stop Solution
              </h3>
              <p style={{
                fontFamily: 'var(--fm)',
                fontSize: '0.5rem',
                color: 'var(--t3)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                REQWORKS PLATFORM
              </p>
            </div>
          </div>
        </div>

        {/* 3D Orbiting Process Card Divs */}
        {PROCESS_CARDS.map((card, idx) => {
          const cardAngle = (angle + idx * 72) * (Math.PI / 180);
          
          // Tracing positions on tilted elliptical path
          const x = Rx * Math.cos(cardAngle);
          const y = Ry * Math.sin(cardAngle);
          
          // Depth variables
          const sinVal = Math.sin(cardAngle); // Varies -1 to 1
          const scale = 0.86 + 0.14 * sinVal; // Foreground is larger (1.0), background is smaller (0.72)
          const opacity = 0.45 + 0.55 * ((sinVal + 1) / 2); // Foreground is fully opaque, background is faded
          const zIndex = Math.round(10 + 10 * sinVal); // Ranges 0 to 20. Phone is 10, creating realistic overlap!
          const blur = sinVal < 0 ? `${Math.abs(sinVal) * 1.5}px` : '0px'; // Background cards get slightly blurred

          const isActive = activeCardIdx === idx;

          return (
            <div
              key={idx}
              className="glass-card"
              style={{
                position: 'absolute',
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: `translate(-50%, -50%) scale(${scale})`,
                zIndex: zIndex,
                opacity: opacity,
                filter: `blur(${blur})`,
                transition: 'border-color 0.4s, color 0.4s',
                
                // Card styling details
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 'var(--r-sm)',
                border: `1.5px solid ${isActive ? primaryAccent : 'var(--b1)'}`,
                background: isActive ? (isAdmin ? 'rgba(251,191,36,0.1)' : 'rgba(110,231,183,0.1)') : 'rgba(24, 28, 36, 0.88)',
                boxShadow: isActive 
                  ? `0 12px 28px rgba(0,0,0,0.4), 0 0 16px ${primaryAccent}20` 
                  : '0 8px 20px rgba(0,0,0,0.3)',
                whiteSpace: 'nowrap',
                cursor: 'default'
              }}
            >
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>{card.icon}</span>
              <span style={{
                fontFamily: 'var(--fb)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: isActive ? 'var(--t1)' : 'var(--t2)',
                letterSpacing: '-0.01em'
              }}>
                {card.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dynamic Queue Status footer indicator */}
      <div style={{
        position: 'absolute',
        bottom: 50,
        fontFamily: 'var(--fm)',
        fontSize: '0.65rem',
        color: 'var(--t3)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        zIndex: 3
      }}>
        <span>3D ORBIT PATH</span>
        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--t4)' }} />
        <span style={{ color: 'var(--t2)' }}>CYCLES COMPLETED</span>
      </div>
    </div>
  );
}
