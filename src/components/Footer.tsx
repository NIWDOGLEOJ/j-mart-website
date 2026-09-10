import React from 'react';
import { Phone, MessageCircle, MapPin, RefreshCw, Heart } from 'lucide-react';
import { getStoreStatusText, STORE_CONFIG } from '../config/storeConfig';

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
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Store Branding */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-xs shrink-0">
                <img src="/logo-mark.png" alt={STORE_CONFIG.name} className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">{STORE_CONFIG.name}</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
              {STORE_CONFIG.description}
            </p>
            <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Inventory synchronized with store shelves</span>
              <button
                onClick={onRefreshCatalog}
                disabled={isRefreshing}
                className="ml-2 text-emerald-400 hover:text-emerald-300 p-1 rounded-md hover:bg-slate-700 transition-colors cursor-pointer"
                title="Refresh stock status"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Col 2: Store Timings */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Opening Timings
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <span className="text-slate-300 font-medium">Mon – Fri:</span>{' '}
                {STORE_CONFIG.openingHours.weekdays}
              </li>
              <li>
                <span className="text-slate-300 font-medium">Sat – Sun:</span>{' '}
                {STORE_CONFIG.openingHours.weekends}
              </li>
              <li className="text-emerald-400 font-semibold pt-1">
                {getStoreStatusText()}
              </li>
            </ul>
          </div>

          {/* Col 3: Visit Us & Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Store Contact
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{STORE_CONFIG.address}, {STORE_CONFIG.cityStateZip}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href={`tel:${STORE_CONFIG.phone}`} className="hover:text-white transition-colors">
                  {STORE_CONFIG.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp Helpdesk
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} {STORE_CONFIG.name}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onOpenStoreInfo} className="hover:text-slate-300 transition-colors cursor-pointer">
              Store Details
            </button>
            <span>•</span>
            <span className="flex items-center gap-1">
              Built for retail with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
