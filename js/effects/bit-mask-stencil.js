// Applies a repeating bit pattern as AND or OR mask to every color byte.
// Different patterns create structured stripe/grid artifacts in value space.

export default {
  name: 'Bit Mask Stencil',
  badge: 'BIT',
  badgeColor: '#ff9900',
  description: 'Applies a user-defined 8-bit binary mask to channel bytes.',
  params: [
    { key: 'pattern', label: 'Pattern', type: 'binary', def: '11110000' },
    { key: 'op',      label: 'Op',      type: 'select', options: ['and', 'or', 'xor'], def: 'and' },
    { key: 'channel', label: 'Channel', type: 'select', options: ['all', 'red', 'green', 'blue'], def: 'all' },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    // Parse binary string to number (default to 0xF0 if invalid)
    const mask = parseInt(p.pattern, 2) & 255 || 0;
    const channels = p.channel === 'all' ? [0, 1, 2] :
      p.channel === 'red' ? [0] : p.channel === 'green' ? [1] : [2];

    for (let i = 0; i < src.length; i += 4) {
      for (const c of channels) {
        switch (p.op) {
          case 'and': out[i + c] = src[i + c] & mask; break;
          case 'or':  out[i + c] = src[i + c] | mask; break;
          case 'xor': out[i + c] = src[i + c] ^ mask; break;
        }
      }
    }
    return out;
  }
};
