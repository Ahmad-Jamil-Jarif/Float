import React, { useState, useEffect, useCallback } from 'react';
import {
  Hotel,
  HotelCategory,
  TimeOfDay,
  TourPoint,
  Reservation,
  GuestProfile,
  NotificationItem,
  ReservationStatus,
} from './types';
import {
  getStoredHotels,
  saveStoredHotels,
  getStoredReservations,
  saveStoredReservations,
  getStoredGuests,
  saveStoredGuests,
  getStoredNotifications,
  saveStoredNotifications,
} from './data/initialData';
import { resortAudio } from './services/soundService';
import { ResortCanvas } from './components/canvas/ResortCanvas';
import { CanvasControls } from './components/canvas/CanvasControls';
import { PropertyTourModal } from './components/resort/PropertyTourModal';
import { BookingModal } from './components/booking/BookingModal';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { AccessibleListView } from './components/accessible/AccessibleListView';
import { Navbar } from './components/ui/Navbar';
import { HomePage } from './components/HomePage';

export default function App() {
  // Primary App Views
  const [currentView, setCurrentView] = useState<'canvas' | 'list' | 'staff' | 'home'>('home');

  // Core Data State (synced with LocalStorage)
  const [hotels, setHotels] = useState<Hotel[]>(() => getStoredHotels());
  const [reservations, setReservations] = useState<Reservation[]>(() => getStoredReservations());
  const [guests, setGuests] = useState<GuestProfile[]>(() => getStoredGuests());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getStoredNotifications());

  // Canvas & Resort Exploration State
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<HotelCategory | 'all'>('all');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('sunset');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isTourMode, setIsTourMode] = useState(false);
  const [activeTourPointId, setActiveTourPointId] = useState<string | null>(null);

  // Modals & Drawers
  const [bookingHotel, setBookingHotel] = useState<Hotel | null>(null);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Sync hotels changes
  useEffect(() => {
    saveStoredHotels(hotels);
  }, [hotels]);

  // Sync reservations changes
  useEffect(() => {
    saveStoredReservations(reservations);
  }, [reservations]);

  // Sync guests changes
  useEffect(() => {
    saveStoredGuests(guests);
  }, [guests]);

  // Sync notifications changes
  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  // Reset window scroll whenever the view changes — otherwise the
  // list view inherits the home page's scroll position and opens mid-page.
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
  }, [currentView]);

  // Unread notifications count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Keyboard accessibility shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (bookingHotel) setBookingHotel(null);
        else if (selectedHotel) {
          setSelectedHotel(null);
          setIsTourMode(false);
        } else if (isNotificationDrawerOpen) {
          setIsNotificationDrawerOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bookingHotel, selectedHotel, isNotificationDrawerOpen]);

  // Audio Toggle
  const handleToggleAudio = () => {
    const nextState = resortAudio.toggle();
    setIsAudioPlaying(nextState);
  };

  // Hotel Selection (from Canvas or List)
  const handleSelectHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setActiveTourPointId(hotel.tourPoints[0]?.id || null);
    setIsTourMode(true);
  };

  // Tour Point Selection
  const handleSelectTourPoint = (point: TourPoint) => {
    setActiveTourPointId(point.id);
  };

  // Reset View to Overview
  const handleResetView = () => {
    setSelectedHotel(null);
    setIsTourMode(false);
    setActiveTourPointId(null);
  };

  // Complete Booking Handler
  const handleCompleteBooking = (newReservation: Reservation) => {
    // 1. Add to reservations
    const updatedRes = [newReservation, ...reservations];
    setReservations(updatedRes);

    // 2. Mark hotel availability status
    const updatedHotels = hotels.map((h) =>
      h.id === newReservation.hotelId ? { ...h, availabilityStatus: 'reserved' as const } : h
    );
    setHotels(updatedHotels);

    // 3. Automated Notifications dispatched:
    // a) Booking confirmation to guest
    const confirmationNotif: NotificationItem = {
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      type: 'booking_confirmation',
      title: `Booking Confirmed: ${newReservation.hotelName}`,
      recipient: newReservation.guestEmail,
      channel: 'email',
      message: `Dear ${newReservation.guestName}, your reservation #${newReservation.id} for ${newReservation.nights} nights starting ${newReservation.checkInDate} is confirmed. Digital key code: #${newReservation.keyPasscode}.`,
      timestamp: new Date().toISOString(),
      read: false,
      reservationId: newReservation.id,
      status: 'delivered',
    };

    // b) Scheduled pre-arrival reminder for 24h before
    const reminderNotif: NotificationItem = {
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      type: 'guest_reminder',
      title: `Pre-Arrival Concierge: ${newReservation.hotelName}`,
      recipient: newReservation.guestPhone || newReservation.guestEmail,
      channel: 'sms',
      message: `Nusa Resort Reminder: 24h until arrival! Complete express check-in or arrange airport greeting. Key passcode: #${newReservation.keyPasscode}.`,
      timestamp: new Date().toISOString(),
      read: false,
      reservationId: newReservation.id,
      status: 'scheduled',
    };

    // c) Staff Alert
    const staffAlert: NotificationItem = {
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      type: 'staff_alert',
      title: `New Reservation Settled: ${newReservation.id}`,
      recipient: 'Front Desk & Villa Host',
      channel: 'system',
      message: `New booking for ${newReservation.hotelName} by ${newReservation.guestName} ($${newReservation.pricing.grandTotal.toFixed(2)}). Key #${newReservation.keyPasscode}.`,
      timestamp: new Date().toISOString(),
      read: false,
      reservationId: newReservation.id,
      status: 'delivered',
    };

    setNotifications([confirmationNotif, reminderNotif, staffAlert, ...notifications]);

    // 4. Update or Add Guest Profile
    const existingGuestIndex = guests.findIndex(
      (g) => g.email.toLowerCase() === newReservation.guestEmail.toLowerCase()
    );

    if (existingGuestIndex >= 0) {
      const g = guests[existingGuestIndex];
      const updatedGuest: GuestProfile = {
        ...g,
        totalStays: g.totalStays + 1,
        totalSpend: g.totalSpend + newReservation.pricing.grandTotal,
        lastStayDate: newReservation.checkInDate,
        vipTier:
          g.totalSpend + newReservation.pricing.grandTotal > 8000
            ? 'Nusa Elite'
            : g.totalSpend + newReservation.pricing.grandTotal > 4000
            ? 'Gold'
            : 'Silver',
      };
      const updatedGuests = [...guests];
      updatedGuests[existingGuestIndex] = updatedGuest;
      setGuests(updatedGuests);
    } else {
      const newGuest: GuestProfile = {
        id: 'gst-' + (guests.length + 1),
        name: newReservation.guestName,
        email: newReservation.guestEmail,
        phone: newReservation.guestPhone,
        country: newReservation.guestCountry || 'International',
        vipTier: newReservation.pricing.grandTotal > 3000 ? 'Gold' : 'Standard',
        totalStays: 1,
        totalSpend: newReservation.pricing.grandTotal,
        notes: newReservation.specialRequests || 'First-time guest at Float.',
        preferences: ['Ocean view preference', 'Direct airport meet & greet'],
        lastStayDate: newReservation.checkInDate,
      };
      setGuests([newGuest, ...guests]);
    }
  };

  // Staff Update Reservation Status
  const handleUpdateReservationStatus = (resId: string, newStatus: ReservationStatus) => {
    const updated = reservations.map((r) => {
      if (r.id === resId) {
        return { ...r, status: newStatus };
      }
      return r;
    });
    setReservations(updated);

    const targetRes = reservations.find((r) => r.id === resId);
    if (!targetRes) return;

    // Dispatch status notification
    if (newStatus === 'checked_in') {
      const checkInAlert: NotificationItem = {
        id: 'notif_' + Math.random().toString(36).substring(2, 9),
        type: 'staff_alert',
        title: `Guest Checked In: ${targetRes.guestName}`,
        recipient: 'Housekeeping & Concierge',
        channel: 'system',
        message: `${targetRes.guestName} has checked into ${targetRes.hotelName}. Welcome cocktail service dispatched.`,
        timestamp: new Date().toISOString(),
        read: false,
        reservationId: targetRes.id,
        status: 'delivered',
      };
      setNotifications([checkInAlert, ...notifications]);

      // Update room status to reserved
      setHotels(
        hotels.map((h) =>
          h.id === targetRes.hotelId ? { ...h, availabilityStatus: 'reserved' as const } : h
        )
      );
    } else if (newStatus === 'checked_out') {
      // Mark villa for cleaning
      setHotels(
        hotels.map((h) =>
          h.id === targetRes.hotelId ? { ...h, availabilityStatus: 'cleaning' as const } : h
        )
      );
    }
  };

  // Staff Update Hotel Status
  const handleUpdateHotelStatus = (
    hotelId: string,
    newStatus: 'available' | 'reserved' | 'cleaning' | 'maintenance'
  ) => {
    setHotels(
      hotels.map((h) => (h.id === hotelId ? { ...h, availabilityStatus: newStatus } : h))
    );
  };

  // Instant Automated Reminder Trigger
  const handleSendInstantReminder = (res: Reservation) => {
    const reminder: NotificationItem = {
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      type: 'guest_reminder',
      title: `Arrival Reminder & Key: ${res.hotelName}`,
      recipient: res.guestEmail,
      channel: 'email',
      message: `Reminder: Your stay begins ${res.checkInDate}. Key passcode: #${res.keyPasscode}. Our boat will meet you at the Nusa arrival pavilion.`,
      timestamp: new Date().toISOString(),
      read: false,
      reservationId: res.id,
      status: 'delivered',
    };
    setNotifications([reminder, ...notifications]);
  };

  // Custom Reminder from drawer
  const handleTriggerCustomReminder = (
    title: string,
    recipient: string,
    message: string,
    channel: 'email' | 'sms'
  ) => {
    const customNotif: NotificationItem = {
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      type: 'guest_reminder',
      title,
      recipient,
      message,
      channel,
      timestamp: new Date().toISOString(),
      read: false,
      status: 'delivered',
    };
    setNotifications([customNotif, ...notifications]);
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleUpdateGuestNotes = (guestId: string, notes: string) => {
    setGuests(guests.map((g) => (g.id === guestId ? { ...g, notes } : g)));
  };

  return (
    <div id="hotel-applet-root" className="relative w-screen min-h-screen bg-[#f1f0ec]">
      {/* Universal Luxury Navigation Bar */}
      <Navbar
        currentView={currentView}
        onSwitchView={setCurrentView}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenQuickBook={() => {
          setBookingHotel(selectedHotel || hotels[0]);
        }}
      />

      {/* VIEW: HOMEPAGE */}
      {currentView === 'home' && (
        <main className="relative w-full h-full">
          <HomePage onSwitchView={setCurrentView} />
        </main>
      )}

      {/* VIEW 1: INTERACTIVE 2.5D CANVAS RESORT */}
      {currentView === 'canvas' && (
        <main className="relative w-full h-full pt-16 md:pt-18 overflow-hidden">
          <ResortCanvas
            hotels={hotels}
            selectedHotel={selectedHotel}
            selectedCategory={selectedCategory}
            timeOfDay={timeOfDay}
            onSelectHotel={handleSelectHotel}
            onSelectTourPoint={handleSelectTourPoint}
            activeTourPointId={activeTourPointId}
            isTourMode={isTourMode}
          />

          {/* Interactive HUD Controls (Zoom, Time of Day, Sound, Filters) */}
          <CanvasControls
            timeOfDay={timeOfDay}
            onChangeTimeOfDay={setTimeOfDay}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onResetView={handleResetView}
            isAudioPlaying={isAudioPlaying}
            onToggleAudio={handleToggleAudio}
            onZoomIn={() => {
              // Target zoom handled via event or canvas dispatch
              const canvas = document.getElementById('resort-interactive-canvas');
              if (canvas) {
                canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, bubbles: true }));
              }
            }}
            onZoomOut={() => {
              const canvas = document.getElementById('resort-interactive-canvas');
              if (canvas) {
                canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true }));
              }
            }}
          />

          {/* Property Tour Drawer/Modal */}
          {selectedHotel && (
            <PropertyTourModal
              hotel={selectedHotel}
              onClose={() => {
                setSelectedHotel(null);
                setIsTourMode(false);
              }}
              onBookNow={(hotel) => setBookingHotel(hotel)}
              activeTourPointId={activeTourPointId}
              onSelectTourPoint={handleSelectTourPoint}
              isTourMode={isTourMode}
              onToggleTourMode={() => setIsTourMode(!isTourMode)}
            />
          )}
        </main>
      )}

      {/* VIEW 2: ACCESSIBLE LIST VIEW */}
      {currentView === 'list' && (
        <main className="w-full h-full pt-16 md:pt-18 overflow-y-auto">
          <AccessibleListView
            hotels={hotels}
            onSelectHotel={(hotel) => {
              setSelectedHotel(hotel);
              setCurrentView('canvas');
              setIsTourMode(true);
            }}
            onBookHotel={(hotel) => setBookingHotel(hotel)}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onReturnToCanvas={() => setCurrentView('canvas')}
          />
        </main>
      )}

      {/* VIEW 3: STAFF OPERATIONS DASHBOARD */}
      {currentView === 'staff' && (
        <main className="w-full h-full pt-16 md:pt-18 overflow-y-auto">
          <StaffDashboard
            reservations={reservations}
            guests={guests}
            hotels={hotels}
            onUpdateReservationStatus={handleUpdateReservationStatus}
            onUpdateHotelStatus={handleUpdateHotelStatus}
            onSendReminder={handleSendInstantReminder}
            onUpdateGuestNotes={handleUpdateGuestNotes}
            onOpenNewBookingModal={() => setBookingHotel(hotels[0])}
            onSwitchToGuestView={() => setCurrentView('canvas')}
          />
        </main>
      )}

      {/* Real-time Room Booking & Secure Payment Modal */}
      {bookingHotel && (
        <BookingModal
          hotel={bookingHotel}
          onClose={() => setBookingHotel(null)}
          onCompleteBooking={handleCompleteBooking}
          onSendInstantReminder={handleSendInstantReminder}
          onViewInStaffDashboard={() => {
            setBookingHotel(null);
            setCurrentView('staff');
          }}
        />
      )}

      {/* Automated Notifications Center Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllRead}
        onTriggerCustomReminder={handleTriggerCustomReminder}
        reservations={reservations}
      />
    </div>
  );
}