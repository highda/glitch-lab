// Convolution Corrupt — applies a deliberately broken convolution kernel.
// Asymmetric, wrong-sum kernels produce directional smearing, ringing, and color bleed.

/** Simple seeded PRNG (mulberry32). */
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export default {
  name: 'Convolution Corrupt',
  badge: 'META',
  badgeColor: '#ff6600',
  description: 'Applies a broken convolution kernel with asymmetry, wrong sums, and directional smearing.',
  params: [
    { key: 'size',      label: 'Kernel Size', min: 3, max: 9, step: 2, def: 5 },
    { key: 'bias',      label: 'Bias',        min: -128, max: 128, step: 1, def: 0 },
    { key: 'asymmetry', label: 'Asymmetry',   min: 0, max: 100, step: 1, def: 50 },
    { key: 'magnitude', label: 'Magnitude',   min: 1, max: 20, step: 1, def: 5 },
    { key: 'channelSplit', label: 'Ch. Split', min: 0, max: 1, step: 1, def: 0 },
    { key: 'seed',      label: 'Seed',        min: 1, max: 9999, step: 1, def: 42 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const ks = p.size | 1; // ensure odd
    const half = ks >> 1;
    const rng = mulberry32(p.seed);
    const asym = p.asymmetry / 100;
    const mag = p.magnitude;

    // Generate corrupted kernel(s) — one per channel if split, else shared
    const kernelCount = p.channelSplit ? 3 : 1;
    const kernels = [];

    for (let k = 0; k < kernelCount; k++) {
      const kernel = new Float32Array(ks * ks);
      // Start with a rough center-weighted kernel, then corrupt it
      for (let ky = 0; ky < ks; ky++) {
        for (let kx = 0; kx < ks; kx++) {
          const dx = kx - half;
          const dy = ky - half;
          // Base: inverse distance weight
          const dist = Math.sqrt(dx * dx + dy * dy) + 1;
          let val = mag / dist;
          // Asymmetric corruption: random sign flip and magnitude warp
          val *= 1 + (rng() * 2 - 1) * asym * 3;
          if (rng() < asym * 0.4) val = -val;
          kernel[ky * ks + kx] = val;
        }
      }
      // Deliberately do NOT normalize — wrong sum is part of the corruption
      kernels.push(kernel);
    }

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const di = (y * w + x) << 2;

        for (let c = 0; c < 3; c++) {
          const kernel = kernels[p.channelSplit ? c : 0];
          let sum = 0;

          for (let ky = 0; ky < ks; ky++) {
            const sy = Math.max(0, Math.min(h - 1, y + ky - half));
            for (let kx = 0; kx < ks; kx++) {
              const sx = Math.max(0, Math.min(w - 1, x + kx - half));
              sum += src[(sy * w + sx) * 4 + c] * kernel[ky * ks + kx];
            }
          }

          out[di + c] = Math.max(0, Math.min(255, Math.round(sum + p.bias)));
        }
      }
    }
    return out;
  }
};
