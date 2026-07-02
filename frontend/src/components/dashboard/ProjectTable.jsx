import React from 'react';
import { Link } from 'react-router-dom';

export default function ProjectTable({ projects, onSelectProject }) {
  const getStatusClass = (stage) => {
    switch (stage) {
      case 'Submitted':
      case 'Estimated':
      case 'Bargained':
        return 'pending';
      case 'Review':
      case 'Planning':
      case 'Building':
        return 'building';
      case 'Testing':
      case 'Final Checks':
        return 'building';
      case 'Completed':
        return 'completed';
      case 'Rejected':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const getPhaseNumber = (stage) => {
    switch (stage) {
      case 'Submitted': return 'Initial spec';
      case 'Estimated': return 'Price Est.';
      case 'Bargained': return 'Negotiation';
      case 'Review': return 'Phase 1 (Review)';
      case 'Planning': return 'Phase 2 (Planning)';
      case 'Building': return 'Phase 3 (Building)';
      case 'Testing': return 'Phase 4 (Testing)';
      case 'Final Checks': return 'Phase 5 (Release)';
      case 'Completed': return 'Phase 5 (Completed)';
      case 'Rejected': return 'Terminated';
      default: return 'Pending';
    }
  };

  return (
    <div className="project-table-card">
      <div className="project-table-header">
        <h3>My Project Pipeline</h3>
        <Link to="/dashboard/book" className="btn-outline-sm">
          + Book New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No active projects in your account. Click "Book New Project" to submit specifications.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="project-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Tech Stack</th>
                <th>Run Stage</th>
                <th>Budget / Estimation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p._id}>
                  <td className="proj-name">{p.projectName}</td>
                  <td className="proj-stack">{p.stack}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(p.stage)}`}>
                      {p.stage}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: '10px', display: 'inline-block' }}>
                      {getPhaseNumber(p.stage)}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {p.depositPaid ? (p.budget || 'TBD') : (p.priceEstimated ? `$${p.estimatedPrice.toLocaleString()}` : 'Specs Auditing')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link 
                        to="/dashboard/track" 
                        onClick={() => onSelectProject(p._id)}
                        className="btn-outline-sm"
                        style={{ display: 'inline-block', textAlign: 'center' }}
                      >
                        ◎ Track Stage
                      </Link>
                      <Link 
                        to="/dashboard/billing" 
                        onClick={() => onSelectProject(p._id)}
                        className="btn-outline-sm"
                        style={{ display: 'inline-block', textAlign: 'center' }}
                      >
                        ◈ Billing
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
