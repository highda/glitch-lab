// Reverses byte order within fixed-size chunks of the raw buffer.
// Chunk boundaries create visible seams; within each chunk the image
// plays backwards at the byte level.

export default {
  name: 'Byte Reverse',
  badge: 'BYTE',
  badgeColor: '#ff2200',
  description: 'Reverses byte order within fixed-size chunks of the buffer.',
  params: [
    { key: 'chunkSize', label: 'Chunk', min: 8, max: 2048, step: 4, def: 128 },
    { key: 'skip',      label: 'Skip',  min: 0, max: 4,    step: 1, def: 1 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const len = src.length;
    const size = Math.max(4, p.chunkSize);
    let chunkIdx = 0;

    for (let pos = 0; pos < len; pos += size) {
      chunkIdx++;
      // Skip every N chunks (0 = reverse all)
      if (p.skip > 0 && chunkIdx % (p.skip + 1) !== 1) continue;

      const end = Math.min(pos + size, len);
      const chunkLen = end - pos;

      // Reverse the bytes within this chunk
      for (let i = 0; i < chunkLen; i++) {
        out[pos + i] = src[pos + chunkLen - 1 - i];
      }

      // Restore alpha bytes so image stays visible
      for (let i = pos + 3 - (pos % 4); i < end; i += 4) {
        if (i >= pos && i < end) out[i] = src[i];
      }
    }
    return out;
  }
};
