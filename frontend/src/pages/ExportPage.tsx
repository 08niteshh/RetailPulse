import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Boxes,
  Users,
  TrendingUp,
  LineChart,
  CheckCircle2,
  Sparkles,
  Layers,
  Database
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Badge } from '../components/common/Badge';

export const ExportPage: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadFile = (endpoint: string, filename: string) => {
    setDownloading(filename);
    const token = localStorage.getItem('retailpulse_token');
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}${endpoint}`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((err) => console.error(err))
      .finally(() => setDownloading(null));
  };

  const exportCards = [
    {
      id: 'sales',
      title: 'Sales & Transactions Dataset',
      description: 'Historical point-of-sale transactional records with order numbers, timestamps, store locations, and profit margins.',
      endpoint: '/export/sales',
      filename: 'retailpulse_sales_export.csv',
      format: 'CSV (10,000+ records)',
      icon: TrendingUp,
      badge: 'Core Analytics',
    },
    {
      id: 'products',
      title: 'Product Catalog & Margin Matrix',
      description: 'Complete SKU catalog containing unit costs, retail prices, category assignments, and gross margin percentages.',
      endpoint: '/export/products',
      filename: 'retailpulse_products_export.csv',
      format: 'CSV (Full Catalog)',
      icon: FileSpreadsheet,
      badge: 'Merchandise',
    },
    {
      id: 'inventory',
      title: 'Inventory Valuation & Reorder Report',
      description: 'Multi-store warehouse stock levels, safety stock thresholds, and stock valuation audits.',
      endpoint: '/export/inventory',
      filename: 'retailpulse_inventory_valuation.csv',
      format: 'CSV (Supply Chain)',
      icon: Boxes,
      badge: 'Supply Chain',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-medium">
              Data Lake & Export
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
            <Download className="w-6 h-6 text-blue-400" />
            Enterprise Data Export & Reporting Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Download cleaned transactional datasets, SKU catalogs, and supply chain health reports for Power BI, Tableau, Excel, and SQL workflows.
          </p>
        </div>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exportCards.map((card) => {
          const Icon = card.icon;
          const isCurrentDownloading = downloading === card.filename;
          return (
            <div
              key={card.id}
              className="glass-panel glass-panel-hover rounded-3xl p-7 border border-white/[0.08] flex flex-col justify-between space-y-5 transition-all duration-300 shadow-lg shadow-black/20"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-inner">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.05] text-slate-300 font-semibold uppercase border border-white/[0.1]">
                    {card.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold font-display text-white text-lg">{card.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">{card.description}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] space-y-3">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Format:</span>
                  <span className="text-blue-400 font-bold">{card.format}</span>
                </div>

                <button
                  onClick={() => downloadFile(card.endpoint, card.filename)}
                  disabled={isCurrentDownloading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>{isCurrentDownloading ? 'Generating CSV...' : 'Download Export'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* BI Integration Guide Banner */}
      <div className="glass-panel rounded-3xl p-7 border border-white/[0.08] space-y-2.5">
        <h3 className="font-bold text-white text-base flex items-center gap-2 font-display">
          <Sparkles className="w-5 h-5 text-blue-400" />
          Power BI & Tableau Integration Readiness
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl font-sans">
          All exported datasets are pre-cleaned and standardized according to ANSI dimensional modeling specifications (Star Schema). Easily connect these tables to Microsoft Power BI or Tableau Desktop via PostgreSQL connection strings or direct CSV import.
        </p>
      </div>
    </div>
  );
};
