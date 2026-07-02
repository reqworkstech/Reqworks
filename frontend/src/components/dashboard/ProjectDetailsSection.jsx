import React from 'react';
import { 
  FileText, Download, Sparkles, MessageSquare, AlertTriangle, 
  PhoneCall, Play, Trash2, ArrowRight
} from 'lucide-react';

export default function ProjectDetailsSection({
  selectedProject,
  setSelectedProject,
  aiAnalysisResult,
  aiAnalyzing,
  chatMessageInput,
  setChatMessageInput,
  chatLoading,
  handleAdminSubmitChat,
  estimateInput,
  setEstimateInput,
  handleSaveEstimate,
  handleBargainAction,
  bargainActionLoading,
  STAGES,
  COLUMN_COLORS,
  handleUpdateStage,
  formatRequirements,
  downloadBriefText
}) {
  const reqs = formatRequirements(selectedProject.requirements);
  const isCallback = selectedProject.callbackRequested || reqs.callbackRequested;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header: breadcrumb, title, back button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--dash-border)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--dash-text-sec)', fontWeight: 500 }}>
            <span style={{ cursor: 'pointer', color: 'var(--dash-accent)' }} onClick={() => setSelectedProject(null)}>Workspace</span>
            <span>/</span>
            <span style={{ color: 'var(--dash-text)' }}>{selectedProject.projectName}</span>
          </div>
          <h2 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--dash-text)' }}>
            {selectedProject.projectName}
          </h2>

        </div>

        <button 
          className="dash-btn" 
          onClick={() => setSelectedProject(null)}
          style={{ 
            background: 'var(--dash-card-sec)', 
            color: 'var(--dash-text)', 
            border: '1px solid var(--dash-border)', 
            padding: '8px 16px', 
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          ← Back to Projects List
        </button>
      </div>

      {/* Main project workspace grid */}
      <div className="admin-dashboard-two-col" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: Brief Specifications, AI Specs Analyzer, User Requested Changes (Chat) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 1. Client & Brief Specifications Card */}
          <div className="dash-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--dash-accent)', color: '#FFF', fontSize: '1.1rem', fontWeight: 800, display: 'grid', placeItems: 'center' }}>
                  {selectedProject.clientName ? selectedProject.clientName.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--dash-text)' }}>{selectedProject.clientName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--dash-text-sec)' }}>{selectedProject.userId?.email || 'No email registered'}</div>
                </div>
              </div>
              
              <button 
                className="dash-btn dash-btn-secondary dash-btn-sm"
                style={{ padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--dash-border)', background: 'var(--dash-card-sec)', color: 'var(--dash-text)', cursor: 'pointer', fontSize: '0.72rem' }}
                onClick={() => downloadBriefText(selectedProject)}
              >
                <Download size={12} />
                <span>Download Specs</span>
              </button>
            </div>

            {/* Tagline / Meta specs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', background: 'var(--dash-card-sec)', border: '1px solid var(--dash-border)', borderRadius: '12px', padding: '14px' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--dash-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Target Stack</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--dash-text)', marginTop: '2px' }}>{selectedProject.stack}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--dash-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Deadline</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--dash-text)', marginTop: '2px' }}>
                  {reqs.deadline || 'Not set'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--dash-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Priority</span>
                <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--dash-text)', marginTop: '2px' }}>
                  {reqs.priority || 'Normal'}
                </span>
              </div>
            </div>

            {/* Callback Requested */}
            {isCallback && (
              <div style={{ 
                background: 'rgba(245, 158, 11, 0.08)', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                borderLeft: '4px solid var(--dash-accent)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px' 
              }}>
                <PhoneCall size={18} style={{ color: 'var(--dash-accent)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--dash-text)' }}>Callback Requested</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--dash-text-sec)', marginTop: '2px' }}>
                    Phone: <strong style={{ color: 'var(--dash-accent)' }}>{selectedProject.callbackPhone || reqs.callbackPhone || selectedProject.userId?.phone || 'N/A'}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Requirements Text */}
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--dash-text-sec)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Project description / specs</span>
              <div style={{ fontSize: '0.85rem', color: 'var(--dash-text)', background: 'var(--dash-card-sec)', padding: '14px', borderRadius: '12px', border: '1px solid var(--dash-border)', marginTop: '6px', whiteSpace: 'pre-line', maxHeight: '180px', overflowY: 'auto', lineHeight: 1.5 }}>
                {reqs.description || selectedProject.requirements || 'No specifications text submitted.'}
              </div>
            </div>

            {/* Uploaded Files */}
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--dash-text-sec)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Specs Brief Documents ({selectedProject.files?.length || 0})</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                {selectedProject.files?.map((f, idx) => (
                  <div key={idx} style={{ padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--dash-card-sec)', border: '1px solid var(--dash-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <FileText size={14} style={{ color: 'var(--dash-accent)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--dash-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.originalname}</span>
                    </div>
                    <a 
                      href={`/api/projects/download/${f.filename}`}
                      download 
                      className="dash-btn dash-btn-secondary dash-btn-sm" 
                      style={{ padding: '4px 8px', borderRadius: '6px' }}
                    >
                      <Download size={11} />
                    </a>
                  </div>
                ))}
                {(!selectedProject.files || selectedProject.files.length === 0) && (
                  <div style={{ fontStyle: 'italic', fontSize: '0.78rem', color: 'var(--dash-text-muted)', padding: '2px' }}>No documents uploaded.</div>
                )}
              </div>
            </div>
          </div>



          {/* 3. Client Communications & User Requested Changes Section */}
          <div className="dash-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={16} style={{ color: 'var(--dash-accent)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--dash-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Client Communication & Requested Changes</span>
            </div>

            {/* Chat logs thread */}
            <div style={{ 
              maxHeight: '260px', 
              overflowY: 'auto', 
              border: '1px solid var(--dash-border)', 
              borderRadius: '12px', 
              padding: '12px', 
              background: 'var(--dash-card-sec)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {selectedProject.changeRequests && selectedProject.changeRequests.length > 0 ? (
                selectedProject.changeRequests.map((msg, i) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div 
                      key={i} 
                      style={{ 
                        alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        background: isAdmin ? 'var(--dash-accent)' : 'var(--dash-card)',
                        color: isAdmin ? '#FFF' : 'var(--dash-text)',
                        border: isAdmin ? 'none' : '1px solid var(--dash-border)',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ fontSize: '0.62rem', fontWeight: 800, color: isAdmin ? 'rgba(255,255,255,0.7)' : 'var(--dash-text-muted)', marginBottom: '3px' }}>
                        {isAdmin ? 'ADMIN REPLY' : 'CLIENT REQUEST'}
                      </div>
                      <div style={{ fontSize: '0.82rem', lineHeight: 1.4, wordBreak: 'break-word' }}>{msg.message}</div>
                      <div style={{ fontSize: '0.58rem', textAlign: 'right', marginTop: '4px', opacity: 0.7 }}>
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--dash-text-muted)', fontStyle: 'italic' }}>
                  No change requests or support messages registered for this project.
                </div>
              )}
            </div>

            {/* Message submit form */}
            <form onSubmit={handleAdminSubmitChat} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="dash-input" 
                placeholder="Type reply / message to client..."
                value={chatMessageInput}
                onChange={(e) => setChatMessageInput(e.target.value)}
                style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-card)', color: 'var(--dash-text)', fontSize: '0.82rem' }}
                disabled={chatLoading}
              />
              <button 
                type="submit" 
                className="dash-btn"
                style={{ 
                  background: 'var(--dash-accent)', 
                  color: '#FFF', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '9px 16px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.82rem',
                  fontWeight: 700
                }}
                disabled={chatLoading}
              >
                {chatLoading ? <div className="admin-spinner" style={{ width: '14px', height: '14px' }} /> : 'Send'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Stages, Bargain resolver, Financials/Quotation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 4. Bargaining Counter Offer Resolution Card */}
          {selectedProject.userDecision === 'Bargained' && (
            <div className="dash-card" style={{ padding: '24px', border: '2px solid var(--dash-warning)', background: 'rgba(255, 159, 28, 0.03)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--dash-warning)' }}>
                <AlertTriangle size={18} />
                <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Counter Offer</span>
              </div>

              <div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--dash-text-sec)', textDecoration: 'line-through' }}>₹{selectedProject.estimatedPrice?.toLocaleString()}</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dash-accent)' }}>₹{selectedProject.bargainPrice?.toLocaleString()}</span>
                </div>
                {selectedProject.bargainMessage && (
                  <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--dash-text-sec)', fontStyle: 'italic', background: 'var(--dash-card)', border: '1px solid var(--dash-border)', padding: '10px 12px', borderRadius: '8px' }}>
                    "{selectedProject.bargainMessage}"
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button 
                  className="dash-btn"
                  style={{ background: 'var(--dash-success)', color: '#FFF', border: 'none', borderRadius: '8px', padding: '10px 0', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => handleBargainAction('accept')}
                  disabled={bargainActionLoading}
                >
                  Accept Offer
                </button>
                <button 
                  className="dash-btn"
                  style={{ background: 'var(--dash-danger)', color: '#FFF', border: 'none', borderRadius: '8px', padding: '10px 0', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => handleBargainAction('reject')}
                  disabled={bargainActionLoading}
                >
                  Decline Offer
                </button>
              </div>
            </div>
          )}

          {/* 5. Project Stage & Phase Control Card */}
          <div className="dash-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--dash-text-sec)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>Current Lifecycle Phase</span>
              <span className="dash-badge" style={{ background: COLUMN_COLORS[selectedProject.stage] || 'var(--dash-accent)', color: '#FFF', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800 }}>
                {selectedProject.stage === 'Estimated' ? 'Quoted' : selectedProject.stage}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--dash-text-sec)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Transition Phase</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {STAGES.map(s => (
                  <button 
                    key={s} 
                    className="dash-btn" 
                    style={{ 
                      padding: '6px 12px', 
                      borderRadius: '8px', 
                      fontSize: '0.73rem', 
                      cursor: 'pointer',
                      backgroundColor: selectedProject.stage === s ? 'var(--dash-accent)' : 'var(--dash-card-sec)',
                      color: selectedProject.stage === s ? '#FFFFFF' : 'var(--dash-text)',
                      border: `1px solid ${selectedProject.stage === s ? 'var(--dash-accent)' : 'var(--dash-border)'}`,
                      fontWeight: selectedProject.stage === s ? '700' : '500'
                    }}
                    onClick={() => handleUpdateStage(selectedProject._id, s)}
                  >
                    {s === 'Estimated' ? 'Quoted' : s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Quotation Price & Financials Card */}
          <div className="dash-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--dash-accent)' }}>Quotation & Invoicing</div>

            {/* Pricing Overview grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--dash-card-sec)', border: '1px solid var(--dash-border)', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--dash-text-muted)', fontWeight: 700 }}>ESTIMATED PRICE</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--dash-text)', marginTop: '2px' }}>₹{(selectedProject.estimatedPrice || 0).toLocaleString()}</div>
              </div>
              <div style={{ background: 'var(--dash-card-sec)', border: '1px solid var(--dash-border)', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--dash-text-muted)', fontWeight: 700 }}>25% ADVANCE DUE</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--dash-text)', marginTop: '2px' }}>₹{Math.round((selectedProject.estimatedPrice || 0) * 0.25).toLocaleString()}</div>
              </div>
            </div>

            {/* Payment status badges */}
            <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--dash-border)', paddingTop: '12px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--dash-text-muted)', display: 'block', marginBottom: '4px' }}>Advance Deposit</span>
                <span className={`dash-badge ${selectedProject.depositPaid ? 'dash-badge-success' : 'dash-badge-muted'}`} style={{ fontSize: '0.65rem' }}>
                  {selectedProject.depositPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--dash-text-muted)', display: 'block', marginBottom: '4px' }}>Final Payment</span>
                <span className={`dash-badge ${selectedProject.finalPaid ? 'dash-badge-success' : 'dash-badge-muted'}`} style={{ fontSize: '0.65rem' }}>
                  {selectedProject.finalPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
            </div>

            {/* Estimate submission form */}
            <form onSubmit={e => { e.preventDefault(); handleSaveEstimate(); }} style={{ borderTop: '1px solid var(--dash-border)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label className="dash-label" style={{ fontSize: '0.73rem', marginBottom: '4px', display: 'block' }}>Update Estimate Quote (₹)</label>
                <input 
                  type="number" 
                  className="dash-input" 
                  placeholder="e.g. 150000" 
                  value={estimateInput}
                  onChange={(e) => setEstimateInput(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-card)', color: 'var(--dash-text)' }}
                />
              </div>
              <button type="submit" className="dash-btn" style={{ background: 'var(--dash-accent)', color: '#fff', fontWeight: 700, border: 'none', padding: '10px 0', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                Publish Quote & Notify Client
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
