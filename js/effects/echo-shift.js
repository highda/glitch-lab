// Stamps the image on top of itself N times with spatial offset
// and a bitwise operation (AND, OR, XOR) instead of alpha blending.

export default {
  name: 'Echo Shift',
  badge: 'GEO',
  badgeColor: '#aaff44',
  description: 'Creates offset ghost copies blended with bitwise operations (XOR, AND, OR).',
  params: [
    { key: 'copies',  label: 'Copies',  min: 1, max: 8,    step: 1, def: 3 },
    { key: 'offsetX', label: 'Off X',   min: -80, max: 80, step: 1, def: 12 },
    { key: 'offsetY', label: 'Off Y',   min: -80, max: 80, step: 1, def: 4 },
    { key: 'op',      label: 'Op',      type: 'select', options: ['xor', 'and', 'or'], def: 'xor' },
  ],
  apply(src, p, w, h) {
    let data = new Uint8ClampedArray(src);

    for (let c = 1; c <= p.copies; c++) {
      const dx = p.offsetX * c;
      const dy = p.offsetY * c;
      const next = new Uint8ClampedArray(data);

      for (let y = 0; y < h; y++) {
        const sy = ((y - dy) % h + h) % h;
        for (let x = 0; x < w; x++) {
          const sx = ((x - dx) % w + w) % w;
          const di = (y * w + x) * 4;
          const si = (sy * w + sx) * 4;

          for (let ch = 0; ch < 3; ch++) {
            switch (p.op) {
              case 'xor': next[di + ch] = data[di + ch] ^ src[si + ch]; break;
              case 'and': next[di + ch] = data[di + ch] & src[si + ch]; break;
              case 'or':  next[di + ch] = data[di + ch] | src[si + ch]; break;
            }
          }
        }
      }
      data = next;
    }
    return data;
  }
};
