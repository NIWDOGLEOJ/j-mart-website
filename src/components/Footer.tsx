import React from 'react';
import { Phone, MessageCircle, MapPin, RefreshCw } from 'lucide-react';
import { getStoreStatusText, STORE_CONFIG } from '../config/storeConfig';
import { JMartLogo } from './JMartLogo';

interface FooterProps {
  onOpenStoreInfo: () => void;
  onRefreshCatalog: () => void;
  isRefreshing: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenStoreInfo,
  onRefreshCatalog,
  isRefreshing,
}) => {
  return (
    <footer className="bg-[var(--panel)] text-[var(--ink)] border-t border-[var(--border)] pt-12 pb-8 px-4 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[var(--rule)]">
          {/* Col 1: Store Branding */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <JMartLogo variant="full" subtitle="SUPERMARKET & RETAIL" />
            </div>
            <p className="text-xs text-[var(--ink3)] max-w-sm leading-relaxed">
              {STORE_CONFIG.description}
            </p>
            <div className="inline-flex items-center gap-2 bg-[var(--sub)] border border-[var(--border2)] px-3 py-1.5 rounded-lg text-xs text-[var(--ink2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--ok)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--ok)]" />
              </span>
              <span>Directly synchronized with cashier tills</span>
              <button
                type="button"
                onClick={onRefreshCatalog}
                disabled={isRefreshing}
                className="ml-2 text-[var(--accent)] hover:text-[var(--accent-hi)] p-1 rounded hover:bg-[var(--rule2)] transition-colors cursor-pointer"
                title="Refresh stock status"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Col 2: Store Timings */}
          <div>
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] mb-3">
              Store Timings
            </h3>
            <ul className="space-y-1.5 text-xs text-[var(--ink3)] font-mono">
              <li>
                <span className="text-[var(--ink2)]">Mon – Fri:</span>{' '}
                <span className="tabular-nums text-[var(--ink)]">{STORE_CONFIG.openingHours.weekdays}</span>
              </li>
              <li>
                <span className="text-[var(--ink2)]">Sat – Sun:</span>{' '}
                <span className="tabular-nums text-[var(--ink)]">{STORE_CONFIG.openingHours.weekends}</span>
              </li>
              <li className="text-[var(--ok)] font-bold pt-1">
                {getStoreStatusText()}
              </li>
            </ul>
          </div>

          {/* Col 3: Visit Us & Contact */}
          <div>
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] mb-3">
              Store Contact
            </h3>
            <div className="space-y-2 text-xs text-[var(--ink3)]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                <span>{STORE_CONFIG.address}, {STORE_CONFIG.cityStateZip}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <a href={`tel:${STORE_CONFIG.phone}`} className="hover:text-[var(--ink)] transition-colors font-mono">
                  {STORE_CONFIG.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-[var(--ok)] shrink-0" />
                <a
                  href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--ink)] transition-colors"
                >
                  WhatsApp Helpdesk
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--ink4)]">
          <div className="font-mono text-[11px]">
            © {new Date().getFullYear()} {STORE_CONFIG.name} · Supermarket & Retail · All Rights Reserved
          </div>
          <div className="font-mono text-[10px] flex items-center gap-3">
            <span>GSTIN: 33AAAAA0000A1Z5</span>
            <span>·</span>
            <span>HSN Compliant</span>
            <span>·</span>
            <button
              type="button"
              onClick={onOpenStoreInfo}
              className="text-[var(--ink3)] hover:text-[var(--ink)] underline cursor-pointer"
            >
              Counter Info
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
