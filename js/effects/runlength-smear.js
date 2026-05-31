// Simulates a broken RLE decoder — finds runs of similar pixels,
// then stretches or truncates them, creating data-dependent horizontal smearing.

export default {
  name: 'Run-Length Smear',
  badge: 'BYTE',
  badgeColor: '#ff2200',
  description: 'Simulates a broken RLE decoder, stretching pixel runs into smears.',
  params: [
    { key: 'tolerance', label: 'Tol', min: 1, max: 80, step: 1, def: 20 },
    { key: 'stretch', label: 'Stretch', min: 100, max: 500, step: 10, def: 200 },
    { key: 'minRun', label: 'Min Run', min: 2, max: 30, step: 1, def: 4 },
    { key: 'direction', label: 'Dir', type: 'select', options: ['horizontal', 'vertical'], def: 'horizontal' },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const horiz = p.direction === 'horizontal';
    const outer = horiz ? h : w;
    const inner = horiz ? w : h;
    const stretchFactor = p.stretch / 100;

    for (let o = 0; o < outer; o++) {
      // Collect runs along this line
      const runs = [];
      let runStart = 0;
      let runR = pixAt(src, 0, o, horiz, w);
      let runG = pixAt(src, 0, o, horiz, w, 1);
      let runB = pixAt(src, 0, o, horiz, w, 2);

      for (let n = 1; n < inner; n++) {
        const r = pixAt(src, n, o, horiz, w);
        const g = pixAt(src, n, o, horiz, w, 1);
        const b = pixAt(src, n, o, horiz, w, 2);
        const diff = Math.abs(r - runR) + Math.abs(g - runG) + Math.abs(b - runB);

        if (diff > p.tolerance) {
          runs.push({ start: runStart, len: n - runStart, r: runR, g: runG, b: runB });
          runStart = n;
          runR = r; runG = g; runB = b;
        }
      }
      runs.push({ start: runStart, len: inner - runStart, r: runR, g: runG, b: runB });

      // Rebuild the line with corrupted run lengths
      let writePos = 0;
      for (const run of runs) {
        let newLen;
        if (run.len >= p.minRun) {
          // Stretch runs that meet minimum length
          newLen = Math.round(run.len * stretchFactor);
        } else {
          newLen = run.len;
        }

        for (let k = 0; k < newLen && writePos < inner; k++) {
          // Read from original run position (clamped), write to output
          const readK = Math.min(k, run.len - 1);
          const readN = run.start + readK;
          const ri = idxAt(readN, o, horiz, w);
          const wi = idxAt(writePos, o, horiz, w);
          out[wi]     = src[ri];
          out[wi + 1] = src[ri + 1];
          out[wi + 2] = src[ri + 2];
          out[wi + 3] = src[ri + 3];
          writePos++;
        }
      }
    }
    return out;
  }
};

function idxAt(n, o, horiz, w) {
  return horiz ? (o * w + n) * 4 : (n * w + o) * 4;
}

function pixAt(src, n, o, horiz, w, ch = 0) {
  return src[idxAt(n, o, horiz, w) + ch];
}
