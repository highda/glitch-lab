const CACHE_NAME = 'glitch-lab-v1';
const APP_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './manifest.webmanifest',
  './icons/glitch-lab.svg',
  './js/app.js',
  './js/canvas.js',
  './js/image.js',
  './js/render.js',
  './js/render-engine.js',
  './js/render-worker.js',
  './js/stack.js',
  './js/state.js',
  './js/effects/canvas-util.js',
  './js/effects/registry.js',
  './js/effects/bayer-dither.js',
  './js/effects/bit-mask-stencil.js',
  './js/effects/bit-shift.js',
  './js/effects/block-scramble.js',
  './js/effects/buffer-misalign.js',
  './js/effects/byte-repeat.js',
  './js/effects/byte-reverse.js',
  './js/effects/channel-shift.js',
  './js/effects/channel-swap.js',
  './js/effects/channel-threshold-gate.js',
  './js/effects/chromatic-split.js',
  './js/effects/color-cycle.js',
  './js/effects/convolution-corrupt.js',
  './js/effects/corrupt-diffusion.js',
  './js/effects/echo-shift.js',
  './js/effects/edge-glow.js',
  './js/effects/feedback.js',
  './js/effects/jpeg-crush.js',
  './js/effects/kaleidoscope.js',
  './js/effects/mosaic-corrupt.js',
  './js/effects/noise.js',
  './js/effects/overflow-wrap.js',
  './js/effects/packet-loss.js',
  './js/effects/pixel-drift.js',
  './js/effects/pixel-echo.js',
  './js/effects/pixel-sort.js',
  './js/effects/posterize.js',
  './js/effects/quantization-blast.js',
  './js/effects/recursive-crop.js',
  './js/effects/runlength-smear.js',
  './js/effects/scanlines.js',
  './js/effects/sector-fault.js',
  './js/effects/self-diff.js',
  './js/effects/slice-shuffle.js',
  './js/effects/stride-corrupt.js',
  './js/effects/symmetry-force.js',
  './js/effects/value-sort.js',
  './js/effects/xor-fold.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
