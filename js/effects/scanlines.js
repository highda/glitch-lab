export default {
  name: 'Scanlines',
  badge: 'GEO',
  badgeColor: '#aaff44',
  description: 'Darkens every Nth row to simulate CRT scanlines.',
  params: [
    { key: 'spacing', label: 'Spacing', min: 2, max: 16, step: 1, def: 3 },
    { key: 'opacity', label: 'Opacity', min: 0, max: 100, step: 1, def: 40 },
    { key: 'offset', label: 'Offset', min: 0, max: 8, step: 1, def: 0 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const mul = 1 - p.opacity / 100;
    for (let y = 0; y < h; y++) {
      if ((y + p.offset) % p.spacing === 0) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          out[i] = src[i] * mul;
          out[i + 1] = src[i + 1] * mul;
          out[i + 2] = src[i + 2] * mul;
        }
      }
    }
    return out;
  }
};
