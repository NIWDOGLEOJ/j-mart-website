import React, { useEffect, useRef, useState } from 'react';
import { X, Gift, Check, ShieldCheck, CreditCard, Smartphone, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { STORE_CONFIG } from '../config/storeConfig';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => {
        if (!isProcessing) closeJoinModal();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-loyalty-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 relative">
          <button
            onClick={closeJoinModal}
            type="button"
            aria-label="Close loyalty enrollment"
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-11 h-11 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm">
              <img src="/logo-mark.png" alt={STORE_CONFIG.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                New Customer Enrollment
              </div>
              <h3 id="join-loyalty-title" className="text-xl font-black">Join {STORE_CONFIG.name} Loyalty Club</h3>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Not a previous customer? Join today for <strong>₹100</strong> and get an instant <strong>₹100 coupon back</strong> to redeem on your purchases!
          </p>
        </div>

        {/* Value Proposition Callout Card */}
        <div className="p-4 mx-6 mt-4 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Gift className="w-6 h-6" />
          </div>
          <div className="text-xs text-emerald-950">
            <div className="font-extrabold text-sm text-emerald-900 flex items-center gap-1.5">
              100% Value Back Guarantee
            </div>
            <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
              Pay ₹100 enrollment → Receive a ₹100 Welcome Coupon (`WELCOME100`) + 30-minute item reservation rights!
            </p>
          </div>
        </div>

        {/* Enrollment Form */}
        <form onSubmit={handleEnroll} className="p-6 pt-4 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl" role="alert">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Suresh Kumar"
                autoComplete="name"
                aria-label="Full name"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit number"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                aria-label="10-digit mobile number"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-hidden text-slate-800"
                required
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select ₹100 Payment Method:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                aria-pressed={paymentMethod === 'upi'}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <div>UPI Payment</div>
                  <div className="text-[10px] text-slate-400 font-normal">GPay, PhonePe, Paytm</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                aria-pressed={paymentMethod === 'card'}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <div>Debit / Credit Card</div>
                  <div className="text-[10px] text-slate-400 font-normal">Visa, Mastercard, RuPay</div>
                </div>
              </button>
            </div>
          </div>

          {/* Member Benefits List */}
          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
              What you get immediately:
            </div>
            <p className="pl-5">• ₹100 Welcome Coupon added directly to your account</p>
            <p className="pl-5">• 30-Minute product reservation rights</p>
            <p className="pl-5">• 50 Bonus loyalty points</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            aria-busy={isProcessing}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Processing ₹100 Payment...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Pay ₹100 & Claim ₹100 Coupon Back</span>
              </>
            )}
          </button>
        </form>

        {/* Already have an account footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-600">
          Already a previous customer?{' '}
          <button
            type="button"
            onClick={() => {
              closeJoinModal();
              openLoginModal();
            }}
            className="font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            Sign in with your name
          </button>
        </div>
      </div>
    </div>
  );
};
