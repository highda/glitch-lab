// Recursive Crop — places progressively smaller copies of the full image
// into itself at an anchor point (Droste-like). Single-pass, deterministic.

export default {
  name: 'Recursive Crop',
  badge: 'META',
  badgeColor: '#ff6600',
  description: 'Pastes progressively smaller copies of the image into itself for a Droste-like recursive effect.',
  params: [
    { key: 'iterations', label: 'Iterations', min: 1, max: 8, step: 1, def: 4 },
    { key: 'scale',      label: 'Scale %',    min: 20, max: 80, step: 1, def: 50 },
    { key: 'anchorX',    label: 'Anchor X%',  min: 0, max: 100, step: 1, def: 50 },
    { key: 'anchorY',    label: 'Anchor Y%',  min: 0, max: 100, step: 1, def: 50 },
    { key: 'blend',      label: 'Blend %',    min: 10, max: 100, step: 1, def: 90 },
  ],
  apply(src, p, w, h) {
    // Use an offscreen canvas for scaling — much faster than manual bilinear
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Put original image on canvas
    const imgData = new ImageData(new Uint8ClampedArray(src), w, h);
    ctx.putImageData(imgData, 0, 0);

    const scaleFrac = p.scale / 100;
    const blend = p.blend / 100;
    const anchorNX = p.anchorX / 100;
    const anchorNY = p.anchorY / 100;

    // Prepare a single temp canvas with the original for drawing copies
    const tmp = document.createElement('canvas');
    tmp.width = w; tmp.height = h;
    tmp.getContext('2d').putImageData(imgData, 0, 0);

    // Track the bounds of each nesting level.
    // Each copy is placed at the anchor point within the previous copy's rect.
    let parentX = 0, parentY = 0, parentW = w, parentH = h;

    for (let i = 1; i <= p.iterations; i++) {
      const cw = Math.round(parentW * scaleFrac);
      const ch = Math.round(parentH * scaleFrac);
      if (cw < 2 || ch < 2) break;

      // Place center of the scaled copy at anchor point within parent rect
      const ax = Math.round(parentX + anchorNX * parentW - cw / 2);
      const ay = Math.round(parentY + anchorNY * parentH - ch / 2);

      ctx.globalAlpha = blend;
      ctx.drawImage(tmp, 0, 0, w, h, ax, ay, cw, ch);

      // Next iteration nests inside this copy's bounds
      parentX = ax;
      parentY = ay;
      parentW = cw;
      parentH = ch;
    }

    ctx.globalAlpha = 1;
    return ctx.getImageData(0, 0, w, h).data;
  }
};
