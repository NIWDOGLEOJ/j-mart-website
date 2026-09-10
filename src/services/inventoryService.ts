import { Product, ProductFilters, StockStatusType } from '../types/product';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { apiUrl, fetchWithTimeout } from './apiClient';

export const INVENTORY_UPDATED_EVENT = 'jmart:inventory-updated';

const STORAGE_KEY = 'nexusmart_inventory_cache_v1';

interface InventoryCachePayload {
  products: Product[];
  savedAt: string;
}

export class InventoryService {
  private static lastSource: 'live-api' | 'exported-feed' | 'cached' | 'bundled-fallback' = 'bundled-fallback';
  private static lastSavedAt: Date | null = null;

  static getLastSource() {
    return this.lastSource;
  }

  static getLastSavedAt() {
    return this.lastSavedAt;
  }

  /**
   * Fetches the latest products catalog.
   * Priority:
   * 1. If VITE_INVENTORY_API_URL is configured, fetches from live API.
   * 2. Else tries to fetch /inventory.json from public folder.
   * 3. Falls back to localStorage or INITIAL_PRODUCTS.
   */
  static async getProducts(): Promise<Product[]> {
    const configuredInventoryUrl = import.meta.env.VITE_INVENTORY_API_URL?.trim();
    const endpoints = [
      ...(configuredInventoryUrl ? [configuredInventoryUrl] : []),
      apiUrl('/api/products/public'),
      '/inventory.json',
    ].filter((endpoint, index, all) => all.indexOf(endpoint) === index);

    const initialMap = new Map<string, Product>();
    INITIAL_PRODUCTS.forEach((p) => {
      if (p.id) initialMap.set(p.id, p);
      if (p.sku) initialMap.set(p.sku, p);
      if (p.name) initialMap.set(p.name.toLowerCase().trim(), p);
    });

    for (const endpoint of endpoints) {
      try {
        const res = await fetchWithTimeout(endpoint, { cache: 'no-store' }, 8000);
        if (res.ok) {
          const payload = await res.json();
          const rawProducts = Array.isArray(payload) ? payload : payload?.products;
          if (Array.isArray(rawProducts) && rawProducts.length > 0) {
            const enriched: Product[] = rawProducts.map((raw: any) => {
              const matched =
                initialMap.get(raw.id) ||
                initialMap.get(raw.sku) ||
                initialMap.get((raw.name || '').toLowerCase().trim());

              const resolvedImageUrl = (raw.image_url || raw.imageUrl || '').trim();
              return {
                id: String(raw.id),
                sku: String(raw.sku || raw.id),
                name: raw.name,
                category: raw.category || matched?.category || 'General',
                brand: raw.brand || matched?.brand || 'J MART',
                price: Number(raw.price) || 0,
                mrp: Number(raw.mrp) || matched?.mrp || Number(raw.price) || 0,
                discountPercent: Number(raw.discount_percent || raw.discountPercent) || matched?.discountPercent || 0,
                stock: Number(raw.stock) || 0,
                lowStockThreshold: Number(raw.low_stock_threshold || raw.lowStockThreshold) || matched?.lowStockThreshold || 5,
                uom: raw.uom || matched?.uom || 'PCS',
                status: raw.status || matched?.status || 'Active',
                description: matched?.description || `Fresh high quality ${raw.name} available at J MART Ramapuram store counter.`,
                imageUrl: resolvedImageUrl
                  ? (resolvedImageUrl.startsWith('http') || resolvedImageUrl.startsWith('data:') ? resolvedImageUrl : apiUrl(resolvedImageUrl))
                  : (matched?.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'),
                isPopular: matched?.isPopular ?? false,
                tags: matched?.tags || [raw.category?.toLowerCase() || 'general'],
              };
            });

            this.saveToCache(enriched);
            this.lastSource = endpoint.includes('/inventory.json') ? 'exported-feed' : 'live-api';
            return enriched;
          }
        }
      } catch (err) {
        // Try next fallback endpoint
      }
    }

    // Fallback to cached products
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Read both the current timestamped cache and the older array format.
        const cachedProducts = Array.isArray(parsed) ? parsed : parsed?.products;
        if (Array.isArray(cachedProducts) && cachedProducts.length > 0) {
          this.lastSource = 'cached';
          const savedAt = Array.isArray(parsed) ? null : new Date(parsed?.savedAt);
          this.lastSavedAt = savedAt && !Number.isNaN(savedAt.getTime()) ? savedAt : null;
          return cachedProducts;
        }
      }
    } catch {}

    this.lastSource = 'bundled-fallback';
    this.lastSavedAt = null;
    return INITIAL_PRODUCTS;
  }

  static saveToCache(products: Product[]): void {
    try {
      const payload: InventoryCachePayload = {
        products,
        savedAt: new Date().toISOString(),
      };
      this.lastSavedAt = new Date(payload.savedAt);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }

  /**
   * Computes stock status helper details
   */
  static getStockStatus(product: Product): {
    type: StockStatusType;
    label: string;
    badgeClass: string;
    pillBg: string;
    dotClass: string;
    canOrder: boolean;
  } {
    const threshold = product.lowStockThreshold ?? 5;
    const stock = Number(product.stock) || 0;

    if (stock <= 0) {
      return {
        type: 'out_of_stock',
        label: 'Out of Stock',
        badgeClass: 'text-rose-700 bg-rose-50 border-rose-200',
        pillBg: 'bg-rose-100 text-rose-800',
        dotClass: 'bg-rose-500',
        canOrder: false,
      };
    }

    if (stock <= threshold) {
      return {
        type: 'low_stock',
        label: `Low Stock (${stock} left)`,
        badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
        pillBg: 'bg-amber-100 text-amber-800',
        dotClass: 'bg-amber-500 animate-pulse',
        canOrder: true,
      };
    }

    return {
      type: 'in_stock',
      label: 'In Stock',
      badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      pillBg: 'bg-emerald-100 text-emerald-800',
      dotClass: 'bg-emerald-500',
      canOrder: true,
    };
  }

  /**
   * Filter and sort products according to user query
   */
  static filterProducts(products: Product[], filters: ProductFilters): Product[] {
    return products
      .filter((p) => {
        // Search filter
        if (filters.search.trim()) {
          const query = filters.search.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(query);
          const matchSku = p.sku?.toLowerCase().includes(query);
          const matchCategory = p.category?.toLowerCase().includes(query);
          const matchBrand = p.brand?.toLowerCase().includes(query);
          const matchTags = p.tags?.some((t) => t.toLowerCase().includes(query));

          if (!matchName && !matchSku && !matchCategory && !matchBrand && !matchTags) {
            return false;
          }
        }

        // Category filter
        if (filters.category && filters.category !== 'All') {
          if (p.category !== filters.category) return false;
        }

        // Brand filter
        if (filters.brand && filters.brand !== 'All') {
          if (p.brand !== filters.brand) return false;
        }

        // In Stock Only toggle
        if (filters.inStockOnly) {
          if ((Number(p.stock) || 0) <= 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price_asc') return a.price - b.price;
        if (filters.sortBy === 'price_desc') return b.price - a.price;
        if (filters.sortBy === 'name') return a.name.localeCompare(b.name);
        if (filters.sortBy === 'stock_desc') return (b.stock || 0) - (a.stock || 0);
        // default featured / popular
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return 0;
      });
  }

  /**
   * Extract distinct categories with product count
   */
  static getCategories(products: Product[]): { name: string; count: number }[] {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const list = Object.entries(counts).map(([name, count]) => ({ name, count }));
    list.sort((a, b) => b.count - a.count);
    return [{ name: 'All', count: products.length }, ...list];
  }

  /**
   * Returns a suitable image for the product, falling back to rich category photography
   */
  static getProductImage(product: Product): string {
    if (product.imageUrl) return product.imageUrl;

    const cat = (product.category || '').toLowerCase();
    const name = (product.name || '').toLowerCase();

    if (cat.includes('dairy') || cat.includes('egg') || name.includes('milk') || name.includes('butter') || name.includes('paneer')) {
      return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80';
    }
    if (cat.includes('bakery') || name.includes('bread') || name.includes('bun') || name.includes('cake')) {
      return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80';
    }
    if (cat.includes('beverage') || name.includes('tea') || name.includes('coffee') || name.includes('juice')) {
      return 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80';
    }
    if (cat.includes('cook') || cat.includes('oil') || name.includes('oil') || name.includes('ghee')) {
      return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80';
    }
    if (cat.includes('staple') || cat.includes('grain') || name.includes('rice') || name.includes('dal') || name.includes('atta')) {
      return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
    }
    if (cat.includes('snack') || cat.includes('biscuit') || name.includes('chips') || name.includes('cookie') || name.includes('chocolate')) {
      return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80';
    }
    if (cat.includes('personal') || cat.includes('care') || name.includes('soap') || name.includes('shampoo') || name.includes('paste')) {
      return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80';
    }
    if (cat.includes('house') || cat.includes('clean') || name.includes('detergent') || name.includes('dishwash')) {
      return 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?auto=format&fit=crop&w=600&q=80';
    }

    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
  }
}
