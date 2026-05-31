// Pixel Echo — blends N offset/scaled copies of the image simultaneously.
// All copies computed from the original input (no iterative buffer reuse).

export default {
  name: 'Pixel Echo',
  badge: 'META',
  badgeColor: '#ff6600',
  description: 'Layers multiple offset and scaled ghost copies of the image with selectable blend modes.',
  params: [
    { key: 'copies',   label: 'Copies',    min: 1, max: 12, step: 1, def: 4 },
    { key: 'driftX',   label: 'Drift X',   min: -50, max: 50, step: 1, def: 8 },
    { key: 'driftY',   label: 'Drift Y',   min: -50, max: 50, step: 1, def: 4 },
    { key: 'scaleDrift', label: 'Scale %/copy', min: -10, max: 10, step: 1, def: 2 },
    { key: 'decay',    label: 'Decay %',   min: 10, max: 100, step: 1, def: 60 },
    { key: 'mode',     label: 'Blend', type: 'select',
      options: ['normal', 'multiply', 'screen', 'difference'], def: 'screen' },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const copies = p.copies;
    const decayBase = p.decay / 100;

    for (let c = 1; c <= copies; c++) {
      const opacity = Math.pow(decayBase, c);
      const scale = 1 + (p.scaleDrift / 100) * c;
      const ox = p.driftX * c;
      const oy = p.driftY * c;
      const cx = w / 2, cy = h / 2;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          // Map destination pixel back to source through scale + offset
          const sx = Math.round(((x - cx) / scale) + cx - ox);
          const sy = Math.round(((y - cy) / scale) + cy - oy);
          if (sx < 0 || sx >= w || sy < 0 || sy >= h) continue;

          const di = (y * w + x) << 2;
          const si = (sy * w + sx) << 2;

          for (let ch = 0; ch < 3; ch++) {
            const a = out[di + ch];
            const b = src[si + ch];
            let blended;
            switch (p.mode) {
              case 'multiply':
                blended = (a * b) / 255;
                break;
              case 'screen':
                blended = 255 - ((255 - a) * (255 - b)) / 255;
                break;
              case 'difference':
                blended = Math.abs(a - b);
                break;
              default: // normal
                blended = b;
            }
            out[di + ch] = Math.round(a * (1 - opacity) + blended * opacity);
          }
        }
      }
    }
    return out;
  }
};
