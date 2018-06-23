var HTMLUtils = require("../utils/htmlUtils");
var Registry = require("../core/registry");
var Colors = require("./colors");
var JSZip = require("jszip");
var ParameterMenu = require("./UI/parameterMenu");
var InsertTextTool = require("./tools/insertTextTool");

let activeButton = null;
let activeLayer = null;

let selectToolButton = document.getElementById("select_button");
let saveDeviceSettingsButton = document.getElementById("accept_resize_button");
let insertTextButton = document.getElementById("insert_text_button");
let acceptTextButton = document.getElementById("accept_text_button");

let channelButton = document.getElementById("channel_button");
let connectionButton = document.getElementById("connection_button");
let roundedChannelButton = document.getElementById("roundedchannel_button");
let transitionButton = document.getElementById("transition_button");
let circleValveButton = document.getElementById("circleValve_button");
let valveButton = document.getElementById("valve_button");
let valve3dButton = document.getElementById("valve3d_button");
let portButton = document.getElementById("port_button");
let viaButton = document.getElementById("via_button");
let chamberButton = document.getElementById("chamber_button");
let diamondButton = document.getElementById("diamond_button");
let bettermixerButton = document.getElementById("bettermixer_button");
let curvedmixerButton = document.getElementById("curvedmixer_button");
let mixerButton = document.getElementById("mixer_button");
let gradientGeneratorButton = document.getElementById("gradientgenerator_button");
let treeButton = document.getElementById("tree_button");
let ytreeButton = document.getElementById("ytree_button");
let muxButton = document.getElementById("mux_button");
let transposerButton = document.getElementById("transposer_button");
let rotarymixerButton = document.getElementById("rotarymixer_button");
let dropletgenButton = document.getElementById("dropletgen_button");
let celltraplButton = document.getElementById("celltrapl_button");
let revertdefaultsButton = document.getElementById("revertdefaults_button");


let alignmentMarksButton = document.getElementById("alignmentmarks_button");

let alignmentMarksParams = document.getElementById("alignmentmarks_params_button");

let channelParams = document.getElementById("channel_params_button");
let connectionParams = document.getElementById("connection_params_button");
let roundedChannelParams = document.getElementById("roundedchannel_params_button");
let transitionParams = document.getElementById("transition_params_button");
let circleValveParams = document.getElementById("circleValve_params_button");
let valveParams = document.getElementById("valve_params_button");
let valve3dParams = document.getElementById("valve3d_params_button");
let portParams = document.getElementById("port_params_button");
let viaParams = document.getElementById("via_params_button");
let chamberParams = document.getElementById("chamber_params_button");
let diamondParams = document.getElementById("diamond_params_button");
let bettermixerParams = document.getElementById("bettermixer_params_button");
let curvedmixerParams = document.getElementById("curvedmixer_params_button");
let mixerParams = document.getElementById("mixer_params_button");
let gradientGeneratorParams = document.getElementById("gradientgenerator_params_button");
let treeParams = document.getElementById("tree_params_button");
let ytreeParams = document.getElementById("ytree_params_button");
let muxParams = document.getElementById("mux_params_button");
let transposerParams = document.getElementById("transposer_params_button");
let rotarymixerParams = document.getElementById("rotarymixer_params_button");
let dropletgenParams = document.getElementById("dropletgen_params_button");
let celltraplParams = document.getElementById("celltrapl_params_button");

let jsonButton = document.getElementById("json_button");
let interchangeV1Button = document.getElementById("interchange_button");
let svgButton = document.getElementById("svg_button");

//let stlButton = document.getElementById("stl_button");

let button2D = document.getElementById("button_2D");
//let button3D = document.getElementById("button_3D");

let flowButton = document.getElementById("flow_button");
let controlButton = document.getElementById("control_button");
let cellsButton = document.getElementById("cells_button");

let inactiveBackground = Colors.GREY_200;
let inactiveText = Colors.BLACK;
let activeText = Colors.WHITE;

let canvas = document.getElementById("c");

let canvasBlock = document.getElementById("canvas_block");
let renderBlock = document.getElementById("renderContainer");

let renderer;
let view;

let threeD = false;

let buttons = {
    "SelectButton": selectToolButton,
    "InsertTextButton": insertTextButton,
    "Channel": channelButton,
    "Connection": connectionButton,
    "RoundedChannel": roundedChannelButton,
    "Transition": transitionButton,
    "Via": viaButton,
    "Port": portButton,
    "CircleValve": circleValveButton,
    "Valve3D": valve3dButton,
    "Valve":valveButton,
    "Chamber": chamberButton,
    "DiamondReactionChamber": diamondButton,
    "BetterMixer": bettermixerButton,
    "CurvedMixer": curvedmixerButton,
    "Mixer": mixerButton,
    "GradientGenerator": gradientGeneratorButton,
    "Tree": treeButton,
    "YTree": ytreeButton,
    "Mux":muxButton,
    "Transposer":transposerButton,
    "RotaryMixer":rotarymixerButton,
    "DropletGen": dropletgenButton,
    "CellTrapL": celltraplButton,
    "AlignmentMarks": alignmentMarksButton
}

let layerButtons = {
    "0": flowButton,
    "1": controlButton,
    "2": cellsButton
}

let layerIndices = {
    "0": 0,
    "1": 1,
    "2": 2
}

let zipper = new JSZip();

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
}

function setButtonColor(button, background, text) {
    button.style.background = background;
    button.style.color = text;
}

function setActiveButton(feature) {
    killParamsWindow();
    //TODO: Make this less hacky so that it wont be such a big problem to modify the button selection criteria
    if (activeButton == "SelectButton" || activeButton == "InsertTextButton"){
        setButtonColor(buttons[activeButton], inactiveBackground, inactiveText);
    } else if (activeButton) {
        setButtonColor(buttons[activeButton], inactiveBackground, inactiveText);
    }
    activeButton = feature;
    let color = Colors.getDefaultFeatureColor(activeButton, "Basic", Registry.currentLayer);
    setButtonColor(buttons[activeButton], color, activeText);
}

function setActiveLayer(layerName) {
    if (activeLayer) setButtonColor(layerButtons[activeLayer], inactiveBackground, inactiveText);
    activeLayer = layerName;
    setActiveButton(activeButton);
    let bgColor = Colors.getDefaultLayerColor(Registry.currentLayer);
    setButtonColor(layerButtons[activeLayer], bgColor, activeText);
   /* if (threeD) {
        setButtonColor(button3D, Colors.getDefaultLayerColor(Registry.currentLayer), activeText);
        setButtonColor(button2D, inactiveBackground, inactiveText);
    } else {*/
        setButtonColor(button2D, Colors.getDefaultLayerColor(Registry.currentLayer), activeText);
        //setButtonColor(button3D, inactiveBackground, inactiveText);
   // }
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
function switchTo2D() {
    if (threeD) {
        threeD = false;
        let center = renderer.getCameraCenterInMicrometers();
        let zoom = renderer.getZoom();
        let newCenterX = center[0];
        if (newCenterX < 0) {
            newCenterX = 0
        } else if (newCenterX > Registry.currentDevice.params.getValue("width")) {
            newCenterX = Registry.currentDevice.params.getValue("width");
        }
        let newCenterY = paper.view.center.y - center[1];
        if (newCenterY < 0) {
            newCenterY = 0;
        } else if (newCenterY > Registry.currentDevice.params.getValue("height")) {
            newCenterY = Registry.currentDevice.params.getValue("height")
        }
        setButtonColor(button2D, Colors.getDefaultLayerColor(Registry.currentLayer), activeText);
        setButtonColor(button3D, inactiveBackground, inactiveText);
        Registry.viewManager.setCenter(new paper.Point(newCenterX, newCenterY));
        Registry.viewManager.setZoom(zoom);
        HTMLUtils.addClass(renderBlock, "hidden-block");
        HTMLUtils.removeClass(canvasBlock, "hidden-block");
        HTMLUtils.removeClass(renderBlock, "shown-block");
        HTMLUtils.addClass(canvasBlock, "shown-block");
    }
}

function paramsWindowFunction(typeString, setString, isTranslucent = false) {
    var makeTable = ParameterMenu.generateTableFunction("parameter_menu", typeString, setString , isTranslucent);
    return function(event) {
        killParamsWindow();
        makeTable(event);
    }
}

function killParamsWindow() {
    let paramsWindow = document.getElementById("parameter_menu");
    if (paramsWindow) paramsWindow.parentElement.removeChild(paramsWindow);
}

function setupAppPage() {
    view = Registry.viewManager.view;
    renderer = Registry.threeRenderer;

    //Register all the button clicks here

    channelButton.onclick = function() {
        Registry.viewManager.activateTool("Channel");
        let bg = Colors.getDefaultFeatureColor("Channel", "Basic", Registry.currentLayer);
        setActiveButton("Channel");
        switchTo2D();
    };

    connectionButton.onclick = function() {
        Registry.viewManager.activateTool("Connection", "Connection");
        let bg = Colors.getDefaultFeatureColor("Connection", "Basic", Registry.currentLayer);
        setActiveButton("Connection");
        switchTo2D();
    };

    selectToolButton.onclick = function(){
        Registry.viewManager.activateTool("MouseSelectTool");
        if (activeButton) setButtonColor(buttons[activeButton], inactiveBackground, inactiveText);
        activeButton = "SelectButton";
        setButtonColor(buttons["SelectButton"], Colors.DEEP_PURPLE_500, activeText);
    };

    saveDeviceSettingsButton.onclick = function(){

        //Save the name
        let devicename = document.getElementById("devicename_textinput").value;
        if(devicename != "" || devicename != null){
            console.log("test");
            Registry.currentDevice.setName(devicename);
        }

        //Do the resizing
        let xspan = document.getElementById("xspan_textinput").value;
        let yspan = document.getElementById("yspan_textinput").value;
        console.log("Resizing the device to: " + xspan + ", " +yspan);


        if(xspan != "" && yspan != ""){

            //Convert the dimensions to microns from mm
            Registry.currentDevice.setXSpan(xspan*1000);
            Registry.currentDevice.setYSpan(yspan*1000);

            //Update the device borders
            Registry.viewManager.generateBorder();

            //Close the dialog
            var dialog = document.querySelector('dialog');
            dialog.close();

            //Refresh the view
            Registry.viewManager.view.initializeView();
            Registry.viewManager.view.refresh();
            // Registry.viewManager.view.updateGrid();
            Registry.viewManager.view.updateAlignmentMarks();
        }

    };

    insertTextButton.onclick = function(){
        if (activeButton) setButtonColor(buttons[activeButton], inactiveBackground, inactiveText);
        activeButton = "InsertTextButton";
        setButtonColor(buttons["InsertTextButton"], Colors.DEEP_PURPLE_500, activeText);
    };

    acceptTextButton.onclick = function(){
        Registry.viewManager.activateTool("InsertTextTool");
        Registry.text = document.getElementById("inserttext_textinput").value;
        let textLabelDialog = document.getElementById('insert_text_dialog');
        textLabelDialog.close();
    };


    revertdefaultsButton.onclick = function() {
        Registry.viewManager.revertFeaturesToDefaults(Registry.viewManager.view.getSelectedFeatures());

    };
/*
    copyButton.onclick = function() {

    }
*/
    roundedChannelButton.onclick = function() {
        Registry.viewManager.activateTool("RoundedChannel");
        let bg = Colors.getDefaultFeatureColor("RoundedChannel", "Basic", Registry.currentLayer);
        setActiveButton("RoundedChannel");
        switchTo2D();
    };
    transitionButton.onclick = function() {
        Registry.viewManager.activateTool("Transition");
        let bg = Colors.getDefaultFeatureColor("Transition", "Basic", Registry.currentLayer);
        setActiveButton("Transition");
        switchTo2D();
    };
    circleValveButton.onclick = function() {
        Registry.viewManager.activateTool("CircleValve");
        let bg = Colors.getDefaultFeatureColor("CircleValve", "Basic", Registry.currentLayer);
        setActiveButton("CircleValve");
        switchTo2D();
    };
    valve3dButton.onclick = function() {
        Registry.viewManager.activateTool("Valve3D");
        let bg = Colors.getDefaultFeatureColor("Valve3D", "Basic", Registry.currentLayer);
        setActiveButton("Valve3D");
        switchTo2D();
    };

    alignmentMarksButton.onclick = function() {
        Registry.viewManager.activateTool("AlignmentMarks");
        let bg = Colors.getDefaultFeatureColor("AlignmentMarks", "Basic", Registry.currentLayer);
        setActiveButton("AlignmentMarks");
        switchTo2D();
    };

    valveButton.onclick = function() {
        Registry.viewManager.activateTool("Valve");
        let bg = Colors.getDefaultFeatureColor("Valve", "Basic", Registry.currentLayer);
        setActiveButton("Valve");
        switchTo2D();
    };


    portButton.onclick = function() {
        Registry.viewManager.activateTool("Port");
        let bg = Colors.getDefaultFeatureColor("Port", "Basic", Registry.currentLayer);
        setActiveButton("Port");
        switchTo2D();
    };

    viaButton.onclick = function() {
        Registry.viewManager.activateTool("Via");
        let bg = Colors.getDefaultFeatureColor("Via", "Basic", Registry.currentLayer);
        setActiveButton("Via");
        switchTo2D();
    };

    chamberButton.onclick = function() {
        Registry.viewManager.activateTool("Chamber");
        let bg = Colors.getDefaultFeatureColor("Chamber", "Basic", Registry.currentLayer);
        setActiveButton("Chamber");
        switchTo2D();
    };
    diamondButton.onclick = function() {
        Registry.viewManager.activateTool("DiamondReactionChamber");
        let bg = Colors.getDefaultFeatureColor("DiamondReactionChamber", "Basic", Registry.currentLayer);
        setActiveButton("DiamondReactionChamber");
        switchTo2D();
    };
    bettermixerButton.onclick = function() {
        Registry.viewManager.activateTool("BetterMixer");
        let bg = Colors.getDefaultFeatureColor("BetterMixer", "Basic", Registry.currentLayer);
        setActiveButton("BetterMixer");
        switchTo2D();
    };
    curvedmixerButton.onclick = function() {
        Registry.viewManager.activateTool("CurvedMixer");
        let bg = Colors.getDefaultFeatureColor("CurvedMixer", "Basic", Registry.currentLayer);
        setActiveButton("CurvedMixer");
        switchTo2D();
    };
    mixerButton.onclick = function() {
        Registry.viewManager.activateTool("Mixer");
        let bg = Colors.getDefaultFeatureColor("Mixer", "Basic", Registry.currentLayer);
        setActiveButton("Mixer");
        switchTo2D();
    };

    gradientGeneratorButton.onclick = function(){
        Registry.viewManager.activateTool("GradientGenerator");
        let bg = Colors.getDefaultFeatureColor("GradientGenerator", "Basic", Registry.currentLayer);
        setActiveButton("GradientGenerator");
        switchTo2D();
    };

    treeButton.onclick = function() {
        Registry.viewManager.activateTool("Tree");
        let bg = Colors.getDefaultFeatureColor("Tree", "Basic", Registry.currentLayer);
        setActiveButton("Tree");
        switchTo2D();
    };
    ytreeButton.onclick = function() {
        Registry.viewManager.activateTool("YTree");
        let bg = Colors.getDefaultFeatureColor("YTree", "Basic", Registry.currentLayer);
        setActiveButton("YTree");
        switchTo2D();
    };
    muxButton.onclick = function() {
        Registry.viewManager.activateTool("Mux");
        let bg = Colors.getDefaultFeatureColor("Mux", "Basic", Registry.currentLayer);
        setActiveButton("Mux");
        switchTo2D();
    };
    transposerButton.onclick = function() {
        Registry.viewManager.activateTool("Transposer");
        let bg = Colors.getDefaultFeatureColor("Transposer", "Basic", Registry.currentLayer);
        setActiveButton("Transposer");
        switchTo2D();
    };
    rotarymixerButton.onclick = function() {
        Registry.viewManager.activateTool("RotaryMixer");
        let bg = Colors.getDefaultFeatureColor("RotaryMixer", "Basic", Registry.currentLayer);
        setActiveButton("RotaryMixer");
        switchTo2D();
    };
    dropletgenButton.onclick = function() {
        Registry.viewManager.activateTool("DropletGen");
        let bg = Colors.getDefaultFeatureColor("DropletGen", "Basic", Registry.currentLayer);
        setActiveButton("DropletGen");
        switchTo2D();
    };
    celltraplButton.onclick = function() {
        Registry.viewManager.activateTool("CellTrapL");
        let bg = Colors.getDefaultFeatureColor("CellTrapL", "Basic", Registry.currentLayer);
        setActiveButton("CellTrapL");
        switchTo2D();
    };
    //copyButton.onclick = function() {

    //}

    flowButton.onclick = function() {
        if (threeD) {
            if (activeLayer == "0") renderer.toggleLayerView(0);
            else renderer.showLayer(0);
        }
        Registry.currentLayer = Registry.currentDevice.layers[0];
        setActiveLayer("0");
        Registry.viewManager.updateActiveLayer();

    }

    controlButton.onclick = function() {
        if (threeD) {
            if (activeLayer == "1") renderer.toggleLayerView(1);
            else renderer.showLayer(1);
        }
        Registry.currentLayer = Registry.currentDevice.layers[1];
        setActiveLayer("1");
        Registry.viewManager.updateActiveLayer();
    }

    cellsButton.onclick = function() {
        if (threeD) {
            if (activeLayer == "2") renderer.toggleLayerView(2);
            else renderer.showLayer(2);
        }
        Registry.currentLayer = Registry.currentDevice.layers[2];
        setActiveLayer("2");
        Registry.viewManager.updateActiveLayer();
        console.log("Adaptive Grid Min Spacing: " + Registry.currentGrid.minSpacing);
        console.log("Adaptive Grid Max Spacing: " + Registry.currentGrid.maxSpacing);

    }

    interchangeV1Button.onclick = function() {
        let json = new Blob([JSON.stringify(Registry.currentDevice.toInterchangeV1())], {
            type: "application/json"
        });
        saveAs(json, "device.json");
    }

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
    }

    button2D.onclick = function() {
      /*  killParamsWindow();
        switchTo2D();*/
    }

  //  button3D.onclick = function() {
       /* killParamsWindow();
        switchTo3D();*/
    //}

    channelParams.onclick = paramsWindowFunction("Channel", "Basic");
    connectionParams.onclick = paramsWindowFunction("Connection", "Basic");
    roundedChannelParams.onclick = paramsWindowFunction("RoundedChannel", "Basic");
    circleValveParams.onclick = paramsWindowFunction("CircleValve", "Basic");
    valve3dParams.onclick = paramsWindowFunction("Valve3D", "Basic");
    valveParams.onclick = paramsWindowFunction("Valve", "Basic");
    portParams.onclick = paramsWindowFunction("Port", "Basic");
    viaParams.onclick = paramsWindowFunction("Via", "Basic");
    chamberParams.onclick = paramsWindowFunction("Chamber", "Basic");
    diamondParams.onclick = paramsWindowFunction("DiamondReactionChamber", "Basic");
    bettermixerParams.onclick = paramsWindowFunction("BetterMixer", "Basic");
    curvedmixerParams.onclick = paramsWindowFunction("CurvedMixer", "Basic");
    mixerParams.onclick = paramsWindowFunction("Mixer", "Basic");
    gradientGeneratorParams.onclick = paramsWindowFunction("GradientGenerator", "Basic");
    treeParams.onclick = paramsWindowFunction("Tree", "Basic");
    ytreeParams.onclick = paramsWindowFunction("YTree", "Basic");
    muxParams.onclick = paramsWindowFunction("Mux", "Basic");
    transposerParams.onclick = paramsWindowFunction("Transposer", "Basic");
    rotarymixerParams.onclick = paramsWindowFunction("RotaryMixer", "Basic");
    dropletgenParams.onclick = paramsWindowFunction("DropletGen", "Basic");
    transitionParams.onclick = paramsWindowFunction("Transition", "Basic");
    celltraplParams.onclick = paramsWindowFunction("CellTrapL", "Basic");
    alignmentMarksParams.onclick = paramsWindowFunction("AlignmentMarks", "Basic");

    function setupDragAndDropLoad(selector) {
        let dnd = new HTMLUtils.DnDFileController(selector, function(files) {
            var f = files[0];

            var reader = new FileReader();
            reader.onloadend = function(e) {
                var result = JSON.parse(this.result);
                Registry.viewManager.loadDeviceFromJSON(result);
                switchTo2D();
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
    setActiveButton("Channel");
    setActiveLayer("0");
    switchTo2D();

}

module.exports.setupAppPage = setupAppPage;
module.exports.paramsWindowFunction = paramsWindowFunction;
module.exports.killParamsWindow = killParamsWindow;