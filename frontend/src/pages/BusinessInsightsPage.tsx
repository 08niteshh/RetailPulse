import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Boxes,
  MapPin,
  Users,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { apiClient } from '../api/client';
import { InsightsResponse, InsightItem } from '../types';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const BusinessInsightsPage: React.FC = () => {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/insights');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading && !data) {
    return <LoadingSpinner message="Generating prescriptive decision intelligence..." fullPage />;
  }

  const filteredInsights = selectedCategory === 'ALL'
    ? data?.insights || []
    : (data?.insights || []).filter((i) => i.category === selectedCategory);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'REVENUE':
        return <DollarSign className="w-4 h-4 text-blue-400" />;
      case 'PROFITABILITY':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'INVENTORY':
        return <Boxes className="w-4 h-4 text-amber-400" />;
      case 'REGIONAL':
        return <MapPin className="w-4 h-4 text-violet-400" />;
      case 'CUSTOMER':
        return <Users className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-medium">
              Prescriptive Decision AI
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-blue-400" />
            Executive Decision Intelligence & Insights
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Data-backed diagnostic, predictive, and prescriptive business recommendations synthesized directly from multi-store retail data.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center bg-white/[0.03] p-1 rounded-xl border border-white/[0.08] text-xs">
          {['ALL', 'REVENUE', 'PROFITABILITY', 'INVENTORY', 'REGIONAL', 'CUSTOMER'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Total Generated Recommendations</span>
          <div className="text-3xl font-extrabold text-white font-display mt-1">
            {data?.summary_stats.total_insights} Active Findings
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block font-mono">
            Pipeline Sync: {data?.generated_at}
          </span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 space-y-1">
          <span className="text-[10px] font-bold uppercase text-emerald-300 font-mono">High Financial Impact Findings</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono font-display mt-1">
            {data?.summary_stats.high_impact_count} High Priority
          </div>
          <span className="text-[11px] text-emerald-300/80 mt-2 block">Direct EBITDA & revenue optimization</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 shadow-lg shadow-cyan-500/10 space-y-1">
          <span className="text-[10px] font-bold uppercase text-cyan-300 font-mono">Business Disciplines Covered</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono font-display mt-1">
            {data?.summary_stats.categories_covered.length} Core Domains
          </div>
          <span className="text-[11px] text-cyan-300/80 mt-2 block">Holistic operational assessment</span>
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="space-y-4">
        {filteredInsights.map((item) => (
          <div
            key={item.id}
            className="glass-panel glass-panel-hover rounded-3xl p-6 lg:p-7 border border-white/[0.08] space-y-5 transition-all duration-300"
          >
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-inner">
                  {getCategoryIcon(item.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/[0.1] uppercase">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                        item.impact_level === 'HIGH'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {item.impact_level} IMPACT
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white font-display mt-1">{item.title}</h3>
                </div>
              </div>

              {item.metric_value && (
                <span className="text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm shadow-blue-500/10">
                  {item.metric_value}
                </span>
              )}
            </div>

            {/* 4-Part Intelligence Architecture: Finding, Evidence, Impact, Action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
              {/* Finding & Evidence */}
              <div className="space-y-3.5 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <h4 className="font-bold font-mono text-blue-400 uppercase text-[10px] mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    1. Diagnostic Finding
                  </h4>
                  <p className="text-slate-200 leading-relaxed font-sans">
                    {item.finding}
                  </p>
                </div>
                <div className="pt-3 border-t border-white/[0.06]">
                  <h4 className="font-bold font-mono text-cyan-400 uppercase text-[10px] mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    2. Quantitative Evidence
                  </h4>
                  <p className="text-slate-400 leading-relaxed font-sans">{item.evidence}</p>
                </div>
              </div>

              {/* Impact & Prescriptive Action */}
              <div className="space-y-3.5 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <h4 className="font-bold font-mono text-amber-400 uppercase text-[10px] mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    3. Strategic Business Impact
                  </h4>
                  <p className="text-slate-200 leading-relaxed font-sans">
                    {item.business_impact}
                  </p>
                </div>
                <div className="pt-3 border-t border-white/[0.06]">
                  <h4 className="font-bold font-mono text-emerald-400 uppercase text-[10px] mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 4. Prescriptive Action Plan
                  </h4>
                  <p className="text-emerald-300 font-semibold leading-relaxed font-sans">{item.recommended_action}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
