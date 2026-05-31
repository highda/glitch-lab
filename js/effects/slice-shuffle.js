export default {
  name: 'Slice Shuffle',
  badge: 'GEO',
  badgeColor: '#aaff44',
  description: 'Shuffles horizontal image slices to random vertical positions.',
  params: [
    { key: 'slices', label: 'Slices', min: 4, max: 80, step: 1, def: 20 },
    { key: 'intensity', label: 'Intensity', min: 0, max: 100, step: 1, def: 50 },
    { key: 'seed', label: 'Seed', min: 1, max: 999, step: 1, def: 42 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src.length);
    const sliceH = Math.max(1, Math.floor(h / p.slices));
    let rng = p.seed;
    const rand = () => { rng = (rng * 16807 + 0) % 2147483647; return rng / 2147483647; };

    const sliceCount = Math.ceil(h / sliceH);
    const order = Array.from({ length: sliceCount }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      if (rand() < p.intensity / 100) {
        const j = Math.floor(rand() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }
    for (let s = 0; s < sliceCount; s++) {
      const srcStart = order[s] * sliceH;
      const dstStart = s * sliceH;
      for (let row = 0; row < sliceH; row++) {
        const sy = Math.min(srcStart + row, h - 1);
        const dy = Math.min(dstStart + row, h - 1);
        out.set(src.subarray(sy * w * 4, sy * w * 4 + w * 4), dy * w * 4);
      }
    }
    return out;
  }
};
