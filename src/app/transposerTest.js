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

var getSetterFunction = function(params, linker, id){
    var setterFunction = function(){
        let link = linker[id];
        updateParam(params, link.parent, link.child, document.getElementById(id).get());
    }
    return setterFunction;
}

var makeSliders = function(params, linker) {
    for (let param in params) {
        /* Make a container and label for each feature. */
        let container = $("<div></div>").addClass("param-slider-container");
        let string = "<h5>" + param + "</h5>";
        let label = $(string);
        label.appendTo(container);
        container.appendTo("#param-controls");

        /* For each parameter within each feature, generate a slider
        with some default parameters and attach it to the parent container. */


        for (let subparam in params[param]) {
            if (subparam != "height" && subparam != "radius2") { //ignore these subparams
                let subContainer = $("<div></div>").addClass("param-slider-subcontainer");
                let subString = "<h6>" + subparam + "<h6>";
                let subLabel = $(subString);
                let subSliderID = param + subparam;
                let subSlider = $("<div></div>");
                subSlider.attr('id', subSliderID);
                subLabel.appendTo(subContainer);
                subSlider.appendTo(subContainer);
                subContainer.appendTo(container);

                /* Grab the HTML element by the unique subSliderID */

                let slider = document.getElementById(subSliderID);

                /* Initialize the slider */

                noUiSlider.create(slider, {
                    start: params[param][subparam],
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

                //slider.noUiSlider.on('slide', getSetterFunction(params, linker, subSliderID));
                //slider.noUiSlider.on('change', getSetterFunction(params, linker, subSliderID));

                let updateFromSliderValue = function(){

                };

                slider.noUiSlider.on('change',function(){
                    let thisThing = document.getElementById(subSliderID);
                    let link = linker[thisThing.id];
                    updateParam(params, link.parent, link.child, thisThing.noUiSlider.get());
                });

                slider.noUiSlider.on('slide', function(){
                    let thisThing = document.getElementById(subSliderID);
                    let link = linker[thisThing.id];
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