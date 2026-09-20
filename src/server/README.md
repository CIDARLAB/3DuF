# Primitives Server

HTTP service that exposes the 3DuF parametric component library so external
tools (e.g. Neptune, ParchMint importers, downstream CAD flows) can query
component geometry, port locations, and default parameters without embedding
the full 3DuF renderer.

## Running

```
# from the repo root
npm ci
cd src/server
npm ci
npm run dev            # nodemon + ts-node on port 6060
```

Or via Docker (uses `primitives-server.Dockerfile` at the repo root):

```
docker build -f primitives-server.Dockerfile -t primitives-server:latest .
docker run -p 6060:6060 primitives-server
```

## API

| Method | Path          | Query                                        | Response                                                                 |
| ------ | ------------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| GET    | `/`           | —                                            | `{ "message": "Welcome to the Component API" }`                          |
| GET    | `/components` | —                                            | `string[]` — unique MINT types in the library                            |
| GET    | `/defaults`   | `mint`                                       | `object` — the primitive's `__defaults` block                            |
| GET    | `/dimensions` | `mint`, `params` (URL-encoded JSON)          | `{ "x-span": number, "y-span": number }`                                 |
| GET    | `/terminals`  | `mint`, `params` (URL-encoded JSON)          | `ComponentPort[]` in ParchMint interchange format                        |

Notes:

- `params` must be a JSON object, URL-encoded. The server injects
  `position = [0, 0]` and a placeholder `color`; `rotation` defaults to 0 for
  `/dimensions`.
- Unknown MINT strings return HTTP 400 with `{ message: "MINT Not found - ..." }`.

### MINT alias normalization

`ComponentAPI.normalizeMint()` accepts any case, folds underscores and repeated
whitespace, and applies these aliases before lookup:

| Input                                        | Canonical MINT       |
| -------------------------------------------- | -------------------- |
| `IN MUX`, `OUT MUX`, `INPUT MUX`, `OUTPUT MUX`, `HORIZONTAL MUX`, `VERTICAL MUX` | `MUX`                |
| `LONG CELL TRAPPER`                          | `LONG CELL TRAP`     |
| `CELL TRAP` / `CELL TRAPPER` with `numberOfChambers` / `feedingChannelWidth` / `chamberSpacing` in `params` | `LONG CELL TRAP`     |
| `CELL TRAP` / `CELL TRAPPER` otherwise       | `SQUARE CELL TRAP`   |

## Component library notes

- **New primitives**
  - `BLACK BOX` — rectangular placeholder with configurable footprint / corner radius.
  - `DROPLET MERGER JUNCTION` — passive 3-port T-junction with tunable `channelWidth`, `outputWidth`, and `stabilizationLength`.
- **`PORT`** emits four side terminals (top / right / bottom / left) that follow the MINT pad-side convention `1=top, 2=right, 3=bottom, 4=left`.
- **Mirror parameters.** Most primitives expose `mirrorByX` and `mirrorByY` (0 or 1) to flip the rendered glyph along either axis.
- **`componentSpacing`** defaults to `2000` μm across most primitives (was `1000`).
- **Channel height.** `CHANNEL` / `ROUNDED CHANNEL` default `height` bumped from `250` to `600` μm.
- **Mixer defaults & ports.** `MIXER` (BetterMixer), `CURVED MIXER`, and `MIXER3D` now default to `channelWidth = 600`, `bendSpacing = 1400`, `bendLength = 2000` μm, and their two terminals sit on the channel centerline (offset by `channelWidth / 2` from the outer edge of the first / last opening) so downstream routers can dock connections without an extra half-width offset.
- **Parameter renames (with legacy fallback).** Old device files still load.
  - `Tree`, `YTree`: `spacing` → `leafSpace`, `stageLength` → `stageSpace`.
  - `Mux`: `leafPitch` → `leafSpace`, `stageLength` → `stageSpace`, `valveWidth` + `length` → `valveWidthX` + `valveWidthY`.
- **ParchMint import.** `LoadUtils.featurePositionFromParchmint()` re-centers
  center-origin glyphs (`PORT`, `VALVE3D`, `VALVE`, `CIRCLE VALVE`) whose
  ParchMint `position` is the AABB top-left, so features drop in at the
  glyph's own coordinate origin.

## `component_defaults.json`

`src/scripts/component_defaults.json` is a flat snapshot of every primitive's
`__defaults` (keyed by MINT). Regenerate whenever a primitive's defaults
change:

```
node src/scripts/extractDefaults.js
```

The script scans `src/app/library/*.ts`, evaluates numeric expressions in
each `__defaults` block, and writes the JSON in-place.

## Library-only sparse checkout

If you only need `src/app/library/` (e.g. for embedding elsewhere) you can
sparse-checkout the tree:

```
git clone \
  --depth 1  \
  --filter=blob:none  \
  --sparse \
  https://github.com/CIDARLAB/3DuF \
  library
cd library
git sparse-checkout set src/app/library
```
