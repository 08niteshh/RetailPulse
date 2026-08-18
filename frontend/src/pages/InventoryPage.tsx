import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Activity,
  Layers
} from 'lucide-react';
import { apiClient } from '../api/client';
import { useFilters } from '../context/FilterContext';
import { InventoryOverviewResponse } from '../types';
import { Badge } from '../components/common/Badge';
import { AlertBanner } from '../components/common/AlertBanner';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { filters } = useFilters();
  const [data, setData] = useState<InventoryOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/inventory', {
        params: {
          store_id: filters.storeId || undefined,
          category_id: filters.categoryId || undefined,
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
    fetchInventory();
  }, [filters.storeId, filters.categoryId]);

  if (loading && !data) {
    return <LoadingSpinner message="Calculating stock velocity & turnover ratios..." fullPage />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GREEN':
        return <Badge variant="success">Healthy</Badge>;
      case 'YELLOW':
        return <Badge variant="warning">Low Stock</Badge>;
      case 'RED':
        return <Badge variant="danger">Critical Risk</Badge>;
      case 'GRAY':
        return <Badge variant="neutral">Out of Stock</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-medium">
              Inventory Control
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-display">
            Inventory Intelligence & Stock Health
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time stock valuation, turnover ratios (COGS / Avg Inventory), days of supply, and stockout risk monitoring.
          </p>
        </div>

        <button
          onClick={() => navigate('/recommendations')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Reorder Engine</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Catalog Stock Valuation</span>
          <div className="text-3xl font-extrabold text-white mt-1 font-display">
            ₹{data?.total_stock_value.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block font-mono">
            {data?.total_units_in_stock.toLocaleString('en-IN')} total units across Indian warehouses
          </span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Annualized Stock Turnover</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1 font-display font-mono">
            {data?.overall_turnover_ratio.toFixed(1)}x
          </div>
          <span className="text-[11px] text-emerald-400/80 mt-2 block">COGS / Avg Inventory Velocity</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Low & Critical Stock SKUs</span>
          <div className="text-3xl font-extrabold text-amber-400 mt-1 font-display font-mono">
            {(data?.low_stock_count || 0) + (data?.critical_count || 0)} SKUs
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block font-mono">
            {data?.critical_count} critical • {data?.low_stock_count} low cushion
          </span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Depleted Out of Stock</span>
          <div className="text-3xl font-extrabold text-rose-400 mt-1 font-display font-mono">
            {data?.out_of_stock_count} SKUs
          </div>
          <span className="text-[11px] text-rose-400/80 mt-2 block">Zero inventory available</span>
        </div>
      </div>

      {/* Automated Alert Banners */}
      <div className="space-y-3">
        {data?.alerts.map((alt, idx) => (
          <AlertBanner
            key={idx}
            type={alt.type}
            title={alt.title}
            message={alt.message}
            count={alt.count}
          />
        ))}
      </div>

      {/* Inventory Stock Ledger Table */}
      <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <h3 className="font-bold text-sm text-white font-display">Active SKU Inventory Directory</h3>
          <span className="text-[11px] text-slate-400 font-mono">{data?.items.length || 0} SKUs indexed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-white/[0.06] font-mono uppercase text-[10px]">
              <tr>
                <th className="pb-2.5 font-semibold">SKU / Product</th>
                <th className="pb-2.5 font-semibold">Category</th>
                <th className="pb-2.5 text-right font-semibold">Current Stock</th>
                <th className="pb-2.5 text-right font-semibold">Reorder Point</th>
                <th className="pb-2.5 text-right font-semibold">Safety Stock</th>
                <th className="pb-2.5 text-right font-semibold">30D Velocity</th>
                <th className="pb-2.5 text-right font-semibold">Days of Supply</th>
                <th className="pb-2.5 text-right font-semibold">Stock Valuation</th>
                <th className="pb-2.5 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono">
              {(data?.items || []).map((item) => (
                <tr key={item.product_id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3 font-sans font-medium text-white max-w-[200px]">
                    <div className="truncate font-semibold text-slate-100" title={item.product_name}>
                      {item.product_name}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                  </td>
                  <td className="py-3 font-sans text-slate-400">{item.category_name}</td>
                  <td className="py-3 text-right font-bold text-white">{item.current_stock}</td>
                  <td className="py-3 text-right text-slate-400">{item.reorder_point}</td>
                  <td className="py-3 text-right text-slate-400">{item.safety_stock}</td>
                  <td className="py-3 text-right text-cyan-400 font-semibold">{item.units_sold_30d} units</td>
                  <td className="py-3 text-right">
                    <span
                      className={`font-semibold ${
                        item.days_of_supply <= 7
                          ? 'text-rose-400'
                          : item.days_of_supply <= 20
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {item.days_of_supply > 365 ? '>365d' : `${item.days_of_supply}d`}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-emerald-400">
                    ₹{item.inventory_value.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 text-center">{getStatusBadge(item.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
