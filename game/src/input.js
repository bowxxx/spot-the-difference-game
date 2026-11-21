// Harbour Lights — mouse and keyboard input. Clicks are mapped from the
// page into canvas coordinates, then into a picture (left or right) and
// scene coordinates, so the state can test them against the differences.
// Buttons drawn on the canvas (HUD and overlays) are hit-tested here too.
import { VIEW, PANEL, HUD_BUTTONS, OVERLAY_BUTTONS } from './config.js';
import { SCREEN_PLAY, SCREEN_PAUSED, SCREEN_TITLE, SCREEN_ROUND, SCREEN_OVER, SCREEN_WIN } from './state.js';

function inRect(x, y, r) {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

export function panelAt(x, y) {
  if (y < PANEL.top || y >= PANEL.top + PANEL.height) return null;
  if (x >= 20 && x < 20 + PANEL.width) return { panel: 0, sx: x - 20, sy: y - PANEL.top };
  if (x >= 660 && x < 660 + PANEL.width) return { panel: 1, sx: x - 660, sy: y - PANEL.top };
  return null;
}

export function createInput(canvas, hooks) {
  function toCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEW.width,
      y: ((event.clientY - rect.top) / rect.height) * VIEW.height,
    };
  }

  function onClick(event) {
    const { x, y } = toCanvas(event);
    const screen = hooks.screen();
    // HUD buttons work on every screen.
    if (inRect(x, y, HUD_BUTTONS.mute)) {
      hooks.onMute();
      return;
    }
    if (inRect(x, y, HUD_BUTTONS.hint) && screen === SCREEN_PLAY) {
      hooks.onHint();
      return;
    }
    if (inRect(x, y, HUD_BUTTONS.pause) && (screen === SCREEN_PLAY || screen === SCREEN_PAUSED)) {
      hooks.onPause();
      return;
    }
    // Overlay buttons.
    if (screen === SCREEN_TITLE && inRect(x, y, OVERLAY_BUTTONS.start)) {
      hooks.onConfirm();
      return;
    }
    if (screen === SCREEN_ROUND && inRect(x, y, OVERLAY_BUTTONS.next)) {
      hooks.onConfirm();
      return;
    }
    if ((screen === SCREEN_OVER || screen === SCREEN_WIN) && inRect(x, y, OVERLAY_BUTTONS.again)) {
      hooks.onConfirm();
      return;
    }
    // A click on a picture while playing.
    if (screen === SCREEN_PLAY) {
      const hit = panelAt(x, y);
      if (hit !== null) hooks.onSceneClick(hit.sx, hit.sy, hit.panel);
    }
  }

  function onKey(event) {
    if (event.repeat) return;
    const screen = hooks.screen();
    const key = event.key;
    if (key === ' ' || key === 'Enter') {
      event.preventDefault();
      if (screen !== SCREEN_PLAY && screen !== SCREEN_PAUSED) hooks.onConfirm();
      return;
    }
    if (key === 'h' || key === 'H') {
      if (screen === SCREEN_PLAY) hooks.onHint();
      return;
    }
    if (key === 'p' || key === 'P' || key === 'Escape') {
      if (screen === SCREEN_PLAY || screen === SCREEN_PAUSED) hooks.onPause();
      return;
    }
    if (key === 'r' || key === 'R') {
      hooks.onRestart();
      return;
    }
    if (key === 'm' || key === 'M') {
      hooks.onMute();
    }
  }

  canvas.addEventListener('click', onClick);
  window.addEventListener('keydown', onKey);
}
