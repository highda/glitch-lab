// Async rendering engine — applies the effect stack to the source image.

import { state } from './state.js';
import { getEffect } from './effects/registry.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

export function scheduleRender() {
  if (!state.sourceImage) return;
  if (state.liveMode) {
    if (state.renderTimer) clearTimeout(state.renderTimer);
    state.renderTimer = setTimeout(doRender, 30);
  } else {
    state.renderPending = true;
    document.getElementById('status-text').textContent = 'Pending…';
  }
}

export function requestRender() {
  if (!state.sourceImage) return;
  doRender();
}

export async function doRender() {
  if (!state.sourceImage || state.rendering) { state.renderPending = true; return; }
  state.rendering = true;
  state.renderPending = false;
  const t0 = performance.now();
  const w = state.sourceImage.width, h = state.sourceImage.height;

  let data = new Uint8ClampedArray(state.sourceData);

  for (const fx of state.effectStack) {
    if (!fx.enabled) continue;
    try {
      const def = await getEffect(fx.type);
      const result = def.apply(data, fx.params, w, h);
      data = (result instanceof Promise) ? await result : result;
    } catch (e) {
      console.warn(`Effect ${fx.type} failed:`, e);
    }
  }

  ctx.putImageData(new ImageData(data, w, h), 0, 0);

  const elapsed = (performance.now() - t0).toFixed(1);
  document.getElementById('render-time').textContent = elapsed + 'ms';
  document.getElementById('status-text').textContent =
    state.effectStack.filter(f => f.enabled).length + ' effects applied';
  state.rendering = false;

  if (state.renderPending && state.liveMode) {
    state.renderPending = false;
    doRender();
  }
}

export function toggleLive() {
  state.liveMode = !state.liveMode;
  const btn = document.getElementById('btn-live');
  const dot = document.getElementById('live-dot');
  btn.classList.toggle('active', state.liveMode);
  btn.textContent = state.liveMode ? '● Live' : '○ Paused';
  dot.classList.toggle('paused', !state.liveMode);
  if (state.liveMode && state.renderPending) doRender();
}
