import React, { useState } from 'react';
import {
  X,
  Star,
  Users,
  Maximize2,
  Bed,
  Bath,
  CheckCircle2,
  Compass,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  Calendar,
  Waves,
  Building2,
  DoorOpen,
} from 'lucide-react';
import { Hotel, TourPoint } from '../../types';

interface PropertyTourModalProps {
  hotel: Hotel;
  onClose: () => void;
  onBookNow: (hotel: Hotel) => void;
  activeTourPointId: string | null;
  onSelectTourPoint: (point: TourPoint) => void;
  isTourMode: boolean;
  onToggleTourMode: () => void;
}

export const PropertyTourModal: React.FC<PropertyTourModalProps> = ({
  hotel,
  onClose,
  onBookNow,
  activeTourPointId,
  onSelectTourPoint,
  isTourMode,
  onToggleTourMode,
}) => {
  const [selectedImageTab, setSelectedImageTab] = useState<'hero' | string>('hero');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string | null>(
    hotel.rooms && hotel.rooms.length > 0 ? hotel.rooms[0].roomNumber : null
  );

  const activeTourPoint = hotel.tourPoints.find((tp) => tp.id === activeTourPointId) || hotel.tourPoints[0];
  const activeRoom = hotel.rooms?.find((r) => r.roomNumber === selectedRoomNumber) || hotel.rooms?.[0];

  return (
    <div
      id="property-tour-modal"
      className="fixed inset-y-0 right-0 z-40 w-full max-w-xl md:max-w-2xl bg-[#0b141be8] backdrop-blur-2xl border-l border-white/10 text-white shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 animate-in slide-in-from-right"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#070e13]/60">
        <div className="flex items-center gap-2">
          <span className="font-meta text-[11px] uppercase tracking-widest text-[#d4af37]">
            {hotel.categoryLabel}
          </span>
          <span className="text-white/30">·</span>
          <span className="text-xs text-white/60 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#d4af37]" />
            {hotel.zone}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-tour-canvas"
            onClick={onToggleTourMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isTourMode
                ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
                : 'border-white/15 text-white/70 hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isTourMode ? 'Canvas Focus: ON' : 'Canvas Tour Pins'}</span>
          </button>

          <button
            id="btn-close-property-tour"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Return to Overview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Title & Tagline */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-editorial text-2xl md:text-3xl font-medium tracking-tight text-[#fbf8f2]">
                {hotel.name}
              </h2>
              <p className="mt-1 text-sm text-white/65 italic font-editorial">
                "{hotel.tagline}"
              </p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <div className="flex items-center gap-1 bg-[#d4af37]/15 border border-[#d4af37]/30 px-2.5 py-1 rounded-full text-xs font-semibold text-[#d4af37]">
                <Star className="w-3.5 h-3.5 fill-[#d4af37]" />
                <span>{hotel.rating.toFixed(2)}</span>
              </div>
              <span className="text-[10px] text-white/40 mt-0.5">{hotel.reviewCount} verified reviews</span>
            </div>
          </div>

          {/* Special Highlights: Rooftop Swimming Pool Banner for Floor 10 */}
          {hotel.hasPool && (
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-[#0d2a3a] to-cyan-950/70 border border-cyan-400/40 shadow-xl shadow-cyan-950/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
                  <Waves className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      Rooftop Infinity Swimming Pool
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-[10px] font-semibold text-cyan-200 border border-cyan-400/40">
                      Signature Feature
                    </span>
                  </div>
                  <p className="text-xs text-cyan-100/80 mt-0.5">
                    Private 10th-floor cantilevered glass-bottom infinity pool overlooking the coastal sea horizon, with sun cabanas and cocktail service.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Building Floor & Balcony Tag */}
          {hotel.isBuildingFloor && (
            <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
              <Building2 className="w-4 h-4 text-[#d4af37]" />
              <span className="text-white/80">
                <strong>Cliffside Ocean Tower · Floor {hotel.floorNumber}</strong> · Includes private glass sunset balcony on the west wing
              </span>
            </div>
          )}

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-4 gap-2 mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
            <div>
              <span className="block text-[10px] text-white/40 uppercase tracking-wider">Guests</span>
              <span className="text-xs font-medium text-white flex items-center justify-center gap-1 mt-0.5">
                <Users className="w-3 h-3 text-[#d4af37]" /> {hotel.maxGuests} Max
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-white/40 uppercase tracking-wider">Bedrooms</span>
              <span className="text-xs font-medium text-white flex items-center justify-center gap-1 mt-0.5">
                <Bed className="w-3 h-3 text-[#d4af37]" /> {hotel.bedrooms}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-white/40 uppercase tracking-wider">Bathrooms</span>
              <span className="text-xs font-medium text-white flex items-center justify-center gap-1 mt-0.5">
                <Bath className="w-3 h-3 text-[#d4af37]" /> {hotel.bathrooms}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-white/40 uppercase tracking-wider">Area</span>
              <span className="text-xs font-medium text-white flex items-center justify-center gap-1 mt-0.5">
                <Maximize2 className="w-3 h-3 text-[#d4af37]" /> {hotel.sqm} m²
              </span>
            </div>
          </div>

          {/* 2 Hotel Rooms on this Floor */}
          {hotel.rooms && hotel.rooms.length > 0 && (
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DoorOpen className="w-4 h-4 text-[#d4af37]" />
                  <h3 className="font-meta text-xs uppercase tracking-widest text-white/80">
                    Floor {hotel.floorNumber} Hotel Rooms (2 Rooms Available)
                  </h3>
                </div>
                <span className="text-[11px] text-[#d4af37]">Select a room to inspect</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hotel.rooms.map((room) => {
                  const isRoomActive = selectedRoomNumber === room.roomNumber;
                  return (
                    <div
                      key={room.roomNumber}
                      onClick={() => setSelectedRoomNumber(room.roomNumber)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isRoomActive
                          ? 'bg-[#d4af37]/10 border-[#d4af37] shadow-lg shadow-[#d4af37]/10'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                            isRoomActive ? 'bg-[#d4af37] text-black' : 'bg-white/10 text-white'
                          }`}>
                            Room {room.roomNumber}
                          </span>
                          <span className="text-xs font-medium text-white">{room.type}</span>
                        </div>
                        <span className="font-editorial text-sm font-bold text-[#d4af37]">
                          ${room.pricePerNight} <span className="text-[10px] text-white/50 font-sans">/nt</span>
                        </span>
                      </div>

                      <p className="mt-2 text-xs font-semibold text-[#f7f4ee]">
                        {room.name}
                      </p>

                      <div className="mt-2 flex items-center gap-3 text-[11px] text-white/60">
                        <span className="flex items-center gap-1">
                          <Bed className="w-3 h-3 text-[#d4af37]" /> {room.bed}
                        </span>
                        <span className="flex items-center gap-1">
                          <Maximize2 className="w-3 h-3 text-[#d4af37]" /> {room.sqm} m²
                        </span>
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {room.features.map((feat, fi) => (
                          <span
                            key={fi}
                            className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-white/70"
                          >
                            • {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Tour Hotspot Viewer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-meta text-xs uppercase tracking-widest text-white/50">
              Interactive Tour Viewpoints
            </h3>
            <span className="text-[11px] text-[#d4af37]">Click to inspect space</span>
          </div>

          {/* Hotspot Pills */}
          <div className="flex flex-wrap gap-2">
            {hotel.tourPoints.map((tp) => {
              const isSelected = activeTourPoint?.id === tp.id;
              return (
                <button
                  key={tp.id}
                  id={`tour-btn-${tp.id}`}
                  onClick={() => {
                    onSelectTourPoint(tp);
                    setSelectedImageTab(tp.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#d4af37] border-[#d4af37] text-black font-semibold shadow-lg shadow-[#d4af37]/20'
                      : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Sparkles className={`w-3 h-3 ${isSelected ? 'text-black' : 'text-[#d4af37]'}`} />
                  <span>{tp.name}</span>
                </button>
              );
            })}
          </div>

          {/* Visual Showcase Card */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 group aspect-[16/10]">
            <img
              src={activeTourPoint?.imageUrl || hotel.heroImage}
              alt={activeTourPoint?.title || hotel.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#091117] via-transparent to-black/20" />

            {/* Hotspot details overlay */}
            <div className="absolute bottom-0 inset-x-0 p-4">
              <span className="font-meta text-[10px] uppercase tracking-widest text-[#d4af37]">
                {activeTourPoint?.type} viewpoint
              </span>
              <h4 className="font-editorial text-lg font-medium text-white">
                {activeTourPoint?.title}
              </h4>
              <p className="text-xs text-white/80 mt-1 line-clamp-2">
                {activeTourPoint?.description}
              </p>

              {/* Specific features */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activeTourPoint?.features.map((feat, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-black/60 border border-white/15 px-2 py-0.5 rounded-md text-white/80 backdrop-blur-sm"
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Description */}
        <div>
          <h3 className="font-meta text-xs uppercase tracking-widest text-white/50 mb-2">
            The Residence Experience
          </h3>
          <p className="text-sm text-white/75 leading-relaxed font-sans">
            {hotel.description}
          </p>
        </div>

        {/* Signature Highlights */}
        <div>
          <h3 className="font-meta text-xs uppercase tracking-widest text-white/50 mb-2.5">
            Key Stay Inclusions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {hotel.highlights.map((highlight, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-white/90"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comprehensive Facilities List */}
        <div>
          <h3 className="font-meta text-xs uppercase tracking-widest text-white/50 mb-2.5">
            Curated Amenities & Facilities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {hotel.facilities.map((fac) => (
              <div
                key={fac.id}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <span className="text-xs font-semibold text-white block">{fac.name}</span>
                <span className="text-[11px] text-white/50 block mt-0.5">{fac.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Guest Guarantee */}
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-emerald-300 block">
              Direct Resort Guarantee & Free Cancellation
            </span>
            <span className="text-emerald-400/70 mt-0.5 block">
              100% full refund up to 72 hours before scheduled arrival. Includes dedicated villa host & concierge.
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="p-5 border-t border-white/10 bg-[#070e13]/90 backdrop-blur-xl flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] text-white/50 uppercase tracking-wider block">
            {hotel.isBuildingFloor && activeRoom
              ? `Room ${activeRoom.roomNumber} Rate`
              : 'Total Nightly Rate'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-editorial text-2xl font-bold text-[#d4af37]">
              ${hotel.isBuildingFloor && activeRoom ? activeRoom.pricePerNight : hotel.pricePerNight}
            </span>
            <span className="text-xs text-white/60 font-sans">USD / night</span>
          </div>
        </div>

        <button
          id="btn-book-now-from-tour"
          onClick={() => {
            if (hotel.isBuildingFloor && activeRoom) {
              // Pass a hotel copy tailored with active room
              const tailoredHotel: Hotel = {
                ...hotel,
                pricePerNight: activeRoom.pricePerNight,
                name: `${hotel.name} · Room ${activeRoom.roomNumber}`,
              };
              onBookNow(tailoredHotel);
            } else {
              onBookNow(hotel);
            }
          }}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6c65c] text-black font-semibold text-sm shadow-xl shadow-[#d4af37]/25 hover:shadow-[#d4af37]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-black" />
          <span>
            {hotel.hasPool
              ? 'Reserve Rooftop Penthouse & Pool'
              : hotel.isBuildingFloor
              ? `Reserve Floor ${hotel.floorNumber} Stay`
              : 'Reserve This Villa'}
          </span>
          <ArrowRight className="w-4 h-4 text-black" />
        </button>
      </div>
    </div>
  );
};
