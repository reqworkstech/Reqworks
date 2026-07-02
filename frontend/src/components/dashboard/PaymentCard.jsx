import React from 'react';

export default function PaymentCard({ label, percent, amount, paid, paidAt, onPay, locked, lockReason }) {
  return (
    <div className={`payment-card ${paid ? 'paid' : ''} ${locked ? 'locked' : ''}`}>
      <span className="payment-percent">{percent}%</span>
      <span className="payment-label">{label}</span>
      <h4 className="payment-amount">${amount.toLocaleString()}</h4>

      {paid ? (
        <div className="payment-paid-badge">
          <span>✓ Invoice Cleared</span>
          {paidAt && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
              on {new Date(paidAt).toLocaleDateString()}
            </span>
          )}
        </div>
      ) : locked ? (
        <div className="payment-locked-badge">
          <span>🔒 Locked</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
            {lockReason}
          </span>
        </div>
      ) : (
        <button 
          onClick={onPay} 
          className="btn-pay" 
          type="button"
        >
          💳 Pay Invoice Now
        </button>
      )}
    </div>
  );
}
