// Simulates JPEG's 8x8 DCT quantization without actual JPEG encoding.
// Direct control over which frequencies survive or get boosted.
// Uses precomputed cosine table + separable 1D transforms for performance.

const B = 8;

// Precompute cosine table: cos[(2x+1)*u*PI/(2*B)] for x,u in 0..7
const COS = new Float64Array(B * B);
for (let n = 0; n < B; n++) {
  for (let k = 0; k < B; k++) {
    COS[n * B + k] = Math.cos((2 * n + 1) * k * Math.PI / (2 * B));
  }
}
const C0 = 1 / Math.SQRT2;
// Normalization factors: cu * 0.5
const NORM = new Float64Array(B);
for (let u = 0; u < B; u++) NORM[u] = (u === 0 ? C0 : 1) * 0.5;

// Separable 1D DCT forward on a row of length B
function dct1d(input, offset, stride, output, outOffset, outStride) {
  for (let u = 0; u < B; u++) {
    let sum = 0;
    for (let x = 0; x < B; x++) {
      sum += input[offset + x * stride] * COS[x * B + u];
    }
    output[outOffset + u * outStride] = NORM[u] * sum;
  }
}

// Separable 1D IDCT on a row of length B
function idct1d(input, offset, stride, output, outOffset, outStride) {
  for (let x = 0; x < B; x++) {
    let sum = 0;
    for (let u = 0; u < B; u++) {
      sum += NORM[u] * input[offset + u * stride] * COS[x * B + u];
    }
    output[outOffset + x * outStride] = sum;
  }
}

export default {
  name: 'Quantization Blast',
  badge: 'COMP',
  badgeColor: '#cc66ff',
  description: 'Applies real 8×8 DCT with aggressive quantization and frequency control.',
  params: [
    { key: 'quantize', label: 'Quantize', min: 1,   max: 128, step: 1, def: 32 },
    { key: 'hiBoost',  label: 'Hi Boost', min: 0,   max: 200, step: 5, def: 0 },
    { key: 'loKill',   label: 'Lo Kill',  min: 0,   max: 8,   step: 1, def: 0 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const q = p.quantize;
    const hiMul = 1 + p.hiBoost / 50;
    const tmp = new Float64Array(B * B); // scratch for separable transform

    for (let ch = 0; ch < 3; ch++) {
      for (let by = 0; by < h; by += B) {
        for (let bx = 0; bx < w; bx += B) {
          const bw = Math.min(B, w - bx);
          const bh = Math.min(B, h - by);

          // Extract block into B×B (zero-pad edges)
          const block = new Float64Array(B * B);
          for (let y = 0; y < bh; y++) {
            for (let x = 0; x < bw; x++) {
              block[y * B + x] = src[((by + y) * w + (bx + x)) * 4 + ch];
            }
          }

          // Forward DCT: rows then columns (separable)
          // DCT on each row
          for (let y = 0; y < B; y++) {
            dct1d(block, y * B, 1, tmp, y * B, 1);
          }
          // DCT on each column of the result
          const dct = new Float64Array(B * B);
          for (let u = 0; u < B; u++) {
            dct1d(tmp, u, B, dct, u, B);
          }

          // Quantize + frequency manipulation
          for (let v = 0; v < B; v++) {
            for (let u = 0; u < B; u++) {
              const idx = v * B + u;
              const freq = u + v;

              if (freq > 0 && freq <= p.loKill) {
                dct[idx] = 0;
                continue;
              }
              if (freq >= 6 && p.hiBoost > 0) {
                dct[idx] *= hiMul;
              }
              dct[idx] = Math.round(dct[idx] / q) * q;
            }
          }

          // Inverse DCT: columns then rows (separable)
          // IDCT on each column
          for (let u = 0; u < B; u++) {
            idct1d(dct, u, B, tmp, u, B);
          }
          // IDCT on each row
          for (let y = 0; y < bh; y++) {
            const row = new Float64Array(B);
            idct1d(tmp, y * B, 1, row, 0, 1);
            for (let x = 0; x < bw; x++) {
              const val = Math.round(row[x]);
              out[((by + y) * w + (bx + x)) * 4 + ch] = val < 0 ? 0 : val > 255 ? 255 : val;
            }
          }
        }
      }
    }
    return out;
  }
};
