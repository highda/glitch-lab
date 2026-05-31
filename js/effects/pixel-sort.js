function getPixelVal(r, g, b, mode) {
  switch (mode) {
    case 'brightness': return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    case 'hue': {
      const rn = r / 255, gn = g / 255, bn = b / 255;
      const mx = Math.max(rn, gn, bn), mn = Math.min(rn, gn, bn), d = mx - mn;
      if (d === 0) return 0;
      let h;
      if (mx === rn) h = ((gn - bn) / d) % 6;
      else if (mx === gn) h = (bn - rn) / d + 2;
      else h = (rn - gn) / d + 4;
      h /= 6; return h < 0 ? h + 1 : h;
    }
    case 'saturation': {
      const rn = r / 255, gn = g / 255, bn = b / 255;
      const mx = Math.max(rn, gn, bn);
      return mx === 0 ? 0 : (mx - Math.min(rn, gn, bn)) / mx;
    }
    default: return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
}

export default {
  name: 'Pixel Sort',
  badge: 'SORT',
  badgeColor: '#00eeff',
  description: 'Sorts pixel spans by brightness, hue, or saturation within a threshold range.',
  params: [
    { key: 'threshLo', label: 'Lo Thr', min: 0, max: 100, step: 1, def: 25 },
    { key: 'threshHi', label: 'Hi Thr', min: 0, max: 100, step: 1, def: 80 },
    { key: 'spanLen', label: 'Span %', min: 1, max: 100, step: 1, def: 80 },
    { key: 'sortBy', label: 'Sort By', type: 'select', options: ['brightness', 'hue', 'saturation'], def: 'brightness' },
    { key: 'direction', label: 'Dir', type: 'select', options: ['horizontal', 'vertical'], def: 'horizontal' },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const lo = p.threshLo / 100;
    const hi = p.threshHi / 100;
    const horiz = p.direction === 'horizontal';
    const outer = horiz ? h : w;
    const inner = horiz ? w : h;
    const maxSpanFrac = p.spanLen / 100;

    for (let o = 0; o < outer; o++) {
      const maxSpanPx = Math.max(2, Math.floor(inner * maxSpanFrac));
      let n = 0;
      while (n < inner) {
        const x0 = horiz ? n : o;
        const y0 = horiz ? o : n;
        const i0 = (y0 * w + x0) * 4;
        const v0 = getPixelVal(src[i0], src[i0 + 1], src[i0 + 2], p.sortBy);

        if (v0 < lo || v0 > hi) { n++; continue; }

        const start = n;
        const limit = Math.min(inner, start + maxSpanPx);
        const span = [];
        while (n < limit) {
          const x = horiz ? n : o;
          const y = horiz ? o : n;
          const idx = (y * w + x) * 4;
          const v = getPixelVal(src[idx], src[idx + 1], src[idx + 2], p.sortBy);
          if (v < lo || v > hi) break;
          span.push({ x, y, v, r: src[idx], g: src[idx + 1], b: src[idx + 2], a: src[idx + 3] });
          n++;
        }

        if (span.length < 2) continue;

        const positions = span.map(px => ({ x: px.x, y: px.y }));
        span.sort((a, b) => a.v - b.v);

        for (let k = 0; k < span.length; k++) {
          const di = (positions[k].y * w + positions[k].x) * 4;
          out[di] = span[k].r;
          out[di + 1] = span[k].g;
          out[di + 2] = span[k].b;
          out[di + 3] = span[k].a;
        }
      }
    }
    return out;
  }
};
