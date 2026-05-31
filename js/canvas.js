// Canvas zoom, pan, and touch handling.

import { state } from './state.js';

const canvas = document.getElementById('canvas');
const canvasArea = document.getElementById('canvas-area');

export function updateCanvasTransform() {
  canvas.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
  document.getElementById('zoom-indicator').textContent = Math.round(state.zoom * 100) + '%';
}

export function resetZoom() {
  if (!state.sourceImage) return;
  const area = canvasArea.getBoundingClientRect();
  const scaleX = (area.width - 40) / state.sourceImage.width;
  const scaleY = (area.height - 40) / state.sourceImage.height;
  state.zoom = Math.min(scaleX, scaleY, 1);
  state.panX = (area.width - state.sourceImage.width * state.zoom) / 2;
  state.panY = (area.height - state.sourceImage.height * state.zoom) / 2;
  updateCanvasTransform();
}

// --- Mouse wheel zoom ---
let isPanning = false;
let panStartX = 0, panStartY = 0;
let panStartPanX = 0, panStartPanY = 0;

canvasArea.addEventListener('wheel', (e) => {
  if (!state.sourceImage) return;
  e.preventDefault();
  const rect = canvasArea.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const imgX = (mx - state.panX) / state.zoom;
  const imgY = (my - state.panY) / state.zoom;
  const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
  state.zoom = Math.min(20, Math.max(0.05, state.zoom * factor));
  state.panX = mx - imgX * state.zoom;
  state.panY = my - imgY * state.zoom;
  updateCanvasTransform();
}, { passive: false });

// --- Mouse pan ---
canvasArea.addEventListener('mousedown', (e) => {
  if (!state.sourceImage || e.target.closest('.drop-zone')) return;
  isPanning = true;
  panStartX = e.clientX;
  panStartY = e.clientY;
  panStartPanX = state.panX;
  panStartPanY = state.panY;
});
window.addEventListener('mousemove', (e) => {
  if (!isPanning) return;
  state.panX = panStartPanX + (e.clientX - panStartX);
  state.panY = panStartPanY + (e.clientY - panStartY);
  updateCanvasTransform();
});
window.addEventListener('mouseup', () => { isPanning = false; });

// --- Touch zoom & pan ---
let lastTouchDist = 0;
let lastTouchCenter = null;

canvasArea.addEventListener('touchstart', (e) => {
  if (!state.sourceImage) return;
  if (e.touches.length === 2) {
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastTouchDist = Math.sqrt(dx * dx + dy * dy);
    lastTouchCenter = {
      x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
      y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
    };
  } else if (e.touches.length === 1) {
    isPanning = true;
    panStartX = e.touches[0].clientX;
    panStartY = e.touches[0].clientY;
    panStartPanX = state.panX;
    panStartPanY = state.panY;
  }
}, { passive: false });

canvasArea.addEventListener('touchmove', (e) => {
  if (!state.sourceImage) return;
  if (e.touches.length === 2 && lastTouchDist > 0) {
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const rect = canvasArea.getBoundingClientRect();
    const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
    const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
    const imgX = (cx - state.panX) / state.zoom;
    const imgY = (cy - state.panY) / state.zoom;
    state.zoom = Math.min(20, Math.max(0.05, state.zoom * (dist / lastTouchDist)));
    state.panX = cx - imgX * state.zoom;
    state.panY = cy - imgY * state.zoom;
    if (lastTouchCenter) {
      const ncx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const ncy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      state.panX += ncx - lastTouchCenter.x;
      state.panY += ncy - lastTouchCenter.y;
      lastTouchCenter = { x: ncx, y: ncy };
    }
    lastTouchDist = dist;
    updateCanvasTransform();
  } else if (e.touches.length === 1 && isPanning) {
    state.panX = panStartPanX + (e.touches[0].clientX - panStartX);
    state.panY = panStartPanY + (e.touches[0].clientY - panStartY);
    updateCanvasTransform();
  }
}, { passive: false });

canvasArea.addEventListener('touchend', () => {
  isPanning = false;
  lastTouchDist = 0;
  lastTouchCenter = null;
});
