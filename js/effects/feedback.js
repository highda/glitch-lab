export default {
  name: 'Feedback',
  badge: 'META',
  badgeColor: '#ff6600',
  description: 'Recursively overlays a zoomed and rotated copy of the image onto itself.',
  params: [
    { key: 'iterations', label: 'Iters', min: 1, max: 12, step: 1, def: 3 },
    { key: 'zoom', label: 'Zoom', min: 100, max: 130, step: 1, def: 105 },
    { key: 'rotation', label: 'Rotate', min: -30, max: 30, step: 1, def: 2 },
    { key: 'alpha', label: 'Mix', min: 5, max: 95, step: 1, def: 50 },
  ],
  apply(src, p, w, h) {
    const tc = document.createElement('canvas');
    tc.width = w; tc.height = h;
    const tctx = tc.getContext('2d');
    tctx.putImageData(new ImageData(new Uint8ClampedArray(src), w, h), 0, 0);

    const scale = p.zoom / 100;
    const angle = p.rotation * Math.PI / 180;

    for (let iter = 0; iter < p.iterations; iter++) {
      const tc2 = document.createElement('canvas');
      tc2.width = w; tc2.height = h;
      const tctx2 = tc2.getContext('2d');
      tctx2.drawImage(tc, 0, 0);
      tctx2.globalAlpha = p.alpha / 100;
      tctx2.translate(w / 2, h / 2);
      tctx2.rotate(angle);
      tctx2.scale(scale, scale);
      tctx2.translate(-w / 2, -h / 2);
      tctx2.drawImage(tc, 0, 0);
      tctx.clearRect(0, 0, w, h);
      tctx.drawImage(tc2, 0, 0);
    }

    return tctx.getImageData(0, 0, w, h).data;
  }
};
