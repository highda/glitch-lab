// Shifts the raw byte array by N bytes, breaking RGBA channel alignment.
// A shift of 1 turns RGBA into GBAR — classic databending artifact.

export default {
  name: 'Buffer Misalign',
  badge: 'BYTE',
  badgeColor: '#ff2200',
  description: 'Shifts the raw byte buffer, breaking RGBA pixel alignment.',
  params: [
    { key: 'offset', label: 'Offset', min: 1, max: 64, step: 1, def: 1 },
    { key: 'preserveAlpha', label: 'Alpha', type: 'select', options: ['preserve', 'corrupt'], def: 'preserve' },
  ],
  apply(src, p, w, h) {
    const len = src.length;
    const out = new Uint8ClampedArray(len);
    const off = p.offset;

    for (let i = 0; i < len; i++) {
      out[i] = src[(i + off) % len];
    }

    // Optionally restore original alpha so the image doesn't go transparent
    if (p.preserveAlpha === 'preserve') {
      for (let i = 3; i < len; i += 4) {
        out[i] = src[i];
      }
    }

    return out;
  }
};
