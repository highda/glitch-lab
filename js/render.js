// Async rendering engine — applies the effect stack to the source image.

import { state } from './state.js';
import { renderEffectStack } from './render-engine.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const statusText = document.getElementById('status-text');
const renderTime = document.getElementById('render-time');
let renderWorker = null;
let workerFailed = false;

function getRenderWorker() {
  if (workerFailed || typeof Worker === 'undefined') return null;
  if (!renderWorker) {
    try {
      renderWorker = new Worker(new URL('./render-worker.js', import.meta.url), { type: 'module' });
    } catch (error) {
      workerFailed = true;
      console.warn('Worker renderer unavailable; falling back to main thread.', error);
      return null;
    }
  }
  return renderWorker;
}

export function scheduleRender() {
  if (!state.sourceImage) return;
  if (state.liveMode) {
    if (state.renderTimer) clearTimeout(state.renderTimer);
    state.renderTimer = setTimeout(doRender, 30);
  } else {
    state.renderPending = true;
    statusText.textContent = 'Pending...';
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
  const seq = ++state.renderSeq;
  state.latestRenderSeq = seq;
  const stack = state.effectStack.map(fx => ({
    id: fx.id,
    type: fx.type,
    params: { ...fx.params },
    enabled: fx.enabled,
  }));

  try {
    const worker = getRenderWorker();
    let result;
    if (worker) {
      try {
        result = await renderInWorker(worker, seq, new Uint8ClampedArray(state.sourceData), stack, w, h);
      } catch (error) {
        workerFailed = true;
        console.warn('Worker render failed; retrying on main thread.', error);
        result = await renderEffectStack(new Uint8ClampedArray(state.sourceData), stack, w, h);
      }
    } else {
      result = await renderEffectStack(new Uint8ClampedArray(state.sourceData), stack, w, h);
    }

    if (seq === state.latestRenderSeq) {
      ctx.putImageData(new ImageData(result.data, w, h), 0, 0);
      showRenderStatus(result.errors || [], performance.now() - t0);
    }
  } catch (error) {
    workerFailed = true;
    console.warn('Render failed:', error);
    statusText.textContent = 'Render failed';
  } finally {
    state.rendering = false;

    if (state.renderPending && state.liveMode) {
      state.renderPending = false;
      doRender();
    }
  }
}

function renderInWorker(worker, seq, sourceData, effectStack, width, height) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
    };
    const onMessage = (event) => {
      if (event.data.seq !== seq) return;
      cleanup();
      if (event.data.ok) {
        resolve({ data: event.data.data, errors: event.data.errors || [] });
      } else {
        reject(new Error(event.data.error || 'Worker render failed.'));
      }
    };
    const onError = (event) => {
      cleanup();
      reject(event.error || new Error(event.message || 'Worker render failed.'));
    };

    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);
    worker.postMessage({
      seq,
      sourceData,
      effectStack,
      width,
      height,
    }, [sourceData.buffer]);
  });
}

function showRenderStatus(errors, elapsedMs) {
  renderTime.textContent = elapsedMs.toFixed(1) + 'ms';
  const applied = state.effectStack.filter(f => f.enabled).length;
  if (errors.length > 0) {
    const names = errors.map(error => error.type).join(', ');
    statusText.textContent = `${applied} effects applied; failed: ${names}`;
  } else {
    statusText.textContent = applied + ' effects applied';
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
