/**
 * Created by rebeccawolf on 10/5/16.
 */

function incrementDispenserPosition(dispenser_to_control) {
    // identify which dispenser you are sending command to
    localStorage.dispenserToControl = dispenser_to_control;
    // see if already maxed out at highest position
    if (
        parseFloat(JSON.parse(localStorage.dispenserData)[dispenser_to_control - 1]["Current_State"]) <=
        parseFloat(JSON.parse(localStorage.dispenserData)[dispenser_to_control - 1]["Max"])
    ) {
        var conversionTable = JSON.parse(JSON.parse(localStorage.getItem("dispenserConversions"))[dispenser_to_control]); // conversion table for specific dispenser you are controlling

        var temp = JSON.parse(localStorage.dispenserData);
        var index = parseFloat(temp[dispenser_to_control - 1]["Current_State"]); // current uL state
        // var PWMcurrent = conversionTable[index];   // find the PWM value which corresponds to the mL value chosen to send to arduino
        var foundIndex = false;
        var nextuL = 0;
        var nextPWM = 0;
        // figure out which is the next increment of uL value we can dispenser from the conversion table
        for (var uL = 0; uL <= conversionTable.length; uL = uL + 2) {
            if (foundIndex == true) {
                nextuL = conversionTable[uL]; // note the next uL value to send
                nextPWM = conversionTable[uL + 1];
                break;
            }
            if (conversionTable[uL] == index) {
                foundIndex = true;
            }
            if (conversionTable[uL] > index) {
                // surpassed current value, send this one!!
                nextuL = conversionTable[uL];
                nextPWM = conversionTable[uL + 1];
                break;
            }
        }
        nextPWM = nextPWM.toFixed(0);

        // set current state to one which corresponds to a value in conversion table
        temp[dispenser_to_control - 1]["Current_State"] = nextuL.toString();
        localStorage.dispenserData = JSON.stringify(temp);

        sendCommandDispense(nextPWM, dispenser_to_control);
        updateDispenseProgressBar(dispenser_to_control);
    } else {
        toastr.warning("You have already dispensed the full amount of this syringe.");
    }
    return false;
}

function decrementDispenserPosition(dispenser_to_control) {
    localStorage.dispenserToControl = dispenser_to_control;
    // assumes the capacity of the syringe is 9 mL
    if (
        parseFloat(JSON.parse(localStorage.dispenserData)[dispenser_to_control - 1]["Current_State"]) >
        parseFloat(JSON.parse(localStorage.dispenserData)[dispenser_to_control - 1]["Min"])
    ) {
        var conversionTable = JSON.parse(JSON.parse(localStorage.getItem("dispenserConversions"))[dispenser_to_control]); // conversion table for specific dispenser you are controlling

        var temp = JSON.parse(localStorage.dispenserData);
        var index = parseFloat(temp[dispenser_to_control - 1]["Current_State"]); // current uL state
        var foundIndex = false;
        var nextuL = 0;
        var nextPWM = 0;

        // figure out which is the next increment of uL value we can dispenser from the conversion table
        for (var uL = conversionTable.length - 2; uL >= 0; uL = uL - 2) {
            if (foundIndex == true) {
                nextuL = conversionTable[uL]; // note the next uL value to send
                nextPWM = conversionTable[uL + 1];
                break;
            }
            if (conversionTable[uL] == index) {
                foundIndex = true;
            }
            if (conversionTable[uL] < index) {
                // surpassed current value, send this one!!
                nextuL = conversionTable[uL];
                nextPWM = conversionTable[uL + 1];
                break;
            }
        }
        nextPWM = nextPWM.toFixed(0);

        // set current state to one which corresponds to a value in conversion table
        temp[dispenser_to_control - 1]["Current_State"] = nextuL.toString();
        localStorage.dispenserData = JSON.stringify(temp);

        sendCommandDispense(nextPWM, dispenser_to_control);
        updateDispenseProgressBar(dispenser_to_control);
    } else {
        toastr.warning("You have reached minimum volume capacity.");
    }
    return false;
}

function wrap_data_for_Arduino_Dispense(PWM, dispenser_to_control) {
    // var dispenser_to_control = localStorage.dispenserToControl;
    var temp = JSON.parse(localStorage.dispenserData);
    var deviceNum = temp[dispenser_to_control - 1]["deviceIndex"];
    console.log("the device num is: " + deviceNum);

    // FIRST, PAD VALUES WITH 0's SUCH THAT THE VALUE IS 3 CHARACTERS LONG
    var dispenser_to_control_padded = zeroFill(deviceNum, 4);
    var PWMval_padded = zeroFill(PWM, 4);
    // CONCAT THE VALVE NUMBER AND PWM VALUE
    var pre_command = dispenser_to_control_padded.concat(PWMval_padded);
    // ADD A START CODON TO SIGNIFY THE BEGINING OF SIGNAL
    var startStr = "";
    var pre_command_s = startStr.concat(pre_command);
    // ADD A STOP CODON TO SIGNIFY THE END OF SIGNAL
    var command = pre_command_s.concat("\n");
    // RETURN THE DATA
    return command;
}
function sendCommandDispense(PWM, dispenser_to_control) {
    var command = wrap_data_for_Arduino_Dispense(PWM, dispenser_to_control);
    var message = "Sending to Arduino: ";
    var command_info = message.concat(command);
    // --- Include code to serial.write() the command to the Arduino here --- //
    toastr.info(command_info);
    // writeToSerialConsole(command_info);
    // console.log(command);
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
// ./ END DISPENSER FUNCTIONS

// HELPER FUNCTIONS FOR SENDING COMMANDS FOR BOTH VALVES AND DISPENSERS
function zeroFill(number, width) {
    width -= number.toString().length;
    if (width > 0) {
        return new Array(width + (/\./.test(number) ? 2 : 1)).join("0") + number;
    }
    return number + ""; // always return a string
}
function paddy(n, p, c) {
    var pad_char = typeof c !== "undefined" ? c : "0";
    var pad = new Array(1 + p).join(pad_char);
    return (pad + n).slice(-pad.length);
}

// ./ END HELPER FUNCTIONS

// dispenser arrow key functionality
function upArrow() {
    if (JSON.parse(localStorage.dispenserData)[localStorage.dispenserToControl - 1]["orientation"] === "pull") {
        incrementDispenserPosition(localStorage.dispenserToControl); // output fluid for pull syringe = move syringe to higher position
    } else {
        decrementDispenserPosition(localStorage.dispenserToControl); // output fluid for push syringe = move syringe to lower position
    }
    return false;
}
function downArrow() {
    if (JSON.parse(localStorage.dispenserData)[localStorage.dispenserToControl - 1]["orientation"] === "pull") {
        decrementDispenserPosition(localStorage.dispenserToControl); // retract fluid for pull syringe = move syringe to lower position
    } else {
        incrementDispenserPosition(localStorage.dispenserToControl); // retract fluid for push syringe = move syringe to higher position
    }
    return false;
}
function dispenseSelected(down) {
    switch (down.keyCode) {
        case 38: // up key
            if (localStorage.activeDispenser != "none") {
                upArrow();
            }
            break;
        case 40: // down key
            if (localStorage.activeDispenser != "none") {
                downArrow();
            }
            break;
    }
}
// ./ end dispenser arrow key functionality

// dispenser modal progress bar update
function updateDispenseProgressBar(dispenserIDNum) {
    currentState = JSON.parse(localStorage.dispenserData)[dispenserIDNum - 1]["Current_State"];
    maxVol = JSON.parse(localStorage.dispenserData)[dispenserIDNum - 1]["Max"];
    minVol = JSON.parse(localStorage.dispenserData)[dispenserIDNum - 1]["Min"];
    if (currentState == 0) {
        percentageUpdate = 0; // value is NaN otherwise
    } else {
        percentageUpdate = Math.floor(((currentState - minVol) / (maxVol - minVol)) * 100);
    }

    // first update syringe
    updateDispenseSyringe(dispenserIDNum, percentageUpdate);

    // now base percentage update on syringe orientation:
    if (JSON.parse(localStorage.dispenserData)[dispenserIDNum - 1]["orientation"] === "push") {
        percentageUpdate = 100 - percentageUpdate;
    }

    document.getElementById("progress" + dispenserIDNum).innerHTML = percentageUpdate + "% total vol";
    document.getElementById("stateOf" + dispenserIDNum).innerHTML = currentState + " uL";
    $("#progress" + dispenserIDNum)
        .css("width", percentageUpdate + "%")
        .attr("aria-valuenow", percentageUpdate);
    return false;
}

//  update dispenserUI modal syringe to dispensed value
function updateDispenseSyringe(dispenserIDNum, percentUpdate) {
    // min/max displacement for syringe is 92 - 40 = 52
    var zeroDisplacement = (percentUpdate / 100) * 52;
    var displacement = zeroDisplacement + 40;
    $("#plunger" + dispenserIDNum).css("left", displacement + "px");
}
