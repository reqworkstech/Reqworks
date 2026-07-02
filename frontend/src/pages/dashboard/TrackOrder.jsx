import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  MapPin, Check, Clock, AlertCircle, Calendar, FileText, ArrowRight 
} from 'lucide-react';

const STAGES = [
  { name: 'Review', desc: 'Requirements review & budget estimation audit.' },
  { name: 'Planning', desc: 'System modeling, database design, and sprint roadmap lock.' },
  { name: 'Building', desc: 'Core feature development, frontend construction, and API integrations.' },
  { name: 'Testing & Debugging', desc: 'End-to-end integration audits, validation check, and stress tests.' },
  { name: 'Final Checks', desc: 'Modular deployment checks, source delivery packages compilation, and handoff.' }
];

export default function TrackOrder() {
  const { toast } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/projects/user', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects || []);
        if (data.projects.length > 0) {
          const persistedId = localStorage.getItem('dq-selected-project');
          setSelectedProject(prev => {
            const currentSelectedId = prev?._id || persistedId;
            return data.projects.find(p => p._id === currentSelectedId) || data.projects[0];
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch user tracking details:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(() => {
      fetchProjects(true);
    }, 15000); // Poll tracking data every 15s
    return () => clearInterval(interval);
  }, []);

  const handleProjectSelect = (e) => {
    const id = e.target.value;
    const found = projects.find(p => p._id === id);
    setSelectedProject(found);
    localStorage.setItem('dq-selected-project', id);
  };

  // Map Mongoose schema stages to 5-stepper index
  const getActiveStageIndex = (stage) => {
    switch (stage) {
      case 'Submitted':
      case 'Estimated':
      case 'Review':
        return 0;
      case 'Planning':
        return 1;
      case 'Building':
        return 2;
      case 'Testing':
        return 3;
      case 'Final Checks':
        return 4;
      case 'Completed':
        return 5;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, height: '60vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid var(--dash-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '0.88rem', color: 'var(--dash-text-sec)', fontWeight: 500 }}>Connecting tracking modules...</span>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 24px', border: '1.5px dashed var(--dash-border)' }}>
        <MapPin size={48} style={{ color: 'var(--dash-text-muted)', marginBottom: '16px' }} />
        <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.4rem', fontWeight: 700 }}>No Tracks Found</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--dash-text-sec)', maxWidth: '440px', marginTop: '8px', marginBottom: '24px' }}>
          Submit a build brief to track progress.
        </p>
        <a href="/dashboard/book" className="dash-btn dash-btn-primary">
          <span>Book Project Now</span>
          <ArrowRight size={16} />
        </a>
      </div>
    );
  }

  const currentIdx = getActiveStageIndex(selectedProject?.stage);
  const isRejected = selectedProject?.stage === 'Rejected';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header & Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Track Build Pipeline</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', margin: '4px 0 0' }}>Track project sprint progress live.</p>
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

      {/* Stepper / Callback Card */}
      {selectedProject?.callbackRequested ? (
        <div className="dash-card" style={{ padding: '36px 24px', borderLeft: '4px solid var(--dash-accent)', background: 'rgba(245, 158, 11, 0.02)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <Clock size={28} style={{ color: 'var(--dash-accent)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.45rem', fontWeight: 700, margin: 0, color: 'var(--dash-text)' }}>
                Callback Request Received
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--dash-text-sec)', marginTop: '10px', lineHeight: 1.6 }}>
                Our engineering team has received your request for an instant callback. We will call you shortly at <strong>{selectedProject.callbackPhone || selectedProject.userId?.phone || 'your registered number'}</strong> to discuss your project requirements, plan frameworks, deployment setups, and budget details.
              </p>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                <div style={{ background: 'var(--dash-card-sec)', border: '1px solid var(--dash-border)', padding: '10px 16px', borderRadius: '8px', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--dash-text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Requested Phone</span>
                  <strong style={{ color: 'var(--dash-text)', fontSize: '0.88rem' }}>{selectedProject.callbackPhone || 'N/A'}</strong>
                </div>
                <div style={{ background: 'var(--dash-card-sec)', border: '1px solid var(--dash-border)', padding: '10px 16px', borderRadius: '8px', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--dash-text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Status</span>
                  <strong style={{ color: 'var(--dash-warning)', fontSize: '0.88rem' }}>Awaiting Call</strong>
                </div>
                <div style={{ background: 'var(--dash-card-sec)', border: '1px solid var(--dash-border)', padding: '10px 16px', borderRadius: '8px', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--dash-text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Submitted On</span>
                  <strong style={{ color: 'var(--dash-text)', fontSize: '0.88rem' }}>{new Date(selectedProject.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : isRejected ? (
        <div className="dash-card" style={{ borderLeft: '4px solid var(--dash-danger)', background: 'rgba(220, 38, 38, 0.02)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertCircle size={24} style={{ color: 'var(--dash-danger)', flexShrink: 0 }} />
            <div>
              <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Proposal Rejected</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--dash-text-sec)', marginTop: '8px', lineHeight: 1.5 }}>
                Proposal rejected. Re-upload specs on the Request Change page.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="dash-card" style={{ padding: '36px 24px' }}>
          <div className="dash-stepper">
            {STAGES.map((s, idx) => {
              const isCompleted = currentIdx > idx;
              const isActive = currentIdx === idx;
              return (
                <div key={idx} className={`dash-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  <div className="dash-step-circle">
                    {isCompleted ? (
                      <Check size={18} />
                    ) : isActive ? (
                      <div className="pulsing-inner" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span className="dash-step-label">{s.name}</span>
                </div>
              );
            })}
          </div>

          {/* Stepper Pulsing CSS Keyframe Rules Injected */}
          <style>{`
            .pulsing-inner {
              width: 12px; height: 12px;
              background: #141210;
              border-radius: 50%;
              animation: step-pulse 1.6s infinite ease-in-out;
            }
            [data-theme='dark'] .pulsing-inner {
              background: #141210;
            }
            @keyframes step-pulse {
              0% { transform: scale(0.85); opacity: 0.5; }
              50% { transform: scale(1.15); opacity: 1; }
              100% { transform: scale(0.85); opacity: 0.5; }
            }
          `}</style>
        </div>
      )}

      {/* Stage Detail Card */}
      {!isRejected && !selectedProject?.callbackRequested && (
        <div className="dash-card">
          <div style={{ borderBottom: '1px solid var(--dash-border)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {currentIdx === 5 ? 'Project Fully Completed!' : `Current Phase: ${STAGES[currentIdx].name}`}
              </h3>
              <span className={`dash-badge ${currentIdx === 5 ? 'dash-badge-success' : 'dash-badge-warning'}`} style={{ fontSize: '0.72rem' }}>
                {currentIdx === 5 ? 'Completed' : 'Active Build Slot'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-sec)', margin: '8px 0 0' }}>
              {currentIdx === 5 
                ? 'All development milestones have been achieved. Code packages are compiled and the final build has been delivered successfully!' 
                : STAGES[currentIdx].desc}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            
            {/* Status logs card */}
            <div className="dash-card" style={{ padding: '16px', background: 'var(--dash-card-sec)', border: '1px solid var(--dash-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Clock size={16} style={{ color: 'var(--dash-accent)' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dash-text-sec)', letterSpacing: '0.04em' }}>Status Audit</span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                {selectedProject.depositPaid ? 'Deposit Confirmed' : 'Awaiting Booking Advance'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--dash-text-sec)', marginTop: '4px' }}>
                {selectedProject.depositPaid ? 'Queued for pipeline.' : 'Advance payment required.'}
              </div>
            </div>

            {/* Timelines logs card */}
            <div className="dash-card" style={{ padding: '16px', background: 'var(--dash-card-sec)', border: '1px solid var(--dash-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Calendar size={16} style={{ color: 'var(--dash-accent)' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dash-text-sec)', letterSpacing: '0.04em' }}>Date Initiated</span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                {new Date(selectedProject.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--dash-text-sec)', marginTop: '4px' }}>
                Submitted.
              </div>
            </div>

            {/* Spec blueprint summary card */}
            <div className="dash-card" style={{ padding: '16px', background: 'var(--dash-card-sec)', border: '1px solid var(--dash-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FileText size={16} style={{ color: 'var(--dash-accent)' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dash-text-sec)', letterSpacing: '0.04em' }}>Build Framework</span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedProject.stack}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--dash-text-sec)', marginTop: '4px' }}>
                Validated.
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
