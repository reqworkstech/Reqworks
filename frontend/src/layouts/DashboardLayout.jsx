import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, Rocket, RefreshCw, MapPin, CreditCard, Headphones, 
  Settings, Menu, X, Sun, Moon, LogOut, Loader2 
} from 'lucide-react';
import '../styles/dashboard.css';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [queueData, setQueueData] = useState({ queuePosition: null, totalAhead: 0, estimatedDays: 0 });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch queue details globally for the banner
  const fetchQueueStatus = async () => {
    try {
      const res = await fetch('/api/projects/user/dashboard', { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.queuePosition) {
        setQueueData({
          queuePosition: data.queuePosition,
          totalAhead: data.projectsAhead,
          estimatedDays: data.estimatedDays
        });
      } else {
        setQueueData({ queuePosition: null, totalAhead: 0, estimatedDays: 0 });
      }
    } catch (err) {
      console.error('Failed to load global queue status:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/projects/notifications', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchQueueStatus();
    fetchNotifications();
    
    const queueInterval = setInterval(fetchQueueStatus, 30000); // Poll every 30 seconds
    const notifInterval = setInterval(fetchNotifications, 20000); // Poll notifications every 20 seconds
    
    return () => {
      clearInterval(queueInterval);
      clearInterval(notifInterval);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!showNotifications) return;
    const handleClose = () => setShowNotifications(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [showNotifications]);

  const toggleNotifications = async () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState) {
      try {
        await fetch('/api/projects/notifications/read', { method: 'PUT', credentials: 'include' });
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (err) {
        console.error('Failed to mark notifications as read:', err);
      }
    }
  };

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Book Project', path: '/dashboard/book', icon: Rocket },
    { label: 'Request Change', path: '/dashboard/changes', icon: RefreshCw },
    { label: 'Track Projects', path: '/dashboard/track', icon: MapPin },
    { label: 'Billing & Invoice', path: '/dashboard/billing', icon: CreditCard },
    { label: 'Contact Support', path: '/dashboard/chat', icon: Headphones },
    { label: 'Profile Settings', path: '/dashboard/settings', icon: Settings },
  ];

  // Mobile Bottom Nav only shows top 5 items
  const mobileNavItems = navigationItems.slice(0, 5);

  const getPageTitle = () => {
    const activeItem = navigationItems.find(item => item.path === location.pathname);
    return activeItem ? activeItem.label : 'Dashboard';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderSidebarContent = () => (
    <>
      <div className="dash-sidebar-header">
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '2px', background: '#fff' }}>
          <img src="/images/logo.png" alt="Reqworks" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        </div>
        <span className="dash-logo-text">Reqworks</span>
      </div>

      <nav className="dash-sidebar-menu">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`dash-menu-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="dash-sidebar-footer">
        <div className="dash-user-card">
          <div className="dash-user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="dash-user-info">
            <div className="dash-user-name">{user?.name || 'User'}</div>
            <div className="dash-cid-badge">{user?.customerId || 'CID-XXXXX'}</div>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="dash-menu-item"
          style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', marginTop: '12px', cursor: 'pointer' }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="dash-shell" data-theme={theme}>
      
      {/* 1. Desktop Sidebar */}
      <aside className="dash-sidebar">
        {renderSidebarContent()}
      </aside>

      {/* 2. Slide-over Mobile Sidebar Drawer */}
      <div 
        className={`dash-drawer-overlay ${sidebarOpen ? 'open' : ''}`} 
        onClick={() => setSidebarOpen(false)} 
      />
      <div className={`dash-drawer ${sidebarOpen ? 'open' : ''}`}>
        <button className="dash-drawer-close" onClick={() => setSidebarOpen(false)}>
          <X size={20} />
        </button>
        {renderSidebarContent()}
      </div>

      {/* 3. Main Area */}
      <div className="dash-main-container">
        
        {/* Topbar */}
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <button className="dash-menu-toggle" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="dash-page-title">{getPageTitle()}</h1>
          </div>

          {/* Live Queue Banner */}
          {queueData.queuePosition && (
            <div className="dash-topbar-center hidden-mobile">
              <div className="dash-queue-scroller" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span className="dash-badge dash-badge-warning" style={{ fontSize: '0.65rem' }}>
                  Queue #{queueData.queuePosition}
                </span>
                <div style={{ flex: 1, height: '6px', background: 'var(--dash-border)', borderRadius: '99px', overflow: 'hidden', minWidth: '80px' }}>
                  <div style={{
                    width: `${Math.max(10, 100 - (queueData.queuePosition * 10))}%`,
                    height: '100%',
                    background: 'var(--dash-accent)',
                    borderRadius: '99px'
                  }} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--dash-text-sec)', whiteSpace: 'nowrap' }}>
                  ~{queueData.estimatedDays} days start
                </span>
              </div>
            </div>
          )}

          <div className="dash-topbar-right">
            {/* Theme Toggle */}
            <button className="dash-icon-btn" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>


            {/* Avatar Pill */}
            <div className="dash-user-avatar" style={{ width: '36px', height: '36px', border: 'none', background: 'var(--dash-accent)', color: '#141210' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="dash-content-body">
          {/* Mobile Live Queue Alert */}
          {queueData.queuePosition && (
            <div className="visible-mobile" style={{ marginBottom: '16px' }}>
              <div className="dash-queue-scroller">
                <span className="dash-badge dash-badge-warning">
                  Slot #{queueData.queuePosition}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  Active Queue: ~{queueData.estimatedDays} days to start
                </span>
              </div>
            </div>
          )}
          <Outlet />
        </main>

        {/* 4. Mobile Bottom Nav Bar */}
        <nav className="dash-bottom-nav">
          {mobileNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`dash-bottom-item ${isActive ? 'active' : ''}`}
              >
                <IconComponent size={20} />
                <span>{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </nav>

      </div>
      
      {/* Helper Responsive Mobile Classes Injection */}
      <style>{`
        @media (max-width: 1024px) {
          .hidden-mobile { display: none !important; }
        }
        @media (min-width: 1025px) {
          .visible-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
