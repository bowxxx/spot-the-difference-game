// Harbour Lights — boot and the one loop: input is read as it comes, the
// state advances in fixed 1/60 s steps, and the renderer paints what is
// there. The game moves between title, play, paused, round-clear, game-over
// and win screens.
//
// ?seed=N fixes the decorative details. ?shot=start|play|round2|win (with
// &seed=N) stages that scene instead of running the loop, paints it twice
// and sets window.__shotReady for a screenshot.
import { STEP } from './config.js';
import { createRandom } from './random.js';
import {
  createState,
  startGame,
  startRound,
  clickAt,
  useHint,
  tick,
  SCREEN_TITLE,
  SCREEN_PLAY,
  SCREEN_PAUSED,
  SCREEN_ROUND,
  SCREEN_OVER,
  SCREEN_WIN,
} from './state.js';
import { createRenderer } from './render.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
// The backing store matches the layout size: without this the canvas stays
// at its 300 x 150 default and the drawing is clipped to its top-left.
canvas.width = 1280;
canvas.height = 800;
const status = document.getElementById('status');
const state = createState(seed);
const renderer = createRenderer(canvas);
const audio = createAudio();

function announce(message) {
  status.textContent = message;
}

function runShot(name) {
  stageShot(name, state);
  let painted = 0;
  function paint() {
    renderer.draw(state, audio.muted);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, {
    screen: () => state.screen,
    onConfirm() {
      audio.unlock();
      audio.click();
      if (state.screen === SCREEN_TITLE || state.screen === SCREEN_OVER || state.screen === SCREEN_WIN) {
        startGame(state);
        announce('Playing. Find the differences before time runs out.');
      } else if (state.screen === SCREEN_ROUND) {
        startRound(state, state.roundIndex + 1);
        audio.round();
        announce(`Round ${state.roundIndex + 1}. Find the differences.`);
      } else if (state.screen === SCREEN_PAUSED) {
        state.screen = SCREEN_PLAY;
        announce('Playing.');
      }
    },
    onPause() {
      if (state.screen === SCREEN_PLAY) {
        state.screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (state.screen === SCREEN_PAUSED) {
        state.screen = SCREEN_PLAY;
        announce('Playing.');
      }
    },
    onHint() {
      const found = useHint(state);
      if (found !== null) audio.hint();
    },
    onRestart() {
      if (state.screen !== SCREEN_TITLE) {
        startGame(state);
        announce('Playing. Find the differences before time runs out.');
      }
    },
    onMute() {
      const muted = audio.toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
    },
    onSceneClick(sx, sy, panel) {
      audio.unlock();
      const id = clickAt(state, sx, sy, panel);
      if (id !== null) {
        audio.find();
        if (state.screen === SCREEN_WIN) {
          audio.win();
          announce(`You found them all! Final score ${state.score}.`);
        } else if (state.screen === SCREEN_ROUND) {
          audio.round();
          announce('Round clear! Well found.');
        } else {
          announce(`Found it! ${state.found.size} found.`);
        }
      } else {
        audio.miss();
        announce('Not a difference. Three seconds lost.');
      }
    },
  });
  void input;

  let last = performance.now();
  let accumulator = 0;

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, STEP * 15);
    last = now;
    while (accumulator >= STEP) {
      const wasOver = state.screen === SCREEN_OVER;
      tick(state, STEP);
      if (state.screen === SCREEN_OVER && !wasOver) {
        audio.over();
        announce(`Time's up. Score ${state.score}.`);
      }
      accumulator -= STEP;
    }
    renderer.draw(state, audio.muted);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.screen === SCREEN_PLAY) {
      state.screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Harbour Lights. Press Space or click to start.');
  requestAnimationFrame(frame);
}

// A handle for play-testing: the state, the seed and the panel geometry.
window.__game = { state, seed };

if (shot) runShot(shot);
else runGame();
