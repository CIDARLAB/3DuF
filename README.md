<img src="http://3duf.org/img/logo.png" width="500" />

An Interactive Design Tool for Continuous Flow Microfluidic Devices - [3DuF.org](http://3duf.org)

## Status

[![Netlify Status](https://api.netlify.com/api/v1/badges/01675390-381f-45a9-88b1-a6f8db0fecbc/deploy-status)](https://app.netlify.com/sites/wonderful-blackwell-a043b5/deploys)

## About

The design of microfluidic Lab on a Chip (LoC) systems is an onerous task requiring specialized skills in fluid dynamics, mechanical design drafting, and manufacturing. Engineers face significant challenges during the labor-intensive process of designing microfluidic devices, with very few specialized tools that help automate the process. Typical design iterations require the engineer to research the architecture, manually draft the device layout, optimize for manufacturing processes and manually calculate and program the valve sequences that operate the microfluidic device. The problem compounds when the devices are intended for executing biological assays where engineers not only have to test the functionality of the chip but are also required to optimize them for robust performance. In this paper, we present an interactive tool for designing continuous flow microfluidic devices. 3DuF is the first completely open-source interactive microfluidic system designer that readily supports state-of-the-art design automation algorithms. Through various case studies, we show 3DuF can be used to reproduce designs from literature, provide metrics for evaluating microfluidic design complexity and showcase how 3DuF is a platform for integrating a wide assortment of engineering techniques used in the design of microfluidic devices as a part of the standard design work-flow.

## Academic Publications

> Sanka, Radhakrishna, Joshua Lippai, Dinithi Samarasekera, Sarah Nemsick, and Douglas Densmore. "3DμF - Interactive Design Environment for Continuous Flow Microfluidic Devices." Scientific Reports 9, no. 1 (December 2019).

[https://doi.org/10.1038/s41598-019-45623-z](https://doi.org/10.1038/s41598-019-45623-z)

## Recent Updates (`Neptune_Render` / v1.2)

Summary of the 2026 maintenance work on this branch:

### Import, export, and manufacturing
- Single **Import** dialog for JSON and DXF (drop zone or file picker).
- **Export** panel: JSON · 3DuF, DXF, SVG, and flow-feature GCode; multilayer biochips export per-layer DXF/SVG instead of GCode.
- Each export downloads as a zip with a matching **ports-only** file for cover-layer fabrication.
- **ALL / PORTS** canvas toggle above Export previews only flow (blue) and control (red) ports.
- DXF round-trip keeps device border and channel wall widths aligned with the canvas.

### Layout and geometry
- Component `position` is the geometric / rotation center; PORT, VIA, NODE, and VALVE draw at that center.
- Default sizes: port radius **1 mm**; channel / connection / valve-gap width **600 µm**.
- Mixer serpentine ends expose **edgeBend1** / **edgeBend2** so each incomplete end can match the connecting channel width.
- Square channel joints fill 90° corners; VALVE3D FLOW gaps are clipped geometrically on import.
- PORT draws a single connection handle at the geometric center (like VIA). VALVE library ports use center-relative cardinals (1–4) for MINT / Fluigi connectivity.
- NODE is a zero-radius junction: its center terminal is used for snapping only and does **not** draw a grey port marker on Y-junctions.
- MUX tree width is controlled by **leafPitch** (center-to-center pitch of adjacent leaf channels). Valve pads use **width** across the flow channel and **length** along it; older JSON that still stores `spacing` continues to load.
- New droplet primitive: **DROPLET MERGER JUNCTION** (3-port T-junction).

### Neptune / Parchmint interoperability
- `DIYCOMPONENT` loads as a built-in black-box placeholder.
- MINT aliases normalize on load (for example `IN MUX` → `MUX`, `CELL TRAP` → long or square cell trap from params).
- FLOW and CONTROL from Parchmint open on the **same physical level**.
- Older JSON is filled with missing library defaults; broken valve maps are skipped instead of aborting load.
- Neptune bridge: announce `threeduf-ready`, prefer Parchmint device spans, clear canvas fully on reload, and ack with `threeduf-device-loaded`.

### UI
- Settings panels show a selectable netlist **ID** for matching objects back to Parchmint / Neptune JSON.
- Floating settings panels drag from the heading bar only so parameter text stays selectable.
- Parameter units (µm, °, …) render beside the value field instead of as a crowded text-field suffix.

## Usage

### Local Development

Prerequisites:
- Node.js 16+
- npm

Run with CLI on the current branch (`Neptune_Render`):
```
git clone git@github.com:CIDARLAB/3DuF.git
cd 3DuF
git switch Neptune_Render
```

Use the command that matches your situation:

- First-time setup (or when dependencies are missing):
  ```
  npm run start3duf
  ```
  This command checks required packages, installs missing dependencies, and starts the dev server.
  If you prefer a single command workflow, you can always use `npm run start3duf` for both first-time and daily development.

- Daily development (fast start):
  ```
  npm run vue-serve
  ```
  Use this when dependencies are already installed.

- Clean reinstall from lockfile:
  ```
  npm ci
  npm run vue-serve
  ```
  Run `npm ci` directly in the terminal (not inside an `npm run` script).

Then open the URL printed by Vue CLI (typically `http://localhost:8082`).

Note: when running `npm run vue-serve`, Vue CLI may print:
`Note that the development build is not optimized. To create a production build, run npm run build.`
This is expected in development mode.

For production builds in this repository:
- Use `npm run build` (recommended). This runs the Vue CLI production build.
- Use `npm run vue-build` if you prefer the explicit Vue CLI command.

### Design Environment

<img src="/doc/ui.png" width="800" />

### Keyboard Shortcuts

-   Pan Canvas: `middle mouse button` and `arrow` keys
-   Reset Canvas View: `F` key
-   Activate Select Tool/ Deselect Selected Components: `Esc`
-   Activate Component Copy Mode: `ctrl+C` -\> `ctrl+V`
-   Undo Last Edit: `ctrl+Z`
-   Select All: `ctrl+A`
-   Save JSON file: ` ctrl+ S`

### Installation and Debugging

[Instructions for installation, build, and test are in the wiki.](https://github.com/CIDARLAB/3DuF/wiki/Building-and-Testing-3DuF)

### Selecting and Configuring Feature Types

Use the buttons in the menu (on the left) to select a feature type to place.
The gear-shaped button will bring up a menu that will allow you to adjust the parameters for that feature type.

Click on a layer to select it. This will cause new features to be placed only into that layer. The currently-selected layer's color will be reflected in the button color of any selected feature.

### Placing Features

Left click on the device canvas (on the right) to place a feature. Some features (such as Channels and Chambers) are determined by two points, and are placed by clicking and dragging.

Right click on a feature to select it. Right click and drag to select multiple features at once.

If a layer has been selected, only features on that layer can be selected this way.

### Editing Features

Left click on any selected feature to bring up a dialog box which will allow you to edit its parameters. If more than one feature is selected, parameters will be inherited by all currently selected features of the same type as the one you clicked.

Canvas settings panels also show the imported **netlist ID** for the selected component or connection, so you can match objects back to a Parchmint / Neptune JSON file.

Default sizes used when placing new features:
- Port radius: **1 mm**
- Channel / connection / valve-gap width: **600 µm**

Mixer serpentine ends expose **edgeBend1** / **edgeBend2** (distance from each port to the outer end of that incomplete bend). Set each value to half the connecting channel width so the mixer end and the pipe share the same width.

MUX trees expose **leafPitch** (adjacent leaf center-to-center pitch). Valve pad **width** is across the vertical flow channel; **length** is thickness along it.

### Cover Layer (All / Ports)

Fabricated chips need a closed cover so fluid can flow inside channels instead of open grooves. Above the Export buttons, use the **ALL / PORTS** toggle (same interaction pattern as FLOW / CTRL):

- **PORTS** keeps only the current flow (blue) and control (red) port circles and hides every other component and connection, so you can preview the cover layer.
- **ALL** restores the full design.

### Saving and Exporting Designs

Use the sidebar **Export** section (not a separate Save menu) to download the current design:

- **JSON · 3DuF** — default interchange format. Reopen and share designs in 3DuF.
- **DXF** — CAD sketch for AutoCAD, Fusion 360, and other CAD / CAM tools. Multilayer biochips export one DXF per layer.
- **SVG** — vector graphics for documentation, illustrations, and laser-cutting prep.
- **GCode** — CNC / router programs for flow-layer geometry. Not available for multilayer biochips (export each layer as DXF or SVG instead).

Each format downloads as a zip that includes the full design and a matching **ports-only** file for cover-layer fabrication.

You can also save JSON with `ctrl+S`.

### Loading Designs

Use **Import** (drop zone or file picker, then Confirm) to load a 3DuF JSON or DXF file. You can also drag and drop a saved JSON onto the device canvas.

For DXF workflows:
- Use `Edit Border` to import a DXF border/outline into the current design canvas.
- The main design interchange format for full-device load/save remains 3DuF JSON.

Neptune / Parchmint interoperability notes:
- Neptune LFR user-designed parts (`DIYCOMPONENT`) load as built-in black-box placeholders, so they remain visible without a custom library entry.
- Component `position` is stored as the geometric / rotation center. PORT, VIA, NODE, and VALVE glyphs draw at that center.
- PORT exposes one center connection handle. VALVE still has four center-relative cardinals (1 top, 2 right, 3 bottom, 4 left) for channel attachment.
- NODE junction terminals are snapping aids only (no grey port dots on canvas); MINT side labels 1–4 are compiled in Fluigi, not drawn in 3DuF.
- MINT entity aliases such as `IN MUX` / `OUT MUX` and `CELL TRAP` / `CELL TRAPPER` are normalized on load.
- FLOW and CONTROL layers from Parchmint open on the **same physical level** in the layer toolbar (not as separate levels).
- Older JSON is filled with missing library defaults so newly added parameters still appear in settings.
- Broken valve maps are skipped instead of aborting the whole load; failed Neptune `postMessage` loads show an alert with the error.
- Neptune can wait for `threeduf-ready`, then posts JSON; after a successful load 3DuF replies with `threeduf-device-loaded`.

## Component Library

<img src="/doc/mint-primitives.png" width="800" />


## Primitives Server

As 3DuF continues to become a core component of the Microfluidics CAD Ecosystem, we have incorporated the ability to generate component dimensions, port locations, and default dimensions for all parametrically generated components supported by 3DuF.

The instructions for starting this server are as follows:
```
docker build -f primitives-server.Dockerfile -t primitives-server:latest .
docker run -p 6060:6060 primitives-server
```

This will enable the API on port 6060. This can be verified by either going to `http://localhost:6060` or by running the following command:

```
curl http://localhost:6060
```

Alternatively you can install the dev version of the library if you want to debug it locally. (Primitives Server)

```
npm ci
cd src/server
npm ci
npm run dev
```

## Attributions

Error Logging and Tracking enabled by [TrackJS](https://trackjs.com/)

## Contributors and Maintenance

This branch was maintained and updated with new features in 2026 by Yangruirui (Ron) Zhou and Eric Xie.

Server deployment for this 2026 maintenance/update cycle was completed by Woo Zhong Han.

## License

BSD 2-Clause License

Copyright (c) 2026, CIDAR LAB
All rights reserved.

See [LICENSE](/LICENSE) for more information.
