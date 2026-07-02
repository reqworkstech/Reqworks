import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Folder, CheckCircle2, Clock, Eye, AlertCircle, ArrowRight, TrendingUp 
} from 'lucide-react';

export default function DashboardOverview() {
  const { user, toast } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    projectsCount: { total: 0, inProgress: 0, completed: 0, rejected: 0 },
    queuePosition: null,
    projectsAhead: 0,
    estimatedDays: 0,
    recentProjects: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/projects/user/dashboard', { credentials: 'include' });
      const resData = await res.json();
      if (resData.success) {
        setData({
          projectsCount: resData.projectsCount,
          queuePosition: resData.queuePosition,
          projectsAhead: resData.projectsAhead,
          estimatedDays: resData.estimatedDays,
          recentProjects: resData.recentProjects || []
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(fetchDashboardData, 20000); // Poll dashboard data every 20s
    return () => clearInterval(timer);
  }, []);

  const getFormattedDate = () => {
    return new Date().toLocaleDateString(undefined, { 
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
    });
  };

  const getStageBadge = (p) => {
    if (p.callbackRequested) {
      return <span className="dash-badge dash-badge-warning">Callback Requested</span>;
    }
    switch (p.stage) {
      case 'Completed':
        return <span className="dash-badge dash-badge-success">Completed</span>;
      case 'Rejected':
        return <span className="dash-badge dash-badge-danger">Rejected</span>;
      case 'Submitted':
        return <span className="dash-badge dash-badge-muted">Submitted</span>;
      case 'Estimated':
        return <span className="dash-badge dash-badge-info">Quoted</span>;
      default:
        return <span className="dash-badge dash-badge-warning">{p.stage}</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, height: '60vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid var(--dash-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '0.88rem', color: 'var(--dash-text-sec)', fontWeight: 500 }}>Gathering pipeline metrics...</span>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* 1. Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '2rem', fontWeight: 700, margin: 0 }}>
            Welcome, {user?.name ? user.name.split(' ')[0] : 'Client'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span className="dash-cid-badge" style={{ margin: 0 }}>{user?.customerId || 'CID-XXXXX'}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--dash-text-sec)' }}>• {getFormattedDate()}</span>
          </div>
        </div>
        
        {data.queuePosition && (
          <div className="dash-card" style={{ padding: '12px 18px', background: 'rgba(217, 119, 6, 0.04)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--dash-accent)' }}>
            <TrendingUp size={20} style={{ color: 'var(--dash-accent)' }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--dash-text-sec)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Estimated Start</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dash-accent)' }}>~{data.estimatedDays} Days to Start</div>
            </div>
          </div>
        )}
      </div>
      
      {/* 25% Deposit Alert Banner */}
      {data.recentProjects.some(p => p.priceEstimated && !p.depositPaid) && (
        <div className="dash-card" style={{ background: 'rgba(239, 68, 68, 0.04)', borderLeft: '4px solid var(--dash-danger)', display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 800, color: 'var(--dash-text)', fontSize: '1rem' }}>Pending Booking Confirmation</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--dash-text-sec)', margin: 0 }}>
            An estimate has been completed for your project request(s). You must pay the 25% confirmation deposit to activate your project in the build queue and begin the Planning Phase.
          </p>
          <div>
            <Link to="/dashboard/billing" className="dash-btn dash-btn-sm" style={{ background: 'var(--dash-danger)', color: '#fff', border: 'none', fontWeight: 700, padding: '8px 16px', borderRadius: '8px', fontSize: '0.82rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span>Pay 25% Deposit Now</span>
            </Link>
          </div>
        </div>
      )}

      {/* 2. Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {[
          { label: 'Total Requests', val: data.projectsCount.total, icon: Folder, color: 'var(--dash-text)' },
          { label: 'Building / Active', val: data.projectsCount.inProgress, icon: Clock, color: 'var(--dash-warning)' },
          { label: 'Delivered', val: data.projectsCount.completed, icon: CheckCircle2, color: 'var(--dash-success)' },
          { label: 'Under Review', val: data.projectsCount.total - data.projectsCount.inProgress - data.projectsCount.completed - data.projectsCount.rejected, icon: Eye, color: 'var(--dash-info)' }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="dash-card dash-card-hover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--dash-text-sec)', fontWeight: 500 }}>{card.label}</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: card.color, marginTop: '4px', lineHeight: 1 }}>{card.val}</div>
              </div>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'var(--dash-card-sec)', display: 'grid', placeItems: 'center',
                color: card.color
              }}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Live Queue Panel / Booking CTA */}
      {data.queuePosition ? (
        <div className="dash-card" style={{ borderLeft: '4px solid var(--dash-accent)' }}>
          <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.2rem', marginBottom: '16px' }}>Active Build Queue Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--dash-text-sec)' }}>
                You have <strong>{data.projectsAhead}</strong> project{data.projectsAhead === 1 ? '' : 's'} ahead of you in the queue.
              </span>
              <span style={{ fontFamily: 'var(--dash-font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--dash-accent)' }}>
                Slot #{data.queuePosition}
              </span>
            </div>
            
            <div style={{ height: '10px', background: 'var(--dash-card-sec)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.max(10, 100 - (data.queuePosition * 10))}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--dash-accent), #f59e0b)',
                borderRadius: '99px'
              }} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--dash-text-sec)' }}>
              <span>Phase: Requirements Locked</span>
              <span>Est. Start: ~{data.estimatedDays} days</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 24px', background: 'rgba(217, 119, 6, 0.02)', border: '1.5px dashed var(--dash-border)' }}>
          <AlertCircle size={48} style={{ color: 'var(--dash-text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>No Active Build Slot</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--dash-text-sec)', maxWidth: '440px', marginTop: '8px', marginBottom: '24px' }}>
            Submit a proposal to reserve your queue slot.
          </p>
          <Link to="/dashboard/book" className="dash-btn dash-btn-primary">
            <span>Book Your First Project</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* 4. Live Activity / Recent Projects */}
      <div className="dash-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Your Build Activity</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--dash-text-sec)', margin: '4px 0 0' }}>Updates of project proposal phases.</p>
          </div>
          <Link to="/dashboard/track" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dash-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Detailed Tracking</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {data.recentProjects.length > 0 ? (
          <div className="dash-table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Current Phase</th>
                  <th>Budget Quoted</th>
                  <th>Decision</th>
                  <th>Submitted On</th>
                </tr>
              </thead>
              <tbody>
                {data.recentProjects.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{p.projectName}</td>
                    <td>{getStageBadge(p)}</td>
                    <td style={{ fontFamily: 'var(--dash-font-mono)', fontWeight: 600 }}>
                      {p.callbackRequested ? (
                        <span style={{ color: 'var(--dash-text-sec)', fontSize: '0.8rem' }}>TBD (Callback)</span>
                      ) : p.priceEstimated ? (
                        `₹${p.estimatedPrice.toLocaleString()}`
                      ) : (
                        <span style={{ color: 'var(--dash-text-muted)' }}>Pending Quote</span>
                      )}
                    </td>
                    <td>
                      {p.callbackRequested ? (
                        <span className="dash-badge dash-badge-warning">Awaiting Call</span>
                      ) : (
                        <>
                          {p.userDecision === 'Bargained' && <span className="dash-badge dash-badge-warning">Counter Offer</span>}
                          {p.userDecision === 'Booked' && <span className="dash-badge dash-badge-success">Paid Advance</span>}
                          {p.userDecision === 'None' && p.priceEstimated && <span className="dash-badge dash-badge-info">Awaiting Review</span>}
                          {p.userDecision === 'None' && !p.priceEstimated && <span className="dash-badge dash-badge-muted">Pending Review</span>}
                        </>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--dash-text-sec)' }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--dash-text-sec)', fontSize: '0.9rem' }}>
            No proposals found in your history log.
          </div>
        )}
      </div>

    </div>
  );
}
