// Bitwise operations on channel values.
// Modes: shift-left/right (destructive — bits lost), rotate (circular — bits wrap),
// and XOR with a derived constant.

export default {
  name: 'Bit Shift',
  badge: 'BIT',
  badgeColor: '#ff9900',
  description: 'Shifts, rotates, or XORs bits in color channel bytes.',
  params: [
    { key: 'shift', label: 'Shift', min: 1, max: 7, step: 1, def: 2 },
    { key: 'channel', label: 'Channel', type: 'select', options: ['all', 'red', 'green', 'blue'], def: 'red' },
    { key: 'mode', label: 'Mode', type: 'select', options: ['shift-left', 'shift-right', 'rotate-left', 'rotate-right', 'xor'], def: 'shift-left' },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const channels = p.channel === 'all' ? [0, 1, 2] :
      p.channel === 'red' ? [0] : p.channel === 'green' ? [1] : [2];
    const n = p.shift;

    for (let i = 0; i < src.length; i += 4) {
      for (const c of channels) {
        const v = src[i + c];
        switch (p.mode) {
          case 'shift-left':   out[i + c] = (v << n) & 255; break;
          case 'shift-right':  out[i + c] = (v >> n) & 255; break;
          case 'rotate-left':  out[i + c] = ((v << n) | (v >>> (8 - n))) & 255; break;
          case 'rotate-right': out[i + c] = ((v >>> n) | (v << (8 - n))) & 255; break;
          case 'xor':          out[i + c] = (v ^ (n * 37)) & 255; break;
        }
      }
      out[i + 3] = src[i + 3];
    }
    return out;
  }
};
