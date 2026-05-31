export default {
  name: 'Noise',
  badge: 'DATA',
  badgeColor: '#ff9900',
  description: 'Injects random mono or per-channel color noise.',
  params: [
    { key: 'amount', label: 'Amount', min: 1, max: 120, step: 1, def: 30 },
    { key: 'mono', label: 'Type', type: 'select', options: ['color', 'mono'], def: 'mono' },
    { key: 'seed', label: 'Seed', min: 1, max: 999, step: 1, def: 1 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    let rng = p.seed;
    const rand = () => { rng = (rng * 16807 + 0) % 2147483647; return (rng / 2147483647) * 2 - 1; };
    for (let i = 0; i < src.length; i += 4) {
      if (p.mono === 'mono') {
        const n = rand() * p.amount;
        out[i] = Math.min(255, Math.max(0, src[i] + n));
        out[i + 1] = Math.min(255, Math.max(0, src[i + 1] + n));
        out[i + 2] = Math.min(255, Math.max(0, src[i + 2] + n));
      } else {
        out[i] = Math.min(255, Math.max(0, src[i] + rand() * p.amount));
        out[i + 1] = Math.min(255, Math.max(0, src[i + 1] + rand() * p.amount));
        out[i + 2] = Math.min(255, Math.max(0, src[i + 2] + rand() * p.amount));
      }
    }
    return out;
  }
};
