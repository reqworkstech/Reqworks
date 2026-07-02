import React from 'react';

export default function GetStarted() {
  return (
    <section className="cta-section">
      <div className="cta-glow" />
      <div className="wrap">
        <div className="cta-box">

          <h2 className="h2" style={{ marginBottom: 16 }}>
            Turn Your Idea Into a{' '}
            <span className="grad-1">Live Product.</span>
          </h2>

          <p className="body-md" style={{ marginBottom: 36 }}>
            Join the queue today. Get an honest estimate, full visibility into development,
            and production-ready code — delivered on time.
          </p>

          <div className="cta-actions">
            <a
              href="/register"
              className="btn btn-primary"
              style={{ padding: '14px 32px', fontSize: '1rem' }}
            >
              Book Your Project
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="#projects"
              className="btn btn-ghost"
              style={{ padding: '14px 28px', fontSize: '1rem' }}
            >
              See Our Work
            </a>
          </div>

          <div className="cta-trust">
            {[
              'Free to apply',
              'No commitment',
              'Response within 24 hrs',
              '100% queue transparency',
            ].map((item, i) => (
              <div key={i} className="cta-trust-item">
                <div className="trust-dot" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
