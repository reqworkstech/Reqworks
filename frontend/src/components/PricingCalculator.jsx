import React, { useState, useEffect } from 'react';

// Base prices per tier
const TIERS = [
  { id: 'mvp',        label: 'MVP',          sub: 'Core features only',     base: 1200,  time: 14 },
  { id: 'pro',        label: 'Professional', sub: 'Full-featured product',  base: 3500,  time: 30 },
  { id: 'enterprise', label: 'Enterprise',   sub: 'Scalable & complex',     base: 7500,  time: 60 },
];

const FEATURES = [
  { id: 'admin',     label: 'Admin Dashboard',        addMin: 400,  addMax: 800,  days: 5,  icon: '🗂️' },
  { id: 'email_alerts', label: 'Instant Email Alerts',      addMin: 150,  addMax: 300,  days: 2,  icon: '📧' },
  { id: 'realtime',  label: 'Real-Time Queue View',    addMin: 200,  addMax: 450,  days: 4,  icon: '📊' },
  { id: 'multilang', label: 'Multi-Language Support',  addMin: 350,  addMax: 700,  days: 6,  icon: '🌐' },
  { id: 'api',       label: 'Custom API Integrations', addMin: 300,  addMax: 600,  days: 5,  icon: '🔌' },
  { id: 'auth',      label: 'Auth System Included',    addMin: 200,  addMax: 350,  days: 3,  icon: '🔒' },
];

function animateNumber(from, to, duration, setter) {
  const start = performance.now();
  const tick = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    setter(Math.round(from + (to - from) * eased));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export default function PricingCalculator() {
  const [tierIdx,   setTierIdx]   = useState(1);
  const [selected,  setSelected]  = useState(new Set(['auth']));
  const [dispMin,   setDispMin]   = useState(0);
  const [dispMax,   setDispMax]   = useState(0);
  const [dispDays,  setDispDays]  = useState(0);

  const tier = TIERS[tierIdx];

  // Calculate totals
  const totals = (() => {
    let min = tier.base;
    let max = tier.base + Math.round(tier.base * 0.4);
    let days = tier.time;
    FEATURES.forEach(f => {
      if (selected.has(f.id)) {
        min  += f.addMin;
        max  += f.addMax;
        days += f.days;
      }
    });
    return { min, max, days };
  })();

  // Animate numbers on change
  useEffect(() => {
    animateNumber(dispMin, totals.min, 500, setDispMin);
    animateNumber(dispMax, totals.max, 500, setDispMax);
    animateNumber(dispDays,totals.days,400, setDispDays);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totals.min, totals.max, totals.days]);

  const timelinePercent = Math.min((dispDays / 90) * 100, 100);

  const toggleFeature = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const activeFeatures = FEATURES.filter(f => selected.has(f.id));

  return (
    <section id="pricing" className="pricing-section">
      <div className="wrap">

        <div className="sec-head">
          <div className="eyebrow">Pricing</div>
          <h2 className="h2">Custom & Affordable</h2>
          <p className="body-md">
            No fixed packages. Configure exactly what you need and get a transparent estimate — instantly.
          </p>
        </div>

        <div className="pricing-grid">

          {/* ── Left: Controls ── */}
          <div className="pricing-controls">

            {/* Project Scale */}
            <div className="pricing-scale-label">Project Scale</div>
            <div className="scale-buttons">
              {TIERS.map((t, i) => (
                <button
                  key={t.id}
                  className={`scale-btn${i === tierIdx ? ' active' : ''}`}
                  onClick={() => setTierIdx(i)}
                >
                  <div style={{ fontWeight: 700, marginBottom: 1 }}>{t.label}</div>
                  <div style={{ fontSize: '0.68rem', color: i === tierIdx ? 'var(--t3)' : 'var(--t4)', fontWeight: 400 }}>
                    {t.sub}
                  </div>
                </button>
              ))}
            </div>

            {/* Feature Toggles */}
            <div className="feature-toggles-label" style={{ marginTop: 28 }}>
              Add-On Features
            </div>
            <div className="feature-toggles">
              {FEATURES.map(f => {
                const on = selected.has(f.id);
                return (
                  <button
                    key={f.id}
                    className={`feature-toggle${on ? ' on' : ''}`}
                    onClick={() => toggleFeature(f.id)}
                  >
                    <div className="toggle-checkbox">
                      {on && '✓'}
                    </div>
                    <span style={{ fontSize: '1rem' }}>{f.icon}</span>
                    <span className="toggle-name">{f.label}</span>
                    <span className="toggle-add">
                      {on ? `+$${f.addMin.toLocaleString()}` : `+$${f.addMin.toLocaleString()}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right: Result ── */}
          <div className="pricing-result">

            <div className="pricing-result-label">Estimated Range</div>
            <div className="price-display">
              ${dispMin.toLocaleString()}
              <span style={{ color: 'var(--t3)', fontSize: '1.8rem', fontWeight: 600 }}>
                {' '}– ${dispMax.toLocaleString()}
              </span>
            </div>
            <div className="price-range-label">
              Based on {tier.label} scale + {selected.size} add-on{selected.size !== 1 ? 's' : ''}
            </div>

            {/* Timeline */}
            <div className="timeline-bar-wrap">
              <div className="timeline-label">
                <span>Estimated Timeline</span>
                <span style={{ color: 'var(--t1)', fontWeight: 700 }}>{dispDays} days</span>
              </div>
              <div className="timeline-bar">
                <div
                  className="timeline-fill"
                  style={{ width: `${timelinePercent}%` }}
                />
              </div>
            </div>

            {/* Breakdown */}
            <div className="price-breakdown">
              <div className="breakdown-item">
                <div className="breakdown-check">✓</div>
                <span>{tier.label} scope — {tier.label === 'MVP' ? 'core features, fast turnaround' : tier.label === 'Professional' ? 'full product with polished UI' : 'complex, scalable architecture'}</span>
              </div>
              {activeFeatures.map(f => (
                <div key={f.id} className="breakdown-item">
                  <div className="breakdown-check">✓</div>
                  <span>{f.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--a1)', fontFamily: 'var(--fm)' }}>
                    +${f.addMin.toLocaleString()}–${f.addMax.toLocaleString()}
                  </span>
                </div>
              ))}
              {activeFeatures.length === 0 && (
                <div style={{ fontSize: '0.8rem', color: 'var(--t4)', fontStyle: 'italic' }}>
                  No add-ons selected yet
                </div>
              )}
            </div>

            {/* Note */}
            <div className="price-note">
              50% on booking · 50% on delivery · Zero hidden fees
            </div>

            <a href="/register" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem' }}>
              Get Your Estimate →
            </a>

            <p style={{ fontSize: '0.75rem', color: 'var(--t4)', textAlign: 'center', marginTop: 12 }}>
              Free to apply · No commitment · Response within 24 hrs
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
