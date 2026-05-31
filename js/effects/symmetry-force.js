// Symmetry Force — forces mirror symmetry on the image.
// Copies one half/quadrant over the other to make chaotic output look designed.

export default {
  name: 'Symmetry Force',
  badge: 'GEO',
  badgeColor: '#00ccff',
  description: 'Forces mirror symmetry by copying one half or quadrant over the other.',
  params: [
    // 0=horizontal, 1=vertical, 2=quad
    { key: 'axis',  label: 'Axis',  min: 0, max: 2, step: 1, def: 0 },
    // 0=left→right / top→bottom, 1=right→left / bottom→top
    { key: 'source', label: 'Source', min: 0, max: 1, step: 1, def: 0 },
    { key: 'blend',  label: 'Blend %', min: 0, max: 100, step: 1, def: 100 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const blend = p.blend / 100;
    const axis = p.axis;   // 0=H, 1=V, 2=quad
    const flip = p.source; // which side is the source

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let mx = x, my = y;
        let needMirror = false;

        if (axis === 0 || axis === 2) {
          // Horizontal: mirror across vertical center line
          const half = w >> 1;
          if (flip === 0 && x >= half) {
            mx = w - 1 - x;
            needMirror = true;
          } else if (flip === 1 && x < half) {
            mx = w - 1 - x;
            needMirror = true;
          }
        }

        if (axis === 1 || axis === 2) {
          // Vertical: mirror across horizontal center line
          const half = h >> 1;
          if (flip === 0 && y >= half) {
            my = h - 1 - y;
            needMirror = true;
          } else if (flip === 1 && y < half) {
            my = h - 1 - y;
            needMirror = true;
          }
        }

        if (needMirror) {
          const di = (y * w + x) << 2;
          const si = (my * w + mx) << 2;
          for (let c = 0; c < 3; c++) {
            out[di + c] = Math.round(src[di + c] * (1 - blend) + src[si + c] * blend);
          }
        }
      }
    }
    return out;
  }
};
