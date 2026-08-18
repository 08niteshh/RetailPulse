import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Info,
  Sliders,
  Sparkles,
  Calendar,
  Filter,
  Activity
} from 'lucide-react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { apiClient } from '../api/client';
import { AnomalyResponse, AnomalyItem } from '../types';
import { ChartCard } from '../components/common/ChartCard';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AnomalyDetectionPage: React.FC = () => {
  const [metricType, setMetricType] = useState('revenue');
  const [thresholdSigma, setThresholdSigma] = useState(2.2);
  const [data, setData] = useState<AnomalyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/anomalies', {
        params: {
          metric_type: metricType,
          threshold_sigma: thresholdSigma,
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
    fetchAnomalies();
  }, [metricType, thresholdSigma]);

  if (loading && !data) {
    return <LoadingSpinner message="Scanning historical transaction time series for Z-score & IQR statistical outliers..." fullPage />;
  }

  const filteredAnomalies = filterSeverity === 'ALL'
    ? data?.anomalies || []
    : (data?.anomalies || []).filter((a) => a.severity === filterSeverity);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-medium">
              Statistical Diagnostics
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
            <AlertOctagon className="w-6 h-6 text-rose-400" />
            Statistical Anomaly Detection Studio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Detect revenue shocks, abnormal transaction spikes, and localized sales dips using rolling Z-Score (μ ± 2.5σ) and IQR thresholds.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Metric Selector */}
          <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/[0.08]">
            {['revenue', 'orders', 'profit'].map((m) => (
              <button
                key={m}
                onClick={() => setMetricType(m)}
                className={`px-3.5 py-1.5 rounded-lg capitalize font-medium transition-all ${
                  metricType === m
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Sigma Threshold Slider */}
          <div className="flex items-center gap-3 bg-white/[0.03] px-3.5 py-1.5 rounded-xl border border-white/[0.08]">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300 font-mono text-xs">Sensitivity: {thresholdSigma}σ</span>
            <input
              type="range"
              min="1.8"
              max="3.5"
              step="0.1"
              value={thresholdSigma}
              onChange={(e) => setThresholdSigma(parseFloat(e.target.value))}
              className="w-20 accent-blue-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Summary Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Total Outliers Detected</span>
          <div className="text-3xl font-extrabold text-white font-display mt-1">
            {data?.total_anomalies} events
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Statistical boundary violations</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 shadow-lg shadow-rose-500/10 space-y-1">
          <span className="text-[10px] font-bold uppercase text-rose-300 font-mono">Critical Severity (|Dev| &gt; 40%)</span>
          <div className="text-3xl font-extrabold font-mono text-rose-400 font-display mt-1">
            {data?.critical_count} critical events
          </div>
          <span className="text-[11px] text-rose-300/80 mt-2 block">High financial impact shock</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 shadow-lg shadow-amber-500/10 space-y-1">
          <span className="text-[10px] font-bold uppercase text-amber-300 font-mono">Warning Outliers (|Dev| 20-40%)</span>
          <div className="text-3xl font-extrabold font-mono text-amber-400 font-display mt-1">
            {data?.warning_count} warnings
          </div>
          <span className="text-[11px] text-amber-300/80 mt-2 block">Moderate deviation from run rate</span>
        </div>
      </div>

      {/* Time Series Bounds Chart */}
      <ChartCard
        title={`Observed ${metricType.toUpperCase()} vs Rolling Expected Bounds`}
        subtitle="Historical daily points plotted against statistical rolling upper and lower confidence thresholds"
        tag="Z-Score Boundary"
        height="h-88"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data?.time_series_with_bounds || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickFormatter={(v) => (metricType === 'orders' ? v : `₹${(v / 1000).toFixed(0)}k`)}
            />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
            <Line type="monotone" dataKey="upper_bound" name="Upper Outlier Bound" stroke="#F43F5E" strokeDasharray="3 3" dot={false} />
            <Line type="monotone" dataKey="lower_bound" name="Lower Outlier Bound" stroke="#F43F5E" strokeDasharray="3 3" dot={false} />
            <Line type="monotone" dataKey="expected" name="14D Rolling Baseline" stroke="#64748B" strokeWidth={1.5} dot={false} />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual Metric"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload && payload.is_anomaly) {
                  return (
                    <circle
                      key={`dot-${cx}-${cy}`}
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill="#EF4444"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  );
                }
                return <circle key={`dot-empty-${cx}-${cy}`} cx={cx} cy={cy} r={1.5} fill="#3B82F6" />;
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Filter Severity Pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="font-bold text-sm text-white font-display">
          Detected Anomaly Incident Logs ({filteredAnomalies.length})
        </h3>
        <div className="flex items-center gap-2 text-xs">
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-xl border text-xs font-semibold transition-all ${
                filterSeverity === sev
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/20'
                  : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Anomaly Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {filteredAnomalies.map((a) => (
          <div
            key={a.id}
            className={`glass-panel p-6 rounded-2xl border space-y-4 transition-all duration-300 ${
              a.severity === 'CRITICAL'
                ? 'border-rose-500/40 bg-rose-500/10 shadow-lg shadow-rose-500/10'
                : a.severity === 'WARNING'
                ? 'border-amber-500/40 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                : 'border-white/[0.08]'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                    a.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                      : a.severity === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                  }`}
                >
                  {a.severity}
                </span>
                <span className="text-xs font-mono text-slate-400">{a.date}</span>
              </div>

              <span
                className={`flex items-center gap-1 text-xs font-mono font-bold ${
                  a.anomaly_type === 'SPIKE' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {a.anomaly_type === 'SPIKE' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {a.deviation_pct > 0 ? `+${a.deviation_pct}%` : `${a.deviation_pct}%`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.06] text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-sans block">Actual {a.metric}</span>
                <span className="text-white font-bold text-base mt-0.5 block">
                  {metricType === 'orders' ? `${Math.round(a.actual_value)}` : `₹${a.actual_value.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-sans block">Expected Baseline</span>
                <span className="text-slate-400 font-bold text-base mt-0.5 block">
                  {metricType === 'orders' ? `${Math.round(a.expected_value)}` : `₹${a.expected_value.toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {a.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
