// Image loading, dropping, and exporting.

import { state } from './state.js';
import { resetZoom } from './canvas.js';
import { scheduleRender } from './render.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const MAX_DIM = 1200;

export function handleFile(e) {
  const file = e.target.files[0];
  if (file) loadImage(file);
}

export function handleDrop(e) {
  e.preventDefault();
  document.getElementById('drop-zone').classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadImage(file);
}

function loadImage(file) {
  const img = new Image();
  img.onload = () => {
    let w = img.width, h = img.height;
    if (w > MAX_DIM || h > MAX_DIM) {
      const ratio = Math.min(MAX_DIM / w, MAX_DIM / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    state.sourceData = ctx.getImageData(0, 0, w, h).data;
    state.sourceImage = { width: w, height: h };
    document.getElementById('drop-zone').classList.add('hidden');
    canvas.style.display = 'block';
    document.getElementById('zoom-indicator').style.display = 'block';
    resetZoom();
    scheduleRender();
  };
  img.src = URL.createObjectURL(file);
}

export function exportImage() {
  if (!state.sourceImage) return;
  const link = document.createElement('a');
  link.download = 'glitched.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
