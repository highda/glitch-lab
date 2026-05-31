// XORs each pixel with a pixel from a mirrored or offset position.
// Creates self-referential interference patterns.

export default {
  name: 'XOR Fold',
  badge: 'BIT',
  badgeColor: '#ff2200',
  description: 'XORs each pixel with its mirrored or offset counterpart.',
  params: [
    { key: 'mode', label: 'Mode', type: 'select', options: ['mirror-h', 'mirror-v', 'mirror-both', 'offset'], def: 'mirror-h' },
    { key: 'offsetX', label: 'Off X', min: -200, max: 200, step: 1, def: 40 },
    { key: 'offsetY', label: 'Off Y', min: -200, max: 200, step: 1, def: 0 },
    { key: 'mix', label: 'Mask', min: 1, max: 255, step: 1, def: 255 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src.length);
    const mask = p.mix;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sx, sy;
        switch (p.mode) {
          case 'mirror-h':
            sx = w - 1 - x; sy = y; break;
          case 'mirror-v':
            sx = x; sy = h - 1 - y; break;
          case 'mirror-both':
            sx = w - 1 - x; sy = h - 1 - y; break;
          case 'offset':
          default:
            sx = ((x + p.offsetX) % w + w) % w;
            sy = ((y + p.offsetY) % h + h) % h;
            break;
        }

        const di = (y * w + x) * 4;
        const si = (sy * w + sx) * 4;

        out[di]     = src[di]     ^ (src[si]     & mask);
        out[di + 1] = src[di + 1] ^ (src[si + 1] & mask);
        out[di + 2] = src[di + 2] ^ (src[si + 2] & mask);
        out[di + 3] = src[di + 3];
      }
    }
    return out;
  }
};
