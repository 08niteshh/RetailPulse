import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  TrendingUp,
  Boxes,
  Clock,
  Sparkles,
  DollarSign,
  Percent,
  AlertTriangle,
  Layers,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { apiClient } from '../api/client';
import { ProductDetailResponse } from '../types';
import { KPICard } from '../components/common/KPICard';
import { ChartCard } from '../components/common/ChartCard';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/products/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading || !data) {
    return <LoadingSpinner message="Calculating SKU demand forecast & inventory metrics..." fullPage />;
  }

  const { product, monthly_trend, forecast, inventory_metrics } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Back Button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Product Catalog</span>
        </button>

        <span className="text-xs font-mono text-slate-400">System SKU Index: #{product.id}</span>
      </div>

      {/* Product Hero Header */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-white/[0.12] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden bg-gradient-to-r from-blue-950/30 via-indigo-950/20 to-[#080d21]/60">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] px-3 py-1 rounded-full bg-white/[0.05] text-slate-300 border border-white/[0.1] font-mono font-semibold">
              {product.sku}
            </span>
            <span className="text-[11px] px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-semibold">
              {product.category_name}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-display">{product.name}</h1>
        </div>

        <div className="flex items-center gap-6 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.08]">
          <div className="text-right">
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono">Retail Price</span>
            <span className="text-2xl font-bold font-mono text-white">₹{product.unit_price.toFixed(2)}</span>
          </div>
          <div className="text-right border-l border-white/[0.08] pl-6">
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono">Unit Cost</span>
            <span className="text-2xl font-bold font-mono text-slate-400">₹{product.unit_cost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Mini Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Gross Margin</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 font-display">{product.margin_pct}%</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Lifetime Units Sold</span>
          <div className="text-2xl font-extrabold font-mono text-white font-display">{product.units_sold.toLocaleString('en-IN')}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Total Net Revenue</span>
          <div className="text-2xl font-extrabold font-mono text-blue-400 font-display">₹{product.revenue.toLocaleString('en-IN')}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Current Stock Level</span>
          <div className="text-2xl font-extrabold font-mono text-violet-400 font-display">{inventory_metrics.current_stock} units</div>
        </div>
      </div>

      {/* Historical Sales Trend & 30-Day Demand Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historical Monthly Sales */}
        <ChartCard
          title="Monthly Historical Sales Curve"
          subtitle="Monthly revenue and unit volume history"
          tag="Historical"
          height="h-76"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="skuRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Monthly Revenue']}
              />
              <Area type="monotone" dataKey="revenue" name="Monthly Revenue (₹)" stroke="#10B981" strokeWidth={2.5} fill="url(#skuRevGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 30-Day Statistical Forecast */}
        <ChartCard
          title="30-Day Predictive Demand Forecast"
          subtitle="Time-series projection with 95% confidence intervals"
          tag="Holt-Winters"
          height="h-76"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="upper_bound" name="95% Upper Bound" stroke="#93C5FD" strokeDasharray="3 3" fill="none" />
              <Area type="monotone" dataKey="forecast" name="Forecasted Units" stroke="#3B82F6" strokeWidth={2.5} fill="url(#forecastGrad)" />
              <Area type="monotone" dataKey="lower_bound" name="95% Lower Bound" stroke="#93C5FD" strokeDasharray="3 3" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Inventory & Reorder Diagnostics */}
      <div className="glass-panel p-6 lg:p-8 rounded-2xl border border-white/[0.08] space-y-5">
        <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
          <Boxes className="w-5 h-5 text-blue-400" />
          Inventory Optimization & Replenishment Parameters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
            <span className="text-xs text-slate-400 font-mono font-semibold">Active Capital Valuation</span>
            <div className="text-xl font-bold font-mono text-white">
              ₹{inventory_metrics.total_stock_value.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Total warehouse and in-transit capital tied up in this SKU.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
            <span className="text-xs text-slate-400 font-mono font-semibold">Reorder Point Trigger (ROP)</span>
            <div className="text-xl font-bold font-mono text-amber-400">
              {inventory_metrics.reorder_point} units
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Supplier lead time: {inventory_metrics.lead_time_days} days. Target stock buffer: {inventory_metrics.target_stock} units.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
            <span className="text-xs text-slate-400 font-mono font-semibold">Forecast 30-Day Demand</span>
            <div className="text-xl font-bold font-mono text-cyan-400">
              {Math.round(inventory_metrics.forecast_30d_demand)} units
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Automated PO dispatch recommended when stock falls below {inventory_metrics.reorder_point} units.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
