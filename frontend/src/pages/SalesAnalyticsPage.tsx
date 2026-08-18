import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  Layers,
  DollarSign,
  ShoppingCart,
  Percent,
  Sparkles,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { apiClient } from '../api/client';
import { useFilters } from '../context/FilterContext';
import { SalesAnalyticsResponse } from '../types';
import { KPICard } from '../components/common/KPICard';
import { ChartCard } from '../components/common/ChartCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const SalesAnalyticsPage: React.FC = () => {
  const { filters, toQueryParams } = useFilters();
  const [granularity, setGranularity] = useState('daily');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [data, setData] = useState<SalesAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/sales', {
        params: {
          ...toQueryParams(),
          granularity,
          comparison_mode: comparisonMode,
        },
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [
    granularity,
    comparisonMode,
    filters.datePreset,
    filters.startDate,
    filters.endDate,
    filters.regionId,
    filters.storeId,
    filters.categoryId,
    filters.productId,
  ]);

  if (loading && !data) {
    return <LoadingSpinner message="Aggregating multi-grain sales time series..." fullPage />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Drill-down Granularity Controls */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-medium">
              Sales Engine
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-display">
            Sales & Revenue Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-grain sales drilldown, period comparisons, revenue velocities, and basket analysis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Comparison Mode Toggle */}
          <button
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              comparisonMode
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-md shadow-blue-500/20'
                : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Comparison YoY: {comparisonMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Granularity Selector Pills */}
          <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/[0.08] text-xs">
            {['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition-all ${
                  granularity === g
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KPICard data={data?.kpis.total_revenue} icon={<DollarSign className="w-4 h-4" />} loading={loading} accentColor="blue" />
        <KPICard data={data?.kpis.total_orders} icon={<ShoppingCart className="w-4 h-4" />} loading={loading} accentColor="violet" />
        <KPICard data={data?.kpis.aov} icon={<TrendingUp className="w-4 h-4" />} loading={loading} accentColor="cyan" />
        <KPICard data={data?.kpis.profit_margin} icon={<Percent className="w-4 h-4" />} loading={loading} accentColor="emerald" />
      </div>

      {/* Main Dual-Axis Time Series Chart */}
      <ChartCard
        title={`Sales Performance (${granularity.toUpperCase()} Grain)`}
        subtitle="Revenue volume bars against profit margins and transactions"
        tag="Time-Series"
        height="h-96"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data?.time_series || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="salesBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="profitBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#047857" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
            <YAxis yAxisId="left" stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="right" orientation="right" stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              formatter={(val: any, name: any) => {
                if (name === 'Net Revenue' || name === 'Gross Profit') return [`₹${Number(val).toLocaleString('en-IN')}`, name];
                if (name === 'Profit Margin %') return [`${val}%`, name];
                return [val, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
            <Bar yAxisId="left" dataKey="revenue" name="Net Revenue" fill="url(#salesBarGrad)" radius={[6, 6, 0, 0]} />
            <Bar yAxisId="left" dataKey="profit" name="Gross Profit" fill="url(#profitBarGrad)" radius={[6, 6, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="margin_pct" name="Profit Margin %" stroke="#F59E0B" strokeWidth={3} dot={{ r: 3, fill: '#F59E0B' }} activeDot={{ r: 6 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Granular Breakdown Table */}
      <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <h3 className="font-bold text-sm text-white font-display">
            Granular Sales Ledger (INR ₹)
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {data?.time_series.length || 0} periods analyzed
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-white/[0.06] font-mono uppercase text-[10px]">
              <tr>
                <th className="pb-2.5 font-semibold">Period</th>
                <th className="pb-2.5 text-right font-semibold">Orders</th>
                <th className="pb-2.5 text-right font-semibold">Units Sold</th>
                <th className="pb-2.5 text-right font-semibold">AOV</th>
                <th className="pb-2.5 text-right font-semibold">Revenue</th>
                <th className="pb-2.5 text-right font-semibold">Profit</th>
                <th className="pb-2.5 text-right font-semibold">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono">
              {(data?.time_series || []).slice(-15).reverse().map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3 font-sans font-semibold text-white">{row.date}</td>
                  <td className="py-3 text-right text-slate-300">{row.orders.toLocaleString('en-IN')}</td>
                  <td className="py-3 text-right text-slate-300">{row.units.toLocaleString('en-IN')}</td>
                  <td className="py-3 text-right text-cyan-400 font-semibold">₹{row.aov.toFixed(2)}</td>
                  <td className="py-3 text-right text-blue-400 font-bold">₹{row.revenue.toLocaleString('en-IN')}</td>
                  <td className="py-3 text-right text-emerald-400 font-bold">₹{row.profit.toLocaleString('en-IN')}</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[10px]">
                      {row.margin_pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
