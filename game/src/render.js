// Harbour Lights — the renderer: paints the two pictures, the markers on
// the differences found, the counter and timer, the hint pulses, and the
// overlay screens. The pictures themselves are cached offscreen (drawn once
// per round by scene.js) so every frame is just two blits plus overlays.
import { VIEW, PANEL, HUD, HUD_BUTTONS, OVERLAY_BUTTONS, PALETTE, ROUNDS, FOOTER } from './config.js';
import { drawScene } from './scene.js';
import { differenceById } from './differences.js';
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_PAUSED, SCREEN_ROUND, SCREEN_OVER, SCREEN_WIN, currentRound, foundCount, totalDiffs } from './state.js';

const LEFT_X = 20;
const RIGHT_X = 660;
const FONT = '"Trebuchet MS", Verdana, sans-serif';

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const cache = new Map();

  // One cached picture per round and side: the left picture is the plain
  // scene, the right one has the round's differences applied.
  function panelCanvas(roundIndex, side, seed) {
    const key = `${roundIndex}:${side}:${seed}`;
    let pic = cache.get(key);
    if (pic === undefined) {
      pic = document.createElement('canvas');
      pic.width = PANEL.width;
      pic.height = PANEL.height;
      const pctx = pic.getContext('2d');
      const variant = side === 0 ? new Set() : new Set(ROUNDS[roundIndex].diffs);
      drawScene(pctx, variant, seed);
      cache.set(key, pic);
    }
    return pic;
  }

  function drawPanels(state) {
    ctx.drawImage(panelCanvas(state.roundIndex, 0, state.seed), LEFT_X, PANEL.top);
    ctx.drawImage(panelCanvas(state.roundIndex, 1, state.seed), RIGHT_X, PANEL.top);
    for (const [x, tag] of [[LEFT_X, 'A'], [RIGHT_X, 'B']]) {
      ctx.fillStyle = 'rgba(35, 35, 58, 0.85)';
      roundRect(ctx, x + 8, PANEL.top + 8, 30, 30, 8);
      ctx.fill();
      ctx.fillStyle = PALETTE.paper;
      ctx.font = `bold 18px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tag, x + 23, PANEL.top + 24);
    }
    ctx.strokeStyle = 'rgba(255, 248, 231, 0.35)';
    ctx.lineWidth = 3;
    ctx.strokeRect(LEFT_X, PANEL.top, PANEL.width, PANEL.height);
    ctx.strokeRect(RIGHT_X, PANEL.top, PANEL.width, PANEL.height);
  }

  function drawMarkers(state) {
    const ring = (px, py, r, color, width, alpha) => {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };
    // Gold rings on every difference found, on both pictures.
    for (const id of state.found) {
      const d = differenceById(id);
      for (const x0 of [LEFT_X, RIGHT_X]) ring(x0 + d.x, PANEL.top + d.y, d.r + 4, PALETTE.gold, 4, 0.95);
    }
    // Hint pulses, breathing on both pictures.
    const pulse = 0.65 + 0.35 * Math.sin(state.now / 180);
    for (const h of state.hints) {
      for (const x0 of [LEFT_X, RIGHT_X]) ring(x0 + h.x, PANEL.top + h.y, 30 + 6 * pulse, '#ffe9a3', 3, 0.5 + 0.4 * pulse);
    }
    // A find blooms once, on the picture that was clicked.
    for (const b of state.bursts) {
      const t = 1 - (b.until - state.now) / 700;
      const x0 = b.panel === 0 ? LEFT_X : RIGHT_X;
      ring(x0 + b.x, PANEL.top + b.y, 8 + t * 34, PALETTE.gold, 5 * (1 - t) + 1, 1 - t);
    }
    // A miss puffs red, on the picture that was clicked.
    if (state.miss) {
      const t = 1 - (state.miss.until - state.now) / 500;
      const x0 = state.miss.panel === 0 ? LEFT_X : RIGHT_X;
      const mx = x0 + state.miss.x;
      const my = PANEL.top + state.miss.y;
      ctx.globalAlpha = 1 - t;
      ctx.strokeStyle = '#ff5d5d';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(mx - 10, my - 10);
      ctx.lineTo(mx + 10, my + 10);
      ctx.moveTo(mx + 10, my - 10);
      ctx.lineTo(mx - 10, my + 10);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // Floating score text.
    for (const f of state.floats) {
      const t = 1 - (f.until - state.now) / 900;
      const x0 = f.panel === 0 ? LEFT_X : RIGHT_X;
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = PALETTE.gold;
      ctx.font = `bold 20px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.text, x0 + f.x, PANEL.top + f.y - t * 22);
      ctx.globalAlpha = 1;
    }
  }

  function drawHud(state, muted) {
    ctx.fillStyle = '#1d2440';
    ctx.fillRect(0, 0, VIEW.width, HUD.height);
    ctx.fillStyle = 'rgba(255, 248, 231, 0.12)';
    ctx.fillRect(0, HUD.height - 2, VIEW.width, 2);

    ctx.fillStyle = PALETTE.paper;
    ctx.font = `bold 22px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚓ Harbour Lights', 20, 32);

    const round = currentRound(state);
    ctx.textAlign = 'center';
    ctx.font = `15px ${FONT}`;
    ctx.fillStyle = '#c9c2e8';
    ctx.fillText(`Round ${state.roundIndex + 1} of ${ROUNDS.length} · ${round.name}`, 640, 20);
    ctx.font = `bold 26px ${FONT}`;
    ctx.fillStyle = PALETTE.paper;
    ctx.fillText(`Found ${foundCount(state)} / ${totalDiffs(state)}`, 640, 48);

    // Timer bar and clock.
    const frac = Math.max(0, state.timeLeft / round.seconds);
    ctx.fillStyle = '#0f1428';
    roundRect(ctx, 820, 18, 130, 14, 7);
    ctx.fill();
    ctx.fillStyle = frac > 0.25 ? PALETTE.good : '#ff5d5d';
    if (frac > 0) {
      roundRect(ctx, 820, 18, 130 * frac, 14, 7);
      ctx.fill();
    }
    ctx.fillStyle = PALETTE.paper;
    ctx.font = `bold 18px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText(formatTime(state.timeLeft), 960, 26);
    ctx.font = `bold 18px ${FONT}`;
    ctx.fillText(`★ ${state.score}`, 820, 52);

    // Buttons.
    const btn = (r, label, enabled) => {
      ctx.fillStyle = enabled ? '#2e3a68' : '#232a47';
      roundRect(ctx, r.x, r.y, r.w, r.h, 9);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 248, 231, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = enabled ? PALETTE.paper : '#7a7390';
      ctx.font = `bold 15px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2 + 1);
    };
    btn(HUD_BUTTONS.pause, state.screen === SCREEN_PAUSED ? '▶' : '❚❚', true);
    btn(HUD_BUTTONS.hint, `💡 ${state.hintsLeft}`, state.screen === SCREEN_PLAY && state.hintsLeft > 0);
    btn(HUD_BUTTONS.mute, muted ? '✕' : '♪', true);
  }

  function drawFooter(state) {
    ctx.fillStyle = '#1d2440';
    ctx.fillRect(0, VIEW.height - FOOTER.height, VIEW.width, FOOTER.height);
    ctx.fillStyle = '#c9c2e8';
    ctx.font = `15px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const text = state.message && state.messageUntil > state.now
      ? state.message
      : 'Click a difference on either picture · H hint · P pause · R restart · M sound';
    ctx.fillText(text, VIEW.width / 2, VIEW.height - FOOTER.height / 2);
  }

  function dim() {
    ctx.fillStyle = 'rgba(15, 18, 38, 0.62)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }

  function card(title, lines, buttonLabel, buttonRect) {
    ctx.fillStyle = '#232a47';
    roundRect(ctx, 340, 150, 600, 470, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 183, 3, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = PALETTE.gold;
    ctx.font = `bold 40px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 640, 210);
    ctx.fillStyle = PALETTE.paper;
    ctx.font = `18px ${FONT}`;
    lines.forEach((line, i) => ctx.fillText(line, 640, 268 + i * 30));
    if (buttonLabel !== null) {
      ctx.fillStyle = PALETTE.gold;
      roundRect(ctx, buttonRect.x, buttonRect.y, buttonRect.w, buttonRect.h, 12);
      ctx.fill();
      ctx.fillStyle = '#23233a';
      ctx.font = `bold 20px ${FONT}`;
      ctx.fillText(buttonLabel, 640, buttonRect.y + buttonRect.h / 2 + 1);
    }
  }

  function drawOverlay(state) {
    if (state.screen === SCREEN_PLAY) return;
    dim();
    if (state.screen === SCREEN_TITLE) {
      card('⚓ Harbour Lights', [
        'Two pictures of the same harbour at dusk —',
        'but the right one hides a few changes.',
        'Find them all before the tide runs out!',
        '',
        'Click a difference on either picture.  H: hint.',
        `Three rounds, ${ROUNDS.reduce((n, r) => n + r.diffs.length, 0)} differences in all.`,
        state.best > 0 ? `Best score so far: ${state.best}` : 'No best score yet — set one!',
      ], '▶  Start the hunt', OVERLAY_BUTTONS.start);
    } else if (state.screen === SCREEN_PAUSED) {
      card('Paused', ['The tide is waiting.', 'Press P or click ▶ to carry on.'], null, null);
    } else if (state.screen === SCREEN_ROUND) {
      const next = ROUNDS[state.roundIndex + 1];
      card(`Round ${state.roundIndex + 1} clear!`, [
        `You found every difference in ${currentRound(state).name}.`,
        `Score: ${state.score}`,
        '',
        `Next up: Round ${state.roundIndex + 2} — ${next.name}.`,
        `${next.diffs.length} differences, ${next.seconds} seconds. Harder. Faster.`,
      ], 'Next round  ▶', OVERLAY_BUTTONS.next);
    } else if (state.screen === SCREEN_WIN) {
      card('🏆 You found them all!', [
        'Every difference, in every round. The harbour',
        'keeps its secrets no longer.',
        '',
        `Final score: ${state.score}   ·   Best: ${state.best}`,
        'Thank you for playing Harbour Lights.',
      ], '↻  Play again', OVERLAY_BUTTONS.again);
    } else if (state.screen === SCREEN_OVER) {
      card("Time's up!", [
        `The tide came in with ${totalDiffs(state) - foundCount(state)} differences still hidden.`,
        `Round ${state.roundIndex + 1}: ${currentRound(state).name}`,
        `Score: ${state.score}   ·   Best: ${state.best}`,
        '',
        'Have another look — they were there all along.',
      ], '↻  Try again', OVERLAY_BUTTONS.again);
    }
  }

  function draw(state, muted) {
    ctx.fillStyle = '#141828';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    drawPanels(state);
    drawMarkers(state);
    drawHud(state, muted);
    drawFooter(state);
    drawOverlay(state);
  }

  return { draw };
}
