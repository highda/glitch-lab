export default {
  name: 'Pixel Drift',
  badge: 'GEO',
  badgeColor: '#aaff44',
  description: 'Applies sine-wave displacement to rows or columns.',
  params: [
    { key: 'amplitude', label: 'Amp', min: 1, max: 80, step: 1, def: 15 },
    { key: 'frequency', label: 'Freq', min: 1, max: 100, step: 1, def: 20 },
    { key: 'phase', label: 'Phase', min: 0, max: 628, step: 1, def: 0 },
    { key: 'direction', label: 'Dir', type: 'select', options: ['horizontal', 'vertical'], def: 'horizontal' },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src.length);
    const phase = p.phase / 100;
    const horiz = p.direction === 'horizontal';

    if (horiz) {
      for (let y = 0; y < h; y++) {
        const shift = Math.round(Math.sin(y / (h / p.frequency) * Math.PI * 2 + phase) * p.amplitude);
        for (let x = 0; x < w; x++) {
          const sx = ((x - shift) % w + w) % w;
          const si = (y * w + sx) * 4;
          const di = (y * w + x) * 4;
          out[di] = src[si]; out[di + 1] = src[si + 1];
          out[di + 2] = src[si + 2]; out[di + 3] = src[si + 3];
        }
      }
    } else {
      for (let x = 0; x < w; x++) {
        const shift = Math.round(Math.sin(x / (w / p.frequency) * Math.PI * 2 + phase) * p.amplitude);
        for (let y = 0; y < h; y++) {
          const sy = ((y - shift) % h + h) % h;
          const si = (sy * w + x) * 4;
          const di = (y * w + x) * 4;
          out[di] = src[si]; out[di + 1] = src[si + 1];
          out[di + 2] = src[si + 2]; out[di + 3] = src[si + 3];
        }
      }
    }
    return out;
  }
};
