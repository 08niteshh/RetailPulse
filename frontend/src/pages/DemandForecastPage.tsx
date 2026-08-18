import React, { useState, useEffect } from 'react';
import {
  LineChart as LineChartIcon,
  Sparkles,
  TrendingUp,
  Target,
  Clock,
  Award,
  Calendar,
  Layers,
  HelpCircle,
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
import { ForecastResponse, ProductItem, RegionItem, StoreItem } from '../types';
import { ChartCard } from '../components/common/ChartCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const DemandForecastPage: React.FC = () => {
  const [horizon, setHorizon] = useState<number>(30);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Load product list for picker
  useEffect(() => {
    const fetchProds = async () => {
      try {
        const res = await apiClient.get('/products', { params: { limit: 50, sort_by: 'revenue' } });
        setProductsList(res.data.items || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProds();
  }, []);

  const runForecast = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/forecast', {
        params: {
          product_id: selectedProductId || undefined,
          horizon_days: horizon,
        },
      });
      setForecastData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runForecast();
  }, [horizon, selectedProductId]);

  if (loading && !forecastData) {
    return <LoadingSpinner message="Fitting Holt-Winters exponential smoothing & ARIMA parameters..." fullPage />;
  }

  // Combine historical and forecasted series for seamless chart rendering
  const chartData = [
    ...(forecastData?.historical_points || []).map((h) => ({
      date: h.date,
      historical: h.actual,
      forecast: null,
      upper_bound: null,
      lower_bound: null,
      baseline: null,
    })),
    ...(forecastData?.forecast_points || []).map((f) => ({
      date: f.date,
      historical: null,
      forecast: f.forecast,
      upper_bound: f.upper_bound,
      lower_bound: f.lower_bound,
      baseline: f.baseline,
    })),
  ];

  const metrics = forecastData?.metrics;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-medium">
              Predictive ML Studio
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
            <LineChartIcon className="w-6 h-6 text-blue-400" />
            Demand Forecasting Studio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical time-series forecasting (Holt-Winters / ARIMA) with out-of-sample error benchmarking and prediction bands.
          </p>
        </div>

        {/* Target & Horizon Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Product Selector */}
          <select
            value={selectedProductId || ''}
            onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : null)}
            className="bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-1.5 text-white max-w-[220px] truncate focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
          >
            <option value="" className="bg-[#0b1026]">All Catalog Products</option>
            {productsList.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0b1026]">
                {p.name} ({p.sku})
              </option>
            ))}
          </select>

          {/* Horizon Pills */}
          <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/[0.08]">
            {[7, 30, 60, 90].map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  horizon === h
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {h}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model Performance & Evaluation Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-1">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Model Accuracy (MAPE)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold">
              +{metrics?.improvement_pct}% Lift
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 font-display mt-1">
            {metrics?.mape}%
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block font-mono">
            Baseline Benchmark: {metrics?.baseline_mape}%
          </span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Mean Absolute Error (MAE)</span>
          <div className="text-3xl font-extrabold font-mono text-white font-display mt-1">
            {metrics?.mae} units
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Average error magnitude</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Root Mean Squared (RMSE)</span>
          <div className="text-3xl font-extrabold font-mono text-cyan-400 font-display mt-1">
            {metrics?.rmse} units
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Penalizes large variations</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Active Algorithm</span>
          <div className="text-sm font-bold text-violet-400 mt-1 truncate font-mono" title={metrics?.model_name}>
            {metrics?.model_name}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block truncate">
            Target: {forecastData?.target_name}
          </span>
        </div>
      </div>

      {/* Main Forecast Chart */}
      <ChartCard
        title={`Historical Velocity & ${horizon}-Day Forecast Horizon`}
        subtitle="Historical demand (emerald), predicted future run-rate (blue), baseline (amber), and 95% confidence intervals"
        tag="Confidence Cone (95%)"
        height="h-96"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
            <YAxis stroke="#64748B" fontSize={11} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
            {/* Historical Series */}
            <Line type="monotone" dataKey="historical" name="Historical Demand" stroke="#10B981" strokeWidth={2} dot={false} />
            {/* 95% Confidence Bounds */}
            <Line type="monotone" dataKey="upper_bound" name="95% Upper Bound" stroke="#93C5FD" strokeDasharray="3 3" dot={false} />
            <Line type="monotone" dataKey="lower_bound" name="95% Lower Bound" stroke="#93C5FD" strokeDasharray="3 3" dot={false} />
            {/* Forecast Series */}
            <Area type="monotone" dataKey="forecast" name="Forecast Model" stroke="#3B82F6" strokeWidth={2.5} fill="url(#forecastAreaGrad)" />
            {/* Moving Average Baseline Benchmark */}
            <Line type="monotone" dataKey="baseline" name="Baseline 14D Benchmark" stroke="#F59E0B" strokeDasharray="4 4" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Model Diagnostic Insights */}
      <div className="glass-panel p-6 lg:p-8 rounded-2xl border border-white/[0.08] space-y-4">
        <h3 className="font-bold text-sm text-white font-display flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          Automated Model Diagnostic Findings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(forecastData?.insights || []).map((ins, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-300 flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-1 shadow-[0_0_8px_#60a5fa]"></span>
              <span className="leading-relaxed">{ins}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
