// Mosaic Corrupt — tile grid where each tile independently receives one of
// several random corruptions: flip, channel rotate, invert, neighbor copy, or intact.

function mulberry32(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CORRUPT_TYPES = ['intact', 'hflip', 'vflip', 'chRotate', 'invert', 'neighbor'];

export default {
  name: 'Mosaic Corrupt',
  badge: 'GEO',
  badgeColor: '#00ccff',
  description: 'Applies random per-tile corruption: flip, channel rotate, invert, or neighbor copy.',
  params: [
    { key: 'tileSize', label: 'Tile Size', min: 4, max: 128, step: 1, def: 24 },
    { key: 'density',  label: 'Density %', min: 0, max: 100, step: 1, def: 50 },
    { key: 'types',    label: 'Corrupt Types', type: 'select',
      options: ['all', 'flip-only', 'color-only', 'neighbor-only'], def: 'all' },
    { key: 'seed',     label: 'Seed', min: 1, max: 9999, step: 1, def: 42 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const rng = mulberry32(p.seed);
    const ts = p.tileSize;
    const cols = Math.ceil(w / ts);
    const rows = Math.ceil(h / ts);

    // Filter available corruption types
    let types;
    switch (p.types) {
      case 'flip-only':     types = ['hflip', 'vflip']; break;
      case 'color-only':    types = ['chRotate', 'invert']; break;
      case 'neighbor-only': types = ['neighbor']; break;
      default:              types = CORRUPT_TYPES.slice(1); break; // all except intact
    }

    for (let tr = 0; tr < rows; tr++) {
      for (let tc = 0; tc < cols; tc++) {
        if (rng() > p.density / 100) continue; // leave intact

        const corruption = types[(rng() * types.length) | 0];
        const x0 = tc * ts;
        const y0 = tr * ts;
        const tw = Math.min(ts, w - x0);
        const th = Math.min(ts, h - y0);

        switch (corruption) {
          case 'hflip':
            for (let y = 0; y < th; y++) {
              for (let x = 0; x < (tw >> 1); x++) {
                const a = ((y0 + y) * w + (x0 + x)) * 4;
                const b = ((y0 + y) * w + (x0 + tw - 1 - x)) * 4;
                for (let c = 0; c < 3; c++) {
                  const tmp = out[a + c];
                  out[a + c] = out[b + c];
                  out[b + c] = tmp;
                }
              }
            }
            break;

          case 'vflip':
            for (let y = 0; y < (th >> 1); y++) {
              for (let x = 0; x < tw; x++) {
                const a = ((y0 + y) * w + (x0 + x)) * 4;
                const b = ((y0 + th - 1 - y) * w + (x0 + x)) * 4;
                for (let c = 0; c < 3; c++) {
                  const tmp = out[a + c];
                  out[a + c] = out[b + c];
                  out[b + c] = tmp;
                }
              }
            }
            break;

          case 'chRotate':
            // RGB -> GBR
            for (let y = 0; y < th; y++) {
              for (let x = 0; x < tw; x++) {
                const idx = ((y0 + y) * w + (x0 + x)) * 4;
                const r = out[idx], g = out[idx + 1], b = out[idx + 2];
                out[idx] = g; out[idx + 1] = b; out[idx + 2] = r;
              }
            }
            break;

          case 'invert':
            for (let y = 0; y < th; y++) {
              for (let x = 0; x < tw; x++) {
                const idx = ((y0 + y) * w + (x0 + x)) * 4;
                out[idx] = 255 - out[idx];
                out[idx + 1] = 255 - out[idx + 1];
                out[idx + 2] = 255 - out[idx + 2];
              }
            }
            break;

          case 'neighbor': {
            // Copy from a neighboring tile
            const nc = Math.min(cols - 1, Math.max(0, tc + ((rng() > 0.5 ? 1 : -1))));
            const nr = Math.min(rows - 1, Math.max(0, tr + ((rng() > 0.5 ? 1 : -1))));
            const sx0 = nc * ts;
            const sy0 = nr * ts;
            const cw = Math.min(tw, w - sx0);
            const ch = Math.min(th, h - sy0);
            for (let y = 0; y < ch; y++) {
              for (let x = 0; x < cw; x++) {
                const di = ((y0 + y) * w + (x0 + x)) * 4;
                const si = ((sy0 + y) * w + (sx0 + x)) * 4;
                out[di]     = src[si];
                out[di + 1] = src[si + 1];
                out[di + 2] = src[si + 2];
              }
            }
            break;
          }
        }
      }
    }
    return out;
  }
};
