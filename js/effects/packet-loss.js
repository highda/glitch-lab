// Packet Loss — simulate streaming/transmission corruption.
// Horizontal bands randomly drop out, shift, repeat, or get XOR'd.

function mulberry32(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default {
  name: 'Packet Loss',
  badge: 'BYTE',
  badgeColor: '#ff5555',
  description: 'Simulates streaming corruption — row bands drop out, shift, repeat, or get XORed.',
  params: [
    { key: 'density',   label: 'Density %',  min: 1,  max: 80,  step: 1, def: 15 },
    { key: 'minRows',   label: 'Min Rows',   min: 1,  max: 32,  step: 1, def: 1 },
    { key: 'maxRows',   label: 'Max Rows',   min: 1,  max: 64,  step: 1, def: 8 },
    { key: 'shiftMax',  label: 'Shift Range', min: 0, max: 500, step: 1, def: 80 },
    { key: 'mode',      label: 'Mode', type: 'select',
      options: ['mix', 'drop', 'shift', 'repeat', 'xor'], def: 'mix' },
    { key: 'seed',      label: 'Seed', min: 1, max: 9999, step: 1, def: 42 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const rng = mulberry32(p.seed);
    const minR = Math.min(p.minRows, p.maxRows);
    const maxR = Math.max(p.minRows, p.maxRows);
    const modes = ['drop', 'shift', 'repeat', 'xor'];

    let y = 0;
    while (y < h) {
      // Decide if this band is corrupted
      if (rng() < p.density / 100) {
        const bandH = Math.round(minR + rng() * (maxR - minR));
        const endY = Math.min(y + bandH, h);
        const mode = p.mode === 'mix' ? modes[(rng() * 4) | 0] : p.mode;

        switch (mode) {
          case 'drop':
            // Black out the band
            for (let row = y; row < endY; row++) {
              for (let x = 0; x < w; x++) {
                const idx = (row * w + x) * 4;
                out[idx] = out[idx + 1] = out[idx + 2] = 0;
              }
            }
            break;

          case 'shift': {
            // Horizontal pixel shift
            const shift = Math.round((rng() * 2 - 1) * p.shiftMax);
            for (let row = y; row < endY; row++) {
              for (let x = 0; x < w; x++) {
                const sx = x - shift;
                const di = (row * w + x) * 4;
                if (sx >= 0 && sx < w) {
                  const si = (row * w + sx) * 4;
                  out[di]     = src[si];
                  out[di + 1] = src[si + 1];
                  out[di + 2] = src[si + 2];
                } else {
                  out[di] = out[di + 1] = out[di + 2] = 0;
                }
              }
            }
            break;
          }

          case 'repeat': {
            // Repeat a previous row across the entire band
            const srcRow = Math.max(0, y - 1 - Math.round(rng() * 4));
            for (let row = y; row < endY; row++) {
              for (let x = 0; x < w; x++) {
                const di = (row * w + x) * 4;
                const si = (srcRow * w + x) * 4;
                out[di]     = src[si];
                out[di + 1] = src[si + 1];
                out[di + 2] = src[si + 2];
              }
            }
            break;
          }

          case 'xor': {
            // XOR band bytes with a random value
            const xorVal = (rng() * 256) | 0;
            for (let row = y; row < endY; row++) {
              for (let x = 0; x < w; x++) {
                const idx = (row * w + x) * 4;
                out[idx]     = src[idx]     ^ xorVal;
                out[idx + 1] = src[idx + 1] ^ xorVal;
                out[idx + 2] = src[idx + 2] ^ xorVal;
              }
            }
            break;
          }
        }
        y = endY;
      } else {
        y++;
      }
    }
    return out;
  }
};
