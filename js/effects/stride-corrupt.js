// Reads the pixel buffer as if the image had a different width (stride).
// Creates progressive diagonal shear — a classic broken-decoder artifact.
// V Stride applies the same trick vertically (column-major reinterpretation).

export default {
  name: 'Stride Corrupt',
  badge: 'BYTE',
  badgeColor: '#ff2200',
  description: 'Reads the pixel buffer with a wrong image width, creating diagonal shear.',
  params: [
    { key: 'strideShift', label: 'H Stride', min: -50, max: 50, step: 1, def: 3 },
    { key: 'vStrideShift', label: 'V Stride', min: -50, max: 50, step: 1, def: 0 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src.length);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const di = (y * w + x) * 4;

        // Horizontal stride corruption: read as if row width were fakeW
        let srcX = x, srcY = y;
        if (p.strideShift !== 0) {
          const fakeW = w + p.strideShift;
          const linear = y * fakeW + x;
          srcX = linear % w;
          srcY = Math.floor(linear / w);
        }

        // Vertical stride corruption: same trick but column-major
        if (p.vStrideShift !== 0) {
          const fakeH = h + p.vStrideShift;
          const linear = srcX * fakeH + srcY;
          srcY = linear % h;
          srcX = Math.floor(linear / h);
        }

        srcX = ((srcX % w) + w) % w;
        srcY = ((srcY % h) + h) % h;

        const si = (srcY * w + srcX) * 4;
        out[di]     = src[si];
        out[di + 1] = src[si + 1];
        out[di + 2] = src[si + 2];
        out[di + 3] = src[si + 3];
      }
    }
    return out;
  }
};
