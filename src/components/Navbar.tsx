import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Search, Clock, MapPin, X, User, LogOut, KeyRound, Gift, ChevronDown, Timer, Lock } from 'lucide-react';
import { getStoreStatusText, STORE_CONFIG } from '../config/storeConfig';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenStoreInfo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenStoreInfo,
}) => {
  const {
    totalItems,
    subtotal,
    toggleCart,
    formattedTimeRemaining,
    reservationExpiresAt,
    activeReservation,
  } = useCart();
  const { currentCustomer, isAuthenticated, openLoginModal, openChangePasswordModal, logout } = useAuth();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) return;
      event.preventDefault();
      searchInputRef.current?.focus();
    };

    document.addEventListener('keydown', focusSearch);
    return () => document.removeEventListener('keydown', focusSearch);
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Gold':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Silver':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      default:
        return 'bg-amber-50 text-amber-900 border-amber-200';
    }
  };

  const unusedCouponsCount = currentCustomer?.coupons?.filter((c) => !c.isUsed).length || 0;
  const storeStatusText = getStoreStatusText();
  const isStoreOpen = storeStatusText.startsWith('Open');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Top micro-bar: store hours and location */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-1.5 font-medium ${isStoreOpen ? 'text-emerald-400' : 'text-amber-300'}`}>
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isStoreOpen ? 'animate-ping bg-emerald-400' : 'bg-amber-300'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isStoreOpen ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
              </span>
              {storeStatusText}
            </span>
            <span className="hidden md:inline-block text-slate-400">•</span>
            <span className="hidden md:flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Weekdays: {STORE_CONFIG.openingHours.weekdays}
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onOpenStoreInfo}
              className="flex items-center gap-1 hover:text-white transition-colors text-xs font-medium cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Store Location & Contact</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-6">
          {/* Logo & Brand */}
          <a
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
            aria-label={`${STORE_CONFIG.name} Home`}
          >
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-xs group-hover:border-emerald-300 group-hover:shadow-sm transition-all">
              <img
                src="/logo-mark.png"
                alt={`${STORE_CONFIG.name} Logo`}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-emerald-900 transition-colors">
                  {STORE_CONFIG.name}
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                  Live Stock
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-500 font-medium">
                {STORE_CONFIG.tagline}
              </p>
            </div>
          </a>

          {/* Search bar */}
          <div className="order-3 basis-full max-w-none sm:order-none sm:flex-1 sm:max-w-lg mx-0 sm:mx-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products by name, brand, or SKU..."
                aria-label="Search products by name, brand, or SKU"
                className="w-full pl-10 pr-9 py-2 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 rounded-xl outline-hidden transition-all text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear product search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Action buttons: Auth / Loyalty and Cart */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Customer Login / Member Profile */}
            {isAuthenticated && currentCustomer ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-[11px]">
                    {currentCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate">
                    {currentCustomer.name}
                  </span>
                  <span
                    className={`hidden sm:inline text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${getTierColor(
                      currentCustomer.tier
                    )}`}
                  >
                    {currentCustomer.tier}
                  </span>
                  {unusedCouponsCount > 0 && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 rounded-full">
                      {unusedCouponsCount}
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Profile Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2 border-b border-slate-100">
                      <div className="font-extrabold text-sm text-slate-900">
                        {currentCustomer.name}
                      </div>
                      <div className="text-[11px] text-slate-500">{currentCustomer.phone}</div>
                      <div className="mt-2 flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl">
                        <span className="text-slate-600 font-medium">Points Balance:</span>
                        <span className="font-black text-emerald-700">
                          {currentCustomer.loyaltyPoints} pts
                        </span>
                      </div>
                    </div>

                    {/* Available Coupons */}
                    <div className="py-2 border-b border-slate-100">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1">
                        <Gift className="w-3 h-3 text-emerald-600" />
                        Available Coupons:
                      </div>
                      {(() => {
                        const activeCoupons = (currentCustomer.coupons || []).filter((c) => !c.isUsed);
                        return activeCoupons.length > 0 ? (
                          <div className="space-y-1">
                            {activeCoupons.map((c) => (
                              <div
                                key={c.code}
                                className="p-2 rounded-lg text-xs flex items-center justify-between bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200"
                              >
                                <span>{c.code}</span>
                                <span>₹{c.discountAmount} off</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 px-2">No coupons available</div>
                        );
                      })()}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 space-y-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          openChangePasswordModal();
                        }}
                        className="w-full text-left text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                        Change Password
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 p-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openLoginModal()}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Loyalty Login</span>
              </button>
            )}

            {/* Cart / WhatsApp Reservation Bag */}
            {STORE_CONFIG.features.enableWhatsAppOrder && (
              <button
                onClick={toggleCart}
                className={`relative flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
                  isAuthenticated && activeReservation
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/30 ring-2 ring-emerald-400/50'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-600/20'
                }`}
                title={isAuthenticated && activeReservation ? 'Active Reservation - View OTP' : 'Reservation Bag'}
              >
                <div className="relative">
                  {isAuthenticated && activeReservation ? (
                    <Lock className="w-4 h-4 text-amber-300" />
                  ) : (
                    <ShoppingBag className="w-4 h-4" />
                  )}
                  {isAuthenticated && activeReservation ? (
                    <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {activeReservation.items.length}
                    </span>
                  ) : totalItems > 0 ? (
                    <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {totalItems}
                    </span>
                  ) : null}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  {isAuthenticated && activeReservation ? (
                    <>
                      <span className="text-xs font-black tracking-wide text-amber-300 font-mono">
                        OTP: {activeReservation.otp}
                      </span>
                      <span className="text-[10px] text-emerald-200">
                        View Reservation
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-bold">
                        {totalItems > 0
                          ? `${STORE_CONFIG.features.currencySymbol}${subtotal}`
                          : 'Reservations'}
                      </span>
                      {reservationExpiresAt && totalItems > 0 && (
                        <span className="text-[10px] text-emerald-200 flex items-center gap-0.5">
                          <Timer className="w-2.5 h-2.5" />
                          {formattedTimeRemaining}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
