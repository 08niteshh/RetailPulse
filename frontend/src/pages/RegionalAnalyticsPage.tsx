import React, { useState, useEffect } from 'react';
import { MapPin, Users, TrendingUp, DollarSign, Store, Tag, Sparkles } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { apiClient } from '../api/client';
import { RegionItem } from '../types';
import { ChartCard } from '../components/common/ChartCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const RegionalAnalyticsPage: React.FC = () => {
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegions = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/regions');
        setRegions(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegions();
  }, []);

  if (loading && regions.length === 0) {
    return <LoadingSpinner message="Calculating regional territory breakdowns..." fullPage />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-medium">
              Territory Command
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-display">
            Regional Performance & Territory Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographic sales distribution, profit contributions, store footprints, and top merchandise categories across 5 operational zones.
          </p>
        </div>
      </div>

      {/* Regional Scorecards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {regions.map((reg) => (
          <div key={reg.id} className="glass-panel glass-panel-hover rounded-2xl p-5 border border-white/[0.08] space-y-3 relative overflow-hidden transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                {reg.code}
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Store className="w-3 h-3 text-slate-400" /> {reg.store_count} stores
              </span>
            </div>

            <div>
              <h3 className="font-bold text-sm text-white font-display">{reg.name}</h3>
              <p className="text-[11px] text-slate-400">Lead: {reg.manager_name || 'Regional VP'}</p>
            </div>

            <div className="space-y-1.5 pt-2.5 border-t border-white/[0.06] text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Revenue:</span>
                <span className="text-blue-400 font-bold">₹{reg.revenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Margin:</span>
                <span className="text-emerald-400 font-semibold">{reg.margin_pct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Orders:</span>
                <span className="text-slate-300">{reg.orders_count.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06]">
              <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Top Department</span>
              <span className="text-xs font-semibold text-cyan-400 truncate block mt-0.5">
                {reg.top_category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Regional Comparison Chart */}
      <ChartCard
        title="Territory Revenue & Gross Profit Breakdown"
        subtitle="Side-by-side volume and profitability across 5 Indian regional business units"
        tag="5 Operating Zones"
        height="h-84"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={regions} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="regRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="regProfGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#047857" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
            <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
            <Bar dataKey="revenue" name="Net Revenue (₹)" fill="url(#regRevGrad)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="profit" name="Gross Profit (₹)" fill="url(#regProfGrad)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};
