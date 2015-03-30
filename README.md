# 3DuF
Create molds for microfluidic devices with  your 3D Printer.

## Before you print
---
### Gather materials
You should be able to get everything you need for less than $1,000, and a lot less if you have access to a 3D printer already.

1. FDM 3D Printer -- We use the [Printrbot Simple Metal](http://printrbot.com/product-category/3d-printers/simple-metal/) beacuse it's cheap, hackable, and supports easy nozzle changes. We got ours from [Amazon](http://amzn.com/B00IYC60IM) and modded it with a [heated bed](http://printrbot.com/shop/simple-metal-heated-bed/), an [ATX power supply](http://printrbot.com/shop/atx-power-supply/), and a [.2mm nozzle](http://printrbot.com/shop/tip-6-pack/) to improve bed adhesion and device resolution, respectively.
2. Filament -- We use [Gizmodorks White PLA](http://amzn.com/B00FG7BR22), but any PLA filament should do.
3. Hairspray -- Used to get PLA to stick nicely to the glass slides. We use [Consort](http://amzn.com/B000052Y6I), but any alcohol-based spray will probably do. Water-based hairspray took a long time to evaporate and was less tacky afterwards, but YMMV.
4. 2x3" Glass slides -- We bought [a whole lot of these]( http://amzn.com/B00EP0RUZ4) so we wouldn't have to worry about running out. Anything around that size and 1-1.2mm thick should do.

### Get the software

1. [Python](http://www.python.org/) 2.7 -- For designing chips and placing primitives. 
2. [OpenSCAD](http://www.openscad.org/) -- For rendering designs into 3D geometry. 
3. [Slic3r](http://www.slic3r.org/) -- For slicing 3D models into printer instructions.
4. [Octoprint](http://www.octoprint.org/) -- **Optional**, for running your 3D printer. Install it on a Raspberry Pi and experience the joy of browser-based printing!
5. Clone this repo onto your computer.

## Fabrication Process
---
### Preparing a mold for printing

1. Create a device design in Python by using one of the provided files (such as hello_device.py) as an example. Running the script from the src directory will generate separate OpenSCAD files for the layers in your device.
2. Open the OpenSCAD files in the directory where they were generated. Hit F5 to render a preview, then F6 to create a printable model. Labels are very slow to render due to how OpenSCAD handles Minkowski sums, so if you're waiting a long time, consider removing them.
3. After the model is rendered (it will change color in the preview window), use File -> Export -> Export as STL... to save it. You'll want to do this for each layer of the device, but not the MOCKUP.
4. Open the .stl file for each layer model in Slic3r and generate G-code instructions for your printer. You can print multiple layers at once by dropping in multiple STL files and arranging them to fit. Save the G-code instructions somewhere you can find them.
5. **Temporary** -- Manually insert a PAUSE command into the G-code after the holder has printed so that you have time to place and prepare the glass slides. The pause sequence should look something like this:
   ```
G1 Z1.300 F3000.000 ; move to next layer (11)
G1 E3.33423 F4800.00000 ; retract
G92 E0 ; reset extrusion distance
G1 Z1.500 F3000.000 ; lift Z -- Pause sequence starts at the next line!
G1 X0 Y150 Z20 F3000;                     MODIFIED -- lift the head and move it away from the slide holder
M0;                                       MODIFIED -- pause the print so that slides can be placed
G1 Z1.500 F6000.000;                      MODIFIED -- move the head back into place. Pause sequence ends!
G1 X77.080 Y108.827 F3000.000 ; move to first perimeter point
   ```

   You will want to insert it after the last holder layer, which will depend on your print settings and slide size. For example, if your slides are 1 mm tall, and you are printing in .1mm layers, you'll want to insert the pause after the 10th layer, which you can find by searching the G-code for "move to next layer (11)". You may need to adjust the Z-height to avoid hitting the slide with the nozzle.  

   We're working on making this part easier by looking into automatic G-code post-processing! Hang tight.

### Printing a mold
1. Send your modified G-code file to your printer, either using Octoprint or by transferring it to an SD card.
2. Begin your print. Keep in mind that the heated bed will take some time to come to temperature. This can be avoided by manually setting the desired temperature between prints.
3. Once the slide holder has finished printing, the print should pause, and the head will move out of the way. Insert a glass slide into the holder and press it firmly into place. The top of the slide should be flush with the rim of the slide holder, to avoid colliding with the nozzle.
4. Using a piece of paper to protect the rest of the printer, spray the top of the slide with hairspray. You will want it thoroughly coated, to the point that the surface is relatively even. 
5. Give the hairspray time to evaporate. This should be quick if you're using a heated bed and alcohol-based spray, maybe a minute or two.
6. Resume the print once the slide has dried -- this will be tricky if you're not using a host software application like Octoprint! The filament should stick well to the surface of the glass slide, without coming loose or being squished up against the surface by the nozzle.
7. Once the print finishes, remove the slide and holder -- you may need to scrape it off using a razor blade or other thin tool, depending on how well it is stuck to the bed.
8. Assemble the layers of your mold. You may need to add standoff features to the corners to ensure that the glass slides are held the proper distance from one another. 
9. You're ready for PDMS casting! Stay tuned, we're working on this process and we'll be writing up a guide soon.

---

### Tips and tweaking
* Nozzle size makes a big difference in minimum mold resolution. With our .2mm nozzle, we are able to reliably print .2mm wide channels at .1mm (one layer) tall, which approaches the theoretical limits of the printer and slicing software.
* As shown in transposer_LARGE.py, you can modify the default sizes for device features in Python. Ideally, primitives should be tuned to the limitations of the printer -- if you have a .2mm nozzle, you probably want channels whose width is a multiple of .2mm. Similarly, the Z-distance between the layers should be a multiple of the layer height you're using in Slic3r.
* Device-agnostic settings such as the size and shape of the slide holder can be configured in the UF_Generator.scad file. If your slides don't fit in your holder, or are taller or shorter than the holder, try modifying the constants at the beginning of the file. Keep in mind that the slide height should remain a multiple of your chosen layer height.
* Dialing in your settings reliable prints can be tough. If you're having trouble getting filament to stick to the glass slides, try increasing the temperature (bed and extruder), re-calibrating your z-axis, leveling your print bed, or using more/less/different hairspray.
* A set of example Slic3r settings has been included in this repository, which can be loaded into Slic3r using File -> Load Config... These work well with our Printrbot Simple Metal, but you'll probably have to tweak and play with your settings for the best results!

### Disclaimer

This is an active research project, and as such, this codebase could (and should) change dramatically as the code matures and new features are implemented. The master branch should always be functional, but we make no guarantee of backwards-compatability with previous versions. Expect bugs, excessive re-factoring, and cheeky commit messages.

###Questions?

Please email Aaron at awh@bu.edu with any questions, comments, complaints, or pictures of printed molds.
