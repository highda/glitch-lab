// Per-channel binary threshold. Below = forced to 0, above = forced to 255.
// Creates harsh, poster-like color separation with hard edges.

export default {
  name: 'Threshold Gate',
  badge: 'COLOR',
  badgeColor: '#ff3366',
  description: 'Per-channel binary threshold — values below go to 0, above go to 255.',
  params: [
    { key: 'redThr',   label: 'Red',   min: 0, max: 255, step: 1, def: 128 },
    { key: 'greenThr', label: 'Green', min: 0, max: 255, step: 1, def: 128 },
    { key: 'blueThr',  label: 'Blue',  min: 0, max: 255, step: 1, def: 128 },
  ],
  apply(src, p, w, h) {
    const out = new Uint8ClampedArray(src.length);
    for (let i = 0; i < src.length; i += 4) {
      out[i]     = src[i]     < p.redThr   ? 0 : 255;
      out[i + 1] = src[i + 1] < p.greenThr ? 0 : 255;
      out[i + 2] = src[i + 2] < p.blueThr  ? 0 : 255;
      out[i + 3] = src[i + 3];
    }
    return out;
  }
};
