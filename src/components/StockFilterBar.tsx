import React from 'react';
import { SlidersHorizontal, Check, RotateCcw, LayoutGrid, List } from 'lucide-react';
import { CatalogViewMode, ProductFilters } from '../types/product';

interface StockFilterBarProps {
  filters: ProductFilters;
  onFilterChange: (newFilters: Partial<ProductFilters>) => void;
  onResetFilters: () => void;
  totalFiltered: number;
  brands: string[];
  viewMode: CatalogViewMode;
  onViewModeChange: (mode: CatalogViewMode) => void;
}

export const StockFilterBar: React.FC<StockFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalFiltered,
  brands,
  viewMode,
  onViewModeChange,
}) => {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.category !== 'All' ||
    filters.brand !== 'All' ||
    filters.inStockOnly ||
    filters.sortBy !== 'featured';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
      {/* Left: Result count & active status */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-800">
          {totalFiltered} {totalFiltered === 1 ? 'Product' : 'Products'} found
        </span>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset filters
          </button>
        )}
      </div>

      {/* Right: In-Stock Toggle and Sort dropdown */}
      <div className="flex flex-wrap items-center gap-3 ml-auto">
        {/* "In Stock Only" quick toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-all">
          <div
            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
              filters.inStockOnly
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 bg-white'
            }`}
          >
            {filters.inStockOnly && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <span className="text-xs font-semibold text-slate-700">In Stock Only</span>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onFilterChange({ inStockOnly: e.target.checked })}
            className="sr-only"
          />
        </label>

        {brands.length > 0 && (
          <label className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="hidden sm:inline font-medium">Brand:</span>
            <select
              value={filters.brand}
              onChange={(e) => onFilterChange({ brand: e.target.value })}
              aria-label="Filter products by brand"
              className="max-w-[9rem] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">All brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </label>
        )}

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline font-medium">Sort:</span>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({
                sortBy: e.target.value as ProductFilters['sortBy'],
              })
            }
            aria-label="Sort products by"
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-emerald-500 cursor-pointer"
          >
            <option value="featured">Featured / Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name (A – Z)</option>
            <option value="stock_desc">Highest Stock</option>
          </select>
        </div>

        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5" role="group" aria-label="Catalog view">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            aria-pressed={viewMode === 'grid'}
            aria-label="Show products as a grid"
            className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            aria-pressed={viewMode === 'list'}
            aria-label="Show products as a list"
            className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
              viewMode === 'list' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
