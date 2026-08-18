import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Tag,
  Boxes,
  TrendingUp,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { apiClient } from '../api/client';
import { ProductItem } from '../types';
import { Badge } from '../components/common/Badge';
import { ChartCard } from '../components/common/ChartCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ProductAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Array<{ category: string; revenue: number }>>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('revenue');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/products', {
        params: {
          search: search || undefined,
          sort_by: sortBy,
          sort_dir: sortDir,
          page,
          limit: 15,
        },
      });
      setProducts(res.data.items || []);
      setTotalPages(res.data.total_pages || 1);
      setTotalCount(res.data.total || 0);
      setCategories(res.data.category_contribution || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, sortBy, sortDir]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const getStockBadge = (status: string) => {
    switch (status) {
      case 'Healthy':
        return <Badge variant="success">Healthy</Badge>;
      case 'Low Stock':
        return <Badge variant="warning">Low Stock</Badge>;
      case 'Critical':
        return <Badge variant="danger">Critical</Badge>;
      case 'Out of Stock':
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
              Product SKU Matrix
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-display">
            Product Intelligence & Catalog Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Unit sales velocity, margin distributions, stock health status, and historical demand across 120 SKUs.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search product or SKU code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.1] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Departmental Revenue Ranking Chart */}
      <ChartCard
        title="Departmental Revenue Ranking"
        subtitle="Gross net revenue generated across retail merchandise categories"
        tag="Aggregated"
        height="h-68"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={categories} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
            <defs>
              <linearGradient id="prodCatGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="category" stroke="#64748B" fontSize={11} angle={-15} textAnchor="end" interval={0} />
            <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
            />
            <Bar dataKey="revenue" name="Revenue (₹)" fill="url(#prodCatGrad)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Product Table Container */}
      <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-white font-display">Product Catalog Matrix</h3>
            <span className="text-[11px] text-slate-400 font-mono">({totalCount} products tracked)</span>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none text-xs font-medium"
            >
              <option value="revenue" className="bg-[#0b1026]">Revenue</option>
              <option value="profit" className="bg-[#0b1026]">Gross Profit</option>
              <option value="units_sold" className="bg-[#0b1026]">Units Sold</option>
              <option value="margin_pct" className="bg-[#0b1026]">Profit Margin %</option>
              <option value="current_stock" className="bg-[#0b1026]">Current Stock</option>
              <option value="name" className="bg-[#0b1026]">Product Name</option>
            </select>
            <button
              onClick={() => {
                setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                setPage(1);
              }}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-300 hover:text-white transition-colors"
              title="Toggle Sort Direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-white/[0.06] font-mono uppercase text-[10px]">
              <tr>
                <th className="pb-2.5 font-semibold">SKU / Item</th>
                <th className="pb-2.5 font-semibold">Category</th>
                <th className="pb-2.5 text-right font-semibold">Unit Price</th>
                <th className="pb-2.5 text-right font-semibold">Units Sold</th>
                <th className="pb-2.5 text-right font-semibold">Total Revenue</th>
                <th className="pb-2.5 text-right font-semibold">Gross Profit</th>
                <th className="pb-2.5 text-right font-semibold">Margin %</th>
                <th className="pb-2.5 text-center font-semibold">Stock Status</th>
                <th className="pb-2.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <LoadingSpinner message="Loading catalog metrics..." />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No products matching search criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-3 font-medium text-white max-w-[220px]">
                      <div className="truncate font-sans font-semibold text-slate-100 group-hover:text-blue-400 transition-colors" title={p.name}>
                        {p.name}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                    </td>
                    <td className="py-3 text-slate-400">{p.category_name}</td>
                    <td className="py-3 text-right font-mono text-slate-300">₹{p.unit_price.toFixed(2)}</td>
                    <td className="py-3 text-right font-mono text-slate-300">{p.units_sold.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right font-mono font-bold text-blue-400">
                      ₹{p.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right font-mono text-emerald-400 font-semibold">₹{p.profit.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right font-mono">
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          p.margin_pct >= 40
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : p.margin_pct >= 25
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {p.margin_pct}%
                      </span>
                    </td>
                    <td className="py-3 text-center">{getStockBadge(p.stock_status)}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => navigate(`/products/${p.id}`)}
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline font-semibold"
                      >
                        Deep-Dive <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs">
          <span className="text-slate-400 font-mono">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] disabled:opacity-30 hover:text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] disabled:opacity-30 hover:text-white transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
