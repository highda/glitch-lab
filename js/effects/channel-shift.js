export default {
  name: 'Channel Shift',
  badge: 'COLOR',
  badgeColor: '#ff3366',
  description: 'Displaces R/B channels independently by a configurable pixel offset.',
  params: [
    { key: 'rx', label: 'Red X', min: -60, max: 60, step: 1, def: 8 },
    { key: 'ry', label: 'Red Y', min: -60, max: 60, step: 1, def: 0 },
    { key: 'bx', label: 'Blue X', min: -60, max: 60, step: 1, def: -8 },
    { key: 'by', label: 'Blue Y', min: -60, max: 60, step: 1, def: 0 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src.length);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const rrx = Math.min(w - 1, Math.max(0, x - p.rx));
        const rry = Math.min(h - 1, Math.max(0, y - p.ry));
        out[i] = src[(rry * w + rrx) * 4];
        out[i + 1] = src[i + 1];
        const bbx = Math.min(w - 1, Math.max(0, x - p.bx));
        const bby = Math.min(h - 1, Math.max(0, y - p.by));
        out[i + 2] = src[(bby * w + bbx) * 4 + 2];
        out[i + 3] = src[i + 3];
      }
    }
    return out;
  }
};
