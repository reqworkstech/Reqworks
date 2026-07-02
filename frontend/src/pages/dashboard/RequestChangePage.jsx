import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Send, RefreshCw, UploadCloud, MessageSquare, IndianRupee, 
  AlertCircle, CheckCircle, HelpCircle, Loader2, ArrowRight 
} from 'lucide-react';

export default function RequestChangePage() {
  const { user, toast } = useAuth();
  
  // Project list states
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Sub-section A: Re-upload states
  const [dragActive, setDragActive] = useState(false);
  const [reuploadFiles, setReuploadFiles] = useState([]);
  const [reuploading, setReuploading] = useState(false);

  // Sub-section B: Chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatBottomRef = useRef(null);

  // Sub-section C: Bargaining states
  const [offerPrice, setOfferPrice] = useState('');
  const [offerReason, setOfferReason] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  // Load user projects on mount
  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects/user', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects || []);
        if (data.projects.length > 0) {
          // Auto select first project or retrieve persisted focus
          const persistedId = localStorage.getItem('dq-selected-project');
          const found = data.projects.find(p => p._id === persistedId) || data.projects[0];
          setSelectedProject(found);
          fetchChatMessages(found._id);
        }
      }
    } catch (err) {
      console.error('Failed to load user projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchChatMessages = async (projectId) => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/projects/chat/${projectId}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch chat logs:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Poll chat messages every 5 seconds if a project is selected
  useEffect(() => {
    if (!selectedProject) return;
    const interval = setInterval(() => {
      fetchChatMessages(selectedProject._id);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedProject]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleProjectChange = (e) => {
    const id = e.target.value;
    const proj = projects.find(p => p._id === id);
    setSelectedProject(proj);
    setChatMessages([]);
    fetchChatMessages(id);
    // Persist selected focus
    localStorage.setItem('dq-selected-project', id);
  };

  // Sub-section A: Drag & Drop Files processing
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
      processReuploadFiles(e.dataTransfer.files);
    }
  };

  const processReuploadFiles = (filesList) => {
    const valid = [];
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      if (reuploadFiles.length + valid.length >= 5) {
        toast.error('Max 5 files allowed.');
        break;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 10MB.`);
        continue;
      }
      valid.push(file);
    }
    setReuploadFiles(prev => [...prev, ...valid]);
  };

  const handleReuploadSubmit = async () => {
    if (reuploadFiles.length === 0) {
      toast.error('Please attach at least one brief file.');
      return;
    }
    setReuploading(true);

    try {
      const formData = new FormData();
      formData.append('projectName', selectedProject.projectName);
      formData.append('stack', selectedProject.stack);
      formData.append('budget', selectedProject.budget);
      formData.append('requirements', selectedProject.requirements);
      
      reuploadFiles.forEach(f => {
        formData.append('files', f);
      });

      // We re-submit under a modified request update to project endpoint
      const res = await fetch(`/api/projects`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Files re-submitted successfully! The pipeline will update shortly.');
        setReuploadFiles([]);
        fetchProjects(); // Reload projects status
      } else {
        toast.error(data.message || 'File re-upload failed.');
      }
    } catch (err) {
      console.error('Reupload failed:', err);
      toast.error('Network error during file submission.');
    } finally {
      setReuploading(false);
    }
  };

  // Sub-section B: Chat send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSendingMsg(true);

    try {
      const res = await fetch(`/api/projects/chat/${selectedProject._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: newMessage })
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage('');
        fetchChatMessages(selectedProject._id);
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Send message error:', err);
      toast.error('Network error. Failed to dispatch message.');
    } finally {
      setSendingMsg(false);
    }
  };

  // Sub-section C: Counter-offer bargaining
  const handleSendBargain = async (e) => {
    e.preventDefault();
    const price = parseInt(offerPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid counter offer price.');
      return;
    }
    setSubmittingOffer(true);

    try {
      const res = await fetch(`/api/projects/user/decision/${selectedProject._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          decision: 'Bargained',
          bargainPrice: price,
          bargainMessage: offerReason
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Counter-offer submitted to admin review!');
        setOfferPrice('');
        setOfferReason('');
        fetchProjects(); // Refresh project details to locking state
      } else {
        toast.error(data.message || 'Failed to submit offer');
      }
    } catch (err) {
      console.error('Bargain error:', err);
      toast.error('Network error submitting counter-offer.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  if (loadingProjects) {
    return (
      <div style={{ display: 'flex', flex: 1, height: '60vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid var(--dash-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '0.88rem', color: 'var(--dash-text-sec)', fontWeight: 500 }}>Connecting workspace features...</span>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 24px', border: '1.5px dashed var(--dash-border)' }}>
        <MessageSquare size={48} style={{ color: 'var(--dash-text-muted)', marginBottom: '16px' }} />
        <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.4rem', fontWeight: 700 }}>No Projects Available</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--dash-text-sec)', maxWidth: '440px', marginTop: '8px', marginBottom: '24px' }}>
          You need an active project proposal to request changes or negotiate estimations. Submit a project proposal first.
        </p>
        <a href="/dashboard/book" className="dash-btn dash-btn-primary">
          <span>Book Project Now</span>
          <ArrowRight size={16} />
        </a>
      </div>
    );
  }

  const isBargainPending = selectedProject?.userDecision === 'Bargained';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Project Selector header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Request Project Changes</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', margin: '4px 0 0' }}>Manage updates, messages, and budgets.</p>
        </div>

        <div className="dash-input-group" style={{ margin: 0, width: 'auto' }}>
          <select 
            className="dash-input" 
            value={selectedProject?._id} 
            onChange={handleProjectChange}
            style={{ fontWeight: 600 }}
          >
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.projectName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Section Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* SUB-SECTION A: RE-UPLOAD REQUIREMENTS (Visible if stage is Rejected) */}
        {selectedProject?.stage === 'Rejected' && (
          <div className="dash-card" style={{ borderLeft: '4px solid var(--dash-danger)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertCircle size={20} style={{ color: 'var(--dash-danger)' }} />
              <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Re-upload Proposal Brief</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', marginBottom: '20px' }}>
              Your documents were rejected. Please re-upload corrected specs.
            </p>

            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{
                width: '100%', padding: '24px', borderRadius: '8px',
                border: `2px dashed ${dragActive ? 'var(--dash-accent)' : 'var(--dash-border)'}`,
                background: dragActive ? 'rgba(245, 158, 11, 0.03)' : 'var(--dash-card-sec)',
                textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '16px'
              }}
            >
              <UploadCloud size={32} style={{ color: 'var(--dash-text-muted)', marginBottom: '8px' }} />
              <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Drag files here or click to browse</div>
              <input 
                type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
                onChange={e => e.target.files && processReuploadFiles(e.target.files)}
                style={{ display: 'none' }} id="reupload-trigger"
              />
              <button type="button" className="dash-btn dash-btn-secondary" style={{ marginTop: '12px', fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => document.getElementById('reupload-trigger').click()}>
                Select Files
              </button>
            </div>

            {reuploadFiles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                {reuploadFiles.map((file, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '8px', background: 'var(--dash-card)', border: '1px solid var(--dash-border)', borderRadius: '6px' }}>
                    <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    <button style={{ border: 'none', background: 'none', color: 'var(--dash-danger)', cursor: 'pointer' }} onClick={() => setReuploadFiles(prev => prev.filter((_, idx) => idx !== i))}>Remove</button>
                  </div>
                ))}
              </div>
            )}

            <button 
              type="button" 
              className="dash-btn dash-btn-primary" 
              disabled={reuploadFiles.length === 0 || reuploading}
              onClick={handleReuploadSubmit}
            >
              {reuploading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <span>Re-submit Files</span>}
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'stretch' }} className="responsive-split">
          
          {/* SUB-SECTION B: FEATURE CHANGE CHAT THREAD */}
          <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', height: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <MessageSquare size={20} style={{ color: 'var(--dash-accent)' }} />
              <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Specification Chat</h3>
            </div>
            
            {/* Messages body */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--dash-border)', borderRadius: '8px', padding: '16px', background: 'var(--dash-card-sec)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatMessages.length > 0 ? (
                chatMessages.map((msg, i) => {
                  const isClient = msg.sender === 'client';
                  return (
                    <div 
                      key={i} 
                      style={{ 
                        alignSelf: isClient ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        background: isClient ? 'var(--dash-accent)' : 'var(--dash-card)',
                        color: isClient ? '#141210' : 'var(--dash-text)',
                        padding: '10px 14px',
                        borderRadius: isClient ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                        border: isClient ? 'none' : '1px solid var(--dash-border)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{msg.message}</div>
                      <div style={{ fontSize: '0.62rem', color: isClient ? 'rgba(20, 18, 16, 0.6)' : 'var(--dash-text-sec)', textAlign: 'right', marginTop: '4px' }}>
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--dash-text-sec)', fontSize: '0.85rem', textAlign: 'center', padding: '0 16px' }}>
                  No messages yet.
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <input
                type="text"
                className="dash-input"
                placeholder="Message..."
                maxLength={500}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                disabled={sendingMsg}
              />
              <button 
                type="submit" 
                className="dash-btn dash-btn-primary" 
                style={{ width: '44px', height: '44px', padding: 0, borderRadius: '8px', flexShrink: 0 }}
                disabled={sendingMsg || !newMessage.trim()}
              >
                <Send size={18} />
              </button>
            </form>
          </div>

          {/* SUB-SECTION C: BARGAIN / PRICE NEGOTIATION */}
          <div className="dash-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <IndianRupee size={20} style={{ color: 'var(--dash-accent)' }} />
              <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Budget Quote Bargain</h3>
            </div>

            {selectedProject?.priceEstimated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                
                {/* Quote displays */}
                <div style={{ background: 'var(--dash-card-sec)', padding: '16px', borderRadius: '8px', border: '1px solid var(--dash-border)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--dash-text-sec)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Initial Estimate Quoted</div>
                  <div style={{ fontSize: '2rem', fontFamily: 'var(--dash-font-mono)', fontWeight: 800, color: 'var(--dash-accent)', marginTop: '4px' }}>
                    ₹{selectedProject.estimatedPrice.toLocaleString()}
                  </div>
                  {isBargainPending && (
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="dash-badge dash-badge-warning">Pending Review</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--dash-text-sec)' }}>Counter Offer: ₹{selectedProject.bargainPrice.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedProject.userDecision === 'Booked' && (
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="dash-badge dash-badge-success">Accepted / Locked</span>
                    </div>
                  )}
                </div>

                {isBargainPending ? (
                  <div style={{ background: 'rgba(217, 119, 6, 0.04)', border: '1px solid var(--dash-accent)', borderRadius: '8px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <AlertCircle size={20} style={{ color: 'var(--dash-accent)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', lineHeight: 1.5 }}>
                      We are reviewing your counter offer of <strong>₹{selectedProject.bargainPrice.toLocaleString()}</strong>.
                    </span>
                  </div>
                ) : selectedProject.userDecision === 'Booked' ? (
                  <div style={{ background: 'rgba(21, 128, 61, 0.04)', border: '1px solid var(--dash-success)', borderRadius: '8px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <CheckCircle size={20} style={{ color: 'var(--dash-success)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', lineHeight: 1.5 }}>
                      This budget is finalized. Deposit is confirmed.
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleSendBargain} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="dash-input-group" style={{ margin: 0 }}>
                      <label className="dash-label">Your Counter Offer (₹)</label>
                      <input
                        type="number"
                        className="dash-input"
                        placeholder="Amount"
                        value={offerPrice}
                        onChange={e => setOfferPrice(e.target.value)}
                        required
                      />
                    </div>

                    <div className="dash-input-group" style={{ margin: 0 }}>
                      <label className="dash-label">Offer Rationale / Justification</label>
                      <textarea
                        className="dash-input"
                        placeholder="Reason"
                        rows={4}
                        value={offerReason}
                        onChange={e => setOfferReason(e.target.value)}
                        style={{ resize: 'none' }}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="dash-btn dash-btn-primary" 
                      style={{ width: '100%' }}
                      disabled={submittingOffer || !offerPrice}
                    >
                      {submittingOffer ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <span>Send Counter Offer</span>}
                    </button>
                  </form>
                )}

              </div>
            ) : (
              <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px', background: 'var(--dash-card-sec)', border: '1px solid var(--dash-border)', borderRadius: '8px' }}>
                <HelpCircle size={36} style={{ color: 'var(--dash-text-muted)', marginBottom: '12px' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Estimate Pending</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--dash-text-sec)', maxWidth: '280px', marginTop: '6px', margin: 0 }}>
                  Awaiting budget estimation.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .responsive-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
