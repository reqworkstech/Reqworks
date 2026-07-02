import React from 'react';

export default function QueueBanner({ position, totalAhead, estimatedDays }) {
  // If there's no project queued, don't show the queue banner
  if (!position) return null;

  const progressPercent = Math.min(100, Math.max(10, 100 - (position * 15)));

  return (
    <div className="queue-banner">
      <div className="queue-banner-left">
        <div className="queue-position-badge">
          <span className="queue-hash">#</span>
          <span className="queue-number">{position}</span>
        </div>
        <div className="queue-info">
          <h3>Your Queue Position</h3>
          <p>{totalAhead} project{totalAhead !== 1 ? 's' : ''} ahead · Est. start in ~{estimatedDays} days</p>
        </div>
      </div>
      <div className="queue-banner-right">
        <div className="queue-progress-wrap">
          <div className="queue-progress-labels">
            <span>Queue Start</span>
            <span>Your Turn</span>
          </div>
          <div className="queue-progress-bar">
            <div className="queue-progress-fill" style={{ width: `${progressPercent}%` }}>
              <div className="progress-glow" />
            </div>
          </div>
          <p className="queue-progress-note">{progressPercent}% progress to your slot</p>
        </div>
      </div>
      <div className="queue-live-dot">
        <span className="dot live" /> Live
      </div>
    </div>
  );
}
