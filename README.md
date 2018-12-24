![3DuF Logo](http://3duf.org/img/logo.png)

An Interactive Design Tool for Continuous Flow Microfluidic Devices

## Try it out

[3DuF.org](http://3duf.org)



## Usage

### 2D Navigation

Hold the middle mouse button to pan. Scroll the middle mouse to zoom. 

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

Under ```Save``` in the main menu, click a to download the current design in the selected format. 

### Loading Designs

After saving a device design to JSON, drag and drop it from your computer onto the device canvas to load it.

## Development Setup

[Instructions for installation, build, and test are in the wiki.](https://github.com/CIDARLAB/3DuF/wiki/Building-and-Testing-3DuF)

### License

BSD 2-Clause License

Copyright (c) 2017, CIDAR LAB
All rights reserved.

See [LICENSE](/LICENSE) for more information.

