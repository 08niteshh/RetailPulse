import React, { useState, useEffect } from 'react';
import { Filter, RotateCcw, Calendar, MapPin, Store as StoreIcon, Layers, ChevronDown, Check } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { apiClient } from '../../api/client';
import { RegionItem, StoreItem } from '../../types';

export const GlobalFilterBar: React.FC = () => {
  const {
    filters,
    setDatePreset,
    setCustomDateRange,
    setRegionId,
    setStoreId,
    resetFilters,
  } = useFilters();

  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStart, setCustomStart] = useState(filters.startDate || '2025-01-01');
  const [customEnd, setCustomEnd] = useState(filters.endDate || '2026-03-15');

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [regRes, storeRes] = await Promise.all([
          apiClient.get('/regions'),
          apiClient.get('/stores'),
        ]);
        setRegions(regRes.data || []);
        setStores(storeRes.data || []);
      } catch (err) {
        // Silent fallback
      }
    };
    fetchMetadata();
  }, []);

  const datePresets = [
    { id: '7d', label: '7D' },
    { id: '30d', label: '30D' },
    { id: '90d', label: '90D' },
    { id: 'ytd', label: 'YTD' },
    { id: 'all', label: 'All-Time' },
    { id: 'custom', label: 'Custom' },
  ];

  const filteredStores = filters.regionId
    ? stores.filter((s) => {
        const reg = regions.find((r) => r.id === filters.regionId);
        return reg && s.region_name === reg.name;
      })
    : stores;

  const hasActiveFilters =
    filters.datePreset !== '30d' ||
    filters.regionId !== null ||
    filters.storeId !== null ||
    filters.categoryId !== null;

  return (
    <div className="bg-[#050816]/70 dark:bg-[#050816]/70 light:bg-white/80 border-b border-white/[0.06] backdrop-blur-xl px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs z-20">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Presets Group with Glowing Pill */}
        <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/[0.08] shadow-inner">
          <Calendar className="w-3.5 h-3.5 text-blue-400 ml-2 mr-1.5" />
          <div className="flex items-center gap-1">
            {datePresets.map((preset) => {
              const isActive = filters.datePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    if (preset.id === 'custom') {
                      setShowCustomModal(true);
                    } else {
                      setDatePreset(preset.id);
                    }
                  }}
                  className={`px-3 py-1 rounded-lg font-medium text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-500/20 ring-1 ring-white/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Region Filter Dropdown */}
        <div className="flex items-center bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-white/20 transition-all">
          <MapPin className="w-3.5 h-3.5 text-indigo-400 mr-2 shrink-0" />
          <select
            value={filters.regionId || ''}
            onChange={(e) => setRegionId(e.target.value ? Number(e.target.value) : null)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-3 font-medium text-xs"
          >
            <option value="" className="bg-[#0b1026] text-slate-200">
              All Regions (5 Operational Zones)
            </option>
            {regions.map((r) => (
              <option key={r.id} value={r.id} className="bg-[#0b1026] text-slate-200">
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Store Filter Dropdown */}
        <div className="flex items-center bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-white/20 transition-all">
          <StoreIcon className="w-3.5 h-3.5 text-cyan-400 mr-2 shrink-0" />
          <select
            value={filters.storeId || ''}
            onChange={(e) => setStoreId(e.target.value ? Number(e.target.value) : null)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-3 max-w-[200px] truncate font-medium text-xs"
          >
            <option value="" className="bg-[#0b1026] text-slate-200">
              All Retail Stores ({filteredStores.length})
            </option>
            {filteredStores.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#0b1026] text-slate-200">
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Active Indicator & Quick Reset */}
      <div className="flex items-center gap-3">
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Active Filters</span>
          </button>
        )}
      </div>

      {/* Custom Date Range Glass Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-md border border-white/[0.15] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h4 className="font-bold text-base text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Custom Analytics Horizon
              </h4>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-mono">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full bg-[#080d21] border border-white/[0.12] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-mono">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full bg-[#080d21] border border-white/[0.12] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs border border-white/[0.08] hover:bg-white/[0.05] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setCustomDateRange(customStart, customEnd);
                  setShowCustomModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 transition-all"
              >
                Apply Custom Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
