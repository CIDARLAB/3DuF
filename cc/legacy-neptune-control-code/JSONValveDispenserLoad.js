/**
 * Created by rebeccawolf on 7/26/16.
 */

// Parsing JSON to look for control features (valves and dispensers); load information into global variables
function loadButtons() {
    // load file for parsing used for counting and locating buttons
    var json = defaultJSON;
    console.log("found the loadButtons function: ");
    console.log(json);
    for (var i = 0; i < json.layers.length; i++) {
        if (json.layers[i].name === "control") {
            controlOnly = JSON.stringify(json.layers[i].features);
        }
        if (json.layers[i].name === "flow") {
            flowOnly = JSON.stringify(json.layers[i].features);
        }
    }

    // Use Json as a string
    var jsonString = JSON.stringify(json);

    // Now look for all Port in the control layer only
    var Re = /Port.+?\[(.+?),(.+?)\].+?/g;
    var myArray;
    var portArray = [];
    var portX = [];
    var portY = [];

    // look through control layer for ports
    while ((myArray = Re.exec(controlOnly)) !== null) {
        portX.push(myArray[1]);
        portY.push(myArray[2]);
        portArray.push(myArray.index);
    }

    // Store json variables to localStorage in form of JSON object...
    localStorage.portXcoords = JSON.stringify(portX);
    localStorage.portYcoords = JSON.stringify(portY);

    // Now look for all Ports (Dispensers) in the control layer only
    var myArrayDisp;
    var portArrayDisp = [];
    var portXDisp = [];
    var portYDisp = [];

    // look through flow layer for ports
    while ((myArrayDisp = Re.exec(flowOnly)) !== null) {
        portXDisp.push(myArrayDisp[1]);
        // console.log("should be x coord in flow layer: " + myArrayDisp[1]);
        portYDisp.push(myArrayDisp[2]);
        portArrayDisp.push(myArrayDisp.index);
    }

    // Store json variables to localStorage in form of JSON object...
    localStorage.portXcoordyessDisp = JSON.stringify(portXDisp);
    localStorage.portYcoordsDisp = JSON.stringify(portYDisp);
}

// after parsing JSON we can create instances of HTML templates to place over canvas
function placeButtons() {
    var canvasZoom = paper.view.zoom;

    // for each pump, create new instance of valve template
    for (var i = 0; i < JSON.parse(localStorage.getItem("portXcoords")).length; i++) {
        var content = $("#content");
        var template = document.getElementById("valve-template").content.cloneNode(true);
        var valveDiv = template.querySelector(".valve");

        valveDiv.style.position = "absolute";

        valveDiv.style.top = (parseInt(JSON.parse(localStorage.portYcoords)[i]) - paper.view.bounds.topLeft["_y"]) * canvasZoom + 1.25 * Math.pow(canvasZoom * 5, 5) + "px";
        valveDiv.style.left = (parseInt(JSON.parse(localStorage.portXcoords)[i]) - paper.view.bounds.topLeft["_x"]) * canvasZoom + 1.25 * Math.pow(canvasZoom * 5, 5) + "px";

        var specificImage = template.querySelector(".valve_color");
        // set id of each valve anchor based on location in array
        specificImage.id = "valve" + (i + 1);
        // assign appropriate valve marker based on state
        specificImage.onclick = onclickanchortag;
        if (JSON.parse(localStorage.pumpData)[i]["Current_State"] === "closed") {
            specificImage.src = "../images/fluigi/valveMarkerClosed.svg";
        } else {
            specificImage.src = "../images/fluigi/valveMarkerOpen.svg";
        }

        valveButton = template.querySelector(".valve");

        var valveIDLabel = template.querySelector(".IDtext");
        valveIDLabel.textContent = i + 1;
        if (i + 1 > 9) {
            template.querySelector(".IDtext").style = "padding-left: 9px";
        }

        content.append(template);
    }

    // for each DISPENSER, create new instance of DISPENSER template
    for (var i = 0; i < JSON.parse(localStorage.getItem("portXcoordsDisp")).length; i++) {
        var content = $("#content");

        // create new dispenser instance
        var template = document.getElementById("dispenser-template").content.cloneNode(true);
        var valveDiv = template.querySelector(".valve");
        var modalDiv = template.querySelector(".dispenserModalClass");
        var gottaCatchEmAll = template.querySelector(".catchDispenser");
        var progress = template.querySelector(".progress-bar");
        var currentStateTxt = template.querySelector(".currentStateModalVal");
        var form = template.querySelector(".dispenseRate");
        var sendDispense = template.querySelector(".sendDispense");
        var dispenseVol = template.querySelector(".dispenseVol");
        var dispenseTime = template.querySelector(".dispenseTime");
        var plunger = template.querySelector(".syringePlunger");
        var orientation = template.querySelector(".orientationBtn");

        valveDiv.style.position = "absolute";

        // +220 bc canvas is positioned 220px from top & -20 so that valve is positioned from center of circle
        var yCoord = (parseInt(JSON.parse(localStorage.portYcoordsDisp)[i]) - paper.view.bounds.topLeft["_y"]) * canvasZoom + 1.25 * Math.pow(canvasZoom * 5, 5);
        var xCoord = (parseInt(JSON.parse(localStorage.portXcoordsDisp)[i]) - paper.view.bounds.topLeft["_x"]) * canvasZoom + 1.25 * Math.pow(canvasZoom * 5, 5);

        modalDiv.id = "dispenserModal" + (i + 1);
        var modalID = template.querySelector("#dispenserModal" + (i + 1));

        progress.id = "progress" + (i + 1);

        currentStateTxt.id = "stateOf" + (i + 1);

        // style position of dispenser modal
        if (xCoord + 400 > $(window).width()) {
            modalID.style.left = xCoord - 400 + "px";
        } else {
            modalID.style.left = xCoord + 40 + "px";
        }
        modalID.style.top = yCoord + "px";

        // place dispensers
        valveDiv.style.top = yCoord + "px";
        valveDiv.style.left = xCoord + "px";

        var specificImage = template.querySelector(".dispenserImg");
        // set id of each valve anchor based on location in array
        specificImage.id = i + 1;

        valveButton = template.querySelector(".valve");

        var valveIDLabel = template.querySelector(".IDtext");
        valveIDLabel.textContent = i + 1;
        if (i + 1 > 9) {
            template.querySelector(".IDtext").style = "padding-left: 9px";
        }

        var catchID = "catch" + (i + 1);
        gottaCatchEmAll.id = catchID;

        var dispenserTitle = template.querySelector("#dispenserModalTitle");
        dispenserTitle.textContent = "Dispenser " + (i + 1);

        // id of each syringe tube
        plunger.id = "plunger" + (i + 1);

        // reference to submit appropriate form
        var sendID = "dispenseTo" + (i + 1);
        var vol = "dispenseVol" + (i + 1);
        var time = "dispenseTime" + (i + 1);

        // form ID
        form.id = "dispenseRate" + (i + 1);
        sendDispense.id = sendID;
        dispenseVol.id = vol;
        console.log(dispenseVol.id);
        dispenseTime.id = time;
        console.log(dispenseTime.id);

        // dispenser orientation (push/pull)
        orientation.id = "orientation" + (i + 1);
        orientation.textContent = JSON.parse(localStorage.dispenserData)[i]["orientation"];

        var dispenserCatch = "#dispenserModal" + (i + 1);
        content.append(template);
        // attach reference to correct dispenser modal
        $("#" + catchID).attr("href", dispenserCatch);
        $("#" + catchID).attr("onclick", "activateDispenser(" + (i + 1) + ")");
    }
}
