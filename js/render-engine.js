import { getEffect } from './effects/registry.js';

export async function renderEffectStack(sourceData, effectStack, width, height) {
  let data = new Uint8ClampedArray(sourceData);
  const errors = [];

  for (const fx of effectStack) {
    if (!fx.enabled) continue;
    try {
      const def = await getEffect(fx.type);
      const result = def.apply(data, fx.params, width, height);
      data = result instanceof Promise ? await result : result;
    } catch (error) {
      errors.push({
        type: fx.type,
        message: error && error.message ? error.message : String(error),
      });
    }
  }

  return { data, errors };
}
