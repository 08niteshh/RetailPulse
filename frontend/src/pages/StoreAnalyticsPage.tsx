import React, { useState, useEffect } from 'react';
import { Store, MapPin, DollarSign, TrendingUp, ShoppingBag, Boxes, CheckSquare, Sparkles, Layers } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { apiClient } from '../api/client';
import { StoreItem } from '../types';
import { ChartCard } from '../components/common/ChartCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const StoreAnalyticsPage: React.FC = () => {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/stores');
        setStores(res.data || []);
        if (res.data?.length > 0) {
          setSelectedStoreIds([res.data[0].id, res.data[1].id]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  if (loading && stores.length === 0) {
    return <LoadingSpinner message="Evaluating retail store performances..." fullPage />;
  }

  const toggleSelectStore = (id: number) => {
    if (selectedStoreIds.includes(id)) {
      if (selectedStoreIds.length > 1) {
        setSelectedStoreIds(selectedStoreIds.filter((sId) => sId !== id));
      }
    } else {
      if (selectedStoreIds.length < 4) {
        setSelectedStoreIds([...selectedStoreIds, id]);
      }
    }
  };

  const comparedStores = stores.filter((s) => selectedStoreIds.includes(s.id));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-medium">
              Store Operations
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-display">
            Store Operations & Benchmark Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare revenue performance, order volume, margins, and active inventory valuation across 25 retail branches.
          </p>
        </div>
      </div>

      {/* Top 10 Stores Revenue Ranking Chart */}
      <ChartCard
        title="Top 10 Retail Locations by Net Revenue"
        subtitle="Gross net volume by store"
        tag="Store Leaderboard"
        height="h-76"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stores.slice(0, 10)} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
            <defs>
              <linearGradient id="storeBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="#64748B" fontSize={11} angle={-15} textAnchor="end" interval={0} />
            <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
            />
            <Bar dataKey="revenue" name="Store Revenue (₹)" fill="url(#storeBarGrad)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Store Comparison Matrix Widget */}
      <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="font-bold text-sm text-white font-display flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Side-by-Side Store Benchmark Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select 2 to 4 stores from the matrix below to benchmark metrics side-by-side.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-semibold">
            {selectedStoreIds.length} stores selected
          </span>
        </div>

        {/* Compared Stores Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {comparedStores.map((store) => (
            <div key={store.id} className="p-5 rounded-2xl bg-white/[0.03] border border-blue-500/30 shadow-lg shadow-blue-500/10 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-blue-400 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 font-semibold">
                    {store.store_code}
                  </span>
                  <h4 className="font-bold text-sm text-white mt-2 leading-snug font-display">{store.name}</h4>
                  <p className="text-[11px] text-slate-400">{store.city}, {store.state} ({store.region_name})</p>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-white/[0.06] text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Net Revenue:</span>
                  <span className="text-blue-400 font-bold">₹{store.revenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Gross Profit:</span>
                  <span className="text-emerald-400 font-bold">₹{store.profit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Profit Margin:</span>
                  <span className="text-white font-semibold">{store.margin_pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Completed Orders:</span>
                  <span className="text-slate-300">{store.orders_count.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Inventory Value:</span>
                  <span className="text-violet-400 font-bold">₹{store.inventory_value.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Stores Directory Table */}
      <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
        <h3 className="font-bold text-sm text-white font-display mb-3">All 25 Indian Retail Branches</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-white/[0.06] font-mono uppercase text-[10px]">
              <tr>
                <th className="pb-2.5 text-center w-10">Select</th>
                <th className="pb-2.5 font-semibold">Code</th>
                <th className="pb-2.5 font-semibold">Store Name</th>
                <th className="pb-2.5 font-semibold">Location / Region</th>
                <th className="pb-2.5 text-right font-semibold">Revenue</th>
                <th className="pb-2.5 text-right font-semibold">Profit</th>
                <th className="pb-2.5 text-right font-semibold">Orders</th>
                <th className="pb-2.5 text-right font-semibold">Margin %</th>
                <th className="pb-2.5 text-right font-semibold">Inventory Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {stores.map((s) => {
                const isSelected = selectedStoreIds.includes(s.id);
                return (
                  <tr key={s.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectStore(s.id)}
                        className="rounded border-white/20 text-blue-500 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                    </td>
                    <td className="py-3 font-mono text-slate-400">{s.store_code}</td>
                    <td className="py-3 font-medium text-white">{s.name}</td>
                    <td className="py-3 text-slate-400">{s.city}, {s.state}</td>
                    <td className="py-3 text-right font-mono font-bold text-blue-400">
                      ₹{s.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right font-mono text-emerald-400 font-bold">₹{s.profit.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right font-mono text-slate-300">{s.orders_count.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right font-mono text-white">{s.margin_pct}%</td>
                    <td className="py-3 text-right font-mono text-violet-400 font-bold">
                      ₹{s.inventory_value.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
