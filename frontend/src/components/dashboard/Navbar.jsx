import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar({ title, onToggle, toggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleToggle = onToggle || toggleSidebar;

  return (
    <nav className="dash-navbar">
      <div className="nav-left">
        <button 
          className="sidebar-toggle" 
          onClick={handleToggle}
          type="button"
          aria-label="Toggle Sidebar"
        >
          ☰
        </button>
        <span className="nav-logo">Reqworks</span>
        <span className="nav-divider">/</span>
        <span className="nav-title">{title}</span>
      </div>

      <div className="nav-right">
        {/* Live queue status pill */}
        <div className="queue-status-pill">
          <span className="status-dot live" />
          Queue Open
        </div>

        {/* Theme Toggle */}
        <button 
          className="theme-toggle" 
          onClick={toggleTheme} 
          type="button"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Notifications Bell */}
        <button className="notif-btn" type="button" aria-label="Notifications">
          🔔 <span className="notif-badge">3</span>
        </button>

        {/* Avatar Dropdown */}
        <div 
          className="avatar-wrap" 
          onClick={() => setProfileOpen(!profileOpen)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setProfileOpen(!profileOpen);
            }
          }}
        >
          <div className="avatar">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <span className="avatar-name">
            {user?.name ? user.name.split(' ')[0] : 'User'}
          </span>
          <span className="chevron">▾</span>

          {profileOpen && (
            <div className="profile-dropdown glass" onClick={(e) => e.stopPropagation()}>
              <div className="profile-header">
                <div className="avatar lg">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="profile-name">{user?.name || 'User Account'}</p>
                  <p className="profile-email">{user?.email || 'reqworks.tech@gmail.com'}</p>
                </div>
              </div>
              <hr className="dropdown-divider" />
              <div style={{ padding: '0 4px' }}>
                <div className="dropdown-item" style={{ cursor: 'default' }}>
                  📞 {user?.phone || 'No phone registered'}
                </div>
                <div className="dropdown-item" style={{ cursor: 'default' }}>
                  🏢 {user?.company || 'No company set'}
                </div>
              </div>
              <hr className="dropdown-divider" />
              <button 
                className="dropdown-item danger" 
                onClick={logout}
                type="button"
              >
                ⏻ Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
