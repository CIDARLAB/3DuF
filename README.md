<img src="http://3duf.org/img/logo.png" width="500" />

An Interactive Design Tool for Continuous Flow Microfluidic Devices - [3DuF.org](http://3duf.org)

## Status

[![Netlify Status](https://api.netlify.com/api/v1/badges/01675390-381f-45a9-88b1-a6f8db0fecbc/deploy-status)](https://app.netlify.com/sites/wonderful-blackwell-a043b5/deploys)

## About

The design of microfluidic Lab on a Chip (LoC) systems is an onerous task requiring specialized skills in fluid dynamics, mechanical design drafting, and manufacturing. Engineers face significant challenges during the labor-intensive process of designing microfluidic devices, with very few specialized tools that help automate the process. Typical design iterations require the engineer to research the architecture, manually draft the device layout, optimize for manufacturing processes and manually calculate and program the valve sequences that operate the microfluidic device. The problem compounds when the devices are intended for executing biological assays where engineers not only have to test the functionality of the chip but are also required to optimize them for robust performance. In this paper, we present an interactive tool for designing continuous flow microfluidic devices. 3DuF is the first completely open-source interactive microfluidic system designer that readily supports state-of-the-art design automation algorithms. Through various case studies, we show 3DuF can be used to reproduce designs from literature, provide metrics for evaluating microfluidic design complexity and showcase how 3DuF is a platform for integrating a wide assortment of engineering techniques used in the design of microfluidic devices as a part of the standard design work-flow.

## Academic Publications

> Sanka, Radhakrishna, Joshua Lippai, Dinithi Samarasekera, Sarah Nemsick, and Douglas Densmore. “3DμF - Interactive Design Environment for Continuous Flow Microfluidic Devices.” Scientific Reports 9, no. 1 (December 2019).

[https://doi.org/10.1038/s41598-019-45623-z](https://doi.org/10.1038/s41598-019-45623-z)

## Usage

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

### Saving Designs

Under `Save` in the main menu, click a to download the current design in the selected format.

### Loading Designs

After saving a device design to JSON, drag and drop it from your computer onto the device canvas to load it.

## Component Library

<img src="/doc/mint-primitives.png" width="800" />


## Primitives Server

As 3DuF continues to become a core component of the Microfluidics CAD Ecossytem, we have incorporated the ability to generate component dimensions, port locations, default dimensions for all the parametrically generated components supported by 3DuF.

The instructions for starting this server are as follows:
```
docker build -f primitives-server.Dockerfile -t primitives-server:latest .
docker run -p 6060:6060 primitives-server
```

This will enable the API on port 6060. This can be verified by either going to `http://localhost:6060` or by running the following command:

```
curl http://localhost:6060
```


## Attributions

Error Logging and Tracking enabled by [TrackJS](https://trackjs.com/)

## License

BSD 2-Clause License

Copyright (c) 2019, CIDAR LAB
All rights reserved.

See [LICENSE](/LICENSE) for more information.
