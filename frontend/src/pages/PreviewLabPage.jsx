import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export default function PreviewLabPage() {
  // Wizard steps: 1, 2, 3 for full form
  const [formStep, setFormStep] = useState(1);

  // Main form inputs
  const [mainForm, setMainForm] = useState({
    name: '',
    email: '',
    website: '',
    businessDescription: '',
    styleColors: '',
    referenceWebsite: '',
    honeypot: ''
  });
  const [selectedSections, setSelectedSections] = useState([]);
  const [mainLoading, setMainLoading] = useState(false);
  const [mainSuccess, setMainSuccess] = useState(false);
  const [mainError, setMainError] = useState('');

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [toast.show]);

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Carousel slide states for images Prev1, Prev2, Prev3 and local Video in 4th slot
  const [carouselIndex, setCarouselIndex] = useState(0);

  const CAROUSEL_SLIDES = [
    { type: 'image', src: '/images/Prev1.jpg' },
    { type: 'image', src: '/images/Prev2.jpg' },
    { type: 'image', src: '/images/Prev3.jpg' },
    { type: 'video', src: '/images/Vedio.mp4' }
  ];

  const SECTIONS = [
    { id: 'hero', label: 'Homepage / hero', desc: 'Hero statement, value header, primary CTA.' },
    { id: 'about', label: 'About / services', desc: 'Explains what you offer and who you serve.' },
    { id: 'portfolio', label: 'Portfolio / testimonials', desc: 'Case studies, visual review grids & reviews.' },
    { id: 'contact', label: 'Contact / footer', desc: 'Conversion-optimized capture & links.' }
  ];

  // Auto-scroll carousel slides every 5 seconds (PAUSES when video is active)
  useEffect(() => {
    const isVideoActive = CAROUSEL_SLIDES[carouselIndex].type === 'video';
    if (isVideoActive) return;

    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselIndex, CAROUSEL_SLIDES.length]);

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  const handleSectionToggle = (label) => {
    if (selectedSections.includes(label)) {
      setSelectedSections(selectedSections.filter(s => s !== label));
    } else {
      if (selectedSections.length < 3) {
        setSelectedSections([...selectedSections, label]);
      }
    }
  };

  // Stepper Validations
  const validateStep = (step) => {
    setMainError('');
    if (step === 1) {
      if (!mainForm.name.trim()) {
        triggerToast('Name is required.', 'error');
        return false;
      }
      if (!mainForm.email.trim() || !/^\S+@\S+\.\S+$/.test(mainForm.email)) {
        triggerToast('Please enter a valid email address.', 'error');
        return false;
      }
    } else if (step === 2) {
      if (!mainForm.businessDescription.trim()) {
        triggerToast('Business description is required.', 'error');
        return false;
      }
      if (selectedSections.length === 0) {
        triggerToast('Select at least one website section.', 'error');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(formStep)) {
      setFormStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setMainError('');
    setFormStep((prev) => prev - 1);
  };

  // Submit request
  const handleMainSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    setMainError('');
    setMainLoading(true);

    try {
      const response = await fetch('/api/preview-lab/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...mainForm, selectedSections })
      });

      const data = await response.json();
      setMainLoading(false);

      if (response.ok && data.success) {
        setMainSuccess(true);
        triggerToast('Request confirmed! Previews will be emailed in 24 hours.', 'success');
        setMainForm({
          name: '',
          email: '',
          website: '',
          businessDescription: '',
          styleColors: '',
          referenceWebsite: '',
          honeypot: ''
        });
        setSelectedSections([]);
      } else {
        setMainError(data.error || 'Something went wrong. Please try again.');
        triggerToast(data.error || 'Something went wrong. Please try again.', 'error');
      }
    } catch (err) {
      setMainLoading(false);
      triggerToast('Unable to submit. Please try again in a moment.', 'error');
    }
  };

  return (
    <div className="preview-lab-page">
      <style>{`
        .preview-lab-page {
          background-color: #ffffff;
          color: #1e293b;
          font-family: 'Inter', system-ui, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        /* Floating Toast Notification */
        .toast-notification {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          background: #ffffff;
          color: #0f172a;
          border: 1px solid #cbd5e1;
          border-left: 4px solid #4f46e5;
          border-radius: 8px;
          padding: 14px 18px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 280px;
          max-width: 420px;
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          text-align: left;
        }
        .toast-notification.error {
          border-left-color: #ef4444;
        }
        .toast-notification.success {
          border-left-color: #10b981;
        }
        .toast-message {
          font-size: 0.82rem;
          font-weight: 600;
          line-height: 1.4;
          color: #1e293b;
        }
        @keyframes slideIn {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Black Hero Section Background */
        .hero-section-wrapper {
          background-color: #08090f;
          position: relative;
          color: #ffffff;
        }

        /* Subtle grid background mesh on dark background - dull white clean lines */
        .hero-grid-mesh {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-size: 40px 40px;
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.045) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
          mask-image: radial-gradient(circle at 50% 30%, black 50%, transparent 100%);
          -webkit-mask-image: radial-gradient(circle at 50% 30%, black 50%, transparent 100%);
          pointer-events: none;
          z-index: 0;
        }

        /* Header (WHITE NAVBAR) */
        .lab-header {
          border-bottom: 1px solid #cbd5e1;
          background: #ffffff;
          position: relative;
          z-index: 10;
        }
        .lab-header-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .lab-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #0f172a;
        }
        .lab-logo-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
        }
        .lab-logo-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
        .lab-logo-text {
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .lab-logo-dot {
          color: #4f46e5;
        }

        /* Button Styling for Back to Home Link */
        .back-home-link {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.8rem;
          text-decoration: none;
          transition: all 0.2s;
          display: inline-block;
        }
        .back-home-link:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          color: #0f172a;
        }

        /* Split-Screen Hero Section (Black theme) */
        .lab-hero-split-section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 80px 20px 40px;
          display: grid;
          grid-template-columns: 1.25fr 1fr; /* Wider left-side text column */
          gap: 40px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .split-left-area {
          text-align: left;
        }
        .hero-title {
          font-size: clamp(2.2rem, 4.5vw, 3.2rem); /* Clean sizing to prevent text clipping */
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #ffffff;
          line-height: 1.15;
          margin-bottom: 20px;
        }
        .hero-title span {
          background: linear-gradient(135deg, #a5b4fc, #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-desc {
          font-size: clamp(0.75rem, 1.5vw, 0.8rem);
          color: #cbd5e1;
          line-height: 1.6;
          margin-bottom: 0;
          max-width: 480px;
        }

        .split-right-area {
          width: 100%;
        }

        /* Carousel Card */
        .carousel-card {
          background: #11131e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.5);
        }
        .carousel-view {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10.5;
          background: #090a10;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .carousel-view-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background-color: #090a10;
        }
        .carousel-view-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background-color: #090a10;
        }
        
        .carousel-sub-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 16px;
          padding: 0 4px;
        }
        .carousel-indicators {
          display: flex;
          gap: 6px;
        }
        .carousel-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.2s;
        }
        .carousel-dot.active {
          width: 18px;
          border-radius: 100px;
          background: #818cf8;
        }
        .carousel-arrows {
          display: flex;
          gap: 8px;
        }
        .arrow-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .arrow-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.3);
        }

        /* ═══════════════════════════════════════════
           REDESIGNED WHITE THEME SPLIT FORM SECTION
           (Matches user shared screenshot exactly!)
        ═══════════════════════════════════════════ */
        .stepper-section {
          background-color: #f8fafc;
          padding: 40px 0 80px;
          border-top: 1px solid #e2e8f0;
        }
        .stepper-section-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        /* The card frame */
        .stepper-card-wide {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 20px;
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          min-height: 440px;
        }

        /* Card Left Panel (Grid mesh progress + vertical workflow) */
        .stepper-left-panel {
          background-color: #ffffff;
          border-right: 1px solid #cbd5e1;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          text-align: left;
        }
        .card-mesh-bg {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-size: 20px 20px;
          background-image: linear-gradient(to right, #f1f5f9 1px, transparent 1px),
                            linear-gradient(to bottom, #f1f5f9 1px, transparent 1px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.8;
        }
        
        .stepper-left-content {
          position: relative;
          z-index: 1;
        }
        .step-icon-badge {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #fffbeb;
          border: 1.5px solid #fef3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          font-size: 1.6rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .step-left-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        .step-left-desc {
          font-size: 0.95rem;
          color: #475569;
          line-height: 1.5;
        }

        /* Vertical Workflow List - Desktop only */
        .left-panel-workflow-vertical {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin: 24px 0 10px;
        }
        .vertical-step-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .vertical-step-bullet {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f5f3ff;
          border: 1px solid #cbd5e1;
          color: #4f46e5;
          font-size: 0.72rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .vertical-step-text {
          font-size: 0.82rem;
          color: #475569;
          font-weight: 600;
        }

        .step-left-footer {
          position: relative;
          z-index: 1;
          margin-top: 30px;
        }
        .step-progress-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .step-progress-bar-container {
          flex: 1;
          height: 5px;
          background: #e2e8f0;
          border-radius: 100px;
          overflow: hidden;
        }
        .step-progress-bar-fill {
          height: 100%;
          background: #10b981;
          border-radius: 100px;
          transition: width 0.3s ease;
        }
        .step-progress-label {
          font-size: 0.88rem;
          font-weight: 700;
          color: #475569;
        }

        /* Card Right Panel (Inputs) */
        .stepper-right-panel {
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: left;
          background: #ffffff;
        }

        /* Form elements styles */
        .form-group {
          margin-bottom: 18px;
        }
        .form-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 6px;
        }
        .form-label span {
          color: #ef4444;
          margin-left: 2px;
        }
        .form-input, .form-textarea, .form-select {
          width: 100%;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          color: #0f172a;
          padding: 11px 14px;
          font-size: 0.88rem;
          font-family: inherit;
          transition: all 0.2s;
        }
        .form-input::placeholder, .form-textarea::placeholder {
          color: #94a3b8;
        }
        .form-input:focus, .form-textarea:focus, .form-select:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.08);
        }
        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .sections-items-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .section-item-card {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 10px 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s;
        }
        .section-item-card:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }
        .section-item-card.selected {
          background: #f5f3ff;
          border-color: #4f46e5;
        }
        .section-item-card.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .section-item-label {
          font-weight: 700;
          font-size: 0.8rem;
          color: #0f172a;
        }
        .section-item-desc {
          font-size: 0.72rem;
          color: #64748b;
          margin-top: 2px;
        }
        .check-box-element {
          width: 14px;
          height: 14px;
          border-radius: 3px;
          border: 1px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .section-item-card.selected .check-box-element {
          background: #4f46e5;
          border-color: #4f46e5;
        }

        /* Stepper buttons (highly rounded gray buttons matching screenshot button exactly) */
        .stepper-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 24px;
        }
        .stepper-btn {
          flex: 1;
          background: #e5e7eb;
          color: #4b5563;
          border: none;
          padding: 12px 24px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .stepper-btn:hover {
          background: #d1d5db;
        }
        .stepper-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .stepper-btn.btn-active {
          background: #e5e7eb;
          color: #374151;
        }
        .stepper-btn.btn-active:hover {
          background: #d1d5db;
        }
        .stepper-btn.btn-back {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #4b5563;
        }
        .stepper-btn.btn-back:hover {
          background: #f8fafc;
        }

        /* Single line clean footer in light theme */
        .lab-footer {
          border-top: 1px solid #e2e8f0;
          padding: 20px;
          text-align: center;
          color: #64748b;
          font-size: 0.78rem;
          background: #ffffff;
        }
        .lab-footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .lab-footer-separator {
          color: #cbd5e1;
        }
        .lab-footer a {
          color: #4f46e5;
          text-decoration: none;
          transition: text-decoration 0.2s;
        }
        .lab-footer a:hover {
          text-decoration: underline;
        }

        /* HIGHLY DETAILED MOBILE RESPONSIVE OPTIMIZATIONS */
        @media (max-width: 900px) {
          .lab-hero-split-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 55px 24px 35px;
            gap: 36px;
          }
          .split-left-area {
            text-align: center;
            max-width: 100%;
          }
          .hero-title {
            font-size: clamp(1.9rem, 6vw, 2.5rem);
            text-align: center;
            margin: 0 auto 20px;
          }
          .hero-desc {
            font-size: 0.76rem;
            margin: 0 auto;
            text-align: center;
          }
          .split-right-area {
            width: 100%;
            margin: 0 auto;
          }
          .carousel-card {
            max-width: 100%;
          }
          .stepper-card-wide {
            grid-template-columns: 1fr;
            min-height: unset;
          }
          .stepper-left-panel {
            border-right: none;
            border-bottom: 1px solid #cbd5e1;
            padding: 36px 24px;
          }
          .stepper-right-panel {
            padding: 36px 24px;
          }
          .left-panel-workflow-vertical {
            display: none;
          }
        }

        @media (max-width: 600px) {
          .lab-header-inner {
            padding: 12px 16px;
          }
          .lab-logo-text {
            font-size: 0.95rem;
          }
          .back-home-link {
            padding: 6px 12px;
            font-size: 0.75rem;
          }
          
          /* Hero Section Spacing */
          .lab-hero-split-section {
            padding: 50px 16px 30px;
            gap: 32px;
          }
          .hero-title {
            font-size: 1.85rem;
            line-height: 1.25;
            text-align: center;
          }
          .hero-desc {
            font-size: 0.74rem;
            text-align: center;
          }
          
          /* Smaller Mockup Container for Mobile (FlowGen alignment) */
          .split-right-area {
            max-width: 88%;
            margin: 0 auto;
          }
          .carousel-card {
            border-radius: 12px;
          }
          
          .stepper-section {
            padding: 24px 0 60px;
          }
          .stepper-section-container {
            padding: 0 12px;
          }
          .stepper-card-wide {
            border-radius: 14px;
            border: 1px solid #d1d5db;
            max-width: 88%;
            margin: 0 auto;
          }
          .stepper-left-panel {
            padding: 28px 16px;
          }
          .stepper-right-panel {
            padding: 30px 16px;
          }
          .step-left-title {
            font-size: 1.5rem;
          }
          .step-left-desc {
            font-size: 0.88rem;
          }
          .form-group {
            margin-bottom: 16px;
          }
          .form-label {
            font-size: 0.8rem;
          }
          .form-input, .form-textarea {
            padding: 10px 12px;
            font-size: 0.85rem;
          }
          .stepper-btn {
            padding: 11px 20px;
            font-size: 0.82rem;
          }
        }
      `}</style>

      {/* Floating toast alerts */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'error' ? (
            <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
          ) : (
            <Check size={18} style={{ color: '#10b981', flexShrink: 0 }} />
          )}
          <span className="toast-message">{toast.message}</span>
        </div>
      )}

      {/* Hero Section Container (Black Theme wrapper) */}
      <div className="hero-section-wrapper">
        <div className="hero-grid-mesh" />

        {/* Header (White Navbar) */}
        <header className="lab-header">
          <div className="lab-header-inner">
            <Link to="/" className="lab-logo">
              <div className="lab-logo-icon">
                <img src="/images/logo.png" alt="Reqworks Logo" className="lab-logo-img" />
              </div>
              <span className="lab-logo-text">Reqworks<span className="lab-logo-dot">.</span></span>
            </Link>
            <div className="lab-nav-actions">
              <Link to="/" className="back-home-link">Back to Home</Link>
            </div>
          </div>
        </header>

        {/* Split-Screen Hero Section */}
        <section className="lab-hero-split-section">
          
          {/* Left Side: title and description copy (WITHOUT <br /> for natural wrapping) */}
          <div className="split-left-area">
            <h1 className="hero-title">
              See Your Website Before You <span>Pay For It.</span>
            </h1>
            <p className="hero-desc">
              Get a free, personalized preview of your website or brand — designed just for you, no commitment required. Fill in a few details about your business and vision, and our team will send you a real visual concept within 24 hours.
            </p>
          </div>

          {/* Right Side Carousel Card */}
          <div className="split-right-area">
            <div className="carousel-card">
              <div className="carousel-view">
                {CAROUSEL_SLIDES[carouselIndex].type === 'video' ? (
                  <video
                    controls
                    poster="/images/thumbnail.png"
                    src={CAROUSEL_SLIDES[carouselIndex].src}
                    className="carousel-view-video"
                    onEnded={nextSlide}
                    autoPlay={carouselIndex === 3}
                    muted
                    playsInline
                  >
                    Your browser does not support video playback.
                  </video>
                ) : (
                  <img
                    src={CAROUSEL_SLIDES[carouselIndex].src}
                    alt={`Preview Slide ${carouselIndex + 1}`}
                    className="carousel-view-img"
                  />
                )}
              </div>
            </div>

            {/* Indicators & Arrows underneath */}
            <div className="carousel-sub-navigation">
              <div className="carousel-indicators">
                {CAROUSEL_SLIDES.map((_, idx) => (
                  <span
                    key={idx}
                    className={`carousel-dot ${carouselIndex === idx ? 'active' : ''}`}
                  />
                ))}
              </div>
              <div className="carousel-arrows">
                <button onClick={prevSlide} className="arrow-btn">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={nextSlide} className="arrow-btn">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Stepper Form Section (Matches user shared screenshot exactly!) */}
      <section id="stepper-request-form" className="stepper-section">
        <div className="stepper-section-container">
          <div className="stepper-card-wide">
            
            {/* Left Panel: Light Grid Mesh Background, Rocket Icon, Progress Bar */}
            <div className="stepper-left-panel">
              <div className="card-mesh-bg" />
              <div className="stepper-left-content">
                <div className="step-icon-badge">
                  🚀
                </div>
                
                <h3 className="step-left-title">
                  Get free preview
                </h3>
                <p className="step-left-desc">
                  Or call +916352834093
                </p>

                {/* Vertical Workflow List (Desktop only) */}
                <div className="left-panel-workflow-vertical">
                  <div className="vertical-step-item">
                    <span className="vertical-step-bullet">1</span>
                    <span className="vertical-step-text">Submit details</span>
                  </div>
                  <div className="vertical-step-item">
                    <span className="vertical-step-bullet">2</span>
                    <span className="vertical-step-text">Choose scope</span>
                  </div>
                  <div className="vertical-step-item">
                    <span className="vertical-step-bullet">3</span>
                    <span className="vertical-step-text">Define styling</span>
                  </div>
                  <div className="vertical-step-item">
                    <span className="vertical-step-bullet">4</span>
                    <span className="vertical-step-text">Inspect staging</span>
                  </div>
                </div>
              </div>

              <div className="step-left-footer">
                {/* Horizontal solid green progress bar with fraction label beside it */}
                <div className="step-progress-wrapper">
                  <div className="step-progress-bar-container">
                    <div
                      className="step-progress-bar-fill"
                      style={{
                        width: 
                          formStep === 1 ? '33.3%' :
                          formStep === 2 ? '66.6%' : '100%'
                      }}
                    />
                  </div>
                  <div className="step-progress-label">
                    {formStep}/3
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Fields inputs */}
            <div className="stepper-right-panel">

              {/* 2. Main Form Success */}
              {mainSuccess ? (
                <div className="success-box">
                  <div className="success-icon-wrapper">
                    <Check size={24} />
                  </div>
                  <h4 className="success-title">Request Confirmed!</h4>
                  <p className="success-desc">
                    Thanks! Your custom website previews will be generated and emailed to your address within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleMainSubmit}>
                  {mainError && (
                    <div className="alert error">
                      <AlertCircle size={14} />
                      <span>{mainError}</span>
                    </div>
                  )}

                  {/* Honeypot */}
                  <input
                    type="text"
                    name="company_website"
                    value={mainForm.honeypot}
                    onChange={(e) => setMainForm({ ...mainForm, honeypot: e.target.value })}
                    style={{ display: 'none' }}
                    tabIndex="-1"
                    autoComplete="off"
                  />

                  {/* STEP 1: Contact Info */}
                  {formStep === 1 && (
                    <div>
                      <div className="form-group">
                        <label className="form-label">Full Name<span>*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Rohit Sharma"
                          className="form-input"
                          value={mainForm.name}
                          onChange={(e) => setMainForm({ ...mainForm, name: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Email Address<span>*</span></label>
                        <input
                          type="email"
                          required
                          placeholder="Ex: rohit@domain.com"
                          className="form-input"
                          value={mainForm.email}
                          onChange={(e) => setMainForm({ ...mainForm, email: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Website (if you have one)</label>
                        <input
                          type="text"
                          placeholder="Ex: mybusiness.com"
                          className="form-input"
                          value={mainForm.website}
                          onChange={(e) => setMainForm({ ...mainForm, website: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Scope Selection */}
                  {formStep === 2 && (
                    <div>
                      <div className="form-group">
                        <label className="form-label">Business description (what you do)<span>*</span></label>
                        <textarea
                          required
                          placeholder="Ex: D2C mouth-freshener e-commerce platform..."
                          className="form-textarea"
                          value={mainForm.businessDescription}
                          onChange={(e) => setMainForm({ ...mainForm, businessDescription: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Select Sections (Max 3)<span>*</span></label>
                        <div className="sections-items-list">
                          {SECTIONS.map((sec) => {
                            const isSelected = selectedSections.includes(sec.label);
                            const isMaxReached = selectedSections.length >= 3;
                            const isDisabled = isMaxReached && !isSelected;

                            return (
                              <div
                                key={sec.id}
                                onClick={() => !isDisabled && handleSectionToggle(sec.label)}
                                className={`section-item-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                              >
                                <div style={{ textAlign: 'left' }}>
                                  <div className="section-item-label">{sec.label}</div>
                                  <div className="section-item-desc">{sec.desc}</div>
                                </div>
                                <div className="check-box-element">
                                  {isSelected && <Check size={8} style={{ color: '#ffffff' }} />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Brand Vibes */}
                  {formStep === 3 && (
                    <div>
                      <div className="form-group">
                        <label className="form-label">Style & colors ("describe how you want it to look/feel")</label>
                        <textarea
                          placeholder="Ex: Sleek light mode with clean gray borders and periwinkle accents..."
                          className="form-textarea"
                          value={mainForm.styleColors}
                          onChange={(e) => setMainForm({ ...mainForm, styleColors: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Reference website ("any site you love the look of")</label>
                        <input
                          type="text"
                          placeholder="Ex: stripe.com, vercel.com"
                          className="form-input"
                          value={mainForm.referenceWebsite}
                          onChange={(e) => setMainForm({ ...mainForm, referenceWebsite: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Navigation actions */}
                  <div className="stepper-actions">
                    {formStep > 1 && (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="stepper-btn btn-back"
                      >
                        <ChevronLeft size={14} />
                        <span>Back</span>
                      </button>
                    )}

                    {formStep < 3 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        disabled={(formStep === 1 && (!mainForm.name.trim() || !mainForm.email.trim())) || (formStep === 2 && (!mainForm.businessDescription.trim() || selectedSections.length === 0))}
                        className="stepper-btn btn-active"
                        style={{ marginLeft: 'auto' }}
                      >
                        <span>Continue</span>
                        <ChevronRight size={14} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={mainLoading}
                        className="stepper-btn btn-active"
                        style={{ marginLeft: 'auto' }}
                      >
                        {mainLoading ? (
                          <span className="btn-loading-text">
                            <Loader2 size={14} className="spinner" />
                            Submitting...
                          </span>
                        ) : (
                          <>
                            <span>Get my free preview</span>
                            <Check size={14} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Single Line Clean Footer */}
      <footer className="lab-footer">
        <div className="lab-footer-inner">
          <span>&copy; {new Date().getFullYear()} Reqworks Studio. All rights reserved.</span>
          <span className="lab-footer-separator">|</span>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <span className="lab-footer-separator">|</span>
          <Link to="/terms-of-service">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
