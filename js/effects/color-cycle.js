// Color Cycle — rotates hue and shifts saturation/lightness uniformly.
// Simple but powerful for recoloring a finished glitch into a specific mood.

export default {
  name: 'Color Cycle',
  badge: 'COLOR',
  badgeColor: '#ff66cc',
  description: 'Rotates hue and shifts saturation/lightness for uniform color transformation.',
  params: [
    { key: 'hueShift',   label: 'Hue °',       min: 0, max: 360, step: 1, def: 0 },
    { key: 'satShift',   label: 'Saturation',   min: -100, max: 100, step: 1, def: 0 },
    { key: 'lightShift', label: 'Lightness',    min: -100, max: 100, step: 1, def: 0 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const hShift = p.hueShift / 360;
    const sShift = p.satShift / 100;
    const lShift = p.lightShift / 100;
    const len = w * h * 4;

    for (let i = 0; i < len; i += 4) {
      const r = src[i] / 255;
      const g = src[i + 1] / 255;
      const b = src[i + 2] / 255;

      // RGB → HSL
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const d = max - min;
      let hh = 0, ss = 0, ll = (max + min) / 2;

      if (d > 0) {
        ss = ll > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) hh = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) hh = ((b - r) / d + 2) / 6;
        else hh = ((r - g) / d + 4) / 6;
      }

      // Apply shifts
      hh = (hh + hShift) % 1;
      if (hh < 0) hh += 1;
      ss = Math.max(0, Math.min(1, ss + sShift));
      ll = Math.max(0, Math.min(1, ll + lShift));

      // HSL → RGB
      let ro, go, bo;
      if (ss === 0) {
        ro = go = bo = ll;
      } else {
        const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
        const pp = 2 * ll - q;
        ro = h2r(pp, q, hh + 1 / 3);
        go = h2r(pp, q, hh);
        bo = h2r(pp, q, hh - 1 / 3);
      }

      out[i]     = Math.round(ro * 255);
      out[i + 1] = Math.round(go * 255);
      out[i + 2] = Math.round(bo * 255);
    }
    return out;
  }
};

function h2r(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}
