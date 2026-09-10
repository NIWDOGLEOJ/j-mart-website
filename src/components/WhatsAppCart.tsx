import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  ShoppingBag,
  MessageCircle,
  Clock,
  User,
  Timer,
  AlertTriangle,
  Gift,
  Check,
  ShieldCheck,
  Lock,
  Copy,
  RotateCcw,
  MapPin,
  Phone,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { STORE_CONFIG } from '../config/storeConfig';
import { copyText } from '../utils/clipboard';

export const WhatsAppCart: React.FC = () => {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    savings,
    finalTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    reservationExpiresAt,
    remainingSeconds,
    formattedTimeRemaining,
    hasExpiredNotice,
    dismissExpiredNotice,
    inventoryChangeNotice,
    dismissInventoryChangeNotice,
    generateWhatsAppLink,
    submitReservation,
    isSubmittingReservation,
    activeReservation,
    cancelReservation,
    isCancellingReservation,
  } = useCart();

  const { currentCustomer, isAuthenticated, openLoginModal } = useAuth();
  const [pickupTime, setPickupTime] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);

  // Countdown timer for active confirmed reservation
  const [resSecondsRemaining, setResSecondsRemaining] = useState<number>(30 * 60);

  useEffect(() => {
    if (!activeReservation?.expiresAt) return;

    const expiryTime = new Date(activeReservation.expiresAt).getTime();
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((expiryTime - now) / 1000));
      setResSecondsRemaining(diff);
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [activeReservation?.expiresAt]);

  if (!isOpen) return null;

  const currency = STORE_CONFIG.features.currencySymbol;

  // Unconfirmed items 30-min timer progress
  const totalReservationSeconds = 30 * 60; // 1800 seconds
  const progressPercent = Math.max(
    0,
    Math.min(100, (remainingSeconds / totalReservationSeconds) * 100)
  );

  // Confirmed active reservation timer formatting
  const resMins = Math.floor(resSecondsRemaining / 60);
  const resSecs = resSecondsRemaining % 60;
  const resFormattedTime = `${resMins.toString().padStart(2, '0')}:${resSecs.toString().padStart(2, '0')}`;
  const resProgress = Math.max(0, Math.min(100, (resSecondsRemaining / totalReservationSeconds) * 100));

  const handleLockAndSend = async () => {
    setSubmitError(null);
    setCancelSuccessMsg(null);
    const res = await submitReservation(pickupTime);
    if (!res.success) {
      setSubmitError(res.error || 'Failed to lock reservation.');
    }
  };

  const handleCancelReservation = async () => {
    const res = await cancelReservation();
    setShowCancelConfirm(false);
    if (res.success) {
      setCancelSuccessMsg('Reservation cancelled. Items have been returned to store inventory.');
    } else {
      setSubmitError(res.error || 'Failed to cancel reservation.');
    }
  };

  const handleCopyOtp = async () => {
    if (!activeReservation) return;
    const text = [
      `🛒 J MART — IN-STORE RESERVATION`,
      `Reservation ID: ${activeReservation.reservationId}`,
      `Customer: ${activeReservation.customerName}`,
      `🔑 4-Digit Pickup OTP: ${activeReservation.otp}`,
      `Total Payable: ${currency}${activeReservation.total}`,
      `Store: ${STORE_CONFIG.address}, ${STORE_CONFIG.cityStateZip}`,
    ].join('\n');

    if (await copyText(text)) {
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2500);
    }
  };

  const handleShareReservationWhatsApp = () => {
    if (!activeReservation) return;
    const text = [
      `👋 Hello ${STORE_CONFIG.name}! Here is my reservation confirmation:`,
      `*Reservation ID:* ${activeReservation.reservationId}`,
      `*Customer:* ${activeReservation.customerName}`,
      `*My Pickup OTP:* ${activeReservation.otp}`,
      `*Total Payable:* ${currency}${activeReservation.total}`,
      `I am heading to the Ramapuram express counter. Please keep it ready!`,
    ].join('\n');

    const url = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSendOrder = () => {
    const url = generateWhatsAppLink(currentCustomer?.name, pickupTime);
    window.open(url, '_blank');
  };

  const unusedCoupons = currentCustomer?.coupons?.filter((c) => !c.isUsed) || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reservation-bag-title"
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 id="reservation-bag-title" className="text-base font-bold">In-Store Reservation Bag</h3>
                <p className="text-xs text-slate-400">
                  {activeReservation
                    ? '🟢 Active Reservation (OTP Ready)'
                    : `${items.length} ${items.length === 1 ? 'item' : 'items'} in bag`}
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              aria-label="Close reservation bag"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cancellation Feedback Notice */}
          {cancelSuccessMsg && (
            <div className="p-3 bg-emerald-600 text-white text-xs font-semibold flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{cancelSuccessMsg}</span>
              </div>
              <button
                onClick={() => setCancelSuccessMsg(null)}
                className="text-xs font-bold underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Auto-Expiry Warning Notice if triggered */}
          {hasExpiredNotice && (
            <div className="p-3 bg-amber-500 text-slate-950 text-xs font-semibold flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Your reservation timer expired. Check live stock again before submitting.</span>
              </div>
              <button
                onClick={dismissExpiredNotice}
                className="text-xs font-bold underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {inventoryChangeNotice && (
            <div className="p-3 bg-sky-50 text-sky-900 border-b border-sky-200 text-xs font-semibold flex items-center justify-between gap-2 shadow-xs" role="alert">
              <span>{inventoryChangeNotice}</span>
              <button
                type="button"
                onClick={dismissInventoryChangeNotice}
                className="text-xs font-bold underline cursor-pointer shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* VIEW 1: ACTIVE RESERVATION WITH 4-DIGIT OTP DIRECTLY IN CART */}
          {activeReservation ? (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Prominent 4-Digit Pickup OTP Box */}
              <div className="bg-emerald-50 border-2 border-dashed border-emerald-400 rounded-2xl p-4 text-center shadow-xs">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  Your Bill Counter Pickup OTP
                </div>

                <div className="text-4xl sm:text-5xl font-mono font-black tracking-[0.3em] text-emerald-700 py-1 select-all">
                  {activeReservation.otp}
                </div>

                <p className="text-[11px] text-emerald-900/80 font-medium mt-1">
                  Show this 4-digit code to the cashier at the bill counter to accept & print your bill.
                </p>

                <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px] text-emerald-900/80">
                  <div className="rounded-lg bg-white/70 px-1.5 py-1.5"><strong>1.</strong> Show OTP</div>
                  <div className="rounded-lg bg-white/70 px-1.5 py-1.5"><strong>2.</strong> Pay at counter</div>
                  <div className="rounded-lg bg-white/70 px-1.5 py-1.5"><strong>3.</strong> Collect items</div>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyOtp}
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    {copiedOtp ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied OTP!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy OTP & Details</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 30-Minute Hold Timer Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-sm">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <Timer className="w-4 h-4 animate-pulse" />
                    <span>30-Minute Lock Active</span>
                  </span>
                  <span className="font-mono font-black text-amber-400 text-sm">
                    {resFormattedTime} left
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-400 h-full transition-all duration-1000"
                    style={{ width: `${resProgress}%` }}
                  />
                </div>

                <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  Items will auto-return to store shelves if not claimed in 30 mins.
                </p>
              </div>

              {/* Order Breakdown */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/80 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 text-xs">
                  <span className="font-bold text-slate-700">Reserved Items</span>
                  <span className="font-mono font-semibold text-slate-500">
                    #{activeReservation.reservationId}
                  </span>
                </div>

                <div className="space-y-2 max-h-44 overflow-y-auto divide-y divide-slate-100 pr-1">
                  {activeReservation.items.map((item: any, idx) => {
                    const name = item?.product?.name || item?.name || 'Product';
                    const qty = Number(item?.quantity) || 1;
                    const price = Number(item?.product?.price ?? item?.price ?? 0);
                    return (
                      <div key={idx} className="pt-2 first:pt-0 flex justify-between items-center text-xs">
                        <div className="truncate pr-2">
                          <span className="font-bold text-slate-800">{name}</span>
                          <span className="text-slate-500 ml-1.5">x {qty}</span>
                        </div>
                        <div className="font-bold text-slate-900 shrink-0">
                          {currency}{(price * qty).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                  <span className="text-xs font-extrabold text-slate-900">Total Payable at Counter</span>
                  <span className="text-base font-black text-emerald-700">
                    {currency}{activeReservation.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Store Location */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3.5 text-xs space-y-1 text-slate-700">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-emerald-200/80 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                    <img src="/logo-mark.png" alt={STORE_CONFIG.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">{STORE_CONFIG.name} Express Counter</span>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                      <span>{STORE_CONFIG.address}, {STORE_CONFIG.cityStateZip}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="text-[11px] text-slate-600 font-medium">Phone: {STORE_CONFIG.phone}</span>
                </div>
              </div>

              {/* Cancellation Option */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                {showCancelConfirm ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
                    <p className="text-rose-900 font-bold">
                      Cancel reservation and return items to inventory?
                    </p>
                    <p className="text-rose-700 text-[11px]">
                      Your items will immediately be returned to store shelves for other customers.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCancelReservation}
                        disabled={isCancellingReservation}
                        className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors cursor-pointer text-center"
                      >
                        {isCancellingReservation ? 'Returning Stock...' : 'Yes, Cancel & Return Stock'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(false)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Keep Hold
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full py-2.5 px-3 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-dashed border-rose-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Cancel Reservation & Return Items to Inventory</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleShareReservationWhatsApp}
                  className="w-full py-2.5 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Reservation Details on WhatsApp</span>
                </button>
              </div>
            </div>
          ) : (
            /* VIEW 2: UNCONFIRMED ITEMS OR EMPTY BAG */
            <>
              {/* Active 30-Minute Timer Banner for unconfirmed items */}
              {reservationExpiresAt && items.length > 0 && (
                <div className="bg-emerald-950 text-white p-3.5 border-b border-emerald-800/60">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                      <Timer className="w-4 h-4 animate-pulse" />
                      <span>30-Minute Reservation Timer</span>
                    </span>
                    <span className="font-mono font-black text-sm text-amber-300">
                      {formattedTimeRemaining}
                    </span>
                  </div>

                  <div className="w-full bg-emerald-900/60 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-amber-400 h-full transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="mt-1.5 text-[10px] text-emerald-300/80 flex items-center justify-between">
                    <span>Confirm to lock live store stock</span>
                    <span>Unreserves at 00:00</span>
                  </div>
                </div>
              )}

              {/* Empty Bag State */}
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">Your reservation list is empty</h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Browse our live store inventory and reserve items for quick counter pickup.
                  </p>
                  {!isAuthenticated && (
                    <button
                      onClick={() => {
                        closeCart();
                        openLoginModal();
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      Sign In to Enable Reservations
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-slate-100">
                    {items.map(({ product, quantity }) => {
                      const lineTotal = product.price * quantity;
                      const maxAllowed = Math.max(1, product.stock);

                      return (
                        <div key={product.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                          <div className="w-14 h-14 rounded-xl bg-slate-100 shrink-0 overflow-hidden relative">
                            {product.imageUrl ? (() => {
                              const isCustomPhoto = product.imageUrl.includes('/uploads/') || product.imageUrl.startsWith('data:');
                              return (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className={`w-full h-full ${isCustomPhoto ? 'object-contain p-1 bg-white' : 'object-cover'}`}
                                />
                              );
                            })() : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                                {product.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate" title={product.name}>
                              {product.name}
                            </h4>
                            <div className="text-[11px] text-slate-500">
                              {currency}{product.price} {product.uom ? `• ${product.uom}` : ''}
                            </div>

                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                                <button
                                  onClick={() => updateQuantity(product.id, quantity - 1)}
                                  className="w-6 h-6 text-slate-600 hover:bg-slate-200 rounded-l-lg text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center text-xs font-bold text-slate-800">
                                  {quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(product.id, quantity + 1)}
                                  disabled={quantity >= maxAllowed}
                                  className={`w-6 h-6 text-slate-600 rounded-r-lg text-xs font-bold flex items-center justify-center transition-colors ${
                                    quantity >= maxAllowed
                                      ? 'opacity-40 cursor-not-allowed'
                                      : 'hover:bg-slate-200 cursor-pointer'
                                  }`}
                                >
                                  +
                                </button>
                              </div>

                              <span className="text-[10px] text-slate-400">
                                (shelf: {maxAllowed})
                              </span>

                              <button
                                onClick={() => removeFromCart(product.id)}
                                className="ml-auto p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-slate-900">
                              {currency}{lineTotal}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-3 text-right">
                      <button
                        onClick={clearCart}
                        className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        Clear all items
                      </button>
                    </div>
                  </div>

                  {/* Loyalty Coupons */}
                  {isAuthenticated && unusedCoupons.length > 0 && (
                    <div className="p-4 bg-emerald-50/60 border-t border-emerald-100">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 mb-2">
                        <Gift className="w-3.5 h-3.5 text-emerald-700" />
                        Available Loyalty Coupons:
                      </div>
                      <div className="space-y-1.5">
                        {unusedCoupons.map((coupon) => {
                          const isApplied = appliedCoupon?.code === coupon.code;
                          return (
                            <div
                              key={coupon.code}
                              className="flex items-center justify-between p-2 rounded-xl bg-white border border-emerald-200 text-xs shadow-2xs"
                            >
                              <div>
                                <span className="font-extrabold text-emerald-800">{coupon.code}</span>
                                <span className="text-slate-500 ml-1.5">
                                  (Save {currency}{coupon.discountAmount})
                                </span>
                              </div>
                              {isApplied ? (
                                <button
                                  onClick={removeCoupon}
                                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                                >
                                  Remove
                                </button>
                              ) : (
                                <button
                                  onClick={() => applyCoupon(coupon)}
                                  className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                >
                                  Apply
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Customer Pickup Details */}
                  <div className="p-4 bg-slate-50 border-t border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Reserved by:</span>
                      <span className="font-bold text-slate-800">
                        {currentCustomer?.name || 'Loyalty Member'} ({currentCustomer?.tier || 'Member'})
                      </span>
                    </div>

                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        placeholder="Pickup Time (e.g. In 20 minutes / 6:00 PM)"
                        aria-label="Optional pickup time"
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Drawer Footer & Actions */}
                  <div className="p-4 sm:p-5 bg-white border-t border-slate-200">
                    <div className="space-y-1.5 mb-4 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span className="font-semibold text-slate-800">{currency}{subtotal}</span>
                      </div>

                      {appliedCoupon && (
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span className="flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Coupon ({appliedCoupon.code})
                          </span>
                          <span>-{currency}{appliedCoupon.discountAmount}</span>
                        </div>
                      )}

                      {savings > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>Total Savings vs MRP</span>
                          <span>{currency}{savings}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                        <span className="text-sm font-bold text-slate-900">Payable at Counter</span>
                        <span className="text-xl font-black text-emerald-700">
                          {currency}{finalTotal}
                        </span>
                      </div>
                    </div>

                    {submitError && (
                      <div role="alert" className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* Primary Button */}
                    <button
                      type="button"
                      onClick={handleLockAndSend}
                      disabled={isSubmittingReservation}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmittingReservation ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Locking Stock & Generating OTP...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Lock Stock & Send to Bill Counter</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSendOrder}
                      className="w-full mt-2 py-1 text-slate-400 hover:text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Or backup reservation on WhatsApp</span>
                    </button>

                    <p className="mt-2 text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Confirm to lock these items in live store inventory for 30 minutes. Pay upon pickup.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
