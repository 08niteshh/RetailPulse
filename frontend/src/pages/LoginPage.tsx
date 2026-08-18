import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BackgroundOrbs } from '../components/layout/BackgroundOrbs';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'admin' | 'analyst') => {
    if (role === 'admin') {
      setEmail('admin@retailpulse.io');
      setPassword('AdminPass123!');
    } else {
      setEmail('analyst@retailpulse.io');
      setPassword('AnalystPass123!');
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
      {/* 3D Ambient Orbs */}
      <BackgroundOrbs />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 items-center justify-center shadow-lg shadow-blue-500/30 mb-4 p-0.5 border border-white/20">
          <div className="w-full h-full bg-[#050816]/70 rounded-[14px] flex items-center justify-center backdrop-blur-sm">
            <Zap className="w-7 h-7 text-blue-400 fill-blue-400 font-bold" />
          </div>
        </div>
        <h2 className="text-3xl lg:text-4xl font-extrabold font-display text-white tracking-tight">
          Retail<span className="text-gradient">Pulse</span>
        </h2>
        <p className="mt-2 text-xs font-mono text-slate-400 tracking-wide">
          🇮🇳 India Sales & Demand Intelligence Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="glass-panel py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/[0.12]">
          {/* Quick Demo Fill Buttons */}
          <div className="mb-6 pb-6 border-b border-white/[0.08]">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 font-mono text-center">
              Quick One-Click Demo Access
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-all cursor-pointer shadow-sm shadow-blue-500/5"
              >
                <ShieldCheck className="w-4 h-4" /> Aarav (Admin)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('analyst')}
                className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all cursor-pointer shadow-sm shadow-cyan-500/5"
              >
                <UserCheck className="w-4 h-4" /> Priya (Analyst)
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 shadow-lg shadow-rose-500/5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Business Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@retailpulse.io"
                  className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Analytics Platform'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 border-t border-white/[0.06] pt-4">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Create Analyst Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
