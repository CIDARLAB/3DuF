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

- **`height` → `depth`.** Feature Z-thickness is named `depth` everywhere in
  `__defaults` / `__heritable` / `__zOffsetKeys` / JSON examples. Connection
  loaders in `LoadUtils` still accept legacy `height` and rewrite it to
  `depth` (preferring an existing `depth` when both are present).
- **Shared channel widths** (`src/app/library/channelWidths.ts`).
  `DEFAULT_CHANNEL_WIDTH_UM = 600` feeds Channel / Connection / RoundedChannel /
  Tree / YTree / Mux flow defaults; mixer bend defaults and
  `mixerEndLayout()` / `edgeBend1` / `edgeBend2` helpers live here too.
  `extractDefaults.js` resolves these `DEFAULT_*` constants when regenerating
  `component_defaults.json`.
- **Mixer end stubs.** `MIXER` / `CURVED MIXER` / `MIXER3D` expose
  `edgeBend1` / `edgeBend2` (default `channelWidth / 2`) — outward stubs past
  each port along the incomplete bend. Ports stay on the serpentine
  centerline via `mixerEndLayout()`; edge bends never move the ports.
- **MUX3D layout params.** Renamed to align with Mux / Tree:
  `channelWidth` → `flowChannelWidth`, `gap` → `valveGap`, plus
  `leafSpace` and `outletLength` (legacy `stageSpace` maps to
  `N * stageSpace`). Valve rows use the same 0.3 / 0.7 stage offsets as Mux.
- **VALVE3D.** Dropped unused `width` / `length`; keep `valveRadius`, `gap`,
  `depth`, `rotation`.
- **Tree / YTree.** Dropped unused `width`; `flowChannelWidth` defaults to
  `DEFAULT_CHANNEL_WIDTH_UM`.
- **NODE.** Same-layer channel junction: tiny disc (`radius` default 10 µm)
  with a single centre FLOW terminal `"1"`.
- **New primitives**
  - `BLACK BOX` — rectangular placeholder with configurable footprint / corner radius.
  - `DROPLET MERGER JUNCTION` — passive 3-port T-junction with tunable `channelWidth`, `outputWidth`, and `stabilizationLength`.
- **`PORT`** emits four side terminals (top / right / bottom / left) that follow the MINT pad-side convention `1=top, 2=right, 3=bottom, 4=left`.
- **Mirror parameters.** Most primitives expose `mirrorByX` and `mirrorByY` (0 or 1) to flip the rendered glyph along either axis.
- **`componentSpacing`** defaults to `2000` μm across most primitives (was `1000`).
- **Channel depth.** `CHANNEL` / `ROUNDED CHANNEL` default `depth` is `600` μm.
- **YTree ports.** Inlet / leaf terminals sit at the stadium-cap centers so RoundedChannel ends overlap the port circle cleanly.
- **Parameter renames (with legacy fallback).** Old device files still load.
  - `Tree`, `YTree`: `spacing` → `leafSpace`, `stageLength` → `stageSpace`.
  - `Mux`: `leafPitch` → `leafSpace`, `stageLength` → `stageSpace`, `valveWidth` + `length` → `valveWidthX` + `valveWidthY`.
  - `MUX3D`: `channelWidth` → `flowChannelWidth`, `gap` → `valveGap`; `stageSpace` → `outletLength` via `N * stageSpace`.
  - Feature Z: `height` → `depth` (connections migrate on load).
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

The script scans `src/app/library/*.ts`, resolves `DEFAULT_*` constants from
`channelWidths.ts`, evaluates numeric expressions in each `__defaults`
block, and writes the JSON in-place.

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
