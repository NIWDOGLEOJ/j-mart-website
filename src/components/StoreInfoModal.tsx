import React, { useEffect } from 'react';
import { X, MapPin, Phone, MessageCircle, Clock, ExternalLink } from 'lucide-react';
import { STORE_CONFIG } from '../config/storeConfig';
import { JMartLogo } from './JMartLogo';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(8,9,8,0.65)] backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[var(--panel)] text-[var(--ink)] rounded-xl border border-[var(--border)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-information-title"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[var(--rule)] relative">
          <button
            onClick={onClose}
            aria-label="Close store information"
            className="absolute top-4 right-4 text-[var(--ink3)] hover:text-[var(--ink)] w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--sub)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <JMartLogo variant="full" subtitle="SUPERMARKET & RETAIL" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Location & Address */}
          <div className="p-4 bg-[var(--sub)] rounded-xl border border-[var(--border2)] flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)] flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] block">
                Physical Location
              </span>
              <p className="text-sm font-semibold text-[var(--ink)] mt-0.5">{STORE_CONFIG.address}</p>
              <p className="text-xs text-[var(--ink2)]">{STORE_CONFIG.cityStateZip}</p>
              <a
                href={STORE_CONFIG.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[var(--accent)] hover:underline mt-2 cursor-pointer"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Operating Hours in Mono */}
          <div className="p-4 bg-[var(--sub)] rounded-xl border border-[var(--border2)] flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)] flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] block">
                Store Timings
              </span>
              <div className="mt-1 space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--ink3)]">Monday – Friday:</span>
                  <span className="font-bold text-[var(--ink)] tabular-nums">{STORE_CONFIG.openingHours.weekdays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ink3)]">Saturday – Sunday:</span>
                  <span className="font-bold text-[var(--ink)] tabular-nums">{STORE_CONFIG.openingHours.weekends}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tax & Business Details matching Billing Software Spec */}
          <div className="p-4 bg-[var(--sub)] rounded-xl border border-[var(--border2)] space-y-1 font-mono text-xs">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] block">
              Store Registration & GST
            </span>
            <div className="flex justify-between pt-1">
              <span className="text-[var(--ink3)]">GSTIN:</span>
              <span className="font-bold text-[var(--ink)]">33AAAAA0000A1Z5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ink3)]">State Jurisdiction:</span>
              <span className="text-[var(--ink)]">Tamil Nadu (Code 33)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ink3)]">Billing Desks:</span>
              <span className="text-[var(--ink)]">Tills 01 – 04 Active</span>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${STORE_CONFIG.phone}`}
              className="h-11 rounded-lg border border-[var(--border2)] bg-[var(--sub)] hover:bg-[var(--rule2)] text-[var(--ink)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[var(--accent)]" />
              <span>Call Store</span>
            </a>

            <a
              href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="h-11 rounded-lg border border-[var(--ok-line)] bg-[var(--ok-soft)] text-[var(--ok)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
