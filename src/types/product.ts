export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  mrp?: number;
  discountPercent?: number;
  stock: number;
  lowStockThreshold?: number;
  uom?: string;
  status: string;
  description?: string;
  imageUrl?: string;
  isPopular?: boolean;
  tags?: string[];
  lastUpdated?: string;
}

export type StockStatusType = 'in_stock' | 'low_stock' | 'out_of_stock';
export type CatalogViewMode = 'grid' | 'list';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ProductFilters {
  search: string;
  category: string;
  brand: string;
  inStockOnly: boolean;
  sortBy: 'featured' | 'price_asc' | 'price_desc' | 'name' | 'stock_desc';
}

export interface StoreConfig {
  name: string;
  tagline: string;
  description: string;
  address: string;
  cityStateZip: string;
  phone: string;
  whatsappNumber: string; // international format without + or spaces, e.g. 919876543210
  email: string;
  mapsUrl: string;
  openingHours: {
    weekdays: string;
    weekends: string;
    statusText: string; // e.g. "Open Today until 9:30 PM"
    weekdayOpenMinutes?: number;
    weekdayCloseMinutes?: number;
    weekendOpenMinutes?: number;
    weekendCloseMinutes?: number;
  };
  features: {
    enableWhatsAppOrder: boolean;
    showExactStockCount: boolean; // if true shows "12 items left", if false shows "In Stock" / "Low Stock"
    enableInStorePickup: boolean;
    currencySymbol: string;
  };
}
