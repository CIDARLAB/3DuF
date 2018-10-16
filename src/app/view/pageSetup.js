import {setButtonColor} from "../utils/htmlUtils";
import paper from 'paper';
import ManufacturingLayer from "../manufacturing/manufacturingLayer";


var HTMLUtils = require("../utils/htmlUtils");
var Registry = require("../core/registry");
var Colors = require("./colors");
var JSZip = require("jszip");
var InsertTextTool = require("./tools/insertTextTool");

let activeButton = null;
let activeLayer = null;

let revertdefaultsButton = document.getElementById("revertdefaults_button");


let jsonButton = document.getElementById("json_button");
let interchangeV1Button = document.getElementById("interchange_button");
let svgButton = document.getElementById("svg_button");

//let stlButton = document.getElementById("stl_button");

let button2D = document.getElementById("button_2D");
//let button3D = document.getElementById("button_3D");

// let cellsButton = document.getElementById("cells_button");

let inactiveBackground = Colors.GREY_200;
let inactiveText = Colors.BLACK;
let activeText = Colors.WHITE;

let canvas = document.getElementById("c");

let canvasBlock = document.getElementById("canvas_block");
let renderBlock = document.getElementById("renderContainer");

let renderer;
let view;

let threeD = false;


let acceptTextButton = document.getElementById("accept_text_button");

// let layerButtons = {
//     "0": flowButton,
//     "1": controlButton,
//     "2": cellsButton
// };

let layerIndices = {
    "0": 0,
    "1": 1,
    "2": 2
};

let zipper = new JSZip();

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
}



function switchTo3D() {
    if (!threeD) {
        threeD = true;
        setButtonColor(button3D, Colors.getDefaultLayerColor(Registry.currentLayer), activeText);
        setButtonColor(button2D, inactiveBackground, inactiveText);
        renderer.loadJSON(Registry.currentDevice.toJSON());
        let cameraCenter = view.getViewCenterInMillimeters();
        let height = Registry.currentDevice.params.getValue("height") / 1000;
        let pixels = view.getDeviceHeightInPixels();
        renderer.setupCamera(cameraCenter[0], cameraCenter[1], height, pixels, paper.view.zoom);
        renderer.showMockup();
        HTMLUtils.removeClass(renderBlock, "hidden-block");
        HTMLUtils.addClass(canvasBlock, "hidden-block");
        HTMLUtils.addClass(renderBlock, "shown-block");
        HTMLUtils.removeClass(canvasBlock, "shown-block");
    }
}


//TODO: transition backwards is super hacky. Fix it!


function setupAppPage() {
    view = Registry.viewManager.view;
    renderer = Registry.threeRenderer;

    //Register all the button clicks here




    acceptTextButton.onclick = function(){
        Registry.viewManager.activateTool("InsertTextTool");
        Registry.text = document.getElementById("inserttext_textinput").value;
        let textLabelDialog = document.getElementById('insert_text_dialog');
        textLabelDialog.close();
    };


    // revertdefaultsButton.onclick = function() {
    //     Registry.viewManager.revertFeaturesToDefaults(Registry.viewManager.view.getSelectedFeatures());
    //
    // };

    interchangeV1Button.onclick = function() {
        let json = new Blob([JSON.stringify(Registry.currentDevice.toInterchangeV1())], {
            type: "application/json"
        });
        saveAs(json, "device.json");
    };

    /*
        stlButton.onclick = function() {
            let json = Registry.currentDevice.toJSON();
            let stls = renderer.getSTL(json);
            let blobs = [];
            let zipper = new JSZip();
            for (let i = 0; i < stls.length; i++) {
                let name = "" + i + "_" + json.name + "_" + json.layers[i].name + ".stl";
                zipper.file(name, stls[i]);
            }
            let content = zipper.generate({
                type: "blob"
            });
            saveAs(content, json.name + "_layers.zip");
        }
    */

    svgButton.onclick = function() {
        let svgs = Registry.viewManager.layersToSVGStrings();
        for(let i = 0; i<svgs.length; i++){
            svgs[i] = ManufacturingLayer.generateSVGTextPrepend(Registry.currentDevice.getXSpan(), Registry.currentDevice.getYSpan())
                + svgs[i] + ManufacturingLayer.generateSVGTextAppend();
        }
        //let svg = paper.project.exportSVG({asString: true});
        let blobs = [];
        let success = 0;
        let zipper = new JSZip();
        for (let i = 0; i < svgs.length; i++) {
            if (svgs[i].slice(0, 4) == "<svg") {
                zipper.file("Device_layer_" + i + ".svg", svgs[i]);
                success++;
            }
        }

        if (success == 0) throw new Error("Unable to generate any valid SVGs. Do all layers have at least one non-channel item in them?");
        else {
            let content = zipper.generate({
                type: "blob"
            });
            saveAs(content, "device_layers.zip");
        }
    };

    // button2D.onclick = function() {
    //   /*  killParamsWindow();
    //     switchTo2D();*/
    // };

  //  button3D.onclick = function() {
       /* killParamsWindow();
        switchTo3D();*/
    //}


    function setupDragAndDropLoad(selector) {
        let dnd = new HTMLUtils.DnDFileController(selector, function(files) {
            var f = files[0];

            var reader = new FileReader();
            reader.onloadend = function(e) {
                var result = JSON.parse(this.result);
                Registry.viewManager.loadDeviceFromJSON(result);
                Registry.viewManager.switchTo2D();
            };
            try {
                reader.readAsText(f);
            } catch (err) {
                console.log("unable to load JSON: " + f);
            }
        });
    }

    setupDragAndDropLoad("#c");
    setupDragAndDropLoad("#renderContainer");
    //setActiveButton("Channel");
    //setActiveLayer("0");
    Registry.viewManager.switchTo2D();

}

module.exports.setupAppPage = setupAppPage;
