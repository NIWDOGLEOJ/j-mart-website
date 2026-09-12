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
    <div className="bg-[var(--panel)] rounded-xl border border-[var(--border)] p-3 sm:p-4 transition-colors flex flex-wrap items-center justify-between gap-3">
      {/* Left: Result count & active status */}
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-sm font-bold text-[var(--ink)] tabular-nums">
            {totalFiltered}
          </span>
          <span className="text-xs text-[var(--ink3)] font-medium">
            {totalFiltered === 1 ? 'product' : 'products'} listed
          </span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--danger)] hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Right: In-Stock Toggle and Sort dropdown */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 ml-auto">
        {/* "In Stock Only" toggle chip */}
        <label
          className={`h-9 px-3 rounded-lg text-xs font-semibold cursor-pointer select-none inline-flex items-center gap-2 transition-colors ${
            filters.inStockOnly
              ? 'bg-[var(--accent-soft)] border-[1.5px] border-[var(--accent-line)] text-[var(--ink)]'
              : 'bg-[var(--sub)] hover:bg-[var(--rule2)] border border-[var(--border2)] text-[var(--ink2)]'
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
              filters.inStockOnly
                ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--primary-foreground)]'
                : 'border-[var(--border2)] bg-[var(--panel)]'
            }`}
          >
            {filters.inStockOnly && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <span>In Stock Only</span>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onFilterChange({ inStockOnly: e.target.checked })}
            className="sr-only"
          />
        </label>

        {brands.length > 0 && (
          <label className="flex items-center gap-1.5 text-xs text-[var(--ink3)]">
            <span className="hidden sm:inline font-mono text-[10px] uppercase font-bold tracking-wider">
              Brand:
            </span>
            <select
              value={filters.brand}
              onChange={(e) => onFilterChange({ brand: e.target.value })}
              aria-label="Filter products by brand"
              className="h-9 max-w-[9rem] bg-[var(--sub)] hover:bg-[var(--rule2)] border border-[var(--border2)] rounded-lg px-2.5 py-1 text-xs font-semibold text-[var(--ink)] outline-none focus:border-[var(--accent)] cursor-pointer"
            >
              <option value="All">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--ink3)]">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--ink4)]" />
          <span className="hidden sm:inline font-mono text-[10px] uppercase font-bold tracking-wider">
            Sort:
          </span>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({
                sortBy: e.target.value as ProductFilters['sortBy'],
              })
            }
            aria-label="Sort products by"
            className="h-9 bg-[var(--sub)] hover:bg-[var(--rule2)] border border-[var(--border2)] rounded-lg px-2.5 py-1 text-xs font-semibold text-[var(--ink)] outline-none focus:border-[var(--accent)] cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name (A – Z)</option>
            <option value="stock_desc">Highest Stock</option>
          </select>
        </div>

        {/* View Mode Grid/List Segmented Control */}
        <div
          className="inline-flex items-center rounded-lg border border-[var(--border2)] bg-[var(--sub)] p-0.5"
          role="group"
          aria-label="Catalog view"
        >
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            aria-pressed={viewMode === 'grid'}
            aria-label="Show products as a grid"
            className={`rounded-md p-1.5 transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[var(--panel)] text-[var(--ink)] border border-[var(--border)]'
                : 'text-[var(--ink4)] hover:text-[var(--ink)]'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            aria-pressed={viewMode === 'list'}
            aria-label="Show products as a list"
            className={`rounded-md p-1.5 transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[var(--panel)] text-[var(--ink)] border border-[var(--border)]'
                : 'text-[var(--ink4)] hover:text-[var(--ink)]'
            }`}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
