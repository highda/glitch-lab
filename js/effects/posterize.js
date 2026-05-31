export default {
  name: 'Posterize',
  badge: 'COLOR',
  badgeColor: '#ff3366',
  description: 'Reduces the number of color levels per channel, creating flat color bands.',
  params: [
    { key: 'levels', label: 'Levels', min: 2, max: 32, step: 1, def: 6 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src.length);
    const step = 255 / (p.levels - 1);
    for (let i = 0; i < src.length; i += 4) {
      out[i] = Math.round(Math.round(src[i] / step) * step);
      out[i + 1] = Math.round(Math.round(src[i + 1] / step) * step);
      out[i + 2] = Math.round(Math.round(src[i + 2] / step) * step);
      out[i + 3] = src[i + 3];
    }
    return out;
  }
};
