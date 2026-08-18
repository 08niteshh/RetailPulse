import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { BackgroundOrbs } from '../components/layout/BackgroundOrbs';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
      <BackgroundOrbs />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 items-center justify-center shadow-lg shadow-blue-500/30 mb-4 p-0.5 border border-white/20">
          <div className="w-full h-full bg-[#050816]/70 rounded-[14px] flex items-center justify-center backdrop-blur-sm">
            <Zap className="w-7 h-7 text-blue-400 fill-blue-400 font-bold" />
          </div>
        </div>
        <h2 className="text-3xl lg:text-4xl font-extrabold font-display text-white tracking-tight">
          Password Recovery
        </h2>
        <p className="mt-2 text-xs font-mono text-slate-400">
          Enter your registered email to receive reset instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="glass-panel py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/[0.12]">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold font-display text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                If an account exists for <span className="text-blue-400 font-mono font-semibold">{email}</span>, you will receive password reset instructions shortly.
              </p>
              <div className="pt-4 border-t border-white/[0.06]">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
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

              <button
                type="submit"
                className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
              >
                Send Password Reset Link
              </button>

              <div className="text-center pt-3 border-t border-white/[0.06]">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
