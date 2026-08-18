import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Activity,
  Server,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
  Mail,
  User,
  Cpu,
  Key
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('ANALYST');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, lRes, sRes] = await Promise.all([
        apiClient.get('/admin/users'),
        apiClient.get('/admin/activity-logs'),
        apiClient.get('/admin/system-status'),
      ]);
      setUsers(uRes.data || []);
      setLogs(lRes.data || []);
      setSystemStatus(sRes.data || null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Access restricted to administrators.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiClient.post('/admin/users', {
        full_name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      });
      setSuccessMsg(`User ${newEmail} created successfully.`);
      setShowAddUserModal(false);
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      fetchAdminData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create user.');
    }
  };

  if (loading && !systemStatus) {
    return <LoadingSpinner message="Validating RBAC permissions & loading audit logs..." fullPage />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-medium">
              System Admin & Security
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            Platform Administration & System Audits
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage user roles, monitor database health, audit administrative events, and review platform telemetry.
          </p>
        </div>

        <button
          onClick={() => setShowAddUserModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg shadow-emerald-500/5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 shadow-lg shadow-rose-500/5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* System Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 font-mono">
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Database Status</span>
          <div className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
            {systemStatus?.status || 'ONLINE'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block truncate">
            {systemStatus?.database_engine}
          </span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Active Orders In DB</span>
          <div className="text-2xl font-extrabold text-white font-display mt-1">
            {systemStatus?.total_orders.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block font-sans">Transactional records</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Active Catalog SKUs</span>
          <div className="text-2xl font-extrabold text-cyan-400 font-display mt-1">
            {systemStatus?.total_products.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block font-sans">Across 8 categories</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Registered Users</span>
          <div className="text-2xl font-extrabold text-violet-400 font-display mt-1">
            {systemStatus?.total_users} accounts
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block font-sans">RBAC Protected</span>
        </div>
      </div>

      {/* User Management Directory */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-white/[0.08] space-y-4">
        <h3 className="font-bold font-display text-white text-base">System Users & Role Authorizations</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-white/[0.06] font-mono uppercase text-[10px]">
              <tr>
                <th className="pb-2.5 font-semibold">User ID</th>
                <th className="pb-2.5 font-semibold">Full Name</th>
                <th className="pb-2.5 font-semibold">Email</th>
                <th className="pb-2.5 text-center font-semibold">Role</th>
                <th className="pb-2.5 text-center font-semibold">Status</th>
                <th className="pb-2.5 text-right font-semibold">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3 text-slate-400">#{u.id}</td>
                  <td className="py-3 font-sans font-semibold text-white">{u.full_name}</td>
                  <td className="py-3 font-sans text-slate-300">{u.email}</td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        u.role === 'ADMIN'
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-sans font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
                    </span>
                  </td>
                  <td className="py-3 text-right text-slate-400 text-[11px]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Activity Audit Trail */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-white/[0.08] space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <h3 className="font-bold font-display text-white text-base">Activity Audit Trail Logs</h3>
        </div>
        <div className="overflow-x-auto max-h-80 custom-scrollbar">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-slate-400 border-b border-white/[0.06] uppercase text-[10px] sticky top-0 bg-[#080B1A]/90 backdrop-blur-md">
              <tr>
                <th className="pb-2.5 font-semibold">Timestamp</th>
                <th className="pb-2.5 font-semibold">User</th>
                <th className="pb-2.5 font-semibold">Action</th>
                <th className="pb-2.5 font-semibold">Entity</th>
                <th className="pb-2.5 font-semibold">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-white/[0.03]">
                  <td className="py-2.5 text-slate-400 text-[11px] whitespace-nowrap">{l.created_at}</td>
                  <td className="py-2.5 text-slate-300 font-sans">{l.user_email}</td>
                  <td className="py-2.5 text-blue-400 font-semibold">{l.action}</td>
                  <td className="py-2.5 text-slate-400">{l.entity_type}</td>
                  <td className="py-2.5 text-slate-300 font-sans truncate max-w-[280px]" title={l.details}>
                    {l.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-panel rounded-3xl p-7 w-full max-w-md border border-white/[0.12] shadow-2xl space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white font-display">Provision New System Account</h3>
              <p className="text-xs text-slate-400 mt-0.5">Assign access privileges to an enterprise user</p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Business Email</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="jane@retailpulse.io"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Role Permission</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-[#0b1026] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ANALYST">ANALYST (Standard Analytical Access)</option>
                  <option value="ADMIN">ADMIN (Full Administrative Control)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
