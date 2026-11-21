// Harbour Lights — configuration: canvas layout, palette, rounds and timing.
// One scene, three rounds; each round hides a different set of differences
// in the right-hand picture and gives the player less time to find them.
export const VIEW = { width: 1280, height: 800 };
export const HUD = { height: 64 };
export const PANEL = { width: 600, height: 600, gap: 40, top: 84 };
export const SCENE = { width: 600, height: 600 };
export const FOOTER = { height: 36 };

export const PALETTE = {
  skyTop: '#2b3a67',
  skyMid: '#7a6a9a',
  skyLow: '#f2a56b',
  sun: '#ffd166',
  sunCore: '#fff3c4',
  moon: '#f4f1de',
  seaDeep: '#1d4e6b',
  sea: '#2e6f8e',
  seaLight: '#7fc4d6',
  sand: '#e8c98f',
  sandDark: '#d9b06f',
  wood: '#7a5230',
  woodDark: '#5d3d22',
  lighthouse: '#f5f0e6',
  lighthouseBand: '#d94f3d',
  roofA: '#b5503c',
  roofB: '#7a5a8c',
  roofC: '#4a7a5c',
  wallA: '#f2e3c6',
  wallB: '#e8b4a0',
  wallC: '#cfd8e8',
  windowLit: '#ffd166',
  windowDark: '#3a3f5c',
  sailRed: '#e4572e',
  sailBlue: '#3f6fb5',
  hullA: '#8a5a3b',
  hullB: '#3f6b8a',
  ink: '#23233a',
  paper: '#fff8e7',
  gold: '#ffb703',
  good: '#2ec4b6',
  bad: '#e4572e',
};

export const ROUNDS = [
  { name: 'Low Tide', seconds: 180, hints: 3, diffs: ['beam', 'sail', 'birds', 'cat', 'window', 'fish', 'buoy', 'smoke'] },
  { name: 'Lantern Hour', seconds: 150, hints: 3, diffs: ['flag', 'bucket', 'crab', 'moon', 'door', 'anchor', 'star', 'rope'] },
  { name: 'Storm Coming', seconds: 120, hints: 3, diffs: ['shell', 'oar', 'window2', 'cloud', 'stripes', 'spade', 'wave', 'smoke2', 'fish2', 'pierbird'] },
];

export const HUD_BUTTONS = {
  pause: { x: 1030, y: 12, w: 40, h: 40 },
  hint: { x: 1080, y: 12, w: 84, h: 40 },
  mute: { x: 1174, y: 12, w: 40, h: 40 },
};

// Buttons drawn on the overlay screens (title, round done, win, game over).
export const OVERLAY_BUTTONS = {
  start: { x: 490, y: 556, w: 300, h: 56 },
  next: { x: 490, y: 520, w: 300, h: 56 },
  again: { x: 490, y: 556, w: 300, h: 56 },
};
export const SCORE_FIND = 100;
export const SCORE_TIME_BONUS_PER_SECOND = 10;
export const MISS_TIME_PENALTY = 3;
export const STEP = 1 / 60;
export const BEST_KEY = 'harbour-lights-best';
