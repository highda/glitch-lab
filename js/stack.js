// Effect stack management — add, remove, reorder, toggle, and UI rendering.

import { state, nextId } from './state.js';
import { getEffect, getEffectSync, preloadEffect } from './effects/registry.js';
import { scheduleRender } from './render.js';

// ─── STACK OPERATIONS ───

export async function addEffect(type) {
  if (!type) return;
  const def = await getEffect(type);
  if (!def) return;
  const params = {};
  def.params.forEach(p => { params[p.key] = p.def; });
  state.effectStack.push({ id: nextId(), type, params, enabled: true, collapsed: false });
  renderStack();
  scheduleRender();
}

export function removeEffect(id) {
  state.effectStack = state.effectStack.filter(f => f.id !== id);
  renderStack();
  scheduleRender();
}

export function toggleEffect(id) {
  const fx = state.effectStack.find(f => f.id === id);
  if (fx) { fx.enabled = !fx.enabled; renderStack(); scheduleRender(); }
}

export function toggleCollapse(id) {
  const fx = state.effectStack.find(f => f.id === id);
  if (fx) { fx.collapsed = !fx.collapsed; renderStack(); }
}

export function duplicateEffect(id) {
  const fx = state.effectStack.find(f => f.id === id);
  if (fx) {
    const clone = { id: nextId(), type: fx.type, params: { ...fx.params }, enabled: true, collapsed: false };
    state.effectStack.splice(state.effectStack.indexOf(fx) + 1, 0, clone);
    renderStack();
    scheduleRender();
  }
}

export function updateParam(id, key, value) {
  const fx = state.effectStack.find(f => f.id === id);
  if (fx) {
    // Check if this param is a string type (select or binary) to avoid numeric coercion
    const def = getEffectSync(fx.type);
    const paramDef = def && def.params.find(p => p.key === key);
    const isStringParam = paramDef && (paramDef.type === 'select' || paramDef.type === 'binary');
    fx.params[key] = isStringParam ? value : (isNaN(Number(value)) ? value : Number(value));
    const valEl = document.getElementById(`val-${id}-${key}`);
    if (valEl) valEl.textContent = value;
    scheduleRender();
  }
}

// ─── DRAG & DROP REORDER ───
let dragId = null;

export function onDragStart(e, id) {
  dragId = id;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', String(id));
  const card = e.target.closest('.fx-card');
  if (card) card.classList.add('dragging');
}

export function onDragEnd() {
  dragId = null;
  document.querySelectorAll('.fx-card').forEach(c => c.classList.remove('dragging', 'drag-over'));
}

export function onDragOver(e, id) {
  e.preventDefault();
  if (dragId === id || dragId === null) return;
  const card = e.target.closest('.fx-card');
  if (card) card.classList.add('drag-over');
}

export function onDragLeave(e) {
  const card = e.target.closest('.fx-card');
  if (card) card.classList.remove('drag-over');
}

export function onDrop(e, id) {
  e.preventDefault();
  if (dragId === null || dragId === id) return;
  const fromIdx = state.effectStack.findIndex(f => f.id === dragId);
  const toIdx = state.effectStack.findIndex(f => f.id === id);
  if (fromIdx < 0 || toIdx < 0) return;
  const [item] = state.effectStack.splice(fromIdx, 1);
  state.effectStack.splice(toIdx, 0, item);
  dragId = null;
  renderStack();
  scheduleRender();
}

// ─── RENDER STACK UI ───

export function renderStack() {
  const list = document.getElementById('stack-list');
  document.getElementById('fx-count').textContent = state.effectStack.length;

  if (state.effectStack.length === 0) {
    list.innerHTML = '<div class="stack-empty">No effects added</div>';
    return;
  }

  list.innerHTML = state.effectStack.map((fx) => {
    const def = getEffectSync(fx.type);
    if (!def) return ''; // not loaded yet (shouldn't happen after addEffect)
    const disabledClass = fx.enabled ? '' : 'disabled';
    const collapsedClass = fx.collapsed ? 'collapsed' : '';
    const eyeIcon = fx.enabled ? '◉' : '○';
    const chevron = fx.collapsed ? '▸' : '▾';

    let paramsHtml = '';
    def.params.forEach(p => {
      if (p.type === 'binary') {
        paramsHtml += `
          <div class="param-row">
            <span class="param-label">${p.label}</span>
            <input type="text" value="${fx.params[p.key]}" maxlength="8" pattern="[01]*"
                   style="flex:1;font-family:'IBM Plex Mono',monospace;font-size:11px;background:var(--bg);color:var(--accent2);border:1px solid var(--border);padding:3px 6px;letter-spacing:2px;text-align:center"
                   oninput="this.value=this.value.replace(/[^01]/g,'');window._gl.updateParam(${fx.id}, '${p.key}', this.value)">
          </div>`;
      } else if (p.type === 'select') {
        const opts = p.options.map(o =>
          `<option value="${o}" ${fx.params[p.key] === o ? 'selected' : ''}>${o}</option>`
        ).join('');
        paramsHtml += `
          <div class="param-row">
            <span class="param-label">${p.label}</span>
            <select onchange="window._gl.updateParam(${fx.id}, '${p.key}', this.value)">${opts}</select>
          </div>`;
      } else {
        paramsHtml += `
          <div class="param-row">
            <span class="param-label">${p.label}</span>
            <input type="range" min="${p.min}" max="${p.max}" step="${p.step}"
                   value="${fx.params[p.key]}"
                   oninput="window._gl.updateParam(${fx.id}, '${p.key}', this.value)">
            <span class="param-value" id="val-${fx.id}-${p.key}">${fx.params[p.key]}</span>
          </div>`;
      }
    });

    return `
      <div class="fx-card ${disabledClass} ${collapsedClass}"
           ondragover="window._gl.onDragOver(event, ${fx.id})"
           ondragleave="window._gl.onDragLeave(event)"
           ondrop="window._gl.onDrop(event, ${fx.id})">
        <div class="fx-card-header">
          <span class="fx-drag-handle" draggable="true"
                ondragstart="window._gl.onDragStart(event, ${fx.id})"
                ondragend="window._gl.onDragEnd()">⠿</span>
          <span class="fx-name" onclick="window._gl.toggleCollapse(${fx.id})" title="${def.description || ''}">
            <span style="color:var(--text-dim);font-size:9px;margin-right:4px">${chevron}</span>
            ${def.name}
          </span>
          <span class="fx-badge" style="border-color:${def.badgeColor};color:${def.badgeColor}">${def.badge}</span>
          <div class="fx-card-actions">
            <button class="icon-btn small" onclick="window._gl.toggleEffect(${fx.id})" title="Toggle">${eyeIcon}</button>
            <button class="icon-btn small" onclick="window._gl.duplicateEffect(${fx.id})" title="Duplicate">⧉</button>
            <button class="icon-btn small danger" onclick="window._gl.removeEffect(${fx.id})" title="Remove">✕</button>
          </div>
        </div>
        <div class="fx-card-body">${paramsHtml}</div>
      </div>`;
  }).join('');
}
