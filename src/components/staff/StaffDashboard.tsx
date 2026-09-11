import React, { useState, useMemo } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  ShieldCheck,
  Bed,
  Plus,
  Edit,
  Mail,
  Smartphone,
  Sparkles,
  ArrowUpDown,
  Home,
  AlertCircle,
} from 'lucide-react';
import { Reservation, GuestProfile, Hotel, ReservationStatus } from '../../types';

interface StaffDashboardProps {
  reservations: Reservation[];
  guests: GuestProfile[];
  hotels: Hotel[];
  onUpdateReservationStatus: (resId: string, newStatus: ReservationStatus) => void;
  onUpdateHotelStatus: (hotelId: string, newStatus: 'available' | 'reserved' | 'cleaning' | 'maintenance') => void;
  onSendReminder: (reservation: Reservation) => void;
  onUpdateGuestNotes: (guestId: string, notes: string) => void;
  onOpenNewBookingModal: () => void;
  onSwitchToGuestView: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  reservations,
  guests,
  hotels,
  onUpdateReservationStatus,
  onUpdateHotelStatus,
  onSendReminder,
  onUpdateGuestNotes,
  onOpenNewBookingModal,
  onSwitchToGuestView,
}) => {
  const [activeTab, setActiveTab] = useState<'reservations' | 'guests' | 'housekeeping'>('reservations');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedGuestForNote, setSelectedGuestForNote] = useState<GuestProfile | null>(null);
  const [editingNote, setEditingNote] = useState('');

  // Operational KPIs
  const kpis = useMemo(() => {
    const totalReservations = reservations.length;
    const checkedInCount = reservations.filter((r) => r.status === 'checked_in').length;
    const confirmedCount = reservations.filter((r) => r.status === 'confirmed').length;
    const totalRevenue = reservations.reduce((acc, r) => acc + r.pricing.grandTotal, 0);
    const occupiedVillas = hotels.filter((h) => h.availabilityStatus === 'reserved').length;
    const occupancyRate = Math.round((occupiedVillas / hotels.length) * 100);

    return {
      occupancyRate,
      checkedInCount,
      confirmedCount,
      totalRevenue,
      totalVillas: hotels.length,
      adr: totalReservations > 0 ? Math.round(totalRevenue / totalReservations) : 0,
    };
  }, [reservations, hotels]);

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchesSearch =
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.guestEmail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchQuery, statusFilter]);

  // Filtered guests
  const filteredGuests = useMemo(() => {
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [guests, searchQuery]);

  const handleSaveNote = () => {
    if (selectedGuestForNote) {
      onUpdateGuestNotes(selectedGuestForNote.id, editingNote);
      setSelectedGuestForNote(null);
    }
  };

  return (
    <div id="staff-dashboard" className="w-full min-h-screen bg-[#070e14] text-white p-4 md:p-8 space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-meta text-xs uppercase tracking-widest text-[#d4af37]">
              Operations Control
            </span>
            <span className="text-white/30">·</span>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Central Sync
            </span>
          </div>
          <h1 className="font-editorial text-2xl md:text-3xl font-medium tracking-tight text-white mt-1">
            Resort Staff Operations & Reservation Hub
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-create-walkin-booking"
            onClick={onOpenNewBookingModal}
            className="px-4 py-2 rounded-xl bg-[#d4af37] text-black font-semibold text-xs shadow-lg shadow-[#d4af37]/20 hover:scale-[1.02] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Reservation</span>
          </button>

          <button
            id="btn-back-to-guest-experience"
            onClick={onSwitchToGuestView}
            className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Return to Canvas Map</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-xs font-meta uppercase tracking-wider">Occupancy Rate</span>
            <TrendingUp className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-2xl md:text-3xl font-bold text-white">
              {kpis.occupancyRate}%
            </span>
            <span className="text-xs text-white/50">{kpis.totalVillas} Villas Total</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-xs font-meta uppercase tracking-wider">In-House Guests</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-2xl md:text-3xl font-bold text-emerald-400">
              {kpis.checkedInCount} Active
            </span>
            <span className="text-xs text-white/50">{kpis.confirmedCount} Upcoming</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-xs font-meta uppercase tracking-wider">Total Booking Volume</span>
            <DollarSign className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-2xl md:text-3xl font-bold text-[#d4af37]">
              ${kpis.totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-white/50">USD Settled</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-xs font-meta uppercase tracking-wider">Average Daily Rate (ADR)</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-2xl md:text-3xl font-bold text-white">
              ${kpis.adr}
            </span>
            <span className="text-xs text-white/50">Per Stay</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between border-b border-white/10 pb-1">
        <div className="flex items-center gap-2">
          <button
            id="tab-btn-reservations"
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'reservations'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Reservations & Bookings ({reservations.length})</span>
          </button>

          <button
            id="tab-btn-guests"
            onClick={() => setActiveTab('guests')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'guests'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Guest Profiles ({guests.length})</span>
          </button>

          <button
            id="tab-btn-housekeeping"
            onClick={() => setActiveTab('housekeeping')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'housekeeping'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bed className="w-4 h-4" />
            <span>Villa Status & Housekeeping ({hotels.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: RESERVATIONS TABLE */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guest, ID, villa, email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
              <span className="text-xs text-white/50 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" /> Status:
              </span>
              {['all', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {st.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-white/80">
                <thead className="bg-white/5 text-[11px] font-meta uppercase tracking-wider text-white/60 border-b border-white/10">
                  <tr>
                    <th className="p-4">Ref & Passcode</th>
                    <th className="p-4">Guest Information</th>
                    <th className="p-4">Reserved Villa</th>
                    <th className="p-4">Dates & Nights</th>
                    <th className="p-4">Settlement</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <span className="font-meta font-bold text-[#d4af37] block">{res.id}</span>
                        <span className="text-[10px] text-emerald-400 font-meta flex items-center gap-1 mt-0.5">
                          <Key className="w-3 h-3" /> #{res.keyPasscode}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-white block">{res.guestName}</span>
                        <span className="text-[11px] text-white/50 block">{res.guestEmail}</span>
                        <span className="text-[10px] text-white/40 block">{res.guestPhone}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-medium text-white block">{res.hotelName}</span>
                        <span className="text-[10px] text-[#d4af37] uppercase font-meta">
                          {res.hotelCategory}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="block text-white">
                          {res.checkInDate} → {res.checkOutDate}
                        </span>
                        <span className="text-[10px] text-white/50">
                          {res.nights} Nights · {res.guestsCount.adults} Adults
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-[#d4af37] block">
                          ${res.pricing.grandTotal.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-white/50 uppercase">
                          {res.paymentMethod.replace('_', ' ')} · {res.paymentStatus}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-block ${
                            res.status === 'checked_in'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : res.status === 'confirmed'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : res.status === 'checked_out'
                              ? 'bg-white/10 text-white/50'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {res.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {res.status === 'confirmed' && (
                            <button
                              onClick={() => onUpdateReservationStatus(res.id, 'checked_in')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-medium transition-colors cursor-pointer"
                              title="Check-In Guest"
                            >
                              Check In
                            </button>
                          )}

                          {res.status === 'checked_in' && (
                            <button
                              onClick={() => onUpdateReservationStatus(res.id, 'checked_out')}
                              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-colors cursor-pointer"
                              title="Check-Out Guest"
                            >
                              Check Out
                            </button>
                          )}

                          <button
                            onClick={() => onSendReminder(res)}
                            className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                            title="Dispatch Automated Reminder / Access Code"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          {res.status !== 'cancelled' && res.status !== 'checked_out' && (
                            <button
                              onClick={() => onUpdateReservationStatus(res.id, 'cancelled')}
                              className="p-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                              title="Cancel Reservation"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GUEST DIRECTORY */}
      {activeTab === 'guests' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-editorial text-lg font-medium text-white">{guest.name}</h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          guest.vipTier === 'Nusa Elite'
                            ? 'bg-[#d4af37] text-black'
                            : guest.vipTier === 'Gold'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-white/10 text-white/70'
                        }`}
                      >
                        ★ {guest.vipTier}
                      </span>
                    </div>
                    <span className="text-xs text-white/50">{guest.country} · {guest.email}</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedGuestForNote(guest);
                      setEditingNote(guest.notes);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                    title="Edit Guest Preferences"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-black/30 border border-white/5">
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase">Lifetime Stays</span>
                    <span className="font-semibold text-white">{guest.totalStays} Stays</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase">Total Expenditure</span>
                    <span className="font-semibold text-[#d4af37]">${guest.totalSpend.toLocaleString()} USD</span>
                  </div>
                </div>

                {/* Notes and preferences */}
                <div className="text-xs space-y-1">
                  <span className="text-white/40 text-[10px] uppercase block">Staff Notes & Directives</span>
                  <p className="text-white/80 italic font-sans bg-white/[0.01] p-2.5 rounded-lg border border-white/5">
                    "{guest.notes}"
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {guest.preferences.map((p, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-white/70"
                    >
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Guest Note Edit Modal */}
          {selectedGuestForNote && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl bg-[#0e171f] border border-[#d4af37]/40 p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white">
                  Update Staff Directives for {selectedGuestForNote.name}
                </h3>
                <textarea
                  value={editingNote}
                  onChange={(e) => setEditingNote(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedGuestForNote(null)}
                    className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-1.5 rounded-lg bg-[#d4af37] text-black font-semibold text-xs"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VILLA HOUSEKEEPING & STATUS */}
      {activeTab === 'housekeeping' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hotels.map((hotel) => {
              const currentReservation = reservations.find(
                (r) => r.hotelId === hotel.id && r.status === 'checked_in'
              );

              return (
                <div
                  key={hotel.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-meta text-[10px] text-[#d4af37] uppercase">
                      {hotel.category}
                    </span>
                    <span className="text-xs text-white/40">{hotel.zone}</span>
                  </div>

                  <h3 className="font-editorial text-base font-semibold text-white leading-tight">
                    {hotel.name}
                  </h3>

                  <div className="space-y-1">
                    <span className="text-[10px] text-white/40 uppercase block">Housekeeping Status</span>
                    <select
                      value={hotel.availabilityStatus}
                      onChange={(e) =>
                        onUpdateHotelStatus(
                          hotel.id,
                          e.target.value as 'available' | 'reserved' | 'cleaning' | 'maintenance'
                        )
                      }
                      className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider focus:outline-none cursor-pointer ${
                        hotel.availabilityStatus === 'available'
                          ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                          : hotel.availabilityStatus === 'reserved'
                          ? 'bg-blue-950/60 border border-blue-500/40 text-blue-300'
                          : hotel.availabilityStatus === 'cleaning'
                          ? 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
                          : 'bg-red-950/60 border border-red-500/40 text-red-300'
                      }`}
                    >
                      <option value="available" className="bg-[#09121a]">Vacant & Ready</option>
                      <option value="reserved" className="bg-[#09121a]">Occupied / Reserved</option>
                      <option value="cleaning" className="bg-[#09121a]">Turn-down Cleaning</option>
                      <option value="maintenance" className="bg-[#09121a]">Maintenance</option>
                    </select>
                  </div>

                  {currentReservation ? (
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs">
                      <span className="text-white/40 block text-[10px]">Current In-House Guest:</span>
                      <span className="font-semibold text-white block mt-0.5">
                        {currentReservation.guestName}
                      </span>
                      <span className="text-[10px] text-white/60">
                        Until {currentReservation.checkOutDate}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-white/40 italic py-1">
                      No active in-house guest.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
