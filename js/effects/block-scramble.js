// Block Scramble — divide image into tiles, randomly swap a percentage of them.
// Like a corrupted MPEG I-frame with misrouted macroblocks.

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
  name: 'Block Scramble',
  badge: 'GEO',
  badgeColor: '#00ccff',
  description: 'Divides image into a tile grid and swaps random blocks with nearby tiles.',
  params: [
    { key: 'tileW',    label: 'Tile W',    min: 4, max: 128, step: 1, def: 32 },
    { key: 'tileH',    label: 'Tile H',    min: 4, max: 128, step: 1, def: 32 },
    { key: 'scramble', label: 'Scramble %', min: 0, max: 100, step: 1, def: 40 },
    { key: 'radius',   label: 'Radius',    min: 1, max: 50,  step: 1, def: 10 },
    { key: 'seed',     label: 'Seed',      min: 1, max: 9999, step: 1, def: 42 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const rng = mulberry32(p.seed);

    const cols = Math.ceil(w / p.tileW);
    const rows = Math.ceil(h / p.tileH);
    const total = cols * rows;

    // Build list of tile indices that will be scrambled
    const tiles = [];
    for (let i = 0; i < total; i++) {
      if (rng() < p.scramble / 100) tiles.push(i);
    }

    // For each scrambled tile, pick a source tile within radius
    for (const ti of tiles) {
      const dstCol = ti % cols;
      const dstRow = (ti / cols) | 0;

      // Pick random source tile within radius (in tile units)
      const r = p.radius;
      const srcCol = Math.min(cols - 1, Math.max(0, dstCol + Math.round((rng() * 2 - 1) * r)));
      const srcRow = Math.min(rows - 1, Math.max(0, dstRow + Math.round((rng() * 2 - 1) * r)));

      // Copy source tile pixels into destination tile position
      const dx0 = dstCol * p.tileW;
      const dy0 = dstRow * p.tileH;
      const sx0 = srcCol * p.tileW;
      const sy0 = srcRow * p.tileH;
      const tw = Math.min(p.tileW, w - dx0, w - sx0);
      const th = Math.min(p.tileH, h - dy0, h - sy0);

      for (let y = 0; y < th; y++) {
        for (let x = 0; x < tw; x++) {
          const di = ((dy0 + y) * w + (dx0 + x)) * 4;
          const si = ((sy0 + y) * w + (sx0 + x)) * 4;
          out[di]     = src[si];
          out[di + 1] = src[si + 1];
          out[di + 2] = src[si + 2];
          out[di + 3] = src[si + 3];
        }
      }
    }
    return out;
  }
};
