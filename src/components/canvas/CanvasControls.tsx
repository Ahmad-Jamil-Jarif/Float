import React from 'react';
import { Plus, Minus, RotateCcw, Volume2, VolumeX, Sun, Sunset, Moon } from 'lucide-react';
import { TimeOfDay, HotelCategory } from '../../types';
import { resortAudio } from '../../services/soundService';

interface CanvasControlsProps {
  timeOfDay: TimeOfDay;
  onChangeTimeOfDay: (time: TimeOfDay) => void;
  selectedCategory: HotelCategory | 'all';
  onSelectCategory: (category: HotelCategory | 'all') => void;
  onResetView: () => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  timeOfDay,
  onChangeTimeOfDay,
  selectedCategory,
  onSelectCategory,
  onResetView,
  isAudioPlaying,
  onToggleAudio,
  onZoomIn,
  onZoomOut,
}) => {
  const categories: { id: HotelCategory | 'all'; label: string; count: string }[] = [
    { id: 'all', label: 'All Villas', count: '8' },
    { id: 'basic', label: 'Basic', count: '2' },
    { id: 'comfort', label: 'Comfort', count: '2' },
    { id: 'deluxe', label: 'Deluxe', count: '2' },
    { id: 'premium', label: 'Signature', count: '2' },
  ];

  return (
    <>
      {/* Top Left: Category Filter Bar */}
      <div className="absolute top-20 left-4 md:left-8 z-20 flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-[#09121a]/80 backdrop-blur-md border border-white/10 shadow-xl max-w-[calc(100vw-32px)]">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`filter-cat-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#d4af37] text-black font-semibold shadow-md shadow-[#d4af37]/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-white/60'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Left: Atmospheric & Audio Controls */}
      <div className="absolute bottom-6 left-4 md:left-8 z-20 flex flex-col gap-2">
        {/* Time of Day Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#09121a]/85 backdrop-blur-md border border-white/10 shadow-xl">
          <button
            id="tod-day"
            title="Tropical Day"
            onClick={() => onChangeTimeOfDay('day')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              timeOfDay === 'day'
                ? 'bg-sky-500/30 text-sky-300 border border-sky-400/40'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            id="tod-sunset"
            title="Golden Hour Sunset"
            onClick={() => onChangeTimeOfDay('sunset')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              timeOfDay === 'sunset'
                ? 'bg-amber-500/30 text-amber-300 border border-amber-400/40'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sunset className="w-4 h-4" />
          </button>
          <button
            id="tod-twilight"
            title="Moonlit Twilight"
            onClick={() => onChangeTimeOfDay('twilight')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              timeOfDay === 'twilight'
                ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/40'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Ambient Waves Audio Switch */}
        <button
          id="btn-toggle-ambient-audio"
          onClick={onToggleAudio}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-md border transition-all text-xs font-medium cursor-pointer ${
            isAudioPlaying
              ? 'bg-[#0d221f]/90 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-950/40'
              : 'bg-[#09121a]/85 border-white/10 text-white/60 hover:text-white'
          }`}
          title="Gentle synthesized ocean waves sound"
        >
          {isAudioPlaying ? (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Waves Sound: Active</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-white/50" />
              <span>Waves Sound: Muted</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom Right: Zoom & Reset Camera Controls */}
      <div className="absolute bottom-6 right-4 md:right-8 z-20 flex flex-col items-end gap-2">
        <div className="hidden sm:block text-[11px] font-meta text-white/50 tracking-wider bg-[#09121a]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
          DRAG TO PAN · SCROLL TO ZOOM · TAP VILLA
        </div>

        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#09121a]/85 backdrop-blur-md border border-white/10 shadow-xl">
          <button
            id="btn-zoom-in"
            title="Zoom In"
            onClick={onZoomIn}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            id="btn-zoom-out"
            title="Zoom Out"
            onClick={onZoomOut}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-white/15 my-auto mx-0.5" />
          <button
            id="btn-reset-view"
            title="Reset Resort Overview"
            onClick={onResetView}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline pr-1">Overview</span>
          </button>
        </div>
      </div>
    </>
  );
};
