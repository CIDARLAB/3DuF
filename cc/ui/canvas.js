/**
 * This one will host code that handles the clicks and then basically transmit the valve switching code from here
 **/

import Setup from "../control/setup";

export default class Canvas {
    constructor(setup) {
        /*
        Step 1: Retrieve the microfluidic object
        Step 2: Send the valves and callback function to 3DuF
        Step 3:
         */
        let json = setup.Chip.JSON;
        this.__setup = setup;
        this.__valves = setup.Chip.getValves();
        //TODO: Call "new" 3DuF API to load the json on it.
        console.log("Assuming 3DuF creates the function");
        console.log("load the microfuidic json");
        console.log("pass valves and callback");
    }

    callbackfunction(valveid) {
        //This is the callback function which eventually actuates all the pumps
        this.__setup.toggleValve(valveid);
    }
}
