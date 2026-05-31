// Edge Glow — detects edges via Sobel and adds a colorized additive glow.
// Makes glitch artifact boundaries pop with neon outlines.

export default {
  name: 'Edge Glow',
  badge: 'COLOR',
  badgeColor: '#ff66cc',
  description: 'Detects edges with Sobel and overlays a colorized neon glow on them.',
  params: [
    { key: 'threshold', label: 'Threshold', min: 0, max: 255, step: 1, def: 30 },
    { key: 'intensity', label: 'Intensity', min: 0, max: 100, step: 1, def: 60 },
    { key: 'hue',       label: 'Hue °',     min: 0, max: 360, step: 1, def: 180 },
    { key: 'saturation', label: 'Saturation', min: 0, max: 100, step: 1, def: 100 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const mix = p.intensity / 100;
    const thresh = p.threshold;

    // Convert hue/saturation to RGB glow color (lightness = 0.5)
    const glowRGB = hslToRgb(p.hue / 360, p.saturation / 100, 0.5);

    // Compute luminance buffer
    const lum = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const j = i << 2;
      lum[i] = src[j] * 0.299 + src[j + 1] * 0.587 + src[j + 2] * 0.114;
    }

    // Sobel edge detection + additive glow
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const tl = lum[(y - 1) * w + (x - 1)];
        const tc = lum[(y - 1) * w + x];
        const tr = lum[(y - 1) * w + (x + 1)];
        const ml = lum[y * w + (x - 1)];
        const mr = lum[y * w + (x + 1)];
        const bl = lum[(y + 1) * w + (x - 1)];
        const bc = lum[(y + 1) * w + x];
        const br = lum[(y + 1) * w + (x + 1)];

        const gx = -tl - 2 * ml - bl + tr + 2 * mr + br;
        const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
        const mag = Math.sqrt(gx * gx + gy * gy);

        if (mag > thresh) {
          const strength = Math.min(1, (mag - thresh) / 255) * mix;
          const di = (y * w + x) << 2;
          out[di]     = Math.min(255, out[di]     + glowRGB[0] * strength);
          out[di + 1] = Math.min(255, out[di + 1] + glowRGB[1] * strength);
          out[di + 2] = Math.min(255, out[di + 2] + glowRGB[2] * strength);
        }
      }
    }
    return out;
  }
};

/** HSL [0-1] to RGB [0-255]. */
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}
