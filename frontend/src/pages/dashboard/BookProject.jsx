import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, Code, UploadCloud, Calendar, ShieldCheck, 
  HelpCircle, Trash2, Check, AlertTriangle, AlertCircle, Loader2, PhoneCall 
} from 'lucide-react';

const FRONTEND_OPTIONS = ['React', 'Vue.js', 'HTML/CSS/JS'];
const BACKEND_OPTIONS = ['Node.js', 'Express', 'NestJS', 'Django', 'FastAPI', 'Flask', 'Spring Boot'];
const DATABASE_OPTIONS = ['MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Supabase', 'Firebase'];

// Vector Tech Stack Icons Helper
const renderTechIcon = (name) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('react')) {
    return (
      <svg viewBox="0 0 841.9 738.9" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="45" style={{ flexShrink: 0 }}>
        <ellipse cx="420.9" cy="369.5" rx="210.2" ry="369.5" transform="rotate(30 420.9 369.5)"/>
        <ellipse cx="420.9" cy="369.5" rx="210.2" ry="369.5" transform="rotate(90 420.9 369.5)"/>
        <ellipse cx="420.9" cy="369.5" rx="210.2" ry="369.5" transform="rotate(150 420.9 369.5)"/>
        <circle cx="420.9" cy="369.5" r="44" fill="currentColor"/>
      </svg>
    );
  }
  if (normalized.includes('next.js')) {
    return (
      <svg viewBox="0 0 180 180" width="16" height="16" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="90" cy="90" r="90" fill="currentColor"/>
        <path d="M140 135 L80 55 H70 V125 H80 V80 L130 145 Z" fill="#FFF"/>
      </svg>
    );
  }
  if (normalized.includes('vue.js')) {
    return (
      <svg viewBox="0 0 256 221" width="16" height="16" fill="none" style={{ flexShrink: 0 }}>
        <path d="M204.8 0H256L128 220.8L0 0h51.2L128 132.48L204.8 0Z" fill="#41B883"/>
        <path d="M204.8 0H256L128 220.8L0 0h51.2L128 132.48L204.8 0Z" fill="#35495E"/>
      </svg>
    );
  }
  if (normalized.includes('html/css/js')) {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    );
  }
  if (normalized.includes('node.js')) {
    return (
      <svg viewBox="0 0 256 295" width="16" height="16" fill="none" style={{ flexShrink: 0 }}>
        <path d="M144.3 6.9L44.8 64.3c-7 4-11.4 11.5-11.4 19.6v114.9c0 8.1 4.3 15.6 11.4 19.6l99.5 57.4c7 4 15.7 4 22.7 0l99.5-57.4c7-4 11.4-11.5 11.4-19.6V83.9c0-8.1-4.3-15.6-11.4-19.6l-99.5-57.4c-7-4-15.7-4-22.7 0z" fill="#339933"/>
      </svg>
    );
  }
  if (normalized.includes('django')) {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
        <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor"/>
        <text x="7" y="17" fill="var(--dash-card)" fontSize="14" fontWeight="bold" fontFamily="sans-serif">D</text>
      </svg>
    );
  }
  if (normalized.includes('fastapi')) {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" style={{ flexShrink: 0 }}>
        <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor"/>
        <path d="M13 5L7 13H11L10 19L17 11H13V5Z" fill="var(--dash-card)"/>
      </svg>
    );
  }
  if (normalized.includes('spring boot')) {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" style={{ flexShrink: 0 }}>
        <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor"/>
        <circle cx="12" cy="12" r="5" fill="var(--dash-card)"/>
      </svg>
    );
  }
  if (normalized.includes('mongodb')) {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" style={{ flexShrink: 0 }}>
        <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor"/>
        <path d="M12 4C10 7 9 10 9 12C9 15 11 18 12 20C13 18 15 15 15 12C15 10 14 7 12 4Z" fill="var(--dash-card)"/>
      </svg>
    );
  }
  if (normalized.includes('postgresql')) {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" style={{ flexShrink: 0 }}>
        <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor"/>
        <text x="6" y="17" fill="var(--dash-card)" fontSize="14" fontWeight="bold">P</text>
      </svg>
    );
  }
  if (normalized.includes('mysql')) {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" style={{ flexShrink: 0 }}>
        <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor"/>
        <text x="6" y="17" fill="var(--dash-card)" fontSize="14" fontWeight="bold">M</text>
      </svg>
    );
  }
  if (normalized.includes('firebase')) {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" style={{ flexShrink: 0 }}>
        <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor"/>
        <path d="M6 18L12 4L18 18H6Z" fill="var(--dash-card)"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  );
};

export default function BookProject() {
  const { user, toast } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [projectName, setProjectName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('To Be Estimated (TBD)'); // Target Budget Allocation Removed
  
  const [letTeamChooseStack, setLetTeamChooseStack] = useState(false);
  const [selectedFrontend, setSelectedFrontend] = useState('');
  const [selectedBackend, setSelectedBackend] = useState('');
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [needsAi, setNeedsAi] = useState(false);
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [deployPlatform, setDeployPlatform] = useState('Vercel');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Normal');

  // Callback States
  const [callbackRequested, setCallbackRequested] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState(user?.phone || '');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const getMinDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // AI Validator states
  const [validatingStack, setValidatingStack] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [showRecommender, setShowRecommender] = useState(false);

  // Drag and Drop State
  const [dragActive, setDragActive] = useState(false);

  // Multi-step progression validation
  const canGoNext = () => {
    if (step === 1) {
      if (callbackRequested) {
        return callbackPhone.trim() !== '';
      }
      return projectName.trim() !== '' && tagline.trim() !== '' && description.trim() !== '';
    }
    if (step === 2) {
      if (letTeamChooseStack) return true;
      return selectedFrontend !== '' && selectedBackend !== '' && selectedDatabase !== '';
    }
    if (step === 3) {
      if (callbackRequested) {
        return callbackPhone.trim() !== '';
      }
      return uploadedFiles.length > 0; // Documents are required
    }
    if (step === 4) {
      return deployPlatform !== '' && deadline !== '';
    }
    return true;
  };

  const handleNextStep = () => {
    if (canGoNext()) {
      setStep(prev => prev + 1);
    } else {
      toast.error('Please complete all required fields for this step.');
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  // Step 2: Validate stack compatibility asynchronously (Silently in UI card, no toasters)
  const handleValidateStack = async (fe, be, db, aiVal = needsAi) => {
    if (!fe || !be || !db) return;
    setValidatingStack(true);
    setValidationResult(null);

    try {
      const res = await fetch('/api/projects/ai/validate-stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stack: [fe, be, db],
          description: description,
          needsAi: aiVal
        })
      });
      const data = await res.json();
      if (data.success) {
        setValidationResult({
          feasible: data.feasible,
          concerns: data.concerns || [],
          alternatives: data.alternatives || [],
          recommendation: data.recommendation
        });
      }
    } catch (err) {
      console.error('Stack check failed:', err);
      // Fallback
      setValidationResult({
        feasible: true,
        concerns: [],
        alternatives: [],
        recommendation: 'Standard tech stack selected. Proceed to next step.'
      });
    } finally {
      setValidatingStack(false);
    }
  };

  const handleNeedsAiChange = (val) => {
    setNeedsAi(val);
    if (selectedFrontend && selectedBackend && selectedDatabase) {
      handleValidateStack(selectedFrontend, selectedBackend, selectedDatabase, val);
    }
  };

  const selectStackItem = (type, val) => {
    if (letTeamChooseStack) return; // Ignore if user checked "let team choose stack"
    
    let fe = selectedFrontend;
    let be = selectedBackend;
    let db = selectedDatabase;

    if (type === 'frontend') { setSelectedFrontend(val); fe = val; }
    if (type === 'backend') { setSelectedBackend(val); be = val; }
    if (type === 'database') { setSelectedDatabase(val); db = val; }

    if (fe && be && db) {
      handleValidateStack(fe, be, db, needsAi);
    }
  };

  // Step 3: Handle Files Drop/Select
  const processFiles = (filesList) => {
    const validFiles = [];
    const allowedMimeTypes = [
      'application/pdf', 'image/png', 'image/jpeg', 'text/plain', 'text/markdown'
    ];
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.txt', '.md'];

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (uploadedFiles.length + validFiles.length >= 5) {
        toast.error('You can only upload up to 5 files in total.');
        break;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds the 10MB size limit.`);
        continue;
      }
      if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
        toast.error(`Invalid file format: ${file.name}. Only PDF, MD, TXT, and Images are allowed.`);
        continue;
      }
      validFiles.push(file);
    }
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (idx) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Stack Recommender helper tool
  const applyRecommendedStack = (fe, be, db, wantsAi = false) => {
    setSelectedFrontend(fe);
    setSelectedBackend(be);
    setSelectedDatabase(db);
    setNeedsAi(wantsAi);
    setShowRecommender(false);
    handleValidateStack(fe, be, db, wantsAi);
  };

  // Step 5: Submit form data multipart
  const handleSubmitProposal = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    if (step === 5 && !termsAccepted) {
      toast.error('Please confirm that the briefs correspond to your specifications.');
      return;
    }

    setSubmitting(true);
    
    try {
      const formData = new FormData();
      const finalProjectName = callbackRequested && !projectName.trim() 
        ? `Callback Request - ${user?.name || 'User'}` 
        : projectName;
      formData.append('projectName', finalProjectName);
      
      let finalStack = '';
      if (callbackRequested) {
        finalStack = 'Callback Requested (TBD)';
      } else if (letTeamChooseStack) {
        finalStack = 'Team Choice (TBD)';
      } else {
        finalStack = `${selectedFrontend}, ${selectedBackend}, ${selectedDatabase}`;
      }
      
      formData.append('stack', finalStack);
      formData.append('budget', budget);
      formData.append('requirements', JSON.stringify({
        tagline,
        description,
        deployPlatform: callbackRequested ? 'TBD' : deployPlatform,
        deadline: callbackRequested ? 'TBD' : deadline,
        priority,
        needsAi,
        callbackRequested,
        callbackPhone
      }));
      formData.append('needsAi', needsAi);
      formData.append('callbackRequested', callbackRequested);
      formData.append('callbackPhone', callbackPhone);

      // Only upload files if not a direct callback request
      if (!callbackRequested) {
        uploadedFiles.forEach(file => {
          formData.append('files', file);
        });
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Project request submitted successfully!');
        navigate('/dashboard/track');
      } else {
        toast.error(data.message || 'Failed to submit proposal');
      }
    } catch (err) {
      console.error('Proposal submission error:', err);
      toast.error('Network error during project request submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Step Stepper Header */}
      <div className="dash-stepper" style={{ marginBottom: '40px' }}>
        {[
          { label: 'Basics', icon: FileText, num: 1 },
          { label: 'Stack Choice', icon: Code, num: 2 },
          { label: 'Brief Docs', icon: UploadCloud, num: 3 },
          { label: 'Deadline', icon: Calendar, num: 4 },
          { label: 'Review', icon: ShieldCheck, num: 5 }
        ].map((s) => {
          const Icon = s.icon;
          const isCompleted = step > s.num;
          const isActive = step === s.num;
          return (
            <div key={s.num} className={`dash-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
              <div className="dash-step-circle">
                {isCompleted ? <Check size={18} /> : <span>{s.num}</span>}
              </div>
              <span className="dash-step-label hidden-mobile">{s.label}</span>
            </div>
          );
        })}
      </div>

      <div className="dash-card">
        
        {/* STEP 1: BASICS */}
        {step === 1 && (
          <div>
            <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.4rem', marginBottom: '8px' }}>Project Basics</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', marginBottom: '24px' }}>Name and scope your project.</p>

            <div className="dash-input-group">
              <label className="dash-label">Project Title</label>
              <input 
                type="text" 
                className="dash-input" 
                placeholder="Project title" 
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
              />
            </div>

            <div className="dash-input-group">
              <label className="dash-label">Tagline / Motto (Max 80 chars)</label>
              <input 
                type="text" 
                className="dash-input" 
                placeholder="Tagline" 
                maxLength={80}
                value={tagline}
                onChange={e => setTagline(e.target.value)}
              />
            </div>

            <div className="dash-input-group">
              <label className="dash-label">Brief Description (Max 300 chars)</label>
              <textarea 
                className="dash-input" 
                placeholder="Brief description..."
                rows={4}
                maxLength={300}
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ resize: 'none' }}
              />
              <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
                {description.length}/300 chars
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '16px', padding: '12px', background: 'var(--dash-card-sec)', borderRadius: '10px', border: '1px solid var(--dash-border)' }}>
              <input 
                type="checkbox" 
                id="non-tech-callback" 
                style={{ accentColor: 'var(--dash-accent)', width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px' }} 
                checked={callbackRequested}
                onChange={e => setCallbackRequested(e.target.checked)}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <label htmlFor="non-tech-callback" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dash-text)', cursor: 'pointer', userSelect: 'none' }}>
                  I am Non-Technical (Request an instant callback)
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--dash-text-sec)' }}>
                  Check this to skip selecting frameworks, deployment setups, and uploading briefs. Our engineering team will call you to plan everything.
                </span>
              </div>
            </div>

            {callbackRequested && (
              <>
                <div className="dash-input-group" style={{ marginTop: '20px', animation: 'fade-in 0.3s ease' }}>
                  <label className="dash-label">Callback Phone Number</label>
                  <input 
                    type="tel" 
                    className="dash-input" 
                    placeholder="e.g. +91 99999 99999" 
                    value={callbackPhone}
                    onChange={e => setCallbackPhone(e.target.value.replace(/[^\d+ ]/g, ''))}
                    required
                  />
                </div>
                
                <hr style={{ border: 'none', borderTop: '1px solid var(--dash-border)', margin: '24px 0 20px' }} />
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="dash-btn"
                    onClick={handleSubmitProposal}
                    disabled={submitting || !callbackPhone.trim()}
                    style={{
                      background: '#67a884',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      opacity: callbackPhone.trim() ? 1 : 0.6,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Callback Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 2: TECH STACK */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.4rem', margin: 0 }}>Choose Tech Stack</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', margin: '4px 0 0' }}>Choose a development framework bundle.</p>
              </div>
              {!letTeamChooseStack && (
                <button 
                  type="button" 
                  className="dash-btn dash-btn-secondary" 
                  style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                  onClick={() => setShowRecommender(true)}
                >
                  <HelpCircle size={14} />
                  <span>Help Me Choose</span>
                </button>
              )}
            </div>

            {/* Let team choose option */}
            <div 
              className="dash-card" 
              onClick={() => {
                const newVal = !letTeamChooseStack;
                setLetTeamChooseStack(newVal);
                if (newVal) {
                  setSelectedFrontend('');
                  setSelectedBackend('');
                  setSelectedDatabase('');
                  setValidationResult(null);
                }
              }}
              style={{
                padding: '16px',
                marginBottom: '24px',
                background: letTeamChooseStack ? 'var(--dash-bg)' : 'var(--dash-card-sec)',
                border: letTeamChooseStack ? '2px solid var(--dash-accent)' : '1px solid var(--dash-border)',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
              }}
            >
              <input 
                type="checkbox" 
                checked={letTeamChooseStack}
                onChange={() => {}} // handled by parent div click
                style={{ width: '18px', height: '18px', accentColor: 'var(--dash-accent)', cursor: 'pointer' }}
              />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--dash-text)' }}>
                  Let the Reqworks team choose the tech stack for me
                </h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--dash-text-sec)', lineHeight: 1.4 }}>
                  Our team will select the optimal stack post-audit.
                </p>
              </div>
            </div>

            {/* AI Integration Option */}
            {!letTeamChooseStack && (
              <div 
                className="dash-card" 
                onClick={() => {
                  const newVal = !needsAi;
                  handleNeedsAiChange(newVal);
                }}
                style={{
                  padding: '16px',
                  marginBottom: '24px',
                  background: needsAi ? 'rgba(245, 158, 11, 0.04)' : 'var(--dash-card-sec)',
                  border: needsAi ? '2px solid var(--dash-accent)' : '1px solid var(--dash-border)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={needsAi}
                  onChange={() => {}} // handled by parent click
                  style={{ width: '18px', height: '18px', accentColor: 'var(--dash-accent)', cursor: 'pointer' }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--dash-text)' }}>
                    Include AI Integration or AI Functionality
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--dash-text-sec)', lineHeight: 1.4 }}>
                    Add intelligence: AI models, smart features, chatbots, or custom recommendations.
                  </p>
                </div>
              </div>
            )}

            {/* Selector Grid */}
            {!letTeamChooseStack && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
                
                {/* Frontend select */}
                <div className="dash-card" style={{ padding: '16px', background: 'var(--dash-card-sec)' }}>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--dash-text-sec)', marginBottom: '12px' }}>Frontend</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {FRONTEND_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => selectStackItem('frontend', opt)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--dash-border)',
                          background: selectedFrontend === opt ? 'var(--dash-accent)' : 'var(--dash-card)',
                          color: selectedFrontend === opt ? '#141210' : 'var(--dash-text)',
                          fontWeight: selectedFrontend === opt ? 700 : 500, cursor: 'pointer', textAlign: 'left',
                          transition: 'all 0.2s'
                        }}
                      >
                        {renderTechIcon(opt)}
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Backend select */}
                <div className="dash-card" style={{ padding: '16px', background: 'var(--dash-card-sec)' }}>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--dash-text-sec)', marginBottom: '12px' }}>Backend</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {BACKEND_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => selectStackItem('backend', opt)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--dash-border)',
                          background: selectedBackend === opt ? 'var(--dash-accent)' : 'var(--dash-card)',
                          color: selectedBackend === opt ? '#141210' : 'var(--dash-text)',
                          fontWeight: selectedBackend === opt ? 700 : 500, cursor: 'pointer', textAlign: 'left',
                          transition: 'all 0.2s'
                        }}
                      >
                        {renderTechIcon(opt)}
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Database select */}
                <div className="dash-card" style={{ padding: '16px', background: 'var(--dash-card-sec)' }}>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--dash-text-sec)', marginBottom: '12px' }}>Database</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {DATABASE_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => selectStackItem('database', opt)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--dash-border)',
                          background: selectedDatabase === opt ? 'var(--dash-accent)' : 'var(--dash-card)',
                          color: selectedDatabase === opt ? '#141210' : 'var(--dash-text)',
                          fontWeight: selectedDatabase === opt ? 700 : 500, cursor: 'pointer', textAlign: 'left',
                          transition: 'all 0.2s'
                        }}
                      >
                        {renderTechIcon(opt)}
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI Stack Validator Feedback Panel */}
            {!letTeamChooseStack && validatingStack && (
              <div className="dash-card" style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--dash-accent)' }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--dash-text-sec)', fontWeight: 500 }}>AI checking stack feasibility...</span>
              </div>
            )}

            {!letTeamChooseStack && validationResult && !validatingStack && (
              <div className="dash-card" style={{ marginTop: '24px', borderLeft: `4px solid ${validationResult.feasible ? 'var(--dash-success)' : 'var(--dash-danger)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  {validationResult.feasible ? (
                    <Check style={{ color: 'var(--dash-success)' }} size={20} />
                  ) : (
                    <AlertTriangle style={{ color: 'var(--dash-danger)' }} size={20} />
                  )}
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
                    AI Evaluation: {validationResult.feasible ? 'Highly Compatible Stack' : 'Stack Compatibility Warning'}
                  </h4>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', lineHeight: 1.6, margin: '0 0 16px' }}>
                  {validationResult.recommendation}
                </p>

                {validationResult.concerns.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dash-text-sec)', marginBottom: '6px' }}>Concerns</div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--dash-danger)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {validationResult.concerns.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}

                {validationResult.alternatives.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dash-text-sec)', marginBottom: '6px' }}>Suggested Combinations</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {validationResult.alternatives.map((a, i) => (
                        <span key={i} className="dash-badge dash-badge-info" style={{ textTransform: 'none', fontSize: '0.72rem' }}>{a}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: SPECIFICATIONS / CALLBACK */}
        {step === 3 && (
          <div>
            <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.4rem', marginBottom: '4px' }}>Project Specifications</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', marginBottom: '24px' }}>
              Choose how you want to provide project details to our team.
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div 
                onClick={() => setCallbackRequested(false)}
                style={{
                  flex: '1 1 280px',
                  padding: '20px',
                  background: !callbackRequested ? 'rgba(245, 158, 11, 0.04)' : 'var(--dash-card-sec)',
                  border: !callbackRequested ? '2px solid var(--dash-accent)' : '1px solid var(--dash-border)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  gap: '12px'
                }}
              >
                <input 
                  type="radio" 
                  checked={!callbackRequested}
                  onChange={() => {}}
                  style={{ accentColor: 'var(--dash-accent)', width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px' }}
                />
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--dash-text)' }}>
                    Upload Project Briefs
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--dash-text-sec)', lineHeight: 1.4 }}>
                    Submit PDF, images, or documents detailing your system requirements.
                  </p>
                </div>
              </div>

              <div 
                onClick={() => setCallbackRequested(true)}
                style={{
                  flex: '1 1 280px',
                  padding: '20px',
                  background: callbackRequested ? 'rgba(245, 158, 11, 0.04)' : 'var(--dash-card-sec)',
                  border: callbackRequested ? '2px solid var(--dash-accent)' : '1px solid var(--dash-border)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  gap: '12px'
                }}
              >
                <input 
                  type="radio" 
                  checked={callbackRequested}
                  onChange={() => {}}
                  style={{ accentColor: 'var(--dash-accent)', width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px' }}
                />
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--dash-text)' }}>
                    Request Callback from Team
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--dash-text-sec)', lineHeight: 1.4 }}>
                    No documents ready? Our team will call you to discuss requirements.
                  </p>
                </div>
              </div>
            </div>

            {!callbackRequested ? (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                style={{
                  width: '100%',
                  padding: '40px 24px',
                  border: `2px dashed ${dragActive ? 'var(--dash-accent)' : 'var(--dash-border)'}`,
                  borderRadius: '12px',
                  background: dragActive ? 'rgba(245, 158, 11, 0.03)' : 'var(--dash-card-sec)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <UploadCloud size={48} style={{ color: dragActive ? 'var(--dash-accent)' : 'var(--dash-text-muted)', marginBottom: '16px' }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--dash-text)' }}>Drag files here or click to browse</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--dash-text-sec)', marginTop: '6px' }}>Supports PDF, PNG, JPG, JPEG, TXT, MD</div>
                
                <input 
                  type="file" 
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
                  onChange={e => e.target.files && processFiles(e.target.files)}
                  style={{ display: 'none' }}
                  id="file-input-trigger"
                />
                <button 
                  type="button" 
                  className="dash-btn dash-btn-secondary" 
                  style={{ marginTop: '16px', fontSize: '0.8rem' }}
                  onClick={() => document.getElementById('file-input-trigger').click()}
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div className="dash-input-group" style={{ marginTop: '24px' }}>
                <label className="dash-label">Callback Phone Number</label>
                <input 
                  type="tel" 
                  className="dash-input" 
                  placeholder="Enter your contact number" 
                  value={callbackPhone}
                  onChange={e => setCallbackPhone(e.target.value)}
                  style={{ maxWidth: '400px' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--dash-text-sec)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PhoneCall size={14} style={{ color: 'var(--dash-accent)' }} />
                  <span>Our team will contact you at this number to discuss your project specifications.</span>
                </p>
              </div>
            )}

            {/* File List */}
            {uploadedFiles.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--dash-text-sec)', marginBottom: '12px' }}>Uploaded Files ({uploadedFiles.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {uploadedFiles.map((file, idx) => {
                    const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(file.name);
                    return (
                      <div key={idx} style={{ 
                        padding: '10px 14px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        background: 'var(--dash-bg)', 
                        border: '1.5px solid var(--dash-border)',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          {isImg ? (
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={file.name} 
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--dash-border)', flexShrink: 0 }} 
                            />
                          ) : (
                            <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dash-card-sec)', borderRadius: '6px', flexShrink: 0 }}>
                              <FileText size={18} style={{ color: 'var(--dash-accent)' }} />
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 600, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--dash-text-sec)', display: 'block' }}>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeFile(idx)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--dash-danger)', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: DEPLOYMENT & DEADLINE */}
        {step === 4 && (
          <div>
            <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.4rem', marginBottom: '8px' }}>Deployment & Deadline</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', marginBottom: '24px' }}>Specify project priorities, launch timing, and destination hosts.</p>

            <div className="dash-input-group">
              <label className="dash-label">Preferred Deployment Host</label>
              <select 
                className="dash-input" 
                value={deployPlatform} 
                onChange={e => setDeployPlatform(e.target.value)}
              >
                {['Vercel', 'Netlify', 'AWS', 'DigitalOcean', 'VPS', 'Other'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="dash-input-group">
              <label className="dash-label">Target Completion Date</label>
              <input 
                type="date" 
                className="dash-input" 
                min={getMinDateString()} 
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            </div>

            <div className="dash-input-group">
              <label className="dash-label">Priority Tier</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['Normal', 'Urgent'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--dash-border)',
                      background: priority === p ? 'var(--dash-accent)' : 'var(--dash-card)',
                      color: priority === p ? '#141210' : 'var(--dash-text)',
                      fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {p === 'Urgent' ? '⚡ Urgent Priority' : '🛡️ Normal Priority'}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--dash-text-sec)', marginTop: '6px', margin: 0 }}>
                *Urgent priority may affect pricing.
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & SUBMIT */}
        {step === 5 && (
          <div>
            <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.4rem', marginBottom: '8px' }}>Confirm Proposal</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', marginBottom: '24px' }}>Review your project specifications before submitting.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Basics summary */}
              <div className="dash-card" style={{ background: 'var(--dash-card-sec)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '0.88rem', textTransform: 'uppercase', color: 'var(--dash-text-sec)', margin: 0 }}>1. Basics</h4>
                  <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--dash-accent)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>Edit</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
                  <div><strong>Title:</strong> {projectName}</div>
                  <div><strong>Tagline:</strong> {tagline}</div>
                  <div><strong>Budget:</strong> To Be Estimated (TBD)</div>
                  <div style={{ color: 'var(--dash-text-sec)' }}>{description}</div>
                </div>
              </div>

              {/* Stack summary */}
              <div className="dash-card" style={{ background: 'var(--dash-card-sec)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '0.88rem', textTransform: 'uppercase', color: 'var(--dash-text-sec)', margin: 0 }}>2. Framework Stack</h4>
                  <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'var(--dash-accent)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>Edit</button>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {letTeamChooseStack ? (
                    <span className="dash-badge dash-badge-warning">TBD (Let Reqworks Choose Stack)</span>
                  ) : (
                    <>
                      <span className="dash-badge dash-badge-success">{selectedFrontend}</span>
                      <span className="dash-badge dash-badge-info">{selectedBackend}</span>
                      <span className="dash-badge dash-badge-warning">{selectedDatabase}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Files summary */}
              <div className="dash-card" style={{ background: 'var(--dash-card-sec)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '0.88rem', textTransform: 'uppercase', color: 'var(--dash-text-sec)', margin: 0 }}>
                    {callbackRequested ? '3. Callback Request' : '3. Attached Files'}
                  </h4>
                  <button onClick={() => setStep(3)} style={{ background: 'none', border: 'none', color: 'var(--dash-accent)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>Edit</button>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--dash-text-sec)' }}>
                  {callbackRequested ? (
                    <div>
                      <strong>Status:</strong> Callback requested from the engineering team.<br />
                      <strong>Phone:</strong> {callbackPhone}
                    </div>
                  ) : (
                    uploadedFiles.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '18px' }}>
                        {uploadedFiles.map((f, i) => <li key={i}>{f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)</li>)}
                      </ul>
                    ) : (
                      <span>No documentation files attached.</span>
                    )
                  )}
                </div>
              </div>

              {/* Details summary */}
              <div className="dash-card" style={{ background: 'var(--dash-card-sec)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '0.88rem', textTransform: 'uppercase', color: 'var(--dash-text-sec)', margin: 0 }}>4. Schedule & Handoff</h4>
                  <button onClick={() => setStep(4)} style={{ background: 'none', border: 'none', color: 'var(--dash-accent)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>Edit</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
                  <div><strong>Target Deployment Host:</strong> {deployPlatform}</div>
                  <div><strong>Deadline Target:</strong> {deadline}</div>
                  <div><strong>Tier Priority:</strong> {priority}</div>
                </div>
              </div>

              {/* Checkbox confirmation */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '8px' }}>
                <input 
                  type="checkbox" 
                  id="confirm-spec" 
                  style={{ accentColor: 'var(--dash-accent)', width: '16px', height: '16px', cursor: 'pointer', marginTop: '3px' }} 
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                  required
                />
                <label htmlFor="confirm-spec" style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', cursor: 'pointer', userSelect: 'none' }}>
                  I confirm that all attached briefs and frameworks correspond to my system specifications.
                </label>
              </div>

            </div>
          </div>
        )}

        {/* Action Button Navigation Row */}
        {!(callbackRequested && step === 1) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--dash-border)', paddingTop: '20px', marginTop: '32px' }}>
          {step > 1 ? (
            <button 
              type="button" 
              className="dash-btn dash-btn-secondary" 
              onClick={handlePrevStep}
              disabled={submitting}
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            callbackRequested && step === 1 ? (
              <button 
                type="button" 
                className="dash-btn dash-btn-primary" 
                onClick={handleSubmitProposal}
                disabled={submitting || !canGoNext()}
                style={{ background: 'var(--dash-success)', color: '#fff', opacity: canGoNext() ? 1 : 0.6 }}
              >
                {submitting ? 'Submitting...' : 'Submit Callback Request'}
              </button>
            ) : (
              <button 
                type="button" 
                className="dash-btn dash-btn-primary" 
                onClick={handleNextStep}
                disabled={!canGoNext()}
                style={{ opacity: canGoNext() ? 1 : 0.6 }}
              >
                Next Step →
              </button>
            )
          ) : (
            <button 
              type="submit" 
              className="dash-btn dash-btn-primary" 
              onClick={handleSubmitProposal}
              disabled={submitting || !termsAccepted}
              style={{ background: 'var(--dash-success)', color: '#fff', opacity: termsAccepted ? 1 : 0.6 }}
            >
              {submitting ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Submitting Proposal...</span>
                </div>
              ) : (
                <span>Send Project Request →</span>
              )}
            </button>
          )}
        </div>
        )}

      </div>

      {/* TECH RECOMMENDER MODAL */}
      {showRecommender && (
        <div className="dash-modal-backdrop" onClick={() => setShowRecommender(false)}>
          <div className="dash-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="dash-modal-header">
              <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Stack Suggestion Guide</h3>
              <button onClick={() => setShowRecommender(false)} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--dash-text-sec)' }}>×</button>
            </div>
            
            <div className="dash-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', margin: 0 }}>Select a blueprint to auto-fill recommended tags:</p>
              
              {[
                {
                  title: 'E-Commerce / Store Marketplace',
                  desc: 'Standard shopping stack.',
                  features: 'Best for: Shopping carts, payment integrations, inventory databases.',
                  fe: 'React', be: 'Node.js', db: 'PostgreSQL',
                  wantsAi: false
                },
                {
                  title: 'AI / Data Processing Engine',
                  desc: 'Low latency compute stack.',
                  features: 'Best for: Chatbot assistants, natural language searches, prediction engines.',
                  fe: 'Next.js', be: 'FastAPI', db: 'PostgreSQL',
                  wantsAi: true
                },
                {
                  title: 'Real-time Chat & Collaboration',
                  desc: 'Real-time data stack.',
                  features: 'Best for: Live messages, presence indicators, socket updates.',
                  fe: 'React', be: 'Node.js', db: 'MongoDB',
                  wantsAi: false
                },
                {
                  title: 'SaaS Dashboard & Business Metrics',
                  desc: 'Business metrics stack.',
                  features: 'Best for: Subscription billing, reporting grids, heavy admin loads.',
                  fe: 'Next.js', be: 'Spring Boot', db: 'MySQL',
                  wantsAi: false
                },
                {
                  title: 'Dynamic Content / Blog / CMS Portal',
                  desc: 'Dynamic SEO meta-stack.',
                  features: 'Best for: High performance blogs, serverless pages, SEO crawlers.',
                  fe: 'Next.js', be: 'Node.js', db: 'MongoDB',
                  wantsAi: false
                },
                {
                  title: 'Mobile-First Social Media Feed',
                  desc: 'Quick real-time mobile feed.',
                  features: 'Best for: User profiles, media attachments, auth flows.',
                  fe: 'Vue.js', be: 'Django', db: 'Firebase',
                  wantsAi: false
                },
                {
                  title: 'Analytics & Time-Series Dashboard',
                  desc: 'High-performance streaming engine.',
                  features: 'Best for: Streaming iot sensors, complex time-series queries.',
                  fe: 'React', be: 'FastAPI', db: 'PostgreSQL',
                  wantsAi: false
                },
                {
                  title: 'Lightweight Landing Page / MVP',
                  desc: 'Simple markup with minimal overhead.',
                  features: 'Best for: Static views, simple lead captures, maximum speed.',
                  fe: 'HTML/CSS/JS', be: 'Node.js', db: 'Firebase',
                  wantsAi: false
                }
              ].map((rec, idx) => (
                <div 
                  key={idx} 
                  className="dash-card dash-card-hover" 
                  onClick={() => applyRecommendedStack(rec.fe, rec.be, rec.db, rec.wantsAi)}
                  style={{ padding: '14px', background: 'var(--dash-card-sec)', cursor: 'pointer', border: '1px solid var(--dash-border)', display: 'flex', flexDirection: 'column', gap: '4px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--dash-accent)' }}>{rec.title}</div>
                    {rec.wantsAi && (
                      <span className="dash-badge dash-badge-warning" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>AI Powered</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--dash-text)' }}>{rec.desc}</div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--dash-text-sec)', margin: '4px 0 8px', lineHeight: 1.4 }}>{rec.features}</p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="dash-badge dash-badge-muted" style={{ fontSize: '0.65rem', textTransform: 'none' }}>FE: {rec.fe}</span>
                    <span className="dash-badge dash-badge-muted" style={{ fontSize: '0.65rem', textTransform: 'none' }}>BE: {rec.be}</span>
                    <span className="dash-badge dash-badge-muted" style={{ fontSize: '0.65rem', textTransform: 'none' }}>DB: {rec.db}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="dash-modal-footer">
              <button className="dash-btn dash-btn-secondary" onClick={() => setShowRecommender(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

    </div>
  );
}
