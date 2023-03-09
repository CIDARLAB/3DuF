// functionality attached directly to valve icons; find in JSONValveDispenserLoad.js
function onclickanchortag() {
    var temp = JSON.parse(localStorage.pumpData);
    var valve_to_control = this.id.split("valve").pop();
    if (temp[valve_to_control - 1]["Cluster"].length > 0) {
        for (var i = 0; i < temp[valve_to_control - 1]["Cluster"].length; i++) {
            toggleValve("#valve" + (temp[valve_to_control - 1]["Cluster"][i] + 1));
        }
    } else {
        toggleValve("#" + this.id);
    }
    return false;
}

// toggle any valve given its DivID
function toggleValve(valveDivID) {
    // will be in form of #valve1, #valve2, ... numbers correspond to valve id in JSON
    var divElement = $(valveDivID)[0];
    var location = getLocation(divElement.src);
    var valve_to_control = divElement.id.split("valve").pop();
    var temp = JSON.parse(localStorage.pumpData);
    switch (location.pathname) {
        case "/images/fluigi/valveMarkerOpen.svg":
            $(divElement).attr("src", "../images/fluigi/valveMarkerClosed.svg");
            // change recorded state in table
            temp[valve_to_control - 1]["Current_State"] = "closed";
            break;

        case "/images/fluigi/valveMarkerClosed.svg":
            $(divElement).attr("src", "../images/fluigi/valveMarkerOpen.svg");
            // change recorded state in table
            temp[valve_to_control - 1]["Current_State"] = "opened";
            break;
        default:
            $(this).attr("src", "../images/fluigi/valveMarkerClosed.svg");
            break;
    }
    localStorage.pumpData = JSON.stringify(temp);
    localStorage.portToControl = valve_to_control;
    sendCommand();
    if (location.pathname == "/images/fluigi/valveMarkerOpen.svg") {
    }
    return false;
}

var getLocation = function(href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
};

function onclickanchortagDispense() {
    dispenser_to_control = this.id;
    incrementDispenserPosition(dispenser_to_control);
    return false;
}

// functionality directly connected to dispenser icons; find in JSONValveDispenserLoad.js
function activateDispenser(dispenserIDNum) {
    localStorage.activeDispenser = dispenserIDNum;
    localStorage.dispenserToControl = dispenserIDNum;
    updateDispenseProgressBar(dispenserIDNum);
}
function deactivateDispenser() {
    localStorage.activeDispenser = "none";
}

function valve_uL_to_PWM(uL_table, uL_precision, uL_goal) {
    for (var i = 0; i <= uL_table.length; i = i + 2) {
        if (uL_goal - uL_table[i] <= uL_precision / 2) {
            return Math.round(uL_table[i + 1]);
        }
    }
    console.log("ERROR! Cannot find value");
}

function wrap_data_for_Arduino() {
    var valve_to_control = localStorage.portToControl;

    var data_for_selected_object = JSON.parse(localStorage.pumpData);
    var deviceNum = data_for_selected_object[valve_to_control - 1]["deviceIndex"];
    console.log("wrapping command for " + deviceNum);
    var open_state_parameter = data_for_selected_object[valve_to_control - 1]["Open_State"];
    var closed_state_parameter = data_for_selected_object[valve_to_control - 1]["Closed_State"];
    var physical_state_parameter = data_for_selected_object[valve_to_control - 1]["Current_State"];

    if (physical_state_parameter == "opened") {
        var uLVal = open_state_parameter;
    } else {
        var uLVal = closed_state_parameter;
    }

    var uL_table = data_for_selected_object[valve_to_control - 1]["uL_Conversion_Table"];
    //console.log("uL_table: " + uL_table);
    var uL_precision = data_for_selected_object[valve_to_control - 1]["uL_Precision"];
    var PWMval = valve_uL_to_PWM(uL_table, uL_precision, uLVal);

    // PAD THE VALVE_TO_CONTROL WITH 0's SUCH THAT THE VALUE IS 4 CHARACTERS LONG
    var valve_to_control_padded = zeroFill(deviceNum, 4);
    // PAD THE PWM VALUE WITH 0's SUCH THAT THE VALUE IS 4 CHARACTERS LONG
    var PWMval_padded = zeroFill(PWMval, 4);
    // CONCAT THE VALVE NUMBER AND PWM VALUE
    var pre_command = valve_to_control_padded.concat(PWMval_padded);
    // ADD A START CODON TO SIGNIFY THE BEGINING OF SIGNAL
    var startStr = "";
    var pre_command_s = startStr.concat(pre_command);
    // ADD A STOP CODON TO SIGNIFY THE END OF SIGNAL
    var command = pre_command_s.concat("\n");
    // RETURN THE DATA
    return command;
}

function sendCommand() {
    var command = wrap_data_for_Arduino();
    toastr.info(command);
    localStorage.setItem("myCommand", command);
    $.ajax({
        url: "/serialcommunication/send",
        type: "POST",
        async: true,
        data: {
            commandData: command
        },
        success: function(response) {},
        error: function(response) {}
    });
}
