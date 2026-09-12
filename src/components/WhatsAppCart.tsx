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
  CheckCircle2,
  FileText,
  List,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { STORE_CONFIG } from '../config/storeConfig';
import { copyText } from '../utils/clipboard';
import { ReceiptView } from './ui/receipt-view';

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
  const [activeReservationTab, setActiveReservationTab] = useState<'slip' | 'details'>('slip');

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
      setCancelSuccessMsg('Reservation cancelled. Items returned to store inventory.');
    } else {
      setSubmitError(res.error || 'Failed to cancel reservation.');
    }
  };

  const handleCopyOtp = async () => {
    if (!activeReservation) return;
    const text = [
      `🛒 J MART — IN-STORE RESERVATION SLIP`,
      `Reservation ID: ${activeReservation.reservationId}`,
      `Customer: ${activeReservation.customerName}`,
      `🔑 4-Digit Counter OTP: ${activeReservation.otp}`,
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
      {/* Scrim backdrop */}
      <div
        className="fixed inset-0 bg-[rgba(8,9,8,0.65)] backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          className="w-screen max-w-md bg-[var(--panel)] text-[var(--ink)] border-l border-[var(--border)] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reservation-bag-title"
        >
          {/* Drawer Header */}
          <div className="px-5 py-4 bg-[var(--sub)] border-b border-[var(--rule2)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] block">
                  Express Desk
                </span>
                <h3 id="reservation-bag-title" className="text-base font-bold text-[var(--ink)] leading-none">
                  {activeReservation ? 'Active Reservation Slip' : 'Store Reservation Cart'}
                </h3>
              </div>
            </div>

            <button
              onClick={closeCart}
              aria-label="Close reservation cart"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ink3)] hover:text-[var(--ink)] hover:bg-[var(--rule2)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cancellation Feedback Notice */}
          {cancelSuccessMsg && (
            <div className="p-3 bg-[var(--ok-soft)] text-[var(--ok)] border-b border-[var(--ok-line)] text-xs font-semibold flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{cancelSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setCancelSuccessMsg(null)}
                className="font-mono text-[11px] font-bold underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Auto-Expiry Warning Notice */}
          {hasExpiredNotice && (
            <div className="p-3 bg-[var(--warn-soft)] text-[var(--warn)] border-b border-[var(--warn-line)] text-xs font-semibold flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Reservation hold expired. Live store stock has been released.</span>
              </div>
              <button
                type="button"
                onClick={dismissExpiredNotice}
                className="font-mono text-[11px] font-bold underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {inventoryChangeNotice && (
            <div
              className="p-3 bg-[var(--sub)] border-b border-[var(--border)] text-xs font-semibold text-[var(--ink)] flex items-center justify-between gap-2"
              role="alert"
            >
              <span>{inventoryChangeNotice}</span>
              <button
                type="button"
                onClick={dismissInventoryChangeNotice}
                className="font-mono text-[11px] text-[var(--accent)] underline cursor-pointer shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* VIEW 1: ACTIVE RESERVATION WITH 4-DIGIT OTP AND AUTHENTIC RECEIPT VIEW */}
          {activeReservation ? (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Tab Selector: Slip Preview vs Quick Controls */}
              <div className="flex rounded-lg border border-[var(--border2)] bg-[var(--sub)] p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveReservationTab('slip')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    activeReservationTab === 'slip'
                      ? 'bg-[var(--panel)] text-[var(--ink)] border border-[var(--border)]'
                      : 'text-[var(--ink3)] hover:text-[var(--ink)]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Thermal Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReservationTab('details')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    activeReservationTab === 'details'
                      ? 'bg-[var(--panel)] text-[var(--ink)] border border-[var(--border)]'
                      : 'text-[var(--ink3)] hover:text-[var(--ink)]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>OTP & Actions</span>
                </button>
              </div>

              {/* Active 30-Minute Hold Timer Banner */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--sub)] p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 animate-pulse" />
                    <span>30-Min Shelf Lock Active</span>
                  </span>
                  <span className="font-mono font-bold text-sm text-[var(--warn)] tabular-nums">
                    {resFormattedTime}
                  </span>
                </div>
                <div className="w-full bg-[var(--panel)] h-1.5 rounded-full overflow-hidden border border-[var(--rule)]">
                  <div
                    className="bg-[var(--accent)] h-full transition-all duration-1000"
                    style={{ width: `${resProgress}%` }}
                  />
                </div>
              </div>

              {activeReservationTab === 'slip' ? (
                /* Thermal Receipt View */
                <ReceiptView
                  reservationId={activeReservation.reservationId}
                  otp={activeReservation.otp}
                  items={activeReservation.items.map((it: any) => ({
                    name: it.product?.name || it.name || 'Product',
                    sku: it.product?.sku || it.sku,
                    price: Number(it.product?.price ?? it.price ?? 0),
                    quantity: Number(it.quantity) || 1,
                    gstRate: typeof it.product?.gstRate === 'number' ? it.product.gstRate : typeof it.gstRate === 'number' ? it.gstRate : 5,
                    uom: it.product?.uom || it.uom,
                  }))}
                  subtotal={activeReservation.total}
                  total={activeReservation.total}
                  customerName={activeReservation.customerName}
                  customerPhone={activeReservation.customerPhone}
                  createdAt={activeReservation.createdAt}
                />
              ) : (
                /* Details / OTP view */
                <div className="space-y-4">
                  {/* Big OTP Card */}
                  <div className="bg-[var(--sub)] border-2 border-dashed border-[var(--border2)] rounded-xl p-5 text-center">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] mb-1 block">
                      Express Counter Code
                    </span>
                    <div className="font-mono text-4xl sm:text-5xl font-black tracking-[0.3em] text-[var(--accent)] py-2 select-all">
                      {activeReservation.otp}
                    </div>
                    <p className="text-xs text-[var(--ink2)] mt-1">
                      Show this 4-digit code to the cashier to instantly pull your cart & print the receipt.
                    </p>

                    <button
                      type="button"
                      onClick={handleCopyOtp}
                      className="mt-3 inline-flex items-center gap-1.5 bg-[var(--panel)] hover:bg-[var(--rule2)] text-[var(--ink)] text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-[var(--border2)] transition-colors cursor-pointer"
                    >
                      {copiedOtp ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[var(--ok)]" />
                          <span>Copied Code!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Details</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Reserved Items Breakdown */}
                  <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--sub)] space-y-2">
                    <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2 text-xs">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)]">
                        Reserved Items
                      </span>
                      <span className="font-mono text-[11px] text-[var(--ink3)]">
                        #{activeReservation.reservationId}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-44 overflow-y-auto divide-y divide-[var(--rule)] pr-1">
                      {activeReservation.items.map((item: any, idx: number) => {
                        const name = item?.product?.name || item?.name || 'Product';
                        const qty = Number(item?.quantity) || 1;
                        const price = Number(item?.product?.price ?? item?.price ?? 0);
                        return (
                          <div key={idx} className="pt-2 first:pt-0 flex justify-between items-center text-xs">
                            <div className="truncate pr-2">
                              <span className="font-semibold text-[var(--ink)]">{name}</span>
                              <span className="font-mono text-[var(--ink3)] ml-1.5 tabular-nums">×{qty}</span>
                            </div>
                            <div className="font-mono font-bold text-[var(--ink)] shrink-0 tabular-nums">
                              {currency}{(price * qty).toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-[var(--rule)] pt-2 flex justify-between items-baseline">
                      <span className="text-xs font-bold text-[var(--ink)]">Payable at Counter</span>
                      <span className="font-mono text-base font-bold text-[var(--accent)] tabular-nums">
                        {currency}{activeReservation.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[var(--rule)] space-y-2">
                <button
                  type="button"
                  onClick={handleShareReservationWhatsApp}
                  className="w-full h-11 bg-[var(--sub)] hover:bg-[var(--rule2)] text-[var(--ink)] border border-[var(--border2)] font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Share Slip Details on WhatsApp</span>
                </button>

                {showCancelConfirm ? (
                  <div className="p-3 bg-[var(--danger-soft)] border border-[var(--danger-line)] rounded-xl space-y-2 text-xs">
                    <p className="text-[var(--danger)] font-bold">
                      Cancel reservation and release items back to shelves?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCancelReservation}
                        disabled={isCancellingReservation}
                        className="flex-1 py-1.5 bg-[var(--danger)] hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-lg transition-colors cursor-pointer text-center"
                      >
                        {isCancellingReservation ? 'Releasing...' : 'Yes, Release Stock'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(false)}
                        className="px-3 py-1.5 bg-[var(--sub)] text-[var(--ink)] font-bold rounded-lg border border-[var(--border2)] cursor-pointer"
                      >
                        Keep Hold
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full py-2 text-xs text-[var(--danger)] hover:underline flex items-center justify-center gap-1 cursor-pointer font-medium"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Cancel Reservation & Return Items to Shelves</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* VIEW 2: UNCONFIRMED ITEMS OR EMPTY BAG */
            <>
              {/* Active Timer Banner for Unconfirmed Items */}
              {reservationExpiresAt && items.length > 0 && (
                <div className="bg-[var(--sub)] border-b border-[var(--rule)] p-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 animate-pulse" />
                      <span>30-Minute Cart Timer</span>
                    </span>
                    <span className="font-mono font-bold text-xs text-[var(--warn)] tabular-nums">
                      {formattedTimeRemaining}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--panel)] h-1.5 rounded-full overflow-hidden border border-[var(--rule)]">
                    <div
                      className="bg-[var(--accent)] h-full transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Empty Bag State */}
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-xl bg-[var(--sub)] border border-[var(--border)] flex items-center justify-center text-[var(--ink3)] mb-3">
                    <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h4 className="text-sm font-bold text-[var(--ink)]">Your reservation list is empty</h4>
                  <p className="text-xs text-[var(--ink3)] max-w-xs mt-1">
                    Explore live inventory to hold items for express pickup at our Ramapuram counter.
                  </p>
                  {!isAuthenticated && (
                    <button
                      onClick={() => {
                        closeCart();
                        openLoginModal();
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 bg-[var(--sub)] hover:bg-[var(--rule2)] text-[var(--ink)] border border-[var(--border2)] text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Sign In to Enable Reservations</span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 divide-y divide-[var(--rule)]">
                    {items.map(({ product, quantity }) => {
                      const lineTotal = product.price * quantity;
                      const maxAllowed = Math.max(1, product.stock);

                      return (
                        <div key={product.id} className="pt-2.5 first:pt-0 flex gap-3 items-center">
                          <div className="w-12 h-12 rounded-lg bg-[var(--sub)] border border-[var(--border)] shrink-0 overflow-hidden relative">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-mono text-[10px] font-bold text-[var(--ink3)]">
                                {product.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-[var(--ink)] truncate" title={product.name}>
                              {product.name}
                            </h4>
                            <div className="font-mono text-[11px] text-[var(--ink3)] tabular-nums">
                              {currency}{product.price.toFixed(2)} {product.uom ? `· ${product.uom}` : ''}
                            </div>

                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="flex items-center border border-[var(--border2)] rounded-md bg-[var(--sub)]">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(product.id, quantity - 1)}
                                  className="w-6 h-6 text-[var(--ink2)] hover:text-[var(--ink)] hover:bg-[var(--rule2)] text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-mono font-bold text-xs text-[var(--ink)] tabular-nums">
                                  {quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(product.id, quantity + 1)}
                                  disabled={quantity >= maxAllowed}
                                  className={`w-6 h-6 text-[var(--ink2)] text-xs font-bold flex items-center justify-center transition-colors ${
                                    quantity >= maxAllowed
                                      ? 'opacity-30 cursor-not-allowed'
                                      : 'hover:bg-[var(--rule2)] cursor-pointer'
                                  }`}
                                >
                                  +
                                </button>
                              </div>

                              <span className="font-mono text-[10px] text-[var(--ink4)] tabular-nums">
                                (shelf: {maxAllowed})
                              </span>

                              <button
                                type="button"
                                onClick={() => removeFromCart(product.id)}
                                className="ml-auto p-1 text-[var(--ink3)] hover:text-[var(--danger)] transition-colors cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-bold text-[var(--ink)] tabular-nums">
                              {currency}{lineTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-2 text-right">
                      <button
                        type="button"
                        onClick={clearCart}
                        className="font-mono text-[11px] text-[var(--ink4)] hover:text-[var(--danger)] transition-colors cursor-pointer"
                      >
                        Clear cart
                      </button>
                    </div>
                  </div>

                  {/* Loyalty Coupons */}
                  {isAuthenticated && unusedCoupons.length > 0 && (
                    <div className="p-3.5 bg-[var(--sub)] border-t border-[var(--rule)]">
                      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] mb-2 flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>Loyalty Coupons</span>
                      </div>
                      <div className="space-y-1.5">
                        {unusedCoupons.map((coupon) => {
                          const isApplied = appliedCoupon?.code === coupon.code;
                          return (
                            <div
                              key={coupon.code}
                              className="flex items-center justify-between p-2 rounded-lg bg-[var(--panel)] border border-[var(--border2)] text-xs"
                            >
                              <div className="font-mono">
                                <span className="font-bold text-[var(--accent)]">{coupon.code}</span>
                                <span className="text-[var(--ink3)] ml-1.5">
                                  (Save {currency}{coupon.discountAmount})
                                </span>
                              </div>
                              {isApplied ? (
                                <button
                                  type="button"
                                  onClick={removeCoupon}
                                  className="font-mono text-[11px] font-bold text-[var(--danger)] hover:underline cursor-pointer"
                                >
                                  Remove
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => applyCoupon(coupon)}
                                  className="h-6 px-2.5 rounded text-[11px] font-bold bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-[var(--primary-foreground)] transition-colors cursor-pointer"
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
                  <div className="p-4 bg-[var(--sub)] border-t border-[var(--rule)] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--ink3)] font-medium">Customer:</span>
                      <span className="font-semibold text-[var(--ink)]">
                        {currentCustomer?.name || 'Guest'} ({currentCustomer?.tier || 'Member'})
                      </span>
                    </div>

                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--ink3)]" />
                      <input
                        type="text"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        placeholder="Estimated Arrival (e.g. In 20 mins / 6:00 PM)"
                        aria-label="Optional pickup time"
                        className="w-full h-9 pl-9 pr-3 text-xs bg-[var(--panel)] border border-[var(--border2)] rounded-lg text-[var(--ink)] placeholder:text-[var(--ink4)] outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  </div>

                  {/* Drawer Footer & Total Stack */}
                  <div className="p-4 sm:p-5 bg-[var(--panel)] border-t border-[var(--border)]">
                    <div className="space-y-1.5 mb-4 text-xs font-mono">
                      <div className="flex justify-between text-[var(--ink2)]">
                        <span>Subtotal (incl. GST)</span>
                        <span className="tabular-nums font-bold text-[var(--ink)]">{currency}{subtotal.toFixed(2)}</span>
                      </div>

                      {appliedCoupon && (
                        <div className="flex justify-between text-[var(--ok)] font-bold">
                          <span className="flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Coupon ({appliedCoupon.code})
                          </span>
                          <span className="tabular-nums">-{currency}{appliedCoupon.discountAmount.toFixed(2)}</span>
                        </div>
                      )}

                      {savings > 0 && (
                        <div className="flex justify-between text-[var(--ok)]">
                          <span>Total Savings vs MRP</span>
                          <span className="tabular-nums">{currency}{savings.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-[var(--rule)] flex justify-between items-baseline">
                        <span className="font-sans text-xs font-bold text-[var(--ink)]">Payable at Counter</span>
                        <span className="text-xl font-bold text-[var(--ink)] tabular-nums">
                          {currency}{finalTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {submitError && (
                      <div
                        role="alert"
                        className="mb-3 p-2.5 bg-[var(--danger-soft)] border border-[var(--danger-line)] rounded-lg text-[var(--danger)] text-xs flex items-center gap-2"
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* Primary Button */}
                    <button
                      type="button"
                      onClick={handleLockAndSend}
                      disabled={isSubmittingReservation}
                      className="w-full h-[46px] bg-[var(--accent)] hover:bg-[var(--accent-hi)] disabled:opacity-40 text-[var(--primary-foreground)] font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                    >
                      {isSubmittingReservation ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Generating Reservation Slip & OTP...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Lock Stock & Generate Slip</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSendOrder}
                      className="w-full mt-2 py-1 text-[var(--ink3)] hover:text-[var(--accent)] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[var(--ok)]" />
                      <span>Send inquiry via WhatsApp</span>
                    </button>

                    <p className="mt-2 text-[10px] text-center text-[var(--ink3)] flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[var(--ok)]" />
                      <span>Held in store stock for 30 mins. Pay at counter upon collection.</span>
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
