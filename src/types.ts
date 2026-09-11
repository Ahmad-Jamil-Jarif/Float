export type HotelCategory = 'basic' | 'comfort' | 'deluxe' | 'premium';

export type ExperienceMode =
  | 'overview'
  | 'explore'
  | 'property'
  | 'tour'
  | 'facility'
  | 'booking';

export type TimeOfDay = 'day' | 'sunset' | 'twilight';

export interface TourPoint {
  id: string;
  name: string;
  type: 'bedroom' | 'bathroom' | 'pool' | 'balcony' | 'view' | 'living';
  view: {
    x: number;
    y: number;
    zoom: number;
  };
  title: string;
  description: string;
  features: string[];
  imageUrl: string;
}

export interface Facility {
  id: string;
  name: string;
  iconName: string;
  description: string;
  included: boolean;
}

export interface HotelRoom {
  roomNumber: string;
  name: string;
  type: string;
  sqm: number;
  bed: string;
  pricePerNight: number;
  maxGuests: number;
  features: string[];
}

export interface Hotel {
  id: string;
  name: string;
  tagline: string;
  category: HotelCategory;
  categoryLabel: string;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  zone: string;
  position: {
    x: number; // 0 - 1000 coordinate space
    y: number;
    depth: number; // 0.6 - 1.4 for parallax
  };
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  sqm: number;
  description: string;
  highlights: string[];
  facilities: Facility[];
  tourPoints: TourPoint[];
  availabilityStatus: 'available' | 'reserved' | 'cleaning' | 'maintenance';
  thumbnail: string;
  heroImage: string;
  accentColor: string;
  floorNumber?: number;
  isBuildingFloor?: boolean;
  hasPool?: boolean;
  rooms?: HotelRoom[];
}

export type ReservationStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';

export interface Reservation {
  id: string; // e.g. "NSA-92410"
  hotelId: string;
  hotelName: string;
  hotelCategory: HotelCategory;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nights: number;
  guestsCount: {
    adults: number;
    children: number;
  };
  addOns: {
    floatingBreakfast?: boolean;
    spaRitual?: boolean;
    catamaranSunset?: boolean;
    airportTransfer?: boolean;
  };
  pricing: {
    nightlyRate: number;
    roomTotal: number;
    serviceFee: number;
    tax: number;
    addOnsTotal: number;
    grandTotal: number;
  };
  paymentMethod: 'card' | 'apple_pay' | 'pay_at_resort';
  paymentStatus: 'paid' | 'guaranteed' | 'refunded';
  transactionId: string;
  cardLast4?: string;
  specialRequests?: string;
  status: ReservationStatus;
  createdAt: string;
  qrToken: string;
  keyPasscode: string;
}

export interface GuestProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  vipTier: 'Standard' | 'Silver' | 'Gold' | 'Nusa Elite';
  totalStays: number;
  totalSpend: number;
  notes: string;
  preferences: string[];
  lastStayDate?: string;
}

export type NotificationType = 'booking_confirmation' | 'guest_reminder' | 'staff_alert' | 'checkin_ready';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  recipient: string;
  channel: 'email' | 'sms' | 'system';
  message: string;
  timestamp: string;
  read: boolean;
  reservationId?: string;
  status: 'delivered' | 'scheduled' | 'sent';
}