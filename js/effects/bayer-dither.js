export default {
  name: 'Bayer Dither',
  badge: 'DATA',
  badgeColor: '#ff9900',
  description: 'Applies ordered dithering using a 4×4 Bayer matrix.',
  params: [
    { key: 'levels', label: 'Levels', min: 2, max: 16, step: 1, def: 4 },
    { key: 'scale', label: 'Scale', min: 1, max: 8, step: 1, def: 1 },
  ],
  apply(src, p, w, h) {
    const bayer4 = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5],
    ];
    const out = new Uint8ClampedArray(src.length);
    const step = 255 / (p.levels - 1);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const bx = Math.floor(x / p.scale) % 4;
        const by = Math.floor(y / p.scale) % 4;
        const threshold = (bayer4[by][bx] / 16 - 0.5) * step;
        out[i] = Math.min(255, Math.max(0, Math.round((src[i] + threshold) / step) * step));
        out[i + 1] = Math.min(255, Math.max(0, Math.round((src[i + 1] + threshold) / step) * step));
        out[i + 2] = Math.min(255, Math.max(0, Math.round((src[i + 2] + threshold) / step) * step));
        out[i + 3] = src[i + 3];
      }
    }
    return out;
  }
};
