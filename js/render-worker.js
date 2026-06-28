import { renderEffectStack } from './render-engine.js';

self.addEventListener('message', async (event) => {
  const { seq, sourceData, effectStack, width, height } = event.data;
  const startedAt = performance.now();

  try {
    const result = await renderEffectStack(sourceData, effectStack, width, height);
    self.postMessage({
      seq,
      ok: true,
      data: result.data,
      errors: result.errors,
      elapsed: performance.now() - startedAt,
    }, [result.data.buffer]);
  } catch (error) {
    self.postMessage({
      seq,
      ok: false,
      error: error && error.message ? error.message : String(error),
      elapsed: performance.now() - startedAt,
    });
  }
});
