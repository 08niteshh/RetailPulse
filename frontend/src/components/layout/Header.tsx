import React, { useState, useRef, useEffect } from 'react';
import {
  Menu, Sun, Moon, LogOut, Bell, Search, Radio, Sparkles, X, CheckCircle2,
  AlertTriangle, ArrowUpRight, User as UserIcon, Shield, ChevronDown, Key,
  Check, RefreshCw, Layers, Database, Sliders, ExternalLink, HelpCircle, MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';

export const Header: React.FC<{ onMenuToggle: () => void }> = ({ onMenuToggle }) => {
  const { user, login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSwitchingUser, setIsSwitchingUser] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 1,
      title: 'High Demand Surge Detected',
      desc: 'Electronics & Audio SKU-ELEC-1001 up 34% WoW across Mumbai & Delhi.',
      time: '10m ago',
      type: 'surge',
      unread: true,
    },
    {
      id: 2,
      title: 'Automated PO Triggered (₹4.2L)',
      desc: 'Reorder Point reached for 8 high-velocity items in Bengaluru Hub.',
      time: '1h ago',
      type: 'reorder',
      unread: true,
    },
    {
      id: 3,
      title: 'Monthly ETL Pipeline Complete',
      desc: '48,500+ Indian retail transactions successfully normalized in INR (₹).',
      time: '3h ago',
      type: 'system',
      unread: false,
    },
  ];

  const handleQuickSwitch = async (email: string, pass: string) => {
    try {
      setIsSwitchingUser(true);
      await login(email, pass);
      setShowProfileMenu(false);
      navigate('/dashboard');
    } catch (e) {
      console.error('Failed to switch user', e);
    } finally {
      setIsSwitchingUser(false);
    }
  };

  // Derive human-readable page title
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/dashboard': return { title: 'Executive Overview', desc: 'Real-time multi-store retail health & Indian market KPIs' };
      case '/sales': return { title: 'Sales & Revenue Analytics', desc: 'Multi-grain drilldown & YoY / MoM comparisons in INR (₹)' };
      case '/products': return { title: 'Product Catalog Intelligence', desc: 'SKU performance, margins & stock health' };
      case '/customers': return { title: 'Customer Behavioral Analytics', desc: 'RFM segmentation, retention & LTV cohorts across India' };
      case '/stores': return { title: 'Store Operations Matrix', desc: '25 Indian retail branches benchmarking & side-by-side comparison' };
      case '/regions': return { title: 'Regional Territory Command', desc: 'North, West, South, East & Central India market share' };
      case '/inventory': return { title: 'Inventory Control Center', desc: 'Stock valuation, turnover ratio & days of supply in ₹' };
      case '/forecast': return { title: 'Demand Forecasting Studio', desc: 'Holt-Winters statistical time-series projections' };
      case '/recommendations': return { title: 'Reorder Policy & PO Engine', desc: 'Safety stock & automated replenishment recommendations' };
      case '/anomalies': return { title: 'Anomaly Detection Monitor', desc: 'Z-Score & IQR outlier diagnostics for Indian festive peaks' };
      case '/insights': return { title: 'Prescriptive Decision Intelligence', desc: 'AI-driven executive findings & high-ROI action plans' };
      case '/datasets': return { title: 'CSV Data Pipeline & Ingestion', desc: '10-step automated data cleaning & validation scorecard' };
      case '/sql-analytics': return { title: 'Interactive SQL Studio', desc: 'Live SQL runner with CTEs & window function presets' };
      case '/export': return { title: 'Data Export Center', desc: 'One-click CSV & report download center' };
      case '/admin': return { title: 'System Administration', desc: 'User RBAC provisioning & security audit trail' };
      default: return { title: 'RetailPulse Platform', desc: 'India Sales & Demand Intelligence' };
    }
  };

  const currentMeta = getPageTitle(location.pathname);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      <header className="h-20 border-b border-white/[0.08] bg-[#080d21]/60 backdrop-blur-2xl sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.08]"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
                <h1 className="text-base lg:text-lg font-bold text-white tracking-tight truncate hover:text-blue-400 transition-colors">
                  {currentMeta.title}
                </h1>
              </Link>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                🇮🇳 Live (INR ₹)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block truncate">
              {currentMeta.desc}
            </p>
          </div>
        </div>

        {/* Right Controls: Search, Notifications, Theme, User Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Search Bar with Key Shortcut */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus-within:border-blue-500/50 focus-within:bg-white/[0.06] transition-all w-60">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKUs, Indian stores, metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
            />
            <kbd className="hidden lg:inline-block text-[10px] font-mono text-slate-400 bg-white/[0.08] px-1.5 py-0.5 rounded border border-white/[0.1]">
              ⌘K
            </kbd>
          </div>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-[#0b1026] border border-white/[0.12] shadow-2xl p-4 space-y-3 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    System Notifications
                  </span>
                  <span className="text-[10px] text-blue-400 font-mono">2 New</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-xs transition-all ${
                        n.unread
                          ? 'bg-blue-500/10 border-blue-500/30 text-white'
                          : 'bg-white/[0.02] border-white/[0.05] text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* User ID Pill & Avatar with Rich Dropdown Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 pl-2 py-1 pr-2 rounded-2xl hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all cursor-pointer group"
              title="Click to view Account, Roles, and Options"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-blue-500/20 border border-white/20 group-hover:scale-105 transition-transform">
                  {user?.full_name?.charAt(0) || 'A'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#080d21]"></span>
              </div>
              <div className="text-left hidden xl:block">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-white leading-tight group-hover:text-blue-300 transition-colors">
                    {user?.full_name?.split(' ')[0] || 'User'}
                  </p>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  {user?.role === 'ADMIN' ? 'Admin (ID #1)' : 'Analyst (ID #2)'}
                </p>
              </div>
            </button>

            {/* Rich User Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-84 rounded-2xl bg-[#0b1026]/95 border border-white/[0.12] shadow-2xl p-3 space-y-3 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Summary Header */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center font-bold text-sm text-white shadow-lg border border-white/20">
                      {user?.full_name?.charAt(0) || 'A'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{user?.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono font-semibold uppercase">
                          {user?.role}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                          🇮🇳 India (INR ₹)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <UserIcon className="w-4 h-4 text-blue-400" />
                      <span>View Account Profile & RBAC Details</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">ID #{user?.id}</span>
                  </button>

                  <Link
                    to="/dashboard"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>Executive Dashboard</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Shield className="w-4 h-4 text-purple-400" />
                        <span>System Admin & Audit Logs</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                    </Link>
                  )}

                  <Link
                    to="/sql-analytics"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Database className="w-4 h-4 text-amber-400" />
                      <span>Interactive SQL Studio</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>
                </div>

                {/* Quick Role Switcher */}
                <div className="border-t border-white/[0.08] pt-2.5">
                  <span className="block px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                    Switch Demo Account
                  </span>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleQuickSwitch('admin@retailpulse.io', 'AdminPass123!')}
                      disabled={isSwitchingUser || user?.email === 'admin@retailpulse.io'}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        user?.email === 'admin@retailpulse.io'
                          ? 'bg-blue-500/10 border border-blue-500/30 text-blue-300 font-semibold'
                          : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <div className="text-left">
                          <p className="leading-tight">Aarav Sharma</p>
                          <p className="text-[10px] text-slate-400">Executive Admin</p>
                        </div>
                      </div>
                      {user?.email === 'admin@retailpulse.io' && (
                        <Check className="w-4 h-4 text-blue-400" />
                      )}
                    </button>

                    <button
                      onClick={() => handleQuickSwitch('analyst@retailpulse.io', 'AnalystPass123!')}
                      disabled={isSwitchingUser || user?.email === 'analyst@retailpulse.io'}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        user?.email === 'analyst@retailpulse.io'
                          ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold'
                          : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                        <div className="text-left">
                          <p className="leading-tight">Priya Patel</p>
                          <p className="text-[10px] text-slate-400">Lead BI Analyst</p>
                        </div>
                      </div>
                      {user?.email === 'analyst@retailpulse.io' && (
                        <Check className="w-4 h-4 text-indigo-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer Sign Out */}
                <div className="border-t border-white/[0.08] pt-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out from Session</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">End Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Account Profile & RBAC Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0b1026] border border-white/[0.12] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-purple-950/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center font-bold text-lg text-white shadow-lg border border-white/20">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{user?.full_name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Account Meta Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] uppercase text-slate-400 font-mono font-bold block mb-1">User Identifier</span>
                  <span className="text-white font-mono font-semibold">USR-00{user?.id}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] uppercase text-slate-400 font-mono font-bold block mb-1">Role Classification</span>
                  <span className="text-blue-400 font-mono font-semibold uppercase">{user?.role}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] uppercase text-slate-400 font-mono font-bold block mb-1">Market & Territory</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> India (5 Zones, 25 Stores)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] uppercase text-slate-400 font-mono font-bold block mb-1">Standard Currency</span>
                  <span className="text-amber-400 font-mono font-semibold">Indian Rupee (INR ₹)</span>
                </div>
              </div>

              {/* Permissions & Security Clearances */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-2 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  Assigned Platform Capabilities
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Executive KPI Telemetry
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Demand Forecasting Models
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> RFM Customer Intelligence
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Interactive SQL Studio
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Automated Inventory ROP
                  </div>
                  <div className={`flex items-center gap-2 p-2 rounded-lg border ${
                    isAdmin 
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      : 'bg-white/[0.02] text-slate-500 border-white/[0.05]'
                  }`}>
                    {isAdmin ? <CheckCircle2 className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    Admin User Provisioning
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/[0.08] bg-white/[0.01] flex justify-between items-center">
              <span className="text-[11px] text-slate-400 font-mono">
                RetailPulse v2.4 · India Edition
              </span>
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
