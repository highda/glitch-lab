// Kaleidoscope — slices a wedge from center and mirrors it around N segments.
// Purely geometric, deterministic.

export default {
  name: 'Kaleidoscope',
  badge: 'GEO',
  badgeColor: '#00ccff',
  description: 'Mirrors a wedge slice around the center point to create kaleidoscope symmetry.',
  params: [
    { key: 'segments', label: 'Segments', min: 2, max: 24, step: 1, def: 6 },
    { key: 'rotation', label: 'Rotate °', min: 0, max: 360, step: 1, def: 0 },
    { key: 'centerX',  label: 'Center X%', min: 0, max: 100, step: 1, def: 50 },
    { key: 'centerY',  label: 'Center Y%', min: 0, max: 100, step: 1, def: 50 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src.length);
    const cx = (p.centerX / 100) * w;
    const cy = (p.centerY / 100) * h;
    const seg = Math.max(2, p.segments);
    const sliceAngle = (2 * Math.PI) / seg;
    const rotRad = (p.rotation * Math.PI) / 180;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const r = Math.sqrt(dx * dx + dy * dy);
        let angle = Math.atan2(dy, dx) - rotRad;

        // Normalize angle to [0, 2π)
        angle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

        // Fold into first slice
        let slicePos = angle / sliceAngle;
        let sliceIdx = Math.floor(slicePos);
        let localAngle = (slicePos - sliceIdx) * sliceAngle;

        // Mirror odd slices for seamless reflection
        if (sliceIdx & 1) {
          localAngle = sliceAngle - localAngle;
        }

        // Map back to source coordinates
        const srcAngle = localAngle + rotRad;
        let sx = Math.round(cx + r * Math.cos(srcAngle));
        let sy = Math.round(cy + r * Math.sin(srcAngle));

        // Clamp to image bounds
        sx = Math.max(0, Math.min(w - 1, sx));
        sy = Math.max(0, Math.min(h - 1, sy));

        const di = (y * w + x) << 2;
        const si = (sy * w + sx) << 2;
        out[di]     = src[si];
        out[di + 1] = src[si + 1];
        out[di + 2] = src[si + 2];
        out[di + 3] = src[si + 3];
      }
    }
    return out;
  }
};
