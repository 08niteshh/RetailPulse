import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  Boxes,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { apiClient } from '../api/client';
import { RecommendationItem } from '../types';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const RecommendationsPage: React.FC = () => {
  const [recs, setRecs] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/inventory/recommendations');
        setRecs(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (loading && recs.length === 0) {
    return <LoadingSpinner message="Calculating optimal purchase order allocations & lead time safety cushions..." fullPage />;
  }

  const filteredRecs = filterRisk === 'ALL'
    ? recs
    : recs.filter((r) => r.stockout_risk === filterRisk);

  const highRiskCount = recs.filter((r) => r.stockout_risk === 'HIGH').length;
  const mediumRiskCount = recs.filter((r) => r.stockout_risk === 'MEDIUM').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-medium">
              PO Replenishment Engine
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
            <Lightbulb className="w-6 h-6 text-blue-400" />
            Intelligent Reorder & Replenishment Policy Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quantitative inventory optimization based on forecasted demand, lead times, safety stocks, and stockout probability.
          </p>
        </div>

        {/* Risk Filter Buttons */}
        <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/[0.08] text-xs">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((risk) => (
            <button
              key={risk}
              onClick={() => setFilterRisk(risk)}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                filterRisk === risk
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {risk} Risk {risk === 'HIGH' ? `(${highRiskCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 shadow-lg shadow-rose-500/10 space-y-1">
          <span className="text-xs font-mono font-semibold text-rose-300">High Stockout Risk</span>
          <div className="text-3xl font-extrabold font-mono text-rose-400 font-display mt-1">{highRiskCount} SKUs</div>
          <p className="text-[11px] text-slate-300 mt-1">Expected stockout within 7 days without replenishment</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 shadow-lg shadow-amber-500/10 space-y-1">
          <span className="text-xs font-mono font-semibold text-amber-300">Medium Stockout Risk</span>
          <div className="text-3xl font-extrabold font-mono text-amber-400 font-display mt-1">{mediumRiskCount} SKUs</div>
          <p className="text-[11px] text-slate-300 mt-1">Approaching calculated Reorder Point buffer</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 space-y-1">
          <span className="text-xs font-mono font-semibold text-emerald-300">Healthy Stock Cushion</span>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 font-display mt-1">
            {recs.length - highRiskCount - mediumRiskCount} SKUs
          </div>
          <p className="text-[11px] text-slate-300 mt-1">Adequate coverage for &gt;20 days of forecasted demand</p>
        </div>
      </div>

      {/* Recommendation Cards List */}
      <div className="space-y-4">
        {filteredRecs.map((rec) => (
          <div
            key={rec.product_id}
            className={`glass-panel p-6 rounded-2xl border transition-all duration-300 ${
              rec.stockout_risk === 'HIGH'
                ? 'border-rose-500/30 hover:border-rose-500/60 shadow-lg shadow-rose-500/5'
                : rec.stockout_risk === 'MEDIUM'
                ? 'border-amber-500/30 hover:border-amber-500/60 shadow-lg shadow-amber-500/5'
                : 'border-white/[0.08] hover:border-white/20'
            }`}
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/[0.1]">
                    {rec.sku}
                  </span>
                  <span className="text-xs text-slate-400 font-sans">{rec.category}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      rec.stockout_risk === 'HIGH'
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                        : rec.stockout_risk === 'MEDIUM'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {rec.stockout_risk} RISK
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-display">{rec.product_name}</h3>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{rec.reason}"
                </p>
              </div>

              {/* Numbers Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.08] text-xs font-mono shrink-0">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-sans block">Current Stock</span>
                  <span className="font-bold text-white text-base mt-0.5 block">{rec.current_stock}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-sans block">30D Forecast</span>
                  <span className="font-bold text-cyan-400 text-base mt-0.5 block">{rec.forecasted_demand_30d}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-sans block">Reorder Point</span>
                  <span className="font-bold text-amber-400 text-base mt-0.5 block">{rec.reorder_point}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-sans block">Recommended PO</span>
                  <span className="font-bold text-emerald-400 text-base mt-0.5 block">+{rec.recommended_reorder_qty} units</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
