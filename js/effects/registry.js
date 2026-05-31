// Effect registry with lazy loading.
// Each effect is loaded from its own file on first use.

/** Map of effect type -> module path (relative to this file). */
const EFFECT_PATHS = {
  channelShift:  './channel-shift.js',
  pixelSort:     './pixel-sort.js',
  posterize:     './posterize.js',
  scanlines:     './scanlines.js',
  bitShift:      './bit-shift.js',
  sliceShuffle:  './slice-shuffle.js',
  pixelDrift:    './pixel-drift.js',
  bayerDither:   './bayer-dither.js',
  channelSwap:   './channel-swap.js',
  jpegCrush:     './jpeg-crush.js',
  noise:         './noise.js',
  feedback:      './feedback.js',
  bufferMisalign:'./buffer-misalign.js',
  overflowWrap:  './overflow-wrap.js',
  xorFold:       './xor-fold.js',
  strideCorrupt: './stride-corrupt.js',
  runlengthSmear:'./runlength-smear.js',
  thresholdGate: './channel-threshold-gate.js',
  echoShift:     './echo-shift.js',
  bitMaskStencil:'./bit-mask-stencil.js',
  valueSort:     './value-sort.js',
  byteRepeat:    './byte-repeat.js',
  byteReverse:   './byte-reverse.js',
  quantBlast:    './quantization-blast.js',
  corruptDiffusion:'./corrupt-diffusion.js',
  blockScramble:   './block-scramble.js',
  sectorFault:     './sector-fault.js',
  mosaicCorrupt:   './mosaic-corrupt.js',
  packetLoss:      './packet-loss.js',
  symmetryForce:   './symmetry-force.js',
  kaleidoscope:    './kaleidoscope.js',
  chromaticSplit:  './chromatic-split.js',
  edgeGlow:        './edge-glow.js',
  colorCycle:      './color-cycle.js',
  pixelEcho:       './pixel-echo.js',
  selfDiff:        './self-diff.js',
  recursiveCrop:   './recursive-crop.js',
  convCorrupt:     './convolution-corrupt.js',
};

/** Cache of loaded effect definitions. */
const loaded = {};

/**
 * Get an effect definition by type. Loads lazily on first call.
 * @param {string} type
 * @returns {Promise<{name, badge, badgeColor, params, apply}>}
 */
export async function getEffect(type) {
  if (loaded[type]) return loaded[type];
  const path = EFFECT_PATHS[type];
  if (!path) throw new Error(`Unknown effect type: ${type}`);
  const mod = await import(path);
  loaded[type] = mod.default;
  return loaded[type];
}

/**
 * Check if an effect is already loaded (no async needed).
 * @param {string} type
 * @returns {object|null}
 */
export function getEffectSync(type) {
  return loaded[type] || null;
}

/**
 * Preload an effect so getEffectSync works afterwards.
 * @param {string} type
 */
export async function preloadEffect(type) {
  await getEffect(type);
}

/** Effects grouped by category for the dropdown. Order defines display order. */
export const EFFECT_GROUPS = [
  { group: 'Color', effects: [
    { type: 'channelShift',  label: 'Channel Displacement' },
    { type: 'channelSwap',   label: 'Channel Swap' },
    { type: 'posterize',     label: 'Posterize' },
    { type: 'thresholdGate', label: 'Threshold Gate' },
    { type: 'chromaticSplit', label: 'Chromatic Split' },
    { type: 'edgeGlow',       label: 'Edge Glow' },
    { type: 'colorCycle',     label: 'Color Cycle' },
  ]},
  { group: 'Geometry', effects: [
    { type: 'pixelSort',     label: 'Pixel Sort' },
    { type: 'scanlines',     label: 'Scanlines' },
    { type: 'sliceShuffle',  label: 'Slice Shuffle' },
    { type: 'pixelDrift',    label: 'Pixel Drift' },
    { type: 'echoShift',    label: 'Echo Shift' },
    { type: 'blockScramble', label: 'Block Scramble' },
    { type: 'mosaicCorrupt', label: 'Mosaic Corrupt' },
    { type: 'symmetryForce',  label: 'Symmetry Force' },
    { type: 'kaleidoscope',   label: 'Kaleidoscope' },
  ]},
  { group: 'Data / Bit', effects: [
    { type: 'bitShift',      label: 'Bit Shift' },
    { type: 'bayerDither',   label: 'Bayer Dither' },
    { type: 'noise',         label: 'Noise Injection' },
    { type: 'overflowWrap',  label: 'Overflow Wrap' },
    { type: 'xorFold',       label: 'XOR Fold' },
    { type: 'bitMaskStencil', label: 'Bit Mask Stencil' },
    { type: 'valueSort',     label: 'Value Sort' },
    { type: 'corruptDiffusion', label: 'Corrupt Diffusion' },
  ]},
  { group: 'Byte / Raw', effects: [
    { type: 'bufferMisalign', label: 'Buffer Misalign' },
    { type: 'strideCorrupt',  label: 'Stride Corrupt' },
    { type: 'runlengthSmear', label: 'Run-Length Smear' },
    { type: 'byteRepeat',    label: 'Byte Repeat' },
    { type: 'byteReverse',   label: 'Byte Reverse' },
    { type: 'sectorFault',   label: 'Sector Fault' },
    { type: 'packetLoss',    label: 'Packet Loss' },
  ]},
  { group: 'Compression', effects: [
    { type: 'jpegCrush',    label: 'JPEG Crush' },
    { type: 'quantBlast',   label: 'Quantization Blast' },
  ]},
  { group: 'Meta', effects: [
    { type: 'feedback',       label: 'Feedback' },
    { type: 'pixelEcho',      label: 'Pixel Echo' },
    { type: 'selfDiff',       label: 'Self-Diff' },
    { type: 'recursiveCrop',  label: 'Recursive Crop' },
    { type: 'convCorrupt',    label: 'Convolution Corrupt' },
  ]},
];
