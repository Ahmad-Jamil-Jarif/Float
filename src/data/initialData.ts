import { Reservation, GuestProfile, NotificationItem, Hotel } from '../types';
import { RESORT_HOTELS } from './resortData';

const STORAGE_KEYS = {
  RESERVATIONS: 'nusa_resort_reservations_v1',
  GUESTS: 'nusa_resort_guests_v1',
  NOTIFICATIONS: 'nusa_resort_notifications_v1',
  HOTELS: 'nusa_resort_hotels_v2',
};

export const SEED_GUESTS: GuestProfile[] = [
  {
    id: 'gst-1',
    name: 'Elena Rostova',
    email: 'elena.rostova@luxurytravel.ch',
    phone: '+41 79 384 9201',
    country: 'Switzerland',
    vipTier: 'Nusa Elite',
    totalStays: 4,
    totalSpend: 11450,
    notes: 'Prefers quiet western villa for sunset meditation. Vegan dining preferences. Extra feather pillows.',
    preferences: ['Ocean sunset view', 'Plant-based gourmet', 'Daily morning yoga', 'Feather pillows'],
    lastStayDate: '2026-09-08',
  },
  {
    id: 'gst-2',
    name: 'Marcus & Chloe Vance',
    email: 'marcus.vance@studioaurora.io',
    phone: '+1 (415) 890-3412',
    country: 'United States',
    vipTier: 'Gold',
    totalStays: 2,
    totalSpend: 4780,
    notes: 'Celebrating 5th wedding anniversary. Requested chilled Dom Pérignon upon arrival and floating breakfast.',
    preferences: ['Anniversary celebration', 'Champagne on ice', 'Floating breakfast in pool'],
    lastStayDate: '2026-09-12',
  },
  {
    id: 'gst-3',
    name: 'Kenji Takahashi',
    email: 'k.takahashi@kyotoarch.jp',
    phone: '+81 90 2341 5567',
    country: 'Japan',
    vipTier: 'Silver',
    totalStays: 1,
    totalSpend: 1880,
    notes: 'Architect interested in sustainable bamboo construction. Inquired about design tour with resort architect.',
    preferences: ['Quiet working desk', 'Architecture interest', 'High-speed Wi-Fi'],
    lastStayDate: '2026-09-15',
  },
  {
    id: 'gst-4',
    name: 'Sophia Lindqvist',
    email: 'sophia@nordicdesign.se',
    phone: '+46 70 812 4590',
    country: 'Sweden',
    vipTier: 'Gold',
    totalStays: 3,
    totalSpend: 5920,
    notes: 'Avid scuba diver. Prefers overwater villa with direct reef ladder. Enjoys sunrise paddle-boarding.',
    preferences: ['Scuba diving', 'Early breakfast 06:30', 'Firm mattress'],
    lastStayDate: '2026-09-18',
  },
];

export const SEED_RESERVATIONS: Reservation[] = [
  {
    id: 'NSA-88204',
    hotelId: 'villa-premium-1',
    hotelName: 'Nusa Royal Sanctuary Villa',
    hotelCategory: 'premium',
    guestName: 'Elena Rostova',
    guestEmail: 'elena.rostova@luxurytravel.ch',
    guestPhone: '+41 79 384 9201',
    guestCountry: 'Switzerland',
    checkInDate: '2026-09-08',
    checkOutDate: '2026-09-14',
    nights: 6,
    guestsCount: { adults: 2, children: 0 },
    addOns: { floatingBreakfast: true, spaRitual: true, catamaranSunset: true, airportTransfer: true },
    pricing: {
      nightlyRate: 750,
      roomTotal: 4500,
      serviceFee: 450,
      tax: 225,
      addOnsTotal: 680,
      grandTotal: 5855,
    },
    paymentMethod: 'card',
    paymentStatus: 'paid',
    transactionId: 'TXN_9842109482',
    cardLast4: '4242',
    specialRequests: 'Vegan menus and daily 90-min couples massage scheduled for 17:00.',
    status: 'checked_in',
    createdAt: '2026-08-20T14:22:00Z',
    qrToken: 'NUSA_VERIFY_NSA-88204_ELENA',
    keyPasscode: '8820',
  },
  {
    id: 'NSA-89145',
    hotelId: 'villa-deluxe-1',
    hotelName: 'Ocean Breeze Overwater Villa',
    hotelCategory: 'deluxe',
    guestName: 'Marcus & Chloe Vance',
    guestEmail: 'marcus.vance@studioaurora.io',
    guestPhone: '+1 (415) 890-3412',
    guestCountry: 'United States',
    checkInDate: '2026-09-12',
    checkOutDate: '2026-09-17',
    nights: 5,
    guestsCount: { adults: 2, children: 0 },
    addOns: { floatingBreakfast: true, spaRitual: true, catamaranSunset: true },
    pricing: {
      nightlyRate: 395,
      roomTotal: 1975,
      serviceFee: 197.5,
      tax: 98.75,
      addOnsTotal: 420,
      grandTotal: 2691.25,
    },
    paymentMethod: 'apple_pay',
    paymentStatus: 'paid',
    transactionId: 'TXN_APL_8391048',
    cardLast4: '8819',
    specialRequests: '5th anniversary - floral bed arrangement and sunset champagne setup.',
    status: 'confirmed',
    createdAt: '2026-08-28T09:15:00Z',
    qrToken: 'NUSA_VERIFY_NSA-89145_MARCUS',
    keyPasscode: '5192',
  },
  {
    id: 'NSA-89218',
    hotelId: 'villa-comfort-1',
    hotelName: 'Tirta Lagoon Suite',
    hotelCategory: 'comfort',
    guestName: 'Kenji Takahashi',
    guestEmail: 'k.takahashi@kyotoarch.jp',
    guestPhone: '+81 90 2341 5567',
    guestCountry: 'Japan',
    checkInDate: '2026-09-15',
    checkOutDate: '2026-09-19',
    nights: 4,
    guestsCount: { adults: 1, children: 0 },
    addOns: { airportTransfer: true },
    pricing: {
      nightlyRate: 235,
      roomTotal: 940,
      serviceFee: 94,
      tax: 47,
      addOnsTotal: 90,
      grandTotal: 1171,
    },
    paymentMethod: 'card',
    paymentStatus: 'paid',
    transactionId: 'TXN_9871625412',
    cardLast4: '1092',
    specialRequests: 'Quiet room away from morning kitchen service for architectural sketching.',
    status: 'confirmed',
    createdAt: '2026-09-01T11:40:00Z',
    qrToken: 'NUSA_VERIFY_NSA-89218_KENJI',
    keyPasscode: '2180',
  },
  {
    id: 'NSA-87910',
    hotelId: 'villa-basic-1',
    hotelName: 'Purnama Bamboo Cottage',
    hotelCategory: 'basic',
    guestName: 'Sophia Lindqvist',
    guestEmail: 'sophia@nordicdesign.se',
    guestPhone: '+46 70 812 4590',
    guestCountry: 'Sweden',
    checkInDate: '2026-09-02',
    checkOutDate: '2026-09-07',
    nights: 5,
    guestsCount: { adults: 2, children: 0 },
    addOns: { catamaranSunset: true },
    pricing: {
      nightlyRate: 135,
      roomTotal: 675,
      serviceFee: 67.5,
      tax: 33.75,
      addOnsTotal: 150,
      grandTotal: 926.25,
    },
    paymentMethod: 'card',
    paymentStatus: 'paid',
    transactionId: 'TXN_8762514309',
    cardLast4: '6740',
    specialRequests: 'Scuba gear storage and late checkout if available.',
    status: 'checked_out',
    createdAt: '2026-08-10T16:00:00Z',
    qrToken: 'NUSA_VERIFY_NSA-87910_SOPHIA',
    keyPasscode: '7910',
  },
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'guest_reminder',
    title: 'Pre-Arrival Check-In & Villa Access Code',
    recipient: 'elena.rostova@luxurytravel.ch',
    channel: 'email',
    message: 'Dear Elena, your Nusa Royal Sanctuary Villa is being prepared by your private butler. Your contactless digital key code is #8820. We await your arrival.',
    timestamp: '2026-09-08T08:00:00Z',
    read: true,
    reservationId: 'NSA-88204',
    status: 'delivered',
  },
  {
    id: 'notif-2',
    type: 'booking_confirmation',
    title: 'Booking Confirmed: Ocean Breeze Overwater Villa',
    recipient: 'marcus.vance@studioaurora.io',
    channel: 'email',
    message: 'Your 5-night stay (NSA-89145) from Sep 12 - 17, 2026 is confirmed. Anniversary champagne & floating breakfast registered. See you in paradise!',
    timestamp: '2026-08-28T09:16:00Z',
    read: true,
    reservationId: 'NSA-89145',
    status: 'delivered',
  },
  {
    id: 'notif-3',
    type: 'staff_alert',
    title: 'VIP Arrival Notice: Elena Rostova',
    recipient: 'Front Desk & Butler Team',
    channel: 'system',
    message: 'Nusa Elite Member Elena Rostova has checked into Villa #520 (Nusa Royal). Butler Wayan is assigned for in-villa check-in orientation.',
    timestamp: '2026-09-08T15:10:00Z',
    read: false,
    reservationId: 'NSA-88204',
    status: 'delivered',
  },
  {
    id: 'notif-4',
    type: 'guest_reminder',
    title: 'Upcoming Arrival: 48h Countdown to Nusa Paradise',
    recipient: 'marcus.vance@studioaurora.io',
    channel: 'sms',
    message: 'Nusa Resort Reminder: Your stay starts in 48 hours! Need VIP airport pickup or spa bookings? Reply directly or check in online.',
    timestamp: '2026-09-10T09:00:00Z',
    read: false,
    reservationId: 'NSA-89145',
    status: 'sent',
  },
];

// LocalStorage helpers
export function getStoredReservations(): Reservation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(SEED_RESERVATIONS));
      return SEED_RESERVATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_RESERVATIONS;
  }
}

export function saveStoredReservations(reservations: Reservation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  } catch (e) {
    console.error('Failed to persist reservations', e);
  }
}

export function getStoredGuests(): GuestProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GUESTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(SEED_GUESTS));
      return SEED_GUESTS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_GUESTS;
  }
}

export function saveStoredGuests(guests: GuestProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
  } catch (e) {
    console.error('Failed to persist guests', e);
  }
}

export function getStoredNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
      return SEED_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_NOTIFICATIONS;
  }
}

export function saveStoredNotifications(notifications: NotificationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to persist notifications', e);
  }
}

export function getStoredHotels(): Hotel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOTELS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(RESORT_HOTELS));
      return RESORT_HOTELS;
    }
    return JSON.parse(raw);
  } catch {
    return RESORT_HOTELS;
  }
}

export function saveStoredHotels(hotels: Hotel[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(hotels));
  } catch (e) {
    console.error('Failed to persist hotels', e);
  }
}
