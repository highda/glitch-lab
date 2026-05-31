// Self-Diff — computes the difference between the image and a transformed
// version of itself, then blends the result back. Reveals hidden structure.

export default {
  name: 'Self-Diff',
  badge: 'META',
  badgeColor: '#ff6600',
  description: 'Diffs the image against a shifted/scaled/channel-rotated copy of itself to reveal hidden structure.',
  params: [
    { key: 'transform', label: 'Transform', type: 'select',
      options: ['shift', 'scale', 'rotate-channels', 'invert', 'flip-h', 'flip-v'], def: 'shift' },
    { key: 'offsetX', label: 'Offset X', min: -100, max: 100, step: 1, def: 10 },
    { key: 'offsetY', label: 'Offset Y', min: -100, max: 100, step: 1, def: 0 },
    { key: 'scaleFactor', label: 'Scale %', min: 80, max: 120, step: 1, def: 100 },
    { key: 'blend',   label: 'Blend %',  min: 0, max: 100, step: 1, def: 100 },
    { key: 'amplify', label: 'Amplify',  min: 1, max: 10, step: 1, def: 2 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const blend = p.blend / 100;
    const amp = p.amplify;
    const scale = p.scaleFactor / 100;
    const cx = w / 2, cy = h / 2;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sx = x, sy = y;
        let chMap = [0, 1, 2]; // R, G, B
        let invert = false;

        switch (p.transform) {
          case 'shift':
            sx = x - p.offsetX;
            sy = y - p.offsetY;
            break;
          case 'scale':
            sx = Math.round(((x - cx) / scale) + cx);
            sy = Math.round(((y - cy) / scale) + cy);
            break;
          case 'rotate-channels':
            chMap = [1, 2, 0]; // R←G, G←B, B←R
            sx = x - p.offsetX;
            sy = y - p.offsetY;
            break;
          case 'invert':
            invert = true;
            sx = x - p.offsetX;
            sy = y - p.offsetY;
            break;
          case 'flip-h':
            sx = w - 1 - x;
            sy = y;
            break;
          case 'flip-v':
            sx = x;
            sy = h - 1 - y;
            break;
        }

        // Clamp source to bounds
        sx = Math.max(0, Math.min(w - 1, sx));
        sy = Math.max(0, Math.min(h - 1, sy));

        const di = (y * w + x) << 2;
        const si = (sy * w + sx) << 2;

        for (let c = 0; c < 3; c++) {
          const a = src[di + c];
          let b = src[si + chMap[c]];
          if (invert) b = 255 - b;
          const diff = Math.min(255, Math.abs(a - b) * amp);
          out[di + c] = Math.round(a * (1 - blend) + diff * blend);
        }
      }
    }
    return out;
  }
};
