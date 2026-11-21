// The screenshot scenes behind ?shot=start|play|round2|win. Each one sets
// the real game state to a fixed moment, so the frame is what a real game
// looks like and the same seed always gives the same frame.
import { ROUNDS } from './config.js';
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_WIN, startGame, startRound } from './state.js';

export function stageShot(name, state) {
  // A fixed clock so hint pulses render mid-breath.
  state.now = 1200;
  if (name === 'play') {
    startGame(state);
    state.found = new Set(['beam', 'sail', 'fish']);
    state.timeLeft = 154;
    state.score = 300;
    state.hintsLeft = 3;
    return SCREEN_PLAY;
  }
  if (name === 'round2') {
    startGame(state);
    startRound(state, 1);
    state.found = new Set(['flag', 'bucket', 'crab', 'door']);
    state.timeLeft = 112;
    state.score = 400;
    state.hintsLeft = 2;
    // A hint is pulsing on the anchor, still unfound.
    state.hints = [{ x: 560, y: 440, until: state.now + 2000 }];
    state.message = 'Hint: look near the anchor on the pier…';
    state.messageUntil = state.now + 2000;
    return SCREEN_PLAY;
  }
  if (name === 'win') {
    startGame(state);
    startRound(state, 2);
    state.found = new Set(ROUNDS[2].diffs);
    state.score = 2650;
    state.best = 2650;
    state.screen = SCREEN_WIN;
    state.message = '';
    return SCREEN_WIN;
  }
  state.screen = SCREEN_TITLE;
  return SCREEN_TITLE;
}
