import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { id: 'dashboard', label: 'Dashboard',      icon: '⬡', path: '/dashboard',         color: '--accent-blue'   },
  { id: 'book',      label: 'Book Project',   icon: '✦', path: '/dashboard/book',    color: '--accent-violet' },
  { id: 'track',     label: 'Track Order',    icon: '◎', path: '/dashboard/track',   color: '--accent-cyan'   },
  { id: 'billing',   label: 'Billing',        icon: '◈', path: '/dashboard/billing', color: '--accent-amber'  },
  { id: 'changes',   label: 'Request Change', icon: '◇', path: '/dashboard/changes', color: '--accent-rose'   },
  { id: 'chat',      label: 'Chat',           icon: '◉', path: '/dashboard/chat',    color: '--accent-green'  },
];

export default function Sidebar({ collapsed, activeProjectsCount, unreadMessagesCount }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">RW</div>
        {!collapsed && <span className="brand-name">Reqworks</span>}
      </div>

      <div className="sidebar-section-label">{!collapsed && 'WORKSPACE'}</div>

      <nav className="sidebar-nav">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          
          // Show dynamic badges for tracking projects or unread chat messages
          let badgeVal = null;
          if (item.id === 'track' && activeProjectsCount > 0) {
            badgeVal = activeProjectsCount;
          } else if (item.id === 'chat' && unreadMessagesCount > 0) {
            badgeVal = unreadMessagesCount;
          }

          return (
            <Link 
              key={item.id} 
              to={item.path}
              className={`nav-item ${active ? 'active' : ''}`}
              style={{ '--item-color': `var(${item.color})` }}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="nav-label">{item.label}</span>
                  {badgeVal !== null && <span className="nav-badge">{badgeVal}</span>}
                </>
              )}
              {active && <span className="active-bar" />}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && user && (
          <div className="user-mini-card">
            <div className="avatar sm">{user.name[0].toUpperCase()}</div>
            <div className="user-mini-info">
              <p className="user-mini-name">{user.name}</p>
              <p className="user-mini-role">Client Account</p>
            </div>
          </div>
        )}
        <button 
          className="signout-btn" 
          onClick={logout}
          type="button"
        >
          {collapsed ? '⏻' : '⏻ Sign Out'}
        </button>
      </div>
    </aside>
  );
}
