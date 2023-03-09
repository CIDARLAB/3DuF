var ShieldIndex = 0;
var PinIndex = 0;
var deviceCount = 0;

function initiateValveData() {
    setNumberOfPumps_JSON();
}

// FUNCTIONALITY FOR VALVE DATA TRACKING

// Create Valve JSON
function setNumberOfPumps_JSON() {
    localStorage.pumps = JSON.parse(localStorage.portXcoords).length;
    var DataToLoad = [];
    var j = 0; //  hardware pin (goes from 0 to 12)
    for (var i = 1; i <= localStorage.pumps; i++) {
        var initialize_valve_conversion = initializeSetup(180, 460, 0.69, 3, 0.88, 0.25);
        var singleStage = {
            id: i,
            HW_shield: Math.floor(i / 12) + 1,
            HW_pin: j,
            Open_State: initialize_valve_conversion.uL_max,
            Closed_State: 0,
            Current_State: "opened",
            deviceIndex: deviceCount,
            uL_Conversion_Table: initialize_valve_conversion.uL_table,
            uL_Precision: initialize_valve_conversion.uL_precision,
            Cluster: []
        };
        DataToLoad.push(singleStage);
        j = j + 1;
        if (j == 13) {
            j = 0;
        }
        ShieldIndex = i;
        PinIndex = j;
        deviceCount++;
    }
    localStorage.clear_toggle = true;
    localStorage.unsavedData = JSON.stringify(DataToLoad);
    localStorage.pumpData = JSON.stringify(DataToLoad);
    localStorage.pumpInitial = "FALSE";
}
function clearPumpData() {
    deviceCount = 0;
    var c_pumpData = [];
    var j = 0; //  hardware pin (goes from 0 to 12)
    for (var i = 1; i <= localStorage.pumps; i++) {
        var initialize_valve_conversion = initializeSetup(180, 460, 0.69, 3, 0.88, 0.25);
        var singleStage = {
            id: i,
            HW_shield: Math.floor(i / 12) + 1,
            HW_pin: j,
            Open_State: initialize_valve_conversion.uL_max,
            Closed_State: 0,
            Current_State: "opened",
            deviceIndex: deviceCount,
            uL_Conversion_Table: initialize_valve_conversion.uL_table,
            uL_Precision: initialize_valve_conversion.uL_precision,
            Cluster: []
        };
        c_pumpData.push(singleStage);

        j = j + 1;
        if (j == 13) {
            j = 0;
        }
        deviceCount++;
    }
    return JSON.stringify(c_pumpData);
}
// Combine these 2 if they cannot be run non-consecutively

// FUNCTIONALITY FOR DISPENSER DATA TRACKING AND COMMANDS
function clearDispenserData() {
    var dispenserData = [];
    var j = PinIndex; //  hardware pin (goes from 0 to 12)
    var shield = ShieldIndex;
    for (var i = 1; i <= localStorage.Dispensers; i++) {
        var singleStage = {
            id: i,
            HW_shield: Math.floor(shield / 12) + 1,
            HW_pin: j,
            Precision: 0,
            Min: 0,
            Max: 0,
            Current_State: 0,
            orientation: "pull",
            deviceIndex: deviceCount
        };
        dispenserData.push(singleStage);
        j = j + 1;
        if (j == 13) {
            j = 0;
        }
        deviceCount++;
    }
    return JSON.stringify(dispenserData);
}

// Create JSON for dispensers
function setNumberOfDispensers_JSON() {
    localStorage.Dispensers = JSON.parse(localStorage.portXcoordsDisp).length;
    var set_dispData_newNum = [];
    var j = PinIndex; //  hardware pin (goes from 1 to 12)
    var shield = ShieldIndex;
    for (var i = 1; i <= localStorage.Dispensers; i++) {
        var tempDispense = {
            id: i,
            HW_shield: Math.floor(shield / 12) + 1,
            HW_pin: j,
            Precision: 0,
            Min: 0,
            Max: 0,
            Current_State: 0,
            orientation: "pull",
            deviceIndex: deviceCount
        };
        set_dispData_newNum.push(tempDispense);
        j = j + 1;
        if (j == 13) {
            j = 0;
        }
        ShieldIndex = i;
        PinIndex = j;
        deviceCount++;
    }
    localStorage.dispenserData = JSON.stringify(set_dispData_newNum);
    localStorage.dispenserInitial = "FALSE";
}

function clearSettingsTable() {
    ShieldIndex = 0;
    PinIndex = 0;
    deviceCount = 0;
    setNumberOfPumps_JSON();
    setNumberOfDispensers_JSON();
}

// THIS ENSURES SERIAL COMM LIST IS PRE-POPULATED!!!
$(document).ready(function() {
    window.addEventListener("keydown", dispenseSelected); // dispenser arrow key event listener
    loadButtons();
    localStorage.activeDispenser = "none";
    $.ajax({ url: "/serialcommunication/list", type: "POST", async: true, data: {}, success: function(response) {}, error: function(response) {} });
});
