import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CatalogViewMode, Product, ProductFilters } from './types/product';
import { INVENTORY_UPDATED_EVENT, InventoryService } from './services/inventoryService';
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
    'live-api': 'Connected to live store inventory',
    'exported-feed': 'Showing the latest exported store catalog',
    cached: 'Live connection unavailable · showing last saved catalog',
    'bundled-fallback': 'Store feed unavailable · showing starter catalog',
  }[inventorySource] || 'Using latest available catalog';

  const inventorySourceDot = inventorySource === 'live-api'
    ? 'bg-emerald-500'
    : inventorySource === 'cached' || inventorySource === 'bundled-fallback'
      ? 'bg-amber-500'
      : 'bg-sky-500';

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

  // Re-check stock after a customer returns to an open tab or switches back
  // to the browser window after using WhatsApp or another app.
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

    // Fallback periodic refresh every 15s to keep stock fresh
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
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
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
            <p className="text-slate-500" role="status" aria-live="polite">
              {lastUpdated
                ? `Catalog updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Loading the latest catalog…'}
            </p>
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600">
                <span className={`h-1.5 w-1.5 rounded-full ${inventorySourceDot}`} />
                {inventorySourceLabel}{inventorySourceDetail}
              </span>
              {inventorySource !== 'live-api' && !loading && (
                <button
                  type="button"
                  onClick={() => loadProducts(true)}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 disabled:opacity-50 font-bold cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                  Try live refresh
                </button>
              )}
            </div>
          </div>
          {loading ? (
            // Loading skeletons
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 animate-pulse"
                >
                  <div className="w-full h-44 bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                  <div className="h-8 bg-slate-200 rounded-xl w-full mt-4" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            // Empty search / filter results
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto my-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
                <PackageSearch className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                No products found
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                We couldn’t find any items matching your filters. Try clearing your search or the "In Stock Only" toggle.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-5 inline-flex items-center gap-1.5 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            // Products Grid
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
        <section className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 space-y-0.5">
              <p className="font-extrabold text-emerald-900">
                Live Inventory & 30-Minute Reservation Rules
              </p>
              <p className="text-emerald-800 leading-relaxed">
                Stock counts are visible to all visitors. When a Loyalty Member reserves an item, it is held for 30 minutes before auto-unreserving back to our Ramapuram store shelves.
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
    <AuthProvider>
      <CartProvider>
        <MainAppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
