// Shared application state — imported by all modules that need it.

export const state = {
  sourceImage: null,   // { width, height } or null
  sourceData: null,    // Uint8ClampedArray of original pixel data
  effectStack: [],     // [{ id, type, params, enabled, collapsed }]
  liveMode: true,
  renderPending: false,
  rendering: false,
  uid: 0,
  renderTimer: null,

  // Zoom & pan
  zoom: 1,
  panX: 0,
  panY: 0,
};

/** Generate a unique id for effect instances. */
export function nextId() {
  return ++state.uid;
}
