import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product } from '../types/product';
import { Coupon } from '../types/customer';
import { STORE_CONFIG } from '../config/storeConfig';
import { INVENTORY_UPDATED_EVENT, InventoryService } from '../services/inventoryService';
import { useAuth } from './AuthContext';
import { apiUrl, fetchWithTimeout } from '../services/apiClient';

const RESERVATION_LIMIT_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

export interface ActiveReservationItem {
  id: string;
  sku?: string;
  name: string;
  price: number;
  quantity: number;
  uom?: string;
  product: Product;
}

export interface ActiveReservation {
  reservationId: string;
  otp: string;
  expiresAt: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  items: ActiveReservationItem[];
  customerName: string;
  customerPhone?: string;
}

export const normalizeReservation = (raw: any): ActiveReservation | null => {
  if (!raw || !raw.reservationId) return null;
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const items: ActiveReservationItem[] = rawItems.map((item: any) => {
    const id = String(item.product?.id || item.id || '');
    const sku = String(item.product?.sku || item.sku || id);
    const name = String(item.product?.name || item.name || 'Product');
    const price = Number(item.product?.price ?? item.price ?? 0);
    const quantity = Math.max(1, Number(item.quantity || 1));
    const uom = String(item.product?.uom || item.uom || 'PCS');
    const imageUrl = item.product?.imageUrl || item.imageUrl || '';

    return {
      id,
      sku,
      name,
      price,
      quantity,
      uom,
      product: {
        id,
        sku,
        name,
        price,
        uom,
        imageUrl,
        stock: item.product?.stock ?? 10,
        category: item.product?.category || 'Grocery',
      }
    };
  });

  return {
    reservationId: String(raw.reservationId || ''),
    otp: String(raw.otp || ''),
    expiresAt: String(raw.expiresAt || ''),
    subtotal: Number(raw.subtotal || 0),
    discountAmount: Number(raw.discountAmount || 0),
    total: Number(raw.total || 0),
    items,
    customerName: String(raw.customerName || ''),
    customerPhone: raw.customerPhone ? String(raw.customerPhone) : undefined,
  };
};

const isReservationStillActive = (reservation: ActiveReservation | null): reservation is ActiveReservation => {
  if (!reservation?.expiresAt) return false;
  const expiry = new Date(reservation.expiresAt).getTime();
  return Number.isFinite(expiry) && expiry > Date.now();
};

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product, quantity?: number) => boolean;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  totalMrp: number;
  savings: number;
  finalTotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  // Reservation 30m timer properties
  reservationExpiresAt: number | null;
  remainingSeconds: number;
  formattedTimeRemaining: string;
  hasExpiredNotice: boolean;
  dismissExpiredNotice: () => void;
  inventoryChangeNotice: string | null;
  dismissInventoryChangeNotice: () => void;
  generateWhatsAppLink: (customerName?: string, pickupTime?: string) => string;
  // Customer-scoped Live POS Reservation & OTP State
  activeReservation: ActiveReservation | null;
  isSubmittingReservation: boolean;
  openReservationModal: () => void;
  submitReservation: (pickupTime?: string) => Promise<{
    success: boolean;
    error?: string;
    otp?: string;
    reservationId?: string;
  }>;
  cancelReservation: () => Promise<{ success: boolean; error?: string }>;
  isCancellingReservation: boolean;
  hasReservedProduct: (productId: string) => boolean;
  getReservedProductQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, currentCustomer, openLoginModal } = useAuth();

  // Helper to generate a storage key strictly scoped to the logged in customer
  const getCustomerKey = useCallback(
    (prefix: string) => {
      if (!currentCustomer?.name) return null;
      const sanitized = currentCustomer.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      return `${prefix}_${sanitized}`;
    },
    [currentCustomer?.name]
  );

  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasExpiredNotice, setHasExpiredNotice] = useState(false);
  const [inventoryChangeNotice, setInventoryChangeNotice] = useState<string | null>(null);

  // Active confirmed reservation with 4-digit OTP strictly for this customer
  const [activeReservation, setActiveReservation] = useState<ActiveReservation | null>(null);
  const [isSubmittingReservation, setIsSubmittingReservation] = useState(false);

  // Reservation expiry timestamp for pending unconfirmed cart items
  const [reservationExpiresAt, setReservationExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Scope cart & active reservation to the logged-in customer; clear if logged out
  useEffect(() => {
    let isMounted = true;

    if (!currentCustomer) {
      // Logged out: strictly empty memory so no one else sees this data
      setItems([]);
      setActiveReservation(null);
      setAppliedCoupon(null);
      setReservationExpiresAt(null);
      return;
    }

    const cartKey = getCustomerKey('jmart_cart');
    const resKey = getCustomerKey('jmart_res');
    const expKey = getCustomerKey('jmart_exp');

    // 1. Load this customer's saved cart items
    if (cartKey) {
      try {
        const savedCart = localStorage.getItem(cartKey);
        if (isMounted) setItems(savedCart ? JSON.parse(savedCart) : []);
      } catch {
        if (isMounted) setItems([]);
      }
    }

    // 2. Load this customer's expiry
    if (expKey) {
      try {
        const savedExp = localStorage.getItem(expKey);
        if (savedExp) {
          const timestamp = parseInt(savedExp, 10);
          if (timestamp > Date.now()) {
            if (isMounted) setReservationExpiresAt(timestamp);
          } else {
            if (isMounted) setReservationExpiresAt(null);
          }
        }
      } catch {
        if (isMounted) setReservationExpiresAt(null);
      }
    }

    // 3. Load this customer's active reservation from localStorage
    if (resKey) {
      try {
        const savedRes = localStorage.getItem(resKey);
        if (savedRes) {
          const parsed = normalizeReservation(JSON.parse(savedRes));
          if (parsed && new Date(parsed.expiresAt).getTime() > Date.now()) {
            if (isMounted) setActiveReservation(parsed);
          } else {
            if (isMounted) setActiveReservation(null);
            localStorage.removeItem(resKey);
          }
        } else {
          if (isMounted) setActiveReservation(null);
        }
      } catch {
        if (isMounted) setActiveReservation(null);
      }
    }

    // 4. Also fetch from server to guarantee sync with store POS
    const customerNameToFetch = currentCustomer.name;
    const fetchMyReservation = async () => {
      try {
        const res = await fetchWithTimeout(
          apiUrl(`/api/reservations/my-reservation?customerName=${encodeURIComponent(customerNameToFetch)}`)
        , undefined, 8000);
        if (!isMounted) return;
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;
          if (data.activeReservation) {
            const normalized = normalizeReservation(data.activeReservation);
            if (isReservationStillActive(normalized)) {
              if (isMounted) setActiveReservation(normalized);
              if (resKey) {
                localStorage.setItem(resKey, JSON.stringify(normalized));
              }
            } else {
              if (isMounted) setActiveReservation(null);
              if (resKey) localStorage.removeItem(resKey);
            }
          } else {
            if (isMounted) setActiveReservation(null);
            if (resKey) localStorage.removeItem(resKey);
          }
        }
      } catch {}
    };

    fetchMyReservation();
    const reservationRefreshInterval = setInterval(fetchMyReservation, 15000);

    return () => {
      isMounted = false;
      clearInterval(reservationRefreshInterval);
    };
  }, [currentCustomer, getCustomerKey]);

  // Keep the open reservation bag aligned with the latest shared inventory
  // snapshot loaded by the catalog. The billing API remains the authority at
  // submit time; this only prevents stale prices and quantities in the UI.
  useEffect(() => {
    const handleInventoryUpdate = (event: Event) => {
      const latestProducts = (event as CustomEvent<Product[]>).detail;
      if (!Array.isArray(latestProducts) || latestProducts.length === 0) return;

      const byId = new Map(latestProducts.map((product) => [product.id, product]));
      const bySku = new Map(latestProducts.filter((product) => product.sku).map((product) => [product.sku, product]));
      let removedCount = 0;
      let adjustedCount = 0;
      let productDataChanged = false;

      const nextItems: CartItem[] = [];
      items.forEach((item) => {
        const latest = byId.get(item.product.id) || bySku.get(item.product.sku);
        const latestStock = Number(latest?.stock) || 0;

        if (!latest || latestStock <= 0) {
          removedCount += 1;
          return;
        }

        const nextQuantity = Math.min(item.quantity, latestStock);
        if (nextQuantity !== item.quantity) adjustedCount += 1;
        if (
          latest.name !== item.product.name ||
          latest.price !== item.product.price ||
          latest.stock !== item.product.stock
        ) {
          productDataChanged = true;
        }
        nextItems.push({ product: latest, quantity: nextQuantity });
      });

      if (removedCount > 0 || adjustedCount > 0 || productDataChanged) {
        setItems(nextItems);
      }

      if (removedCount > 0 || adjustedCount > 0) {
        const changes: string[] = [];
        if (removedCount > 0) changes.push(`${removedCount} item${removedCount === 1 ? '' : 's'} removed`);
        if (adjustedCount > 0) changes.push(`${adjustedCount} quantity adjusted`);
        setInventoryChangeNotice(`Live stock changed: ${changes.join(' and ')}. Please review your reservation list.`);
      }
    };

    window.addEventListener(INVENTORY_UPDATED_EVENT, handleInventoryUpdate);
    return () => window.removeEventListener(INVENTORY_UPDATED_EVENT, handleInventoryUpdate);
  }, [items]);

  // Auto unreserve handler for held unconfirmed items
  const handleAutoUnreserve = useCallback(() => {
    setItems([]);
    setReservationExpiresAt(null);
    setAppliedCoupon(null);
    const cartKey = getCustomerKey('jmart_cart');
    const expKey = getCustomerKey('jmart_exp');
    if (cartKey) localStorage.removeItem(cartKey);
    if (expKey) localStorage.removeItem(expKey);
    setHasExpiredNotice(true);
  }, [getCustomerKey]);

  // 30-minute reservation countdown timer ticker
  useEffect(() => {
    if (!reservationExpiresAt || items.length === 0) {
      setRemainingSeconds(0);
      return;
    }

    const updateTimer = () => {
      const diff = reservationExpiresAt - Date.now();
      if (diff <= 0) {
        handleAutoUnreserve();
      } else {
        setRemainingSeconds(Math.ceil(diff / 1000));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [reservationExpiresAt, items.length, handleAutoUnreserve]);

  // Sync items to customer-specific storage
  useEffect(() => {
    const key = getCustomerKey('jmart_cart');
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {}
  }, [items, getCustomerKey]);

  // Sync expiry to customer-specific storage
  useEffect(() => {
    const key = getCustomerKey('jmart_exp');
    if (!key) return;
    try {
      if (reservationExpiresAt && items.length > 0) {
        localStorage.setItem(key, reservationExpiresAt.toString());
      } else {
        localStorage.removeItem(key);
      }
    } catch {}
  }, [reservationExpiresAt, items.length, getCustomerKey]);

  // Sync active reservation to customer-specific storage
  useEffect(() => {
    const key = getCustomerKey('jmart_res');
    if (!key) return;
    try {
      if (activeReservation) {
        localStorage.setItem(key, JSON.stringify(activeReservation));
      } else {
        localStorage.removeItem(key);
      }
    } catch {}
  }, [activeReservation, getCustomerKey]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);
  const dismissExpiredNotice = () => setHasExpiredNotice(false);
  const dismissInventoryChangeNotice = () => setInventoryChangeNotice(null);

  const openReservationModal = () => {
    setIsOpen(true);
  };

  // Checks if the CURRENT logged in customer has reserved this product
  const hasReservedProduct = useCallback(
    (productId: string): boolean => {
      if (!currentCustomer || !activeReservation?.items) return false;
      return activeReservation.items.some((item: any) => {
        const id = item?.product?.id || item?.id;
        const sku = item?.product?.sku || item?.sku;
        return id === productId || sku === productId;
      });
    },
    [currentCustomer, activeReservation]
  );

  // Gets the quantity of this product reserved by the CURRENT customer
  const getReservedProductQuantity = useCallback(
    (productId: string): number => {
      if (!currentCustomer || !activeReservation?.items) return 0;
      const found: any = activeReservation.items.find((item: any) => {
        const id = item?.product?.id || item?.id;
        const sku = item?.product?.sku || item?.sku;
        return id === productId || sku === productId;
      });
      return found ? (Number(found.quantity) || 0) : 0;
    },
    [currentCustomer, activeReservation]
  );

  // addToCart is protected: only logged in loyalty customers can reserve!
  const addToCart = (product: Product, quantity: number = 1): boolean => {
    if (!isAuthenticated) {
      openLoginModal(
        `Please log in with your J MART Loyalty account to reserve "${product.name}". Live stock can be viewed freely without login.`
      );
      return false;
    }

    if (product.stock <= 0) return false;

    // Start 30-minute timer if not already active or if cart was empty
    if (!reservationExpiresAt || items.length === 0) {
      setReservationExpiresAt(Date.now() + RESERVATION_LIMIT_MS);
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const newQty = Math.min(product.stock, currentQty + quantity);
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      } else {
        const initialQty = Math.min(product.stock, quantity);
        return [...prev, { product, quantity: initialQty }];
      }
    });

    setIsOpen(true);
    return true;
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxAllowed = Math.max(1, item.product.stock || 1);
          return { ...item, quantity: Math.min(quantity, maxAllowed) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.product.id !== productId);
      if (updated.length === 0) {
        setReservationExpiresAt(null);
        setAppliedCoupon(null);
      }
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    setReservationExpiresAt(null);
    setAppliedCoupon(null);
  };

  const applyCoupon = (coupon: Coupon) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalMrp = items.reduce((sum, item) => sum + (item.product.mrp || item.product.price) * item.quantity, 0);
  const baseSavings = Math.max(0, totalMrp - subtotal);
  const couponDiscount = appliedCoupon ? Math.min(subtotal, appliedCoupon.discountAmount) : 0;
  const finalTotal = Math.max(0, subtotal - couponDiscount);
  const savings = baseSavings + couponDiscount;

  // Format remaining seconds into MM:SS
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTimeRemaining = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  /**
   * Submits the reservation directly to the LAN bill counter database & cashier chatbox,
   * locks the stock in SQLite, generates a 4-digit customer pickup OTP, and opens the OTP modal.
   */
  const submitReservation = async (
    pickupTime?: string
  ): Promise<{ success: boolean; error?: string; otp?: string; reservationId?: string }> => {
    if (!isAuthenticated || !currentCustomer) {
      openLoginModal('Please sign in with your J MART Loyalty account to reserve items.');
      return { success: false, error: 'Customer login required' };
    }

    if (items.length === 0) {
      return { success: false, error: 'Your reservation bag is empty.' };
    }

    setIsSubmittingReservation(true);

    try {
      const payload = {
        customerName: currentCustomer.name,
        customerPhone: currentCustomer.phone,
        items: items.map((i) => ({
          id: i.product.id,
          sku: i.product.sku,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          uom: i.product.uom || 'PCS',
        })),
        couponCode: appliedCoupon?.code || null,
        discountAmount: couponDiscount,
        pickupTime: pickupTime?.trim() || null,
      };

      const endpoints = [apiUrl('/api/reservations')];
      let resData: any = null;
      let lastError = 'Failed to connect to billing server.';

      for (const ep of endpoints) {
        try {
          const res = await fetchWithTimeout(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }, 12000);

          const data = await res.json();
          if (res.ok && data.success) {
            resData = data;
            break;
          } else if (data.error) {
            lastError = data.error;
          }
        } catch (err: any) {
          lastError = err.message || lastError;
        }
      }

      if (!resData) {
        throw new Error(lastError);
      }

      const confirmedReservation: ActiveReservation = normalizeReservation({
        reservationId: resData.reservationId,
        otp: resData.otp,
        expiresAt: resData.expiresAt,
        subtotal: resData.subtotal || subtotal,
        discountAmount: resData.discountAmount ?? couponDiscount,
        total: resData.total || finalTotal,
        // The billing API re-validates product identity, price, quantity, and
        // stock inside its transaction. Use those accepted lines for the OTP
        // confirmation instead of the pre-submit browser snapshot.
        items: Array.isArray(resData.items) && resData.items.length > 0 ? resData.items : [...items],
        customerName: currentCustomer.name,
        customerPhone: currentCustomer.phone,
      })!;

      setActiveReservation(confirmedReservation);
      const resKey = getCustomerKey('jmart_res');
      if (resKey) {
        try {
          localStorage.setItem(resKey, JSON.stringify(confirmedReservation));
        } catch {}
      }

      // Clear bag for this customer
      setItems([]);
      setAppliedCoupon(null);
      setReservationExpiresAt(null);
      const cartKey = getCustomerKey('jmart_cart');
      const expKey = getCustomerKey('jmart_exp');
      if (cartKey) localStorage.removeItem(cartKey);
      if (expKey) localStorage.removeItem(expKey);

      // Keep cart drawer open so the OTP and reservation details are visible directly in the cart itself!
      setIsOpen(true);

      return {
        success: true,
        otp: resData.otp,
        reservationId: resData.reservationId,
      };
    } catch (err: any) {
      console.error('[Submit Reservation Failed]:', err);
      return {
        success: false,
        error: err.message || 'Unable to complete reservation at this time.',
      };
    } finally {
      setIsSubmittingReservation(false);
    }
  };

  const [isCancellingReservation, setIsCancellingReservation] = useState(false);

  /**
   * Cancels the active reservation, immediately returns the reserved items
   * back to the SQLite inventory in retail.db, and broadcasts stock update.
   */
  const cancelReservation = async (): Promise<{ success: boolean; error?: string }> => {
    if (!activeReservation?.reservationId) {
      return { success: false, error: 'No active reservation to cancel.' };
    }

    setIsCancellingReservation(true);
    try {
      const endpoints = [
        apiUrl(`/api/reservations/${activeReservation.reservationId}/cancel`),
      ];

      let success = false;
      let lastError = 'Failed to connect to server.';

      for (const ep of endpoints) {
        try {
          const res = await fetchWithTimeout(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reservationId: activeReservation.reservationId,
              customerName: currentCustomer?.name,
              reason: 'Cancelled by customer from reservation cart',
            }),
          }, 12000);
          const data = await res.json();
          if (res.ok && data.success) {
            success = true;
            break;
          } else if (data.error) {
            lastError = data.error;
          }
        } catch (err: any) {
          lastError = err.message || lastError;
        }
      }

      if (!success) {
        throw new Error(lastError);
      }

      // Clear customer reservation from state and localStorage
      const resKey = getCustomerKey('jmart_res');
      if (resKey) localStorage.removeItem(resKey);
      setActiveReservation(null);

      // Trigger catalog refresh so stock immediately returns to store catalog
      try {
        await InventoryService.getProducts();
      } catch {}

      return { success: true };
    } catch (err: any) {
      console.error('[Cancel Reservation Failed]:', err);
      return { success: false, error: err.message || 'Failed to cancel reservation.' };
    } finally {
      setIsCancellingReservation(false);
    }
  };

  const generateWhatsAppLink = (customerName?: string, pickupTime?: string): string => {
    const nameToUse = customerName?.trim() || currentCustomer?.name || 'Customer';
    const lines: string[] = [];

    lines.push(`👋 *Hello ${STORE_CONFIG.name}!*`);
    lines.push(`I have reserved the following items from your live in-store catalog:`);
    lines.push(``);

    items.forEach((item, index) => {
      const p = item.product;
      const unit = p.uom ? ` (${p.uom})` : '';
      lines.push(
        `${index + 1}. *${p.name}* x ${item.quantity}${unit} — ${STORE_CONFIG.features.currencySymbol}${p.price * item.quantity}`
      );
    });

    lines.push(``);
    lines.push(`*Estimated Subtotal:* ${STORE_CONFIG.features.currencySymbol}${subtotal}`);
    if (appliedCoupon) {
      lines.push(`*Redeemed Coupon (${appliedCoupon.code}):* -${STORE_CONFIG.features.currencySymbol}${couponDiscount}`);
    }
    lines.push(`*Final Total Payable at Counter:* ${STORE_CONFIG.features.currencySymbol}${finalTotal}`);

    if (savings > 0) {
      lines.push(`*Total Savings vs MRP:* ${STORE_CONFIG.features.currencySymbol}${savings}`);
    }

    lines.push(``);
    lines.push(`*Loyalty Member:* ${nameToUse} (${currentCustomer?.tier || 'Member'} Tier)`);
    if (currentCustomer?.phone) {
      lines.push(`*Registered Phone:* ${currentCustomer.phone}`);
    }
    if (pickupTime?.trim()) {
      lines.push(`*Estimated Pickup Time:* ${pickupTime.trim()}`);
    }

    lines.push(`*Hold Status:* 30-Minute Reservation Active`);
    lines.push(``);
    lines.push(`Please keep this order ready at the express counter. Thank you!`);

    const encoded = encodeURIComponent(lines.join('\n'));
    return `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encoded}`;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        totalMrp,
        savings,
        finalTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        reservationExpiresAt,
        remainingSeconds,
        formattedTimeRemaining,
        hasExpiredNotice,
        dismissExpiredNotice,
        inventoryChangeNotice,
        dismissInventoryChangeNotice,
        generateWhatsAppLink,
        activeReservation,
        isSubmittingReservation,
        openReservationModal,
        submitReservation,
        cancelReservation,
        isCancellingReservation,
        hasReservedProduct,
        getReservedProductQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
