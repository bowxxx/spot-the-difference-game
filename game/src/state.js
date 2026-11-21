// Harbour Lights — the game state: screens, rounds, finds, timer, hints, score.
// Pure logic, no drawing: render.js paints whatever this holds.
import { ROUNDS, SCORE_FIND, SCORE_TIME_BONUS_PER_SECOND, MISS_TIME_PENALTY, BEST_KEY } from './config.js';
import { differenceById } from './differences.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_ROUND = 'round';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

export function createState(seed) {
  const state = {
    seed,
    screen: SCREEN_TITLE,
    roundIndex: 0,
    found: new Set(),
    hintsLeft: ROUNDS[0].hints,
    hints: [], // {x, y, until} — a hint pulsing on a difference
    timeLeft: ROUNDS[0].seconds,
    score: 0,
    best: 0,
    message: '',
    messageUntil: 0,
    miss: null, // {x, y, until} — a red puff where a click missed
    bursts: [], // {x, y, until} — gold rings blooming on a find
    floats: [], // {x, y, text, until} — score text floating up
    foundFlash: null,
    now: 0,
  };
  try {
    state.best = Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    state.best = 0;
  }
  return state;
}

export function currentRound(state) {
  return ROUNDS[state.roundIndex];
}

export function roundDiffs(state) {
  return currentRound(state).diffs;
}

export function foundCount(state) {
  return state.found.size;
}

export function totalDiffs(state) {
  return currentRound(state).diffs.length;
}

export function startRound(state, index) {
  state.roundIndex = index;
  state.found = new Set();
  state.hints = [];
  state.hintsLeft = ROUNDS[index].hints;
  state.timeLeft = ROUNDS[index].seconds;
  state.miss = null;
  state.bursts = [];
  state.floats = [];
  state.screen = SCREEN_PLAY;
  state.message = `Round ${index + 1}: ${ROUNDS[index].name} — find ${ROUNDS[index].diffs.length} differences!`;
  state.messageUntil = state.now + 2600;
}

export function startGame(state) {
  state.score = 0;
  startRound(state, 0);
}

export function saveBest(state) {
  if (state.score > state.best) {
    state.best = state.score;
    try {
      window.localStorage.setItem(BEST_KEY, String(state.best));
    } catch {
      // Storage can be off: the best score then lasts this visit only.
    }
  }
}

// A click at scene coordinates (sx, sy) on the given panel (0 left, 1 right).
// Returns the id found, or null. Finding the last difference of a round ends
// the round. Bursts and floats live on the panel that was clicked; the ring
// markers are drawn on both pictures by the renderer.
export function clickAt(state, sx, sy, panel) {
  if (state.screen !== SCREEN_PLAY) return null;
  for (const id of roundDiffs(state)) {
    if (state.found.has(id)) continue;
    const d = differenceById(id);
    const dx = sx - d.x;
    const dy = sy - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) {
      state.found.add(id);
      state.score += SCORE_FIND;
      state.bursts.push({ x: sx, y: sy, panel, until: state.now + 700 });
      state.floats.push({ x: sx, y: sy - 18, panel, text: `+${SCORE_FIND}`, until: state.now + 900 });
      if (state.found.size === roundDiffs(state).length) {
        const bonus = Math.round(state.timeLeft) * SCORE_TIME_BONUS_PER_SECOND;
        state.score += bonus;
        state.screen = state.roundIndex + 1 < ROUNDS.length ? SCREEN_ROUND : SCREEN_WIN;
        if (state.screen === SCREEN_WIN) saveBest(state);
        state.message = `All found! Time bonus +${bonus}.`;
        state.messageUntil = state.now + 2600;
      }
      return id;
    }
  }
  state.timeLeft = Math.max(0, state.timeLeft - MISS_TIME_PENALTY);
  state.miss = { x: sx, y: sy, panel, until: state.now + 500 };
  state.message = `Not there — ${MISS_TIME_PENALTY}s!`;
  state.messageUntil = state.now + 1200;
  return null;
}

// Spend a hint: pulse a ring on one difference not yet found, in both pictures.
export function useHint(state) {
  if (state.screen !== SCREEN_PLAY || state.hintsLeft <= 0) return null;
  const remaining = roundDiffs(state).filter((id) => !state.found.has(id));
  if (remaining.length === 0) return null;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  const d = differenceById(pick);
  state.hints.push({ x: d.x, y: d.y, until: state.now + 2500 });
  state.message = `Hint: look near ${d.label}…`;
  state.messageUntil = state.now + 2500;
  return pick;
}

export function tick(state, dt) {
  state.now += dt * 1000;
  state.hints = state.hints.filter((h) => h.until > state.now);
  state.bursts = state.bursts.filter((b) => b.until > state.now);
  state.floats = state.floats.filter((f) => f.until > state.now);
  if (state.miss && state.miss.until <= state.now) state.miss = null;
  if (state.screen === SCREEN_PLAY) {
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = SCREEN_OVER;
      saveBest(state);
    }
  }
}
