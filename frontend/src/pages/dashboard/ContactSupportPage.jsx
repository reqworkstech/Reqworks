import React from 'react';
import { Mail, MessageCircle, Clock, Calendar, ExternalLink, MapPin, Shield } from 'lucide-react';

export default function ContactSupportPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px' }}>
      
      {/* Header Banner */}
      <div>
        <h2 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Contact Support</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', margin: '4px 0 0' }}>Get in touch with our team.</p>
      </div>

      {/* Primary Support Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        
        {/* WhatsApp Channel */}
        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#15803D', marginBottom: '16px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(21, 128, 61, 0.08)' }}>
                <MessageCircle size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>WhatsApp Chat</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', lineHeight: 1.5, margin: '0 0 20px' }}>
              Chat with our team for instant assistance.
            </p>
          </div>
          
          <a 
            href="https://wa.me/916352834093" 
            target="_blank" 
            rel="noopener noreferrer"
            className="dash-btn"
            style={{ 
              width: '100%', 
              background: '#15803D', 
              color: '#FFF', 
              border: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              height: '42px',
              fontWeight: 600
            }}
          >
            <span>Open WhatsApp Chat</span>
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Email Desk */}
        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--dash-accent)', marginBottom: '16px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--dash-bg)' }}>
                <Mail size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Email Support</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', lineHeight: 1.5, margin: '0 0 20px' }}>
              Email support queries. Responses are within 24 hours.
            </p>
          </div>
          
          <a 
            href="mailto:reqworks.tech@gmail.com"
            className="dash-btn dash-btn-primary"
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              height: '42px'
            }}
          >
            <span>Email reqworks.tech@gmail.com</span>
            <Mail size={14} />
          </a>
        </div>

      </div>

      {/* Support Details / Guidelines Card */}
      <div className="dash-card" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 16px' }}>Response Guarantees</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Clock size={18} style={{ color: 'var(--dash-accent)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.9rem', display: 'block' }}>Response Time Frame</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--dash-text-sec)' }}>
                Support requests are resolved within 24 hours.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Calendar size={18} style={{ color: 'var(--dash-accent)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.9rem', display: 'block' }}>Operational Hours</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--dash-text-sec)' }}>
                Active Monday to Friday, 9:00 AM – 6:00 PM IST.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Shield size={18} style={{ color: 'var(--dash-accent)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.9rem', display: 'block' }}>Change Requests Disclaimer</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--dash-text-sec)' }}>
                Please submit change requests via the Request Change page.
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
