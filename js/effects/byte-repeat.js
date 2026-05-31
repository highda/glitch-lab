// Reads through the buffer and every N bytes, duplicates the next M bytes,
// overwriting what follows. Simulates a stuck read head or buffer copy bug.

export default {
  name: 'Byte Repeat',
  badge: 'BYTE',
  badgeColor: '#ff2200',
  description: 'Duplicates byte chunks as if a read head got stuck.',
  params: [
    { key: 'interval', label: 'Every N', min: 16,  max: 2000, step: 8, def: 256 },
    { key: 'copyLen',  label: 'Copy M',  min: 4,   max: 500,  step: 4, def: 64 },
    { key: 'repeats',  label: 'Repeats', min: 1,   max: 8,    step: 1, def: 2 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const len = src.length;
    let pos = 0;

    while (pos < len) {
      pos += p.interval;
      if (pos >= len) break;

      // Grab the chunk to repeat
      const chunkEnd = Math.min(pos + p.copyLen, len);
      const chunk = src.slice(pos, chunkEnd);
      const chunkLen = chunk.length;

      // Write it repeatedly after the source position
      let writePos = pos;
      for (let r = 0; r < p.repeats && writePos < len; r++) {
        for (let b = 0; b < chunkLen && writePos < len; b++) {
          out[writePos++] = chunk[b];
        }
      }

      // Restore alpha bytes in the overwritten region so image doesn't vanish
      const repairStart = pos - (pos % 4) + 3;
      for (let i = repairStart; i < writePos && i < len; i += 4) {
        out[i] = src[i];
      }

      pos = writePos;
    }
    return out;
  }
};
