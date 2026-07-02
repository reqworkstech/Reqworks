import React, { useState } from 'react';

function getStrength(password) {
  let score = 0;
  if (!password) return 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export default function InputField({ label, rightLabel, type = 'text', showStrength, ...props }) {
  const [show, setShow] = useState(false);
  const strength = showStrength ? getStrength(props.value || '') : 0;

  return (
    <div className="input-group">
      {(label || rightLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          {label && <label className="input-label" style={{ marginBottom: 0 }}>{label}</label>}
          {rightLabel && rightLabel}
        </div>
      )}
      <div className="input-wrap" style={{ position: 'relative' }}>
        <input 
          type={type === 'password' ? (show ? 'text' : 'password') : type} 
          className="auth-input"
          {...props} 
        />
        {type === 'password' && (
          <button 
            type="button" 
            className="toggle-show" 
            onClick={() => setShow(!show)}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--txt-3)',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {show ? '🙈' : '👁'}
          </button>
        )}
      </div>
      {showStrength && props.value && (
        <div className="strength-bar" style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              className={`strength-segment ${strength >= i ? `active-${strength}` : ''}`} 
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: strength >= i 
                  ? (strength === 1 ? '#ef4444' : strength === 2 ? '#f59e0b' : strength === 3 ? '#3b82f6' : '#10b981')
                  : 'rgba(255,255,255,0.08)',
                transition: 'background 0.3s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
