// Chromatic Split — radial RGB channel displacement (chromatic aberration).
// Each channel is offset from a focal point at different angles/magnitudes.

export default {
  name: 'Chromatic Split',
  badge: 'COLOR',
  badgeColor: '#ff66cc',
  description: 'Offsets RGB channels radially from a focal point, creating chromatic aberration.',
  params: [
    { key: 'intensity', label: 'Intensity', min: 0, max: 30, step: 1, def: 8 },
    { key: 'angleR', label: 'R Angle °', min: 0, max: 360, step: 1, def: 0 },
    { key: 'angleG', label: 'G Angle °', min: 0, max: 360, step: 1, def: 120 },
    { key: 'angleB', label: 'B Angle °', min: 0, max: 360, step: 1, def: 240 },
    { key: 'centerX', label: 'Center X%', min: 0, max: 100, step: 1, def: 50 },
    { key: 'centerY', label: 'Center Y%', min: 0, max: 100, step: 1, def: 50 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src.length);
    const cx = (p.centerX / 100) * w;
    const cy = (p.centerY / 100) * h;
    const maxR = Math.sqrt(cx * cx + cy * cy) || 1;
    const intensity = p.intensity;

    const angles = [
      (p.angleR * Math.PI) / 180,
      (p.angleG * Math.PI) / 180,
      (p.angleB * Math.PI) / 180,
    ];

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const di = (y * w + x) << 2;
        const dx = x - cx;
        const dy = y - cy;
        // Distance factor: more displacement further from center
        const dist = Math.sqrt(dx * dx + dy * dy) / maxR;
        const shift = intensity * dist;

        for (let c = 0; c < 3; c++) {
          const ox = Math.round(x + Math.cos(angles[c]) * shift);
          const oy = Math.round(y + Math.sin(angles[c]) * shift);
          const sx = Math.max(0, Math.min(w - 1, ox));
          const sy = Math.max(0, Math.min(h - 1, oy));
          out[di + c] = src[(sy * w + sx) * 4 + c];
        }
        out[di + 3] = src[di + 3]; // preserve alpha
      }
    }
    return out;
  }
};
