import React, { useState, useMemo } from 'react';
import {
  Star,
  Users,
  Maximize2,
  Bed,
  Bath,
  CheckCircle2,
  Calendar,
  Compass,
  ArrowRight,
  Filter,
  Search,
} from 'lucide-react';
import { Hotel, HotelCategory } from '../../types';

interface AccessibleListViewProps {
  hotels: Hotel[];
  onSelectHotel: (hotel: Hotel) => void;
  onBookHotel: (hotel: Hotel) => void;
  selectedCategory: HotelCategory | 'all';
  onSelectCategory: (category: HotelCategory | 'all') => void;
  onReturnToCanvas: () => void;
}

export const AccessibleListView: React.FC<AccessibleListViewProps> = ({
  hotels,
  onSelectHotel,
  onBookHotel,
  selectedCategory,
  onSelectCategory,
  onReturnToCanvas,
}) => {
  const [search, setSearch] = useState('');

  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      const matchesCategory = selectedCategory === 'all' || h.category === selectedCategory;
      const matchesSearch =
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.tagline.toLowerCase().includes(search.toLowerCase()) ||
        h.zone.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [hotels, selectedCategory, search]);

  return (
    <div
      id="accessible-villa-directory"
      className="w-full min-h-screen bg-[#09121a] text-white p-4 md:p-8 space-y-6"
    >
      {/* Header & Accessibility Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="font-meta text-xs uppercase tracking-widest text-[#d4af37]">
            Accessible Directory
          </span>
          <h1 className="font-editorial text-2xl md:text-3xl font-medium tracking-tight text-white mt-1">
            Resort Villa & Cottage Collection
          </h1>
          <p className="text-xs text-white/60 mt-1 max-w-xl">
            Full screen-reader compatible directory with high-contrast accessibility standards. Explore all 8 overwater and beachfront sanctuaries.
          </p>
        </div>

        <button
          id="btn-return-to-interactive-canvas"
          onClick={onReturnToCanvas}
          className="px-4 py-2.5 rounded-xl bg-[#d4af37] text-black font-semibold text-xs shadow-lg shadow-[#d4af37]/20 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Compass className="w-4 h-4" />
          <span>Switch to 2.5D Canvas World</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search villa name, zone, amenities..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1">
          {(['all', 'basic', 'comfort', 'deluxe', 'premium'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#d4af37] text-black font-semibold shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Villas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((hotel) => (
          <article
            key={hotel.id}
            className="group rounded-3xl border border-white/10 bg-white/[0.02] hover:border-[#d4af37]/40 hover:bg-white/[0.04] transition-all duration-300 overflow-hidden flex flex-col shadow-xl"
          >
            {/* Image Header */}
            <div className="relative aspect-[16/10] overflow-hidden bg-black/50">
              <img
                src={hotel.heroImage}
                alt={hotel.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09121a] via-transparent to-black/30" />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                <span className="font-meta text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#d4af37] border border-[#d4af37]/30">
                  {hotel.categoryLabel}
                </span>
                {hotel.hasPool && (
                  <span className="font-sans text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/80 text-white shadow-md">
                    🌊 Rooftop Swimming Pool
                  </span>
                )}
                {hotel.isBuildingFloor && (
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/80 text-white">
                    Floor {hotel.floorNumber}
                  </span>
                )}
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-xs font-semibold border border-white/10">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{hotel.rating.toFixed(2)}</span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/75">
                <span>{hotel.zone}</span>
                <span>{hotel.sqm} m² · {hotel.maxGuests} Guests</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h2 className="font-editorial text-xl font-semibold text-white group-hover:text-[#d4af37] transition-colors">
                  {hotel.name}
                </h2>
                <p className="text-xs text-white/60 italic font-editorial mt-0.5 line-clamp-1">
                  "{hotel.tagline}"
                </p>

                <p className="text-xs text-white/70 mt-2 line-clamp-2 leading-relaxed font-sans">
                  {hotel.description}
                </p>

                {/* Facilities Pills */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {hotel.highlights.slice(0, 3).map((hl, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-white/75"
                    >
                      ✓ {hl}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-white/40 uppercase block">From</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-editorial text-xl font-bold text-[#d4af37]">
                      ${hotel.pricePerNight}
                    </span>
                    <span className="text-[10px] text-white/50">/ night</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectHotel(hotel)}
                    className="px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-white font-medium transition-colors cursor-pointer"
                  >
                    Inspect Tour
                  </button>

                  <button
                    onClick={() => onBookHotel(hotel)}
                    className="px-4 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-semibold shadow-md shadow-[#d4af37]/20 hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    Reserve
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
