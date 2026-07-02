import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Layers, FileCode, Tag, Bell, CreditCard,
  Search, Plus, Trash2, CheckCircle2, XCircle, Send,
  Calendar, DollarSign, AlertCircle, ExternalLink, Eye,
  BookOpen, Clock, Settings, User, LogOut, RefreshCw,
  FileText, Download, Menu, X, ArrowRight, Sparkles, Sun, Moon,
  ChevronLeft, ChevronRight, PhoneCall, AlertTriangle, MessageSquare
} from 'lucide-react';
import '../../styles/admin.css';
import ProjectDetailsSection from '../../components/dashboard/ProjectDetailsSection';

const STAGES = ['Submitted', 'Estimated', 'Review', 'Planning', 'Building', 'Testing', 'Final Checks', 'Completed', 'Rejected'];
const COLUMN_PHASES = ['Review', 'Planning', 'Building', 'Testing', 'Final Checks'];

const COLUMN_ICONS = {
  'Review': '🔍',
  'Planning': '📋',
  'Building': '🏗️',
  'Testing': '🧪',
  'Final Checks': '🚀'
};

const COLUMN_COLORS = {
  'Review': '#0ea5e9',      // Sky
  'Planning': '#eab308',    // Amber
  'Building': '#a855f7',    // Purple
  'Testing': '#ec4899',     // Pink
  'Final Checks': '#10b981' // Emerald
};

const STAGE_PROGRESS = {
  'Submitted': 5,
  'Estimated': 10,
  'Review': 20,
  'Planning': 40,
  'Building': 60,
  'Testing': 80,
  'Final Checks': 95,
  'Completed': 100,
  'Rejected': 0
};

export default function AdminDashboard() {
  const { user, logout, toast } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selection states
  const [selectedProject, setSelectedProject] = useState(null);

  // Form states
  const [estimateInput, setEstimateInput] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [bargainActionLoading, setBargainActionLoading] = useState(false);

  // Coupon Form
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [couponMaxUsers, setCouponMaxUsers] = useState('100');
  const [couponStartDate, setCouponStartDate] = useState('');
  const [couponEndDate, setCouponEndDate] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Offer Form
  const [offerDiscount, setOfferDiscount] = useState('');
  const [offerStartDate, setOfferStartDate] = useState('');
  const [offerEndDate, setOfferEndDate] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [offerActive, setOfferActive] = useState(true);
  const [offerLoading, setOfferLoading] = useState(false);

  // Custom Alert Form
  const [alertUserId, setAlertUserId] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('email');
  const [alertLoading, setAlertLoading] = useState(false);

  // AI Tab State
  const [aiTab, setAiTab] = useState('brief');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);

  // Chat States
  const [chatMessageInput, setChatMessageInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // New Workspace state variables
  const [workspaceView, setWorkspaceView] = useState('list');
  const [filterStage, setFilterStage] = useState('All');
  const [filterDecision, setFilterDecision] = useState('All');
  const [filterStack, setFilterStack] = useState('All');
  const [drawerTab, setDrawerTab] = useState('brief');

  // Navigation Items
  const navigationItems = [
    { label: 'Dashboard', key: 'dashboard', icon: LayoutDashboard },
    { label: 'Workspace', key: 'projects', icon: Layers },
    { label: 'Promotions', key: 'prices', icon: Tag },
    { label: 'Comms', key: 'alerts', icon: Bell },
    { label: 'Financials', key: 'payments', icon: CreditCard }
  ];

  // Fetch telemetry
  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const projRes = await fetch('/api/projects/admin', { credentials: 'include' });
      const projData = await projRes.json();
      if (projData.success) {
        setProjects(projData.projects || []);
      }

      const clientsRes = await fetch('/api/projects/admin/users', { credentials: 'include' });
      const clientsData = await clientsRes.json();
      if (clientsData.success) {
        setClients(clientsData.users || []);
        if (clientsData.users?.length > 0 && !alertUserId) {
          setAlertUserId(clientsData.users[0]._id);
        }
      }

      const notifRes = await fetch('/api/projects/notifications', { credentials: 'include' });
      const notifData = await notifRes.json();
      if (notifData.success) {
        setNotifications(notifData.notifications || []);
      }

      const coupRes = await fetch('/api/projects/admin/coupons', { credentials: 'include' });
      const coupData = await coupRes.json();
      if (coupData.success) {
        setCoupons(coupData.coupons || []);
      }

      const offRes = await fetch('/api/projects/admin/offers', { credentials: 'include' });
      const offData = await offRes.json();
      if (offData.success) {
        setOffers(offData.offers || []);
      }
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
      toast.error('Telemetry download failed. Backend connection offline.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 15000); // Poll telemetry every 15s
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  useEffect(() => {
    if (selectedProject) {
      setEstimateInput(selectedProject.estimatedPrice || '');
      
      const runAutoAi = async () => {
        setAiAnalyzing(true);
        try {
          const res = await fetch(`/api/projects/admin/ai-summary/${selectedProject._id}`, { credentials: 'include' });
          const data = await res.json();
          if (data.success) {
            setAiAnalysisResult(data.summary);
          }
        } catch (err) {
          console.error('Auto AI analysis error:', err);
        } finally {
          setAiAnalyzing(false);
        }
      };
      runAutoAi();
    } else {
      setAiAnalysisResult(null);
    }
  }, [selectedProject?._id]);

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

  // Quick changing projects phase
  const handleUpdateStage = async (projectId, nextStage) => {
    try {
      const res = await fetch(`/api/projects/admin/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ stage: nextStage })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Project stage moved to "${nextStage}"`);
        setProjects(prev => prev.map(p => p._id === projectId ? { ...p, stage: nextStage } : p));
        if (selectedProject?._id === projectId) {
          setSelectedProject(prev => ({ ...prev, stage: nextStage }));
        }
        fetchData(true);
      } else {
        toast.error(data.message || 'Stage modification failed');
      }
    } catch (err) {
      toast.error('Network failure updating pipeline stage');
    }
  };

  // Move stage left or right in Kanban sequence
  const handleMoveStage = (projectId, currentStage, direction) => {
    const kanbanPhases = ['Review', 'Planning', 'Building', 'Testing', 'Final Checks'];
    let currentIdx = -1;
    if (currentStage === 'Submitted' || currentStage === 'Estimated' || currentStage === 'Review') {
      currentIdx = 0;
    } else {
      currentIdx = kanbanPhases.indexOf(currentStage);
    }
    
    if (currentIdx === -1) return;
    
    let nextIdx = currentIdx + direction;
    if (nextIdx >= 0 && nextIdx < kanbanPhases.length) {
      const nextStage = kanbanPhases[nextIdx];
      handleUpdateStage(projectId, nextStage);
    } else if (nextIdx === kanbanPhases.length && direction === 1) {
      handleUpdateStage(projectId, 'Completed');
    }
  };

  // Submit Price Estimate
  const handleSaveEstimate = async () => {
    if (!selectedProject) return;
    if (!estimateInput || isNaN(estimateInput)) {
      toast.error('Please enter a valid numeric estimate');
      return;
    }
    try {
      const res = await fetch(`/api/projects/admin/estimate/${selectedProject._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estimatedPrice: Number(estimateInput) })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Estimate of ₹${Number(estimateInput).toLocaleString()} dispatched to client!`);
        fetchData(true);
        setSelectedProject(prev => ({
          ...prev,
          estimatedPrice: Number(estimateInput),
          priceEstimated: true,
          stage: 'Estimated'
        }));
      } else {
        toast.error(data.message || 'Estimate submission failed');
      }
    } catch (err) {
      toast.error('Connection failure transmitting estimate');
    }
  };

  // Bargaining Action Handler
  const handleBargainAction = async (action) => {
    if (!selectedProject) return;
    setBargainActionLoading(true);
    try {
      const res = await fetch(`/api/projects/admin/bargain/${selectedProject._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(action === 'accept' ? 'Bargained counter-offer accepted!' : 'Bargained counter-offer declined!');
        fetchData(true);
        setSelectedProject(prev => ({ ...data.project, userId: prev?.userId }));
      } else {
        toast.error(data.message || 'Bargaining resolution failed');
      }
    } catch (err) {
      toast.error('Connection failure transmitting bargain action');
    } finally {
      setBargainActionLoading(false);
    }
  };

  // Generate Coupon
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode || !couponDiscount || !couponStartDate || !couponEndDate) {
      toast.error('Please fill all coupon details');
      return;
    }
    setCouponLoading(true);
    try {
      const res = await fetch('/api/projects/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          code: couponCode,
          discountPercent: Number(couponDiscount),
          maxUsers: Number(couponMaxUsers),
          startDate: couponStartDate,
          endDate: couponEndDate
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Coupon code "${couponCode.toUpperCase()}" generated successfully!`);
        setCoupons(prev => [data.coupon, ...prev]);
        setCouponCode('');
        setCouponDiscount('');
        setCouponMaxUsers('100');
        setCouponStartDate('');
        setCouponEndDate('');
      } else {
        toast.error(data.message || 'Coupon generation failed');
      }
    } catch (err) {
      toast.error('Network failure writing coupon details');
    } finally {
      setCouponLoading(false);
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (id) => {
    try {
      const res = await fetch(`/api/projects/admin/coupons/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Coupon removed successfully.');
        setCoupons(prev => prev.filter(c => c._id !== id));
      } else {
        toast.error(data.message || 'Coupon deletion failed');
      }
    } catch (err) {
      toast.error('Network failure deleting coupon');
    }
  };

  // Save promotional offer
  const handleSaveOffer = async (e) => {
    e.preventDefault();
    if (!offerDiscount || !offerStartDate || !offerEndDate) {
      toast.error('Please fill all offer fields');
      return;
    }
    setOfferLoading(true);
    try {
      const res = await fetch('/api/projects/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          discountPercent: Number(offerDiscount),
          startDate: offerStartDate,
          endDate: offerEndDate,
          description: offerDescription,
          active: offerActive
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Promotion updated to apply ${offerDiscount}% discount!`);
        setOffers(prev => [data.offer, ...prev]);
        setOfferDiscount('');
        setOfferStartDate('');
        setOfferEndDate('');
        setOfferDescription('');
      } else {
        toast.error(data.message || 'Failed to save offer');
      }
    } catch (err) {
      toast.error('Connection error saving offer details');
    } finally {
      setOfferLoading(false);
    }
  };

  // Dispatch manual alert broadcast
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!alertUserId || !alertTitle || !alertMessage) {
      toast.error('User selection, title and messages are required');
      return;
    }
    setAlertLoading(true);
    try {
      const res = await fetch('/api/projects/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: alertUserId,
          title: alertTitle,
          message: alertMessage,
          type: alertType
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Broadcast notification dispatched to client successfully!');
        setNotifications(prev => [data.notification, ...prev]);
        setAlertTitle('');
        setAlertMessage('');
      } else {
        toast.error(data.message || 'Alert dispatch failed');
      }
    } catch (err) {
      toast.error('Network failure sending custom alert');
    } finally {
      setAlertLoading(false);
    }
  };

  // Run AI analysis compiler
  const runAiAnalysis = async () => {
    if (!selectedProject) return;
    setAiAnalyzing(true);
    try {
      const res = await fetch(`/api/projects/admin/ai-summary/${selectedProject._id}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setAiAnalysisResult(data.summary);
        toast.success('AI Specifications Analysis completed successfully!');
      } else {
        toast.error(data.message || 'AI summary failed');
      }
    } catch (err) {
      toast.error('Network failure executing AI analysis');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleAdminSubmitChat = async (e) => {
    e.preventDefault();
    if (!chatMessageInput.trim() || !selectedProject) return;
    setChatLoading(true);
    try {
      const res = await fetch(`/api/projects/admin/chat/${selectedProject._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: chatMessageInput })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Response sent to client successfully!');
        setChatMessageInput('');
        // Refresh selected project state
        setSelectedProject(prev => ({ ...data.project, userId: prev?.userId }));
        fetchData(true);
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (err) {
      toast.error('Network failure sending message');
    } finally {
      setChatLoading(false);
    }
  };

  const formatRequirements = (rawReqs) => {
    if (!rawReqs) return { description: 'No description brief submitted.' };
    try {
      const parsed = JSON.parse(rawReqs);
      return {
        tagline: parsed.tagline || '',
        description: parsed.description || rawReqs,
        deployPlatform: parsed.deployPlatform || '',
        deadline: parsed.deadline || '',
        priority: parsed.priority || '',
        needsAi: parsed.needsAi ? 'Yes' : 'No',
        callbackRequested: parsed.callbackRequested || false,
        callbackPhone: parsed.callbackPhone || ''
      };
    } catch (e) {
      return { description: rawReqs };
    }
  };

  const downloadBriefText = (project) => {
    const reqs = formatRequirements(project.requirements);
    const content = `REQWORKS PROJECT BRIEF: ${project.projectName}
==================================================
Client Name:      ${project.clientName}
Tech Stack:       ${project.stack}
Budget:           ${project.budget}
Stage:            ${project.stage}

PROJECT DETAILS
--------------------------------------------------
Tagline:          ${reqs.tagline || 'N/A'}
Description:      ${reqs.description || 'N/A'}
Deployment Host:  ${reqs.deployPlatform || 'N/A'}
Target Deadline:  ${reqs.deadline || 'N/A'}
Priority:         ${reqs.priority || 'Normal'}
Needs AI Modules: ${reqs.needsAi || 'No'}
Callback Request: ${project.callbackRequested || reqs.callbackRequested ? 'Yes' : 'No'}
Callback Phone:   ${project.callbackPhone || reqs.callbackPhone || 'N/A'}
==================================================
Generated on:     ${new Date().toLocaleString()}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.projectName.replace(/\s+/g, '_')}_Brief.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper stats values
  const totalProjectsCount = projects.length;
  const inReviewCount = projects.filter(p => p.stage === 'Submitted' || p.stage === 'Estimated').length;
  const inPlanningCount = projects.filter(p => p.stage === 'Planning' || p.stage === 'Review').length;
  const completedCount = projects.filter(p => p.stage === 'Completed').length;

  const totalRevenue = projects
    .filter(p => p.depositPaid)
    .reduce((sum, p) => {
      const price = p.estimatedPrice || 0;
      const paid = p.finalPaid ? price : Math.round(price * 0.25);
      return sum + paid;
    }, 0);

  const pendingRevenue = projects
    .filter(p => p.depositPaid && !p.finalPaid)
    .reduce((sum, p) => {
      const price = p.estimatedPrice || 0;
      return sum + Math.round(price * 0.75);
    }, 0);

  // SVG network map elements positioning
  const mapNodes = [
    { name: 'Review', x: 50, y: 120, count: projects.filter(p => p.stage === 'Review' || p.stage === 'Submitted' || p.stage === 'Estimated').length },
    { name: 'Planning', x: 140, y: 50, count: projects.filter(p => p.stage === 'Planning').length },
    { name: 'Building', x: 230, y: 120, count: projects.filter(p => p.stage === 'Building').length },
    { name: 'Testing', x: 320, y: 50, count: projects.filter(p => p.stage === 'Testing').length },
    { name: 'Handoff', x: 410, y: 120, count: projects.filter(p => p.stage === 'Final Checks' || p.stage === 'Completed').length }
  ];

  // Weekly Stats calculation
  const getWeeklyStatsHeight = () => {
    const counts = [12, 18, 15, 24, 28, 14, 9];
    const actualCounts = Array(7).fill(0);
    projects.forEach(p => {
      const day = new Date(p.createdAt).getDay();
      const idx = day === 0 ? 6 : day - 1;
      actualCounts[idx]++;
    });
    return actualCounts.map((val, i) => Math.max(val * 24, counts[i]));
  };

  const weeklyBarsHeight = getWeeklyStatsHeight();

  // Filter clients based on search
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get unique tech stacks for filtering
  const uniqueStacks = Array.from(new Set(projects.map(p => p.stack).filter(Boolean)));

  // Filter projects based on search and selected options
  const filteredProjects = projects.filter(p => {
    // 1. Search Query
    const matchesSearch = 
      p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.stack && p.stack.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Stage Filter
    let matchesStage = true;
    if (filterStage !== 'All') {
      if (filterStage === 'Review') {
        matchesStage = p.stage === 'Submitted' || p.stage === 'Estimated' || p.stage === 'Review';
      } else {
        matchesStage = p.stage === filterStage;
      }
    }

    // 3. Decision Filter
    let matchesDecision = true;
    if (filterDecision !== 'All') {
      if (filterDecision === 'Bargained') {
        matchesDecision = p.userDecision === 'Bargained';
      } else if (filterDecision === 'Booked') {
        matchesDecision = p.userDecision === 'Booked';
      } else if (filterDecision === 'Awaiting Review') {
        matchesDecision = p.userDecision === 'None' && p.priceEstimated;
      } else if (filterDecision === 'Pending Review') {
        matchesDecision = p.userDecision === 'None' && !p.priceEstimated;
      }
    }

    // 4. Stack Filter
    let matchesStack = true;
    if (filterStack !== 'All') {
      matchesStack = p.stack === filterStack;
    }

    return matchesSearch && matchesStage && matchesDecision && matchesStack;
  });

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-spinner" />
        <span style={{ fontSize: '0.9rem', color: '#718096', fontWeight: 600 }}>Downloading Reqworks Control Telemetry...</span>
      </div>
    );
  }

  const renderSidebarContent = () => (
    <>
      <div className="dash-sidebar-header">
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '2px', background: '#fff' }}>
          <img src="/images/logo.png" alt="Reqworks" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        </div>
        <span className="dash-logo-text">Reqworks Admin</span>
      </div>

      <nav className="dash-sidebar-menu">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              className={`dash-menu-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.key);
                setSidebarOpen(false);
              }}
              style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="dash-sidebar-footer">
        <div className="dash-user-card">
          <div className="dash-user-avatar" style={{ border: '2px solid var(--dash-accent)', color: 'var(--dash-accent)' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="dash-user-info">
            <div className="dash-user-name">{user?.name || 'Admin'}</div>
            <div className="dash-cid-badge" style={{ background: 'var(--dash-accent)', color: '#fff', fontSize: '0.65rem' }}>
              OPERATIONS
            </div>
          </div>
        </div>
        <button 
          onClick={logout}
          className="dash-menu-item"
          style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', marginTop: '12px', cursor: 'pointer' }}
        >
          <LogOut size={18} />
          <span>Exit Console</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="dash-shell admin-panel" data-theme="light">
      
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
            <h1 className="dash-page-title">
              {navigationItems.find(item => item.key === activeTab)?.label || 'Admin Portal'}
            </h1>
          </div>

          <div className="dash-topbar-right">
            {/* Sync Telemetry */}
            <button 
              className="dash-icon-btn" 
              onClick={handleRefresh} 
              disabled={refreshing}
              title="Sync Telemetry"
            >
              <RefreshCw size={16} className={refreshing ? 'admin-spinner' : ''} />
            </button>

            {/* Theme Toggle */}
            <button className="dash-icon-btn" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>


            {/* Avatar Pill */}
            <div className="dash-user-avatar" style={{ width: '36px', height: '36px', border: 'none', background: 'var(--dash-accent)', color: '#141210' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="dash-content-body">
        {/* TAB 1: DASHBOARD - CLEAN COMMAND CENTER */}
        {activeTab === 'dashboard' && (() => {
          const stageFunnel = [
            { label: 'Submitted', count: projects.filter(p => p.stage === 'Submitted').length, color: '#64748B' },
            { label: 'Quoted', count: projects.filter(p => p.stage === 'Estimated').length, color: '#0EA5E9' },
            { label: 'Planning', count: projects.filter(p => p.stage === 'Planning' || p.stage === 'Review').length, color: '#EAB308' },
            { label: 'Building', count: projects.filter(p => p.stage === 'Building').length, color: '#A855F7' },
            { label: 'Testing', count: projects.filter(p => p.stage === 'Testing').length, color: '#EC4899' },
            { label: 'Final', count: projects.filter(p => p.stage === 'Final Checks').length, color: '#F97316' },
            { label: 'Done', count: completedCount, color: '#22C55E' },
          ];
          const maxStageCount = Math.max(...stageFunnel.map(s => s.count), 1);
          const activeCount = projects.filter(p => p.stage !== 'Completed' && p.stage !== 'Rejected').length;
          const bargainPending = projects.filter(p => p.userDecision === 'Bargained').length;
          const needsQuote = projects.filter(p => p.stage === 'Submitted' && !p.priceEstimated).length;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--dash-text)', lineHeight: 1.1 }}>
                    Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
                    <span style={{ color: 'var(--dash-accent)' }}>{user?.name ? user.name.split(' ')[0] : 'Admin'}</span>
                  </h2>
                  <p style={{ margin: '8px 0 0', fontSize: '0.88rem', color: 'var(--dash-text-sec)', fontWeight: 500 }}>
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {needsQuote > 0 && (
                    <div onClick={() => { setFilterStage('Review'); setActiveTab('projects'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--dash-danger-bg)', border: '1px solid var(--dash-danger)', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--dash-danger)' }}>{needsQuote} awaiting quote</span>
                    </div>
                  )}
                  {bargainPending > 0 && (
                    <div onClick={() => { setFilterDecision('Bargained'); setActiveTab('projects'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--dash-warning-bg)', border: '1px solid var(--dash-warning)', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--dash-warning)' }}>{bargainPending} counter offer{bargainPending > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="admin-stats-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Total Projects', value: totalProjectsCount, sub: 'all time', color: 'var(--dash-text)' },
                  { label: 'Active Now', value: activeCount, sub: 'in pipeline', color: 'var(--dash-accent)' },
                  { label: 'Completed', value: completedCount, sub: 'delivered', color: 'var(--dash-success)' },
                  { label: 'Revenue In', value: `${String.fromCharCode(8377)}${(totalRevenue / 1000).toFixed(1)}k`, sub: 'collected', color: 'var(--dash-info)' },
                ].map((stat, i) => (
                  <div key={i} className="dash-card" style={{ padding: '24px 20px', borderBottom: `3px solid ${stat.color}` }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--dash-text-muted)', marginBottom: '10px' }}>{stat.label}</div>
                    <div style={{ fontFamily: 'var(--dash-font-display)', fontSize: '2.1rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--dash-text-muted)', marginTop: '6px' }}>{stat.sub}</div>
                  </div>
                ))}
              </div>
              <div className="dash-card" style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--dash-text)' }}>Pipeline Stage Breakdown</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted)', fontWeight: 500 }}>{activeCount} active &middot; {totalProjectsCount} total</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '72px' }}>
                  {stageFunnel.map((s, i) => {
                    const barH = s.count === 0 ? 5 : Math.max(12, Math.round((s.count / maxStageCount) * 64));
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontFamily: 'var(--dash-font-display)', fontSize: '0.9rem', fontWeight: 800, color: s.count > 0 ? s.color : 'var(--dash-text-muted)' }}>{s.count}</span>
                        <div style={{ width: '100%', height: `${barH}px`, background: s.count > 0 ? s.color : 'var(--dash-card-sec)', borderRadius: '5px 5px 0 0', opacity: s.count > 0 ? 1 : 0.3 }} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {stageFunnel.map((s, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.6rem', fontWeight: 600, color: 'var(--dash-text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      {s.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-dashboard-two-col" style={{ gap: '20px', alignItems: 'start' }}>
                <div className="dash-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <h3 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--dash-text)' }}>Recent Activity</h3>
                    <button onClick={() => setActiveTab('projects')} style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--dash-accent)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      All Projects <ArrowRight size={13} />
                    </button>
                  </div>
                  {projects.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {projects.slice(0, 6).map((p, idx) => {
                        const stageBadgeMap = { 'Completed': 'dash-badge-success', 'Rejected': 'dash-badge-danger', 'Submitted': 'dash-badge-muted', 'Estimated': 'dash-badge-info' };
                        const badgeClass = stageBadgeMap[p.stage] || 'dash-badge-warning';
                        const stageLabel = p.stage === 'Submitted' ? 'New' : p.stage === 'Estimated' ? 'Quoted' : p.stage;
                        const clientInitial = p.clientName ? p.clientName.charAt(0).toUpperCase() : '?';
                        const avatarColors = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316'];
                        const avatarColor = avatarColors[idx % avatarColors.length];
                        const diff = Date.now() - new Date(p.createdAt).getTime();
                        const days = Math.floor(diff / 86400000);
                        const timeAgo = days === 0 ? 'Today' : days === 1 ? '1d ago' : `${days}d ago`;
                        return (
                          <div key={p._id} onClick={() => { setSelectedProject(p); setActiveTab('projects'); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 8px', borderBottom: idx < Math.min(projects.length, 6) - 1 ? '1px solid var(--dash-border)' : 'none', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--dash-card-sec)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: avatarColor, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '0.82rem', color: '#141210', flexShrink: 0 }}>{clientInitial}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--dash-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.projectName}</div>
                              <div style={{ fontSize: '0.73rem', color: 'var(--dash-text-sec)', marginTop: '1px' }}>{p.clientName}</div>
                            </div>
                            <span className={`dash-badge ${badgeClass}`} style={{ fontSize: '0.62rem', flexShrink: 0 }}>{stageLabel}</span>
                            <div style={{ fontSize: '0.7rem', color: 'var(--dash-text-muted)', flexShrink: 0, minWidth: '40px', textAlign: 'right' }}>{timeAgo}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: '28px', textAlign: 'center', color: 'var(--dash-text-sec)', fontSize: '0.88rem', fontStyle: 'italic' }}>No projects yet.</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="dash-card" style={{ padding: '24px', borderLeft: '4px solid var(--dash-success)' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--dash-text-muted)', marginBottom: '8px' }}>Collected</div>
                    <div style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--dash-success)' }}>{String.fromCharCode(8377)}{totalRevenue.toLocaleString()}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--dash-text-muted)', marginTop: '4px' }}>Deposits + finals paid</div>
                  </div>
                  <div className="dash-card" style={{ padding: '24px', borderLeft: '4px solid var(--dash-warning)' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--dash-text-muted)', marginBottom: '8px' }}>Pending</div>
                    <div style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--dash-warning)' }}>{String.fromCharCode(8377)}{pendingRevenue.toLocaleString()}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--dash-text-muted)', marginTop: '4px' }}>75% final payments due</div>
                  </div>
                  <div className="dash-card" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--dash-text-muted)', marginBottom: '8px' }}>Completion Rate</div>
                    <div style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--dash-accent)' }}>{totalProjectsCount > 0 ? Math.round((completedCount / totalProjectsCount) * 100) : 0}%</div>
                    <div style={{ marginTop: '10px', height: '5px', background: 'var(--dash-card-sec)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${totalProjectsCount > 0 ? Math.round((completedCount / totalProjectsCount) * 100) : 0}%`, height: '100%', background: 'var(--dash-accent)', borderRadius: '99px' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
        {/* ────────────── PROJECT WORKSPACE TAB ────────────── */}
        {activeTab === 'projects' && (
          selectedProject ? (
            <ProjectDetailsSection
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              aiAnalysisResult={aiAnalysisResult}
              aiAnalyzing={aiAnalyzing}
              chatMessageInput={chatMessageInput}
              setChatMessageInput={setChatMessageInput}
              chatLoading={chatLoading}
              handleAdminSubmitChat={handleAdminSubmitChat}
              estimateInput={estimateInput}
              setEstimateInput={setEstimateInput}
              handleSaveEstimate={handleSaveEstimate}
              handleBargainAction={handleBargainAction}
              bargainActionLoading={bargainActionLoading}
              STAGES={STAGES}
              COLUMN_COLORS={COLUMN_COLORS}
              handleUpdateStage={handleUpdateStage}
              formatRequirements={formatRequirements}
              downloadBriefText={downloadBriefText}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Page Title */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--dash-text)' }}>Project Workspace</h2>
                <p style={{ margin: '5px 0 0', fontSize: '0.83rem', color: 'var(--dash-text-sec)' }}>{filteredProjects.length} of {projects.length} projects shown</p>
              </div>
              {/* List / Kanban toggle */}
              <div style={{ display: 'flex', background: 'var(--dash-card-sec)', borderRadius: '10px', padding: '4px', gap: '4px', border: '1px solid var(--dash-border)' }}>
                <button onClick={() => setWorkspaceView('list')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontFamily: 'var(--dash-font-ui, Inter, sans-serif)', fontSize: '0.78rem', fontWeight: 700, background: workspaceView === 'list' ? 'var(--dash-accent)' : 'transparent', color: workspaceView === 'list' ? '#fff' : 'var(--dash-text-sec)', transition: 'all 0.15s' }}>
                  <FileText size={13} /> List
                </button>
                <button onClick={() => setWorkspaceView('kanban')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontFamily: 'var(--dash-font-ui, Inter, sans-serif)', fontSize: '0.78rem', fontWeight: 700, background: workspaceView === 'kanban' ? 'var(--dash-accent)' : 'transparent', color: workspaceView === 'kanban' ? '#fff' : 'var(--dash-text-sec)', transition: 'all 0.15s' }}>
                  <Layers size={13} /> Kanban
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', background: 'var(--dash-card)', border: '1px solid var(--dash-border)', borderRadius: '12px', padding: '12px 16px' }}>
              {/* Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 220px', background: 'var(--dash-card-sec)', border: '1px solid var(--dash-border)', borderRadius: '8px', padding: '0 12px' }}>
                <Search size={14} style={{ color: 'var(--dash-text-muted)', flexShrink: 0 }} />
                <input type="text" style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.83rem', color: 'var(--dash-text)', fontFamily: 'inherit', width: '100%', padding: '9px 0' }} placeholder="Search project, client, stack..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              {/* Stage */}
              <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)} style={{ border: '1px solid var(--dash-border)', background: 'var(--dash-card-sec)', color: 'var(--dash-text)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                <option value="All">All Stages</option>
                <option value="Review">Review / Submitted</option>
                <option value="Planning">Planning</option>
                <option value="Building">Building</option>
                <option value="Testing">Testing</option>
                <option value="Final Checks">Final Checks</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
              {/* Decision */}
              <select value={filterDecision} onChange={(e) => setFilterDecision(e.target.value)} style={{ border: '1px solid var(--dash-border)', background: 'var(--dash-card-sec)', color: 'var(--dash-text)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                <option value="All">All Decisions</option>
                <option value="Booked">Paid Advance</option>
                <option value="Bargained">Counter Offer</option>
                <option value="Awaiting Review">Awaiting Review</option>
                <option value="Pending Review">Pending Review</option>
              </select>
              {/* Stack */}
              <select value={filterStack} onChange={(e) => setFilterStack(e.target.value)} style={{ border: '1px solid var(--dash-border)', background: 'var(--dash-card-sec)', color: 'var(--dash-text)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                <option value="All">All Stacks</option>
                {uniqueStacks.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>

            {/* ── LIST VIEW ── */}
            {workspaceView === 'list' && (
              <div className="dash-card" style={{ padding: '0', overflowX: 'auto' }}>
                {filteredProjects.length > 0 ? (
                  <div style={{ minWidth: '800px' }}>
                    {/* Column headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1.3fr 1.3fr 1.2fr auto', gap: '0', padding: '12px 20px', borderBottom: '1px solid var(--dash-border)', background: 'var(--dash-card-sec)' }}>
                      {['Project', 'Client', 'Stack', 'Stage', 'Price', 'Decision', ''].map((h, i) => (
                        <div key={i} style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--dash-text-muted)' }}>{h}</div>
                      ))}
                    </div>
                    {/* Rows */}
                    {filteredProjects.map((p, idx) => {
                      const isSelected = selectedProject?._id === p._id;
                      const stageBadgeMap = { 'Completed': 'dash-badge-success', 'Rejected': 'dash-badge-danger', 'Submitted': 'dash-badge-muted', 'Estimated': 'dash-badge-info' };
                      const stageBadge = stageBadgeMap[p.stage] || 'dash-badge-warning';
                      const stageLabel = p.stage === 'Estimated' ? 'Quoted' : p.stage;
                      return (
                        <div key={p._id}
                          onClick={() => { setSelectedProject(p); setEstimateInput(p.estimatedPrice ? String(p.estimatedPrice) : ''); setAiAnalysisResult(null); }}
                          style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1.3fr 1.3fr 1.2fr auto', gap: '0', padding: '14px 20px', borderBottom: idx < filteredProjects.length - 1 ? '1px solid var(--dash-border)' : 'none', cursor: 'pointer', alignItems: 'center', background: isSelected ? 'rgba(255,107,53,0.04)' : 'transparent', borderLeft: isSelected ? '3px solid var(--dash-accent)' : '3px solid transparent', transition: 'background 0.15s' }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--dash-card-sec)'; }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--dash-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{p.projectName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--dash-text-sec)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.clientName}</div>
                          <div><span style={{ fontFamily: 'var(--dash-font-mono)', fontSize: '0.72rem', background: 'var(--dash-card-sec)', padding: '3px 7px', borderRadius: '5px', border: '1px solid var(--dash-border)', color: 'var(--dash-text-sec)' }}>{p.stack}</span></div>
                          <div><span className={`dash-badge ${stageBadge}`} style={{ fontSize: '0.65rem' }}>{stageLabel}</span></div>
                          <div style={{ fontFamily: 'var(--dash-font-mono)', fontSize: '0.78rem', fontWeight: 700, color: p.priceEstimated ? 'var(--dash-text)' : 'var(--dash-text-muted)' }}>
                            {p.priceEstimated ? `${String.fromCharCode(8377)}${p.estimatedPrice.toLocaleString()}` : 'No quote'}
                          </div>
                          <div>
                            {p.userDecision === 'Bargained' && <span className="dash-badge dash-badge-warning" style={{ fontSize: '0.65rem' }}>Counter</span>}
                            {p.userDecision === 'Booked' && <span className="dash-badge dash-badge-success" style={{ fontSize: '0.65rem' }}>Paid</span>}
                            {p.userDecision === 'None' && p.priceEstimated && <span className="dash-badge dash-badge-info" style={{ fontSize: '0.65rem' }}>Awaiting</span>}
                            {p.userDecision === 'None' && !p.priceEstimated && <span className="dash-badge dash-badge-muted" style={{ fontSize: '0.65rem' }}>Pending</span>}
                          </div>
                          <button style={{ padding: '6px 12px', background: 'var(--dash-card-sec)', border: '1px solid var(--dash-border)', borderRadius: '7px', fontSize: '0.73rem', fontWeight: 700, color: 'var(--dash-text)', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
                            onClick={e => { e.stopPropagation(); setSelectedProject(p); setEstimateInput(p.estimatedPrice ? String(p.estimatedPrice) : ''); setAiAnalysisResult(null); }}>
                            Open
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '56px', textAlign: 'center', color: 'var(--dash-text-muted)', fontSize: '0.88rem', fontStyle: 'italic' }}>
                    No projects match the current filters.
                  </div>
                )}
              </div>
            )}

            {/* ── KANBAN VIEW ── */}
            {workspaceView === 'kanban' && (
              <div>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {COLUMN_PHASES.map(phase => {
                    const phaseProjects = filteredProjects.filter(p => {
                      if (phase === 'Review') return p.stage === 'Submitted' || p.stage === 'Estimated' || p.stage === 'Review';
                      return p.stage === phase;
                    });
                    const colColor = COLUMN_COLORS[phase] || '#FF6B35';
                    const colIcon = COLUMN_ICONS[phase] || '📋';
                    const colBudget = phaseProjects.reduce((sum, p) => sum + (p.estimatedPrice || 0), 0);

                    return (
                      <div key={phase} style={{ flexShrink: 0, width: '210px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Column header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--dash-card)', border: '1px solid var(--dash-border)', borderTop: `3px solid ${colColor}`, borderRadius: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <span style={{ fontSize: '0.9rem' }}>{colIcon}</span>
                            <span style={{ fontFamily: 'var(--dash-font-display)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dash-text)' }}>{phase}</span>
                          </div>
                          <span style={{ fontFamily: 'var(--dash-font-display)', fontSize: '0.85rem', fontWeight: 800, color: colColor }}>{phaseProjects.length}</span>
                        </div>
                        {colBudget > 0 && (
                          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--dash-text-muted)', textAlign: 'right', paddingRight: '4px' }}>
                            {String.fromCharCode(8377)}{colBudget.toLocaleString()} value
                          </div>
                        )}
                        {/* Cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {phaseProjects.map(p => {
                            const isSelected = selectedProject?._id === p._id;
                            const progressPercent = STAGE_PROGRESS[p.stage] || 20;
                            const clientInitial = p.clientName ? p.clientName.charAt(0).toUpperCase() : 'C';
                            const avatarBgs = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
                            const avatarBg = avatarBgs[p.clientName.length % avatarBgs.length];
                            return (
                              <div key={p._id}
                                onClick={() => { setSelectedProject(p); setEstimateInput(p.estimatedPrice ? String(p.estimatedPrice) : ''); setAiAnalysisResult(null); }}
                                style={{ background: 'var(--dash-card)', border: `1px solid ${isSelected ? colColor : 'var(--dash-border)'}`, borderRadius: '10px', padding: '14px', cursor: 'pointer', boxShadow: isSelected ? `0 0 0 2px ${colColor}33` : 'none', transition: 'all 0.15s', display: 'flex', flexDirection: 'column', gap: '10px' }}
                              >
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--dash-text)', lineHeight: 1.3 }}>{p.projectName}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: avatarBg, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '0.7rem', color: '#fff', flexShrink: 0 }}>{clientInitial}</div>
                                  <span style={{ fontSize: '0.73rem', color: 'var(--dash-text-sec)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.clientName}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontFamily: 'var(--dash-font-mono)', fontSize: '0.68rem', background: 'var(--dash-card-sec)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--dash-border)', color: 'var(--dash-text-sec)' }}>{p.stack}</span>
                                  <span style={{ fontFamily: 'var(--dash-font-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--dash-text)' }}>{p.estimatedPrice ? `${String.fromCharCode(8377)}${p.estimatedPrice.toLocaleString()}` : '—'}</span>
                                </div>
                                {/* Progress bar */}
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.62rem', color: 'var(--dash-text-muted)' }}>Progress</span>
                                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: colColor }}>{progressPercent}%</span>
                                  </div>
                                  <div style={{ height: '4px', background: 'var(--dash-card-sec)', borderRadius: '99px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progressPercent}%`, height: '100%', background: colColor, borderRadius: '99px' }} />
                                  </div>
                                </div>
                                {/* Footer badges */}
                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                  {p.needsAi && <span style={{ fontSize: '0.6rem', fontWeight: 700, background: 'rgba(168,85,247,0.1)', color: '#A855F7', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(168,85,247,0.3)' }}>AI</span>}
                                  {p.userDecision === 'Bargained' && <span style={{ fontSize: '0.6rem', fontWeight: 700, background: 'var(--dash-warning-bg)', color: 'var(--dash-warning)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--dash-warning)' }}>Bargain</span>}
                                  {p.depositPaid && <span style={{ fontSize: '0.6rem', fontWeight: 700, background: 'var(--dash-success-bg)', color: 'var(--dash-success)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--dash-success)' }}>Paid</span>}
                                </div>
                                {/* Stage shift controls */}
                                <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                                  <button onClick={() => handleMoveStage(p._id, p.stage, -1)} disabled={phase === 'Review'} style={{ flex: 1, padding: '5px', background: 'var(--dash-card-sec)', border: '1px solid var(--dash-border)', borderRadius: '6px', cursor: phase === 'Review' ? 'not-allowed' : 'pointer', color: 'var(--dash-text-sec)', opacity: phase === 'Review' ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ChevronLeft size={13} />
                                  </button>
                                  <button onClick={() => handleMoveStage(p._id, p.stage, 1)} title={phase === 'Final Checks' ? 'Mark Completed' : 'Move forward'} style={{ flex: 1, padding: '5px', background: colColor, border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ChevronRight size={13} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          {phaseProjects.length === 0 && (
                            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--dash-text-muted)', fontSize: '0.73rem', fontStyle: 'italic' }}>Empty</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


          </div>
        )
      )}

        {/* ────────────── PROMOTIONS & COUPONS TAB ────────────── */}
        {activeTab === 'prices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Page title */}
            <div>
              <h2 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--dash-text)' }}>Promotions & Coupons</h2>
              <p style={{ margin: '6px 0 0', fontSize: '0.83rem', color: 'var(--dash-text-sec)' }}>Create discount codes and time-limited campaign offers.</p>
            </div>

            <div className="admin-two-col" style={{ gap: '20px', alignItems: 'start' }}>

              {/* Generate Coupon form */}
              <form className="dash-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '0' }} onSubmit={handleCreateCoupon}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--dash-accent)', marginBottom: '16px' }}>Generate Discount Coupon</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
                    <div>
                      <label className="dash-label" style={{ fontSize: '0.73rem', marginBottom: '5px', display: 'block' }}>Coupon Code</label>
                      <input type="text" className="dash-input" placeholder="e.g. SUMMER30" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} required />
                    </div>
                    <div>
                      <label className="dash-label" style={{ fontSize: '0.73rem', marginBottom: '5px', display: 'block' }}>Discount %</label>
                      <input type="number" className="dash-input" placeholder="e.g. 30" value={couponDiscount} onChange={(e) => setCouponDiscount(e.target.value)} min="1" max="100" required />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label className="dash-label" style={{ fontSize: '0.73rem', marginBottom: '5px', display: 'block' }}>Start Date</label>
                      <input type="date" className="dash-input" value={couponStartDate} onChange={(e) => setCouponStartDate(e.target.value)} required />
                    </div>
                    <div>
                      <label className="dash-label" style={{ fontSize: '0.73rem', marginBottom: '5px', display: 'block' }}>End Date</label>
                      <input type="date" className="dash-input" value={couponEndDate} onChange={(e) => setCouponEndDate(e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label className="dash-label" style={{ fontSize: '0.73rem', marginBottom: '5px', display: 'block' }}>Usage Limit (Users)</label>
                    <input type="number" className="dash-input" value={couponMaxUsers} onChange={(e) => setCouponMaxUsers(e.target.value)} placeholder="e.g. 100" />
                  </div>
                  <button type="submit" className="dash-btn" style={{ background: 'var(--dash-accent)', color: '#fff', fontWeight: 700, border: 'none', padding: '11px 0', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', marginTop: '4px' }} disabled={couponLoading}>
                    {couponLoading ? <div className="admin-spinner" /> : 'Create Coupon'}
                  </button>
                </div>
              </form>

              {/* Existing coupons */}
              <div className="dash-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--dash-accent)', marginBottom: '16px' }}>Active Coupons</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '260px', overflowY: 'auto' }}>
                  {coupons.map(c => (
                    <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--dash-card-sec)', borderRadius: '10px', border: '1px solid var(--dash-border)' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--dash-font-mono)', fontWeight: 800, fontSize: '0.88rem', color: 'var(--dash-text)' }}>{c.code}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--dash-text-sec)', marginTop: '3px' }}>{c.discountPercent}% off &middot; {c.usageCount}/{c.maxUsers} redeemed</div>
                      </div>
                      <button className="dash-btn" style={{ padding: '7px', background: 'var(--dash-danger-bg)', color: 'var(--dash-danger)', border: '1px solid var(--dash-danger)', borderRadius: '7px', cursor: 'pointer' }} onClick={() => handleDeleteCoupon(c._id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {coupons.length === 0 && <div style={{ fontSize: '0.82rem', color: 'var(--dash-text-muted)', fontStyle: 'italic', padding: '16px 0', textAlign: 'center' }}>No coupons yet.</div>}
                </div>
              </div>
            </div>

            {/* Promotion Campaign */}
            <form className="dash-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '0' }} onSubmit={handleSaveOffer}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--dash-accent)', marginBottom: '16px' }}>Date-Based Promotion Campaign</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                  <div>
                    <label className="dash-label" style={{ fontSize: '0.73rem', marginBottom: '5px', display: 'block' }}>Discount %</label>
                    <input type="number" className="dash-input" placeholder="e.g. 15" value={offerDiscount} onChange={(e) => setOfferDiscount(e.target.value)} min="1" max="100" required />
                  </div>
                  <div>
                    <label className="dash-label" style={{ fontSize: '0.73rem', marginBottom: '5px', display: 'block' }}>Campaign Description</label>
                    <input type="text" className="dash-input" placeholder="e.g. Diwali Special Offer" value={offerDescription} onChange={(e) => setOfferDescription(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="dash-label" style={{ fontSize: '0.73rem', marginBottom: '5px', display: 'block' }}>Start Date</label>
                    <input type="date" className="dash-input" value={offerStartDate} onChange={(e) => setOfferStartDate(e.target.value)} required />
                  </div>
                  <div>
                    <label className="dash-label" style={{ fontSize: '0.73rem', marginBottom: '5px', display: 'block' }}>End Date</label>
                    <input type="date" className="dash-input" value={offerEndDate} onChange={(e) => setOfferEndDate(e.target.value)} required />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" id="offer-active" checked={offerActive} onChange={(e) => setOfferActive(e.target.checked)} style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--dash-accent)' }} />
                  <label htmlFor="offer-active" style={{ fontSize: '0.83rem', color: 'var(--dash-text-sec)', cursor: 'pointer', margin: 0 }}>Activate immediately if dates match</label>
                </div>
                <button type="submit" className="dash-btn" style={{ background: 'var(--dash-accent)', color: '#fff', fontWeight: 700, border: 'none', padding: '11px 0', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }} disabled={offerLoading}>
                  {offerLoading ? <div className="admin-spinner" /> : 'Save Promotion Campaign'}
                </button>
              </div>
            </form>

          </div>
        )}

        {/* ────────────── COMMUNICATION CONSOLE TAB ────────────── */}
        {activeTab === 'alerts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div>
              <h2 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--dash-text)' }}>Communication Console</h2>
              <p style={{ margin: '6px 0 0', fontSize: '0.83rem', color: 'var(--dash-text-sec)' }}>Manage active change requests, chat with clients, and dispatch targeted alerts.</p>
            </div>

            {/* User Requested Changes / Active Support Chats section */}
            <div className="dash-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--dash-accent)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={14} />
                <span>Active User Requested Changes & Support Chats</span>
              </div>
              
              {(() => {
                const projectsWithChanges = projects.filter(p => p.changeRequests && p.changeRequests.length > 0);
                if (projectsWithChanges.length > 0) {
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                      {projectsWithChanges.map(p => {
                        const lastMsg = p.changeRequests[p.changeRequests.length - 1];
                        const lastSender = lastMsg.sender === 'admin' ? 'Admin' : 'Client';
                        const unread = lastMsg.sender === 'client'; // If client sent it, it might need attention!
                        
                        return (
                          <div 
                            key={p._id} 
                            style={{ 
                              padding: '16px', 
                              background: 'var(--dash-card-sec)', 
                              border: `1px solid ${unread ? 'var(--dash-accent)' : 'var(--dash-border)'}`, 
                              borderRadius: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '12px',
                              boxShadow: unread ? '0 4px 12px rgba(255, 107, 53, 0.05)' : 'none'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--dash-text)' }}>{p.projectName}</span>
                                {unread && (
                                  <span className="dash-badge dash-badge-warning" style={{ fontSize: '0.62rem' }}>New Client Msg</span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.73rem', color: 'var(--dash-text-sec)', marginTop: '2px' }}>Client: {p.clientName}</div>
                              
                              {/* Message preview snippet */}
                              <div style={{ 
                                marginTop: '10px', 
                                padding: '8px 10px', 
                                background: 'var(--dash-card)', 
                                borderRadius: '8px', 
                                fontSize: '0.78rem',
                                color: 'var(--dash-text-sec)',
                                border: '1px solid var(--dash-border)',
                                fontStyle: 'italic',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>
                                "{lastMsg.message}"
                              </div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--dash-text-muted)', marginTop: '6px' }}>
                                Last response by {lastSender} &middot; {new Date(lastMsg.sentAt).toLocaleString()}
                              </div>
                            </div>
                            
                            <button 
                              className="dash-btn"
                              style={{ 
                                width: '100%', 
                                background: unread ? 'var(--dash-accent)' : 'var(--dash-card)',
                                color: unread ? '#FFF' : 'var(--dash-text)',
                                border: '1px solid var(--dash-border)',
                                padding: '8px 0',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                setSelectedProject(p);
                                setEstimateInput(p.estimatedPrice ? String(p.estimatedPrice) : '');
                                setActiveTab('projects');
                              }}
                            >
                              Open Project Workspace
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                } else {
                  return (
                    <div style={{ padding: '24px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--dash-text-muted)', fontStyle: 'italic' }}>
                      No active client change requests found.
                    </div>
                  );
                }
              })()}
            </div>

            <div className="admin-comms-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>

              {/* Send broadcast form */}
              <form className="dash-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '0' }} onSubmit={handleSendBroadcast}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--dash-accent)', marginBottom: '16px' }}>Send Direct Client Alert</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label className="dash-label" style={{ fontSize: '0.73rem', marginBottom: '5px', display: 'block' }}>Target Client</label>
                    <select className="dash-input" value={alertUserId} onChange={(e) => setAlertUserId(e.target.value)} required>
                      {clients.map(c => (
                        <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="dash-label" style={{ fontSize: '0.73rem', marginBottom: '5px', display: 'block' }}>Channel</label>
                    <select className="dash-input" value={alertType} onChange={(e) => setAlertType(e.target.value)}>
                      <option value="email">Email Notification</option>
                      <option value="telegram">Telegram (Admin)</option>
                    </select>
                  </div>
                  <div>
                    <label className="dash-label" style={{ fontSize: '0.73rem', marginBottom: '5px', display: 'block' }}>Alert Title</label>
                    <input type="text" className="dash-input" placeholder="e.g. Sprint Updated" value={alertTitle} onChange={(e) => setAlertTitle(e.target.value)} required />
                  </div>
                  <div>
                    <label className="dash-label" style={{ fontSize: '0.73rem', marginBottom: '5px', display: 'block' }}>Message</label>
                    <textarea className="dash-input" style={{ height: '100px', resize: 'none', lineHeight: 1.5 }} placeholder="Write message..." value={alertMessage} onChange={(e) => setAlertMessage(e.target.value)} required />
                  </div>
                  <button type="submit" className="dash-btn" style={{ background: 'var(--dash-accent)', color: '#fff', fontWeight: 700, border: 'none', padding: '11px 0', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={alertLoading}>
                    {alertLoading ? <div className="admin-spinner" /> : (<><Send size={15} /><span>Dispatch Alert</span></>)}
                  </button>
                </div>
              </form>

              {/* Notification history */}
              <div className="dash-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--dash-accent)', marginBottom: '16px' }}>Dispatched Notifications</div>
                {notifications.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {notifications.map((n, idx) => (
                      <div key={n._id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 8px', borderBottom: idx < notifications.length - 1 ? '1px solid var(--dash-border)' : 'none' }}>
                        <span className={`dash-badge ${n.type === 'telegram' ? 'dash-badge-success' : n.type === 'whatsapp' ? 'dash-badge-warning' : 'dash-badge-info'}`} style={{ fontSize: '0.62rem', flexShrink: 0, marginTop: '2px' }}>{n.type}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.83rem', color: 'var(--dash-text)' }}>{n.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--dash-text-sec)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.message}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--dash-text-muted)', marginTop: '3px' }}>{n.recipient} &middot; {new Date(n.sentAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '32px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--dash-text-muted)', fontStyle: 'italic' }}>No notifications dispatched yet.</div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ────────────── FINANCIALS & LEDGER TAB ────────────── */}
        {activeTab === 'payments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div>
              <h2 style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--dash-text)' }}>Financials & Ledger</h2>
              <p style={{ margin: '6px 0 0', fontSize: '0.83rem', color: 'var(--dash-text-sec)' }}>Revenue collected, pending receivables, and full transaction records.</p>
            </div>

            {/* 3 summary stat cards */}
            <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { label: 'Total Collected', value: `${String.fromCharCode(8377)}${totalRevenue.toLocaleString()}`, sub: 'deposits + final payments', color: 'var(--dash-success)' },
                { label: 'Pending Receivables', value: `${String.fromCharCode(8377)}${pendingRevenue.toLocaleString()}`, sub: '75% final dues outstanding', color: 'var(--dash-warning)' },
                { label: 'Gateway Success', value: '98.4%', sub: 'Razorpay processing rate', color: 'var(--dash-info)' },
              ].map((s, i) => (
                <div key={i} className="dash-card" style={{ padding: '22px 20px', borderLeft: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--dash-text-muted)', marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--dash-font-display)', fontSize: '1.8rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--dash-text-muted)', marginTop: '6px' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Transactions table */}
            <div className="dash-card" style={{ padding: '24px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--dash-accent)' }}>Transaction Ledger</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted)' }}>{projects.filter(p => p.depositPaid).length} paid projects</span>
              </div>

              {projects.filter(p => p.depositPaid).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: '800px' }}>
                  {/* Column headers */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1.2fr 1.2fr 2fr', gap: '8px', padding: '0 12px 10px', borderBottom: '1px solid var(--dash-border)' }}>
                    {['Project', 'Client', 'Estimate', 'Deposit 25%', 'Final 75%', 'Razorpay ID'].map(h => (
                      <div key={h} style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dash-text-muted)' }}>{h}</div>
                    ))}
                  </div>
                  {projects.filter(p => p.depositPaid).map((p, idx) => {
                    const advance = Math.round((p.estimatedPrice || 0) * 0.25);
                    const finalAmt = Math.round((p.estimatedPrice || 0) * 0.75);
                    return (
                      <div key={p._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1.2fr 1.2fr 2fr', gap: '8px', padding: '12px', borderBottom: idx < projects.filter(pr => pr.depositPaid).length - 1 ? '1px solid var(--dash-border)' : 'none', alignItems: 'center', borderRadius: '6px', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--dash-card-sec)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ fontWeight: 700, fontSize: '0.83rem', color: 'var(--dash-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.projectName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--dash-text-sec)' }}>{p.clientName}</div>
                        <div style={{ fontFamily: 'var(--dash-font-mono)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--dash-text)' }}>{String.fromCharCode(8377)}{(p.estimatedPrice || 0).toLocaleString()}</div>
                        <span className="dash-badge dash-badge-success" style={{ fontSize: '0.65rem', width: 'fit-content' }}>{String.fromCharCode(8377)}{advance.toLocaleString()}</span>
                        {p.finalPaid ? (
                          <span className="dash-badge dash-badge-success" style={{ fontSize: '0.65rem', width: 'fit-content' }}>{String.fromCharCode(8377)}{finalAmt.toLocaleString()}</span>
                        ) : (
                          <span className="dash-badge dash-badge-warning" style={{ fontSize: '0.65rem', width: 'fit-content' }}>Pending</span>
                        )}
                        <div style={{ fontFamily: 'var(--dash-font-mono)', fontSize: '0.68rem', color: 'var(--dash-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.razorpayOrderId || 'Simulator'}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--dash-text-muted)', fontSize: '0.88rem', fontStyle: 'italic' }}>No payment records found yet.</div>
              )}
            </div>

          </div>
        )}

        </main>

        {/* 4. Mobile Bottom Nav Bar */}
        <nav className="dash-bottom-nav">
          {navigationItems.slice(0, 5).map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button 
                key={item.key} 
                className={`dash-bottom-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.key)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <IconComponent size={20} />
                <span>{item.label.split(' ')[0]}</span>
              </button>
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
