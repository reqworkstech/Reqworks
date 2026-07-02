import React, { useState, useEffect } from 'react';

const FEATURES = [
  { title: 'Real-Time Queue Tracking' },
  { title: 'Instant Budget Estimation' },
  { title: 'Instant Email Alerts' },
  { title: 'Secure & Scalable Builds' },
  { title: 'Rapid Sprint Delivery' },
  { title: 'Pristine Code Architecture' },
  { title: 'Custom Developer Portal' }
];

export default function Features() {
  const [activeIndex, setActiveIndex] = useState(3); // Start with middle active

  // Auto scroll ticker every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % FEATURES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const itemHeight = 56; // Clean vertical height for each item
  const viewportHeight = itemHeight * 7; // Viewport height to show all 7 items

  return (
    <section id="features" style={{
      padding: '40px 0', // Compact section
      background: '#000000', // Solid black background
      color: '#FFFFFF',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="wrap" style={{ maxWidth: '900px' }}>
        
        {/* Split 2-Column Section Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '40px',
          alignItems: 'center'
        }} className="split-features-layout">
          
          {/* Left Column: Vertical Scrolling 7 Names Stepper */}
          <div style={{
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: `${viewportHeight}px`,
            position: 'relative'
          }}>
            {/* Viewport Mask for scrolling text */}
            <div style={{
              height: `${viewportHeight}px`,
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              {/* Vertical Scroll List Container */}
              <div style={{
                // Offset by viewport center (3 * itemHeight) minus activeIndex * itemHeight
                transform: `translateY(${(3 * itemHeight) - activeIndex * itemHeight}px)`,
                transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {FEATURES.map((feat, idx) => {
                  const isActive = activeIndex === idx;
                  const distance = Math.abs(activeIndex - idx);
                  
                  let color = '#334155'; // Faded gray for distant items
                  let fontSize = '1.1rem';
                  let opacity = 0.15;
                  let fontWeight = 600;
                  let scale = 0.9;

                  if (isActive) {
                    color = '#10B981'; // Bright green highlight at the center
                    fontSize = '1.9rem';
                    opacity = 1;
                    fontWeight = 800;
                    scale = 1.05;
                  } else if (distance === 1) {
                    color = '#64748B'; // Muted silver for adjacent items
                    fontSize = '1.4rem';
                    opacity = 0.45;
                    fontWeight = 700;
                    scale = 0.98;
                  } else if (distance === 2) {
                    color = '#475569';
                    fontSize = '1.2rem';
                    opacity = 0.25;
                    fontWeight = 600;
                    scale = 0.92;
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      style={{
                        height: `${itemHeight}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        color: color,
                        fontSize: fontSize,
                        fontWeight: fontWeight,
                        opacity: opacity,
                        transform: `scale(${scale})`,
                        transformOrigin: 'left center',
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        fontFamily: "'Inter', sans-serif",
                        letterSpacing: '-0.02em'
                      }}
                    >
                      {feat.title}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Compact Illustration Image */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} className="features-illustration-column">
            <img
              src="/images/illustration.png"
              alt="Reqworks Features Illustration"
              style={{
                width: '100%',
                maxWidth: '300px', // Minimized illustration size
                height: 'auto',
                display: 'block'
              }}
            />
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .split-features-layout {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .split-features-layout > div {
            align-items: center !important;
            text-align: center !important;
            height: auto !important;
          }
          .split-features-layout div div {
            justify-content: center !important;
          }
        }
      `}</style>
    </section>
  );
}
