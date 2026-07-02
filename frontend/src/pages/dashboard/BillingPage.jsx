import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CreditCard, Check, Lock, Receipt, Tag, AlertCircle, ArrowRight, 
  Download, Calendar, ShieldCheck, DollarSign, Info, Loader2, Sparkles
} from 'lucide-react';

export default function BillingPage() {
  const { toast, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState(() => {
    const pending = localStorage.getItem('dq-pending-coupon') || '';
    const upper = pending.toUpperCase();
    if (upper === 'SPECIAL1999' || upper === 'FIRST5') {
      localStorage.removeItem('dq-pending-coupon');
      return '';
    }
    return pending;
  });
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponValidating, setCouponValidating] = useState(false);
  const [payingCard, setPayingCard] = useState(null); // 'advance' or 'final'
  
  // Payment state

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects/user', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects || []);
        if (data.projects.length > 0) {
          const persistedId = localStorage.getItem('dq-selected-project');
          const found = data.projects.find(p => p._id === persistedId) || data.projects[0];
          setSelectedProject(found);
        }
      }
    } catch (err) {
      console.error('Failed to fetch user billing details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Auto-apply pending coupon code from landing page offer modal
  useEffect(() => {
    const autoApplyCoupon = async () => {
      let pendingCoupon = localStorage.getItem('dq-pending-coupon');
      if (pendingCoupon) {
        const upper = pendingCoupon.toUpperCase();
        if (upper === 'SPECIAL1999' || upper === 'FIRST5') {
          localStorage.removeItem('dq-pending-coupon');
          pendingCoupon = null;
        }
      }
      if (pendingCoupon && selectedProject && !selectedProject.depositPaid && !appliedCoupon) {
        setCouponValidating(true);
        try {
          const res = await fetch('/api/projects/coupon/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: pendingCoupon, projectId: selectedProject._id }),
            credentials: 'include'
          });
          const data = await res.json();
          if (data.success) {
            setAppliedCoupon(data);
            toast.success(data.message);
            // Clear pending coupon once successfully verified & applied
            localStorage.removeItem('dq-pending-coupon');
          } else {
            setCouponError(data.message || 'Failed to auto-apply promo code');
          }
        } catch (err) {
          console.error('Auto coupon application error:', err);
        } finally {
          setCouponValidating(false);
        }
      }
    };
    autoApplyCoupon();
  }, [selectedProject, appliedCoupon]);

  const handleProjectSelect = (e) => {
    const id = e.target.value;
    const found = projects.find(p => p._id === id);
    setSelectedProject(found);
    localStorage.setItem('dq-selected-project', id);
    // Reset coupon state on project change
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Helper to map project stages to indices
  const getStageIndex = (stage) => {
    switch (stage) {
      case 'Submitted':
      case 'Estimated':
      case 'Review': return 0;
      case 'Planning': return 1;
      case 'Building': return 2;
      case 'Testing': return 3;
      case 'Final Checks':
      case 'Completed': return 4;
      default: return 0;
    }
  };

  // Validate coupon code
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    
    setCouponError('');
    setCouponValidating(true);
    try {
      const res = await fetch('/api/projects/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, projectId: selectedProject._id }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data);
        toast.success(data.message);
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Network error validating coupon');
    } finally {
      setCouponValidating(false);
    }
  };

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Trigger Razorpay Order or Simulator Flow
  const handleInitiatePayment = async (cardType) => {
    setPayingCard(cardType);
    try {
      const res = await fetch('/api/projects/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject._id,
          couponCode: appliedCoupon?.code || undefined
        }),
        credentials: 'include'
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || 'Failed to create payment order');
        setPayingCard(null);
        return;
      }

      // Live Razorpay payment gateways trigger
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Reqworks Studio',
        description: cardType === 'advance' ? '25% Project Booking Advance' : '75% Project Final Payment',
        order_id: data.orderId,
        handler: async (response) => {
          await handleVerifyPayment({
            projectId: selectedProject._id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            couponCode: appliedCoupon?.code
          });
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: { color: '#D97706' },
        modal: {
          ondismiss: () => {
            setPayingCard(null);
            toast.info('Payment cancelled');
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error('Failed to connect to gateway server');
      setPayingCard(null);
    }
  };

  // Call verify endpoint on backend
  const handleVerifyPayment = async (payload) => {
    try {
      const res = await fetch('/api/projects/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Payment Verified Successfully!');
        fetchProjects(); // refresh UI
        setAppliedCoupon(null);
        setCouponCode('');
      } else {
        toast.error(data.message || 'Payment verification failed');
      }
    } catch (err) {
      toast.error('Network failure during verification');
    } finally {
      setPayingCard(null);
    }
  };

  // Generate Receipt Print window
  const printInvoice = (desc, amount, orderId, paymentId, dateStr) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt — Reqworks Studio</title>
          <style>
            body { font-family: 'DM Sans', sans-serif; background: #FAF7F2; color: #1C1410; padding: 40px; }
            .invoice-box { max-width: 600px; margin: auto; padding: 30px; border: 1px solid #E7E0D4; background: #FFF; border-radius: 12px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #F3EDE4; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #D97706; }
            .title { font-size: 18px; text-transform: uppercase; letter-spacing: 1px; color: #78716C; }
            .meta { margin-bottom: 20px; font-size: 14px; line-height: 1.6; }
            .line-items { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .line-items th { background: #F3EDE4; text-align: left; padding: 10px; font-size: 14px; }
            .line-items td { padding: 12px 10px; border-bottom: 1px solid #E7E0D4; font-size: 14px; }
            .total { text-align: right; font-size: 18px; font-weight: bold; color: #D97706; margin-top: 20px; }
            .btn-print { margin-top: 30px; display: inline-block; padding: 10px 20px; background: #D97706; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; cursor: pointer; border: none; }
            @media print { .btn-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div>
                <div class="logo">Reqworks</div>
                <div style="font-size: 12px; color: #78716C; margin-top: 4px;">Custom Software Engineering Sprint</div>
              </div>
              <div class="title">Official Receipt</div>
            </div>
            
            <div class="meta" style="display: flex; justify-content: space-between;">
              <div>
                <strong>Client Details:</strong><br/>
                \${user?.name || 'Valued Partner'}<br/>
                \${user?.email || ''}<br/>
                CID Badge: \${user?.customerId || 'CID-XXXXX'}
              </div>
              <div style="text-align: right;">
                <strong>Transaction Details:</strong><br/>
                Date: \${dateStr}<br/>
                Order ID: \${orderId || 'N/A'}<br/>
                Payment ID: \${paymentId || 'N/A'}
              </div>
            </div>

            <table class="line-items">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>\${desc} for project: <strong>\${selectedProject?.projectName}</strong></td>
                  <td style="text-align: right;">₹\${amount.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            <div class="total">Total Paid: ₹\${amount.toLocaleString('en-IN')}</div>
            
            <div style="margin-top: 40px; font-size: 12px; color: #A8A29E; text-align: center;">
              Thank you for partnering with Reqworks. Sprints are queued upon advance payment lock.
            </div>

            <button class="btn-print" onclick="window.print()">Print Receipt</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, height: '60vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid var(--dash-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '0.88rem', color: 'var(--dash-text-sec)', fontWeight: 500 }}>Decrypting transaction logs...</span>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 24px', border: '1.5px dashed var(--dash-border)' }}>
        <CreditCard size={48} style={{ color: 'var(--dash-text-muted)', marginBottom: '16px' }} />
        <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.4rem', fontWeight: 700 }}>No Invoices Yet</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--dash-text-sec)', maxWidth: '440px', marginTop: '8px', marginBottom: '24px' }}>
          We generate payment split structures as soon as you file your first proposal brief.
        </p>
        <a href="/dashboard/book" className="dash-btn dash-btn-primary">
          <span>Book Project Now</span>
          <ArrowRight size={16} />
        </a>
      </div>
    );
  }

  // Calculate pricing based on estimate & decision
  const basePrice = selectedProject.userDecision === 'Bargained' ? selectedProject.bargainPrice : selectedProject.estimatedPrice;
  const priceEstimated = selectedProject.priceEstimated;
  const projectStageIdx = getStageIndex(selectedProject.stage);

  // Apply Coupon discount logic to local pricing
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPrice = basePrice - discountAmount;

  const advanceAmount = Math.round(finalPrice * 0.25);
  const finalHandoffAmount = Math.round(finalPrice * 0.75);

  const displayBasePrice = basePrice;
  const displayAdvanceAmount = advanceAmount;
  const displayFinalHandoffAmount = finalHandoffAmount;

  // Final check locking condition (Must reach "Final Checks" - index 4)
  const isFinalHandoffLocked = !selectedProject.depositPaid || (projectStageIdx < 4);

  // Load scripts helper for Razorpay check
  if (!window.Razorpay) {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.head.appendChild(script);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header and selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Billing & Invoice</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', margin: '4px 0 0' }}>Review payments and invoices.</p>
        </div>

        <div className="dash-input-group" style={{ margin: 0, width: 'auto' }}>
          <select 
            className="dash-input" 
            value={selectedProject?._id} 
            onChange={handleProjectSelect}
            style={{ fontWeight: 600 }}
          >
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.projectName}</option>
            ))}
          </select>
        </div>
      </div>

      {!priceEstimated ? (
        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 24px', background: 'var(--dash-card-sec)' }}>
          <Loader2 size={36} className="animate-spin" style={{ color: 'var(--dash-accent)', marginBottom: '16px', animation: 'spin 2s linear infinite' }} />
          <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.25rem', fontWeight: 700 }}>Awaiting Price Estimation</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--dash-text-sec)', maxWidth: '460px', marginTop: '8px', lineHeight: 1.5 }}>
            Awaiting admin budget estimation.
          </p>
        </div>
      ) : (
        <>
          {/* Coupon Input Banner */}
          {(!selectedProject.depositPaid || !selectedProject.finalPaid) && (
            <div className="dash-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--dash-bg)', color: 'var(--dash-accent)' }}>
                    <Tag size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Apply Coupon Discount</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--dash-text-sec)', margin: '2px 0 0' }}>Apply a coupon for discounts.</p>
                  </div>
                </div>

                {appliedCoupon ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(21, 128, 61, 0.08)', border: '1px solid var(--dash-success)', padding: '6px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dash-success)' }}>
                      🎉 CODE: {appliedCoupon.code} ({appliedCoupon.discountPercent}% OFF)
                    </span>
                    <button 
                      onClick={handleRemoveCoupon} 
                      style={{ border: 'none', background: 'none', color: 'var(--dash-danger)', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '380px' }}>
                    <div className="dash-input-group" style={{ margin: 0, flex: 1 }}>
                      <input 
                        type="text" 
                        className="dash-input" 
                        placeholder="Coupon code" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={couponValidating || selectedProject.depositPaid}
                        style={{ height: '40px', padding: '0 12px' }}
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="dash-btn dash-btn-primary" 
                      disabled={couponValidating || !couponCode.trim() || selectedProject.depositPaid}
                      style={{ height: '40px', whiteSpace: 'nowrap', padding: '0 16px' }}
                    >
                      {couponValidating ? 'Verifying...' : 'Apply Code'}
                    </button>
                  </form>
                )}
              </div>
              {couponError && (
                <div style={{ color: 'var(--dash-danger)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                  <AlertCircle size={14} />
                  <span>{couponError}</span>
                </div>
              )}
              {selectedProject.depositPaid && (
                <div style={{ fontSize: '0.78rem', color: 'var(--dash-text-sec)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Info size={14} style={{ color: 'var(--dash-accent)' }} />
                  <span>Coupon discounts apply before initial Booking Advance payments.</span>
                </div>
              )}
            </div>
          )}

          {/* Pricing Split Summary */}
          {appliedCoupon && (
            <div className="dash-card" style={{ padding: '16px 20px', background: 'rgba(21, 128, 61, 0.03)', border: '1px solid var(--dash-success)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)' }}>Estimate Total: </span>
                <span style={{ textDecoration: 'line-through', marginRight: '8px', fontWeight: 600 }}>₹{displayBasePrice.toLocaleString('en-IN')}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dash-success)' }}>₹{finalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dash-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={16} />
                <span>You save: ₹{discountAmount.toLocaleString('en-IN')} ({appliedCoupon.discountPercent}% Off)</span>
              </div>
            </div>
          )}

          {/* Payment Split Cards Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            
            {/* CARD 1 — 25% ADVANCE */}
            <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
              {selectedProject.depositPaid && (
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <span className="dash-badge dash-badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={12} />
                    <span>Paid</span>
                  </span>
                </div>
              )}
              <div style={{ borderBottom: '1px solid var(--dash-border)', paddingBottom: '16px', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dash-accent)', letterSpacing: '0.04em' }}>Milestone 1</span>
                <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.35rem', fontWeight: 700, marginTop: '4px', marginBottom: '0' }}>25% Booking Advance</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', marginTop: '6px' }}>Locks booking slot and starts planning.</p>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--dash-text)' }}>
                    ₹{displayAdvanceAmount.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--dash-text-sec)', marginTop: '4px' }}>
                    Calculated from estimate: ₹{finalPrice.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  {selectedProject.depositPaid ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--dash-success)' }}>
                        <ShieldCheck size={16} />
                        <span>Advance payment confirmed.</span>
                      </div>
                      <button 
                        onClick={() => printInvoice('25% Booking Advance', displayAdvanceAmount, selectedProject.razorpayOrderId, selectedProject.razorpayPaymentId, new Date(selectedProject.createdAt).toLocaleDateString())}
                        className="dash-btn dash-btn-outline" 
                        style={{ width: '100%', gap: '8px' }}
                      >
                        <Download size={14} />
                        <span>Download Invoice</span>
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleInitiatePayment('advance')}
                      className="dash-btn dash-btn-primary" 
                      disabled={payingCard === 'advance'}
                      style={{ width: '100%', gap: '8px' }}
                    >
                      {payingCard === 'advance' ? (
                        <>
                          <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1.2s linear infinite' }} />
                          <span>Contacting Gateway...</span>
                        </>
                      ) : (
                        <>
                          <span>Pay Booking Advance</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* CARD 2 — 75% FINAL */}
            <div className={`dash-card ${isFinalHandoffLocked && !selectedProject.finalPaid ? 'locked-ui' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
              {selectedProject.finalPaid && (
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <span className="dash-badge dash-badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={12} />
                    <span>Paid</span>
                  </span>
                </div>
              )}
              {!selectedProject.finalPaid && isFinalHandoffLocked && (
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <span className="dash-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--dash-border)', color: 'var(--dash-text-sec)' }}>
                    <Lock size={12} />
                    <span>Locked</span>
                  </span>
                </div>
              )}
              <div style={{ borderBottom: '1px solid var(--dash-border)', paddingBottom: '16px', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dash-text-sec)', letterSpacing: '0.04em' }}>Milestone 2</span>
                <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.35rem', fontWeight: 700, marginTop: '4px', marginBottom: '0' }}>75% Final Handoff</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', marginTop: '6px' }}>Paid upon final handoff and deployment.</p>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: isFinalHandoffLocked && !selectedProject.finalPaid ? 'var(--dash-text-muted)' : 'var(--dash-text)' }}>
                    ₹{displayFinalHandoffAmount.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--dash-text-sec)', marginTop: '4px' }}>
                    Calculated from estimate: ₹{finalPrice.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  {selectedProject.finalPaid ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--dash-success)' }}>
                        <ShieldCheck size={16} />
                        <span>Final payment confirmed.</span>
                      </div>
                      <button 
                        onClick={() => printInvoice('75% Final Handoff', displayFinalHandoffAmount, selectedProject.razorpayOrderId, selectedProject.razorpayPaymentId, new Date(selectedProject.createdAt).toLocaleDateString())}
                        className="dash-btn dash-btn-outline" 
                        style={{ width: '100%', gap: '8px' }}
                      >
                        <Download size={14} />
                        <span>Download Invoice</span>
                      </button>
                    </div>
                  ) : isFinalHandoffLocked ? (
                    <div style={{ background: 'var(--dash-bg)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--dash-text-sec)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <Info size={16} style={{ color: 'var(--dash-accent)', flexShrink: 0, marginTop: '2px' }} />
                      <span>
                        {!selectedProject.depositPaid 
                          ? 'Unlocks after the 25% Booking Advance is verified.' 
                          : `Unlocks at Final Checks stage. (Current: ${selectedProject.stage})`}
                      </span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleInitiatePayment('final')}
                      className="dash-btn dash-btn-primary" 
                      disabled={payingCard === 'final'}
                      style={{ width: '100%', gap: '8px' }}
                    >
                      {payingCard === 'final' ? (
                        <>
                          <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1.2s linear infinite' }} />
                          <span>Contacting Gateway...</span>
                        </>
                      ) : (
                        <>
                          <span>Pay Final Handoff</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Transactions Table Section */}
          <div className="dash-card" style={{ marginTop: '12px' }}>
            <div style={{ borderBottom: '1px solid var(--dash-border)', paddingBottom: '14px', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Project Statement Transactions</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--dash-text-sec)', margin: '2px 0 0' }}>Logs of payments.</p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--dash-border)' }}>
                    <th style={{ padding: '10px 12px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dash-text-sec)' }}>Date</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dash-text-sec)' }}>Description</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dash-text-sec)' }}>Amount</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dash-text-sec)' }}>Status</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dash-text-sec)', textAlign: 'center' }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Transaction Row 1: Advance */}
                  <tr style={{ borderBottom: '1px solid var(--dash-border)' }}>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                      {new Date(selectedProject.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                      25% Project Booking Advance
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700 }}>
                      ₹{displayAdvanceAmount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`dash-badge ${selectedProject.depositPaid ? 'dash-badge-success' : 'dash-badge-warning'}`}>
                        {selectedProject.depositPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {selectedProject.depositPaid ? (
                        <button 
                          onClick={() => printInvoice('25% Booking Advance', displayAdvanceAmount, selectedProject.razorpayOrderId, selectedProject.razorpayPaymentId, new Date(selectedProject.createdAt).toLocaleDateString())}
                          style={{ background: 'none', border: 'none', color: 'var(--dash-accent)', cursor: 'pointer' }}
                          title="Print Receipt"
                        >
                          <Receipt size={18} />
                        </button>
                      ) : (
                        <span style={{ color: 'var(--dash-text-muted)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                  </tr>

                  {/* Transaction Row 2: Final Handoff */}
                  <tr style={{ borderBottom: '1px solid var(--dash-border)' }}>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                      {new Date(selectedProject.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                      75% Project Final Handoff
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700 }}>
                      ₹{displayFinalHandoffAmount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`dash-badge ${selectedProject.finalPaid ? 'dash-badge-success' : (isFinalHandoffLocked ? 'dash-badge-neutral' : 'dash-badge-warning')}`} style={{ background: isFinalHandoffLocked && !selectedProject.finalPaid ? 'var(--dash-bg)' : undefined, color: isFinalHandoffLocked && !selectedProject.finalPaid ? 'var(--dash-text-muted)' : undefined }}>
                        {selectedProject.finalPaid ? 'Paid' : (isFinalHandoffLocked ? 'Locked' : 'Pending')}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {selectedProject.finalPaid ? (
                        <button 
                          onClick={() => printInvoice('75% Final Handoff', displayFinalHandoffAmount, selectedProject.razorpayOrderId, selectedProject.razorpayPaymentId, new Date(selectedProject.createdAt).toLocaleDateString())}
                          style={{ background: 'none', border: 'none', color: 'var(--dash-accent)', cursor: 'pointer' }}
                          title="Print Receipt"
                        >
                          <Receipt size={18} />
                        </button>
                      ) : (
                        <span style={{ color: 'var(--dash-text-muted)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <style>{`
        .locked-ui {
          opacity: 0.65;
        }
      `}</style>

    </div>
  );
}
