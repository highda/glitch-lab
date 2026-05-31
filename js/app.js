// Application entry point — wires modules together and exposes handlers to the DOM.

import { resetZoom } from './canvas.js';
import { handleFile, handleDrop, exportImage } from './image.js';
import { scheduleRender, requestRender, toggleLive } from './render.js';
import {
  addEffect, removeEffect, toggleEffect, toggleCollapse,
  duplicateEffect, updateParam,
  onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop,
  renderStack,
} from './stack.js';
import { EFFECT_GROUPS, preloadEffect, getEffectSync } from './effects/registry.js';

// ─── Expose functions to inline event handlers via window._gl ───
// ES modules don't pollute global scope, so inline onclick/oninput handlers
// need an explicit bridge. All DOM event handlers call window._gl.<method>.
window._gl = {
  handleFile,
  handleDrop,
  exportImage,
  resetZoom,
  requestRender,
  toggleLive,
  addEffect,
  removeEffect,
  toggleEffect,
  toggleCollapse,
  duplicateEffect,
  updateParam,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
};

// ─── Populate the add-effect dropdown with optgroups ───
const addSelect = document.getElementById('add-select');
for (const cat of EFFECT_GROUPS) {
  const group = document.createElement('optgroup');
  group.label = cat.group;
  for (const fx of cat.effects) {
    const opt = document.createElement('option');
    opt.value = fx.type;
    opt.textContent = fx.label;
    group.appendChild(opt);
  }
  addSelect.appendChild(group);
}

// ─── Preload effect descriptions for dropdown tooltips ───
(async () => {
  for (const cat of EFFECT_GROUPS) {
    for (const fx of cat.effects) {
      await preloadEffect(fx.type);
      const def = getEffectSync(fx.type);
      if (def && def.description) {
        const opt = addSelect.querySelector(`option[value="${fx.type}"]`);
        if (opt) opt.title = def.description;
      }
    }
  }
})();

// ─── Init ───
renderStack();
