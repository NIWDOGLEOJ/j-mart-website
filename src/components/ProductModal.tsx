import React, { useEffect, useState } from 'react';
import { X, ShoppingBag, MessageCircle, Package, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { Product } from '../types/product';
import { InventoryService } from '../services/inventoryService';
import { STORE_CONFIG } from '../config/storeConfig';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart, hasReservedProduct, getReservedProductQuantity, openReservationModal } = useCart();
  const { isAuthenticated } = useAuth();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const isReservedByMe = hasReservedProduct(product.id);
  const reservedQty = getReservedProductQuantity(product.id);

  const stockInfo = InventoryService.getStockStatus(product);
  const currency = STORE_CONFIG.features.currencySymbol;
  const isOutOfStock = stockInfo.type === 'out_of_stock';
  const maxAvailable = Math.max(1, product.stock || 1);

  const handleAdd = () => {
    addToCart(product, qty);
    onClose();
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hello ${STORE_CONFIG.name}, is "${product.name}" (SKU: ${product.sku}) available in store right now?`
    );
    window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-details-title"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center shadow-md transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image Column */}
          <div className="relative bg-white min-h-[260px] md:min-h-[380px] flex items-center justify-center overflow-hidden">
            {(() => {
              const displayImage = InventoryService.getProductImage(product);
              const isCustomPhoto = displayImage && (displayImage.includes('/uploads/') || displayImage.startsWith('data:'));
              return displayImage ? (
                <img
                  src={displayImage}
                  alt={product.name}
                  className={`w-full h-full ${isCustomPhoto ? 'object-contain p-4' : 'object-cover'}`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-300">
                  <Package className="w-16 h-16 stroke-[1.5]" />
                  <span className="text-xs font-semibold text-slate-400 mt-2">J MART Item</span>
                </div>
              );
            })()}

            {/* Live Stock Overlay Badge */}
            <div className="absolute bottom-3 left-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs backdrop-blur-md ${stockInfo.badgeClass}`}
              >
                <span className={`w-2 h-2 rounded-full ${stockInfo.dotClass}`} />
                {stockInfo.label}
              </span>
            </div>
          </div>

          {/* Product Info Column */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Brand */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-2">
                <span className="bg-emerald-50 px-2.5 py-0.5 rounded-md">{product.category}</span>
                {product.brand && <span className="text-slate-500">• {product.brand}</span>}
              </div>

              {/* Title */}
              <h2 id="product-details-title" className="text-xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h2>

              {/* SKU & UOM */}
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                <span>SKU: <strong className="text-slate-700">{product.sku}</strong></span>
                {product.uom && <span>Unit: <strong className="text-slate-700">{product.uom}</strong></span>}
              </div>

              {/* Pricing section */}
              <div className="mt-4 pb-4 border-b border-slate-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {currency}{product.price}
                  </span>
                  {product.mrp && product.mrp > product.price && (
                    <span className="text-sm text-slate-400 line-through">
                      MRP {currency}{product.mrp}
                    </span>
                  )}
                  {product.discountPercent && product.discountPercent > 0 ? (
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Save {product.discountPercent}%
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {product.description || "Fresh, authentic retail item available in store. Checked daily against store inventory."}
                </p>
              </div>

              {/* Live Stock Details Callout */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Store Shelf Status:</span>
                  <span className="font-bold text-slate-900">
                    {product.stock > 0 ? `${product.stock} units available` : 'Currently 0 units'}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Synced with store checkout register
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              {isReservedByMe && (
                <div className="w-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-between shadow-2xs">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Reserved for you ({reservedQty} {product.uom || 'units'})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openReservationModal();
                    }}
                    className="text-xs underline font-extrabold text-emerald-700 hover:text-emerald-950 cursor-pointer"
                  >
                    View OTP
                  </button>
                </div>
              )}

              {!isOutOfStock ? (
                <div className="flex items-center gap-3">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-7 h-7 rounded-lg bg-white text-slate-700 hover:bg-slate-200 font-bold flex items-center justify-center transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-800">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => Math.min(maxAvailable, q + 1))}
                      className="w-7 h-7 rounded-lg bg-white text-slate-700 hover:bg-slate-200 font-bold flex items-center justify-center transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to List Button */}
                  <button
                    onClick={handleAdd}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isAuthenticated ? (
                      <ShoppingBag className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4 text-amber-300" />
                    )}
                    {isAuthenticated
                      ? isReservedByMe
                        ? 'Reserve More Units'
                        : 'Reserve for Pickup'
                      : 'Sign In to Reserve'}
                  </button>
                </div>
              ) : (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl text-center">
                  This item is currently out of stock. Check back soon!
                </div>
              )}

              {/* Ask on WhatsApp */}
              <button
                onClick={handleWhatsAppInquiry}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                Ask Store on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
