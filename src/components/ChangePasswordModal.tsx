import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { STORE_CONFIG } from '../config/storeConfig';

export const ChangePasswordModal: React.FC = () => {
  const { isChangePasswordModalOpen, currentCustomer, changePassword } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isChangePasswordModalOpen || !currentCustomer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (newPassword.toLowerCase() === currentCustomer.name.toLowerCase()) {
      setError('Your new password cannot be the same as your login name.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-type carefully.');
      return;
    }

    const res = changePassword(newPassword);
    if (!res.success) {
      setError(res.error || 'Failed to update password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 text-white p-6">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3 h-3" />
            Security Notice
          </div>
          <h3 id="change-password-title" className="text-xl font-black">Change Your Default Password</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Welcome, <strong>{currentCustomer.name}</strong>! Your account was initialized with your name as the password. Please set a new private password on the website before proceeding to product reservations.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Choose a new password (min 4 chars)"
                autoComplete="new-password"
                aria-label="Choose a new password (min 4 chars)"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden transition-all text-slate-800"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                autoComplete="new-password"
                aria-label="Confirm your new password"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden transition-all text-slate-800"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Password Rules for {STORE_CONFIG.name}:
            </div>
            <p>• Cannot be your name (e.g. "{currentCustomer.name}")</p>
            <p>• Must be changed directly on this website</p>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            Save Password & Unlock Reservations
          </button>
        </form>
      </div>
    </div>
  );
};
