import React from 'react';
import { CheckCircle2, MessageCircle, User, Timer, ShoppingBag, MapPin } from 'lucide-react';
import { STORE_CONFIG } from '../config/storeConfig';
import { useAuth } from '../context/AuthContext';

interface HeroProps {
  totalProductsCount: number;
  inStockCount: number;
  popularCategories: string[];
  onOpenStoreInfo: () => void;
  onSelectCategory: (cat: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  totalProductsCount,
  inStockCount,
  popularCategories,
  onOpenStoreInfo,
  onSelectCategory,
}) => {
  const { isAuthenticated, openLoginModal, openJoinModal, currentCustomer } = useAuth();

  return (
    <section className="relative border-b border-[var(--rule2)] bg-[var(--panel)] py-10 sm:py-14 px-4 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Brand Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border2)] bg-[var(--sub)]">
              <span className="w-2 h-2 rounded-full bg-[var(--ok)] animate-pulse" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink2)]">
                Live Store Inventory · Ramapuram, Chennai
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--ink)] leading-[1.12]">
              Real-time supermarket stock,{' '}
              <span className="text-[var(--accent)]">before you visit.</span>
            </h1>

            <p className="text-sm sm:text-base text-[var(--ink2)] max-w-2xl leading-relaxed">
              Browse live inventory directly synchronized with our cashier tills. Verify shelf availability,
              pricing, and GST rates in real-time. Loyalty club members can hold items for 30 minutes for
              express counter pickup.
            </p>

            {/* CTA Buttons Row */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#catalog"
                className="h-[46px] px-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-[var(--primary-foreground)] font-bold text-sm transition-all cursor-pointer select-none active:scale-[0.98]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Catalog</span>
              </a>

              <a
                href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="h-[46px] px-5 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--sub)] hover:bg-[var(--rule2)] text-[var(--ink)] border border-[var(--border2)] font-semibold text-sm transition-all cursor-pointer select-none"
              >
                <MessageCircle className="w-4 h-4 text-[var(--ok)]" />
                <span>WhatsApp Desk</span>
              </a>

              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => openLoginModal()}
                  className="h-[46px] px-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--sub)] hover:bg-[var(--rule2)] text-[var(--ink2)] hover:text-[var(--ink)] border border-[var(--border)] font-semibold text-sm transition-all cursor-pointer"
                >
                  <User className="w-4 h-4 text-[var(--accent)]" />
                  <span>Member Login</span>
                </button>
              ) : (
                <div className="h-[46px] px-4 inline-flex items-center gap-2 rounded-lg border border-[var(--border2)] bg-[var(--sub)] text-xs text-[var(--ink)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--ok)]" />
                  <span className="font-semibold">{currentCustomer?.name}</span>
                  <span className="font-mono text-[9px] uppercase font-bold text-[var(--accent)] px-1.5 py-0.5 rounded bg-[var(--accent-soft)]">
                    {currentCustomer?.tier}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={onOpenStoreInfo}
                className="h-[46px] px-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--sub)] hover:bg-[var(--rule2)] text-[var(--ink2)] hover:text-[var(--ink)] border border-[var(--border)] font-semibold text-sm transition-all cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[var(--accent)]" />
                <span>Store Info</span>
              </button>
            </div>

            {/* Quick Category Jump Pill Strip */}
            <div className="pt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)]">
                Popular:
              </span>
              {popularCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onSelectCategory(cat)}
                  className="px-2.5 py-1 rounded-md border border-[var(--border)] bg-[var(--sub)] hover:bg-[var(--rule2)] text-[var(--ink2)] hover:text-[var(--ink)] text-xs font-medium transition-colors cursor-pointer"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Instrument Panel KPI Status Cards */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* KPI Card 1: Live On Shelves */}
            <div className="p-4 sm:p-5 rounded-xl border border-[var(--border)] bg-[var(--sub)] flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)]">
                  Available On Shelves
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-mono text-3xl font-bold tracking-tight text-[var(--ink)] tabular-nums">
                    {inStockCount}
                  </span>
                  <span className="font-mono text-xs text-[var(--ink3)]">
                    / {totalProductsCount} SKUs
                  </span>
                </div>
                <p className="text-xs text-[var(--ink3)] mt-1">
                  Ready for immediate walk-in purchase or hold
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[var(--ok-soft)] border border-[var(--ok-line)] text-[var(--ok)] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* KPI Card 2: 30-Minute Hold Policy */}
            <div className="p-4 sm:p-5 rounded-xl border border-[var(--border)] bg-[var(--sub)] flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)]">
                  30-Minute Express Hold
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-mono text-lg font-bold text-[var(--ink)]">
                    OTP Express Pickup
                  </span>
                </div>
                <p className="text-xs text-[var(--ink3)] mt-1">
                  Reserve items online · Unclaimed stock releases after 30 mins
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-line)] text-[var(--accent)] flex items-center justify-center shrink-0">
                <Timer className="w-6 h-6" />
              </div>
            </div>

            {/* Enrollment Banner Card */}
            {!isAuthenticated && (
              <div className="p-4 rounded-xl border border-[var(--accent-line)] bg-[var(--accent-soft)] flex items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent-hi)]">
                    Loyalty Membership · ₹100
                  </span>
                  <p className="text-xs text-[var(--ink)] font-medium mt-0.5">
                    Enroll today & receive an instant ₹100 welcome voucher!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openJoinModal}
                  className="h-8 px-3 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-[var(--primary-foreground)] text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  Join Club
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
