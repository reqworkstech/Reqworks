import React from 'react';

const phases = [
  { id: 1, label: 'Review',       icon: '👁', desc: 'Admin reviewing project requirements blueprint' },
  { id: 2, label: 'Planning',     icon: '🗺', desc: 'Architecture specification and scope mappings locked' },
  { id: 3, label: 'Building',     icon: '⚙', desc: 'Active component engineering and systems integration' },
  { id: 4, label: 'Testing',      icon: '🧪', desc: 'Sprints validation, QA checks, and bugs cleanup' },
  { id: 5, label: 'Final Checks', icon: '✅', desc: 'Production compiler runs and deployment release' },
];

export default function PhaseTimeline({ currentStage, completedDates, adminNotes }) {
  
  const getPhaseIndex = (stage) => {
    switch (stage) {
      case 'Submitted':
      case 'Estimated':
      case 'Bargained':
      case 'Review':
        return 1;
      case 'Planning':
        return 2;
      case 'Building':
        return 3;
      case 'Testing':
        return 4;
      case 'Final Checks':
      case 'Completed':
        return 5;
      default:
        return 1;
    }
  };

  const currentPhase = getPhaseIndex(currentStage);

  return (
    <div className="phase-timeline">
      {phases.map((phase, i) => {
        const isDone = phase.id < currentPhase;
        const isCurrent = phase.id === currentPhase;
        const isPending = phase.id > currentPhase;

        // Determine if project is completed overall
        const isCompletedProject = currentStage === 'Completed' && phase.id === 5;
        const displayDone = isDone || isCompletedProject;
        const displayCurrent = isCurrent && !isCompletedProject;

        return (
          <div 
            key={phase.id} 
            className={`phase-row ${displayDone ? 'done' : ''} ${displayCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}
          >
            <div className="phase-connector-wrap">
              <div className={`phase-node ${displayCurrent ? 'pulse' : ''}`}>
                {displayDone ? '✓' : phase.icon}
              </div>
              {i < phases.length - 1 && (
                <div className={`phase-line ${displayDone ? 'filled' : ''}`} />
              )}
            </div>
            <div className="phase-content">
              <div className="phase-label-row">
                <h4 className="phase-label">{phase.label}</h4>
                {displayCurrent && <span className="phase-badge-live">● In Progress</span>}
                {displayDone && <span className="phase-badge-done">Completed</span>}
                {isPending && <span className="phase-badge-pending">Upcoming</span>}
              </div>
              <p className="phase-desc">{phase.desc}</p>
              
              {displayCurrent && adminNotes && (
                <div className="phase-admin-note">
                  <span>Developer Update: </span>{adminNotes}
                </div>
              )}

              {displayDone && completedDates && completedDates[phase.id] && (
                <p className="phase-date">
                  Completed on {new Date(completedDates[phase.id]).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
