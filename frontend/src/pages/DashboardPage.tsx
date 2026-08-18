import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
  Percent,
  Boxes,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Download,
  Calendar,
  Layers,
  Activity,
  ArrowRight,
  TrendingDown,
  Target
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { apiClient } from '../api/client';
import { useFilters } from '../context/FilterContext';
import { useAuth } from '../context/AuthContext';
import { DashboardOverviewResponse } from '../types';
import { KPICard } from '../components/common/KPICard';
import { ChartCard } from '../components/common/ChartCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

const CATEGORY_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { filters, toQueryParams } = useFilters();
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/dashboard/overview', {
        params: toQueryParams(),
      });
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch executive dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [
    filters.datePreset,
    filters.startDate,
    filters.endDate,
    filters.regionId,
    filters.storeId,
    filters.categoryId,
    filters.productId,
  ]);

  if (loading && !data) {
    return <LoadingSpinner message="Calculating real-time KPI metrics & multi-store trends..." fullPage />;
  }

  const firstName = user?.full_name?.split(' ')[0] || 'Leader';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Hero / Dashboard Header */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl relative overflow-hidden bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-[#080d21]/60 border border-white/[0.12] shadow-2xl">
        {/* Decorative Ambient Beam */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Executive Command Center
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-display">
              Good morning, {firstName}
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Here is what is happening with your multi-store retail business across 25 locations and 120 SKUs today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] hover:border-white/20 text-slate-200 text-xs font-semibold transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Pulse</span>
            </button>
            <Link
              to="/export"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Reports</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchDashboardData} className="underline text-xs">Retry</button>
        </div>
      )}

      {/* 2. KPI Cards Grid (8 Core Metrics with Specific Accent Glows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KPICard
          data={data?.kpis.total_revenue}
          icon={<DollarSign className="w-4 h-4" />}
          loading={loading}
          accentColor="blue"
        />
        <KPICard
          data={data?.kpis.total_profit}
          icon={<TrendingUp className="w-4 h-4" />}
          loading={loading}
          accentColor="emerald"
        />
        <KPICard
          data={data?.kpis.total_orders}
          icon={<ShoppingCart className="w-4 h-4" />}
          loading={loading}
          accentColor="violet"
        />
        <KPICard
          data={data?.kpis.total_customers}
          icon={<Users className="w-4 h-4" />}
          loading={loading}
          accentColor="cyan"
        />
        <KPICard
          data={data?.kpis.aov}
          icon={<Target className="w-4 h-4" />}
          loading={loading}
          accentColor="amber"
        />
        <KPICard
          data={data?.kpis.profit_margin}
          icon={<Percent className="w-4 h-4" />}
          loading={loading}
          accentColor="emerald"
        />
        <KPICard
          data={data?.kpis.sales_growth}
          icon={<Activity className="w-4 h-4" />}
          loading={loading}
          accentColor="blue"
        />
        <KPICard
          data={data?.kpis.inventory_value}
          icon={<Boxes className="w-4 h-4" />}
          loading={loading}
          accentColor="violet"
        />
      </div>

      {/* 3. Main Revenue & Profit Split Section (Dominant Left Area + Right Performance Scorecard) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Glowing Revenue & Profit Trajectory Area Chart (2 Cols) */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Revenue & Gross Profit Trajectory"
            subtitle="Synchronized daily sales velocity vs gross profit margin curve"
            tag="Real-Time"
            tooltipText="Displays synchronized daily net sales and gross profit calculated from underlying transaction order items."
            height="h-88"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenue_trend || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                <Area type="monotone" dataKey="revenue" name="Net Revenue (₹)" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="profit" name="Gross Profit (₹)" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#profGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Right: Executive Performance Scorecard */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-5 border border-white/[0.08]">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="font-bold text-base text-white tracking-tight font-display flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Executive Pulse Scorecard
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              OPTIMAL
            </span>
          </div>

          <div className="space-y-4">
            {/* Revenue Item */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Net Sales</span>
                <span className="font-bold text-white font-mono">{data?.kpis.total_revenue?.formatted_value}</span>
              </div>
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full w-[84%]" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Target: $200k</span>
                <span className="text-emerald-400 font-semibold">108% Met</span>
              </div>
            </div>

            {/* Profit Margin Item */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Blended Gross Margin</span>
                <span className="font-bold text-emerald-400 font-mono">{data?.kpis.profit_margin?.formatted_value}</span>
              </div>
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full w-[72%]" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Target: 45.0%</span>
                <span className="text-emerald-400 font-semibold">+4.3% Above Target</span>
              </div>
            </div>

            {/* Order Volume Item */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Active Order Velocity</span>
                <span className="font-bold text-violet-400 font-mono">{data?.kpis.total_orders?.formatted_value} Orders</span>
              </div>
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-violet-500 to-purple-500 h-full rounded-full w-[91%]" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Avg Ticket: {data?.kpis.aov?.formatted_value}</span>
                <span className="text-violet-400 font-semibold">+7.6% MoM</span>
              </div>
            </div>
          </div>

          <Link
            to="/sales"
            className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all group"
          >
            <span>Deep Dive Sales Analytics</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 4. Categorical Breakdown + Regional Territory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Contribution Thin Donut (1 Col) */}
        <div className="lg:col-span-1">
          <ChartCard
            title="Merchandise Department Share"
            subtitle="Contribution breakdown across 8 core categories"
            height="h-76"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.category_revenue || []}
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="revenue"
                  nameKey="category"
                >
                  {(data?.category_revenue || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', maxHeight: '70px', overflowY: 'auto' }}
                  layout="horizontal"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Regional Revenue Horizontal Bar Chart (2 Cols) */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Territory Performance Leaderboard"
            subtitle="Net sales generated across 5 Indian regional operating zones"
            height="h-76"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.regional_revenue || []}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                <YAxis dataKey="region" type="category" stroke="#64748B" fontSize={11} width={120} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Bar dataKey="revenue" name="Net Sales (₹)" fill="url(#barGrad)" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* 5. Top 10 High Performers vs Bottom 10 Laggards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Winners */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 font-display">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              Top 10 High-Growth SKUs
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Ranked by Net Revenue</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-white/[0.06] font-mono uppercase text-[10px]">
                <tr>
                  <th className="pb-2.5 font-semibold">SKU / Product</th>
                  <th className="pb-2.5 font-semibold">Category</th>
                  <th className="pb-2.5 text-right font-semibold">Sales</th>
                  <th className="pb-2.5 text-right font-semibold">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {(data?.top_products || []).map((p, idx) => (
                  <tr key={p.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-3 font-medium text-white truncate max-w-[170px]">
                      <Link to={`/products/${p.id}`} className="hover:text-blue-400 flex items-center gap-1.5">
                        <span className="text-slate-400 font-mono text-[10px]">#{idx + 1}</span>
                        <span className="truncate">{p.name}</span>
                      </Link>
                    </td>
                    <td className="py-3 text-slate-400">{p.category}</td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-400">
                      ₹{p.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-semibold">
                        {p.margin_pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom 10 Laggards */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 font-display">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
              Bottom 10 Margin Underperformers
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Attention Required</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-white/[0.06] font-mono uppercase text-[10px]">
                <tr>
                  <th className="pb-2.5 font-semibold">SKU / Product</th>
                  <th className="pb-2.5 font-semibold">Category</th>
                  <th className="pb-2.5 text-right font-semibold">Sales</th>
                  <th className="pb-2.5 text-right font-semibold">Units Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {(data?.bottom_products || []).map((p, idx) => (
                  <tr key={p.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-3 font-medium text-slate-300 truncate max-w-[170px]">
                      <Link to={`/products/${p.id}`} className="hover:text-amber-400 flex items-center gap-1.5">
                        <span className="text-slate-400 font-mono text-[10px]">#{idx + 1}</span>
                        <span className="truncate">{p.name}</span>
                      </Link>
                    </td>
                    <td className="py-3 text-slate-400">{p.category}</td>
                    <td className="py-3 text-right font-mono font-bold text-amber-400">
                      ₹{p.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right font-mono text-slate-400">
                      {p.units}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
