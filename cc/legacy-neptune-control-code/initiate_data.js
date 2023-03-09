if (localStorage.firstVisit == true || localStorage.firstVisit == undefined) {
    //      DECLARING PUMP VALVE STATE

    localStorage.pumpData = [];
    localStorage.MasterData = [];
    localStorage.unsavedData = [];
    localStorage.oldPumpData = [];
    localStorage.pumps = 0;
    localStorage.settings_X_pos = 200;
    localStorage.settings_Y_pos = 200;

    // Valve Control
    localStorage.pumpData = clearPumpData();
    localStorage.valveData = initiateValveData();
    localStorage.firstVisit = false;
    localStorage.pumpInitial = "TRUE"; //  keeps track if this is the first time pump data is being displayed (so that its not cleared on page reload)
    localStorage.valveClusters = "{}";

    // Dispenser Control
    localStorage.Dispensers = 0;
    localStorage.dispenserData = clearDispenserData();
    localStorage.dispenserToControl;
    localStorage.dispenserInitial == "TRUE"; //  keeps track if this is the first time dispenser data is being displayed (so that its not cleared on page reload)
}
localStorage.DEBUGGER_FLAG == false;
localStorage.clear_toggle = false;
localStorage.set_pump_page_is_open = false;
localStorage.settings_toggle = "settings_is_closed";
localStorage.close_pressed_last = false;
localStorage.hide = 0;
localStorage.settings_button_has_been_pressed_before = false;

localStorage.SERIAL_CONSOLE_SESSION = [];

// Variables for Valve Control (ports in Control layer)
if (localStorage.getItem("portXcoords") === null) {
    localStorage.setItem("portXcoords", "default");
}

if (localStorage.getItem("portYcoords") === null) {
    localStorage.setItem("portYcoords", "default");
}

if (localStorage.getItem("portRadius1vals") === null) {
    localStorage.setItem("portRadius1vals", "default");
}

if (localStorage.getItem("portRadius2vals") === null) {
    localStorage.setItem("portRadius2vals", "default");
}

if (localStorage.getItem("portToControl") == null) {
    localStorage.setItem("portToControl", "null");
}

// Variables for Dispenser Control (ports in flow layer)
if (localStorage.getItem("portXcoordsDisp") === null) {
    localStorage.setItem("portXcoordsDisp", "default");
}

if (localStorage.getItem("portYcoordsDisp") === null) {
    localStorage.setItem("portYcoordsDisp", "default");
}

if (localStorage.getItem("DispenserToControl") == null) {
    localStorage.setItem("DispenserToControl", "null");
}
if (localStorage.getItem("activeDispenser") == null) {
    localStorage.setItem("activeDispenser", "none");
}
if (localStorage.getItem("dispenserConversions") == null) {
    localStorage.setItem("dispenserConversions", "{}");
}

console.log("checking JSONloaded now in initiate_data.js");
if (localStorage.getItem("JSONloaded") == undefined) {
    localStorage.setItem("JSONloaded", "false");
    console.log("Successfully set JSONloaded to false in initiate_data.js");
}

if (localStorage.getItem("JSONtoLoad") == null) {
    localStorage.setItem("JSONtoLoad", "{}");
}
