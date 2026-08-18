import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Repeat,
  DollarSign,
  TrendingUp,
  Award,
  Clock,
  ExternalLink,
  X,
  Sparkles,
  Layers,
  ShoppingBag
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { apiClient } from '../api/client';
import { CustomerAnalyticsResponse, CustomerItem } from '../types';
import { KPICard } from '../components/common/KPICard';
import { ChartCard } from '../components/common/ChartCard';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const CustomerAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<CustomerAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [customerDetail, setCustomerDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/customers');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const openCustomerModal = async (id: number) => {
    setSelectedCustomerId(id);
    setDetailLoading(true);
    try {
      const res = await apiClient.get(`/customers/${id}`);
      setCustomerDetail(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading && !data) {
    return <LoadingSpinner message="Calculating RFM cohorts & Customer Lifetime Value..." fullPage />;
  }

  const getSegmentBadge = (seg: string) => {
    switch (seg) {
      case 'High Value':
        return <Badge variant="success">High Value</Badge>;
      case 'Loyal':
        return <Badge variant="info">Loyal</Badge>;
      case 'Regular':
        return <Badge variant="purple">Regular</Badge>;
      case 'At Risk':
        return <Badge variant="warning">At Risk</Badge>;
      case 'New':
        return <Badge variant="cyan">New</Badge>;
      default:
        return <Badge variant="neutral">Inactive</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-medium">
              RFM Intelligence
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-display">
            Customer Intelligence & RFM Segmentation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Recency, Frequency, Monetary (RFM) behavioral scoring, cohort repeat rates, and Customer Lifetime Value (CLV).
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Total Tracked Customers</span>
          <div className="text-3xl font-extrabold text-white mt-1 font-display">
            {data?.total_customers.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block font-mono">
            {data?.returning_customers.toLocaleString()} repeat buyers
          </span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Cohort Repeat Rate</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1 font-display font-mono">
            {data?.repeat_rate}%
          </div>
          <span className="text-[11px] text-emerald-400/80 mt-2 block">Cohort loyalty index</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Avg Lifetime Value (CLV)</span>
          <div className="text-3xl font-extrabold text-cyan-400 mt-1 font-display font-mono">
            ₹{data?.avg_clv.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Net historic spend</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Average Order Value (AOV)</span>
          <div className="text-3xl font-extrabold text-violet-400 mt-1 font-display font-mono">
            ₹{data?.avg_order_value.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Per completed transaction</span>
        </div>
      </div>

      {/* RFM Cohorts & Revenue Contribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RFM Donut */}
        <div>
          <ChartCard
            title="RFM Behavioral Segments"
            subtitle="Customer distribution by purchasing pattern"
            tag="Distribution"
            height="h-76"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.segments || []}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="customer_count"
                  nameKey="segment"
                >
                  {(data?.segments || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString('en-IN')} customers`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Segment Revenue Contribution Bar */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Revenue Contribution by Customer Segment"
            subtitle="Total rupee spend generated by each behavioral cohort"
            tag="Monetary Value"
            height="h-76"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.segments || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="segment" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Total Spend']}
                />
                <Bar dataKey="total_revenue" name="Total Spend (₹)" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                  {(data?.segments || []).map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Top Customer Profiles Directory */}
      <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <h3 className="font-bold text-sm text-white font-display">Top Value Customer Cohorts</h3>
          <span className="text-[11px] text-slate-400 font-mono">Ranked by Lifetime Monetary Contribution</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-white/[0.06] font-mono uppercase text-[10px]">
              <tr>
                <th className="pb-2.5 font-semibold">Customer Code / Name</th>
                <th className="pb-2.5 font-semibold">Email</th>
                <th className="pb-2.5 font-semibold">Location</th>
                <th className="pb-2.5 text-center font-semibold">Segment</th>
                <th className="pb-2.5 text-right font-semibold">Orders</th>
                <th className="pb-2.5 text-right font-semibold">Lifetime Spend</th>
                <th className="pb-2.5 text-right font-semibold">AOV</th>
                <th className="pb-2.5 text-right font-semibold">Recency</th>
                <th className="pb-2.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono">
              {(data?.top_customers || []).map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3 font-sans font-medium text-white">
                    <div className="font-semibold text-slate-100">{c.name}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{c.customer_code}</span>
                  </td>
                  <td className="py-3 font-sans text-slate-400">{c.email}</td>
                  <td className="py-3 font-sans text-slate-400">{c.city}, {c.state}</td>
                  <td className="py-3 text-center">{getSegmentBadge(c.segment)}</td>
                  <td className="py-3 text-right text-slate-300">{c.total_orders}</td>
                  <td className="py-3 text-right font-bold text-emerald-400">
                    ₹{c.total_spend.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 text-right text-cyan-400 font-semibold">₹{c.aov.toFixed(2)}</td>
                  <td className="py-3 text-right text-slate-400">{c.recency_days}d ago</td>
                  <td className="py-3 text-right font-sans">
                    <button
                      onClick={() => openCustomerModal(c.id)}
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold hover:underline"
                    >
                      History <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-panel rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-white/[0.15] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-display">Customer Order Ledger</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {customerDetail?.customer?.name} • {customerDetail?.customer?.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
              {detailLoading ? (
                <LoadingSpinner message="Retrieving customer transaction records..." />
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs">
                    <div>
                      <span className="text-slate-400 font-mono">Total Spend:</span>
                      <div className="text-emerald-400 font-bold font-mono text-base mt-1">
                        ₹{customerDetail?.customer?.total_spend.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono">Total Orders:</span>
                      <div className="text-white font-bold font-mono text-base mt-1">
                        {customerDetail?.customer?.total_orders}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono">Segment:</span>
                      <div className="mt-1">
                        {getSegmentBadge(customerDetail?.customer?.segment || '')}
                      </div>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-400 uppercase font-mono mt-4">
                    Completed Transactions ({customerDetail?.orders?.length || 0})
                  </h4>

                  <div className="space-y-3">
                    {(customerDetail?.orders || []).map((order: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-white">{order.order_number}</span>
                          <span className="font-mono text-emerald-400 font-bold text-sm">₹{order.total_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                          <span>{order.order_date}</span>
                          <span>Method: {order.payment_method}</span>
                        </div>
                        <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                          {order.items.map((it: any, iIdx: number) => (
                            <div key={iIdx} className="flex justify-between text-[11px]">
                              <span className="text-slate-300 truncate max-w-[320px]">
                                {it.quantity}x {it.product_name}
                              </span>
                              <span className="font-mono text-slate-400">₹{it.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
