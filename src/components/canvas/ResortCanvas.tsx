import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  pulseSpeed: number;
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

  // Virtual world dimensions
  const WORLD_WIDTH = 1000;
  const WORLD_HEIGHT = 680;
  const DEFAULT_CAM_Y = 475;

  // Camera state
  const cameraRef = useRef({
    x: WORLD_WIDTH / 2,
    y: DEFAULT_CAM_Y,
    zoom: 1,
    targetX: WORLD_WIDTH / 2,
    targetY: DEFAULT_CAM_Y,
    targetZoom: 1,
  });

  // Drag interaction state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const cameraStartRef = useRef({ x: 0, y: 0 });
  const hoveredHotelRef = useRef<Hotel | null>(null);
  const hoveredHotspotRef = useRef<TourPoint | null>(null);

  const [hoveredHotel, setHoveredHotel] = useState<Hotel | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Particles (sparks at sunset, stars/fireflies at night, sea glint during day)
  const particlesRef = useRef<Particle[]>([]);

  // Initialize particles
  useEffect(() => {
    const list: Particle[] = [];
    for (let i = 0; i < 45; i++) {
      list.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.25 - 0.1,
        alpha: Math.random() * 0.7 + 0.2,
        maxAlpha: Math.random() * 0.6 + 0.3,
        pulseSpeed: Math.random() * 0.03 + 0.01,
      });
    }
    particlesRef.current = list;
  }, []);

  // Update camera target when selected hotel or tour mode changes
  useEffect(() => {
    if (selectedHotel) {
      if (isTourMode && activeTourPointId) {
        const pt = selectedHotel.tourPoints.find((p) => p.id === activeTourPointId);
        if (pt) {
          cameraRef.current.targetX = pt.view.x;
          cameraRef.current.targetY = pt.view.y;
          cameraRef.current.targetZoom = 1.65;
          return;
        }
      }
      if (selectedHotel.isBuildingFloor) {
        cameraRef.current.targetX = selectedHotel.position.x + 10;
        cameraRef.current.targetY = selectedHotel.position.y;
        cameraRef.current.targetZoom = 1.5;
      } else {
        cameraRef.current.targetX = selectedHotel.position.x;
        cameraRef.current.targetY = selectedHotel.position.y;
        cameraRef.current.targetZoom = 1.45;
      }
    } else {
      cameraRef.current.targetX = WORLD_WIDTH / 2;
      cameraRef.current.targetY = DEFAULT_CAM_Y;
      cameraRef.current.targetZoom = 1;
    }
  }, [selectedHotel, isTourMode, activeTourPointId]);

  // Coordinate conversion: World to Screen
  const worldToScreen = useCallback((wx: number, wy: number, width: number, height: number) => {
    const { x, y, zoom } = cameraRef.current;
    const sx = width / 2 + (wx - x) * zoom;
    const sy = height / 2 + (wy - y) * zoom;
    return { sx, sy, scale: zoom };
  }, []);

  // Coordinate conversion: Screen to World
  const screenToWorld = useCallback((sx: number, sy: number, width: number, height: number) => {
    const { x, y, zoom } = cameraRef.current;
    const wx = (sx - width / 2) / zoom + x;
    const wy = (sy - height / 2) / zoom + y;
    return { wx, wy };
  }, []);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.025;

      // Handle canvas resolution and DPR
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Interpolate camera towards target (lerp)
      const cam = cameraRef.current;
      cam.x += (cam.targetX - cam.x) * 0.07;
      cam.y += (cam.targetY - cam.y) * 0.07;
      cam.zoom += (cam.targetZoom - cam.zoom) * 0.07;

      // --- 1. SKY & HORIZON LAYER ---
      const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
      if (timeOfDay === 'sunset') {
        skyGradient.addColorStop(0, '#1c1328');
        skyGradient.addColorStop(0.28, '#441d3e');
        skyGradient.addColorStop(0.55, '#a44136');
        skyGradient.addColorStop(0.78, '#d97736');
        skyGradient.addColorStop(1, '#1b3240');
      } else if (timeOfDay === 'twilight') {
        skyGradient.addColorStop(0, '#060b14');
        skyGradient.addColorStop(0.35, '#0c1a2c');
        skyGradient.addColorStop(0.7, '#112940');
        skyGradient.addColorStop(1, '#0b1c2b');
      } else {
        // Daytime Tropical
        skyGradient.addColorStop(0, '#38bdf8');
        skyGradient.addColorStop(0.35, '#7dd3fc');
        skyGradient.addColorStop(0.65, '#a5f3fc');
        skyGradient.addColorStop(1, '#0e7490');
      }
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, height);

      // Celestial Sun / Moon
      const sunScreen = worldToScreen(timeOfDay === 'sunset' ? 250 : 780, 100, width, height);
      const celestialGrad = ctx.createRadialGradient(
        sunScreen.sx,
        sunScreen.sy,
        10 * cam.zoom,
        sunScreen.sx,
        sunScreen.sy,
        160 * cam.zoom
      );

      if (timeOfDay === 'sunset') {
        celestialGrad.addColorStop(0, 'rgba(255, 240, 200, 0.95)');
        celestialGrad.addColorStop(0.2, 'rgba(251, 146, 60, 0.7)');
        celestialGrad.addColorStop(0.6, 'rgba(239, 68, 68, 0.25)');
        celestialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (timeOfDay === 'twilight') {
        celestialGrad.addColorStop(0, 'rgba(255, 255, 240, 0.9)');
        celestialGrad.addColorStop(0.2, 'rgba(186, 230, 253, 0.4)');
        celestialGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.08)');
        celestialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        celestialGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        celestialGrad.addColorStop(0.25, 'rgba(254, 240, 138, 0.5)');
        celestialGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.15)');
        celestialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.fillStyle = celestialGrad;
      ctx.beginPath();
      ctx.arc(sunScreen.sx, sunScreen.sy, 160 * cam.zoom, 0, Math.PI * 2);
      ctx.fill();

      // Distant Tropical Mountain Ridges (Parallax Depth = 0.3)
      const distantParallax = (cam.x - WORLD_WIDTH / 2) * 0.15;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.42);
      for (let x = 0; x <= width; x += 30) {
        const wx = (x + distantParallax) * 0.005;
        const yOffset = Math.sin(wx * 2) * 22 + Math.cos(wx * 4.5) * 14;
        ctx.lineTo(x, height * 0.38 + yOffset);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fillStyle =
        timeOfDay === 'sunset'
          ? 'rgba(68, 29, 62, 0.4)'
          : timeOfDay === 'twilight'
          ? 'rgba(10, 25, 45, 0.5)'
          : 'rgba(14, 116, 144, 0.25)';
      ctx.fill();

      // --- 2. DEEP OCEAN & PARALLAX WAVES LAYER ---
      const oceanTop = worldToScreen(0, 140, width, height).sy;
      const oceanGrad = ctx.createLinearGradient(0, oceanTop, 0, height);
      if (timeOfDay === 'sunset') {
        oceanGrad.addColorStop(0, '#2d2540');
        oceanGrad.addColorStop(0.3, '#1d3e52');
        oceanGrad.addColorStop(0.7, '#134050');
        oceanGrad.addColorStop(1, '#0d2836');
      } else if (timeOfDay === 'twilight') {
        oceanGrad.addColorStop(0, '#0a1624');
        oceanGrad.addColorStop(0.4, '#0d2033');
        oceanGrad.addColorStop(0.8, '#081726');
        oceanGrad.addColorStop(1, '#050f1a');
      } else {
        oceanGrad.addColorStop(0, '#0284c7');
        oceanGrad.addColorStop(0.25, '#0ea5e9');
        oceanGrad.addColorStop(0.65, '#0891b2');
        oceanGrad.addColorStop(1, '#0f766e');
      }
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, oceanTop, width, height - oceanTop);

      // Procedural Sine Waves (3 layered depth passes)
      const waveLayers = [
        { y: 160, amp: 4, freq: 0.02, speed: 1.2, color: 'rgba(255,255,255,0.08)' },
        { y: 280, amp: 7, freq: 0.015, speed: 1.0, color: 'rgba(255,255,255,0.13)' },
        { y: 400, amp: 9, freq: 0.012, speed: 0.8, color: 'rgba(255,255,255,0.18)' },
        { y: 520, amp: 11, freq: 0.01, speed: 0.6, color: 'rgba(255,255,255,0.22)' },
      ];

      waveLayers.forEach((w) => {
        const waveScreen = worldToScreen(0, w.y, width, height);
        ctx.beginPath();
        ctx.moveTo(0, waveScreen.sy);

        for (let sx = 0; sx <= width; sx += 15) {
          const worldPt = screenToWorld(sx, waveScreen.sy, width, height);
          const waveElevation =
            Math.sin(worldPt.wx * w.freq + time * w.speed) * w.amp * cam.zoom +
            Math.cos(worldPt.wx * w.freq * 1.8 - time * 0.4) * (w.amp * 0.4 * cam.zoom);
          ctx.lineTo(sx, waveScreen.sy + waveElevation);
        }
        ctx.strokeStyle = w.color;
        ctx.lineWidth = 1.5 * cam.zoom;
        ctx.stroke();
      });

      // Water Caustics / Sun Glint Reflection down to foreground
      const sunReflectX = sunScreen.sx;
      const reflectGrad = ctx.createLinearGradient(sunReflectX, oceanTop, sunReflectX, height);
      if (timeOfDay === 'sunset') {
        reflectGrad.addColorStop(0, 'rgba(251, 146, 60, 0.4)');
        reflectGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)');
        reflectGrad.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
      } else if (timeOfDay === 'twilight') {
        reflectGrad.addColorStop(0, 'rgba(186, 230, 253, 0.35)');
        reflectGrad.addColorStop(0.5, 'rgba(125, 211, 252, 0.15)');
        reflectGrad.addColorStop(1, 'rgba(56, 189, 248, 0.02)');
      } else {
        reflectGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        reflectGrad.addColorStop(0.5, 'rgba(224, 242, 254, 0.25)');
        reflectGrad.addColorStop(1, 'rgba(255, 255, 255, 0.04)');
      }

      ctx.save();
      ctx.fillStyle = reflectGrad;
      ctx.beginPath();
      ctx.moveTo(sunReflectX - 25 * cam.zoom, oceanTop);
      ctx.lineTo(sunReflectX + 25 * cam.zoom, oceanTop);
      ctx.lineTo(sunReflectX + 180 * cam.zoom, height);
      ctx.lineTo(sunReflectX - 180 * cam.zoom, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // --- 3. SHORELINE, EXPANSIVE SANDY BEACH & RESORT PAVILION (ZONE A) ---
      // Shoreline curve in world coordinates (divides canvas evenly: top half sea, bottom half sand)
      const shoreWorldY = 475;
      const shoreScreen = worldToScreen(0, shoreWorldY, width, height);

      // Sand terrain path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let sx = 0; sx <= width; sx += 16) {
        const wp = screenToWorld(sx, shoreScreen.sy, width, height);
        // Smooth natural tropical shoreline curve across the full canvas
        const beachCurve = Math.sin(wp.wx * 0.005 + 0.3) * 16 - Math.cos(wp.wx * 0.009) * 8;
        const shoreY = shoreWorldY + beachCurve;
        const pt = worldToScreen(wp.wx, shoreY, width, height);
        if (sx === 0) ctx.lineTo(0, pt.sy);
        else ctx.lineTo(sx, pt.sy);
      }
      ctx.lineTo(width, height);
      ctx.closePath();

      // Sand color gradient
      const sandGrad = ctx.createLinearGradient(0, shoreScreen.sy, 0, height);
      if (timeOfDay === 'sunset') {
        sandGrad.addColorStop(0, '#c28859');
        sandGrad.addColorStop(0.4, '#b07346');
        sandGrad.addColorStop(1, '#663920');
      } else if (timeOfDay === 'twilight') {
        sandGrad.addColorStop(0, '#363c45');
        sandGrad.addColorStop(0.5, '#292d34');
        sandGrad.addColorStop(1, '#1b1e23');
      } else {
        sandGrad.addColorStop(0, '#fef08a');
        sandGrad.addColorStop(0.3, '#fde047');
        sandGrad.addColorStop(0.8, '#eab308');
        sandGrad.addColorStop(1, '#ca8a04');
      }
      ctx.fillStyle = sandGrad;
      ctx.fill();

      // Wet Sand / Shore Foam line with gentle wave oscillation
      ctx.lineWidth = 4 * cam.zoom;
      ctx.strokeStyle =
        timeOfDay === 'twilight'
          ? 'rgba(186, 230, 253, 0.4)'
          : timeOfDay === 'sunset'
          ? 'rgba(254, 215, 170, 0.6)'
          : 'rgba(255, 255, 255, 0.75)';
      ctx.stroke();

      // Dynamic tidal wash froth line lapping along the sand
      ctx.beginPath();
      for (let sx = 0; sx <= width; sx += 16) {
        const wp = screenToWorld(sx, shoreScreen.sy, width, height);
        const surfOsc = Math.sin(time * 2.2 + wp.wx * 0.015) * 5;
        const beachCurve = Math.sin(wp.wx * 0.005 + 0.3) * 16 - Math.cos(wp.wx * 0.009) * 8;
        const washY = shoreWorldY + beachCurve + 6 + surfOsc;
        const pt = worldToScreen(wp.wx, washY, width, height);
        if (sx === 0) ctx.moveTo(0, pt.sy);
        else ctx.lineTo(sx, pt.sy);
      }
      ctx.lineWidth = 2 * cam.zoom;
      ctx.strokeStyle =
        timeOfDay === 'twilight'
          ? 'rgba(224, 242, 254, 0.3)'
          : timeOfDay === 'sunset'
          ? 'rgba(254, 243, 199, 0.4)'
          : 'rgba(255, 255, 255, 0.6)';
      ctx.stroke();
      ctx.restore();

      // --- 4. BOARDWALKS & TIMBER PIERS ---
      // Connecting pier spine in world coordinates (rooted on the sand and extending out into the sea)
      const pierPoints = [
        { x: 500, y: 535 }, // beach root on the sand
        { x: 500, y: 440 }, // lagoon hub in the sea
        { x: 380, y: 360 }, // deluxe west
        { x: 510, y: 240 }, // royal premium
        { x: 740, y: 370 }, // deluxe east
        { x: 240, y: 220 }, // empress west
      ];

      // Draw pier shadows
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 14 * cam.zoom;
      ctx.beginPath();
      // Main central pier
      let pt1 = worldToScreen(pierPoints[0].x, pierPoints[0].y + 6, width, height);
      let pt2 = worldToScreen(pierPoints[1].x, pierPoints[1].y + 6, width, height);
      let pt3 = worldToScreen(pierPoints[3].x, pierPoints[3].y + 6, width, height);
      ctx.moveTo(pt1.sx, pt1.sy);
      ctx.lineTo(pt2.sx, pt2.sy);
      ctx.lineTo(pt3.sx, pt3.sy);

      // West arm to deluxe 1 & empress
      let ptW1 = worldToScreen(pierPoints[2].x, pierPoints[2].y + 6, width, height);
      let ptW2 = worldToScreen(pierPoints[5].x, pierPoints[5].y + 6, width, height);
      ctx.moveTo(pt2.sx, pt2.sy);
      ctx.lineTo(ptW1.sx, ptW1.sy);
      ctx.lineTo(ptW2.sx, ptW2.sy);

      // East arm to deluxe 2
      let ptE = worldToScreen(pierPoints[4].x, pierPoints[4].y + 6, width, height);
      ctx.moveTo(pt2.sx, pt2.sy);
      ctx.lineTo(ptE.sx, ptE.sy);
      ctx.stroke();

      // Draw timber boardwalk surface
      ctx.strokeStyle = timeOfDay === 'twilight' ? '#4a3f35' : '#8b5a2b';
      ctx.lineWidth = 10 * cam.zoom;
      ctx.beginPath();
      pt1 = worldToScreen(pierPoints[0].x, pierPoints[0].y, width, height);
      pt2 = worldToScreen(pierPoints[1].x, pierPoints[1].y, width, height);
      pt3 = worldToScreen(pierPoints[3].x, pierPoints[3].y, width, height);
      ctx.moveTo(pt1.sx, pt1.sy);
      ctx.lineTo(pt2.sx, pt2.sy);
      ctx.lineTo(pt3.sx, pt3.sy);

      ptW1 = worldToScreen(pierPoints[2].x, pierPoints[2].y, width, height);
      ptW2 = worldToScreen(pierPoints[5].x, pierPoints[5].y, width, height);
      ctx.moveTo(pt2.sx, pt2.sy);
      ctx.lineTo(ptW1.sx, ptW1.sy);
      ctx.lineTo(ptW2.sx, ptW2.sy);

      ptE = worldToScreen(pierPoints[4].x, pierPoints[4].y, width, height);
      ctx.moveTo(pt2.sx, pt2.sy);
      ctx.lineTo(ptE.sx, ptE.sy);
      ctx.stroke();

      // Pier edge highlights
      ctx.strokeStyle = timeOfDay === 'twilight' ? '#6b5849' : '#b8860b';
      ctx.lineWidth = 1.5 * cam.zoom;
      ctx.stroke();
      ctx.restore();

      // Palm trees & Beach flora along the shore and flanking the beachfront tower
      const palms = [
        { x: 42, y: 645, scale: 1.15, sway: 0.45 },
        { x: 195, y: 630, scale: 1.05, sway: 0.35 },
        { x: 44, y: 530, scale: 0.95, sway: 0.5 },
        { x: 235, y: 550, scale: 0.9, sway: 0.6 },
        { x: 420, y: 630, scale: 1.0, sway: 0.5 },
        { x: 720, y: 620, scale: 1.15, sway: 0.35 },
        { x: 880, y: 605, scale: 1.05, sway: 0.55 },
        // Additional trees
        { x: 10, y: 600, scale: 1.2, sway: 0.4 },
        { x: 25, y: 580, scale: 1.0, sway: 0.3 },
        { x: 100, y: 620, scale: 1.1, sway: 0.5 },
        { x: 120, y: 590, scale: 0.9, sway: 0.4 },
        { x: 200, y: 640, scale: 1.0, sway: 0.4 },
        { x: 220, y: 610, scale: 0.9, sway: 0.3 },
        { x: 300, y: 630, scale: 1.0, sway: 0.5 },
        { x: 350, y: 600, scale: 0.8, sway: 0.4 },
      ];

      palms.forEach((p) => {
        const sc = worldToScreen(p.x, p.y, width, height);
        const swayAngle = Math.sin(time + p.sway) * 0.08;

        ctx.save();
        ctx.translate(sc.sx, sc.sy);
        ctx.rotate(swayAngle);

        // Trunk
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(8 * cam.zoom, -25 * cam.zoom, 4 * cam.zoom, -50 * cam.zoom * p.scale);
        ctx.lineWidth = 4.5 * cam.zoom;
        ctx.strokeStyle = timeOfDay === 'twilight' ? '#272018' : '#654321';
        ctx.stroke();

        // Palm fronds
        const leafColor = timeOfDay === 'twilight' ? '#0d251c' : timeOfDay === 'sunset' ? '#2f4f2f' : '#15803d';
        ctx.fillStyle = leafColor;
        ctx.strokeStyle = leafColor;
        ctx.lineWidth = 2 * cam.zoom;

        for (let a = 0; a < 6; a++) {
          const angle = (a * Math.PI) / 3 + Math.sin(time * 1.2 + a) * 0.05;
          const lx = Math.cos(angle) * 30 * cam.zoom * p.scale;
          const ly = Math.sin(angle) * 16 * cam.zoom * p.scale - 50 * cam.zoom * p.scale;
          ctx.beginPath();
          ctx.moveTo(4 * cam.zoom, -50 * cam.zoom * p.scale);
          ctx.quadraticCurveTo(lx * 0.6, ly - 8 * cam.zoom, lx, ly);
          ctx.stroke();
        }
        ctx.restore();
      });

      // --- 5. RESORT FACILITIES ON SHORE (Main Restaurant Pavilion, Spa, Infinity Edge) ---
      const pavilionPos = worldToScreen(500, 630, width, height);
      ctx.save();
      // Pavilion Base
      ctx.fillStyle = timeOfDay === 'twilight' ? '#261b14' : '#5c3a21';
      ctx.fillRect(
        pavilionPos.sx - 35 * cam.zoom,
        pavilionPos.sy - 22 * cam.zoom,
        70 * cam.zoom,
        22 * cam.zoom
      );
      // Thatched Roof
      ctx.beginPath();
      ctx.moveTo(pavilionPos.sx - 45 * cam.zoom, pavilionPos.sy - 22 * cam.zoom);
      ctx.lineTo(pavilionPos.sx, pavilionPos.sy - 48 * cam.zoom);
      ctx.lineTo(pavilionPos.sx + 45 * cam.zoom, pavilionPos.sy - 22 * cam.zoom);
      ctx.closePath();
      ctx.fillStyle = timeOfDay === 'twilight' ? '#3d2e1e' : '#b48a52';
      ctx.fill();

      // Warm lantern glow inside pavilion
      const lanternGlow = ctx.createRadialGradient(
        pavilionPos.sx,
        pavilionPos.sy - 15 * cam.zoom,
        2 * cam.zoom,
        pavilionPos.sx,
        pavilionPos.sy - 15 * cam.zoom,
        45 * cam.zoom
      );
      lanternGlow.addColorStop(0, 'rgba(253, 224, 71, 0.85)');
      lanternGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
      lanternGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = lanternGlow;
      ctx.beginPath();
      ctx.arc(pavilionPos.sx, pavilionPos.sy - 15 * cam.zoom, 45 * cam.zoom, 0, Math.PI * 2);
      ctx.fill();

      // Label for Central Sanctuary
      ctx.font = `${Math.max(10, 11 * cam.zoom)}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.textAlign = 'center';
      ctx.fillText('Sanctuary Lounge & Pavilion', pavilionPos.sx, pavilionPos.sy + 18 * cam.zoom);
      ctx.restore();

      // --- 6. 10-FLOOR OCEAN TOWER (WITH BALCONY & ROOFTOP SWIMMING POOL SUITE) ---
      renderOceanTower({
        ctx,
        hotels,
        selectedHotel,
        hoveredHotel: hoveredHotelRef.current,
        selectedCategory,
        timeOfDay,
        time,
        cam,
        worldToScreen,
        width,
        height,
      });

      // --- 7. STANDALONE COTTAGES & OVERWATER VILLAS RENDERING ---
      hotels.filter((h) => !h.isBuildingFloor).forEach((hotel) => {
        const isSelected = selectedHotel?.id === hotel.id;
        const isHovered = hoveredHotelRef.current?.id === hotel.id;
        const matchesFilter = selectedCategory === 'all' || hotel.category === selectedCategory;

        // Apply depth and parallax
        const pos = worldToScreen(hotel.position.x, hotel.position.y, width, height);

        ctx.save();
        ctx.translate(pos.sx, pos.sy);

        // Alpha based on category filter
        if (!matchesFilter && !isSelected) {
          ctx.globalAlpha = 0.22;
        } else {
          ctx.globalAlpha = 1.0;
        }

        // Slight hover or selected scale lift
        const liftScale = isSelected ? 1.18 : isHovered ? 1.1 : 1.0;
        ctx.scale(liftScale, liftScale);

        const villaZoom = cam.zoom;

        // 1. Water shadow under the stilted villa
        ctx.beginPath();
        ctx.ellipse(
          0,
          16 * villaZoom,
          32 * villaZoom,
          10 * villaZoom,
          0,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fill();

        // 2. Stilts / Pilings
        ctx.strokeStyle = timeOfDay === 'twilight' ? '#1c1510' : '#452a15';
        ctx.lineWidth = 2.5 * villaZoom;
        ctx.beginPath();
        // 4 stilt legs
        ctx.moveTo(-18 * villaZoom, 0);
        ctx.lineTo(-18 * villaZoom, 16 * villaZoom);
        ctx.moveTo(18 * villaZoom, 0);
        ctx.lineTo(18 * villaZoom, 16 * villaZoom);
        ctx.moveTo(-10 * villaZoom, 4 * villaZoom);
        ctx.lineTo(-10 * villaZoom, 18 * villaZoom);
        ctx.moveTo(10 * villaZoom, 4 * villaZoom);
        ctx.lineTo(10 * villaZoom, 18 * villaZoom);
        ctx.stroke();

        // 3. Wooden Deck
        ctx.fillStyle = timeOfDay === 'twilight' ? '#3d2e20' : '#85542b';
        ctx.fillRect(-26 * villaZoom, -4 * villaZoom, 52 * villaZoom, 8 * villaZoom);
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 0.75 * villaZoom;
        ctx.strokeRect(-26 * villaZoom, -4 * villaZoom, 52 * villaZoom, 8 * villaZoom);

        // 4. Private Pool / Glass Floor Accent (for Deluxe/Premium)
        if (hotel.category === 'premium' || hotel.category === 'deluxe') {
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.roundRect(-22 * villaZoom, 4 * villaZoom, 14 * villaZoom, 8 * villaZoom, 2 * villaZoom);
          ctx.fill();
          // Shimmer on pool
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fillRect(-20 * villaZoom, 5 * villaZoom, 4 * villaZoom, 1.5 * villaZoom);
        }

        // 5. Villa Walls & Glass Windows
        ctx.fillStyle = timeOfDay === 'twilight' ? '#2b211a' : '#eed9b7';
        ctx.fillRect(-18 * villaZoom, -26 * villaZoom, 36 * villaZoom, 22 * villaZoom);

        // Warm interior glow through windows
        const windowGlow = ctx.createRadialGradient(
          0,
          -16 * villaZoom,
          2 * villaZoom,
          0,
          -16 * villaZoom,
          22 * villaZoom
        );
        windowGlow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
        windowGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.7)');
        windowGlow.addColorStop(1, 'rgba(245, 158, 11, 0.1)');
        ctx.fillStyle = windowGlow;
        ctx.fillRect(-14 * villaZoom, -22 * villaZoom, 28 * villaZoom, 14 * villaZoom);

        // 6. Thatched / Curved Balinese Villa Roof
        ctx.beginPath();
        if (hotel.category === 'premium') {
          // Double-tier royal roof
          ctx.moveTo(-28 * villaZoom, -26 * villaZoom);
          ctx.lineTo(-2 * villaZoom, -46 * villaZoom);
          ctx.lineTo(28 * villaZoom, -26 * villaZoom);
          ctx.closePath();
          ctx.fillStyle = timeOfDay === 'twilight' ? '#4a3525' : '#a27641';
          ctx.fill();

          // Upper pagoda tier
          ctx.beginPath();
          ctx.moveTo(-16 * villaZoom, -42 * villaZoom);
          ctx.lineTo(0, -58 * villaZoom);
          ctx.lineTo(16 * villaZoom, -42 * villaZoom);
          ctx.closePath();
          ctx.fillStyle = timeOfDay === 'twilight' ? '#3d281a' : '#845727';
          ctx.fill();
        } else {
          // Single elegant thatched roof
          ctx.moveTo(-26 * villaZoom, -26 * villaZoom);
          ctx.lineTo(0, -48 * villaZoom);
          ctx.lineTo(26 * villaZoom, -26 * villaZoom);
          ctx.closePath();
          ctx.fillStyle = timeOfDay === 'twilight' ? '#3f2d20' : '#9b6e3c';
          ctx.fill();
        }

        // 7. Beacon & Selection Halo
        if (isSelected || isHovered) {
          const pulse = (Math.sin(time * 3) + 1) * 0.5;
          const haloRadius = (36 + pulse * 10) * villaZoom;

          const haloGrad = ctx.createRadialGradient(0, -14 * villaZoom, 10, 0, -14 * villaZoom, haloRadius);
          haloGrad.addColorStop(0, 'rgba(212, 175, 55, 0.45)');
          haloGrad.addColorStop(0.6, 'rgba(212, 175, 55, 0.15)');
          haloGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');

          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(0, -14 * villaZoom, haloRadius, 0, Math.PI * 2);
          ctx.fill();

          // Outer pulsing ring
          ctx.strokeStyle = isSelected ? '#d4af37' : '#38bdf8';
          ctx.lineWidth = 2 * villaZoom;
          ctx.beginPath();
          ctx.arc(0, -14 * villaZoom, (32 + pulse * 6) * villaZoom, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Category Tag Badge floating above
        ctx.font = `600 ${Math.max(9, 10 * villaZoom)}px 'Space Mono', monospace`;
        const catText = hotel.category.toUpperCase();
        const textWidth = ctx.measureText(catText).width;
        const pillY = -60 * villaZoom;

        // Pill background
        ctx.fillStyle = isSelected
          ? '#d4af37'
          : hotel.category === 'premium'
          ? '#b45309'
          : hotel.category === 'deluxe'
          ? '#1d4ed8'
          : hotel.category === 'comfort'
          ? '#0369a1'
          : '#047857';

        ctx.beginPath();
        ctx.roundRect(
          -textWidth / 2 - 8 * villaZoom,
          pillY - 8 * villaZoom,
          textWidth + 16 * villaZoom,
          16 * villaZoom,
          8 * villaZoom
        );
        ctx.fill();

        ctx.fillStyle = isSelected ? '#000000' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(catText, 0, pillY);

        ctx.restore();
      });

      // --- 7. PROPERTY TOUR HOTSPOTS (When in property or tour mode) ---
      if (selectedHotel && (isTourMode || cam.zoom > 1.3)) {
        selectedHotel.tourPoints.forEach((tp) => {
          const ptScreen = worldToScreen(tp.view.x, tp.view.y, width, height);
          const isHotspotActive = activeTourPointId === tp.id;
          const isHotspotHovered = hoveredHotspotRef.current?.id === tp.id;

          ctx.save();
          ctx.translate(ptScreen.sx, ptScreen.sy);

          const pulse = (Math.sin(time * 4) + 1) * 0.5;

          // Hotspot pulse ring
          ctx.beginPath();
          ctx.arc(0, 0, (14 + pulse * 6) * cam.zoom, 0, Math.PI * 2);
          ctx.strokeStyle = isHotspotActive ? '#d4af37' : 'rgba(56, 189, 248, 0.7)';
          ctx.lineWidth = 2 * cam.zoom;
          ctx.stroke();

          // Hotspot core
          ctx.beginPath();
          ctx.arc(0, 0, 8 * cam.zoom, 0, Math.PI * 2);
          ctx.fillStyle = isHotspotActive ? '#d4af37' : '#0284c7';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(0, 0, 3.5 * cam.zoom, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          // Hotspot Label
          ctx.font = `600 ${Math.max(10, 11 * cam.zoom)}px 'Plus Jakarta Sans', sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          ctx.fillText(tp.name, 0, -14 * cam.zoom);

          ctx.restore();
        });
      }

      // --- 8. FLOATING PARTICLES (Sea Spray / Sparks / Fireflies) ---
      particlesRef.current.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = WORLD_WIDTH;
        if (p.x > WORLD_WIDTH) p.x = 0;
        if (p.y < 0) p.y = WORLD_HEIGHT;
        if (p.y > WORLD_HEIGHT) p.y = 0;

        p.alpha += Math.sin(time * 2 + p.pulseSpeed) * 0.01;
        const safeAlpha = Math.max(0.1, Math.min(p.maxAlpha, p.alpha));

        const ptScreen = worldToScreen(p.x, p.y, width, height);

        ctx.beginPath();
        ctx.arc(ptScreen.sx, ptScreen.sy, p.size * cam.zoom, 0, Math.PI * 2);
        if (timeOfDay === 'sunset') {
          ctx.fillStyle = `rgba(251, 191, 36, ${safeAlpha})`;
        } else if (timeOfDay === 'twilight') {
          ctx.fillStyle = `rgba(186, 230, 253, ${safeAlpha})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${safeAlpha * 0.6})`;
        }
        ctx.fill();
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    hotels,
    selectedHotel,
    selectedCategory,
    timeOfDay,
    isTourMode,
    activeTourPointId,
    worldToScreen,
    screenToWorld,
  ]);

  // Hit testing for Pointer Hover & Selection
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    // Handle Drag panning
    if (isDraggingRef.current) {
      const dx = sx - dragStartRef.current.x;
      const dy = sy - dragStartRef.current.y;
      const zoom = cameraRef.current.zoom;

      cameraRef.current.targetX = cameraStartRef.current.x - dx / zoom;
      cameraRef.current.targetY = cameraStartRef.current.y - dy / zoom;

      // Keep inside bounds
      cameraRef.current.targetX = Math.max(100, Math.min(WORLD_WIDTH - 100, cameraRef.current.targetX));
      cameraRef.current.targetY = Math.max(120, Math.min(WORLD_HEIGHT - 80, cameraRef.current.targetY));
      return;
    }

    const { wx, wy } = screenToWorld(sx, sy, canvas.clientWidth, canvas.clientHeight);

    // 1. Check Tour Hotspots first if in property tour mode
    if (selectedHotel && (isTourMode || cameraRef.current.zoom > 1.3)) {
      let foundHotspot: TourPoint | null = null;
      for (const tp of selectedHotel.tourPoints) {
        const dist = Math.hypot(wx - tp.view.x, wy - tp.view.y);
        if (dist < 22) {
          foundHotspot = tp;
          break;
        }
      }
      if (foundHotspot) {
        hoveredHotspotRef.current = foundHotspot;
        canvas.style.cursor = 'pointer';
        return;
      } else {
        hoveredHotspotRef.current = null;
      }
    }

    // 2. Check Hotels (Prioritizing Building floors if inside tower bounding box)
    let foundHotel: Hotel | null = null;

    // Check 10-floor building bounding box on sand (balconies at x=28 to x=60, core at x=60 to x=150, groundY=840, floorHeight=25)
    if (wx >= 24 && wx <= 154 && wy >= 340 && wy <= 850) {
      const groundY = 840;
      const floorHeight = 25;
      const rawFloor = Math.floor((groundY - wy) / floorHeight) + 1;
      const targetFloorNumber = Math.max(1, Math.min(10, rawFloor));
      foundHotel = hotels.find((h) => h.isBuildingFloor && h.floorNumber === targetFloorNumber) || null;
    }

    // Otherwise check standalone cottages with radial distance
    if (!foundHotel) {
      const hitRadius = 45;
      for (const h of hotels) {
        if (h.isBuildingFloor) continue;
        const dist = Math.hypot(wx - h.position.x, wy - h.position.y);
        if (dist < hitRadius) {
          foundHotel = h;
          break;
        }
      }
    }

    hoveredHotelRef.current = foundHotel;
    setHoveredHotel(foundHotel);

    if (foundHotel) {
      canvas.style.cursor = 'pointer';
      setTooltipPos({ x: sx, y: sy });
    } else {
      canvas.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
      setTooltipPos(null);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    cameraStartRef.current = {
      x: cameraRef.current.targetX,
      y: cameraRef.current.targetY,
    };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if was a drag or a click
    const dragDistance = Math.hypot(
      e.clientX - dragStartRef.current.x,
      e.clientY - dragStartRef.current.y
    );

    isDraggingRef.current = false;

    // Only handle click if mouse moved less than 6px
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

  // Zoom with Wheel
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    const nextZoom = Math.max(0.75, Math.min(2.5, cameraRef.current.targetZoom * zoomFactor));
    cameraRef.current.targetZoom = nextZoom;
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
          isDraggingRef.current = false;
          setHoveredHotel(null);
          hoveredHotelRef.current = null;
        }}
        onWheel={handleWheel}
      />

      {/* Floating Hover Tooltip (Kovnar editorial styling) */}
      {hoveredHotel && tooltipPos && !selectedHotel && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full transform pb-4 transition-all duration-150"
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
