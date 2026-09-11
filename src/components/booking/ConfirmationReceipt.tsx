import React, { useState } from 'react';
import {
  CheckCircle2,
  Calendar,
  Download,
  Printer,
  Mail,
  Smartphone,
  Key,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Reservation } from '../../types';

interface ConfirmationReceiptProps {
  reservation: Reservation;
  onClose: () => void;
  onSendInstantReminder: (reservation: Reservation) => void;
  onViewInStaffDashboard?: () => void;
}

export const ConfirmationReceipt: React.FC<ConfirmationReceiptProps> = ({
  reservation,
  onClose,
  onSendInstantReminder,
  onViewInStaffDashboard,
}) => {
  const [reminderSent, setReminderSent] = useState(false);

  // Generate .ics calendar download
  const handleDownloadIcs = () => {
    const startDate = reservation.checkInDate.replace(/-/g, '');
    const endDate = reservation.checkOutDate.replace(/-/g, '');
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nusa Seaside Resort//Reservation//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${reservation.id}@nusaresort.bali
DTSTART;VALUE=DATE:${startDate}
DTEND;VALUE=DATE:${endDate}
SUMMARY:Stay at ${reservation.hotelName} - Nusa Seaside Resort
DESCRIPTION:Reservation #${reservation.id}\\nGuest: ${reservation.guestName}\\nKey Passcode: #${reservation.keyPasscode}\\nDirect Resort Concierge: +62 361 849 000
LOCATION:Nusa Seaside Resort & Villas, Bali
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Nusa_Resort_${reservation.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleTriggerNotification = () => {
    onSendInstantReminder(reservation);
    setReminderSent(true);
  };

  return (
    <div
      id="booking-confirmation-receipt"
      className="p-6 md:p-8 space-y-6 text-white max-w-2xl mx-auto"
    >
      {/* Success Badge */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="font-meta text-xs uppercase tracking-widest text-[#d4af37]">
          Reservation Confirmed & Guaranteed
        </span>
        <h2 className="font-editorial text-3xl font-medium tracking-tight text-[#fbf8f2]">
          We Await Your Arrival
        </h2>
        <p className="text-xs text-white/60 max-w-md mx-auto">
          Your reservation has been secured and registered in our central resort system. A confirmation package has been prepared for <strong className="text-white">{reservation.guestEmail}</strong>.
        </p>
      </div>

      {/* Booking Key Passcode Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
        <div className="space-y-3">
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest block">
              Booking Reference
            </span>
            <span className="font-meta text-xl font-bold text-[#d4af37] tracking-wider">
              {reservation.id}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest block">
              Digital Villa Key Passcode
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <Key className="w-4 h-4 text-emerald-400" />
              <span className="font-meta text-lg font-bold text-white tracking-widest">
                #{reservation.keyPasscode}
              </span>
              <span className="text-[10px] text-white/50">(Keyless smart entry)</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest block">
              Reserved Villa
            </span>
            <span className="text-sm font-semibold text-white block">
              {reservation.hotelName}
            </span>
          </div>
        </div>

        {/* Simulated QR Code Box */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-black/40 border border-white/10 text-center">
          {/* Stylized high-contrast QR visual */}
          <div className="w-24 h-24 bg-white p-2 rounded-lg flex items-center justify-center shadow-md">
            <svg viewBox="0 0 100 100" className="w-full h-full text-black fill-current">
              <rect x="0" y="0" width="30" height="30" />
              <rect x="5" y="5" width="20" height="20" fill="white" />
              <rect x="10" y="10" width="10" height="10" />

              <rect x="70" y="0" width="30" height="30" />
              <rect x="75" y="5" width="20" height="20" fill="white" />
              <rect x="80" y="10" width="10" height="10" />

              <rect x="0" y="70" width="30" height="30" />
              <rect x="5" y="75" width="20" height="20" fill="white" />
              <rect x="10" y="80" width="10" height="10" />

              <rect x="35" y="10" width="10" height="20" />
              <rect x="50" y="5" width="15" height="10" />
              <rect x="40" y="35" width="20" height="20" />
              <rect x="70" y="45" width="10" height="25" />
              <rect x="35" y="65" width="15" height="15" />
              <rect x="60" y="70" width="20" height="15" />
            </svg>
          </div>
          <span className="font-meta text-[10px] text-white/50 tracking-wider mt-2">
            NUSA-PASS-{reservation.id}
          </span>
          <span className="text-[10px] text-[#d4af37]">Scan at airport or arrival lounge</span>
        </div>
      </div>

      {/* Reservation Details Breakdown */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
        <h4 className="text-xs uppercase font-meta tracking-wider text-white/60">
          Stay & Financial Summary
        </h4>

        <div className="grid grid-cols-2 gap-2 text-xs border-b border-white/10 pb-3">
          <div>
            <span className="text-white/40 block">Check-in Date</span>
            <span className="font-medium text-white">{reservation.checkInDate} (From 14:00)</span>
          </div>
          <div>
            <span className="text-white/40 block">Check-out Date</span>
            <span className="font-medium text-white">{reservation.checkOutDate} (Until 12:00)</span>
          </div>
          <div className="mt-1">
            <span className="text-white/40 block">Total Duration</span>
            <span className="font-medium text-white">{reservation.nights} Nights</span>
          </div>
          <div className="mt-1">
            <span className="text-white/40 block">Guests</span>
            <span className="font-medium text-white">
              {reservation.guestsCount.adults} Adults
              {reservation.guestsCount.children > 0 ? `, ${reservation.guestsCount.children} Children` : ''}
            </span>
          </div>
        </div>

        {/* Pricing Rows */}
        <div className="space-y-1.5 text-xs text-white/70">
          <div className="flex justify-between">
            <span>
              Villa Accommodation ({reservation.nights} nights x ${reservation.pricing.nightlyRate})
            </span>
            <span className="text-white">${reservation.pricing.roomTotal.toFixed(2)}</span>
          </div>
          {reservation.pricing.addOnsTotal > 0 && (
            <div className="flex justify-between">
              <span>Selected Resort Experiences & Add-ons</span>
              <span className="text-white">${reservation.pricing.addOnsTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Resort Service Fee (10%)</span>
            <span className="text-white">${reservation.pricing.serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Balinese Regional Tourism Tax (5%)</span>
            <span className="text-white">${reservation.pricing.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-sm text-[#d4af37] pt-2 border-t border-white/10">
            <span>Grand Total Settled</span>
            <span>${reservation.pricing.grandTotal.toFixed(2)} USD</span>
          </div>
        </div>
      </div>

      {/* Automated Notifications & Guest Reminders Section */}
      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-300">
              Automated Notification Center
            </span>
          </div>
          <span className="text-[10px] text-indigo-300/70 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
            Active Automation
          </span>
        </div>
        <p className="text-xs text-indigo-200/70">
          Confirmation email dispatched to <strong>{reservation.guestEmail}</strong>. Automatic pre-arrival reminder scheduled for 24h prior to check-in.
        </p>

        <button
          type="button"
          id="btn-trigger-instant-reminder"
          onClick={handleTriggerNotification}
          disabled={reminderSent}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 cursor-pointer ${
            reminderSent
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-200 hover:bg-indigo-500/30'
          }`}
        >
          {reminderSent ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Test Pre-Arrival Reminder Triggered & Logged!</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span>Simulate Triggering Pre-Arrival Guest Reminder Now</span>
            </>
          )}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
        <button
          type="button"
          id="btn-download-ics"
          onClick={handleDownloadIcs}
          className="p-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-medium text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <Calendar className="w-4 h-4 text-[#d4af37]" />
          <span>Add to Calendar (.ics)</span>
        </button>

        <button
          type="button"
          id="btn-print-receipt"
          onClick={handlePrint}
          className="p-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-medium text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <Printer className="w-4 h-4 text-white/70" />
          <span>Print Receipt</span>
        </button>

        {onViewInStaffDashboard && (
          <button
            type="button"
            id="btn-view-in-staff-dashboard"
            onClick={onViewInStaffDashboard}
            className="col-span-2 md:col-span-1 p-3 rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-xs font-semibold text-[#d4af37] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>Staff Portal View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Done button */}
      <div className="text-center pt-2">
        <button
          type="button"
          id="btn-return-resort-after-booking"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors cursor-pointer"
        >
          Done & Return to Resort Map
        </button>
      </div>
    </div>
  );
};
