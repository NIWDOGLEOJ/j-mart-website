import { LoyaltyCustomer } from '../types/customer';

export const INITIAL_CUSTOMERS: LoyaltyCustomer[] = [
  {
    name: "Ramesh Kumar",
    phone: "9876543210",
    loyaltyPoints: 320,
    totalSpent: 16500,
    tier: "Gold",
    passwordHash: "Ramesh Kumar", // Initial password is the name
    mustChangePassword: true,
    joinedAt: "2026-01-15T10:00:00.000Z",
    coupons: [
      {
        code: "GOLD10",
        discountAmount: 50,
        description: "Gold Member Special ₹50 off",
        isUsed: false
      }
    ]
  },
  {
    name: "Priya Sharma",
    phone: "9841023456",
    loyaltyPoints: 150,
    totalSpent: 8200,
    tier: "Silver",
    passwordHash: "Priya Sharma",
    mustChangePassword: true,
    joinedAt: "2026-02-10T14:30:00.000Z",
    coupons: []
  },
  {
    name: "Karthik Raj",
    phone: "9790123456",
    loyaltyPoints: 45,
    totalSpent: 3100,
    tier: "Bronze",
    passwordHash: "Karthik Raj",
    mustChangePassword: true,
    joinedAt: "2026-03-01T18:15:00.000Z",
    coupons: []
  },
  {
    name: "Ananya Sundaram",
    phone: "9444123456",
    loyaltyPoints: 680,
    totalSpent: 42000,
    tier: "Platinum",
    passwordHash: "Ananya Sundaram",
    mustChangePassword: true,
    joinedAt: "2025-11-20T12:00:00.000Z",
    coupons: [
      {
        code: "PLATINUM100",
        discountAmount: 100,
        description: "Platinum Member Exclusive ₹100 discount",
        isUsed: false
      }
    ]
  }
];
