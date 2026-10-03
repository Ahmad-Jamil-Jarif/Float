import React, { useEffect, useRef, useState } from 'react';
import { Hotel, HotelCategory, TimeOfDay, TourPoint } from '../../types';
import { renderOceanTower } from './renderBuilding';

interface ResortCanvasProps {
  hotels: Hotel[];
  selectedHotel: Hotel | null;
  selectedCategory: HotelCategory | 'all';
  timeOfDay: TimeOfDay;
  onSelectHotel: (hotel: Hotel) => void;
  onSelectTourPoint?: (point: TourPoint) => void;
  activeTourPointId?: string | null;
  isTourMode?: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  alpha: number;
  maxAlpha: number;
  seed: number;
}

// --- Module constants: hoisted out of render loop ---
const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 680;
const DEFAULT_CAM_Y = 475;
const TAU = Math.PI * 2;

const PIER_POINTS = [
  { x: 500, y: 535 },
  { x: 500, y: 440 },
  { x: 380, y: 360 },
  { x: 510, y: 240 },
  { x: 740, y: 370 },
  { x: 240, y: 220 },
];

const PALMS = [
  { x: 42, y: 645, scale: 1.15, sway: 0.45 },
  { x: 195, y: 630, scale: 1.05, sway: 0.35 },
  { x: 44, y: 530, scale: 0.95, sway: 0.5 },
  { x: 235, y: 550, scale: 0.9, sway: 0.6 },
  { x: 420, y: 630, scale: 1.0, sway: 0.5 },
  { x: 720, y: 620, scale: 1.15, sway: 0.35 },
  { x: 880, y: 605, scale: 1.05, sway: 0.55 },
  { x: 10, y: 600, scale: 1.2, sway: 0.4 },
  { x: 100, y: 620, scale: 1.1, sway: 0.5 },
  { x: 120, y: 590, scale: 0.9, sway: 0.4 },
  { x: 200, y: 640, scale: 1.0, sway: 0.4 },
  { x: 300, y: 630, scale: 1.0, sway: 0.5 },
];

const WAVE_LAYERS = [
  { y: 160, amp: 4, freq: 0.02, speed: 1.2, color: 'rgba(255,255,255,0.08)' },
  { y: 280, amp: 7, freq: 0.015, speed: 1.0, color: 'rgba(255,255,255,0.13)' },
  { y: 400, amp: 9, freq: 0.012, speed: 0.8, color: 'rgba(255,255,255,0.18)' },
  { y: 520, amp: 11, freq: 0.01, speed: 0.6, color: 'rgba(255,255,255,0.22)' },
];

const PILL_COLORS: Record<string, string> = {
  premium: '#b45309',
  deluxe: '#1d4ed8',
  comfort: '#0369a1',
  basic: '#047857',
};

function beachCurveAt(wx: number): number {
  return Math.sin(wx * 0.005 + 0.3) * 16 - Math.cos(wx * 0.009) * 8;
}

export const ResortCanvas: React.FC<ResortCanvasProps> = ({
  hotels,
  selectedHotel,
  selectedCategory,
  timeOfDay,
  onSelectHotel,
  onSelectTourPoint,
  activeTourPointId,
  isTourMode = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cameraRef = useRef({
    x: WORLD_WIDTH / 2,
    y: DEFAULT_CAM_Y,
    zoom: 1,
    targetX: WORLD_WIDTH / 2,
    targetY: DEFAULT_CAM_Y,
    targetZoom: 1,
  });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const cameraStartRef = useRef({ x: 0, y: 0 });
  const hoveredHotelRef = useRef<Hotel | null>(null);
  const hoveredHotspotRef = useRef<TourPoint | null>(null);
  const hoverRafRef = useRef(0);

  const [hoveredHotel, setHoveredHotel] = useState<Hotel | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const lastTooltipRef = useRef<{ id: string | null; x: number; y: number }>({ id: null, x: 0, y: 0 });

  const particlesRef = useRef<Particle[]>([]);

  // Latest props in a ref so the render loop mounts ONCE (no teardown on prop change)
  const liveRef = useRef({ hotels, selectedHotel, selectedCategory, timeOfDay, isTourMode, activeTourPointId });
  liveRef.current = { hotels, selectedHotel, selectedCategory, timeOfDay, isTourMode, activeTourPointId };

  // Standalone-villa / tower counts are derived inside the loop via liveRef (no extra work here).

  // Init particles once (reduced count: 45 -> 28, rects not arcs)
  useEffect(() => {
    const list: Particle[] = [];
    for (let i = 0; i < 28; i++) {
      list.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.25 - 0.1,
        alpha: Math.random() * 0.7 + 0.2,
        maxAlpha: Math.random() * 0.6 + 0.3,
        seed: Math.random() * TAU,
      });
    }
    particlesRef.current = list;
  }, []);

  // Camera targets (cheap effect, no canvas work)
  useEffect(() => {
    const cam = cameraRef.current;
    if (selectedHotel) {
      if (isTourMode && activeTourPointId) {
        const pt = selectedHotel.tourPoints.find((p) => p.id === activeTourPointId);
        if (pt) {
          cam.targetX = pt.view.x;
          cam.targetY = pt.view.y;
          cam.targetZoom = 1.65;
          return;
        }
      }
      if (selectedHotel.isBuildingFloor) {
        cam.targetX = selectedHotel.position.x + 10;
        cam.targetY = selectedHotel.position.y;
        cam.targetZoom = 1.5;
      } else {
        cam.targetX = selectedHotel.position.x;
        cam.targetY = selectedHotel.position.y;
        cam.targetZoom = 1.45;
      }
    } else {
      cam.targetX = WORLD_WIDTH / 2;
      cam.targetY = DEFAULT_CAM_Y;
      cam.targetZoom = 1;
    }
  }, [selectedHotel, isTourMode, activeTourPointId]);

  // Native non-passive wheel listener (React onWheel can't preventDefault efficiently)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
      const cam = cameraRef.current;
      cam.targetZoom = Math.max(0.75, Math.min(2.5, cam.targetZoom * zoomFactor));
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  // ===== MAIN RENDER LOOP (mounted once) =====
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true } as CanvasRenderingContext2DSettings);
    if (!ctx) return;

    let animationFrameId = 0;
    let time = 0;
    let frame = 0;
    let visible = true;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let cssW = 0;
    let cssH = 0;

    // Gradient caches (rebuilt only when key changes)
    let skyKey = '';
    let skyGrad: CanvasGradient | null = null;
    let oceanKey = '';
    let oceanGrad: CanvasGradient | null = null;
    let sandKey = '';
    let sandGrad: CanvasGradient | null = null;
    const pillWidthCache = new Map<string, number>();

    const ro = new ResizeObserver(() => {
      const ndpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (ndpr !== dpr) { dpr = ndpr; skyKey = ''; oceanKey = ''; sandKey = ''; }
    });
    if (container) ro.observe(container);

    const io = new IntersectionObserver(
      (entries) => { visible = entries[0]?.isIntersecting ?? true; },
      { threshold: 0 }
    );
    if (container) io.observe(container);
    const onVis = () => { /* document.hidden checked in loop */ };
    document.addEventListener('visibilitychange', onVis);

    const ensureSize = (): boolean => {
      const w = canvas.clientWidth || container?.clientWidth || 0;
      const h = canvas.clientHeight || container?.clientHeight || 0;
      if (!w || !h) return false;
      if (w !== cssW || h !== cssH) {
        cssW = w; cssH = h;
        skyKey = ''; oceanKey = ''; sandKey = '';
      }
      const bw = Math.round(w * dpr);
      const bh = Math.round(h * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      return true;
    };

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      if (!visible || document.hidden) return;
      if (!ensureSize()) return;
      const width = cssW;
      const height = cssH;

      const live = liveRef.current;
      const curTimeOfDay = live.timeOfDay;
      const curHotels = live.hotels;
      const curSelected = live.selectedHotel;
      const curCategory = live.selectedCategory;
      const curTourMode = live.isTourMode;
      const curActiveTp = live.activeTourPointId;

      // Idle detection: camera settled + no selection pulse needed at full rate
      const cam = cameraRef.current;
      const dx = cam.targetX - cam.x;
      const dy = cam.targetY - cam.y;
      const dz = cam.targetZoom - cam.zoom;
      const settled = Math.abs(dx) < 0.08 && Math.abs(dy) < 0.08 && Math.abs(dz) < 0.002;
      frame++;
      // At idle (no drag, settled camera), render at ~30fps. Interaction stays 60fps.
      if (settled && !isDraggingRef.current && frame % 2 === 0) {
        // Still advance camera lerp cheaply every other frame below; skip draw
        cam.x += dx * 0.07;
        cam.y += dy * 0.07;
        cam.zoom += dz * 0.07;
        time += 0.025;
        return;
      }

      time += 0.025;
      const zoom = cam.zoom;
      // Lerp camera
      cam.x += dx * 0.07;
      cam.y += dy * 0.07;
      cam.zoom += dz * 0.07;
      const cx = cam.x;
      const cy = cam.y;
      const cz = cam.zoom;
      const halfW = width / 2;
      const halfH = height / 2;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // --- 1. SKY (cached gradient) ---
      const newSkyKey = curTimeOfDay + '|' + height;
      if (newSkyKey !== skyKey || !skyGrad) {
        const g = ctx.createLinearGradient(0, 0, 0, height);
        if (curTimeOfDay === 'sunset') {
          g.addColorStop(0, '#1c1328');
          g.addColorStop(0.28, '#441d3e');
          g.addColorStop(0.55, '#a44136');
          g.addColorStop(0.78, '#d97736');
          g.addColorStop(1, '#1b3240');
        } else if (curTimeOfDay === 'twilight') {
          g.addColorStop(0, '#060b14');
          g.addColorStop(0.35, '#0c1a2c');
          g.addColorStop(0.7, '#112940');
          g.addColorStop(1, '#0b1c2b');
        } else {
          g.addColorStop(0, '#38bdf8');
          g.addColorStop(0.35, '#7dd3fc');
          g.addColorStop(0.65, '#a5f3fc');
          g.addColorStop(1, '#0e7490');
        }
        skyGrad = g;
        skyKey = newSkyKey;
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Celestial glow (1 radial/frame, culled if off-screen)
      const sunWx = curTimeOfDay === 'sunset' ? 250 : 780;
      const sunSx = halfW + (sunWx - cx) * cz;
      const sunSy = halfH + (100 - cy) * cz;
      if (sunSx > -220 && sunSx < width + 220 && sunSy > -220 && sunSy < height + 220) {
        const celestialGrad = ctx.createRadialGradient(sunSx, sunSy, 10 * cz, sunSx, sunSy, 160 * cz);
        if (curTimeOfDay === 'sunset') {
          celestialGrad.addColorStop(0, 'rgba(255,240,200,0.95)');
          celestialGrad.addColorStop(0.2, 'rgba(251,146,60,0.7)');
          celestialGrad.addColorStop(0.6, 'rgba(239,68,68,0.25)');
          celestialGrad.addColorStop(1, 'rgba(0,0,0,0)');
        } else if (curTimeOfDay === 'twilight') {
          celestialGrad.addColorStop(0, 'rgba(255,255,240,0.9)');
          celestialGrad.addColorStop(0.2, 'rgba(186,230,253,0.4)');
          celestialGrad.addColorStop(0.7, 'rgba(56,189,248,0.08)');
          celestialGrad.addColorStop(1, 'rgba(0,0,0,0)');
        } else {
          celestialGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
          celestialGrad.addColorStop(0.25, 'rgba(254,240,138,0.5)');
          celestialGrad.addColorStop(0.6, 'rgba(56,189,248,0.15)');
          celestialGrad.addColorStop(1, 'rgba(0,0,0,0)');
        }
        ctx.fillStyle = celestialGrad;
        ctx.beginPath();
        ctx.arc(sunSx, sunSy, 160 * cz, 0, TAU);
        ctx.fill();
      }

      // Distant mountains (coarser step: 30 -> 48)
      const distantParallax = (cx - WORLD_WIDTH / 2) * 0.15;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.42);
      const mStep = Math.max(44, width / 32);
      for (let x = 0; x <= width; x += mStep) {
        const wx = (x + distantParallax) * 0.005;
        ctx.lineTo(x, height * 0.38 + Math.sin(wx * 2) * 22 + Math.cos(wx * 4.5) * 14);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle =
        curTimeOfDay === 'sunset'
          ? 'rgba(68,29,62,0.4)'
          : curTimeOfDay === 'twilight'
            ? 'rgba(10,25,45,0.5)'
            : 'rgba(14,116,144,0.25)';
      ctx.fill();

      // --- 2. OCEAN (cached gradient) ---
      const oceanTop = halfH + (140 - cy) * cz;
      const newOceanKey = curTimeOfDay + '|' + (oceanTop | 0) + '|' + height;
      if (newOceanKey !== oceanKey || !oceanGrad) {
        const g = ctx.createLinearGradient(0, Math.max(0, oceanTop), 0, height);
        if (curTimeOfDay === 'sunset') {
          g.addColorStop(0, '#2d2540');
          g.addColorStop(0.3, '#1d3e52');
          g.addColorStop(0.7, '#134050');
          g.addColorStop(1, '#0d2836');
        } else if (curTimeOfDay === 'twilight') {
          g.addColorStop(0, '#0a1624');
          g.addColorStop(0.4, '#0d2033');
          g.addColorStop(0.8, '#081726');
          g.addColorStop(1, '#050f1a');
        } else {
          g.addColorStop(0, '#0284c7');
          g.addColorStop(0.25, '#0ea5e9');
          g.addColorStop(0.65, '#0891b2');
          g.addColorStop(1, '#0f766e');
        }
        oceanGrad = g;
        oceanKey = newOceanKey;
      }
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, Math.max(0, oceanTop), width, height - Math.max(0, oceanTop));

      // Waves: coarser step, inline projection, skip off-screen layers
      const wStep = Math.max(26, width / 48);
      ctx.lineWidth = 1.5 * cz;
      for (let li = 0; li < WAVE_LAYERS.length; li++) {
        const w = WAVE_LAYERS[li];
        const waveSy = halfH + (w.y - cy) * cz;
        if (waveSy < -40 || waveSy > height + 40) continue;
        ctx.beginPath();
        ctx.moveTo(0, waveSy);
        const invZoom = 1 / cz;
        for (let sxx = 0; sxx <= width; sxx += wStep) {
          const wwx = (sxx - halfW) * invZoom + cx;
          const e =
            Math.sin(wwx * w.freq + time * w.speed) * w.amp * cz +
            Math.cos(wwx * w.freq * 1.8 - time * 0.4) * (w.amp * 0.4 * cz);
          ctx.lineTo(sxx, waveSy + e);
        }
        ctx.strokeStyle = w.color;
        ctx.stroke();
      }

      // Sun glint (single quad fill, no gradient object churn beyond 1)
      if (sunSx > -300 && sunSx < width + 300) {
        const reflectGrad = ctx.createLinearGradient(0, oceanTop, 0, height);
        if (curTimeOfDay === 'sunset') {
          reflectGrad.addColorStop(0, 'rgba(251,146,60,0.4)');
          reflectGrad.addColorStop(0.5, 'rgba(245,158,11,0.25)');
          reflectGrad.addColorStop(1, 'rgba(239,68,68,0.05)');
        } else if (curTimeOfDay === 'twilight') {
          reflectGrad.addColorStop(0, 'rgba(186,230,253,0.35)');
          reflectGrad.addColorStop(0.5, 'rgba(125,211,252,0.15)');
          reflectGrad.addColorStop(1, 'rgba(56,189,248,0.02)');
        } else {
          reflectGrad.addColorStop(0, 'rgba(255,255,255,0.5)');
          reflectGrad.addColorStop(0.5, 'rgba(224,242,254,0.25)');
          reflectGrad.addColorStop(1, 'rgba(255,255,255,0.04)');
        }
        ctx.fillStyle = reflectGrad;
        ctx.beginPath();
        ctx.moveTo(sunSx - 25 * cz, oceanTop);
        ctx.lineTo(sunSx + 25 * cz, oceanTop);
        ctx.lineTo(sunSx + 180 * cz, height);
        ctx.lineTo(sunSx - 180 * cz, height);
        ctx.closePath();
        ctx.fill();
      }

      // --- 3. SHORELINE (cached sand gradient, coarser path) ---
      const shoreWorldY = 475;
      const shoreSy = halfH + (shoreWorldY - cy) * cz;
      if (shoreSy < height + 120) {
        const newSandKey = curTimeOfDay + '|' + (shoreSy | 0) + '|' + height;
        if (newSandKey !== sandKey || !sandGrad) {
          const g = ctx.createLinearGradient(0, shoreSy, 0, height);
          if (curTimeOfDay === 'sunset') {
            g.addColorStop(0, '#c28859');
            g.addColorStop(0.4, '#b07346');
            g.addColorStop(1, '#663920');
          } else if (curTimeOfDay === 'twilight') {
            g.addColorStop(0, '#363c45');
            g.addColorStop(0.5, '#292d34');
            g.addColorStop(1, '#1b1e23');
          } else {
            g.addColorStop(0, '#fef08a');
            g.addColorStop(0.3, '#fde047');
            g.addColorStop(0.8, '#eab308');
            g.addColorStop(1, '#ca8a04');
          }
          sandGrad = g;
          sandKey = newSandKey;
        }
        const sStep = Math.max(26, width / 44);
        const invZoom = 1 / cz;
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, halfH + (shoreWorldY + beachCurveAt((0 - halfW) * invZoom + cx) - cy) * cz);
        for (let sxx = sStep; sxx <= width; sxx += sStep) {
          const wwx = (sxx - halfW) * invZoom + cx;
          ctx.lineTo(sxx, halfH + (shoreWorldY + beachCurveAt(wwx) - cy) * cz);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = sandGrad;
        ctx.fill();

        // Foam lines: single batched path each, cheaper widths
        ctx.lineWidth = Math.max(1.5, 4 * cz);
        ctx.strokeStyle =
          curTimeOfDay === 'twilight'
            ? 'rgba(186,230,253,0.4)'
            : curTimeOfDay === 'sunset'
              ? 'rgba(254,215,170,0.6)'
              : 'rgba(255,255,255,0.75)';
        ctx.stroke();

        ctx.beginPath();
        let started = false;
        for (let sxx = 0; sxx <= width; sxx += sStep) {
          const wwx = (sxx - halfW) * invZoom + cx;
          const washY = shoreWorldY + beachCurveAt(wwx) + 6 + Math.sin(time * 2.2 + wwx * 0.015) * 5;
          const py = halfH + (washY - cy) * cz;
          if (!started) { ctx.moveTo(0, py); started = true; }
          else ctx.lineTo(sxx, py);
        }
        ctx.lineWidth = Math.max(1, 2 * cz);
        ctx.strokeStyle =
          curTimeOfDay === 'twilight'
            ? 'rgba(224,242,254,0.3)'
            : curTimeOfDay === 'sunset'
              ? 'rgba(254,243,199,0.4)'
              : 'rgba(255,255,255,0.6)';
        ctx.stroke();
      }

      // --- 4. PIERS (inline projection, culled bounding check) ---
      {
        const p0sx = halfW + (PIER_POINTS[0].x - cx) * cz;
        const p0sy = halfH + (PIER_POINTS[0].y - cy) * cz;
        if (p0sy > -200 && p0sy < height + 200) {
          const px = (i: number) => halfW + (PIER_POINTS[i].x - cx) * cz;
          const py = (i: number) => halfH + (PIER_POINTS[i].y - cy) * cz;
          ctx.lineCap = 'round';
          ctx.strokeStyle = 'rgba(0,0,0,0.35)';
          ctx.lineWidth = 14 * cz;
          ctx.beginPath();
          ctx.moveTo(px(0), py(0) + 6 * cz);
          ctx.lineTo(px(1), py(1) + 6 * cz);
          ctx.lineTo(px(3), py(3) + 6 * cz);
          ctx.moveTo(px(1), py(1) + 6 * cz);
          ctx.lineTo(px(2), py(2) + 6 * cz);
          ctx.lineTo(px(5), py(5) + 6 * cz);
          ctx.moveTo(px(1), py(1) + 6 * cz);
          ctx.lineTo(px(4), py(4) + 6 * cz);
          ctx.stroke();
          ctx.strokeStyle = curTimeOfDay === 'twilight' ? '#4a3f35' : '#8b5a2b';
          ctx.lineWidth = 10 * cz;
          ctx.beginPath();
          ctx.moveTo(px(0), py(0));
          ctx.lineTo(px(1), py(1));
          ctx.lineTo(px(3), py(3));
          ctx.moveTo(px(1), py(1));
          ctx.lineTo(px(2), py(2));
          ctx.lineTo(px(5), py(5));
          ctx.moveTo(px(1), py(1));
          ctx.lineTo(px(4), py(4));
          ctx.stroke();
          ctx.strokeStyle = curTimeOfDay === 'twilight' ? '#6b5849' : '#b8860b';
          ctx.lineWidth = Math.max(1, 1.5 * cz);
          ctx.stroke();
          ctx.lineCap = 'butt';
        }
      }

      // --- PALMS (culled, fewer state changes) ---
      {
        const leafColor = curTimeOfDay === 'twilight' ? '#0d251c' : curTimeOfDay === 'sunset' ? '#2f4f2f' : '#15803d';
        const trunkColor = curTimeOfDay === 'twilight' ? '#272018' : '#654321';
        ctx.strokeStyle = trunkColor;
        ctx.fillStyle = leafColor;
        for (let i = 0; i < PALMS.length; i++) {
          const p = PALMS[i];
          const scSx = halfW + (p.x - cx) * cz;
          const scSy = halfH + (p.y - cy) * cz;
          if (scSx < -90 || scSx > width + 90 || scSy < -100 || scSy > height + 60) continue;
          const swayAngle = Math.sin(time + p.sway) * 0.08;
          const cosA = Math.cos(swayAngle);
          const sinA = Math.sin(swayAngle);
          // Trunk as rotated quad (avoid save/translate/rotate per palm)
          const tx = 4 * cz * p.scale;
          const ty = -50 * cz * p.scale;
          const rx = tx * cosA - ty * sinA;
          const ry = tx * sinA + ty * cosA;
          ctx.lineWidth = Math.max(1.5, 4.5 * cz);
          ctx.beginPath();
          ctx.moveTo(scSx, scSy);
          ctx.quadraticCurveTo(scSx + 8 * cz, scSy - 25 * cz, scSx + rx, scSy + ry);
          ctx.stroke();
          // Fronds: batched into one path per palm
          ctx.lineWidth = Math.max(1, 2 * cz);
          ctx.strokeStyle = leafColor;
          ctx.beginPath();
          const topX = scSx + rx;
          const topY = scSy + ry;
          for (let a = 0; a < 6; a++) {
            const angle = (a * Math.PI) / 3 + swayAngle * 0.6;
            const lx = Math.cos(angle) * 30 * cz * p.scale;
            const ly = Math.sin(angle) * 16 * cz * p.scale;
            ctx.moveTo(topX, topY);
            ctx.quadraticCurveTo(topX + lx * 0.6, topY + ly - 8 * cz, topX + lx, topY + ly);
          }
          ctx.stroke();
          ctx.strokeStyle = trunkColor;
        }
      }

      // --- 5. PAVILION (culled) ---
      {
        const pvSx = halfW + (500 - cx) * cz;
        const pvSy = halfH + (630 - cy) * cz;
        if (pvSx > -140 && pvSx < width + 140 && pvSy > -120 && pvSy < height + 80) {
          ctx.fillStyle = curTimeOfDay === 'twilight' ? '#261b14' : '#5c3a21';
          ctx.fillRect(pvSx - 35 * cz, pvSy - 22 * cz, 70 * cz, 22 * cz);
          ctx.beginPath();
          ctx.moveTo(pvSx - 45 * cz, pvSy - 22 * cz);
          ctx.lineTo(pvSx, pvSy - 48 * cz);
          ctx.lineTo(pvSx + 45 * cz, pvSy - 22 * cz);
          ctx.closePath();
          ctx.fillStyle = curTimeOfDay === 'twilight' ? '#3d2e1e' : '#b48a52';
          ctx.fill();
          const lg = ctx.createRadialGradient(pvSx, pvSy - 15 * cz, 2 * cz, pvSx, pvSy - 15 * cz, 45 * cz);
          lg.addColorStop(0, 'rgba(253,224,71,0.85)');
          lg.addColorStop(0.5, 'rgba(245,158,11,0.4)');
          lg.addColorStop(1, 'rgba(245,158,11,0)');
          ctx.fillStyle = lg;
          ctx.beginPath();
          ctx.arc(pvSx, pvSy - 15 * cz, 45 * cz, 0, TAU);
          ctx.fill();
          ctx.font = `${Math.max(10, 11 * cz)}px 'Plus Jakarta Sans', sans-serif`;
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'alphabetic';
          ctx.fillText('Sanctuary Lounge & Pavilion', pvSx, pvSy + 18 * cz);
        }
      }

      // --- 6. TOWER ---
      const w2s = (wx: number, wy: number) => ({
        sx: halfW + (wx - cx) * cz,
        sy: halfH + (wy - cy) * cz,
        scale: cz,
      });
      renderOceanTower({
        ctx,
        hotels: curHotels,
        selectedHotel: curSelected,
        hoveredHotel: hoveredHotelRef.current,
        selectedCategory: curCategory,
        timeOfDay: curTimeOfDay,
        time,
        cam: { x: cx, y: cy, zoom: cz },
        worldToScreen: w2s,
        width,
        height,
      });

      // --- 7. VILLAS (culled, cheap glows only when hot) ---
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let hi = 0; hi < curHotels.length; hi++) {
        const hotel = curHotels[hi];
        if (hotel.isBuildingFloor) continue;
        const isSelected = curSelected !== null && curSelected.id === hotel.id;
        const isHovered = hoveredHotelRef.current !== null && hoveredHotelRef.current.id === hotel.id;
        if (!isSelected && !isHovered) {
          if (curCategory !== 'all' && hotel.category !== curCategory) {
            // still draw dimmed, but skip if fully off-screen first
          }
        }
        const sx = halfW + (hotel.position.x - cx) * cz;
        const sy = halfH + (hotel.position.y - cy) * cz;
        if (sx < -120 || sx > width + 120 || sy < -120 || sy > height + 120) continue;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.globalAlpha = curCategory !== 'all' && hotel.category !== curCategory && !isSelected ? 0.22 : 1.0;
        const lift = isSelected ? 1.18 : isHovered ? 1.1 : 1.0;
        if (lift !== 1) ctx.scale(lift, lift);
        const vz = cz;

        // Shadow (flat, no gradient)
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 16 * vz, 32 * vz, 10 * vz, 0, 0, TAU);
        ctx.fill();

        // Stilts (single path)
        ctx.strokeStyle = curTimeOfDay === 'twilight' ? '#1c1510' : '#452a15';
        ctx.lineWidth = Math.max(1, 2.5 * vz);
        ctx.beginPath();
        ctx.moveTo(-18 * vz, 0); ctx.lineTo(-18 * vz, 16 * vz);
        ctx.moveTo(18 * vz, 0); ctx.lineTo(18 * vz, 16 * vz);
        ctx.moveTo(-10 * vz, 4 * vz); ctx.lineTo(-10 * vz, 18 * vz);
        ctx.moveTo(10 * vz, 4 * vz); ctx.lineTo(10 * vz, 18 * vz);
        ctx.stroke();

        // Deck
        ctx.fillStyle = curTimeOfDay === 'twilight' ? '#3d2e20' : '#85542b';
        ctx.fillRect(-26 * vz, -4 * vz, 52 * vz, 8 * vz);
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = Math.max(1, 0.75 * vz);
        ctx.strokeRect(-26 * vz, -4 * vz, 52 * vz, 8 * vz);

        // Pool accent
        if (hotel.category === 'premium' || hotel.category === 'deluxe') {
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(-22 * vz, 4 * vz, 14 * vz, 8 * vz);
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fillRect(-20 * vz, 5 * vz, 4 * vz, 1.5 * vz);
        }

        // Walls: solid + warm wash (no radial gradient unless hot)
        ctx.fillStyle = curTimeOfDay === 'twilight' ? '#2b211a' : '#eed9b7';
        ctx.fillRect(-18 * vz, -26 * vz, 36 * vz, 22 * vz);
        if (isSelected || isHovered) {
          const wg = ctx.createRadialGradient(0, -16 * vz, 2 * vz, 0, -16 * vz, 22 * vz);
          wg.addColorStop(0, 'rgba(254,240,138,0.95)');
          wg.addColorStop(0.5, 'rgba(245,158,11,0.7)');
          wg.addColorStop(1, 'rgba(245,158,11,0.1)');
          ctx.fillStyle = wg;
          ctx.fillRect(-14 * vz, -22 * vz, 28 * vz, 14 * vz);
        } else {
          ctx.fillStyle = 'rgba(245,158,11,0.55)';
          ctx.fillRect(-14 * vz, -22 * vz, 28 * vz, 14 * vz);
        }

        // Roof
        ctx.beginPath();
        if (hotel.category === 'premium') {
          ctx.moveTo(-28 * vz, -26 * vz);
          ctx.lineTo(-2 * vz, -46 * vz);
          ctx.lineTo(28 * vz, -26 * vz);
          ctx.closePath();
          ctx.fillStyle = curTimeOfDay === 'twilight' ? '#4a3525' : '#a27641';
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(-16 * vz, -42 * vz);
          ctx.lineTo(0, -58 * vz);
          ctx.lineTo(16 * vz, -42 * vz);
          ctx.closePath();
          ctx.fillStyle = curTimeOfDay === 'twilight' ? '#3d281a' : '#845727';
          ctx.fill();
        } else {
          ctx.moveTo(-26 * vz, -26 * vz);
          ctx.lineTo(0, -48 * vz);
          ctx.lineTo(26 * vz, -26 * vz);
          ctx.closePath();
          ctx.fillStyle = curTimeOfDay === 'twilight' ? '#3f2d20' : '#9b6e3c';
          ctx.fill();
        }

        // Halo only when hot (was: radial + ring for hot only — keep, it's rare)
        if (isSelected || isHovered) {
          const pulse = (Math.sin(time * 3) + 1) * 0.5;
          const haloR = (36 + pulse * 10) * vz;
          const hg = ctx.createRadialGradient(0, -14 * vz, 10, 0, -14 * vz, haloR);
          hg.addColorStop(0, 'rgba(212,175,55,0.45)');
          hg.addColorStop(0.6, 'rgba(212,175,55,0.15)');
          hg.addColorStop(1, 'rgba(212,175,55,0)');
          ctx.fillStyle = hg;
          ctx.beginPath();
          ctx.arc(0, -14 * vz, haloR, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = isSelected ? '#d4af37' : '#38bdf8';
          ctx.lineWidth = Math.max(1, 2 * vz);
          ctx.beginPath();
          ctx.arc(0, -14 * vz, (32 + pulse * 6) * vz, 0, TAU);
          ctx.stroke();
        }

        // Category pill (cached text width, fillRect instead of roundRect)
        const fontStr = `600 ${Math.max(9, 10 * vz)}px 'Space Mono', monospace`;
        ctx.font = fontStr;
        const catText = hotel.category.toUpperCase();
        const cacheKey = hotel.id + '|' + (vz * 10 | 0);
        let tw = pillWidthCache.get(cacheKey);
        if (tw === undefined) {
          tw = ctx.measureText(catText).width;
          // Bound cache size
          if (pillWidthCache.size > 64) pillWidthCache.clear();
          pillWidthCache.set(cacheKey, tw);
        }
        const pillY = -60 * vz;
        ctx.fillStyle = isSelected ? '#d4af37' : (PILL_COLORS[hotel.category] ?? '#047857');
        const pillPad = 8 * vz;
        ctx.fillRect(-tw / 2 - pillPad, pillY - pillPad, tw + pillPad * 2, 16 * vz);
        ctx.fillStyle = isSelected ? '#000000' : '#ffffff';
        ctx.fillText(catText, 0, pillY);
        ctx.restore();
      }

      // --- 8. TOUR HOTSPOTS (no shadowBlur; stroke text for readability) ---
      if (curSelected && (curTourMode || cz > 1.3)) {
        ctx.textAlign = 'center';
        for (let ti = 0; ti < curSelected.tourPoints.length; ti++) {
          const tp = curSelected.tourPoints[ti];
          const psx = halfW + (tp.view.x - cx) * cz;
          const psy = halfH + (tp.view.y - cy) * cz;
          if (psx < -80 || psx > width + 80 || psy < -60 || psy > height + 60) continue;
          const isActive = curActiveTp === tp.id;
          ctx.save();
          ctx.translate(psx, psy);
          const pulse = (Math.sin(time * 4) + 1) * 0.5;
          ctx.beginPath();
          ctx.arc(0, 0, (14 + pulse * 6) * cz, 0, TAU);
          ctx.strokeStyle = isActive ? '#d4af37' : 'rgba(56,189,248,0.7)';
          ctx.lineWidth = Math.max(1, 2 * cz);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, 8 * cz, 0, TAU);
          ctx.fillStyle = isActive ? '#d4af37' : '#0284c7';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(0, 0, 3.5 * cz, 0, TAU);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.font = `600 ${Math.max(10, 11 * cz)}px 'Plus Jakarta Sans', sans-serif`;
          ctx.lineWidth = 3;
          ctx.strokeStyle = 'rgba(0,0,0,0.8)';
          ctx.strokeText(tp.name, 0, -14 * cz);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(tp.name, 0, -14 * cz);
          ctx.restore();
        }
      }

      // --- 9. PARTICLES (fillRect, no arcs, inline projection) ---
      {
        const parts = particlesRef.current;
        let pColor: string;
        if (curTimeOfDay === 'sunset') pColor = '251,191,36';
        else if (curTimeOfDay === 'twilight') pColor = '186,230,253';
        else pColor = '255,255,255';
        const dim = curTimeOfDay === 'day' ? 0.6 : 1;
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          p.x += p.speedX;
          p.y += p.speedY;
          if (p.x < 0) p.x = WORLD_WIDTH;
          else if (p.x > WORLD_WIDTH) p.x = 0;
          if (p.y < 0) p.y = WORLD_HEIGHT;
          else if (p.y > WORLD_HEIGHT) p.y = 0;
          const tw = 0.5 + 0.5 * Math.sin(time * 2 + p.seed);
          const a = Math.max(0.1, Math.min(p.maxAlpha, p.alpha * (0.6 + 0.4 * tw))) * dim;
          const psx = halfW + (p.x - cx) * cz;
          const psy = halfH + (p.y - cy) * cz;
          if (psx < -10 || psx > width + 10 || psy < -10 || psy > height + 10) continue;
          const s = p.size * cz;
          ctx.fillStyle = `rgba(${pColor},${a.toFixed(3)})`;
          ctx.fillRect(psx - s / 2, psy - s / 2, s, s);
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrameId);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
    // Mount once: all changing values read via liveRef / cameraRef
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Throttled hover: coalesce pointermove via rAF, skip setState when unchanged
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (hoverRafRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    hoverRafRef.current = requestAnimationFrame(() => {
      hoverRafRef.current = 0;
      const c = canvasRef.current;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      const live = liveRef.current;

      if (isDraggingRef.current) {
        const dx = sx - dragStartRef.current.x;
        const dy = sy - dragStartRef.current.y;
        const zoom = cameraRef.current.zoom;
        const nx = Math.max(100, Math.min(WORLD_WIDTH - 100, cameraStartRef.current.x - dx / zoom));
        const ny = Math.max(120, Math.min(WORLD_HEIGHT - 80, cameraStartRef.current.y - dy / zoom));
        cameraRef.current.targetX = nx;
        cameraRef.current.targetY = ny;
        return;
      }

      const cw = c.clientWidth || 1;
      const chh = c.clientHeight || 1;
      const cam = cameraRef.current;
      const wx = (sx - cw / 2) / cam.zoom + cam.x;
      const wy = (sy - chh / 2) / cam.zoom + cam.y;

      if (live.selectedHotel && (live.isTourMode || cam.zoom > 1.3)) {
        let found: TourPoint | null = null;
        const tps = live.selectedHotel.tourPoints;
        for (let i = 0; i < tps.length; i++) {
          const tp = tps[i];
          const ddx = wx - tp.view.x;
          const ddy = wy - tp.view.y;
          if (ddx * ddx + ddy * ddy < 22 * 22) { found = tp; break; }
        }
        hoveredHotspotRef.current = found;
        if (found) { c.style.cursor = 'pointer'; return; }
      } else {
        hoveredHotspotRef.current = null;
      }

      let foundHotel: Hotel | null = null;
      if (wx >= 24 && wx <= 154 && wy >= 340 && wy <= 850) {
        const groundY = 840;
        const floorHeight = 25;
        const rawFloor = Math.floor((groundY - wy) / floorHeight) + 1;
        const targetFloorNumber = Math.max(1, Math.min(10, rawFloor));
        const hs = live.hotels;
        for (let i = 0; i < hs.length; i++) {
          const h = hs[i];
          if (h.isBuildingFloor && h.floorNumber === targetFloorNumber) { foundHotel = h; break; }
        }
      }
      if (!foundHotel) {
        const hs = live.hotels;
        for (let i = 0; i < hs.length; i++) {
          const h = hs[i];
          if (h.isBuildingFloor) continue;
          const ddx = wx - h.position.x;
          const ddy = wy - h.position.y;
          if (ddx * ddx + ddy * ddy < 45 * 45) { foundHotel = h; break; }
        }
      }

      const prevId = hoveredHotelRef.current?.id ?? null;
      const nextId = foundHotel?.id ?? null;
      hoveredHotelRef.current = foundHotel;
      const last = lastTooltipRef.current;
      const moved = Math.abs(sx - last.x) + Math.abs(sy - last.y);
      if (prevId !== nextId) {
        setHoveredHotel(foundHotel);
        lastTooltipRef.current = { id: nextId, x: sx, y: sy };
        setTooltipPos(foundHotel ? { x: sx, y: sy } : null);
        c.style.cursor = foundHotel ? 'pointer' : 'grab';
      } else if (foundHotel && moved > 5) {
        lastTooltipRef.current = { id: nextId, x: sx, y: sy };
        setTooltipPos({ x: sx, y: sy });
      } else if (!foundHotel && last.id !== null) {
        lastTooltipRef.current = { id: null, x: sx, y: sy };
        setTooltipPos(null);
        c.style.cursor = 'grab';
      }
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    cameraStartRef.current = {
      x: cameraRef.current.targetX,
      y: cameraRef.current.targetY,
    };
    (e.target as HTMLCanvasElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const dragDistance = Math.hypot(
      e.clientX - dragStartRef.current.x,
      e.clientY - dragStartRef.current.y
    );
    isDraggingRef.current = false;
    if (dragDistance < 6) {
      if (hoveredHotspotRef.current && onSelectTourPoint) {
        onSelectTourPoint(hoveredHotspotRef.current);
        return;
      }
      if (hoveredHotelRef.current) {
        onSelectHotel(hoveredHotelRef.current);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      id="resort-canvas-container"
      className="relative w-full h-full overflow-hidden select-none bg-[#091117] touch-none"
    >
      <canvas
        ref={canvasRef}
        id="resort-interactive-canvas"
        className="w-full h-full block cursor-grab active:cursor-grabbing"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          if (hoverRafRef.current) { cancelAnimationFrame(hoverRafRef.current); hoverRafRef.current = 0; }
          isDraggingRef.current = false;
          setHoveredHotel(null);
          hoveredHotelRef.current = null;
          lastTooltipRef.current = { id: null, x: 0, y: 0 };
          setTooltipPos(null);
        }}
      />

      {/* Floating Hover Tooltip (Kovnar editorial styling) */}
      {hoveredHotel && tooltipPos && !selectedHotel && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full transform pb-4"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 12}px`,
          }}
        >
          <div className="rounded-xl border border-[#d4af37]/30 bg-[#0d171fe6] p-3.5 shadow-2xl backdrop-blur-md min-w-[240px]">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
              <span className="font-meta text-[10px] tracking-widest text-[#d4af37] uppercase">
                {hoveredHotel.isBuildingFloor ? `FLOOR ${hoveredHotel.floorNumber} OF 10 · ${hoveredHotel.categoryLabel}` : hoveredHotel.categoryLabel}
              </span>
              <span className="text-xs font-semibold text-amber-400">
                ★ {hoveredHotel.rating}
              </span>
            </div>

            {hoveredHotel.hasPool && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-semibold text-cyan-300">
                <span>🌊 Private Rooftop Infinity Swimming Pool</span>
              </div>
            )}

            <p className="mt-1.5 font-editorial text-base font-semibold text-white">
              {hoveredHotel.name}
            </p>
            <p className="font-sans text-xs text-white/60 line-clamp-1">
              {hoveredHotel.tagline}
            </p>

            {hoveredHotel.isBuildingFloor && hoveredHotel.rooms && (
              <div className="mt-2 text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-md px-2 py-1">
                ✦ 2 Hotel Rooms per floor · Private Sunset Balcony
              </div>
            )}

            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-white/40">{hoveredHotel.maxGuests} Guests · {hoveredHotel.sqm} m²</span>
              <span className="font-semibold text-[#f7f4ee]">
                ${hoveredHotel.pricePerNight}{' '}
                <span className="text-[10px] text-white/50">/ night</span>
              </span>
            </div>
            <div className="mt-2 text-center text-[10px] text-[#d4af37] tracking-wider uppercase font-semibold">
              Click to Explore Floor & Rooms
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
