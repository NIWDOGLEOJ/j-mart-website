import React, { useEffect, useState } from 'react';
import { X, ShoppingBag, MessageCircle, Package, Lock, CheckCircle2 } from 'lucide-react';
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
    setQty(1);
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
  const isLowStock = stockInfo.type === 'low_stock';
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

  const statusBadgeStyle = isOutOfStock
    ? 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger-line)]'
    : isLowStock
      ? 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn-line)]'
      : 'bg-[var(--rule)] text-[var(--ink2)] border-[var(--border)]';

  const statusDotStyle = isOutOfStock
    ? 'bg-[var(--danger)]'
    : isLowStock
      ? 'bg-[var(--warn)]'
      : 'bg-[var(--ink3)]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(8,9,8,0.65)] backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-details-title"
    >
      <div
        className="relative w-full max-w-2xl bg-[var(--panel)] rounded-xl border border-[var(--border)] overflow-hidden text-[var(--ink)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-[var(--rule)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)]">
              Product Overview
            </span>
            <span className="text-[var(--ink4)]">·</span>
            <span className="font-mono text-[10px] text-[var(--ink3)]">
              SKU: {product.sku}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close product details"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ink3)] hover:text-[var(--ink)] hover:bg-[var(--sub)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image Column */}
          <div className="relative bg-[var(--sub)] min-h-[240px] md:min-h-[340px] flex items-center justify-center border-b md:border-b-0 md:border-r border-[var(--rule)] p-4">
            {(() => {
              const displayImage = InventoryService.getProductImage(product);
              const isCustomPhoto = displayImage && (displayImage.includes('/uploads/') || displayImage.startsWith('data:'));
              return displayImage ? (
                <img
                  src={displayImage}
                  alt={product.name}
                  className={`w-full h-full max-h-[300px] ${isCustomPhoto ? 'object-contain' : 'object-cover rounded-lg'}`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-[var(--ink4)]">
                  <Package className="w-14 h-14 stroke-[1.5]" />
                  <span className="font-mono text-[11px] font-semibold text-[var(--ink3)] uppercase tracking-wider mt-2">
                    J MART Item
                  </span>
                </div>
              );
            })()}

            {/* Live Stock Overlay Badge */}
            <div className="absolute bottom-3 left-3">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${statusBadgeStyle}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusDotStyle}`} />
                {stockInfo.label}
              </span>
            </div>
          </div>

          {/* Product Details Column */}
          <div className="p-5 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Category & Brand */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)]">
                  {product.category}
                </span>
                {product.brand && (
                  <span className="text-[var(--ink2)] font-medium text-xs">
                    {product.brand}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 id="product-details-title" className="text-lg font-bold text-[var(--ink)] leading-snug">
                {product.name}
              </h2>

              {/* Price Block */}
              <div className="p-3 rounded-lg bg-[var(--sub)] border border-[var(--border2)] space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold text-[var(--ink)] tabular-nums">
                    {currency}{product.price.toFixed(2)}
                  </span>
                  {product.mrp && product.mrp > product.price && (
                    <span className="font-mono text-sm text-[var(--ink4)] line-through tabular-nums">
                      {currency}{product.mrp.toFixed(2)}
                    </span>
                  )}
                  {product.discountPercent && product.discountPercent > 0 ? (
                    <span className="font-mono text-[10px] font-bold text-[var(--ok)] bg-[var(--ok-soft)] px-1.5 py-0.5 rounded border border-[var(--ok-line)]">
                      {product.discountPercent}% OFF
                    </span>
                  ) : null}
                </div>
                <div className="font-mono text-[11px] text-[var(--ink3)] flex items-center justify-between pt-1 border-t border-[var(--rule)]">
                  <span>Price includes GST</span>
                  <span>GST Slab: {product.gstRate ?? 5}%</span>
                </div>
              </div>

              {/* Specification Table in Mono */}
              <div className="font-mono text-[11px] border border-[var(--rule)] rounded-lg divide-y divide-[var(--rule)]">
                <div className="p-2 flex justify-between">
                  <span className="text-[var(--ink3)]">BARCODE / SKU:</span>
                  <span className="font-bold text-[var(--ink)]">{product.sku}</span>
                </div>
                <div className="p-2 flex justify-between">
                  <span className="text-[var(--ink3)]">UNIT OF MEASURE:</span>
                  <span className="text-[var(--ink)]">{product.uom || 'Standard Piece'}</span>
                </div>
                <div className="p-2 flex justify-between">
                  <span className="text-[var(--ink3)]">STORE SHELF STOCK:</span>
                  <span className={`font-bold ${isOutOfStock ? 'text-[var(--danger)]' : isLowStock ? 'text-[var(--warn)]' : 'text-[var(--ink)]'}`}>
                    {product.stock} units
                  </span>
                </div>
              </div>

              {/* User Reserved Notice */}
              {isReservedByMe && (
                <div className="p-2.5 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent-line)] text-xs text-[var(--ink)] flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
                    <span>You have {reservedQty} held on your slip</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openReservationModal();
                    }}
                    className="font-mono text-[11px] font-bold text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    View OTP
                  </button>
                </div>
              )}
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="pt-4 mt-4 border-t border-[var(--rule)] space-y-3">
              {!isOutOfStock && (
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink3)]">
                    Hold Quantity:
                  </span>
                  <div className="flex items-center border border-[var(--border2)] rounded-lg bg-[var(--sub)] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      className="w-9 h-9 flex items-center justify-center text-sm font-bold text-[var(--ink2)] hover:text-[var(--ink)] hover:bg-[var(--rule2)] disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-mono font-bold text-sm text-[var(--ink)] tabular-nums">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(maxAvailable, q + 1))}
                      disabled={qty >= maxAvailable}
                      className="w-9 h-9 flex items-center justify-center text-sm font-bold text-[var(--ink2)] hover:text-[var(--ink)] hover:bg-[var(--rule2)] disabled:opacity-30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {!isOutOfStock ? (
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="flex-1 h-11 bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-[var(--primary-foreground)] rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:scale-[0.98]"
                  >
                    {isAuthenticated ? (
                      <ShoppingBag className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    <span>{isAuthenticated ? `Hold ${qty} for Pickup` : 'Sign In to Reserve'}</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 h-11 bg-[var(--sub)] text-[var(--ink4)] border border-[var(--border)] rounded-lg font-medium text-xs text-center cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleWhatsAppInquiry}
                  className="h-11 px-3.5 bg-[var(--sub)] hover:bg-[var(--rule2)] text-[var(--ink)] border border-[var(--border2)] rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Ask store assistant on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-[var(--ok)]" />
                  <span className="hidden sm:inline">Ask Desk</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
