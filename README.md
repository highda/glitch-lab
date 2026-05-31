# GLITCH LAB

A browser-based glitch art tool for applying destructive image effects in real-time. No server, no build step — just static files served over HTTP.

## What it does

1. **Load an image** — drag-and-drop or file picker (auto-downscaled to 1200px max dimension)
2. **Stack effects** — add, reorder, enable/disable, and tweak parameters on a chain of pixel-manipulation effects
3. **Live preview** — effects re-render on every parameter change (30ms debounce), or switch to manual render mode
4. **Export** — download the processed result as PNG

## Available effects

### Color
| Effect | Description |
|--------|-------------|
| Channel Displacement | Displaces R/B channels independently |
| Channel Swap | Remaps RGB channels (BRG, GBR, etc.) |
| Posterize | Reduces color levels |
| Threshold Gate | Per-channel binary threshold (below=0, above=255) |
| Chromatic Split | Offsets RGB channels radially from a focal point (chromatic aberration) |
| Edge Glow | Detects edges with Sobel and overlays a colorized neon glow |
| Color Cycle | Rotates hue and shifts saturation/lightness uniformly |

### Geometry
| Effect | Description |
|--------|-------------|
| Pixel Sort | Sorts pixel spans by brightness/hue/saturation |
| Scanlines | Darkens every Nth row |
| Slice Shuffle | Shuffles horizontal image slices |
| Pixel Drift | Sine-wave displacement of rows/columns |
| Echo Shift | Bitwise-blended offset copies (XOR/AND/OR ghosts) |
| Block Scramble | Swaps random tile-grid blocks with nearby tiles (seeded) |
| Mosaic Corrupt | Per-tile random corruption: flip, channel rotate, invert, neighbor copy (seeded) |
| Symmetry Force | Forces mirror symmetry by copying one half or quadrant over the other |
| Kaleidoscope | Mirrors a wedge slice around the center point to create kaleidoscope symmetry |

### Data / Bit
| Effect | Description |
|--------|-------------|
| Bit Shift | Shift, rotate, or XOR bits in color channels |
| Bayer Dither | Ordered dithering with 4x4 Bayer matrix |
| Noise Injection | Adds mono or color noise |
| Overflow Wrap | Adds to bytes with modular wrap instead of clamp |
| XOR Fold | XORs pixels with mirrored/offset counterparts |
| Bit Mask Stencil | Apply user-defined binary mask to channel bytes |
| Value Sort | Sort channel values per-row/column/full image |
| Corrupt Diffusion | Error-diffusion dithering (Floyd-Steinberg/Atkinson/Sierra) with corrupted error propagation, serpentine scanning, error decay/amplification, cross-channel bleed, and row-skip banding |

### Byte / Raw
| Effect | Description |
|--------|-------------|
| Buffer Misalign | Shifts raw byte array, breaking RGBA alignment |
| Stride Corrupt | Reads buffer with wrong image width (diagonal shear) |
| Run-Length Smear | Simulates broken RLE decoder, stretches pixel runs |
| Byte Repeat | Duplicates byte chunks, simulating stuck read head |
| Byte Reverse | Reverses byte order within fixed-size buffer chunks |
| Sector Fault | Simulates bad disk reads — random patches sourced from wrong byte offsets (seeded) |
| Packet Loss | Simulates streaming corruption — row bands drop, shift, repeat, or XOR (seeded) |

### Compression
| Effect | Description |
|--------|-------------|
| JPEG Crush | Re-encodes through JPEG at low quality (iterative) |
| Quantization Blast | Real 8x8 DCT with aggressive quantization and frequency control |

### Meta
| Effect | Description |
|--------|-------------|
| Feedback | Recursive zoom/rotate overlay |
| Pixel Echo | Layers multiple offset/scaled ghost copies with selectable blend modes |
| Self-Diff | Diffs the image against a transformed copy of itself to reveal hidden structure |
| Recursive Crop | Pastes progressively smaller copies of the image into itself (Droste-like) |
| Convolution Corrupt | Applies a broken convolution kernel with asymmetry and directional smearing (seeded) |

## Running

Serve the project root with any static HTTP server:

```bash
# Python
python -m http.server 8000

# Node
npx serve .

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in a browser.

> **Note:** ES modules require HTTP — `file://` won't work due to CORS restrictions.

## Tech stack

- Vanilla HTML/CSS/JS (ES modules, no framework)
- Canvas 2D API for pixel manipulation
- Dynamic `import()` for lazy-loading effect modules
