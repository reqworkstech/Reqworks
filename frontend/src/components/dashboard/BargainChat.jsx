import React, { useState } from 'react';

export default function BargainChat({ projectId, estimatedPrice, bargainPrice, bargainMessage, userDecision, onBargainSubmit }) {
  const [offer, setOffer] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offer) {
      alert('Please input your counter price!');
      return;
    }
    if (!reason.trim()) {
      alert('Please provide a justification message for the admin!');
      return;
    }
    setSubmitting(true);
    try {
      const success = await onBargainSubmit(parseFloat(offer), reason);
      if (success) {
        setOffer('');
        setReason('');
      }
    } catch (err) {
      console.error('Bargain submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bargain-panel animate-reveal">
      <div className="bargain-header">
        <div className="current-budget">
          <span>Current Estimate</span>
          <strong>${(estimatedPrice || 0).toLocaleString()}</strong>
        </div>
        <p className="bargain-note">
          Counter-propose a budget with reasoning. Admins will audit and reply.
        </p>
      </div>

      {userDecision === 'Bargained' && (
        <div style={{ background: 'var(--bg-layer2)', border: '1px dashed var(--accent-amber)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
            ⚠️ Active Counter Offer Dispatched
          </span>
          <strong style={{ fontSize: '1.3rem', color: 'var(--text-primary)', display: 'block', margin: '4px 0' }}>
            ${(bargainPrice || 0).toLocaleString()}
          </strong>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            "{bargainMessage}"
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bargain-input-row" style={{ background: 'var(--bg-card)' }}>
        <div className="form-group">
          <label>Your Proposed Counter Offer (USD)</label>
          <input 
            type="number"
            required
            placeholder="Amount"
            value={offer}
            onChange={e => setOffer(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Justification Reasoning</label>
          <textarea
            required
            rows={3}
            placeholder="Reason"
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="form-textarea"
            style={{ resize: 'none' }}
          />
        </div>
        <button 
          className="btn-primary" 
          type="submit"
          disabled={submitting}
          style={{ width: '100%', marginTop: '6px' }}
        >
          {submitting ? 'Submitting Counter...' : 'Send Counter-Offer →'}
        </button>
      </form>
    </div>
  );
}
