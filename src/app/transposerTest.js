// Run: watchify transposerTest.js -t babelify -v --outfile "../../demos/transposer/transposerAppDemo.js

var uFab = require('./3DuFCore');
var handlers = require('./handlers');
var featureLoader = require('./featureLoader');
var uFabCanvas = require('./fabricFunctions').uFabCanvas;
var Transposer = require('./transposerModule').Transposer;

document.getElementById('c').width = document.getElementById('canvas_block').clientWidth;
document.getElementById('c').height = document.getElementById('canvas_block').clientHeight;
var canvas = new uFabCanvas('c');

var Device = uFab.Device;
var Layer = uFab.Layer;

var dev = new Device({
    width: 75.8,
    height: 51,
    ID: "test_device"
});
var flow = new Layer({
    z_offset: 0,
    color: "blue",
    ID: "flow"
});
var control = new Layer({
    z_offset: 1.4,
    color: "red",
    ID: "control"
});

var featureDefaults = {
    Channel: {
        height: .2,
        width: .21
    },
    PneumaticChannel: {
        height: .4,
        width: .4
    },
    Via: {
        height: 1,
        radius1: .8,
        radius2: .7
    },
    CircleValve: {
        height: .9,
        radius1: 1.4,
        radius2: 1.2,
    },
    Port: {
        height: .4,
        radius: .7
    }
}

var transposerParams = {
    position: [dev.width / 2, dev.height],
    buffer: .5,
    flowLayer: flow,
    controlLayer: control
}

var transposerParams2 = {
    position: [dev.width / 2 - 20, dev.height],
    buffer: .5,
    flowLayer: flow,
    controlLayer: control
}

dev.addLayer(flow);
dev.addLayer(control);

var updateParam = function(list, parent, child, value) {
    list[parent][child] = Number(value);
    trans.refresh();
    trans2.refresh();
    dev.render2D();
}

featureLoader.loadDefaultFeatures();

var trans = new Transposer(featureDefaults, transposerParams);
var trans2 = new Transposer(featureDefaults, transposerParams2);


canvas.setDevice(dev);

var makeSliders = function(params, linker) {
    for (var param in params) {
        /* Make a container and label for each feature. */
        var container = $("<div></div>").addClass("param-slider-container");
        var string = "<h5>" + param + "</h5>";
        var label = $(string);
        label.appendTo(container);
        container.appendTo("#param-controls");

        /* For each parameter within each feature, generate a slider
        with some default parameters and attach it to the parent container. */


        for (var subparam in params[param]) {
            if (subparam != "height" && subparam != "radius2") { //ignore these subparams
                var subContainer = $("<div></div>").addClass("param-slider-subcontainer");
                var subString = "<h6>" + subparam + "<h6>";
                var subLabel = $(subString);
                var subSliderID = param + subparam;
                var subSlider = $("<div></div>");
                subSlider.attr('id', subSliderID);
                subLabel.appendTo(subContainer);
                subSlider.appendTo(subContainer);
                subContainer.appendTo(container);

                /* Grab the HTML element by the unique subSliderID */

                var slider = document.getElementById(subSliderID);

                /* Initialize the slider */

                noUiSlider.create(slider, {
                    start: .4,
                    range: {
                        'min': 0,
                        'max': 2
                    }
                });
                linker[subSliderID] = {
                    params: params,
                    parent: param,
                    child: subparam
                }

                /* Event handlers attempt to reference each slider 
                by its unique ID, but all point to the same variable,
                which is overwritten by the end of the loop.*/

                slider.noUiSlider.on('slide', function() {
                    var thisThing = document.getElementById(subSliderID);
                    var link = linker[thisThing.id];
                    updateParam(params, link.parent, link.child, thisThing.noUiSlider.get());
                });
                slider.noUiSlider.on('change', function() {
                    var thisThing = document.getElementById(subSliderID);
                    var link = linker[thisThing.id];
                    updateParam(params, link.parent, link.child, thisThing.noUiSlider.get());
                });
            }
        }
    }
}

//$("<input id='test'/>").appendTo("#param-controls");

var links = {};

makeSliders(featureDefaults, links);


dev.render2D();