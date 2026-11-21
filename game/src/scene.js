// Harbour Lights — the seaside scene, drawn by hand in code.
// drawScene paints one 600 x 600 picture. The left picture is drawn with an
// empty variant set; the right picture with the round's difference ids, so
// each difference shows its "b" side there. Decorations (stars, clouds,
// wave phase) come from the seed, so both pictures match exactly.
import { PALETTE } from './config.js';
import { createRandom } from './random.js';

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function bird(ctx, x, y, s) {
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.quadraticCurveTo(x - s / 2, y - s * 0.9, x, y);
  ctx.quadraticCurveTo(x + s / 2, y - s * 0.9, x + s, y);
  ctx.stroke();
}

function cloud(ctx, x, y, s) {
  ctx.fillStyle = 'rgba(255, 244, 224, 0.92)';
  ellipse(ctx, x, y, 34 * s, 15 * s);
  ellipse(ctx, x - 22 * s, y + 5 * s, 22 * s, 11 * s);
  ellipse(ctx, x + 24 * s, y + 5 * s, 24 * s, 12 * s);
  ellipse(ctx, x + 4 * s, y - 9 * s, 20 * s, 11 * s);
}

function smoke(ctx, x, y) {
  ctx.fillStyle = 'rgba(240, 238, 245, 0.75)';
  circle(ctx, x, y, 7);
  circle(ctx, x + 6, y - 12, 9);
  circle(ctx, x - 3, y - 24, 11);
  circle(ctx, x + 5, y - 36, 12);
}

function sparkle(ctx, x, y, r) {
  ctx.fillStyle = '#fff8d6';
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r * 0.22, y - r * 0.22, x + r, y);
  ctx.quadraticCurveTo(x + r * 0.22, y + r * 0.22, x, y + r);
  ctx.quadraticCurveTo(x - r * 0.22, y + r * 0.22, x - r, y);
  ctx.quadraticCurveTo(x - r * 0.22, y - r * 0.22, x, y - r);
  ctx.fill();
}

export function drawScene(ctx, variant, seed) {
  const rng = createRandom(seed);
  const has = (id) => variant.has(id);

  // ---- Sky ----
  const sky = ctx.createLinearGradient(0, 0, 0, 330);
  sky.addColorStop(0, PALETTE.skyTop);
  sky.addColorStop(0.55, PALETTE.skyMid);
  sky.addColorStop(1, PALETTE.skyLow);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 330);

  // Stars, seeded so both pictures agree.
  ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
  for (let i = 0; i < 42; i += 1) {
    const x = rng() * 600;
    const y = rng() * 170;
    const r = 0.8 + rng() * 1.4;
    circle(ctx, x, y, r);
  }
  if (!has('star')) sparkle(ctx, 152, 52, 11);

  // Sun, low over the water.
  ctx.fillStyle = PALETTE.sunCore;
  circle(ctx, 110, 110, 40);
  ctx.fillStyle = PALETTE.sun;
  circle(ctx, 110, 110, 32);
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.55)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(110 + Math.cos(a) * 44, 110 + Math.sin(a) * 44);
    ctx.lineTo(110 + Math.cos(a) * 56, 110 + Math.sin(a) * 56);
    ctx.stroke();
  }

  // Moon, high on the right — gone in the right picture of round two.
  if (!has('moon')) {
    ctx.fillStyle = PALETTE.moon;
    circle(ctx, 522, 62, 20);
    ctx.fillStyle = PALETTE.skyTop;
    circle(ctx, 530, 56, 17);
    ctx.fillStyle = 'rgba(244, 241, 222, 0.5)';
    circle(ctx, 516, 58, 3);
    circle(ctx, 526, 70, 2);
  }

  // Clouds.
  cloud(ctx, 170, 65, 1);
  cloud(ctx, 370, 85, 0.9);
  cloud(ctx, 290, 45, 0.7);
  if (has('cloud')) cloud(ctx, 250, 125, 0.85);

  // Birds.
  bird(ctx, 260, 70, 9);
  bird(ctx, 300, 55, 8);
  bird(ctx, 340, 78, 9);
  if (has('birds')) bird(ctx, 215, 90, 8);

  // ---- Far shore and cottages ----
  ctx.fillStyle = '#4a7a5c';
  ctx.fillRect(0, 300, 600, 22);
  ctx.fillStyle = '#3a6a4c';
  ctx.fillRect(0, 318, 600, 8);

  // Cottage A (left).
  ctx.fillStyle = PALETTE.wallA;
  ctx.fillRect(60, 320, 130, 60);
  ctx.fillStyle = PALETTE.roofA;
  poly(ctx, [[55, 322], [125, 285], [195, 322]]);
  ctx.fillStyle = '#8a3d2c';
  ctx.fillRect(80, 270, 14, 36);
  if (!has('smoke')) smoke(ctx, 85, 250);
  // Door and window.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(112, 345, 26, 35);
  ctx.fillStyle = PALETTE.windowLit;
  ctx.fillRect(158, 335, 22, 24);
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 2;
  ctx.strokeRect(158, 335, 22, 24);
  // The cat on the roof peak.
  if (!has('cat')) {
    ctx.fillStyle = '#2b2b3a';
    ellipse(ctx, 125, 296, 11, 8);
    circle(ctx, 125, 284, 6);
    poly(ctx, [[120, 280], [122, 272], [126, 279]]);
    poly(ctx, [[126, 279], [130, 272], [131, 280]]);
    ctx.strokeStyle = '#2b2b3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(135, 298);
    ctx.quadraticCurveTo(144, 294, 142, 286);
    ctx.stroke();
  }

  // Cottage B (middle).
  ctx.fillStyle = PALETTE.wallB;
  ctx.fillRect(210, 325, 120, 55);
  ctx.fillStyle = PALETTE.roofB;
  poly(ctx, [[205, 327], [270, 290], [335, 327]]);
  ctx.fillStyle = '#5a3d6e';
  ctx.fillRect(310, 275, 14, 36);
  if (has('smoke2')) smoke(ctx, 315, 255);
  // Door: closed blue, or open and dark.
  if (has('door')) {
    ctx.fillStyle = '#1c1c2e';
    ctx.fillRect(258, 340, 24, 40);
    ctx.fillStyle = '#3f6fb5';
    ctx.fillRect(280, 342, 4, 38);
  } else {
    ctx.fillStyle = '#3f6fb5';
    ctx.fillRect(258, 340, 24, 40);
    ctx.fillStyle = '#ffd166';
    circle(ctx, 278, 362, 2.5);
  }
  // Window: lit, or dark.
  ctx.fillStyle = has('window') ? PALETTE.windowDark : PALETTE.windowLit;
  ctx.fillRect(232, 322, 26, 26);
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 2;
  ctx.strokeRect(232, 322, 26, 26);
  ctx.beginPath();
  ctx.moveTo(245, 322);
  ctx.lineTo(245, 348);
  ctx.moveTo(232, 335);
  ctx.lineTo(258, 335);
  ctx.stroke();

  // Cottage C (right).
  ctx.fillStyle = PALETTE.wallC;
  ctx.fillRect(350, 330, 90, 50);
  ctx.fillStyle = PALETTE.roofC;
  poly(ctx, [[345, 332], [395, 295], [445, 332]]);
  ctx.fillStyle = has('window2') ? PALETTE.windowLit : PALETTE.windowDark;
  ctx.fillRect(390, 320, 24, 24);
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 2;
  ctx.strokeRect(390, 320, 24, 24);
  ctx.fillStyle = '#4a7a5c';
  ctx.fillRect(360, 352, 20, 28);
  ctx.fillStyle = '#ffd166';
  circle(ctx, 376, 366, 2);

  // ---- Lighthouse on the far shore, right ----
  ctx.fillStyle = '#8a7a5c';
  ellipse(ctx, 476, 382, 46, 10);
  ctx.fillStyle = PALETTE.lighthouse;
  ctx.fillRect(455, 90, 43, 290);
  // Red bands: three, or four when the stripes differ.
  ctx.fillStyle = PALETTE.lighthouseBand;
  ctx.fillRect(455, 130, 43, 30);
  ctx.fillRect(455, 200, 43, 30);
  ctx.fillRect(455, 270, 43, 30);
  if (has('stripes')) ctx.fillRect(455, 95, 43, 18);
  // Gallery, lamp room and roof.
  ctx.fillStyle = '#2b2b3a';
  ctx.fillRect(448, 80, 57, 10);
  ctx.fillStyle = '#ffe9a3';
  ctx.fillRect(460, 58, 33, 22);
  ctx.fillStyle = '#2b2b3a';
  poly(ctx, [[456, 58], [476, 36], [497, 58]]);
  // Flag on the roof, or none.
  if (has('flag')) {
    ctx.strokeStyle = '#2b2b3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(476, 38);
    ctx.lineTo(476, 20);
    ctx.stroke();
    ctx.fillStyle = '#e4572e';
    poly(ctx, [[476, 20], [498, 26], [476, 33]]);
  }
  // The beam, sweeping left across the dusk.
  if (has('beam')) {
    ctx.fillStyle = 'rgba(255, 233, 163, 0.34)';
    poly(ctx, [[476, 60], [140, 90], [140, 190], [476, 78]]);
    ctx.fillStyle = 'rgba(255, 243, 196, 0.5)';
    circle(ctx, 476, 69, 12);
  }

  // ---- Sea ----
  const sea = ctx.createLinearGradient(0, 380, 0, 480);
  sea.addColorStop(0, PALETTE.sea);
  sea.addColorStop(1, PALETTE.seaDeep);
  ctx.fillStyle = sea;
  ctx.fillRect(0, 380, 600, 100);
  // Sun shimmer on the water.
  ctx.fillStyle = 'rgba(255, 209, 102, 0.28)';
  for (let i = 0; i < 6; i += 1) {
    const w = 26 + rng() * 30;
    ctx.fillRect(110 - w / 2, 388 + i * 14, w, 5);
  }
  // Wave strokes.
  ctx.strokeStyle = PALETTE.seaLight;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  const waveRows = [400, 425, 450];
  for (let r = 0; r < waveRows.length; r += 1) {
    for (let x = 20; x < 580; x += 90) {
      const off = (rng() - 0.5) * 14;
      ctx.beginPath();
      ctx.moveTo(x + off, waveRows[r]);
      ctx.quadraticCurveTo(x + 18 + off, waveRows[r] - 7, x + 36 + off, waveRows[r]);
      ctx.stroke();
    }
  }
  // The extra curling wave.
  if (has('wave')) {
    ctx.strokeStyle = '#cfeef7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(202, 452, 12, Math.PI, Math.PI * 1.9);
    ctx.stroke();
    ctx.fillStyle = '#cfeef7';
    circle(ctx, 190, 446, 3);
    circle(ctx, 214, 444, 3);
  }

  // ---- Boats ----
  // Sailboat: red sail, or blue in the other picture.
  ctx.fillStyle = has('sail') ? PALETTE.sailBlue : PALETTE.sailRed;
  poly(ctx, [[188, 352], [188, 420], [238, 420]]);
  ctx.fillStyle = PALETTE.hullA;
  poly(ctx, [[150, 425], [225, 425], [212, 445], [162, 445]]);
  ctx.fillStyle = '#5d3d22';
  ctx.fillRect(183, 345, 4, 82);
  ctx.fillStyle = 'rgba(138, 90, 59, 0.45)';
  poly(ctx, [[158, 448], [216, 448], [208, 458], [166, 458]]);
  // Rowboat, with its oar — or without it.
  ctx.fillStyle = PALETTE.hullB;
  poly(ctx, [[278, 415], [332, 415], [322, 433], [288, 433]]);
  if (!has('oar')) {
    ctx.strokeStyle = '#8a6a45';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(310, 415);
    ctx.lineTo(284, 388);
    ctx.stroke();
    ctx.fillStyle = '#8a6a45';
    ellipse(ctx, 282, 386, 7, 4);
  }

  // Jumping fish, one and then another.
  function jumpingFish(x, y, s) {
    ctx.fillStyle = '#9fd8e8';
    ctx.beginPath();
    ctx.ellipse(x, y, 12 * s, 6 * s, -0.5, 0, Math.PI * 2);
    ctx.fill();
    poly(ctx, [[x + 10 * s, y - 3 * s], [x + 18 * s, y - 8 * s], [x + 18 * s, y + 2 * s]]);
    ctx.fillStyle = 'rgba(207, 238, 247, 0.9)';
    circle(ctx, x - 8 * s, y + 8 * s, 2.5);
    circle(ctx, x + 2 * s, y + 11 * s, 2);
  }
  if (!has('fish')) jumpingFish(425, 460, 1);
  if (has('fish2')) jumpingFish(505, 450, 0.8);

  // The buoy, bobbing at the waterline.
  if (!has('buoy')) {
    ctx.fillStyle = '#e4572e';
    poly(ctx, [[512, 470], [528, 470], [524, 452], [516, 452]]);
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(512, 462, 16, 5);
    ctx.fillStyle = '#2b2b3a';
    ctx.fillRect(518, 446, 4, 7);
    ctx.fillStyle = 'rgba(228, 87, 46, 0.4)';
    ellipse(ctx, 520, 472, 14, 3);
  }

  // ---- Pier ----
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(420, 438, 180, 14);
  ctx.fillStyle = PALETTE.woodDark;
  for (let x = 432; x < 600; x += 24) ctx.fillRect(x, 438, 2, 14);
  for (const px of [440, 500, 560]) {
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(px - 4, 452, 8, 26);
  }
  // A post that rises above the deck, for the pier bird.
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(578, 412, 8, 40);
  if (has('pierbird')) {
    ctx.fillStyle = '#2b2b3a';
    ellipse(ctx, 582, 406, 8, 6);
    circle(ctx, 582, 398, 4.5);
    poly(ctx, [[586, 400], [592, 402], [586, 404]]);
  }
  // Coiled rope, or none.
  if (has('rope')) {
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(482, 440, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(482, 440, 5, 0, Math.PI * 2);
    ctx.stroke();
  }
  // The anchor leaning on the deck, or none.
  if (has('anchor')) {
    ctx.strokeStyle = '#2b2b3a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(560, 428);
    ctx.lineTo(560, 448);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(560, 426, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(550, 440);
    ctx.quadraticCurveTo(560, 452, 570, 440);
    ctx.stroke();
  }

  // ---- Beach ----
  ctx.fillStyle = PALETTE.sand;
  ctx.fillRect(0, 480, 600, 120);
  ctx.fillStyle = PALETTE.sandDark;
  ctx.fillRect(0, 480, 600, 6);
  // Footprints wandering to the water.
  ctx.fillStyle = 'rgba(160, 120, 70, 0.55)';
  const prints = [[300, 545], [312, 532], [296, 520], [308, 508], [292, 496]];
  for (const [px, py] of prints) ellipse(ctx, px, py, 5, 8);
  // Seaweed tufts.
  ctx.strokeStyle = '#3f7a4a';
  ctx.lineWidth = 3;
  for (const [sx, sy] of [[180, 585], [420, 588], [560, 580]]) {
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx + i * 8, sy - 14, sx + i * 12, sy - 22);
      ctx.stroke();
    }
  }
  // Bucket, red or yellow.
  ctx.fillStyle = has('bucket') ? '#ffd166' : '#e4572e';
  poly(ctx, [[70, 522], [94, 522], [90, 544], [74, 544]]);
  ctx.strokeStyle = '#2b2b3a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(82, 522, 10, Math.PI, 0);
  ctx.stroke();
  // Spade stuck in the sand beside it, or none.
  if (has('spade')) {
    ctx.strokeStyle = '#8a6a45';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(102, 512);
    ctx.lineTo(112, 488);
    ctx.stroke();
    ctx.fillStyle = '#3f6fb5';
    poly(ctx, [[112, 488], [120, 480], [118, 492]]);
  }
  // Shell on the sand, or none.
  if (has('shell')) {
    ctx.fillStyle = '#f2b8c6';
    ctx.beginPath();
    ctx.arc(252, 562, 10, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#d98a9e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(252, 562, 6, Math.PI, 0);
    ctx.stroke();
  }
  // The little crab.
  if (!has('crab')) {
    ctx.fillStyle = '#e4572e';
    ellipse(ctx, 352, 542, 12, 8);
    ctx.strokeStyle = '#e4572e';
    ctx.lineWidth = 3;
    for (const dx of [-12, -6, 6, 12]) {
      ctx.beginPath();
      ctx.moveTo(352 + dx, 546);
      ctx.lineTo(352 + dx * 1.4, 554);
      ctx.stroke();
    }
    ctx.fillStyle = '#2b2b3a';
    circle(ctx, 347, 536, 2);
    circle(ctx, 357, 536, 2);
    ctx.fillStyle = '#e4572e';
    circle(ctx, 340, 540, 4);
    circle(ctx, 364, 540, 4);
  }
}
