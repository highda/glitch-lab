export default {
  name: 'JPEG Crush',
  badge: 'COMP',
  badgeColor: '#cc66ff',
  description: 'Re-encodes the image through JPEG at low quality, optionally iterating.',
  params: [
    { key: 'quality', label: 'Quality', min: 1, max: 50, step: 1, def: 5 },
    { key: 'iterations', label: 'Iters', min: 1, max: 8, step: 1, def: 3 },
  ],
  apply(src, p, w, h) {
    const tc = document.createElement('canvas');
    tc.width = w; tc.height = h;
    const tctx = tc.getContext('2d');
    tctx.putImageData(new ImageData(new Uint8ClampedArray(src), w, h), 0, 0);

    async function crush() {
      for (let iter = 0; iter < p.iterations; iter++) {
        const blob = await new Promise(resolve =>
          tc.toBlob(resolve, 'image/jpeg', p.quality / 100)
        );
        const bitmap = await createImageBitmap(blob);
        tctx.clearRect(0, 0, w, h);
        tctx.drawImage(bitmap, 0, 0);
        bitmap.close();
      }
      return tctx.getImageData(0, 0, w, h).data;
    }
    return crush();
  }
};
