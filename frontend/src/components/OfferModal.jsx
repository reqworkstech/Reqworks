import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X, Info } from 'lucide-react';
import { offerConfig } from '../config/offerConfig';

export default function OfferModal() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const activeOffers = (offerConfig.offers || []).filter(o => o.isActive);
  const hasOffers = offerConfig.enableModal && activeOffers.length > 0;

  useEffect(() => {
    if (!hasOffers) return;
    const isClosed = sessionStorage.getItem('dq-offer-modal-closed');
    if (!isClosed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasOffers]);

  // 10-second auto-close timer (only for a single offer so it doesn't interrupt reading multiple offers)
  useEffect(() => {
    if (isOpen && activeOffers.length === 1) {
      const autoCloseTimer = setTimeout(() => {
        handleClose();
      }, 10000); // 10 seconds
      return () => clearTimeout(autoCloseTimer);
    }
  }, [isOpen, activeOffers.length]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('dq-offer-modal-closed', 'true');
  };

  const handleBookNow = (offer) => {
    if (offer.promoCode) {
      localStorage.setItem('dq-pending-coupon', offer.promoCode);
    } else {
      localStorage.removeItem('dq-pending-coupon');
    }
    setIsOpen(false);
    sessionStorage.setItem('dq-offer-modal-closed', 'true');
    navigate(offer.redirectPath || '/register');
  };

  if (!isOpen || !hasOffers) return null;

  const singleOffer = activeOffers[0];

  return (
    <div className="offer-modal-backdrop" onClick={handleClose}>
      <div className="offer-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button className="offer-modal-close" onClick={handleClose} aria-label="Close modal">
          <X size={16} />
        </button>

        {activeOffers.length === 1 ? (
          /* SINGLE OFFER LAYOUT (identical to original code) */
          <>
            {/* Banner Flyer Image */}
            <div className="offer-modal-banner-image">
              <img 
                src={singleOffer.imageSrc} 
                alt={singleOffer.imageAlt} 
                className="offer-img-element"
              />
            </div>

            {/* Claim Info & Action Section */}
            <div className="offer-modal-body-content">
              
              {/* Claim Instructions */}
              <div className="claim-instruction-box">
                <Info size={14} className="claim-info-icon" />
                <p className="claim-instruction-text">
                  <strong>How to claim:</strong> {singleOffer.instructionText}
                </p>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => handleBookNow(singleOffer)}
                className="offer-modal-submit-btn"
              >
                <span>{singleOffer.buttonText}</span>
                <ArrowRight size={14} />
              </button>
              
              <button className="offer-modal-decline" onClick={handleClose}>
                No thanks, dismiss
              </button>

            </div>

            {/* 10-Second Auto-Close Progress Bar Visual */}
            <div className="offer-timer-progress-bar" />
          </>
        ) : (
          /* MULTIPLE OFFERS SCROLLABLE LAYOUT */
          <>
            <div className="offers-header">
              <h3>Special Offers For You</h3>
              <p>Choose an offer to claim before they expire!</p>
            </div>

            <div className="offers-scroll-list">
              {activeOffers.map((offer) => (
                <div key={offer.id || offer.promoCode} className="offer-card">
                  <div className="offer-card-banner">
                    <img 
                      src={offer.imageSrc} 
                      alt={offer.imageAlt} 
                      className="offer-img-element"
                    />
                  </div>
                  <div className="offer-card-body">
                    <div className="claim-instruction-box">
                      <Info size={14} className="claim-info-icon" />
                      <p className="claim-instruction-text">
                        <strong>How to claim:</strong> {offer.instructionText}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleBookNow(offer)}
                      className="offer-modal-submit-btn"
                    >
                      <span>{offer.buttonText}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="offers-footer">
              <button className="offer-modal-decline" onClick={handleClose}>
                No thanks, dismiss all
              </button>
            </div>
          </>
        )}

      </div>

      <style>{`
        .offer-modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(8, 9, 12, 0.85);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100000;
          padding: 20px;
          animation: fade-in-backdrop 0.25s ease-out forwards;
        }

        .offer-modal-container {
          position: relative;
          width: 100%;
          max-width: 340px; /* Centered, small, compact */
          background: #0d1017;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(245, 166, 35, 0.05);
          animation: modal-slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .offer-modal-close {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 100;
          transition: all 0.2s;
        }
        .offer-modal-close:hover {
          background: rgba(220, 38, 38, 0.15);
          border-color: rgba(220, 38, 38, 0.3);
          color: #ef4444;
        }

        /* Banner Image Box */
        .offer-modal-banner-image {
          width: 100%;
          height: 300px; /* Fit the square orange poster beautifully */
          overflow: hidden;
          background: #f5a623;
        }

        .offer-img-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Body Content */
        .offer-modal-body-content {
          padding: 18px 20px 20px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          background: #0d1017;
        }

        /* Claim Instruction Box */
        .claim-instruction-box {
          display: flex;
          gap: 8px;
          background: rgba(245, 166, 35, 0.04);
          border: 1px dashed rgba(245, 166, 35, 0.2);
          border-radius: 10px;
          padding: 10px 12px;
          margin-bottom: 16px;
          align-items: flex-start;
        }

        .claim-info-icon {
          color: #f5a623;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .claim-instruction-text {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.4;
          margin: 0;
        }

        .claim-instruction-text code {
          background: rgba(255, 255, 255, 0.05);
          color: #f5a623;
          padding: 1px 4px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.75rem;
          font-weight: 700;
        }

        /* Submit Button */
        .offer-modal-submit-btn {
          width: 100%;
          background: #f5a623;
          color: #0d1017;
          border: none;
          border-radius: 10px;
          height: 42px;
          font-size: 0.78rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(245, 166, 35, 0.2);
          transition: all 0.2s;
        }
        .offer-modal-submit-btn:hover {
          background: #e0951b;
          transform: translateY(-1px);
        }

        /* Decline Link */
        .offer-modal-decline {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.35);
          font-size: 0.68rem;
          cursor: pointer;
          text-align: center;
          transition: color 0.2s;
          margin-top: 10px;
          text-decoration: underline;
        }
        .offer-modal-decline:hover {
          color: rgba(255, 255, 255, 0.65);
        }

        /* 10s Timer Shrinking Bar */
        .offer-timer-progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: #f5a623;
          animation: timer-shrink 10s linear forwards;
          box-shadow: 0 0 8px #f5a623;
        }

        /* MULTI-OFFER STYLES */
        .offers-header {
          padding: 24px 20px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: #0d1017;
        }
        .offers-header h3 {
          margin: 0;
          color: #f5a623;
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: 0.02em;
        }
        .offers-header p {
          margin: 4px 0 0;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.72rem;
        }
        .offers-scroll-list {
          flex: 1;
          overflow-y: auto;
          max-height: 50vh;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .offers-scroll-list::-webkit-scrollbar {
          width: 6px;
        }
        .offers-scroll-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .offers-scroll-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 3px;
        }
        .offers-scroll-list::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .offer-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          overflow: hidden;
        }
        .offer-card-banner {
          width: 100%;
          height: 150px;
          overflow: hidden;
          background: #f5a623;
        }
        .offer-card-body {
          padding: 14px;
        }
        .offers-footer {
          padding: 12px 20px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: #0d1017;
          display: flex;
          justify-content: center;
        }
        .offers-footer .offer-modal-decline {
          margin-top: 0;
        }

        /* Keyframes */
        @keyframes fade-in-backdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modal-slide-in {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes timer-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
