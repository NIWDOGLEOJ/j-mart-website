import React, { useState } from 'react';
import { ShoppingBag, Eye, Package, Sparkles, Lock, CheckCircle2 } from 'lucide-react';
import { CatalogViewMode, Product } from '../types/product';
import { InventoryService } from '../services/inventoryService';
import { STORE_CONFIG } from '../config/storeConfig';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  viewMode?: CatalogViewMode;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView, viewMode = 'grid' }) => {
  const { addToCart, hasReservedProduct, getReservedProductQuantity, openReservationModal } = useCart();
  const { isAuthenticated } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isReservedByMe = hasReservedProduct(product.id);
  const reservedQty = getReservedProductQuantity(product.id);

  const stockInfo = InventoryService.getStockStatus(product);
  const currency = STORE_CONFIG.features.currencySymbol;
  const isOutOfStock = stockInfo.type === 'out_of_stock';
  const isLowStock = stockInfo.type === 'low_stock';

  const openQuickView = () => onQuickView(product);
  const handleQuickViewKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openQuickView();
    }
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
      className={`group relative bg-[var(--panel)] rounded-xl border border-[var(--border)] hover:border-[var(--border2)] transition-all duration-200 flex overflow-hidden ${
        viewMode === 'list' ? 'flex-col sm:flex-row' : 'flex-col'
      }`}
    >
      {/* Top Image & Badge Container */}
      <div
        className={`relative bg-[var(--sub)] overflow-hidden cursor-pointer ${
          viewMode === 'list' ? 'h-36 w-full shrink-0 sm:h-auto sm:w-44' : 'w-full pt-[75%]'
        }`}
        onClick={openQuickView}
        onKeyDown={handleQuickViewKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${product.name}`}
      >
        {/* Popular Tag */}
        {product.isPopular && (
          <div className="absolute top-2.5 left-2.5 z-10 font-mono bg-[var(--ink)] text-[var(--panel)] text-[9px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-[var(--accent)]" />
            POPULAR
          </div>
        )}

        {/* Stock Status Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border select-none ${statusBadgeStyle}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusDotStyle}`} />
            {stockInfo.label}
          </span>
        </div>

        {/* Product Photo */}
        {(() => {
          const displayImage = InventoryService.getProductImage(product);
          const isCustomPhoto = displayImage && (displayImage.includes('/uploads/') || displayImage.startsWith('data:'));
          return displayImage && !imageError ? (
            <img
              src={displayImage}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-300 ${
                isCustomPhoto ? 'object-contain p-2.5 bg-white' : 'object-cover'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--ink4)] bg-[var(--sub)]">
              <Package className="w-10 h-10 stroke-[1.5]" />
              <span className="font-mono text-[10px] text-[var(--ink3)] uppercase tracking-wider mt-1">
                J MART
              </span>
            </div>
          );
        })()}

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 bg-[var(--panel)] text-[var(--ink)] font-mono text-[11px] font-bold px-3 py-1.5 rounded-md border border-[var(--border)]">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div
        className={`p-4 flex-1 flex flex-col justify-between ${
          viewMode === 'list' ? 'sm:flex-row sm:items-center sm:gap-5' : ''
        }`}
      >
        <div>
          {/* Eyebrow / Category row */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)]">
              {product.category}
            </span>
            {product.brand && (
              <span className="text-[var(--ink3)] font-medium text-xs truncate max-w-[120px]">
                {product.brand}
              </span>
            )}
          </div>

          {/* Product Name */}
          <button
            type="button"
            onClick={openQuickView}
            className="text-left text-sm font-semibold text-[var(--ink)] hover:text-[var(--accent)] transition-colors line-clamp-2 cursor-pointer leading-snug"
            title={product.name}
          >
            {product.name}
          </button>

          {/* SKU and UOM Specification in Plex Mono */}
          <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-[var(--ink4)] tabular-nums">
            <span>SKU: {product.sku}</span>
            {product.uom && <span>· {product.uom}</span>}
          </div>
        </div>

        {/* Pricing & Stock Availability Status */}
        <div
          className={`mt-3 pt-3 border-t border-[var(--rule)] ${
            viewMode === 'list' ? 'sm:mt-0 sm:pt-0 sm:border-t-0 sm:min-w-[220px]' : ''
          }`}
        >
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-lg font-bold text-[var(--ink)] tabular-nums">
                  {currency}{product.price.toFixed(2)}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <span className="font-mono text-xs text-[var(--ink4)] line-through tabular-nums">
                    {currency}{product.mrp.toFixed(2)}
                  </span>
                )}
              </div>
              {product.discountPercent && product.discountPercent > 0 ? (
                <span className="inline-block font-mono text-[9.5px] font-bold text-[var(--ok)] bg-[var(--ok-soft)] px-1.5 py-0.2 rounded border border-[var(--ok-line)] mt-0.5">
                  {product.discountPercent}% OFF
                </span>
              ) : null}
            </div>

            {/* In-store units count */}
            <div className="text-right font-mono text-[11px] text-[var(--ink3)] tabular-nums">
              {STORE_CONFIG.features.showExactStockCount && !isOutOfStock ? (
                <span>
                  <strong className="text-[var(--ink)]">{product.stock}</strong> in store
                </span>
              ) : null}
            </div>
          </div>

          {/* Action button / Reserved by user status */}
          <div className="mt-3">
            {isReservedByMe ? (
              <div className="space-y-1.5">
                <div className="w-full bg-[var(--accent-soft)] border border-[var(--accent-line)] text-[var(--ink)] text-xs font-semibold py-1.5 px-2.5 rounded-lg flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                    <span>Reserved ({reservedQty})</span>
                  </span>
                  <button
                    type="button"
                    onClick={openReservationModal}
                    className="font-mono text-[11px] font-bold text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    View OTP
                  </button>
                </div>
                {!isOutOfStock && (
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="w-full h-8 text-xs font-medium rounded-lg border border-[var(--border2)] bg-[var(--sub)] hover:bg-[var(--rule2)] text-[var(--ink)] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ShoppingBag className="w-3 h-3 text-[var(--ink3)]" />
                    <span>Hold More ({product.stock} left)</span>
                  </button>
                )}
              </div>
            ) : isOutOfStock ? (
              <button
                disabled
                className="w-full h-10 bg-[var(--sub)] text-[var(--ink4)] text-xs font-medium rounded-lg border border-[var(--border)] cursor-not-allowed text-center select-none"
              >
                Out of Stock at Store
              </button>
            ) : (
              <button
                type="button"
                onClick={() => addToCart(product)}
                className={`w-full h-10 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-[0.98] ${
                  isAuthenticated
                    ? 'bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-[var(--primary-foreground)]'
                    : 'bg-[var(--sub)] hover:bg-[var(--rule2)] text-[var(--ink)] border border-[var(--border2)]'
                }`}
              >
                {isAuthenticated ? (
                  <ShoppingBag className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[var(--accent)]" />
                )}
                <span>{isAuthenticated ? 'Reserve for Pickup' : 'Sign In to Reserve'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
