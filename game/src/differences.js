// The differences: what changes between the two pictures, where it sits in
// scene coordinates (a 600 x 600 square), and how wide a click may land.
// The left picture always shows the "a" side; the right picture shows the
// "b" side. A difference is found by clicking it on either picture.
export const DIFFERENCES = {
  beam: { label: 'the lighthouse beam', x: 350, y: 115, r: 42 },
  sail: { label: 'the sailboat sail', x: 200, y: 385, r: 34 },
  birds: { label: 'the birds in the sky', x: 300, y: 70, r: 36 },
  cat: { label: 'the cat on the roof', x: 125, y: 298, r: 26 },
  window: { label: 'the lit cottage window', x: 245, y: 335, r: 24 },
  fish: { label: 'the jumping fish', x: 425, y: 465, r: 26 },
  buoy: { label: 'the red buoy', x: 520, y: 465, r: 24 },
  smoke: { label: 'the chimney smoke', x: 85, y: 250, r: 30 },
  flag: { label: 'the flag on the lighthouse', x: 472, y: 42, r: 24 },
  bucket: { label: 'the beach bucket', x: 82, y: 522, r: 26 },
  crab: { label: 'the little crab', x: 352, y: 542, r: 24 },
  moon: { label: 'the moon', x: 522, y: 62, r: 28 },
  door: { label: 'the cottage door', x: 270, y: 365, r: 24 },
  anchor: { label: 'the anchor on the pier', x: 560, y: 440, r: 26 },
  star: { label: 'the bright star', x: 152, y: 52, r: 22 },
  rope: { label: 'the coiled rope', x: 482, y: 440, r: 24 },
  shell: { label: 'the shell on the sand', x: 252, y: 562, r: 22 },
  oar: { label: 'the rowboat oar', x: 300, y: 405, r: 26 },
  window2: { label: 'the second lit window', x: 402, y: 332, r: 24 },
  cloud: { label: 'the extra cloud', x: 250, y: 125, r: 34 },
  stripes: { label: 'the lighthouse stripes', x: 472, y: 150, r: 30 },
  spade: { label: 'the spade in the sand', x: 102, y: 512, r: 24 },
  wave: { label: 'the curling wave', x: 202, y: 452, r: 28 },
  smoke2: { label: 'the second chimney smoke', x: 315, y: 255, r: 30 },
  fish2: { label: 'the second jumping fish', x: 505, y: 455, r: 24 },
  pierbird: { label: 'the bird on the pier post', x: 582, y: 415, r: 22 },
};

export function differenceById(id) {
  return DIFFERENCES[id];
}
