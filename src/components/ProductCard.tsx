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

  const openQuickView = () => onQuickView(product);
  const handleQuickViewKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openQuickView();
    }
  };

  return (
    <div className={`group relative bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 shadow-xs hover:shadow-lg hover:shadow-emerald-900/5 transition-all duration-300 flex overflow-hidden ${viewMode === 'list' ? 'flex-col sm:flex-row' : 'flex-col'}`}>
      {/* Top Image & Badge Container */}
      <div
        className={`relative bg-slate-100 overflow-hidden cursor-pointer ${
          viewMode === 'list' ? 'h-36 w-full shrink-0 sm:h-auto sm:w-40' : 'w-full pt-[75%]'
        }`}
        onClick={openQuickView}
        onKeyDown={handleQuickViewKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${product.name}`}
      >
        {/* Popular Tag */}
        {product.isPopular && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            POPULAR
          </div>
        )}

        {/* Stock Status Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs backdrop-blur-md ${stockInfo.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${stockInfo.dotClass}`} />
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
              className={`absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-500 ${
                isCustomPhoto ? 'object-contain p-2.5 bg-white' : 'object-cover'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 bg-slate-100">
              <Package className="w-12 h-12 stroke-[1.5]" />
              <span className="text-[11px] font-medium text-slate-400 mt-1">J MART</span>
            </div>
          );
        })()}

        {/* Hover Quick View overlay */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1 bg-white/90 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md backdrop-blur-xs">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className={`p-4 flex-1 flex flex-col justify-between ${viewMode === 'list' ? 'sm:flex-row sm:items-center sm:gap-5' : ''}`}>
        <div>
          {/* Category & Brand row */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            {product.brand && (
              <span className="text-slate-500 font-medium truncate max-w-[120px]">
                {product.brand}
              </span>
            )}
          </div>

          {/* Product Name */}
          <button
            type="button"
            onClick={openQuickView}
            className="text-left text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-2 cursor-pointer leading-snug"
            title={product.name}
          >
            {product.name}
          </button>

          {/* Unit / Weight specification */}
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>SKU: {product.sku}</span>
            {product.uom && <span>• {product.uom}</span>}
          </div>
        </div>

        {/* Pricing & Stock Availability Status */}
        <div className={`mt-3.5 pt-3 border-t border-slate-100 ${viewMode === 'list' ? 'sm:mt-0 sm:pt-0 sm:border-t-0 sm:min-w-[210px]' : ''}`}>
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-slate-900">
                  {currency}{product.price}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <span className="text-xs text-slate-400 line-through">
                    {currency}{product.mrp}
                  </span>
                )}
              </div>
              {product.discountPercent && product.discountPercent > 0 ? (
                <span className="inline-block text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-sm">
                  {product.discountPercent}% OFF
                </span>
              ) : null}
            </div>

            {/* In-store units indicator */}
            <div className="text-right">
              {STORE_CONFIG.features.showExactStockCount && !isOutOfStock ? (
                <span className="text-[11px] font-medium text-slate-500 block">
                  <span className="font-bold text-slate-800">{product.stock}</span> in store
                </span>
              ) : null}
            </div>
          </div>

          {/* Action button / Reserved by user status */}
          <div className="mt-3">
            {isReservedByMe ? (
              <div className="space-y-1.5">
                <div className="w-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold py-1.5 px-2.5 rounded-xl flex items-center justify-between shadow-2xs">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Reserved for you ({reservedQty})</span>
                  </span>
                  <button
                    type="button"
                    onClick={openReservationModal}
                    className="text-[11px] underline font-extrabold text-emerald-700 hover:text-emerald-950 cursor-pointer"
                  >
                    View OTP
                  </button>
                </div>
                {!isOutOfStock && (
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="w-full text-xs font-semibold py-1.5 px-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ShoppingBag className="w-3 h-3 text-slate-500" />
                    Reserve More ({product.stock} left)
                  </button>
                )}
              </div>
            ) : isOutOfStock ? (
              <button
                disabled
                className="w-full bg-slate-100 text-slate-400 text-xs font-semibold py-2 rounded-xl border border-slate-200 cursor-not-allowed text-center"
              >
                Out of Stock at Store
              </button>
            ) : (
              <button
                onClick={() => addToCart(product)}
                className={`w-full text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                  isAuthenticated
                    ? 'bg-slate-900 hover:bg-emerald-600 active:bg-emerald-700 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isAuthenticated ? (
                  <ShoppingBag className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                )}
                {isAuthenticated ? 'Reserve for Pickup' : 'Sign In to Reserve'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
