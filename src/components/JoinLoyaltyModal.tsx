import React, { useEffect, useRef, useState } from 'react';
import { X, Gift, Check, CreditCard, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { STORE_CONFIG } from '../config/storeConfig';
import { JMartLogo } from './JMartLogo';

export const JoinLoyaltyModal: React.FC = () => {
  const { isJoinModalOpen, closeJoinModal, registerWithPayment, openLoginModal } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paymentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isJoinModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isProcessing) closeJoinModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeJoinModal, isJoinModalOpen, isProcessing]);

  useEffect(() => () => {
    if (paymentTimerRef.current) clearTimeout(paymentTimerRef.current);
  }, []);

  if (!isJoinModalOpen) return null;

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    const normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setIsProcessing(true);

    // Simulate instant payment gateway completion
    paymentTimerRef.current = setTimeout(() => {
      const txnId = 'TXN_' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const res = registerWithPayment(name, normalizedPhone, txnId);
      setIsProcessing(false);

      if (!res.success) {
        setError(res.error || 'Failed to complete registration.');
      }
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(8,9,8,0.65)] backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => {
        if (!isProcessing) closeJoinModal();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-[var(--panel)] text-[var(--ink)] rounded-xl border border-[var(--border)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-loyalty-title"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[var(--rule)] relative">
          <button
            onClick={closeJoinModal}
            type="button"
            aria-label="Close loyalty enrollment"
            className="absolute top-4 right-4 text-[var(--ink3)] hover:text-[var(--ink)] w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--sub)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <JMartLogo variant="badge" className="w-10 h-10 shrink-0" />
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] block">
                Loyalty Enrollment
              </span>
              <h2 id="join-loyalty-title" className="text-xl font-bold text-[var(--ink)] leading-none">
                Join {STORE_CONFIG.name} Club
              </h2>
            </div>
          </div>
          <p className="text-xs text-[var(--ink2)] mt-1.5 leading-relaxed">
            Join today for <strong className="font-mono tabular-nums text-[var(--ink)]">₹100</strong> and receive an instant <strong className="font-mono tabular-nums text-[var(--ok)]">₹100 welcome coupon</strong> back to use today!
          </p>
        </div>

        {/* Benefits Card */}
        <div className="mx-6 mt-4 p-3.5 bg-[var(--sub)] rounded-xl border border-[var(--border2)] space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[var(--ink)] font-semibold">
            <Gift className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span>Member Benefits:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[var(--ink2)]">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[var(--ok)] shrink-0" />
              <span>30-minute item hold</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[var(--ok)] shrink-0" />
              <span>₹100 instant cash coupon</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[var(--ok)] shrink-0" />
              <span>Earn points on all purchases</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[var(--ok)] shrink-0" />
              <span>Express billing desk counter</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleEnroll} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[var(--danger-soft)] border border-[var(--danger-line)] text-[var(--danger)] text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] block mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sundaram"
              className="w-full h-11 px-3.5 text-sm bg-[var(--sub)] border border-[var(--border2)] rounded-lg text-[var(--ink)] placeholder:text-[var(--ink4)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] block mb-1.5">
              Mobile Number (10-digits)
            </label>
            <div className="flex">
              <span className="h-11 px-3 bg-[var(--sub)] border border-r-0 border-[var(--border2)] rounded-l-lg font-mono text-xs font-bold text-[var(--ink3)] inline-flex items-center">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                maxLength={10}
                className="w-full h-11 px-3.5 text-sm font-mono tabular-nums bg-[var(--sub)] border border-[var(--border2)] rounded-r-lg text-[var(--ink)] placeholder:text-[var(--ink4)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] block mb-1.5">
              Select Payment Mode (₹100)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`h-11 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'bg-[var(--accent-soft)] border-[var(--accent-line)] text-[var(--ink)]'
                    : 'bg-[var(--sub)] border-[var(--border2)] text-[var(--ink2)] hover:bg-[var(--rule2)]'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI / GPay / PhonePe</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`h-11 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-[var(--accent-soft)] border-[var(--accent-line)] text-[var(--ink)]'
                    : 'bg-[var(--sub)] border-[var(--border2)] text-[var(--ink2)] hover:bg-[var(--rule2)]'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Debit / Credit Card</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full h-[46px] bg-[var(--accent)] hover:bg-[var(--accent-hi)] disabled:opacity-40 text-[var(--primary-foreground)] font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer select-none active:scale-[0.98]"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Processing Payment & Enrollment...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹100 & Join Loyalty Club</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center text-xs text-[var(--ink3)] pt-1">
            <span>Already enrolled? </span>
            <button
              type="button"
              onClick={() => {
                closeJoinModal();
                openLoginModal();
              }}
              className="text-[var(--accent)] hover:underline font-semibold cursor-pointer"
            >
              Sign In to Your Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
