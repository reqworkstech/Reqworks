import React from 'react';
import CountUp from '../ui/CountUp';

export default function StatCards({ projectsCount }) {
  const stats = [
    { label: 'Total Submitted', value: projectsCount?.total || 0,     icon: '◈', color: '--accent-blue',   bg: 'blue'   },
    { label: 'In Progress',     value: projectsCount?.inProgress || 0, icon: '◎', color: '--accent-amber',  bg: 'amber'  },
    { label: 'Completed',       value: projectsCount?.completed || 0,  icon: '✦', color: '--accent-green',  bg: 'green'  },
    { label: 'Rejected',        value: projectsCount?.rejected || 0,   icon: '◇', color: '--accent-rose',   bg: 'rose'   },
  ];

  return (
    <div className="stat-grid">
      {stats.map((s, i) => (
        <div 
          key={i} 
          className={`stat-card stat-${s.bg}`} 
          style={{ 
            animationDelay: `${i * 80}ms`,
            animation: 'cardReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) both'
          }}
        >
          <div className="stat-icon-wrap">
            <span className="stat-icon">{s.icon}</span>
          </div>
          <div className="stat-info">
            <CountUp className="stat-value" target={s.value} />
            <p className="stat-label">{s.label}</p>
          </div>
          <div className="stat-glow" />
        </div>
      ))}
    </div>
  );
}
