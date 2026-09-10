import React, { useEffect } from 'react';
import { X, MapPin, Phone, MessageCircle, Clock, ExternalLink, CreditCard, ShieldCheck } from 'lucide-react';
import { STORE_CONFIG } from '../config/storeConfig';

interface StoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreInfoModal: React.FC<StoreInfoModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-information-title"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close store information"
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3.5 mt-1">
            <div className="w-13 h-13 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md">
              <img src="/logo-mark.png" alt={STORE_CONFIG.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="inline-block bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider mb-1">
                Store Information
              </div>
              <h3 id="store-information-title" className="text-xl font-black">{STORE_CONFIG.name}</h3>
              <p className="text-xs text-slate-400">{STORE_CONFIG.tagline}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Location & Address */}
          <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-800">Physical Address</h4>
              <p className="text-xs text-slate-600 mt-0.5">{STORE_CONFIG.address}</p>
              <p className="text-xs text-slate-600">{STORE_CONFIG.cityStateZip}</p>
              <a
                href={STORE_CONFIG.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-2 hover:underline cursor-pointer"
              >
                <span>Get Directions on Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-800">Operating Hours</h4>
              <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Monday – Friday:</span>
                  <span className="font-semibold text-slate-800">{STORE_CONFIG.openingHours.weekdays}</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday – Sunday:</span>
                  <span className="font-semibold text-slate-800">{STORE_CONFIG.openingHours.weekends}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={`tel:${STORE_CONFIG.phone.replace(/[^0-9+]/g, '')}`}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-500 font-medium">Call Store</div>
                <div className="text-xs font-bold text-slate-800 truncate">{STORE_CONFIG.phone}</div>
              </div>
            </a>

            <a
              href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 fill-[#25D366]" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-500 font-medium">WhatsApp</div>
                <div className="text-xs font-bold text-slate-800 truncate">Chat with us</div>
              </div>
            </a>
          </div>

          {/* Payment & In-Store Features */}
          <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              Accepted Payment Methods in Store
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              We accept UPI (Google Pay, PhonePe, Paytm), Cash, and all major Credit/Debit Cards (Visa, Mastercard, RuPay) at our registers.
            </p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Prices shown on this site match in-store prices and include GST.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
