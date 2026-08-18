import React, { useState, useEffect } from 'react';
import {
  Database,
  Play,
  Clock,
  Download,
  Code2,
  Sparkles,
  Layers,
  CheckCircle,
  AlertCircle,
  FileCode,
  Terminal
} from 'lucide-react';
import { apiClient } from '../api/client';
import { PresetSQLQuery, SQLQueryResult } from '../types';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const SQLAnalyticsPage: React.FC = () => {
  const [presets, setPresets] = useState<PresetSQLQuery[]>([]);
  const [activeQuery, setActiveQuery] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [queryResult, setQueryResult] = useState<SQLQueryResult | null>(null);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPresets, setLoadingPresets] = useState(true);

  useEffect(() => {
    const fetchPresets = async () => {
      setLoadingPresets(true);
      try {
        const res = await apiClient.get('/sql/presets');
        setPresets(res.data || []);
        if (res.data?.length > 0) {
          setSelectedPresetId(res.data[0].id);
          setActiveQuery(res.data[0].sql);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPresets(false);
      }
    };
    fetchPresets();
  }, []);

  const handleSelectPreset = (preset: PresetSQLQuery) => {
    setSelectedPresetId(preset.id);
    setActiveQuery(preset.sql);
    setError(null);
  };

  const handleExecuteQuery = async () => {
    if (!activeQuery.trim()) return;
    setExecuting(true);
    setError(null);
    try {
      const res = await apiClient.post('/sql/execute', { query: activeQuery });
      setQueryResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to execute query.');
      setQueryResult(null);
    } finally {
      setExecuting(false);
    }
  };

  const exportResultsCSV = () => {
    if (!queryResult || queryResult.rows.length === 0) return;
    const cols = queryResult.columns;
    const header = cols.join(',');
    const rows = queryResult.rows.map((r) =>
      cols.map((c) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sql_query_result_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activePreset = presets.find((p) => p.id === selectedPresetId);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-medium">
              SQL Data Engine
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
            <Database className="w-6 h-6 text-blue-400" />
            SQL Analytics Studio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive SQL query engine showcasing Common Table Expressions (CTEs), Window Functions (RANK, LAG, SUM OVER), and complex relational joins.
          </p>
        </div>
      </div>

      {/* Preset Query Showcase Buttons */}
      <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-slate-400">
          Showcase Analytical Query Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`p-4 rounded-2xl text-left border transition-all duration-300 ${
                selectedPresetId === p.id
                  ? 'bg-blue-500/15 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold">
                  {p.category}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">{p.title}</h4>
            </button>
          ))}
        </div>
      </div>

      {/* Preset Details / Concept Tags */}
      {activePreset && (
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
          <p className="text-slate-300 max-w-2xl leading-relaxed">{activePreset.description}</p>
          <div className="flex flex-wrap gap-2">
            {activePreset.concepts_used.map((concept, idx) => (
              <span key={idx} className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* SQL Editor & Execution Bar */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl">
        <div className="p-4 bg-white/[0.02] border-b border-white/[0.08] flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span>PostgreSQL Query Runner</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExecuteQuery}
              disabled={executing}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{executing ? 'Executing...' : 'Run Query'}</span>
            </button>
          </div>
        </div>

        {/* Text Area Code Editor */}
        <textarea
          value={activeQuery}
          onChange={(e) => setActiveQuery(e.target.value)}
          rows={11}
          className="w-full bg-[#050816] text-blue-300 font-mono text-xs p-5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-y leading-relaxed"
          placeholder="SELECT * FROM orders WHERE status = 'Completed' LIMIT 50;"
        />
      </div>

      {/* Error Output */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 shadow-lg shadow-rose-500/5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Query Results Table */}
      {queryResult && (
        <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-3">
              <h3 className="font-bold font-display text-white text-base">Query Results</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.05] text-slate-300 font-mono border border-white/[0.1]">
                {queryResult.row_count} rows returned
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" /> {queryResult.execution_time_ms} ms
              </span>
            </div>

            <button
              onClick={exportResultsCSV}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.1] hover:border-white/20 text-slate-200 hover:text-white text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto max-h-96 custom-scrollbar">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-slate-400 border-b border-white/[0.06] uppercase text-[10px] sticky top-0 bg-[#080B1A]/90 backdrop-blur-md">
                <tr>
                  {queryResult.columns.map((col) => (
                    <th key={col} className="pb-2.5 pr-4 font-semibold">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {queryResult.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/[0.03]">
                    {queryResult.columns.map((col, cIdx) => (
                      <td key={cIdx} className="py-2.5 pr-4 text-slate-300">
                        {row[col] !== null && row[col] !== undefined
                          ? typeof row[col] === 'number'
                            ? Number(row[col]).toLocaleString()
                            : String(row[col])
                          : <span className="text-slate-600 italic">NULL</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
