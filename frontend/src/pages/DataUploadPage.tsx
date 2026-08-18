import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Database,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { apiClient } from '../api/client';
import { DatasetUploadResponse, CleaningSummary } from '../types';
import { ChartCard } from '../components/common/ChartCard';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const DataUploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<DatasetUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sampleSeeding, setSampleSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (f.name.endsWith('.csv')) {
        setFile(f);
        setError(null);
      } else {
        setError('Please drop a valid .csv file.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.name.endsWith('.csv')) {
        setFile(f);
        setError(null);
      } else {
        setError('Please select a valid .csv file.');
      }
    }
  };

  const executePipeline = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/datasets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Data ingestion pipeline encountered an error.');
    } finally {
      setUploading(false);
    }
  };

  const handleSeedSample = async () => {
    setSampleSeeding(true);
    setSeedMessage(null);
    try {
      const res = await apiClient.post('/datasets/seed-sample?target_count=100000');
      setSeedMessage(res.data.message || '100,000+ transaction dataset successfully loaded.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to seed sample dataset.');
    } finally {
      setSampleSeeding(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-medium">
              Data Pipeline & ETL
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
            <UploadCloud className="w-6 h-6 text-blue-400" />
            Data Ingestion & Automated Cleaning Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload CSV datasets for automated schema validation, missing value imputation, duplicate removal, and ingestion into PostgreSQL.
          </p>
        </div>

        <button
          onClick={handleSeedSample}
          disabled={sampleSeeding}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] hover:border-blue-500 text-slate-200 hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
        >
          <Database className="w-4 h-4 text-blue-400" />
          <span>{sampleSeeding ? 'Seeding 100k+ records...' : 'Regenerate 100k+ Dataset'}</span>
        </button>
      </div>

      {seedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg shadow-emerald-500/5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{seedMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 shadow-lg shadow-rose-500/5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Drag and drop upload zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        className="glass-panel rounded-3xl p-10 border-2 border-dashed border-white/[0.12] hover:border-blue-500/60 text-center transition-all flex flex-col items-center justify-center space-y-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
          <FileSpreadsheet className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-base font-bold font-display text-white">
            {file ? file.name : 'Drag & Drop CSV Dataset or Browse File'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Supports POS transaction logs with columns: <code className="text-blue-400 font-mono text-[11px]">order_id, date, customer_id, product, category, quantity, unit_price, cost</code>
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <label className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] hover:border-white/20 text-slate-200 text-xs font-semibold cursor-pointer transition-colors">
            Select CSV File
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          {file && (
            <button
              onClick={executePipeline}
              disabled={uploading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {uploading ? (
                <span>Cleaning & Ingesting...</span>
              ) : (
                <>
                  <span>Run Cleaning Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Cleaning Summary Scorecard (Displayed once file processed) */}
      {uploadResult && (
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-blue-500/30 space-y-5 shadow-lg shadow-blue-500/5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="font-bold font-display text-white text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                Data Cleaning & Validation Scorecard
              </h3>
              <Badge variant="success">Pipeline Complete</Badge>
            </div>

            {/* Scorecard Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase font-sans block">Rows Ingested</span>
                <span className="font-bold text-white text-lg mt-0.5 block">
                  {uploadResult.summary.rows_uploaded.toLocaleString()}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase font-sans block">Duplicates Purged</span>
                <span className="font-bold text-amber-400 text-lg mt-0.5 block">
                  {uploadResult.summary.duplicates_removed.toLocaleString()}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase font-sans block">Missing Imputed</span>
                <span className="font-bold text-cyan-400 text-lg mt-0.5 block">
                  {uploadResult.summary.missing_imputed.toLocaleString()}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase font-sans block">Sanitized Records</span>
                <span className="font-bold text-violet-400 text-lg mt-0.5 block">
                  {uploadResult.summary.invalid_records_fixed.toLocaleString()}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase font-sans block">Valid Final Rows</span>
                <span className="font-bold text-emerald-400 text-lg mt-0.5 block">
                  {uploadResult.summary.final_records.toLocaleString()}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase font-sans block">Detected Columns</span>
                <span className="font-bold text-white text-lg mt-0.5 block">
                  {uploadResult.summary.columns_detected.length}
                </span>
              </div>
            </div>

            {/* Audit Log Steps */}
            <div className="pt-3 border-t border-white/[0.06]">
              <h4 className="text-xs font-bold text-slate-400 uppercase font-mono mb-3">
                10-Step Automated Pipeline Execution Audit Trail
              </h4>
              <div className="space-y-2">
                {uploadResult.summary.cleaning_steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cleaned Dataset Preview Table */}
          {uploadResult.preview.length > 0 && (
            <div className="glass-panel rounded-3xl p-6 border border-white/[0.08] space-y-4">
              <h3 className="font-bold font-display text-white text-sm">
                Cleaned Data Preview (Sample First 10 Records)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-slate-400 border-b border-white/[0.06] uppercase text-[10px]">
                    <tr>
                      {Object.keys(uploadResult.preview[0]).map((col) => (
                        <th key={col} className="pb-2.5 pr-4 font-semibold">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {uploadResult.preview.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-white/[0.03]">
                        {Object.values(row).map((val: any, cIdx) => (
                          <td key={cIdx} className="py-2.5 pr-4 text-slate-300 truncate max-w-[150px]">
                            {typeof val === 'number' ? val.toLocaleString() : String(val)}
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
      )}
    </div>
  );
};
