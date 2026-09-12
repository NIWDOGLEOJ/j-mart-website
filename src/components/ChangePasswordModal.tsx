import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ChangePasswordModal: React.FC = () => {
  const { isChangePasswordModalOpen, currentCustomer, changePassword, closeChangePasswordModal } = useAuth();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(8,9,8,0.65)] backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md bg-[var(--panel)] text-[var(--ink)] rounded-xl border border-[var(--border)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[var(--rule)] relative">
          <button
            type="button"
            onClick={closeChangePasswordModal}
            aria-label="Close modal"
            className="absolute top-4 right-4 text-[var(--ink3)] hover:text-[var(--ink)] w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--sub)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--warn)] px-2 py-0.5 rounded bg-[var(--warn-soft)] border border-[var(--warn-line)] inline-flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Security Notice
            </span>
          </div>
          <h2 id="change-password-title" className="text-lg font-bold text-[var(--ink)]">
            Set Private Account Password
          </h2>
          <p className="text-xs text-[var(--ink3)] mt-1 leading-relaxed">
            Welcome, <strong>{currentCustomer.name}</strong>! Your account was initialized with a temporary default password. Please set a new private password before reserving items.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[var(--danger-soft)] border border-[var(--danger-line)] text-[var(--danger)] text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] block mb-1.5">
              New Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink4)]" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Choose new password (min 4 chars)"
                autoComplete="new-password"
                aria-label="Choose new password (min 4 chars)"
                className="w-full h-11 pl-10 pr-3 text-sm bg-[var(--sub)] border border-[var(--border2)] rounded-lg focus:border-[var(--accent)] text-[var(--ink)] placeholder:text-[var(--ink4)] outline-none"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] block mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink4)]" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                aria-label="Confirm new password"
                className="w-full h-11 pl-10 pr-3 text-sm bg-[var(--sub)] border border-[var(--border2)] rounded-lg focus:border-[var(--accent)] text-[var(--ink)] placeholder:text-[var(--ink4)] outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-[46px] bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-[var(--primary-foreground)] font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Update Password & Continue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
