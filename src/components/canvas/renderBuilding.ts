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
  const towerFloors = hotels
    .filter((h) => h.isBuildingFloor)
    .sort((a, b) => (a.floorNumber || 0) - (b.floorNumber || 0));

  if (towerFloors.length === 0) return;

  // World geometry parameters (situated firmly on the golden beach sand)
  const baseX = 1000; // world coordinate for the left edge of the building
  const buildingWidth = 90; 
  const balconyWidth = 32; // extends to the left (baseX - balconyWidth)
  const groundY = 1000; // placed directly on the beach sand
  const floorHeight = 25;
  const totalFloors = 10;

  const zoom = cam.zoom;

  ctx.save();

  // --- 1. SHADOW OF TOWER ON THE GOLDEN SAND ---
  const shadowBase = worldToScreen(baseX - balconyWidth, groundY, width, height);
  const shadowGrad = ctx.createRadialGradient(
    shadowBase.sx + 45 * zoom,
    shadowBase.sy + 8 * zoom,
    8 * zoom,
    shadowBase.sx + 45 * zoom,
    shadowBase.sy + 8 * zoom,
    95 * zoom
  );
  shadowGrad.addColorStop(0, timeOfDay === 'twilight' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(120, 70, 20, 0.45)');
  shadowGrad.addColorStop(0.6, timeOfDay === 'twilight' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(150, 90, 30, 0.2)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(
    shadowBase.sx + 45 * zoom,
    shadowBase.sy + 12 * zoom,
    80 * zoom,
    24 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // --- 2. BEACHFRONT SANDSTONE TERRACE & GROUND RECEPTION LOBBY ON THE SAND ---
  const podiumTop = groundY;
  const podiumBottom = groundY + 22;
  const pTopSc = worldToScreen(baseX - balconyWidth - 4, podiumTop, width, height);
  const pBotSc = worldToScreen(baseX + buildingWidth + 8, podiumBottom, width, height);

  // Warm sandstone terrace foundation on the sand
  const sandTerraceGrad = ctx.createLinearGradient(0, pTopSc.sy, 0, pBotSc.sy);
  if (timeOfDay === 'twilight') {
    sandTerraceGrad.addColorStop(0, '#2b231c');
    sandTerraceGrad.addColorStop(1, '#1b1510');
  } else if (timeOfDay === 'sunset') {
    sandTerraceGrad.addColorStop(0, '#c28859');
    sandTerraceGrad.addColorStop(1, '#854d24');
  } else {
    sandTerraceGrad.addColorStop(0, '#e5c290');
    sandTerraceGrad.addColorStop(0.5, '#cba46e');
    sandTerraceGrad.addColorStop(1, '#a67d48');
  }
  ctx.fillStyle = sandTerraceGrad;
  ctx.beginPath();
  ctx.roundRect(
    pTopSc.sx,
    pTopSc.sy,
    pBotSc.sx - pTopSc.sx,
    pBotSc.sy - pTopSc.sy,
    4 * zoom
  );
  ctx.fill();

  // Terrace sandstone coping border
  ctx.strokeStyle = timeOfDay === 'twilight' ? '#443527' : '#d4af37';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Ground Floor Double-Height Glass Atrium Lobby (groundY - 14 to groundY)
  const lobbyTopSc = worldToScreen(baseX, groundY - 14, width, height);
  const lobbyBotSc = worldToScreen(baseX + buildingWidth, groundY, width, height);
  ctx.fillStyle = timeOfDay === 'twilight' ? 'rgba(254, 240, 138, 0.25)' : 'rgba(254, 240, 138, 0.45)';
  ctx.fillRect(
    lobbyTopSc.sx,
    lobbyTopSc.sy,
    lobbyBotSc.sx - lobbyTopSc.sx,
    lobbyBotSc.sy - lobbyTopSc.sy
  );

  // Lobby warm chandelier glow
  const lobGlow = ctx.createRadialGradient(
    lobbyTopSc.sx + (lobbyBotSc.sx - lobbyTopSc.sx) / 2,
    lobbyTopSc.sy + (lobbyBotSc.sy - lobbyTopSc.sy) / 2,
    2 * zoom,
    lobbyTopSc.sx + (lobbyBotSc.sx - lobbyTopSc.sx) / 2,
    lobbyTopSc.sy + (lobbyBotSc.sy - lobbyTopSc.sy) / 2,
    26 * zoom
  );
  lobGlow.addColorStop(0, 'rgba(253, 224, 71, 0.9)');
  lobGlow.addColorStop(0.6, 'rgba(245, 158, 11, 0.35)');
  lobGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = lobGlow;
  ctx.beginPath();
  ctx.arc(
    lobbyTopSc.sx + (lobbyBotSc.sx - lobbyTopSc.sx) / 2,
    lobbyTopSc.sy + (lobbyBotSc.sy - lobbyTopSc.sy) / 2,
    26 * zoom,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Timber entrance canopy
  const canopySc = worldToScreen(baseX + 16, groundY - 6, width, height);
  const canopyEndSc = worldToScreen(baseX + buildingWidth - 16, groundY, width, height);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(canopySc.sx, canopySc.sy, canopyEndSc.sx - canopySc.sx, 4 * zoom);

  // Boardwalk path connection across the sand to the east
  const pierConnSc1 = worldToScreen(baseX + buildingWidth + 4, groundY + 10, width, height);
  const pierConnSc2 = worldToScreen(190, 545, width, height);
  ctx.strokeStyle = timeOfDay === 'twilight' ? '#3d2e20' : '#85542b';
  ctx.lineWidth = 5 * zoom;
  ctx.beginPath();
  ctx.moveTo(pierConnSc1.sx, pierConnSc1.sy);
  ctx.quadraticCurveTo((pierConnSc1.sx + pierConnSc2.sx) / 2, pierConnSc1.sy - 6 * zoom, pierConnSc2.sx, pierConnSc2.sy);
  ctx.stroke();

  // Beach Amenities on the Sand next to Tower (Sun umbrellas & Teak loungers)
  const beachLoungeSc = worldToScreen(baseX + buildingWidth + 24, groundY + 8, width, height);
  // Teak sun lounger on the sand
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(beachLoungeSc.sx - 8 * zoom, beachLoungeSc.sy, 16 * zoom, 5 * zoom);
  ctx.fillStyle = '#0ea5e9';
  ctx.fillRect(beachLoungeSc.sx - 8 * zoom, beachLoungeSc.sy - 2 * zoom, 5 * zoom, 4 * zoom); // pillow

  // Beach parasol on the sand
  const bUmbX = beachLoungeSc.sx + 14 * zoom;
  const bUmbY = beachLoungeSc.sy - 12 * zoom;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(bUmbX, beachLoungeSc.sy + 4 * zoom);
  ctx.lineTo(bUmbX, bUmbY);
  ctx.stroke();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(bUmbX, bUmbY, 12 * zoom, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  // Tower Base Architectural Badge
  ctx.font = `600 ${Math.max(8, 9 * zoom)}px 'Space Mono', monospace`;
  ctx.fillStyle = '#d4af37';
  ctx.textAlign = 'center';
  ctx.fillText('BEACHFRONT OCEAN TOWER', lobbyTopSc.sx + (lobbyBotSc.sx - lobbyTopSc.sx) / 2, lobbyBotSc.sy + 17 * zoom);

  // --- 3. RENDER THE 10 FLOORS ---
  towerFloors.forEach((floor) => {
    const fNum = floor.floorNumber || 1;
    const isSelected = selectedHotel?.id === floor.id;
    const isHovered = hoveredHotel?.id === floor.id;
    const matchesCategory = selectedCategory === 'all' || floor.category === selectedCategory;

    // Y bounds in world space
    const floorBotY = groundY - (fNum - 1) * floorHeight;
    const floorTopY = groundY - fNum * floorHeight;

    const botScreen = worldToScreen(baseX, floorBotY, width, height);
    const topScreen = worldToScreen(baseX, floorTopY, width, height);
    const fHeightScreen = botScreen.sy - topScreen.sy;

    // Building Main Core Screen X
    const leftSc = worldToScreen(baseX, floorTopY, width, height).sx;
    const rightSc = worldToScreen(baseX + buildingWidth, floorTopY, width, height).sx;
    const coreWidthSc = rightSc - leftSc;

    // Balcony Screen X (Extending on the left)
    const balcLeftSc = worldToScreen(baseX - balconyWidth, floorTopY, width, height).sx;
    const balcWidthSc = leftSc - balcLeftSc;

    ctx.save();

    // Dims if not matching category filter
    if (!matchesCategory && !isSelected) {
      ctx.globalAlpha = 0.25;
    } else {
      ctx.globalAlpha = 1.0;
    }

    // Floor Base Structure Slab (horizontal divider)
    ctx.fillStyle = timeOfDay === 'twilight' ? '#1e2630' : '#2b3544';
    ctx.fillRect(leftSc, botScreen.sy - 2 * zoom, coreWidthSc, 3.5 * zoom);

    // Exterior facade wall background
    const wallGrad = ctx.createLinearGradient(leftSc, 0, rightSc, 0);
    if (timeOfDay === 'sunset') {
      wallGrad.addColorStop(0, '#2c1e28');
      wallGrad.addColorStop(0.5, '#422838');
      wallGrad.addColorStop(1, '#2c1e28');
    } else if (timeOfDay === 'twilight') {
      wallGrad.addColorStop(0, '#0d1520');
      wallGrad.addColorStop(0.5, '#152030');
      wallGrad.addColorStop(1, '#0d1520');
    } else {
      wallGrad.addColorStop(0, '#1e293b');
      wallGrad.addColorStop(0.5, '#334155');
      wallGrad.addColorStop(1, '#1e293b');
    }
    ctx.fillStyle = wallGrad;
    ctx.fillRect(leftSc, topScreen.sy, coreWidthSc, fHeightScreen - 2 * zoom);

    // --- 2 HOTEL ROOMS PER FLOOR ---
    // Room 1 (West Wing): leftSc + 3 to leftSc + coreWidthSc * 0.47
    // Room 2 (East Wing): leftSc + coreWidthSc * 0.53 to rightSc - 3
    // Central Pillar / Elevator Core: center
    const room1X = leftSc + 3 * zoom;
    const room1W = coreWidthSc * 0.46;
    const room2X = leftSc + coreWidthSc * 0.52;
    const room2W = coreWidthSc * 0.45;
    const roomY = topScreen.sy + 2.5 * zoom;
    const roomH = fHeightScreen - 6 * zoom;

    // Room Window Glows
    const windowGlow1 = ctx.createRadialGradient(
      room1X + room1W / 2,
      roomY + roomH / 2,
      2 * zoom,
      room1X + room1W / 2,
      roomY + roomH / 2,
      room1W * 0.7
    );
    const windowGlow2 = ctx.createRadialGradient(
      room2X + room2W / 2,
      roomY + roomH / 2,
      2 * zoom,
      room2X + room2W / 2,
      roomY + roomH / 2,
      room2W * 0.7
    );

    const glowColor =
      isSelected || isHovered
        ? 'rgba(254, 240, 138, 0.95)'
        : timeOfDay === 'twilight'
        ? 'rgba(253, 224, 71, 0.75)'
        : timeOfDay === 'sunset'
        ? 'rgba(251, 146, 60, 0.65)'
        : 'rgba(224, 242, 254, 0.6)';

    windowGlow1.addColorStop(0, glowColor);
    windowGlow1.addColorStop(0.7, 'rgba(245, 158, 11, 0.25)');
    windowGlow1.addColorStop(1, 'rgba(15, 23, 42, 0.6)');

    windowGlow2.addColorStop(0, glowColor);
    windowGlow2.addColorStop(0.7, 'rgba(245, 158, 11, 0.25)');
    windowGlow2.addColorStop(1, 'rgba(15, 23, 42, 0.6)');

    // Render Room 1 (West Wing) Window
    ctx.fillStyle = windowGlow1;
    ctx.fillRect(room1X, roomY, room1W, roomH);

    // Room 1 Interior Details: subtle bed silhouette & drapery
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(room1X + 4 * zoom, roomY + roomH - 4 * zoom, room1W - 8 * zoom, 3 * zoom);
    // Vertical window glass mullion
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(room1X + room1W / 2, roomY);
    ctx.lineTo(room1X + room1W / 2, roomY + roomH);
    ctx.stroke();

    // Render Room 2 (East Wing) Window
    ctx.fillStyle = windowGlow2;
    ctx.fillRect(room2X, roomY, room2W, roomH);

    // Room 2 Interior Details
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(room2X + 4 * zoom, roomY + roomH - 4 * zoom, room2W - 8 * zoom, 3 * zoom);
    // Vertical mullion
    ctx.beginPath();
    ctx.moveTo(room2X + room2W / 2, roomY);
    ctx.lineTo(room2X + room2W / 2, roomY + roomH);
    ctx.stroke();

    // Central Architectural Mullion / Elevator Column
    const centerColX = leftSc + coreWidthSc * 0.48;
    const centerColW = coreWidthSc * 0.04;
    ctx.fillStyle = timeOfDay === 'twilight' ? '#111827' : '#1e293b';
    ctx.fillRect(centerColX, topScreen.sy, centerColW, fHeightScreen);

    // Vertical accent light strip down the center
    ctx.fillStyle = isSelected ? '#d4af37' : '#38bdf8';
    ctx.fillRect(centerColX + centerColW / 2 - 0.5 * zoom, topScreen.sy, 1 * zoom, fHeightScreen);

    // --- BALCONY ON THE LEFT OF THE CANVAS ---
    // Balcony slab extends left from leftSc - balcWidthSc to leftSc
    const balcDeckY = botScreen.sy - 3 * zoom;
    const balcDeckH = 3.5 * zoom;

    // 1. Cantilevered Timber Balcony Floor Slab
    ctx.fillStyle = timeOfDay === 'twilight' ? '#3e2b1d' : '#85542b';
    ctx.fillRect(balcLeftSc, balcDeckY, balcWidthSc, balcDeckH);

    // Teak accent line
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 0.75 * zoom;
    ctx.strokeRect(balcLeftSc, balcDeckY, balcWidthSc, balcDeckH);

    // 2. Balcony Glass Balustrade / Railing
    const balcRailingH = 10 * zoom;
    const balcRailingY = balcDeckY - balcRailingH;

    // Glass panel
    ctx.fillStyle = isSelected
      ? 'rgba(212, 175, 55, 0.35)'
      : isHovered
      ? 'rgba(56, 189, 248, 0.35)'
      : 'rgba(186, 230, 253, 0.18)';
    ctx.fillRect(balcLeftSc, balcRailingY, balcWidthSc, balcRailingH);

    // Railing Glass Top Bar (bronze handrail)
    ctx.fillStyle = isSelected ? '#d4af37' : '#e2e8f0';
    ctx.fillRect(balcLeftSc - 1 * zoom, balcRailingY, balcWidthSc + 1 * zoom, 1.5 * zoom);

    // Vertical glass bracket posts
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(balcLeftSc, balcRailingY);
    ctx.lineTo(balcLeftSc, balcDeckY);
    ctx.moveTo(balcLeftSc + balcWidthSc * 0.5, balcRailingY);
    ctx.lineTo(balcLeftSc + balcWidthSc * 0.5, balcDeckY);
    ctx.stroke();

    // Balcony Furniture: Modern Outdoor Rattan Lounge Chair & Table
    const chairX = balcLeftSc + 6 * zoom;
    const chairY = balcDeckY - 6 * zoom;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(chairX, chairY + 2 * zoom, 7 * zoom, 4 * zoom); // seat cushion
    ctx.fillStyle = '#64748b';
    ctx.fillRect(chairX + 5 * zoom, chairY - 2 * zoom, 2 * zoom, 8 * zoom); // chair back

    // Small cocktail table & tropical plant
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(balcLeftSc + 16 * zoom, chairY + 3 * zoom, 4 * zoom, 3 * zoom);
    // Green planter foliage
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(balcLeftSc + 24 * zoom, chairY + 2 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Under-Balcony Warm Ambient LED Glow
    const ledGlow = ctx.createLinearGradient(balcLeftSc, balcDeckY + balcDeckH, balcLeftSc, balcDeckY + balcDeckH + 6 * zoom);
    ledGlow.addColorStop(0, isSelected ? 'rgba(212, 175, 55, 0.6)' : 'rgba(254, 240, 138, 0.35)');
    ledGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = ledGlow;
    ctx.fillRect(balcLeftSc, balcDeckY + balcDeckH, balcWidthSc, 6 * zoom);

    // --- FLOOR LEVEL BADGE (RIGHT PILLAR) ---
    const badgeX = rightSc + 8 * zoom;
    const badgeY = topScreen.sy + fHeightScreen / 2;
    ctx.font = `700 ${Math.max(8, 9 * zoom)}px 'Space Mono', monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    if (isSelected) {
      ctx.fillStyle = '#d4af37';
      ctx.fillText(`FL ${fNum} ★`, badgeX, badgeY);
    } else if (isHovered) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`FL ${fNum} ▸`, badgeX, badgeY);
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillText(`FL ${fNum}`, badgeX, badgeY);
    }

    // --- HOVER / SELECTION HIGHLIGHT OUTLINE ---
    if (isSelected || isHovered) {
      const pulse = (Math.sin(time * 4) + 1) * 0.5;
      const borderCol = isSelected ? '#d4af37' : '#38bdf8';
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = (isSelected ? 2.5 : 1.8) * zoom;
      ctx.beginPath();
      // Bounding box enclosing the entire floor AND its balcony
      ctx.roundRect(
        balcLeftSc - 2 * zoom,
        topScreen.sy - 1 * zoom,
        (rightSc - balcLeftSc) + 4 * zoom,
        fHeightScreen + 2 * zoom,
        3 * zoom
      );
      ctx.stroke();

      // Ambient Floor Spotlight Wash
      ctx.fillStyle = isSelected
        ? `rgba(212, 175, 55, ${0.12 + pulse * 0.08})`
        : `rgba(56, 189, 248, 0.12)`;
      ctx.fill();

      // Room numbers indicator on hover/select
      ctx.font = `600 ${Math.max(7, 8 * zoom)}px 'Space Mono', monospace`;
      ctx.fillStyle = isSelected ? '#000000' : '#ffffff';

      // Small Room A badge
      ctx.fillStyle = isSelected ? 'rgba(212, 175, 55, 0.9)' : 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(room1X + 2 * zoom, roomY + 2 * zoom, 22 * zoom, 9 * zoom);
      ctx.fillStyle = isSelected ? '#000000' : '#d4af37';
      ctx.fillText(`R${fNum}01`, room1X + 4 * zoom, roomY + 7 * zoom);

      // Small Room B badge
      ctx.fillStyle = isSelected ? 'rgba(212, 175, 55, 0.9)' : 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(room2X + 2 * zoom, roomY + 2 * zoom, 22 * zoom, 9 * zoom);
      ctx.fillStyle = isSelected ? '#000000' : '#d4af37';
      ctx.fillText(`R${fNum}02`, room2X + 4 * zoom, roomY + 7 * zoom);
    }

    ctx.restore();
  });

  // --- 4. FLOOR 10 ROOFTOP PENTHOUSE SWIMMING POOL & SUNDECK ---
  // Positioned directly on top of Floor 10
  const floor10TopY = groundY - totalFloors * floorHeight;
  const poolTopY = floor10TopY - 24; // 24 world units above floor 10
  const poolTopSc = worldToScreen(baseX - balconyWidth, poolTopY, width, height);
  const poolBotSc = worldToScreen(baseX + buildingWidth, floor10TopY, width, height);

  const poolWidthTotal = poolBotSc.sx - poolTopSc.sx;
  const poolHeightTotal = poolBotSc.sy - poolTopSc.sy;

  // Split: Rooftop Swimming Pool (left 60%) & Pool Sun Deck with Cabana (right 40%)
  const poolWaterW = poolWidthTotal * 0.62;
  const poolWaterX = poolTopSc.sx;
  const deckX = poolTopSc.sx + poolWaterW;
  const deckW = poolWidthTotal - poolWaterW;

  ctx.save();

  // 1. Rooftop Parapet / Deck Base
  ctx.fillStyle = timeOfDay === 'twilight' ? '#1c2430' : '#2b3648';
  ctx.fillRect(poolTopSc.sx, poolBotSc.sy - 3 * zoom, poolWidthTotal, 4 * zoom);

  // 2. Swimming Pool Basin & Sparkling Cyan Water
  const waterY = poolTopSc.sy + 4 * zoom;
  const waterH = poolHeightTotal - 6 * zoom;

  const waterGrad = ctx.createLinearGradient(poolWaterX, waterY, poolWaterX, waterY + waterH);
  waterGrad.addColorStop(0, '#38bdf8');
  waterGrad.addColorStop(0.35, '#06b6d4');
  waterGrad.addColorStop(0.75, '#0891b2');
  waterGrad.addColorStop(1, '#0e7490');
  ctx.fillStyle = waterGrad;
  ctx.beginPath();
  ctx.roundRect(poolWaterX, waterY, poolWaterW, waterH, [4 * zoom, 0, 0, 4 * zoom]);
  ctx.fill();

  // Animated Water Wave Caustics / Sun Glints
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  for (let px = poolWaterX + 4 * zoom; px < poolWaterX + poolWaterW - 4 * zoom; px += 10 * zoom) {
    const waveY = waterY + 4 * zoom + Math.sin(time * 3 + px * 0.08) * 1.5 * zoom;
    ctx.moveTo(px, waveY);
    ctx.lineTo(px + 6 * zoom, waveY + Math.cos(time * 2 + px * 0.1) * 1 * zoom);
  }
  ctx.stroke();

  // Underwater pool lights (soft cyan illumination)
  const poolLightGlow = ctx.createRadialGradient(
    poolWaterX + poolWaterW * 0.4,
    waterY + waterH * 0.6,
    2 * zoom,
    poolWaterX + poolWaterW * 0.4,
    waterY + waterH * 0.6,
    18 * zoom
  );
  poolLightGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  poolLightGlow.addColorStop(0.4, 'rgba(6, 182, 212, 0.6)');
  poolLightGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
  ctx.fillStyle = poolLightGlow;
  ctx.beginPath();
  ctx.arc(poolWaterX + poolWaterW * 0.4, waterY + waterH * 0.6, 18 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Cantilever Glass Perimeter Wall for Swimming Pool (Infinity view over sea)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 2 * zoom;
  ctx.strokeRect(poolWaterX, waterY, poolWaterW, waterH);

  // "GLASS INFINITY POOL" subtle water badge
  ctx.font = `600 ${Math.max(7, 8 * zoom)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 3;
  ctx.fillText('Rooftop Infinity Pool', poolWaterX + 6 * zoom, waterY + 9 * zoom);
  ctx.shadowBlur = 0;

  // 3. Penthouse Rooftop Sun Deck (Teak Flooring & Loungers)
  ctx.fillStyle = timeOfDay === 'twilight' ? '#3d2e20' : '#85542b';
  ctx.fillRect(deckX, waterY + 4 * zoom, deckW, waterH - 4 * zoom);

  // Teak sun loungers on deck
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(deckX + 4 * zoom, waterY + 8 * zoom, 14 * zoom, 4 * zoom); // lounger cushion
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(deckX + 4 * zoom, waterY + 6 * zoom, 4 * zoom, 4 * zoom); // pillow

  // Cocktail Umbrella / Cabana
  const umbrellaX = deckX + deckW - 14 * zoom;
  const umbrellaY = waterY + 4 * zoom;
  // Umbrella pole
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(umbrellaX, umbrellaY + 12 * zoom);
  ctx.lineTo(umbrellaX, umbrellaY - 4 * zoom);
  ctx.stroke();
  // Umbrella canopy
  ctx.fillStyle = '#d4af37';
  ctx.beginPath();
  ctx.arc(umbrellaX, umbrellaY - 4 * zoom, 12 * zoom, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  // Glass safety perimeter on deck
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1.5 * zoom;
  ctx.strokeRect(deckX, waterY, deckW, waterH);

  // --- 5. CATEGORY & PENTHOUSE CROWN AT THE TOP ---
  // Floating luxury badge above the pool
  const crownY = poolTopSc.sy - 16 * zoom;
  const crownCenterX = poolTopSc.sx + poolWidthTotal / 2;

  const crownText = '★ SIGNATURE PREMIUM · PENTHOUSE & POOL ★';
  ctx.font = `700 ${Math.max(9, 10 * zoom)}px 'Space Mono', monospace`;
  const textWidth = ctx.measureText(crownText).width;
  const pillPadding = 10 * zoom;

  // Shimmering Golden Pill
  const crownPulse = (Math.sin(time * 3) + 1) * 0.5;
  const pillW = textWidth + pillPadding * 2;
  const pillH = 18 * zoom;

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(
    crownCenterX - pillW / 2,
    crownY - pillH / 2,
    pillW,
    pillH,
    pillH / 2
  );
  ctx.fill();

  // Golden glowing border
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = (1.5 + crownPulse * 0.8) * zoom;
  ctx.stroke();

  // Text
  ctx.fillStyle = '#d4af37';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(crownText, crownCenterX, crownY);

  // Small golden finial pin extending downwards to roof
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(crownCenterX, crownY + pillH / 2);
  ctx.lineTo(crownCenterX, poolTopSc.sy);
  ctx.stroke();

  ctx.restore();
}
