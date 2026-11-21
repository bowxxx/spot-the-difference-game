// Harbour Lights — tiny synthesized sounds, no audio files: a chime when a
// difference is found, a low buzz on a miss, an arpeggio on a win.
export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (ctx === null) {
      try {
        const AC = window.AudioContext ?? window.webkitAudioContext;
        ctx = new AC();
      } catch {
        ctx = null;
      }
    }
    if (ctx !== null && ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, at, dur, type, vol) {
    const ac = ensure();
    if (ac === null || muted) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ac.currentTime + at);
    gain.gain.linearRampToValueAtTime(vol, ac.currentTime + at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + at + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime + at);
    osc.stop(ac.currentTime + at + dur + 0.05);
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() {
      return muted;
    },
    click() {
      tone(660, 0, 0.06, 'sine', 0.08);
    },
    find() {
      tone(659, 0, 0.16, 'sine', 0.16);
      tone(880, 0.09, 0.22, 'sine', 0.16);
    },
    miss() {
      tone(130, 0, 0.18, 'square', 0.07);
    },
    hint() {
      tone(523, 0, 0.12, 'triangle', 0.1);
      tone(784, 0.08, 0.16, 'triangle', 0.1);
    },
    round() {
      tone(523, 0, 0.14, 'sine', 0.14);
      tone(659, 0.1, 0.14, 'sine', 0.14);
      tone(784, 0.2, 0.22, 'sine', 0.14);
    },
    win() {
      const notes = [523, 659, 784, 1047, 1319];
      notes.forEach((n, i) => tone(n, i * 0.11, 0.3, 'sine', 0.15));
    },
    over() {
      tone(392, 0, 0.2, 'sine', 0.12);
      tone(311, 0.16, 0.3, 'sine', 0.12);
    },
  };
}
