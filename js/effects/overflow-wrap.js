// Adds a value to each byte and wraps via modulo 256 instead of clamping.
// Gradients develop hard edges where they cross the 255→0 boundary.

export default {
  name: 'Overflow Wrap',
  badge: 'BYTE',
  badgeColor: '#ff2200',
  description: 'Adds a value to channel bytes with modular wrap instead of clamping.',
  params: [
    { key: 'add', label: 'Add', min: 1, max: 255, step: 1, def: 128 },
    { key: 'channel', label: 'Channel', type: 'select', options: ['all', 'red', 'green', 'blue'], def: 'all' },
    { key: 'multiply', label: 'Multiply', min: 1, max: 8, step: 1, def: 1 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const channels = p.channel === 'all' ? [0, 1, 2] :
      p.channel === 'red' ? [0] : p.channel === 'green' ? [1] : [2];

    for (let i = 0; i < src.length; i += 4) {
      for (const c of channels) {
        out[i + c] = ((src[i + c] * p.multiply) + p.add) % 256;
      }
    }
    return out;
  }
};
