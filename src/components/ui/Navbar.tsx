import React from 'react';
import {
  Compass,
  List,
  ShieldCheck,
  Bell,
  Calendar,
  Sparkles,
  MapPin,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'canvas' | 'list' | 'staff';
  onSwitchView: (view: 'canvas' | 'list' | 'staff') => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenQuickBook: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSwitchView,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenQuickBook,
}) => {
  return (
    <header className="absolute top-0 inset-x-0 z-30 h-16 md:h-18 px-4 md:px-8 flex items-center justify-between border-b border-white/10 bg-[#070e14]/80 backdrop-blur-xl select-none">
      {/* Brand Logo & Editorial Title */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => onSwitchView('canvas')}
      >
        <div className="w-8 h-8 rounded-full border border-[#d4af37]/60 flex items-center justify-center bg-[#d4af37]/10 group-hover:scale-105 transition-transform">
          <Sparkles className="w-4 h-4 text-[#d4af37]" />
        </div>
        <div>
          <span className="font-editorial text-lg md:text-xl font-medium tracking-wide text-[#fbf8f2] block leading-none">
            NUSA SEASIDE
          </span>
          <span className="font-meta text-[9px] uppercase tracking-[0.25em] text-[#d4af37] block mt-0.5">
            RESORT & VILLAS · BALI
          </span>
        </div>
      </div>

      {/* Center View Controls (Canvas vs List) */}
      <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10">
        <button
          id="nav-btn-canvas"
          onClick={() => onSwitchView('canvas')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            currentView === 'canvas'
              ? 'bg-[#d4af37] text-black font-semibold shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Interactive Canvas</span>
        </button>

        <button
          id="nav-btn-list"
          onClick={() => onSwitchView('list')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            currentView === 'list'
              ? 'bg-[#d4af37] text-black font-semibold shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>Villa Directory</span>
        </button>
      </nav>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile View Toggle */}
        <div className="flex md:hidden items-center p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            onClick={() => onSwitchView('canvas')}
            className={`p-1.5 rounded-lg text-xs ${
              currentView === 'canvas' ? 'bg-[#d4af37] text-black' : 'text-white/60'
            }`}
            title="Canvas"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSwitchView('list')}
            className={`p-1.5 rounded-lg text-xs ${
              currentView === 'list' ? 'bg-[#d4af37] text-black' : 'text-white/60'
            }`}
            title="List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Staff Dashboard Portal Switch */}
        <button
          id="nav-btn-staff-portal"
          onClick={() => onSwitchView(currentView === 'staff' ? 'canvas' : 'staff')}
          className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            currentView === 'staff'
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/50'
              : 'bg-white/[0.03] border-white/15 text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
          <span className="hidden sm:inline">Staff Hub</span>
          <span className="sm:hidden">Staff</span>
        </button>

        {/* Notification Bell with Badge */}
        <button
          id="nav-btn-notifications"
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Notification Center & Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#d4af37] text-black font-bold text-[9px] flex items-center justify-center animate-bounce shadow-md">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Book a Stay CTA */}
        {currentView !== 'staff' && (
          <button
            id="nav-btn-quick-book"
            onClick={onOpenQuickBook}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e8cb6b] text-black text-xs font-semibold shadow-lg shadow-[#d4af37]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">Reserve a Stay</span>
            <span className="sm:hidden">Book</span>
          </button>
        )}
      </div>
    </header>
  );
};
