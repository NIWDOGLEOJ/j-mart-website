export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface Coupon {
  code: string;
  discountAmount: number;
  description: string;
  isUsed: boolean;
}

export interface LoyaltyCustomer {
  phone: string;
  name: string;
  loyaltyPoints: number;
  totalSpent: number;
  tier: LoyaltyTier;
  passwordHash: string; // Stored password (initially equal to name)
  mustChangePassword: boolean; // True on first login or when password equals name
  joinedAt: string;
  hasPaidEnrollment?: boolean; // True for paid ₹100 new members
  coupons: Coupon[];
}

export interface AuthState {
  currentCustomer: LoyaltyCustomer | null;
  isAuthenticated: boolean;
}
