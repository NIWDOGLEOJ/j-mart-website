import React, { useEffect, useState } from 'react';
import { X, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { JMartLogo } from './JMartLogo';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(8,9,8,0.65)] backdrop-blur-xs animate-in fade-in duration-150"
      onClick={closeLoginModal}
    >
      <div
        className="relative w-full max-w-[420px] bg-[var(--panel)] text-[var(--ink)] rounded-xl border border-[var(--border)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-login-title"
      >
        {/* Header Bar */}
        <div className="p-6 pb-4 border-b border-[var(--rule)] relative">
          <button
            type="button"
            onClick={closeLoginModal}
            aria-label="Close customer sign in"
            className="absolute top-4 right-4 text-[var(--ink3)] hover:text-[var(--ink)] w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--sub)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center space-y-1">
            <JMartLogo variant="full" subtitle="SUPERMARKET & RETAIL" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] pt-2">
              Loyalty Member Terminal
            </span>
            <h2 id="customer-login-title" className="text-lg font-bold text-[var(--ink)]">
              Sign In to Reserve Stock
            </h2>
            <p className="text-xs text-[var(--ink3)] max-w-xs">
              Hold items in real-time for 30 minutes and redeem your available loyalty coupons.
            </p>
          </div>
        </div>

        {/* Reason banner if triggered by cart or reservation action */}
        {loginRedirectReason && (
          <div className="bg-[var(--sub)] border-b border-[var(--border)] p-3 flex items-start gap-2 text-xs text-[var(--ink2)]">
            <AlertCircle className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
            <span>{loginRedirectReason}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div
              role="alert"
              className="p-3 bg-[var(--danger-soft)] border border-[var(--danger-line)] rounded-lg text-xs font-semibold text-[var(--danger)] flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] block mb-1.5">
              Registered Customer Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink4)]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                autoComplete="name"
                className={`w-full h-11 pl-10 pr-3 text-sm bg-[var(--sub)] border rounded-lg text-[var(--ink)] placeholder:text-[var(--ink4)] outline-none transition-colors ${
                  error ? 'border-[var(--danger-strong)] focus:ring-1 focus:ring-[var(--danger)]' : 'border-[var(--border2)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]'
                }`}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)]">
                Account Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink4)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`w-full h-11 pl-10 pr-3 text-sm bg-[var(--sub)] border rounded-lg text-[var(--ink)] placeholder:text-[var(--ink4)] outline-none transition-colors ${
                  error ? 'border-[var(--danger-strong)] focus:ring-1 focus:ring-[var(--danger)]' : 'border-[var(--border2)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]'
                }`}
              />
            </div>
          </div>

          {/* 46px Primary button: filled --ink with --panel text per Login.dc.html specification */}
          <button
            type="submit"
            className="w-full h-[46px] bg-[var(--ink)] text-[var(--panel)] hover:opacity-90 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] select-none"
          >
            <span>Sign In to Member Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Footer note: enrollment CTA */}
          <div className="pt-2 text-center text-xs text-[var(--ink3)]">
            <span>New customer? </span>
            <button
              type="button"
              onClick={() => {
                closeLoginModal();
                openJoinModal();
              }}
              className="text-[var(--accent)] hover:underline font-semibold cursor-pointer"
            >
              Join Loyalty Club for ₹100
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
