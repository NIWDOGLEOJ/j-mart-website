import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoyaltyCustomer } from '../types/customer';
import { INITIAL_CUSTOMERS } from '../data/initialCustomers';
import { apiUrl, fetchWithTimeout } from '../services/apiClient';

interface AuthContextType {
  currentCustomer: LoyaltyCustomer | null;
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  isChangePasswordModalOpen: boolean;
  isJoinModalOpen: boolean;
  loginRedirectReason: string | null;
  openLoginModal: (reason?: string) => void;
  closeLoginModal: () => void;
  openChangePasswordModal: () => void;
  closeChangePasswordModal: () => void;
  openJoinModal: () => void;
  closeJoinModal: () => void;
  login: (name: string, passwordAttempt: string) => { success: boolean; error?: string };
  changePassword: (newPassword: string) => { success: boolean; error?: string };
  registerWithPayment: (name: string, phone: string, txnId: string) => { success: boolean; error?: string };
  useCoupon: (code: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_CUSTOMERS_KEY = 'jmart_loyalty_members_v1';
const STORAGE_CURRENT_USER_KEY = 'jmart_current_user_v1';

const normalizeCustomerPhone = (phone: string): string => {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
};

const sanitizeCustomerCoupons = (c: LoyaltyCustomer): LoyaltyCustomer => ({
  ...c,
  coupons: Array.isArray(c.coupons) ? c.coupons.filter(cpn => !cpn.isUsed) : []
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOMERS_KEY);
      const parsed = saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
      return Array.isArray(parsed) ? parsed.map(sanitizeCustomerCoupons) : INITIAL_CUSTOMERS.map(sanitizeCustomerCoupons);
    } catch {
      return INITIAL_CUSTOMERS.map(sanitizeCustomerCoupons);
    }
  });

  const [currentCustomer, setCurrentCustomer] = useState<LoyaltyCustomer | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      return parsed ? sanitizeCustomerCoupons(parsed) : null;
    } catch {
      return null;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [loginRedirectReason, setLoginRedirectReason] = useState<string | null>(null);

  // Sync customers to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(customers));
    } catch {}
  }, [customers]);

  // Merge the sanitized store customer feed without changing the existing
  // name/password login method. Remote loyalty totals can update, while a
  // password changed on this website and locally-held coupons are preserved.
  useEffect(() => {
    const customerFeedUrl = import.meta.env.VITE_CUSTOMER_FEED_URL?.trim() || '/loyalty-customers.json';
    const identityKey = (customer: LoyaltyCustomer) => {
      const phone = normalizeCustomerPhone(customer.phone);
      return phone ? `phone:${phone}` : `name:${customer.name.toLowerCase().trim()}`;
    };

    let requestInFlight = false;

    const syncCustomerFeed = async () => {
      if (requestInFlight) return;
      requestInFlight = true;

      try {
        const res = await fetchWithTimeout(customerFeedUrl, { cache: 'no-store' }, 8000);
        if (!res.ok) return;
        const data = await res.json();
        const customerRows = Array.isArray(data) ? data : data?.customers;
        if (Array.isArray(customerRows) && customerRows.length > 0) {
          const remoteCustomers = customerRows.filter((customer): customer is LoyaltyCustomer => Boolean(customer?.name));

          setCustomers((prev) => {
            const remoteByIdentity = new Map(remoteCustomers.map((customer) => [identityKey(customer), customer]));
            const merged = prev.map((localCustomer) => {
              const remoteCustomer = remoteByIdentity.get(identityKey(localCustomer));
              if (!remoteCustomer) return localCustomer;

              const mergedCustomer = {
                ...localCustomer,
                ...remoteCustomer,
                // Keep the website's existing password/login behavior intact.
                passwordHash: localCustomer.passwordHash || remoteCustomer.passwordHash,
                mustChangePassword: localCustomer.mustChangePassword ?? remoteCustomer.mustChangePassword,
                coupons: Array.isArray(remoteCustomer.coupons)
                  ? remoteCustomer.coupons.filter((c) => !c.isUsed)
                  : (Array.isArray(localCustomer.coupons) ? localCustomer.coupons.filter((c) => !c.isUsed) : []),
                hasPaidEnrollment: localCustomer.hasPaidEnrollment ?? remoteCustomer.hasPaidEnrollment,
              };
              const changed = Object.entries(mergedCustomer).some(
                ([key, value]) => value !== (localCustomer as unknown as Record<string, unknown>)[key],
              );
              return changed ? mergedCustomer : localCustomer;
            });

            const existingKeys = new Set(prev.map(identityKey));
            // A public feed can update an existing website account, but it
            // cannot provision a new login without an explicit website-side
            // password record. This preserves the current login method and
            // avoids creating unusable or exposed credentials from a feed.
            const newCustomers = remoteCustomers.filter(
              (customer) =>
                !existingKeys.has(identityKey(customer)) &&
                typeof customer.passwordHash === 'string' &&
                customer.passwordHash.trim().length > 0,
            );
            return newCustomers.length > 0 || merged.some((customer, index) => customer !== prev[index])
              ? [...merged, ...newCustomers]
              : prev;
          });

          // Refresh visible loyalty totals for a currently signed-in customer,
          // while preserving their website password and local coupons.
          setCurrentCustomer((current) => {
            if (!current) return current;
            const remote = remoteCustomers.find((customer) => identityKey(customer) === identityKey(current));
            if (!remote) return current;
            const updatedCustomer = {
              ...current,
              ...remote,
              passwordHash: current.passwordHash || remote.passwordHash,
              mustChangePassword: current.mustChangePassword ?? remote.mustChangePassword,
              coupons: Array.isArray(remote.coupons)
                ? remote.coupons.filter((c) => !c.isUsed)
                : (Array.isArray(current.coupons) ? current.coupons.filter((c) => !c.isUsed) : []),
            };
            const changed = Object.entries(updatedCustomer).some(
              ([key, value]) => value !== (current as unknown as Record<string, unknown>)[key],
            );
            return changed ? updatedCustomer : current;
          });
        }
      } catch {
        // Keep the existing local login/customer data when the feed is offline.
      } finally {
        requestInFlight = false;
      }
    };

    syncCustomerFeed();
    const feedRefreshInterval = setInterval(syncCustomerFeed, 60_000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') syncCustomerFeed();
    };
    document.addEventListener('visibilitychange', refreshWhenVisible);
    window.addEventListener('focus', refreshWhenVisible);

    return () => {
      clearInterval(feedRefreshInterval);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.removeEventListener('focus', refreshWhenVisible);
    };
  }, []);

  // Live synchronization of unredeemed coupons with the backend database
  useEffect(() => {
    if (!currentCustomer?.phone) return;
    const phone = normalizeCustomerPhone(currentCustomer.phone);
    if (!phone) return;

    let cancelled = false;
    const fetchActiveCoupons = async () => {
      try {
        const res = await fetchWithTimeout(apiUrl(`/api/coupons?phone=${encodeURIComponent(phone)}`), {}, 5000);
        if (!res.ok) return;
        const liveCoupons = await res.json();
        if (cancelled || !Array.isArray(liveCoupons)) return;

        // Backend only returns unredeemed coupons (WHERE is_redeemed = 0).
        // Once redeemed in store POS or on a bill, the coupon will NOT appear.
        const mappedActive = liveCoupons.map((c: any) => ({
          code: c.code,
          discountAmount: Number(c.discount_amount),
          description: c.description || '',
          isUsed: false,
        }));

        setCurrentCustomer((prev) => {
          if (!prev) return null;
          return { ...prev, coupons: mappedActive };
        });
        setCustomers((prev) =>
          prev.map((c) =>
            normalizeCustomerPhone(c.phone) === phone ? { ...c, coupons: mappedActive } : c
          )
        );
      } catch {
        // Billing API may be on LAN / offline; keep local sanitized state
      }
    };

    fetchActiveCoupons();
    const interval = setInterval(fetchActiveCoupons, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [currentCustomer?.phone]);

  // Sync active user to storage
  useEffect(() => {
    try {
      if (currentCustomer) {
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(currentCustomer));
      } else {
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }
    } catch {}
  }, [currentCustomer]);

  // Keep the existing local login session consistent across tabs. This does
  // not change the name/password login method; it only reflects a login or
  // logout that happened in another open copy of the website.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_CURRENT_USER_KEY) {
        try {
          const parsed = event.newValue ? JSON.parse(event.newValue) : null;
          setCurrentCustomer(
            parsed
              ? { ...parsed, coupons: Array.isArray(parsed.coupons) ? parsed.coupons : [] }
              : null,
          );
        } catch {
          setCurrentCustomer(null);
        }
      }

      if (event.key === STORAGE_CUSTOMERS_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (Array.isArray(parsed)) setCustomers(parsed);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const openLoginModal = (reason?: string) => {
    setLoginRedirectReason(reason || null);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginRedirectReason(null);
  };

  const openChangePasswordModal = () => setIsChangePasswordModalOpen(true);
  const closeChangePasswordModal = () => setIsChangePasswordModalOpen(false);

  const openJoinModal = () => {
    setIsLoginModalOpen(false);
    setIsJoinModalOpen(true);
  };

  const closeJoinModal = () => setIsJoinModalOpen(false);

  const login = (name: string, passwordAttempt: string): { success: boolean; error?: string } => {
    const trimmedName = name.trim().toLowerCase();
    const customer = customers.find((c) => c.name.toLowerCase().trim() === trimmedName);

    if (!customer) {
      return {
        success: false,
        error: `"${name.trim()}" was not found in our Loyalty records. Only previous store customers or enrolled members can log in. You can join by paying ₹100 to receive a ₹100 coupon back!`
      };
    }

    if (passwordAttempt !== customer.passwordHash) {
      return {
        success: false,
        error: 'Incorrect password. Note: If this is your first time logging in, your default password is your full name as registered in the store.'
      };
    }

    const customerWithCoupons: LoyaltyCustomer = {
      ...customer,
      coupons: Array.isArray(customer.coupons) ? customer.coupons : []
    };

    setCurrentCustomer(customerWithCoupons);
    closeLoginModal();

    // Enforce password change on website if first login or default password
    if (customer.mustChangePassword || customer.passwordHash === customer.name) {
      setIsChangePasswordModalOpen(true);
    }

    return { success: true };
  };

  const changePassword = (newPassword: string): { success: boolean; error?: string } => {
    if (!currentCustomer) {
      return { success: false, error: 'No user is currently logged in.' };
    }

    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    if (newPassword.toLowerCase() === currentCustomer.name.toLowerCase()) {
      return { success: false, error: 'Your new password cannot be the same as your name.' };
    }

    const updatedCustomer: LoyaltyCustomer = {
      ...currentCustomer,
      passwordHash: newPassword,
      mustChangePassword: false,
    };

    // Update in state and array
    setCurrentCustomer(updatedCustomer);
    setCustomers((prev) =>
      prev.map((c) => (c.name.toLowerCase() === currentCustomer.name.toLowerCase() ? updatedCustomer : c))
    );

    setIsChangePasswordModalOpen(false);
    return { success: true };
  };

  const registerWithPayment = (name: string, phone: string, _txnId: string): { success: boolean; error?: string } => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedPhone) {
      return { success: false, error: 'Please enter both your full name and phone number.' };
    }

    const existing = customers.find(
      (c) =>
        c.name.toLowerCase() === trimmedName.toLowerCase() ||
        normalizeCustomerPhone(c.phone) === normalizeCustomerPhone(trimmedPhone)
    );

    if (existing) {
      return {
        success: false,
        error: `An account for "${trimmedName}" or phone "${trimmedPhone}" already exists! Please log in using your name as password.`
      };
    }

    const newCustomer: LoyaltyCustomer = {
      name: trimmedName,
      phone: trimmedPhone,
      loyaltyPoints: 50,
      totalSpent: 100,
      tier: 'Bronze',
      passwordHash: trimmedName, // Default initial password is the login name
      mustChangePassword: true, // Must change password on website
      joinedAt: new Date().toISOString(),
      hasPaidEnrollment: true,
      coupons: [
        {
          code: 'WELCOME100',
          discountAmount: 100,
          description: '₹100 Sign-up Cashback Coupon (Redeemable in store/order)',
          isUsed: false
        }
      ]
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    setCurrentCustomer(newCustomer);
    setIsJoinModalOpen(false);

    // Open change password immediately so they set their private password
    setIsChangePasswordModalOpen(true);

    return { success: true };
  };

  const useCoupon = (code: string) => {
    if (!currentCustomer) return;
    const cleanCode = code.trim().toUpperCase();
    const updatedCoupons = (currentCustomer.coupons || []).filter(
      (coupon) => coupon.code.trim().toUpperCase() !== cleanCode && !coupon.isUsed
    );
    const updatedCustomer = { ...currentCustomer, coupons: updatedCoupons };
    setCurrentCustomer(updatedCustomer);
    setCustomers((prev) =>
      prev.map((c) => (c.name.toLowerCase() === currentCustomer.name.toLowerCase() ? updatedCustomer : c))
    );
  };

  const logout = () => {
    setCurrentCustomer(null);
    setIsChangePasswordModalOpen(false);
    setIsLoginModalOpen(false);
    setIsJoinModalOpen(false);
    setLoginRedirectReason(null);
    try {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        currentCustomer,
        isAuthenticated: !!currentCustomer,
        isLoginModalOpen,
        isChangePasswordModalOpen,
        isJoinModalOpen,
        loginRedirectReason,
        openLoginModal,
        closeLoginModal,
        openChangePasswordModal,
        closeChangePasswordModal,
        openJoinModal,
        closeJoinModal,
        login,
        changePassword,
        registerWithPayment,
        useCoupon,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
