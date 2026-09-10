import React, { useEffect, useState } from 'react';
import { X, Lock, User, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { STORE_CONFIG } from '../config/storeConfig';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    closeLoginModal,
    login,
    openJoinModal,
    loginRedirectReason,
  } = useAuth();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoginModalOpen) return;
    setName('');
    setPassword('');
    setError(null);
  }, [isLoginModalOpen]);

  useEffect(() => {
    if (!isLoginModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLoginModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeLoginModal, isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name as registered in the loyalty program.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    const res = login(name, password);
    if (!res.success) {
      setError(res.error || 'Login failed.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeLoginModal}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-login-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 relative">
          <button
            type="button"
            onClick={closeLoginModal}
            aria-label="Close customer sign in"
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-11 h-11 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm">
              <img src="/logo-mark.png" alt={STORE_CONFIG.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                {STORE_CONFIG.name} Loyalty Program
              </div>
              <h3 id="customer-login-title" className="text-xl font-black">{STORE_CONFIG.name} Member Sign In</h3>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to reserve in-store items, redeem loyalty coupons, and hold stock for 30 minutes.
          </p>
        </div>

        {/* Reason banner if triggered by reservation click */}
        {loginRedirectReason && (
          <div className="bg-amber-50 border-b border-amber-200/80 p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{loginRedirectReason}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Customer Name (as registered in store)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                autoComplete="name"
                autoFocus
                aria-label="Customer name"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden transition-all text-slate-800"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (default is your name)"
                autoComplete="current-password"
                aria-label="Customer password"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden transition-all text-slate-800"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 leading-normal flex items-start gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>First-time login?</strong> Your default password is your <strong>Full Name</strong> as registered in our store. You will change it immediately on login.
              </span>
            </p>
          </div>

          <p className="pt-1 text-[11px] text-slate-500">
            Use the name and password registered with the {STORE_CONFIG.name} loyalty program.
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Lock className="w-4 h-4" />
            Sign In to Reserve Items
          </button>
        </form>

        {/* Footer: New Customer Enrollment Banner */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
          <div className="text-xs text-slate-600 mb-2">
            Not a previous customer yet?
          </div>
          <button
            onClick={openJoinModal}
            className="w-full bg-white hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 border border-emerald-300 font-bold py-2.5 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>Join Loyalty Club: Pay ₹100, Get ₹100 Coupon Back</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
