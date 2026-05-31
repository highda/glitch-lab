// Sorts pixel values per-channel independently, then reads them back
// in original spatial order. Dark values cluster, light values cluster,
// but spatial structure partially survives because the sort is per-channel.

export default {
  name: 'Value Sort',
  badge: 'DATA',
  badgeColor: '#ff9900',
  description: 'Sorts channel byte values independently per row, column, or full image.',
  params: [
    { key: 'scope', label: 'Scope', type: 'select', options: ['row', 'column', 'full'], def: 'row' },
    { key: 'channel', label: 'Channel', type: 'select', options: ['all', 'red', 'green', 'blue'], def: 'all' },
    { key: 'reverse', label: 'Order', type: 'select', options: ['ascending', 'descending'], def: 'ascending' },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src);
    const channels = p.channel === 'all' ? [0, 1, 2] :
      p.channel === 'red' ? [0] : p.channel === 'green' ? [1] : [2];
    const desc = p.reverse === 'descending';

    for (const ch of channels) {
      if (p.scope === 'full') {
        // Collect all values for this channel, sort, write back
        const vals = new Uint8Array(w * h);
        for (let i = 0; i < w * h; i++) vals[i] = src[i * 4 + ch];
        vals.sort();
        if (desc) vals.reverse();
        for (let i = 0; i < w * h; i++) out[i * 4 + ch] = vals[i];

      } else if (p.scope === 'row') {
        const vals = new Uint8Array(w);
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) vals[x] = src[(y * w + x) * 4 + ch];
          vals.sort();
          if (desc) vals.reverse();
          for (let x = 0; x < w; x++) out[(y * w + x) * 4 + ch] = vals[x];
        }

      } else { // column
        const vals = new Uint8Array(h);
        for (let x = 0; x < w; x++) {
          for (let y = 0; y < h; y++) vals[y] = src[(y * w + x) * 4 + ch];
          vals.sort();
          if (desc) vals.reverse();
          for (let y = 0; y < h; y++) out[(y * w + x) * 4 + ch] = vals[y];
        }
      }
    }
    return out;
  }
};
