import { StoreConfig } from '../types/product';

export const STORE_CONFIG: StoreConfig = {
  name: "J MART",
  tagline: "Your Neighbourhood Supermarket & Daily Essentials Store",
  description: "Browse our live in-store catalog to check availability before visiting or reserve items directly for quick in-store pickup.",
  address: "Rayala Nagar Extension, near Koilpillai School, Ramapuram",
  cityStateZip: "Chennai, Tamil Nadu 600089",
  phone: "+91 77088 00220",
  whatsappNumber: "917708800220",
  email: "contact@jmart.store",
  mapsUrl: "https://maps.google.com/?q=J+MART+Rayala+Nagar+Extension+Ramapuram+Chennai+600089",
  openingHours: {
    weekdays: "8:00 AM – 10:00 PM",
    weekends: "8:00 AM – 10:30 PM",
    statusText: "Open Now • Closes at 10:00 PM",
    weekdayOpenMinutes: 8 * 60,
    weekdayCloseMinutes: 22 * 60,
    weekendOpenMinutes: 8 * 60,
    weekendCloseMinutes: 22 * 60 + 30,
  },
  features: {
    enableWhatsAppOrder: true,
    showExactStockCount: true,
    enableInStorePickup: true,
    currencySymbol: "₹"
  }
};

const formatClockTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${mins.toString().padStart(2, '0')} ${suffix}`;
};

/** Returns the current store status using Chennai/Ramapuram local time. */
export const getStoreStatusText = (now = new Date()): string => {
  try {
    const parts = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(now);
    const weekday = parts.find((part) => part.type === 'weekday')?.value || '';
    const hour = Number(parts.find((part) => part.type === 'hour')?.value || 0);
    const minute = Number(parts.find((part) => part.type === 'minute')?.value || 0);
    const currentMinutes = hour * 60 + minute;
    const isWeekend = weekday === 'Sat' || weekday === 'Sun';
    const openMinutes = isWeekend
      ? STORE_CONFIG.openingHours.weekendOpenMinutes ?? 8 * 60
      : STORE_CONFIG.openingHours.weekdayOpenMinutes ?? 8 * 60;
    const closeMinutes = isWeekend
      ? STORE_CONFIG.openingHours.weekendCloseMinutes ?? 22 * 60 + 30
      : STORE_CONFIG.openingHours.weekdayCloseMinutes ?? 22 * 60;

    if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
      return `Open Now • Closes at ${formatClockTime(closeMinutes)}`;
    }
    return `Closed Now • Opens at ${formatClockTime(openMinutes)}`;
  } catch {
    return STORE_CONFIG.openingHours.statusText;
  }
};
