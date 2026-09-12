import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Clock,
  MapPin,
  X,
  User,
  LogOut,
  KeyRound,
  Gift,
  ChevronDown,
  Timer,
  Lock,
  Sun,
  Moon,
} from 'lucide-react';
import { getStoreStatusText, STORE_CONFIG } from '../config/storeConfig';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { JMartLogo } from './JMartLogo';

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
  const { resolvedTheme, toggleTheme } = useTheme();

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

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-[var(--accent-soft)] text-[var(--accent-hi)] border-[var(--accent-line)]';
      case 'Gold':
        return 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn-line)]';
      case 'Silver':
        return 'bg-[var(--sub)] text-[var(--ink)] border-[var(--border2)]';
      default:
        return 'bg-[var(--rule)] text-[var(--ink2)] border-[var(--border)]';
    }
  };

  const unusedCouponsCount = currentCustomer?.coupons?.filter((c) => !c.isUsed).length || 0;
  const storeStatusText = getStoreStatusText();
  const isStoreOpen = storeStatusText.startsWith('Open');

  return (
    <header className="sticky top-0 z-40 bg-[var(--panel)]/95 backdrop-blur-md border-b border-[var(--border)] transition-colors">
      {/* Top micro-bar: store status, hours, location, and theme toggle */}
      <div className="bg-[var(--sub)] text-[var(--ink2)] text-xs py-1.5 px-4 sm:px-6 border-b border-[var(--rule)]">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 font-medium ${
                isStoreOpen ? 'text-[var(--ok)]' : 'text-[var(--warn)]'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isStoreOpen ? 'animate-ping bg-[var(--ok)]' : 'bg-[var(--warn)]'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isStoreOpen ? 'bg-[var(--ok)]' : 'bg-[var(--warn)]'
                  }`}
                />
              </span>
              <span>{storeStatusText}</span>
            </span>
            <span className="hidden md:inline-block text-[var(--ink4)]">·</span>
            <span className="hidden md:flex items-center gap-1 text-[var(--ink3)]">
              <Clock className="w-3.5 h-3.5 text-[var(--ink4)]" />
              <span>Weekdays:</span>
              <span className="font-mono text-[11px] tabular-nums text-[var(--ink2)]">
                {STORE_CONFIG.openingHours.weekdays}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onOpenStoreInfo}
              className="flex items-center gap-1 text-[var(--ink2)] hover:text-[var(--ink)] transition-colors text-xs font-medium cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Ramapuram, Chennai</span>
            </button>
            <span className="text-[var(--ink4)]">·</span>
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--ink2)] hover:text-[var(--ink)] transition-colors cursor-pointer select-none"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-[var(--warn)]" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[var(--ink3)]" />
              )}
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Brand using official J MART Logo Component */}
          <a
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-xl"
            aria-label={`${STORE_CONFIG.name} Home`}
          >
            <JMartLogo variant="full" subtitle="SUPERMARKET & RETAIL" />
            <span className="hidden sm:inline-block font-mono text-[9px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded border border-[var(--border2)] bg-[var(--sub)] text-[var(--ink3)]">
              Live Stock
            </span>
          </a>

          {/* Search bar with 44px instrument panel styling and keyboard shortcut hint */}
          <div className="order-3 basis-full max-w-none sm:order-none sm:flex-1 sm:max-w-lg mx-0 sm:mx-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink3)] pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products by name, brand, or SKU... (Press '/' to search)"
                aria-label="Search products by name, brand, or SKU"
                className="w-full h-11 pl-10 pr-12 py-2 text-sm bg-[var(--sub)] hover:bg-[var(--rule2)]/50 focus:bg-[var(--panel)] border border-[var(--border2)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 rounded-xl outline-none transition-all text-[var(--ink)] placeholder:text-[var(--ink4)]"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    aria-label="Clear product search"
                    className="text-[var(--ink3)] hover:text-[var(--ink)] p-1 rounded-md hover:bg-[var(--rule)] transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block font-mono text-[10px] font-bold text-[var(--ink4)] border border-[var(--border)] rounded px-1.5 py-0.5 bg-[var(--panel)]">
                    /
                  </kbd>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons: Loyalty Auth and Cart / Reservation */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Customer Login / Member Profile */}
            {isAuthenticated && currentCustomer ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="h-11 flex items-center gap-2 bg-[var(--sub)] hover:bg-[var(--rule2)] text-[var(--ink)] px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border border-[var(--border2)] cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--primary-foreground)] flex items-center justify-center font-mono font-bold text-xs">
                    {currentCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate text-[var(--ink)] font-medium">
                    {currentCustomer.name}
                  </span>
                  <span
                    className={`hidden sm:inline font-mono text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getTierBadge(
                      currentCustomer.tier
                    )}`}
                  >
                    {currentCustomer.tier}
                  </span>
                  {unusedCouponsCount > 0 && (
                    <span className="font-mono bg-[var(--warn-soft)] text-[var(--warn-hi)] border border-[var(--warn-line)] text-[10px] font-bold px-1.5 rounded">
                      {unusedCouponsCount}
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--ink3)]" />
                </button>

                {/* Dropdown Profile Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[var(--panel)] rounded-xl border border-[var(--border)] p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2 border-b border-[var(--rule)]">
                      <div className="font-bold text-sm text-[var(--ink)]">
                        {currentCustomer.name}
                      </div>
                      <div className="font-mono text-[11px] text-[var(--ink3)]">
                        {currentCustomer.phone}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs bg-[var(--sub)] p-2 rounded-lg border border-[var(--border2)]">
                        <span className="text-[var(--ink3)] font-medium">Points:</span>
                        <span className="font-mono font-bold text-[var(--accent)] tabular-nums">
                          {currentCustomer.loyaltyPoints} pts
                        </span>
                      </div>
                    </div>

                    {/* Available Coupons */}
                    <div className="py-2 border-b border-[var(--rule)]">
                      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] px-2 mb-1 flex items-center gap-1">
                        <Gift className="w-3 h-3 text-[var(--accent)]" />
                        Available Coupons:
                      </div>
                      {(() => {
                        const activeCoupons = (currentCustomer.coupons || []).filter((c) => !c.isUsed);
                        return activeCoupons.length > 0 ? (
                          <div className="space-y-1">
                            {activeCoupons.map((c) => (
                              <div
                                key={c.code}
                                className="p-2 rounded-md text-xs flex items-center justify-between bg-[var(--ok-soft)] text-[var(--ok)] font-mono border border-[var(--ok-line)]"
                              >
                                <span className="font-bold">{c.code}</span>
                                <span>₹{c.discountAmount} OFF</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-[var(--ink3)] px-2">No coupons available</div>
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
                        className="w-full text-left text-xs font-semibold text-[var(--ink2)] hover:text-[var(--ink)] hover:bg-[var(--sub)] p-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-[var(--ink3)]" />
                        <span>Change Password</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left text-xs font-semibold text-[var(--danger)] hover:bg-[var(--danger-soft)] p-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openLoginModal()}
                className="h-11 flex items-center gap-1.5 bg-[var(--sub)] hover:bg-[var(--rule2)] text-[var(--ink)] border border-[var(--border2)] px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Loyalty Login</span>
              </button>
            )}

            {/* Cart / Reservation Bag Trigger */}
            {STORE_CONFIG.features.enableWhatsAppOrder && (
              <button
                onClick={toggleCart}
                className={`h-11 relative flex items-center gap-2 px-3 sm:px-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer border ${
                  isAuthenticated && activeReservation
                    ? 'bg-[var(--accent-soft)] hover:bg-[var(--accent-soft2)] text-[var(--ink)] border-[var(--accent-line)]'
                    : 'bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-[var(--primary-foreground)] border-[var(--accent)]'
                }`}
                title={isAuthenticated && activeReservation ? 'Active Hold - View OTP' : 'Reservation Cart'}
              >
                <div className="relative">
                  {isAuthenticated && activeReservation ? (
                    <Lock className="w-4 h-4 text-[var(--accent)]" />
                  ) : (
                    <ShoppingBag className="w-4 h-4" />
                  )}
                  {isAuthenticated && activeReservation ? (
                    <span className="absolute -top-2.5 -right-2.5 font-mono bg-[var(--warn)] text-[var(--bg)] text-[9.5px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {activeReservation.items.length}
                    </span>
                  ) : totalItems > 0 ? (
                    <span className="absolute -top-2.5 -right-2.5 font-mono bg-[var(--ink)] text-[var(--panel)] text-[9.5px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  ) : null}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  {isAuthenticated && activeReservation ? (
                    <>
                      <span className="font-mono text-xs font-bold tracking-wider text-[var(--accent)]">
                        OTP: {activeReservation.otp}
                      </span>
                      <span className="font-mono text-[9px] text-[var(--ink3)] uppercase">
                        View Slip
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-xs font-bold tabular-nums">
                        {totalItems > 0
                          ? `${STORE_CONFIG.features.currencySymbol}${subtotal}`
                          : 'Cart / Hold'}
                      </span>
                      {reservationExpiresAt && totalItems > 0 && (
                        <span className="font-mono text-[9px] text-[var(--primary-foreground)]/80 flex items-center gap-0.5 tabular-nums">
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
