import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CatalogViewMode, Product, ProductFilters } from './types/product';
import { INVENTORY_UPDATED_EVENT, InventoryService } from './services/inventoryService';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryFilter } from './components/CategoryFilter';
import { StockFilterBar } from './components/StockFilterBar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { WhatsAppCart } from './components/WhatsAppCart';
import { StoreInfoModal } from './components/StoreInfoModal';
import { LoginModal } from './components/LoginModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { JoinLoyaltyModal } from './components/JoinLoyaltyModal';
import { Footer } from './components/Footer';
import { PackageSearch, ShieldCheck, RefreshCw } from 'lucide-react';

const INITIAL_FILTERS: ProductFilters = {
  search: '',
  category: 'All',
  brand: 'All',
  inStockOnly: false,
  sortBy: 'featured',
};

const VIEW_MODE_STORAGE_KEY = 'jmart_catalog_view_mode_v1';

function MainAppContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>(INITIAL_FILTERS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isStoreInfoOpen, setIsStoreInfoOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [inventorySavedAt, setInventorySavedAt] = useState<Date | null>(null);
  const [inventorySource, setInventorySource] = useState('bundled-fallback');
  const inventoryRequestInFlight = useRef(false);
  const [viewMode, setViewMode] = useState<CatalogViewMode>(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      return saved === 'list' ? 'list' : 'grid';
    } catch {
      return 'grid';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    } catch {}
  }, [viewMode]);

  const inventorySourceLabel = {
    'live-api': 'Synchronized with live till inventory',
    'exported-feed': 'Displaying latest store catalogue',
    cached: 'Local cache · offline backup available',
    'bundled-fallback': 'Starter catalogue · reconnecting to store tills…',
  }[inventorySource] || 'Displaying store catalogue';

  const inventorySourceDot = inventorySource === 'live-api'
    ? 'bg-[var(--ok)]'
    : inventorySource === 'cached' || inventorySource === 'bundled-fallback'
      ? 'bg-[var(--warn)]'
      : 'bg-[var(--accent)]';

  const inventorySourceDetail = inventorySource === 'cached' && inventorySavedAt
    ? ` · saved ${inventorySavedAt.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`
    : '';

  const loadProducts = useCallback(async (isRefresh = false) => {
    if (inventoryRequestInFlight.current) return;
    inventoryRequestInFlight.current = true;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await InventoryService.getProducts();
      setProducts(data);
      window.dispatchEvent(new CustomEvent(INVENTORY_UPDATED_EVENT, { detail: data }));
      setLastUpdated(new Date());
      setInventorySource(InventoryService.getLastSource());
      setInventorySavedAt(InventoryService.getLastSavedAt());
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      inventoryRequestInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Re-check stock after a customer returns to an open tab
  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') loadProducts(true);
    };

    document.addEventListener('visibilitychange', refreshWhenVisible);
    window.addEventListener('focus', refreshWhenVisible);
    return () => {
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.removeEventListener('focus', refreshWhenVisible);
    };
  }, [loadProducts]);

  // Live WebSocket sync with the POS inventory database
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const websocketUrl = import.meta.env.VITE_WS_URL?.trim();

    const connectWs = () => {
      try {
        if (!websocketUrl) return;
        ws = new WebSocket(websocketUrl);

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'STOCK_UPDATED') {
              loadProducts(true);
            }
          } catch {}
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectWs, 5000);
        };
      } catch {
        reconnectTimeout = setTimeout(connectWs, 5000);
      }
    };

    if (websocketUrl) connectWs();

    // Fallback periodic refresh every 15s
    const pollInterval = setInterval(() => {
      loadProducts(true);
    }, 15000);

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
      clearInterval(pollInterval);
    };
  }, [loadProducts]);

  // Derived filtered products list
  const filteredProducts = useMemo(() => {
    return InventoryService.filterProducts(products, filters);
  }, [products, filters]);

  // Derived category list with counts
  const categories = useMemo(() => {
    return InventoryService.getCategories(products);
  }, [products]);

  const brands = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.brand).filter(Boolean) as string[]))
      .sort((a, b) => a.localeCompare(b));
  }, [products]);

  // In-stock products count
  const inStockCount = useMemo(() => {
    return products.filter((p) => (Number(p.stock) || 0) > 0).length;
  }, [products]);

  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query }));
  };

  const handleSelectCategory = (category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="min-h-screen dc-ground flex flex-col text-[var(--ink)] font-sans">
      {/* Navigation Bar */}
      <Navbar
        searchQuery={filters.search}
        onSearchChange={handleSearchChange}
        onOpenStoreInfo={() => setIsStoreInfoOpen(true)}
      />

      {/* Hero Section */}
      <Hero
        totalProductsCount={products.length}
        inStockCount={inStockCount}
        popularCategories={categories.filter((category) => category.name !== 'All').slice(0, 5).map((category) => category.name)}
        onOpenStoreInfo={() => setIsStoreInfoOpen(true)}
        onSelectCategory={handleSelectCategory}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Category Bar */}
        <section aria-label="Product Categories">
          <CategoryFilter
            categories={categories}
            selectedCategory={filters.category}
            onSelectCategory={handleSelectCategory}
          />
        </section>

        {/* Filtering Toolbar */}
        <section aria-label="Catalog Filtering and Sorting">
          <StockFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalFiltered={filteredProducts.length}
            brands={brands}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </section>

        {/* Catalog Grid */}
        <section id="catalog" aria-label="Available Products" className="scroll-mt-28">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
            <p className="font-mono text-[11px] text-[var(--ink3)] tabular-nums" role="status" aria-live="polite">
              {lastUpdated
                ? `Catalog updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Loading latest store inventory…'}
            </p>
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--ink2)]">
                <span className={`h-1.5 w-1.5 rounded-full ${inventorySourceDot}`} />
                {inventorySourceLabel}{inventorySourceDetail}
              </span>
              {inventorySource !== 'live-api' && !loading && (
                <button
                  type="button"
                  onClick={() => loadProducts(true)}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--accent)] hover:underline disabled:opacity-50 cursor-pointer font-bold"
                >
                  <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Check Live</span>
                </button>
              )}
            </div>
          </div>

          {loading ? (
            // Loading skeletons using instrument panel cards
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[var(--panel)] rounded-xl border border-[var(--border)] p-4 space-y-3 animate-pulse"
                >
                  <div className="w-full h-40 bg-[var(--sub)] rounded-lg" />
                  <div className="h-3.5 bg-[var(--sub)] rounded w-3/4" />
                  <div className="h-3 bg-[var(--sub)] rounded w-1/2" />
                  <div className="h-9 bg-[var(--sub)] rounded-lg w-full mt-4" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            // Empty search / filter results
            <div className="bg-[var(--panel)] rounded-xl border border-dashed border-[var(--border2)] p-12 text-center max-w-md mx-auto my-8">
              <div className="w-14 h-14 rounded-xl bg-[var(--sub)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--ink3)] mb-4">
                <PackageSearch className="w-7 h-7 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-bold text-[var(--ink)]">
                No matching products found
              </h3>
              <p className="text-xs text-[var(--ink3)] mt-1.5 leading-relaxed">
                We couldn't find items matching your filters. Try clearing your search query or the "In Stock Only" toggle.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-5 inline-flex items-center gap-1.5 bg-[var(--ink)] text-[var(--panel)] hover:opacity-90 text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            // Products Grid / List
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6' : 'grid grid-cols-1 gap-3'}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setSelectedProduct(p)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </section>

        {/* Live Inventory Transparency & Reservation Rules Banner */}
        <section className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok-line)] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)] block">
                Inventory Policy
              </span>
              <p className="font-bold text-[var(--ink)]">
                Live Till Synchronization & 30-Minute Shelf Hold Guarantee
              </p>
              <p className="text-[var(--ink2)] leading-relaxed">
                Stock counts reflect shelf inventory updated every few seconds. When a Loyalty Member reserves an item, it is locked for 30 minutes before auto-releasing back to our Ramapuram store shelves.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer
        onOpenStoreInfo={() => setIsStoreInfoOpen(true)}
        onRefreshCatalog={() => loadProducts(true)}
        isRefreshing={refreshing}
      />

      {/* Modals & Drawers */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <StoreInfoModal
        isOpen={isStoreInfoOpen}
        onClose={() => setIsStoreInfoOpen(false)}
      />

      <LoginModal />
      <ChangePasswordModal />
      <JoinLoyaltyModal />
      <WhatsAppCart />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <MainAppContent />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
