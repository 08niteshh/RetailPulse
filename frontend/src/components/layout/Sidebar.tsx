import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Store,
  MapPin,
  Users,
  Boxes,
  LineChart,
  Lightbulb,
  AlertOctagon,
  Sparkles,
  UploadCloud,
  Database,
  Download,
  ShieldCheck,
  Zap,
  ChevronRight,
  LogOut,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC<{ isOpen: boolean; onClose?: () => void }> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navGroups = [
    {
      label: 'OVERVIEW',
      items: [
        { name: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'ANALYTICS',
      items: [
        { name: 'Sales & Revenue', path: '/sales', icon: TrendingUp },
        { name: 'Product Catalog & SKUs', path: '/products', icon: Package },
        { name: 'Customer Cohorts (RFM)', path: '/customers', icon: Users },
        { name: 'Store Operations', path: '/stores', icon: Store },
        { name: 'Regional Territory', path: '/regions', icon: MapPin },
      ],
    },
    {
      label: 'INTELLIGENCE',
      items: [
        { name: 'Demand Forecasting', path: '/forecast', icon: LineChart },
        { name: 'Inventory Valuation', path: '/inventory', icon: Boxes },
        { name: 'Reorder Policy (ROP)', path: '/recommendations', icon: Lightbulb },
        { name: 'Anomaly Detection', path: '/anomalies', icon: AlertOctagon },
        { name: 'Business Insights', path: '/insights', icon: Sparkles },
      ],
    },
    {
      label: 'DATA & TOOLS',
      items: [
        { name: 'CSV Pipeline & Clean', path: '/datasets', icon: UploadCloud },
        { name: 'Interactive SQL Studio', path: '/sql-analytics', icon: Database },
        { name: 'Export Center', path: '/export', icon: Download },
      ],
    },
  ];

  if (isAdmin) {
    navGroups.push({
      label: 'SYSTEM',
      items: [
        { name: 'Admin Console & Logs', path: '/admin', icon: ShieldCheck },
      ],
    });
  }

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-[#080d21]/80 dark:bg-[#080d21]/80 light:bg-white/80 border-r border-white/[0.08] backdrop-blur-2xl transition-all duration-300 flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header with Glowing Orb Indicator - Clickable to /dashboard */}
      <Link
        to="/dashboard"
        onClick={onClose}
        className="h-20 flex items-center px-6 border-b border-white/[0.08] gap-3.5 relative overflow-hidden group cursor-pointer hover:bg-white/[0.03] transition-colors"
        title="Go to Executive Dashboard"
      >
        <div className="absolute -top-10 -left-10 w-28 h-28 bg-blue-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/30 transition-all" />
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
          <Zap className="w-5 h-5 text-white font-bold animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-lg text-white tracking-tight group-hover:text-blue-200 transition-colors">
              Retail<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">Pulse</span>
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-mono font-medium truncate">
            🇮🇳 India Intelligence
          </span>
        </div>
      </Link>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1.5">
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400/80 font-mono">
              {group.label}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-violet-600/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                            isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                          }`} />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Live Stream Telemetry & User Profile Card at Bottom */}
      <div className="p-4 border-t border-white/[0.08] bg-[#050816]/60 backdrop-blur-xl space-y-3">
        {/* Real-time Status Strip */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[11px]">
          <div className="flex items-center gap-2 text-slate-400">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Telemetry</span>
          </div>
          <span className="font-mono text-emerald-400 font-semibold">ONLINE (14ms)</span>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/20 transition-all">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-violet-500/20 border border-white/20 shrink-0">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
              <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono font-semibold uppercase">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
