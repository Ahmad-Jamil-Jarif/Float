import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Users,
  Check,
  Coffee,
  Sparkles,
  Sailboat,
  Car,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Hotel, Reservation } from '../../types';
import { PaymentProcessing } from './PaymentProcessing';
import { ConfirmationReceipt } from './ConfirmationReceipt';

interface BookingModalProps {
  hotel: Hotel;
  onClose: () => void;
  onCompleteBooking: (newReservation: Reservation) => void;
  onSendInstantReminder: (reservation: Reservation) => void;
  onViewInStaffDashboard?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  hotel,
  onClose,
  onCompleteBooking,
  onSendInstantReminder,
  onViewInStaffDashboard,
}) => {
  // Booking Steps
  const [step, setStep] = useState<'dates_addons' | 'guest_info' | 'payment' | 'confirmed'>('dates_addons');

  // Dates & Guests
  const [checkInDate, setCheckInDate] = useState('2026-09-14');
  const [checkOutDate, setCheckOutDate] = useState('2026-09-19');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Add-ons
  const [addOns, setAddOns] = useState({
    floatingBreakfast: false,
    spaRitual: false,
    catamaranSunset: false,
    airportTransfer: true,
  });

  // Guest Details
  const [guestName, setGuestName] = useState('Alexandra Chen');
  const [guestEmail, setGuestEmail] = useState('alexandra.chen@voyageur.com');
  const [guestPhone, setGuestPhone] = useState('+1 (212) 555-0199');
  const [guestCountry, setGuestCountry] = useState('United States');
  const [specialRequests, setSpecialRequests] = useState('Late check-in anticipated around 20:00. Non-dairy milk request.');

  // Payment state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  // Calculate nights
  const nights = useMemo(() => {
    try {
      const d1 = new Date(checkInDate);
      const d2 = new Date(checkOutDate);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  }, [checkInDate, checkOutDate]);

  // Pricing calculations
  const pricing = useMemo(() => {
    const roomTotal = hotel.pricePerNight * nights;

    let addOnsTotal = 0;
    if (addOns.floatingBreakfast) addOnsTotal += 95 * nights;
    if (addOns.spaRitual) addOnsTotal += 240;
    if (addOns.catamaranSunset) addOnsTotal += 350;
    if (addOns.airportTransfer) addOnsTotal += 85;

    const subtotal = roomTotal + addOnsTotal;
    const serviceFee = subtotal * 0.1; // 10%
    const tax = subtotal * 0.05; // 5% regional tourism tax
    const grandTotal = subtotal + serviceFee + tax;

    return {
      nightlyRate: hotel.pricePerNight,
      roomTotal,
      serviceFee,
      tax,
      addOnsTotal,
      grandTotal,
    };
  }, [hotel.pricePerNight, nights, addOns]);

  const handlePaymentSuccess = (paymentDetails: {
    method: 'card' | 'apple_pay' | 'pay_at_resort';
    transactionId: string;
    cardLast4?: string;
  }) => {
    const resId = 'NSA-' + Math.floor(10000 + Math.random() * 90000);
    const keyPasscode = Math.floor(1000 + Math.random() * 9000).toString();

    const newReservation: Reservation = {
      id: resId,
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelCategory: hotel.category,
      guestName,
      guestEmail,
      guestPhone,
      guestCountry,
      checkInDate,
      checkOutDate,
      nights,
      guestsCount: { adults, children },
      addOns,
      pricing,
      paymentMethod: paymentDetails.method,
      paymentStatus: paymentDetails.method === 'pay_at_resort' ? 'guaranteed' : 'paid',
      transactionId: paymentDetails.transactionId,
      cardLast4: paymentDetails.cardLast4 || '4242',
      specialRequests,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      qrToken: `NUSA_PASS_${resId}_${guestName.replace(/\s+/g, '_')}`,
      keyPasscode,
    };

    setConfirmedReservation(newReservation);
    onCompleteBooking(newReservation);
    setStep('confirmed');
  };

  return (
    <div
      id="booking-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in"
    >
      <div className="w-full max-w-3xl rounded-3xl bg-[#09121a] border border-[#d4af37]/30 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#060c11]">
          <div>
            <span className="font-meta text-[10px] text-[#d4af37] uppercase tracking-widest block">
              Reservation Concierge
            </span>
            <h3 className="font-editorial text-xl font-medium text-white">
              {step === 'confirmed' ? 'Stay Confirmed' : `Reserve: ${hotel.name}`}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {step !== 'confirmed' && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-meta">
                <Clock className="w-3.5 h-3.5" />
                <span>Villa Hold: 10:00</span>
              </div>
            )}
            <button
              id="btn-close-booking-modal"
              onClick={onClose}
              className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Indicator (if not confirmed) */}
        {step !== 'confirmed' && (
          <div className="grid grid-cols-3 border-b border-white/10 text-xs font-medium text-center">
            <button
              type="button"
              onClick={() => setStep('dates_addons')}
              className={`py-3 px-2 border-b-2 transition-colors cursor-pointer ${
                step === 'dates_addons'
                  ? 'border-[#d4af37] text-[#d4af37] bg-white/[0.02]'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              1. Dates & Experiences
            </button>
            <button
              type="button"
              onClick={() => setStep('guest_info')}
              className={`py-3 px-2 border-b-2 transition-colors cursor-pointer ${
                step === 'guest_info'
                  ? 'border-[#d4af37] text-[#d4af37] bg-white/[0.02]'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              2. Guest Information
            </button>
            <button
              type="button"
              onClick={() => {
                if (guestName && guestEmail) setStep('payment');
              }}
              className={`py-3 px-2 border-b-2 transition-colors cursor-pointer ${
                step === 'payment'
                  ? 'border-[#d4af37] text-[#d4af37] bg-white/[0.02]'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              3. Secure Payment
            </button>
          </div>
        )}

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: DATES & ADD-ONS */}
          {step === 'dates_addons' && (
            <div className="space-y-6">
              {/* Date & Guest Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div>
                  <label className="text-xs text-white/60 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Check-in</span>
                  </label>
                  <input
                    type="date"
                    id="input-checkin-date"
                    value={checkInDate}
                    min="2026-09-10"
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-meta focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/60 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Check-out</span>
                  </label>
                  <input
                    type="date"
                    id="input-checkout-date"
                    value={checkOutDate}
                    min={checkInDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-meta focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/60 mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Party</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      id="select-adults"
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-1/2 px-2.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-meta focus:outline-none focus:border-[#d4af37]"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n} className="bg-[#09121a]">
                          {n} Adult{n > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>

                    <select
                      id="select-children"
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      className="w-1/2 px-2.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-meta focus:outline-none focus:border-[#d4af37]"
                    >
                      {[0, 1, 2, 3].map((n) => (
                        <option key={n} value={n} className="bg-[#09121a]">
                          {n} Child{n > 1 ? 'ren' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Curated Add-on Experiences */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-meta text-xs uppercase tracking-widest text-white/60">
                    Bespoke Resort Inclusions & Add-Ons
                  </h4>
                  <span className="text-[11px] text-[#d4af37]">Tailor your stay</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Floating Breakfast */}
                  <label
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      addOns.floatingBreakfast
                        ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                        : 'bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={addOns.floatingBreakfast}
                      onChange={(e) =>
                        setAddOns({ ...addOns, floatingBreakfast: e.target.checked })
                      }
                      className="mt-1 accent-[#d4af37]"
                    />
                    <div className="text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <Coffee className="w-3.5 h-3.5 text-[#d4af37]" /> Floating Breakfast
                        </span>
                        <span className="text-[#d4af37] font-meta">$95/day</span>
                      </div>
                      <p className="text-[11px] text-white/50 mt-0.5">
                        Fresh dragonfruit, pastries, & mimosas served on a wooden floating pool tray.
                      </p>
                    </div>
                  </label>

                  {/* Spa Ritual */}
                  <label
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      addOns.spaRitual
                        ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                        : 'bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={addOns.spaRitual}
                      onChange={(e) => setAddOns({ ...addOns, spaRitual: e.target.checked })}
                      className="mt-1 accent-[#d4af37]"
                    />
                    <div className="text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" /> Couples Ocean Spa
                        </span>
                        <span className="text-[#d4af37] font-meta">$240</span>
                      </div>
                      <p className="text-[11px] text-white/50 mt-0.5">
                        90-minute Balinese hot stone ritual in your private overwater pavilion.
                      </p>
                    </div>
                  </label>

                  {/* Sunset Catamaran */}
                  <label
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      addOns.catamaranSunset
                        ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                        : 'bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={addOns.catamaranSunset}
                      onChange={(e) =>
                        setAddOns({ ...addOns, catamaranSunset: e.target.checked })
                      }
                      className="mt-1 accent-[#d4af37]"
                    />
                    <div className="text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <Sailboat className="w-3.5 h-3.5 text-[#d4af37]" /> Sunset Catamaran Cruise
                        </span>
                        <span className="text-[#d4af37] font-meta">$350</span>
                      </div>
                      <p className="text-[11px] text-white/50 mt-0.5">
                        Private 2-hour coastal sail with champagne & freshly shucked oysters.
                      </p>
                    </div>
                  </label>

                  {/* VIP Airport Transfer */}
                  <label
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      addOns.airportTransfer
                        ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                        : 'bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={addOns.airportTransfer}
                      onChange={(e) =>
                        setAddOns({ ...addOns, airportTransfer: e.target.checked })
                      }
                      className="mt-1 accent-[#d4af37]"
                    />
                    <div className="text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-[#d4af37]" /> VIP Airport Transfer
                        </span>
                        <span className="text-[#d4af37] font-meta">$85</span>
                      </div>
                      <p className="text-[11px] text-white/50 mt-0.5">
                        Private luxury Mercedes sedan or speedboat meet & greet from DPS Airport.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Price Calculation Card */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>
                    {hotel.name} ({nights} nights x ${pricing.nightlyRate})
                  </span>
                  <span className="text-white">${pricing.roomTotal.toFixed(2)}</span>
                </div>
                {pricing.addOnsTotal > 0 && (
                  <div className="flex justify-between text-white/70">
                    <span>Curated Add-Ons Total</span>
                    <span className="text-white">${pricing.addOnsTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/70">
                  <span>Resort Service Fee (10%)</span>
                  <span className="text-white">${pricing.serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Regional Tourism Tax (5%)</span>
                  <span className="text-white">${pricing.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 font-semibold text-sm text-[#d4af37]">
                  <span>Total Due</span>
                  <span>${pricing.grandTotal.toFixed(2)} USD</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  id="btn-goto-guest-info"
                  onClick={() => setStep('guest_info')}
                  className="px-6 py-3 rounded-xl bg-[#d4af37] text-black font-semibold text-xs shadow-lg shadow-[#d4af37]/20 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Guest Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: GUEST INFORMATION */}
          {step === 'guest_info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/70 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    id="input-guest-name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Alexandra Chen"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-white/70 block mb-1">Email for Confirmation *</label>
                  <input
                    type="email"
                    id="input-guest-email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="alexandra@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-white/70 block mb-1">Mobile / WhatsApp (for Arrival SMS) *</label>
                  <input
                    type="tel"
                    id="input-guest-phone"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-white/70 block mb-1">Country of Residence</label>
                  <input
                    type="text"
                    id="input-guest-country"
                    value={guestCountry}
                    onChange={(e) => setGuestCountry(e.target.value)}
                    placeholder="United States, Switzerland, Japan..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">
                  Special Requests, Dietary Preferences, or Celebrations
                </label>
                <textarea
                  id="input-special-requests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  placeholder="e.g. Late flight arrival, anniversary bed decoration, gluten-free dining..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep('dates_addons')}
                  className="px-4 py-2.5 rounded-xl border border-white/15 text-xs text-white/60 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  id="btn-goto-payment"
                  onClick={() => {
                    if (guestName && guestEmail) setStep('payment');
                  }}
                  className="px-6 py-3 rounded-xl bg-[#d4af37] text-black font-semibold text-xs shadow-lg shadow-[#d4af37]/20 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Payment (${pricing.grandTotal.toFixed(2)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SECURE PAYMENT */}
          {step === 'payment' && (
            <div className="space-y-4">
              <PaymentProcessing
                amount={pricing.grandTotal}
                isProcessing={isProcessingPayment}
                setIsProcessing={setIsProcessingPayment}
                onPaymentSuccess={handlePaymentSuccess}
              />

              <div className="flex justify-start pt-2">
                <button
                  type="button"
                  onClick={() => setStep('guest_info')}
                  className="px-4 py-2 rounded-xl border border-white/15 text-xs text-white/60 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Guest Info</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMED RECEIPT */}
          {step === 'confirmed' && confirmedReservation && (
            <ConfirmationReceipt
              reservation={confirmedReservation}
              onClose={onClose}
              onSendInstantReminder={onSendInstantReminder}
              onViewInStaffDashboard={onViewInStaffDashboard}
            />
          )}
        </div>
      </div>
    </div>
  );
}