// Sector Fault — simulate bad disk reads. Random rectangular patches get their
// pixel data sourced from wrong byte offsets in the image buffer.

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
  name: 'Sector Fault',
  badge: 'BYTE',
  badgeColor: '#ff5555',
  description: 'Simulates bad disk reads — random patches sourced from wrong byte offsets.',
  params: [
    { key: 'patches',  label: 'Patches',   min: 1,  max: 80,   step: 1, def: 12 },
    { key: 'minSize',  label: 'Min Size',   min: 4,  max: 200,  step: 1, def: 16 },
    { key: 'maxSize',  label: 'Max Size',   min: 8,  max: 400,  step: 1, def: 96 },
    { key: 'offset',   label: 'Offset Range', min: 1, max: 5000, step: 10, def: 500 },
    { key: 'mode',     label: 'Mode', type: 'select', options: ['shift', 'zero', 'smear', 'mix'], def: 'mix' },
    { key: 'seed',     label: 'Seed',       min: 1,  max: 9999, step: 1, def: 42 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const rng = mulberry32(p.seed);
    const totalBytes = w * h * 4;
    const minSz = Math.min(p.minSize, p.maxSize);
    const maxSz = Math.max(p.minSize, p.maxSize);

    for (let i = 0; i < p.patches; i++) {
      // Random rectangular patch
      const pw = Math.round(minSz + rng() * (maxSz - minSz));
      const ph = Math.round(minSz + rng() * (maxSz - minSz));
      const px = Math.round(rng() * (w - pw));
      const py = Math.round(rng() * (h - ph));

      // Pick corruption mode for this patch
      const modes = ['shift', 'zero', 'smear'];
      const mode = p.mode === 'mix' ? modes[(rng() * 3) | 0] : p.mode;

      if (mode === 'zero') {
        // Zero out the patch (dead sector)
        for (let y = py; y < py + ph && y < h; y++) {
          for (let x = px; x < px + pw && x < w; x++) {
            const idx = (y * w + x) * 4;
            out[idx] = out[idx + 1] = out[idx + 2] = 0;
          }
        }
      } else if (mode === 'smear') {
        // Repeat the first row of the patch across all rows (stuck read head)
        for (let y = py + 1; y < py + ph && y < h; y++) {
          for (let x = px; x < px + pw && x < w; x++) {
            const di = (y * w + x) * 4;
            const si = (py * w + x) * 4;
            out[di]     = src[si];
            out[di + 1] = src[si + 1];
            out[di + 2] = src[si + 2];
          }
        }
      } else {
        // Shift: read from wrong byte offset
        const byteOff = Math.round((rng() * 2 - 1) * p.offset) * 4;
        for (let y = py; y < py + ph && y < h; y++) {
          for (let x = px; x < px + pw && x < w; x++) {
            const di = (y * w + x) * 4;
            const si = di + byteOff;
            if (si >= 0 && si + 3 < totalBytes) {
              out[di]     = src[si];
              out[di + 1] = src[si + 1];
              out[di + 2] = src[si + 2];
            } else {
              out[di] = out[di + 1] = out[di + 2] = 0;
            }
          }
        }
      }
    }
    return out;
  }
};
