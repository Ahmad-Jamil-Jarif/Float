import { Hotel, HotelCategory, TimeOfDay } from '../../types';

interface RenderBuildingParams {
  ctx: CanvasRenderingContext2D;
  hotels: Hotel[];
  selectedHotel: Hotel | null;
  hoveredHotel: Hotel | null;
  selectedCategory: HotelCategory | 'all';
  timeOfDay: TimeOfDay;
  time: number;
  cam: { x: number; y: number; zoom: number };
  worldToScreen: (wx: number, wy: number, width: number, height: number) => { sx: number; sy: number; scale: number };
  width: number;
  height: number;
}

// --- Module-level caches (avoid per-frame allocation) ---
let cachedCrownWidth = 0;
let cachedCrownFont = '';
const WALL_COLORS: Record<string, string> = {
  sunset: '#3a2333',
  twilight: '#101827',
  day: '#273449',
};
const SLAB_COLORS: Record<string, string> = {
  sunset: '#2b3544',
  twilight: '#1e2630',
  day: '#2b3544',
};
const WINDOW_BASE: Record<string, string> = {
  sunset: '#b45309',
  twilight: '#a8873a',
  day: '#7fa8bf',
};
const WINDOW_HOT = '#fee08a';

const TAU = Math.PI * 2;

export function renderOceanTower({
  ctx,
  hotels,
  selectedHotel,
  hoveredHotel,
  selectedCategory,
  timeOfDay,
  time,
  cam,
  worldToScreen,
  width,
  height,
}: RenderBuildingParams) {
  const zoom = cam.zoom;
  const camX = cam.x;
  const camY = cam.y;
  const halfW = width / 2;
  const halfH = height / 2;

  // Inline projector (avoids object churn of worldToScreen in hot paths)
  const sxOf = (wx: number) => halfW + (wx - camX) * zoom;
  const syOf = (wy: number) => halfH + (wy - camY) * zoom;

  // World geometry (situated firmly on the golden beach sand)
  const baseX = 1000;
  const buildingWidth = 90;
  const balconyWidth = 32;
  const groundY = 1000;
  const floorHeight = 25;
  const totalFloors = 10;

  // Quick vertical reject: whole tower off-screen?
  const towerTopSy = syOf(groundY - totalFloors * floorHeight - 30);
  const towerBotSy = syOf(groundY + 30);
  const towerLeftSx = sxOf(baseX - balconyWidth - 30);
  const towerRightSx = sxOf(baseX + buildingWidth + 60);
  if (towerBotSy < -60 || towerTopSy > height + 60 || towerRightSx < -80 || towerLeftSx > width + 80) {
    return;
  }

  ctx.save();

  // --- 1. TOWER SHADOW (cheap flat ellipse, no radial gradient) ---
  const shSx = sxOf(baseX - balconyWidth) + 45 * zoom;
  const shSy = syOf(groundY) + 12 * zoom;
  if (shSy > -40 && shSy < height + 40) {
    ctx.fillStyle = timeOfDay === 'twilight' ? 'rgba(0,0,0,0.35)' : 'rgba(120,70,20,0.30)';
    ctx.beginPath();
    ctx.ellipse(shSx, shSy, 80 * zoom, 18 * zoom, 0, 0, TAU);
    ctx.fill();
  }

  // --- 2. PODIUM / LOBBY (solid fills + 1 cached glow only when visible) ---
  const pTopSx = sxOf(baseX - balconyWidth - 4);
  const pTopSy = syOf(groundY);
  const pBotSx = sxOf(baseX + buildingWidth + 8);
  const pBotSy = syOf(groundY + 22);
  const podiumW = pBotSx - pTopSx;
  const podiumH = pBotSy - pTopSy;

  if (pTopSy < height + 40 && pBotSy > -40) {
    ctx.fillStyle =
      timeOfDay === 'twilight' ? '#241d16' : timeOfDay === 'sunset' ? '#a06a3c' : '#cba46e';
    ctx.fillRect(pTopSx, pTopSy, podiumW, podiumH);
    ctx.strokeStyle = timeOfDay === 'twilight' ? '#443527' : '#d4af37';
    ctx.lineWidth = Math.max(1, 1 * zoom);
    ctx.strokeRect(pTopSx, pTopSy, podiumW, podiumH);

    // Lobby glass
    const lobbyTopSy = syOf(groundY - 14);
    const lobbyBotSy = syOf(groundY);
    const lobbySx = sxOf(baseX);
    const lobbyW = sxOf(baseX + buildingWidth) - lobbySx;
    ctx.fillStyle =
      timeOfDay === 'twilight' ? 'rgba(254,240,138,0.25)' : 'rgba(254,240,138,0.45)';
    ctx.fillRect(lobbySx, lobbyTopSy, lobbyW, lobbyBotSy - lobbyTopSy);

    // Chandelier glow: single radial, only if on screen and zoom reasonable
    const glowCx = lobbySx + lobbyW / 2;
    const glowCy = lobbyTopSy + (lobbyBotSy - lobbyTopSy) / 2;
    if (glowCy > -60 && glowCy < height + 60) {
      const g = ctx.createRadialGradient(glowCx, glowCy, 2 * zoom, glowCx, glowCy, 26 * zoom);
      g.addColorStop(0, 'rgba(253,224,71,0.9)');
      g.addColorStop(0.6, 'rgba(245,158,11,0.35)');
      g.addColorStop(1, 'rgba(245,158,11,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(glowCx, glowCy, 26 * zoom, 0, TAU);
      ctx.fill();
    }

    // Timber canopy
    ctx.fillStyle = '#b45309';
    ctx.fillRect(sxOf(baseX + 16), syOf(groundY - 6), sxOf(baseX + buildingWidth - 16) - sxOf(baseX + 16), 4 * zoom);

    // Boardwalk connector
    ctx.strokeStyle = timeOfDay === 'twilight' ? '#3d2e20' : '#85542b';
    ctx.lineWidth = 5 * zoom;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sxOf(baseX + buildingWidth + 4), syOf(groundY + 10));
    ctx.quadraticCurveTo(
      (sxOf(baseX + buildingWidth + 4) + sxOf(190)) / 2,
      syOf(groundY + 10) - 6 * zoom,
      sxOf(190),
      syOf(545)
    );
    ctx.stroke();
    ctx.lineCap = 'butt';

    // Beach lounger + parasol (tiny, solid fills)
    const blSx = sxOf(baseX + buildingWidth + 24);
    const blSy = syOf(groundY + 8);
    if (blSx > -60 && blSx < width + 60 && blSy > -60 && blSy < height + 60) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(blSx - 8 * zoom, blSy, 16 * zoom, 5 * zoom);
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(blSx - 8 * zoom, blSy - 2 * zoom, 5 * zoom, 4 * zoom);
      const bUmbX = blSx + 14 * zoom;
      const bUmbY = blSy - 12 * zoom;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(bUmbX, blSy + 4 * zoom);
      ctx.lineTo(bUmbX, bUmbY);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(bUmbX, bUmbY, 12 * zoom, Math.PI, TAU);
      ctx.closePath();
      ctx.fill();
    }

    // Badge (single fillText, no shadow)
    ctx.font = `600 ${Math.max(8, 9 * zoom)}px 'Space Mono', monospace`;
    ctx.fillStyle = '#d4af37';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('BEACHFRONT OCEAN TOWER', lobbySx + lobbyW / 2, lobbyBotSy + 17 * zoom);
  }

  // --- 3. PRE-FILTER + SORT ONCE PER CALL (cheap: 10 items) ---
  // NOTE: caller renders every frame; keep this O(n) with early category check inline.
  const wallColor = WALL_COLORS[timeOfDay] ?? WALL_COLORS.day;
  const slabColor = SLAB_COLORS[timeOfDay] ?? SLAB_COLORS.day;
  const windowBase = WINDOW_BASE[timeOfDay] ?? WINDOW_BASE.day;

  for (let i = 0; i < hotels.length; i++) {
    const floor = hotels[i];
    if (!floor.isBuildingFloor) continue;
    const fNum = floor.floorNumber || 1;
    if (fNum < 1 || fNum > totalFloors) continue;

    const isSelected = selectedHotel !== null && selectedHotel.id === floor.id;
    const isHovered = !isSelected && hoveredHotel !== null && hoveredHotel.id === floor.id;
    const matchesCategory = selectedCategory === 'all' || floor.category === selectedCategory;
    if (!matchesCategory && !isSelected && !isHovered) {
      // Still draw dimmed but skip glow work; cull check still applies below
    }

    const floorBotY = groundY - (fNum - 1) * floorHeight;
    const floorTopY = groundY - fNum * floorHeight;
    const botSy = syOf(floorBotY);
    const topSy = syOf(floorTopY);
    // Per-floor vertical cull
    if (botSy < -50 || topSy > height + 50) continue;

    const leftSx = sxOf(baseX);
    const rightSx = sxOf(baseX + buildingWidth);
    const coreW = rightSx - leftSx;
    // Horizontal cull (with balcony + badge margin)
    if (rightSx < -120 || leftSx - balconyWidth * zoom - 60 > width) continue;

    const fH = botSy - topSy;
    const balcLeftSx = sxOf(baseX - balconyWidth);
    const balcW = leftSx - balcLeftSx;

    ctx.save();
    ctx.globalAlpha = !matchesCategory && !isSelected ? 0.25 : 1.0;

    // Slab divider
    ctx.fillStyle = slabColor;
    ctx.fillRect(leftSx, botSy - 2 * zoom, coreW, 3.5 * zoom);

    // Facade: solid fill (was per-floor linear gradient)
    ctx.fillStyle = wallColor;
    ctx.fillRect(leftSx, topSy, coreW, fH - 2 * zoom);

    // Rooms
    const room1X = leftSx + 3 * zoom;
    const room1W = coreW * 0.46;
    const room2X = leftSx + coreW * 0.52;
    const room2W = coreW * 0.45;
    const roomY = topSy + 2.5 * zoom;
    const roomH = fH - 6 * zoom;

    if (isSelected || isHovered) {
      // Only hot floors pay for radial gradients
      const cx1 = room1X + room1W / 2;
      const cy = roomY + roomH / 2;
      const g1 = ctx.createRadialGradient(cx1, cy, 2 * zoom, cx1, cy, room1W * 0.7);
      g1.addColorStop(0, WINDOW_HOT);
      g1.addColorStop(0.7, 'rgba(245,158,11,0.45)');
      g1.addColorStop(1, 'rgba(15,23,42,0.6)');
      ctx.fillStyle = g1;
      ctx.fillRect(room1X, roomY, room1W, roomH);
      const cx2 = room2X + room2W / 2;
      const g2 = ctx.createRadialGradient(cx2, cy, 2 * zoom, cx2, cy, room2W * 0.7);
      g2.addColorStop(0, WINDOW_HOT);
      g2.addColorStop(0.7, 'rgba(245,158,11,0.45)');
      g2.addColorStop(1, 'rgba(15,23,42,0.6)');
      ctx.fillStyle = g2;
      ctx.fillRect(room2X, roomY, room2W, roomH);
    } else {
      ctx.fillStyle = windowBase;
      ctx.globalAlpha *= 1; // keep dim logic from above
      ctx.fillRect(room1X, roomY, room1W, roomH);
      ctx.fillRect(room2X, roomY, room2W, roomH);
      // Warm center wash without gradient
      ctx.fillStyle = 'rgba(254,240,138,0.28)';
      ctx.fillRect(room1X + room1W * 0.2, roomY + roomH * 0.2, room1W * 0.6, roomH * 0.6);
      ctx.fillRect(room2X + room2W * 0.2, roomY + roomH * 0.2, room2W * 0.6, roomH * 0.6);
    }

    // Interior sills + mullions (batched strokes)
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(room1X + 4 * zoom, roomY + roomH - 4 * zoom, room1W - 8 * zoom, 3 * zoom);
    ctx.fillRect(room2X + 4 * zoom, roomY + roomH - 4 * zoom, room2W - 8 * zoom, 3 * zoom);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = Math.max(1, 1 * zoom);
    ctx.beginPath();
    ctx.moveTo(room1X + room1W / 2, roomY);
    ctx.lineTo(room1X + room1W / 2, roomY + roomH);
    ctx.moveTo(room2X + room2W / 2, roomY);
    ctx.lineTo(room2X + room2W / 2, roomY + roomH);
    ctx.stroke();

    // Center column + accent strip
    const centerColX = leftSx + coreW * 0.48;
    const centerColW = coreW * 0.04;
    ctx.fillStyle = timeOfDay === 'twilight' ? '#111827' : '#1e293b';
    ctx.fillRect(centerColX, topSy, centerColW, fH);
    ctx.fillStyle = isSelected ? '#d4af37' : '#38bdf8';
    ctx.fillRect(centerColX + centerColW / 2 - 0.5 * zoom, topSy, Math.max(1, 1 * zoom), fH);

    // Balcony
    const balcDeckY = botSy - 3 * zoom;
    const balcDeckH = 3.5 * zoom;
    ctx.fillStyle = timeOfDay === 'twilight' ? '#3e2b1d' : '#85542b';
    ctx.fillRect(balcLeftSx, balcDeckY, balcW, balcDeckH);
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = Math.max(1, 0.75 * zoom);
    ctx.strokeRect(balcLeftSx, balcDeckY, balcW, balcDeckH);

    const balcRailingH = 10 * zoom;
    const balcRailingY = balcDeckY - balcRailingH;
    ctx.fillStyle = isSelected
      ? 'rgba(212,175,55,0.35)'
      : isHovered
        ? 'rgba(56,189,248,0.35)'
        : 'rgba(186,230,253,0.18)';
    ctx.fillRect(balcLeftSx, balcRailingY, balcW, balcRailingH);
    ctx.fillStyle = isSelected ? '#d4af37' : '#e2e8f0';
    ctx.fillRect(balcLeftSx - 1 * zoom, balcRailingY, balcW + 1 * zoom, 1.5 * zoom);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = Math.max(1, 1 * zoom);
    ctx.beginPath();
    ctx.moveTo(balcLeftSx, balcRailingY);
    ctx.lineTo(balcLeftSx, balcDeckY);
    ctx.moveTo(balcLeftSx + balcW * 0.5, balcRailingY);
    ctx.lineTo(balcLeftSx + balcW * 0.5, balcDeckY);
    ctx.stroke();

    // Balcony furniture (solid rects, no arcs except planter)
    const chairX = balcLeftSx + 6 * zoom;
    const chairY = balcDeckY - 6 * zoom;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(chairX, chairY + 2 * zoom, 7 * zoom, 4 * zoom);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(chairX + 5 * zoom, chairY - 2 * zoom, 2 * zoom, 8 * zoom);
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(balcLeftSx + 16 * zoom, chairY + 3 * zoom, 4 * zoom, 3 * zoom);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(balcLeftSx + 24 * zoom, chairY + 2 * zoom, 3 * zoom, 0, TAU);
    ctx.fill();

    // Under-balcony LED: flat alpha rect instead of gradient
    ctx.fillStyle = isSelected ? 'rgba(212,175,55,0.35)' : 'rgba(254,240,138,0.20)';
    ctx.fillRect(balcLeftSx, balcDeckY + balcDeckH, balcW, 6 * zoom);

    // Floor badge
    ctx.font = `700 ${Math.max(8, 9 * zoom)}px 'Space Mono', monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    if (isSelected) {
      ctx.fillStyle = '#d4af37';
      ctx.fillText(`FL ${fNum} ★`, rightSx + 8 * zoom, topSy + fH / 2);
    } else if (isHovered) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`FL ${fNum} ▸`, rightSx + 8 * zoom, topSy + fH / 2);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillText(`FL ${fNum}`, rightSx + 8 * zoom, topSy + fH / 2);
    }

    // Selection outline (strokeRect instead of roundRect path + fill wash)
    if (isSelected || isHovered) {
      const pulse = (Math.sin(time * 4) + 1) * 0.5;
      ctx.strokeStyle = isSelected ? '#d4af37' : '#38bdf8';
      ctx.lineWidth = (isSelected ? 2.5 : 1.8) * zoom;
      ctx.strokeRect(balcLeftSx - 2 * zoom, topSy - 1 * zoom, rightSx - balcLeftSx + 4 * zoom, fH + 2 * zoom);
      ctx.fillStyle = isSelected
        ? `rgba(212,175,55,${0.10 + pulse * 0.06})`
        : 'rgba(56,189,248,0.10)';
      ctx.fillRect(balcLeftSx - 2 * zoom, topSy - 1 * zoom, rightSx - balcLeftSx + 4 * zoom, fH + 2 * zoom);

      // Room badges
      ctx.font = `600 ${Math.max(7, 8 * zoom)}px 'Space Mono', monospace`;
      ctx.textAlign = 'left';
      ctx.fillStyle = isSelected ? 'rgba(212,175,55,0.9)' : 'rgba(15,23,42,0.85)';
      ctx.fillRect(room1X + 2 * zoom, roomY + 2 * zoom, 22 * zoom, 9 * zoom);
      ctx.fillRect(room2X + 2 * zoom, roomY + 2 * zoom, 22 * zoom, 9 * zoom);
      ctx.fillStyle = isSelected ? '#000000' : '#d4af37';
      ctx.fillText(`R${fNum}01`, room1X + 4 * zoom, roomY + 7 * zoom);
      ctx.fillText(`R${fNum}02`, room2X + 4 * zoom, roomY + 7 * zoom);
    }

    ctx.restore();
  }

  // --- 4. ROOFTOP POOL + DECK (culled as a unit) ---
  const floor10TopY = groundY - totalFloors * floorHeight;
  const poolTopY = floor10TopY - 24;
  const poolTopSx = sxOf(baseX - balconyWidth);
  const poolTopSy = syOf(poolTopY);
  const poolBotSx = sxOf(baseX + buildingWidth);
  const poolBotSy = syOf(floor10TopY);
  const poolW = poolBotSx - poolTopSx;
  const poolH = poolBotSy - poolTopSy;

  if (poolBotSy > -80 && poolTopSy < height + 80 && poolBotSx > -100 && poolTopSx < width + 100) {
    const poolWaterW = poolW * 0.62;
    const poolWaterX = poolTopSx;
    const deckX = poolTopSx + poolWaterW;
    const deckW = poolW - poolWaterW;

    ctx.save();
    ctx.fillStyle = timeOfDay === 'twilight' ? '#1c2430' : '#2b3648';
    ctx.fillRect(poolTopSx, poolBotSy - 3 * zoom, poolW, 4 * zoom);

    const waterY = poolTopSy + 4 * zoom;
    const waterH = poolH - 6 * zoom;
    // Solid water + top highlight instead of 4-stop gradient
    ctx.fillStyle = timeOfDay === 'twilight' ? '#0c4a5e' : '#0891b2';
    ctx.fillRect(poolWaterX, waterY, poolWaterW, waterH);
    ctx.fillStyle = 'rgba(56,189,248,0.55)';
    ctx.fillRect(poolWaterX, waterY, poolWaterW, Math.max(2, 3 * zoom));

    // Animated glints: fewer segments, single batched path
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = Math.max(1, 1.5 * zoom);
    ctx.beginPath();
    const glintStep = Math.max(10 * zoom, 8);
    for (let px = poolWaterX + 4 * zoom; px < poolWaterX + poolWaterW - 4 * zoom; px += glintStep) {
      const waveY = waterY + 4 * zoom + Math.sin(time * 3 + px * 0.08) * 1.5 * zoom;
      ctx.moveTo(px, waveY);
      ctx.lineTo(px + 6 * zoom, waveY);
    }
    ctx.stroke();

    // Pool light: single small solid glow (no radial gradient)
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.arc(poolWaterX + poolWaterW * 0.4, waterY + waterH * 0.6, 3 * zoom, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = Math.max(1, 2 * zoom);
    ctx.strokeRect(poolWaterX, waterY, poolWaterW, waterH);

    ctx.font = `600 ${Math.max(7, 8 * zoom)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Rooftop Infinity Pool', poolWaterX + 6 * zoom, waterY + 9 * zoom);

    // Sun deck
    ctx.fillStyle = timeOfDay === 'twilight' ? '#3d2e20' : '#85542b';
    ctx.fillRect(deckX, waterY + 4 * zoom, deckW, waterH - 4 * zoom);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(deckX + 4 * zoom, waterY + 8 * zoom, 14 * zoom, 4 * zoom);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(deckX + 4 * zoom, waterY + 6 * zoom, 4 * zoom, 4 * zoom);
    const umbrellaX = deckX + deckW - 14 * zoom;
    const umbrellaY = waterY + 4 * zoom;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = Math.max(1, 1.5 * zoom);
    ctx.beginPath();
    ctx.moveTo(umbrellaX, umbrellaY + 12 * zoom);
    ctx.lineTo(umbrellaX, umbrellaY - 4 * zoom);
    ctx.stroke();
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(umbrellaX, umbrellaY - 4 * zoom, 12 * zoom, Math.PI, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = Math.max(1, 1.5 * zoom);
    ctx.strokeRect(deckX, waterY, deckW, waterH);

    // Crown pill (cache text width)
    const crownY = poolTopSy - 16 * zoom;
    const crownCenterX = poolTopSx + poolW / 2;
    const crownText = '★ SIGNATURE PREMIUM · PENTHOUSE & POOL ★';
    const crownFont = `700 ${Math.max(9, 10 * zoom)}px 'Space Mono', monospace`;
    if (crownFont !== cachedCrownFont) {
      ctx.font = crownFont;
      cachedCrownWidth = ctx.measureText(crownText).width;
      cachedCrownFont = crownFont;
    }
    const pillW = cachedCrownWidth + 20 * zoom;
    const pillH = 18 * zoom;
    const crownPulse = (Math.sin(time * 3) + 1) * 0.5;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(crownCenterX - pillW / 2, crownY - pillH / 2, pillW, pillH);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = (1.5 + crownPulse * 0.8) * zoom;
    ctx.strokeRect(crownCenterX - pillW / 2, crownY - pillH / 2, pillW, pillH);
    ctx.fillStyle = '#d4af37';
    ctx.font = crownFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(crownText, crownCenterX, crownY);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = Math.max(1, 1.5 * zoom);
    ctx.beginPath();
    ctx.moveTo(crownCenterX, crownY + pillH / 2);
    ctx.lineTo(crownCenterX, poolTopSy);
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();
  void worldToScreen;
  void width;
}
